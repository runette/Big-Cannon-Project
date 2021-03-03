import json
from data import Gun, User, MapData
from flask import Response


class MapApi:
    @staticmethod
    def fetch_map(user):
        user_data = User.get_by_id(user)
        if user_data:
            namespace = user_data.namespace()
        else:
            namespace = None
        entries = MapData().get(namespace)
        map = {
            "entries": entries
        }
        success = True
        response = Response()
        response.content_type = 'application/json'
        response.set_data(json.dumps(map))
        return response, (200 if success else 500)
