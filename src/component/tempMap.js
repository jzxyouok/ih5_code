import bridge from 'bridge';

import {propertyMap, propertyType, backwardTransOptions, forwardTransOptions,
    effectOption, effectOptionsToJudge, easingMoveOptions, widgetFlags} from '../map';

let propMapping = {
    'id': {showName:'ID', type: propertyType.String, default: ''},

    'originX': {type: propertyType.Hidden},
    'originY': {type: propertyType.Hidden},

    'width': {showName:'W', type: propertyType.Integer, default: 0, group:'position'},
    'height': {showName:'H',type: propertyType.Integer, default: 0, group:'position'},
    'scaleType': {showName:'适配', type: propertyType.Select, default:'满屏', options:{'居上':2,'居中':3,'居下':4,'满屏':5}, group:'tools'},
    'color': {showName:'舞台颜色', type: propertyType.Color2, default: '', group:'tools'},
    'clipped': {showName:'剪切', type: propertyType.Boolean, default: false, group:'tools'},

    'title': {showName:'标题', type: propertyType.String, default: ''},
    'desc': {showName:'描述', type: propertyType.String, default: ''},
    'imgUrl': {showName:'图片地址', type: propertyType.String, default: ''},

    'positionX': {showName:'X', type: propertyType.Integer, default: 0, group:'position'},
    'positionY': {showName:'Y', type: propertyType.Integer, default: 0, group:'position'},
    'scaleX': {showName:'W',type: propertyType.Float, default: 0, group:'position'},
    'scaleY': {showName:'H',showLock:true ,type: propertyType.Float, default: 0, group:'position'},
    'keepRatio': {showName:'等比缩放', type: propertyType.Hidden, default:false},
    'originPos': {showName:'中心点',type: propertyType.Dropdown,imgClassName:'originPos',default: '中心', options:{'上':[0.5,0],'下':[0.5,1],'左':[0,0.5],'右':[1,0.5],'中心':[0.5,0.5],'左上':[0,0],'左下':[0,1],'右上':[1,0],'右下':[1,1]}, group:'position'},
    'rotation': {showName:'旋转度', type: propertyType.Integer,imgClassName:'rotation', default: 0, group:'position'},
    'alpha': {showName:'不透明度', type: propertyType.Percentage, default: 1, group:'display' },
    'initVisible': {showName:'初始可见', type: propertyType.Boolean2, default: 1, group:'tools'},

    'fontFamily': {showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体'},
    'fontSize': {showName:'字体大小', type: propertyType.Number,group:'tools', default: 26},
    'fontFill': {showName:'字体颜色', type: propertyType.Color,group:'tools', default: '#000000'},

    'value': {showName:'内容', type: propertyType.Text,  default: ''},

    'precision': {type: propertyType.Integer,group:'tools', default: 0},

    'url': {showName:'资源位置', type: propertyType.String, default: ''},

    'link': {showName:'资源', type: propertyType.Integer, default:0},

    'delay': {type: propertyType.Number, default: 0.2},

    'font': {showName:'字体',type: propertyType.Select, default:'上传字体',group:'tools'},
    'size': {showName:'文字大小',type: propertyType.Integer, default:26,group:'tools'},
    'lineHeight': {showName:'行距', type: propertyType.Integer, default:10,group:'tools'},

    'fillColor': {showName:'填充颜色', type: propertyType.Color, default: '', group:'display'},
    'lineColor': {showName:'描边颜色', type: propertyType.Color, default: '', group:'display'},
    'lineWidth': {showName:'描边宽度', type: propertyType.Integer, default: 1, group:'display'},

    'radius': {showName:'圆角',  type: propertyType.Integer, default: 0,  group:'tools'},

    'totalTime': {showName:'总时长', type: propertyType.Number, group:'tools',default: 10},
    'vertical': {showName:'滑动方向', type: propertyType.Select,group:'tools', default: '垂直',options:{'垂直':true,'水平':false}},
    'sliderScale': {showName:'滑动比例',type: propertyType.Number,group:'tools', default: 1},
    'loop': {showName:'循环播放', type: propertyType.Boolean, group:'tools', default: false},

    'src': {type: propertyType.String, default:''},
    'shapeWidth': {showName:'原始宽', type: propertyType.Integer, default: 0, group:'position'},
    'shapeHeight': {showName:'原始高', type: propertyType.Integer, default: 0, group:'position'},

    'path': {showName:'路径', type: propertyType.Hidden, default: ''},

    'backwardTransition': {showName:'前翻效果',  type: propertyType.Select, default:'同上一页',options:backwardTransOptions},
    'forwardTransition': {showName:'后翻效果', type: propertyType.Select, default:'同上一页',options:forwardTransOptions},

    'bgColor': {showName:'背景颜色', type: propertyType.Color, default: ''},

    'autoPlay': {showName:'自动播放', type: propertyType.Boolean, group:'tools', default: false},

    'autoGravity': {showName:'自动计算重力方向', type: propertyType.Boolean,group:'tools', default: false},
    'gravityX': {showName:'水平重力', type: propertyType.Number,group:'tools', default: 0},
    'gravityY': {showName:'垂直重力', type: propertyType.Number,group:'tools', default: 100},
    'border': {showName:'边界宽度', type: propertyType.Integer,group:'tools', default: 100},
    'northWall': {showName:'北墙', type: propertyType.Boolean,group:'tools', default: true},
    'southWall': {showName:'南墙',  type: propertyType.Boolean,group:'tools', default: true},
    'westWall': {showName:'西墙', type: propertyType.Boolean,group:'tools', default: true},
    'eastWall': {showName:'东墙',  type: propertyType.Boolean,group:'tools', default: true},

    'mass': {showName:'质量', type: propertyType.Number, default: 0},
    'globalVx': {type: propertyType.Number, default: 0},
    'globalVy': {type: propertyType.Number, default: 0},
    'velocityX': {showName:'水平方向速度',  type: propertyType.Number, default: 0},
    'velocityY': {showName:'垂直方向速度',  type: propertyType.Number, default: 0},
    'angularVelocity': {showName:'初始角速度', type: propertyType.Number, default: 0},
    'fixedX': {showName:'固定x坐标', type: propertyType.Boolean, default: false},
    'fixedY': {showName:'固定y坐标',type: propertyType.Boolean, default: false},
    'fixedRotation': {showName:'固定旋转角度', type: propertyType.Boolean, default: false},
    'damping': {showName:'阻尼', type: propertyType.Number, default: 0.1},
    'angularDamping': {showName:'角度阻尼',  type: propertyType.Number, default: 0.1},
    'collisionResponse': {showName:'碰撞反应',  type: propertyType.Boolean, default: true},
    'isCircle': {showName:'圆形边界', type: propertyType.Boolean, default: false},
    'detectionDepth': {showName:'深度探测', type: propertyType.Integer, default: 2},

    'angle': {showName:'移动方向', type: propertyType.Number, default: 0},
    'duration': {showName:'时长',type: propertyType.Number, default: 2},

    'count': {showName:'播放次数', type: propertyType.Integer, default: 1},
    'initHide': {showName:'初始隐藏', type: propertyType.Boolean, default: false},

    'startTime': {type: propertyType.Number, default: 0},
    'endTime': {type: propertyType.Number, default: 0},

    'sockName' : {showName:'名称',  type: propertyType.String, default: null, readOnly:true },
    'listened': {showName:'是否监听', type: propertyType.Boolean, default: false},

    'row': {showName:'行',type: propertyType.Integer, default: 0},
    'column': {showName:'列',type: propertyType.Integer, default: 0},

    'rowNum': {showName:'行数', default : 0, type:propertyType.Integer , group:"tableP"},
    'header': {showName:'列数', default : 0, type:propertyType.Integer , group:"tableP"},
    'showHeader': {showName:'表格头部', type: propertyType.Boolean, default: false, group:'tableH'},
    'head': {showName:'头部', default : "", type:propertyType.TbColor , group:"tableH", tbHeight:"自动" },
    'headerFontFamily': {showName:'头部字体', type: propertyType.Select,group:'tableH', default: '选择字体', tbCome:"tbF" },
    'headerFontSize': {showName:'图表字体大小', type: propertyType.Number,group:'tableH', default: 24, tbCome:"tbS" },
    'headerFontFill': {showName:'文字颜色', type: propertyType.Color,group:'tableH', default: '#FFA800'},
    'altColor': {showName:'隔行颜色', type: propertyType.Color,group:'display', default: ''},
};

let eventMapping = {
    'init': {showName:'初始化'},

    'beginContact': {showName:'开始碰撞', needFill:[{showName:'碰撞对象',type:'select', option:[],default:'请选择'}]},
    'endContact': {showName:'结束碰撞', needFill:[{showName:'碰撞对象',type:'select', option:[],default:'请选择'}]},
    'click': {showName:'点击'},
    'touchDown': {showName:'手指按下'},
    'touchUp': {showName:'手指松开'},
    'swipeLeft': {showName:'向左滑动'},
    'swipeRight': {showName:'向右滑动'},
    'swipeUp': {showName:'向上滑动'},
    'swipeDown': {showName:'向下滑动'},
    'show': {showName:'显示'},
    'hide': {showName:'隐藏'},

    'isMatch': {showName:'匹配', needFill:[{showName:'文本',type:'string',default:''}]},
    'isUnMatch': {showName:'不匹配', needFill:[{showName:'文本',type:'string',default:''}]},
    'Contain': {showName:'包含文本', needFill:[{showName:'文本',type:'string',default:''}]},
    'change': {showName:'内容改变'},

    '==': {showName:'等于', needFill:[{showName:'值',type:'number',default:''}]},
    '!=': {showName:'不等于', needFill:[{showName:'值',type:'number',default:''}]},
    '>': {showName:'大于', needFill:[{showName:'值',type:'number',default:''}]},
    '<': {showName:'小于', needFill:[{showName:'值',type:'number',default:''}]},
    'valRange': {showName:'数值范围', needFill:[{showName:'最大值',type:'number',default:''}, {showName:'最小值',type:'number',default:''}]},
    'positive': {showName:'为正数'},
    'negative': {showName:'为负数'},
    'odd': {showName:'为奇数'},
    'even': {showName:'为偶数'},
    'remainder': {showName:'余数为', needFill:[{showName:'除数',type:'number',default:''}, {showName:'余数',type:'number',default:''}]},

    'isEmpty': {showName:'为空',needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},
    'isNotEmpty': {showName:'不为空', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},
    'isContain': {showName:'包含文本', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'文本',type:'string',default:''}]},
    'lenEqual': {showName:'长度等于', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'长度值',type:'number',default:''}]},
    'lenUnEqual': {showName:'长度不等于', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'长度值',type:'number',default:''}]},
    'lenBigThan': {showName:'长度大于', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'长度值',type:'number',default:''}]},
    'lenLessThan': {showName:'长度小于', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'长度值',type:'number',default:''}]},
    'isNum': {showName:'是数字', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},
    'isNotNum': {showName:'不是数字', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},
    'isLetter': {showName:'是字母', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},
    'isNotLetter': {showName:'不是字母', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},

    'loop': {showName:'重复播放'},
    'stop': {showName:'停止'},
    'tick': {showName:'每一帧'},

    'complete':{showName:'播放完成'},

    'message':{showName:'消息', info:'data', needFill:[{showName:'值',type:'var',default:null, actionName:'message'}]}
};

