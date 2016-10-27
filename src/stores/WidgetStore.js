import Reflux from 'reflux';
import WidgetActions from '../actions/WidgetActions';

var bridge = require('bridge');
bridge.create();
var globalToken;

var rootDiv;
var rootElm;

var stageTree;
var classList;
let _keyCount = 1;
var keyMap = [];

let _eventCount = 0;    //事件id
let _specificCount = 0; //事件内目标对象id

let _childrenCount =0; //逻辑判断目标对象id

var prevObj;
var prevNewObj;
var dragTag;

var dbCumulative = 1;

var specialObject = ['counter', 'text', 'var','input']; //五类特殊对象的类名,用于直接取其value属性

var nodeType = {
    widget: 'widget',  //树对象
    func: 'func',    //函数
    var: 'var',     //属性
    dbItem: 'dbItem',
};

var nodeAction = {
    add: 'add',
    remove: 'remove',
    change: 'change',
};

var keepType = {
    event: 'event',
    func: 'func',
    var: 'var',
    dbItem: 'dbItem',
};

var varType = {
    number: 'number',   //数字
    string: 'string'    //字串
};

var funcType = {
    customize: 'customize', //自定义
    default: 'default'      //系统自带
};

var dataType = {
    oneDArr: 'oneDArr',
    twoDArr: 'twoDArr'
};

var copyObj = {};

function isEmptyString( str ){
    if ( str == "" ) return true;
    var regu = "^[ ]+$";
    var re = new RegExp(regu);
    return re.test(str);
}

function isCustomizeWidget(className) {
    if (className&&className.length>0){
        return className.substr(0,1)==='_';
    }
    return false;
}

//json对象浅克隆
function cpJson(a){return JSON.parse(JSON.stringify(a))}

function onSelect(isMulti) {
  WidgetActions['selectWidget'](this, true, null, isMulti);
}

const selectableClass = ['image', 'imagelist', 'text', 'video', 'rect', 'ellipse', 'path', 'slidetimer',
    'bitmaptext', 'qrcode', 'counter', 'button', 'taparea', 'container', 'input', 'html', 'canvas', 'table'];
var currentLoading;

function loadTree(parent, node, idList) {
  let current = {};
  current.parent = parent;
  current.className = node['cls'];
  current.props = node['props'] || {};
  current.events = node['events'] || {};





  if (current.props['key'] !== undefined) {
    current.key = current.props['key'];
    delete(current.props['key']);
  } else {
    current.key = _keyCount++;
  }
  keyMap[current.key] = current;

  // current.varList = [];
  current.strVarList = [];
  current.intVarList = [];

  if(current.className === 'db'){
    current.dbItemList = [];
  }

  if (node['vars']) {
      node['vars'].forEach(item =>{
          let temp = {};
          temp['name'] = item.name;
          temp['value'] = item.value;
          temp['props'] = item.props;
          temp['type'] = item.type;
          temp['className'] = 'var';
          if (item['key'] !== undefined) {
              temp['key'] = item['key'];
          } else {
              temp['key'] = _keyCount++;
          }
          temp['widget'] = current;
          keyMap[temp['key']] = temp;
          switch (temp['type']){
              case varType.number:
                  current.intVarList.push(temp);
                  break;
              case varType.string:
                  current.strVarList.push(temp);
                  break;
              default:
                  break;
          }
      });
  }
  current.funcList = [];
  if (node['funcs']) {
      node['funcs'].forEach(item =>{
          let temp = {};
          temp['name'] = item.name;
          temp['value'] = item.value;
          temp['params']  = item.params;
          temp['props'] = item.props;
          temp['className'] = 'func';
          if (item['key'] !== undefined) {
              temp['key'] = item['key'];
          } else {
              temp['key'] = _keyCount++;
          }
          temp['widget'] = current;
          keyMap[temp['key']] = temp;
          current.funcList.push(temp);
      });
  }

  if(current.className==='db') {
      if (node['dbItems']) {
          current.dbItemList = [];
          node['dbItems'].forEach(item => {
              let temp = {};
              temp['name'] = item.name;
              temp['props'] = item.props;
              temp['className'] = 'dbItem';
              if (item['key'] !== undefined) {
                  temp['key'] = item['key'];
              } else {
                  temp['key'] = _keyCount++;
              }
              temp['fields'] = item.fields;
              temp['widget'] = current;
              keyMap[temp['key']] = temp;
              current.dbItemList.push(temp);
          })
      }
  }

  if (node['etree']) {
    var eventTree = [];
    node['etree'].forEach(item =>{
      var r = {};
      r.enable = item.enable;
      var judgesObj = item.judges;
      r.conFlag = judgesObj.conFlag;
      r.logicalFlag = judgesObj.logicalFlag;
      r.zhongHidden = judgesObj.zhongHidden;
      r.className = judgesObj.className;
      r.children = [];
        let needFill =[];
        judgesObj.children.map((v,i)=>{
            if(v.showName !==undefined) {
                let obj = {};
                r.conFlag = v.compareFlag;
                obj.showName = v.showName;
                obj.type = v.type;
                obj.default = v.compareObjFlag;
                obj.enable = v.enable;
                needFill.push(obj);
            }else{
                r.children.push(v);
            }
        });
        if(needFill.length>0){
            r.needFill=needFill;
        }

      r.eid = (_eventCount++);
      r.specificList = [];
      item.cmds.forEach(cmd => {
          let temp = cmd;
          temp.sid = _specificCount++;
          r.specificList.push(temp);
      });
      //没有的时候添加一个空的
      if(r.specificList.length === 0){
          r.specificList.push({
              'sid': _specificCount++,
              'object': null,
              'action': null,
              'enable': true
          })
      }
      eventTree.push(r);
    });
    current.props.eventTree = eventTree;
  }

  if (node['id']) {
    if (node['id'].substr(0, 3) != 'id_')
      current.props['id'] = node['id'];
    if (idList !== undefined)
      idList[node['id']] = current;
  }



  var renderer = bridge.getRenderer((parent) ? parent.node : null, node);

  current.node = bridge.addWidget(renderer,
      (parent)
      ? parent.node
      : null, node['cls'], null, node['props'],
        (parent && parent.timerWidget) ? parent.timerWidget.node : null
  );



    current.timerWidget = (bridge.isTimer(current.node)) ? current : ((parent && parent.timerWidget) ? parent.timerWidget : null);



  if (parent) {
    parent.children.unshift(current);
    current.rootWidget = parent.rootWidget;
    if (renderer != current.rootWidget.rendererList[0])
      current.rootWidget.rendererList.unshift(renderer);
  } else {
    current.rootWidget = current;
    current.imageList = node['links'] || [];
    current.rendererList = [renderer];
    bridge.setLinks(current.node, current.imageList);
    // bridge.createSelector(current.node);
  }

  if (selectableClass.indexOf(current.className) >= 0) {
    bridge.addMouseDownHandler(current.node, onSelect.bind(current));
  }

  current.children = [];
  let children = node['children'];
  if (children) {
    for (let i = 0; i < children.length; i++) {
      loadTree(current, children[i], idList);
    }
  }
  return current;
}

function idToObject(list, idName, varName) {
  if (!idName)
    return null;
  var obj = list[idName];
  if (obj && varName) {
      if(varName.substr(0, 1) == 'f'){
          var vl = obj.funcList;
          return vl[parseInt(varName.substr(1))];
      } else if (varName.substr(0, 1) == 'd') {
          var vl = obj.dbItemList;
          return vl[parseInt(varName.substr(1))];
      } else {
          var vl = (varName.substr(0, 1) == 's') ? obj.strVarList : obj.intVarList;
          return vl[parseInt(varName.substr(1))];
      }
  } else {
    return obj;
  }
}

function idToObjectKey(list, idName, varName) {
    let obj = idToObject(list, idName, varName);
    if (obj) {
        return obj.key;
    } else {
        return null;
    }
}

function resolveEventTree(node, list) {
  if (node.props['eventTree']) {
    node.props['eventTree'].forEach(item => {
      item.children.forEach(judge => {
        judge.judgeObj = idToObject(list, judge.judgeObjId, judge.judgeVarId);
        delete(judge.judgeObjId);
        delete(judge.judgeVarId);

        judge.compareObj = idToObject(list, judge.compareObjId, judge.compareVarId);
        delete(judge.compareObjId);
        delete(judge.compareVarId);
      });

        let dealWithPropertyFormulaInput = (cmd)=>{
            cmd.action.property.forEach(v=> {
                if (v.value&&v.value.type === 2) {
                    v.value.value.forEach((v1,i)=>{
                        if(v1.objId) {
                            v1.objKey = idToObjectKey(list, v1.objId[0], v1.objId[1]);
                        } else {
                            v1.objKey = null;
                        }
                        (delete v1.objId);
                        if(v1.objKey === null) {
                            //如果不存在就直接删除
                            v.value.value.splice(i, 1);
                        }
                    });
                    if(v.value.value.length===0){
                        v.value.type = 1;
                        v.value.value = null;
                    }
                }
            });
        };

      item.specificList.forEach(cmd => {
          if(cmd.sObjId){
              cmd.object = idToObjectKey(list, cmd.sObjId[0], cmd.sObjId[1]);
          } else {
              cmd.object = null;
          }
          (delete cmd.sObjId);

          //不存在目标动作
          if(!cmd.object||!cmd.action) {
              cmd.action = null;
          } else {
              switch (cmd.action.type) {
                  case funcType.customize:
                      if(cmd.action.funcId){
                          cmd.action.func = idToObjectKey(list, cmd.action.funcId[0], cmd.action.funcId[1]);
                      } else {
                          cmd.action = null;
                      }
                      (delete cmd.action.funcId);
                      dealWithPropertyFormulaInput(cmd);
                      break;
                  default:
                      let o = keyMap[cmd.object];
                      if(o&&o.className === 'db') {
                          cmd.action.property.forEach(v=> {
                              if((v.name === 'data'||v.name=='option')) {
                                  if(v.valueId){
                                      v.value = idToObjectKey(list, v.valueId[0], v.valueId[1]);
                                  } else {
                                      v.value = null;
                                  }
                                  (delete v.valueId);
                              }
                          });
                      } else if(cmd.action.name==='changeValue') {
                          dealWithPropertyFormulaInput(cmd);
                      }
                      break;
              }
          }
      });

    });
  }
  if (node.children.length > 0) {
    node.children.map(item => {
      resolveEventTree(item, list);
    });
  }
}

function resolveDBItemList(node, list) {
    if (node.dbItemList) {
        node.dbItemList.forEach(v => {
            v.fields.forEach(item => {
                if(item.valueId){
                    item.value = idToObjectKey(list, item.valueId[0], item.valueId[1]);
                } else {
                    item.value = null;
                }
                delete(item.valueId);
            });
        });
    }
    if (node.children.length > 0) {
        node.children.map(item => {
            resolveDBItemList(item, list);
        });
    }
}

