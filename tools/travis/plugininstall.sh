#!/bin/bash

set -e

echo "install project plugin"
# fsh plugin install shell-project-plugin
ln -s $TRAVIS_BUILD_DIR/. $TRAVIS_BUILD_DIR/shell/app/plugins/modules/shell-project-plugin
(cd shell/dist && ./compile.js)

echo "list plugin"
fsh plugin list

