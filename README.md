[![NPM](https://nodei.co/npm/git-workspace.png?downloads=true)](https://nodei.co/npm/git-workspace/)

[![Dependency Status](https://david-dm.org/mariocasciaro/git-workspace.png)](https://david-dm.org/mariocasciaro/git-workspace)


# Synopsis

A command line utility to manage multiple git-based projects, when each one of them has a different remote repositories
or possibly more then one remote repository.

If you are working with Node.js [npm-workspace](https://github.com/mariocasciaro/npm-workspace) is the perfect companion
to this utility

# Stability

**Experimental**: use at your own risk

# Prerequisites

* Need the `git` executable in the PATH
* Since this program is based on Node.js, you will need to install Node.js first
* To install: `npm install -g git-workspace`

# Usage

**Definition**: We will call **workspace** a directory containing a set of projects.

```
workspace
├── prj1
├── prj2
├── prj3
└── workspace.json
```

To get started create a `workspace.json` in your workspace dir. It will look like this:
```javascript
{
  "repositories": {
    "default": {
      "prj1": "git+ssh://example.org/example/repo1"
    },
    "github": {
      "prj2": "git+ssh://example-github.org/example/repo2"
      "prj3": "git+ssh://example-github.org/example/repo3"
    }
  }
}
```

Repositories are aggregated into **groups** (in the example above `default` and `github`). The `default` group`
provides the default remote repo if none is specified for a given project and is the one to be picked
when no specific group is specified in the command line.

__clone__
```
$ cd workspace
$ git-workspace clone github
```
Will clone the remote group `github` (prj1, prj2, prj3) into the workspace. Project directories must be empty for the clone
to succeed.


__push__
```
$ cd workspace
$ git-workspace push
```
Will push the group `default` (prj1) to the remote repo.


__pull__
```
$ cd workspace
$ git-workspace pull github
```
Will pull the changes of the group `github` (prj1, prj2, prj3) from the remote repo.


# Licence

MIT

