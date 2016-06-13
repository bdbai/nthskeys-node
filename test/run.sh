#!/usr/bin/env bash

if [ -f ./test/config.sh ]; then
  config_file=./test/config.sh
else
  echo "Please copy a duplicate of 'config.sample.sh' to 'config.sh' before testing"
  config_file=./test/config.sample.sh
fi

source $config_file
/usr/bin/env node ./test/test.js

