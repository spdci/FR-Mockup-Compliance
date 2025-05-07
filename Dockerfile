FROM node:14-alpine

RUN npm install -g @mockoon/cli@2.2.1
COPY mockoon-fr.json ./mockoon-fr.json
COPY entrypoint.sh ./entrypoint.sh
# Do not run as root.
RUN adduser --shell /bin/sh --disabled-password --gecos "" mockoon
RUN chown -R mockoon ./mockoon-fr.json
RUN chown -R mockoon ./entrypoint.sh

USER mockoon

EXPOSE 3003

ENTRYPOINT ["/entrypoint.sh"]