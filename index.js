const express = require('express');
const bodyParser = require('body-parser');
const app = express();
let db = require('./db');
db.connect();

const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: true }));

require('./routes')(app, db);

app.listen(port, () => {
  console.log('We are live on ' + port);
});