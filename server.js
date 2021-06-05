const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socket = require('socket.io');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const master = require('./masterController/masterController');

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'))
  .catch(err => console.log(err));

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socket(server);

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

let tabletServersData,
  tabletServersMetaData = master.initialize();
let serverCount = 0;
io.on('connection', async soc => {
  console.log(`User connected from socket id = ${soc.id}`);
  if (soc.request._query.type == 'Client') {
    io.emit('newcache', tabletServersMetaData);
  } else {
    master.tabletServersID.push(soc.id);
    serverCount++;
    if (serversCount == 2) {
      io.to(socketId[0]).emit('setRows', tabletServersData.slice(0, 1));
      io.to(socketId[1]).emit('setRows', tabletServersData.slice(2, 3));
    }
  }

  soc.on('disconnect', function() {
    master.ServerDisconnected(soc.id);
  });
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
