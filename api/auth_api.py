# MIT License

#Copyright (c) 2019-2022 Runette Software Ltd

#Permission is hereby granted, free of charge, to any person obtaining a copy
#of this software and associated documentation files (the "Software"), to deal
#in the Software without restriction, including without limitation the rights
#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#copies of the Software, and to permit persons to whom the Software is
#furnished to do so, subject to the following conditions:

#The above copyright notice and this permission notice shall be included in all
#copies or substantial portions of the Software.

#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
#SOFTWARE.


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
