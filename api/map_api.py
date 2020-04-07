import json
from data import Gun, User

class MapApi:
    @staticmethod
    def fetch_map(user):
        user_data = User.get_by_id(user)
        if user_data.test_user:
            namespace = 'test'
        else:
            namespace = None
        entries = Gun.map_data_2(namespace)
        map = {
            "entries": entries
        }
        success = True
        return map, (200 if success else 500)
