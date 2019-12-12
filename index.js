const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dropboxV2api = require('dropbox-v2-api');
const dropboxConfig = require ('./config/dropbox');
const app = express();
let db = require('./db');

db.connect();

const port = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));

require('./routes')(app, db);
if (dropboxConfig.access_token) {
  global.dropbox = dropboxV2api.authenticate({
      token: dropboxConfig.access_token
  });
} else {
  global.dropbox = dropboxV2api.authenticate({
      client_id: dropboxConfig.client_id,
      client_secret: dropboxConfig.client_secret,
      redirect_uri: dropboxConfig.redirect_uri
  });
}

app.get('/dropbox/auth', (req, res) => {
 dropbox.getToken(req.query.code, (err, response) => {
    if (err) {
        console.log(err);
        res.send(false);
    }

    console.log(response.access_token);
    dropboxConfig.access_token = JSON.stringify(response.access_token);

    res.send(true);
 });
});

app.listen(port, () => {
  console.log('We are live on ' + port);
  const url = dropbox.generateAuthUrl();
    console.log(url);
});