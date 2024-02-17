# MIT License

# Copyright (c) 2019 - 2022 Runette Software Ltd

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

import json
from enum import Enum
import logging
import googlemaps
from images import ndbImage
from helpers import to_int
from google.cloud import ndb
from google.cloud import secretmanager

import requests
import time

from typing import List, Dict

GUN_TYPES = ("Cast Iron", "Wrought Iron", "Bronze",
             "Not Known", "Combined Cast and Wrought Iron")
RECORD_QUALITIES = ('Observer', "Recorder", "Surveyor")
GUN_CATEGORIES = ("Not Known", "Muzzle Loading",
                  "Breech Loading", "Carronade")
GUN_STATUS = ('Unverified', 'Auto', 'Verified')
MATRIX = {'type': GUN_TYPES, 'quality': RECORD_QUALITIES,
          'category': GUN_CATEGORIES, 'status': GUN_STATUS}
SITE_TYPES = ("google", "osm", "other")

PAGE_SIZE = 200
        
class Gun(ndb.Model):
    class Types(Enum):
        CAST = 0
        WROUGHT = 1
        BRONZE = 2
        NOT_KNOWN = 3
        COMBINATION = 4

    class Quality(Enum):
        GOLD = 2
        SILVER = 1
        BRONZE = 0

    class Status(Enum):
        UNVERIFIED = 0
        AUTO = 1
        VERIFIED = 2

    class Categories(Enum):
        NOT_KNOWN = 0
        MUZZLE_LOAD = 1
        BREECH_LOAD = 2
        CARRONADE = 3

    gunid = ndb.IntegerProperty()
    location = ndb.GeoPtProperty()
    type = ndb.IntegerProperty()
    quality = ndb.IntegerProperty(default=Quality.BRONZE.value)
    description = ndb.StringProperty()
    name = ndb.StringProperty()
    date = ndb.DateTimeProperty(auto_now_add=True)
    site_id = ndb.IntegerProperty(required=True)
    context = ndb.StringProperty()
    collection = ndb.BooleanProperty()
    coll_name = ndb.StringProperty()
    coll_ref = ndb.StringProperty()
    images = ndb.TextProperty(repeated=True)
    markings = ndb.BooleanProperty()
    mark_details = ndb.StringProperty()
    interpretation = ndb.BooleanProperty()
    inter_details = ndb.StringProperty()
    user_id = ndb.StringProperty()
    status = ndb.IntegerProperty(default=Status.UNVERIFIED.value)
    measurements = ndb.GenericProperty()
    moulding_code = ndb.StringProperty(repeated=True)
    muzzle_code = ndb.StringProperty()
    cas_code = ndb.StringProperty()
    button_code = ndb.StringProperty()
    category = ndb.IntegerProperty(default=Categories.NOT_KNOWN.value)
    country_of_origin = ndb.StringProperty(default = None)
    attributions = ndb.StringProperty(repeated=True)
    web_links = ndb.BooleanProperty(default=False)
    urls = ndb.TextProperty(repeated=True)

    @classmethod
    def map_data(cls, namespace:str, cursor, login: bool) -> List:
        (result, cursor, f) = cls.query(order_by=['gunid'], namespace=namespace).fetch_page(PAGE_SIZE, start_cursor= cursor)
        users = User.query().fetch()
        temp = []
        for gun in result:
            data = gun.api_data(users, login)
            if data:
                temp.append(data)
        return (temp, cursor, f)
        
    def api_data(self, users, login: bool) -> Dict:
        thumbnail = None
        images = self.get_images()
        for image in images:
            try:
                thumbnail = image["s32"]
                break
            except Exception:
                continue
        if not thumbnail:
            try:
                thumbnail = images[0].get("original")
            except Exception:
                thumbnail= ""

        name = [user for user in users if user.user_id ==
                self.user_id][0].fire_user['name']
        try:
            line = {}
            line.update({'thumbnail': thumbnail, 'owner': name})
            for item in self.to_dict().items():
                if item[0] == 'location':
                    line.update(
                        {'lat': item[1].latitude, 'lng': item[1].longitude})
                    continue
                elif item[0] in MATRIX:
                    line.update({item[0]: MATRIX[item[0]][item[1]]})
                    continue
                elif item[0] == 'date':
                    line.update({'date': self.date.timestamp() * 1000})
                    continue
                elif item[0] in ['description', 'context', 'site_id', 'user_id', 'gunid']:
                    line.update({item[0]: item[1]})
                    continue
                elif item[0] == 'images':
                    images = []
                    for image in item[1]:
                        try:
                            images.append(json.loads(image))
                        except:
                            images.append(
                                {"original": image, "s32": image + '=s32', "s200": image + "=s200"})
                    line.update({item[0]: images})
                    continue
                elif login:
                    line.update({item[0]: item[1]})
                continue
            return line
        except Exception as e:
            logging.error("Error in Gun API Data for gunid : "
                          + str(self.gunid) + " - " + str(e))
            return None

    @classmethod
    def get_next(cls, namespace):
        all = cls.query(order_by=["-gunid"], namespace=namespace).fetch()
        if all:
            return all[0].gunid + 1
        else:
            return 1

    @classmethod
    def get_id(cls, id, namespace):
        return cls.query(cls.gunid == id, namespace=namespace).get()

    def get_images(self):
        IMAGE_DEFAULTS = [{"s200": "/img/70x70.png", "original": ""}]
        images = []
        if self.images == []:
            return IMAGE_DEFAULTS
        try:
            for image in self.images:
                try:
                    images.append(json.loads(image))
                except:
                    images.append(
                        {"original": image, "s32": image + '=s32', "s200": image + "=s200"})
            return images
        except:
            return IMAGE_DEFAULTS


