'use strict'
import { benchWellKnown as Bench } from './benchWellKnown.js';
const bench = new Bench({
  url : process.env.SOLID_URL,
});
bench.run();
