FROM node:18-alpine
WORKDIR rast2js
COPY . .
RUN npm install
CMD [ "./dockercmd.sh"]