#!/bin/bash

set -e

echo "install the shell"
npm install -g @ibm-functions/shell

echo "install project plugin"
fsh plugin install shell-project-plugin
