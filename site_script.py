from argparse import Namespace
from data import Site
from google.cloud import ndb
import googlemaps
from enum import Enum

gmaps = googlemaps.Client(key='AIzaSyDZcNCn8CzpdFG58rzRxQBORIWPN9LOVYg')

namespace = "test"

client = ndb.Client()

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
    geocode = ndb.JsonProperty()
    site = ndb.StringProperty()
    display_name = ndb.StringProperty()

with client.context():
    sites = Site.query(namespace= namespace).fetch()
    guns = Gun.query(namespace= namespace)
    for gun in guns:
        places = gun.geocode.get("places"]
        locations = gun.geocode.get("geolocation")
        if places is None and locations is None:
            sitelist=[gun.geocode]
        sitelist = [item for item in places if item.get("name") == gun.site]
        if len(sitelist) < 1:
            sitelist = [item for item in locations if item.get("formatted_address") == gun.site]
        if len(sitelist) == 0:
            continue
        my_site = sitelist[0]
        s = [site for site in sites if site.place_id == my_site.get("place_id")]
        if len(s) < 1 :
            try:
                place = gmaps.place(my_site.get("place_id"))
                geocode = place.get("result")
                address_comps = geocode.get("address_components")
                site = Site(
                    place_id = my_site.get("place_id"),
                    geocode = geocode,
                    attribution = place.get("html_attributions"),
                    display_name = geocode.get("name"),
                    guns = [gun.gunid],
                    namespace= namespace
                    )
                country = [comp.get("long_name") for comp in address_comps if "country" in comp.get("types")]
                if len(country) > 0:
                    site.country = country[0]
                sites.append(site)
                site.put()
                gun.site_id = site.key.id()
                gun.put()
            except Exception as e:
                print(str(e))
        elif len(s) == 1:
            site = s[0]
            if not gun.gunid in site.guns:
                site.guns.append(gun.gunid)
            if not (gun.display_name == site.geocode.get("name") or gun.display_name == site.geocode.get("formatted_address")):
                print(f"From {site.display_name} to {gun.display_name}")
            gun.site_id = site.key.id()
            site.put()
            gun.put()
        else:
            print("ERROR")