let funcMapping = {
    'getRoot': {showName:'获取父级对象'},
    'delete': {showName: '删除对象'},

    'create': {showName:'创建对象', property:[
        {'name':'class', showName:'类别', 'value':null, 'type':propertyType.Select},
        {'name':'id', showName:'ID', 'value':null, 'type':propertyType.String},
        {'name':'bottom', showName:'是否置底', 'value':null, 'type':propertyType.Boolean2}]},
    'gotoPage': {showName:'跳转到页面', property:[
        {'name':'page', showName:'页面', 'value':null, 'type':propertyType.Integer}]},
    'gotoPageNum': {showName:'跳转到页数', property:[
        {'name':'num', showName:'页数', 'value':null, 'type':propertyType.Integer}]},
    'nextPage': {showName:'下一页'},
    'prevPage': {showName:'上一页'},
    'getTouchX': {showName:'获取点击的X坐标'},
    'getTouchY': {showName:'获取点击的Y坐标'},

    'toggleVisible': {showName:'交替显示'},
    'hideSibling': {showName:'隐藏同层控件' },
    'show': {showName:'显示'},
    'hide': {showName:'隐藏'},

    'changeValue': {showName:'赋值', property:[
        {'name':'value', showName:'值', 'value':null, 'type':propertyType.FormulaInput}]},
    'add1': {showName:'加1'},
    'minus1': {showName:'减1'},
    'addN': {showName:'加N', property:[
        {'name':'value', showName:'N', 'value':null, 'type':propertyType.Integer}]},
    'minusN': {showName:'减N', property:[
        {'name':'value', showName:'N', 'value':null, 'type':propertyType.Integer}]},
    'getInt': {showName:'取整'},
    'randomValue': {showName:'生成随机数', property:[
        {'name':'minValue', showName:'最小值', 'value':null, 'type':propertyType.Integer},
        {'name':'maxValue', showName:'最大值', 'value':null, 'type':propertyType.Integer}]},

    'play': {showName:'播放'},
    'pause': {showName:'暂停'},

    'replay': {showName:'重新播放'},
    'seek': {showName:'跳至', property:[
        {'name':'time', showName:'跳至', 'value':null, 'type':propertyType.Float}]},

    'find': {showName:'输出', info:'(option, callback(err, result))', property:[
        {'name':'type', showName:'普通', 'value':'normal', 'type':propertyType.Hidden},
        {'name':'conditions', showName:'输出条件', 'value':[{field:null,operation:'=',compare:null}], 'type':propertyType.DBCons},
        {'name':'order', showName:'排序方式', 'value':{field:null, asc:true}, 'type':propertyType.DBOrder},
        {'name':'lines', showName:'输出行数', 'value':{from:null, to:null}, 'type':propertyType.Range},
        {'name':'object', showName:'输出至对象', 'value':null, 'type':propertyType.Object},
        {'name':'onlyMe', showName:'仅当前用户', 'value':false, 'type':propertyType.Boolean3}]},
    'insert': {showName:'提交', info:'(data, callback(err, result))', property:[
        {'name':'data', showName:'选择来源', 'value':null, 'type':propertyType.ObjectSelect}]},
    'update': {showName:'更新', info:'(data, callback(err, result))', property:[
        {'name':'data', showName:'选择来源', 'value':null, 'type':propertyType.ObjectSelect}]},
    'callback(err, result)': {showName:'回调函数', 'value':null, 'type':propertyType.Hidden},

    'send': {showName:'发送消息', info:'(data)', property:[
        {'name':'value', showName:'内容', 'value':null, 'type':propertyType.FormulaInput}]},

    'getResult': {showName: '获取表格数据', info: '(pageNum)', property: [
        {'name': 'pageNum', showName: '页数', 'value': null, 'type': propertyType.Integer}]},
    'nextResult': {showName:'获取下一页数据'},
    'prevResult': {showName:'获取上一页数据'},
};

