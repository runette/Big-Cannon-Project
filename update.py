#!/usr/bin/env python
#
# Copyright 2018 Paul Harwood
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#


import jinja2, os, json, datetime, logging

from data import Gun, BNG
from flask import Flask


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

#app.route('/update_schema')
class UpdateSchema():
    def get(self):
        # deferred.defer(update_schema_task)
        # self.response.write("started")
        try:
            guns = Gun.query().fetch()
            for gun in guns:
                for idx, image in enumerate(gun.images):
                    gun.images[idx] = image.replace("https", "https:")
                gun.put()
            self.response.write('done')
        except Exception as e:
            self.response.write(str(e))



def update_schema_task( cursor=None, num_updated=0, batch_size=100):
        # Force ndb to use v1 of the model by re-loading it.


        #change the query details to find the fields that need to be updated
        query = Gun.query()
        records, next_cursor, more = query.fetch_page(
            batch_size, start_cursor=cursor)

        to_put = []
        for record in records:
            # Give the new fields default values.
            # If you added new fields and were okay with the default values, you
            # would not need to do this.
            try:
                record.new_id = int(record.id)
            except Exception as e:
                logging.error('schema error message' + str(e))
                record.new_id = 0
            to_put.append(record)

        reload()

        # Save the updated entities.
        if to_put:
            ndb.put_multi(to_put)
            num_updated += len(to_put)
            logging.info(
                'Put {} entities to Datastore for a total of {}'.format(
                    len(to_put), num_updated))

        # If there are more entities, re-queue this task for the next page.
        if more:
            deferred.defer(
                update_schema_task, cursor=next_cursor, num_updated=num_updated)
        else:
            logging.debug(
                'update_schema_task complete with {0} updates!'.format(
                    num_updated))

        return
