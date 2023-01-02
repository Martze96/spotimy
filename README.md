# Spotimy
Spotimy is a webapp that lets your party guest decide what songs are going to play next.
One device of the party is playing spotify music. The webapp communicates with spotify's web-api (via Playing Device's account) to add songs to the player queue
# setup

npm i in front and backend

# How can i make this work on my machine?

 For this you need a spotify developer account, register your app, and set the redirect links according to the IP the backend is running
 Also frontend needs to be addressing the IP the backend is running on.
 For this change the ADDRESS Constanst and the IS_PROD Variable accordingly to yours.


# run 
frontend: npm run dev
backend: npm start (nodemon script)

# Development (Learning) finished 
Tested out the deployment on vercel, using the app for a party. The app quickly crashed because of too much requests.
in last update I improved request performance alot (server does his own requests in a interval, client only get a variable value).
Tested it with while 10 Client are on the frontend, worked perfectly fine, but broke down again while adding a new song.
It has something to do with vercel's free tier limit or how the serverless functions work there. Behaviour seems like
if the server has to do a paralell request, it just crashes. Even though I already set Random Time ranges of the interval requests.


# 02.01.2022 Update
- Improved performance of requests
- refactoring

# 30.12.2022 Update
- added loading spinner on current song cover when initially loading the page

# 29.12.2022 Update
- fixed request fails!
- deleted alert when adding a song

# 26.12.2022 Update
- Scheduled a cron job that refreshes the access token every 57 minutes (only local)

# 24.12.2022 Update
- Handling weird vercel requests by not changing the list when nothing is in a response
- Search function: artist or song, artist and song

# 21.12.2022 Update
- Implemented Access Token Granting and Refreshing
- Switch Mode Prod URI and Local URI

# 18.12.2022 Update
- Success Alert if song got added
- Refresh rate faster
- Spotimy x Miller's Logo
- added logos to searchbar


# TODO
<del>
- Handle unstable vercel requests. If no response came back, then let the last state stay
    - try split useffect for song and queue
    - try above, increase request rate, spray and pray method
    - wrap everything with auth into functions (API Paths) that run on start
</del>
- clean code (demand)
- No song visualization (demand)
<del>- Only input Song or Artist (just learn to pass data in body or smth. stop using this url param) (core) </del>
- search by trackid (use share song link and grab link from url) (demand)
- assets to public for Readme (demand)
- animations f. ex. when adding a song (demand) (animista.net)
