const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socket = require('socket.io');

const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const app = require('./app');
const Show = require('./models/showModel');

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

//////////////// LOGIC ////////////////

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

const send = async () => {
  const data = await Show.find({}).sort('title');

  let totalLengthMovies = 0;
  for (let i = 0; i < alphabets.length; i++) {
    allTabletsData.push(
      data.filter(x => x.title[0].toUpperCase() === alphabets[i])
    );
    totalLengthMovies += allTabletsData[i].length;
  }
  console.log(totalLengthMovies);

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

  io.emit('message', tabletServersData);
};

io.on('connection', soc => {
  console.log(`User connected from socket id = ${soc.id}`);
  send();
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
