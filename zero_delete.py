from data import Gun

from google.cloud import ndb
client = ndb.Client()

namespace = "train"

with client.context():
    guns = Gun.query(namespace = namespace)
    for gun in guns:
        delete = []
        for key,value in gun.measurements.items():
            if value == 0 or value is None:
                delete.append(key)
        for item in delete:
            gun.measurements.pop(item, None)
        gun.put()