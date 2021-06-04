const Show = require('../models/showModel');

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

  console.log(data[0]);

  return { tabletServersData, tabletServersMetaData };
};

exports.handleServerRequsets = async function(data) {
  // Delete operation
  for (const showID of data.delete) {
    try {
      const res = await Show.findOneAndRemove({ show_id: showID });
    } catch (err) {
      console.log(err);
    }

    // Insert Operation
    for (const show of data.update) {
      console.log(show);
      try {
        const res = await Show.updateMany({ show_id: 's3' }, show);
      } catch (err) {
        console.log(err);
      }
    }

    // Add Operation
    for (const show of data.insert) {
      try {
        const res = await Show.create(show);
      } catch (err) {
        console.log(err);
      }
    }
  }
};
