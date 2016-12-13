
'use strict';

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
var pnet = require('pnet');

const PHISH_NET_API_KEY = 'CEE681B57889948C24DE';
const PHISH_API = 'http://api.phish.net/';
pnet.apikey(PHISH_NET_API_KEY);

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

// [START YourAction]
app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});

  pnet.get('pnet.shows.setlists.latest', function(err, url, parsedJSONResource){
    // Fulfill action business logic
    console.log(parsedJSONResource);
    
    function responseHandler (assistant) {
      // Complete your fulfillment logic and send a response
      assistant.tell('Hello, World!');
    }

    assistant.handleRequest(responseHandler);
  });


});
// [END YourAction]

if (module === require.main) {
  // [START server]
  // Start the server
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;
