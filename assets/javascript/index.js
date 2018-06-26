$(document).ready(function () {


var currencyListHtml = "";

	$.ajax({
	        type: 'GET',
	        url: "https://free.currencyconverterapi.com/api/v5/currencies",
	        data: {},
	        dataType: 'json', 
	        success: function(response) {	


				var request = window.indexedDB.open("AppDB", 1);
				request.onerror = function(event) {
						console.log("IDBrequest Error")
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
	        }

	 });


	$(document).on("click","#btn-convert",function(){
		
		currencyFrom  = $('#select-from').find(":selected").val();
		currencyTo    = $('#select-to').find(":selected").val();
		convertSymbol = currencyFrom + '_' + currencyTo;

		$.ajax({
	        type: 'GET',
	        url: `https://free.currencyconverterapi.com/api/v5/convert?q=${convertSymbol}&compact=y`,
	        data: {},
	        dataType: 'json', 
	        success: function(response) {

	        	result = response[convertSymbol];
	        	val = result.val;

	        	//set results to output display
	        	$("#output").val(val);

	        },
	        complete: function() {
	        	//console.log("complete");				       
	        },
	        failure: function(){
	             console.log("failed");
	        }

	 });


	});


});