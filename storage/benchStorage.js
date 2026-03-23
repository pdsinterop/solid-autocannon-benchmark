'use strict'
const DEBUG = parseInt(process.env.DEBUG);
import { default as autocannon } from 'autocannon';
import { benchBase } from '../lib/benchBase.js';
import * as n3 from 'n3';
const { DataFactory } = n3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;

export class benchStorage extends benchBase {
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
    this.token = await this.getToken();

    this.tokenJwt = JSON.parse(atob(this.token['access_token'].split('.')[1]));
    this.profileUrl = this.tokenJwt['sub'].split('#')[0];
    this.profile = await this.getProfile();

    var parser = new n3.Parser({ baseIRI: this.profileUrl });
    var profileData = parser.parse(this.profile);
    var storageUrl = '';
    profileData.forEach(function(quad) {
      if (quad.predicate.value === 'http://www.w3.org/ns/pim/space#storage') {
        storageUrl = quad.object.value;
      }
    });
    this.storageUrl = storageUrl;
    var storageHeaders = await this.getStorageHeaders(this.storageUrl);

    const instance = autocannon({
      url: this.storageUrl,
      connections: process.env.AUTOCANNON_CONNECTIONS,
      duration: process.env.AUTOCANNON_DURATION,
      overallRate: process.env.AUTOCANNON_OVERALL_RATE,
      // workers: 1,
      requests: [
        {
          method: 'GET',
          setupRequest: function(request, context) {
            request.headers = storageHeaders;
            if (DEBUG) {
              console.log("----setupRequest storage----");
              console.log(request);
              console.log(context);
              console.log("----------");
            }
            return request;
          },
          onResponse: function (status, body, context, headers) {
            if (DEBUG) {
              console.log("----on response storage----");
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
