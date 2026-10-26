from data import Site
from google.cloud import ndb
import googlemaps
from enum import Enum
from data import Gun, User


#gmaps = googlemaps.Client(key='AIzaSyDZcNCn8CzpdFG58rzRxQBORIWPN9LOVYg')

namespace = None

client = ndb.Client()
with client.context():
    result = Gun.query(order_by=['gunid'], namespace=None).fetch()
    users = User.query().fetch()
    for gun in result:
        print(gun.api_data(users, False))
            