let specialCaseElementMapping = (className)=> {
    switch (className) {
        case 'counter':
            return {
                props: {
                    'value': {showName:'数值', type: propertyType.Number, default: 0}},
                events: {
                    'change': {showName:'数值改变'}}
            };
            break;
        case 'qrcode':
            return {
                props: {
                    'value': {showName:'数据', type: propertyType.String, default:''}}
            };
            break;
        case 'oneDArr':
        case 'twoDArr':
            return {
                props: {
                    'title': {showName:'变量名', type: propertyType.String, default: ''},
                    'value': {showName:'值',type: propertyType.String, default: ''}}
            };
            break;
        case 'bitmaptext':
            return {
                props: {
                    'color': {showName:'文字颜色', type: propertyType.Color, default:'',group:'tools'},}
            };
            break;
        case 'html':
            return {
                props: {
                    'width': {type: propertyType.Hidden, default: 0, group:'position', readOnly: true},
                    'height': {type: propertyType.Hidden, default: 0, group:'position', readOnly: true},}
            };
            break;
        case 'input':
            return {
                props: {
                    'value': {showName:'内容', type: propertyType.String, default: ''},
                    'width': {type: propertyType.Hidden, default: 0, group:'position', readOnly: true},
                    'height': {type: propertyType.Hidden, default: 0, group:'position', readOnly: true},
                    'shapeWidth': {type: propertyType.Hidden, default: 0, group:'position'},
                    'shapeHeight': {type: propertyType.Hidden, default: 0, group:'position'},
                    'color': {showName:'背景颜色', type: propertyType.Color, default:'#FFFFFF'}},
                events: {
                    'isMatch': {showName:'匹配', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'文本',type:'string',default:''}]},
                    'isUnMatch': {showName:'不匹配', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'文本',type:'string',default:''}]},}
            };
            break;
        case 'easing':
            return {
                props: {
                    'type': {showName:'移动方式',type: propertyType.Select, default: '无', options:easingMoveOptions},
                    'radius': {showName:'圆角', type: propertyType.Number, default: 0},
                    'autoPlay': {showName:'自动播放', type: propertyType.Boolean, default: false}}
            };
            break;
        case 'effect':
            return {
                props: {
                    'type':{showName:'动效类型', type: propertyType.Select,  default:'无',optionsToJudge:effectOptionsToJudge,options:effectOption},
                    'duration': {showName:'时长', type: propertyType.Number, default: 1},
                    'autoPlay': {showName:'自动播放', type: propertyType.Boolean, default: false}}
            };
            break;
        case 'track':
            return {
                props: {
                    'type': {type: propertyType.String, default: ''}}
            };
            break;
        case 'table':
            return {
                props: {
                    'lineColor': {showName:'网格颜色', type: propertyType.Color2,group:'tableW', default: '', tbCome:"tbF"},
                    'lineWidth': {showName:'网格大小', type: propertyType.Integer,group:'tableW', default: '2', tbCome:"tbS"},
                    'fontFamily': {showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体', tbCome:"tbF" },
                    'fontSize': {showName:'图表字体大小', type: propertyType.Number,group:'tools', default: 24, tbCome:"tbS" }}
            };
            break;
        case 'tableForSet':
            return {
                props: {
                    'fillColor': {showName:'表格底色', type: propertyType.Color,group:'display', default: ''},
                    'lineColor': {showName:'网格颜色', type: propertyType.Color2,group:'tableW', default: '', tbCome:"tbF"},
                    'lineWidth': {showName:'网格大小', type: propertyType.Integer,group:'tableW', default: '2', tbCome:"tbS"},
                    'fontFamily': {showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体', tbCome:"tbF" },
                    'fontSize': {showName:'字体大小', type: propertyType.Number,group:'tools', default: 24, tbCome:"tbS" }}
            };
        default:
            return {};
            break;
    }
};

