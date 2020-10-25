function setStatus(status) {
  document.getElementById('status').innerText = status;
}

function getInfo(){
    var comp = document.getElementById('company').value;
    var pos = document.getElementById('position').value;
    //var date = document.getElementById('date').value;
    var email = document.getElementById('email').value;
    var med = document.getElementById('medium').value;
    var link = document.getElementById('link').value;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    addToSheet(comp,pos,today,email,med,link);
    document.getElementById('company').value = "";
    document.getElementById('position').value="";
  //  document.getElementById('date').value="";
    document.getElementById('email').value="";
    document.getElementById('medium').value="";
    document.getElementById("link").value="";
    //addToSheet

}

function writeToSheet(values,id) {
      var params = {
        // The ID of the spreadsheet to update.
        spreadsheetId: id,  // TODO: Update placeholder value.

        // The A1 notation of a range to search for a logical table of data.
        // Values will be appended after the last row of the table.
        range: 'Sheet1',  // TODO: Update placeholder value.


        // How the input data should be interpreted.
        valueInputOption: 'RAW',  // TODO: Update placeholder value.

        // How the input data should be inserted.
        insertDataOption: 'INSERT_ROWS'  // TODO: Update placeholder value.
      };

      var valueRangeBody = {
        values:values
        // TODO: Add desired properties to the request body.
      };

      var request = gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
      request.then(function(response) {
        // TODO: Change code below to process the `response` object:
        console.log(response.result);
        setStatus("Added!!!");
      }, function(reason) {
        console.error('error: ' + reason.result.error.message);
      });
    }

/*function createSheetSelector(files) {
  var sheetSelector = document.createElement('select');
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    sheetSelector.appendChild(new Option(file.name, file.id))
  }
  return sheetSelector;
}*/



function addToSheet(company,position,date,email,medium,link){
  console.log("in add to sheet");
  var sheetName = "Gargi's Recruting Sheet6";
  var sheetFound = null;
  var values = [[company,position,date,email,medium,link]];

  gapi.client.drive.files.list({
    'q': "mimeType='application/vnd.google-apps.spreadsheet'",
    //'orderBy': 'name',
    'fields': "nextPageToken, files(id, name)"
  }).then(function(response) {

    var files = response.result.files;
    if(files && files.length>0){ //find sheet
      console.log("there are files");
      //var sheetSelector = createSheetSelector(files);
      //contentDiv.appendChild(sheetSelector);
      //contentDiv.appendChild(document.createElement('br'));
      //setStatus("oooooo");
      sheetFound = findSheet(files,sheetName);
      console.log("sheet found: "+sheetFound);
      if(sheetFound.found){ //find sheet add values to sheet
        console.log("sheet ID: "+sheetFound.id);
        console.log("adding to "+sheetName);

        writeToSheet(values,sheetFound.id)
        //add to sheet
      }
      else{ //create sheet
        console.log("creating sheet: "+sheetName);
        createSheet(sheetName,values);
      }
      //console.log("after sheetOFOund");
    }
    else{
      setStatus("no sheets");
      console.log("no sheets");
    }
  }, function(response) {
    setStatus('Error fetching sheets from Google Drive');
    console.log("error fetching sheets")
    console.log(response);
  });

}

function findSheet(files,name){
  //setStatus("IM FINDING SHEET")
  console.log("in find sheets");
  console.log("finding "+name);
  //var id = null;
  var returnObj = {found:false,id:null};
  for(var i=0;i<files.length;i++){
    var file = files[i];
    console.log(file.name);
    if(file.name===name){
    //setStatus("MATCH");
      console.log("MATCH "+name);
      returnObj = {found:true,id:file.id}
      //return true;
      return returnObj;
    }
  }
  console.log("no matches");
  return returnObj;
}




function initSheet(name,values){

  console.log("INITIALIZING SHEET");
  gapi.client.drive.files.list({
    'q': "mimeType='application/vnd.google-apps.spreadsheet'",
    //'orderBy': 'name',
    'fields': "nextPageToken, files(id, name)"
  }).then(function(response) {

    var files = response.result.files;
    if(files && files.length>0){ //find sheet
      console.log("there are files");
      //var sheetSelector = createSheetSelector(files);
      //contentDiv.appendChild(sheetSelector);
      //contentDiv.appendChild(document.createElement('br'));
      //setStatus("oooooo");
      var sheetFound = findSheet(files,name);

      if(sheetFound.found){ //find sheet add values to sheet
        console.log("sheet found: "+sheetFound);
        console.log("sheet ID: "+sheetFound.id);
        console.log("adding to "+name);
        var header = [["COMPANY","POSITION","DATE","EMAIL","MEDIUM","LINK"]];
        writeToSheet(header,sheetFound.id);
      //  setTimeout(() => {  console.log("Wait!"); }, 2000);
        setTimeout(() => {  writeToSheet(values,sheetFound.id); }, 2000);
        //writeToSheet(values,sheetFound.id);
        //add to sheet
        console.log("INITIALIZED SHEET");
      }
      //console.log("after sheetOFOund");
    }
    else{
      setStatus("no sheets");
      console.log("could not initialize sheet");
    }
  }, function(response) {
    setStatus('Error fetching sheets from Google Drive');
    console.log("error fetching sheets")
    console.log(response);
  });


}


function createSheet(name,values){

    gapi.client.sheets.spreadsheets.create({
    properties: {
      title: name

    }
  }).then((response) => {
    initSheet(name,values);
    setStatus(name+" created!");
    console.log(name+" created!");

  });


}

function main(){
  setStatus('yeet set');
  var button = document.createElement('button');

  button.textContent = 'Add Job!';

  button.onclick = function () {
      getInfo();
  };

  //document.body.appendChild(button);
  var contentDiv = document.getElementById('content')
  contentDiv.appendChild(button);
  contentDiv.appendChild(document.createElement('br'));
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    console.log(tabs[0].url);
    document.getElementById("link").value = tabs[0].url
});

}

//authenticating
setStatus('Authenticating with Google Drive');
chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
  if (token === undefined) {
    setStatus('Error authenticating with Google Drive');
    console.log('Error authenticating with Google Drive');
  } else {
    gapi.load('client', function() {
      gapi.client.setToken({access_token: token});
      gapi.client.load('drive', 'v3', function() {
        gapi.client.load('sheets', 'v4', function() {
          main();
        });
      });
    });
  }
});
