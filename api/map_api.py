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
import math
from data import User, Gun
from flask import Response
from data import MapData
from google.cloud import ndb
from helpers import to_int

PAGE_SIZE = 300
INITIAL_PAGE_SIZE = 20

client = ndb.Client()

class MapApi:
    @staticmethod
    def fetch_map(user, body):
        with client.context():
            try:
                user_data = User.get_id(user)
                if user_data:
                    namespace = user_data.namespace()
                else:
                    namespace = None
                entries = MapData().get(namespace)
                page = body.get("page", 0)
                page_num = math.ceil(len(entries)/PAGE_SIZE)
                response = Response()
                if page < page_num:
                    x = slice(to_int(page * PAGE_SIZE), to_int((page + 1) * PAGE_SIZE))
                    map = {
                        "entries": entries[x],
                        "transaction": body.get("transaction")
                    }
                    success = 200
                    response.content_type = 'application/json'
                    response.set_data(json.dumps(map))
                else:
                    success = 204
            except Exception as e:
                print(str(e))
                success = 500
            return response, success
        
    def update_map(user, body):
        with client.context():
            namespace = body.get("namespace")
            success = False
            try:
                target = MapData()._prod_mapdata
                if namespace=="test":
                    target = MapData()._dev_mapdata
                elif namespace=="train":
                    target = MapData()._train_mapdata
                cursor=None
                f = True
                size = INITIAL_PAGE_SIZE
                while f:
                    (data, cursor, f) = Gun.map_data(namespace, size, cursor)
                    target.extend(data)
                    size = PAGE_SIZE
                success = True
            except Exception as e:
                print(str(e))
        return (200 if success else 500)
        
