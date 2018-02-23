#!/usr/bin/env bash

set -e

curl https://dal.objectstorage.open.softlayer.com/v1/AUTH_29373a04ec0c4e30b2626e295d134125/v1.3.419/IBM%20Cloud%20Functions%20Shell-linux-x64.zip > boo.zip

echo "install the shell"
export DEBUG=*
export NODE_OPTIONS=--max-old-space-size=8192
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


