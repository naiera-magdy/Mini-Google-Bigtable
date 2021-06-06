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

const initialize = async function() {
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

  return { tabletServersData, tabletServersMetaData };
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
    tabletServersMetaData[2].Start = 'A';
    tabletServersMetaData[3].End = 'Z';
  } else {
    global.io.to(global.tabletServersID[0]).emit('setRows', tabletServersData);
    tabletServersMetaData[0].Start = 'A';
    tabletServersMetaData[1].End = 'Z';
  }
  socket.emit('setMetaData', tabletServersMetaData);
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
    await handleServerRequsets(data2.changelog);
    await handleServerRequsets(data.changelog);
    if (
      data.total_count / data2.total_count < 0.5 ||
      data.total_count / data2.total_count > 2
    ) {
      initialize();
    }
  }
};
