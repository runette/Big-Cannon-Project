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
#
import webapp2, jinja2, os, json, datetime, logging
from update import UpdateSchema
from data import Gun, GUN_TYPES, RECORD_QUALITIES, to_bool, UserStatus, Auth, to_int, BNG
from google.appengine.ext import ndb
from google.appengine.api import images


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class MainHandler(webapp2.RequestHandler):
    def get(self):
        user_data = UserStatus(self.request.uri)
        template_values = {
            'user_data': user_data,
            'index': 1
        }
        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(template_values))
        return

class About(webapp2.RequestHandler):
    def get(self):
        user_data = UserStatus(self.request.uri)
        template_values = {
            'index': 2,
            'user_data': user_data,
        }
        template = JINJA_ENVIRONMENT.get_template('about.html')
        self.response.write(template.render(template_values))
        return

class Database(webapp2.RequestHandler):
    def get(self):
        user_data = UserStatus(self.request.uri)
        template_values = {
            'user_data': user_data,
            'gun_types': GUN_TYPES,
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
                "bronze" : '/img/cannon_bronze.png',
                "silver" : "/img/cannon_silver.png",
                'gold' : "/img/cannon_gold.png",
                'none' : '/img/cannon_bronze.png',
            },
            "pageSize": 20,
            "entryPath" : "/database/entry?gun_id=",
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
        user_data = UserStatus(self.request.uri)
        user = user_data['user']
        gun_id = to_int(self.request.get('gun_id'))
        if gun_id:
            gun = Gun.get_id(gun_id)
        else:
            if user:
                gun = Gun(
                    id=Gun.get_next(),
                    description="",
                    type=Gun.Types.NOT_KNOWN,
                    name=user.email(),
                    location= ndb.GeoPt(52,0),
                    date= datetime.date.today()
                )
            else :
                return
        template_values = {
            'user_data':user_data,
            'gun' : gun,
            'gun_types' : GUN_TYPES,
            'index' : 4,
        }
        template = JINJA_ENVIRONMENT.get_template('detail.html')
        self.response.write(template.render(template_values))

class SetEntry(webapp2.RequestHandler):
    def post(self):
        user_data = UserStatus(self.request.uri)
        user = user_data['user']
        if user:
            id = to_int(self.request.get('id'))
            gun = Gun.get_id(id)
            if not gun :
                gun = Gun(
                    id=id,
                    name=user.email(),
                    images=[""]
                )
            gun.populate(
                description= self.request.get('description'),
                type= Gun.Types.lookup_by_name(self.request.get('type')),
                name= self.request.get('name'),
                location= ndb.GeoPt(self.request.get('lat') + "," + self.request.get('lon')),
                site=self.request.get('site'),
                context=self.request.get('context'),
                collection=to_bool(self.request.get('collection')),
                coll_name=self.request.get('coll_name'),
                coll_ref=self.request.get('coll_ref'),
                markings=to_bool(self.request.get('markings')),
                mark_details=self.request.get('mark_details'),
                interpretation=to_bool(self.request.get('interpretation')),
                inter_details=self.request.get('inter_details'),
            )
            gun.put()
            template_values = {
                'user_data':user_data,
                'gun': gun,
                'gun_types': GUN_TYPES,
                'index': 4,
            }
            template = JINJA_ENVIRONMENT.get_template('detail.html')
            self.response.write(template.render(template_values))

class GetKey(webapp2.RequestHandler):
    def post(self):
        user_data = UserStatus(self.request.uri)
        user = user_data['user']
        if user:
            logging.info("Creating key for " + user.email() + (" to upload"))
            auth = Auth('https://www.googleapis.com/auth/cloud-platform')
            key = auth.get_token()
            url = auth.get_url()
            response = json.dumps({
                'key': key,
                'url': url
            })
            self.response.write(response)
        return

class AddPhoto(webapp2.RequestHandler):
    def post(self):
        user_data = UserStatus(self.request.uri)
        user = user_data['user']
        if user:
            data = json.loads(self.request.body)
            logging.info( user.email() + " added Object " + data['name'] + "." )
            name = data['name']
            bucket = data['bucket']
            id = to_int(self.request.get('id'))
            url = images.get_serving_url(None, filename='/gs/{}/{}'.format(bucket, name))
            gun = Gun.get_id(id)
            if gun :
                image_list = gun.images
                if len(image_list) == 1 and image_list[0] == "":
                    gun.images = [url]
                else :
                    gun.images.append(url)
            gun.put()
            self.response.write(url)
        return

class BngConvert(webapp2.RequestHandler):
    def post(self):
        eastings = to_int(self.request.get('eastings'))
        northings = to_int(self.request.get('northings'))
        bng = BNG(
            eastings=eastings,
            northings=northings
        )
        convert = bng.convert_to_LL()
        response = json.dumps({
            "LATITUDE" : convert["LATITUDE"],
            "LONGITUDE" : convert["LONGITUDE"]
        })
        self.response.write(response)
        return

class LlConvert(webapp2.RequestHandler):
    def post(self):
        lat = self.request.get('lat')
        lon = self.request.get('lon')
        convert = BNG.convert_from_LL(lat,lon)
        response = json.dumps({
            "EASTING" : convert["EASTING"],
            "NORTHING" : convert["NORTHING"]
        })
        self.response.write(response)
        return


app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/update_schema', UpdateSchema),
    ('/database/entry', FetchEntry),
    ('/database', Database),
    ('/map_fetch', FetchMap),
    ('/set_entry', SetEntry),
    ('/about', About),
    ('/get_upload_key', GetKey),
    ('/add_photo', AddPhoto),
    ('/bng_convert', BngConvert),
    ('/ll_convert', LlConvert)
], debug=True)
