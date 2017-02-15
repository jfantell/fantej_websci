
function initialize(){
  /*The following code snippet is a modified version of the one found at http://codepen.io/mephysto/pen/ZYVKRY,
  which in itself is a modified version of the Bootsrap Carousel that shows multple panels at once

  */

  //Carousel transitions every 3 seconds
	$('.multi-item-carousel').carousel({
	  interval: 3000
	});
	$('.multi-item-carousel').carousel('cycle');

	// for every slide in carousel, copy the next slide's item in the slide.
	// Do the same for the next four items
	$('.multi-item-carousel .item').each(function(){
	  var next = $(this).next();
	  if (!next.length) {
	    next = $(this).siblings(':first');
	  }
	  next.children(':first-child').clone().appendTo($(this));

	  if (next.next().length>0) {
	    next.next().children(':first-child').clone().appendTo($(this));
	    next.next().next().children(':first-child').clone().appendTo($(this));
	  } else {
	  	$(this).siblings(':first').children(':first-child').clone().appendTo($(this));
	  }
	});
}
  
  function display_date(i){
    //Returns a string for the date in the form "Week Day, Month, Date"
    var m_names = ["January", "February", "March", 
    "April", "May", "June", "July", "August", "September", 
    "October", "November", "December"];

    var d_names = ["Sunday","Monday", "Tuesday", "Wednesday", 
    "Thursday", "Friday", "Saturday"];

    var myDate = new Date();
    myDate.setDate(myDate.getDate()+i);
    var curr_date = myDate.getDate();
    var curr_month = myDate.getMonth();
    var curr_day  = myDate.getDay();
    return d_names[curr_day] + "<br>" + m_names[curr_month] + " " +curr_date;
  }


  function getLocation() {
    //Error check for getting geolocation coordinates
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(showPosition);
      } else {
          alert("Geolocation is not supported by this browser.");
      }
  }
  function showPosition(position) {
    //Gets geolocation coordinates
    //2 API calls to openweathermap.org
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      $.when(
        $.ajax({
        url:  "http://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&units=Imperial&APPID=ad9da40570b660bc0f312e97324278b4",
        dataType: "json"}), $.ajax({
        url:  "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + latitude + "&lon=" + longitude + "&units=Imperial&cnt=10&APPID=ad9da40570b660bc0f312e97324278b4",
        dataType: "json"}) ).done(function (data, data2) { 
        /* data and data2 are arrays with the following structure: [ data, statusText, jqXHR ], 
        the first element being the JSON data itself

        */

          //Current Weather
          var output = "<h2>Current Weather</h2>";
          output += "<ul>";
          output += "<li> City: " + data[0].name + "</li>";
          output += "<li> Current Condition: " + data[0].weather[0].main + "</li>";
          output += "<li> Current Temp: " + data[0].main.temp + " &#8457;</li>";
          output += "<li> Humidity: " + data[0].main.humidity + " % </li>";
          output += "<li> Wind: " + data[0].wind.speed + " mph </li>";
          output += "<img src='http://openweathermap.org/img/w/" + data[0].weather[0].icon +".png'>";
          output += "</ul>";
          $(".result").html(output);

          // //5 Day Forecast
          var output2 = '<div class="carousel-inner">';
          $.each( data2[0].list, function( i, index ) {
            if(i==0){
              output2+='<div class="item active"><div class="col-lg-3"><div class="tweetText"></div>';
              output2+='<img src="http://openweathermap.org/img/w/'+ index.weather[0].icon +'.png">';
              output2+='<div class="carousel-caption">';
              output2+='<h2>' + display_date(i) + '</h2>';
              output2+='<p>' + index.weather[0].description + '</p>';
              output2+='<p>' + index.temp.max + '</p>';
              output2+='<p>' + index.temp.min + '</p>';
              output2+='</div></div></div>';
            }
            else{
              output2+='<div class="item"><div class="col-lg-3"><div class="tweetText"></div>';
              output2+='<img src="http://openweathermap.org/img/w/'+ index.weather[0].icon +'.png">';
              output2+='<div class="carousel-caption">';
              output2+='<h2>' + display_date(i) + '</h2>';
              output2+='<p>' + index.weather[0].description + '</p>';
              output2+='<p>' + index.temp.max + '</p>';
              output2+='<p>' + index.temp.min + '</p>';
              output2+='</div></div></div>';
            }
          });
          output2+="</div>"
          $("#theCarousel").html(output2);
          //Initialize the carousel
          initialize();
    });
  }
  $( document ).ready(function() {
    getLocation();
  });