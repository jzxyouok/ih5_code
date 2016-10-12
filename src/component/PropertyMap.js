import bridge from 'bridge';
import {isCustomizeWidget, dataType} from '../stores/WidgetStore';

const propertyType = {
    Integer: 0,
    Number: 1,
    String: 2,
    Text: 3,
    Boolean: 4,
    Percentage: 5,
    Color: 6,
    Select:7,
    Float:8,
    Color2:9,
    Boolean2:10,
    Function:11
};

var level;

const widgetFlags = {
    // provides
    Root: level = 1,
    Box: level <<= 1,
    Container: level <<= 1,
    Leaf: level <<= 1,

    // provides (recursive)
    Timer: level <<= 1,
    World: level <<= 1,

    // requires
    Unique: level <<= 1,
    DomOnly: level <<= 1,
    CanvasOnly: level <<= 1,
};

widgetFlags.FLAG_MASK = widgetFlags.Root | widgetFlags.Box | widgetFlags.Container;

const propertyMap = {};
const propertyFlags = {};

propertyMap['widget'] = [
    { name: 'id',showName:'ID', type: propertyType.String, default: '', isProperty: true },
    { name: 'getRoot', showName:'获取父级对象', isFunc: true },
];

propertyMap['data'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Root}
];

propertyMap['root'] = [
    ...propertyMap['widget'],
    { addProvides: widgetFlags.Root | widgetFlags.Container},
    { name: 'width',showName:'W', type: propertyType.Integer, default: 0, group:'position',  isProperty: true },
    { name: 'height', showName:'H',type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'scaleType',showName:'适配', type: propertyType.Select, default:'满屏',options:{'适中':1,'居上':2,'居中':4,'居下':3,'满屏':5}, group:'tools', isProperty: true},
    { name: 'clipped',showName:'剪切', type: propertyType.Boolean, default: false,group:'tools', isProperty: true },
    { name: 'color',showName:'舞台颜色', type: propertyType.Color2, default: '', group:'tools', isProperty: true },
    { name: 'init', showName:'初始化', isEvent: true },
    { name: 'click', showName:'点击', isEvent: true, info:['globalX','globalY']},
    { name: 'touchDown', showName:'手指按下', isEvent: true, info:['globalX','globalY']},
    { name: 'touchUp', showName:'手指松开', isEvent: true, info:['globalX','globalY']},
    { name: 'swipeLeft', showName:'向左滑动', isEvent: true },
    { name: 'swipeRight', showName:'向右滑动', isEvent: true },
    { name: 'swipeUp',  showName:'向上滑动', isEvent: true },
    { name: 'swipeDown', showName:'向下滑动', isEvent: true },
    { name: 'create', showName:'创建对象', info:'(class,id,props,bottom)',
        property:[
            {'name':'class', showName:'类别', 'value':null, 'type':propertyType.String},
            {'name':'id', showName:'ID', 'value':null, 'type':propertyType.Integer},
            {'name':'props', showName:'属性', 'value':null, 'type':propertyType.String},
            {'name':'bottom', showName:'是否置底', 'value':null, 'type':propertyType.Boolean2},
        ], isFunc: true },
    { name: 'gotoPage', showName:'跳转到页面', info:'(page)',
        property:[
            {'name':'page', showName:'页面', 'value':null, 'type':propertyType.Integer},
        ], isFunc: true },
    { name: 'gotoPageNum', showName:'跳转到页数', info:'(num)',
        property:[
            {'name':'num', showName:'页数', 'value':null, 'type':propertyType.Integer},
        ], isFunc: true },
    { name: 'nextPage', showName:'下一页', isFunc: true },
    { name: 'prevPage', showName:'上一页', isFunc: true },
    { name: 'getTouchX', showName:'获取点击的X坐标', isFunc: true },
    { name: 'getTouchY', showName:'获取点击的Y坐标', isFunc: true }
];
propertyMap['wechat'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Root},
    { name: 'title', type: propertyType.String, default: '', isProperty: true },
    { name: 'desc', type: propertyType.String, default: '', isProperty: true },
    { name: 'imgUrl', type: propertyType.String, default: '', isProperty: true }
];
propertyMap['box'] = [
    ...propertyMap['widget'],
    { addProvides: widgetFlags.Box, addRequires: widgetFlags.Container},
    { name: 'positionX',showName:'X', type: propertyType.Integer, default: 0, group:'position', isProperty: true},
    { name: 'positionY',showName:'Y', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'scaleX', showName:'W',type: propertyType.Float, default: 0, group:'position', isProperty: true },
    { name: 'scaleY',showName:'H',showLock:true ,type: propertyType.Float, default: 0, group:'position', isProperty: true},
    { name: 'originPos', showName:'中心点',type: propertyType.Select,imgClassName:'originPos',default: '左上', options:{'上':[0.5,0],'下':[0.5,1],'左':[0,0.5],'右':[1,0.5],'中心':[0.5,0.5],'左上':[0,0],'左下':[0,1],'右上':[1,0],'右下':[1,1]}, group:'position',isProperty: true },
    { name: 'rotation',showName:'旋转度', type: propertyType.Integer,imgClassName:'rotation', default: 0, group:'position', isProperty: true },
    { name: 'alpha',showName:'不透明度', type: propertyType.Percentage, default: 1, group:'display', isProperty: true },
    { name: 'initVisible',showName:'初始可见', type: propertyType.Boolean2, default: 1, group:'tools', isProperty: true },
    { name: 'click', showName:'点击', isEvent: true, info:'{globalX, globalY}'},
    { name: 'touchDown', showName:'手指按下', isEvent: true, info:['globalX','globalY']},
    { name: 'touchUp', showName:'手指松开', isEvent: true, info:['globalX','globalY']},
    { name: 'swipeLeft', showName:'向左滑动', isEvent: true },
    { name: 'swipeRight', showName:'向右滑动', isEvent: true },
    { name: 'swipeUp',  showName:'向上滑动', isEvent: true },
    { name: 'swipeDown', showName:'向下滑动', isEvent: true },
    { name: 'show', showName:'显示', isEvent: true },
    { name: 'hide', showName:'隐藏', isEvent: true },
    { name: 'toggleVisible', showName:'交替显示', isFunc: true },
    { name: 'hideSibling', showName:'隐藏同层控件', isFunc: true },
    { name: 'show', showName:'显示', isFunc: true },
    { name: 'hide', showName:'隐藏', isFunc: true },
];
propertyMap['sprite'] = [
    ...propertyMap['box'],
];
propertyMap['textBox']=[
    { name: 'fontFamily',showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体', isProperty: true },
    { name: 'fontSize',showName:'字体大小', type: propertyType.Number,group:'tools', default: 26, isProperty: true },
    { name: 'fontFill',showName:'字体颜色', type: propertyType.Color,group:'tools', default: '#000000', isProperty: true },
];
propertyMap['text'] = [
    { name: 'changeValue', showName:'赋值', info:'(value)',
        property:[
            {'name':'value', showName:'值', 'value':null, 'type':propertyType.String},
        ], isFunc: true },
    ...propertyMap['sprite'],
    { name: 'value',showName:'内容', type: propertyType.Text,  default: '', isProperty: true } ,
    ...propertyMap['textBox'],
    { name: 'match', showName:'匹配', isEvent: true,needFill:[{showName:'文本',type:'string',default:''}]},
    { name: 'unMatch', showName:'不匹配', isEvent: true,needFill:[{showName:'文本',type:'string',default:''}]},
    { name: 'Contain', showName:'包含文本', isEvent: true,needFill:[{showName:'文本',type:'string',default:''}]},
    { name: 'onChange', showName:'内容改变', isEvent: true},



];
propertyMap['counter'] = [
    { name: 'changeValue', showName:'赋值', info:'(value)',
        property:[
            {'name':'value', showName:'值', 'value':null, 'type':propertyType.String},
        ], isFunc: true },
    { name: 'add1', showName:'加1', isFunc: true },
    { name: 'minus1', showName:'减1', isFunc: true },
    { name: 'addN', showName:'加N',
        property:[
            {'name':'value', showName:'N', 'value':null, 'type':propertyType.Integer},
        ], isFunc: true },
    { name: 'minusN', showName:'减N',
        property:[
            {'name':'value', showName:'N', 'value':null, 'type':propertyType.Integer},
        ], isFunc: true },
    { name: 'getInt', showName:'取整', isFunc: true },
    { name: 'randomValue', showName:'生成随机数',
        property:[
            {'name':'minValue', showName:'最小值', 'value':null, 'type':propertyType.Integer},
            {'name':'maxValue', showName:'最大值', 'value':null, 'type':propertyType.Integer},
        ], isFunc: true },
    ...propertyMap['sprite'],
    { name: 'value',showName:'数值', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'precision', type: propertyType.Integer,group:'tools', default: 0, isProperty: true },
    ...propertyMap['textBox'],
    //事件面板所需触发条件
    { name: 'equal', showName:'等于', isEvent: true,needFill:[{showName:'值',type:'number',default:''}]},
    { name: 'unequal', showName:'不等于', isEvent: true,needFill:[{showName:'值',type:'number',default:''}]},
    { name: 'bigThan', showName:'大于', isEvent: true ,needFill:[{showName:'值',type:'number',default:''}]},
    { name: 'lessThan', showName:'小于', isEvent: true ,needFill:[{showName:'值',type:'number',default:''}]},
    { name: 'valRange', showName:'数值范围', isEvent: true,needFill:[{showName:'最大值',type:'number',default:''},{showName:'最小值',type:'number',default:''}]},
    { name: 'valChange', showName:'数值改变', isEvent: true },
    { name: 'positive', showName:'为正数', isEvent: true },
    { name: 'negative', showName:'为负数', isEvent: true },
    { name: 'odd', showName:'为奇数', isEvent: true },
    { name: 'even', showName:'为偶数', isEvent: true },
    { name: 'remainder', showName:'余数为', isEvent: true ,needFill:[{showName:'除数',type:'number',default:''},{showName:'余数',type:'number',default:''}]},
];
propertyMap['video'] = [
    ...propertyMap['sprite'],
    { name: 'url',showName:'资源位置', type: propertyType.String, default: '', isProperty: true },
];
propertyMap['audio'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Root},
    { name: 'url',showName:'资源位置', type: propertyType.String, default: '', isProperty: true },
    { name: 'play', showName:'播放', isFunc: true },
    { name: 'pause', showName:'暂停', isFunc: true }
];
propertyMap['image'] = [
    ...propertyMap['sprite'],
    { name: 'link',showName:'资源', type: propertyType.Integer, default:0, isProperty: false }
];
propertyMap['imagelist'] = [
    ...propertyMap['sprite'],
    { name: 'delay', type: propertyType.Number, default: 0.2, isProperty: true },
];
propertyMap['bitmaptext'] = [
    ...propertyMap['sprite'],
    { name: 'value',showName:'内容', type: propertyType.Text, default:'', isProperty: true },
    { name: 'font', showName:'字体',type: propertyType.Select, default:'上传字体',group:'tools', isProperty: true },
    { name: 'size',  showName:'文字大小',type: propertyType.Integer, default:26,group:'tools', isProperty: true },
    { name: 'color', showName:'文字颜色', type: propertyType.Color, default:'',group:'tools', isProperty: true },
    { name: 'lineHeight',showName:'行距', type: propertyType.Integer, default:10,group:'tools', isProperty: true },
];
propertyMap['qrcode'] = [
    ...propertyMap['sprite'],
    { addProvides: widgetFlags.Box, addRequires: widgetFlags.Container},
    { name: 'value',showName:'数据', type: propertyType.String, default:'', isProperty: true },
];
propertyMap['graphics'] = [
    ...propertyMap['box'],
    { addProvides: widgetFlags.Box, addRequires: widgetFlags.Container},
    { name: 'fillColor',showName:'填充颜色', type: propertyType.Color, default: '', group:'display', isProperty: true },
    { name: 'lineColor',showName:'描边颜色', type: propertyType.Color, default: '', group:'display', isProperty: true },
    { name: 'lineWidth',showName:'描边宽度', type: propertyType.Integer, default: 1, group:'display', isProperty: true },

];
propertyMap['rect'] = [
    ...propertyMap['graphics'],
    { name: 'radius', type: propertyType.Integer, default: 0,  group:'tools', isProperty: true },
];
propertyMap['taparea'] = [
    ...propertyMap['box'],
    { name: 'fillColor',showName:'填充颜色', type: propertyType.Color, default: '', group:'display', isProperty: true },
];
propertyMap['button'] = [
    ...propertyMap['rect'],
    { name: 'value',showName:'内容', type: propertyType.Text,  default: '', isProperty: true } ,
    ...propertyMap['textBox'],
];
propertyMap['slidetimer'] = [
    ...propertyMap['box'],
    { addProvidesRecursive: widgetFlags.Timer},
    { name: 'fillColor', type: propertyType.Color, default: '', group:'display', isProperty: true },
    { name: 'loop', showName:'循环播放', type: propertyType.Boolean,group:'tools', default: false, isProperty: true},
    { name: 'vertical', type: propertyType.Boolean,group:'tools', default: false, isProperty: true },
    { name: 'sliderScale', type: propertyType.Number,group:'tools', default: 1, isProperty: true},
    { name: 'totalTime',showName:'总时长', type: propertyType.Number, group:'tools',default: 10, isProperty: true}
];
propertyMap['html'] = [
    ...propertyMap['box'],
    { addRequires: widgetFlags.DomOnly},
    { name: 'src', type: propertyType.String, default:'', isProperty: true },
    { name: 'width', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: false },
    { name: 'height', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: false},
    { name: 'shapeWidth',showName:'原始宽', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'shapeHeight',showName:'原始高', type: propertyType.Integer, default: 0, group:'position', isProperty: true},
];
propertyMap['input'] = [
    ...propertyMap['box'],
    { addRequires: widgetFlags.DomOnly},
    { name: 'value', type: propertyType.String, default: '', isProperty: true },
    { name: 'width', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: false },
    { name: 'height', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: false},
    { name: 'shapeWidth', type: propertyType.Integer, default: 0, group:'position', isProperty: false },
    { name: 'shapeHeight', type: propertyType.Integer, default: 0, group:'position', isProperty: false},
    { name: 'color', type: propertyType.Color, default:'#FFFFFF', isProperty: true },



    { name: 'isEmpty', showName:'为空', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'}]},
    { name: 'isNotEmpty', showName:'不为空', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'}]},
    { name: 'isMatch', showName:'匹配', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'},{showName:'文本',type:'string',default:''}]},
    { name: 'isUnMatch', showName:'不匹配', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'},{showName:'文本',type:'string',default:''}]},
    { name: 'isContain', showName:'包含文本', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'},{showName:'文本',type:'string',default:''}]},

    { name: 'lenEqual', showName:'长度等于', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'},{showName:'长度值',type:'number',default:''}]},
    { name: 'lenUnEqual', showName:'长度不等于', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'},{showName:'长度值',type:'number',default:''}]},
    { name: 'lenBigThan', showName:'长度大于', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'},{showName:'长度值',type:'number',default:''}]},
    { name: 'lenLessThan', showName:'长度小于', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'},{showName:'长度值',type:'number',default:''}]},

    { name: 'isNum', showName:'是数字', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'}]},
    { name: 'isNotNum', showName:'不是数字', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'}]},
    { name: 'isLetter', showName:'是字母', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'}]},
    { name: 'isNotLetter', showName:'不是字母', isEvent: true,needFill:[{type:'select', option:['on change','on blur','on demand'],default:'on change'}]},

    ...propertyMap['textBox']

];
propertyMap['ellipse'] = [
    ...propertyMap['graphics']
];
propertyMap['path'] = [
    ...propertyMap['graphics'],
    { name: 'path',showName:'路径', type: propertyType.String, default: '', isProperty: false }
];
propertyMap['container'] = [
    ...propertyMap['box'],
    { addProvides: widgetFlags.Container},
    { name: 'create', info:'(class,id,props,bottom)',
        property:[
            {'name':'class', showName:'类别', 'value':null, 'type':propertyType.String},
            {'name':'id', showName:'ID', 'value':null, 'type':propertyType.Integer},
            {'name':'props', showName:'属性', 'value':null, 'type':propertyType.String},
            {'name':'bottom', showName:'是否置底', 'value':null, 'type':propertyType.Boolean2},
        ], isFunc: true }
];
propertyMap['canvas'] = [
    ...propertyMap['container'],
    { addRequires: widgetFlags.Root | widgetFlags.DomOnly},
    { name: 'width', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, group:'position', isProperty: true}
];
propertyMap['page'] = [
    // ...propertyMap['container'],
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Root | widgetFlags.Container | widgetFlags.DomOnly, addProvides: widgetFlags.Container},
    { name: 'backwardTransition',showName:'前翻效果',  type: propertyType.Select, default:'同上一页',options:{
        '同上一页':-1,
        '无':0,
        '向左滑走（平移）':1,
        '向右滑走（平移）':2,
        '向上滑走（平移）':3,
        '向下滑走（平移）':4,

        '向左滑走（平移渐变）':9,
        '向右滑走（平移渐变）':10,
        '向上滑走（平移渐变）':11,
        '向下滑走（平移渐变）':12,

        '向左滑走（覆盖视差）':13,
        '向右滑走（覆盖视差）':14,
        '向上滑走（覆盖视差）':15,
        '向下滑走（覆盖视差）':16,

        '缩小向左':17,
        '缩小向右':18,
        '缩小向上':19,
        '缩小向下':20,


        '缩小向后':21,
        '放大向前':22,
        '向左滑走+放大出现':23,
        '向右滑走+放大出现':24,
        '向上滑走+放大出现':25,
        '向下滑走+放大出现':26,
        '缩小离开+放大出现':27,

        '向右翻转':29,
        '向上翻转':30,
        '掉落':36,
        '向下翻书':41,

        '向左翻书（连续）':42,
        '向右翻书（连续）':43,

        '自左旋转出现':50,
        '自右旋转出现':51,
        '自上旋转出现':52,
        '自下旋转出现':53,
        '向左旋转离开（渐变）':54,
        '向右旋转离开（渐变）':55,
        '向上旋转离开（渐变）':56,
        '向下旋转离开（渐变）':57,
        '向左方块旋转':58,
        '向右方块旋转':59,
        '向上方块旋转':60,
        '向下方块旋转':61,
        '弧线向左':62,
        '弧线向右':63,
        '弧线向上':64,
        '弧线向下':65,
        '交替翻页':66,
        '碰撞翻页':67
    },isProperty: true },
    { name: 'forwardTransition',showName:'后翻效果', type: propertyType.Select, default:'同上一页',options:{
        '同上一页':-1,
         '无':0,
        '向左滑走（平移）':1,
        '向右滑走（平移）':2,
        '向上滑走（平移）':3,
        '向下滑走（平移）':4,

        '向左滑走（平移渐变）':9,
        '向右滑走（平移渐变）':10,
        '向上滑走（平移渐变）':11,
        '向下滑走（平移渐变）':12,

        '向左滑走（覆盖视差）':13,
        '向右滑走（覆盖视差）':14,
        '向上滑走（覆盖视差）':15,
        '向下滑走（覆盖视差）':16,

        '缩小向左':17,
        '缩小向右':18,
        '缩小向上':19,
        '缩小向下':20,


        '缩小向后':21,
        '放大向前':22,
        '向左滑走+放大出现':23,
        '向右滑走+放大出现':24,
        '向上滑走+放大出现':25,
        '向下滑走+放大出现':26,
        '缩小离开+放大出现':27,

        '向右翻转':29,
        '向上翻转':30,
        '掉落':36,
        '向下翻书':41,

        '向左翻书（连续）':42,
        '向右翻书（连续）':43,

        '自左旋转出现':50,
        '自右旋转出现':51,
        '自上旋转出现':52,
        '自下旋转出现':53,
        '向左旋转离开（渐变）':54,
        '向右旋转离开（渐变）':55,
        '向上旋转离开（渐变）':56,
        '向下旋转离开（渐变）':57,
        '向左方块旋转':58,
        '向右方块旋转':59,
        '向上方块旋转':60,
        '向下方块旋转':61,
        '弧线向左':62,
        '弧线向右':63,
        '弧线向上':64,
        '弧线向下':65,
        '交替翻页':66,
        '碰撞翻页':67
    },isProperty: true },
    { name: 'bgColor',showName:'背景颜色', type: propertyType.Color, default: '', isProperty: true }
];
propertyMap['class'] = [
    ...propertyMap['container'],
    { name: 'width', type: propertyType.Integer, default: 0, readOnly: true, group:'position',  isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, readOnly: true, group:'position', isProperty: true },
    { name: 'init', showName:'初始化', isEvent: true }
];
propertyMap['timer'] = [
    ...propertyMap['container'],
    { addProvides: widgetFlags.Timer},
    { name: 'totalTime',showName:'总时长', type: propertyType.Number,group:'tools', default: 10, isProperty: true},
    { name: 'loop',showName:'循环播放', type: propertyType.Boolean,group:'tools', default: false, isProperty: true},
    { name: 'play', showName:'播放', isFunc: true },
    { name: 'pause', showName:'暂停', isFunc: true },
    { name: 'seek', showName:'跳至', info: '(time)',
        property:[
            {'name':'time', showName:'跳至', 'value':null, 'type':propertyType.Float},
        ], isFunc: true },
    { name: 'loop', showName:'重复播放', isEvent: true },
    { name: 'stop', showName:'停止', isEvent: true }
];
propertyMap['world'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Root | widgetFlags.CanvasOnly},
    { name: 'autoGravity', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'gravityX', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'gravityY', type: propertyType.Number, default: 100, isProperty: true },
    { name: 'northWall', type: propertyType.Boolean, default: true, isProperty: true },
    { name: 'southWall', type: propertyType.Boolean, default: true, isProperty: true },
    { name: 'westWall', type: propertyType.Boolean, default: true, isProperty: true },
    { name: 'eastWall', type: propertyType.Boolean, default: true, isProperty: true },
    { name: 'border', type: propertyType.Integer, default: 100, isProperty: true },
    { name: 'play', showName:'播放', isFunc: true },
    { name: 'pause', showName:'暂停', isFunc: true },
    { name: 'tick',  showName:'每一帧', isEvent: true }
];
propertyMap['body'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Box | widgetFlags.CanvasOnly},
    { name: 'mass', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'globalVx', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'globalVy', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'velocityX', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'velocityY', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'angularVelocity', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'damping', type: propertyType.Number, default: 0.1, isProperty: true },
    { name: 'angularDamping', type: propertyType.Number, default: 0.1, isProperty: true },
    { name: 'fixedX', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'fixedY', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'fixedRotation', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'isCircle', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'collisionResponse', type: propertyType.Boolean, default: true, isProperty: true },
    { name: 'detectionDepth', type: propertyType.Integer, default: 2, isProperty: true },
    //{ name: 'impact', info:'{target}', isEvent: true },
    { name: 'beginContact', showName:'开始碰撞', info:'{target}', isEvent: true },
    { name: 'endContact', showName:'结束碰撞', info:'{target}', isEvent: true }
];
propertyMap['easing'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Box, addProvides:widgetFlags.Leaf},
    { name: 'type', showName:'移动方式',type: propertyType.Select, default: '无',options:{
        '线性':'linear',
        '曲线':'swing',
        '二次进':'easeInQuad',
        '二次出':'easeOutQuad',
        '二次进出':'easeInOutQuad',
        '五次进':'easeInQuint',
        '五次出':'easeOutQuint',
        '五次进出':'easeInOutQuint',
        '圆周进':'easeInCirc',
        '圆周出':'easeOutCirc',
        '圆周进出':'easeInOutCirc',
        '弹性进':'easeInElastic',
        '弹性出':'easeOutElastic',
        '弹性进出':'easeInOutElastic',
        '后退进':'easeInBack',
        '后退出':'easeOutBack',
        '后退进出':'easeInOutBack',
        '反弹进':'easeInBounce',
        '反弹出':'easeOutBounce',
        '反弹进出':'easeInOutBounce'
    }, isProperty: true },
    { name: 'radius',showName:'移动距离', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'angle',showName:'移动方向', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'duration',showName:'时长',type: propertyType.Number, default: 2, isProperty: true },
    { name: 'complete',showName:'播放完成', isEvent: true },
    { name: 'play', showName:'播放', isFunc: true },
    { name: 'pause',showName:'暂停', isFunc: true }
];

propertyMap['3dRotate'] = [
    { addRequires: widgetFlags.Root | widgetFlags.DomOnly},
];

propertyMap['effect'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Box | widgetFlags.DomOnly, addProvides:widgetFlags.Leaf},
    { name: 'type',showName:'动效类型', type: propertyType.Select,  default:'无',options:{
     '弹性进入':'bounceIn',
     '弹性进入（从上）':'bounceInDown',
     '弹性进入（从左）':'bounceInLeft',
     '弹性进入（从右）':'bounceInRight',
     '弹性进入（从下）':'bounceInUp',
     '淡入':'fadeIn',
     '自上淡入':'fadeInDown',
     ' 自上淡入（长距离）':'fadeInDownBig',
     '自左淡入':'fadeInLeft',
     '自左淡入（长距离）':'fadeInLeftBig',
     '自右淡入':'fadeInRight',
     '自右淡入（长距离）':'fadeInRightBig',
     '自下淡入':'fadeInUp',
     '自下淡入（长距离）':'fadeInUpBig',
     '翻转进入（上下）':'flipInX',
     '翻转进入（左右）':'flipInY',
     '光速进入':'lightSpeedIn',
     '滚动进入':'rollIn',
     '旋转进入':'rotateIn',
     '旋转进入（自左上）':'rotateInDownLeft',
     '旋转进入（自右上）':'rotateInDownRight',
     '旋转进入（自左下）':'rotateInUpLeft',
     '旋转进入（自右下）':'rotateInUpRight',
     '放大出现':'zoomIn',
     ' 放大出现（自上）':'zoomInDown',
     '放大出现（自左）':'zoomInLeft',
     '放大出现（自右）':'zoomInRight',
     '放大出现（自下）':'zoomInUp',
     '飞入（自上）':'slideInDown',
     '飞入（自左）':'slideInLeft',
     '飞入（自右）':'slideInRight',
     '飞入（自下）':'slideInUp',

        '弹跳':'bounce',
        '闪烁':'flash',
        '心跳':'pulse',
        '弹弹球':'rubberBand',
        '左右晃动（大幅）':'shake',
        '左右晃动（小幅）':'headShake',
        '摇动':'swing',
        '旋转晃动':'tada',
        '抖动':'wobble',
        '扭动':'jello',

        '弹性离开':'bounceOut',
        '弹性离开（向下）':'bounceOutDown',
        '弹性离开（向左）':'bounceOutLeft',
        '弹性离开（向右）':'bounceOutRight',
        '弹性离开（向上）':'bounceOutUp',
        '淡出':'fadeOut',
        '向下淡入':'fadeOutDown',
        ' 向下淡入（长距离）':'fadeOutDownBig',
        '向左淡入':'fadeOutLeft',
        '向左淡入（长距离）':'fadeOutLeftBig',
        '向右淡入':'fadeOutRight',
        ' 向右淡入（长距离）':'fadeOutRightBig',
        '向上淡入':'fadeOutUp',
        '向上淡入（长距离）':'fadeOutUpBig',
        '翻转消失（上下）':'flipOutX',
        '翻转消失（左右）':'flipOutY',
        '光速离开':'lightSpeedOut',
        '旋转离开':'rotateOut',
        '旋转离开（向左下）':'rotateOutDownLeft',
        '旋转离开（向右下）':'rotateOutDownRight',
        '旋转离开（向左上）':'rotateOutUpLeft',
        '旋转离开（向右上）':'rotateOutUpRight',
        '掉落':'hinge',
        '滚动离开':'rollOut',
        '缩小消失':'zoomOut',
        '缩小消失（向下）':'zoomOutDown',
        '缩小消失（向左）':'zoomOutLeft',
        '缩小消失（向右）':'zoomOutRight',
        '缩小消失（向上）':'zoomOutUp',
        '飞出（向下）':'slideOutDown',
        '飞出（向左）':'slideOutLeft',
        '飞出（向右）':'slideOutRight',
        '飞出（向上）':'slideOutUp'
}, isProperty: true },

    { name: 'duration',showName:'时长', type: propertyType.Number, default: 1, isProperty: true },
    { name: 'count',showName:'播放次数', type: propertyType.Integer, default: 1, isProperty: true },
    { name: 'play', showName:'播放', isFunc: true },
    { name: 'pause', showName:'暂停', isFunc: true }
];
propertyMap['track'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Timer | widgetFlags.Unique, addProvides:widgetFlags.Leaf},
    { name: 'type', type: propertyType.String, default: '', isProperty: true },
    { name: 'startTime', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'endTime', type: propertyType.Number, default: 0, isProperty: true }
];
propertyMap['db'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Root},
    { name: 'find', showName:'输出', isFunc: true, info:'(option, callback(err, result))',
        property:[
            {'name':'option', showName:'输出至', 'value':null, 'type':propertyType.Select},
            // {'name':'callback(err, result)', showName:'回调函数', 'value':null, 'type':propertyType.Function},
        ]},
    { name: 'insert', showName:'提交', isFunc: true, info:'(data, callback(err, result))',
        property:[
            {'name':'data', showName:'选择来源', 'value':null, 'type':propertyType.Select},
            // {'name':'callback(err, result)', showName:'回调函数', 'value':null, 'type':propertyType.Function},
        ]},
    { name: 'update', showName:'更新', isFunc: true, info:'(data, callback(err, result))',
        property:[
            {'name':'data', showName:'选择来源', 'value':null, 'type':propertyType.Select},
            // {'name':'callback(err, result)', showName:'回调函数', 'value':null, 'type':propertyType.Function},
        ]}
];
propertyMap['sock'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Root},
    { name: 'sockName' , showName:'名称：',  type: propertyType.String, default: null, readOnly:true , isProperty: true},
    { name: 'listened', showName:'是否监听：', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'message', showName:'消息', isEvent: true, info:'data'},
    { name: 'send', showName:'发送', isFunc: true, info:'(data)',
        property:[
            {'name':'value', showName:'内容', 'value':null, 'type':propertyType.String},
        ]},
];
propertyMap['strVar'] = [
    { name: 'changeValue', showName:'赋值', info:'(value)',
        property:[
            {'name':'value', showName:'值', 'value':null, 'type':propertyType.String},
        ], isFunc: true },
];
propertyMap['intVar'] = [
       { name: 'changeValue', showName:'赋值', info:'(value)',
        property:[
            {'name':'value', showName:'值', 'value':null, 'type':propertyType.Integer},
        ],
           isFunc: true },
];
propertyMap[dataType.oneDArr] = [
    { addRequires: widgetFlags.Root},
    { name: 'title',showName:'变量名', type: propertyType.String, default: '', isProperty: true },
    { name: 'value', showName:'值',type: propertyType.String, default: '', isProperty: true },
    { name: 'getRoot', showName:'获取父级对象', isFunc: true },
];
propertyMap[dataType.twoDArr] = [
    { addRequires: widgetFlags.Root},
    { name: 'title',showName:'变量名', type: propertyType.String, default: '', isProperty: true },
    { name: 'value', showName:'值',type: propertyType.String, default: '', isProperty: true },
    { name: 'getRoot', showName:'获取父级对象', isFunc: true },
];

for (var n in propertyMap) {
    propertyFlags[n] = {provides: 0, requires: 0};
    for (var index in propertyMap[n]) {
        if (propertyMap[n][index].addProvides !== undefined)
            propertyFlags[n].provides |= propertyMap[n][index].addProvides;
        if (propertyMap[n][index].addRequires !== undefined)
            propertyFlags[n].requires |= propertyMap[n][index].addRequires;
        if (propertyMap[n][index].removeProvides !== undefined) {
            propertyFlags[n].provides &= ~propertyMap[n][index].removeProvides;
        }
    }
}

function checkEventClass(selected) {
    if(selected.className === 'func' ||
        selected.className === 'var' ||
        selected.className === 'dbItem'||
        (selected.className === 'data'&&(selected.props.type===dataType.oneDArr||selected.props.type===dataType.twoDArr))){
        return false;
    } else {
        return true;
    }
}

function checkLockClass(selected) {
    if(selected.className === 'root'||
        selected.className === 'func'||
        selected.className === 'var' ||
        selected.className === 'dbItem'||
        (selected.className === 'data'&&(selected.props.type===dataType.oneDArr||selected.props.type===dataType.twoDArr))){
        return false;
    } else {
        return true;
    }
}

function checkNotInDomMode(selected, className) {
    let selectWidget = selected;
    if(selected.className === 'func'||
        selected.className === 'var' ||
        selected.className === 'dbItem'){
        selectWidget = selected.widget;
    } else {
        selectWidget = selected;
    }
    if(propertyFlags[className]===undefined){
        return false;
    }
    var requires = propertyFlags[className].requires;
    if ((requires & widgetFlags.DomOnly) != 0 && bridge.getRendererType(selectWidget.node) != 1)
        return true;
    return false;
}

function checkChildClass(selected, className) {
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
            (selected.className === 'data'&&(selected.props.type===dataType.oneDArr||selected.props.type===dataType.twoDArr))) {
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
            (selected.className === 'data'&&(selected.props.type===dataType.oneDArr||selected.props.type===dataType.twoDArr))){
            return false;
        } else {
            return true;
        }
    }
    if (selected.className === 'func' ||
        selected.className === 'var' ||
        selected.className === 'dbItem' ||
        isCustomizeWidget(selected.className) ||
        (selected.className === 'data'&&(selected.props.type===dataType.oneDArr||selected.props.type===dataType.twoDArr))) {
        return false;
    }
    var provides = propertyFlags[selected.className].provides;
    if ((provides & widgetFlags.Leaf) != 0)
        return false;
    //TODO: FIX ME!!!对未实现功能的暂时处理
    if(propertyFlags[className] == undefined) {
        return false;
    }
    var requires = propertyFlags[className].requires;
    if ((~(provides & widgetFlags.FLAG_MASK) & (requires & widgetFlags.FLAG_MASK)) != 0)
        return false;
    if ((requires & widgetFlags.Timer) != 0 && !selected.timerWidget)
        return false;
    if ((requires & widgetFlags.DomOnly) != 0 && bridge.getRendererType(selected.node) != 1)
        return false;
    if ((requires & widgetFlags.CanvasOnly) != 0 && bridge.getRendererType(selected.node) != 2)
        return false;
    if ((requires & widgetFlags.Unique) != 0) {
        for (var index in selected.children) {
            if (selected.children[index].className == className)
                return false;
        }
    }
    return true;
}

export { propertyType, propertyMap, checkChildClass, propertyFlags, checkEventClass, checkLockClass, checkNotInDomMode};
