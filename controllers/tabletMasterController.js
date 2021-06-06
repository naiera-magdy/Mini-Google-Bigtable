const socket = require('socket.io-client');
const Show = require('../models/showModel');

exports.connectMaster = function() {
  const masterSocket = socket.connect(`${process.env.MASTER_URL}`, {
    query: {
      url: `${process.env.TABLET_URL}`,
      type: 'Tablet'
    }
  });

  masterSocket.on('setRows', async data => {
    console.log('Database received');
    await Show.deleteMany();
    // eslint-disable-next-line no-restricted-syntax
    for (const tablet of data) {
      // eslint-disable-next-line no-await-in-loop
      await Show.create(tablet);
    }
  });

  masterSocket.on('checkBalance', async () => {
    console.log('Master Asked for the changelog');
    const count = await Show.countDocuments();
    masterSocket.emit('checkBalanceResponse', {
      total_count: count,
      changelog: global.GLOBAL_CHANGELOG
    });
    global.GLOBAL_CHANGELOG = [];
  });
};
