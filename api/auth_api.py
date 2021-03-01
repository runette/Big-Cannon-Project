import json
from firebase_admin import auth
import logging


class AuthApi:
    @staticmethod
    def decode_token(jwt):
        """
        Verifies for FireBase uid linked to supplied JWT token
        Returns uid or '0000'
        """
        if jwt == "null":
            return {"uid": "0000"}
        try:
            fire_user = auth.verify_id_token(jwt)
            return {'uid': fire_user['uid'], 'fire_user': fire_user}
        except ValueError as e:
            return None

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
