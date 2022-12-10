const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
var request = require('request');

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
            'Authorization': 'Bearer BQDbGRaytJOixM7YhDB6qBZ8wVS8ibDGAXLO4pJKkk-zr82kRTh7gmsfNFo13ESMZSbHvMJFJxAE_kc0Byox1BPSmeVhi-UewJYi_pZ3qo5Iu-hgFtc0Xo-Gix3e5IxXDGtcsRATYqAp6mDFYou2SY2ENnNLvGDTkW3MzaXfBhHLthUWVku1gRgeRcMUIiCN9eVePRyolUSEGC0'
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);

        let answer = JSON.parse(response.body);
        let currentTrack;
        let songArtist = answer?.item?.artists[0]?.name ? answer.item.artists[0].name : "No Artist found.";
        let songName = answer?.item?.name ? answer.item.name : "No Songname found.";
        let songImage = answer?.item?.album?.images[0] ? answer.item.album.images[0].url : "No Image found.";
        currentTrack = [songArtist, songName, songImage];

        res.send(currentTrack);
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
            'Authorization': 'Bearer BQDbGRaytJOixM7YhDB6qBZ8wVS8ibDGAXLO4pJKkk-zr82kRTh7gmsfNFo13ESMZSbHvMJFJxAE_kc0Byox1BPSmeVhi-UewJYi_pZ3qo5Iu-hgFtc0Xo-Gix3e5IxXDGtcsRATYqAp6mDFYou2SY2ENnNLvGDTkW3MzaXfBhHLthUWVku1gRgeRcMUIiCN9eVePRyolUSEGC0'
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        let answer = response.body;
        answer = JSON.parse(answer);
        let queueTracks = [];
        console.log(answer);
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
        console.log(queueTracks);
        res.send(queueTracks);
    });
})


app.listen(port, "192.168.0.67", () => {
    console.log(`Spotimy's backend listening on port ${port}`);
})

