import bridge from 'bridge';

import {propertyMap, propertyType, backwardTransOptions, forwardTransOptions,
    effectOption, effectOptionsToJudge, easingMoveOptions, widgetFlags} from '../map';

import {originalPropertyMap} from './PropertyMap';

let modeType = {
    flex: 'flex',
    dom: 'dom',
    canvas: 'canvas'
};

let visibleWidgetList = ['image', 'imagelist', 'text',
    'video', 'rect', 'ellipse', 'path',
    'slidetimer', 'bitmaptext', 'qrcode', 'counter',
    'button', 'taparea', 'container', 'input', 'html', 'table'];



let propMapping = {
    'id': {name:'id', showName:'ID', type: propertyType.String, default: ''},

    'originX': {name:'originX', type: propertyType.Hidden, default: 0},
    'originY': {name:'originY', type: propertyType.Hidden, default: 0},

    'width': {name:'width', showName:'W', type: propertyType.Integer, default: 0, group:'position'},
    'height': {name:'height', showName:'H',type: propertyType.Integer, default: 0, group:'position'},
    'scaleType': {name:'scaleType', showName:'适配', type: propertyType.Select, default:'满屏', options:{'居上':2,'居中':3,'居下':4,'满屏':5}, group:'tools'},
    'color': {name:'color', showName:'舞台颜色', type: propertyType.Color2, default: '', group:'tools'},
    'clipped': {name:'clipped', showName:'剪切', type: propertyType.Boolean, default: false, group:'tools'},

    'title': {name:'title', showName:'标题', type: propertyType.String, default: ''},
    'desc': {name:'desc', showName:'描述', type: propertyType.String, default: ''},
    'imgUrl': {name:'imgUrl', showName:'图片地址', type: propertyType.String, default: ''},

    'positionX': {name:'positionX', showName:'X', type: propertyType.Integer, default: 0, group:'position'},
    'positionY': {name:'positionY', showName:'Y', type: propertyType.Integer, default: 0, group:'position'},
    'scaleX': {name:'scaleX', showName:'W',type: propertyType.Float, default: 0, group:'position'},
    'scaleY': {name:'scaleY', showName:'H',showLock:true ,type: propertyType.Float, default: 0, group:'position'},
    'keepRatio': {name:'keepRatio', showName:'等比缩放', type: propertyType.Hidden, default:false},
    'originPos': {name:'originPos', showName:'中心点',type: propertyType.Dropdown,imgClassName:'originPos',default: '中心', options:{'上':[0.5,0],'下':[0.5,1],'左':[0,0.5],'右':[1,0.5],'中心':[0.5,0.5],'左上':[0,0],'左下':[0,1],'右上':[1,0],'右下':[1,1]}, group:'position'},
    'rotation': {name:'rotation', showName:'旋转度', type: propertyType.Integer,imgClassName:'rotation', default: 0, group:'position'},
    'alpha': {name:'alpha', showName:'不透明度', type: propertyType.Percentage, default: 1, group:'display' },
    'initVisible': {name:'initVisible', showName:'初始可见', type: propertyType.Boolean2, default: 1, group:'tools'},

    'fontFamily': {name:'fontFamily', showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体'},
    'fontSize': {name:'fontSize', showName:'字体大小', type: propertyType.Number,group:'tools', default: 26},
    'fontFill': {name:'fontFill', showName:'字体颜色', type: propertyType.Color,group:'tools', default: '#000000'},

    'value': {name:'value', showName:'内容', type: propertyType.Text,  default: ''},

    'precision': {name:'precision', type: propertyType.Integer,group:'tools', default: 0},

    'url': {name:'url', showName:'资源位置', type: propertyType.String, default: ''},

    'link': {name:'link', showName:'资源', type: propertyType.Integer, default:0},

    'delay': {name:'delay', showName:'延时', type: propertyType.Number, default: 0.2},

    'font': {name:'font', showName:'字体',type: propertyType.Select, default:'上传字体',group:'tools'},
    'size': {name:'size', showName:'文字大小',type: propertyType.Integer, default:26,group:'tools'},
    'lineHeight': {name:'lineHeight', showName:'行距', type: propertyType.Integer, default:10,group:'tools'},

    'fillColor': {name:'fillColor', showName:'填充颜色', type: propertyType.Color, default: '', group:'display'},
    'lineColor': {name:'lineColor', showName:'描边颜色', type: propertyType.Color, default: '', group:'display'},
    'lineWidth': {name:'lineWidth', showName:'描边宽度', type: propertyType.Integer, default: 1, group:'display'},

    'radius': {name:'radius', showName:'圆角',  type: propertyType.Integer, default: 0,  group:'tools'},

    'totalTime': {name:'totalTime', showName:'总时长', type: propertyType.Number, group:'tools',default: 10},
    'vertical': {name:'vertical', showName:'滑动方向', type: propertyType.Select,group:'tools', default: '垂直',options:{'垂直':true,'水平':false}},
    'sliderScale': {name:'sliderScale', showName:'滑动比例',type: propertyType.Number,group:'tools', default: 1},
    'loop': {name:'loop', showName:'循环播放', type: propertyType.Boolean, group:'tools', default: false},

    'src': {name:'src', type: propertyType.String, default:''},
    'shapeWidth': {name:'shapeWidth', showName:'原始宽', type: propertyType.Integer, default: 0, group:'position'},
    'shapeHeight': {name:'shapeHeight', showName:'原始高', type: propertyType.Integer, default: 0, group:'position'},

    'path': {name:'path', showName:'路径', type: propertyType.Hidden, default: ''},

    'backwardTransition': {name:'backwardTransition', showName:'前翻效果',  type: propertyType.Select, default:'同上一页',options:backwardTransOptions},
    'forwardTransition': {name:'forwardTransition', showName:'后翻效果', type: propertyType.Select, default:'同上一页',options:forwardTransOptions},

    'bgColor': {name:'bgColor', showName:'背景颜色', type: propertyType.Color, default: ''},

    'autoPlay': {name:'autoPlay', showName:'自动播放', type: propertyType.Boolean, group:'tools', default: false},

    'autoGravity': {name:'autoGravity', showName:'自动计算重力方向', type: propertyType.Boolean,group:'tools', default: false},
    'gravityX': {name:'gravityX', showName:'水平重力', type: propertyType.Number,group:'tools', default: 0},
    'gravityY': {name:'gravityY', showName:'垂直重力', type: propertyType.Number,group:'tools', default: 100},
    'border': {name:'border', showName:'边界宽度', type: propertyType.Integer,group:'tools', default: 100},
    'northWall': {name:'northWall', showName:'北墙', type: propertyType.Boolean,group:'tools', default: true},
    'southWall': {name:'southWall', showName:'南墙',  type: propertyType.Boolean,group:'tools', default: true},
    'westWall': {name:'westWall', showName:'西墙', type: propertyType.Boolean,group:'tools', default: true},
    'eastWall': {name:'eastWall', showName:'东墙',  type: propertyType.Boolean,group:'tools', default: true},

    'mass': {name:'mass', showName:'质量', type: propertyType.Number, default: 0},
    'globalVx': {name:'globalVx', type: propertyType.Number, default: 0},
    'globalVy': {name:'globalVy', type: propertyType.Number, default: 0},
    'velocityX': {name:'velocityX', showName:'水平方向速度',  type: propertyType.Number, default: 0},
    'velocityY': {name:'velocityY', showName:'垂直方向速度',  type: propertyType.Number, default: 0},
    'angularVelocity': {name:'angularVelocity', showName:'初始角速度', type: propertyType.Number, default: 0},
    'fixedX': {name:'fixedX', showName:'固定x坐标', type: propertyType.Boolean, default: false},
    'fixedY': {name:'fixedY', showName:'固定y坐标',type: propertyType.Boolean, default: false},
    'fixedRotation': {name:'fixedRotation', showName:'固定旋转角度', type: propertyType.Boolean, default: false},
    'damping': {name:'damping', showName:'阻尼', type: propertyType.Number, default: 0.1},
    'angularDamping': {name:'angularDamping', showName:'角度阻尼',  type: propertyType.Number, default: 0.1},
    'collisionResponse': {name:'collisionResponse', showName:'碰撞反应',  type: propertyType.Boolean, default: true},
    'isCircle': {name:'isCircle', showName:'圆形边界', type: propertyType.Boolean, default: false},
    'detectionDepth': {name:'detectionDepth', showName:'深度探测', type: propertyType.Integer, default: 2},

    'angle': {name:'angle', showName:'移动方向', type: propertyType.Number, default: 0},
    'duration': {name:'duration', showName:'时长',type: propertyType.Number, default: 2},

    'count': {name:'count', showName:'播放次数', type: propertyType.Integer, default: 1},
    'initHide': {name:'initHide', showName:'初始隐藏', type: propertyType.Boolean, default: false},

    'startTime': {name:'startTime', type: propertyType.Number, default: 0},
    'endTime': {name:'endTime', type: propertyType.Number, default: 0},

    'sockName' : {name:'sockName', showName:'名称',  type: propertyType.String, default: null, readOnly:true },
    'listened': {name:'listened', showName:'是否监听', type: propertyType.Boolean, default: false},

    'row': {name:'row', showName:'行',type: propertyType.Integer, default: 0},
    'column': {name:'column', showName:'列',type: propertyType.Integer, default: 0},

    'rowNum': {name:'rowNum', showName:'行数', default : 0, type:propertyType.Integer , group:"tableP"},
    'header': {name:'header', showName:'列数', default : 0, type:propertyType.Integer , group:"tableP"},
    'showHeader': {name:'showHeader', showName:'表格头部', type: propertyType.Boolean, default: false, group:'tableH'},
    'head': {name:'head', showName:'头部', default : "", type:propertyType.TbColor , group:"tableH", tbHeight:"自动" },
    'headerFontFamily': {name:'headerFontFamily', showName:'头部字体', type: propertyType.Select,group:'tableH', default: '选择字体', tbCome:"tbF" },
    'headerFontSize': {name:'headerFontSize', showName:'图表字体大小', type: propertyType.Number,group:'tableH', default: 24, tbCome:"tbS" },
    'headerFontFill': {name:'headerFontFill', showName:'文字颜色', type: propertyType.Color,group:'tableH', default: '#FFA800'},
    'altColor': {name:'altColor', showName:'隔行颜色', type: propertyType.Color,group:'display', default: ''},

    'margin': {name:'margin', showName:'外间距', type: propertyType.Number, default:0},
    'padding': {name:'padding', showName:'内间距', type: propertyType.Number, default:0},
    //关于flex的请看：https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex
    'flex': {name:'flex', showName:'flex', type: propertyType.String, default:''},
    'alignSelf': {name:'alignSelf', showName:'对齐方式', type: propertyType.String, default:''},
    'alignItems': {name:'alignItems', showName:'对齐对象', type: propertyType.String, default:''},
    'justifyContent': {name:'justifyContent', showName:'排列内容', type: propertyType.Select, default:'flex-start', options:{'行首起始':'flex-start', '行尾开始':'flex-end'}},
    'flexWrap': {name:'flexWrap', showName:'堆叠', type: propertyType.Select, default:'nowrap', options:{'nowrap':'nowrap','wrap':'wrap','wrap-reverse':'wrap-reverse'}},
    'flexDirection': {name:'flexDirection', showName:'布局', type: propertyType.Select, default: '垂直',options:{'水平':'row','反向水平':'row-reverse','垂直':'column', '反向垂直':'column-reverse'}},
    'scaleStage': {name:'scaleStage', showName:'缩放舞台', type: propertyType.String, default: ''},
    'bgImage': {name:'bgImage', showName:'背景图片', type: propertyType.String, default:''},
};

let eventMapping = {
    'init': {name:'init', showName:'初始化'},

    'beginContact': {name:'beginContact', showName:'开始碰撞', needFill:[{showName:'碰撞对象',type:'select', option:[],default:'请选择'}]},
    'endContact': {name:'endContact', showName:'结束碰撞', needFill:[{showName:'碰撞对象',type:'select', option:[],default:'请选择'}]},
    'click': {name:'click', showName:'点击'},
    'touchDown': {name:'touchDown', showName:'手指按下'},
    'touchUp': {name:'touchUp', showName:'手指松开'},
    'swipeLeft': {name:'swipeLeft', showName:'向左滑动'},
    'swipeRight': {name:'swipeRight', showName:'向右滑动'},
    'swipeUp': {name:'swipeUp', showName:'向上滑动'},
    'swipeDown': {name:'swipeDown', showName:'向下滑动'},
    'show': {name:'show', showName:'显示'},
    'hide': {name:'hide', showName:'隐藏'},

    'isMatch': {name:'isMatch', showName:'匹配', needFill:[{showName:'文本',type:'string',default:''}]},
    'isUnMatch': {name:'isUnMatch', showName:'不匹配', needFill:[{showName:'文本',type:'string',default:''}]},
    'Contain': {name:'Contain', showName:'包含文本', needFill:[{showName:'文本',type:'string',default:''}]},
    'change': {name:'change', showName:'内容改变'},

    '==': {name:'==', showName:'等于', needFill:[{showName:'值',type:'number',default:''}]},
    '!=': {name:'!=', showName:'不等于', needFill:[{showName:'值',type:'number',default:''}]},
    '>': {name:'>', showName:'大于', needFill:[{showName:'值',type:'number',default:''}]},
    '<': {name:'<', showName:'小于', needFill:[{showName:'值',type:'number',default:''}]},
    'valRange': {name:'valRange', showName:'数值范围', needFill:[{showName:'最大值',type:'number',default:''}, {showName:'最小值',type:'number',default:''}]},
    'positive': {name:'positive', showName:'为正数'},
    'negative': {name:'negative', showName:'为负数'},
    'odd': {name:'odd', showName:'为奇数'},
    'even': {name:'even', showName:'为偶数'},
    'remainder': {name:'remainder', showName:'余数为', needFill:[{showName:'除数',type:'number',default:''}, {showName:'余数',type:'number',default:''}]},

    'isEmpty': {name:'isEmpty', showName:'为空',needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},
    'isNotEmpty': {name:'isNotEmpty', showName:'不为空', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},
    'isContain': {name:'isContain', showName:'包含文本', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'文本',type:'string',default:''}]},
    'lenEqual': {name:'lenEqual', showName:'长度等于', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'长度值',type:'number',default:''}]},
    'lenUnEqual': {name:'lenUnEqual', showName:'长度不等于', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'长度值',type:'number',default:''}]},
    'lenBigThan': {name:'lenBigThan', showName:'长度大于', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'长度值',type:'number',default:''}]},
    'lenLessThan': {name:'lenLessThan', showName:'长度小于', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'长度值',type:'number',default:''}]},
    'isNum': {name:'isNum', showName:'是数字', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},
    'isNotNum': {name:'isNotNum', showName:'不是数字', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},
    'isLetter': {name:'isLetter', showName:'是字母', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},
    'isNotLetter': {name:'isNotLetter', showName:'不是字母', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'}]},

    'loop': {name:'loop', showName:'重复播放'},
    'stop': {name:'stop', showName:'停止'},
    'tick': {name:'tick', showName:'每一帧'},

    'complete':{name:'complete', showName:'播放完成'},

    'message':{name:'message', showName:'消息', info:'data', needFill:[{showName:'值',type:'var',default:null, actionName:'message'}]}
};

