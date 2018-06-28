$(document).ready(function () {


// ==============Registering the Service worker=============
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js').then(function(reg) { 
			//console.log("Service Worker Registered"); 

			if (reg.waiting) {

				//console.log("sw is skipping waiting");
				self.skipWaiting();
		      	
		      return;
		    }

		    if (reg.installing) {
		      //console.log("sw is installing");
		      return;
		    }

		    if (reg.active) {
		      //console.log("sw is active");
		      return;
		    }


		});
	}
// ====================End of Service worker====================




	var currencyListHtml = "";
	loadCurrenciesOnline();

	// Function to load currency data online, 
	// create IndexedDb and populate the select controls
	function loadCurrenciesOnline(){

		$("#output").text("Loading currencies...");
		$.ajax({
		        type: 'GET',
		        url: "https://free.currencyconverterapi.com/api/v5/currencies",
		        data: {},
		        dataType: 'json', 
		        success: function(response) {	

					var request = window.indexedDB.open("AppDB", 1);
					request.onerror = function(event) {
							//console.log("IDBrequest Error")
							$("#output").text("A problem occured, refresh browser...");
					};
					request.onsuccess = function(event) {

					  //console.log("IDBrequest Success");

					  var db = event.target.result;
					  var currencyObjectStore = db.transaction("Currencies", "readwrite").objectStore("Currencies");
					  var indexID = currencyObjectStore.index("id");

					  indexID.openCursor().onsuccess = function(event) {
						  var cursor = event.target.result;
						  if (cursor) {

						    objRecord = cursor.value;

						    // build currencyListHtml (reset it)
						    currencyListHtml += `<option value=${objRecord.id}> [${objRecord.id}] ${objRecord.currencyName} </option>`;

						    cursor.continue();
						  }

						// populate the select controls							
						$( "#select-from" ).html(`<option value="">Select the From Currency</option>` + currencyListHtml);
						$( "#select-to" ).html(`<option value="">Select the To Currency</option>` + currencyListHtml);
					  };

						

						$("#output").text("Ready...");

					};


					request.onupgradeneeded = function(event) {

						//console.log("IDBrequest onupgradeneeded");

					  var db = event.target.result;
					  objectStore = db.createObjectStore("Currencies", { keyPath: "id" });
					  objectStore.createIndex("id", "id", { unique: true });


					  objectStore.transaction.oncomplete = function(event) {

					    // add data to the objectStore.
					    var currencyObjectStore = db.transaction("Currencies", "readwrite").objectStore("Currencies");
					    
					    // add individual currencies to object store
					    for (var key in response.results) {
						     objRecord = response.results[key];
						     currencyObjectStore.add(objRecord);
						}


						var indexID = currencyObjectStore.index("id");
						  indexID.openCursor().onsuccess = function(event) {
							  var cursor = event.target.result;
							  if (cursor) {

							    objRecord = cursor.value;

							    // build currencyListHtml
							    currencyListHtml += `<option value=${objRecord.id}> [${objRecord.id}] ${objRecord.currencyName} </option>`;

							    cursor.continue();
							  }

							// populate the select controls
							$( "#select-from" ).append(currencyListHtml);
							$( "#select-to" ).append(currencyListHtml);

						  };


						 $("#output").text("Ready...");  
					  };

					}
		        },
		        complete: function() {
		        	//console.log("complete");				       
		        },
		        failure: function(){
		             //console.log("failed");
		             $("#output").text("A problem occured, refresh browser...");
		        }

		 });


	}




	// function to process convertion online
	$(document).on("click","#btn-convert",function(){
		
		currencyFrom  = $('#select-from').find(":selected").val();
		currencyTo    = $('#select-to').find(":selected").val();
		convertSymbol = currencyFrom + '_' + currencyTo;
		amount 		  = parseFloat($('#amount').val());

		if(currencyFrom=="" || currencyTo=="" || amount <0 ){

			alert("Oops, both Currency From and Currency To are required and Amount must be a positive number");

		}else{

			$("#output").text("Converting...");
			$.ajax({
		        type: 'GET',
		        url: `https://free.currencyconverterapi.com/api/v5/convert?q=${convertSymbol}&compact=y`,
		        data: {},
		        dataType: 'json', 
		        success: function(response) {

		        	result = response[convertSymbol];
		        	rate = parseFloat(result.val);
		        	convertedAmount = amount * rate;
		        	convertedMsg = `${amount} ${currencyFrom} = ${convertedAmount} ${currencyTo}`;

		        	//set results to output display
		        	$("#output").text(convertedMsg);

		        },
		        complete: function() {
		        	//console.log("complete");				       
		        },
		        failure: function(){
		             $("#output").text("Failed...");
		        }

		 	});

	 }

	});








});//end of document ready function