function trimTreeNode(node, links) {
  if (node.props['link'] !== undefined)
    node.props['link'] = links.push(node.rootWidget.imageList[node.props['link']]) - 1;
  if (node.children.length > 0) {
    node.children.map(item => {
      trimTreeNode(item, links);
    });
  }
}

function trimTree(node) {
  var links = [];
  trimTreeNode(node, links);
  node.imageList = links;
  bridge.setLinks(node.node, links);
}

function generateObjectId(object) {
  if (object&&(object.className == 'var'||object.className == 'func')) {
    if (object.widget.props['id'] === undefined)
      object.widget.props['id'] = 'id_' + object.widget.key;
    if (object.name == '') {
      var list;
      var type;
      var id = 0;
      if (object.type == 'string') {
        type = 's';
        list = object.widget.strVarList;
      } else {
        type = 'i';
        list = object.widget.intVarList;
      }
      list.forEach(value => {
        if (value.name.substr(0, 1) == type) {
          var seq = parseInt(value.name.substr(1));
          if (seq >= id)
            id = seq + 1;
        }
      });
      object.name = type + id;
    }
  } else if (object&&object.props['id'] === undefined) {
    object.props['id'] = 'id_' + object.key;
  }
}

function objectToId(object) {
  let idName, varKey, varName;
  if (object.className == 'var') {
    idName = object.widget.props['id'];
    varName = object.name;
    if (object.type == 'string') {
      varKey = 's' + object.widget.strVarList.indexOf(object);
    } else {
      varKey = 'i' + object.widget.intVarList.indexOf(object);
    }
  }else if (object.className == 'func'){
      idName = object.widget.props['id'];
      varKey = 'f' + object.widget.funcList.indexOf(object);
      varName = object.name;
  } else if (object.className == 'dbItem'){
      idName = object.widget.props['id'];
      varKey = 'd' + object.widget.dbItemList.indexOf(object);
  } else {
    idName = object.props['id'];
  }　

  return [idName, varKey, varName];
}

function objectKeyToId(key) {
    if(key) {
        let obj = keyMap[key];
        if(obj){
            return objectToId(obj);
        }
    }
    return null;
}

function generateId(node) {
    //生成需要的data
    let specGenIdsData = (key) => {
        let data = keyMap[key];
        generateObjectId(data);
    };

    let genPropertyFormulaInputId = (cmd) =>{
        cmd.action.property.forEach(v=>{
            if (v.value&&v.value.type === 2) {
                v.value.value.forEach(v1=>{
                    specGenIdsData(v1.objKey);
                });
            }
        });
    };

  if (node.props['eventTree']) {
      generateObjectId(node);

      node.props['eventTree'].forEach(item => {
      item.children.forEach(judge => {
          judge.judgeObj = keyMap[judge.judgeObjKey];
          judge.compareObj = keyMap[judge.compareObjKey];
          generateObjectId(judge.judgeObj);
          generateObjectId(judge.compareObj);
      });

      item.specificList.forEach(cmd => {
          specGenIdsData(cmd.object);
          if(cmd.action){
              switch (cmd.action.type){
                  case funcType.customize:
                      specGenIdsData(cmd.action.func);
                      genPropertyFormulaInputId(cmd);
                      break;
                  default:
                      if(cmd.action.property){
                          if(cmd.action.name==='changeValue') {
                              genPropertyFormulaInputId(cmd);
                          } else {
                              cmd.action.property.forEach(v=>{
                                  //看是否需要generateid
                                  if (v.name ==='data'|| v.name ==='option') {
                                      specGenIdsData(v.value);
                                  }
                              })
                          }
                      }
                      break;
              }
          }
      });
    });
  }
  if(node.dbItemList){
      node.dbItemList.forEach(item => {
          item.fields.forEach(judge => {
              specGenIdsData(judge.value);
          });
      });
  }
  if (node.children.length > 0) {
    node.children.map(item => {
      generateId(item);
    });
  }
}

function getIdsName(idName, varName, propName) {
  return 'ids.' + idName + '.' + ((varName) ? '__' + varName : propName);
}

function generateJsFunc(etree) {
  var output = {};

  let replaceSymbolStr = (str)=>{
      let temp = str;
      let chineseSymbol = [/＋/g,/－/g,/＊/g,/／/g,/（/g,/）/g,/？/g,/：/g,/‘/g];
      let englishSymbol = ["+","-","*","/","(",")","?",":","'"];
      for(let i=0; i<chineseSymbol.length; i++) {
          temp=temp.replace(chineseSymbol[i], englishSymbol[i]);
      }
      return temp;
  };

  let formulaGenLine = (cmd, lines)=>{
      cmd.action.property.forEach(prop => {
          if(prop.value){
              if(prop.value.type === 1){
                  if(cmd.action.type == funcType.default) {
                      lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[1], 'value') + '=' + JSON.stringify(prop.value.value));
                  } else {
                      lines.push(JSON.stringify(prop.value.value));
                  }
              } else if (prop.value.type === 2) {
                  let subLine = '';
                  prop.value.value.forEach((fV,i) =>{
                      if(fV.objId&&fV.property){
                          if(i===0&&fV.prePattern){
                              subLine += replaceSymbolStr(fV.prePattern);
                          }
                          subLine += getIdsName(fV.objId[0], fV.objId[1], fV.property.name);
                          if(fV.pattern) {
                              subLine += replaceSymbolStr(fV.pattern);
                          }
                      }
                  });
                  if(subLine!=='') {
                      if(cmd.action.type == funcType.default) {
                          lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[1], 'value') + '=' + subLine);
                      } else {
                          lines.push(subLine);
                      }
                  }
              }
          }
      });
      return lines;
  };

  etree.forEach(function(item) {
    if (item.judges.conFlag && item.enable) {
      var out = '';
      var lines = [];
      var conditions = [];
      if (item.judges.children.length) {
        item.judges.children.forEach(function(c) {
          if (c.judgeObjId && c.judgeValFlag && c.enable) {
            var op = c.compareFlag;
            var jsop;
            if (op == '=')
              jsop = '=='
            else if (op == '≥')
              jsop = '>=';
            else if (op == '≤')
              jsop = '<=';
            else
              jsop = op;

            var o = getIdsName(c.judgeObjId, c.judgeVarName, c.judgeValFlag) + jsop;
            if (c.compareObjId) {
                //非特殊五类和特殊五类
              o += getIdsName(c.compareObjId, c.compareVarName, c.compareValFlag);
            } else {
                //用户填写
                o += JSON.stringify(c.compareObjFlag);
            }
            conditions.push('(' + o + ')');
          }
        });
      }
      //console.log('conditions',conditions);
      item.cmds.forEach(cmd => {
        if (cmd.sObjId && cmd.action && cmd.enable && cmd.action.type == 'default') {
          if (cmd.action.name === 'changeValue') {
              lines = formulaGenLine(cmd, lines);
          } else if (cmd.action.name === 'add1') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[1], 'value') + '++');
          } else if (cmd.action.name === 'minus1') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[1], 'value') + '--');
          } else if (cmd.action.name === 'addN') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[1], 'value') + '+=' + JSON.stringify(cmd.action.property[0]['value']));
          } else if (cmd.action.name === 'minusN') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[1], 'value') + '-=' + JSON.stringify(cmd.action.property[0]['value']));
          } else if (cmd.action.name === 'getInt') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[1], 'value') + '=' + 'Math.round(' + getIdsName(cmd.sObjId[0], cmd.sObjId[1], 'value') + ')');
          } else if (cmd.action.name === 'randomValue') {
              let max = JSON.stringify(cmd.action.property[1]['value']);
              let min = JSON.stringify(cmd.action.property[0]['value']);
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[1], 'value') + '=' + 'Math.round(Math.random()*('
                  + max + '-'
                  + min + '+1)+' + min + ')');
          } else {
              //数据库
              var line = getIdsName(cmd.sObjId[0], cmd.sObjId[1], cmd.action.name) + '(';
              if (cmd.action.property) {
                  line += cmd.action.property.map(function(p) {
                      let va = null;
                      if(p['vKey'] !== undefined) {
                          va = keyMap[p['vKey']];
                          if (va) {
                              var list = [];
                              va.fields.forEach(function(v) {
                                  let obj = keyMap[v.value];
                                  if (v.name && obj) {
                                      if (v.name.substr(0, 1) == 'i') {
                                          list.push('\'' + v.name.substr(1) + '\':parseFloat(ids.' + obj.props['id'] + '.value)');
                                      } else if (v.name.substr(0, 1) == 's') {
                                          list.push('\'' + v.name.substr(1) + '\':ids.' + obj.props['id'] + '.value');
                                      } else {
                                          list.push('\'' + v.name + '\':ids.' + obj.props['id'] + '.value');
                                      }
                                  }
                              });
                              delete(p['vKey']);
                              return '{' + list.join(',') + '}';
                          } else {
                              delete(p['vKey']);
                              return '';
                          }
                      }
                      return JSON.stringify(p['value']);
                  }).join(',');
              }
              lines.push(line + ')');
          }
        } else if (cmd.action&&cmd.action.type == 'customize' && cmd.enable) {
          var ps = ['ids'];
          if (cmd.action.property) {
              ps = formulaGenLine(cmd, ps);
          }
          lines.push(getIdsName(cmd.action.funcId[0], cmd.action.funcId[2]) + '(' + ps.join(',') + ')');
        }
      });
      if (lines.length) {
        var out;
        if (conditions.length == 1) {
          out = 'if' + conditions[0];
        } else if (conditions.length) {
          var logicalFlag = item.judges.logicalFlag;
          var lop;
          if (logicalFlag == 'and')
            lop = '&&'
          else if (logicalFlag == 'or')
            lop = '||';
          if (lop)
            out = 'if(' + conditions.join(lop) + ')';
        }
        if (lines.length == 1)
          out += lines[0];
        else
          out += '{' + lines.join(';') + '}';
        if (output[item.judges.conFlag]) {
          output[item.judges.conFlag] += ';' + out;
        } else {
          output[item.judges.conFlag] = out;
        }
      }
    }
  });
  return output;
}

