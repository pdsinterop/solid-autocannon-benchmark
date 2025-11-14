#!/bin/sh
echo "Homepage";
node --env-file=.env ./homepage/run.js
echo "Well-known";
node --env-file=.env ./well-known/run.js
echo "Register";
node --env-file=.env ./register/run.js
echo "Login";
node --env-file=.env ./login/run.js
echo "Consent";
node --env-file=.env ./consent/run.js
echo "Authorize";
node --env-file=.env ./authorize/run.js
echo "Token";
node --env-file=.env ./token/run.js
echo "Profile";
node --env-file=.env ./profile/run.js
echo "Storage";
node --env-file=.env ./storage/run.js
