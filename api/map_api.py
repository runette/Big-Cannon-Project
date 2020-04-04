import json
from data import Gun

class MapApi:
    @staticmethod
    def fetch_map():
        map = {
            "defaultThumb": "/img/70x70.png",
            "icons": {
                "observer": '/img/cannon_bronze.png',
                "recorder": "/img/cannon_silver.png",
                'surveyor': "/img/cannon_gold.png",
                'none': '/img/cannon_bronze.png',
            },
            "entryPath": "/database/entry?gun_id=",
            "sort": {"asc": 4, "desc": 3},
        }
        #if user_data.user:
            #entries = Gun.map_data_2(user_data.namespace)
        #else:
        entries = Gun.map_data_2(None)
        map.update({
            "entries": entries
        })
        success = True
        return json.dumps(map), (200 if success else 500)
