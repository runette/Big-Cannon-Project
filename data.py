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

import json, types, sys
from enum import Enum
from datetime import datetime
import logging
import googlemaps
from google.cloud import datastore
from google.cloud.datastore.helpers import GeoPoint




GUN_TYPES = ("Cast Iron", "Wrought Iron", "Bronze", "Not Known")

RECORD_QUALITIES = ('bronze', "silver", "gold")

class GeoPt(datastore.helpers.GeoPoint):
    def __init__(self, lat, long):
        if isinstance(lat, float) and isinstance(long, float):
            return super().__init__(lat, long)
        else:
            try:
                if lat == "" or 0:
                    lat = 0.0
                else:
                    lat = float(lat)
                if long == "" or 0:
                    long = 0.0
                else:
                    long = float(long)
                if isinstance(lat, float) and isinstance(long, float):
                    return super().__init__(lat, long)  
                else:
                    raise TypeError("GeoPt - input paramaters cannot be converted to float")
            except Exception as e:
                raise TypeError("GeoPt - input paramaters cannot be converted to float :  " + str(e))
            

class Client(datastore.Client):
    def query(self, **kwargs):
        if "client" in kwargs:
            raise TypeError("Cannot pass client")
        if "project" in kwargs:
            raise TypeError("Cannot pass project")
        kwargs["project"] = self.project
        if "namespace" not in kwargs:
            kwargs["namespace"] = self.namespace
        return Query(self, **kwargs)

class Key(datastore.Key):
    def get(self, key, **kwargs):
        if not self.client:
            self.client=datastore.Client()
        object = self.client.get(key, **kwargs)
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
    
    def get(self, *args, **kwargs):
        #TODO make this more eficient by not calling the entire iterator
        list = self.fetch(*args, **kwargs)
        if len(list) > 0:
            return list[0]
        else:
            return None
        
class ndb(Enum):
    IntegerProperty = (0, True, int)
    FloatProperty = (1, False, float)
    StringProperty = (2, True, str)
    TextProperty = (3, False, str)
    BooleanProperty = (4, True, bool)
    DateTimeProperty = (5, True, datetime)
    GeoPtProperty = (6, True, GeoPt)
    KeyProperty = (7, True, Key)
    JsonProperty = (8, False, str)
    EnumProperty = (9, True, int)

class Model(datastore.Entity):
    _properties = {}
    
    def schema(self):
        self['exclude_from_indexes']=[]
        return
    
    def __init__(self, **kwargs):
        client = Client()
        super().__init__(key=client.key(type(self).__name__))
        self.schema()
        for name, value in self._properties.items():
            kw = value.get('kwargs')
            prop_type = value.get('type')
            indexed = kw.get('indexed', False)
            default = kw.get('default', False)
            auto_now = kw.get('auto_now', False) or kw.get('auto_now_add', False)
            repeated = kw.get('repeated', False)
            if repeated:
                self[name] = []
            if not (prop_type.value[1] or indexed):
                if name not in self['exclude_from_indexes']:
                    self['exclude_from_indexes'].append(name)
            if default:
                setattr(self, name, default)
            if auto_now and prop_type == ndb.DateTimeProperty:
                setattr(self, name, datetime.now())        
        if kwargs:
            self.populate(**kwargs)
        return
    
    def __getattr__(self, name):
        if name in self._properties:
            try:
                return getattr(self, self._properties[name]['type'].name)(name)
            except:
                return None
        else:
            try:
                return self[name]
            except:
                return None
    
    def __setattr__(self, name, value):
        if name in self._properties:
            return getattr(self, "set_" + self._properties[name]['type'].name)(name, value)
        else:
            try:
                self[name] = value
            except:
                raise AttributeError("No such attribute: " + str(name))
    
    @classmethod
    def query(cls, *args, **kwargs):
        my_class = cls.__name__
        client = Client()
        kwargs.update(kind=my_class)
        response = client.query(*args, **kwargs)
        response.__class__ = Query
        response._class_object = cls
        return response
    
    def put(self):
        client = Client()
        client.put(self)
        return
    
    def populate(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        return
    
    def Property(self, name, prop_type, **kwargs):
        details =  {
            'type': prop_type,
            'kwargs': kwargs
        }
        self._properties.update({name:details})
        return
    
    def setter(self, name, value):
        typeof = self._properties[name]['type'].value[2]
        repeated = to_bool(self._properties[name]['kwargs'].get('repeated', False))
        if isinstance(value, typeof):
            if repeated:
                if self[name] and (type(self[name]) == "list"):
                    self[name].append(value)
                else:
                    self[name] = [value]
            else:
                self[name] = value
        else:
            raise TypeError(name + " takes " + str(typeof) + " but received " + str(type(value)))
    
    def IntegerProperty(self, name):
        return self[name]
    
    def set_IntegerProperty(self, name, value):
        return self.setter(name, value)
    
    def StringProperty(self, name):
        return self[name]
    
    def set_StringProperty(self, name, value):
        return self.setter(name, value)
    
    
    def GeoPtProperty(self, name):
        return self[name]
    
    def set_GeoPtProperty(self, name, value):
        return self.setter(name, value)
    
   
    def EnumProperty(self, name):
        enum = self._properties[name]['kwargs']['enum']
        if not enum:
            raise TypeError("EnumProperty must have enum")
        return enum(self[name])
    
    def set_EnumProperty(self, name, value):
        if isinstance(value, Enum):
            return self.setter(name, value.value)
        else:
            raise TypeError("EnumProperty must have enum - received - " + str(type(value)))
    
    def DateTimeProperty(self, name):
        return self[name]
    
    def set_DateTimeProperty(self, name, value):
        return self.setter(name, value) 
    
    def BooleanProperty(self, name):
        return self[name]
    
    def set_BooleanProperty(self, name, value):
        return self.setter(name, value)  
    
    def TextProperty(self, name):
        return self[name]
    
    def set_TextProperty(self, name, value):
        return self.setter(name, value)    

    def JsonProperty(self, name):
        return self[name]
    
    def set_JsonProperty(self, name, value):
        return self.setter(name, value)

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
        super().schema()
        self.Property("gunid", ndb.IntegerProperty)
        self.Property("location", ndb.GeoPtProperty)
        self.Property("type", ndb.EnumProperty, enum=Gun.Types)
        self.Property("quality", ndb.EnumProperty, enum=Gun.Quality,  default=Gun.Quality.BRONZE)
        self.Property("description", ndb.StringProperty)
        self.Property("name", ndb.StringProperty)
        self.Property("date", ndb.DateTimeProperty, auto_now=True)
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
        result = cls.query(order=['gunid']).fetch()
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
                    "anchor_id" : gun.gunid,
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
        all = cls.query(order=["-gunid"]).fetch()
        if all :
            return all[0].gunid + 1
        else:
            return 1

    @classmethod
    def get_id(cls, id):
        return cls.query(filters=[("gunid","=", str(id))]).get()

def to_bool(bool_str):
    """Parse the string and return the boolean value encoded or raise an exception"""
    if isinstance(bool_str, str) and bool_str:
        if bool_str.lower() in ['true', 't', '1', 'on']: return True
        elif bool_str.lower() in ['false', 'f', '0', 'off']: return False
        else: raise TypeError
    elif isinstance(bool_str, bool):
        return bool_str
    elif bool_str is None:
        return False
    else:
        raise TypeError("to_bool requires a str or bool, received :" + str(type(bool_str)))

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
    reverse_geocode_result = gmaps.reverse_geocode((location.latitude, location.longitude))
    return reverse_geocode_result
