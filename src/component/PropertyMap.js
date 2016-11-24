import bridge from 'bridge';

import {propertyMap, propertyType, backwardTransOptions, forwardTransOptions,
    effectOption, effectOptionsToJudge, easingMoveOptions, widgetFlags} from '../map';

var FLAG_MASK = widgetFlags.Display | widgetFlags.Container | widgetFlags.Page;

let modeType = {
    flex: 'flex',
    dom: 'dom',
    canvas: 'canvas'
};

let visibleWidgetList = ['image', 'imagelist', 'text',
    'video', 'rect', 'ellipse', 'path',
    'slidetimer', 'bitmaptext', 'qrcode', 'counter',
    'button', 'taparea', 'container', 'input', 'html', 'table'];

let isInCLList = (className, classNameList)=>{
    //检查是否在所需的classnamelist内
    return classNameList.indexOf(className)>=0;
};
/**
 * luozheao,20161122
 * 功能:
 * 1 用于PropertyView属性面板中模块的排序,数组中排最前面则显示在属性面板的最上面
 * 2 需要什么模块分组,则在数组中添加
 * 用在
 * */
let sortGroupArr=['basic', 'position', 'display', 'tools','tools2','tools2.1','tools2.2','tools2.3','tools3','tools3.1', 'dArr','buttonArea'];
/**
* luozheao,20161115
* 备注:添加了order字段,用于给模块内部的组件排序
* 按数字大小,从上到下排序,没有order属性,则排最后面
* */
let propMapping = {
    'id': {name:'id', showName:'ID', type: propertyType.String, default: '',order:0},

    'originX': {name:'originX', type: propertyType.Hidden, default: 0},
    'originY': {name:'originY', type: propertyType.Hidden, default: 0},

    'width': {name:'width', showName:'W', type: propertyType.Integer, default: 0, group:'position'},
    'height': {name:'height', showName:'H',type: propertyType.Integer, default: 0, group:'position'},
    'scaleType': {name:'scaleType', showName:'适配', type: propertyType.Select, default:'满屏', options:{'居上':2,'居中':3,'居下':4,'满屏':5}, group:'tools',order:1},
    'swipeType': {name:'swipeType', showName:'滑动翻页', type: propertyType.Select, default:'4', options:{'无':0,'上':4,'下':3,'左':2,'右':1}},

    'clipped': {name:'clipped', showName:'剪切', type: propertyType.Boolean, default: false, group:'tools',order:3},

    'title': {name:'title', showName:'标题', type: propertyType.String, default: ''},
    'desc': {name:'desc', showName:'描述', type: propertyType.String, default: ''},
    'imgUrl': {name:'imgUrl', showName:'图片地址', type: propertyType.String, default: ''},

    'positionX': {name:'positionX', showName:'X', type: propertyType.Integer, default: 0, group:'position',order:1},
    'positionY': {name:'positionY', showName:'Y', type: propertyType.Integer, default: 0, group:'position',order:2},
    'scaleX': {name:'scaleX', showName:'W',type: propertyType.Float, default: 0, group:'position',order:3},
    'scaleY': {name:'scaleY', showName:'H',showLock:true ,type: propertyType.Float, default: 0, group:'position',order:4},
    'keepRatio': {name:'keepRatio', showName:'等比缩放', type: propertyType.Hidden, default:false},
    'originPos': {name:'originPos', showName:'中心点',type: propertyType.Dropdown,imgClassName:'originPos',default: '中心', options:{'上':[0.5,0],'下':[0.5,1],'左':[0,0.5],'右':[1,0.5],'中心':[0.5,0.5],'左上':[0,0],'左下':[0,1],'右上':[1,0],'右下':[1,1]}, group:'position',order:5},
    'rotation': {name:'rotation', showName:'旋转度', type: propertyType.Integer,imgClassName:'rotation', default: 0, group:'position',order:6},
    'alpha': {name:'alpha', showName:'不透明度', type: propertyType.Percentage, default: 1, group:'display',order:1 },
    'backgroundColor': {name:'backgroundColor', showName:'背景颜色', type: propertyType.Color2, default: '', group:'tools',order:2},
    'bgColor': {name:'bgColor', showName:'背景颜色', type: propertyType.Color, default: ''},
    'bgImage': {name:'bgImage', showName:'背景图片', type: propertyType.Button2,ButtonName:'上传图片', default:'',group:'display',order:2},

    'initVisible': {name:'initVisible', showName:'初始可见', type: propertyType.Boolean2, default: 1, group:'tools'},

    'fontSize': {name:'fontSize', showName:'字体大小', type: propertyType.Number,group:'tools', default: 26},
    'fontFamily': {name:'fontFamily', showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体'},
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

    'vertical': {name:'vertical', showName:'滑动方向', type: propertyType.Select,group:'tools', default: '垂直',options:{'垂直':true,'水平':false}},
    'sliderScale': {name:'sliderScale', showName:'滑动比例',type: propertyType.Number,group:'tools', default: 1},

    'totalTime': {name:'totalTime', showName:'总时长', type: propertyType.Number, group:'tools',default: 0,order:1},
    'startTime': {name:'startTime',showName:'开始时间', type: propertyType.Number,group:'tools', default: 0,order:3},
    'endTime': {name:'endTime', showName:'结束时间',type: propertyType.Number,group:'tools', default: 0,order:4},
    'autoPlay': {name:'autoPlay', showName:'自动播放', type: propertyType.Boolean, group:'tools', default: false},
    'loop': {name:'loop', showName:'循环播放', type: propertyType.Boolean, group:'tools', default: false},

    'src': {name:'src', type: propertyType.String, default:''},
    'shapeWidth': {name:'shapeWidth', showName:'原始宽', type: propertyType.Integer, default: 0, group:'position'},
    'shapeHeight': {name:'shapeHeight', showName:'原始高', type: propertyType.Integer, default: 0, group:'position'},

    'path': {name:'path', showName:'路径', type: propertyType.Hidden, default: ''},

    'backwardTransition': {name:'backwardTransition', showName:'前翻效果',  type: propertyType.Select, default:'同上一页',options:backwardTransOptions,order:1},
    'forwardTransition': {name:'forwardTransition', showName:'后翻效果', type: propertyType.Select, default:'同上一页',options:forwardTransOptions,order:2},

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

    'sockName' : {name:'sockName', showName:'名称',  type: propertyType.String, default: null, readOnly:true },
    'listened': {name:'listened', showName:'是否监听', type: propertyType.Boolean, default: false},

    'row': {name:'row', showName:'行',type: propertyType.Integer, default: 0, group:"dArr"},
    'column': {name:'column', showName:'列',type: propertyType.Integer, default: 0, group:"dArr"},
    'dbSource': { name: 'dbSource', showName:'数据来源', type: propertyType.dbSelect, default: null},

    'rowNum': {name:'rowNum', showName:'行数', default : 0, type:propertyType.Integer , group:"tableP"},
    'header': {name:'header', showName:'列数', default : 0, type:propertyType.Integer , group:"tableP"},
    'showHeader': {name:'showHeader', showName:'表格头部', type: propertyType.Boolean, default: false, group:'tableH'},
    'head': {name:'head', showName:'头部', default : "", type:propertyType.TbColor , group:"tableH", tbHeight:"自动" },
    'headerFontFamily': {name:'headerFontFamily', showName:'头部字体', type: propertyType.Select,group:'tableH', default: '选择字体', tbCome:"tbF" },
    'headerFontSize': {name:'headerFontSize', showName:'图表字体大小', type: propertyType.Number,group:'tableH', default: 24, tbCome:"tbS" },
    'headerFontFill': {name:'headerFontFill', showName:'文字颜色', type: propertyType.Color,group:'tableH', default: '#FFA800'},
    'altColor': {name:'altColor', showName:'隔行颜色', type: propertyType.Color,group:'display', default: ''},


    //关于flex的请看：https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex


    'scaleStage': {name:'scaleStage', showName:'播放模式', type: propertyType.Select,default:'false', options:{'PC':'false','手机':'true'}},

    'margin': {name:'margin', showName:'外间距', type: propertyType.Hidden, default:'',group:'tools2'},
    'marginUp': {name:'marginUp', showName:'边距上', type: propertyType.Number, default:0,group:'tools2.1'},
    'marginDown': {name:'marginDown', showName:'边距下', type: propertyType.Number, default:0,group:'tools2.1'},
    'marginLeft': {name:'marginLeft', showName:'边距左', type: propertyType.Number, default:0,group:'tools2.1'},
    'marginRight': {name:'marginRight', showName:'边距右', type: propertyType.Number, default:0,group:'tools2.1'},

    'maxWidth': {name:'maxWidth', showName:'最大宽', type: propertyType.Number, default:0,group:'tools2.2'},
    'minWidth': {name:'minWidth', showName:'最小宽', type: propertyType.Number, default:0,group:'tools2.2'},
    'maxHeight': {name:'maxHeight', showName:'最大高', type: propertyType.Number, default:0,group:'tools2.2'},
    'minHeight': {name:'minHeight', showName:'最小高', type: propertyType.Number, default:0,group:'tools2.2'},
    'alignSelf': {name:'alignSelf', showName:'副轴对齐', type: propertyType.Select, default:'auto',options:{'自动':'auto','靠前':'flex-start','靠后':'flex-end','居中':'center', '拉伸':'stretch','对齐文本':'baseline'},group:'tools2.3'},
    'flex': {name:'flex', showName:'自动伸缩', type: propertyType.Select, default:'0 1 auto',options:{'无':'0 0 auto','允许缩小':'0 1 auto','允许拉伸':'1 0 auto', '自动伸缩':'1 1 auto'},group:'tools2.3'},

    'padding': {name:'padding', showName:'内间距', type: propertyType.Hidden, default:'',group:'tools3'},
    'paddingUp': {name:'paddingUp', showName:'边距上', type: propertyType.Number, default:0,group:'tools3'},
    'paddingDown': {name:'paddingDown', showName:'边距下', type: propertyType.Number, default:0,group:'tools3'},
    'paddingLeft': {name:'paddingLeft', showName:'边距左', type: propertyType.Number, default:0,group:'tools3'},
    'paddingRight': {name:'paddingRight', showName:'边距右', type: propertyType.Number, default:0,group:'tools3'},

    'flexDirection': {name:'flexDirection', showName:'主轴方向', type: propertyType.Select, default: 'row',options:{'上下':'column','下上':'column-reverse','左右':'row', '右左':'row-reverse'},group:'tools3.1'},
    'justifyContent': {name:'justifyContent', showName:'主轴对齐', type: propertyType.Select, default:'flex-start', options:{'靠前':'flex-start','靠后':'flex-end','居中':'center', '均分（靠边）':'space-between','均分（不靠边）':'space-around'},group:'tools3.1'},
    'alignItems': {name:'alignItems', showName:'副轴对齐', type: propertyType.Select, default:'flex-start',options:{'靠前':'flex-start','靠后':'flex-end','居中':'center'},group:'tools3.1'},
    'alignContent':{name:'alignContent',showName:'alignContent',type: propertyType.Hidden, default:'',group:'tools3.1'},
    'flexWrap': {name:'flexWrap', showName:'自动换行', type: propertyType.Boolean, default:false,group:'tools3.1'}
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
    'change': {name:'change', showName:'输入完成'},
    'input': {name:'input', showName:'内容改变'},

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

    'loop': {name:'loop', showName:'重复播放'},
    'stop': {name:'stop', showName:'结束'},
    'tick': {name:'tick', showName:'每一帧'},
    'complete':{name:'complete', showName:'播放完成'},
    'message':{name:'message', showName:'消息', info:'data', needFill:[{showName:'值',type:'var',default:null, actionName:'message'}]}
};

let funcMapping = {
    'getRoot': {name:'getRoot', showName:'获取父级对象'},
    'delete': {name:'delete', showName: '删除对象'},

    'create': {name:'create', showName:'创建控件', property:[
        {'name':'class', 'showName':'类别', 'value':null, 'type':propertyType.Select},
        {'name':'id', 'showName':'ID', 'value':null, 'type':propertyType.String},
        {'name':'props', 'showName':'属性', value:null, 'type':propertyType.Remove},
        {'name':'bottom', showName:'是否置底', 'value':null, 'type':propertyType.Boolean2}]},
    'clone': {name:'clone', showName: '创建对象', property:[
        {'name':'obj', 'showName':'对象', 'value':null, 'type':propertyType.ObjectSelect},
        {'name':'id', 'showName':'ID', 'value':null, 'type':propertyType.String},
        {'name':'props', 'showName':'属性', value:null, 'type':propertyType.Remove},
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

    'find': {name:'find', showName:'输出', info:'option, callback(err, result)', property:[
        {'name':'type', 'showName':'普通', 'value':'normal', 'type':propertyType.Hidden},
        {'name':'conditions', 'showName':'输出条件', 'value':[{field:null,operation:'=',compare:null}], 'type':propertyType.DBCons},
        {'name':'order', 'showName':'排序方式', 'value':{field:null, asc:true}, 'type':propertyType.DBOrder},
        {'name':'lines', 'showName':'输出行数', 'value':{from:null, to:null}, 'type':propertyType.Range},
        {'name':'object', 'showName':'输出至对象', 'value':null, 'type':propertyType.Object},
        {'name':'onlyMe', 'showName':'仅当前用户', 'value':false, 'type':propertyType.Boolean3}]},
    'insert': {name:'insert', showName:'提交', info:'data, callback(err, result)', property:[
        {'name':'data', 'showName':'选择来源', 'value':null, 'type':propertyType.ObjectSelect}]},
    'update': {name:'update', showName:'更新', info:'data, callback(err, result)', property:[
        {'name':'data', 'showName':'选择来源', 'value':null, 'type':propertyType.ObjectSelect}]},

    'send': {name:'send', showName:'发送消息', info:'data', property:[
        {'name':'value', 'showName':'内容', 'value':null, 'type':propertyType.FormulaInput}]},

    'getResult': {name:'getResult', showName: '获取表格数据', info: 'pageNum', property: [
        {'name': 'pageNum', 'showName': '页数', 'value': null, 'type': propertyType.Integer}]},
    'nextResult': {name:'nextResult', showName:'获取下一页数据'},
    'prevResult': {name:'prevResult', showName:'获取上一页数据'},
};
/***
 *luozheao,20161122
 * 备注:
 *1  map中没有的属性,我们自己添加的属性,一律用_开头,如_editTrack
 *2  要将我们自己添加的属性显示出来,还要在modifyPropList方法中追加进去
 */
let specialCaseElementMapping = (className, type)=> {
    //以后还要对不同的type进行修正(modeType)
    if(isInCLList(className, ['counter'])) {
        return {
            props: {
                'value': {name:'value', showName:'数值', type: propertyType.Number, default: 0}},
            events: {
                'change': {name:'change', showName:'数值改变'}}
        };
    } else if (isInCLList(className, ['root'])) {
        return {
            props: {
                'loop': {name:'loop', showName:'滑动页面循环', type: propertyType.Boolean, group:'tools', default: false}}
        };
    }
    else if (isInCLList(className, ['qrcode'])) {
        return {
            props: {
                'value': {name:'value', showName:'数据', type: propertyType.String, default:''}}
        };
    } else if (isInCLList(className, ['oneDArr', 'twoDArr'])) {
        return {
            props: {
                'title': {name:'title', showName:'变量名', type: propertyType.String, default: ''},
                'value': {name:'value', showName:'值',type: propertyType.String, default: ''}}
        };
    } else if (isInCLList(className, ['bitmaptext'])) {
        return {
            props: {
                'color': {name:'color', showName:'文字颜色', type: propertyType.Color, default:'',group:'tools'},
                'fontFamily': {name:'fontFamily', showName:'字体',type: propertyType.Select, default:'上传字体',group:'tools'}
            }
        };
    } else if (isInCLList(className, ['html'])) {
        return {
            props: {
                'width': {name:'width', type: propertyType.Hidden, default: 0, group:'position', readOnly: true},
                'height': {name:'height', type: propertyType.Hidden, default: 0, group:'position', readOnly: true},}
        };
    } else if (isInCLList(className, ['input'])) {
        return {
            props: {
                'value': {name:'value', showName:'内容', type: propertyType.String, default: ''},
                'width': {name:'width', type: propertyType.Hidden, default: 0, group:'position', readOnly: true},
                'height': {name:'height', type: propertyType.Hidden, default: 0, group:'position', readOnly: true},
                'shapeWidth': {name:'shapeWidth', type: propertyType.Hidden, default: 0, group:'position'},
                'shapeHeight': {name:'shapeHeight', type: propertyType.Hidden, default: 0, group:'position'},
                'color': {name:'color', showName:'背景颜色', type: propertyType.Color, default:'#FFFFFF'}},
            events: {
                'isMatch': {name:'isMatch', showName:'匹配', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'},{showName:'文本',type:'string',default:''}]},
                'isUnMatch': {name:'isUnMatch', showName:'不匹配', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'},{showName:'文本',type:'string',default:''}]},
                'isEmpty': {name:'isEmpty', showName:'为空',needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'}]},
                'isNotEmpty': {name:'isNotEmpty', showName:'不为空', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'}]},
                'isContain': {name:'isContain', showName:'包含文本', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'},{showName:'文本',type:'string',default:''}]},
                'lenEqual': {name:'lenEqual', showName:'长度等于', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'},{showName:'长度值',type:'number',default:''}]},
                'lenUnEqual': {name:'lenUnEqual', showName:'长度不等于', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'},{showName:'长度值',type:'number',default:''}]},
                'lenBigThan': {name:'lenBigThan', showName:'长度大于', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'},{showName:'长度值',type:'number',default:''}]},
                'lenLessThan': {name:'lenLessThan', showName:'长度小于', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'},{showName:'长度值',type:'number',default:''}]},
                'isNum': {name:'isNum', showName:'是数字', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'}]},
                'isNotNum': {name:'isNotNum', showName:'不是数字', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'}]},
                'isLetter': {name:'isLetter', showName:'是字母', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'}]},
                'isNotLetter': {name:'isNotLetter', showName:'不是字母', needFill:[{type:'select', option:['输入完成','内容改变'],default:'输入完成'}]}
            }
        };
    } else if (isInCLList(className, ['easing'])) {
        return {
            props: {
                'type': {name:'type', showName:'移动方式',type: propertyType.Select, default: '无', options:easingMoveOptions},
                'radius': {name:'radius', showName:'圆角', type: propertyType.Number, default: 0},
                'autoPlay': {name:'autoPlay', showName:'自动播放', type: propertyType.Boolean, default: false}}
        };
    } else if (isInCLList(className, ['effect'])) {
        return {
            props: {
                'type':{name:'type', showName:'动效类型', type: propertyType.Select,  default:'无',optionsToJudge:effectOptionsToJudge,options:effectOption},
                'duration': {name:'duration', showName:'时长', type: propertyType.Number, default: 1},
                'autoPlay': {name:'autoPlay', showName:'自动播放', type: propertyType.Boolean, default: false}}
        };
    } else if (isInCLList(className, ['track'])) {
        return {
            props: {
                'type': {name:'type', showName:'轨迹类型', type: propertyType.Select, default:'0',options:{'直线':'0','曲线':'1','贝塞尔曲线':'2'},group:'tools',order:2},
                '_createEffect': {name:'_createEffect', showName:'生成动效',styleName:'create-btn',olderClassName:"create-btn",
                    type: propertyType.Button,default:'',group:'buttonArea'},

                '_editTrack': {name:'_editTrack', showName:'编辑运动轨迹',styleName:'edit-btn',olderClassName:"edit-btn",
                                type: propertyType.Button,default:'',group:'buttonArea'},

                '_saveTrack': {name:'_saveTrack', showName:'保存',styleName:'save-btn',olderClassName:'save-btn',
                                type: propertyType.Button,default:'',group:'buttonArea'},

                '_saveAsTrack': {name:'_saveAsTrack', showName:'另存为',styleName:'saveAs-btn',olderClassName:'saveAs-btn',
                                type: propertyType.Button,default:'',group:'buttonArea'},

                '_cancelTrack': {name:'_cancelTrack', showName:'取消',styleName:'cancel-btn',olderClassName:'cancel-btn',
                                    type: propertyType.Button,default:'',group:'buttonArea'}
            }
        };
    } else if (isInCLList(className, ['table'])) {
        return {
            props: {
                'lineColor': {name:'lineColor', showName:'网格颜色', type: propertyType.Color2,group:'tableW', default: '', tbCome:"tbF"},
                'lineWidth': {name:'lineWidth', showName:'网格大小', type: propertyType.Integer,group:'tableW', default: '2', tbCome:"tbS"},
                'fontFamily': {name:'fontFamily', showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体', tbCome:"tbF" },
                'fontSize': {name:'fontSize', showName:'图表字体大小', type: propertyType.Number,group:'tools', default: 24, tbCome:"tbS" }}
        };
    } else if (isInCLList(className, ['tableForSet'])) {
        return {
            props: {
                'fillColor': {name:'fillColor', showName:'表格底色', type: propertyType.Color,group:'display', default: ''},
                'lineColor': {name:'lineColor', showName:'网格颜色', type: propertyType.Color2,group:'tableW', default: '', tbCome:"tbF"},
                'lineWidth': {name:'lineWidth', showName:'网格大小', type: propertyType.Integer,group:'tableW', default: '2', tbCome:"tbS"},
                'fontFamily': {name:'fontFamily', showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体', tbCome:"tbF" },
                'fontSize': {name:'fontSize', showName:'字体大小', type: propertyType.Number,group:'tools', default: 24, tbCome:"tbS" }}
        };
    } else if (isInCLList(className, ['slidetimer', 'pagecontainer'])){
      return {
          props: {
              'originPos': {name:'originPos', showName:'中心点',type: propertyType.Dropdown,imgClassName:'originPos',default: '左上', options:{'上':[0.5,0],'下':[0.5,1],'左':[0,0.5],'右':[1,0.5],'中心':[0.5,0.5],'左上':[0,0],'左下':[0,1],'右上':[1,0],'右下':[1,1]}, group:'position',order:5},
          }
      } ;
    } else {
        return {};
    }
};

let addCustomWidgetProperties = ()=>{
    propertyMap['strVar'] = {
        dom: {
            funcs: dealElementList(['changeValue'], 'strVar', 'funcs', modeType.dom),
            props: dealElementList(['value'], 'strVar', 'props', modeType.dom),
            events: [],
            provides: 0
        }
    };
    propertyMap['strVar'].canvas = propertyMap['strVar'].dom;
    propertyMap['strVar'].flex = propertyMap['strVar'].dom;

    propertyMap['intVar'] = {
        dom: {
            funcs: dealElementList(['changeValue','add1','minus1','addN','minusN','getInt','randomValue'], 'intVar', 'funcs', modeType.dom),
            props: dealElementList(['value'], 'intVar', 'props', modeType.dom),
            events: [],
            provides: 0
        }
    };
    propertyMap['intVar'].canvas = propertyMap['intVar'].dom;
    propertyMap['intVar'].flex = propertyMap['intVar'].dom;

    propertyMap['oneDArr'] = {
        dom: {
            funcs: dealElementList(['getRoot'], 'oneDArr', 'funcs', modeType.dom),
            props: dealElementList(['title', 'value', 'column'], 'oneDArr', 'props', modeType.dom),
            events: [],
            provides: 0
        }
    };
    propertyMap['oneDArr'].canvas = propertyMap['oneDArr'].dom;
    propertyMap['oneDArr'].flex = propertyMap['oneDArr'].dom;

    propertyMap['twoDArr'] = {
        dom: {
            funcs: dealElementList(['getRoot'], 'twoDArr', 'funcs', modeType.dom),
            props: dealElementList(['title', 'value', 'row', 'column', 'dbSource'], 'twoDArr', 'props', modeType.dom),
            events: [],
            provides: 0
        }
    };
    propertyMap['twoDArr'].canvas = propertyMap['twoDArr'].dom;
    propertyMap['twoDArr'].flex = propertyMap['twoDArr'].dom;
};

let dealElementList =(aLack, className, elType ,type)=>{
    let sMapping = specialCaseElementMapping(className, type);
    let list = [];
    let mapping = null;
    switch (elType) {
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
        if (sMapping[elType] && sMapping[elType][v]) {
            c = sMapping[elType][v];
        }
        if (c) {
            list.push(c);
        } else {
            alert('通用属性和特殊属性中没有:' + v + '通知下程序员!');
        }
    });
    return list;
};

let modifyPropList = (list, className, type) => {
    //根据不同的class对props进行定制和排序
    //以后还可能对于不用的type进行不同定制（modeType）

    let aLack = [];
    let originXTag = false;
    let originYTag = false;
    let scaleXTag = false;
    let widthTag = false;

    list.map((v, i) => {
        if (v.name == 'originX') {
            originXTag = true;
        } else if (v.name == 'originY') {
            originYTag = true;
        } else if (v.name == 'scaleX') {
            scaleXTag = true;
        } else if (v.name == 'width') {
            widthTag = true;
        }
    });

    //不显示出来的属性
    //list的元素可能没有showName,暂时用name替代.遇到这种情况,应在propMapping中添加进去
    list.map((v, i) => {
        if (v.name == 'width' || v.name == 'height') {
            if(scaleXTag && widthTag) {
                v.type = propertyType.Hidden;
            }
        }

      if(['flex','canvas','dom','pagecontainer'].indexOf(className)>=0){
            if(scaleXTag && widthTag) {
                if (v.name == 'width' || v.name == 'height') {
                    v.type = propertyType.Integer;
                }
                if (v.name == 'scaleX' || v.name == 'scaleY') {
                    v.type = propertyType.Hidden;
                }
            }
        }
        if((type==modeType.dom||type==modeType.canvas)&&['container'].indexOf(className)>=0) {
            if (v.name == 'width' || v.name == 'height') {
                v.type = propertyType.Hidden;
            }
            if (v.name == 'scaleX' || v.name == 'scaleY') {
                v.type = propertyType.Float;
            }
        }

        if ([ 'visible','viewBoxWidth','viewBoxHeight','globalVx','globalVy'].indexOf(v.name) >= 0) {
            v.type = propertyType.Hidden;
        }
        if (['shapeWidth', 'shapeHeight'].indexOf(v.name) >= 0) {
            if(type==modeType.flex && className=='rect'){
               ;
            }else if((type==modeType.dom||type==modeType.canvas) && className=='container'){
               ;
            }else if(type==modeType.flex && className=='ellipse'){
                ;
            }else{
                v.type = propertyType.Hidden;
            }
        }
        if (['timer'].indexOf(className) >= 0 && ['scaleX', 'scaleY'].indexOf(v.name) >= 0) {
            v.type = propertyType.Hidden;
        }

        if (['margin', 'padding'].indexOf(v.name) >= 0) {
            if(v.name=='margin'){
                aLack=aLack.concat(['marginUp','marginDown','marginLeft','marginRight']);
            }
            else if(v.name=='padding'){
                aLack=aLack.concat(['paddingUp','paddingDown','paddingLeft','paddingRight']);
            }
        }

        if(!v.showName){
            v.showName=v.name;
        }
    });
    //部分属性面板才有中心点
    if (originXTag && originYTag && ['timer','container', 'canvas', 'flex', 'world'].indexOf(className) < 0) {
        aLack.push('originPos');
    }

    if(className=='track'){
        aLack.push('_createEffect','_editTrack','_saveTrack','_saveAsTrack','_cancelTrack');
    }




    list = list.concat(dealElementList(aLack, className, 'props', type));
    return list;
};

let modifyEventList = (list, className, type) => {
    //根据不同的class对events进行定制和排序
    //以后还可能对于不用的type进行不同定制（modeType）
    let aLack=[];
    //只在dom模式下添加自定义的事件
    if(type==modeType.dom){
        if(className=='input'){
            aLack=['isEmpty','isNotEmpty','isMatch','isUnMatch','isContain','lenEqual','lenUnEqual','lenBigThan','lenLessThan','isNum','isNotNum','isLetter','isNotLetter'];
        }
        else if(className=='sock'){
            aLack=['message'];
        }
        else if(className=='text'){
            aLack=['isMatch','isUnMatch','Contain','change'];
        }
        else if(className=='counter'){
            aLack=['==','!=','>','<','valRange','change','positive','negative','odd','even','remainder'];
        }
    }
    //list的元素可能没有showName,暂时用name替代.遇到这种情况,应在eventMapping中添加进去
    list.map((v,i)=>{
        if(!v.showName){
            v.showName=v.name;
        }
    });
    list = list.concat(dealElementList(aLack, className, 'events', type));
    return list;
};

let modifyFuncList = (list, className, type) => {
    //以后还可能对于不用的type进行不同定制（modeType）
    if(isInCLList(className, ['text', 'counter'])) {
        let func = dealElementList(['changeValue'], className, 'funcs', type);
        list.unshift(func[0]);
    }
    if(isInCLList(className, ['counter'])) {
        let temp = dealElementList(['add1','minus1','addN','minusN','getInt','randomValue'], className, 'funcs', type);
        list = list.concat(temp);
    }
    if(isInCLList(className, visibleWidgetList)) {
        let temp = dealElementList(['show','hide'], className, 'funcs', type);
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
        for(let type in clTypes) {
            let el = clTypes[type];
            //特殊处理
            let sElMapping = specialCaseElementMapping(className, type);
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
    if(isInCLList(className, ['intVar','strVar','var','func','dbItem'])) {
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
    let selectWidget = selected;
    if(selected.className === 'func'||
        selected.className === 'var' ||
        selected.className === 'dbItem'){
        selectWidget = selected.widget;
    } else {
        selectWidget = selected;
    }

    if(propertyMap[className]){
        var type = bridge.getRendererType(selectWidget.node);
        var provides = bridge.getMap(selectWidget.node, propertyMap[selectWidget.className]).provides;
        var requires = bridge.getMap(selectWidget.node, propertyMap[className]).requires;
        if (className == 'world') {
            return !(selectWidget.className == 'canvas');
        }
        if (className == 'container') {
            return !provides & widgetFlags.Container;
        }
        if (requires & widgetFlags.Root) {
            return !provides & widgetFlags.Root;
        }
        if ((type == 4 && ((requires & widgetFlags.Canvas) == 0))|| (type == 1 && ((requires & widgetFlags.Flex) == 0))) {
            return true;
        }
    } else {
        return false;
    }
    return false;
};

let checkNotInCanvasMode = (selected, className) => {
    let selectWidget = selected;
    if(selected.className === 'func'||
        selected.className === 'var' ||
        selected.className === 'dbItem'){
        selectWidget = selected.widget;
    } else {
        selectWidget = selected;
    }
    if(propertyMap[className]){
        var type = bridge.getRendererType(selectWidget.node);
        var provides = bridge.getMap(selectWidget.node, propertyMap[selectWidget.className]).provides;
        var requires = bridge.getMap(selectWidget.node, propertyMap[className]).requires;
        if (className == 'world') {
            return !(selectWidget.className == 'canvas');
        }
        if (className == 'container') {
            return !provides & widgetFlags.Container;
        }
        if (requires & widgetFlags.Root) {
            return !provides & widgetFlags.Root;
        }
        if ((type == 2 && ((requires & widgetFlags.Dom) == 0)) || (type == 1 && ((requires & widgetFlags.Flex) == 0))) {
            return true;
        }
    } else {
        return false;
    }
    return false;
};

let checkNotInFlexMode = (selected, className) => {
    let selectWidget = selected;
    if(selected.className === 'func'||
        selected.className === 'var' ||
        selected.className === 'dbItem'){
        selectWidget = selected.widget;
    } else {
        selectWidget = selected;
    }
    if(propertyMap[className]){
        var type = bridge.getRendererType(selectWidget.node);
        var provides = bridge.getMap(selectWidget.node, propertyMap[selectWidget.className]).provides;
        var requires = bridge.getMap(selectWidget.node, propertyMap[className]).requires;
        if (className == 'world') {
            return !(selectWidget.className == 'canvas');
        }
        if (className == 'container') {
            return !provides & widgetFlags.Container;
        }
        if (requires & widgetFlags.Root) {
            return !provides & widgetFlags.Root;
        }
        if ((type == 2 && ((requires & widgetFlags.Dom) == 0)) || (type == 4 && ((requires & widgetFlags.Canvas) == 0))) {
            return true;
        }
    } else {
        return false;
    }
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
    //先处理自定义的伪对象
    if(className ==='dbItem'){
        if(selected.className === 'db'){
            return true;
        } else {
            return false;
        }
    } else if(className === 'func'){
        if(selected.className === 'func' ||
            selected.className === 'var' ||
            selected.className === 'dbItem'||
            (selected.className === 'data'&&(selected.props.type==='oneDArr'||selected.props.type==='twoDArr'))) {
            return false;
        } else {
            return true;
        }
    } else if(className === 'var') {
        if( selected.className === 'counter' ||
            selected.className === 'func' ||
            selected.className === 'var' ||
            selected.className === 'dbItem' ||
            (selected.className === 'data'&&(selected.props.type==='oneDArr'||selected.props.type==='twoDArr'))){
            return false;
        } else {
            return true;
        }
    } else if (selected.className === 'func' ||
        selected.className === 'var' ||
        selected.className === 'dbItem' ||
        selected.className.substr(0,1)==='_' ||    //自定义class
        (selected.className === 'data'&&(selected.props.type==='oneDArr'||selected.props.type==='twoDArr'))) {
        return false;
    }

    var type = bridge.getRendererType(selected.node);
    var provides = bridge.getMap(selected.node, propertyMap[selected.className]).provides;
    if(propertyMap[className]){
        var requires = bridge.getMap(selected.node, propertyMap[className]).requires;
    } else {
        return false;
    }

    if (className == 'world')
        return (selected.className == 'canvas');

    if (className == 'container')
        return provides & widgetFlags.Container;

    if (requires & widgetFlags.Root)
        return provides & widgetFlags.Root;

    if ((~(provides & FLAG_MASK) & (requires & FLAG_MASK)) != 0)
        return false;

    if (type == 1 && ((requires & widgetFlags.Flex) == 0))
        return false;

    if (type == 2 && ((requires & widgetFlags.Dom) == 0))
        return false;

    if (type == 4 && ((requires & widgetFlags.Canvas) == 0))
        return false;

    if ((requires & widgetFlags.Unique) != 0) {
        for (var index in selected.children) {
            if (selected.children[index].className == className)
                return false;
        }
    }
    return true;
};

//对propertyMap的属性，事件，动作进行处理
dealWithOriginalPropertyMap();
//添加伪对象的属性
addCustomWidgetProperties();


/**
 * PropertyView WidgetStore PropertyViewComponet都会用到
 * 用于判断对象是否处于flex模式下 和 本身是canvas
 * 如果满足上述条件,其自身可以添加%或px
*/
function fnIsFlex(node,firstNodeClassName=node.className) {


    if(firstNodeClassName=='canvas') {
        return true;
    }

    if (node.className == 'flex') {
        return true;
    }
    else if (node.className == 'canvas') {
        return false;
    }
    else if (node.className == 'root') {
        return false;
    }
    else {
        return  fnIsFlex(node.parent,firstNodeClassName);
    }
};
/**
 * PropertyViewComponet用到
 * 用于判断canvas是否处于flex模式下,如果是,则不能填写%.搞得这么复杂,真无奈啊
 * */
function fnCanvasIsUnderFlex(node,firstNodeClassName=node.className){
    if(firstNodeClassName=='canvas') {
        if(node.className=='flex'){
            return true;
        } else if (node.className == 'root') {
            return false;
        }else {
            return  fnCanvasIsUnderFlex(node.parent,firstNodeClassName);
        }
    }
}
/**
 * PropertyView
 * 用于判断是否处于时间轴下面
 */
function fnIsUnderTimer(node){
    if (node.className == 'timer') {
        return true;
    }
    else if (node.className == 'root') {
        return false;
    }
    else {
        return  fnIsUnderTimer(node.parent);
    }
}


export {propertyMap, propertyType, getPropertyMap, checkChildClass, checkEventClass, checkLockClass, checkNotInDomMode, checkNotInCanvasMode, checkNotInFlexMode, checkIsClassType,sortGroupArr,fnIsFlex,fnCanvasIsUnderFlex,fnIsUnderTimer};
