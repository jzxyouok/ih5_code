import Reflux from 'reflux';
import WidgetActions from '../actions/WidgetActions';

var bridge = require('bridge');
var elm = bridge.create(640, 480);

var selector = bridge.createSelector();

var stageTree;
var classList;
let _keyCount = 1;

function onSelect() {
  WidgetActions['selectWidget'](this);
}

function loadTree(parent, node) {
  let current = {};

  current.parent = parent;
  current.key = _keyCount++;
  current.className = node['cls'];
  current.props = node['props'] || {};
  current.events = node['events'] || {};

  current.varList = [];
  if (node['vars']) {
    for (let n in node['vars']) {
      if (n.length >= 3 && n.substr(0, 2) == '__')
        current.varList.push({key:n.substr(2), value: node['vars'][n]});
    }
  }
  current.funcList = [];
  if (node['funcs']) {
    for (let n in node['funcs']) {
      if (n.length >= 3 && n.substr(0, 2) == '__')
        current.funcList.push({key:n.substr(2), value:node['funcs'][n]});
    }
  }

  if (node['id'])
    current.props['id'] = node['id'];
  current.node = bridge.addWidget((parent) ? parent.node : null, node['cls'], null, node['props'], (parent && parent.timerWidget) ? parent.timerWidget.node : null);
  current.timerWidget = (current.node.isTimer) ? current : ((parent && parent.timerWidget) ? parent.timerWidget : null);

  if (parent) {
    parent.children.push(current);
    current.rootWidget = parent.rootWidget;
  } else {
    current.rootWidget = current;
    current.rootEl = bridge.getRoot();
    current.imageList = node['links'] || [];
    bridge.setLinks(current.node, current.imageList);
  }

  if (current.className === 'image' || current.className === 'text') {
    bridge.addMouseDownHandler(current.node, onSelect.bind(current));
  }

  current.children = [];
  let children = node['children'];
  if (children) {
    for (let i = 0; i < children.length; i++) {
      loadTree(current, children[i]);
    }
  }

  return current;
}

function saveTree(data, node) {
  data['cls'] = node.className;
  let props = {};
  for (let name in node.props) {
    if (name === 'id')
      data['id'] = node.props['id'];
    else
      props[name] = node.props[name];
  }
  if (props)
    data['props'] = props;
  if (node.events)
    data['events'] = node.events;
  if (node.varList.length > 0) {
    let o = {};
    for (let i = 0; i < node.varList.length; i++) {
      o['__' + node.varList[i].key] = node.varList[i].value;
    }
    data['vars'] = o;
  }
  if (node.funcList.length > 0) {
    let o = {};
    for (let i = 0; i < node.funcList.length; i++) {
      o['__' + node.funcList[i].key] = node.funcList[i].value;
    }
    data['funcs'] = o;
  }
  if (node.children.length > 0) {
    data['children'] = [];
    node.children.map(item => {
      let child = {};
      data['children'].push(child);
      saveTree(child, item);
    });
  }
}

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;
  var i;
  var file;

  /*
  for (i = 0; i < files.length; i++) {
    file = files[i];
    if (file.type.match(/text\/html/)) {
      let reader = new FileReader();
      reader.onload = e => {
        let s =window.atob(e.target.result.substr(22));
        let re = /VXCORE\.load\((.*)\)\;\<\/script\>/;
        let result = re.exec(s);
        if (result[1]) {
          let o = JSON.parse(result[1]);
          if (o && o['stage']) {
            this.currentWidget = null;
            stageData = o['stage'];
            WidgetActions['initTree'](true);
          }
        }
      };
      reader.readAsDataURL(file);
      return;
    }
  }*/

  if (this.currentWidget && this.currentWidget.node['create']) {
    for (i = 0; i < files.length; i++) {
      file = files[i];
      if (file.type.match(/image.*/)) {
        let reader = new FileReader();
        reader.onload = e => {
          let link = this.currentWidget.rootWidget.imageList.push(e.target.result);
          this.addWidget('image', {'link':link - 1});
        };
        reader.readAsDataURL(file);
      }
    }
  }
}

/*
function downloadFile(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}
*/

var div;

