
var program = require('commander'),
  Clone = require('./clone'),
  Pull = require('./pull'),
  Push = require('./push');

var self = module.exports = {};

self.cli = function() {
  program
    .version('0.1.0')
    .option('-b, --branch', 'Specify the branch, defaults to master')
    .option('-v, --verbose', 'Output verbose messages');

  program
    .command('clone [group]')
    .description('Clone all the remote repositories in the workspace')
    .action(function(group){
      new Clone(process.cwd(), {group: group}, program).run();
    });

  program
    .command('push [group]')
    .description('"git push" all the projects in workspace')
    .action(function(group, branch) {
      new Push(process.cwd(), {group: group}, program).run();
    });

  program
    .command('pull [group]')
    .description('"git pull" all the projects in workspace')
    .action(function(group, branch) {
      new Pull(process.cwd(), {group: group}, program).run();
    });
    
  program
    .command('*')
    .action(function(){
      program.help();
    });

  program.parse(process.argv);


  if (program.args.length === 0) {
    program.help();
  }
};
