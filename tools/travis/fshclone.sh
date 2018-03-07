#!/bin/bash

set -e

echo "cloning https://github.com/ibm-functions/shell.git"
(cd $SHELL_DIR/.. && git clone https://github.com/ibm-functions/shell.git)

echo "install shell"
(cd $SHELL_DIR/app && npm install)

echo "done"
