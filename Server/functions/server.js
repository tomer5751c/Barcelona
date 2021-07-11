const functions = require('firebase-functions');
const express = require('express')
const app = express()
var fs = require('fs');
var cors = require('cors')
var firebase = require('firebase')
const faster = require('req-fast');
var bodyParser = require('body-parser')
const { google } = require('googleapis');

// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb+srv://tomerc:5751tomC*@my-db-o26ig.mongodb.net/test?retryWrites=true&useNewUrlParser=true";
// var dbo;
// const port = 3000

app.use(cors());
var urlencodedParser = bodyParser.urlencoded({ extended: true })
app.use(urlencodedParser);
app.use(bodyParser.json());

// function connect_To_Mongo_db() {
//     return new Promise((resolve, reject) => {
//         MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
//             if (err)
//                 reject(err);
//             else {
//                 dbo = db.db("my_database");
//                 resolve(dbo);
//             }
//         })
//     });
// }

// function insert_To_Db(data) {
//     connect_To_Mongo_db().then((result) => {
//         if (dbo) {
//             dbo.collection("customers").insertOne(data, function (err, res) {
//                 if (err) {
//                     console.log(err);
//                     throw err
//                 }
//                 else {
//                     return res;
//                 }
//             });
//         }
//     });
// }

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

app.get('/getGames/', function (req, res) {
    try {
        let games = [];
        let team   = !req.query.team   ? '83'                     : req.query.team;
        let league = !req.query.league ? 'ESP.1'                  : req.query.league;
        let year   = !req.query.year   ? new Date().getFullYear() : req.query.year;

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

app.get('/getVideo/', function (req, res) {
    console.log(req.query);
    let teamsString = req.query.teamString;
    let score = req.query.score;
    let year = req.query.year;
    console.log('score:', score);
    console.log('teamsString:', teamsString);

    getVideo(teamsString, score, year).then(result => {
        console.log('here');
        const items = result.data.items;
        if (items.length > 0) {
            let videoId = items[0].id.videoId;
            console.log(videoId);
            res.send({ videoId: videoId });
        }
        else {
            console.log('empty');
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

app.get('/teamIds/', function (req, res) {
    var options = {
        method: 'GET',
        url: "https://site.web.api.espn.com/apis/site/v2/sports/soccer/ESP.1/teams?region=us&lang=en&limit=20",
        json: true,
        responseType: 'json',
        headers: {
            'Connection': 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8'
        }
    };
    var teams = [];
    faster(options, (err, res) => {
        if (res) {
            teams = res.body.sports[0].leagues[0].teams.map(v => { return { id: v.team.id, name: v.team.name } }
            );
            console.log(teams);
        }

        //Insert teams into firebase
        database.ref("teams/").set(teams, function (error) {
            if (!error) {
                appRes.send("Teams added successfully")
            } else {
                appRes.send("Failed with error: " + error)
            }
        })
    })
})

exports.app = functions.https.onRequest(app);

//app.listen(port, () => console.log(`Example app listening on port ${port}!`))


