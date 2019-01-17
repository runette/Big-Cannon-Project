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

import datetime, urllib
from google.appengine.ext import ndb
from google.appengine.ext.ndb import msgprop
from protorpc import messages
from google.appengine.api import users
from google.appengine.api import app_identity
from google.appengine.api import urlfetch
from datetime import datetime
import logging




GUN_TYPES = ("Cast Iron", "Wrought Iron", "Bronze", "Not Known")

RECORD_QUALITIES = ("gold", "silver", 'bronze')

class Gun(ndb.Model):
    class Types(messages.Enum):
        CAST = 0
        WROUGHT = 1
        BRONZE = 2
        NOT_KNOWN = 3
    class Quality(messages.Enum):
        GOLD = 0
        SILVER = 1
        BRONZE = 2
    id = ndb.StringProperty()
    location = ndb.GeoPtProperty()
    type = ndb.msgprop.EnumProperty(Types)
    quality = ndb.msgprop.EnumProperty(Quality)
    description = ndb.StringProperty()
    name = ndb.StringProperty()
    date = ndb.DateProperty(auto_now = True)
    site = ndb.StringProperty()
    context = ndb.StringProperty()
    collection = ndb.BooleanProperty()
    coll_name = ndb.StringProperty()
    coll_ref = ndb.StringProperty()
    images = ndb.TextProperty(repeated=True)
    markings = ndb.BooleanProperty()
    mark_details = ndb.StringProperty()
    interpretation = ndb.BooleanProperty()
    inter_details = ndb.StringProperty()



    @classmethod
    def map_data(cls):
        list = cls.query().order(Gun.id).fetch()
        map_data = []
        for gun in list :
            try:
                map_data.append({
                    "anchor_id" : gun.id,
                    "description" : gun.description,
                    "latitude" : gun.location.lat,
                    "longitude" : gun.location.lon,
                    "anchor_type" : GUN_TYPES[gun.type.number],
                    "location"  : gun.description,
                    "names" : gun.name,
                    'filename' : gun.images[0] + "=s32"
                })
            except :
                pass
        return map_data

    @classmethod
    def get_next(cls):
        all = Gun.query().order(-Gun.id).fetch()
        if all :
            return int(all[0].id) + 1
        else:
            return 1

    @classmethod
    def get_id(self, id):
        return Gun.query(Gun.id == id).get()

def to_bool(bool_str):
    """Parse the string and return the boolean value encoded or raise an exception"""
    if isinstance(bool_str, basestring) and bool_str:
        if bool_str.lower() in ['true', 't', '1']: return True
        elif bool_str.lower() in ['false', 'f', '0']: return False

def UserStatus(uri):
    # set up the user context and links for the navbar
    user = users.get_current_user()
    uri = uri.split("?")[0]
    if user:
        url = users.create_logout_url(uri)
        url_linktext = 'Logout'
    else:
        url = users.create_login_url(uri)
        url_linktext = 'Login'
    return {'user': user, 'url': url, 'url_linktext': url_linktext}

class Auth:
    def __init__(self, scope):
        self.scope = scope
        self.service_name = app_identity.get_application_id()
        return

    def get_token(self):
        self.auth_token, _ = app_identity.get_access_token(
            self.scope)
        logging.info(
            'Using token {} to represent identity {}'.format(
                self.auth_token, app_identity.get_service_account_name()))
        return self.auth_token

    def get_signed_url(self, content_name, content_type):
        now = datetime.utcnow()
        delta = datetime.timedelta(hours=3)
        expiry = now + delta
        timestamp = expiry.timestamp()
        signed_string= "PUT \n \n" + content_type + "\n" + str(timestamp) + "\n" + "/" + self.service_name + "/" + content_name

    def get_url(self):
        return "https://www.googleapis.com/upload/storage/v1/b/" + self.service_name + ".appspot.com/o?uploadType=resumable"