export default Reflux.createStore({
    init: function () {
        this.listenTo(WidgetActions['selectWidget'], this.selectWidget);
        this.listenTo(WidgetActions['addWidget'], this.addWidget);
        this.listenTo(WidgetActions['addClass'], this.addClass);
        this.listenTo(WidgetActions['removeWidget'], this.removeWidget);
        this.listenTo(WidgetActions['initTree'], this.initTree);
        this.listenTo(WidgetActions['render'], this.render);
        this.listenTo(WidgetActions['updateProperties'], this.updateProperties);
        this.listenTo(WidgetActions['resetTrack'], this.resetTrack);
        this.listenTo(WidgetActions['syncTrack'], this.syncTrack);
        this.listenTo(WidgetActions['deletePoint'], this.deletePoint);
        this.listenTo(WidgetActions['saveNode'], this.saveNode);
    },
    selectWidget: function(widget) {
        var render = false;
        if (widget) {
          if (!this.currentWidget || this.currentWidget.rootWidget != widget.rootWidget) {
            render = true;
            bridge.setRoot(widget.rootWidget.rootEl);
          }
        }
        this.currentWidget = widget;
        this.trigger({selectWidget: widget});
        if (widget && (widget.className === 'image' || widget.className === 'text')) {
            bridge.selectWidget(selector, widget.node, this.updateProperties.bind(this));
        } else {
            bridge.selectWidget(selector);
        }
        if (render)
          this.render();
    },
    addWidget: function(className, props) {
      if (!this.currentWidget)
          return;
      if (className === 'track') {
        if (!this.currentWidget.timerWidget ||
            (this.currentWidget.className !== 'image'
              && this.currentWidget.className !== 'rect'
              && this.currentWidget.className !== 'text'
              && this.currentWidget.className !== 'container'))
          return;
        let propList = ['positionX', 'positionY', 'scaleX', 'scaleY', 'rotation', 'alpha'];
        let dataList = [[0], [1]];
        for (let i = 0; i < propList.length; i++) {
          let d = this.currentWidget.node[propList[i]];
          dataList[0].push(d);
          dataList[1].push(d);
        }
        let track = loadTree(this.currentWidget, {'cls':className, 'props': {'prop': propList, 'data': dataList}});
        this.trigger({redrawTree: true, updateTrack: track});
      } else if (className === 'body' || className === 'easing' || this.currentWidget.node['create']) {
        let p;
        if (props) {
          p = {};
          for (let n in props) {
            p[n] = props[n];
          }
        }
        loadTree(this.currentWidget, {'cls':className, 'props': p});
        this.trigger({redrawTree: true});
        this.render();
      }
    },
    removeWidget: function() {
      if (this.currentWidget && this.currentWidget.parent) {
          bridge.removeWidget(this.currentWidget.node);
          let index = this.currentWidget.parent.children.indexOf(this.currentWidget);
          this.currentWidget.parent.children.splice(index, 1);
          this.currentWidget = null;
          this.trigger({selectWidget: null, redrawTree: true});
          this.render();
      }
    },
    updateProperties: function(obj, skipRender, skipProperty) {
      let p = {updateProperties: obj};
      if (skipRender) {
        p.skipRender = true;
        bridge.updateSelector(selector);
      }
      if (skipProperty)
        p.skipProperty = true;
      this.trigger(p);
    },
    resetTrack: function() {
      this.trigger({resetTrack: true});
    },
    syncTrack: function() {
      this.trigger({syncTrack: true});
    },
    deletePoint: function() {
      this.trigger({deletePoint: true});
    },
    initTree: function(data) {
      if (!div) {
        div = document.getElementById('canvas-dom');
        div.appendChild(elm);
        div.addEventListener('dragenter', dragenter, false);
        div.addEventListener('dragover', dragover, false);
        div.addEventListener('drop', drop.bind(this), false);
      }
      classList = [];
      bridge.resetClass();
      stageTree = [];

      if (data['defs']) {
        for (let n in data['defs']) {
          bridge.setRoot(null);
          bridge.addClass(n);
          classList.push(n);
          stageTree.push({name: n, tree: loadTree(null, data['defs'][n])});
        }
      }

      bridge.setRoot(null);
      stageTree.unshift({name: 'stage', tree: loadTree(null, data['stage'])});

      bridge.setRoot(stageTree[0].tree.rootEl);
      this.trigger({initTree: stageTree, classList: classList});
      this.currentWidget = stageTree[0];
      this.render();
    },
    addClass: function(name) {
      bridge.setRoot(null);
      stageTree.push({name: name, tree: loadTree(null, {'cls': 'root', 'props': {'width': 640, 'height': 480}})});
      classList.push(name);
      bridge.addClass(name);
      this.trigger({initTree: stageTree, classList: classList});
    },
    render: function() {
      process.nextTick(() => bridge.render());
    },
    saveNode: function(uid, wid, wname, callback) {
      if (!uid)
        return;

      let appendArray = function(a1, a2) {
          for (let i = 0; i < a2.length; i++) {
            a1.push(a2[i]);
          }
      };
      let data = {};
      let images = [];
      data['stage'] = {};
      saveTree(data['stage'], stageTree[0].tree);

      data['stage']['links'] = stageTree[0].tree.imageList.length;
      appendArray(images, stageTree[0].tree.imageList);

      if (stageTree.length > 1) {
        data['defs'] = {};
        for (let i = 1; i < stageTree.length; i++) {
          let name = stageTree[i].name;
          data['defs'][name] = {};
          saveTree(data['defs'][name], stageTree[i].tree);
          data['defs'][name]['links'] = stageTree[i].tree.imageList.length;
          appendArray(images, stageTree[i].tree.imageList);
        }
      }
      data = bridge.encryptData(data, images);
      if (!data)
        return;
      //var o = bridge.decryptData(o);

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
          if (xhr.readyState == 4) {
            let result = JSON.parse(xhr.responseText);
            callback(result['id'], wname);
          }
      };
      if (wid) {
        xhr.open('PUT', 'work/' + wid);
      } else {
        xhr.open('POST', 'user/' + uid + '/createWork?name=' + encodeURIComponent(wname));
      }
      xhr.setRequestHeader('Content-Type', 'text/plain');
      xhr.send(data);
    }
});
