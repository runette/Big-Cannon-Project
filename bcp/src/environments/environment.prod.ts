var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
var SCOPES = [
  "email",
  "profile",
 ];
var CLIENT_ID = '927628257279-n6qtj2jk165emkona4hhac9bulgh4jke.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDZcNCn8CzpdFG58rzRxQBORIWPN9LOVYg';
var AUTH_DOMAIN =  "ultima-ratio-221014.firebaseapp.com";
var PROJECT_ID = "ultima-ratio-221014";
var DATABASE_URL = "https://ultima-ratio-221014.firebaseio.com";
var STORAGE_BUCKET = "ultima-ratio-221014.appspot.com"

export const environment = {
  production: true,
  firebase: {
	  apiKey: API_KEY,
	  authDomain: AUTH_DOMAIN,
	  databaseURL: DATABASE_URL,
	  projectId: PROJECT_ID,
	  storageBucket: STORAGE_BUCKET,
	  messagingSenderId: "927628257279",
	  clientId: CLIENT_ID,
	  scopes: SCOPES,
	  discoveryDocs: DISCOVERY_DOCS
  },
  firebaseui: {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    databaseURL: DATABASE_URL,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
  },
apiUrl: 'https://v2.bigcannonproject.org/_ah/api/bcp'
}