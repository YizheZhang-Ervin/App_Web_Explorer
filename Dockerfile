FROM library/node

COPY explorer-client /home/app/explorer-client
COPY explorer-server /home/app/explorer-server

RUN mkdir /home/share

WORKDIR /home/app/explorer-server

CMD ["node","app.js"]