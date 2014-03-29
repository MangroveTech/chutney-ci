
Chutney CI
=========
Open source ci system for Mongrove Projects

### Installation
```sh
$ npm install chutney-ci
```

### Simple Usage
```
var Chutney = require('chutney').Chutney;
var cy = new Chutney('{repo}', {
  'user': '{owner}',
  'privateToken': '{your private token}'
});
```

### License

ZLIB