
FROM --platform=linux/arm64 node:18 as builder

WORKDIR /build

COPY .env .env
COPY src/VideoEncodingService/package*.json .
COPY tsconfig.json tsconfig.json

RUN npm ci --maxsockets 1

COPY src/VideoEncodingService/ src/VideoEncodingService/
RUN export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
RUN export AWS_SECRET_ACCESS_KEY=${MY_AWS_SECRET_ACCESS_KEY}

RUN npm i
RUN npm run build

FROM --platform=linux/arm64 node:18 as runner

WORKDIR /app

COPY --from=builder build/package*json .
COPY --from=builder build/.env .
COPY --from=builder build/node_modules node_modules/
COPY --from=builder build/dist dist/

RUN apt-get update && apt-get install -y iputils-ping dnsutils curl wget

EXPOSE 80
CMD [ "npm","start" ]



# FROM ubuntu

# RUN apt-get update
# RUN apt-get install -y curl
# RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
# RUN apt-get upgrade -y
# RUN apt-get install -y nodejs
# RUN npm install -g typescript

# COPY . .

# RUN tsc --init
# RUN npm install
# RUN npm run build

# ENTRYPOINT ["npm","start"]

