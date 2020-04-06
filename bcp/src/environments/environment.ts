// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
/* 
export const environment = {
  production: false
}; */

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";
var CLIENT_ID = '927628257279-n6qtj2jk165emkona4hhac9bulgh4jke.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDZcNCn8CzpdFG58rzRxQBORIWPN9LOVYg';

export const environment = {
  production: false,
  firebase: {
	  apiKey: API_KEY,
	  authDomain: "ultima-ratio-221014.firebaseapp.com",
	  databaseURL: "https://ultima-ratio-221014.firebaseio.com",
	  projectId: "ultima-ratio-221014",
	  storageBucket: "ultima-ratio-221014.appspot.com",
	  messagingSenderId: "927628257279",
	  clientId: CLIENT_ID,
	  scopes: [
	     "email",
	     "profile",
	    ],
	  discoveryDocs: DISCOVERY_DOCS
  },
};
