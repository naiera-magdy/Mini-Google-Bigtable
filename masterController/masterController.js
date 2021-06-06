const fs = require('fs');
const Show = require('../models/showModel');

const logger = fs.createWriteStream('log.txt', {
  flags: 'a'
});
// EMITS Required for client
// 1- setMetaData

// EMITS Required for Server
// 2- sendAllRows
// 3- setRows

global.tabletServersID = [];

const NUMBER_OF_TABLETS = 4;
global.tabletServersMetaDataSent = [];
global.tabletServersData = [[], [], [], []];

const handleLogs = function(isMaster, logSting, soc) {
  if (isMaster) {
    logger.write(`${Date.now()} : Master : ${logSting} \n`);
  } else if (soc.request._query.type === 'Tablet') {
    const serverNumber = global.urls[0] === soc.request._query.url ? '1' : '2';
    logger.write(`${Date.now()} : Tablet ${serverNumber} : ${logSting} \n`);
  } else {
    logger.write(`${Date.now()} : Client ${soc.id} : ${logSting} \n`);
  }
};

exports.handleLogs = handleLogs;

const initialize = async function() {
  global.tabletServersData = [[], [], [], []];

  const data = await Show.find({}, { _id: 0 }).sort('title');

  const oneServerTabletLen = Math.floor(data.length / NUMBER_OF_TABLETS);

  const tablet1 = data.slice(0, oneServerTabletLen + 1);
  const tablet2 = data.slice(
    oneServerTabletLen + 1,
    oneServerTabletLen * 2 + 1
  );
  const tablet3 = data.slice(
    oneServerTabletLen * 2 + 1,
    oneServerTabletLen * 3 + 1
  );
  const tablet4 = data.slice(
    oneServerTabletLen * 3 + 1,
    oneServerTabletLen * 4 + 1
  );

  global.tabletServersMetaDataSent = [
    {
      Start: '',
      End: tablet2[tablet2.length - 1].title
    },
    {
      Start: tablet3[0].title,
      End: '~'
    }
  ];

  global.tabletServersData = [tablet1, tablet2, tablet3, tablet4];
};
exports.initialize = initialize;

const handleServerRequsets = async function(data) {
  // Delete operation
  for (const show of data) {
    switch (show.type) {
      case 'delete':
        try {
          await Show.deleteMany({ title: show.title });
        } catch (err) {
          console.log(err);
        }
        break;
      case 'update':
        try {
          await Show.updateOne({ title: show.title }, show.data);
        } catch (err) {
          console.log(err);
        }
        break;
      default:
        try {
          await Show.create(show.data);
        } catch (err) {
          console.log(err);
        }
        break;
    }
  }
};

let counter = 0;
let data2;

exports.CheckServersBalancePeriodically = async function() {
  setInterval(async function() {
    console.log('check Balance');
    handleLogs(true, 'Checking Balance ... ');
    if (global.serverCount === 2) {
      counter = 0;
      global.io.to(global.tabletServersID[0]).emit('checkBalance');
      global.io.to(global.tabletServersID[1]).emit('checkBalance');
    }
  }, 20000);
};

exports.ServerDisconnected = async function(socket, disconnectedID) {
  if (global.tabletServersID[0] === disconnectedID) {
    global.io
      .to(global.tabletServersID[1])
      .emit('setRows', global.tabletServersData);
  } else {
    global.io
      .to(global.tabletServersID[0])
      .emit('setRows', global.tabletServersData);
  }

  global.tabletServersMetaDataSent[0].Start = '';
  global.tabletServersMetaDataSent[0].End = '~';

  if (global.urls[0] === socket.request._query.url) {
    global.urls = [global.urls[1]];
    handleLogs(true, 'Tablet 1 Disconnected');
  } else {
    global.urls = [global.urls[0]];
    handleLogs(true, 'Tablet 2 Disconnected');
  }

  console.log(global.tabletServersMetaDataSent[0]);

  global.io.emit('newcache', {
    urls: global.urls,
    data: [global.tabletServersMetaDataSent[0]]
  });
};

exports.checkBalanceResponse = async function(data) {
  counter++;
  console.log(counter);
  if (counter === 1) {
    data2 = data;
  }
  if (counter === 2) {
    console.log(data.changelog);
    console.log(data2.changelog);

    handleLogs(true, 'Handling Tablet 1 change-log ...');
    await handleServerRequsets(data2.changelog);
    handleLogs(true, 'Handling Tablet 2 change-log ...');
    await handleServerRequsets(data.changelog);

    console.log(
      `Difference between 2 data:${Math.abs(
        data.total_count - data2.total_count
      )}`
    );
    if (Math.abs(data.total_count - data2.total_count) > 100) {
      handleLogs(true, 'Re-balancing DB ... ');
      await initialize();
      handleLogs(true, 'Sending new Met-Data');

      global.io.emit('newcache', {
        urls: global.urls,
        data: global.tabletServersMetaDataSent
      });

      handleLogs(true, 'Sending Re-balanced DB');
      global.io
        .to(global.tabletServersID[0])
        .emit('setRows', global.tabletServersData.slice(0, 2));
      global.io
        .to(global.tabletServersID[1])
        .emit('setRows', global.tabletServersData.slice(2, 4));
    }
  }
};
