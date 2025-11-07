'use strict'

const Bench = require('./benchHomePage.js');
const bench = new Bench({
  url : process.env.SOLID_URL,
});
bench.run();
