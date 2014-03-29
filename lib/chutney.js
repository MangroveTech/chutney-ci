
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var GithubAPI = require('github');

util.inherits(Chutney, EventEmitter);
function Chutney(name, option) {
  EventEmitter.call(this);
  this._option = option;
  this._name = name;
  this._root = util.format('/tmp/chutney/%s/', name);
  this._github = this.initGithub();

  fs.mkdir(this._root, this.fetchRepo.bind(this));
}

Chutney.prototype.initGithub = function() {
  var option = this._option;
  var ret = new GithubAPI({
    version: "3.0.0",
    debug: false
  });
  ret.authenticate({
    type: 'oauth',
    token: option.privateToken
  });
  return ret;
}

Chutney.prototype.fetchRepo = function(name, cb) {
  var self = this;
  var name = this._name;
  lookup(name);

  function lookup(name, path) {
    self.scan(name, path, function(err, files) {
      if (err) {
        return self.emit('error', err);
      }
      files.forEach(function(item) {
        switch (item.type) {
        case 'dir':
          fs.mkdir(self._root + item.path, function() {
            if (err) 
              return self.emit(err);
            lookup.call(self, name, item.path);
          });
          break;
        case 'file':
          getBlob.call(self, item);
          break;
        }
      });
    });
  }

  function getBlob(file) {
    var option = this._option;
    self._github.gitdata.getBlob({
      user: option.user,
      repo: name,
      sha: file.sha
    }, function(err, blob) {
      if (err) {
        return self.emit('error', err);
      }
      var buf = new Buffer(blob.content, blob.encoding);
      fs.writeFile(self._root + file.path, buf, function() {
        console.info('[success]', self._root + file.path);
      });
    });
  }
}

Chutney.prototype.scan = function(name, path, cb) {
  var option = this._option;
  if (typeof path === 'function') {
    cb = path;
    path = undefined;
  }
  this._github.repos.getContent({
    user: option.user,
    repo: name,
    path: path || ''
  }, cb);
}

module.exports = Chutney;