'use strict'
const DEBUG = parseInt(process.env.DEBUG);
const autocannon = require('autocannon')
const crypto = require('crypto');

class benchAuthorize {
  constructor(options) {
    this.url = options.url;
    this.loginPath = options.loginPath ? options.loginPath : '/api/login/password';
    this.loginMethod = options.loginMethod ? options.loginMethod : 'POST';
    this.loginPostType = options.LoginPostType ? options.loginPostType : 'form';
    this.loginData = options.loginData;
    this.codeVerifier = this.base64URLEncode(crypto.randomBytes(32));
    this.codeChallenge = this.base64URLEncode(this.sha256(this.codeVerifier));
    this.redirectUri = options.redirectUri ? options.redirectUri : 'https://return.local';
    this.registerMethod = options.registerMethod ? options.registerMethod : 'POST';
    this.registerPostType = options.registerPostType ? options.registerPostType : 'json';
    this.registerData = options.registerData ? options.registerData : {
      "client_name": "Benchmark",
      "application_type": "web",
      "redirect_uris": [
        this.redirectUri
      ],
      "subject_type": "public",
      "token_endpoint_auth_method": "client_secret_basic",
      "id_token_signed_response_alg": "RS256",
      "grant_types": [
        "authorization_code",
        "refresh_token"
      ]
    };
    this.wellKnownPath = options.wellKnownPath ? options.wellKnownPath : '/.well-known/openid-configuration';
  }

  encodeGetVars(vars) {
    var fields = [];
    Object.keys(vars).forEach(function(index) {
      fields.push(index + "=" + encodeURIComponent(vars[index]));
    });
    return fields.join("&");
  }

  getLoginBody() {
    switch (this.loginPostType) {
      case 'form':
        return this.encodeGetVars(this.loginData);
      break;
      case 'json':
        return JSON.stringify(this.loginData);
      break
      default:
        throw new Exception("Invalid post type, expecting 'json' or 'form'");
      break;
    }
  }

  getLoginHeaders() {
    switch (this.loginPostType) {
      case 'form':
        return {
          'Content-Type' : 'application/x-www-form-urlencoded'
        };
      break;
      case 'json':
        return {
          'Content-Type' : 'application/json'
        };
      break;
      default:
        throw new Exception("Invalid post type, expecting 'json' or 'form'");
      break;
    }
  }

  async getLoginCookie() {
    let response = fetch(this.url + this.loginPath, {
        method: this.loginMethod,
        body: this.getLoginBody(),
        headers: this.getLoginHeaders()
    })
    .then(async function(response) {
      let body = await response.text();
      if (DEBUG) {
        console.log(body);
      }
      return response.headers.getSetCookie();
    });
    let cookie = await response;
    cookie = cookie[0].split(";")[0] + ";";
    return cookie;
  }

  async getClientRegistration() {
    let response = fetch(this.url + this.registerPath, {
        method: this.registerMethod,
        body: this.getRegisterBody(),
        headers: this.getRegisterHeaders()
    })
    .then(function(response) {
      return response.json();
    });
    return await response;
  }

  async getWellKnown() {
    let response = fetch(this.url + this.wellKnownPath)
    .then(function(response) {
      return response.json();
    });
    return await response;
  }

  base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
  }

  sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
  }

  getRegisterBody() {
    switch (this.registerPostType) {
      case 'form':
        var fields = [];
        var registerData = this.registerData;
        Object.keys(this.registerData).forEach(function(index) {
          fields.push(index + "=" + encodeURIComponent(registerData[index]));
        });
        return fields.join("&");
      break;
      case 'json':
        return JSON.stringify(this.registerData);
      break
      default:
        throw new Exception("Invalid post type, expecting 'json' or 'form'");
      break;
    }
  }

  getRegisterHeaders() {
    switch (this.registerPostType) {
      case 'form':
        return {
          'Content-Type' : 'application/x-www-form-urlencoded'
        };
      break;
      case 'json':
        return {
          'Content-Type' : 'application/json'
        };
      break;
      default:
        throw new Exception("Invalid post type, expecting 'json' or 'form'");
      break;
    }
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

module.exports = benchAuthorize;
