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



//Number of clients connected
connections = [];
//Tweet text and data (to output to JSON file)
tweets_array = []

app.use(express.static('public'));


app.get('/', function (req, res) {
    res.render('public/index.html');
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
            stream.on('data', function(tweet) {
                //Broadcast tweets until the counter reaches the user specified limit
                if(i <= num_tweets) {
                    io.sockets.emit('new tweet', {msg: tweet.text});
                    tweets_array.push(tweet); //Add each tweet to an array
                    console.log(tweet.text);
                }
                //Then, Kill the Twitter stream
                //Create a JSON file with tweet data from each tweet
                else {
                    console.log("End");
                    fs.writeFile('fantej-tweets.json', JSON.stringify(tweets_array), function(err) {
                        if(err){
                            console.log(err);
                        }
                    });
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