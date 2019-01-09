#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
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
#
import webapp2, jinja2, os, json
from data import Gun, GUN_TYPES, RECORD_QUALITIES
from google.appengine.ext import ndb


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class MainHandler(webapp2.RequestHandler):
    def get(self):
        template_values = {
            'index': 1
        }
        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(template_values))
        return

class Database(webapp2.RequestHandler):
    def get(self):
        template_values = {
            'index': 3
        }
        template = JINJA_ENVIRONMENT.get_template('database.html')
        self.response.write(template.render(template_values))
        return

    def post(self):
        return

class FetchMap(webapp2.RequestHandler):
    def post(self):
        map = {
            "defaultThumb" : "/img/70x70.png",
            "icons" : {
                "bronze" : '/img/anchor-bronze.png',
                "silver" : "/img/anchor-silver.png",
                'gold' : "/img/anchor-gold.png"
            },
            "pageSize": 20,
            "entryPath" : "/database/entry?anchor_id=",
            "thumbnalePath" : "/up/thumbnails",
            "sort":{"asc": 4, "desc": 3},
        }
        entries = Gun.map_data()
        map.update({
            "entries":entries
        })
        self.response.write(json.dumps(map))
        return

class FetchEntry(webapp2.RequestHandler):
    def get(self):
        gun_id = self.request.get('anchor_id')
        if gun_id:
            gun = Gun.get_id(gun_id)
        else:
            gun = Gun(
                id=str(Gun.get_next()),
                description="",
                type=Gun.Types.NOT_KNOWN,
                names="",
                location= ndb.GeoPt(52,0)
            )
        template_values = {
            'gun' : gun,
            'gun_types' : GUN_TYPES
        }
        template = JINJA_ENVIRONMENT.get_template('detail.html')
        self.response.write(template.render(template_values))

class SetEntry(webapp2.RequestHandler):
    def post(self):
        id = self.request.get('id')
        description = self.request.get('description')
        type = self.request.get('type')
        names = self.request.get('name')
        location = ndb.GeoPt(self.request.get('lat') + "," + self.request.get('lon'))
        type= Gun.Types.lookup_by_name(type)
        gun = Gun(
            id= id,
            description= description,
            type= type,
            names= names,
            location= location,
        )
        gun.put()
        template_values = {
            'gun': gun,
            'gun_types': GUN_TYPES
        }
        template = JINJA_ENVIRONMENT.get_template('detail.html')
        self.response.write(template.render(template_values))

app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/database/entry', FetchEntry),
    ('/database', Database),
    ('/map_fetch', FetchMap),
    ('/set_entry', SetEntry)
], debug=True)
