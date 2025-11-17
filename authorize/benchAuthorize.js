'use strict'
const DEBUG = parseInt(process.env.DEBUG);
import { default as autocannon } from 'autocannon';
import { benchBase } from '../lib/benchBase.js';

export class benchAuthorize extends benchBase {
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

    var cookie = await this.getLoginCookie();
    var clientRegistration = await this.getClientRegistration();
    var authorizePath = this.authorizePath + "?" + this.encodeGetVars({
      "client_id" : clientRegistration.client_id,
      "redirect_uri" : this.redirectUri,
      "response_type" : "code",
      "scope" : "openid offline_access",
      "state" : "687cc09749084eb79214cab3d206d73f",
      "code_challenge" : this.codeChallenge,
      "code_challenge_method" : "S256"
    });

    const instance = autocannon({
      url: this.url,
      connections: process.env.AUTOCANNON_CONNECTIONS,
      duration: process.env.AUTOCANNON_DURATION,
      overallRate: process.env.AUTOCANNON_OVERALL_RATE,
      // workers: 1,
      requests: [
        {
          method: 'GET',
          path: authorizePath,
          setupRequest: function(request, context) {
            request.headers = {
              "Cookie" : cookie
            };
            if (DEBUG) {
              console.log("----setupRequest authorize----");
              console.log(request);
              console.log(context);
              console.log("----------");
            }
            return request;
          },
          onResponse: function (status, body, context, headers) {
            if (DEBUG) {
              console.log("----on response authorize----");
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
