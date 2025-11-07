'use strict'
const DEBUG = parseInt(process.env.DEBUG);

const autocannon = require('autocannon')
const crypto = require('crypto');

class benchConsent {
  constructor(options) {
    this.url = options.url;
    this.loginPath = options.loginPath ? options.loginPath : '/api/login/password';
    this.loginMethod = options.loginMethod ? options.loginMethod : 'POST';
    this.loginPostType = options.LoginPostType ? options.loginPostType : 'form';
    this.loginData = options.loginData;
    this.codeVerifier = this.base64URLEncode(crypto.randomBytes(32));
    this.codeChallenge = this.base64URLEncode(this.sha256(this.codeVerifier));
    this.authorizePath = options.authorizePath ? options.authorizePath : '/authorize';
    this.clientId = options.clientId ? options.clientId : 'example-client-id';
    this.redirectUri = options.redirectUri ? options.redirectUri : 'https://return.local';
    this.registerPath = options.registerPath ? options.registerPath : '/register';
    this.registerMethod = options.registerMethod ? options.registerMethod : 'POST';
    this.registerPostType = options.registerPostType ? options.registerPostType : 'json';
    this.registerData = options.registerData ? options.registerData : {
      "client_name": "Benchmark",
      "application_type": "web",
      "redirect_uris": [
        "https://return.local"
      ],
      "subject_type": "public",
      "token_endpoint_auth_method": "client_secret_basic",
      "id_token_signed_response_alg": "RS256",
      "grant_types": [
        "authorization_code",
        "refresh_token"
      ]
    };
    this.consentPath = options.consentPath ? options.consentPath : '/sharing';
    this.consentMethod = options.consentMethod ? options.consentMethod : 'POST';
    this.consentPostType = options.consentPostType ? options.consentPostType : 'form';
    this.consentGetData = options.consentGetData ? options.consentGetData : {
      "client_id" : "",
      "redirect_uri" : this.redirectUri,
      "response_type" : "code",
      "scope" : "openid offline_access",
      "state" : "687cc09749084eb79214cab3d206d73f",
      "code_challenge" : this.codeChallenge,
      "code_challenge_method" : "S256"
    };
    this.consentPostData = options.consentPostData ? options.consentPostData : {
      "access_mode" : "read",
      "redirect_uri" : this.redirectUri,
      "response_type" : "code",
      "scope" : "openid offline_access",
      "state" : "687cc09749084eb79214cab3d206d73f",
      "consent" : true
    };
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

  getConsentBody() {
    switch (this.consentPostType) {
      case 'form':
        var fields = [];
        var consentPostData = this.consentPostData;
        Object.keys(this.consentPostData).forEach(function(index) {
          fields.push(index + "=" + encodeURIComponent(consentPostData[index]));
        });
        return fields.join("&");
      break;
      case 'json':
        return JSON.stringify(this.consentPostData);
      break
      default:
        throw new Exception("Invalid post type, expecting 'json' or 'form'");
      break;
    }  
  }

  getConsentHeaders() {
    switch (this.consentPostType) {
      case 'form':
        return {
          'Cookie' : this.cookie,
          'Content-Type' : 'application/x-www-form-urlencoded'
        };
      break;
      case 'json':
        return {
          'Cookie' : this.cookie,
          'Content-Type' : 'application/json'
        };
      break;
      default:
        throw new Exception("Invalid post type, expecting 'json' or 'form'");
      break;
    }
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

module.exports = benchConsent;
