import json
import math
from data import User
from flask import Response
from data import MapData
from google.cloud import ndb
from data import to_int

client = ndb.Client()

PAGE_SIZE = 300

class MapApi:
    @staticmethod
    def fetch_map(user, body):
        with client.context():
            user_data = User.get_id(user)
            if user_data:
                namespace = user_data.namespace()
            else:
                namespace = None
            entries = MapData().get(namespace)
            page = body.get("page", 0)
            page_num = math.ceil(len(entries)/PAGE_SIZE)
            if page < page_num:
                x = slice(to_int(page * PAGE_SIZE), to_int((page + 1) * PAGE_SIZE))
                map = {
                    "entries": entries[x],
                    "length": page_num,
                    "transaction": body.get("transaction")  
                }
                success = True
                response = Response()
                response.content_type = 'application/json'
                response.set_data(json.dumps(map))
            else:
                success = False
            return response, (200 if success else 500)
