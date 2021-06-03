const Show = require('../models/showModel');

exports.setCells = function() {};
exports.deleteCells = function() {};
exports.deleteRow = function() {};
exports.addRow = function() {};
exports.readRow = async function(id) {
  const data = await Show.find({ show_id: id });
  const socket = this;
  socket.emit('readRows', data);
};
