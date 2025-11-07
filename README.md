# Autocannon benchmark

This repo contains benchmarking / load testing scripts for Solid servers. The tests are created using autocannon.

## Installation
```
npm install
```

## Setup the environment
```
cp env.example .env
```
Edit the file and add the appropriate values for your setup

## Running a test
```
node --env-file=.env ./login/run.js
```

## Available tests:

- [x] fetching static html
- [x] fetching .well-known
- [x] client registration
- [x] login
- [x] consent
- [x] authorize
- [x] token exchange
- [x] solid profile card
- [ ] fetch things from storage

## Quick overview
```
node --env-file=.env ./homepage/run.js
node --env-file=.env ./well-known/run.js
node --env-file=.env ./register/run.js
node --env-file=.env ./login/run.js
node --env-file=.env ./consent/run.js
node --env-file=.env ./authorize/run.js
node --env-file=.env ./token/run.js
node --env-file=.env ./profile/run.js
```
