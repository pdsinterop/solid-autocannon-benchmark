'use strict'
const DEBUG = parseInt(process.env.DEBUG);
import { default as autocannon } from 'autocannon';
import { benchBase } from '../lib/benchBase.js';

export class benchConsent extends benchBase {
  constructor(options) {
    super(options);
  }

  async run(url) {
    var cookie = await this.getLoginCookie();
    var clientRegistration = await this.getClientRegistration();
    this.clientRegistration = clientRegistration;
    this.cookie = cookie;
    this.consentGetData.client_id = clientRegistration.client_id;

    var consentMethod = this.consentMethod;
    var consentPath = this.consentPath + "?" + this.encodeGetVars(this.consentGetData);
    var consentBody = this.getConsentBody();
    var consentHeaders = this.getConsentHeaders();

    const instance = autocannon({
      url: this.url,
      connections: process.env.AUTOCANNON_CONNECTIONS,
      duration: process.env.AUTOCANNON_DURATION,
      overallRate: process.env.AUTOCANNON_OVERALL_RATE,
      // workers: 1,
      requests: [
        {
          method: consentMethod,
          path: consentPath,
          body: consentBody,
          setupRequest: function(request, context) {
            request.headers = consentHeaders;
            if (DEBUG) {
              console.log("----setupRequest consent----");
              console.log(request);
              console.log(context);
              console.log("----------");
            }
            return request;
          },
          onResponse: function (status, body, context, headers) {
            if (DEBUG) {
              console.log("----on response consent----");
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
