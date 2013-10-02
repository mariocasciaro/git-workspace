
var expect = require('chai').expect,
  fs = require('fs'),
  rimraf = require("rimraf"),
  _ = require('lodash'),
  spawn = require("child_process").spawn,
  ncp = require("ncp"),
  when = require("when"),
  path = require('path');

var GIT_WORKSPACE_EXE = path.join(__dirname, "../bin/git-workspace");
var FIXTURES_DIR = path.join(__dirname, "fixtures");
var SANDBOX_DIR = path.join(__dirname, "tmp");

var SIMPLE_WORKSPACE = path.resolve(SANDBOX_DIR, "simpleWorkspace");
var SW_PRJ = path.join(SIMPLE_WORKSPACE, "prj");

var REPOSITORIES = path.resolve(SANDBOX_DIR, "repositories");
var REPO_PRJ = path.join(REPOSITORIES, "prj");


function run(command, args, cwd) {
  var deferred = when.defer();
  var git = spawn(command, args, {cwd: cwd});
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
}

function gitWorkspace(args, cwd) {
  return run(GIT_WORKSPACE_EXE, args, cwd);
}

function git(args, cwd) {
  return run('git', args, cwd);
}


function createRepos() {

  var promise = when.resolve();
  _.times(5, function(n) {
    promise = promise.then(function() {
      var prj = REPO_PRJ+n;
      fs.mkdirSync(prj);
      fs.writeFileSync(path.join(prj, "testFile"+n+".js"), "Sample content"+n);

      return git(['init'], prj)
      .then(function() {
        return git(['add', '-A'], prj);
      })
      .then(function() {
        return git(['commit', '-m', '"TestRepo'+n+'"'], prj);
      });
    });
  });

  return promise.then(function() {
    fs.mkdirSync(SW_PRJ+"1");
    var desc = {
      "repositories": {
        "default": {
          "prj1": REPO_PRJ+"1",
          "prj2": REPO_PRJ+"2",
          "prj3": REPO_PRJ+"3"
        },
        "local": {
          "prj1": REPO_PRJ+"1",
          "prj2": REPO_PRJ+"2",
          "prj3": null
        },
        "localDef": {
          "prj1": REPO_PRJ+"1",
          "prj2": REPO_PRJ+"2"
        }
      }
    };
    return fs.writeFileSync(path.join(SIMPLE_WORKSPACE, "workspace.json"), JSON.stringify(desc, null, 2));
  });
}


describe('git-workspace', function() {
  beforeEach(function(done) {
    //clean and create new sandbox
    rimraf.sync(SANDBOX_DIR);
    ncp(FIXTURES_DIR, SANDBOX_DIR, function(err) {
      if(err) {
        done(err);
      }
      
      createRepos().then(function() {
        done();
      }).otherwise(done);
    });
  });
  
  it('should clone a single project', function(done) {
    gitWorkspace(['clone', 'local', '-v'], SW_PRJ+"1").then(function() {
      expect(fs.existsSync(SW_PRJ+"1" + "/.git")).to.be.true;
      expect(fs.existsSync(SW_PRJ+"1" + "/testFile1.js")).to.be.true;
      done();
    }).otherwise(done);
  });

  it('should clone each project in the workspace', function(done) {
    gitWorkspace(['clone', 'local', '-v'], SIMPLE_WORKSPACE).then(function() {
      expect(fs.existsSync(SW_PRJ+"1" + "/.git")).to.be.true;
      expect(fs.existsSync(SW_PRJ+"2" + "/.git")).to.be.true;
      expect(fs.existsSync(SW_PRJ+"1" + "/testFile1.js")).to.be.true;
      expect(fs.existsSync(SW_PRJ+"2" + "/testFile2.js")).to.be.true;

      expect(fs.existsSync(SW_PRJ+"3" + "/.git")).to.be.false;
      done();
    }).otherwise(done);
  });

  it('should clone each project in the workspace using default', function(done) {
    gitWorkspace(['clone', 'localDef', '-v'], SIMPLE_WORKSPACE).then(function() {
      expect(fs.existsSync(SW_PRJ+"1" + "/.git")).to.be.true;
      expect(fs.existsSync(SW_PRJ+"2" + "/.git")).to.be.true;
      expect(fs.existsSync(SW_PRJ+"3" + "/.git")).to.be.true;
      expect(fs.existsSync(SW_PRJ+"1" + "/testFile1.js")).to.be.true;
      expect(fs.existsSync(SW_PRJ+"2" + "/testFile2.js")).to.be.true;
      expect(fs.existsSync(SW_PRJ+"3" + "/testFile3.js")).to.be.true;
      done();
    }).otherwise(done);
  });


  it('should push a single project', function(done) {
//    var prj = SW_PRJ+"1";
//    return gitWorkspace(['clone', 'local', '-v'], SIMPLE_WORKSPACE)
//    .then(function() {
//      //add a file and commit
//      fs.writeFileSync(path.join(prj, "testFileMod.js"), "Sample content");
//      return git(['add', '-A'], prj);
//    })
//    .then(function() {
//      return git(['commit', '-m', '"TestRepo"'], prj);
//    })
//    .then(function() {
//      return gitWorkspace(['push', 'local', 'master', '-v'], prj);
//    })
//    .then(function() {
//      expect(fs.existsSync(REPO_PRJ+"1" + "/testFileMod.js")).to.be.true;
//      done();
//    })
//    .otherwise(done);
  });
});
