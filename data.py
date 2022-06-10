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
from google.cloud import tasks_v2
from google.cloud.tasks_v2.services.cloud_tasks.transports import CloudTasksGrpcTransport
import grpc

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
    date = ndb.DateTimeProperty(auto_now=True)
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
    user_id = ndb.StringProperty()
    status = ndb.IntegerProperty(default=Status.UNVERIFIED.value)
    measurements = ndb.GenericProperty()
    moulding_code = ndb.StringProperty(repeated=True)
    muzzle_code = ndb.StringProperty()
    cas_code = ndb.StringProperty()
    button_code = ndb.StringProperty()
    category = ndb.IntegerProperty(default=Categories.NOT_KNOWN.value)
    country_of_origin = ndb.StringProperty(default = None)
    
    display_name = ndb.StringProperty()
    country = ndb.StringProperty()
    geocode = ndb.JsonProperty()    

    @classmethod
    def map_data(cls, namespace, size, cursor) -> List[Dict]:
        (result, cursor, f) = cls.query(order_by=['site'], namespace=namespace).fetch_page(size, cursor)
        users = User.query().fetch()
        map_data = []
        for gun in result:
            data = gun.api_data(users)
            if data:
                map_data.append(data)
        return (map_data, cursor, f)
      
        
    def api_data(self, users) -> Dict:
        try:
            thumbnail = self.get_images()[0].get("s32")
        except:
            thumbnail = ""
        try:
            name = [user for user in users if user.user_id ==
                    self.user_id][0].fire_user['name']
        except Exception as e:
            id = ""
            for user in users:
                fu = user.fire_user
                if self.name and fu['email'] in self.name:
                    id = fu['user_id']
            if id != "":
                self.user_id = id
                self.put()
                name = User.get_id(self.user_id).fire_user['name']
            else:
                name = self.name
        try:
            line = {}
            line.update({'thumbnail': thumbnail, 'owner': name})
            for item in self.to_dict().items():
                if item[0] == 'location':
                    line.update(
                        {'lat': item[1].latitude, 'lng': item[1].longitude})
                elif item[0] in MATRIX:
                    line.update({item[0]: MATRIX[item[0]][item[1]]})
                elif item[0] == 'date':
                    line.update({'date': self.date.timestamp() * 1000})
                elif item[0] == 'images':
                    images = []
                    for image in item[1]:
                        try:
                            images.append(json.loads(image))
                        except:
                            images.append(
                                {"original": image, "s32": image + '=s32', "s200": image + "=s200"})
                    line.update({item[0]: images})
                else:
                    line.update({item[0]: item[1]})
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


def geolocate(location):
    gmaps = googlemaps.Client(key='AIzaSyDZcNCn8CzpdFG58rzRxQBORIWPN9LOVYg')
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
    level = 0
    if len(reverse_geocode_result) < 2:
        try:
            default = reverse_geocode_result[0]['formatted_address']
        except:
            default = "None"
        country = default
    else:
        for location in reverse_geocode_result:
            if "country" in location['types']:
                country = location['formatted_address']
                if level == 0:
                    default = location['formatted_address']
            if 'neighborhood' in location['types']:
                level = 10
                default = location['formatted_address']
                continue
            try:
                admin = [item for item in location['types']
                         if 'administrative_area' in item][0]
                admin_level = to_int(admin[-1])
                if admin_level > level:
                    level = admin_level
                    default = location['formatted_address']
            except:
                pass
    return {"geolocation": reverse_geocode_result, "places": results, 'default': default, 'country': country}


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
    display_name = ndb.StringProperty()
    country = ndb.StringProperty()
    geocode = ndb.JsonProperty()
    website = ndb.StringProperty()

class MapData(object):
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MapData, cls).__new__(cls)
            cls._instance.update()
            cls._instance._prod_mapdata = []
            cls._instance._dev_mapdata = []
            cls._instance._train_mapdata = []
        return cls._instance
        
    def update(cls):
        
        #channel = grpc.insecure_channel('localhost:8123')
        
        #transport = CloudTasksGrpcTransport(channel=channel)   
        tclient = tasks_v2.CloudTasksClient()
        parent = "projects/ultima-ratio-221014/locations/europe-west2/queues/default"
        url = "https://v2.bigcannonproject.org/_ah/api/update_map"
        #url= "http://localhost:8000/_ah/api/update_map"
        task = tasks_v2.Task(
            http_request= tasks_v2.HttpRequest(
                http_method=tasks_v2.HttpMethod.POST,
                url= url,
                headers = {"Authorization": "Bearer null"},
                body = json.dumps({"namespace": None}).encode("utf-8")
            )
        )
        request = tasks_v2.CreateTaskRequest(
            parent= parent,
            task = task
        )
        tclient.create_task(request= request)
        task = tasks_v2.Task(
            http_request= tasks_v2.HttpRequest(
                http_method=tasks_v2.HttpMethod.POST,
                url= url,
                headers = {"Authorization": "Bearer null"},
                body = json.dumps({"namespace": "test"}).encode("utf-8")
            )
        )
        request = tasks_v2.CreateTaskRequest(
            parent= parent,
            task = task
        )
        tclient.create_task(request= request)
        task = tasks_v2.Task(
            http_request= tasks_v2.HttpRequest(
                http_method=tasks_v2.HttpMethod.POST,
                url= url,
                headers = {"Authorization": "Bearer null"},
                body = json.dumps({"namespace": "train"}).encode("utf-8")
            )
        )
        request = tasks_v2.CreateTaskRequest(
            parent= parent,
            task = task
        )
        tclient.create_task(request= request)        

    def get(self, namespace: str) -> List[Dict]:
        if namespace == "test":
            return self._dev_mapdata
        if namespace == "train":
            return self._train_mapdata
        return self._prod_mapdata
    
    def __dict__(self) -> Dict:
        return {
            "test": self._dev_mapdata,
            "train": self._train_mapdata,
            "prod": self._prod_mapdata
        }
