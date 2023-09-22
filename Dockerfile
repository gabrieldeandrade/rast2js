FROM node:18-alpine
WORKDIR rast2js
COPY . .
RUN npm install
RUN rm output/out.js
CMD [ "./dockercmd.sh"]


