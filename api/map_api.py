import json
from data import Gun, User

class MapApi:
    @staticmethod
    def fetch_map(user):
        user_data = User.get_by_id(user)
        entries = Gun.map_data_2(user_data.namespace)
        map = {
            "entries": entries
        }
        success = True
        return map, (200 if success else 500)
