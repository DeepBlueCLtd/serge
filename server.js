const runServer = (eventEmmiterMaxListeners, pouchOptions, corsOptions, dbDir, imgDir, port, remoteServer) => {

  require('events').EventEmitter.defaultMaxListeners = eventEmmiterMaxListeners;
  const express = require('express');
  const bodyParser = require('body-parser');
  const path = require('path');
  const uniqid = require('uniqid');
  const ip = require("ip");

  const PouchDB = require('pouchdb-core')
    .plugin(require('pouchdb-adapter-node-websql'))
    .plugin(require('pouchdb-adapter-http'))
    .plugin(require('pouchdb-mapreduce'))
    .plugin(require('pouchdb-replication'))
    .defaults(pouchOptions);

  const fs = require('fs');

  require('pouchdb-all-dbs')(PouchDB);

  const cors = require('cors');

  const app = express();

  const clientPublicPath = "/client/build";

  app.use(cors(corsOptions));

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
  }

  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
  }

  app.use('/db', require('express-pouchdb')(PouchDB));

  app.get('/allDbs', (req, res) => {
    PouchDB.allDbs()
      .then((dbs) => {
        res.send(dbs);
      })
  });

  app.get('/clearAll', (req, res) => {
    PouchDB.allDbs()
      .then((dbs) => {
        dbs.forEach((db) => {
          new PouchDB(db).destroy();
        })
      })
      .then(() => {
        res.send();
      })
  });

  app.get('/deleteDb', (req, res) => {
    fs.unlink('db/'+req.query.db, (err) => {
      console.log(err);
      if (err) {
        res.status(500).send();
      } else {
        res.status(200).send();
      }
    });
  });

  app.get('/getIp', (req, res) => {
    res.status(200).send({ip: req.ip});
  });

  app.use('/saveIcon', bodyParser.raw({type: 'image/png', limit: '20kb'}));
  app.post('/saveIcon', (req, res) => {

    let image = `${imgDir}/${uniqid.time('icon-')}.png`;

    fs.writeFile(image, req.body, (err) => console.log(err));

    res.status(200).send({path: image});

  });

  app.use('/saveLogo', bodyParser.raw({type: 'image/png', limit: '100kb'}));
  app.post('/saveLogo', (req, res) => {

    let image = `${imgDir}/${uniqid.time('logo-')}.png`;

    fs.writeFile(image, req.body, (err) => console.log(err));

    res.status(200).send({path: image});

  });

  if(remoteServer) {
    app.get(clientPublicPath + '/gconfig.js', (req, res) => {
      res.type('.js').send(`
        window.G_CONFIG = {
          REACT_APP_SERVER_PATH: "${remoteServer}"
        }
      `);
    });
  }

  app.use(express.static(path.join(__dirname)));

  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname + clientPublicPath + '/index.html'));
  });

  app.listen(port);

  console.log(`App is listening on ${ip.address()}:${port}`);
}

module.exports = runServer;
