var express = require("express");
var app = express();

//TODO: create a redis client
var redis = require("redis");
var client = redis.createClient();

// serve static files from public directory
app.use(express.static("public"));

// TODO: initialize values for: header, left, right, article and footer using the redis client
client.mset('header',0,'left',0,'article',0,'right',0,'footer',0);
client.mget(['header','left','article','right', 'footer'],
  function(err, value){
    console.log(value);
  });
// Get values for holy grail layout
function data() {
  // TODO: uses Promise to get the values for header, left, right, article and footer from Redis
  return new Promise((resolve, reject)=>{
    client.mget(['header','left','article','right','footer'],
    function(err, value){
      const data ={
        'header': Number(value[0]),
        'left': Number(value[1]),
        'article': Number(value[2]),
        'right': Number(value[3]),
        'footer': Number(value[4])
      };
      err ? reject(null) : resolve(data);
    });
  });
}

// plus
app.get("/update/:key/:value", function (req, res) {
  const key = req.params.key;
  let value = Number(req.params.value);

  //TODO: use the redis client to update the value associated with the given key
  client.get(key, function(err, reply){
    value = Number(reply) + value;
    client.set(key, value);
    data()
      .then(data =>{
        console.log(data);
        res.send(data);
      });
  });
});

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
