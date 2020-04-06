#MIT License

#Copyright (c) 2019 Paul Harwood

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

import os
import json
from data import Gun, MATRIX, GUN_TYPES, RECORD_QUALITIES, GUN_CATEGORIES, to_bool, UserStatus, to_int, BNG, geolocate, GeoPt, get_serving_url, User
from flask import Flask, render_template, send_from_directory, request, redirect, url_for
from datetime import datetime
from urllib.parse import urlparse
from connexion import App
import firebase_admin


app = Flask(__name__)
root = os.path.dirname(os.path.abspath(__file__))
firebase_admin.initialize_app()

options = {"swagger_ui": False}
api = App(__name__, options=options)
api.add_api('swagger.yaml', strict_validation=True)


try:
    import googleclouddebugger
    googleclouddebugger.enable()
except ImportError:
    pass


@app.route('/map_fetch', methods=['POST'])
def fetch_map():
    user_data = UserStatus(request.cookies.get("token"))
    map = {
        "defaultThumb": "/img/70x70.png",
        "icons": {
            "bronze": '/img/cannon_bronze.png',
            "silver": "/img/cannon_silver.png",
            'gold': "/img/cannon_gold.png",
            'none': '/img/cannon_bronze.png',
        },
        "entryPath": "/database/entry?gun_id=",
        "sort": {"asc": 4, "desc": 3},
    }
    if user_data.user:
        entries = Gun.map_data(user_data.namespace)
    else:
        entries = Gun.map_data(None)
    map.update({
        "entries": entries
    })
    return json.dumps(map)

@app.route('/map_fetch_2', methods=['POST'])
def fetch_map_2():
    user_data = UserStatus(request.cookies.get("token"))
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
    if user_data.user:
        entries = Gun.map_data_2(user_data.namespace)
    else:
        entries = Gun.map_data_2(None)
    map.update({
        "entries": entries
    })
    return json.dumps(map)

@app.route('/database')
def database():
    return send_from_directory(os.path.join(root, 'static'), 'index.html')

@app.route('/database/entry')
def fetch_entry():
    return send_from_directory(os.path.join(root, 'static'), 'index.html')

@app.route('/new_record')
def new_record():
    return send_from_directory(os.path.join(root, 'static'), 'index.html')
    

@app.route('/set_entry', methods=['POST'])
def set_entry():
    user_data=UserStatus(request.cookies.get("token"))
    user = user_data['user']
    if user:
        gun_id = to_int(request.form.get('id'))
        new_location = GeoPt(request.form.get('lat'), request.form.get('lon'))
        gun = Gun.get_id(gun_id, user_data.namespace)   
        if not gun:
            gun = Gun(
                gunid=gun_id,
                name=user.email,
            )
        gun.populate(
            description=request.form.get('description'),
            type=Gun.Types[request.form.get('type')],
            category=Gun.Categories[request.form.get('category')],
            user_id=request.form.get('user_id'),
            site=request.form.get('site', ""),
            context=request.form.get('context'),
            collection=to_bool(request.form.get('collection')),
            coll_name=request.form.get('coll_name'),
            coll_ref=request.form.get('coll_ref'),
            markings=to_bool(request.form.get('markings')),
            mark_details=request.form.get('mark_details'),
            interpretation=to_bool(request.form.get('interpretation')),
            inter_details=request.form.get('inter_details'),
            moulding_code=list(request.form.get('moulding')),
            muzzle_code=request.form.get('muzzle_code', ""),
            cas_code=request.form.get('cas_code', ""),
            button_code=request.form.get('button_code', ""),
            display_name=request.form.get('display_name', ""),
        )
        gun.measurements = {}
        scale = 1 if to_bool(request.form.get('units')) else 1000
        MEASUREMENTS = ['length', 'base_ring', 'muzzle', 'bore', 'trunnion_position', 'trunnion_width', 'trunnion_diameter', 'trunnion_offset']
        for item in MEASUREMENTS:
            m = gun.measurements
            value = request.form.get(item) if request.form.get(item) else "0"
            m.update({item: int(float(value) * scale)})
            gun.measurements = m
        if  gun.country == 'none' or new_location != gun.location:
            gun.location = new_location
            address = geolocate(gun.location)
            gun.geocode = address
            gun.site = address['default']
            gun.display_name = gun.site
            gun.country = address['country']
        gun.put()
        return redirect(url_for('fetch_entry', gun_id=gun_id))


