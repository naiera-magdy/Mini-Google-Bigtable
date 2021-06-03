const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socket = require('socket.io');

const app = require('../app');
const Show = require('../models/showModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

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
const tabletsData = [];

const send = async () => {
  const data = await Show.find({}).sort('show_id');

  const tabletServerPortion = Math.round(data.length / NUMBER_OF_TABLETS);

  for (let i = 0; i < NUMBER_OF_TABLETS; i++) {
    tabletsData.push(
      data.slice(i * tabletServerPortion, (i + 1) * tabletServerPortion)
    );
  }

  console.log(tabletServerPortion);

  io.emit('message', tabletsData);
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
