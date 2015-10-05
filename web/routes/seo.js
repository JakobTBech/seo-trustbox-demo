var express = require('express');
var router = express.Router();
var https = require('https');
var url = require('url');
var querystring = require('querystring');

/* Define the SKU parameter. */
router.param('sku', function(req, res, next, sku) {
  req.sku = sku;
  return next();
});

/* Define the NAME parameter. */
router.param('name', function(req, res, next, name) {
  req.name = name;
  return next();
});

/* GET seo TrustBox markup */
router.get('/:sku/:name', function(req, res, next) {
  var seoTrustboxParameters = {
    sku: req.sku,
    contentLanguage: 'en',
    businessUnitId: '537b597c000064000578c90e',
    apikey: process.env['API_KEY'],
    productName: 'See the reviews for ' + req.name,
    perPage: '3',
    count: '20',
    locale: 'en-US',
    widgetHeight: '265'
  };

  var options = {
    host: 'productreviewswidgets.trustpilot.com',
    path: '/?'+querystring.stringify(seoTrustboxParameters)
  };

  callback = function(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      res.send(str);
    });
  }

  https.request(options, callback).end();
});

module.exports = router;
