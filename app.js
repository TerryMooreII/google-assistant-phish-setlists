'use strict';

process.env.DEBUG = 'actions-on-google:*';
const Assistant = require('actions-on-google').ApiAiAssistant;
const express = require('express');
const bodyParser = require('body-parser');
const Taboot = require('taboot');
const PHISH_NET_API_KEY = process.env.PHISHNET_API_KEY || require('./config.js')config.phishApiKey;
const pnet = new Taboot(PHISH_NET_API_KEY).pnet

//Actions list;
const ACTION_LATEST = 'latest';
const ACTION_SPECIFIC_DATE = 'specific_date';
const ACTION_UPCOMING = 'upcoming';

//Arguments
const ARGUMENT_DATE = 'date';
const NO_INPUT_PROMPTS = ['I didn\'t hear you over all that jamming!'];

//App
let app = express();
app.use(bodyParser.json({
    type: 'application/json'
}));

app.post('/', (req, res) => {
    const assistant = new Assistant({
        request: req,
        response: res
    });

    function parseSetlist(data) {
        var venue = data.venue;
        var date = data.showdate;
        var setlist = data.setlistdata
            .replace(/\[[^>]*\]/g, ' ')
            .replace(/<[^>]*>/g, ' ')
            .replace(/>/g, ' into ')
            .replace(/Set [^]|Encore:*/gi, match => `<break time="250ms"/> ${match} <break time="500ms"/>`)
            .toLowerCase();
        return {
            venue,
            date,
            setlist
        };
    }

    function getUpcoming() {
        pnet.shows.upcoming({}, (err, data) => {
            if (!data || !data.length > 0) {
                assistant.ask(`<speak>No Phish shows scheduled.</speak>`, NO_INPUT_PROMPTS);
                return;
            }
            var speak = [];

            if (data.length === 1) {
                speak.push(`The only show scheduled is on ${data[0].showdate} at ${data[0].venuename} in ${data[0].city}, ${data[0].state}.`);
            } else {
                speak.push(`Here are the next ${data.length} shows. The next show is on`);
                data.forEach(show => speak.push(`${show.showdate} at ${show.venuename} in ${show.city}, ${show.state}.`));
            }
            assistant.ask('<speak>' + speak.join(', <break time="500ms />"') + '</speak>', NO_INPUT_PROMPTS);
        });
    }

    function getLatest() {
        pnet.shows.setlists.latest({}, (err, data) => {
            var info = parseSetlist(data[0]);
            assistant.ask(`<speak>The last show was at ${info.venue} on ${info.date}. ${info.setlist}</speak>`, NO_INPUT_PROMPTS);
        });
    }

    function getSpecificDate() {
        var date = assistant.getArgument(ARGUMENT_DATE);

        pnet.shows.setlists.get({
            showdate: date
        }, (err, data) => {
            if (data && data.length > 0) {
                var info = parseSetlist(data[0]);
                assistant.ask(`<speak>On ${info.date} Phish played at ${info.venue}. The setlist was, ${info.setlist}</speak>`, NO_INPUT_PROMPTS);
            } else {
                assistant.ask(`<speak>There wasn\'t as show on ${date}</speak>`, NO_INPUT_PROMPTS);
            }
        });
    }

    //Setup actions map
    let actionMap = new Map();
    actionMap.set(ACTION_LATEST, getLatest);
    actionMap.set(ACTION_SPECIFIC_DATE, getSpecificDate);
    actionMap.set(ACTION_UPCOMING, getUpcoming);

    assistant.handleRequest(actionMap);
});

if (module === require.main) {
    // Start the server
    let server = app.listen(process.env.PORT || 8080, function() {
        let port = server.address().port;
        console.log('App listening on port %s', port);
    });
}

module.exports = app;
