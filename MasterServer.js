const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socket = require('socket.io');
const master = require('./masterController/masterController');

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

global.serverCount = 0;

let tabletServerInit;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('DB connection successful!');
    tabletServerInit = await master.initialize();
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
  // console.log(soc.request._query.url);
  console.log(`User connected from socket id = ${soc.id}`);
  if (soc.request._query.type === 'Client') {
    master.handleLogs(true, 'Sending Met-Data');
    global.io.emit('newcache', {
      urls: global.urls,
      data: tabletServerInit.tabletServersMetaData
    });
  } else {
    global.tabletServersID.push(soc.id);
    global.urls.push(soc.request._query.url);
    global.serverCount++;
    if (global.serverCount === 2) {
      master.handleLogs(true, 'Sending Data');
      global.io
        .to(global.tabletServersID[0])
        .emit('setRows', tabletServerInit.tabletServersData.slice(0, 2));
      global.io
        .to(global.tabletServersID[1])
        .emit('setRows', tabletServerInit.tabletServersData.slice(2, 4));
    }
  }

  soc.on('disconnect', function() {
    const s = this;
    if (s.request._query.type === 'Tablet') {
      global.serverCount--;
      master.ServerDisconnected(s, soc.id);
    }
  });

  soc.on('logs', function(logString) {
    master.handleLogs(false, logString);
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
