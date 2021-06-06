const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socket = require('socket.io');
const master = require('./masterController/masterController');

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

global.serverCount = 0;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('DB connection successful!');
    await master.initialize();
    master.handleLogs(true, 'Initialized');
  })
  .catch(err => console.log(err));

const port = process.env.MASTER_PORT || 3000;
const server = http.createServer(app);
global.io = socket(server, {
  cors: {
    origin: '*'
  }
});

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

global.urls = [];
global.io.on('connection', async soc => {
  soc.on('checkBalanceResponse', master.checkBalanceResponse);

  console.log(`User connected from socket id = ${soc.id}`);

  master.handleLogs(true, 'Sending Met-Data', soc);

  if (soc.request._query.type === 'Tablet') {
    global.tabletServersID.push(soc.id);
    global.urls.push(soc.request._query.url);
    global.serverCount++;
    if (global.serverCount === 2) {
      master.handleLogs(true, 'Sending Data', soc);
      global.io
        .to(global.tabletServersID[0])
        .emit('setRows', global.tabletServersData.slice(0, 2));
      global.io
        .to(global.tabletServersID[1])
        .emit('setRows', global.tabletServersData.slice(2, 4));
    }
  }

  global.io.emit('newcache', {
    urls: global.urls,
    data: global.tabletServersMetaDataSent
  });

  soc.on('disconnect', function() {
    const s = this;
    if (s.request._query.type === 'Tablet') {
      master.handleLogs(false, 'Tablet Disconnected', soc);
      global.serverCount--;
      global.urls.splice(global.urls.indexOf(s.request._query.url), 1);
      global.tabletServersID.splice(global.tabletServersID.indexOf(s.id), 1);
      master.ServerDisconnected(s, soc.id);
    } else if (s.request._query.type === 'Client') {
      master.handleLogs(false, 'Client Disconnected', soc);
    }
  });

  soc.on('logs', function(logString) {
    master.handleLogs(false, logString, soc);
  });
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

master.CheckServersBalancePeriodically();
