import bridge from 'bridge';
import {isCustomizeWidget} from '../stores/WidgetStore';

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
    { name: 'originPos', showName:'originPosImgTag',type: propertyType.Select,imgClassName:'originPos',default: '左上', options:{'上':[0.5,0],'下':[0.5,1],'左':[0,0.5],'右':[1,0.5],'中心':[0.5,0.5],'左上':[0,0],'左下':[0,1],'右上':[1,0],'右下':[1,1]}, group:'position',isProperty: true },
    { name: 'rotation',showName:'rotationImgTag', type: propertyType.Integer,imgClassName:'rotation', default: 0, group:'position', isProperty: true },
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
];
propertyMap['counter'] = [
    { name: 'changeValue', showName:'赋值', info:'(value)',
        property:[
            {'name':'value', showName:'值', 'value':null, 'type':propertyType.String},
        ], isFunc: true },
    ...propertyMap['sprite'],
    { name: 'value',showName:'数值', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'precision', type: propertyType.Integer,group:'tools', default: 0, isProperty: true },
    ...propertyMap['textBox'],
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
    ...propertyMap['textBox']
];
propertyMap['ellipse'] = [
    ...propertyMap['graphics']
];
propertyMap['path'] = [
    ...propertyMap['graphics'],
    { name: 'path',showName:'路径', type: propertyType.String, default: '', isProperty: true }
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
    //...propertyMap['container'],
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Root | widgetFlags.DomOnly},
    { name: 'backwardTransition',showName:'前翻效果',  type: propertyType.Select, default:'无',options:{
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
    { name: 'forwardTransition',showName:'后翻效果', type: propertyType.Select, default:'无',options:{
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
    { name: 'type', type: propertyType.String, default: '', isProperty: true },
    { name: 'radius', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'angle', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'duration', type: propertyType.Number, default: 2, isProperty: true },
    { name: 'complete', showName:'播放完成', isEvent: true },
    { name: 'play', showName:'播放', isFunc: true },
    { name: 'pause', showName:'暂停', isFunc: true }
];
propertyMap['effect'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Box | widgetFlags.DomOnly, addProvides:widgetFlags.Leaf},
    { name: 'type',showName:'动效类型', type: propertyType.Select,  default:'无',options:{
     'bounceIn':'bounceIn',
     'bounceInDown':'bounceInDown',
     'bounceInLeft':'bounceInLeft',
     'bounceInRight':'bounceInRight',
     'bounceInUp':'bounceInUp',
     'fadeIn':'fadeIn',
     'fadeInDown':'fadeInDown',
     'fadeInDownBig':'fadeInDownBig',
     'fadeInLeft':'fadeInLeft',
     'fadeInLeftBig':'fadeInLeftBig',
     'fadeInRight':'fadeInRight',
     'fadeInRightBig':'fadeInRightBig',
     'fadeInUp':'fadeInUp',
     'fadeInUpBig':'fadeInUpBig',
     'flipInX':'flipInX',
     'flipInY':'flipInY',
     'lightSpeedIn':'lightSpeedIn',
     'rollIn':'rollIn',
     'rotateIn':'rotateIn',
     'rotateInDownLeft':'rotateInDownLeft',
     'rotateInDownRight':'rotateInDownRight',
     'rotateInUpLeft':'rotateInUpLeft',
     'rotateInUpRight':'rotateInUpRight',
     'zoomIn':'zoomIn',
     'zoomInDown':'zoomInDown',
     'zoomInLeft':'zoomInLeft',
     'zoomInRight':'zoomInRight',
     'zoomInUp':'zoomInUp',
     'slideInDown':'slideInDown',
     'slideInLeft':'slideInLeft',
     'slideInRight':'slideInRight',
     'slideInUp':'slideInUp',





        'bounce':'bounce',
        'flash':'flash',
        'pulse':'pulse',
        'rubberBand':'rubberBand',
        'shake':'shake',
        'headShake':'headShake',
        'swing':'swing',
        'tada':'tada',
        'wobble':'wobble',
        'jello':'jello',





        'bounceOut':'bounceOut',
        'bounceOutDown':'bounceOutDown',
        'bounceOutLeft':'bounceOutLeft',
        'bounceOutRight':'bounceOutRight',
        'bounceOutUp':'bounceOutUp',
        'fadeOut':'fadeOut',
        'fadeOutDown':'fadeOutDown',
        'fadeOutDownBig':'fadeOutDownBig',
        'fadeOutLeft':'fadeOutLeft',
        'fadeOutLeftBig':'fadeOutLeftBig',
        'fadeOutRight':'fadeOutRight',
        'fadeOutRightBig':'fadeOutRightBig',
        'fadeOutUp':'fadeOutUp',
        'fadeOutUpBig':'fadeOutUpBig',
        'flipOutX':'flipOutX',
        'flipOutY':'flipOutY',
        'lightSpeedOut':'lightSpeedOut',
        'rotateOut':'rotateOut',
        'rotateOutDownLeft':'rotateOutDownLeft',
        'rotateOutDownRight':'rotateOutDownRight',
        'rotateOutUpLeft':'rotateOutUpLeft',
        'rotateOutUpRight':'rotateOutUpRight',
        'hinge':'hinge',
        'rollOut':'rollOut',
        'zoomOut':'zoomOut',
        'zoomOutDown':'zoomOutDown',
        'zoomOutLeft':'zoomOutLeft',
        'zoomOutRight':'zoomOutRight',
        'zoomOutUp':'zoomOutUp',
        'slideOutDown':'slideOutDown',
        'slideOutLeft':'slideOutLeft',
        'slideOutRight':'slideOutRight',
        'slideOutUp':'slideOutUp'
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
            {'name':'option', showName:'选项', 'value':null, 'type':propertyType.String},
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
    { name: 'listened', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'message', showName:'消息', isEvent: true, info:'data'},
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

for (var n in propertyMap) {
    propertyFlags[n] = {provides: 0, requires: 0};
    for (var index in propertyMap[n]) {
        if (propertyMap[n][index].addProvides !== undefined)
            propertyFlags[n].provides |= propertyMap[n][index].addProvides;
        if (propertyMap[n][index].addRequires !== undefined)
            propertyFlags[n].requires |= propertyMap[n][index].addRequires;
    }
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
            selected.className === 'dbItem') {
            return false;
        } else {
            return true;
        }
    }
    if(className === 'var') {
        if((selected.className === 'twodvar' ||
            selected.className === 'counter' ||
            selected.className === 'func' ||
            selected.className === 'var' ||
            selected.className === 'dbItem')){
            return false;
        } else {
            return true;
        }
    }
    if (selected.className === 'func' ||
        selected.className === 'var' ||
        selected.className === 'dbItem' ||
        isCustomizeWidget(selected.className)) {
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

export { propertyType, propertyMap, checkChildClass, propertyFlags };
