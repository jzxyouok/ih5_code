var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var dbUrl = 'mongodb://' + (process.env.MONGODB || 'localhost') + ':27017/ih5db';

function login(req, res) {
  if (req.body.username) {
    MongoClient.connect(dbUrl, function(err, db) {
      var col = db.collection('users');
      col.findOneAndUpdate({name: req.body.username},
        {name: req.body.username},
        {
          returnOriginal: false,
          upsert: true
        },
        function(err, r) {
          res.json({id: r.value._id});
          db.close();
        });
    });
  }
};

function getUser(req, res) {
  if (req.params.id) {
    MongoClient.connect(dbUrl, function(err, db) {
      var col = db.collection('works');
      col.find({user: ObjectID.createFromHexString(req.params.id)}).toArray(function(err, docs) {
        var result = [];
        for (var i = 0; i < docs.length; i++) {
          result.push({'id': docs[i]._id, 'name': docs[i].name});
        }
        res.send(result);
        db.close();
      })
    });
  }
};

function createWork(req, res) {
  if (req.params.id && req.body) {
    MongoClient.connect(dbUrl, function(err, db) {
      var col = db.collection('works');
      var obj = {user: ObjectID.createFromHexString(req.params.id), data: req.body, name: req.query.name};
      col.insertOne(obj,
        null,
        function(err, r) {
          res.json({id: obj._id});
          db.close();
        });
    });
  }
};

function getWork(req, res) {
  if (req.params.id) {
    MongoClient.connect(dbUrl, function(err, db) {
      var col = db.collection('works');
      col.findOne({_id: ObjectID.createFromHexString(req.params.id)},
        function(err, r) {
          if (!r) {
            res.send('not found');
          } else if (req.query.raw) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
            res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
            res.send(r.data);
          } else {
            res.send('<html><meta name="viewport" content="width=device-width; initial-scale=1; maximum-scale=1; minimum-scale=1"><title>' + r.name + '</title><body style="margin:0"><script src="../ih5core.js"></script><script>window.VXCORE.load(\'' + r.data + '\');</script></body></html>');
          }
          db.close();
        });
    });
  }
};

function saveWork(req, res) {
  if (req.params.id && req.body) {
    MongoClient.connect(dbUrl, function(err, db) {
      var col = db.collection('works');
      col.updateOne({_id: ObjectID.createFromHexString(req.params.id)},
        {'$set': {data: req.body}},
        null,
        function(err, r) {
          res.json({id: req.params.id});
          db.close();
        });
    });
  }
};

function deleteWork(req, res) {
  if (req.params.id) {
    MongoClient.connect(dbUrl, function(err, db) {
      var col = db.collection('works');
      col.deleteOne({_id: ObjectID.createFromHexString(req.params.id)},
        null,
        function(err, r) {
          res.send('done');
          db.close();
        });
    });
  }
};

module.exports = function(app) {
  app.post('/login', login);
  app.get('/user/:id', getUser);
  app.post('/user/:id/createWork', createWork);
  app.get('/work/:id', getWork);
  app.put('/work/:id', saveWork);
  app.delete('/work/:id', deleteWork);
}

