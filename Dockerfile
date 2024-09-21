FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]

# docker build -t name .
# docker run -p 3000:3000 name