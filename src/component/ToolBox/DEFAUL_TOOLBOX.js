let img = (path) => `/dist/img/icons/${path}`;

let rectIcon = img('rect.svg');
let ellipseIcon = img('ellipseNormal.png');
let curveIcon = img('curveNormal.png');
let textIcon = img('text.svg');
let videoIcon = img('videoNormal.png');
let audioIcon = img('audioNormal.png');
let containerIcon = img('containerNormal.png');
let timerIcon = img('timer.svg');
let trackIcon = img('trackNormal.png');
let worldIcon = img('worldNormal.png');
let bodyIcon = img('bodyNormal.png');
let easingIcon = img('easingNormal.png');
let pageIcon = img('pageNormal.png');
let effectIcon = img('effectNormal.png');
let canvasIcon = img('canvasNormal.png');
let wechatIcon = img('wechatNormal.png');
let slidetimerIcon = img('slidetimerNormal.png');
let bitmaptextIcon = img('bitmaptextNormal.png');
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