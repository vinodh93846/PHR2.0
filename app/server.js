/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Zero to Blockchain */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cfenv = require('cfenv');
const passport = require('passport');

var appEnv = cfenv.getAppEnv();
var app = express();
var busboy = require('connect-busboy');
app.use(busboy());

// IPFS Related Code - BEGINS //

const ipfsClient = require('ipfs-http-client')
const fileUpload = require('express-fileupload')


ipfs = new ipfsClient({
  host : 'localhost',
  port : '5001',
  protocol : 'http'
});

app.use(fileUpload());


// IPFS Related Code - ENDS // 


// the session secret is a text string of arbitrary length which is
//  used to encode and decode cookies sent between the browser and the server
/**
for information on how to enable https support in osx, go here:
  https://gist.github.com/nrollr/4daba07c67adcb30693e
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
**/

app.use(passport.initialize());
app.use(bodyParser.urlencoded({limit: '10mb', extended: true }));
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.set('appName', 'PHR-Blockchain');
app.set('port', appEnv.port);

app.set('views', path.join(__dirname + '/html/production'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/html'));
app.use(bodyParser.json());

// Define your own router file in controller folder, export the router, add it into the index.js.
// app.use('/', require("./controller/yourOwnRouter"));

app.use('/', require("./router"));

if (cfenv.getAppEnv().isLocal == true)
  { var server = app.listen(app.get('port'), function() {
      console.log('\nListening locally on port %d', server.address().port);


      var adr = 'http://localhost:'+server.address().port+'/production/login.html';
      console.log('Browser Addr', adr);
    // Specify the app to open in
    //opn(adr, {app: 'firefox'});      
    }); }
  else
  { var server = app.listen(app.get('port'), function() {console.log('Listening remotely on port %d', server.address().port);}); }
