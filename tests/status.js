
var fs = require('fs');
var path = require('path');
var PassingIcon = require('../lib/status').PassingIcon;
var FailedIcon = require('../lib/status').FailedIcon;

var icon1 = new PassingIcon();
icon1.pipe(fs.createWriteStream(path.join(__dirname, './passing.png')));

var icon2 = new FailedIcon();
icon2.pipe(fs.createWriteStream(path.join(__dirname, './failed.png')));