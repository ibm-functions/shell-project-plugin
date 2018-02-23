#!/bin/bash

set -e

echo "downloading IBM Cloud Shell"
wget https://dal.objectstorage.open.softlayer.com/v1/AUTH_29373a04ec0c4e30b2626e295d134125/v1.3.419/IBM%20Cloud%20Functions%20Shell-linux-x64.zip
unzip -n "IBM Cloud Functions Shell-linux-x64.zip"

echo "patching fsh"
cp -f $TRAVIS_BUILD_DIR/tools/travis/fsh $TRAVIS_BUILD_DIR/IBM\ Cloud\ Functions\ Shell-linux-x64/

echo "running fsh --version"
fsh --version

echo "install project plugin"
fsh plugin install shell-project-plugin

echo "done"
