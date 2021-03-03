import json
from data import User
import logging


class UserApi:
    @staticmethod
    def fetch_user(user, token_info):
        try:
            user_data = User.get_by_id(user)
            if user_data is None:
                user_data = User(
                    user_id=user,
                    fire_user=json.dumps(token_info['fire_user']),
                )
                user_data.put()
            if not hasattr(user_data.fire_user, 'name'):
                user_data.fire_user = json.dumps(token_info['fire_user'])
                user_data.put()
            if user_data.fire_user['name'] != token_info['fire_user']['name']:
                user_data.fire_user = json.dumps(token_info['fire_user'])
                user_data.put()
            response = {
                'uid': user_data.id,
                'name': user_data.fire_user.name,
                'standing': user_data.standing.name,
                'test': user_data.test_user,
                'train': user_data.train_user,
            }
            success = True
        except Exception as e:
            success = False
            response = {'error': str(e)}
            logging.error(str(e))
        return response, (200 if success else 500)
