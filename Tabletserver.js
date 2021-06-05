const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socket = require('socket.io');
// const Show = require('./models/showModel');

const app = require('./app');
const showController = require('./controllers/showController');
const tabletMasterController = require('./controllers/tabletMasterController');

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

io.on('connection', async soc => {
  // console.log(soc.request._query);
  // From Master
  // let shows = await Show.find({release_year: "2000"});
  // let shows2 = await Show.find({release_year: "2020"});
  // soc.emit('setTablets', [shows, shows2]);

  // soc.emit('getChangelog');
  // soc.on('changelog', (data) => {
  // console.log(data);
  // });

  console.log(`User connected from socket id = ${soc.id}`);
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

tabletMasterController.connectMaster();
