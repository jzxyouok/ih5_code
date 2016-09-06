/**
 * 默认工具栏配置
 */

let img = (path) => `img/icons/${path}`;

let rectIcon = img('rect.svg');
let ellipseIcon = img('ellipse.svg');
let curveIcon = img('curve.svg');
let textIcon = img('text.svg');
let videoIcon = img('video.svg');
let audioIcon = img('audio.svg');
let containerIcon = img('container.svg');
let timerIcon = img('timer.svg');
let trackIcon = img('track.svg');
let worldIcon = img('world.svg');
let bodyIcon = img('body.svg');
let easingIcon = img('easing.svg');
let pageIcon = img('page.svg');
let effectIcon = img('effect.svg');
let canvasIcon = img('canvas.svg');
let wechatIcon = img('wechat.svg');
let slidetimerIcon = img('slidetimer.svg');
let bitmaptextIcon = img('bitmapText.svg');
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
        primary: 0,
        secondary: [
            {cid:TOOL_ID.IMAGE, name:'上传单个图片',icon:imageIcon, className:'image', upload:true},
            {cid:TOOL_ID.IMAGE_LIST, name:'上传多个图片', icon:igroupIcon, className:'imagelist', upload:true}]
    },{
        name:'几何图形',
        key:2,
        gid:2,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.RECT,name:'矩形',icon:rectIcon, className:'rect'},
            {cid:TOOL_ID.ELLIPSE,name:'椭圆',icon:ellipseIcon, className:'ellipse'},
            {cid:TOOL_ID.PATH,name:'路径',icon:curveIcon, className:'path'}]
    },{
        name:'时间轴',
        key:3,
        gid:3,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.TIMER, name:'添加时间轴', icon:timerIcon, className:'timer'},
            {cid:TOOL_ID.TRACK, name:'轨迹', icon: trackIcon, className: 'track'},
            // {cid:TOOL_ID.EASING, name:'缓动', icon: easingIcon, className: 'easing'},
            // {cid:TOOL_ID.EFFECT, name:'动效', icon: effectIcon, className: 'effect'},
            {cid:TOOL_ID.SLIDE_TIMER, name:'滑动时间轴', icon: slidetimerIcon, className: 'slidetimer',  param: {'shapeWidth': 100, 'shapeHeight': 100, 'lineWidth':0, 'fillColor':'transparent', 'totalTime': 10}}
        ]
    },{
        name:'文字',
        key:4,
        gid:4,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.TEXT,name:'文本',icon:textIcon, className:'text', param: {'text': 'Text'}},
            {cid:TOOL_ID.BITMAPTEXT,name:'位图文字',icon:bitmaptextIcon, className:'bitmaptext'}]
    },{
        name:'多媒体',
        key:5,
        gid:5,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.AUDIO,name:'音频',icon:audioIcon, className:'audio'},
            {cid:TOOL_ID.VIDEO,name:'视频',icon:videoIcon, className:'video'}
        ]
    },{
        name:'微信',
        key:6,
        gid:6,
        primary: 0,
        secondary: [{cid:TOOL_ID.WECAHT,name:'微信',icon:wechatIcon, className:'wechat'}]
    }]
    // ,{
    //     name:'容器',
    //     key:7,
    //     gid:7,
    //     primary: {cid:TOOL_ID.CONTAINER,name:'容器',icon:containerIcon, className:'container'},
    //     secondary: [
    //         {cid:TOOL_ID.PAGE,name:'页面',icon:pageIcon, className:'page'},
    //         {cid:TOOL_ID.CANVAS,name:'画布',icon:canvasIcon, className:'canvas', param: {'width': 300, 'height': 300}}
    //     ]
    // }, {
    //     name: '坐标',
    //     key: 8,
    //     gid: 8,
    //     primary: {cid:TOOL_ID.WORLD,name:'世界',icon:worldIcon, className:'world'},
    //     secondary: [
    //         {cid:TOOL_ID.BODY,name:'主体',icon:bodyIcon, className:'body'}
    //     ]
    // }
};

export default DEFAULT_TOOLBOX;