let funcMapping = {
    'getRoot': {name:'getRoot', showName:'获取父级对象'},
    'delete': {name:'delete', showName: '删除对象'},

    'create': {name:'create', showName:'创建对象', property:[
        {'name':'class', 'showName':'类别', 'value':null, 'type':propertyType.Select},
        {'name':'id', 'showName':'ID', 'value':null, 'type':propertyType.String},
        {'name':'bottom', showName:'是否置底', 'value':null, 'type':propertyType.Boolean2}]},
    'gotoPage': {name:'gotoPage', showName:'跳转到页面', property:[
        {'name':'page', 'showName':'页面', 'value':null, 'type':propertyType.Integer}]},
    'gotoPageNum': {name:'gotoPageNum', showName:'跳转到页数', property:[
        {'name':'num', 'showName':'页数', 'value':null, 'type':propertyType.Integer}]},
    'nextPage': {name:'nextPage', showName:'下一页'},
    'prevPage': {name:'prevPage', showName:'上一页'},
    'getTouchX': {name:'getTouchX', showName:'获取点击的X坐标'},
    'getTouchY': {name:'getTouchY', showName:'获取点击的Y坐标'},

    'toggleVisible': {name:'toggleVisible', showName:'交替显示'},
    'hideSibling': {name:'hideSibling', showName:'隐藏同层控件' },
    'show': {name:'show', showName:'显示'},
    'hide': {name:'hide', showName:'隐藏'},

    'changeValue': {name:'changeValue', showName:'赋值', property:[
        {'name':'value', 'showName':'值', 'value':null, 'type':propertyType.FormulaInput}]},
    'add1': {name:'add1', showName:'加1'},
    'minus1': {name:'minus1', showName:'减1'},
    'addN': {name:'addN', showName:'加N', property:[
        {'name':'value', 'showName':'N', 'value':null, 'type':propertyType.Integer}]},
    'minusN': {name:'minusN', showName:'减N', property:[
        {'name':'value', 'showName':'N', 'value':null, 'type':propertyType.Integer}]},
    'getInt': {name:'getInt', showName:'取整'},
    'randomValue': {name:'randomValue', showName:'生成随机数', property:[
        {'name':'minValue', 'showName':'最小值', 'value':null, 'type':propertyType.Integer},
        {'name':'maxValue', 'showName':'最大值', 'value':null, 'type':propertyType.Integer}]},

    'play': {name:'play', showName:'播放'},
    'pause': {name:'pause', showName:'暂停'},

    'replay': {name:'replay', showName:'重新播放'},
    'seek': {name:'seek', showName:'跳至', property:[
        {'name':'time', 'showName':'跳至', 'value':null, 'type':propertyType.Float}]},

    'find': {name:'find', showName:'输出', info:'(option, callback(err, result))', property:[
        {'name':'type', 'showName':'普通', 'value':'normal', 'type':propertyType.Hidden},
        {'name':'conditions', 'showName':'输出条件', 'value':[{field:null,operation:'=',compare:null}], 'type':propertyType.DBCons},
        {'name':'order', 'showName':'排序方式', 'value':{field:null, asc:true}, 'type':propertyType.DBOrder},
        {'name':'lines', 'showName':'输出行数', 'value':{from:null, to:null}, 'type':propertyType.Range},
        {'name':'object', 'showName':'输出至对象', 'value':null, 'type':propertyType.Object},
        {'name':'onlyMe', 'showName':'仅当前用户', 'value':false, 'type':propertyType.Boolean3}]},
    'insert': {name:'insert', showName:'提交', info:'(data, callback(err, result))', property:[
        {'name':'data', 'showName':'选择来源', 'value':null, 'type':propertyType.ObjectSelect}]},
    'update': {name:'update', showName:'更新', info:'(data, callback(err, result))', property:[
        {'name':'data', 'showName':'选择来源', 'value':null, 'type':propertyType.ObjectSelect}]},

    'send': {name:'send', showName:'发送消息', info:'(data)', property:[
        {'name':'value', 'showName':'内容', 'value':null, 'type':propertyType.FormulaInput}]},

    'getResult': {name:'getResult', showName: '获取表格数据', info: '(pageNum)', property: [
        {'name': 'pageNum', 'showName': '页数', 'value': null, 'type': propertyType.Integer}]},
    'nextResult': {name:'nextResult', showName:'获取下一页数据'},
    'prevResult': {name:'prevResult', showName:'获取上一页数据'},
};

