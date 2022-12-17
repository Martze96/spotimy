# spotimy

# setup

npm i in front and backend

Copy the access token from the following sites and paste it in the method the backend function is using

get current song: https://developer.spotify.com/console/get-users-currently-playing-track/?market=&additional_types=
get User Queue: https://developer.spotify.com/console/get-queue/
Add Item to Playback Queue: https://developer.spotify.com/console/get-queue/

## Auth scopes u need:
 * current song: user-read-currently-playing
 * getqueue: user-read-playback-state
 * setqueue: user-modify-playback-state
 * search: no scope

# run 
frontend: npm run dev
backend: node index.js