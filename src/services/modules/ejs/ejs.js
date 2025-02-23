/*jshint browser:true */
/*global angular:true */
'use strict';

/* 
Angular.js service wrapping the elastic.js API. This module can simply
be injected into your angular controllers. 
*/
angular.module('evo.services')
  .factory('ejs', ['$http', function ($http) {


    var

      // use existing ejs object if it exists
      ejs = window.ejs || {},

      /* results are returned as a promise */
      promiseThen = function (httpPromise, successcb, errorcb) {
        return httpPromise.then(function (response) {
          (successcb || angular.noop)(response.data);
          return response.data;
        }, function (response) {
          (errorcb || angular.noop)(undefined);
          return undefined;
        });
      };

      url = '/v1';
    // set url to empty string if it was not specified
    //if (url == null) {
    //  url = '';
    //}

    /* implement the elastic.js client interface for angular */
    ejs.client = {
      server: function (s) {
        if (s == null) {
          return url;
        }
      
        url = s;
        return this;
      },
      post: function (path, data, successcb, errorcb) {
        path = url + path;
        return promiseThen($http.post(path, data), successcb, errorcb);
      },
      get: function (path, data, successcb, errorcb) {
        path = url + path;
        return promiseThen($http.get(path, data), successcb, errorcb);
      },
      put: function (path, data, successcb, errorcb) {
        path = url + path;
        return promiseThen($http.put(path, data), successcb, errorcb);
      },
      del: function (path, data, successcb, errorcb) {
        path = url + path;
        return promiseThen($http.delee(path, data), successcb, errorcb);
      },
      head: function (path, data, successcb, errorcb) {
        path = url + path;
        return $http.head(path, data)
          .then(function (response) {
          (successcb || angular.noop)(response.headers());
          return response.headers();
        }, function (response) {
          (errorcb || angular.noop)(undefined);
          return undefined;
        });
      }
    };
  
    return ejs;
}]);

