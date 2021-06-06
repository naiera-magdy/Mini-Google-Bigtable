const socket = require('socket.io-client');
const Show = require('../models/showModel');

const sendlog = function(logs) {
  global.masterSocket.emit('logs', logs);
};
exports.sendlog = sendlog;

exports.connectMaster = function() {
  global.masterSocket = socket.connect(`${process.env.MASTER_URL}`, {
    query: {
      url: `${process.env.TABLET_URL}`,
      type: 'Tablet'
    }
  });

  global.masterSocket.on('setRows', async data => {
    sendlog(
      `Received ${data.length} Tablets from Master with sizes ${data[0].length} and ${data[1].length} rows`
    );
    console.log('Database received');
    await Show.deleteMany();
    // eslint-disable-next-line no-restricted-syntax
    for (const tablet of data) {
      // eslint-disable-next-line no-await-in-loop
      await Show.create(tablet);
    }
  });

  global.masterSocket.on('checkBalance', async () => {
    sendlog('Master Asked for the changelog');
    console.log('Master Asked for the changelog');
    const count = await Show.countDocuments();
    global.masterSocket.emit('checkBalanceResponse', {
      total_count: count,
      changelog: global.GLOBAL_CHANGELOG
    });
    global.GLOBAL_CHANGELOG = [];
  });
};
