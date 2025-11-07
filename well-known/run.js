'use strict'

const Bench = require('./benchWellKnown.js');
const bench = new Bench({
  url : process.env.SOLID_URL,
});
bench.run();
