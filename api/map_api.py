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
from data import User, Gun, Site, geocode
from flask import Response
from google.cloud import ndb

client = ndb.Client()

class MapApi:
    @staticmethod
    def fetch_map(user, body):
        with client.context():
            response = Response()
            try:
                user_data = User.get_id(user)
                if user_data:
                    namespace = user_data.namespace()
                    login = True
                else:
                    namespace = None
                    login = False
                if body.get("cursor"):
                    cursor = ndb.Cursor(urlsafe=body.get("cursor").encode("utf-8"))
                else:
                    cursor= ndb.Cursor()
                (data, cursor, f) = Gun.map_data(namespace, cursor, login)
                if data:
                    map = {
                        "entries": data,
                        "cursor": cursor.urlsafe().decode("utf-8"),
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
        
    def fetch_sites(user, body):
        with client.context():
            response = Response()
            try:
                user_data = User.get_id(user)
                if user_data:
                    namespace = user_data.namespace()
                else:
                    namespace = None
                if body.get("cursor"):
                    cursor = ndb.Cursor(urlsafe=body.get("cursor").encode("utf-8"))
                else:
                    cursor= ndb.Cursor()
                (data, cursor) = Site.data(namespace, cursor)
                if data:
                    map = {
                        "sites": data,
                        "cursor": cursor.urlsafe().decode("utf-8"),
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
        
    def add_site(user, body):
        with client.context():
            try:
                user_data = User.get_id(user)
                if user_data:
                    namespace = user_data.namespace()
                else:
                    namespace = None
                place_id = body.get("place_id")
                (place, gc) = geocode(place_id)
                address_comps = gc.get("address_components")
                site = Site(
                    place_id = place_id,
                    geocode = gc,
                    attribution = place.get("html_attributions"),
                    display_name = gc.get("name"),
                    guns = [],
                    namespace= namespace
                    )
                country = [comp.get("long_name") for comp in address_comps if "country" in comp.get("types")]
                if len(country) > 0:
                    site.country = country[0]
                site.put()
                return {"site":site.api_data()}, 200
            except Exception as e:
                return None, 500
            
        
