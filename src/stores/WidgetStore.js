import Reflux from 'reflux';
import WidgetActions from '../actions/WidgetActions';
import {getPropertyMap, checkChildClass,fnIsFlex} from '../component/PropertyMap'
import {chooseFile} from  '../utils/upload';
import EffectAction from '../actions/effectAction';

var bridge = require('bridge');
bridge.create();
var globalToken;
var globalVersion = '';

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
function getX(obj){
    var ParentObj=obj;
    var left=obj.offsetLeft;
    while(ParentObj=ParentObj.offsetParent){
        left+=ParentObj.offsetLeft;
    }
    return left;
}
function getY(obj){
    var ParentObj=obj;
    var top=obj.offsetTop;
    while(ParentObj=ParentObj.offsetParent){
        top+=ParentObj.offsetTop;
    }
    return top;
}

//json对象浅克隆
function cpJson(a){return JSON.parse(JSON.stringify(a))}

function onSelect(isMulti) {
  WidgetActions['selectWidget'](this, true, null, isMulti);
}

const selectableClass = ['image', 'imagelist', 'text', 'video', 'rect', 'ellipse', 'path', 'slidetimer',
    'bitmaptext', 'qrcode', 'counter', 'button', 'taparea', 'input', 'html', 'table', 'container', 'pagecontainer'];
var currentLoading;
var addProps = ['positionX', 'positionY', 'rotation'];
var mulProps = ['scaleX', 'scaleY', 'alpha'];

var saveEffect = {};

