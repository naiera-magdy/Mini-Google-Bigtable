const Show = require('../models/showModel');

// eslint-disable-next-line prefer-const
global.GLOBAL_CHANGELOG = [];

exports.setCells = async function(data) {
  const socket = this;
  try {
    const id = data.title;
    // eslint-disable-next-line dot-notation
    delete data['title'];
    // console.log(data);
    const res = await Show.updateOne({ title: id }, data);
    global.GLOBAL_CHANGELOG.push({
      type: 'update',
      title: id,
      data
    });
    console.log(global.GLOBAL_CHANGELOG);
    socket.emit('setCells', res);
  } catch (err) {
    console.log(err);
    socket.emit('setCells', "Error can't complete the query");
  }
};

exports.deleteCells = async function(data) {
  const socket = this;
  try {
    const id = data.title;
    // eslint-disable-next-line dot-notation
    delete data['title'];
    const fields = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const field of data.fields) {
      fields[field] = 1;
    }
    // console.log(fields);

    const res = await Show.updateOne({ title: id }, { $unset: fields });
    global.GLOBAL_CHANGELOG.push({
      type: 'update',
      title: id,
      data: {
        $unset: fields
      }
    });
    console.log(global.GLOBAL_CHANGELOG);
    socket.emit('deleteCells', res);
  } catch (err) {
    console.log(err);
    socket.emit('deleteCells', "Error can't complete the query");
  }
};

exports.deleteRow = async function(ids) {
  const socket = this;
  try {
    const res = await Show.deleteMany({ title: ids });
    global.GLOBAL_CHANGELOG.push({
      type: 'delete',
      title: ids
    });
    console.log(global.GLOBAL_CHANGELOG);
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
      title: data.title,
      data
    });
    console.log(global.GLOBAL_CHANGELOG);
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
    console.log(id);
    const data = await Show.find({ title: id });
    socket.emit('readRows', data);
    console.log(global.GLOBAL_CHANGELOG);
  } catch (err) {
    console.log(err);
    socket.emit('setCells', "Error can't complete the query");
  }
};
