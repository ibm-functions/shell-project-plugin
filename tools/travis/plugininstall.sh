#!/bin/bash

set -e

echo "install project plugin"
# fsh plugin install shell-project-plugin
ln -s $TRAVIS_BUILD_DIR/. $SHELL_DIR/app/plugins/modules/shell-project-plugin
(cd $SHELL_DIR/dist && ./compile.js)

echo "list plugin"
fsh plugin list

