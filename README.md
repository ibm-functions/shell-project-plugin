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
fsh project unset                        [ Unset current project ]
fsh project remove                       [ Remove project from the shell ]
fsh project list                         [ List projects added to the shell ]
fsh project deploy                       [ Deploy project ]
fsh project undeploy                     [ Undeploy project ]
...
```

The `wsk` commands have been modified to manage assets belonging to the project only. E.g `wsk action list` shows only the project actions.

## Adding a project to the Cloud Shell

You first need to tell the shell where is the root folder containing your project by using `project add`. The simple way is to set the current directory to your project directory (by using the `lcd` command) and to type `project add`. Each project is associated with a name determined as follows:
- the value of the property `project.name` in `manifest.yaml`
- the option `-name <project_name>`
- the project path last segment

The project name can be used to set the current project or remove a project from the shell.

## Set and unset the current active project

The `set` command is used to switch between projects. It also automatically changes the current directory to the project root folder.

If you want to manage assets that don't belong to a specific project, you can `unset` the active project. This restore the Cloud Shell behavior as if this plugin was deactivated.

## Uninstalling `shell-project-plugin`

In the shell, type:

```
plugin remove shell-project-plugin
```