let addCustomWidgetProperties = ()=>{
    propertyMap['strVar'] = {
        dom: {
            funcs: [{name: 'changeValue', showName:'赋值', info:'(value)', property:[
                {'name':'value', showName:'值', 'value':null, 'type':propertyType.FormulaInput}]}],
            props: [{name: 'value',showName:'内容', type: propertyType.Text,  default: ''}],
            events: [],
            provides: 0
        }
    };
    propertyMap['strVar'].canvas = propertyMap['strVar'].dom;
    propertyMap['strVar'].flex = propertyMap['strVar'].dom;

    propertyMap['intVar'] = {
        dom: {
            funcs: [{ name: 'changeValue', showName:'赋值', info:'(value)', property:[
                        {'name':'value', showName:'值', 'value':null, 'type':propertyType.FormulaInput}]},
                    { name: 'add1', showName:'加1'},
                    { name: 'minus1', showName:'减1'},
                    { name: 'addN', showName:'加N', property:[
                        {'name':'value', showName:'N', 'value':null, 'type':propertyType.Integer}]},
                    { name: 'minusN', showName:'减N', property:[
                        {'name':'value', showName:'N', 'value':null, 'type':propertyType.Integer}]},
                    { name: 'getInt', showName:'取整'},
                    { name: 'randomValue', showName:'生成随机数', property:[
                        {'name':'minValue', showName:'最小值', 'value':null, 'type':propertyType.Integer},
                        {'name':'maxValue', showName:'最大值', 'value':null, 'type':propertyType.Integer}]},],
            props: [{name: 'value',showName:'内容', type: propertyType.Text,  default: ''}],
            events: [],
            provides: 0
        }
    };
    propertyMap['intVar'].canvas = propertyMap['intVar'].dom;
    propertyMap['intVar'].flex = propertyMap['intVar'].dom;

    propertyMap['oneDArr'] = {
        dom: {
            funcs: [{ name: 'getRoot', showName:'获取父级对象'}],
            props: [{ name: 'title',showName:'变量名', type: propertyType.String, default: ''},
                    { name: 'value', showName:'值',type: propertyType.String, default: ''},
                    { name: 'row', showName:'行',type: propertyType.Integer, default: 0},],
            events: [],
            provides: 0
        }
    };
    propertyMap['oneDArr'].canvas = propertyMap['oneDArr'].dom;
    propertyMap['oneDArr'].flex = propertyMap['oneDArr'].dom;

    propertyMap['twoDArr'] = {
        dom: {
            funcs: [{ name: 'getRoot', showName:'获取父级对象'}],
            props: [{ name: 'title',showName:'变量名', type: propertyType.String, default: ''},
                { name: 'value', showName:'值',type: propertyType.String, default: ''},
                { name: 'row', showName:'行',type: propertyType.Integer, default: 0},
                { name: 'column', showName:'列',type: propertyType.Integer, default: 0}],
            events: [],
            provides: 0
        }
    };
    propertyMap['twoDArr'].canvas = propertyMap['twoDArr'].dom;
    propertyMap['twoDArr'].flex = propertyMap['twoDArr'].dom;
};

