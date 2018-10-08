// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var dns = require('dns');
let shortenedUrlDictionary = {};
shortenedUrlDictionary.count = 0;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


app.post('/api/shorturl/new', function(request, response) {
  
  let urlGiven = request.body.url;
  let matchUrl = urlGiven.match(/^https?:\/\/www\.[\S]+\.com|net|org/);
  
  if(matchUrl == null){
     response.json({error:"invalid Url given"});
  }
  
  let dnsLookUp = urlGiven.includes("https") ? urlGiven.slice(12) : urlGiven.slice(11);
  console.log(dnsLookUp);
  
  dns.lookup(dnsLookUp, (err, address, family) => {
    if(err){
      
      response.json({error:"Domain does not exist"});
    }
    else{
       if(Object.values(shortenedUrlDictionary).indexOf(urlGiven) == -1){
         shortenedUrlDictionary.count +=1;
         shortenedUrlDictionary[shortenedUrlDictionary.count] = urlGiven
         response.json({original_url: urlGiven, short_url: shortenedUrlDictionary.count});
      }    
      else{
    
        let shortenedSavedUrls = Object.keys(shortenedUrlDictionary);
        let shortenedUrl = shortenedSavedUrls.filter(shortenedUrl => shortenedUrlDictionary[shortenedUrl] == urlGiven);
        response.json({original_url: urlGiven, short_url: shortenedUrl[0]});
      } 
    }

  });
  
});

app.get("/api/shorturl/:number", function(req, res){

  res.redirect(shortenedUrlDictionary[req.params.number]);
  
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