function saveTree(data, node, saveKey) {
  data['cls'] = node.className;
  let props = {};
  for (let name in node.props) {
    if (name === 'id')
      data['id'] = node.props['id'];
    else if (name == 'eventTree') {
      var etree = [];

        node.props['eventTree'].forEach(item => {
        var cmds = [];
        var judges={};
            var eventEnable = item.enable; //是否可执行
            judges.conFlag = item.conFlag;
            if(judges.conFlag=='触发条件'){judges.conFlag=null;}
            judges.className=node.className;
            judges.children=[];
            if(item.needFill) {
                judges.conFlag = 'change';//触发条件
                item.needFill.map((v, i)=> {
                    if(judges.className == 'input' && v.type=='select'){
                        judges.conFlag =v.default;
                    } else{
                        let obj = {};
                        obj.enable=true;
                        obj.judgeObjKey =node.key;
                        let judgeObj =keyMap[obj.judgeObjKey];
                        if (judgeObj) {
                            let o = objectToId(judgeObj);
                            obj.judgeObjId = o[0];
                            if (o[1]) {
                                obj.judgeVarId = o[1];
                                obj.judgeVarName = o[2];
                            }
                        }
                        obj.judgeValFlag = 'value';

                        obj.compareFlag = item.conFlag;

                        if((judges.className=='text' ||judges.className=='input') &&  (obj.compareFlag == 'isMatch' || obj.compareFlag == 'isUnMatch')){
                            obj.compareFlag = obj.compareFlag == 'isMatch'?'=':'!=';
                        }else if(judges.className=='counter' && ( obj.compareFlag=='valRange') ){
                            obj.compareFlag = v.showName == '最大值'?'<':'>';
                        }

                        obj.showName=v.showName;
                        obj.type=v.type;
                        obj.compareObjFlag =v.default;

                        judges.children.push(obj);
                    }
                });
            }else if( judges.className=='counter' &&( judges.conFlag == 'positive' || judges.conFlag == 'negative')) {
                let obj = {};
                obj.enable=true;
                obj.judgeObjKey =node.key;
                let judgeObj =keyMap[obj.judgeObjKey];
                if (judgeObj) {
                    let o = objectToId(judgeObj);
                    obj.judgeObjId = o[0];
                    if (o[1]) {
                        obj.judgeVarId = o[1];
                        obj.judgeVarName = o[2];
                    }
                }
                obj.judgeValFlag = 'value';
                obj.compareFlag = judges.conFlag == 'positive'?'>':'<';
                obj.compareObjFlag =0;
                judges.children.push(obj);
            }



        judges.logicalFlag =item.logicalFlag; //逻辑判断符
        judges.zhongHidden =item.zhongHidden; //是否启用逻辑判断条件
            item.children.map((v,i)=> {
                let obj = {};
                let isSpecial1 = false;
                let isSpecial2 = false;
                obj.enable = v.enable; //是否可执行
                obj.judgeObjKey = v.judgeObjKey;
                obj.judgeObjFlag = v.judgeObjFlag;
                if (v.judgeObj) {
                    let o = objectToId(v.judgeObj); //1 获取id 2 判断五类情况
                    obj.judgeObjId = o[0];
                    if (o[1]) {
                        obj.judgeVarId = o[1];
                        obj.judgeVarName = o[2];
                    }
                    //获取类名,判断是否属于五类特殊对象对象,改造条件值
                    isSpecial1 = specialObject.indexOf(v.judgeObj.className) >= 0;
                }
                if (isSpecial1) {
                    obj.judgeValFlag = 'value';
                } else {
                    obj.judgeValFlag = v.judgeValFlag;//判断对象的属性
                }


                obj.compareFlag = v.compareFlag;//比较运算符


                obj.compareObjFlag = v.compareObjFlag;
                obj.compareObjKey = v.compareObjKey;
                if (v.compareObj) {
                    var o = objectToId(v.compareObj);
                    obj.compareObjId = o[0];
                    if (o[1]) {
                        obj.compareVarId = o[1];
                        obj.compareVarName = o[2];
                    }
                    isSpecial2 = specialObject.indexOf(v.compareObj.className) >= 0;
                }
                if (isSpecial2) {
                 //   obj.compareValFlag = v.compareObj.props.value;
                    obj.compareValFlag ='value';
                } else if (v.compareValFlag == '比较值') {
                    //用户填的值
                    obj.compareObjFlag = v.compareObjFlag;
                } else {
                    //非五类
                    obj.compareValFlag = v.compareValFlag;
                }

                obj.arrHidden = v.arrHidden;

                judges.children.push(obj);
            });

        item.specificList.forEach(cmd => {
            let c = {};
            c.enable = cmd.enable;
            c.sObjId = objectKeyToId(cmd.object);
            if(saveKey) {
                c.object = cmd.object;
            }
            //有对象才会有动作，不然动作清除
            if (c.sObjId&&cmd.action) {
                c.action = {};
                switch (cmd.action.type) {
                    case funcType.customize:
                        c.action.funcId = objectKeyToId(cmd.action.func);
                        c.action.type = cmd.action.type;
                        if(saveKey) {
                            c.action.func = cmd.action.func;
                        }
                        break;
                    default:
                        c.action.name = cmd.action.name;
                        c.action.showName = cmd.action.showName;
                        c.action.type = cmd.action.type;
                        break;
                }
                if (cmd.action.property) {
                    let property = [];
                    let o = keyMap[cmd.object];
                    if(o&&o.className === 'db') {
                        cmd.action.property.forEach(v=> {
                            if(v.name === 'data' && v.value) {
                                let temp = {
                                    name:v.name,
                                    showName: v.showName,
                                    type: v.type,
                                    valueId: objectKeyToId(v.value),
                                    vKey: v.value
                                };
                                if(saveKey) {
                                    temp.value = v.value;
                                }
                                property.push(temp);

                            } else if (v.name === 'option'&& v.value) {
                                let temp = {
                                    name:v.name,
                                    showName: v.showName,
                                    type: v.type,
                                    valueId: objectKeyToId(v.value)
                                };
                                if(saveKey) {
                                    temp.value = v.value;
                                }
                                property.push(temp);
                            } else {
                                property.push(v);
                            }
                        });
                        c.action.property = property;
                    } else if(cmd.action.name=='changeValue' || cmd.action.type===funcType.customize) {
                            cmd.action.property.forEach(v => {
                                if(v.value && v.value.type === 2) {
                                    let temp = {
                                        name: v.name,
                                        showName: v.showName,
                                        type:v.type,
                                        value:{
                                            type:2,
                                            value:[],
                                        }
                                    };
                                    v.value.value.forEach(v1=>{
                                        let tempV = {
                                            prePattern: v1.prePattern,
                                            objId: objectKeyToId(v1.objKey),
                                            property: v1.property,
                                            pattern: v1.pattern,
                                        };
                                        if(saveKey) {
                                            tempV.objKey = v1.objKey;
                                        }
                                        temp.value.value.push(tempV);
                                    });
                                    property.push(temp);
                                } else {
                                    property.push(v);
                                }
                            });
                            c.action.property = property;
                    } else {
                        c.action.property = cmd.action.property;
                    }
                }
            } else {
                c.action = null;
            }
            cmds.push(c);
        });


        //console.log('judges',judges);
        etree.push({cmds:cmds,judges:judges, enable:eventEnable});


      });
      data['etree'] = etree;
        if(node.props['enableEventTree'] && !saveKey){
            var js = generateJsFunc(etree);
            if (js)
                data['events'] = js;
        }
    } else {
        props[name] = node.props[name];
    }
  }
  if (saveKey)
    props['key'] = node.key;
  if (props)
    data['props'] = props;
  // if (node.events)
  //   data['events'] = node.events;
  var list = [];
  if (node.intVarList.length > 0) {
      //int vars list
      node.intVarList.forEach(item =>{
          let o = {};
          o['name'] = item.name;
          o['value'] = item.value==null?item.value:parseInt(item.value);
          o['props'] = item.props;
          o['type'] = item.type;
          if (saveKey) {
              o['key'] = item.key;
          }
          list.push(o);
      });
  }
  if(node.strVarList.length > 0){
    //str vars list
      node.strVarList.forEach(item =>{
          let o = {};
          o['name'] = item.name;
          o['value'] = item.value;
          o['props'] = item.props;
          o['type'] = item.type;
          if (saveKey) {
              o['key'] = item.key;
          }
          list.push(o);
      });
  }
  if (list.length)
    data['vars'] = list;
  list = [];
  if (node.funcList.length > 0) {
      node.funcList.forEach(item =>{
          var o = {};
          o['name'] = item.name;
          o['value'] = item.value;
          o['params'] = item.params;
          o['props'] = item.props;
          if (saveKey) {
              o['key'] = item.key;
          }
          list.push(o);
      });
  }
  if (list.length)
    data['funcs'] = list;
  if(node.className==='db'&&node.dbItemList.length >0) {
      //db
      data['dbItems'] = [];
      node.dbItemList.forEach(item =>{
          var o = {};
          o['name'] = item.name;
          o['fields'] = [];
          item.fields.forEach(field =>{
              let name = field.name;
              let temp = {name: name, valueId: objectKeyToId(field.value)};
              if (saveKey) {
                  temp.value = field.value;
              }
              o['fields'].push(temp);
          });
          o['props'] = item.props;
          if (saveKey) {
              o['key'] = item.key;
          }
          data['dbItems'].push(o);
      });
  }
  if (node.children.length > 0) {
    data['children'] = [];
    node.children.map(item => {
      if (item.className == 'track' && item.props['prop'] && item.props['data'].length > 0) {
        data['props'] = data['props'] || {};
        for (var i = 0; i < item.props['prop'].length; i++) {
          data['props'][item.props['prop'][i]] = item.props['data'][0][i + 1];
        }
      }
      let child = {};
      data['children'].unshift(child);
      saveTree(child, item, saveKey);
    });
  }
}