class User(ndb.Model):
    class Standing(Enum):
        OBSERVER = 0
        RECORDER = 1
        SURVEYOR = 2
        ADMIN = 3


    user_id = ndb.StringProperty()
    standing = ndb.IntegerProperty(default= Standing.OBSERVER.value)
    created = ndb.DateTimeProperty (auto_now=True)
    fire_user = ndb.JsonProperty()
    test_user = ndb.BooleanProperty()
    train_user = ndb.BooleanProperty()

    def namespace(self):
        if self.train_user:
            return "train"
        if self.test_user:
            return "test"
        return None
    
    @classmethod
    def get_id(cls, id):
        return User.query(cls.user_id == id).get()

def get_google_api():
    secret_client = secretmanager.SecretManagerServiceClient()
    key_path = "projects/927628257279/secrets/keys/versions/2"
    response = secret_client.access_secret_version(request={"name": key_path})
    return googlemaps.Client(key=response.payload.data.decode("UTF-8"))


def reverse_geocode(location, namespace):
    gmaps=get_google_api()
    loc = (location.latitude, location.longitude)
    reverse_geocode_result = gmaps.reverse_geocode( loc )
    for radius in [100, 300, 600, 1000]:
        places_result = gmaps.places_nearby( loc, radius=radius)
        token = places_result.get('next_page_token')
        results = places_result["results"]
        while token:
            try:
                places_result = gmaps.places_nearby(loc, page_token=token)
            except Exception as e:
                logging.error(str(e))
                if 'INVALID_REQUEST' in str(e):
                    time.sleep(2)
                    continue
                raise
            results += places_result['results']
            token = places_result.get('next_page_token')
        if len(results) > 10:
            break
    for geo in reverse_geocode_result:    
        if Site.query(Site.place_id == geo["place_id"], namespace=namespace).get():
            reverse_geocode_result.remove(geo)
    for geo in results:
        if Site.query(Site.place_id == geo["place_id"], namespace=namespace).get():
            results.remove(geo)    
    return {"geolocation": reverse_geocode_result, "places": results}

def geocode(place_id):
    gmap = get_google_api();
    place = gmap.place(place_id)
    geocode = place.get("result")
    return (place, geocode)


def get_serving_url(upload_metadata):
    bucket_name = upload_metadata.get('bucket')
    full_path = upload_metadata.get('fullPath')
    folder = full_path.replace('/original', '')
    original = ndbImage(full_path, bucket_name)
    original.get()
    original.content_format = original.image.format
    if original.image.format == 'TIFF':
        rgb = original.image.convert('RGB')
        original.image = rgb
        original.put(content_type='image/jpeg', content_format='JPEG')
    thumb_32 = original.thumbnail((32, 32), folder + "/32x32")
    thumb_32.put()
    thumb_200 = original.thumbnail((200, 200), folder + "/200x200")
    thumb_200.put()
    mediaLink = {"original": original.get_media_link(
    ), "s32": thumb_32.get_media_link(), "s200": thumb_200.get_media_link()}
    del original
    del thumb_32
    del thumb_200
    return mediaLink


def get_posts():
    URL = "https://public-api.wordpress.com/rest/v1.2/sites/ultimaproject.org/posts"
    params = {'number': 5}
    try:
        result = requests.get(URL, params=params)
        if result.status_code == requests.codes.ok:
            try:
                return result.json()
            except:
                raise Exception('ParseError' + result.text())
        else:
            raise Exception('ApiError' + str(result.status_code))
    except Exception as e:
        logging.error(str(e))
        return

class Site(ndb.Model):
    
    class Type(Enum):
        GOOGLE = 0
        OSM = 1
        OTHER = 2
    
    display_name = ndb.StringProperty(required=True)
    country = ndb.StringProperty()
    geocode = ndb.JsonProperty(required=True)
    guns = ndb.IntegerProperty(repeated=True)
    place_id = ndb.StringProperty(required=True)
    attribution = ndb.JsonProperty(required=True)
    verified = ndb.BooleanProperty(default=False)
    verified_by = ndb.KeyProperty()
    type = ndb.IntegerProperty(default= Type.GOOGLE.value)
    
    MATRIX=["display_name", "country", "geocode", "guns", "attribution"]
    
    @classmethod
    def data(cls, namespace: str, cursor: ndb.Cursor):
        (result, cursor, f) = cls.query(order_by=['display_name'], namespace=namespace).fetch_page(PAGE_SIZE, start_cursor= cursor)
        temp = []
        for site in result:
            temp.append(site.api_data())
        return (temp, cursor)
    
    def api_data(self) -> List[object]:
        line = {"id": self.key.id()}
        for item in self.to_dict().items():
            if item[0] in Site.MATRIX:
                line.update({item[0]: item[1]})
            elif item[0]=="type":
                line.update({item[0]: SITE_TYPES[item[1]]})
        return line    
            
        
        
        
    