function syncTrack(parent, props) {
    if (props && props['prop'] && props['data'] && props['data'].length > 0) {
        var syncIndex = props['syncLast'] ? props['data'].length - 1 : 0;
        for (var i = 0; i < props['prop'].length; i++) {
            if (addProps.indexOf(props['prop'][i]) >= 0) {
                var delta = parent.node[props['prop'][i]] - props['data'][syncIndex][i + 1];
                if (delta != 0) {
                    for (var j = 0; j < props['data'].length; j++) {
                        props['data'][j][i + 1] += delta;
                    }
                }
            } else if (mulProps.indexOf(props['prop'][i]) >= 0) {
                var delta = parent.node[props['prop'][i]] / props['data'][syncIndex][i + 1];
                if (delta != 1) {
                    for (var j = 0; j < props['data'].length; j++) {
                        props['data'][j][i + 1] *= delta;
                    }
                }
            }
        }
    }
}
function loadTree(parent, node, idList, initEl) {
  let current = {};
  current.parent = parent;
  current.className = node['cls'];
  current.props = node['props'] || {};
  current.events = node['events'] || {};

  if (current.props['key'] !== undefined) {
      current.key = current.props['key'];
      delete(current.props['key']);
  } else {
      //_keyCount=keyMap.length;
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
      var r=item.eventNode;
      if(!r.eid) {
        r.eid = _eventCount++;
      }
      r.specificList = [];
      item.cmds.forEach(cmd => {
          let temp = cmd;
          if(!temp.sid) {
              temp.sid = _eventCount++;
          }
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
    if (current.className == 'track') {
        if (!parent.timerWidget)
            syncTrack(parent, node['props']);
        else if (node['props'])
            delete(node['props']['totalTime']);

    }

    if (!parent)
        current.imageList = node['links'];

    current.node = bridge.addWidget((parent) ? parent.node : null, node['cls'], null, node['props'], initEl, current.imageList);
    current.timerWidget = bridge.isTimer(current.node) ? current : ((parent) ? parent.timerWidget : null);

  // var renderer = bridge.getRenderer((parent) ? parent.node : null, node);

  // current.node = bridge.addWidget(renderer,
  //     (parent)
  //     ? parent.node
  //     : null, node['cls'], null, node['props'],
  //       (parent && parent.timerWidget) ? parent.timerWidget.node : null
  // );

  // current.timerWidget = (bridge.isTimer(current.node)) ? current : ((parent && parent.timerWidget) ? parent.timerWidget : null);

  if (parent) {
    parent.children.unshift(current);
    current.rootWidget = parent.rootWidget;
    // if (renderer != current.rootWidget.rendererList[0])
    //   current.rootWidget.rendererList.unshift(renderer);
  } else {
    current.rootWidget = current;
      //current.imageList = node['links'] || [];
      // current.rendererList = [renderer];
      // bridge.setLinks(current.node, current.imageList);
      // bridge.createSelector(current.node);
      // current.imageList = current.node['links'];
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
  if(idName === 'this' || idName === 'param.target'
      || idName === 'target' || idName === 'globalXY') {
      return {key:idName};
  }
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
      //loadTree时公式编辑器内容的处理
      let dealWithFormulaInput = (fInput)=> {
          if (fInput&&fInput.type === 2) {
              fInput.value.forEach((v1,i)=>{
                  if(v1.objId) {
                      v1.objKey = idToObjectKey(list, v1.objId[0], v1.objId[1]);
                  } else {
                      v1.objKey = null;
                  }
                  (delete v1.objId);
                  if(v1.objKey === null) {
                      //如果不存在就直接删除
                      fInput.value.splice(i, 1);
                  }
              });
              if(fInput.value.length===0){
                  fInput.type = 1;
                  fInput.value = null;
              }
          }
      };

    node.props['eventTree'].forEach(item => {
      item.children.forEach(judge => {
        judge.judgeObj = idToObject(list, judge.judgeObjId, judge.judgeVarId);
        delete(judge.judgeObjId);
        delete(judge.judgeVarId);

          //公式编辑器
          if(judge.compareObjFlag&&judge.compareObjFlag.type) {
              dealWithFormulaInput(judge.compareObjFlag);
          }
      });
       //给对象重新生成key
        if(item.needFill){
            item.needFill.map((v,i)=>{
                if(v.showName=='碰撞对象' &&  v.default !='请选择'){
                     v.default =idToObjectKey(list, v.contactObjId, null);
                }
            });
        }
        if(item.needFills) {
            if(!item.needFill) {
                item.needFill = [];
            }
            item.needFills.forEach((v1,i)=>{
                item.conFlag = v1.actionName;
                if(v1.valueIds) {
                    v1.default = idToObjectKey(list, v1.valueIds[0], v1.valueIds[1]);
                } else {
                    v1.default = null;
                }
                (delete v1.valueIds);
                if(v1.default === null) {
                    item.needFills.splice(i, 1);
                } else {
                    item.needFill.push(v1);
                }
            });
            (delete item.needFills);
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
                      if(cmd.action.property) {
                          cmd.action.property.forEach(v=> {
                              dealWithFormulaInput(v.value);
                          });
                      }
                      break;
                  default:
                      if(cmd.action.property) {
                          cmd.action.property.forEach(v=> {
                              switch (v.type){
                                  case 21: //ObjectSelect
                                  case 23: //Object
                                      if (v.valueId) {
                                          v.value = idToObjectKey(list, v.valueId[0], v.valueId[1]);
                                      } else {
                                          v.value = null;
                                      }
                                      (delete v.valueId);
                                      break;
                                  case 12: //FormulaInput
                                      dealWithFormulaInput(v.value);
                                      break;
                                  case 18: //DBCons
                                      if(v.value) {
                                          v.value.forEach(v1=> {
                                              dealWithFormulaInput(v1.compare);
                                          })
                                      }
                                      break;
                                  default:
                                      break;
                              }
                          });
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


function resolveBlock(node, list) {
    let genBlockKey = (block)=> {
        block.mapping.props.forEach((item)=>{
            if(item.objId) {
                item.objKey = idToObjectKey(list, item.objId[0], item.objId[1]);
            } else {
                item.objKey = null;
            }
            delete(item.objId);
            if(item.mappingId) {
                item.mappingKey = idToObjectKey(list, item.mappingId[0], item.mappingId[1]);
            } else {
                item.mappingKey = null
            }
            delete(item.mappingId);
        });
        block.mapping.events.forEach((item)=>{
            if(item.objId) {
                item.objKey = idToObjectKey(list, item.objId[0], item.objId[1]);
            } else {
                item.objKey = null;
            }
            delete(item.objId);
            if(item.mappingId) {
                item.mappingKey = idToObjectKey(list, item.mappingId[0], item.mappingId[1]);
            } else {
                item.mappingKey = null
            }
            delete(item.mappingId);
        });
        block.mapping.funcs.forEach((item)=>{
            if(item.objId) {
                item.objKey = idToObjectKey(list, item.objId[0], item.objId[1]);
            } else {
                item.objKey = null;
            }
            delete(item.objId);
            if(item.mappingId) {
                item.mappingKey = idToObjectKey(list, item.mappingId[0], item.mappingId[1]);
            } else {
                item.mappingKey = null
            }
            delete(item.mappingId);
        });
        return block;
    };
    if(node.props.block) {
        //是小模块
        node.props.block = genBlockKey(node.props.block);
    } else if(node.props.backUpBlock) {
        //备份的block
        node.props.backUpBlock = genBlockKey(node.props.backUpBlock);
    }
    if (node.children.length > 0) {
        node.children.map(item => {
            resolveBlock(item, list);
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

function getImageOrderInRoot(link, rootWidget){
    let linkOrder = rootWidget.imageList.indexOf(link);
    if (linkOrder >= 0) {
        return linkOrder;
    } else {
        return rootWidget.imageList.push(link) - 1;
    }
}

function replaceImageIndexInBlock(block, imageList, rootWidget){
    if (block.props['link'] !== undefined) {
        let index = block.props['link'];
        if(index<=imageList.length) {
            block.props['link'] = getImageOrderInRoot(imageList[index], rootWidget);
        }
    }
    if (block.props['bgLink'] !== undefined) {
        let index = block.props['bgLink'];
        if(index<=imageList.length) {
            block.props['bgLink'] = getImageOrderInRoot(imageList[index], rootWidget);
        }
    }
};

function assignImagesInTreeNode(block,rootWidget){
    if(block.props.block.imageList) {
        let imageList = block.props.block.imageList;
        replaceImageIndexInBlock(block, imageList, rootWidget);
        if (block.children.length > 0) {
            block.children.map(item => {
                replaceImageIndexInBlock(item, imageList, rootWidget);
            });
        }
    }
}

function trimTreeNode(node, links) {
  if (node.props['link'] !== undefined)
    node.props['link'] = links.push(node.rootWidget.imageList[node.props['link']]) - 1;
  if (node.props['bgLink'] !== undefined)
    node.props['bgLink'] = links.push(node.rootWidget.imageList[node.props['bgLink']]) - 1;
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
    if(object === 'this' || object === 'param.target'
        || object === 'target' || object === 'globalXY') {
        return [object, undefined, undefined, object];
    }
  let keyName = object.key;  //把key记录下来,只有在生成js语句才用到
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

  return [idName, varKey, varName, keyName];
}

function objectKeyToId(key) {
    if(key) {
        let obj = keyMap[key];
        if(obj){
            return objectToId(obj);
        } else if (key === 'this'|| key === 'param.target'
            || key === 'target' || key === 'globalXY') {
            return objectToId(key);
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

    //公式编辑器内容内对象的id生成
    let genFormulaInputId=(fInput)=>{
        if (fInput&&fInput.type === 2) {
            fInput.value.forEach(v1=>{
                specGenIdsData(v1.objKey);
            });
        }
    };

  if (node.props['eventTree']) {
      generateObjectId(node);

      node.props['eventTree'].forEach(item => {
        if(item.needFill){
          item.needFill.map((v,i)=>{
            if(v.showName=='碰撞对象'){
                let bodyObj = keyMap[v.default];
                if(bodyObj){
                    generateObjectId(bodyObj);
                    let parentObj =bodyObj.parent;
                    if(parentObj){
                        generateObjectId(parentObj);
                    }
                }
            }
          });
       }

      item.children.forEach(judge => {
          judge.judgeObj = keyMap[judge.judgeObjKey];
          generateObjectId(judge.judgeObj);

          //公式编辑器处理
          if(judge.compareObjFlag&&judge.compareObjFlag.type) {
              genFormulaInputId(judge.compareObjFlag);
          }
      });

      item.specificList.forEach(cmd => {
          specGenIdsData(cmd.object);
          if(cmd.action){
              switch (cmd.action.type){
                  case funcType.customize:
                      specGenIdsData(cmd.action.func);
                      if(cmd.action.property) {
                          cmd.action.property.forEach(v=>{
                              genFormulaInputId(v.value);
                          });
                      }
                      break;
                  default:
                      if(cmd.action.property){
                          cmd.action.property.forEach(v=> {
                              switch (v.type) {
                                  case 21: //Object
                                  case 23: //ObjectSelect
                                      specGenIdsData(v.value);
                                      break;
                                  case 12: //FormulaInput
                                      genFormulaInputId(v.value);
                                      break;
                                  case 18: //DBCcons
                                      if (v.value) {
                                          v.value.forEach(v1=> {
                                              genFormulaInputId(v1.compare);
                                          });
                                      }
                                      break;
                                  default:
                                      break;
                              }
                          });
                      }
                      break;
              }
          }
      });

    });
  }
  if(node.props.block) {
      node.props.block.mapping.props.forEach(item=> {
          specGenIdsData(item.objKey);
          specGenIdsData(item.mappingKey);
      });
      node.props.block.mapping.events.forEach(item=> {
          specGenIdsData(item.objKey);
          specGenIdsData(item.mappingKey);
      });
      node.props.block.mapping.funcs.forEach(item=> {
          specGenIdsData(item.objKey);
          specGenIdsData(item.mappingKey);
      });
  }
  if(node.props.backUpBlock) {
      node.props.backUpBlock.mapping.props.forEach(item=> {
          specGenIdsData(item.objKey);
          specGenIdsData(item.mappingKey);
      });
      node.props.backUpBlock.mapping.events.forEach(item=> {
          specGenIdsData(item.objKey);
          specGenIdsData(item.mappingKey);
      });
      node.props.backUpBlock.mapping.funcs.forEach(item=> {
          specGenIdsData(item.objKey);
          specGenIdsData(item.mappingKey);
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
    if(idName === 'this' || idName === 'param.target') {
        return idName+ '.' + propName;
    } else if (idName === 'target') {
        return 'param.'+idName+ '.' + propName;
    } else if (idName === 'globalXY') {
        if(propName === 'Y') {
            return 'param.globalY';
        } else {
            return 'param.globalX';
        }
    }
  return 'ids.' + idName + '.' + ((varName) ? '__' + varName : propName);
}

function generateJsFunc(etree) {
  var output = {};

  let replaceSymbolStr = (str)=>{
      if(str===null||str===undefined||str.replace===undefined){
          return str;
      }
      let temp = str;
      let chineseSymbol = [/＋/g,/－/g,/＊/g,/／/g,/（/g,/）/g,/？/g,/：/g,/‘/g,/’/g];
      let englishSymbol = ["+","-","*","/","(",")","?",":","'","'"];
      for(let i=0; i<chineseSymbol.length; i++) {
          temp=temp.replace(chineseSymbol[i], englishSymbol[i]);
      }
      return temp;
  };

    let replaceMathOp = (value)=> {
        if(value===null||value===undefined||value.replace===undefined){
            return value;
        }
        let array = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max',
            'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'];
        array.forEach(s=>{
            let reg = new RegExp('^' + s + '\\b|([^.])\\b' + s + '\\b', 'g');
            value = value.replace(reg, '$1Math.' + s);
        });
        return value;
    };

  let hasSymbol = (str)=> {
      if(str===null||str===undefined||str.indexOf===undefined){
          return false;
      }
      let chineseSymbol = ["＋","－","＊","／","（","）","？","：","‘","’","."];
      let englishSymbol = ["+","-","*","/","(",")","?",":","'","'","."];
      let hasS = false;
      chineseSymbol.forEach(v=>{
          if(str.indexOf(v)>=0){
              hasS = true;
          }
      });
      englishSymbol.forEach(v=>{
          if(str.indexOf(v)>=0){
              hasS = true;
          }
      });
      return hasS;
  };

    let operationTranslate = (item)=> {
        if(item===null||item===undefined||item.indexOf===undefined){
            return item;
        }
        let operation = ['=', '>', '<', '!=', '≥', '≤'];
        let trans = ['$e', '$gt', '$lt', '$ne', '$gte', '$lte'];
        let index = operation.indexOf(item);
        if(index>=0) {
            return trans[index];
        }
        return null;
    };

    let dealWithformulaValue = (value)=> {
        if(isNaN(value)&&!hasSymbol(value)) {
            return JSON.stringify(value);
        } else {
            return replaceMathOp(replaceSymbolStr(value));
        }
    };

  //公式编辑器内容生成运行内容
  let formulaGenLine = (fInput)=> {
      let line = '';
      if(fInput){
          if(fInput.type === 1){
              line = dealWithformulaValue(fInput.value);
          } else if (fInput.type === 2) {
              let subLine = '';
              fInput.value.forEach((fV,i) =>{
                  if(fV.objId&&fV.property){
                      if(i===0&&fV.prePattern){
                          subLine += dealWithformulaValue(fV.prePattern);
                      }
                      if(fV.property.type&&fV.property.value) {
                          //一，二维变量的选择
                          switch (fV.property.type) {
                              case 1:
                              case 2:
                                  // let dVar = keyMap[fV.objId[3]];
                                  // let val = '';
                                  // if(dVar&&dVar.props&&dVar.props.value) {
                                  //     let rows = dVar.props.value.split(';');
                                  //     if (rows.length>=fV.property.value[0]){
                                  //       let columns = rows[fV.property.value[0]-1].split(',');
                                  //         if (columns.length>=fV.property.value[1]){
                                  //             let temp  = columns[fV.property.value[1]-1];
                                  //             val = dealWithformulaValue(temp);
                                  //         }
                                  //     }
                                  // }
                                  // if(val!=''){
                                      //需要用ids来做
                                      let value = 'ids.'+fV.objId[0]+'.value';
                                      let value0 = fV.property.value[0];
                                      let value1 = fV.property.value[1];
                                      let formula = "(function(value, value0, value1) {  "+
                                      "var temp = null;                                  "+
                                      "if(value) {                                       "+
                                      "    var rows = value.split(';');                  "+
                                      "    if(rows.length>=value0) {                     "+
                                      "        var columns = rows[value0-1].split(',');  "+
                                      "        if (columns.length>=value1){              "+
                                      "            var temp  = columns[value1-1];        "+
                                      "            if(isNaN(temp)) {                     "+
                                      "                temp = temp+'';                   "+
                                      "            }                                     "+
                                      "        }                                         "+
                                      "    }                                             "+
                                      "}                                                 "+
                                      // "console.log(temp);                             "+
                                      "return temp;                                      "+
                                      "}("+value+','+value0+','+value1+"))               ";
                                      subLine += formula;
                                  // }
                                  break;

                          }
                      } else {
                          subLine += getIdsName(fV.objId[0], fV.objId[2], fV.property.name);
                      }
                      if(fV.pattern) {
                          subLine += dealWithformulaValue(fV.pattern);
                      }
                  }
              });
              if(subLine!=='') {
                  line = subLine;
              }
          }
      }
      return line;
  };

  etree.forEach(function(item) {
    if (item.judges.conFlag !='触发条件' && item.enable) {
      // var out = '';
      var lines = [];
      var marginArr=[];
      var paddingArr=[];
      var conditions = [];
      if (item.judges.children.length) {
        item.judges.children.forEach(function(c) {
         if( c.showName=='碰撞对象' ){
             let o='param.target.id=='+JSON.stringify(c.judgeObjId);
             conditions.push('(' + o + ')');
         }
         else if (c.judgeObjId && c.judgeValFlag && c.enable) {
             var op = c.compareFlag;
             var jsop;
             if (op == '=')
                 jsop = '==';
             else if (op == '≥')
                 jsop = '>=';
             else if (op == '≤')
                 jsop = '<=';
             else
                 jsop = op;

             var o = getIdsName(c.judgeObjId, c.judgeVarName, c.judgeValFlag) + jsop;

             //用户填写
             if (c.compareObjFlag && c.compareObjFlag.type) {
                 o += '('+formulaGenLine(c.compareObjFlag)+')';
             } else  if(c.compareObjFlag !==null){
                 o += JSON.stringify(c.compareObjFlag);
             }
             conditions.push('(' + o + ')');
         }
        });
      }
     // console.log('conditions',conditions);
      item.cmds.forEach(cmd => {
        if (cmd.sObjId && cmd.action && cmd.enable && cmd.action.type == 'default') {

          if (cmd.action.name === 'changeValue'||cmd.action.name === 'send') {
              let type = cmd.action.name === 'changeValue' ? 'value' : cmd.action.name;
              if (cmd.action.property && cmd.action.property.length > 0) {
                  cmd.action.property.forEach(v=> {
                      let fValue = formulaGenLine(v.value);
                      if (fValue !== '') {
                          lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], type) + '=' + fValue);
                      }
                  });
              }
          } else if (cmd.action.name === 'deleteRootComponent') {
              lines.push('param.target.getRoot().delete()');
          } else if (cmd.action.name === 'create' || cmd.action.name === 'clone') {
              if(cmd.action.property.length>=3) {
                  let cName = null;
                  let cId = null;
                  let props = [];
                  let bottom = null;
                  cmd.action.property.forEach((prop,i)=>{
                      if (i === 0) {
                          cName = prop.value;
                          if(cmd.action.name === 'clone') {
                              let propObj = prop.valueId;
                              if(propObj) {
                                  cName = getIdsName(propObj[0], propObj[2], '');
                                  if(cName.substr(cName.length-1,cName.length)===".") {
                                      cName = cName.substr(0,cName.length-1);
                                  }
                              }
                          } else {
                              cName = JSON.stringify(prop.value);
                          }
                      } else if (i === 1) {
                          cId = prop.value;
                      } else if (i === cmd.action.property.length-1) {
                          bottom = prop.value;
                      } else {
                          //props 对象的属性
                          if(prop.value) {
                              switch (prop.type) {
                                  case 12: //FormulaInput
                                      if(formulaGenLine(prop.value)!=='') {
                                          props.push('\''+prop.name+'\''+':'+formulaGenLine(prop.value));
                                      }
                                      break;
                                  default:
                                      if(JSON.stringify(prop.value)!=='') {
                                          props.push('\''+prop.name+'\''+':'+JSON.stringify(prop.value));
                                      }
                                      break;
                              }
                          }
                      }
                  });
                  lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], cmd.action.name) + '(' + cName + ',' + JSON.stringify(cId) + ',' + '{'+ props.join(',') +'}' +',' + bottom +')');
              }
          } else if (cmd.action.name === 'find') {
              let propsList = [];
              let callBack = '';
              if(cmd.action.property) {
                  cmd.action.property.forEach((prop,i)=>{
                      switch (prop.name) {
                          case 'order':
                              break;
                          case 'lines':
                              let skip = 0;
                              let limit = 0;
                              if(prop.value.from) {
                                  skip = prop.value.from;
                              }
                              if(prop.value.to) {
                                  limit = prop.value.to - skip;
                              }
                              if(skip>0) {
                                  propsList.push('\''+'$skip'+'\':'+skip);
                              }
                              if(limit>0) {
                                  propsList.push('\''+'$limit'+'\':'+limit);
                              }
                              break;
                          case 'conditions':
                              if (prop.value) {
                                  let conList = [];
                                  prop.value.forEach((v,i)=>{
                                      let fValue = formulaGenLine(v.compare);
                                      if(v.field&&v.operation&&(fValue!=='')){
                                          let op = operationTranslate(v.operation);
                                          let field = v.field;
                                          if (v.field.substr(0, 1) == 'i'||v.field.substr(0, 1) == 's') {
                                              field = v.field.substr(1);
                                          }
                                          if(op) {
                                              if(op==='$e') {
                                                  conList.push('{'+'\''+field+'\''+':'+fValue+'}');
                                              } else {
                                                  conList.push('{'+'\''+field+'\''+':'+'{'+'\''+op+'\''+':'+fValue+'}}');
                                              }
                                          }
                                      }
                                  });
                                  if(conList.length>0) {
                                      propsList.push('\''+'$and'+'\''+':['+conList.join(',')+']');
                                  }
                              }
                              break;
                          case 'object':
                              if(prop.valueId) {
                                  propsList.push('\''+'$array'+'\''+':1');
                                  let arrValue = getIdsName(prop.valueId[0], prop.valueId[2], 'value');
                                  let method = "var arrValue = '';                                               "+
                                      // "console.log("+arrValue+");                                                "+
                                      "if(data.length>0){                                                        "+
                                      " var dataList = [];                                                       "+
                                      " data.forEach(function(v, i){                                             "+
                                      // "     var temp = [];                                                       "+
                                      // "     for (var prop in v) {                                                "+
                                      // "         if(prop.substr(0,1)!=='_'){                                      "+
                                      // "             temp.push(v[prop]);                                          "+
                                      // "         }                                                                "+
                                      // "     }                                                                    "+
                                      // "     if(temp.length>0) {                                                  "+
                                      // "         dataList.push(temp.join(','));                                   "+
                                      // "     }                                                                    "+
                                      "     var isArray = Object.prototype.toString.call(v) === '[object Array]';"+
                                      "     if(isArray&&v.length>0) {                                            "+//new start
                                      "         var temp = v.splice(0, 1);                                       "+//第一个为id
                                      "         if(temp.length>0) {                                              "+
                                      "             dataList.push(temp.join(','));                               "+
                                      "         }                                                                "+
                                      "     }                                                                    "+//new end
                                      " });                                                                      "+
                                      " if(dataList.length>0){                                                   "+
                                      "     arrValue = dataList.join(';');                                       "+
                                      " }                                                                        "+
                                      "}                                                                         "+
                                      "if(arrValue != ''){"+ arrValue + "= arrValue;}                            ";
                                      // "console.log("+'ids.'+prop.valueId[0] +");      ";
                                  callBack = ',function(err, data){'+'console.log(data);'+method+'}';
                              }
                              break;
                          default:
                              break;
                      }
                  })
              }
              // let props = propsList.length>0 ? ('{'+ propsList.join(',') +'}') : null;
              let props = ('{'+ propsList.join(',') +'}');
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'find') + '('+props+callBack+')');
          } else if (cmd.action.name === 'show') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'visible') + '=' + 'true');
          } else if (cmd.action.name === 'hide') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'visible') + '=' + 'false');
          } else if (cmd.action.name === 'toggleVisible') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'visible') + '=' + '!('+ getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'visible')+')');
          } else if (cmd.action.name === 'add1') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'value') + '++');
          } else if (cmd.action.name === 'minus1') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'value') + '--');
          } else if (cmd.action.name === 'addN') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'value') + '+=' + JSON.stringify(cmd.action.property[0]['value']));
          } else if (cmd.action.name === 'minusN') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'value') + '-=' + JSON.stringify(cmd.action.property[0]['value']));
          } else if (cmd.action.name === 'getInt') {
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'value') + '=' + 'Math.round(' + getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'value') + ')');
          } else if (cmd.action.name === 'randomValue') {
              let max = JSON.stringify(cmd.action.property[1]['value']);
              let min = JSON.stringify(cmd.action.property[0]['value']);
              lines.push(getIdsName(cmd.sObjId[0], cmd.sObjId[2], 'value') + '=' + 'Math.round(Math.random()*('
                  + max + '-'
                  + min + ')+' + min + ')');
          } else if(cmd.action.name === 'setProps') {
              if(cmd.action.property) {
                  cmd.action.property.forEach((prop)=>{
                      if(prop.value) {
                          if(prop.name === 'originPos') {
                              let arr = prop.value.split(',');
                              lines.push(getIdsName(cmd.sObjId[0],cmd.sObjId[2],'originX')+'='+ arr[0]);
                              lines.push(getIdsName(cmd.sObjId[0],cmd.sObjId[2],'originY')+'='+ arr[1]);
                          } else if(prop.name === 'alpha') {
                              if(formulaGenLine(prop.value)!=='') {
                                  lines.push(getIdsName(cmd.sObjId[0],cmd.sObjId[2],prop.name)+'='+ '('+formulaGenLine(prop.value)+')'+'/100');
                              }
                          } else if(prop.name === 'flexWrap') {
                              lines.push(getIdsName(cmd.sObjId[0],cmd.sObjId[2],prop.name)+'='+JSON.stringify( prop.value ?'wrap':'nowrap'));
                          }
                          else {
                              switch (prop.type) {
                                  case 12: //FormulaInput
                                      if(formulaGenLine(prop.value)!=='') {
                                         if(['marginUp','marginDown','marginLeft','marginRight'].indexOf(prop.name)>=0){
                                             let oVal={}
                                             oVal['head']=getIdsName(cmd.sObjId[0],cmd.sObjId[2],'margin')+'=';
                                             oVal['value']= formulaGenLine(prop.value)==''?'0px':formulaGenLine(prop.value);
                                             oVal['name']=prop.name;
                                             marginArr.push(oVal);
                                         }else if(['paddingUp','paddingDown','paddingLeft','paddingRight'].indexOf(prop.name)>=0){
                                             let oVal={}
                                             oVal['head']=getIdsName(cmd.sObjId[0],cmd.sObjId[2],'padding')+'=';
                                             oVal['value']= formulaGenLine(prop.value)==''?'0px':formulaGenLine(prop.value);
                                             oVal['name']=prop.name;
                                             paddingArr.push(oVal);
                                         }else if(['minWidth', 'minHeight', 'maxWidth', 'maxHeight'].indexOf(prop.name)>=0){
                                             lines.push(getIdsName(cmd.sObjId[0],cmd.sObjId[2],prop.name)+'='+JSON.stringify(formulaGenLine(prop.value)));
                                         }else{
                                             lines.push(getIdsName(cmd.sObjId[0],cmd.sObjId[2],prop.name)+'='+ formulaGenLine(prop.value));
                                         }
                                      }
                                      break;
                                  default:
                                      if(JSON.stringify(prop.value)!=='') {
                                          lines.push(getIdsName(cmd.sObjId[0],cmd.sObjId[2],prop.name)+'='+ JSON.stringify(prop.value));
                                      }
                                      break;
                              }
                          }
                      }
                  });
              }
          } else if (cmd.action.name === 'insert' || cmd.action.name === 'update') {
              let line = getIdsName(cmd.sObjId[0], cmd.sObjId[2], cmd.action.name) + '(';
              if (cmd.action.property) {
                  line += cmd.action.property.map(function(p) {
                      let va = null;
                      if(p.valueId&&p.valueId.length===4&&p.valueId[3] !== undefined && p.name == 'data') {
                          va = keyMap[p.valueId[3]];
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
                              // delete(p['vKey']);
                              return '{' + list.join(',') + '}';
                          } else {
                              // delete(p['vKey']);
                              return '';
                          }
                      }
                      return JSON.stringify(p['value']);
                  }).join(',');
              }
              lines.push(line + ')');
          } else {
              let line = getIdsName(cmd.sObjId[0], cmd.sObjId[2], cmd.action.name) + '(';
              if (cmd.action.property) {
                  line += cmd.action.property.map(function(p) {
                      return JSON.stringify(p['value']);
                  }).join(',');
              }
              lines.push(line + ')');
          }
        } else if (cmd.action&&cmd.action.type == 'customize' && cmd.enable) {
          var ps = ['ids'];
          if (cmd.action.property) {
              cmd.action.property.forEach(prop => {
                  if(formulaGenLine(prop.value) !== '') {
                      ps.push(formulaGenLine(prop.value));
                  }
              });
          }
          lines.push(getIdsName(cmd.action.funcId[0], cmd.action.funcId[2]) + '(' + ps.join(',') + ')');
        }
      });

        lines=getSpacingStr(lines,marginArr,['marginUp','marginRight','marginDown','marginLeft']);
        lines=getSpacingStr(lines,paddingArr,['paddingUp','paddingRight','paddingDown','paddingLeft']);

      if (lines.length) {
        var out = '';
        if (conditions.length == 1) {
          out = 'if' + conditions[0];
        } else if (conditions.length) {
          var logicalFlag = item.judges.logicalFlag;
          var lop;
          if (logicalFlag == 'and')
            lop = '&&';
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
  //console.log(output);
  return output;
}

function getSpacingStr(lines,spacingArr,arr) {
    let sMargin=["0px","0px","0px","0px"];
    let sHead='';
    spacingArr.map((v,i)=>{
        sHead=v.head;
        if(v.name==arr[0]){
            sMargin[0]=(v.value);
        }
        else if(v.name==arr[1]){
            sMargin[1]=(v.value);
        }
        else if(v.name==arr[2]){
            sMargin[2]=(v.value);
        }
        else if(v.name==arr[3]){
            sMargin[3]=(v.value);
        }
    });
    if(spacingArr.length>0){
        let abc=sMargin.join(' ');
        abc= abc.replace('\"','');
        lines.push(sHead+JSON.stringify(abc));
    }
    return lines;
}

function saveTransBlock(block, saveKey){
    let temp = {};
    temp.name = block.name;
    let tempProps = [];
    block.mapping.props.forEach((v)=>{
        let detail = cpJson(v.detail);
        let tempV = {name: v.name, objId: objectKeyToId(v.objKey), detail:detail, mappingId:objectKeyToId(v.mappingKey)};
        if(saveKey) {
            tempV.objKey = v.objKey;
            tempV.mappingKey = v.mappingKey;
        }
        tempProps.push(tempV);
    });
    let tempEvents = [];
    block.mapping.events.forEach((v)=>{
        let detail = cpJson(v.detail);
        let tempV = {name: v.name, objId: objectKeyToId(v.objKey), detail:detail, mappingId:objectKeyToId(v.mappingKey)};
        if(saveKey) {
            tempV.objKey = v.objKey;
            tempV.mappingKey = v.mappingKey;
        }
        tempEvents.push(tempV);
    });
    let tempFuncs = [];
    block.mapping.funcs.forEach((v)=>{
        let detail = cpJson(v.detail);
        let tempV = {name: v.name, objId: objectKeyToId(v.objKey), detail:detail, mappingId:objectKeyToId(v.mappingKey)};
        if(saveKey) {
            tempV.objKey = v.objKey;
            tempV.mappingKey = v.mappingKey;
        }
        tempFuncs.push(tempV);
    });
    temp.mapping = {
        props: tempProps,
        events: tempEvents,
        funcs: tempFuncs
    };
    return temp;
}

function saveTree(data, node, saveKey, saveEventObjKeys) {
  data['cls'] = node.className;

  let props = {};
  for (let name in node.props) {
    if (name === 'id')
      data['id'] = node.props['id'];
    else if (name == 'eventTree') {
      var etree = [];

        //保存时公式编辑器内容的处理
        let dealWithFormulaObj = (list, sk)=>{
            let temp = [];
            list.forEach(v1=>{
                let tempV = {
                    prePattern: v1.prePattern,
                    objId: objectKeyToId(v1.objKey),
                    property: v1.property,
                    pattern: v1.pattern,
                };
                if(sk) {
                    tempV.objKey = v1.objKey;
                }
                temp.push(tempV);
            });
            return temp;
        };

        node.props['eventTree'].forEach(item => {
        /*
        * luozheao,20161115
        * 触发条件与判断条件拼接思路:
        * 1 将需要填值的触发条件处理成判断条件
        * 2 处理判断条件
        * 3 传给generateJsFunc,用于拼接成执行代码
        * 4 将item传到etree里,loadTree时候直接调用item,不用再把处理过的判断条件解析一遍
        * */
            var cmds = [];
            var judges={};

            var eventEnable = item.enable; //是否可执行
            judges.conFlag = item.conFlag;

            judges.className=item.className;

            judges.children=[];
            if(item.needFill) {
                judges.conFlag = 'change';//触发条件
                judges.needFills = [];


                if(judges.className=='input'){
                     if(item.needFill[0].default=='输入完成'){
                         judges.conFlag='change';
                     }
                     else if(item.needFill[0].default=='内容改变'){
                         judges.conFlag='input';
                     }
                }


                item.needFill.map((v, i)=> {
                    if(judges.className=='input'&& item.needFill.length>1  && i==0){
                        return;
                    }

                    if (judges.className === 'sock' && v.actionName === 'message') {
                        let valueObj = keyMap[v.default];
                        if (valueObj) {
                            let o = objectToId(valueObj);
                            judges.needFills.push({showName: v.showName, type: v.type, default: v.default, valueIds:o, actionName:v.actionName});
                        }
                    }
                    else {
                        let obj = {};
                        obj.enable = true;
                        obj.judgeObjKey = node.key;
                        let judgeObj = keyMap[obj.judgeObjKey];
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


                        if ((judges.className == 'text' || judges.className == 'input') && (obj.compareFlag == 'isMatch' || obj.compareFlag == 'isUnMatch')) {
                            obj.compareFlag = obj.compareFlag == 'isMatch' ? '==' : '!=';
                        } else if (judges.className == 'counter' && ( obj.compareFlag == 'valRange')) {
                            obj.compareFlag = v.showName == '最大值' ? '<' : '>';
                        } else if (v.showName == '碰撞对象') {
                            judges.conFlag = item.conFlag;
                            let bodyObj = keyMap[v.default];
                            if (bodyObj) {
                                obj.judgeObjId = bodyObj.props.id;
                                 v.contactObjId=  bodyObj.props.id;
                            } else {
                                //没有碰撞对象
                                obj.judgeObjId = null;
                            }
                        }
                        obj.showName = v.showName;
                        obj.type = v.type;
                        obj.compareObjFlag = v.default;

                        if(judges.className=='input'&& item.needFill.length==1  && i==0){
                            obj.compareObjFlag=null
                        }

                        judges.children.push(obj);
                    }
                });
            }
            else if( judges.className=='counter' &&( judges.conFlag == 'positive' || judges.conFlag == 'negative')) {
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
                judges.conFlag = 'change'
                judges.children.push(obj);
            }

        judges.logicalFlag =item.logicalFlag; //逻辑判断符
        judges.zhongHidden =item.zhongHidden; //是否启用逻辑判断条件
         item.children.map((v,i)=> {
                let obj = {};
                let isSpecial1 = false;

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
                    delete  v.judgeObj;
                }
               obj.judgeValFlag =isSpecial1?'value':v.judgeValFlag;
                obj.compareFlag = v.compareFlag;//比较运算符
                if(v.compareObjFlag&&v.compareObjFlag.type&&v.compareObjFlag.type===2) {
                    //公式编辑器的对象处理
                    obj.compareObjFlag = {
                        type: 2,
                        value: dealWithFormulaObj(v.compareObjFlag.value, saveKey||saveEventObjKeys)
                    };
                } else {
                    obj.compareObjFlag = v.compareObjFlag;
                }
                obj.arrHidden = v.arrHidden;
                judges.children.push(obj);
            });

        item.specificList.forEach(cmd => {
            let c = {};
            c.enable = cmd.enable;
            c.sObjId = objectKeyToId(cmd.object);
            if(saveKey||saveEventObjKeys) {
                if(saveKey) {
                    c.sid = cmd.sid;
                }
                c.object = cmd.object;
            }
            //有对象才会有动作，不然动作清除
            if (c.sObjId&&cmd.action) {
                c.action = {};
                switch (cmd.action.type) {
                    case funcType.customize:
                        c.action.funcId = objectKeyToId(cmd.action.func);
                        c.action.type = cmd.action.type;
                        if(saveKey||saveEventObjKeys) {
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
                    cmd.action.property.forEach(v=> {
                        switch (v.type) {
                            case 21:  // Object
                            case 23:  // ObjectSelect
                                if (v.value) {
                                    let temp = {
                                        name: v.name,
                                        showName: v.showName,
                                        type: v.type,
                                        valueId: objectKeyToId(v.value)
                                    };
                                    if (saveKey||saveEventObjKeys) {
                                        temp.value = v.value;
                                    }
                                    property.push(temp);
                                } else {
                                    property.push(v);
                                }
                                break;
                            case 12:  // FormularInput
                                if (v.value && v.value.type === 2) {
                                    let temp = {
                                        name: v.name,
                                        showName: v.showName,
                                        type: v.type,
                                        value: {
                                            type: 2,
                                            value: [],
                                        }
                                    };
                                    if(v.isProp) {
                                        temp.isProp = v.isProp;
                                    }
                                    temp.value.value = dealWithFormulaObj(v.value.value, saveKey||saveEventObjKeys);
                                    property.push(temp);
                                } else {
                                    property.push(v);
                                }
                                break;
                            case 18:  // DBCons
                                if (v.value) {
                                    let temp = {
                                        name: v.name,
                                        showName: v.showName,
                                        type: v.type,
                                    };
                                    temp.value = [];
                                    v.value.forEach(v1=> {
                                        if (v1.compare && v1.compare.type === 2) {
                                            let temp2 = {
                                                field: v1.field,
                                                operation: v1.operation,
                                                compare: {
                                                    type: 2,
                                                    value: []
                                                }
                                            };
                                            temp2.compare.value = dealWithFormulaObj(v1.compare.value, saveKey||saveEventObjKeys);
                                            temp.value.push(temp2);
                                        } else {
                                            temp.value.push(v1);
                                        }
                                    });
                                    property.push(temp);
                                } else {
                                    property.push(v);
                                }
                                break;
                            default:
                                property.push(v);
                                break;
                        }
                    });
                    c.action.property = property;
                }
            } else {
                c.action = null;
            }
            cmds.push(c);
        });
        if(!saveKey) {
            //如果不savekey就复制一下并删除eid
            item = cpJson(item);
            (delete item.eid);
        }
        etree.push({cmds:cmds,judges:judges, enable:eventEnable,eventNode:item});

      });
      data['etree'] = etree;
        if(node.props['enableEventTree'] && !saveKey){
            var js = generateJsFunc(etree);
            if (js)
                data['events'] = js;
        }
    } else {
      props[name] =  node.props[name] !==undefined? JSON.parse(JSON.stringify(node.props[name])):undefined;
    }
  }
  if (saveKey) {
      props['key'] = node.key;
  }
  if (node.className == 'track' && node.timerWidget && node.timerWidget.props['totalTime']) {
      props['totalTime'] = node.timerWidget.props['totalTime'];
  }
  if (props) {
      data['props'] = props;
      if(data['props']['block']) {
          data['props']['block'] = saveTransBlock(data['props']['block'], saveKey);
      } else if(data['props']['backUpBlock']) {
          data['props']['backUpBlock'] = saveTransBlock(data['props']['backUpBlock'], saveKey);
      }
  }
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
      saveTree(child, item, saveKey, saveEventObjKeys);
    });
  }
}

