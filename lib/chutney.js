
var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var GithubAPI = require('github');

util.inherits(Chutney, EventEmitter);
function Chutney(name, option) {
  EventEmitter.call(this);

  var self = this;
  this._option = option;
  this._name = name;
  this._root = util.format('/tmp/chutney/%s/', name);
  this._github = this.initGithub();

  exec(util.format('rm -rf %s', this._root), function() {
    fs.mkdir(self._root, self.fetchRepo.bind(self));
  });
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

Chutney.prototype.fetchRepo = function(name) {
  var self = this;
  var name = this._name;
  lookup(name, '', function(err, result) {
    if (err) {
      return self.emit('error', err);
    }
    var cmd = util.format('cd %s && npm install && npm test', self._root);
    var child = exec(cmd);
    child.stderr.pipe(process.stderr);
    child.stdout.pipe(process.stdout);
    child.on('close', function() {
      self.emit('success', null);      
    });
    child.on('error', function(err) {
      self.emit('error', err);
    });
  });

  function lookup(name, path, cb) {
    self.scan(name, path, function(err, files) {
      if (err) {
        return self.emit('error', err);
      }
      async.forEach(files, itemIterator, cb);
    });
  }

  function itemIterator(item, done) {
    switch (item.type) {
    case 'dir':
      fs.mkdir(self._root + item.path, function(err) {
        if (err) 
          return done(err);
        else
          lookup.call(self, name, item.path, done);
      });
      break;
    case 'file':
      getBlob.call(self, item, done);
      break;
    }
  }

  function getBlob(file, done) {
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
        done(null);
      });
    });
  }
}

Chutney.prototype.scan = function(name, path, cb) {
  var option = this._option;
  this._github.repos.getContent({
    user: option.user,
    repo: name,
    path: path || ''
  }, cb);
}

module.exports = Chutney;