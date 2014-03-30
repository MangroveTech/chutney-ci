
var util = require('util');
var Canvas = require('canvas');

//
// Status Icon
//
function StatusIcon() {
  this.width = 90;
  this.height = 22;
  this.rate = 0.40;
  this.leftWidth = this.width * this.rate;
  this.rightWidth = this.width - this.leftWidth;

  this.canvas = new Canvas(this.width, this.height);
  this.context = this.canvas.getContext('2d');
  this._paint();
}

StatusIcon.prototype._paint = function() {
  throw new Error('Not Implementation');
}

StatusIcon.prototype._paintBuild = function() {
  var rate = this.rate;
  var leftWidth = this.leftWidth;
  var rightWidth = this.rightWidth;

  this._paintRoundRect(0, 0, this.height, leftWidth, [0, 0, 3, 3]);
  var leftGradient = this.context.createLinearGradient(0, 0, 0, this.height);
  leftGradient.addColorStop(0, '#444');
  leftGradient.addColorStop(1, '#333');
  this.context.fillStyle = leftGradient;
  this.context.fill();

  this.context.font = '9pt Calibri';
  this.context.fillStyle = '#fff';
  this.context.fillText('build', leftWidth * 0.17, this.height - 7);
}

StatusIcon.prototype._paintRoundRect = function(x, y, h, w, radius) {
  var radiusSet = [
    5, // right top
    5, // right bottom
    5, // left  bottom
    5  // left  top
  ];
  if (typeof radius === 'number') {
    radiusSet = radiusSet.map(function() {
      return radius;
    });
  }
  if (Object.prototype.toString.call(radius) === '[object Array]') {
    radiusSet = radiusSet.map(function(val, i) {
      return typeof radius[i] === 'number' ? radius[i] : val;
    });
  }
  this.context.beginPath();
  this.context.moveTo(x + radiusSet[3], y);
  this.context.lineTo(x + w - radiusSet[0], y);
  this.context.quadraticCurveTo(x + w, y, x + w, y + radiusSet[0]);
  this.context.lineTo(x + w, y + h - radiusSet[1]);
  this.context.quadraticCurveTo(x + w, y + h, x + w - radiusSet[1], y + h);
  this.context.lineTo(x + radiusSet[2], y + h);
  this.context.quadraticCurveTo(x, y + h, x, y + h - radiusSet[2]);
  this.context.lineTo(x, y + radiusSet[3]);
  this.context.quadraticCurveTo(x, y, x + radiusSet[3], y);
  this.context.closePath();
}

StatusIcon.prototype.pipe = function(writable) {
  this.canvas.toBuffer(function(err, buf) {
    if (err) {
      throw err;
    }
    writable.end(buf);
  });
}

//
// Passing Icon
//
util.inherits(PassingIcon, StatusIcon);
function PassingIcon() {
  StatusIcon.call(this);
}

PassingIcon.prototype._paint = function() {
  var rate = this.rate;
  var leftWidth = this.leftWidth;
  var rightWidth = this.rightWidth;
  
  this._paintBuild();
  this._paintRoundRect(leftWidth, 0, this.height, rightWidth, [3, 3, 0, 0]);
  var rightGradient = this.context.createLinearGradient(0, 0, 0, this.height);
  rightGradient.addColorStop(0, '#548a1b');
  rightGradient.addColorStop(1, '#436e14');
  this.context.fillStyle = rightGradient;
  this.context.fill();

  this.context.font = '9pt Calibri';
  this.context.fillStyle = '#fff';
  this.context.fillText('passing', leftWidth + rightWidth * 0.17, this.height - 7);
}

//
// Failed Icon
//
util.inherits(FailedIcon, StatusIcon);
function FailedIcon() {
  StatusIcon.call(this);
}

FailedIcon.prototype._paint = function() {
  var rate = this.rate;
  var leftWidth = this.leftWidth;
  var rightWidth = this.rightWidth;
  
  this._paintBuild();
  this._paintRoundRect(leftWidth, 0, this.height, rightWidth, [3, 3, 0, 0]);
  var rightGradient = this.context.createLinearGradient(0, 0, 0, this.height);
  rightGradient.addColorStop(0, '#af3b1b');
  rightGradient.addColorStop(1, '#9c3115');
  this.context.fillStyle = rightGradient;
  this.context.fill();

  this.context.font = '9pt Calibri';
  this.context.fillStyle = '#fff';
  this.context.fillText('failed', leftWidth + rightWidth * 0.22, this.height - 7);
}

exports.StatusIcon = StatusIcon;
exports.PassingIcon = PassingIcon;
exports.FailedIcon = FailedIcon;
