from argparse import Namespace
from data import Gun, Site
from google.cloud import ndb
import googlemaps

gmaps = googlemaps.Client(key='AIzaSyDZcNCn8CzpdFG58rzRxQBORIWPN9LOVYg')

namespace = "train"

client = ndb.Client()

with client.context():
    sites = Site.query(namespace= namespace).fetch()
    guns = Gun.query(namespace= namespace)
    for gun in guns:
        places = gun.geocode["places"]
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


