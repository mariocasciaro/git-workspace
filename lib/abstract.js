var fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn,
  when = require('when'),
  util = require('util'),
  _ = require('lodash');


var DESCRIPTOR_NAME = "workspace.json";


function AbstractCommand(cwd, params, commander) {
  this.cwd = cwd;
  this.params = params;
  this.commander = commander;
}

AbstractCommand.prototype = {
  error: function(message) {
    console.error('[git-workspace] ' + message);
  },

  info: function(message) {
    console.log('[git-workspace] ' + message);
  },

  verbose: function(message) {
    if(this.commander.verbose) {
      console.log('[git-workspace] ' + message);
    }
  },

  run: function() {
    var self = this;
    return when(true, function() {
      self.verbose("Invoking clone CWD:" + self.cwd + ", group: " + self.params.group);
      self.wsDesc = self.getWorkspaceDescriptor(self.cwd, true, true);
      if(self.wsDesc) {
        return self.runOnWorkspace(self.cwd);
      }

      self.wsDesc = self.getWorkspaceDescriptor(self.cwd);
      return self.runOnProject(self.cwd);
    }).otherwise(function(err) {
      if(err instanceof Error) {
        self.error(err.message);
        self.verbose(err.stack);
      } else {
        self.error(util.inspect(err));
      }

      self.info("Ooooops, it wasn\'t my fault, I swear");
      process.exit(-1);
    });
  },

  command: function(projectRoot, repo) {
    throw new Error("not implemented");
  },

  runOnProject: function(cwd) {
    var self = this;
    var projectRoot = self.getProjectRoot(cwd);
    var projectName = path.basename(projectRoot);
    self.info("Invoking on project " + projectRoot);

    var repo = self.getRepository(projectName);
    if(!repo) {
      self.info("No remote repo is configured for this project");
      return;
    }
    return self.command(projectRoot, repo);
  },


  runOnWorkspace: function(cwd) {
    var self = this;
    var promise = when.resolve();
    var group = self.getGroup();
    _.each(group, function(repo, projectName) {
      promise = promise.then(function() {
        var projectPath = path.resolve(cwd, projectName);
        if(!fs.existsSync(projectPath)) {
          self.error("Project directory " + projectName + "does not exists");
          return;
        }
        return self.runOnProject(projectPath);
      });
    });
    return promise;
  },


  git: function(args, cwd) {
    this.verbose("Invoking git(CWD: "+cwd+")" + args.join(" "));
    var deferred = when.defer();
    var git = spawn('git', args, {cwd: cwd});
    git.stdout.pipe(process.stdout);
    git.stderr.pipe(process.stderr);
    git.on('close', function (code) {
      if(code !== 0) {
        deferred.reject(code);
      } else {
        deferred.resolve(code);
      }
    });

    return deferred.promise;
  },

  getProjectRoot: function(cwd) {
    if(cwd.indexOf(this.wsDesc.root) !== 0) {
      throw new Error("CWD is not under a workspace path");
    }

    var projectRoot = cwd;
    while(path.dirname(projectRoot) !== this.wsDesc.root) {
      projectRoot = path.dirname(projectRoot);
    }

    return projectRoot;
  },


  getGroup: function() {
    var groupName = this.params.group;
    var group;
    if(! groupName) {
      //try to get default
      groupName = 'default';
    }

    group = this.wsDesc.repositories[groupName];
    if(group) {
      _.defaults(group, this.wsDesc.repositories['default']);
    } else {
      throw new Error("Cannot find repository group " + util.inspect(groupName));
    }
    return group;
  },


  getRepository: function(projectName) {
    var group = this.getGroup();
    return group[projectName];
  },


  isRoot: function(root) {
    return path.resolve('/') === path.resolve(root);
  },


  getWorkspaceDescriptor: function(cwd, shallow, nothrow) {
    var fileDesc = path.resolve(cwd, DESCRIPTOR_NAME);
    if(fs.existsSync(fileDesc)) {
      var desc = require(fileDesc);
      //set the workspace dir
      desc.root = cwd;
      return desc;
    } else if(shallow || this.isRoot(cwd)) {
      if(nothrow) {
        return null;
      }
      throw new Error("Cannot find workspace.json");
    }

    return this.getWorkspaceDescriptor(path.resolve(cwd, '../'), shallow, nothrow);
  }
};

module.exports = AbstractCommand;