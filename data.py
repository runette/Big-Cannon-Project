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

import datetime
from google.appengine.ext import ndb
from google.appengine.ext.ndb import msgprop
from protorpc import messages

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

    @classmethod
    def map_data(cls):
        list = cls.query().order(Gun.id).fetch()
        map_data = []
        for gun in list :
            map_data.append({
                "anchor_id" : gun.id,
                "description" : gun.description,
                "latitude" : gun.location.lat,
                "longitude" : gun.location.lon,
                "anchor_type" : GUN_TYPES[gun.type.number],
                "location"  : gun.description,
                "names" : gun.name,
            })
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
