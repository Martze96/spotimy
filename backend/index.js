const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
var request = require('request');
const env = require('dotenv').config();

const SpotifyWebApi = require('spotify-web-api-node');

const IS_PROD = true;
const LOCAL_REDIRECT_URI = 'http://192.168.0.67:3000/login';
const PROD_REDIRECT_URI = 'https://spotimy-backend.vercel.app/login';

let access_token = "";
let expires_in = "";

app.use(cors());

/**
 * ************ HANDLE AUTH AND TOKEN *********************************
 */


var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

var scopes = ['user-read-currently-playing', 'user-read-playback-state', 'user-modify-playback-state'],
    redirectUri = `${IS_PROD ? PROD_REDIRECT_URI : LOCAL_REDIRECT_URI}`,
    clientId = process.env.CLIENT_ID,
    clientSecret = process.env.CLIENT_SECRET,
    state = generateRandomString(16);

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret
});

// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
console.log(authorizeURL);

let code;
app.get('/login', function (req, res) {
    code = req.query.code;
    console.log(code);

    spotifyApi.authorizationCodeGrant(code).then(
        function (data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);
            current_access_token = data.body["access_token"];
            expires_in = data.body['expires_in'];

            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
            res.send("successfully authenticated!")
        },
        function (err) {
            console.log(code);
            console.log('Something went wrong!', err);
            res.send("Something went wrong :(")
        }
    );

});

app.get("/getAuthUrl", (req, res) => {
    res.send(authorizeURL)
})

app.get("/authstatus", (req, res) => {
    res.send(`Authentification Info: ACCESS-TOKEN EXPIRES IN: ${expires_in}`);
})

// clientId, clientSecret and refreshToken has been set on the api object previous to this call.
function refreshSpotifyToken() {
    spotifyApi.refreshAccessToken().then(
        function (data) {
            console.log('The access token has been refreshed!');

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The token expires in ' + data.body['expires_in']);
        },
        function (err) {
            console.log('Could not refresh access token', err);
        });
};

app.get("/refreshToken", (req, res) => {
    refreshSpotifyToken();
    res.send("Refreshed token")
})

/*******************API********************************************* */

app.get("/", (req, res) => {
    res.send("Hi!, this is the Spotimy backend :)")
})

app.get("/getCurrentSong", (req, res) => {

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
        if (error) throw new Error(error);
        if (!response.body || !JSON.parse(response.body).is_playing) {
            res.send("No Song is currently playing or is not available.")
        } else {
            let answer = response.body ? JSON.parse(response.body) : "No Song currently Playing.";
            let currentTrack;
            let songArtist = answer?.item?.artists[0]?.name ? answer.item.artists[0].name : "No Artist found.";
            let songName = answer?.item?.name ? answer.item.name : "No Songname found.";
            let songImage = answer?.item?.album?.images[0] ? answer.item.album.images[0].url : "No Image found.";
            currentTrack = [songArtist, songName, songImage];

            res.send(currentTrack);
        }

    });
})

/**
 * get Users Play Queue
 */
app.get("/getQueue", (req, res) => {
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
            response.send("could not get Queue. There was an Error")
        }
        let answer = response.body;
        answer = JSON.parse(answer);
        if (answer?.error || answer === "") {
            console.log("queue empty or not reachable...")
            res.send("Queue is currently empty.");
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
            res.send(queueTracks);
        }

    });
})

app.get("/search", (req, res) => {
    console.log(req.url);
    let name = req.query.songname;
    let artist = req.query.artist;
    console.log(req.query);
    if (!name && !artist) { res.status(404).send('No searchinput given.') }
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
            if (error) throw new Error(error);
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

