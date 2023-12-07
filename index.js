
require('dotenv').config();
const punycode = require("punycode/");
const express = require('express');
const cors = require('cors');
const app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://michaelgalan:ILoveFriend@cluster0.ppyxtj8.mongodb.net/?retryWrites=true&w=majority')

const urlSchema = new mongoose.Schema({
  url: String, 
  randomPort: Number
})

const url = mongoose.model("url", urlSchema);


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({
  extended: false
}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let directed_to_website;

app.get('/api/shorturl/:urlNum', async (req, res) => {
  const urlNum = req.params.urlNum
  //console.log(urlNum);
  
  const website = await url.find({randomPort: urlNum})
  
  //console.log(website)
  //console.log(website[0].url)

  if (directed_to_website == false) {
    directed_to_website = true;
    res.redirect(website[0].url);
  }
  else {
    directed_to_website = false;
    res.redirect('/')
  }


})


app.post('/api/shorturl', async (req, res) => {
  
  const result = await url.find({ url: req.body.url})

  if ( result.length >= 1 ) {
    //res.json({original_url: req.body.url, short_url: urlCode})
    console.log("The ultimate test");
    console.log(result[0].url)
    return res.json({original_url: result[0].url, short_url: result[0].randomPort})
  }
  
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{3,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  );

  //console.log(pattern.test(req.body.url))

  if (pattern.test(req.body.url)==false){
    return res.json({error: "invalid url"})
  }

  function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  

  let urlCode = randomIntFromInterval(1, 10000);

  postButton()
  async function postButton() {
    const URL = new url({url: req.body.url, randomPort: urlCode})
    await URL.save()
  }

  directed_to_website = false;
  return res.json({original_url: req.body.url, short_url: urlCode})

})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
