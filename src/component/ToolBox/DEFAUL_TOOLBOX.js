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
    IMAGE: 1,
    IMAGE_LIST: 2,
    TIMER: 3,
    CONTAINER: 4,
    RECT: 5,
    ELLIPSE: 6,
    PATH: 7,
    SLIDE_TIMER: 8,
    TEXT: 9,
    VIDEO: 10,
    AUDIO: 11,
    TRACK: 12,
    WORLD: 13,
    BODY: 14,
    EASING: 15,
    PAGE: 16,
    EFFECT: 17,
    CANVAS: 18,
    WECAHT: 19,
    BITMAPTEXT: 20
};

var DEFAULT_TOOLBOX = {
    name: '默认工具',
    data: [{
        name:'图片上传',
        key:1,
        gid:1,
        primary: {cid:TOOL_ID.IMAGE, name:'上传单个图片',icon:imageIcon, className:'image', upload:true},
        secondary: [
            {cid:TOOL_ID.IMAGE_LIST, name:'上传多个图片', icon:igroupIcon, className:'imagelist', upload:true}]
    },{
        name:'几何图形',
        key:2,
        gid:2,
        primary: {cid:TOOL_ID.RECT,name:'矩形',icon:rectIcon, className:'rect'},
        secondary: [
            {cid:TOOL_ID.ELLIPSE,name:'椭圆',icon:ellipseIcon, className:'ellipse'},
            {cid:TOOL_ID.PATH,name:'路径',icon:curveIcon, className:'path'}]
    },{
        name:'时间轴',
        key:3,
        gid:3,
        primary: {cid:TOOL_ID.TIMER, name:'添加时间轴', icon:timerIcon, className:'timer'},
        secondary: [
            {cid:TOOL_ID.TRACK, name:'轨迹', icon: trackIcon, className: 'track'},
            {cid:TOOL_ID.EASING, name:'缓动', icon: easingIcon, className: 'easing'},
            {cid:TOOL_ID.EFFECT, name:'动效', icon: effectIcon, className: 'effect'},
            {cid:TOOL_ID.SLIDE_TIMER, name:'滑动时间轴', icon: slidetimerIcon, className: 'slidetimer'}
            
        ]
    },{
        name:'文字',
        key:4,
        gid:4,
        primary: {cid:TOOL_ID.TEXT,name:'文本',icon:textIcon, className:'text'},
        secondary: [
            {cid:TOOL_ID.BITMAPTEXT,name:'位图文字',icon:bitmaptextIcon, className:'bitmaptext'}]
    }]
};

export default DEFAULT_TOOLBOX;