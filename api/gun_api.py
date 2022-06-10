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
from data import Gun, User, MapData, get_serving_url, geolocate, GUN_TYPES, GUN_CATEGORIES
from helpers import to_bool, to_int
from google.cloud.datastore.helpers import GeoPoint
import logging
from urllib.parse import urlparse
from datetime import datetime

from google.cloud import ndb

client = ndb.Client()


class GunApi:
    @staticmethod
    def add_photo(user, body):
        with client.context():
            user_data = User.get_id(user)
            users = User.query().fetch()
            if user_data:
                namespace = user_data.namespace()
            else:
                namespace = None
            try:
                url = get_serving_url(body)
                json_url = json.dumps(url)
                gun_id = to_int(body['id'])
                gun = Gun.get_id(gun_id, namespace)
                if gun:
                    image_list = gun.images
                    if len(image_list) == 1 and image_list[0] == "":
                        gun.images = [json_url]
                    else:
                        for image in image_list:
                            if urlparse(url['original']).path == urlparse(json.loads(image)['original']).path:
                                image_list.remove(image)
                        image_list.append(json_url)
                        gun.images = image_list
                    gun.put()
                success = True
                MapData().update()
            except Exception as e:
                logging.error(str(e))
                success = False
                gun = None
            return gun.api_data(users), (200 if success else 500)

    @staticmethod
    def set_record(user, body):
        with client.context():
            user_data = User.get_id(user)
            users = User.query().fetch()
            if user_data and user_data.test_user:
                namespace = 'test'
            else:
                namespace = None
            try:
                gun_id = to_int(body.get('gunid'))
                new_location = GeoPoint(body.get('location').get(
                    'lat'), body.get('location').get('lng'))
                gun = Gun.get_id(gun_id, namespace)
                if not gun:
                    gun = Gun(
                        gunid=gun_id,
                        name=user.email,
                    )
                gun.populate(
                    description=body.get('description', ""),
                    type=Gun.Types(GUN_TYPES.index(body.get('material'))).value,
                    category=Gun.Categories(
                        GUN_CATEGORIES.index(body.get('category'))).value,
                    user_id=body.get('userId'),
                    site=body.get('site', ""),
                    context=body.get('context'),
                    collection=to_bool(body.get('collection')),
                    coll_name=body.get('coll_name', ""),
                    coll_ref=body.get('coll_ref', ""),
                    markings=to_bool(body.get('markings')),
                    mark_details=body.get('mark_details', ""),
                    interpretation=to_bool(body.get('interpretation', "")),
                    inter_details=body.get('inter_details', ""),
                    moulding_code=list(body.get('moulding_code', "")),
                    muzzle_code=body.get('muzzle_code', ""),
                    cas_code=body.get('cas_code', ""),
                    button_code=body.get('button_code', ""),
                    display_name=body.get('display_name', ""),
                )
                gun.measurements = {}
                MEASUREMENTS = ['length', 'base_ring', 'muzzle', 'bore', 'trunnion_position',
                                'trunnion_width', 'trunnion_diameter', 'trunnion_offset']
                for item in MEASUREMENTS:
                    m = gun.measurements
                    value = body.get(item) if body.get(item) else "0"
                    m.update({item: to_int(value)})
                    gun.measurements = m
                if gun.country == 'none' or new_location != gun.location:
                    gun.location = new_location
                    address = geolocate(gun.location)
                    gun.geocode = address
                    gun.site = address['default']
                    gun.display_name = gun.site
                    gun.country = address['country']
                gun.put()
                success = True
                MapData().update()
            except Exception as e:
                logging.error(str(e))
                success = False
                gun_id = 0
            return gun.api_data(users), (200 if success else 500)

    @staticmethod
    def add_record(user, body):
        with client.context():
            user_data = User.get_id(user)
            users = User.query().fetch()
            if user_data and user_data.test_user:
                namespace = 'test'
            else:
                namespace = None
            success = True
            try:
                gunid = Gun.get_next(namespace)
                location = body['location']
                gun = Gun(namespace=namespace,
                          gunid=gunid,
                          user_id=user_data.user_id,
                          type=Gun.Types.NOT_KNOWN.value,
                          date=datetime.now(),
                          measurements={},
                          country=body['country'],
                          )
                gun.location = GeoPoint(location[0], location[1])
                geo = {"geolocation": body['geolocation']}
                geo.update({"places": body['places']})
                gun.geocode = geo
                gun.site = body['current_site']
                gun.display_name = gun.site
                gun.put()
                MapData().update()
            except Exception as e:
                logging.error(str(e))
                success = False
                gunid = 0
            return gun.api_data(users), (200 if success else 500)

