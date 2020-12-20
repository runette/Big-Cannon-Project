import json
from data import Gun, geolocate, GeoPt
import logging

class LocationApi:
    @staticmethod
    def get_location(body):
        try:
            lat = body['lat']
            lon = body['lng']
            location = GeoPt(lat, lon)
            geo = geolocate(location)
            geo.update({"location": [lat, lon]})
            success = True
        except Exception as e:
            logging.error(str(e))
            success = False
        return geo, (200 if success else 500)
