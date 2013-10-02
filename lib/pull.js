var AbstractCommand = require('./abstract'),
  util = require('util');

util.inherits(Pull, AbstractCommand);

function Pull(cwd, params, commander) {
  AbstractCommand.call(this, cwd, params, commander);
}

Pull.prototype.command = function(projectRoot, repo) {
  var branch = this.commander.branch || 'master';
  return this.git(['pull', repo, branch], projectRoot);
};

module.exports = Pull;