let addPropsByClassName = (list, className) => {
    return list;
};

let addEventsByClassName = (list, className) => {
    return list;
};

let addFuncsByClassName = (list, className) => {
    if(className === 'text'|| className=== 'counter' || className === 'strVar' || className === 'intVar') {
        let func = { name: 'changeValue', showName:'赋值', info:'(value)', property:[
                {'name':'value', showName:'值', 'value':null, 'type':propertyType.FormulaInput}]};
        list.unshift(func);
    }
    if(className==='counter') {
        let temp = [
            { name: 'add1', showName:'加1'},
            { name: 'minus1', showName:'减1'},
            { name: 'addN', showName:'加N', property:[
                {'name':'value', showName:'N', 'value':null, 'type':propertyType.Integer}]},
            { name: 'minusN', showName:'减N', property:[
                {'name':'value', showName:'N', 'value':null, 'type':propertyType.Integer}]},
            { name: 'getInt', showName:'取整'},
            { name: 'randomValue', showName:'生成随机数', property:[
                {'name':'minValue', showName:'最小值', 'value':null, 'type':propertyType.Integer},
                {'name':'maxValue', showName:'最大值', 'value':null, 'type':propertyType.Integer}]}];
        list = list.concat(temp);
    }
    return list;
};

let addedElementList = (list, className, type)=>{
    switch (type) {
        case 'props':
            return addPropsByClassName(list, className);
            break;
        case 'events':
            return addEventsByClassName(list, className);
            break;
        case 'funcs':
            return addFuncsByClassName(list, className);
            break;
    }
};

