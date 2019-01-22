import webapp2, jinja2, os, json, datetime, logging
from google.appengine.ext import deferred
from google.appengine.ext import ndb
from data import Gun, BNG


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class UpdateSchema(webapp2.RequestHandler):
    def get(self):
        deferred.defer(update_schema_task)
        self.response.write("started")
        return


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