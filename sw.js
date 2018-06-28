self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open("appcache").then(function(cache) {
      return cache.addAll([
      	'/',
        '/assets/css/bootstrap.css',
        '/assets/css/site.css',
        '/assets/banner.jpg',
        '/assets/javascript/jquery.js',
        '/assets/javascript/bootstrap.js',
        '/assets/javascript/index.js',
        'https://free.currencyconverterapi.com/api/v5/currencies',        
      ]);
    }).catch(function(e){
    	console.log(e);
    })
  );
});



self.addEventListener('fetch', function(event) {

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
    	
    	if(!cachedResponse){

    		//fetch onlineResponse
    		return fetch(event.request).then(function(onlineResponse){

    			clonedOnlineResponse = onlineResponse.clone();

	    		//add onlineResponse to caches
	    		caches.open("appcache").then(function(cache) {	
			      cache.put(event.request.url, clonedOnlineResponse);
			    });

	    		//console.log("using an online response for: " + event.request.url);
    			return onlineResponse;
    		}).catch(function(e){
    			console.log(e);
    		});
    		
    	}

    	//console.log("cache found for: " + event.request.url);
      return cachedResponse;
    })
  );

});