This [shell](https://github.com/ibm-functions/shell) plugin allows you organize OpenWhisk assets into **projects** and to deploy and undeploy project as an unit.

## ⚙ Getting started

This plugin is an extension to the programming [shell](https://github.com/ibm-functions/shell). Follow [these](https://github.com/ibm-functions/shell/blob/master/docs/npm.md) instructions to install it.

Start the shell and  install this plugin by typing this command in the shell:

```
plugin install shell-project-plugin
```

The reload the shell to activate the plugin.

Alternatively you can install it from a terminal:

```
$ fsh plugin install shell-project-plugin
```

## Shell commands

```
$ fsh
Welcome to the IBM Cloud Functions Shell

fsh project add                          [ Add project to the shell ]
fsh project set                          [ Set current project ]
fsh project remove                       [ Remove project from the shell ]
fsh project list                         [ List projects added to the shell ]
fsh project deploy                       [ Deploy project ]
fsh project undeploy                     [ Undeploy project ]
...
```

### Deploying project

The `deploy` command allows to push your project to OpenWhisk.

```
$ fsh project deploy
```

### Removing a project from OpenWhisk

When you want to cleanup the assets you have previously deployed you can use the `undeploy` command.

```
fsh project undeploy
```

