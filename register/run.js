'use strict'
const Bench = require('./benchRegister.js');
const bench = new Bench({
  url : process.env.SOLID_URL,
});

bench.run();
