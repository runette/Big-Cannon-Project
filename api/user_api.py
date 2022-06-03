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
