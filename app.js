'use strict';

process.env.DEBUG = 'actions-on-google:*';
const Assistant = require('actions-on-google').ApiAiAssistant;
const express = require('express');
const bodyParser = require('body-parser');
const Taboot = require('taboot');
const PHISH_NET_API_KEY = 'E190885C650781765737';
const pnet = new Taboot(PHISH_NET_API_KEY).pnet

const ACTION_LATEST = 'latest';
const ACTION_SPECIFIC_DATE = 'specific_date';
const ACTION_UPCOMING = 'upcoming';

const ARGUMENT_DATE = 'date';
const NO_INPUT_PROMPTS = ['I didn\'t hear you over all that jamming!'];


let app = express();
app.use(bodyParser.json({
    type: 'application/json'
}));

// [START YourAction]
app.post('/', function(req, res) {
    const assistant = new Assistant({
        request: req,
        response: res
    });

    function parseSetlist(data){
      var venue = data.venue;
      var date = data.showdate;
      var setlist = data.setlistdata
          .replace(/\[[^>]*\]/g, ' ')
          .replace(/<[^>]*>/g, ' ')
          .replace(/>/g, ' into ')
          .replace(/Set [^]|Encore:*/gi, match => `<break time="250ms"/> ${match} <break time="500ms"/>`)
          .toLowerCase();
      return {venue, date, setlist};
    }

    function getUpcoming() {
        pnet.shows.upcoming({}, function(err, data) {
            if (!data || !data.length > 0){
              assistant.ask(`<speak>No Phish shows scheduled.</speak>`, NO_INPUT_PROMPTS);
              return;
            }
            var speak = [];

            if (data.length === 1){
              speak.push(`The only show scheduled is on ${data[0].showdate} at ${data[0].venuename} in ${data[0].city}, ${data[0].state}.`);
            }else{
              speak.push(`Here are the next ${data.length} shows. On`);

              speak.concat(data.map(show => `${show.showdate} at ${show.venuename} in ${show.city}, ${show].state}.`));
            }
            assistant.tell('<speak>' + speak.join(', <break time="250ms />"') + '</speak>');
            //assistant.ask(`<speak>The last show was at ${info.venue} on ${info.date}. ${info.setlist}</speak>`, NO_INPUT_PROMPTS);
        });
    }

    function getLatest() {
        pnet.shows.setlists.latest({}, function(err, data) {
            var info = parseSetlist(data[0]);

            assistant.ask(`<speak>The last show was at ${info.venue} on ${info.date}. ${info.setlist}</speak>`, NO_INPUT_PROMPTS);
        });
    }

    function getSpecificDate() {
        var date = assistant.getArgument(ARGUMENT_DATE);

        pnet.shows.setlists.get({showdate: date}, function(err, data) {
            if (data && data.length > 0){
              var info = parseSetlist(data[0]);
              assistant.ask(`<speak>On ${info.date} Phish played at ${info.venue}. The setlist was, ${info.setlist}</speak>`, NO_INPUT_PROMPTS);
            }else{
              assistant.ask(`<speak>There wasn\'t as show on ${date}</speak>`, NO_INPUT_PROMPTS);
            }
        });
    }

    let actionMap = new Map();
    actionMap.set(ACTION_LATEST, getLatest);
    actionMap.set(ACTION_SPECIFIC_DATE, getSpecificDate);
    actionMap.set(ACTION_UPCOMING, getUpcoming);

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
