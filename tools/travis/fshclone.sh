#!/bin/bash

set -e

echo "cloning https://github.com/ibm-functions/shell.git"
git clone https://github.com/ibm-functions/shell.git

echo "install shell"
(cd shell/app && npm install)

echo "done"
