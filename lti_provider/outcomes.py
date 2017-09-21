"""
Helper functions for managing interactions with the LTI outcomes service defined
in LTI v1.1.
"""
import logging
import uuid

import requests
import requests_oauthlib
from lxml import etree
from lxml.builder import ElementMaker
from requests.exceptions import RequestException

from .models import GradedTask, OutcomeService

log = logging.getLogger(__name__)


def store_outcome_parameters(request_params, user, lti_consumer):
    """
    Determine whether a set of LTI launch parameters contains information about
    an expected score, and if so create a GradedTask record. Create a new
    OutcomeService record if none exists for the tool consumer, and update any
    incomplete record with additional data if it is available.
    """
    result_id = request_params.get('lis_result_sourcedid', None)

    # We're only interested in requests that include a lis_result_sourcedid
    # parameter. An LTI consumer that does not send that parameter does not
    # expect scoring updates for that particular request.
    if result_id:
        result_service = request_params.get('lis_outcome_service_url', None)
        if not result_service:
            log.warn(
                "Outcome Service: lis_outcome_service_url parameter missing "
                "from scored assignment; we will be unable to return a score. "
                "Request parameters: %s",
                request_params
            )
            return

        task_id = request_params['task_id']

        # Create a record of the outcome service if necessary
        outcomes, __ = OutcomeService.objects.get_or_create(
            lis_outcome_service_url=result_service,
            lti_consumer=lti_consumer
        )

        graded_task, _ = GradedTask.objects.get_or_create(
            lis_result_sourcedid=result_id,
            task_id=task_id,
            user=user,
            outcome_service=outcomes
        )
    return graded_task


def generate_replace_result_xml(result_sourcedid, score):
    """
    Create the XML document that contains the new score to be sent to the LTI
    consumer. The format of this message is defined in the LTI 1.1 spec.
    """
    # Pylint doesn't recognize members in the LXML module
    elem = ElementMaker(nsmap={None: 'http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0'})
    xml = elem.imsx_POXEnvelopeRequest(
        elem.imsx_POXHeader(
            elem.imsx_POXRequestHeaderInfo(
                elem.imsx_version('V1.0'),
                elem.imsx_messageIdentifier(str(uuid.uuid4()))
            )
        ),
        elem.imsx_POXBody(
            elem.replaceResultRequest(
                elem.resultRecord(
                    elem.sourcedGUID(
                        elem.sourcedId(result_sourcedid)
                    ),
                    elem.result(
                        elem.resultScore(
                            elem.language('en'),
                            elem.textString(str(score))
                        )
                    )
                )
            )
        )
    )
    return etree.tostring(xml, xml_declaration=True, encoding='UTF-8')


def send_score_update(graded_task, score):
    """
    Create and send the XML message to the campus LMS system to update the grade
    for a single graded task.
    """
    xml = generate_replace_result_xml(
        graded_task.lis_result_sourcedid, score
    )
    try:
        response = sign_and_send_replace_result(graded_task, xml)
    except RequestException:
        # failed to send result. 'response' is None, so more detail will be
        # logged at the end of the method.
        response = None
        log.exception("Outcome Service: Error when sending result.")

    # If something went wrong, make sure that we have a complete log record.
    # That way we can manually fix things up on the campus system later if
    # necessary.
    if not (response and check_replace_result_response(response)):
        log.error(
            "Outcome Service: Failed to update score on LTI consumer. "
            "User: %s, course: %s, usage: %s, score: %s, status: %s, body: %s",
            graded_task.user,
            graded_task.task_id,
            score,
            response,
            response.text if response else 'Unknown'
        )


def sign_and_send_replace_result(graded_task, xml):
    """
    Take the XML document generated in generate_replace_result_xml, and sign it
    with the consumer key and secret assigned to the consumer. Send the signed
    message to the LTI consumer.
    """
    outcome_service = graded_task.outcome_service
    consumer = outcome_service.lti_consumer
    consumer_key = consumer.consumer_key
    consumer_secret = consumer.consumer_secret

    # Calculate the OAuth signature for the replace_result message.
    oauth = requests_oauthlib.OAuth1(
        consumer_key,
        consumer_secret,
        signature_method='HMAC-SHA1',
        force_include_body=True
    )

    headers = {'content-type': 'application/xml'}
    response = requests.post(
        graded_task.outcome_service.lis_outcome_service_url,
        data=xml,
        auth=oauth,
        headers=headers
    )

    return response


def check_replace_result_response(response):
    """
    Parse the response sent by the LTI consumer after an score update message
    has been processed. Return True if the message was properly received, or
    False if not. The format of this message is defined in the LTI 1.1 spec.
    """
    # Pylint doesn't recognize members in the LXML module
    if response.status_code != 200:
        log.error(
            "Outcome service response: Unexpected status code %s",
            response.status_code
        )
        return False

    try:
        xml = response.content
        root = etree.fromstring(xml)
    except etree.ParseError as ex:
        log.error("Outcome service response: Failed to parse XML: %s\n %s", ex, xml)
        return False

    major_codes = root.xpath(
        '//ns:imsx_codeMajor',
        namespaces={'ns': 'http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0'})
    if len(major_codes) != 1:
        log.error(
            "Outcome service response: Expected exactly one imsx_codeMajor field in response. Received %s",
            major_codes
        )
        return False

    if major_codes[0].text != 'success':
        log.error(
            "Outcome service response: Unexpected major code: %s.",
            major_codes[0].text
        )
        return False

    return True
