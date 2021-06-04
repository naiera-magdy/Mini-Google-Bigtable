const Show = require('../models/showModel');

// eslint-disable-next-line prefer-const
global.GLOBAL_CHANGELOG = [];

exports.setCells = async function(data) {
  const socket = this;
  try {
    const id = data.show_id;
    // eslint-disable-next-line dot-notation
    delete data['show_id'];
    // console.log(data);
    const res = await Show.updateOne({ show_id: id }, data);
    global.GLOBAL_CHANGELOG.push({
      type: 'update',
      show_id: id,
      data
    });
    socket.emit('setCells', res);
  } catch (err) {
    console.log(err);
    socket.emit('setCells', "Error can't complete the query");
  }
};

exports.deleteCells = async function(data) {
  const socket = this;
  try {
    const id = data.show_id;
    // eslint-disable-next-line dot-notation
    delete data['show_id'];
    const fields = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const field of data.fields) {
      fields[field] = 1;
    }
    // console.log(fields);

    const res = await Show.updateOne({ show_id: id }, { $unset: fields });
    global.GLOBAL_CHANGELOG.push({
      type: 'update',
      show_id: id,
      data: {
        $unset: fields
      }
    });
    socket.emit('deleteCells', res);
  } catch (err) {
    console.log(err);
    socket.emit('deleteCells', "Error can't complete the query");
  }
};

exports.deleteRow = async function(ids) {
  const socket = this;
  try {
    const res = await Show.deleteMany({ show_id: ids });
    global.GLOBAL_CHANGELOG.push({
      type: 'delete',
      show_id: ids
    });
    socket.emit('deleteRow', res);
  } catch (err) {
    console.log(err);
    socket.emit('deleteRow', "Error can't complete the query");
  }
};

exports.addRow = async function(data) {
  const socket = this;
  try {
    const res = await Show.create(data);
    global.GLOBAL_CHANGELOG.push({
      type: 'insert',
      show_id: data.show_id,
      data
    });
    socket.emit('addRow', res);
  } catch (err) {
    console.log(err);
    socket.emit(
      'addRow',
      'Duplicate key error please make sure to provide a unique id'
    );
  }
};

exports.readRow = async function(id) {
  const socket = this;
  try {
    const data = await Show.find({ show_id: id });
    socket.emit('readRows', data);
    console.log(global.GLOBAL_CHANGELOG);
  } catch (err) {
    console.log(err);
    socket.emit('setCells', "Error can't complete the query");
  }
};