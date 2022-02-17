FROM base:v1.0.0

WORKDIR /usr/src/app

COPY . .

EXPOSE 3001
CMD [ "npm", "start" ]
