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

import jinja2, os, json, logging
from update import UpdateSchema
from data import Gun, GUN_TYPES, RECORD_QUALITIES, to_bool, UserStatus, to_int, BNG, geolocate, GeoPt, get_serving_url
from flask import Flask, render_template, send_from_directory, request
from datetime import datetime


app = Flask(__name__)
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")

@app.route('/')
def main_handler():
    user_data = UserStatus(request.cookies.get("token"))
    return render_template("index.html", 
                user_data= user_data,
                index= 1)

@app.route('/about')
def about():
    user_data = UserStatus(request.cookies.get("token"))
    return render_template('about.html',
                           index= 2,
                           user_data= user_data
                           )

@app.route('/database')
def database():
    user_data = UserStatus(request.cookies.get("token"))
    return render_template("database.html",
                           user_data= user_data,
                           gun_types= GUN_TYPES,
                           index= 3                           
                           )


@app.route('/map_fetch', methods=['POST'])
def fetch_map():
    map = {
        "defaultThumb" : "/img/70x70.png",
        "icons" : {
            "bronze" : '/img/cannon_bronze.png',
            "silver" : "/img/cannon_silver.png",
            'gold' : "/img/cannon_gold.png",
            'none' : '/img/cannon_bronze.png',
        },
        "pageSize": 10,
        "entryPath" : "/database/entry?gun_id=",
        "sort":{"asc": 4, "desc": 3},
    }
    entries = Gun.map_data()
    map.update({
        "entries":entries
    })
    return json.dumps(map)

@app.route('/database/entry')
def fetch_entry():
    user_data = UserStatus(request.cookies.get("token"))
    user = user_data['user']
    gun_id = to_int(request.args.get('gun_id'))
    if gun_id > 0:
        gun = Gun.get_id(gun_id)
        index = 3
    else:
        if user:
            gun = Gun(
                gunid=Gun.get_next(),
                description="",
                type=Gun.Types.NOT_KNOWN,
                name=user.email,
                location= GeoPt(52,0),
                date= datetime.now()
            )
            index = 4
        else :
            gun = Gun(
                gunid=Gun.get_next(),
                description="",
                type=Gun.Types.NOT_KNOWN,
                name="",
                location=GeoPt(52, 0),
                date=datetime.now()
            )
            index = 4
    return render_template('detail.html',
                           user_data=user_data,
                           gun= gun,
                           gun_types= GUN_TYPES,
                           qualities_text= RECORD_QUALITIES,
                           qualities= Gun.Quality,
                           index= index                           
                           )

@app.route('/set_entry', methods=['POST'])
def set_entry():
    user_data=UserStatus(request.cookies.get("token"))
    user = user_data['user']
    if user:
        gun_id = to_int(request.form.get('id'))
        new_location = GeoPt(request.form.get('lat'), request.form.get('lon'))
        gun = Gun.get_id(gun_id)
        if not gun :
            gun = Gun(
                gunid=gun_id,
                name=user.email,
            )
        gun.populate(
            description= request.form.get('description'),
            type= Gun.Types[request.form.get('type')],
            name= request.form.get('name'),
            site=request.form.get('site'),
            context=request.form.get('context'),
            collection=to_bool(request.form.get('collection')),
            coll_name=request.form.get('coll_name'),
            coll_ref=request.form.get('coll_ref'),
            markings=to_bool(request.form.get('markings')),
            mark_details=request.form.get('mark_details'),
            interpretation=to_bool(request.form.get('interpretation')),
            inter_details=request.form.get('inter_details'),
            quality=Gun.Quality[request.form.get('quality')]
        )
        if  gun.country == 'none' or new_location != gun.location:
            gun.location = new_location
            address = geolocate(gun.location)
            gun.geocode = json.dumps(address)
            for location in address:
                if "country" in location['types']:
                    gun.country = location['formatted_address']
        gun.put()
        return render_template('detail.html',
                               user_data= user_data,
                               gun= gun,
                               gun_types= GUN_TYPES,
                               qualities_text= RECORD_QUALITIES,
                               qualities= Gun.Quality,
                               index= 4,                               
                               )


@app.route('/add_photo', methods=['POST'])
def add_photo():
    user_data = UserStatus(request.cookies.get("token"))
    user = user_data['user']
    if user:
        data = request.json
        url = get_serving_url(data)
        gun_id = to_int(request.args.get('id'))
        gun = Gun.get_id(gun_id)
        if gun :
            image_list = gun.images
            if len(image_list) == 1 and image_list[0] == "":
                gun.images = [json.dumps(url)]
            else :
                gun.images = json.dumps(url)
            gun.put()
        return url.get("original", '')
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
    
@app.route('/img/<path:path>', methods=['GET'])
def img(path):
    return send_from_directory(root, path)
    
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
        app.run(host='127.0.0.1', port=8080, use_reloader=True)