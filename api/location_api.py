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

from data import reverse_geocode, User
import logging
from google.cloud.datastore.helpers import GeoPoint
from google.cloud import ndb

client = ndb.Client()

class LocationApi:
    @staticmethod
    def get_location(user, body):
        with client.context():
            user_data = User.get_id(user)
            if user_data:
                namespace = user_data.namespace()
            else:
                namespace = None
            if body["source"] == "Google":
                try:
                    lat = body['lat']
                    lon = body['lng']
                    location = GeoPoint(lat, lon)
                    geo = reverse_geocode(location, namespace)
                    geo.update({"location": [lat, lon]})
                    success = True
                except Exception as e:
                    logging.error(str(e))
                    geo = []
                    success = False
            else:
                geo=[]
                success = False
            return geo, (200 if success else 500)
