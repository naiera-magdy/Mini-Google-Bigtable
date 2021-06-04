const socket = require('socket.io-client');

exports.connectMaster = function() {
  const masterSocket = socket.connect('http://localhost:3001', {
    query: {
      type: 'Tablet'
    }
  });

  //   Need to change metadata to the name of the event that recieves the tablets
  masterSocket.on('metadata', data => {
    console.log(data);
  });
};
