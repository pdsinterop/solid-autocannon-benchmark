# Autocannon benchmark

This repo contains benchmarking / load testing scripts for Solid servers. The tests are created using autocannon.
The code uses the DPoP flow for authorization and tokens.

The benchmark has been tested against the following server implementations:
- PHP Solid Serve
- Solid Nextcloud
- Node solid server

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
- [x] fetch things from storage

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
node --env-file=.env ./storage/run.js
```

# Notes

## Do not run without consent
Running these benchmarks is not a friendly thing to do on servers
outside of your own control. Depending on the configuration, autocannon can
open a lot of connections which is needed to benchmark the performance of
the server.

## Benchmark = hardware performance

Running a benchmark on a Solid installation will give some insight on how
many requests per second a given setup can handle. It is aimed to compare
and improve the performance of a given deployment.

It can give some insights on how fast the software itself is, but keep in
mind that the comparisons only make sense if they are running on similar
hardware in similar circumstances.

# Funding
<p>
  This project was funded through the <a href="https://nlnet.nl/core">NGI0 Core</a> Fund, established by <a href="https://nlnet.nl">NLnet</a> with financial support from the European Commiss
ion's <a href="https://ngi.eu">Next Generation Internet</a> programme. 
  Learn more at the <a href="https://nlnet.nl/project/Solid-NC/">NLnet project page</a>
</p>
<p>
  <a href="https://nlnet.nl"><img height="64" alt="NLNet logo" src="https://nlnet.nl/logo/banner.svg"></a>
  <a href="https://nlnet.nl/core"><img height="64" alt="NGI0 Core logo" src="https://nlnet.nl/image/logos/NGI0Core_tag.svg"></a>
  <a href="https://ec.europa.eu/"><img height="64" alt="European Commision logo" src="https://nlnet.nl/image/logos/EC.svg"></a>
</p>
