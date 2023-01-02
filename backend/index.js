const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
var request = require('request');
const env = require('dotenv').config();
const cron = require('node-cron')
const SpotifyWebApi = require('spotify-web-api-node');
const generateRandomString = require('./helper');


const IS_PROD = true;
const LOCAL_REDIRECT_URI = 'http://192.168.0.67:3000/login';
const PROD_REDIRECT_URI = 'https://spotimy-backend.vercel.app/login';

app.use(cors());

/**
 * ************ HANDLE AUTH AND TOKEN *********************************
 */

// define scopes
let scopes = ['user-read-currently-playing', 'user-read-playback-state', 'user-modify-playback-state'],
    redirectUri = `${IS_PROD ? PROD_REDIRECT_URI : LOCAL_REDIRECT_URI}`,
    clientId = process.env.CLIENT_ID,
    clientSecret = process.env.CLIENT_SECRET,
    state = generateRandomString(16);

// initializing spotifyWebApi
let spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret
});

let CURRENT_SONG;
let CURRENT_QUEUE;



app.get("/auth", (req, res) => {
    // Create the authorization URL, redirect to it
    let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.redirect(authorizeURL)
})

// auth redirect uri handlerfunction
app.get('/login', function (req, res) {
    spotifyApi.authorizationCodeGrant(req.query.code).then(
        function (data) {
            if (data.statusCode === 200) {
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);
                res.send("successfully authenticated!")
            }
        },
        function (err) {
            console.log(err);
            res.send("Something went wrong :( - " + err)
        }
    );

});

app.get("/refresh-token", (req, res) => {
    spotifyApi.refreshAccessToken().then(
        function (data) {
            if (data.statusCode === 200) {
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);
                console.log(data.body);
                res.status(200).send("Token successfully refreshed.")
            }
        },
        function (err) {
            res.status(400).send("Redirecting error to client: " + err);
        });
})




// refresh token every hour (does not work as serverless function)

// cron.schedule('*/57 * * * *', () => {
//     if (!IS_PROD) {
//         refreshSpotifyToken();
//         console.log("CRONJOB Executed.")
//     }

// }) 

/****************SERVER INTERVAL JOBS *************************************** */

function getCurrentSong() {
    var options = {
        'method': 'GET',
        'url': 'https://api.spotify.com/v1/me/player/currently-playing?market=ES',
        'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${spotifyApi.getAccessToken()}`
        }
    };
    request(options, function (error, response) {
        if (error) { CURRENT_SONG = "Error while requesting spotify api"; console.log(error) };
        if (!response.body || !JSON.parse(response.body).is_playing) {
            CURRENT_SONG = "No Song is currently playing or is not available.";
        } else {
            let answer = response.body ? JSON.parse(response.body) : "No Song currently Playing.";
            let currentTrack;
            let songArtist = answer?.item?.artists[0]?.name ? answer.item.artists[0].name : "No Artist found.";
            let songName = answer?.item?.name ? answer.item.name : "No Songname found.";
            let songImage = answer?.item?.album?.images[0] ? answer.item.album.images[0].url : "No Image found.";
            currentTrack = [songArtist, songName, songImage];

            CURRENT_SONG = currentTrack;
        }
    });
}
setInterval(getCurrentSong, 4000);

function getQueue() {
    var options = {
        'method': 'GET',
        'url': 'https://api.spotify.com/v1/me/player/queue',
        'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${spotifyApi.getAccessToken()}`
        }
    };
    request(options, function (error, response) {
        if (error) {
            console.log(error);
            CURRENT_QUEUE = "could not get Queue. There was an Error";
        }
        let answer = response.body;
        answer = JSON.parse(answer);
        if (answer?.error || answer === "") {
            console.log("queue empty or not reachable...")
        } else {
            let queueTracks = [];
            for (let i = 0; i < Object.keys(answer.queue).length; i++) {
                let songName = answer.queue[i].name;
                let artistName = answer.queue[i].artists[0].name;
                let songImage = answer.queue[i].album.images[0].url;
                queueTracks.push({
                    artist: artistName,
                    name: songName,
                    image: songImage
                });
            }
            console.log("sending queue...")
            CURRENT_QUEUE = queueTracks;
        }

    });
}
setInterval(getQueue, 5000);

/*******************API********************************************* */

app.get("/", (req, res) => {
    res.send("Hi!, this is the Spotimy backend :)")
})

app.get("/getCurrentSong", (req, res) => {
    res.send(CURRENT_SONG);
})

/**
 * get Users Play Queue
 */
app.get("/getQueue", (req, res) => {
    res.send(CURRENT_QUEUE);
})

app.get("/search", (req, res) => {
    let name = req.query.songname;
    let artist = req.query.artist;
    console.log("searching song title " + name + " from " + artist);
    if (name === '' && artist === '') { res.status(400).send('No searchinput given.') }
    else {
        name = name ? name + "%20" : "";
        artist = artist ? "artist:" + artist : "";
        var options = {
            'method': 'GET',
            'url': `https://api.spotify.com/v1/search?q=${name}${artist}&type=track&limit=10`,
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${spotifyApi.getAccessToken()}`
            }
        };
        request(options, function (error, response) {
            if (error) { res.status(400).send(error); }
            let tracks = JSON.parse(response.body).tracks.items;
            let searchResult = [];
            for (let i = 0; i < tracks.length; i++) {
                searchResult.push({
                    artist: tracks[i].artists[0].name,
                    name: tracks[i].name,
                    image: tracks[i].album.images[0].url,
                    uri: tracks[i].uri
                })
            }
            console.log(searchResult);
            res.status(200).send(searchResult);
        });
    }
})

app.get("/addToQueue/:id", (req, res1) => {
    let songId = req.params.id;

    var options = {
        'method': 'GET',
        'url': `https://api.spotify.com/v1/me/player/devices`,
        'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${spotifyApi.getAccessToken()}`
        }
    };
    request(options, (err, res2) => {
        let deviceList = JSON.parse(res2.body).devices;
        let playingDevice = deviceList.find(device => device['is_active']);
        console.log(playingDevice);
        var options = {
            'method': 'POST',
            'url': `https://api.spotify.com/v1/me/player/queue?uri=${songId}&deviceId=${playingDevice}`,
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${spotifyApi.getAccessToken()}`
            }
        }
        request(options, (err, res3) => {
            if (err) { console.log(err); res1.send(null) } else {
                console.log("song added!");
                res1.send("song added!")

            }
        })
    })
})


app.listen(port, "192.168.0.67", () => {
    console.log(`Spotimy's backend listening on port ${port}`);
})

