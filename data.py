#!/usr/bin/env python
#
# Copyright 2018 Paul Harwood
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import datetime, json, types, sys
from protorpc import messages
from datetime import datetime
import logging
import googlemaps
from google.cloud import datastore
from google.cloud.datastore.helpers import GeoPoint as GeoPt




GUN_TYPES = ("Cast Iron", "Wrought Iron", "Bronze", "Not Known")

RECORD_QUALITIES = ('bronze', "silver", "gold")

class Key(datastore.Key):
    def get(self, *args, **kwargs):
        return

class Query(datastore.Query):
    _class_object = object
    
    def fetch(self, *args, **kwargs):
        item_list = super().fetch(*args, **kwargs)
        response = []
        for item in item_list:
            modules = sys.modules
            this_name = __name__
            this_module = modules[__name__]
            mykind = item.kind
            my_class = getattr(modules[this_name],mykind)
            item.__class__ = self._class_object
            response.append(item)
        return response
    
class Model(datastore.Entity):
    _properties = {}
    
    def __init__(self):
        super().__init__()
        for i in self :
            pass
        return
    
    def __getattr__(self, name):
        if name in self:
            return self[name]
        else:
            raise AttributeError("No such attribute: " + name)
    
        def __setattr__(self, name, value):
            self[name] = value
    
        def __delattr__(self, name):
            if name in self:
                del self[name]
            else:
                raise AttributeError("No such attribute: " + name)    
    
    @classmethod
    def query(cls, *args, **kwargs):
        my_class = cls.__name__
        client = datastore.Client()
        kwargs.update(kind=my_class)
        response = client.query(*args, **kwargs)
        response.__class__ = Query
        response._class_object = cls
        return response
    
    def get(self, key, **kwargs):
        if not self.client:
            self.client=datastore.Client()
        
        object = self.client.get(key, **kwargs)
        self.update(object.items())
        return
    
    def IntegerProperty(cls, name, **kwargs):
        self._properties.update({name:"IntegrerProperty"})
        return
    
    @classmethod
    def StringProperty(cls, **kwargs):
        return
    
    @classmethod
    def GeoPtProperty(cls, **kwargs):
        return
    
    @classmethod
    def EnumProperty(cls, type, **kwargs):
        return
    
    @classmethod
    def DateProperty(cls, **kwargs):
        return
    
    @classmethod
    def BooleanProperty(cls, **kwargs):
        return
    
    @classmethod
    def TextProperty(cls, **kwargs):
        return
    @classmethod
    def JsonProperty(cls, **kwargs):
        return

class BNG():
    eastings = 0.0
    northings = 0.0

    def convert_to_LL(self):
        url = 'http://www.bgs.ac.uk/data/webservices/CoordConvert_LL_BNG.cfc?method=BNGtoLatLng&easting=' + str(self.eastings) + "&northing=" + str(self.northings)
        return self.BGS_api(url)

    @staticmethod
    def convert_from_LL( lat, lon):
        url = "http://www.bgs.ac.uk/data/webservices/CoordConvert_LL_BNG.cfc?method=LatLongToBNG&lat=" + lat + "&lon=" + lon
        return BNG.BGS_api(url)

    @staticmethod
    def BGS_api(url):
        try:
            result = urlfetch.fetch(
                url= url,
                method='GET',
                headers={"content-type": "application/json"},
                deadline=2000)
            if result.status_code == 200:
                try:
                    payload = result.content
                    response = json.loads(payload)
                    return response
                except:
                    raise Exception('ParseError' + payload)
            else:
                raise Exception('ApiError' + str(result.status_code))
        except Exception as e:
            logging.error(str(e))
            return


class Gun(Model):
    class Types(messages.Enum):
        CAST = 0
        WROUGHT = 1
        BRONZE = 2
        NOT_KNOWN = 3
    class Quality(messages.Enum):
        GOLD = 2
        SILVER = 1
        BRONZE = 0
        
    id = "IntegerProperty(id)"
    location = GeoPt(0, 0)
    type = Model.EnumProperty(Types)
    quality = Model.EnumProperty(Quality, default=Quality.BRONZE)
    description = str()
    name = str()
    date = Model.DateProperty(auto_now = True)
    site = Model.StringProperty()
    context = Model.StringProperty()
    collection = Model.BooleanProperty()
    coll_name = Model.StringProperty()
    coll_ref = Model.StringProperty()
    images = Model.TextProperty(repeated=True)
    markings = Model.BooleanProperty()
    mark_details = Model.StringProperty()
    interpretation = Model.BooleanProperty()
    inter_details = Model.StringProperty()
    country = Model.StringProperty(default="none")
    geocode = Model.JsonProperty()
    
    @classmethod
    def map_data(cls):
        result = cls.query()
        #result.order("gun.id")
        result = result.fetch()
        map_data = []
        for gun in result :
            if gun.quality is None:
                gun.quality = Gun.Quality.BRONZE
            if gun.images[0] == "":
                thumbnail = "/img/32x32.png"
            else:
                thumbnail = gun.images[0] + "=s32"
            try:
                map_data.append({
                    "anchor_id" : gun.id,
                    "description" : gun.description,
                    "latitude" : gun.location.lat,
                    "longitude" : gun.location.lon,
                    "anchor_type" : GUN_TYPES[gun.type.number],
                    "location"  : gun.context,
                    "names" : gun.name,
                    'filename' : thumbnail,
                    'quality' : RECORD_QUALITIES[gun.quality.number],
                    'nationality': gun.country,
                    'site' : gun.site,
                })
            except Exception as e:
                logging.error(str(e))
        return map_data

    @classmethod
    def get_next(cls):
        all = cls.query().order(-Gun.id).fetch()
        if all :
            return all[0].id + 1
        else:
            return 1

    @classmethod
    def get_id(cls, id):
        return cls.query(Gun.id == id).get()

def to_bool(bool_str):
    """Parse the string and return the boolean value encoded or raise an exception"""
    if isinstance(bool_str, basestring) and bool_str:
        if bool_str.lower() in ['true', 't', '1', 'on']: return True
        elif bool_str.lower() in ['false', 'f', '0', 'off']: return False
        else: raise TypeError

def to_int(int_string):
    try:
        return int(int_string)
    except Exception :
        return 0

class User:
    def __init__(self):
        self.n = "user"
        self.e = "email"
        
    def name(self):
        return self.n
    
    def email(self):
        return self.e 

def UserStatus():
    # set up the user context and links for the navbar
    user = User()
    #uri = uri.split("?")[0]
    if user:
        url = "test_url"
        url_linktext = 'Logout'
    else:
        url = "users.create_login_url(uri)"
        url_linktext = 'Login'
    return {'user': user, 'url': url, 'url_linktext': url_linktext}


def geolocate(location) :
    gmaps = googlemaps.Client(key='AIzaSyDZcNCn8CzpdFG58rzRxQBORIWPN9LOVYg')
    reverse_geocode_result = gmaps.reverse_geocode((location.lat, location.lon))
    return reverse_geocode_result
