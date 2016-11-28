/**
 * Created by Brian on 28/11/2016.
 */
//判断对象类型
function getType(o){
    var _t;
    return ((_t = typeof(o)) == "object" ? o==null && "null" || Object.prototype.toString.call(o).slice(8,-1):_t).toLowerCase();
}
//获取元素样式
function getStyle(el, styleName) {
    return el.style[styleName] ? el.style[styleName] : el.currentStyle ? el.currentStyle[styleName] : window.getComputedStyle(el, null)[styleName];
}
function getStyleNum(el, styleName) {
    return parseInt(getStyle(el, styleName).replace(/px|pt|em/ig,''));
}
function setStyle(el, obj){
    if (getType(obj) == "object") {
        for (let s in obj) {
            var cssArrt = s.split("-");
            for (var i = 1; i < cssArrt.length; i++) {
                cssArrt[i] = cssArrt[i].replace(cssArrt[i].charAt(0), cssArrt[i].charAt(0).toUpperCase());
            }
            var cssArrtnew = cssArrt.join("");
            el.style[cssArrtnew] = obj[s];
        }
    }
    else
    if (getType(obj) == "string") {
        el.style.cssText = obj;
    }
}
function getSize(el) {
    if (getStyle(el, "display") != "none") {
        return { width: el.offsetWidth || getStyleNum(el, "width"), height: el.offsetHeight || getStyleNum(el, "height") };
    }
    var _addCss = { display: "", position: "absolute", visibility: 'hidden' };
    var _oldCss = {};
    for (let i in _addCss) {
        _oldCss[i] = getStyle(el, i);
    }
    setStyle(el, _addCss);
    var _width = el.clientWidth || getStyleNum(el, "width");
    var _height = el.clientHeight || getStyleNum(el, "height");
    for (let i in _oldCss) {
        setStyle(el, _oldCss);
    }
    return { width: _width, height: _height };
}

export {getSize}