let specialCaseElementMapping = (className)=> {
    switch (className) {
        case 'counter':
            return {
                props: {
                    'value': {name:'value', showName:'数值', type: propertyType.Number, default: 0}},
                events: {
                    'change': {name:'change', showName:'数值改变'}}
            };
            break;
        case 'qrcode':
            return {
                props: {
                    'value': {name:'value', showName:'数据', type: propertyType.String, default:''}}
            };
            break;
        case 'oneDArr':
        case 'twoDArr':
            return {
                props: {
                    'title': {name:'title', showName:'变量名', type: propertyType.String, default: ''},
                    'value': {name:'value', showName:'值',type: propertyType.String, default: ''}}
            };
            break;
        case 'bitmaptext':
            return {
                props: {
                    'color': {name:'color', showName:'文字颜色', type: propertyType.Color, default:'',group:'tools'},}
            };
            break;
        case 'html':
            return {
                props: {
                    'width': {name:'width', type: propertyType.Hidden, default: 0, group:'position', readOnly: true},
                    'height': {name:'height', type: propertyType.Hidden, default: 0, group:'position', readOnly: true},}
            };
            break;
        case 'input':
            return {
                props: {
                    'value': {name:'value', showName:'内容', type: propertyType.String, default: ''},
                    'width': {name:'width', type: propertyType.Hidden, default: 0, group:'position', readOnly: true},
                    'height': {name:'height', type: propertyType.Hidden, default: 0, group:'position', readOnly: true},
                    'shapeWidth': {name:'shapeWidth', type: propertyType.Hidden, default: 0, group:'position'},
                    'shapeHeight': {name:'shapeHeight', type: propertyType.Hidden, default: 0, group:'position'},
                    'color': {name:'color', showName:'背景颜色', type: propertyType.Color, default:'#FFFFFF'}},
                events: {
                    'isMatch': {name:'isMatch', showName:'匹配', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'文本',type:'string',default:''}]},
                    'isUnMatch': {name:'isUnMatch', showName:'不匹配', needFill:[{type:'select', option:['change','blur','onDemand'],default:'change'},{showName:'文本',type:'string',default:''}]},}
            };
            break;
        case 'easing':
            return {
                props: {
                    'type': {name:'type', showName:'移动方式',type: propertyType.Select, default: '无', options:easingMoveOptions},
                    'radius': {name:'radius', showName:'圆角', type: propertyType.Number, default: 0},
                    'autoPlay': {name:'autoPlay', showName:'自动播放', type: propertyType.Boolean, default: false}}
            };
            break;
        case 'effect':
            return {
                props: {
                    'type':{name:'type', showName:'动效类型', type: propertyType.Select,  default:'无',optionsToJudge:effectOptionsToJudge,options:effectOption},
                    'duration': {name:'duration', showName:'时长', type: propertyType.Number, default: 1},
                    'autoPlay': {name:'autoPlay', showName:'自动播放', type: propertyType.Boolean, default: false}}
            };
            break;
        case 'track':
            return {
                props: {
                    'type': {name:'type', type: propertyType.String, default: ''}}
            };
            break;
        case 'table':
            return {
                props: {
                    'lineColor': {name:'lineColor', showName:'网格颜色', type: propertyType.Color2,group:'tableW', default: '', tbCome:"tbF"},
                    'lineWidth': {name:'lineWidth', showName:'网格大小', type: propertyType.Integer,group:'tableW', default: '2', tbCome:"tbS"},
                    'fontFamily': {name:'fontFamily', showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体', tbCome:"tbF" },
                    'fontSize': {name:'fontSize', showName:'图表字体大小', type: propertyType.Number,group:'tools', default: 24, tbCome:"tbS" }}
            };
            break;
        case 'tableForSet':
            return {
                props: {
                    'fillColor': {name:'fillColor', showName:'表格底色', type: propertyType.Color,group:'display', default: ''},
                    'lineColor': {name:'lineColor', showName:'网格颜色', type: propertyType.Color2,group:'tableW', default: '', tbCome:"tbF"},
                    'lineWidth': {name:'lineWidth', showName:'网格大小', type: propertyType.Integer,group:'tableW', default: '2', tbCome:"tbS"},
                    'fontFamily': {name:'fontFamily', showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体', tbCome:"tbF" },
                    'fontSize': {name:'fontSize', showName:'字体大小', type: propertyType.Number,group:'tools', default: 24, tbCome:"tbS" }}
            };
        default:
            return {};
            break;
    }
};

