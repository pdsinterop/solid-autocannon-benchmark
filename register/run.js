'use strict'
import { benchRegister as Bench } from './benchRegister.js';
const bench = new Bench({
  url : process.env.SOLID_URL,
});

bench.run();
