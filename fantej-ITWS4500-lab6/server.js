var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var bodyParser = require("body-parser");
var Twitter = require('twitter');
var fs = require('fs');

//Twitter Streaming API Authentication Info
var client = new Twitter({
  consumer_key: 'jKGAGGgBM73WvbMcWQYRql8It',
  consumer_secret: 'TtdGCbtPNusoTVx2ehxYkIxODZhJXzX52k7gBIs32CTyY4mC3h',
  access_token_key: '243405576-kTmFPozQd89EQ1LGPWaElkqaXsYLLYDD4lQWjJQd',
  access_token_secret: 'cj7hS6kDsHmeZQxbOE5PR80iALAXuF6nCV7diHmPmfg02'
});

//Trim Function
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

//Number of clients connected
connections = [];
//Tweet text and data (to output to JSON file)
tweets_array = []

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.use(bodyParser.json());


app.get('/', function (req, res) {
    res.render('public/index.html');
});

app.post('/export', function (req, res) {
    console.log(req.body.format);
    if(req.body.format == "JSON"){
    	fs.stat('fantej-tweets.json', function(err, stat) {
		   	if(err == null) {
    			res.send("File already exists. Overwriting it.");
    			console.log("File JSON exists");
		    }
		});
    	fs.writeFile('fantej-tweets.json', JSON.stringify(tweets_array), function(err) {
            if(err){
                console.log(err);
            }
            tweets_array = []; //reset tweets_array
        });

    }
    else if(req.body.format == "CSV"){
    	fs.stat('fantej-tweets.csv', function(err, stat) {
		   	if(err == null) {
    			res.send("File already exists. Overwriting it.");
    			console.log("File JSON exists");
		    }
		});
        var str = '"created_at","id","text","user_id","user_name","user_screen_name","user_location","user_followers_count","user_friends_count","user_created_at","user_time_zone","user_profile_background_color","user_profile_image_url","geo","coordinates","place"\n';
        for(i=0; i<tweets_array.length; i++){
            var tweet_text = (tweets_array[i].text).trim();
            str+= tweets_array[i].created_at + ',' + tweets_array[i].id + ',' +  '"' + tweet_text + '"' + ',' + tweets_array[i].user_id + ',' + tweets_array[i].user_name + ',' + tweets_array[i].user_screen_name + ',' + '"' + tweets_array[i].user_location + '"' + ',' + tweets_array[i].user_followers_count + ',' + tweets_array[i].user_friends_count + ',' + tweets_array[i].user_created_at + ',' + tweets_array[i].user_time_zone + ',' + tweets_array[i].user_profile_background_color + ',' + tweets_array[i].user_profile_image_url + ',' + tweets_array[i].geo + ',' + tweets_array[i].coordinates + ',' + tweets_array[i].place + '\n';
        }
        console.log(str);
        fs.writeFile('fantej-tweets.csv', str, function(err) {
            if(err){
                console.log(err);
            }
            tweets_array = []; //reset tweets_array
        });
    }
    // res.end();
});


//Broadcast tweets as they are read to client through sockets
io.sockets.on('connection', function(socket){
    //Log number of clients connected
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    //Log when a client disconnects
    socket.on('disconnect', function(data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    //Get tweets from Twitter's server, broadcast these to the client as soon as they
    //are red using sockets. 
    socket.on('get tweets', function(data){
        //Determine which query to build: location filtered or topic filtered
        //by examining third element of data array
        //if third element marked with topic build query for topic
        var query = "";

        if(data[2] == "topic"){
            var topic = data[1];
            if(topic == ""){
                topic = "Information Technology";
            }
            query = {track: topic}
        }
        else {
            var southwest = data[1];
            var northeast = data[2];

            //If second or third parameter is blank default to RPI coordinates
            if(southwest == "" || northeast == ""){
                southwest = "-73.68,42.72"
                northeast = "-73.67,42.73"
            }
        
            query = {locations: southwest+","+northeast};
        }

        var num_tweets = data[0]; //The number of tweets the user wants to see

        //Function to test whether first parameter (which specifies number of tweets) is a valid integer
        //Int check function: StackOverflow: http://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
        function isInt(value) {
            var x = parseFloat(value);
            return !isNaN(value) && (x | 0) === x;
        
        }
        //If first parameter not an integer, set it to 5
        if(isInt(data[0]) == false){
            num_tweets = 5;
        }

        var i = 1; //Tweet counter

        //Get the tweets via streaming API, broadcast them to the client(s)
        client.stream('statuses/filter', query, function(stream){
            socket.on('disconnect', function(data) {
                stream.destroy();
            }); 
            stream.on('data', function(tweet) {
                //Broadcast tweets until the counter reaches the user specified limit
                if(i <= num_tweets) {
                    io.sockets.emit('new tweet', {msg: tweet.text});
                    tweets_array.push({"created_at":tweet.created_at, "id":tweet.id, "text":tweet.text, "user_id":tweet.user.user_id, "user_name":tweet.user.name, "user_screen_name":tweet.user.screen_name, "user_location":tweet.user.location, "user_followers_count":tweet.user.followers_count, "user_friends_count":tweet.user.friends_count, "user_created_at":tweet.user.created_at, "user_time_zone":tweet.user.time_zone,"user_profile_background_color":tweet.user.profile_background_color,"user_profile_image_url":tweet.user.profile_image_url,"geo":tweet.geo,"coordinates":tweet.coordinates,"place":tweet.place}); //Add each tweet to an array
                }
                //Then, Kill the Twitter stream
                //Create a JSON file with tweet data from each tweet
                else {
                    console.log("End");
                    console.log(tweets_array);
                    io.sockets.emit('new tweet', {msg: "Done"});

                    //Kill the stream
                    stream.destroy();
                }
                //Increment the counter each time a tweet is read
                i += 1;
            });

            //If there is an error, log it
            stream.on('error', function (err) {
                console.log(err);
            });
        });
        
    });
});



server.listen(3000, function () {
});