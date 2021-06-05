/* eslint-disable */
$(document).ready(function() {
  // Socket Connections

  const TabletServer1 = io('http://102.42.73.114:3000', {
    query: {
      type: 'Client'
    }
  });
  //   const TabletServer2 = io('http://localhost:3001', {
  //     query: {
  //       type: 'Client'
  //     }
  //   });
  const MasterServer = io('http://156.208.67.226:3000', {
    query: {
      type: 'Client'
    }
  });

  const Tabletcache = [
    { Start: 'A', End: 'D' },
    { Start: 'E', End: 'K' },
    { Start: 'L', End: 'P' },
    { Start: 'Q', End: 'Z' }
  ];

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

      //   let socket =
      //     rowkey[0] >= Tabletcache[0].Start && rowkey[0] <= Tabletcache[1].End
      //       ? TabletServer1
      //       : TabletServer2;
      //   socket.emit('show:Set', objectToSend);
      TabletServer1.emit('show:Set', objectToSend);
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

      //   let socket =
      //     rowkey[0] >= Tabletcache[0].Start && rowkey[0] <= Tabletcache[1].End
      //       ? TabletServer1
      //       : TabletServer2;
      //   socket.emit('show:DeleteCells', objectToSend);
      TabletServer1.emit('show:DeleteCells', objectToSend);
    }
    // Delete Rows
    else if (radioValue === 'deleterow') {
      let tabletArray1 = [],
        tabletArray2 = [];
      $('#deleterow .rowkey').each(function(el) {
        tabletArray1.push($(this).val());
        // if (
        //   $(this).val()[0] >= Tabletcache[0].Start &&
        //   $(this).val()[0] <= Tabletcache[1].End
        // ) {
        //   tabletArray1.push($(this).val());
        // } else tabletArray2.push($(this).val());
      });

      objectToSend = [...tabletArray1, ...tabletArray2];

      if (tabletArray1.length)
        TabletServer1.emit('show:DeleteRow', tabletArray1);
      //   if (tabletArray2.length())
      //     TabletServer2.emit('show:DeleteRow', tabletArray2);
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

      //   let socket =
      //     rowkey[0] >= Tabletcache[0].Start && rowkey[0] <= Tabletcache[1].End
      //       ? TabletServer1
      //       : TabletServer2;
      //   socket.emit('show:AddRow', objectToSend);
      TabletServer1.emit('show:AddRow', objectToSend);
    }
    // Read Rows
    else if (radioValue === 'readrow') {
      let tabletArray1 = [],
        tabletArray2 = [];
      $('#readrow .rowkey').each(function(el) {
        tabletArray1.push($(this).val());
        // if (
        //   $(this).val()[0] >= Tabletcache[0].Start &&
        //   $(this).val()[0] <= Tabletcache[1].End
        // ) {
        //   tabletArray1.push($(this).val());
        // } else tabletArray2.push($(this).val());
      });

      objectToSend = [...tabletArray1, ...tabletArray2];

      if (tabletArray1.length)
        TabletServer1.emit('show:ReadRows', tabletArray1);
      //   if (tabletArray2.length())
      //     TabletServer2.emit('show:ReadRows', tabletArray2);
    }

    // Display response page
    $('#objectSend').html(JSON.stringify(objectToSend));
    $('#response').css('display', 'flex');
    $('#main').css('display', 'none');

    // Reset the Main Page
    $(
      '#setrowinputs'
    ).html(`<input type="text" class="form-control" id="setrowkey" placeholder="Please Enter Row Key">

        <div class="form-row mt-2">
            <div class="col">
                <input type="text" class="form-control column" placeholder="Column">
            </div>
            <div class="col">
                <input type="text" class="form-control value" placeholder="Value">
            </div>
        </div>`);
    $(
      '#deletecellinputs'
    ).html(`<input type="text" class="form-control" id="deletecellkey" placeholder="Please Enter Row Key">
        <input type="text" class="form-control mt-2 column" placeholder="Column">`);
    $('#deleterowinputs').html(
      `<input type="text" class="form-control rowkey" placeholder="Row Key">`
    );
    $(
      '#addrowinputs'
    ).html(`<input type="text" class="form-control" id="addrowkey" placeholder="Please Enter Row Key">
        <div class="form-row mt-2">
            <div class="col">
                <input type="text" class="form-control column" placeholder="Column">
            </div>
            <div class="col">
                <input type="text" class="form-control value" placeholder="Value">
            </div>
        </div>`);
    $('#readrowinputs').html(
      `<input type="text" class="form-control rowkey" placeholder="Row Key">`
    );
  });

  // Add events
  $('#restart').click(function() {
    $('#response').css('display', 'none');
    $('#main').css('display', 'flex');
  });
});
