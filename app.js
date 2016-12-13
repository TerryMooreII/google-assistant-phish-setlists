
'use strict';

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
//var pnet = require('pnet');

const PHISH_NET_API_KEY = 'CEE681B57889948C24DE';
const PHISH_API = 'http://api.phish.net/';
//pnet.apikey(PHISH_NET_API_KEY);

var Taboot = require('taboot');
var pnet = new Taboot(PHISH_NET_API_KEY).pnet

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

// [START YourAction]
app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});

    pnet.shows.setlists.latest({}, function(err, data) {

        /*
        showdate: '2016-10-31',
     showyear: '2016',
     city: 'Las Vegas',
     state: 'NV',
     country: 'USA',
     venue: 'MGM Grand Garden Arena',
     */
     var venue = data[0].venue;
     var date = data[0].showdate;
     var setlist = data[0].setlistdata
        .replace(/\[[^>]*\]/g, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/>/g, ' into ')
        .replace(/Set [^]|Encore:*/gi, match => `${match} \n`);
        
     console.log(setlist)

     function responseHandler (assistant) {
       // Complete your fulfillment logic and send a response
       assistant.tell(`The last show was at ${venue} on ${date}.  The setlist is ${setlist}`);
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
