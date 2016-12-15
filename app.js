'use strict';

process.env.DEBUG = 'actions-on-google:*';
const Assistant = require('actions-on-google').ApiAiAssistant;
const express = require('express');
const bodyParser = require('body-parser');
const Taboot = require('taboot');
const PHISH_NET_API_KEY = 'CEE681B57889948C24DE';
const PHISH_API = 'http://api.phish.net/';
const pnet = new Taboot(PHISH_NET_API_KEY).pnet

const ACTION_LATEST = 'latest';


let app = express();
app.use(bodyParser.json({
    type: 'application/json'
}));

// [START YourAction]
app.post('/', function(req, res) {

    console.log('headers: ' + JSON.stringify(request.headers));
    console.log('body: ' + JSON.stringify(request.body));


    const assistant = new Assistant({
        request: req,
        response: res
    });

    function getLatest() {
        pnet.shows.setlists.latest({}, function(err, data) {

            var venue = data[0].venue;
            var date = data[0].showdate;
            var setlist = data[0].setlistdata
                .replace(/\[[^>]*\]/g, ' ')
                .replace(/<[^>]*>/g, ' ')
                .replace(/>/g, ' into ')
                .replace(/Set [^]|Encore:*/gi, match => `<break time="250ms"/> ${match} <break time="500ms"/>`)
                .toLowerCase();

            assistant.tell(`<speak>The last show was at ${venue} on ${date}. ${setlist}</speak>`);

        });
    }


    let actionMap = new Map();
    actionMap.set(ACTION_LATEST, getLatest);

    assistant.handleRequest(actionMap);

});
// [END YourAction]

if (module === require.main) {
    // [START server]
    // Start the server
    let server = app.listen(process.env.PORT || 8080, function() {
        let port = server.address().port;
        console.log('App listening on port %s', port);
    });
    // [END server]
}

module.exports = app;
