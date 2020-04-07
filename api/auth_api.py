import json
from firebase_admin import auth
from defs import is_devserver
import logging


class AuthApi:
    @staticmethod
    def decode_token(jwt):
        """
        Verifies for FireBase uid linked to supplied JWT token
        Returns uid or None
        """
        if is_devserver():
            response = {"uid": "01010101", 'fire_user': {'name': 'dev user'}}
        else:
            try:
                fire_user = auth.verify_id_token(jwt)
                response = {'uid': fire_user['uid'], 'fire_user': fire_user}
            except ValueError as e:
                response = None
        return response

    @staticmethod
    def get_token(body):
        """
        Get new JWT token for supplied uid
        Returns single-field dict with jwt or error field

        Args/return is JSON array
        """
        uid = body["user_id"]

        try:
            success = True
            auth.get_user(uid=uid)
            jwt = auth.create_custom_token(uid).decode("utf-8")
            response_object = {
                "jwt": jwt
            }
        except ValueError as e:
            logging.error(str(e))
            success = False
            response_object = {
                "error": "Invalid user_id provided"
            }

        return json.dumps(response_object), (200 if success else 500)
