var workList = [{}];
var currentId = 1;

function userInfo(req, res) {
  var list = [];
  for (var i = 1; i < currentId; i++) {
    if (workList[i].data)
      list.push({id:i, name:workList[i].name})
  }
  res.json({name: 'bean', list:list, font:[], playUrl:'app/'});
}

function login(req, res) {
  res.json({token: '1'});
};

function createWork(req, res) {
  if (req.query.name && req.body) {
    workList.push({id:currentId, name:req.query.name, data:req.body});
    res.json({id:currentId});
    currentId++;
  }
};

function playWork(req, res) {
  if (req.params.id) {
    var r = workList[req.params.id];
    if (req.query.raw) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
      res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
      res.send(r.data);
    } else {
      res.send('<html><meta name="viewport" content="width=device-width; initial-scale=1; maximum-scale=1; minimum-scale=1"><title>'
        + r.name + '</title><body style="margin:0"><script src="../../ih5core.js"></script><script>window.VXCORE.load(\'/app/work/'
        + req.params.id + '?raw=1\');</script></body></html>');
    }
  }
};

function saveWork(req, res) {
  if (req.params.id && req.body) {
    workList[req.params.id].data = req.body;
    res.json({id:req.params.id});
  }
};

function deleteWork(req, res) {
  if (req.params.id) {
    workList[req.params.id].data = null;
  }
};

module.exports = function(app) {
  app.get('/app/userInfo', userInfo);
  app.post('/app/login', login);
  app.post('/app/work', createWork);
  app.get('/app/work/:id', playWork);
  app.put('/app/work/:id', saveWork);
  app.delete('/app/work/:id', deleteWork);
}
