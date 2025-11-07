'use strict'
const Bench = require('./benchConsent.js');
const bench = new Bench({
  url : process.env.SOLID_URL,
  loginData : {
    'username' : process.env.SOLID_USERNAME,
    'password' : process.env.SOLID_PASSWORD
  },
  loginPath : process.env.SOLID_LOGIN_PATH,
  loginPostType : process.env.SOLID_LOGIN_TYPE,
  loginMethod : process.env.SOLID_LOGIN_METHOD
});

bench.run();
