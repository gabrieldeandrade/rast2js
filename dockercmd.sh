#!/bin/sh
npm config set update-notifier false
npm run -s start --mute=true --file=/input/source.rinha.json
echo "Result:"
node output/out.js