'use strict'
const DEBUG = parseInt(process.env.DEBUG);
const crypto = require('crypto');

class benchBase {
  constructor(options) {
    this.url = options.url;
    this.homePagePath = options.homePagePath ? options.homePagePath : '/';
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
      "access_mode" : "control",
      "redirect_uri" : this.redirectUri,
      "response_type" : "code",
      "scope" : "openid offline_access",
      "state" : "687cc09749084eb79214cab3d206d73f",
      "consent" : true
    };
    this.tokenPath = options.tokenPath ? options.tokenPath : '/token';
    this.tokenMethod = options.tokenMethod ? options.tokenMethod : 'POST';
    this.tokenPostType = options.tokenPostType ? options.tokenPostType : 'json';
    this.tokenData = {
      "client_id" : "",
      "redirect_uri" : this.redirectUri,
      "grant_type" : "authorization_code",
      "code" : "",
      "code_verifier" : this.codeVerifier
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
    if (process.env.SOLID_LOGIN_COOKIE && process.env.SOLID_LOGIN_COOKIE.length > 0) {
      return process.env.SOLID_LOGIN_COOKIE;
    }

    let response = fetch(this.url + this.loginPath, {
        method: this.loginMethod,
        body: this.getLoginBody(),
        headers: this.getLoginHeaders(),
        redirect: "manual"
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

  async getWellKnown() {
    let response = fetch(this.url + this.wellKnownPath)
    .then(function(response) {
      return response.json();
    });
    return await response;
  }

  async getClientRegistration() {
    let response = fetch(this.url + this.registerPath, {
        method: this.registerMethod,
        body: this.getRegisterBody(),
        headers: this.getRegisterHeaders(),
        redirect: "manual"
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

  getConsentPath() {
    this.consentGetData.client_id = this.clientRegistration.client_id;
    let consentPath = this.consentPath + "?" + this.encodeGetVars(this.consentGetData);
    return consentPath;
  }
  
  async getConsent() {
    var consentMethod = this.consentMethod;
    var consentPath = this.getConsentPath();
    var consentBody = this.getConsentBody();
    var consentHeaders = this.getConsentHeaders();

    let response = fetch(this.url + consentPath, {
        method: this.consentMethod,
        body: this.getConsentBody(),
        headers: this.getConsentHeaders(),
        redirect: "manual"
    })
    .then(async function(response) {
      let body = await response.text();
      return body;
    });
    let consent = await response;
    return consent;
  }

  getAuthorizeHeaders() {
    return {
      'Cookie' : this.cookie,
    };
  }

  async getAuthorizeCode() {
    var authorizePath = this.authorizePath + "?" + this.encodeGetVars({
      "client_id" : this.clientRegistration.client_id,
      "redirect_uri" : this.redirectUri,
      "response_type" : "code",
      "scope" : "openid offline_access",
      "state" : "687cc09749084eb79214cab3d206d73f",
      "code_challenge" : this.codeChallenge,
      "code_challenge_method" : "S256"
    });

    return await fetch(this.url + authorizePath, {
        headers: this.getAuthorizeHeaders(),
        redirect: "manual"
    })
    .then(async function(response) {
      return response.headers.get('Location').split("code=")[1].split("&")[0];
    });
  }

  getTokenBody() {
    this.tokenData['client_id'] = this.clientRegistration.client_id;
    this.tokenData['code'] = this.code;

    switch (this.tokenPostType) {
      case 'form':
        var fields = [];
        var tokenData = this.tokenData;
        Object.keys(this.tokenData).forEach(function(index) {
          fields.push(index + "=" + encodeURIComponent(tokenData[index]));
        });
        return fields.join("&");
      break;
      case 'json':
        return JSON.stringify(this.tokenData);
      break
      default:
        throw new Exception("Invalid post type, expecting 'json' or 'form'");
      break;
    }  
  }

  getTokenHeaders() {
    switch (this.tokenPostType) {
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

  async getToken() {
    var tokenPath = this.tokenPath;
    var tokenMethod = this.tokenMethod;
    var tokenHeaders = this.getTokenHeaders();
    var tokenBody = this.getTokenBody();

    return await fetch(this.url + tokenPath, {
        method: tokenMethod,
        headers: tokenHeaders,
        redirect: "manual",
        body: tokenBody
    })
    .then(async function(response) {
      return response.json()
    });
  }

  getProfileHeaders() {
    return {
      "Authorization" : "Bearer " + this.token['access_token']
    };
  }
  
  async getProfile() {
    var profileHeaders = this.getProfileHeader();
    return await fetch(this.profileUrl, {
        headers: profileHeaders
    })
    .then(async function(response) {
      return response.text()
    });
  }
}

module.exports = benchBase;
