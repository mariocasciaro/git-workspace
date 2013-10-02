var AbstractCommand = require('./abstract'),
  util = require('util');

util.inherits(Push, AbstractCommand);

function Push(cwd, params, commander) {
  AbstractCommand.call(this, cwd, params, commander);
}

Push.prototype.command = function(projectRoot, repo) {
  var branch = this.commander.branch || 'master';
  return this.git(['push', repo, branch], projectRoot);
};

module.exports = Push;