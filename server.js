const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socket = require('socket.io');

const app = require('./app');
const showController = require('./controllers/showController');

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
const io = socket(server, {
  cors: {
    origin: '*'
  }
});

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// const send = async () => {
//   const data = await Show.find({ release_year: '2020' });
//   io.emit('message', data);
// };

io.on('connection', soc => {
  console.log(`User connected from socket id = ${soc.id}`);
  // send();
  soc.on('show:Set', showController.setCells);
  soc.on('show:DeleteCells', showController.deleteCells);
  soc.on('show:DeleteRow', showController.deleteRow);
  soc.on('show:AddRow', showController.addRow);
  soc.on('show:ReadRows', showController.readRow);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
