/* eslint-disable */
$(document).ready(function() {
  // Socket Connections
  const TabletServer1 = io('http://localhost:3000');
  //   const TabletServer2 = io('http://localhost:3001');
  // const MasterServer = io('http://localhost:3002');

  const Tabletcache = {};

  // Socket events for Master
  //   MasterServer.on('newcache', data => {
  //     Tabletcache = data;
  //   });

  // Socket events for TabletServer 1
  TabletServer1.on('readRows', data => {
    console.log(data);
  });
  TabletServer1.on('setCells', data => {
    console.log(data);
  });
  TabletServer1.on('deleteCells', data => {
    console.log(data);
  });
  TabletServer1.on('deleteRow', data => {
    console.log(data);
  });
  TabletServer1.on('addRow', data => {
    console.log(data);
  });

  // Socket events for TabletServer 2
  //   TabletServer2.on('readRows', data => {
  //     console.log(data);
  //   });
  //   TabletServer2.on('setCells', data => {
  //     console.log(data);
  //   });
  //   TabletServer2.on('deleteCells', data => {
  //     console.log(data);
  //   });
  //   TabletServer2.on('deleteRow', data => {
  //     console.log(data);
  //   });
  //   TabletServer2.on('addRow', data => {
  //     console.log(data);
  //   });

  // Radio Button Change html dynamically
  $('#mainChoice').change(function() {
    let radioValue = $("input[name='options']:checked").val();

    $('#setrow').css('display', 'none');
    $('#deletecell').css('display', 'none');
    $('#deleterow').css('display', 'none');
    $('#addrow').css('display', 'none');
    $('#readrow').css('display', 'none');

    $(`#${radioValue}`).css('display', 'flex');
  });

  $('#setrowaddcolumn').click(function(e) {
    e.preventDefault();
    $('#setrowinputs').append(
      `<div class="form-row mt-2">
            <div class="col">
                <input type="text" class="form-control column" placeholder="Column">
            </div>
            <div class="col">
                <input type="text" class="form-control value" placeholder="Value">
            </div>
        </div>`
    );
  });

  $('#deletecelladdcolumn').click(function(e) {
    e.preventDefault();
    $('#deletecellinputs').append(
      `<input type="text" class="form-control mt-2 column" placeholder="Column">`
    );
  });

  $('#deleterowaddcolumn').click(function(e) {
    e.preventDefault();
    $('#deleterowinputs').append(
      `<input type="text" class="form-control mt-2 rowkey" placeholder="Row Key">`
    );
  });

  $('#addrowaddcolumn').click(function(e) {
    e.preventDefault();
    $('#addrowinputs').append(
      `<div class="form-row mt-2">
                <div class="col">
                    <input type="text" class="form-control column" placeholder="Column">
                </div>
                <div class="col">
                    <input type="text" class="form-control value" placeholder="Value">
                </div>
            </div>`
    );
  });

  $('#readrowaddcolumn').click(function(e) {
    e.preventDefault();
    $('#readrowinputs').append(
      `<input type="text" class="form-control mt-2 rowkey" placeholder="Row Key">`
    );
  });

  // Submit button get the values of the payload
  $('#submitbtn').click(function(e) {
    e.preventDefault();
    let radioValue = $("input[name='options']:checked").val();
    let objectToSend;

    // Set Rows
    if (radioValue === 'setrow') {
      let rowkey = $('#setrowkey').val();
      let columnarray = [];
      $('#setrow .column').each(function(el) {
        columnarray.push($(this).val());
      });
      let valarray = [];
      $('#setrow .value').each(function(el) {
        valarray.push($(this).val());
      });

      objectToSend = {};
      objectToSend['show_id'] = rowkey;
      columnarray.forEach((key, i) => (objectToSend[key] = valarray[i]));

      let socket =
        rowkey >= Tabletcache[0].start && rowkey <= Tabletcache[0].end
          ? TabletServer1
          : TabletServer2;
      socket.emit('show:Set', objectToSend);
    }
    // Delete Cells
    else if (radioValue === 'deletecell') {
      let rowkey = $('#deletecellkey').val();
      let columnarray = [];
      $('#deletecell .column').each(function(el) {
        columnarray.push($(this).val());
      });

      objectToSend = {};
      objectToSend['show_id'] = rowkey;
      objectToSend['fields'] = [...columnarray];

      let socket =
        rowkey >= Tabletcache[0].start && rowkey <= Tabletcache[0].end
          ? TabletServer1
          : TabletServer2;
      socket.emit('show:DeleteCells', objectToSend);
    }
    // Delete Rows
    else if (radioValue === 'deleterow') {
      let tabletArray1,
        tabletArray2 = [];
      $('#deleterow .rowkey').each(function(el) {
        if (
          $(this).val() >= Tabletcache[0].start &&
          rowkey <= Tabletcache[0].end
        ) {
          tabletArray1.push($(this).val());
        } else tabletArray2.push($(this).val());
      });

      objectToSend = [...tabletArray1, ...tabletArray2];

      if (tabletArray1.length())
        TabletServer1.emit('show:DeleteRow', tabletArray1);
      if (tabletArray2.length())
        TabletServer2.emit('show:DeleteRow', tabletArray2);
    }
    // Add Row
    else if (radioValue === 'addrow') {
      let rowkey = $('#addrowkey').val();
      let columnarray = [];
      $('#addrow .column').each(function(el) {
        columnarray.push($(this).val());
      });
      let valarray = [];
      $('#addrow .value').each(function(el) {
        valarray.push($(this).val());
      });

      objectToSend = {};
      objectToSend['show_id'] = rowkey;
      columnarray.forEach((key, i) => (objectToSend[key] = valarray[i]));

      let socket =
        rowkey >= Tabletcache[0].start && rowkey <= Tabletcache[0].end
          ? TabletServer1
          : TabletServer2;
      socket.emit('show:AddRow', objectToSend);
    }
    // Read Rows
    else if (radioValue === 'readrow') {
      let tabletArray1,
        tabletArray2 = [];
      $('#readrow .rowkey').each(function(el) {
        if (
          $(this).val() >= Tabletcache[0].start &&
          rowkey <= Tabletcache[0].end
        ) {
          tabletArray1.push($(this).val());
        } else tabletArray2.push($(this).val());
      });

      objectToSend = [...tabletArray1, ...tabletArray2];

      if (tabletArray1.length())
        TabletServer1.emit('show:DeleteRow', tabletArray1);
      if (tabletArray2.length())
        TabletServer2.emit('show:DeleteRow', tabletArray2);
    }

    $('#main').html(
      `${JSON.stringify(
        objectToSend
      )} <div id="response"> </div> <button class="btn btn-primary mt-3" onclick="window.location.reload(true)">Restart</button>`
    );
  });
});
