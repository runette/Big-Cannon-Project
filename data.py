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
from enum import Enum
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
            item.__class__ = self._class_object
            item.schema()
            response.append(item)
        return response
    
class ndb(Enum):
    IntegerProperty = 0
    FloatProperty = 1
    StringProperty = 2
    TextProperty = 3
    BooleanProperty = 4
    DateTimeProperty = 5
    GeoPtProperty = 6
    KeyProperty = 7
    JsonProperty = 8
    EnumProperty = 9

class Model(datastore.Entity):
    
    _properties = {}
    
    def schema(self):
        return
    
    def __init__(self):
        super().__init__()
        self.schema()
        return
    
    def __getattr__(self, name):
        if name in self._properties:
            return getattr(self, self._properties[name]['type'].name)(name)
        
        elif name in self:
            return self[name]
        
        else:
            raise AttributeError("No such attribute: " + str(name))
    
    def __setattr__(self, name, value):
            self[name] = value 
    
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
    
    def Property(self, name, prop_type, **kwargs):
        details =  {
            'type': prop_type,
            'kwargs': kwargs
        }
        self._properties.update({name:details})
        return
        
    
    def IntegerProperty(self, name):
        return self[name]
    
 
    def StringProperty(self, name):
        return self[name]
    
    
    def GeoPtProperty(self, name):
        return self[name]
    
   
    def EnumProperty(self, name):
        enum = self._properties[name]['kwargs']['enum']
        if not enum:
            raise TypeError("EnumProperty must have enum")
        return enum(self[name])
    
 
    def DateProperty(self, name):
        return self[name]
    
    def BooleanProperty(self, name):
        return self[name]
    
    def TextProperty(self, name):
        return self[name]

    def JsonProperty(self, name):
        return self[name]

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
    class Types(Enum):
        CAST = 0
        WROUGHT = 1
        BRONZE = 2
        NOT_KNOWN = 3
    class Quality(Enum):
        GOLD = 2
        SILVER = 1
        BRONZE = 0
    
    def schema(self):     
        self.Property("id", ndb.IntegerProperty)
        self.Property("location", ndb.GeoPtProperty)
        self.Property("type", ndb.EnumProperty, enum=Gun.Types)
        self.Property("quality", ndb.EnumProperty, enum=Gun.Quality, default=Gun.Quality.BRONZE)
        self.Property("description", ndb.StringProperty)
        self.Property("name", ndb.StringProperty)
        self.Property("date", ndb.DateTimeProperty, auto_now = True)
        self.Property("site", ndb.StringProperty)
        self.Property("context", ndb.StringProperty)
        self.Property("collection", ndb.BooleanProperty)
        self.Property("coll_name", ndb.StringProperty)
        self.Property("coll_ref", ndb.StringProperty)
        self.Property("images", ndb.TextProperty, repeated=True)
        self.Property("markings", ndb.BooleanProperty)
        self.Property("mark_details", ndb.StringProperty)
        self.Property("interpretation", ndb.BooleanProperty)
        self.Property("inter_details", ndb.StringProperty)
        self.Property("country", ndb.StringProperty, default="none")
        self.Property("geocode", ndb.JsonProperty)
    
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
                    "latitude" : gun.location.latitude,
                    "longitude" : gun.location.longitude,
                    "anchor_type" : GUN_TYPES[gun.type.value],
                    "location"  : gun.context,
                    "names" : gun.name,
                    'filename' : thumbnail,
                    'quality' : RECORD_QUALITIES[gun.quality.value],
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
