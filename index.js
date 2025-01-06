require('dotenv').config();
const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Bree = require('bree');

const routes = require('./routes/schema-routes');

const { SERVER_PORT } = process.env;

const bree = new Bree({
  jobs: [
      {
          name :'getIdosellData',
          cron: "0 0 * * *" //every day at 00:00
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

  await bree.start();
}

main().catch(e => {
    console.log(e);
    process.exit(1);
});