let addCustomWidgetProperties = ()=>{
    propertyMap['strVar'] = {
        dom: {
            funcs: dealElementList(['changeValue'], 'strVar', 'funcs'),
            props: dealElementList(['value'], 'strVar', 'props'),
            events: [],
            provides: 0
        }
    };
    propertyMap['strVar'].canvas = propertyMap['strVar'].dom;
    propertyMap['strVar'].flex = propertyMap['strVar'].dom;

    propertyMap['intVar'] = {
        dom: {
            funcs: dealElementList(['changeValue','add1','minus1','addN','minusN','getInt','randomValue'], 'intVar', 'funcs'),
            props: dealElementList(['value'], 'intVar', 'props'),
            events: [],
            provides: 0
        }
    };
    propertyMap['intVar'].canvas = propertyMap['intVar'].dom;
    propertyMap['intVar'].flex = propertyMap['intVar'].dom;

    propertyMap['oneDArr'] = {
        dom: {
            funcs: dealElementList(['getRoot'], 'oneDArr', 'funcs'),
            props: dealElementList(['title', 'value', 'row'], 'oneDArr', 'props'),
            events: [],
            provides: 0
        }
    };
    propertyMap['oneDArr'].canvas = propertyMap['oneDArr'].dom;
    propertyMap['oneDArr'].flex = propertyMap['oneDArr'].dom;

    propertyMap['twoDArr'] = {
        dom: {
            funcs: dealElementList(['getRoot'], 'twoDArr', 'funcs'),
            props: dealElementList(['title', 'value', 'row', 'column'], 'twoDArr', 'props'),
            events: [],
            provides: 0
        }
    };
    propertyMap['twoDArr'].canvas = propertyMap['twoDArr'].dom;
    propertyMap['twoDArr'].flex = propertyMap['twoDArr'].dom;
};

