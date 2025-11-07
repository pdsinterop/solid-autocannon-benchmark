'use strict'
const DEBUG = parseInt(process.env.DEBUG);

class benchWellKnown {
  constructor(options) {
    this.url = options.url;
    this.wellKnownPath = options.wellKnownPath ? options.wellKnownPath : '/.well-known/openid-configuration';
  }
  
  run(url) {
    const autocannon = require('autocannon')

    const instance = autocannon({
      url: this.url,
      connections: process.env.AUTOCANNON_CONNECTIONS,
      duration: process.env.AUTOCANNON_DURATION,
      overallRate: process.env.AUTOCANNON_OVERALL_RATE,
      // workers: 1,
      requests: [
        {
          method: 'GET',
          path: this.wellKnownPath,
          setupRequest: function(request, context) {
            if (DEBUG) {
              console.log("----setupRequest well-known----");
              console.log(request);
              console.log(context);
              console.log("----------");
            }
            return request;
          },
          onResponse: function (status, body, context, headers) {
            if (DEBUG) {
              console.log("----on response well-known----");
              console.log(status);
              console.log(body);
              console.log(context);
              console.log(headers);
              console.log("----------");
            }
          }
        }
      ]
    }, this.finishedBench)

    autocannon.track(instance, {renderProgressBar: true})
  }
  
  finishedBench(err, res) {
    if (DEBUG) {
      console.log('finished bench', err, res)
    }
  }
}

module.exports = benchWellKnown;
