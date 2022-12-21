# Spotimy
Spotimy is a webapp that lets your party guest decide what songs are going to play next.
One device of the party is playing spotify music. The webapp communicates with spotify's web-api (via Playing Device's account) to add songs to the player queue
# setup

npm i in front and backend

Copy the access token from the following sites and paste it in the method the backend function is using

## Auth scopes u need:
 * current song: user-read-currently-playing
 * getqueue: user-read-playback-state
 * setqueue: user-modify-playback-state
 * search: no scope

# run 
frontend: npm run dev
backend: npm start (nodemon script)

# 21.12.2022 Update
- Implemented Access Token Granting and Refreshing
- Switch Mode Prod URI and Local URI

# 18.12.2022 Update
- Success Alert if song got added
- Refresh rate faster
- Spotimy x Miller's Logo
- added logos to searchbar


# TODO
- No song visualization
- Only input Song or Artist
- search by trackid (use share song link and grab link from url)
- Add assets to public folder(then you can add them to readme )
- get access and token
    -> build grant access in frontend
    -> save access Token and make Requests with it (server has to use it in Requests)
    -> save refresh token, set interval? and server should make requests to get new Token
