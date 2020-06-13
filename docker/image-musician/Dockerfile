FROM node:12.16.3

COPY src/ /opt/app

# With RUN, the instrument is viewed as a node module instead of an argument
ENTRYPOINT ["node", "/opt/app/index.js"]
