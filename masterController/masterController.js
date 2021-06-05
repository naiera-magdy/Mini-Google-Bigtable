const Show = require('../models/showModel');

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

exports.initialize = async function() {
  const data = await Show.find({}).sort('title');

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

  return { tabletServersData, tabletServersMetaData };
};

exports.handleServerRequsets = async function(data) {
  // Delete operation
  for (const show of data) {
    switch (show.type) {
      case 'delete':
        for (const showid in show.show_id) {
          try {
            const res = await Show.findOneAndRemove({ show_id: showid });
          } catch (err) {
            console.log(err);
          }
        }
        break;
      case 'update':
        try {
          const res = await Show.updateOne(
            { show_id: show.show_id },
            show.data
          );
        } catch (err) {
          console.log(err);
        }
        break;
      default:
        try {
          const res = await Show.create(show.data);
        } catch (err) {
          console.log(err);
        }
        break;
    }
  }
};

exports.CheckServersBalancePeriodically = async function() {
  const socket = this;

  setInterval(async function() {
    let counter = 0;
    let data2;
    if (socket.engine.clientsCount === 2) {
      socket.to(tabletServersID[0]).emit('checkBalance');
      socket.to(tabletServersID[1]).emit('checkBalance');
      socket.on('checkBalanceResponse', async data => {
        counter++;
        if (counter === 1) {
          data2 = data;
        }
        if (counter === 2) {
          await handleServerRequsets(data2.changelog);
          await handleServerRequsets(data.changelog);
          if (
            data.total_count / data2.total_count < 0.5 ||
            data.total_count / data2.total_count > 2
          ) {
            initialize();
          }
        }
      });
    }
  }, 10000);
};

exports.ServerDisconnected = async function(disconnectedID) {
  const socket = this;
  if (tabletServersID[0] === disconnectedID) {
    socket.to(tabletServersID[1]).emit('setRows', tabletServersData);
    tabletServersMetaData[2].start = 'A';
    tabletServersMetaData[3].end = 'Z';
  } else {
    socket.to(tabletServersID[0]).emit('setRows', tabletServersData);
    tabletServersMetaData[0].start = 'A';
    tabletServersMetaData[1].end = 'Z';
  }
  socket.emit('setMetaData', tabletServersMetaData);
};
