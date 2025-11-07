'use strict'
const DEBUG = parseInt(process.env.DEBUG);

class benchRegister {
  constructor(options) {
    this.url = options.url;
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
          method: this.registerMethod,
          path: this.registerPath,
          headers: this.getRegisterHeaders(),
          body: this.getRegisterBody(),
          setupRequest: function(request, context) {
            if (DEBUG) {
              console.log("----setupRequest register----");
              console.log(request);
              console.log(context);
              console.log("----------");
            }
            return request;
          },
          onResponse: function (status, body, context, headers) {
            if (DEBUG) {
              console.log("----on response register----");
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

module.exports = benchRegister;
