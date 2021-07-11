const functions = require('firebase-functions');
const { google } = require('googleapis');
var bodyParser = require('body-parser')
const faster = require('req-fast');
const express = require('express')
var firebase = require('firebase')
var cors = require('cors')
var fs = require('fs');
const app = express()

var firebaseConfig = {
    apiKey: "AIzaSyDvCJuvLuJl4UKgDuNeFQYPuKypcJN5GlI",
    authDomain: "football-games-project.firebaseapp.com",
    databaseURL: "https://football-games-project-default-rtdb.firebaseio.com",
    projectId: "football-games-project",
    storageBucket: "football-games-project.appspot.com",
    messagingSenderId: "1050505135501",
    appId: "1:1050505135501:web:6b902ff5e73cd6e3c9a9c4",
    measurementId: "G-F5LDPBQ1D6"
};

firebase.initializeApp(firebaseConfig)
let database = firebase.database()

app.use(cors());
var urlencodedParser = bodyParser.urlencoded({ extended: true })
app.use(urlencodedParser);
app.use(bodyParser.json());


app.get('/getGames/', function (req, res) {
    try {
        let games  = [];
        let team   = !req.query.team   ? '83'                     : req.query.team;
        let league = !req.query.league ? 'ESP.1'                  : req.query.league;
        let year   = !req.query.year   ? new Date().getFullYear() : req.query.year;

        var yearParam;
        if(year === 'Upcoming'){
            yearParam = '&fixture=true';
            league = 'ALL';
        }
        else{
            yearParam = '&season=' + year;
        }
        
        var options = {
            method: 'GET',
            url: "https://site.web.api.espn.com/apis/site/v2/sports/soccer/" + league + "/teams/" + team
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
                if (!body || !body.events) { res.send([]); return };
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

app.get('/getVideo/', function (req, res) {
    let teamsString = req.query.teamString;
    let score = req.query.score;
    let year = req.query.year;

    getVideo(teamsString, score, year).then(result => {
        const items = result.data.items;
        if (items.length > 0) {
            let videoId = items[0].id.videoId;
            res.send({ videoId: videoId });
        }
        else {
            res.send({ videoId: '' });
        }

    }).catch(err => {
        console.log(err);
        res.send(err);
    })
})

function getVideo(teamsString, score, year) {
    return google.youtube('v3').search.list({
        key: 'AIzaSyDr3Or2gSBGrmtoUdITCTtexGNmMAah__w',
        part: 'snippet',
        q: `${teamsString} ${score} ${year}`,
        maxResults: '1',
        order: 'relevance'
    });
}

app.get('/saveTeamsInFirebase/', function (req, appRes) {

    var countriesCodes = {};
    fs.readFile('codes.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        }
        var body = JSON.parse(data);
        Object.keys(body).forEach(v => countriesCodes[body[v]] = v);
    });

    var countries = {};
    var countriesNames = ['Spain', 'England', 'France', 'Germany', 'Italy'];
    var leagues        = ['ESP.1', 'ENG.1'  , 'FRA.1' , 'GER.1'  , 'ITA.1'];

    var PromiseArr = [];
    for (let i = 0; i < leagues.length; i++) {
        PromiseArr.push(promisesObj(leagues[i], countriesNames[i]));
    }

    Promise.all(PromiseArr).then(res => {
        for (r of res) {
            countries[r.name] = { teams: r.teams, league: r.league, code: countriesCodes[r.name] };
        }

        //Insert teams into firebase
        database.ref("countries/").set(countries, function (error) {
            if (error)
                appRes.send("Failed with error: " + error)
            else
                appRes.send("Teams added successfully!");
        })

    }).catch(err => {
        console.log(err);
        appRes.send("Failed with error: " + err)
    })
})

function promisesObj(league, country) {

    var options = {
        method: 'GET',
        url: "https://site.web.api.espn.com/apis/site/v2/sports/soccer/" + league
            + "/teams?region=us&lang=en&limit=10",
        json: true,
        responseType: 'json',
        headers: {
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8'
        }
    };

    return new Promise((resolve, reject) => {
        faster(options, (err, res) => {

            if (res) {
                var teams = res.body.sports[0].leagues[0].teams.map(v => { return { value: v.team.id, label: v.team.name } });
                var countryJson = { name: country, teams: teams, league: league };
                resolve(countryJson);
            }
        })
    })
}

//Get teams from firebase
app.get('/getTeams/', function (req, res) {
    var ref = database.ref('countries');
    console.time('startCountries');
    ref.once("value", function (snapshot) {
        console.timeEnd('startCountries');
        res.send(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
})

app.get('/countriesFlags/', async function (req, res) {
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

exports.app = functions.https.onRequest(app);

