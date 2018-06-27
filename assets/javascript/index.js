$(document).ready(function () {


var currencyListHtml = "";

	$("#output").text("Loading currencies...");

	$.ajax({
	        type: 'GET',
	        url: "https://free.currencyconverterapi.com/api/v5/currencies",
	        data: {},
	        dataType: 'json', 
	        success: function(response) {	
	        	$("#output").text("Ready...");

				var request = window.indexedDB.open("AppDB", 1);
				request.onerror = function(event) {
						console.log("IDBrequest Error")
						$("#output").text("A problem occured, refresh browser...");
				};


				request.onupgradeneeded = function(event) {

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

					     // build currencyListHtml
					     currencyListHtml += `<option value=${objRecord.id}> ${objRecord.currencyName} [${objRecord.id}] </option>`;
					}
					 
					// populate the select controls
					$( "#select-from" ).append(currencyListHtml);
					$( "#select-to" ).append(currencyListHtml);

				  };


				}


				request.onsuccess = function(event) {
				  console.log("IDBrequest Success");
				};


	        },
	        complete: function() {
	        	//console.log("complete");				       
	        },
	        failure: function(){
	             console.log("failed");
	             $("#output").text("A problem occured, refresh browser...");
	        }

	 });


	$(document).on("click","#btn-convert",function(){
		
		currencyFrom  = $('#select-from').find(":selected").val();
		currencyTo    = $('#select-to').find(":selected").val();
		convertSymbol = currencyFrom + '_' + currencyTo;
		amount 		  = parseFloat($('#amount').val());

		$("#output").text("Converting...");
		$.ajax({
	        type: 'GET',
	        url: `https://free.currencyconverterapi.com/api/v5/convert?q=${convertSymbol}&compact=y`,
	        data: {},
	        dataType: 'json', 
	        success: function(response) {

	        	result = response[convertSymbol];
	        	rate = parseFloat(result.val);
	        	converted = amount * rate;

	        	//set results to output display
	        	$("#output").text(converted);

	        },
	        complete: function() {
	        	//console.log("complete");				       
	        },
	        failure: function(){
	             $("#output").text("Failed...");
	        }

	 });


	});


});