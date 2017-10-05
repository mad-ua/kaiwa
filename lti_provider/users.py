"""
LTI user management functionality. This module reconciles the two identities
that an individual has in the campus LMS platform and on Kaiwa.
"""

import string
import random
import uuid

from django.conf import settings
from django.contrib.auth import authenticate, login
from django.core.exceptions import PermissionDenied
from django.db import IntegrityError, transaction
from django.contrib.auth import get_user_model
from .models import LtiUser


User = get_user_model()


def authenticate_lti_user(request, lti_user_id, lti_consumer):
    """
    Determine whether the user specified by the LTI launch has an existing
    account. If not, create a new Django User model and associate it with an
    LtiUser object.
    If the currently logged-in user does not match the user specified by the LTI
    launch, log out the old user and log in the LTI identity.
    """
    try:
        lti_user = LtiUser.objects.get(
            lti_user_id=lti_user_id,
            lti_consumer=lti_consumer
        )
    except LtiUser.DoesNotExist:
        # This is the first time that the user has been here. Create an account.
        lti_user = create_lti_user(lti_user_id, lti_consumer)

    if not (request.user.is_authenticated() and
            request.user == lti_user.kaiwa_user):
        # The user is not authenticated, or is logged in as somebody else.
        # Switch them to the LTI user
        switch_user(request, lti_user, lti_consumer)


def create_lti_user(lti_user_id, lti_consumer):
    """
    Generate a new user on the Kaiwa with a random username and password,
    and associates that account with the LTI identity.
    """
    kaiwa_pass = str(uuid.uuid4())

    created = False
    while not created:
        try:
            kaiwa_user_id = generate_random_kaiwa_username()
            with transaction.atomic():
                kaiwa_user = User.objects.create_user(
                    username=kaiwa_user_id,
                    password=kaiwa_pass,
                    organization=lti_consumer.organization
                )
                # A profile is required if PREVENT_CONCURRENT_LOGINS flag is set.
                # TODO: We could populate user information from the LTI launch here,
                # but it's not necessary for our current uses.
            created = True
        except IntegrityError:
            # The random edx_user_id wasn't unique. Since 'created' is still
            # False, we will retry with a different random ID.
            pass

    lti_user = LtiUser(
        lti_consumer=lti_consumer,
        lti_user_id=lti_user_id,
        kaiwa_user=kaiwa_user
    )
    lti_user.save()
    return lti_user


def switch_user(request, lti_user, lti_consumer):
    """
    Log out the current user, and log in using the Kaiwa identity associated with
    the LTI ID.
    """
    lti_user.kaiwa_user.backend = 'django.contrib.auth.backends.ModelBackend'
    login(request, lti_user.kaiwa_user)


def generate_random_kaiwa_username():
    """
    Create a valid random Kaiwa user ID.

    An ID is at most 30 characters long, and
    can contain upper and lowercase letters and numbers.
    """
    allowable_chars = string.ascii_letters + string.digits
    username = ''
    for _index in range(30):
        username = username + random.SystemRandom().choice(allowable_chars)
    return username
