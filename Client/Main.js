/* eslint-disable */

$(document).ready(function () {
  // Socket Connections

  let log;
  let TabletServer1;
  let TabletServer2;
  let NUMBER_OF_SERVERS;
  const MasterServer = io('http://156.208.67.226:3000/', {
    query: {
      type: 'Client'
    }
  });

  let Tabletcache = [];

  // Socket events for Master
  MasterServer.on('newcache', data => {

    // Log to Master
    log = `Received New Cache From Master`;
    MasterServer.emit("logs", log);

    console.log(data);
    NUMBER_OF_SERVERS = data.urls.length;
    if (NUMBER_OF_SERVERS === 2) {
      TabletServer1 = io(data.urls[0] || 'http://localhost:3001');
      TabletServer2 = io(data.urls[1] || 'http://localhost:3002');
    } else {
      TabletServer1 = io(data.urls[0] || 'http://localhost:3001');
    }
    Tabletcache = data.data;

    // Socket events for TabletServer 1
    TabletServer1.on('readRows', data => {
      console.log(data);
      // Log to Master
      log = `Received Query Respone`;
      MasterServer.emit("logs", log);
    });
    TabletServer1.on('setCells', data => {
      console.log(data);
      // Log to Master
      log = `Received Query Respone`;
      MasterServer.emit("logs", log);
    });
    TabletServer1.on('deleteCells', data => {
      console.log(data);
      // Log to Master
      log = `Received Query Respone`;
      MasterServer.emit("logs", log);
    });
    TabletServer1.on('deleteRow', data => {
      console.log(data);
      // Log to Master
      log = `Received Query Respone`;
      MasterServer.emit("logs", log);
    });
    TabletServer1.on('addRow', data => {
      console.log(data);
      // Log to Master
      log = `Received Query Respone`;
      MasterServer.emit("logs", log);
    });

    if (NUMBER_OF_SERVERS === 2) {
      // Socket events for TabletServer 2
      TabletServer2.on('readRows', data => {
        console.log(data);
        // Log to Master
        log = `Received Query Respone`;
        MasterServer.emit("logs", log);
      });
      TabletServer2.on('setCells', data => {
        console.log(data);
        // Log to Master
        log = `Received Query Respone`;
        MasterServer.emit("logs", log);
      });
      TabletServer2.on('deleteCells', data => {
        console.log(data);
        // Log to Master
        log = `Received Query Respone`;
        MasterServer.emit("logs", log);
      });
      TabletServer2.on('deleteRow', data => {
        console.log(data);
        // Log to Master
        log = `Received Query Respone`;
        MasterServer.emit("logs", log);
      });
      TabletServer2.on('addRow', data => {
        console.log(data);
        // Log to Master
        log = `Received Query Respone`;
        MasterServer.emit("logs", log);
      });
    }
  });
  // Radio Button Change html dynamically
  $('#mainChoice').change(function () {
    let radioValue = $("input[name='options']:checked").val();

    $('#setrow').css('display', 'none');
    $('#deletecell').css('display', 'none');
    $('#deleterow').css('display', 'none');
    $('#addrow').css('display', 'none');
    $('#readrow').css('display', 'none');

    $(`#${radioValue}`).css('display', 'flex');
  });

  $('#setrowaddcolumn').click(function (e) {
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

  $('#deletecelladdcolumn').click(function (e) {
    e.preventDefault();
    $('#deletecellinputs').append(
      `<input type="text" class="form-control mt-2 column" placeholder="Column">`
    );
  });

  $('#deleterowaddcolumn').click(function (e) {
    e.preventDefault();
    $('#deleterowinputs').append(
      `<input type="text" class="form-control mt-2 rowkey" placeholder="Row Key">`
    );
  });

  $('#addrowaddcolumn').click(function (e) {
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

  $('#readrowaddcolumn').click(function (e) {
    e.preventDefault();
    $('#readrowinputs').append(
      `<input type="text" class="form-control mt-2 rowkey" placeholder="Row Key">`
    );
  });

  // Submit button get the values of the payload
  $('#submitbtn').click(function (e) {
    e.preventDefault();
    let radioValue = $("input[name='options']:checked").val();
    let objectToSend;

    // Set Rows
    if (radioValue === 'setrow') {
      let rowkey = $('#setrowkey').val();
      let columnarray = [];
      $('#setrow .column').each(function (el) {
        columnarray.push($(this).val());
      });
      let valarray = [];
      $('#setrow .value').each(function (el) {
        valarray.push($(this).val());
      });

      objectToSend = {};
      objectToSend['title'] = rowkey;
      columnarray.forEach((key, i) => (objectToSend[key] = valarray[i]));

      console.log(objectToSend);
      if (NUMBER_OF_SERVERS === 2) {
        console.log("Sending");
        let socket = rowkey <= Tabletcache[0].End
          ? TabletServer1
          : TabletServer2;
        socket.emit('show:Set', objectToSend);
        console.log("Sent");
      } else {
        TabletServer1.emit('show:Set', objectToSend);
      }

      // Log to Master
      log = `Sent Set Row of key ${rowkey}`;
      MasterServer.emit("logs", log);
    }
    // Delete Cells
    else if (radioValue === 'deletecell') {
      let rowkey = $('#deletecellkey').val();
      let columnarray = [];
      $('#deletecell .column').each(function (el) {
        columnarray.push($(this).val());
      });

      objectToSend = {};
      objectToSend['title'] = rowkey;
      objectToSend['fields'] = [...columnarray];

      if (NUMBER_OF_SERVERS === 2) {
        let socket =
          rowkey >= rowkey <= Tabletcache[0].End
            ? TabletServer1
            : TabletServer2;
        socket.emit('show:DeleteCells', objectToSend);
      } else {
        TabletServer1.emit('show:DeleteCells', objectToSend);
      }

      // Log to Master
      log = `Sent Delete Cells of key ${rowkey}`;
      MasterServer.emit("logs", log);
    }
    // Delete Rows
    else if (radioValue === 'deleterow') {
      let tabletArray1 = [],
        tabletArray2 = [];
      $('#deleterow .rowkey').each(function (el) {

        if (NUMBER_OF_SERVERS === 2) {
          if (
            $(this).val() <= Tabletcache[0].End
          ) {
            tabletArray1.push($(this).val());
          } else tabletArray2.push($(this).val());
        } else {
          tabletArray1.push($(this).val());
        }
      });

      if (NUMBER_OF_SERVERS === 2) {
        objectToSend = [...tabletArray1, ...tabletArray2];

        if (tabletArray1.length)
          TabletServer1.emit('show:DeleteRow', tabletArray1);
        if (tabletArray2.length)
          TabletServer2.emit('show:DeleteRow', tabletArray2);
      } else {
        objectToSend = [...tabletArray1];

        if (tabletArray1.length)
          TabletServer1.emit('show:DeleteRow', tabletArray1);
      }


      // Log to Master
      log = `Sent Delete Rows of keys ${objectToSend.toString()}`;
      MasterServer.emit("logs", log);
    }
    // Add Row
    else if (radioValue === 'addrow') {
      let rowkey = $('#addrowkey').val();
      let columnarray = [];
      $('#addrow .column').each(function (el) {
        columnarray.push($(this).val());
      });
      let valarray = [];
      $('#addrow .value').each(function (el) {
        valarray.push($(this).val());
      });

      objectToSend = {};
      objectToSend['title'] = rowkey;
      columnarray.forEach((key, i) => (objectToSend[key] = valarray[i]));

      if (NUMBER_OF_SERVERS === 2) {
        let socket =
          rowkey <= Tabletcache[0].End
            ? TabletServer1
            : TabletServer2;
        socket.emit('show:AddRow', objectToSend);
      } else {
        TabletServer1.emit('show:AddRow', objectToSend);
      }


      // Log to Master
      log = `Sent Add Row of key ${rowkey}`;
      MasterServer.emit("logs", log);
    }
    // Read Rows
    else if (radioValue === 'readrow') {
      let tabletArray1 = [],
        tabletArray2 = [];
      $('#readrow .rowkey').each(function (el) {
        if (NUMBER_OF_SERVERS === 2) {
          if (
            $(this).val() <= Tabletcache[0].End
          ) {
            tabletArray1.push($(this).val());
          } else tabletArray2.push($(this).val());
        } else {
          tabletArray1.push($(this).val());
        }
      });

      if (NUMBER_OF_SERVERS === 2) {

        objectToSend = [...tabletArray1, ...tabletArray2];

        if (tabletArray1.length)
          TabletServer1.emit('show:ReadRows', tabletArray1);
        if (tabletArray2.length)
          TabletServer2.emit('show:ReadRows', tabletArray2);
      } else {
        objectToSend = [...tabletArray1];

        if (tabletArray1.length)
          TabletServer1.emit('show:ReadRows', tabletArray1);
      }


      // Log to Master
      log = `Sent Read Rows of keys ${objectToSend.toString()}`;
      MasterServer.emit("logs", log);
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
  $('#restart').click(function () {
    $('#response').css('display', 'none');
    $('#main').css('display', 'flex');
  });

  // Event On button of Test Case
  $('#deletetestcase').click(TestCaseDeleteLoadBalance);



  // Test Case: Delete Alot 
  function TestCaseDeleteLoadBalance() {
    let tabletArray1 = [];
    let tabletArray2 = [];
    let ArrayToSend = [];
    testBalanceArray.forEach(function (el) {
      if (NUMBER_OF_SERVERS === 2) {
        if (

          el <= Tabletcache[0].End
        ) {
          tabletArray1.push(el);
        } else tabletArray2.push(el);
      } else {
        tabletArray1.push(el);
      }
    });

    if (NUMBER_OF_SERVERS === 2) {

      if (tabletArray1.length)
        TabletServer1.emit('show:DeleteRow', tabletArray1);
      if (tabletArray2.length)
        TabletServer2.emit('show:DeleteRow', tabletArray2);

      ArrayToSend = [...tabletArray1, ...tabletArray2];
    } else {

      if (tabletArray1.length) {
        ArrayToSend = [...tabletArray1];
        TabletServer1.emit('show:DeleteRow', tabletArray1);
      }
    }

    // Log to Master
    log = `Sent Delete Rows of keys ${ArrayToSend.toString()}`;
    MasterServer.emit("logs", log);
  }

});

var testBalanceArray = ["A 2nd Chance", "A Billion Colour Story", "A Bridge Too Far", "A Choo", "A Christmas Special: Miraculous: Tales of Ladybug & Cat Noir", "A Cinderella Story: Christmas Wish", "A Fall from Grace", "A Family Reunion Christmas", "A Futile and Stupid Gesture", "A Go! Go! Cory Carson Summer Camp", "A Good Wife", "A Haunting at Silver Falls: The Return", "A Kid from Coney Island", "A Land Imagined", "A Little Chaos", "A Little Thing Called First Love", "A Love Song for Latasha", "A Mission in an Old Movie", "A Murder in the Park", "A Patch of Fog", "A Plastic Ocean", "A Princess for Christmas", "A Second Chance", "A Series of Unfortunate Events", "A Silent Voice", "A Stoning in Fulham County", "A Sun", "A Thousand Goodnights", "A Trip to Jamaica", "A Very Country Christmas", "A Wednesday", "A Week in Watts", "A Whisker Away", "A Young Doctor's Notebook and Other Stories", "A.M.I.", "Aagey Se Right", "Aapla Manus", "Aashayein", "Abby Hatcher", "ABCD: Any Body Can Dance", "Abdullah, The Final Witness", "About Time", "Abstract: The Art of Design", "Acapulco La vida va", "Across the Universe", "Action Replayy", "Adأ؛", "Adam Ruins Everything", "Adam: His Song Continues", "Aditi Mittal: Things They Wouldn't Let Me Say", "Adrishya", "Afonso Padilha: Classless", "After Life", "After Maria", "Aftermath", "Against the Tide", "Age of Glory", "Agent Raghav", "Aggretsuko: We Wish You a Metal Christmas", "Ai Weiwei: Never Sorry", "Ainu Mosir", "Aitraaz", "Ajaibnya Cinta", "AJIN: Demi-Human", "Ajji", "Al acecho", "Alakada Reloaded", "Albert Pinto Ko Gussa Kyun Aata Hai?", "Alex Fernأ،ndez: The Best Comedian in the World", "Alexa & Katie", "Ali & Alia", "Ali Wong: Hard Knock Wife", "Alias JJ, la celebridad del mal", "Alien Contact: Outer Space", "Alien TV", "Aliens Ate My Homework", "All American", "All Dogs Go to Heaven", "All Hail King Julien: Exiled", "All In My Family", "All of You", "All the Freckles in the World", "All's Well, End's Well (2009)", "Alone", "Alpha and Omega 2: A Howl-iday Adventure", "Alpha and Omega: The Legend of the Saw Tooth Cave", "Altered Carbon: Resleeved", "Always Be My Maybe", "Amar", "Amateur", "Amelia: A Tale of Two Sisters", "American Beauty", "American Experience: Ruby Ridge", "American Factory", "American Honey", "American Horror Story", "American Masters: Ted Williams", "American Son", "Amit Tandon: Family Tandoncies", "Amy", "An American Tail: Fievel Goes West", "An American Tail: The Treasures of Manhattan Island", "An Hour and a Half", "An Interview with God", "An Upper Egyptian", "Anchor Baby", "Ancient Aliens", "Andhadhun", "Anesthesia", "Angel Beats!", "Angela's Christmas Wish", "Anger Management", "Angry Indian Goddesses", "Animal Crackers", "Anitta: Made In Honأ³rio", "Ankhon Dekhi", "Anohana: The Flower We Saw That Day", "Anon", "Ant-Man and the Wasp", "Anthony Bourdain: Parts Unknown", "Anthony Kaun Hai?", "Apache: The Life of Carlos Tevez", "Apostle", "Aram, Aram", "Archibald's Next Big Thing", "Ares", "Argon", "Ari Eldjأ،rn: Pardon My Icelandic", "ARQ", "Arsenio Hall: Smart & Classy", "Article 15", "Asees", "Ashes of Love", "Asperger's Are Us", "Astronomy Club: The Sketch Show", "Asura: The City of Madness", "Athlete A", "Atlantics", "Attack on Titan", "Aunty Donna's Big Ol' House of Fun", "Aussie Gold Hunters", "Autohead", "Autumn's Concerto", "Avatar: The Last Airbender", "Avicii: True Stories", "Awake: The Million Dollar Game", "Ayana", "Aziz Ansari Live at Madison Square Garden", "Aziz Ansari: Buried Alive", "Baadshaho"];