let dealElementList =(aLack, className, type)=>{
    let obj = specialCaseElementMapping(className);
    let list = [];
    let mapping = null;
    switch (type) {
        case 'props':
            mapping = propMapping;
            break;
        case 'events':
            mapping = eventMapping;
            break;
        case 'funcs':
            mapping = funcMapping;
            break;
        default:
            break;
    }
    aLack.map((v)=> {
        let c = null;
        if (mapping && mapping[v]) {
            c = mapping[v];
        }
        if (obj[type] && obj[type][v]) {
            c = obj[type][v];
        }
        if (c) {
            list.push(c);
        } else {
            alert('通用属性和特殊属性中没有:' + v + '通知下程序猿!');
        }
    });
    return list;
};

let modifyPropList = (list, className, type) => {
    //根据不同的class对props进行定制和排序
    //以后还可能对于不用的type进行不同定制（modeType）
    let aLack=[];
    if(className=='container'){
        switch (type){
            case modeType.flex:
                aLack=['positionX','positionY','scaleX','scaleY','keepRatio','rotation','alpha','initVisible'];
                break;
            case modeType.dom:
                aLack=['positionX','positionY','scaleX','scaleY','keepRatio','rotation','alpha','initVisible'];
                break;
            case modeType.canvas:
                aLack=['keepRatio','alpha','initVisible'];
                break;
        }
    }
    else if(className=='graphics'){

    }
    else if(className=='sprite'){

    }
    else if(className=='canvas'){

    }
    else if(className=='root'){

    }
    else if(className=='image'){

    }
    else if(className=='text'){

    }
    else if(className=='rect'){

    }
    else if(className=='ellipse'){

    }
    list = list.concat(dealElementList(aLack, className, 'props'));
    return list;
};

