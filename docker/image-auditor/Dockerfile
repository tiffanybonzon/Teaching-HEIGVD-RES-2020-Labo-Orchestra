FROM node:12.16.3

COPY docker/src/ /opt/app

# With RUN, the instrument is viewed as a node module instead of an argument
ENTRYPOINT ["node", "/opt/app/auditor.js"]
