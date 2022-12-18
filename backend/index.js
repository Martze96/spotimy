const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
var request = require('request');
const env = require('dotenv').config();
const REDIRECT_URL = 'https://spotimy-backend.vercel.app/callback'
const REFRESHTOKEN = "";
let ANSWER = "";

app.use(cors());

// Refreshing only works with a public link, so first vercel, then try this
async function getRefreshToken() {
    let scope = "user-read-currently-playing user-read-playback-state user-modify-playback-state";
    let options = {
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URL
    }
    request('https://accounts.spotify.com/authorize?' + JSON.stringify(options));
}

app.get('/getToken', function (req, res) {
    getRefreshToken();
    res.send("okay i did, now /showMessage for the message")
})

app.get('/showMessage', (req, res) => {
    res.send(ANSWER);
})


app.get('/callback', function (req, res) {

    var code = req.query.code || null;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: REDIRECT_URL,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
        },
        json: true
    };
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            console.log(response);
            console.log(access_token);
            ANSWER = body;
            res.send({
                'access_token': access_token,
                'spotify answer': body
            });
        } else { res.send("Spotify Error: " + error); console.log("Error from Spotify: " + error) }
    });

});





app.get("/getCurrentSong", (req, res) => {

    var options = {
        'method': 'GET',
        'url': 'https://api.spotify.com/v1/me/player/currently-playing?market=ES',
        'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
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
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
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

app.get("/search/?:name/?:artist", (req, res) => {
    let name = req.params.name;
    let artist = req.params.artist;
    console.log(req.params);
    if (!name && !artist) { res.status(404).send('No searchinput given.') }
    else {
        name = name ? "%20" + name : "";
        artist = artist ? "%20artist:" + artist : "";
        var request = require('request');
        var options = {
            'method': 'GET',
            'url': `https://api.spotify.com/v1/search?q=${name}${artist}&type=track&limit=10`,
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
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

app.get("/addToQueue/:id", (req, res) => {
    let songId = req.params.id;

    var options = {
        'method': 'GET',
        'url': `https://api.spotify.com/v1/me/player/devices`,
        'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
        }
    };
    request(options, (err, res) => {
        let deviceList = JSON.parse(res.body).devices;
        let playingDevice = deviceList.find(device => device['is_active']);
        console.log(playingDevice);
        var options = {
            'method': 'POST',
            'url': `https://api.spotify.com/v1/me/player/queue?uri=${songId}&deviceId=${playingDevice}`,
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
            }
        }
        request(options, (err, res) => {
            if (err) { console.log(err) } else {
                console.log("song added!");
            }
        })
    })
})


app.listen(port, "192.168.0.67", () => {
    console.log(`Spotimy's backend listening on port ${port}`);
})

