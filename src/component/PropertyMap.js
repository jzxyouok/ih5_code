const propertyType = {
    Integer: 0,
    Number: 1,
    String: 2,
    Text: 3,
    Boolean: 4,
    Percentage: 5
};

const propertyMap = {};

propertyMap['widget'] = [
    { name: 'id', type: propertyType.String, default: '', isProperty: true }
];

propertyMap['root'] = [
    ...propertyMap['widget'],
    { name: 'width', type: propertyType.Integer, default: 0, readOnly: true, group:'position',  isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, readOnly: true, group:'position', isProperty: true },
    { name: 'init', isEvent: true },
    { name: 'create', info:'(class,id,props,bottom)', isFunc: true }
];

propertyMap['box'] = [
    ...propertyMap['widget'],
    { name: 'positionX', type: propertyType.Integer, default: 0, group:'position', isProperty: true},
    { name: 'positionY', type: propertyType.Integer, default: 0, group:'position', isProperty: true },
    { name: 'scaleX', type: propertyType.Number, default: 1, group:'position', isProperty: true },
    { name: 'scaleY', type: propertyType.Number, default: 1, group:'position', isProperty: true },
    { name: 'alpha', type: propertyType.Percentage, default: 1, group:'display', isProperty: true },
    { name: 'rotation', type: propertyType.Integer, default: 0, group:'display', isProperty: true },
    { name: 'visible', type: propertyType.Boolean, default: true, group:'display', isProperty: true },
    { name: 'click', isEvent: true },
    { name: 'show', isEvent: true },
    { name: 'hide', isEvent: true }
];

propertyMap['sprite'] = [
    ...propertyMap['box'],
    { name: 'originX', type: propertyType.Number, default: 0, group:'position', isProperty: true },
    { name: 'originY', type: propertyType.Number, default: 0, group:'position', isProperty: true },
    { name: 'width', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, group:'position', readOnly: true, isProperty: true}
];

propertyMap['text'] = [
    ...propertyMap['sprite'],
    { name: 'text', type: propertyType.Text, default: '', isProperty: true }
];

propertyMap['image'] = [
    ...propertyMap['sprite']
];

propertyMap['graphics'] = [
    ...propertyMap['box'],
    { name: 'originX', type: propertyType.Number, default: 0, group:'position', isProperty: true },
    { name: 'originY', type: propertyType.Number, default: 0, group:'position', isProperty: true },
    { name: 'bgcolor', type: propertyType.Integer, default: 0, group:'position', isProperty: true }
];

propertyMap['rect'] = [
    ...propertyMap['graphics']
];

propertyMap['container'] = [
    ...propertyMap['box'],
    { name: 'create', info:'(class,id,props,bottom)', isFunc: true }
];

propertyMap['class'] = [
    ...propertyMap['container'],
    { name: 'width', type: propertyType.Integer, default: 0, readOnly: true, group:'position',  isProperty: true },
    { name: 'height', type: propertyType.Integer, default: 0, readOnly: true, group:'position', isProperty: true },
    { name: 'init', isEvent: true }
];

propertyMap['timer'] = [
    ...propertyMap['container'],
    { name: 'totalTime', type: propertyType.Number, default: 10, isProperty: true},
    { name: 'loop', type: propertyType.Boolean, default: false, isProperty: true},
    { name: 'play', isFunc: true },
    { name: 'pause', isFunc: true },
    { name: 'seek', info: '(time)', isFunc: true },
    { name: 'loop', isEvent: true },
    { name: 'stop', isEvent: true }
];

propertyMap['world'] = [
    ...propertyMap['widget'],
    { name: 'autoGravity', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'northWall', type: propertyType.Boolean, default: true, isProperty: true },
    { name: 'southWall', type: propertyType.Boolean, default: true, isProperty: true },
    { name: 'westWall', type: propertyType.Boolean, default: true, isProperty: true },
    { name: 'eastWall', type: propertyType.Boolean, default: true, isProperty: true },
    { name: 'border', type: propertyType.Integer, default: 100, isProperty: true },
    { name: 'play', isFunc: true },
    { name: 'pause', isFunc: true }
];

propertyMap['body'] = [
    ...propertyMap['widget'],
    { name: 'mass', type: propertyType.Number, default: 1, isProperty: true },
    { name: 'velocityX', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'velocityY', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'angularVelocity', type: propertyType.Number, default: 0, isProperty: true },
    { name: 'damping', type: propertyType.Number, default: 0.1, isProperty: true },
    { name: 'angularDamping', type: propertyType.Number, default: 0.1, isProperty: true },
    { name: 'fixedX', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'fixedY', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'fixedRotation', type: propertyType.Boolean, default: false, isProperty: true },
    { name: 'impact', info:'{target}', isEvent: true },
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

export { propertyType, propertyMap };
