from argparse import Namespace
from data import Gun, Site
from google.cloud import ndb

client = ndb.Client()

namespace = "test"

with client.context():
    sites = Site.query(namespace = namespace)
    for site in sites:
        site_id = site.key.id()
        guns = Gun.query(Gun.site_id == site_id, namespace = namespace)
        site.guns = []
        for gun in guns:
            site.guns.append(gun.gunid)
        site.put()