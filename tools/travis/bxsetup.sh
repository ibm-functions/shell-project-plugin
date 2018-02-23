#!/usr/bin/env bash

set -e

echo "install the shell"
export DEBUG=*
npm install -g @ibm-functions/shell

if [[ $BLUEMIX_ORG == "" ]]; then
    echo "missing BLUEMIX_ORG. Aborting"
    exit 1
fi

if [[ $BLUEMIX_API_KEY == "" ]]; then
    echo "missing BLUEMIX_API_KEY. Aborting"
    exit 1
fi

if [[ $BLUEMIX_SPACE == "" ]]; then
    echo "missing BLUEMIX_SPACE. Aborting"
    exit 1
fi

echo "installing bx"
curl -fsSL https://clis.ng.bluemix.net/install/linux | sh

echo "installing Cloud Functions plugin"
bx plugin install Cloud-Functions -r Bluemix -f -v 1.0.6

echo "login to bluemix"
bx login -a api.ng.bluemix.net --apikey ${BLUEMIX_API_KEY} -o $BLUEMIX_ORG -s $BLUEMIX_SPACE

echo "generation .wskprops"
bx wsk property get