let sortElementByClassName = (className, type, element)=>{
    //sort list by order
    let compare = (property)=>{
        return function(a,b){
            var value1 = a[property];
            var value2 = b[property];
            return value1 - value2;
        };
    };
    console.log(element[type].sort(compare('order')));
    switch (type) {
        case 'props':
            break;
        case 'events':
            break;
        case 'funcs':
            break;
    }
};

function dealWithElement(prop, map, type) {
    switch (type) {
        case 'props':
            dealWithProperties(prop, map);
            break;
        case 'events':
            dealWithEvents(prop, map);
            break;
        case 'funcs':
            dealWithFuncs(prop, map);
            break;
    }
}

function dealWithProperties(prop, map){
    if(map) {
        let m = map[prop.name];
        if(m) {
            for(let p in m) {
                prop[p] = m[p];
            }
        }
    }
}

function dealWithEvents(event, map){
    if(map) {
        let e = map[event.name];
        if(e) {
            for(let p in e) {
                event[p] = e[p];
            }
        }
    }
}

function dealWithFuncs(func, map){
    if(map){
        let f = map[func.name];
        if(f) {
            for(let p in f) {
                func[p] = f[p];
            }
        }
    }
}

let dealWithOriginalPropertyMap = ()=>{
    for (let className in propertyMap) {
        let clTypes = propertyMap[className];
        let sElMapping = specialCaseElementMapping(className);
        for(let type in clTypes) {
            let el = clTypes[type];
            if(el.props&&el.props.length>0) {
                el.props.forEach((p)=>{
                    //对属性处理
                    dealWithElement(p, propMapping, 'props');
                    //特殊处理
                    dealWithElement(p, sElMapping.props, 'props');
                });
            }
            //添加缺省的属性
            el.props = addedElementList(el.props, className, 'props');
            if(el.events&&el.events.length>0) {
                el.events.forEach((e)=>{
                    //对事件进行处理
                    dealWithElement(e, eventMapping, 'events');
                    //特殊处理
                    dealWithElement(e, sElMapping.events, 'events');
                });
            }
            //添加缺省的事件
            el.events = addedElementList(el.events, className, 'events');
            if(el.funcs&&el.funcs.length>0) {
                el.funcs.forEach((f)=>{
                    //对动作进行处理
                    dealWithElement(f, funcMapping, 'funcs');
                    //特殊处理
                    dealWithElement(f, sElMapping.funcs, 'funcs');
                });
            }
            //添加附加的动作
            el.funcs = addedElementList(el.funcs, className, 'funcs');
        }
    }
};