@app.route('/add_photo', methods=['POST'])
def add_photo():
    user_data = UserStatus(request.cookies.get("token"))
    user = user_data['user']
    if user:
        data = request.json
        url = get_serving_url(data)
        json_url = json.dumps(url)
        gun_id = to_int(request.args.get('id'))
        gun = Gun.get_id(gun_id, user_data.namespace)
        if gun :
            image_list = gun.images
            if len(image_list) == 1 and image_list[0] == "":
                gun.images = [json_url]
            else:
                for image in image_list:
                    if urlparse(url['original']).path == urlparse(json.loads(image)['original']).path:
                        image_list.remove(image)
                image_list.append(json_url)
                gun.images = image_list
            gun.put()
        return json_url
    return "No User"

@app.route('/bng_convert', methods=['POST'])
def bng_convert():
    eastings = request.args.get('eastings')
    northings = request.args.get('northings')
    bng = BNG()
    convert = bng.convert_to_LL(
        eastings=eastings,
        northings=northings
    )
    response = json.dumps({
        "LATITUDE" : convert["LATITUDE"],
        "LONGITUDE" : convert["LONGITUDE"]
    })
    return response

@app.route('/ll_convert', methods=['POST'])
def LlConvert():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    convert = BNG.convert_from_LL(lat,lon)
    response = json.dumps({
        "EASTING" : convert["EASTING"],
        "NORTHING" : convert["NORTHING"]
    })
    return response

@app.route("/get_location", methods=['POST'])
def get_location():
    user_data = UserStatus(request.cookies.get("token"))
    user = user_data['user']
    if user:
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        location = GeoPt(lat, lon)
        geo = geolocate(location)
        geo.update({"location": [lat, lon]})
        return json.dumps(geo)

@app.route("/add_record", methods=['POST'])
def add_record():
    user_data = UserStatus(request.cookies.get("token"))
    user = user_data['user']
    if user:
        data = request.get_json()
        gunid = Gun.get_next(user_data.namespace)
        location = data['location']
        gun = Gun(namespace=user_data.namespace,
            gunid=gunid,
            user_id=user.user_id,
            type=Gun.Types.NOT_KNOWN,
            date=datetime.now(),
            measurements={},
            country=data['country'],
                  )
        gun.location = GeoPt(location[0], location[1])
        geo = {"geolocation": data['geolocation']}
        geo.update({"places":data['places']})
        gun.geocode = geo
        try:
            gun.site = data['current_site']['formatted_address']
        except:
            gun.site = data['current_site']['name']
        gun.display_name = gun.site
        gun.put()
        return str(gun.gunid)

@app.route('/privacy', methods=['GET'])
def privacy():
    return redirect("https://www.iubenda.com/privacy-policy/19391456", code=302)

@app.route('/tor', methods=['GET'])
def tor():
    return redirect("https://app.termly.io/document/terms-and-conditions/39c09e25-344b-49a8-95d2-d817738d36aa", code=302)

@app.route('/img/<path:path>', methods=['GET'])
def img(path):
    return send_from_directory(os.path.join(root, 'img'), path)

@app.route('/sw.js', methods=['GET'])
def sw():
    return send_from_directory(root, 'sw.js')

@app.route('/recording', methods=['GET'])
def recording():
    return send_from_directory(os.path.join(root, 'static'), 'index.html')


@app.route('/<path:path>', methods=['GET'])
def all(path):
    return send_from_directory(os.path.join(root, 'static'), path)

@app.route('/')
def home():
    return send_from_directory(os.path.join(root, 'static'), 'index.html')

if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    if 'WINGDB_ACTIVE' in os.environ:
        app.debug = False
        app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
        app.run(host='localhost', port=8080, use_reloader=True)
