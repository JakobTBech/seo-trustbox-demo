var express = require('express');
var router = express.Router();
var https = require('https');
var url = require('url');

/* GET products page. */
router.get('/', function(req, res, next) {
  var key = process.env['API_KEY'];;
  var secret = process.env['API_SECRET'];
  var username = process.env['TP_USERNAME'];;
  var password = process.env['TP_PASSWORD'];;
  var hash = new Buffer(key+':'+secret).toString('base64');

  var requestOptions = {
    protocol: 'https:',
    host: 'api.trustpilot.com',
    method: 'POST',
    path: '/v1/oauth/oauth-business-users-for-applications/accesstoken',
    headers: {
      'Authorization': 'Basic ' + hash,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  var callback = function(response){
    var returnedData = '';
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      returnedData += chunk;
    });
    response.on('end', function() {
      res.send(returnedData);
    })
  }
  
  var req = https.request(requestOptions, callback);
  req.write('grant_type=password&username='+username+'&password='+password);
  req.on('error', function(err){
    console.log('an error ocurred:', err.message)
  });
  req.end();
});

module.exports = router;
