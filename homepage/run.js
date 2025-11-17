'use strict'
import { benchHomePage as Bench } from './benchHomePage.js';
const bench = new Bench({
  url : process.env.SOLID_URL,
});
bench.run();
