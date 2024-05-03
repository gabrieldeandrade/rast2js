FROM node:18.16-alpine3.18
WORKDIR rast2js
COPY . .
RUN npm install
CMD [ "./dockercmd.sh"]