let modifyEventList = (list, className, type) => {
    //根据不同的class对events进行定制和排序
    //以后还可能对于不用的type进行不同定制（modeType）
  //  console.log(list,className,type);
    let aLack=[];
    if(className=='container'){
        switch (type){
            case 'flex':
                aLack=['click','touchDown','touchUp','swipeLeft','swipeRight','swipeUp','swipeDown','show','hide'];
               break;
            case 'dom':
                aLack=['click','touchDown','touchUp','swipeLeft','swipeRight','swipeUp','swipeDown','show','hide'];
                break;
            case 'canvas':
                aLack=['click','touchDown','touchUp','swipeLeft','swipeRight','swipeUp','swipeDown','show','hide'];
                break;
        }
    }
    else if(className=='graphics'){

    }
    else if(className=='sprite'){

    }
    else if(className=='canvas'){

    }
    else if(className=='root'){

    }
    else if(className=='image'){

    }
    else if(className=='text'){

    }
    else if(className=='rect'){

    }
    else if(className=='ellipse'){

    }
    list = list.concat(dealElementList(aLack, className, 'events'));
    return list;
};

let modifyFuncList = (list, className, type) => {
    //以后还可能对于不用的type进行不同定制（modeType）
    if(className === 'text'|| className=== 'counter') {
        let func = dealElementList(['changeValue'], className, 'funcs');
        list.unshift(func[0]);
    }
    if(className==='counter') {
        let temp = dealElementList(['add1','minus1','addN','minusN','getInt','randomValue'], className, 'funcs');
        list = list.concat(temp);
    }
    if(visibleWidgetList.indexOf(className)>=0) {
        let temp = dealElementList(['show','hide'], className, 'funcs');
        list = list.concat(temp);
    }
    return list;
};

