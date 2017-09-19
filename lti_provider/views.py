import logging

from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseBadRequest, HttpResponseForbidden, Http404

from conversation.views import chat_view
from cms.views import editor
from .signature_validator import SignatureValidator
from .users import authenticate_lti_user
from .utils import add_p3p_header, verify_task_id
from .models import LtiConsumer
from .outcomes import store_outcome_parameters


logger = logging.getLogger(__name__)


# LTI launch parameters that must be present for a successful launch
REQUIRED_PARAMETERS = [
    'roles', 'context_id', 'oauth_version', 'oauth_consumer_key',
    'oauth_signature', 'oauth_signature_method', 'oauth_timestamp',
    'oauth_nonce', 'user_id'
]

OPTIONAL_PARAMETERS = [
    'lis_result_sourcedid', 'lis_outcome_service_url',
    'tool_consumer_instance_guid'
]


@csrf_exempt
@add_p3p_header
def lti_launch(request, task_id):
    """
    Endpoint for all requests to Conversational Task via the LTI protocol.

    This endpoint will be called by a POST message that contains the parameters
    for an LTI launch (we support version 1.2 of the LTI specification):
        http://www.imsglobal.org/lti/ltiv1p2/ltiIMGv1p2.html
    An LTI launch is successful if:
        - The launch contains all the required parameters
        - The launch data is correctly signed using a known client key/secret
          pair
    """
    # Check the LTI parameters for all required params, otherwise return 400
    params = get_required_parameters(request.POST)
    if not params:
        return HttpResponseBadRequest()
    params.update(get_optional_parameters(request.POST))

    # Get the consumer information from either the instance GUID or the consumer
    # key
    try:
        lti_consumer = LtiConsumer.get_or_supplement(
            params.get('tool_consumer_instance_guid', None),
            params['oauth_consumer_key']
        )
    except LtiConsumer.DoesNotExist:
        return HttpResponseForbidden()

    # Check the OAuth signature on the message
    if not SignatureValidator(lti_consumer).verify(request):
        return HttpResponseForbidden()

    # Add the course and usage keys to the parameters array
    try:
        verify_task_id(task_id)
    except Exception:
        logger.error(
            'Invalid task id %s from request %s',
            task_id,
            request
        )
        raise Http404()
    params['task_id'] = task_id

    authenticate_lti_user(request, params['user_id'], lti_consumer)
    store_outcome_parameters(params, request.user, lti_consumer)

    return render_courseware(request, params['task_id'], params['roles'])


def get_required_parameters(dictionary, additional_params=None):
    """
    Extract all required LTI parameters from a dictionary and verify that none
    are missing.
    :param dictionary: The dictionary that should contain all required parameters
    :param additional_params: Any expected parameters, beyond those required for
        the LTI launch.
    :return: A new dictionary containing all the required parameters from the
        original dictionary and additional parameters, or None if any expected
        parameters are missing.
    """
    params = {}
    additional_params = additional_params or []
    for key in REQUIRED_PARAMETERS + additional_params:
        if key not in dictionary:
            return None
        params[key] = dictionary[key]
    return params


def get_optional_parameters(dictionary):
    """
    Extract all optional LTI parameters from a dictionary. This method does not
    fail if any parameters are missing.
    :param dictionary: A dictionary containing zero or more optional parameters.
    :return: A new dictionary containing all optional parameters from the
        original dictionary, or an empty dictionary if no optional parameters
        were present.
    """
    return {
        key: dictionary[key] for key in OPTIONAL_PARAMETERS
        if key in dictionary
    }

def render_courseware(request, task_id, roles):
    """
    Render the content requested for the LTI launch.
    TODO: This method depends on the current refactoring work on the
    courseware/courseware.html template. It's signature may change depending on
    the requirements for that template once the refactoring is complete.
    Return an HttpResponse object that contains the template and necessary
    context to render the courseware.
    """
    if 'Instructor' in roles or 'Administrator' in roles:
        return editor(request, task_id=task_id)
    else:
        return chat_view(request, task_id=task_id)
