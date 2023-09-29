#!/bin/sh
npm config set update-notifier false
export NODE_NO_WARNINGS=1;
npm run start --silent --mute=true --file=/var/rinha/source.rinha.json
node --stack-size=8192 out.js