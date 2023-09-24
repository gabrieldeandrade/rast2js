#!/bin/sh
npm config set update-notifier false
export NODE_NO_WARNINGS=1;
npm run start --silent --mute=true --file=/input/source.rinha.json
node output/out.js