let getPropertyMap = (widget, className, type)=> {
    if(!widget) {
        return [];
    }
    let cl = className;
    if(className === 'data') {
        if(widget.props.type === 'oneDArr') {
            cl = 'oneDArr';
        } else if (widget.props.type === 'twoDArr') {
            cl = 'twoDArr';
        }
    } else if(className === 'var') {
        if(widget.type === 'number') {
            cl = 'intVar';
        } else if (widget.type === 'string') {
            cl = 'strVar';
        }
    } else if(className.substr(0,1) === '_') {
        cl = 'class';
    }
    if(!propertyMap[cl]) {
        return [];
    }
    if(className === 'intVar' || className === 'strVar' ||
        className === 'var' || className === 'func' || className === 'dbItem') {
        switch (type) {
            case 'props':
                return bridge.getMap(widget.widget.node, propertyMap[cl]).props;
                break;
            case 'events':
                return bridge.getMap(widget.widget.node, propertyMap[cl]).events;
                break;
            case 'funcs':
                return bridge.getMap(widget.widget.node, propertyMap[cl]).funcs;
                break;
        }
    } else {
        switch (type) {
            case 'props':
                return bridge.getMap(widget.node, propertyMap[cl]).props;
                break;
            case 'events':
                return bridge.getMap(widget.node, propertyMap[cl]).events;
                break;
            case 'funcs':
                return bridge.getMap(widget.node, propertyMap[cl]).funcs;
                break;
        }
    }
};

let checkEventClass = (selected) => {
    if(selected.className === 'func' ||
        selected.className === 'var' ||
        selected.className === 'dbItem'||
        (selected.className === 'data'&&(selected.props.type==='oneDArr'||selected.props.type==='twoDArr'))){
        return false;
    } else {
        return true;
    }
};

let checkLockClass = (selected) => {
    if(selected.className === 'root'||
        selected.className === 'func'||
        selected.className === 'var' ||
        selected.className === 'dbItem'||
        (selected.className === 'data'&&(selected.props.type==='oneDArr'||selected.props.type==='twoDArr'))){
        return false;
    } else {
        return true;
    }
};

let checkNotInDomMode = (selected, className) => {
    //TODO
    return false;
};

let checkNotInCanvasMode = (selected, className) => {
    //TODO
    return false;
};

let checkIsClassType = (className) => {
    if(className === 'widget'|| className === 'data' ||
        className === 'root' || className === 'sprite' ||
        className === 'box' || className === 'textBox' ||
        className === 'graphics' || className === 'class' ||
        className === 'strVar' || className === 'intVar' ||
        className === 'oneDArr' || className === 'twoDArr') {
        return false;
    } else {
        return true;
    }
};

let checkChildClass = (selected, className) => {
    // 对函数,变量,自定义函数等的处理
    if(className ==='dbItem'){
        if(selected.className === 'db'){
            return true;
        } else {
            return false;
        }
    }
    if(className === 'func'){
        if(selected.className === 'func' ||
            selected.className === 'var' ||
            selected.className === 'dbItem'||
            (selected.className === 'data'&&(selected.props.type==='oneDArr'||selected.props.type==='twoDArr'))) {
            return false;
        } else {
            return true;
        }
    }
    if(className === 'var') {
        if( selected.className === 'counter' ||
            selected.className === 'func' ||
            selected.className === 'var' ||
            selected.className === 'dbItem' ||
            (selected.className === 'data'&&(selected.props.type==='oneDArr'||selected.props.type==='twoDArr'))){
            return false;
        } else {
            return true;
        }
    }
    if (selected.className === 'func' ||
        selected.className === 'var' ||
        selected.className === 'dbItem' ||
        selected.className.substr(0,1)==='_' ||    //自定义class
        (selected.className === 'data'&&(selected.props.type==='oneDArr'||selected.props.type==='twoDArr'))) {
        return false;
    }
    //TODO
    return true;
};

//对propertyMap的属性，事件，动作进行处理
dealWithOriginalPropertyMap();
//添加伪对象的属性
addCustomWidgetProperties();

export {propertyMap, propertyType, getPropertyMap, checkChildClass, checkEventClass, checkLockClass, checkNotInDomMode, checkNotInCanvasMode, checkIsClassType};