bridge.setGenerateText(function(widget, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'app/generateText');
  if (globalToken)
      xhr.setRequestHeader('Authorization', 'Bearer {' + globalToken + '}');
  var form = new FormData();
  form.append('font', widget['font']);
  form.append('text', widget['value']);
  form.append('size', widget['size']);
  form.append('color', widget['color']);
  form.append('lineHeight', widget['lineHeight']);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e) {
    if (this.status == 200) {
      var uInt8Array = new Uint8Array(this.response);
      var i = uInt8Array.length;
      var binaryString = new Array(i);
      while (i--)
      {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
      }
      var data = binaryString.join('');
      WidgetActions['setImageText']('data:image/png;base64,' + btoa(data));
    }
  };
  xhr.send(form);
});

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
          let fileName = file.name;
          let dot = fileName.lastIndexOf('.');
          if (dot>0) {
              var ext = fileName.substr(dot + 1).toLowerCase();
              if (ext == 'png' || ext == 'jpeg' || ext=='jpg') {
                  fileName = fileName.substr(0, dot);
              }
          }
        let reader = new FileReader();
        reader.onload = e => {
            let props = {name: fileName};
          this.addWidget('image', props, e.target.result);
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

var historyRecord = [];
var historyRW = historyRecord.length;
var historyName = "";
var historyNameList = ["初始化"];

export default Reflux.createStore({
    init: function () {
        this.listenTo(WidgetActions['selectWidget'], this.selectWidget);
        this.listenTo(WidgetActions['addWidget'], this.addWidget);
        this.listenTo(WidgetActions['reorderWidget'], this.reorderWidget);
        this.listenTo(WidgetActions['moveWidget'], this.moveWidget);
        this.listenTo(WidgetActions['addClass'], this.addClass);
        this.listenTo(WidgetActions['sortClass'], this.sortClass);
        this.listenTo(WidgetActions['deleteClass'], this.deleteClass);
        this.listenTo(WidgetActions['removeWidget'], this.removeWidget);
        this.listenTo(WidgetActions['copyWidget'], this.copyWidget);
        this.listenTo(WidgetActions['pasteWidget'], this.pasteWidget);
        this.listenTo(WidgetActions['initTree'], this.initTree);
        this.listenTo(WidgetActions['render'], this.render);
        this.listenTo(WidgetActions['updateProperties'], this.updateProperties);
        this.listenTo(WidgetActions['resetTrack'], this.resetTrack);
        this.listenTo(WidgetActions['syncTrack'], this.syncTrack);
        this.listenTo(WidgetActions['deletePoint'], this.deletePoint);
        this.listenTo(WidgetActions['saveNode'], this.saveNode);
        this.listenTo(WidgetActions['setRulerLine'], this.setRulerLine);
        this.listenTo(WidgetActions['setRulerLineBtn'], this.setRulerLineBtn);
        this.listenTo(WidgetActions['setFont'], this.setFont);
        this.listenTo(WidgetActions['setImageText'], this.setImageText);
        this.listenTo(WidgetActions['imageTextSize'], this.imageTextSize);
        this.listenTo(WidgetActions['ajaxSend'], this.ajaxSend);
        this.listenTo(WidgetActions['saveFontList'], this.saveFontList);
        this.listenTo(WidgetActions['activeHandle'], this.activeHandle);

        this.listenTo(WidgetActions['renameWidget'], this.renameWidget);
        this.listenTo(WidgetActions['cutWidget'], this.cutWidget);
        this.listenTo(WidgetActions['lockWidget'], this.lockWidget);

        //事件
        this.listenTo(WidgetActions['initEventTree'], this.initEventTree);
        this.listenTo(WidgetActions['removeEventTree'], this.removeEventTree);
        this.listenTo(WidgetActions['enableEventTree'], this.enableEventTree);
        this.listenTo(WidgetActions['activeEventTree'], this.activeEventTree);


        this.listenTo(WidgetActions['addEvent'], this.addEvent);
        this.listenTo(WidgetActions['enableEvent'], this.enableEvent);
        this.listenTo(WidgetActions['delEvent'], this.delEvent);

        this.listenTo(WidgetActions['getAllWidgets'], this.getAllWidgets);
        this.listenTo(WidgetActions['reorderEventTreeList'], this.reorderEventTreeList);

        //事件属性
        this.listenTo(WidgetActions['addSpecific'], this.addSpecific);
        this.listenTo(WidgetActions['deleteSpecific'], this.deleteSpecific);
        this.listenTo(WidgetActions['changeSpecific'], this.changeSpecific);
        this.listenTo(WidgetActions['enableSpecific'], this.enableSpecific);
        //判断逻辑事件
        this.listenTo(WidgetActions['addEventChildren'], this.addEventChildren);
        this.listenTo(WidgetActions['delEventChildren'], this.delEventChildren);
        this.listenTo(WidgetActions['enableEventChildren'], this.enableEventChildren);
        this.listenTo(WidgetActions['recordEventTreeList'], this.recordEventTreeList);

        //widget，变量，函数的统一复制，黏贴，删除，重命名，剪切入口
        this.listenTo(WidgetActions['pasteTreeNode'], this.pasteTreeNode);
        this.listenTo(WidgetActions['cutTreeNode'], this.cutTreeNode);
        this.listenTo(WidgetActions['copyTreeNode'], this.copyTreeNode);
        this.listenTo(WidgetActions['deleteTreeNode'], this.deleteTreeNode);
        this.listenTo(WidgetActions['renameTreeNode'], this.renameTreeNode);

        //函数，变量，db item等伪对象选择添加的入口
        this.listenTo(WidgetActions['selectFadeWidget'], this.selectFadeWidget);
        this.listenTo(WidgetActions['addFadeWidget'], this.addFadeWidget);
        //函数
        this.listenTo(WidgetActions['changeFunction'], this.changeFunction);
        //变量
        this.listenTo(WidgetActions['changeVariable'], this.changeVariable);
        //db item
        this.listenTo(WidgetActions['changeDBItem'], this.changeDBItem);

        this.listenTo(WidgetActions['didSelectTarget'], this.didSelectTarget);

        this.listenTo(WidgetActions['updateHistoryRecord'], this.updateHistoryRecord);
        this.listenTo(WidgetActions['revokedHistory'], this.revokedHistory);
        this.listenTo(WidgetActions['replyHistory'], this.replyHistory);
        this.listenTo(WidgetActions['chooseHistory'], this.chooseHistory);
        this.listenTo(WidgetActions['cleanHistory'], this.cleanHistory);
        //this.currentActiveEventTreeKey = null;//初始化当前激活事件树的组件值

        this.eventTreeList = [];
        this.historyRoad;
    },
    selectWidget: function(widget, shouldTrigger, keepValueType, isMulti) {
        var render = false;
        if (widget) {
            if (!this.currentWidget || this.currentWidget.rootWidget != widget.rootWidget) {
                render = true;
                var el = bridge.getDomElement(widget.rootWidget.node);
                if (el != rootElm) {
                    if (rootElm)
                        rootDiv.removeChild(rootElm);
                        rootElm = el;
                        rootDiv.appendChild(rootElm);
                }
            }

            if(widget.props['locked'] === undefined) {
                widget.props['locked'] = false;
            }
            //取选激活的事件树
            if(!(keepValueType&&keepValueType==keepType.event)&&this.currentActiveEventTreeKey) {
                this.activeEventTree(null);
            }
            //取选func状态
            if(!(keepValueType&&keepValueType==keepType.func)&&this.currentFunction){
                this.selectFadeWidget(null, nodeType.func);
            }
            //取选var状态
            if(!(keepValueType&&keepValueType==keepType.var)&&this.currentVariable) {
                this.selectFadeWidget(null, nodeType.var);
            }
            //取选dbItem
            if(!(keepValueType&&keepValueType==keepType.dbItem)&&this.currentDBItem) {
                this.selectFadeWidget(null, nodeType.dbItem);
            }
        }

        //是否触发（不为false就触发）
        if(shouldTrigger!=false) {
            if (isMulti) {
                this.selectWidgets = this.selectWidgets || [];
                this.selectWidgetNodes = this.selectWidgetNodes || [];

                if(this.selectWidgets.length===1) {
                    if(this.selectWidgets[0] && selectableClass.indexOf(this.selectWidgets[0].className)>=0) {
                        if (this.selectWidgets.indexOf(widget) < 0) {
                            this.selectWidgets.push(widget);
                            this.selectWidgetNodes.push(widget.node);
                        }
                    } else {
                        return;
                    }
                } else {
                    if (this.selectWidgets.indexOf(widget) < 0) {
                        this.selectWidgets.push(widget);
                        this.selectWidgetNodes.push(widget.node);
                    }
                }
            } else {
                this.selectWidgets = [widget];
                this.selectWidgetNodes = [widget.node];
            }
            if (this.selectWidgets.indexOf(widget) == 0) {
                this.currentWidget = widget;
                this.trigger({selectWidget: widget});
            } else {
                this.trigger({selectWidgets: this.selectWidgets})
            }

            //判断是否是可选择的，是否加锁
            if (widget && selectableClass.indexOf(widget.className) >= 0 && !widget.props['locked']) {
                bridge.selectWidget(this.selectWidgetNodes, function(w, obj) {
                    var currentIndex;
                    this.selectWidgetNodes.forEach((n, index) => {
                        if (n != w) {
                            this.selectWidgets[index].props['positionX'] = n['positionX'];
                            this.selectWidgets[index].props['positionY'] = n['positionY'];
                        } else {
                            currentIndex = index;
                        }
                    });
                    if (w == this.currentWidget.node) {
                        this.updateProperties(obj);
                    } else {
                        for (var p in obj) {
                            this.selectWidgets[currentIndex].props[p] = w[p] = obj[p];
                        }
                        this.updateProperties({'positionX':this.currentWidget.node['positionX'], 'positionY':this.currentWidget.node['positionY']});
                    }
                }.bind(this));
            } else {
                  bridge.selectWidget(widget.node);
            }
            if (render)
                this.render();
        } else {
            this.currentWidget = widget;
        }
    },
    addWidget: function(className, props, link, name, dbType) {
      if (!this.currentWidget)
          return;

      if(className == "db"){
          props = this.addWidgetDefaultName(className, props, true, false, name,dbType);
          historyName = "添加 数据库"+name;
      } else if(className == "sock"){
          props = this.addWidgetDefaultName(className, props, true, false, name);
          historyName = "添加 连接"+name;
      } else if (!(className === 'image')) {
          props = this.addWidgetDefaultName(className, props, true, false);
          historyName = "添加 "+ props.name;
      }
      else {
          historyName = "添加图片 "+ props.name;
      }


      if (className === 'track') {
        if (!this.currentWidget.timerWidget ||
            (this.currentWidget.className !== 'image'
              && this.currentWidget.className !== 'imagelist'
              && this.currentWidget.className !== 'text'
              && this.currentWidget.className !== 'bitmaptext'
              && this.currentWidget.className !== 'ellipse'
              && this.currentWidget.className !== 'path'
              && this.currentWidget.className !== 'qrcode'
              && this.currentWidget.className !== 'counter'
              && this.currentWidget.className !== 'rect'
              && this.currentWidget.className !== 'container'))
          return;
        let propList = ['positionX', 'positionY', 'scaleX', 'scaleY', 'rotation', 'alpha'];
        let dataList = [];   //let dataList = [[0], [1]];
        //for (let i = 0; i < propList.length; i++) {
        //  let d = this.currentWidget.node[propList[i]];
        //  dataList[0].push(d);
        //  //dataList[1].push(d);
        //}
        let track = loadTree(this.currentWidget, {'cls':className, 'props': {'prop': propList, 'data': dataList, 'name':props['name']}});
        this.trigger({redrawTree: true, updateTrack: track});
      } else if (className === 'body' || className === 'easing' || className === 'effect' || this.currentWidget.node['create']) {
        let p;
        if (props || link) {
          p = {};
          if (props) {
            for (let n in props) {
              p[n] = props[n];
            }
          }
          if (link)
            p['link'] = this.currentWidget.rootWidget.imageList.push(link) - 1;
        }
          var o = loadTree(this.currentWidget, {'cls':className, 'props': p});
          if (className == 'bitmaptext')
              currentLoading = o;
        var cmd = {redrawTree: true};

        if (className == 'body'  )
          cmd.updateProperties = {'originX':0.5, 'originY':0.5};
        this.trigger(cmd);
        this.getAllWidgets();
        this.render();
      }
        this.updateHistoryRecord(historyName);
    },
    removeWidget: function(shouldChooseParent) {
        historyName = "删除" + this.currentWidget.node.name;
        let parentWidget;
        if (this.currentWidget&&shouldChooseParent) {
            parentWidget = this.currentWidget.parent ? this.currentWidget.parent : this.currentWidget.rootWidget;
        }
        if (this.currentWidget && this.currentWidget.parent) {
            //isModified = true;
            bridge.removeWidget(this.currentWidget.node);

            let index = this.currentWidget.parent.children.indexOf(this.currentWidget);
            var rootNode = this.currentWidget.rootWidget.node;
            this.currentWidget.parent.children.splice(index, 1);

            if(this.currentWidget.props.eventTree){
                this.reorderEventTreeList();
            }

            keyMap[this.currentWidget.key] = undefined;

            this.removeAllFadeWidgetsMapping(this.currentWidget);

            this.trigger({updateWidget: {widget:this.currentWidget, type:nodeType.widget, action:nodeAction.remove}});

            this.currentWidget = null;
            if(shouldChooseParent) {
               this.selectWidget(parentWidget);
            } else {
                this.trigger({selectWidget: null, redrawTree: true});
            }
            process.nextTick(() =>bridge.render(rootNode));

            this.updateHistoryRecord(historyName);
        }
    },
    removeAllFadeWidgetsMapping(w){
        let loopDelete = (widget)=>{
            widget.strVarList.forEach((v)=>{
                keyMap[v.key] = undefined;
            });
            widget.intVarList.forEach((v)=>{
                keyMap[v.key] = undefined;
            });
            if(widget.dbItemList) {
                widget.dbItemList.forEach((v)=>{
                    keyMap[v.key] = undefined;
                });
            }
            if (widget.children&&widget.children.length>0) {
                widget.children.forEach((v)=>{
                    keyMap[v.key] = undefined;
                    loopDelete(v);
                });
            }
        };
        loopDelete(w);
    },
    copyWidget: function() {
      if (this.currentWidget && this.currentWidget.parent) {
        copyObj = {};
        saveTree(copyObj, this.currentWidget, true);
      }
    },
    pasteWidget: function() {
      if (this.currentWidget) {
          if (!copyObj.className&&!copyObj.cls) {
              return;
          }

        // 重命名要黏贴的widget
        copyObj.props = this.addWidgetDefaultName(copyObj.cls, copyObj.props, false, true);
          if(copyObj.props&&copyObj.props.key) {
              (delete copyObj.props.key);
          }
        loadTree(this.currentWidget, copyObj);
        if(copyObj.props.eventTree){
          this.reorderEventTreeList();
        }
        this.trigger({selectWidget: this.currentWidget});
        this.render();
          historyName = "复制" + this.currentWidget.node.name;
          this.updateHistoryRecord(historyName);
      }
    },
    cutWidget: function() {
        this.copyWidget();
        this.removeWidget(true);
    },
    lockWidget: function () {
        if (this.currentWidget) {
            this.currentWidget.props['locked'] = !this.currentWidget.props['locked'];
            this.updateProperties({'locked':this.currentWidget.props['locked']});
            if (!this.currentWidget.props['locked']) {
                bridge.selectWidget(this.currentWidget.node, this.updateProperties.bind(this));
            } else {
                bridge.selectWidget(this.currentWidget.node);
            }
            //递归遍历加锁
            let parentLock = this.currentWidget.props['locked'];
            let loopLock = (children) => {
                children.forEach(v=>{
                    v.props['locked'] = parentLock;
                    if(v.children&&v.children.length>0) {
                        loopLock(v.children);
                    }
                });
            };
            loopLock(this.currentWidget.children);

            this.trigger({redrawTree: true});
            // this.render();
            historyName = "加锁" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    getWidgetByKey: function (key) {
        return keyMap[key];
    },
    findWidget: function(key){
        let root = this.currentWidget.rootWidget;
        let target = null;

        //递归遍历添加有事件widget到eventTreeList
        let loopWidgetTree = (children) => {
            children.forEach(ch=>{
                if (ch.key === key) {
                    target = ch;
                } else {
                    if (ch.children && ch.children.length > 0) {
                        loopWidgetTree(ch.children);
                    }
                }
            });
        };

        if(root.key === key ){
            target = root;
        } else {
            loopWidgetTree(root.children);
        }
        return target;
    },
    moveWidget: function(src, dest, index) {
        if(this.currentWidget&&this.currentWidget.rootWidget){
            // src = this.findWidget(srcKey);
            // let dest = this.findWidget(destKey);
            if (src&&dest) {
                var saved = {};
                saveTree(saved, src, true);
                bridge.removeWidget(src.node);
                src.parent.children.splice(src.parent.children.indexOf(src), 1);

                //获取名字
                // this.currentWidget = dest;
                // let props = this.addWidgetDefaultName(src.className, src.props, false, true);
                var obj = loadTree(dest, saved);

                var destIndex = dest.children.indexOf(obj);
                if (destIndex != index) {
                    // obj.props['name'] = props['name'];
                    dest.children.splice(destIndex, 1);
                    dest.children.splice(index, 0, obj);
                    // var delta = index - destIndex;
                    bridge.reorderWidget(obj.node, -(index - destIndex));
                }
                this.render();
                this.selectWidget(obj);
                this.reorderEventTreeList();
                historyName = "移动" + this.currentWidget.node.name;
                this.updateHistoryRecord(historyName);
            }
        }
    },
    reorderWidget: function(delta) {
      if (this.currentWidget && this.currentWidget.parent) {
          let index = this.currentWidget.parent.children.indexOf(this.currentWidget);
          if (delta > 0 && index < this.currentWidget.parent.children.length - 1 || delta < 0 && index > 0) {
            this.currentWidget.parent.children.splice(index, 1);
            this.currentWidget.parent.children.splice(index + delta, 0, this.currentWidget);
            bridge.reorderWidget(this.currentWidget.node, -delta);
            this.render();
            this.trigger({redrawTree: true});
            this.reorderEventTreeList();
              historyName = "移动" + this.currentWidget.node.name;
              this.updateHistoryRecord(historyName);
          }
      }
    },
    addWidgetDefaultName: function(className, properties, valueAsTextName, copyProperties ,name,dbType) {
        if(properties === undefined || properties === null) {
            properties = {};
        }
        let props = properties;

        if(copyProperties) {
            props = [];
            for (let n in properties) {
                props[n] = properties[n];
            }
        }

        //自定义组件就不重命名
        if(isCustomizeWidget(className)){
            props['name'] = className;
        } else if( className == "db"){
            if(dbType){
                props['name'] = name + dbCumulative;
                props['dbType'] = "personalDb";
                dbCumulative++;
            }
            else {
                props['name'] = name;
                props['dbType'] = "shareDb";
            }
        } else if( className == "sock"){
            props['name'] = name;
        } else if (className === 'data') {
            let cOrder = 1;
            this.currentWidget.children.forEach(cW => {
                if(cW.className === className && cW.props.type === props.type){
                    cOrder+=1;
                }
            });
            props['name'] = props.type + cOrder;
        } else {
            if ((className === 'text' || className === 'bitmaptext') && props.value && valueAsTextName){
                props['name'] = props.value;
            } else {
                let cOrder = 1;
                //查找当前widget有多少个相同className的，然后＋1处理名字
                this.currentWidget.children.forEach(cW => {
                    if(cW.className === className) {
                        cOrder+=1;
                    }
                });
                props['name'] = className + cOrder;
            }
        }
        return props;
    },
    renameWidget: function (newName) {
        this.currentWidget.props['name'] = newName;
        this.updateProperties({'name':this.currentWidget.props['name']});
        // this.render();
        this.trigger({redrawTree: true});
        historyName = "重命名" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    updateProperties: function(obj, skipRender, skipProperty) {
       
        if(obj &&obj.alpha&& obj.alpha !== 0){
            let value = parseFloat(obj.alpha);
            if(!value) {
                obj.alpha = 1;
            }
        }

        let p = {updateProperties: obj};
        if (skipRender) {
            p.skipRender = true;
            bridge.updateSelector(this.currentWidget.node);
        }
        if (skipProperty) {
            p.skipProperty = true;
            bridge.updateSelector(this.currentWidget.node);
        }
        this.trigger(p);
        historyName = "更改属性" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    reorderEventTreeList: function () {
        if(this.currentWidget&&this.currentWidget.rootWidget) {
            this.eventTreeList = [];
            //母节点
            if(this.currentWidget.rootWidget.props.eventTree){
                this.eventTreeList.push(this.currentWidget.rootWidget);
            }
            //递归遍历添加有事件widget到eventTreeList
            let loopEventTree = (children) => {
                children.forEach(ch => {
                    if(ch.props.eventTree){
                        this.eventTreeList.push(ch);
                    }
                    if(ch.children&&ch.children.length>0) {
                        loopEventTree(ch.children);
                    }
                });
            };
            loopEventTree(this.currentWidget.rootWidget.children);
            this.trigger({eventTreeList: this.eventTreeList});
        }
    },
    emptyEvent: function () {
        //需根据不同的className添加不同的触发条件和目标对象，动作之类的
        let eid = _eventCount++;
        let eventSpec = this.emptyEventSpecific();

        let event = {
            'eid': eid,
            'children': [{
                'judgeObjFlag':'判断对象',
                'judgeValFlag':'判断值',
                'compareFlag':'=',
                'compareObjFlag':'比较值/对象',
                'compareValFlag':'比较值',
                'arrHidden': [true,true,true,true,true,true],  //逻辑运算符,判断对象,判断值,比较运算符,比较对象,比较值
                'enable': true,
            }],
            'zhongHidden':true,
            'logicalFlag':'and',
            'conFlag':'触发条件',
            'className':null,
            'enable': true,
            'specificList': [eventSpec]
        };
        return event;
    },
    emptyEventSpecific: function() {
        let eventSpecific = {
            'sid': _specificCount++,
            'object': null,
            'action': null,
            'enable': true,
        };
        return eventSpecific;
    },
    //获取所有的widget
    getAllWidgets: function(){
        if(this.currentWidget&&this.currentWidget.rootWidget){
            let root = this.currentWidget.rootWidget;
            let widgetList = [];
            //母节点
            if(this.currentWidget.rootWidget){
                widgetList.push(root);
                if(root.intVarList.length>0){
                    root.intVarList.forEach(v => {
                        widgetList.push(v);
                    });
                }
                if(root.strVarList.length>0){
                    root.strVarList.forEach(v => {
                        widgetList.push(v);
                    });
                }
            }
            //递归遍历添加有事件widget到eventTreeList
            let loopWidgetTree = (children) => {
                children.forEach(ch=>{
                    widgetList.push(ch);
                    if(ch.intVarList.length>0){
                        ch.intVarList.forEach(v=> {
                            widgetList.push(v);
                        });
                    }
                    if(ch.strVarList.length>0){
                        ch.strVarList.forEach(v=> {
                            widgetList.push(v);
                        });
                    }
                    if (ch.children && ch.children.length > 0) {
                        loopWidgetTree(ch.children);
                    }
                });
            };
            loopWidgetTree(this.currentWidget.rootWidget.children);
            this.trigger({allWidgets: widgetList});
        }
    },
    initEventTree: function(className, props) {
        if (this.currentWidget) {
            this.currentWidget.props['enableEventTree'] = true;
            this.currentWidget.props['eventTree'] = [];
            this.currentWidget.props['eventTree'].push(this.emptyEvent());
            this.activeEventTree(this.currentWidget.key);
            this.trigger({redrawWidget: this.currentWidget});
        }
        // this.reorderEventTreeList();
        // this.render();
    },
    removeEventTree: function() {
        if (this.currentWidget) {
            delete this.currentWidget.props['eventTree'];
            delete this.currentWidget.props['enableEventTree'];
        }
        this.trigger({redrawTree: true});
        this.reorderEventTreeList();
        // this.render();
        historyName = "删除事件组" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    enableEventTree: function (skipSetEventList, enableValue) {
        if (this.currentWidget) {
            if(enableValue!==undefined) {
                this.currentWidget.props['enableEventTree'] = enableValue;
            } else {
                this.currentWidget.props['enableEventTree'] = !this.currentWidget.props['enableEventTree'];
            }
            let isEnable = this.currentWidget.props['enableEventTree'];
            if(!skipSetEventList&&this.currentWidget.props.eventTree&&this.currentWidget.props.eventTree.length>0){
                this.currentWidget.props.eventTree.forEach(event=>{
                    event.enable = isEnable;
                    if(event.children&&event.children.length>0) {
                        event.children.forEach(eventChildren => {
                            eventChildren.enable = isEnable;
                        });
                    }
                    if(event.specificList&&event.specificList.length>0) {
                        event.specificList.forEach(specific => {
                            specific.enable = isEnable;
                        });
                    }
                });
                this.trigger({redrawEventTree: true});
            }
        }
        this.trigger({redrawTree: true});
        historyName = enableValue?"激活事件组":"屏蔽事件组" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
        // this.render();
    },
    activeEventTree: function (nid) {
        // if(!this.currentActiveEventTreeKey&&(nid!=null||nid!=undefined)){
        //     this.reorderEventTreeList();
        //     this.getAllWidgets();
        // }
        //激活事件树
        if (nid!=null||nid!=undefined) {
            this.currentActiveEventTreeKey = nid;
            this.reorderEventTreeList();
            this.getAllWidgets();
        } else {
            this.currentActiveEventTreeKey = null;
        }
        this.trigger({activeEventTreeKey:{key:this.currentActiveEventTreeKey}});
        // this.render();
        historyName = "激活事件组" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    addEvent: function () {
        if (this.currentWidget) {
            this.currentWidget.props['eventTree'].push(this.emptyEvent());
            if(!this.currentWidget.props['enableEventTree']) {
                this.currentWidget.props['enableEventTree'] = true;
                this.trigger({redrawTree: true});
            }
        }
        this.trigger({redrawEventTreeList:true});
        historyName = "激活事件" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    enableEvent: function (event) {
        if(event) {
            event.enable = !event.enable;
            if(event.children&&event.children.length>0) {
                event.children.forEach(eventChildren => {
                    eventChildren.enable = event.enable;
                });
            }
            if(event.specificList&&event.specificList.length>0) {
                event.specificList.forEach(specific => {
                    specific.enable = event.enable;
                });
            }
            this.changeEventTreeEnableByEvents();
            this.trigger({redrawEventTree: true});
            historyName = event.enable?"激活事件":"屏蔽事件" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    changeEventTreeEnableByEvents: function () {
        if(this.currentWidget.props['eventTree']) {
            let enableLength = 0;
            let disableLength = 0;
            this.currentWidget.props.eventTree.forEach(event=>{
                if(event.enable) {
                    enableLength++;
                } else {
                    disableLength++;
                }
            });
            if(enableLength=== 0||
                disableLength=== 0){
                this.enableEventTree(true, disableLength===0);
            } else if (!this.currentWidget.props['enableEventTree']) {
                this.enableEventTree(true, true);
            }
        }
    },
    delEvent:function(eventList,index){
        let len =eventList.length;
        if(len>1){
            eventList.splice(index,1);
        }else if (this.currentWidget) {
            this.currentWidget.props['eventTree'] = [this.emptyEvent()];
        }

        this.changeEventTreeEnableByEvents();
        this.trigger({redrawEventTreeList: true});
        historyName = "删除事件" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    addEventChildren:function(event){
        if(event && event['children']){
            event['children'].push({
                'cid': _childrenCount++,
                judgeObjFlag:'判断对象',
                judgeValFlag:'判断值',
                compareFlag:'=',
                compareObjFlag:'比较值/对象',
                compareValFlag:'比较值',
                enable: true,
                arrHidden: [false,false,true,true,true,true]  //逻辑运算符,判断对象,判断值,比较运算符,比较对象,比较值
            });
            this.trigger({redrawEventTree: true});
            historyName = "添加事件条件" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    delEventChildren:function(event,index){
        if(event && event['children']){
            event.children.splice(index,1);
            this.trigger({redrawEventTree: true});
            historyName = "删除事件条件" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    enableEventChildren:function(eventChild) {
        if(eventChild){
            eventChild.enable = !eventChild.enable;
            this.trigger({redrawEventTree: true});
            historyName = eventChild.enable?"激活事件条件":"屏蔽事件条件" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    recordEventTreeList:function(){
            //todo:更改判断条件
        historyName = "更改事件条件" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    addSpecific: function(event){
        if(event&&event['specificList']){
            event['specificList'].push(this.emptyEventSpecific());
            this.trigger({redrawEventTree: true});
            historyName = "添加目标对象" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    deleteSpecific: function(sid, event){
        if(event&&event.specificList) {
            if(event.specificList.length==1) {
                event.specificList = [this.emptyEventSpecific()];
            } else {
                let index = -1;
                event.specificList.forEach((v, i)=>{
                    if(sid == v.sid){
                        index = i;
                    }
                });
                if(index>-1){
                    event.specificList.splice(index, 1);
                }
            }
            this.trigger({redrawEventTree: true});
            historyName = "删除目标对象" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    changeSpecific: function(specific, params){
        if(params){
            if(params.object){
                specific.object = params.object;
                specific.action = null;
            } else if(params.action){
                specific.action = params.action;
            } else if(params.property){
                specific.action.property = params.property;
            }
            this.trigger({redrawEventTree: true});
            historyName = "修改目标对象" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    enableSpecific: function(specific, enable) {
        if (enable != null|| enable != undefined) {
            specific.enable = enable;
            this.trigger({redrawEventTree: true});
            historyName = specific.enable?"激活目标对象":"屏蔽目标对象" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    selectFadeWidget: function(data, type) {
        switch (type) {
            case nodeType.func:
                this.selectFunction(data);
                break;
            case nodeType.var:
                this.selectVariable(data);
                break;
            case nodeType.dbItem:
                this.selectDBItem(data);
                break;
            default:
                break;
        }
    },
    addFadeWidget: function(param, defaultName, type) {
        switch (type) {
            case nodeType.func:
                this.addFunction(param, defaultName);
                break;
            case nodeType.var:
                this.addVariable(param, defaultName);
                break;
            case nodeType.dbItem:
                this.addDBItem(param, defaultName);
                break;
            default:
                break;
        }
    },
    selectFunction: function (data) {
        if (data!=null) {
            //取消在canvas上的widget选择
            bridge.selectWidget(this.currentWidget.node);
            this.currentFunction = data;
        } else {
            this.currentFunction = null;
        }
        this.trigger({selectFunction: this.currentFunction});
        // this.render();
    },
    addFunction: function (param, defaultName) {
        if(this.currentWidget) {
            let func = {};
            func['name'] = param.name || '';
            func['value'] = param.value || '';
            func['className'] = 'func';
            func['key'] = _keyCount++;
            func['params'] = param.params ? cpJson(param.params) : [{type: null, name: null}];    //函数类型
            func['widget'] = this.currentWidget;
            func['props'] = {};
            func['props']['unlockPropsName'] = true;
            if (defaultName != undefined) {
                func['props']['name'] = defaultName;
            } else {
                func['props']['name'] = 'func' + (this.currentWidget['funcList'].length + 1);
            }
            keyMap[func['key']] = func;
            this.currentWidget['funcList'].unshift(func);
            this.trigger({updateWidget: {widget:func, type:nodeType.func, action:nodeAction.add}});
        }
        this.trigger({redrawTree: true});
        historyName = "添加函数" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    changeFunction: function (props) {
        if(props) {
            if(props['name']) {
                this.currentFunction['name'] = props['name'];
            } else if(props['value']) {
                this.currentFunction['value'] = props['value'];
            } else if(props['params']) {
                this.currentFunction['params'] = props['params'];
            }
            this.trigger({updateWidget: {widget:this.currentFunction, type:nodeType.func, action:nodeAction.change}});
            historyName = "修改函数" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    removeFunction: function () {
        if(this.currentFunction) {
            let index = -1;
            this.currentWidget.funcList.forEach((v,i)=>{
                if(v.key == this.currentFunction.key) {
                    index = i;
                }
            });
            if(index>-1){
                this.currentWidget.funcList.splice(index,1);
                keyMap[this.currentFunction.key]= undefined;
                this.trigger({updateWidget: {widget:this.currentFunction, type:nodeType.func, action:nodeAction.remove}});
                this.selectWidget(this.currentWidget);
            }
            historyName = "删除函数" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    copyFunction: function () {
        if(this.currentFunction) {
            copyObj = {
                'name': this.currentFunction.name,
                'value': this.currentFunction.value,
                'className': this.currentFunction.className,
                'params': this.currentFunction.params,
                'props': {
                    'name': this.currentFunction.props.name,
                    'unlockPropsName': this.currentFunction.props.unlockPropsName
                }
            }
        }
    },
    pasteFunction: function () {
        if (this.currentWidget) {
            if(isEmptyString(copyObj.name)&&copyObj.props.unlockPropsName){
                this.addFunction(copyObj);
            } else {
                this.addFunction(copyObj, copyObj.props.name);
            }
            historyName = "粘贴函数" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    cutFunction: function () {
        this.copyFunction();
        this.removeFunction();
    },
    selectVariable: function (data) {
        if (data!=null) {
            //取消在canvas上的widget选择
            bridge.selectWidget(this.currentWidget.node);
            this.currentVariable = data;
        } else {
            this.currentVariable = null;
        }
        this.trigger({selectVariable: this.currentVariable});
        // this.render();
    },
    addVariable: function (param, defaultName) {
        if(this.currentWidget) {
            let vars = {};
            vars['value'] = param.value||null;
            vars['name'] = param.name||'';
            vars['type'] = param.type;
            vars['className']  = 'var';
            vars['key'] = _keyCount++;
            vars['widget'] = this.currentWidget;
            vars['props'] = {};
            vars['props']['unlockPropsName'] = true;
            switch (vars['type']) {
                case varType.number:
                    if(defaultName!=undefined) {
                        vars['props']['name'] = defaultName;
                    } else {
                        vars['props']['name'] = 'intVar' + (this.currentWidget['intVarList'].length + 1);
                    }
                    keyMap[vars['key']] = vars;
                    this.currentWidget['intVarList'].unshift(vars);
                    break;
                case varType.string:
                    if(defaultName!=undefined) {
                        vars['props']['name'] = defaultName;
                    } else {
                        vars['props']['name'] = 'strVar' + (this.currentWidget['strVarList'].length + 1);
                    }
                    keyMap[vars['key']] = vars;
                    this.currentWidget['strVarList'].unshift(vars);
                    break;
                default:
                    break;
            }
        }
        this.getAllWidgets();
        this.trigger({redrawTree: true});
        historyName = "添加变量" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    changeVariable: function (props) {
        if(props) {
            if(props['name']) {
                this.currentVariable['name'] = props['name'];
            } else if(props['value']) {
                this.currentVariable['value'] = props['value'];
            }
            historyName = "修改变量" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    removeVariable: function () {
        if(this.currentVariable) {
            let removeV = (list, key) => {
                let index = -1;
                list.forEach((v, i)=>{
                    if(v.key == key) {
                        index = i;
                    }
                });
                if(index>-1){
                    list.splice(index,1);
                    keyMap[this.currentVariable.key]= undefined;
                    this.trigger({updateWidget: {widget:this.currentVariable, type:nodeType.var, action:nodeAction.remove}});
                    this.selectWidget(this.currentWidget);
                }
            };

            switch (this.currentVariable.type){
                case varType.number:
                    removeV(this.currentWidget.intVarList, this.currentVariable.key);
                    break;
                case varType.string:
                    removeV(this.currentWidget.strVarList, this.currentVariable.key);
                    break;
                default:
                    break;
            }
            historyName = "删除变量" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    copyVariable: function () {
        if(this.currentVariable) {
            copyObj = {
                'name': this.currentVariable.name,
                'value': this.currentVariable.value,
                'className': this.currentVariable.className,
                'type': this.currentVariable.type,
                'props': {
                    'name': this.currentVariable.props.name,
                    'unlockPropsName': this.currentVariable.props.unlockPropsName
                }
            }
        }
    },
    pasteVariable: function () {
        if (this.currentWidget) {
            if(isEmptyString(copyObj.name)&&copyObj.props.unlockPropsName){
                this.addVariable(copyObj);
            } else {
                this.addVariable(copyObj, copyObj.props.name);
            }
            historyName = "粘贴变量" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    cutVariable: function () {
        this.copyVariable();
        this.removeVariable();
    },
    selectDBItem: function(data){
        if (data!=null) {
            //取消在canvas上的widget选择
            bridge.selectWidget(this.currentWidget.node);
            this.currentDBItem = data;
        } else {
            this.currentDBItem = null;
        }
        this.trigger({selectDBItem: this.currentDBItem});
    },
    addDBItem: function(param, defaultName){
        if(this.currentWidget) {
            let dbItem = {};
            dbItem['name'] = param.name||'';
            dbItem['fields'] = param.fields||[]; //字段s
            dbItem['className']  = 'dbItem';
            dbItem['key'] = _keyCount++;
            dbItem['widget'] = this.currentWidget;
            dbItem['props'] = {};
            if(defaultName!=undefined) {
                dbItem['props']['name'] = defaultName;
            } else {
                dbItem['props']['name'] = 'dbItem' + (this.currentWidget['dbItemList'].length + 1);
            }
            keyMap[dbItem['key']] = dbItem;
            this.currentWidget['dbItemList'].unshift(dbItem);
            this.trigger({updateWidget: {widget:dbItem, type:nodeType.dbItem, action:nodeAction.add}});
        }
        this.trigger({redrawTree: true});
        historyName = "添加数据库变量" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    changeDBItem: function (props) {
        if(this.currentDBItem){
            if(props) {
                if(props['name']) {
                    this.currentDBItem['name'] = props['name'];
                } else if (props['fields']){
                    this.currentDBItem['fields'] = props['fields'];
                }
            }
            historyName = "更改数据库变量" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    removeDBItem: function() {
        if(this.currentDBItem) {
            let index = -1;
            this.currentWidget.dbItemList.forEach((v,i)=>{
                if(v.key === this.currentDBItem.key){
                    index = i;
                }
            });
            if(index>-1){
                this.currentWidget.dbItemList.splice(index,1);
                keyMap[this.currentDBItem.key]= undefined;

                this.trigger({updateWidget: {widget:this.currentDBItem, type:nodeType.dbItem, action:nodeAction.remove}});
                this.selectWidget(this.currentWidget);
            }
            historyName = "删除数据库变量" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    renameFadeWidget: function (type, name, fromTree) {
        switch (type){
            case nodeType.func:
                if(this.currentFunction&&!isEmptyString(name)){
                    if(fromTree){
                        if(this.currentFunction.props.unlockPropsName) {
                            this.currentFunction.props.unlockPropsName = !this.currentFunction.props.unlockPropsName;
                        }
                        this.currentFunction.props.name = name;
                    } else {
                        if(this.currentFunction.props.unlockPropsName) {
                            this.currentFunction.props.name = name;
                        }
                    }
                    this.trigger({redrawTree: true});
                }
                historyName = "重命名函数" + this.currentWidget.node.name;
                break;
            case nodeType.var:
                if(this.currentVariable&&!isEmptyString(name)) {
                    if(fromTree){
                        if(this.currentVariable.props.unlockPropsName) {
                            this.currentVariable.props.unlockPropsName = !this.currentVariable.props.unlockPropsName;
                        }
                        this.currentVariable.props.name = name;
                    } else {
                        if(this.currentVariable.props.unlockPropsName) {
                            this.currentVariable.props.name = name;
                        }
                    }
                    this.trigger({redrawTree: true});
                }
                historyName = "重命名变量" + this.currentWidget.node.name;
                break;
            case nodeType.dbItem:
                if(this.currentDBItem&&!isEmptyString(name)) {
                    this.currentDBItem.props.name = name;
                    this.trigger({redrawTree: true});
                }
                historyName = "重命名数据库变量" + this.currentWidget.node.name;
                break;
            default:
                break;
        }
        this.updateHistoryRecord(historyName);
    },
    pasteTreeNode: function () {
       switch (copyObj.className) {
           case nodeType.func:
               this.pasteFunction();
               break;
           case nodeType.var:
               this.pasteVariable();
               break;
           case nodeType.dbItem:
               //DBITEM DO NOTHING
               break;
           default:
               this.pasteWidget();
               break;
       }
    },
    cutTreeNode: function (type) {
        switch(type){
            case nodeType.func:
                this.cutFunction();
                break;
            case nodeType.var:
                this.cutVariable();
                break;
            case nodeType.dbItem:
                //DBITEM DO NOTHING
                break;
            default:
                this.cutWidget();
                break;
        }
    },
    renameTreeNode: function (type, value, fromTree) {
        switch(type){
            case nodeType.func:
            case nodeType.var:
            case nodeType.dbItem:
                this.renameFadeWidget(type, value, fromTree);
                break;
            default:
                this.renameWidget(value);
                break;
        }
    },
    copyTreeNode: function (type) {
        switch(type){
            case nodeType.func:
                this.copyFunction();
                break;
            case nodeType.var:
                this.copyVariable();
                break;
            case nodeType.dbItem:
                //DBITEM DO NOTHING
                break;
            default:
                this.copyWidget();
                break;
        }
    },
    deleteTreeNode: function (type) {
        switch(type){
            case nodeType.func:
                this.removeFunction();
                break;
            case nodeType.var:
                this.removeVariable();
                this.getAllWidgets();
                break;
            case nodeType.dbItem:
                this.removeDBItem();
                break;
            default:
                this.removeWidget(true);
                this.getAllWidgets();
                break;
        }
        this.trigger({deleteWidget:true});
    },
    didSelectTarget: function (data) {
        this.trigger({didSelectTarget:{target:data}});
    },
    resetTrack: function() {
      this.trigger({resetTrack: true});
    },
    syncTrack: function() {
      this.trigger({syncTrack: true});
    },
    deletePoint: function() {
      this.trigger({deletePoint: true});
        this.updateHistoryRecord();
    },
    initTree: function(data) {
        classList = [];
        bridge.resetClass();
        stageTree = [];
        var idList;
        var tree;

        _keyCount = 1;
        keyMap = [];
        if (data['defs']) {
            for (let n in data['defs']) {
                bridge.addClass(n);
                classList.push(n);
                idList = [];
                tree = loadTree(null, data['defs'][n], idList);
                stageTree.push({name: n, tree: tree});
                resolveEventTree(tree, idList);
                resolveDBItemList(tree, idList);
            }
        }

        //起个名字给舞台
        if (data['stage']){
            data['stage']['props']['name'] = 'stage';
        }
        idList = [];
        tree = loadTree(null, data['stage'], idList);
        resolveEventTree(tree, idList);
        resolveDBItemList(tree, idList);
        stageTree.unshift({name: 'stage', tree: tree});
        // bridge.createSelector(null);

        if (!rootDiv) {
            this.mutliSelectMode = false;
            rootDiv = document.getElementById('canvas-dom');
            rootDiv.addEventListener('dragenter', dragenter, false);
            rootDiv.addEventListener('dragover', dragover, false);
            rootDiv.addEventListener('drop', drop.bind(this), false);
            rootDiv.addEventListener('mousedown', function(e) {
                this.selectWidget(this.currentWidget);
            }.bind(this), false);
        }

        this.trigger({
            initTree: stageTree
            , classList: classList
        });

        this.selectWidget(stageTree[0].tree);
        this.getAllWidgets();
    },
    addClass: function(name, bool) {
        if(bool){
            classList.unshift(name);
            stageTree.splice(
                1,
                0,
                { name: name,
                    tree: loadTree(null, { 'cls': 'root',
                        'type': bridge.getRendererType(this.currentWidget.node),
                        'props': {'width': 640, 'height': 1040, 'name':name}})
                }
            );
        }
        else {
            classList.push(name);
            stageTree.push(
                { name: name,
                    tree: loadTree(null, { 'cls': 'root',
                        'type': bridge.getRendererType(this.currentWidget.node),
                        'props': {'width': 640, 'height': 1040, 'name':name}})
                }
            );
        }

        bridge.addClass(name,bool);
        this.trigger({initTree: stageTree, classList: classList});
        historyName = "添加组件" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },

    sortClass: function(data) {
        //console.log(data,classList);
        let fuc = ((v,i)=>{
            data.forEach((v1,i1)=>{
               if(v1 == v){
                   data.splice(i1, 1);
                   classList.splice(i, 1);
                   classList.unshift(v1);
                   stageTree.splice(i+1, 1);
                   stageTree.splice(
                       1,
                       0,
                       { name: v1,
                           tree: loadTree(null, { 'cls': 'root',
                               'type': bridge.getRendererType(this.currentWidget.node),
                               'props': {'width': 640, 'height': 1040}})
                       }
                   );
                   return classList.map(fuc);
               }
            });
            return {
                classList,
                stageTree
            }
        });

        classList.map(fuc);
        //console.log(classList,stageTree);
        this.trigger({initTree: stageTree, classList: classList});
        historyName = "管理组件" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },

    deleteClass: function(data){
        //console.log(data,classList);
        let fuc = ((v,i)=>{
            data.forEach((v1,i1)=>{
                if(v == v1){
                    data.splice(i1, 1);
                    classList.splice(i, 1);
                    stageTree.splice(i+1, 1);
                    return classList.map(fuc);
                }
            });
            return {
                classList,
                stageTree
            }
        });
        classList.map(fuc);
        //console.log(classList,stageTree);
        this.trigger({initTree: stageTree, classList: classList});
        historyName = "删除组件" + this.currentWidget.node.name;
        this.updateHistoryRecord(historyName);
    },
    render: function() {
      if (this.currentWidget) {
        process.nextTick(() => bridge.render(this.currentWidget.rootWidget.node));
      }
    },
    setRulerLine:function(bIsShow){
        this.trigger({setRulerLine:{isShow:bIsShow}});
    },
    setRulerLineBtn:function(bIsShow){
        this.trigger({setRulerLineBtn:{isShow:bIsShow}});
    },
    saveNode: function(wid, wname, wdescribe, callback,updateProgress) {
      // let appendArray = function(a1, a2) {
      //     for (let i = 0; i < a2.length; i++) {
      //       a1.push(a2[i]);
      //     }
      // };
        let getImageList = function(array, list) {
          var result = [];
          var count = 0;
          for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (typeof item == 'string') {
              if (item.substr(0, 5) == 'data:') {
                count++;
                array.push(item);
              } else {
                if (count) {
                  result.push(count);
                  count = 0;
                }
                result.push(item);
              }
            } else {
              var n = item.length;
              if (count) {
                result.push(count);
                count = 0;
              }
              if (n == 0 || item[0].substr(0, 5) == 'data:') {
                result.push(-n);
                for (var j = 0; j < n; j++) {
                  array.push(item[j]);
                }
              } else {
                result.push(item);
              }
            }
          }
          if (result.length) {
            if (count)
              result.push(count);
            return result;
          } else {
            return count;
          }
        };
        let data = {};
        let images = [];
        data['stage'] = {};
        trimTree(stageTree[0].tree);
        generateId(stageTree[0].tree);
        saveTree(data['stage'], stageTree[0].tree);
        data['stage']['type'] = bridge.getRendererType(stageTree[0].tree.node);
        // data['stage']['links'] = stageTree[0].tree.imageList.length;
        // appendArray(images, stageTree[0].tree.imageList);
        data['stage']['links'] = getImageList(images, stageTree[0].tree.imageList);

        if (stageTree.length > 1) {
            data['defs'] = {};
            for (let i = 1; i < stageTree.length; i++) {
                let name = stageTree[i].name;
                data['defs'][name] = {};
                trimTree(stageTree[i].tree);
                generateId(stageTree[i].tree);
                saveTree(data['defs'][name], stageTree[i].tree);
                data['defs'][name]['type'] = bridge.getRendererType(stageTree[i].tree.node);
                // data['defs'][name]['links'] = stageTree[i].tree.imageList.length;
                // appendArray(images, stageTree[i].tree.imageList);
                data['defs'][name]['links'] = getImageList(images, stageTree[i].tree.imageList);
            }
        }

        data = bridge.encryptData(data, images);
        if (!data){
            return;
        }

        var cb = function(text) {
            var result = JSON.parse(text);
            if(result['id']){
                callback(result['id'], wname, wdescribe);
            }
            historyRecord = [];
            historyRW = historyRecord.length;
            historyNameList = ["初始化"];
        };
        if (wid) {
            this.ajaxSend(null, 'PUT', 'app/work/' + wid, 'application/octet-stream', data, cb,null,updateProgress);
        } else {
            this.ajaxSend(null, 'POST', 'app/work?name=' + encodeURIComponent(wname) + encodeURIComponent(wdescribe),
                        'application/octet-stream', data, cb,null,updateProgress);
        }
    },
    setFont: function(font) {
      if (this.currentWidget && this.currentWidget.className == 'bitmaptext') {
        this.updateProperties({'font':font});
      }
    },
    setImageText:function(data) {
        var current;
        if (currentLoading) {
            current = currentLoading;
            currentLoading = null;
        } else if (this.currentWidget && this.currentWidget.className == 'bitmaptext') {

            current = this.currentWidget;
            WidgetActions['imageTextSize']({
                width:current.node.width,
                height:current.node.height
            });
        }

        if (current) {
          //  isModified = true;
            var link = current.props['link'];
            if (link === undefined) {
                link = current.rootWidget.imageList.push(data) - 1;
            } else {
                current.rootWidget.imageList[link] = data;
            }
            current.props['link'] = current.node['link'] = link;
            process.nextTick(() => {
                WidgetActions['imageTextSize']({
                    width:current.node.width,
                    height:current.node.height
                });
                bridge.updateSelector(current.node);
                this.render();
            });
        }
    },
    imageTextSize:function(sizeObj){
        this.trigger({ imageTextSizeObj:sizeObj});
    },
    saveFontList:function(fontList){
        this.trigger({fontListObj:{'fontList':fontList}});
    },
    ajaxSend(token, method, url, type, data, callback, binary,updateProgress) {
        if (token)
          globalToken = token;
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (binary)
              callback(xhr.response);
            else
              callback(xhr.responseText);
        };
        xhr.open(method, "http://test-beta.ih5.cn/editor3b/" + url);
        //xhr.open(method, url);
        if (binary)
          xhr.responseType = "arraybuffer";
        if (type)
            xhr.setRequestHeader('Content-Type', type);
        if (globalToken) {
            xhr.setRequestHeader('Authorization', 'Bearer {' + globalToken + '}');
        }
        if(updateProgress){
            xhr.upload.onprogress = updateProgress;
        }
        xhr.send(data);
    },
    getStore: function() {
      //this.selectWidget(stageTree[0].tree);
      return {initTree: stageTree, classList: classList};
    },
    activeHandle: function(status) {
        this.trigger({hasHandle: status});
    },
    updateHistoryRecord: function(historyName) {
        let getImageList = function(array, list) {
            var result = [];
            var count = 0;
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (typeof item == 'string') {
                    if (item.substr(0, 5) == 'data:') {
                        count++;
                        array.push(item);
                    } else {
                        if (count) {
                            result.push(count);
                            count = 0;
                        }
                        result.push(item);
                    }
                } else {
                    var n = item.length;
                    if (count) {
                        result.push(count);
                        count = 0;
                    }
                    if (n == 0 || item[0].substr(0, 5) == 'data:') {
                        result.push(-n);
                        for (var j = 0; j < n; j++) {
                            array.push(item[j]);
                        }
                    } else {
                        result.push(item);
                    }
                }
            }
            if (result.length) {
                if (count)
                    result.push(count);
                return result;
            } else {
                return count;
            }
        };
        let data = {};
        let images = [];
        data['stage'] = {};
        trimTree(stageTree[0].tree);
        saveTree(data['stage'], stageTree[0].tree,true);
        data['stage']['type'] = bridge.getRendererType(stageTree[0].tree.node);
        data['stage']['links'] = getImageList(images, stageTree[0].tree.imageList);

        if (stageTree.length > 1) {
            data['defs'] = {};
            for (let i = 1; i < stageTree.length; i++) {
                let name = stageTree[i].name;
                data['defs'][name] = {};
                trimTree(stageTree[i].tree);
                saveTree(data['defs'][name], stageTree[i].tree,true);
                data['defs'][name]['type'] = bridge.getRendererType(stageTree[i].tree.node);
                data['defs'][name]['links'] = getImageList(images, stageTree[i].tree.imageList);
            }
        }

        if(historyRW != historyRecord.length){
            historyRecord = historyRecord.slice(0,historyRW);
            historyNameList = historyNameList.slice(0,historyRW);
        }
        else if(historyRW == 50){
            historyRecord.splice(0,1);
            historyNameList.splice(0,1);
        }
        historyRecord.push(data);
        historyNameList.push(historyName);
        historyRW = historyRecord.length;

        //console.log("history",historyNameList,historyRecord);
        this.trigger({
            historyRecord: historyRecord,
            historyRW : historyRW,
            historyNameList : historyNameList
        });
    },
    revokedHistory: function() {
        if(historyRW == 1) return;
        historyRW --;
        //console.log('revokedHistory',historyRecord[historyRW-1]);
        this.historyRoad();
    },
    replyHistory: function() {
        if(historyRW == historyRecord.length) return;
        historyRW ++;
        //console.log('replyHistory',historyRecord[historyRW-1]);
        this.historyRoad();
    },
    chooseHistory: function(num) {
        historyRW = num;
        //console.log('replyHistory',historyRecord[historyRW-1]);
        this.historyRoad();
    },
    cleanHistory: function() {
        historyRecord = [];
        historyRW = 1;
        historyNameList = [];
        historyName = "初始化";
        //console.log('cleanHistory',historyRecord[historyRW-1] ,historyRW );
        this.updateHistoryRecord(historyName);
    },
    historyRoad: function() {
        classList = [];
        stageTree = [];
        let tree;
        let data =historyRecord[historyRW-1];

        if (data['defs']) {
            for (let n in data['defs']) {
                bridge.addClass(n);
                classList.push(n);
                tree = loadTree(null, data['defs'][n]);
                stageTree.push({name: n, tree: tree});
            }
        }
        tree = loadTree(null, data['stage']);
        stageTree.unshift({name: 'stage', tree: tree});
        let bool = true;
        let selectOther = (selectdata)=>{
            if(this.currentActiveEventTreeKey) {
                this.selectWidget(selectdata, null, keepType.event);
            }
            else if(this.currentFunction){
                this.selectWidget(selectdata, null, keepType.func);
            }
            else if(this.currentVariable) {
                this.selectWidget(selectdata, null, keepType.var);
            }
            else if(this.currentDBItem) {
                this.selectWidget(selectdata,null, keepType.dbItem);
            }
            else {
                this.selectWidget(selectdata);
            }
        };

        let fuc = (v1,i1)=>{
            if(v1.key == this.currentWidget.key){
                selectOther(v1);
                bool = false;
            }
            else {
                if(v1.children.length > 0){
                    v1.children.map(fuc);
                }
            }
        };

        stageTree.map((v,i)=>{
            if(v.tree.key == this.currentWidget.key){
                selectOther(v.tree);
                bool = false;
            }
            else {
                if(v.tree.children.length > 0){
                    v.tree.children.map(fuc);
                }
            }
        });
        if(bool){
            selectOther(stageTree[0].tree)
        }
        this.trigger({
            historyRecord: historyRecord,
            historyRW : historyRW,
            initTree: stageTree,
            classList: classList,
            historyPropertiesUpdate : true
        });
    }
});

export {globalToken, nodeType, nodeAction, varType, funcType, keepType, isCustomizeWidget, dataType, classList, selectableClass}