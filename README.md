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

## Shell project view

**Note:** The shell does not automatically activate plugins so you need to type `project` to activate it.

When the project plugin is activated, the title bar shows the name of the current project.

![Shell Title Bar](doc/title.png?raw=true)


## New and extended shell commands

This plugin adds the following commands to manage projects:

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

The `wsk` commands have been modified to manage assets belonging to the project only. E.g `wsk action list` shows only the project actions. For now only `wsk action list` and `wsk action update` have been changed. There is a plan to change the rest of the wsk commands.

### Deploying project

The `deploy` command allows to push your project to OpenWhisk.

```
$ fsh project deploy [<manifest.yml>]
```

Deploy assets described in the given manifest. More information about the manifest format can be found [here](https://github.com/apache/incubator-openwhisk-wskdeploy)

### Removing a project from OpenWhisk

When you want to cleanup the assets you have previously deployed you can use the `undeploy` command.

```
fsh project undeploy [<manifest.yml>]
```

