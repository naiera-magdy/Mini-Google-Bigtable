const socket = require('socket.io-client');
const Show = require('../models/showModel');

exports.connectMaster = function() {
  const masterSocket = socket.connect('http://localhost:3001', {
    query: {
      type: 'Tablet'
    }
  });

  masterSocket.on('setRows', async data => {
    console.log('Database received');
    await Show.delete();
    for (const tablet of data) {
      await Show.create(tablet);
    }
  });

  masterSocket.on('checkBalance', async () => {
    const count = await Show.count();
    masterSocket.emit('checkBalanceResponse', {
      total_count: count,
      changelog: global.GLOBAL_CHANGELOG
    });
    global.GLOBAL_CHANGELOG = [];
  });
};