requirejs.config({
  baseUrl: 'public/js',
  paths: {
    preact: 'lib/htm-preact.umd',
  },
});

$.ajaxSetup({
  contentType: 'application/json',
  dataType: 'json',
  processData: false,
  xhrFields: {
    withCredentials: true,
  },
  beforeSend(xhr) {
//    this.url = 'http://192.168.0.31:31773/api/v1/' + this.url.replace(/^\/+/, '');
    this.url = '/api/v1/' + this.url.replace(/^\/+/, '');
  },
});

define(['preact', 'app'], function (preact, app) {
  preact.render(app, document.body);
});