bridge.setGenerateText(function(widget, callback) {
  var xhr = new XMLHttpRequest();
    if(window.location.hostname==='localhost'&&window.location.port!=='8050'){
        xhr.open('POST', 'http://test-beta.ih5.cn/editor3b/'+'app/generateText');
    }else{
        xhr.open('POST', 'app/generateText');
    }
  if (globalToken)
      xhr.setRequestHeader('Authorization', 'Bearer {' + globalToken + '}');
  var form = new FormData();
  form.append('font', widget['fontFamily']);
  form.append('text', widget['value']);
  form.append('size', widget['fontSize']);
  form.append('color', widget['fontFill']);
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

//x,y相对于widget在舞台的位置
function getRelativePosition(x, y, widget) {
    if((x===null||x===undefined)||(y===null||y===undefined)) {
        return null;
    }
    if(widget&&widget.className !=='root') {
        //计算当前widget的绝对位置然后算出画框的相对位置
        let calWidget = widget;
        let pPositionX = 0;
        let pPositionY = 0;
        while(calWidget&&calWidget.className!=='root') {
            if(calWidget.node.positionX) {
                pPositionX+=calWidget.node.positionX;
            }
            if(calWidget.node.positionY) {
                pPositionY+=calWidget.node.positionY;
            }
            calWidget = calWidget.parent;
        }
        x -= pPositionX;
        y -= pPositionY;
        return {x:x, y:y};
    }
    return {x:x, y:y};
}

//widget相对于舞台的位置
function getAbsolutePosition(widget) {
    if(widget&&widget.className !=='root') {
        let x = 0;
        let y = 0;
        //计算当前widget的绝对位置然后算出画框的相对位置
        let calWidget = widget;
        while(calWidget&&calWidget.className!=='root') {
            if(calWidget.node.positionX) {
                x+=calWidget.node.positionX;
            }
            if(calWidget.node.positionY) {
                y+=calWidget.node.positionY;
            }
            calWidget = calWidget.parent;
        }
        return {x:x, y:y};
    }
    return null;
}

function dealImageFile(clientX, clientY, files, self) {
    var i;
    var file;

    let oDiv = document.getElementById("canvas-dom");
    let top = getY(oDiv);
    let left = getX(oDiv);
    let x = clientX-left+document.body.scrollLeft;
    let y = clientY-top+document.body.scrollTop;

    if (self.currentWidget && checkChildClass(self.currentWidget, 'image') && !self.currentWidget.props.block) {
        let xy = getRelativePosition(x, y, self.currentWidget);
        if(xy) {
            x = xy.x;
            y = xy.y;
        }
        for (i = 0; i < files.length; i++) {
            file = files[i];
            if (file.type.match(/image.*/)) {
                let fileName = file.name;
                let dot = fileName.lastIndexOf('.');
                if (dot > 0) {
                    var ext = fileName.substr(dot + 1).toLowerCase();
                    if (ext == 'png' || ext == 'jpeg' || ext == 'jpg') {
                        fileName = fileName.substr(0, dot);
                    }
                }
                let reader = new FileReader();
                reader.onload = e => {
                    let props = {name: fileName, originX: 0.5, originY: 0.5, positionX: x, positionY: y};
                    self.addWidget('image', props, e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }
}

function uploadImage(e) {
    e.stopPropagation();
    e.preventDefault();
    if (this.currentWidget && checkChildClass(this.currentWidget, 'image') && !this.currentWidget.props.block) {
        chooseFile('image', false, (w) => {
            dealImageFile(e.clientX,e.clientY,w.files, this);
        });
    }

}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();
  var dt = e.dataTransfer;
  var files = dt.files;
  dealImageFile(e.clientX,e.clientY,files, this);
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
        this.listenTo(WidgetActions['addProps'], this.addProps);
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
        this.listenTo(WidgetActions['originSizeTreeNode'], this.originSizeTreeNode);
        this.listenTo(WidgetActions['originPercentTreeNode'], this.originPercentTreeNode);
        this.listenTo(WidgetActions['setAsFullScreenTreeNode'], this.setAsFullScreenTreeNode);

        //修改widget的资源入口
        this.listenTo(WidgetActions['changeResource'], this.changeResource);

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

        this.listenTo(WidgetActions['updateConOptions'], this.updateConOptions);
        //this.currentActiveEventTreeKey = null;//初始化当前激活事件树的组件值

        this.listenTo(WidgetActions['closeKeyboardMove'], this.closeKeyboardMove);

        this.listenTo(WidgetActions['alignWidgets'], this.alignWidgets);

        this.listenTo(WidgetActions['setVersion'], this.setVersion);

        this.listenTo(WidgetActions['saveEffect'], this.saveEffect);
        this.listenTo(WidgetActions['addEffect'], this.addEffect);

        this.listenTo(WidgetActions['addOrEditBlock'], this.addOrEditBlock);
        this.listenTo(WidgetActions['removeBlock'], this.removeBlock);
        this.listenTo(WidgetActions['activeBlockMode'], this.activeBlockMode);
        this.listenTo(WidgetActions['addBlockToCurrentWidget'], this.addBlockToCurrentWidget);

        this.eventTreeList = [];
        this.historyRoad;
    },
    selectWidget: function(oWidget, shouldTrigger, keepValueType, isMulti) {
        var render = false;
        let widget = oWidget;

        //如果父中有检查出有小模块就不能被选择
        if(widget&&widget.parent) {
            let temp = widget;
            // let parentIsBlock = false;
            while (temp&&temp.parent) {
            // while (temp&&(temp.parent || parentIsBlock == true)) {
                if(temp.parent&&temp.parent.props.block) {
                    // parentIsBlock = true;
                    widget = temp.parent;
                }
                temp = temp.parent;
            }
            // if(parentIsBlock) {
            //     return;
            // }
        }

        if (widget) {
            // if (!this.currentWidget || this.currentWidget.rootWidget != widget.rootWidget) {
            //     render = true;
            //     var el = bridge.getEl(widget.rootWidget.node);
            //     if (el != rootElm) {
            //         if (rootElm)
            //             rootDiv.removeChild(rootElm);
            //             rootElm = el;
            //             rootDiv.appendChild(rootElm);
            //     }
            // }

            if(widget.props&&(widget.props['locked'] === undefined)) {
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

                if(this.selectWidgets.length>0) {
                    if((this.selectWidgets[0] &&
                        (selectableClass.indexOf(this.selectWidgets[0].className)>=0 || isCustomizeWidget(this.selectWidgets[0].className)) &&
                        !this.selectWidgets[0].props['locked']) &&
                        (widget &&
                        (selectableClass.indexOf(widget.className) >= 0 || isCustomizeWidget(widget.className)) &&
                        !widget.props['locked'])) {
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
            if (widget &&
                (selectableClass.indexOf(widget.className) >= 0 || isCustomizeWidget(widget.className)) &&
                !widget.props['locked']) {
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
                  //bridge.selectWidget([widget.node]);
                bridge.selectWidget(null);
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
      let isInFlex = bridge.getRendererType(this.currentWidget.node) == 1;
      if(className == "db"){
          props = this.addWidgetDefaultName(className, props, true, false, name,dbType);
          historyName = "添加 数据库"+name;
      } else if(className == "sock"){
          props = this.addWidgetDefaultName(className, props, true, false, name);
          historyName = "添加 连接"+name;
      } else if (className === 'image') {
          historyName = "添加图片 "+ props.name;
      } else {
          props = this.addWidgetDefaultName(className, props, true, false);
          if(isInFlex) {
              if(className === 'container') {
                  //如果在flex模式下，添加param:{'alignItems':'flex-start'}
                  props['alignItems'] = 'flex-start';
                  props['alignItemsKey'] = 'flex-start';
              }else if(className==='canvas'){
                  props['width'] = '640px';
                  props['height'] = '1040px';
                  props['widthisRate'] = false;
                  props['heightisRate'] = false;
              } else {
                  props['flex'] = '0 0 auto';
                  props['flexKey'] = '0 0 auto';
              }
          } else if (className === 'world') {
              props['autoPlay'] = true;
              props['autoPlayKey'] = true;
          }
          historyName = "添加 "+ props.name;
      }
        
      if (className === 'track') {
          // if (!this.currentWidget.timerWidget ||
          //     (this.currentWidget.className !== 'image'
          //     && this.currentWidget.className !== 'imagelist'
          //     && this.currentWidget.className !== 'text'
          //     && this.currentWidget.className !== 'bitmaptext'
          //     && this.currentWidget.className !== 'ellipse'
          //     && this.currentWidget.className !== 'path'
          //     && this.currentWidget.className !== 'qrcode'
          //     && this.currentWidget.className !== 'counter'
          //     && this.currentWidget.className !== 'rect'
          //     && this.currentWidget.className !== 'container'))
          //     return;
          let propList = ['positionX', 'positionY', 'scaleX', 'scaleY', 'rotation', 'alpha'];
          let dataList = [];   //let dataList = [[0], [1]];
          //for (let i = 0; i < propList.length; i++) {
          //  let d = this.currentWidget.node[propList[i]];
          //  dataList[0].push(d);
          //  //dataList[1].push(d);
          //}
          let trackType = this.currentWidget.timerWidget == null ? props.trackType : "timer";
          let track = loadTree(this.currentWidget, {
              'cls': className,
              'props': {'prop': propList, 'data': dataList, 'name': props['name'], 'trackType' : trackType}
          });
          this.trigger({redrawTree: true, updateTrack: track});
          this.selectWidget(this.currentWidget);
          EffectAction['returnStart']();
          // } else if (className === 'body' || className === 'easing' || className === 'effect' || this.currentWidget.node['create']) {
      } else {
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

        if (className == 'body') {
            cmd.updateProperties = {'originX':0.5, 'originY':0.5};
        }

        if (className == 'image' && p.shapeWidth!==undefined) {
            let originVisible = o.node['visible'];
            if (originVisible) {
                o.node['visible'] = false;
            }
            process.nextTick(() => {
                this.trigger(cmd);
                this.getAllWidgets();
                o.node['visible'] = originVisible;
                o.node['scaleX'] = p.shapeWidth / o.node.width;
                o.node['scaleY'] = o.node['scaleX'];
                this.render();
            });
        } else {
            this.trigger(cmd);
            this.getAllWidgets();
            this.render();
        }
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
            bridge.selectWidget(null);
            bridge.showTrack(null);
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
    saveEffect: function(){
        if (this.currentWidget && this.currentWidget.parent) {
            saveEffect = {};
            saveTree(saveEffect, this.currentWidget, true, false);
            this.trigger({saveEffect : saveEffect})
        }
    },
    addEffect : function(data,bool){
        if (this.currentWidget) {
            let effect = cpJson(data);
            if (!effect.className&&!effect.cls) {
                return;
            }
            // 重命名要黏贴的widget
            if (effect.props['key'] === undefined) {
                //copy
                effect.props = this.addWidgetDefaultName(effect.cls, effect.props, false, true, effect.props.name);
            }
            loadTree(this.currentWidget, effect);
            if(effect.props.eventTree){
                this.reorderEventTreeList();
            }
            if(bool){
                let test = true;
                this.currentWidget.children.map((v,i)=>{
                    if(v.className == "track" && v.props.name == effect.props.name){
                        this.trigger({selectWidget: v});
                        this.currentWidget = v;
                        test = false;
                    }
                });
                if(test){
                    this.trigger({selectWidget: this.currentWidget});
                }
            }
            else {
                this.trigger({selectWidget: this.currentWidget});
            }
            this.trigger({redrawEventTree: true});
            this.render();
        }
    },
    copyWidget: function(shouldCut) {
        if (this.currentWidget && this.currentWidget.parent) {
            copyObj = {};
            if(shouldCut) {
                saveTree(copyObj, this.currentWidget, true, true);
            } else {
                saveTree(copyObj, this.currentWidget, false, true);
            }
            //获取其相对舞台的绝对位置并存入copyObj
            let xy = getAbsolutePosition(this.currentWidget);
            if(xy){
                copyObj.props.absolutePositionX = xy.x;
                copyObj.props.absolutePositionY = xy.y;
            }

            //复制时间轴轨迹的时候改变轨迹属性
            if(copyObj.children && copyObj.children.length> 0){
                copyObj.children.map((v,i)=>{
                    if(v.cls == 'track' && v.props.trackType == "timer"){
                        v.props.trackType = "track";
                    }
                });
            }
            if(copyObj.cls == 'track' && copyObj.props.trackType == "timer"){
                copyObj.props.trackType = "track";
            }
        }
    },
    pasteWidget: function(isRelativePosition) {
        if (this.currentWidget) {
            let tempCopy = cpJson(copyObj);
            if (!tempCopy.className&&!tempCopy.cls) {
                return;
            }

            //复制轨迹到时间轴的时候改变轨迹属性
            if(copyObj.children && copyObj.children.length> 0){
                copyObj.children.map((v,i)=>{
                    if(v.cls == 'track' && v.props.trackType != "timer" && v.timerWidget !== null){
                        v.props.trackType = "timer";
                    }
                });
            }
            if(copyObj.cls == 'track' && copyObj.props.trackType != "timer" && v.timerWidget !== null){
                copyObj.props.trackType = "timer";
            };

            // 重命名要黏贴的widget
            if (tempCopy.props['key'] === undefined) {
                //copy
                tempCopy.props = this.addWidgetDefaultName(tempCopy.cls, tempCopy.props, false, true);
            }

            if(!isRelativePosition) {
                //获取其绝对位置并转为相对位置
                if (tempCopy.props.absolutePositionX || tempCopy.props.absolutePositionX === 0 &&
                    (tempCopy.props.absolutePositionY || tempCopy.props.absolutePositionY === 0)) {
                    let xy = getRelativePosition(tempCopy.props.absolutePositionX, tempCopy.props.absolutePositionY, this.currentWidget);
                    if(xy) {
                        tempCopy.props.positionX = xy.x;
                        tempCopy.props.positionY = xy.y;
                    }
                }
            }
            if(tempCopy.props.absolutePositionX||tempCopy.props.absolutePositionX===0) {
                delete  tempCopy.props.absolutePositionX;
            } else if(tempCopy.props.absolutePositionY||tempCopy.props.absolutePositionY===0) {
                delete  tempCopy.props.absolutePositionY;
            }

            loadTree(this.currentWidget, tempCopy);
            if(tempCopy.props.eventTree){
                this.reorderEventTreeList();
            }
            this.trigger({selectWidget: this.currentWidget});
            this.trigger({redrawEventTree: true});
            this.render();
            historyName = "复制" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    cutWidget: function() {
        this.copyWidget(true);
        this.removeWidget(true);
    },
    originSizeWidget: function() {
        if(this.currentWidget&&(this.currentWidget.node['scaleX']|| this.currentWidget.node['scaleX']===0)) {
            this.updateProperties({'scaleX':1,'scaleY':1});
            bridge.updateSelector(this.currentWidget.node);
            this.render();
        }
    },
    originPercentWidget: function() {
        if(this.currentWidget&&(this.currentWidget.node['scaleX']|| this.currentWidget.node['scaleX']===0)) {
            this.updateProperties({'scaleY':this.currentWidget.node['scaleX']});
            bridge.updateSelector(this.currentWidget.node);
            this.render();
        }
    },
    setAsFullScreenWidget: function() {
        if(this.currentWidget) {
            this.updateProperties({'width':'100%', 'height':'100%', 'widthisRate': true, 'heightisRate': true,
                'positionX': 0, 'positionY': 0});
            bridge.updateSelector(this.currentWidget.node);
            this.render();
        }
    },
    lockWidget: function () {
        if (this.currentWidget) {
            this.currentWidget.props['locked'] = !this.currentWidget.props['locked'];
            this.updateProperties({'locked':this.currentWidget.props['locked']});
            if (!this.currentWidget.props['locked']) {
                bridge.selectWidget([this.currentWidget.node], this.updateProperties.bind(this));
            } else {
                bridge.selectWidget([this.currentWidget.node]);
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
            //historyName = "加锁" + this.currentWidget.node.name;
            //this.updateHistoryRecord(historyName);
        }
    },
    getPointsOfWidget: function(widget) {
        //每个对象需要获取相对于舞台的绝对位置（6个点）
        //left，top，right，bottom，centreX, centreY
        let props = widget.node;
        let points = {};
        points.left = props.positionX-props.width*props.originX;
        points.right = props.positionX+props.width*(1-props.originX);
        points.centreX = props.positionX-props.width*props.originX+props.width/2;
        if(props.scaleX<0){
            points.left = props.positionX-props.width*(1-props.originX);
            points.right = props.positionX+props.width*props.originX;
            points.centreX = props.positionX+props.width*props.originX-props.width/2;
        }
        points.top = props.positionY-props.height*props.originY;
        points.bottom = props.positionY+props.height*(1-props.originY);
        points.centreY = props.positionY-props.height*props.originY+props.height/2;
        if(props.scaleY<0){
            points.top = props.positionY-props.height*(1-props.originY);
            points.bottom = props.positionY+props.height*props.originY;
            points.centreY = props.positionY+props.height*props.originY-props.height/2;
        }
        points.width = props.width;
        points.height = props.height;
      return points;
    },
    alignWidgets: function(typeId, type) {
        let pointsList = [];
        this.selectWidgets.forEach((v)=>{
            pointsList.push(this.getPointsOfWidget(v));
        });
        if(pointsList.length<2) {
            return;
        }
        switch (type) {
            case 'align':
                let standard = pointsList[0];
                switch (typeId) {
                    case 1:
                        //左
                        pointsList.forEach((v)=>{
                            if(v.left<standard.left) {
                                standard = v;
                            }
                        });
                        this.selectWidgets.forEach((v)=>{
                            let px = standard.left+v.node.width*v.node.originX;
                            if(v.node.scaleX<0) {
                                px = standard.left+v.node.width*(1-v.node.originX);
                            }
                            v.node['positionX'] = px;
                            v.props['positionX'] = px;
                        });
                        break;
                    case 2:
                        //左右居中
                        let allCenterX = 0;
                        pointsList.forEach((v)=>{
                            allCenterX+=v.centreX;
                        });
                        let avgCenterX = allCenterX/pointsList.length;
                        this.selectWidgets.forEach((v)=>{
                            let px = avgCenterX+v.node.width*v.node.originX-v.node.width/2;
                            if(v.node.scaleX<0) {
                                px = avgCenterX-v.node.width*v.node.originX+v.node.width/2;
                            }
                            v.node['positionX'] = px;
                            v.props['positionX'] = px;
                        });
                        break;
                    case 3:
                        //右
                        pointsList.forEach((v)=>{
                            if(v.right>standard.right) {
                                standard = v;
                            }
                        });
                        this.selectWidgets.forEach((v)=>{
                            let px = standard.right-v.node.width*(1-v.node.originX);
                            if(v.node.scaleX<0) {
                                px = standard.right-v.node.width*v.node.originX;
                            }
                            v.node['positionX'] = px;
                            v.props['positionX'] = px;
                        });
                        break;
                    case 4:
                        //底部
                        pointsList.forEach((v)=>{
                            if(v.bottom>standard.bottom) {
                                standard = v;
                            }
                        });
                        this.selectWidgets.forEach((v)=>{
                            let py = standard.bottom-v.node.height*(1-v.node.originY);
                            if(v.node.scaleY<0) {
                                py = standard.bottom-v.node.height*v.node.originY;
                            }
                            v.node['positionY'] = py;
                            v.props['positionY'] = py;
                        });
                        break;
                    case 5:
                        //上下居中
                        let allCenterY = 0;
                        pointsList.forEach((v)=>{
                            allCenterY+=v.centreY;
                        });
                        let avgCenterY = allCenterY/pointsList.length;
                        this.selectWidgets.forEach((v)=>{
                            let py = avgCenterY+v.node.height*v.node.originY-v.node.height/2;
                            if(v.node.scaleX<0) {
                                py = avgCenterY-v.node.height*v.node.originY+v.node.height/2;
                            }
                            v.node['positionY'] = py;
                            v.props['positionY'] = py;
                        });
                        break;
                    case 6:
                        //顶部对齐
                        pointsList.forEach((v)=>{
                            if(v.top<standard.top) {
                                standard = v;
                            }
                        });
                        this.selectWidgets.forEach((v)=>{
                            let py = standard.top+v.node.height*v.node.originY;
                            if(v.node.scaleY<0) {
                                py = standard.top+v.node.height*(1-v.node.originY);
                            }
                            v.node['positionY'] = py;
                            v.props['positionY'] = py;
                        });
                        break;
                    default:
                        break;
                }
                break;
            case 'distribute':
                if(pointsList.length<3){
                    return;
                }
                let orderedSelectWidget =[];
                let orderedPointsList =[];
                //复制一下准备排序
                this.selectWidgets.forEach((v)=>{
                    orderedSelectWidget.push(v);
                });

                let gap = 0;
                let len = pointsList.length;
                let step, key, pointsKey, j; //排序用到的变量

                switch (typeId) {
                    case 1:
                        //水平
                        let minLeft = pointsList[0].left;
                        let maxRight = pointsList[0].right;
                        let totalWidth = 0;
                        pointsList.forEach((v)=>{
                            if(v.left<minLeft) {
                                minLeft = v.left;
                            }
                            if(v.right>maxRight) {
                                maxRight = v.right;
                            }
                            totalWidth += v.width;
                            orderedPointsList.push(v);
                        });
                        //先排序，按照left由小往大 (使用插排)
                        for (let i = 1; i < len; i++) {
                            step = j = i;
                            pointsKey = orderedPointsList[j];
                            key = orderedSelectWidget[j];

                            while (--j > -1) {
                                if (orderedPointsList[j].left > pointsKey.left) {
                                    orderedPointsList[j + 1] = orderedPointsList[j];
                                    orderedSelectWidget[j + 1] = orderedSelectWidget[j];
                                } else {
                                    break;
                                }
                            }
                            orderedPointsList[j + 1] = pointsKey;
                            orderedSelectWidget[j + 1] = key;
                        };
                        //间距
                        gap = (maxRight-minLeft-totalWidth)/(len-1);
                        //最左和最右边不需要再计算positionX
                        for(let i=1; i<len-1; i++) {
                            let newLeft = this.getPointsOfWidget(orderedSelectWidget[i-1]).right+gap;
                            let px = newLeft+orderedSelectWidget[i].node.width*orderedSelectWidget[i].node.originX;
                            if(orderedSelectWidget[i].node.scaleX<0) {
                                px = newLeft+orderedSelectWidget[i].node.width*(1-orderedSelectWidget[i].node.originX);
                            }
                            orderedSelectWidget[i].node['positionX'] = px;
                            orderedSelectWidget[i].props['positionX'] = px;
                        }
                        break;
                    case 2:
                        //垂直
                        let minTop = pointsList[0].top;
                        let maxBottom = pointsList[0].bottom;
                        let totalHeight = 0;
                        pointsList.forEach((v)=>{
                            if(v.top<minTop) {
                                minTop = v.top;
                            }
                            if(v.bottom>maxBottom) {
                                maxBottom = v.bottom;
                            }
                            totalHeight += v.height;
                            orderedPointsList.push(v);
                        });
                        //先排序，按照top由小往大 (使用插排)
                        for (let i = 1; i < len; i++) {
                            step = j = i;
                            pointsKey = orderedPointsList[j];
                            key = orderedSelectWidget[j];

                            while (--j > -1) {
                                if (orderedPointsList[j].top > pointsKey.top) {
                                    orderedPointsList[j + 1] = orderedPointsList[j];
                                    orderedSelectWidget[j + 1] = orderedSelectWidget[j];
                                } else {
                                    break;
                                }
                            }
                            orderedPointsList[j + 1] = pointsKey;
                            orderedSelectWidget[j + 1] = key;
                        };
                        //间距
                        gap = (maxBottom-minTop-totalHeight)/(len-1);
                        //最上和最下边不需要再计算positionX
                        for(let i=1; i<len-1; i++) {
                            let newTop = this.getPointsOfWidget(orderedSelectWidget[i-1]).bottom+gap;
                            let py = newTop+orderedSelectWidget[i].node.height*orderedSelectWidget[i].node.originY;
                            if(orderedSelectWidget[i].node.scaleY<0) {
                                py = newTop+orderedSelectWidget[i].node.height*(1-orderedSelectWidget[i].node.originY);
                            }
                            orderedSelectWidget[i].node['positionY'] = py;
                            orderedSelectWidget[i].props['positionY'] = py;
                        }
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
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
                bridge.selectWidget(null);
                bridge.showTrack(null);
                bridge.removeWidget(src.node);
                src.parent.children.splice(src.parent.children.indexOf(src), 1);

                //相对舞台的绝对位置
                let xy = getAbsolutePosition(src);
                if(xy) {
                    let rXy = getRelativePosition(xy.x, xy.y, dest);
                    if(rXy) {
                        saved.props.positionX = rXy.x;
                        saved.props.positionY = rXy.y;
                    }
                }
                //获取名字
                // this.currentWidget = dest;
                // let props = this.addWidgetDefaultName(src.className, src.props, false, true);
                var obj = loadTree(dest, saved);

                //把时间轴轨迹从时间轴里面拖拽出来的时候改变轨迹属性，或则只是拖拽轨迹
                let timeFuc = (timerType)=>{
                    if(obj.className == "track"){
                        obj.props.trackType = timerType;
                    }
                    else {
                        obj.children.map((v,i)=>{
                            if(v.className == "track"){
                                v.props.trackType = timerType;
                            }
                        })
                    }
                };
                if(obj.timerWidget == null){
                    timeFuc("track");
                }
                else {
                    timeFuc("timer");
                }

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
        }
        else if(className == "track" && this.currentWidget.timerWidget == null){
            if(name && name !== "track"){
                props['name'] = name;
                props['trackType'] = "effect";
            }
            else {
                let cOrder = 1;
                //查找当前widget有多少个相同className的，然后＋1处理名字
                this.currentWidget.children.forEach(cW => {
                    if(cW.className === className) {
                        cOrder+=1;
                    }
                });
                props['name'] = className + cOrder;
                props['trackType'] = "track";
            }
            //console.log(props['trackType']);
        }
        else {
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
        //historyName = "重命名" + this.currentWidget.node.name;
        //this.updateHistoryRecord(historyName);
    },

    updateProperties: function(obj, skipRender, skipProperty, special, widget) {
        //更新属性时,prop和node都需要同时设定,不然看不到效果
        let tempWidget = this.currentWidget;
        if(widget) {
            tempWidget = widget;
        }

        let isHistoryRecord = true;
        //设置透明度,用来兼容时间轴
        //todo:志颖可以详细补充下
        this.setAlpha(obj);

        //如果是this.selectWidgets更新的坐标属性，如果没有发生位移的改变则不需要更新历史记录
        isHistoryRecord=this.setHistoryRecordByPos(obj, tempWidget);

         //处理flex模式下的百分比和px
         let isSkip= this.setFlexProps(obj, tempWidget);
         if(isSkip) {
             skipRender = false;
             skipProperty = false;
         }

        //当轨迹处于时间轴外面的时候,并且处于动态模式,移动位置，所有关键点也移动位置
        let updateSyncTrack = ()=>{
            if(tempWidget.timerWidget == null){
                tempWidget.children.map((v,i)=>{
                    if(v.className == "track" && v.props.trackType == "effect"){
                        syncTrack(tempWidget, v.props)
                    }
                })
            }
        };
        if(obj && Object.getOwnPropertyNames(obj).length == 2 && obj.positionX !== undefined && obj.positionY !== undefined){
            if(tempWidget.props.positionX != obj.positionX && tempWidget.props.positionY != obj.positionY){
                updateSyncTrack();
            }
        }
        else {
            updateSyncTrack();
        }

        //对color的处理
        let colorName = ['bgColor', 'backgroundColor','fontFill','fillColor','lineColor',
            'headerFontFill','altColor','color','head'];
        for(var key in obj){
            if(colorName.indexOf(key)>=0) {
                if(obj[key]===''||obj[key]==='无') {
                    let color='transparent';
                    obj[key]=color;
                    tempWidget.node[key]=color;
                    tempWidget.props[key]=color;
                    tempWidget.props[key+'Key']='无';
                    skipRender = false;
                    skipProperty = false;
                }
            }
        }

        if(obj.bgLink===null) {
            //没有了背景图的话，就填充它的背景颜色
            tempWidget.node['backgroundColor']=tempWidget.props['backgroundColor'];
            obj.backgroundColor = tempWidget.props['backgroundColor'];
        }

        // console.log(obj,this.currentWidget);

        let p = {updateProperties: obj};
        if (skipRender) {
            p.skipRender = true;
            bridge.updateSelector(tempWidget.node);
        }
        if (skipProperty) {
            p.skipProperty = true;
            bridge.updateSelector(tempWidget.node);
        }
        this.trigger(p);

        //改变轨迹类型更新舞台轨迹
        if(tempWidget.className == "track"){
            if(obj.type == 0 || obj.type){
                EffectAction['changeTrackType'](true);
            }
        }

        if(isHistoryRecord && special == undefined){
            historyName = "更改属性" + tempWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    /********updateProperties,内部工具方法,start***********************************************************************/
    /**
     * luozheao,20161119
     * 功能:
     * 处理alpha的值,兼容时间轴?
     */
    setAlpha:function(obj){
        if(obj &&obj.alpha&& obj.alpha !== 0){
            let value = parseFloat(obj.alpha);
            if(!value) {
                obj.alpha = 1;
            }
        }
    },

    /**
     * luozheao,20161119
     * 功能:
     * 处理flex模式下的百分比和px
     */
    setFlexProps:function (obj, widget) {
        let cWidget = this.currentWidget;
        if(widget) {
            cWidget = widget;
        }
        if (fnIsFlex(cWidget)) {
            for (let i in obj) {
                if (i == 'margin' || i == 'padding') {
                    let strArr = [];
                    for (let v in obj[i]) {
                        if (cWidget.props[v + 'isRate'] === true) {
                            obj[i][v] = obj[i][v] + '%';
                        } else {
                            obj[i][v] += 'px';
                        }
                        strArr.push(obj[i][v])
                    }
                    obj[i] = strArr.join(' ');
                    //node 和props都需要设定,node控制舞台的显示,props控制初始化时的显示
                    cWidget.node[i] = strArr.join(' ');
                    cWidget.props[i] = strArr.join(' ');
                } else {
                    if (cWidget.props[i + 'isRate'] === true) {
                        obj[i] += '%';
                    } else if (cWidget.props[i + 'isRate'] === false) {
                        obj[i] += 'px';
                    }
                    cWidget.node[i] = obj[i];
                    cWidget.props[i] = obj[i];
                }
            }
            return true;
        }
        return false;
    },
     /**
     * luozheao,20161119
     * 功能:
     * 当舞台中对象的坐标没发生改变,则不更新历史记录
     */
     setHistoryRecordByPos:function (obj, widget) {
         let cWidget = this.currentWidget;
         if(widget) {
             cWidget = widget;
         }
         if(obj && Object.getOwnPropertyNames(obj).length == 2 && obj.positionX !== undefined && obj.positionY !== undefined){
             if(cWidget.props.positionX == obj.positionX && cWidget.props.positionY == obj.positionY){
                  return false;
             }
             return true;
         }
     },
    /********updateProperties,内部工具方法,end*******************************************************************************/
    reorderEventTreeList: function () {
        if(this.currentWidget&&this.currentWidget.rootWidget) {
            this.eventTreeList = [];
            //母节点
            if(this.currentWidget.rootWidget.props.block) {
                if(this.currentWidget.rootWidget.props.block.eventTree){
                    this.eventTreeList.push(this.currentWidget.rootWidget);
                }
            } else {
                if(this.currentWidget.rootWidget.props.eventTree){
                    this.eventTreeList.push(this.currentWidget.rootWidget);
                }
            }
            //递归遍历添加有事件widget到eventTreeList
            let loopEventTree = (children) => {
                children.forEach(ch => {
                    if(ch.props.block){
                        if(ch.props.block.eventTree) {
                            this.eventTreeList.push(ch);
                        }
                    } else {
                        if(ch.props.eventTree) {
                            this.eventTreeList.push(ch);
                        }
                        if(ch.children&&ch.children.length>0) {
                            loopEventTree(ch.children);
                        }
                    }
                });
            };
            loopEventTree(this.currentWidget.rootWidget.children);
            this.trigger({eventTreeList: this.eventTreeList});
        }
    },
    emptyEvent: function (className) {
        //需根据不同的className添加不同的触发条件和目标对象，动作之类的
        let eid = _eventCount++;
        let eventSpec = this.emptyEventSpecific();
        let conOption =this.getConditionOption();
        let eventClassName=this.currentWidget.className;
        let event = {
            'eid': eid,
            'children': [{
                'judgeObjFlag':'判断对象',
                'judgeValFlag':'判断值',
                'compareFlag':'=',
                'compareObjFlag':'比较值/对象',
                'arrHidden': [true,true,true,true,true],  //逻辑运算符,判断对象,判断值,比较运算符,比较对象
                'enable': true,
            }],
            'conOption':conOption,
            'zhongHidden':true,
            'logicalFlag':'and',
            'conFlag':'触发条件',
            'className':eventClassName,
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
            'enable': true
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
                if(this.currentWidget.rootWidget.props.block) {
                    // 暂时小模块去除
                    // widgetList.push(root);
                } else {
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
            }
            //递归遍历添加有事件widget到eventTreeList
            let loopWidgetTree = (children) => {
                children.forEach(ch=>{
                    if(ch.props.block) {
                        // 暂时小模块去除
                        // widgetList.push(ch);
                    } else {
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
                    }
                });
            };
            loopWidgetTree(this.currentWidget.rootWidget.children);
            this.trigger({allWidgets: widgetList});
        }
    },
    initEventTree: function(className, props) {
        if (this.currentWidget) {
            if(this.currentWidget.props.block) {
                this.currentWidget.props.block['enableEventTree'] = true;
                this.currentWidget.props.block['eventTree'] = [];
                this.currentWidget.props.block['eventTree'].push(this.emptyEvent());
            } else {
                this.currentWidget.props['enableEventTree'] = true;
                this.currentWidget.props['eventTree'] = [];
                this.currentWidget.props['eventTree'].push(this.emptyEvent()); 
            }
            this.activeEventTree(this.currentWidget.key);
            this.trigger({redrawWidget: this.currentWidget});
        }
        // this.reorderEventTreeList();
        // this.render();
    },
    removeEventTree: function() {
        if (this.currentWidget) {
            if(this.currentWidget.props.block) {
                delete this.currentWidget.props.block['eventTree'];
                delete this.currentWidget.props.block['enableEventTree'];
            } else {
                delete this.currentWidget.props['eventTree'];
                delete this.currentWidget.props['enableEventTree'];
            }
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
                if(this.currentWidget.props.block) {
                    this.currentWidget.props.block['enableEventTree'] = enableValue;
                } else {
                    this.currentWidget.props['enableEventTree'] = enableValue;
                }
            } else {
                if(this.currentWidget.props.block) {
                    this.currentWidget.props.block['enableEventTree'] = !this.currentWidget.props.block['enableEventTree'];
                } else {
                    this.currentWidget.props['enableEventTree'] = !this.currentWidget.props['enableEventTree'];
                }
            }
            let isEnable = this.currentWidget.props['enableEventTree'];
            let eventTree = this.currentWidget.props.eventTree;
            if(this.currentWidget.props.block) {
                isEnable = this.currentWidget.props.block['enableEventTree'];
                eventTree = this.currentWidget.props.block.eventTree;
            }
            if(!skipSetEventList&&eventTree&&eventTree.length>0){
                eventTree.forEach(event=>{
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
        if(this.activeBlock) {
            this.activeBlockMode(false);
        }
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
            if(this.currentWidget.props.block) {
                this.currentWidget.props.block['eventTree'].push(this.emptyEvent());
                if(!this.currentWidget.props.block['enableEventTree']) {
                    this.currentWidget.props.block['enableEventTree'] = true;
                    this.trigger({redrawTree: true});
                }
            } else {
                this.currentWidget.props['eventTree'].push(this.emptyEvent());
                if(!this.currentWidget.props['enableEventTree']) {
                    this.currentWidget.props['enableEventTree'] = true;
                    this.trigger({redrawTree: true});
                }
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
        let eventTree = this.currentWidget.props['eventTree'];
        if(this.currentWidget.props.block) {
            eventTree = this.currentWidget.props.block['eventTree'];
        }
        if(eventTree) {
            let enableLength = 0;
            let disableLength = 0;
            eventTree.forEach(event=>{
                if(event.enable) {
                    enableLength++;
                } else {
                    disableLength++;
                }
            });
            if(enableLength=== 0||
                disableLength=== 0){
                this.enableEventTree(true, disableLength===0);
            } else if (!eventTree) {
                this.enableEventTree(true, true);
            }
        }
    },
    delEvent:function(eventList,index){
        let len =eventList.length;
        if(len>1){
            eventList.splice(index,1);
        }else if (this.currentWidget) {
            if(this.currentWidget.props.block) {
                this.currentWidget.props.block['eventTree'] = [this.emptyEvent()];
            } else {
                this.currentWidget.props['eventTree'] = [this.emptyEvent()];
            }
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
                enable: true,
                arrHidden: [false,false,true,true,true]  //逻辑运算符,判断对象,判断值,比较运算符,比较对象
            });
            this.trigger({redrawEventTree: true});
            historyName = "添加事件条件" + this.currentWidget.node.name;
            this.updateHistoryRecord(historyName);
        }
    },
    delEventChildren:function(event,index){
        if(event && event['children']){
            event.children.splice(index,1);
            if(event.children.length === 0) {
                event['children'].push({
                    'cid': _childrenCount++,
                    judgeObjFlag:'判断对象',
                    judgeValFlag:'判断值',
                    compareFlag:'=',
                    compareObjFlag:'比较值/对象',
                    compareValFlag:'比较值',
                    enable: true,
                    arrHidden: [true,true,true,true,true]  //逻辑运算符,判断对象,判断值,比较运算符,比较对象,比较值
                });
                event.zhongHidden = true;
            }
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
            bridge.selectWidget([this.currentWidget.node]);
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
        if(props&&this.currentFunction) {
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
                'cls': this.currentFunction.className,
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
            bridge.selectWidget([this.currentWidget.node]);
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
        if(props&&this.currentVariable) {
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
                'cls': this.currentVariable.className,
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
            bridge.selectWidget([this.currentWidget.node]);
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
        if(props&&this.currentDBItem){
            if(props['name']) {
                this.currentDBItem['name'] = props['name'];
            } else if (props['fields']){
                this.currentDBItem['fields'] = props['fields'];
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
    pasteTreeNode: function (isRelativePosition) {
       if(!checkChildClass(this.currentWidget, copyObj.cls)||this.currentWidget.props.block) {
            return;
       }
       switch (copyObj.cls) {
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
               this.pasteWidget(isRelativePosition);
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
        let targetWidget =this.currentWidget;
        let deleteBody=false;
        if(this.activeBlock) {
            this.activeBlockMode(false);
        }
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
        if(targetWidget.className=='body'){
            let conArr = this.getConditionOption(targetWidget.parent);
            if(targetWidget.parent.props.eventTree) {
                targetWidget.parent.props.eventTree.map((v,i)=>{
                    if(v.conFlag=='beginContact'||v.conFlag=='endContact'){
                        v.conFlag='触发条件';
                        delete v.needFill;
                    }
                    v.conOption = conArr;
                });
            }
            deleteBody=true;
        }
        this.trigger({deleteWidget:true,deleteBody:deleteBody});
    },
    originSizeTreeNode: function(type) {
        if(type === nodeType.widget) {
            this.originSizeWidget();
        }
    },
    originPercentTreeNode: function(type) {
        if(type === nodeType.widget) {
            this.originPercentWidget();
        }
    },
    setAsFullScreenTreeNode: function(type) {
        if(type === nodeType.widget) {
            this.setAsFullScreenWidget();
        }
    },
    changeResource: function(name, link, type) {
        switch (type) {
            case 'image':
                if (name&&link&&this.currentWidget.className==='image'){
                    let oWidth = this.currentWidget.node.width;
                    let oHeight = this.currentWidget.node.height;
                    let temp = this.currentWidget.rootWidget.imageList.push(link) - 1;
                    this.currentWidget.props['link'] =  temp;
                    this.currentWidget.node['link'] =  temp;
                    this.currentWidget.props['name'] = name;
                    this.currentWidget.node['name'] = name;
                    this.currentWidget.node['scaleX'] = 1;
                    this.currentWidget.node['scaleY'] = 1;
                    let originVisible = this.currentWidget.node['visible'];
                    if(originVisible) {
                        this.currentWidget.node['visible'] = false;
                    }
                    bridge.updateSelector(this.currentWidget.node);
                    process.nextTick(() => {
                        let tempW = this.currentWidget.node.width;
                        let tempH = this.currentWidget.node.height;
                        this.currentWidget.node['visible']= originVisible;
                        this.currentWidget.node['scaleX'] = oWidth/tempW;
                        this.currentWidget.node['scaleY'] = oHeight/tempH;
                        this.selectWidget(this.currentWidget);
                    });
                }
                break;
        }
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
        //debugger;
        this.trigger({deletePoint: true});
    },
    initTree: function(data) {
        classList = [];
        bridge.resetClass();
        stageTree = [];
        var idList;
        var tree;

        _keyCount = 1;
        keyMap = [];
        idList = [];

        if (!rootDiv) {
            rootDiv = document.getElementById('canvas-dom');
            rootDiv.addEventListener('dragenter', dragenter, false);
            rootDiv.addEventListener('dragover', dragover, false);
            rootDiv.addEventListener('drop', drop.bind(this), false);
            rootDiv.addEventListener('dblclick', uploadImage.bind(this), false);
            rootDiv.addEventListener('mousedown', function(e) {
                if(!(this.currentFunction|| this.currentVariable || this.currentDBItem)){
                    this.selectWidget(this.currentWidget);
                }
            }.bind(this), false);
        }


         if(rootDiv.childNodes.length>2){
             rootDiv.removeChild(rootDiv.childNodes[rootDiv.childNodes.length-1]);
         }


        if (data['defs']) {
            for (let n in data['defs']) {
                bridge.addClass(n);
                classList.push(n);
                idList = [];
                tree = loadTree(null, data['defs'][n], idList, rootDiv);
                stageTree.push({name: n, tree: tree});
                resolveEventTree(tree, idList);
                resolveBlock(tree, idList);
                resolveDBItemList(tree, idList);
            }
        }

        //起个名字给舞台
        if (data['stage']){
            data['stage']['props']['name'] = 'stage';
        }
        if(data['stage']&&data['stage']['props']['isStage'] === undefined) {
            data['stage']['props']['isStage'] = true;
        }
        tree = loadTree(null, data['stage'], idList, rootDiv);
        resolveEventTree(tree, idList);
        resolveBlock(tree, idList);
        resolveDBItemList(tree, idList);
        stageTree.unshift({name: 'stage', tree: tree});
        rootDiv.lastChild.style.position='relative';
        this.render();

        this.trigger({
            initTree: stageTree
            , classList: classList
        });

        var selected = stageTree[0].tree;
        for (var n in stageTree[0].tree.children) {
            if (stageTree[0].tree.children[n].className == 'page'&&!stageTree[0].tree.children[n].props.block) {
                selected = stageTree[0].tree.children[n];
                break;
            }
        }
        this.selectWidget(selected);
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
              if (n == 0) {
                  result.push(0);
              } else {
                  var c = 0;
                  var r = [];
                  for (var j = 0; j < n; j++) {
                      if (item[j].substr(0, 5) == 'data:') {
                          array.push(item[j]);
                          c++;
                      } else {
                          if (c)
                              r.push(c);
                          c = 0;
                          r.push(item[j]);
                      }
                  }
                  if (r.length == 0)
                      result.push(-n);
                  else {
                      if (c)
                          r.push(c);
                      result.push(r);
                  }
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
        trimTree(stageTree[0].tree); //处理图片链接
        generateId(stageTree[0].tree);//给树中涉及到的对象加上id
        saveTree(data['stage'], stageTree[0].tree);
        let a=1;
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
            //console.log(result);
            if(result['id']){
                callback(result['id'], wname, wdescribe,result['nid']);
            }
            historyRecord = [];
            historyRW = historyRecord.length;
            historyNameList = ["初始化"];
        };
        if (wid) {
            this.ajaxSend(null, 'PUT', 'app/work/' + wid, 'application/octet-stream', data, cb,null,updateProgress);
        } else {
            this.ajaxSend(null, 'POST', 'app/work?name=' + encodeURIComponent(wname) + encodeURIComponent(wdescribe) + "&version=" + globalVersion,
                        'application/octet-stream', data, cb,null,updateProgress);
        }
    },
    setFont: function(font) {
      if (this.currentWidget && this.currentWidget.className == 'bitmaptext') {
        this.updateProperties({'fontFamily':font});
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
    addProps:function (propsObj) {
        this.currentWidget.props[propsObj.name]=propsObj.value;
        this.trigger({selectWidget: this.currentWidget});
    },
    updateConOptions(){
        let conArr = this.getConditionOption();
        this.currentWidget.props.eventTree.map((v,i)=>{
            v.conOption = conArr;
        });
        this.trigger({redrawEventTree: true});
    },
    getConditionOption(widget) {

        //获取触发条件
        let selectWidget =widget?widget:this.currentWidget;
        let className=selectWidget.className;
        let aProps = [];
        let hasContact=false;
        selectWidget.children.map((v,i)=>{
            if(v.className=='body'){
                hasContact=true;
            }
        });
        getPropertyMap(selectWidget, className, 'events').map((item, index) => {
            if(item.name=='beginContact'||item.name=='endContact'){
                if(hasContact){
                    aProps.push(JSON.parse(JSON.stringify(item)));
                }
            }else{
                aProps.push(JSON.parse(JSON.stringify(item)));
            }

        });
        return aProps;
    },
    closeKeyboardMove:function(bool){
        this.trigger({ closeKeyboardMove:{
            val:bool
        }});
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
        if(window.location.hostname==='localhost'&&window.location.port!=='8050'){
            xhr.open(method, "http://test-beta.ih5.cn/editor3b/" + url);
        }else{
            xhr.open(method, url);
        }
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
        //TODO:START-会影响功能，需小颖去修复下这块
        return;
        //TODO:END
        
        let data = {};
        data['stage'] = {};

        saveTree(data['stage'], stageTree[0].tree,true);
        data['stage']['type'] = bridge.getRendererType(stageTree[0].tree.node);
        data['stage']['links'] = stageTree[0].tree.imageList;

        if (stageTree.length > 1) {
            data['defs'] = {};
            for (let i = 1; i < stageTree.length; i++) {
                let name = stageTree[i].name;
                data['defs'][name] = {};
                saveTree(data['defs'][name], stageTree[i].tree,true);
                data['defs'][name]['type'] = bridge.getRendererType(stageTree[i].tree.node);
                data['defs'][name]['links'] = stageTree[i].tree.imageList;
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

        let deepCody = JSON.parse( JSON.stringify(data) );
        historyRecord.push(deepCody);
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
        _keyCount = 1;
        keyMap = [];
        classList = [];
        stageTree = [];
        let tree;
        let data =historyRecord[historyRW-1];

        if (data['defs']) {
            for (let n in data['defs']) {
                bridge.addClass(n);
                classList.push(n);
                tree = loadTree(null, data['defs'][n], null);
                stageTree.push({name: n, tree: tree});
            }
        }
        tree = loadTree(null, data['stage'], null);
        stageTree.unshift({name: 'stage', tree: tree});

        _keyCount=keyMap.length;
        let bool = true;
        let selectOther = (selectdata)=>{
            if(this.currentActiveEventTreeKey) {
                this.selectWidget(selectdata, null, keepType.event);
                this.activeEventTree(this.currentActiveEventTreeKey);
            }
            else if(this.currentFunction){
                this.selectWidget(selectdata, null, keepType.func);
                this.currentFunction = keyMap[this.currentFunction.key];
                this.selectFadeWidget(this.currentFunction, nodeType.func);
            }
            else if(this.currentVariable) {
                this.selectWidget(selectdata, null, keepType.var);
                this.currentVariable = keyMap[this.currentVariable.key];
                this.selectFadeWidget(this.currentVariable, nodeType.var);
            }
            else if(this.currentDBItem) {
                this.selectWidget(selectdata, null, keepType.dbItem);
                this.currentDBItem = keyMap[this.currentDBItem.key];
                this.selectFadeWidget(this.currentDBItem, nodeType.dbItem);
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
    },

    setVersion(v) {
        globalVersion = v;
    },

    addOrEditBlock(block, id) {
        if(this.currentWidget) {
            if(this.currentWidget.props['block']){
                //编辑
                this.currentWidget.props['block']['name'] = block.name;
                this.currentWidget.props['block']['mapping'] = block.mapping;
            } else {
                //新建
                this.currentWidget.props['block'] = {
                    'name': block.name,
                    'mapping': block.mapping
                };
            }
            if(this.currentWidget.props['backUpBlock']) {
                delete this.currentWidget.props['backUpBlock'];
            }
        }

        let saveBlock = {};
        let links = [];
        trimTreeNode(this.currentWidget, links);
        generateId(this.currentWidget);//给对象加上id
        //保存小模块
        saveTree(saveBlock, this.currentWidget, false, false);
        //添加图片列表
        if(links.length>0) {
            saveBlock.props['block']['imageList'] = links;
        }
        //到时还要check id
        let isEdit = false;
        let type = 'create';
        if(id) {
            isEdit = true;
            type = 'update';
        }
        this.trigger({saveBlock : saveBlock, type:type, name: block.name, id: id});
        this.activeBlockMode(false);
        this.trigger({selectWidget:this.currentWidget});
    },
    addBlockToCurrentWidget(data) {
        let block = cpJson(data);
        if(block&&block!==''){
            let idList = [];
            if(block.props.block.imageList) {
                //对图片链接的处理， 添加到当前block数据下
                assignImagesInTreeNode(block, this.currentWidget.rootWidget);
            }
            let widget = loadTree(this.currentWidget, block, idList);
            resolveEventTree(widget, idList);
            resolveBlock(widget, idList);
            resolveDBItemList(widget, idList);
            this.trigger({redrawTree:true});
            this.render();
        }
    },
    removeBlock(block) {
        if(this.currentWidget&&this.currentWidget.props['block']){
            let copyBlock = cpJson(this.currentWidget.props['block']);
            this.currentWidget.props['backUpBlock'] = copyBlock;
            delete this.currentWidget.props['block'];
            this.activeBlockMode(false);
            this.trigger({selectWidget:this.currentWidget});
        }
    },
    activeBlockMode(value){
        if(value) {
            this.activeBlock = true;
            this.trigger({selectWidget:this.currentWidget});
        } else {
            this.activeBlock = false;
        }
        this.trigger({activeBlockMode: {on:value}});
    }
});

export {globalToken, nodeType, nodeAction, varType, funcType, keepType,isCustomizeWidget, dataType, classList, selectableClass}