let modifyElementList = (list, className, elementType, type)=>{
    switch (elementType) {
        case 'props':
            return modifyPropList(list, className, type);
            break;
        case 'events':
            return modifyEventList(list, className, type);
            break;
        case 'funcs':
            return modifyFuncList(list, className, type);
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

function dealWithElement(el, map) {
    if(map) {
        let m = map[el.name];
        if(m) {
            for(let p in m) {
                el[p] = m[p];
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
                    dealWithElement(p, propMapping);
                    //特殊处理
                    dealWithElement(p, sElMapping.props);
                });
            }
            //添加缺省的属性
            el.props = modifyElementList(el.props, className, 'props', type);

            if(el.events&&el.events.length>0) {
                el.events.forEach((e)=>{
                    //对事件进行处理
                    dealWithElement(e, eventMapping);
                    //特殊处理
                    dealWithElement(e, sElMapping.events);
                });
            }
            //添加缺省的事件
            el.events = modifyElementList(el.events, className, 'events', type);
            if(el.funcs&&el.funcs.length>0) {
                el.funcs.forEach((f)=>{
                    //对动作进行处理
                    dealWithElement(f, funcMapping);
                    //特殊处理
                    dealWithElement(f, sElMapping.funcs);
                });
            }
            //添加附加的动作
            el.funcs = modifyElementList(el.funcs, className, 'funcs', type);
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
