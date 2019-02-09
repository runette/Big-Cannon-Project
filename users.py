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


import google.oauth2.id_token
from attrdict import AttrDict


def UserStatus(id_token):
    
    #Validate an Id Token provided by Firebase Authentication and provide a User type object 
    #that can be used in a way similar to the appengine.User object
    #
    #Params
    #
    #id_token : String object holding a token.
    #
    #returns a attrdict holding the user details
    #
    #
    #
    
    user = None
    try:
        # Verify the token against the Firebase Auth API. This example
        # verifies the token on each page load. For improved performance,
        # some applications may wish to cache results in an encrypted
        # session store (see for instance
        # http://flask.pocoo.org/docs/1.0/quickstart/#sessions).
        claims = google.oauth2.id_token.verify_firebase_token(
                id_token, google.auth.transport.requests.Request())
        user = AttrDict({'email':claims.get('email', ""), 'name': claims.get('name', "anon"), 'photo':claims.get('photo', "")})
        url = "javascript:firebase.auth().signOut()"
        message = "OK"
        url_linktext = 'Logout'            
    except ValueError as exc:
        # This will be raised if the token is expired or any other
        # verification checks fail.
        message = str(exc)  
        url = "javascript:ui.start('#firebaseui-auth-container', uiConfig)"
        url_linktext = 'Login'            
    return {'user': user, 'url': url, 'url_linktext': url_linktext, 'message': message}
