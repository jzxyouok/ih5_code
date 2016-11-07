import bridge from 'bridge';
import {propertyType, propertyMap, widgetFlags} from '../map';

var propertyFlags = {};

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
        (selected.className === 'data'&&(selected.props.type==='oneDArr'||selected.props.type==='twoDArr'))){
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
        (selected.className === 'data'&&(selected.props.type==='oneDArr'||selected.props.type==='twoDArr'))){
        return false;
    } else {
        return true;
    }
}

function checkIsClassType(className) {
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

function checkNotInCanvasMode(selected, className) {
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
    if ((requires & widgetFlags.CanvasOnly) != 0 && bridge.getRendererType(selectWidget.node) != 2)
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

export { propertyType, propertyMap, checkChildClass, checkEventClass, checkLockClass, checkNotInDomMode, checkNotInCanvasMode, checkIsClassType};
