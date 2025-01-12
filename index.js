require('dotenv').config();
const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Bree = require('bree');
const mongoose = require('mongoose');
const routes = require('./routes/schema-routes');


const { SERVER_PORT } = process.env;

const bree = new Bree({
  jobs: [
      {
          name :'getIdosellData',
          cron: "0 0 * * *",//every day at 00:00
          timeout: '2s'//for work when serwer is started
      }
  ]
});

const main = async () => {
  const app = express();
  const server = require('./utils/serverStart')(app);
  
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'ui')));
  app.use(cors());

  routes(app);

  server.listen(SERVER_PORT, async () => {
    console.log(`Server started on port ${SERVER_PORT}`);
  });

  await mongoose.connect('mongodb://127.0.0.1:27017/idosell', {
    autoIndex: true
  })
    .then(() => console.log('Connected successfully to idosell db!'))
    .catch(err => console.error(err));
 
  mongoose.Promise = global.Promise;

  await bree.start();
}

main().catch(e => {
    console.log(e);
    process.exit(1);
});
