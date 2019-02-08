import cPickle as pickle
import json
import logging
import os
import urllib

from attrdict import AttrDict
from google.auth.transport.requests import AuthorizedSession
from google_auth_oauthlib.flow import Flow
from oauthlib.oauth1 import SIGNATURE_HMAC, SIGNATURE_TYPE_QUERY, SIGNATURE_TYPE_BODY, SIGNATURE_PLAINTEXT, SIGNATURE_RSA, SIGNATURE_TYPE_AUTH_HEADER




def auth_logging():
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    log1 = logging.getLogger('oauthlib')
    log1.addHandler(ch)
    log2 = logging.getLogger('requests_oauthlib')
    log2.addHandler(ch)
    log3 = logging.getLogger('google_auth_oauthlib')
    log3.addHandler(ch)
    return



def is_devserver():
    """Check if the app is running on devserver or not."""
    return os.getenv('FLASK_ENV', '').startswith('dev')


def setCallback(url):
    if is_devserver():
        return "http://localhost:8080" + url
    else:
        return "https://ultima-ratio-221014.appspot.com" + url


def dict2attr(dict):
    return AttrDict(dict)


class APIError(Exception):
    pass


class GoogleSession(object):
    user = ""
    credentials = ""
    state = ""
    service = ""    

    def __init__(self, user, service):
        try:
            self.scopes
        except:
            raise ValueError("GoogleSessin instance must have a scope set")
        self.user = user
        self.service = service
        if is_devserver():
            os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
        self.flow = Flow.from_client_secrets_file(
            os.getenv(GOOGLE_APPLICATION_CREDENTIALS ),
            self.scopes,
            redirect_uri=setCallback('/auth?service=' + service),
            state=self.state
        )
        return

    def get_auth_url(self):
        url, state = self.flow.authorization_url(
            access_type='offline',
            login_hint=self.user,
            approval_prompt="force"
        )
        self.state = state

        return url

    def auth_response(self, response):
        try:
            response = self.flow.fetch_token(
                authorization_response=response
            )
            self.credentials = pickle.dumps(self.flow.credentials)

        except Exception as e:
            logging.error("Token Error in Google Access Token" + str(e))
        return response

    def get(self, url):
        result = AttrDict({})
        kwargs = {}
        flag = True
        try:
            while flag:
                flag = False
                authed_session = AuthorizedSession(pickle.loads(self.credentials))
                response = authed_session.get(url, **kwargs )
                if response.status_code == 200:
                    response = self.parse_response(response)
                    for key, value in response.iteritems():
                        if key == "nextPageToken":
                            kwargs =  {'params':{"pageToken": value}}
                            flag = True
                        elif isinstance(value, dict):
                            if key in result:
                                for item in value:
                                    result[key].update(item)
                                else:
                                    result.update({key:value})
                        elif isinstance(value, list):
                            if key in result:
                                result[key].extend(value)
                            else:
                                result.update({key:value})
                        else:
                            result.update({key:value})
                else:
                    logging.error("Google Api Error" + str(response.status_code) + response.text)
                    raise APIError()
            return result
        except Exception as e:
            logging.error(str(e))
            raise

    def post(self, url, data=None):
        result = AttrDict({})
        kwargs = {}
        flag = True
        try:
            while flag:
                flag = False
                authed_session = AuthorizedSession(pickle.loads(self.credentials))
                response = authed_session.post(url, data=data, **kwargs)
                if response.status_code == :
                    response = self.parse_response(response)
                    for key, value in response.iteritems():
                        if key == "nextPageToken":
                            kwargs = {'params': {"pageToken": value}}
                            flag = True
                        elif isinstance(value, dict):
                            if key in result:
                                for item in value:
                                    result[key].update(item)
                                else:
                                    result.update({key: value})
                        elif isinstance(value, list):
                            if key in result:
                                result[key].extend(value)
                            else:
                                result.update({key: value})
                        else:
                            result.update({key: value})
                else:
                    logging.error("Google Api Error" + str(response.status_code) + response.text)
                    raise APIError()
            return result
        except Exception as e:
            logging.error(str(e))
            raise

    def set_method(self, method):
        return self.url + method

    @classmethod
    def set_attr(cls, url, attrs):
        query_string = urllib.urlencode(attrs)
        return url + "?" + query_string

    @classmethod
    def parse_response(cls, response):
        try:
            text = response.text
            result = json.loads(text, object_hook=dict2attr)
        except Exception as e:
            raise APIError(str(e))
        return result
