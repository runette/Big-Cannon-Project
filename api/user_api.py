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

from data import User
import logging

from google.cloud import ndb

client = ndb.Client()


class UserApi:
    @staticmethod
    def fetch_user(user, token_info):
        try:
            with client.context():
                user_data = User.get_id(user)
                if user_data is None:
                    user_data = User(
                        user_id=user,
                        fire_user=token_info['fire_user'],
                    )
                    user_data.put()
                if not hasattr(user_data.fire_user, 'name'):
                    user_data.fire_user = token_info.get('fire_user')
                    user_data.put()
                if user_data.fire_user.get('name') != token_info.get('fire_user').get('name'):
                    user_data.fire_user = token_info.get('fire_user')
                    user_data.put()
                response = {
                    'uid': user_data.user_id,
                    'name': user_data.fire_user.get("name"),
                    'standing': User.Standing(user_data.standing).name,
                    'test': user_data.test_user,
                    'train': user_data.train_user
                }
                success = True
        except Exception as e:
            success = False
            response = {'error': str(e)}
            logging.error(str(e))
        return response, (200 if success else 500)
