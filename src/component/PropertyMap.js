const propertyType = {
    Integer: 0,
    Number: 1,
    String: 2,
    Text: 3,
    Boolean: 4,
    Percentage: 5,
    Color: 6,
    Select:7
};

const propertyMap = {};

propertyMap['widget'] = [
    { name: 'ID', type: propertyType.String, default: '', isProperty: false},
    { name: 'getRoot', isFunc: true }
];


propertyMap['root'] = [
    ...propertyMap['widget'],
    { name: 'width',showName:'w', type: propertyType.Integer, default: 0, group:'position',  isProperty: true },
    { name: 'height', showName:'h',type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    //需要功能改造
    { name: 'scaleType',showName:'适配', type: propertyType.Select, default: '满屏',options:['适中','居上','居中','居下','满屏'], group:'tools', isProperty: true},
    { name: 'clipped',showName:'剪切', type: propertyType.Boolean, default: false,group:'tools', isProperty: true },

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
    { name: 'title', type: propertyType.String, default: '', isProperty: true },
    { name: 'desc', type: propertyType.String, default: '', isProperty: true },
    { name: 'imgUrl', type: propertyType.String, default: '', isProperty: true }
];

propertyMap['box'] = [
    ...propertyMap['widget'],
    { name: 'positionX',showName:'x', type: propertyType.Integer, default: 0, group:'position', isProperty: true},
    { name: 'positionY',showName:'y', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'scaleX', type: propertyType.Number, default: 1, group:'position', isProperty: false },
    { name: 'scaleY', type: propertyType.Number, default: 1, group:'position', isProperty: false },
    { name: 'alpha',showName:'不透明度', type: propertyType.Percentage, default: 1, group:'display', isProperty: true },
    { name: 'visible',showName:'初始可见', type: propertyType.Boolean, default: true, group:'display', isProperty: true },
    { name: 'click', isEvent: true, info:'{globalX, globalY}'},
    { name: 'touchDown', isEvent: true, info:'{globalX, globalY}'},
    { name: 'touchUp', isEvent: true, info:'{globalX, globalY}'},
    { name: 'swipeLeft', isEvent: true },
    { name: 'swipeRight', isEvent: true },
    { name: 'swipeUp', isEvent: true },
    { name: 'swipeDown', isEvent: true },
    { name: 'show', isEvent: true },
    { name: 'hide', isEvent: true }
];

propertyMap['sprite'] = [
    ...propertyMap['box'],
    { name: 'originX', type: propertyType.Number, default: 0, group:'position', isProperty: false },
    { name: 'originY', type: propertyType.Number, default: 0, group:'position', isProperty: false },
    { name: 'width', showName:'w',type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'height',showName:'h',showLock:true ,type: propertyType.Integer, default: 0, group:'position', isProperty: true},
    { name: 'originPos', showName:'originPosImgTag',type: propertyType.Select,imgClassName:'originPos',default: '上',options:['上','左','右','中心','左上','左下','右上','右下'], group:'position',isProperty: true },
    { name: 'rotation',showName:'rotationImgTag', type: propertyType.Integer,imgClassName:'rotation', default: 0, group:'position', isProperty: true },

];

propertyMap['text'] = [
    { name: 'text',showName:'内容', type: propertyType.Text, default: '', isProperty: true },
    ...propertyMap['sprite']

];

propertyMap['video'] = [
    ...propertyMap['sprite'],
    { name: 'url', type: propertyType.String, default: '', isProperty: true }
];

propertyMap['audio'] = [
    ...propertyMap['widget'],
    { name: 'url', type: propertyType.String, default: '', isProperty: true },
    { name: 'play', isFunc: true },
    { name: 'pause', isFunc: true }
];

propertyMap['image'] = [
    { name: 'link',showName:'资源', type: propertyType.Integer, default:0, isProperty: true },
    ...propertyMap['sprite'],

];

propertyMap['imagelist'] = [
    ...propertyMap['sprite'],
    { name: 'delay', type: propertyType.Number, default: 0.2, isProperty: true },
];

propertyMap['bitmaptext'] = [
    ...propertyMap['sprite'],
    { name: 'text', type: propertyType.Text, default:'', isProperty: true },
    { name: 'font', type: propertyType.String, default:'', isProperty: true },
    { name: 'size', type: propertyType.Integer, default:20, isProperty: true },
    { name: 'color', type: propertyType.Color, default:'', isProperty: true },
    { name: 'lineHeight', type: propertyType.Integer, default:10, isProperty: true }
];

propertyMap['graphics'] = [
    ...propertyMap['box'],
    { name: 'originX', type: propertyType.Number, default: 0, group:'position', isProperty: true },
    { name: 'originY', type: propertyType.Number, default: 0, group:'position', isProperty: true },
    { name: 'width', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: true},
    { name: 'shapeWidth', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'shapeHeight', type: propertyType.Integer, default: 0, group:'position', isProperty: true},
    { name: 'fillColor', type: propertyType.Color, default: '', group:'position', isProperty: true },
    { name: 'lineColor', type: propertyType.Color, default: '', group:'position', isProperty: true },
    { name: 'lineWidth', type: propertyType.Integer, default: 1, group:'position', isProperty: true }
];

propertyMap['rect'] = [
    ...propertyMap['graphics']
];

propertyMap['slidetimer'] = [
    ...propertyMap['box'],
    { name: 'originX', type: propertyType.Number, default: 0, group:'position', isProperty: true },
    { name: 'originY', type: propertyType.Number, default: 0, group:'position', isProperty: true },
    { name: 'width', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: true},
    { name: 'shapeWidth', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'shapeHeight', type: propertyType.Integer, default: 0, group:'position', isProperty: true},
    { name: 'fillColor', type: propertyType.Color, default: '', group:'position', isProperty: true },
    { name: 'loop', type: propertyType.Boolean, default: false, isProperty: true},
    { name: 'vertical', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'sliderScale', type: propertyType.Number, default: 1, isProperty: true},
    { name: 'totalTime', type: propertyType.Number, default: 10, isProperty: true}

];

propertyMap['ellipse'] = [
    ...propertyMap['graphics']
];

propertyMap['path'] = [
    ...propertyMap['graphics'],
    { name: 'path', type: propertyType.String, default: '', isProperty: true }
];

propertyMap['container'] = [
    ...propertyMap['box'],
    { name: 'create', info:'(class,id,props,bottom)', isFunc: true }
];

propertyMap['canvas'] = [
    ...propertyMap['container'],
    { name: 'width', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, group:'position', isProperty: true}
];

propertyMap['page'] = [
    ...propertyMap['container'],
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
    { name: 'totalTime',showName:'总时长', type: propertyType.Number, default: 10, isProperty: true},
    { name: 'loop',showName:'循环播放', type: propertyType.Boolean, default: false, isProperty: true},
    ...propertyMap['container'],
    { name: 'width', showName:'w',type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'height',showName:'h',showLock:true ,type: propertyType.Integer, default: 0, group:'position', isProperty: true},

    { name: 'play', isFunc: true },
    { name: 'pause', isFunc: true },
    { name: 'seek', info: '(time)', isFunc: true },
    { name: 'loop', isEvent: true },
    { name: 'stop', isEvent: true }
];

propertyMap['world'] = [
    ...propertyMap['widget'],
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
    { name: 'type', type: propertyType.String, default: '', isProperty: true },
    { name: 'duration', type: propertyType.Number, default: 1, isProperty: true },
    { name: 'count', type: propertyType.Integer, default: 1, isProperty: true },
    { name: 'play', isFunc: true },
    { name: 'pause', isFunc: true }
];

propertyMap['track'] = [
    ...propertyMap['widget'],
    { name: 'type', type: propertyType.String, default: '', isProperty: true }
];

export { propertyType, propertyMap };
