#!/bin/bash

set -e

echo "install project plugin"
DEBUG=* fsh plugin install shell-project-plugin

echo "list plugin"
fsh plugin list

echo "uninstall project plugin"
fsh plugin remove shell-project-plugin

echo "install local project plugin"

