#!/usr/bin/env bash

export NODE_ENV="development"
export MONGODB_CONNECTION="localhost:27017/nthskeys"
export FILE_PATH="/home/bdbai/node/nthskeys/files"

/usr/bin/env node ./test/test.js
