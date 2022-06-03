from data import geolocate
import logging
from google.cloud.datastore.helpers import GeoPoint

class LocationApi:
    @staticmethod
    def get_location(body):
        try:
            lat = body['lat']
            lon = body['lng']
            location = GeoPoint(lat, lon)
            geo = geolocate(location)
            geo.update({"location": [lat, lon]})
            success = True
        except Exception as e:
            logging.error(str(e))
            success = False
        return geo, (200 if success else 500)
