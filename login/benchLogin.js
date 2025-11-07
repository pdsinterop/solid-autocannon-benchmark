'use strict'
const DEBUG = parseInt(process.env.DEBUG);

class benchLogin {
  constructor(options) {
    this.url = options.url;
    this.loginPath = options.loginPath ? options.loginPath : '/api/login/password';
    this.loginMethod = options.loginMethod ? options.loginMethod : 'POST';
    this.loginPostType = options.loginPostType ? options.loginPostType : 'form';
    this.loginData = options.loginData;
  }
  
  getBody() {
    switch (this.loginPostType) {
      case 'form':
        var fields = [];
        var loginData = this.loginData;
        Object.keys(this.loginData).forEach(function(index) {
          fields.push(index + "=" + encodeURIComponent(loginData[index]));
        });
        return fields.join("&");
      break;
      case 'json':
        return JSON.stringify(this.loginData);
      break
      default:
        throw new Exception("Invalid post type, expecting 'json' or 'form'");
      break;
    }
  }

  getHeaders() {
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
          path: this.loginPath,
          headers: this.getHeaders(),
          method: this.loginMethod,
          body: this.getBody(),
          setupRequest: function(request, context) {
            if (DEBUG) {
              console.log("----setupRequest login----");
              console.log(request);
              console.log(context);
              console.log("----------");
            }
            return request;
          },
          onResponse: function (status, body, context, headers) {
            if (DEBUG) {
              console.log("----on response login----");
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

module.exports = benchLogin;
