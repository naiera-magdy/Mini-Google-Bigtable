const Show = require('../models/showModel');
const fs = require('fs');
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
const tabletServersMetaData = [];
const tabletServersData = [[], [], [], []];
const allTabletsData = [];
const alphabets = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
];

const initialize = async function() {
  tabletServersMetaData = [];
  tabletServersData = [[], [], [], []];
  allTabletsData = [];

  const data = await Show.find({}, { _id: 0 }).sort('title');

  let totalLengthMovies = 0;
  for (let i = 0; i < alphabets.length; i++) {
    allTabletsData.push(
      data.filter(x => x.title[0].toUpperCase() === alphabets[i])
    );
    totalLengthMovies += allTabletsData[i].length;
  }

  let alphabetIndex = 0;
  for (let i = 0; i < NUMBER_OF_TABLETS; i++) {
    let commulativeSum = 0;
    const start = alphabets[alphabetIndex];
    while (
      commulativeSum < totalLengthMovies / (NUMBER_OF_TABLETS + 1) &&
      alphabetIndex < 26
    ) {
      commulativeSum += allTabletsData[alphabetIndex].length;
      tabletServersData[i].push(...allTabletsData[alphabetIndex]);
      alphabetIndex++;
    }
    const end = alphabets[alphabetIndex - 1];

    tabletServersMetaData.push({
      Start: start,
      End: end
    });
  }

  while (alphabetIndex !== 26) {
    tabletServersData[3].push(...allTabletsData[alphabetIndex]);

    alphabetIndex++;
  }

  tabletServersMetaData[3].End = 'Z';

  const tabletServersMetaDataSent = [
    {
      Start: tabletServersMetaData[0].Start,
      End: tabletServersMetaData[1].End
    },
    {
      Start: tabletServersMetaData[2].Start,
      End: tabletServersMetaData[3].End
    }
  ];
  return { tabletServersData, tabletServersMetaDataSent };
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
    master.handleLogs(true, 'Checking Balance ... ');
    if (global.serverCount === 2) {
      counter = 0;
      global.io.to(global.tabletServersID[0]).emit('checkBalance');
      global.io.to(global.tabletServersID[1]).emit('checkBalance');
    }
  }, 20000);
};

exports.ServerDisconnected = async function(socket, disconnectedID) {
  // const socket = this;
  if (global.tabletServersID[0] === disconnectedID) {
    global.io.to(global.tabletServersID[1]).emit('setRows', tabletServersData);
  } else {
    global.io.to(global.tabletServersID[0]).emit('setRows', tabletServersData);
  }

  tabletServersMetaData[0].Start = 'A';
  tabletServersMetaData[0].End = 'Z';

  if (global.urls[0] === socket.request._query.url) {
    global.urls = [global.urls[1]];
    master.handleLogs(true, 'Tablet 1 Disconnected');
  } else {
    global.urls = [global.urls[0]];
    master.handleLogs(true, 'Tablet 2 Disconnected');
  }

  socket.emit('newcache', {
    urls: global.urls,
    data: [tabletServersMetaData[0]]
  });
};

exports.checkBalanceResponse = async function(data) {
  const socket = this;
  counter++;
  console.log(counter);
  if (counter === 1) {
    data2 = data;
  }
  if (counter === 2) {
    console.log(data.changelog);
    console.log(data2.changelog);

    master.handleLogs(true, 'Handling Tablet 1 change-log ...');
    await handleServerRequsets(data2.changelog);
    master.handleLogs(true, 'Handling Tablet 2 change-log ...');
    await handleServerRequsets(data.changelog);

    if (Math.abs(data.total_count - data2.total_count) > 300) {
      master.handleLogs(true, 'Re-balancing DB ... ');
      const dataBalanced = await initialize();
      master.handleLogs(true, 'Sending new Met-Data');

      socket.emit('newcache', {
        urls: global.urls,
        data: dataBalanced.tabletServersMetaDataSent
      });

      master.handleLogs(true, 'Sending Re-balanced DB');
      global.io
        .to(global.tabletServersID[0])
        .emit('setRows', dataBalanced.tabletServersData.slice(0, 2));
      global.io
        .to(global.tabletServersID[1])
        .emit('setRows', dataBalanced.tabletServersData.slice(2, 4));
    }
  }
};

exports.handleLogs = function(isMaster, logSting) {
  const socket = this;
  if (isMaster) {
    logger.write(Date.now() + ' : Master : ' + logSting);
  } else {
    if (socket.request._query.Type === 'Tablet') {
      const serverNumber =
        global.urls[0] === socket.request._query.url ? '1' : '2';
      logger.write(Date.now() + ' : Tablet ' + serverNumber + ' : ' + logSting);
    } else {
      logger.write(Date.now() + ' : Client ' + socket.id + ' : ' + logSting);
    }
  }
};
