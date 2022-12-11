const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
var request = require('request');
const config = require("./config");

app.use(cors());


/*
const spotifyApi = new SpotifyWebApi({
    clientId: 'e2c1897e211042d599791c8c16304b64',
    clientSecret: 'b10e6b2e558949579df8c10640afa51d',
});
spotifyApi.setAccessToken("BQBS1rbAArovLHTpYO91Lk9WQUilpfuYdUL8rK5PIYYe4YuiPa2UXWQhZ");
*/


app.get("/getCurrentSong", (req, res) => {

    var options = {
        'method': 'GET',
        'url': 'https://api.spotify.com/v1/me/player/currently-playing?market=ES',
        'headers': {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.ACCESS_TOKEN_CURRENTSONG}`
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log("AB HIER!!   : ", JSON.parse(response.body));
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
            'Authorization': `Bearer ${config.ACCESS_TOKEN_GETQUEUE}`
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        let answer = response.body;
        answer = JSON.parse(answer);
        if (answer.queue.length < 1) {
            res.send("Queue is currently empty.");
        } else {
            let queueTracks = [];
            for (let i = 0; i < Object.keys(answer).length; i++) {
                let songName = answer.queue[i].name;
                let artistName = answer.queue[i].artists[0].name;
                let songImage = answer.queue[i].album.images[0].url;
                queueTracks.push({
                    artist: artistName,
                    name: songName,
                    image: songImage
                });
            }
            res.send(queueTracks);
        }

    });
})


app.listen(port, "192.168.0.67", () => {
    console.log(`Spotimy's backend listening on port ${port}`);
})

