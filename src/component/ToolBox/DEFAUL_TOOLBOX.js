/**
 * 默认工具栏配置
 */

let img = (path) => `/dist/img/icons/${path}`;

let rectIcon = img('rect.svg');
let ellipseIcon = img('ellipseNormal.svg');
let curveIcon = img('curveNormal.svg');
let textIcon = img('text.svg');
let videoIcon = img('videoNormal.svg');
let audioIcon = img('audioNormal.svg');
let containerIcon = img('containerNormal.svg');
let timerIcon = img('timer.svg');
let trackIcon = img('trackNormal.svg');
let worldIcon = img('worldNormal.svg');
let bodyIcon = img('bodyNormal.svg');
let easingIcon = img('easingNormal.svg');
let pageIcon = img('pageNormal.svg');
let effectIcon = img('effectNormal.svg');
let canvasIcon = img('canvasNormal.svg');
let wechatIcon = img('wechatNormal.svg');
let slidetimerIcon = img('slidetimerNormal.svg');
let bitmaptextIcon = img('bitmaptextNormal.svg');
let imageIcon = img('image.svg');
let igroupIcon = img('imageGroup.svg');

var cid = 1;
var TOOL_ID = {
    IMAGE: 2,
    IMAGE_LIST: 3,
    TIMER: 4,
    CONTAINER: 5,
    RECT: 6,
    ELLIPSE: 7,
    PATH: 8,
    SLIDE_TIMER: 9,
    TEXT: 10,
    VIDEO: 11,
    AUDIO: 12,
    TRACK: 13,
    WORLD: 14,
    BODY: 15,
    EASING: 16,
    PAGE: 17,
    EFFECT: 18,
    CANVAS: 19,
    WECAHT: 20,
    BITMAPTEXT: 21
};

var DEFAULT_TOOLBOX = {
    name: '默认工具',
    data: [{
        name:'图片上传',
        key:1,
        gid:1,
        primary: {cid:cid++,name:'上传单个图片',icon:imageIcon, className:'image', upload:true},
        secondary: [
            {cid:cid++,name:'上传多个图片', icon:igroupIcon, className:'imagelist', upload:true}]
    },{
        name:'几何图形',
        key:2,
        gid:2,
        primary: {cid:cid++,name:'矩形',icon:rectIcon, className:'rect'},
        secondary: [
            {cid:cid++,name:'椭圆',icon:ellipseIcon, className:'ellipse'},
            {cid:cid++,name:'路径',icon:curveIcon, className:'path'}]
    },{
        name:'时间轴',
        key:3,
        gid:3,
        primary: {cid:cid++,name:'添加时间轴',icon:timerIcon, className:'timer'}
    },{
        name:'文字',
        key:4,
        gid:4,
        primary: {cid:cid++,name:'文本',icon:textIcon, className:'text'},
        secondary: [
            {cid:cid++,name:'位图文字',icon:bitmaptextIcon, className:'bitmaptext'}]
    }]
};

export default DEFAULT_TOOLBOX;