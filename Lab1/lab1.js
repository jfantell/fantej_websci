
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
	    next.next().next().next().children(':first-child').clone().appendTo($(this));
	  } else {
	  	$(this).siblings(':first').children(':first-child').clone().appendTo($(this));
	  }
	});
}

	var output = '<div class="carousel-inner">'; //Tweet text carousel (shows the text that goes with each tweet)
	var output2 = '<div class="carousel-inner vertical">'; //Twitter names carousel (shows the user names of twitter users)
	$.ajax({
    type: 'GET',
    url: 'TwitterTweets17.json',
    dataType: 'json',
    success: function (data) {
  		$.each( data, function( i, tweet ) {
        //If the tweet has text add it to the output string
        if(tweet.text!=undefined){
          //For first panel must insert term "item active" instead of "item"/bootstrap carousel structure rules
    			if(i==0){
            //Test if we can use a profile pic for the user
            if((tweet.user)!=undefined){
              if((tweet.user.profile_image_url)!=undefined){
                output+='<div class="item active"><div class="col-sm-12"><div class="tweetText"></div>';
                output+='<img src="'+ tweet.user.profile_image_url +'">';
                output+='<div class="carousel-caption">';
                output+='<p>' + tweet.text + '</p>';
                output+='</div></div></div>';
              }
            }
            //If not just use default
            else{
                output+='<div class="item active"><div class="col-sm-12"><div class="tweetText"></div>';
                output+='<img src="./media/avatar.png">';
                output+='<div class="carousel-caption">';
                output+='<p>' + tweet.text + '</p>';
                output+='</div></div></div>';
            }
    			}
          //For all panels except the first one
    			else{
            //Check if profile pic exists
            if((tweet.user)!=undefined){
              if((tweet.user.profile_image_url)!=undefined){
                output+='<div class="item"><div class="col-sm-12"><div class="tweetText"></div>';
                output+='<img src="'+ tweet.user.profile_image_url +'">';
                output+='<div class="carousel-caption">';
                output+='<p>' + tweet.text + '</p>';
                output+='</div></div></div>';
              }
            }
            //If not resort to default
            else{
                output+='<div class="item active"><div class="col-sm-12"><div class="tweetText"></div>';
                output+='<img src="./media/avatar.png">';
                output+='<div class="carousel-caption">';
                output+='<p>' + tweet.text + '</p>';
                output+='</div></div></div>';
             }
    			}
        }
        //Parse twitter names from the JSON file
        //Add them to the output string called output2
        //Use Jquery to display the content

        //Check to make sure names for each tweet are available before adding to output string
        if((tweet.user)!=undefined){
          if((tweet.user.name)!=undefined){
            if(i==0){
              output2+='<div class="item active"><div class="col-sm-12"><a href="#1"><div class="tweetName"></div><div class="carousel-caption">';
              output2+='<p>' + tweet.user.name + '</p>';
              output2+='</div></a></div></div>';
            }
            else{
              output2+='<div class="item"><div class="col-sm-12"><a href="#1"><div class="tweetName"></div><div class="carousel-caption">';
              output2+='<p>' + tweet.user.name + '</p>';
              output2+='</div></a></div></div>';
            }
          }
        }
		});
		output+='</div>'
		output2+='</div>'
		$('#theCarousel').html(output);
		$('#hashtagCarousel').html(output2);
		initialize();
    }
	});

