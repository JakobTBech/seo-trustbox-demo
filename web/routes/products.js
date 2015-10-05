var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');
var q = require('q');
var querystring = require("querystring");

/* GET SINGLE product page. */
router.param('productId', function(req, res, next, id) {
  req.productId = id;
  return next();
});

/* GET /products/:productId page. */
router.route('/:productId').get(function(req, res, next) {
  // When we're authenticated
  auth().then(function(authData){
    // Get the review/product data
    getProduct(authData, req.productId).then(function(reviewData){
      // Get the SEO TrustBox data
      getHtmlForSeoTrustBox(reviewData).then(function(seoTrustBoxHtml){
        reviewData.seoHtml = seoTrustBoxHtml;
        reviewData.title = 'Product details';
        res.render('product', reviewData);
      });
    });
  });
});

/* GET products page. */
router.route('/').get(function(req, productRes, next) {
  // When we're authenticated
  auth().then(function(authData){
    // When we've got all the product
    getAllProducts(authData).then(function(productsData){
      productRes.render('products', { title: 'Products Overview',  productReviews: productsData.productReviews});
    });
  });
});

function getProduct(authData, id){
  var deferred = q.defer();

  var reviewOptions = {
    protocol: 'https:',
    host: 'api.trustpilot.com',
    path: '/v1/private/product-reviews/'+id,
    headers: {'Authorization': 'Bearer ' + authData.access_token }
  };

  var reviewRequest = https.request(reviewOptions, function(reviewResponse) {
    var reviewJsonText = '';
    var reviewData = {};

    reviewResponse.on('data', function (chunk) {
      reviewJsonText += chunk;
    });

    reviewResponse.on('end', function() {
      reviewData = JSON.parse(reviewJsonText);
      deferred.resolve(reviewData);
    });
  });


  reviewRequest.on('error', function(err){
    console.log('an error ocurred:', err.message)
  });

  reviewRequest.end();

  return deferred.promise;
}

function getHtmlForSeoTrustBox(reviewData){
  var deferred = q.defer();

  var seoRequestOptions = {
    path: '/seo/'+reviewData.product.sku+'/'+querystring.escape(reviewData.product.name),
    port: '3000'
  };

  var seoRequest = http.request(seoRequestOptions, function(seoResponse) {
    var seoTrustBoxHtml = '';

    seoResponse.on('data', function (chunk) {
      seoTrustBoxHtml += chunk;
    });

    seoResponse.on('end', function() {
      deferred.resolve(seoTrustBoxHtml);
    });
  });

  seoRequest.on('error', function(err){
    console.log('an error ocurred:', err.message)
  });

  seoRequest.end();

  return deferred.promise;
}

function getAllProducts(authData) {
  var deferred = q.defer();

  var productOptions = {
    protocol: 'https:',
    host: 'api.trustpilot.com',
    path: '/v1/private/product-reviews/business-units/537b597c000064000578c90e/reviews',
    headers: {'Authorization': 'Bearer ' + authData.access_token }
  }

  var productRequest = https.request(productOptions, function(productsRes){
    var productsResponse = '';
    var productsData;

    productsRes.on('data', function (chunk) {
      productsResponse += chunk;
    });

    productsRes.on('end', function() {
      productsData = JSON.parse(productsResponse);
      deferred.resolve(productsData);
    });
  });

  productRequest.on('error', function(err){
    console.log('an error ocurred:', err.message)
  });

  productRequest.end();

  return deferred.promise;
}

function auth() {
  var deferred = q.defer();

  var authOptions = {
    path: '/auth',
    port: '3000',
  };

  var req = http.request(authOptions, function(authRes) {
    var authResponse = '';
    var authData = {};

    authRes.on('data', function (chunk) {
      authResponse += chunk;
    });

    // Now we got the ACCESS_TOKEN from the /auth
    authRes.on('end', function() {
      authData = JSON.parse(authResponse);
      deferred.resolve(authData);
    });

  });

  req.end();

  return deferred.promise;
}

module.exports = router;
