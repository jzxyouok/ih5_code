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
    Boolean2:10
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
    { name: 'getRoot', isFunc: true },
];


propertyMap['root'] = [
    ...propertyMap['widget'],
    { addProvides: widgetFlags.Root | widgetFlags.Container},
    { name: 'width',showName:'w', type: propertyType.Integer, default: 0, group:'position',  isProperty: true },
    { name: 'height', showName:'h',type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'scaleType',showName:'适配', type: propertyType.Select, default:'满屏',options:{'适中':1,'居上':2,'居中':4,'居下':3,'满屏':5}, group:'tools', isProperty: true},
    { name: 'clipped',showName:'剪切', type: propertyType.Boolean, default: false,group:'tools', isProperty: true },
    { name: 'color',showName:'舞台颜色', type: propertyType.Color2, default: '', group:'tools', isProperty: true },
    { name: 'init', isEvent: true },
    { name: 'click', isEvent: true, info:'{globalX, globalY}'},
    { name: 'touchDown', isEvent: true, info:'{globalX, globalY}'},
    { name: 'touchUp', isEvent: true, info:'{globalX, globalY}'},
    { name: 'swipeLeft', isEvent: true },
    { name: 'swipeRight', isEvent: true },
    { name: 'swipeUp', isEvent: true },
    { name: 'swipeDown', isEvent: true },
    { name: 'create', info:'(class,id,props,bottom)', isFunc: true },
    { name: 'gotoPage', info:'(page)', isFunc: true },
    { name: 'gotoPageNum', info:'(num)', isFunc: true },
    { name: 'nextPage', isFunc: true },
    { name: 'prevPage', isFunc: true },
    { name: 'getTouchX', isFunc: true },
    { name: 'getTouchY', isFunc: true }
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
    { name: 'positionX',showName:'x', type: propertyType.Integer, default: 0, group:'position', isProperty: true},
    { name: 'positionY',showName:'y', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'scaleX', showName:'w',type: propertyType.Float, default: 0, group:'position', isProperty: true },
    { name: 'scaleY',showName:'h',showLock:true ,type: propertyType.Float, default: 0, group:'position', isProperty: true},
    { name: 'originPos', showName:'originPosImgTag',type: propertyType.Select,imgClassName:'originPos',default: '左上', options:{'上':[0.5,0],'下':[0.5,1],'左':[0,0.5],'右':[1,0.5],'中心':[0.5,0.5],'左上':[0,0],'左下':[0,1],'右上':[1,0],'右下':[1,1]}, group:'position',isProperty: true },
    { name: 'rotation',showName:'rotationImgTag', type: propertyType.Integer,imgClassName:'rotation', default: 0, group:'position', isProperty: true },
    { name: 'alpha',showName:'不透明度', type: propertyType.Percentage, default: 1, group:'display', isProperty: true },
    { name: 'visible',showName:'初始可见', type: propertyType.Boolean2, default: 1, group:'tools', isProperty: true },
    { name: 'click', isEvent: true, info:'{globalX, globalY}'},
    { name: 'touchDown', isEvent: true, info:'{globalX, globalY}'},
    { name: 'touchUp', isEvent: true, info:'{globalX, globalY}'},
    { name: 'swipeLeft', isEvent: true },
    { name: 'swipeRight', isEvent: true },
    { name: 'swipeUp', isEvent: true },
    { name: 'swipeDown', isEvent: true },
    { name: 'show', isEvent: true },
    { name: 'hide', isEvent: true },
];

propertyMap['sprite'] = [
    ...propertyMap['box'],
];

propertyMap['textBox']=[
    { name: 'fontFamily',showName:'字体', type: propertyType.Select,group:'tools', default: '选择字体', isProperty: true },
    { name: 'fontSize',showName:'字体大小', type: propertyType.Number,group:'tools', default: 26, isProperty: true },
    { name: 'fontFill',showName:'字体颜色', type: propertyType.Color,group:'tools', default: '#000000', isProperty: true },
]


propertyMap['text'] = [
    ...propertyMap['sprite'],
    { name: 'value',showName:'内容', type: propertyType.Text,  default: '', isProperty: true } ,
    ...propertyMap['textBox'],
];

propertyMap['counter'] = [
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
    { name: 'play', isFunc: true },
    { name: 'pause', isFunc: true }
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
    { name: 'width', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: true},
    { name: 'shapeWidth', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'shapeHeight', type: propertyType.Integer, default: 0, group:'position', isProperty: true},
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
    { name: 'create', info:'(class,id,props,bottom)', isFunc: true }
];

propertyMap['canvas'] = [
    ...propertyMap['container'],
    { name: 'width', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, group:'position', isProperty: true}
];

propertyMap['page'] = [
    ...propertyMap['container'],
    { addRequires: widgetFlags.Root | widgetFlags.DomOnly},
    { name: 'forwardTransition', type: propertyType.Integer, default: -1, isProperty: true },
    { name: 'backwardTransition', type: propertyType.Integer, default: -1, isProperty: true },
    { name: 'bgColor', type: propertyType.Color, default: '', isProperty: true }
];

propertyMap['class'] = [
    ...propertyMap['container'],
    { name: 'width', type: propertyType.Integer, default: 0, readOnly: true, group:'position',  isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, readOnly: true, group:'position', isProperty: true },
    { name: 'init', isEvent: true }
];

propertyMap['timer'] = [
    ...propertyMap['container'],
    { addProvides: widgetFlags.Timer},
    { name: 'totalTime',showName:'总时长', type: propertyType.Number,group:'tools', default: 10, isProperty: true},
    { name: 'loop',showName:'循环播放', type: propertyType.Boolean,group:'tools', default: false, isProperty: true},
    { name: 'play', isFunc: true },
    { name: 'pause', isFunc: true },
    { name: 'seek', info: '(time)', isFunc: true },
    { name: 'loop', isEvent: true },
    { name: 'stop', isEvent: true }
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
    { name: 'play', isFunc: true },
    { name: 'pause', isFunc: true },
    { name: 'tick', isEvent: true }
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
    { name: 'beginContact', info:'{target}', isEvent: true },
    { name: 'endContact', info:'{target}', isEvent: true }
];

propertyMap['easing'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Box, addProvides:widgetFlags.Leaf},
    { name: 'type', type: propertyType.String, default: '', isProperty: true },
    { name: 'radius', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'angle', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'duration', type: propertyType.Number, default: 2, isProperty: true },
    { name: 'complete', isEvent: true },
    { name: 'play', isFunc: true },
    { name: 'pause', isFunc: true }
];

propertyMap['effect'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Box | widgetFlags.DomOnly, addProvides:widgetFlags.Leaf},
    { name: 'type', type: propertyType.String, default: '', isProperty: true },
    { name: 'duration', type: propertyType.Number, default: 1, isProperty: true },
    { name: 'count', type: propertyType.Integer, default: 1, isProperty: true },
    { name: 'play', isFunc: true },
    { name: 'pause', isFunc: true }
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
    { name: 'find', isFunc: true, info:'(option, callback(err, result))' },
    { name: 'insert', isFunc: true, info:'(data, callback(err, result))' },
    { name: 'update', isFunc: true, info:'(data, callback(err, result))' }
];

propertyMap['sock'] = [
    ...propertyMap['widget'],
    { addRequires: widgetFlags.Root},
    { name: 'listened', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'message', isEvent: true, info:'data'},
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
    // 对函数,变量,自定义的处理
    if (selected.className === 'func' || selected.className === 'var' || isCustomizeWidget(selected.className)) {
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
