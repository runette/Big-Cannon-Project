from data import Gun, Site

from google.cloud import ndb
client = ndb.Client()

import googlemaps
gmaps = googlemaps.Client(key='AIzaSyDZcNCn8CzpdFG58rzRxQBORIWPN9LOVYg')

namespace = None

class Update:

    def setGuns():
        with client.context():
            sites = Site.query(namespace = namespace)
            for site in sites:
                site_id = site.key.id()
                guns = Gun.query(Gun.site_id == site_id, namespace = namespace)
                site.guns = []
                for gun in guns:
                    site.guns.append(gun.gunid)
                if len(site.guns) > 0:
                    site.put()
                else:
                    print(f"Deleting {site.display_name}")
                    site.key.delete()

    def setUrls():
        with client.context():
            guns = Gun.query(namespace=namespace)
            for gun in guns:
                if gun.context:
                    context = gun.coll_name.split()
                    for word in context:
                        if "https" in word:
                            if True: #"royalarmouries" in word:
                                #gun.attributions.append("© Royal Armouries ")    #f"https://commons.wikimedia.org/wiki/File:{word.split('/')[-1]}")
                                #gun.attributions.append("https://royalarmouries.org/wp-content/uploads/2018/03/Non-Commercial-Licence.pdf")
                                #gun.web_links=True
                                gun.urls.append(word)
                                context.remove(word)
                                for w in context:
                                    if "Licence:" in w:
                                        context.remove(w)
                                gun.context = " ".join(context)
                                print(f"{gun.attributions} : {gun.coll_name} : {gun.urls}")
                                #gun.put()

    def fixUrls():
        with client.context():
            guns = Gun.query(namespace=namespace)
            for gun in guns:
                if len(gun.attributions) > 0 and gun.attributions[0] == "© Royal Armouries " and "royalarmouries" not in gun.urls[0]:
                #if gun.collection and gun.coll_name == "National Army Museum":
                    #gun.attributions = {"© National Army Museum"}
                    print(f"{gun.site_id} : {gun.context} : {gun.urls}")
                    #gun.put()

    def updateSites():
        with client.context():
            sites = Site.query(namespace=namespace)
            for site in sites:
                if site.type != Site.Type.GOOGLE.value:
                    continue
                uDef = None
                if site.display_name != site.geocode.get('name'):
                    uDef = site.display_name
                try:
                    place = gmaps.place(site.place_id)
                except Exception as e:
                    print(f"Site : {site.display_name} -- {str(e)}")
                    continue
                geocode = place.get("result")
                address_comps = geocode.get("address_components")
                site.populate(
                    geocode = geocode,
                    attribution = place.get("html_attributions"),
                    display_name = geocode.get("name"),
                    )
                if uDef:
                    site.display_name = uDef
                    print(site.display_name)
                country = [comp.get("long_name") for comp in address_comps if "country" in comp.get("types")]
                if len(country) > 0:
                    site.country = country[0]
                site.put()

    def deleteGuns():
        with client.context():
            guns = Gun.query(namespace=namespace)
            for gun in guns:
                description = gun.description
                if description and "delete" in description.lower():
                    print(gun.description)
                    gun.key.delete()


#Update.updateSites()
#Update.setGuns()
Update.deleteGuns()
