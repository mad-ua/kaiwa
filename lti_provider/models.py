"""
Database models for the LTI provider feature.
"""
import logging

from django.db import models
from django.contrib.auth import get_user_model

from .utils import token
from .fields import CharNullField


log = logging.getLogger(__name__)
User = get_user_model()

class LtiConsumer(models.Model):
    """
    Database model representing an LTI consumer. This model stores the consumer
    specific settings, such as the OAuth key/secret pair and any LTI fields
    that must be persisted.
    """
    consumer_name = models.CharField(max_length=255, unique=True)
    consumer_key = models.CharField(max_length=32, unique=True, db_index=True, default=token)
    consumer_secret = models.CharField(max_length=32, unique=True, default=token)
    instance_guid = CharNullField(max_length=255, blank=True, null=True, unique=True)

    @staticmethod
    def get_or_supplement(instance_guid, consumer_key):
        """
        The instance_guid is the best way to uniquely identify an LTI consumer.

        However according to the LTI spec, the instance_guid field is optional
        and so cannot be relied upon to be present.
        This method first attempts to find an LtiConsumer by instance_guid.
        Failing that, it tries to find a record with a matching consumer_key.
        This can be the case if the LtiConsumer record was created as the result
        of an LTI launch with no instance_guid.
        If the instance_guid is now present, the LtiConsumer model will be
        supplemented with the instance_guid, to more concretely identify the
        consumer.
        In practice, nearly all major LTI consumers provide an instance_guid, so
        the fallback mechanism of matching by consumer key should be rarely
        required.
        """
        consumer = None
        if instance_guid:
            try:
                consumer = LtiConsumer.objects.get(instance_guid=instance_guid)
            except LtiConsumer.DoesNotExist:
                # The consumer may not exist, or its record may not have a guid
                pass

        # Search by consumer key instead of instance_guid. If there is no
        # consumer with a matching key, the LTI launch does not have permission
        # to access the content.
        if not consumer:
            consumer = LtiConsumer.objects.get(
                consumer_key=consumer_key,
            )

        # Add the instance_guid field to the model if it's not there already.
        print(instance_guid, consumer.instance_guid)
        if instance_guid and not consumer.instance_guid:
            consumer.instance_guid = instance_guid
            consumer.save()
        return consumer


class LtiUser(models.Model):
    """
    Model mapping the identity of an LTI user to an account on the Kaiwa platform.

    The LTI user_id field is guaranteed to be unique per LTI consumer (per
    to the LTI spec), so we guarantee a unique mapping from LTI to edX account
    by using the lti_consumer/lti_user_id tuple.
    """
    lti_consumer = models.ForeignKey(LtiConsumer)
    lti_user_id = models.CharField(max_length=255)
    kaiwa_user = models.OneToOneField(User)

    class Meta(object):
        unique_together = ('lti_consumer', 'lti_user_id')