FROM ubuntu

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs
RUN npm install -g typescript

COPY . .

RUN tsc --init
RUN npm install
RUN npm run build

ENTRYPOINT ["npm","start"]

