const functions = require('firebase-functions');
const express = require('express');
const app = express();
const fs = require('fs');
var { google } = require('googleapis');


app.get('/countriesFlags', (req, res) => {
    var countries = {};
    var options = {
        method: 'GET',
        url: 'https://flagcdn.com/en/codes.json',
        responseType: 'json',
        json: true,
        headers: {
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8'
        }
    };
    fs.readFile('codes.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        }
        var body = JSON.parse(data);
        Object.keys(body).forEach(v => countries[body[v]] = v);
        res.send(countries);
    })
})

app.get('/getGames/', function (req, res) {
    try {
        let games = [];
        let team = !req.query.team ? '83' : req.query.team;
        let year = !req.query.year ? new Date().getFullYear() : req.query.year;

        var yearParam = (year === 'Upcoming') ? '&fixture=true' : ('&season=' + year);

        var options = {
            method: 'GET',
            url: "https://site.web.api.espn.com/apis/site/v2/sports/soccer/ALL/teams/" + team
                + "/schedule?region=us&lang=en" + yearParam,
            json: true,
            responseType: 'json',
            headers: {
                'Connection': 'keep-alive',
                'Accept-Encoding': '',
                'Accept-Language': 'en-US,en;q=0.8'
            }
        };
        
        var t = console.time('getData');
        faster(options, (err, respo) => {
            if (respo) {
                var body = respo.body;
                console.timeEnd('getData');
                if (!body.events) { res.send([]); return };
                console.time('initData');
                body.events.forEach(v => {

                    team1 = v.competitions[0].competitors[0];
                    team2 = v.competitions[0].competitors[1];

                    name1 = team1.team.displayName;
                    name2 = team2.team.displayName;

                    score1 = team1.score ? team1.score.value : '';
                    score2 = team2.score ? team2.score.value : '';

                    logo1 = team1.team.logos;
                    logo2 = team2.team.logos;

                    var noLogo = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/default-team-logo-500.png&w=100&h=100';
                    logo1 = (logo1 == undefined) ? noLogo : logo1[0].href;
                    logo2 = (logo2 == undefined) ? noLogo : logo2[0].href;

                    isOver = !(year === 'Upcoming');
                    timeStatus = v.competitions[0].status.type.shortDetail;

                    var stage = '';
                    str = (v.seasonType.name.toLowerCase());
                    if (str.includes('final') || str.includes('round') || str.includes('group'))
                        stage = v.seasonType.name; 

                    games.push({
                        name1: name1, name2: name2, date: v.date, score1: score1, score2: score2, logo1: logo1,
                        logo2: logo2, home: team1.id == team, league: v.league.shortName, stage: stage,
                        isOver: isOver, timeStatus: timeStatus
                    });
                })
                console.timeEnd('initData');
                res.send(games);
            }
        })
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
})

exports.app = functions.https.onRequest(app);