'use strict'
const DEBUG = parseInt(process.env.DEBUG);
import { default as autocannon } from 'autocannon';
import { benchBase } from '../lib/benchBase.js';

export class benchToken extends benchBase {
  constructor(options) {
    super(options);
  }

  async run(url) {
    var wellKnown = await this.getWellKnown();
    if (DEBUG) {
      console.log(wellKnown);
    }
    this.authorizePath = wellKnown.authorization_endpoint.replace(this.url, '');
    this.registerPath = wellKnown.registration_endpoint.replace(this.url, '');
    this.tokenPath = wellKnown.token_endpoint.replace(this.url, '');
    this.cookie = await this.getLoginCookie();
    this.clientRegistration = await this.getClientRegistration();
    await this.getConsent();
    this.code = await this.getAuthorizeCode();

    var tokenPath = this.tokenPath;
    var tokenMethod = this.tokenMethod;
    var tokenHeaders = this.getTokenHeaders();
    var tokenBody = this.getTokenBody();

    const instance = autocannon({
      url: this.url,
      connections: process.env.AUTOCANNON_CONNECTIONS,
      duration: process.env.AUTOCANNON_DURATION,
      overallRate: process.env.AUTOCANNON_OVERALL_RATE,
      // workers: 1,
      requests: [
        {
          method: tokenMethod,
          path: tokenPath,
          body: tokenBody,
          setupRequest: function(request, context) {
            request.headers = tokenHeaders;
            if (DEBUG) {
              console.log("----setupRequest token----");
              console.log(request);
              console.log(context);
              console.log("----------");
            }
            return request;
          },
          onResponse: function (status, body, context, headers) {
            if (DEBUG) {
              console.log("----on response token----");
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
