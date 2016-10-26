/**
 * 默认工具栏配置
 */

import {dataType} from '../../stores/WidgetStore';

let img = (path) => `img/icons/${path}`;

let rectIcon = img('rect.svg');
let ellipseIcon = img('ellipse.svg');
let curveIcon = img('curve.svg');
let textIcon = img('text.svg');
let videoIcon = img('video.svg');
let audioIcon = img('audio.svg');
let containerIcon = img('container.svg');
let timerIcon = img('timer.svg');
let pageIcon = img('page.svg');
let canvasIcon = img('canvas.svg');
let wechatIcon = img('wechat.svg');
let slidetimerIcon = img('slidetimer.svg');
let bitmaptextIcon = img('bitmapText.svg');
let imageIcon = img('image.svg');
let igroupIcon = img('imageGroup.svg');
let buttonIcon = img('button.svg');
let tapAreaIcon = img('tapArea.svg');
let qrcodeIcon = img('qrCode.svg');
let fileIcon = img('file.svg');
let counterIcon = img('counter.svg');
let shareDbIcon = img('shareDb.svg');
let personalDbIcon = img('personalDb.svg');

let remotedeviceIcon = img('remoteDevice.svg');
let pcdeviceIcon = img('pcDevice.svg');
let onedarrIcon = img('oneDArr.svg');
let twodarrIcon = img('twoDArr.svg');
let composingcontainerIcon = img('composingContainer.svg');
let cominterfaceIcon = img('comInterface.svg');
let htmlIcon = img('html.svg');
let inputIcon = img('input.svg');
let moduleIcon = img('module.svg');
let tableIcon = img('table.svg');

// let trackIcon = img('track.svg');
// let worldIcon = img('world.svg');
// let bodyIcon = img('body.svg');
// let easingIcon = img('easing.svg');
// let effectIcon = img('effect.svg');

let modeType = {
    canvas: 2,  //canvas模式
    dom: 1      //dom模式
};

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
    BITMAPTEXT: 20,

    BUTTON: 21,
    TAPAREA: 22,
    QRCODE: 23,
    FILE: 24,
    COUNTER: 25,
    ShAREDB: 26,
    REMOTEDEVICE: 27,
    PCDEVICE: 28,
    TWODARR: 29,
    ONEDARR: 35,
    COMPOSINGCONTAINER:30,
    COMINTERFACE:31,

    HTML:32,
    INPUT:33,
    PERSONSALDB:34,
    MODULE : 35,
    TABLE : 36
};
var shapeParam = {'shapeWidth': 100, 'shapeHeight': 100, 'fillColor':'#FFFFFF', 'lineColor': '#000000'};
var DEFAULT_TOOLBOX = {
    name: '默认工具',
    data: [{
        name:'图片上传',
        key:1,
        gid:1,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.IMAGE, name:'上传单个图片',icon:imageIcon, className:'image', drawRect:true, upload:true, param: shapeParam},
            {cid:TOOL_ID.IMAGE_LIST, name:'上传多个图片', icon:igroupIcon, className:'imagelist', drawRect:true, upload:true, param: shapeParam}]
    },{
        name:'文字',
        key:2,
        gid:2,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.TEXT,name:'文本',icon:textIcon, className:'text', drawRectText:true, param: {'value': 'Text', 'fontSize':26, 'fontFill':'#000000'}},
            {cid:TOOL_ID.BITMAPTEXT,name:'位图文字',icon:bitmaptextIcon, className:'bitmaptext', drawRectText:true, param:{'shapeWidth': 100, 'shapeHeight': 100}}]
    },{
        name:'输入框',
        key:3,
        gid:3,
        primary: 0,
        mode: modeType.dom,
        secondary: [
            {cid:TOOL_ID.INPUT,name:'输入框',icon:inputIcon, className:'input', drawRect:true, param:{'shapeWidth': 200, 'shapeHeight': 50, 'fontSize':26}}]
    },{
        name:'几何图形',
        key:4,
        gid:4,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.RECT,name:'矩形',icon:rectIcon, className:'rect', drawRect:true, param: {'shapeWidth': 100, 'shapeHeight': 100, 'fillColor':'#EDEDED', 'lineColor': '#8F9191'}},
            {cid:TOOL_ID.ELLIPSE,name:'椭圆',icon:ellipseIcon, className:'ellipse', drawRect:true, param: {'shapeWidth': 100, 'shapeHeight': 100, 'fillColor':'#EDEDED', 'lineColor': '#8F9191'}},
            {cid:TOOL_ID.PATH,name:'形状',icon:curveIcon, className:'path', drawRect:true, param: shapeParam}]
    },{
        name:'按钮',
        key:5,
        gid:5,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.BUTTON,name:'按钮',icon:buttonIcon, className:'button', drawRect:true,
                param: {'value': 'Text', 'fillColor':'#2187F3', 'lineColor':'#2187F3','fontFill':'#FFFFFF', 'radius':20}}, //, 'fontFill':'#000000', 'radius':'20'
            {cid:TOOL_ID.TAPAREA,name:'透明按钮',icon:tapAreaIcon, className:'taparea', drawRect:true,
                param: {'fillColor':'transparent', 'lineColor': 'transparent'}}]
    },{
        name:'二维码',
        key:6,
        gid:6,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.QRCODE,name:'二维码',icon:qrcodeIcon, className:'qrcode', drawRect:true, param:{'shapeWidth': 100, 'shapeHeight': 100, 'value': '0'}}]
    },{
        name:'多媒体',
        key:7,
        gid:7,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.VIDEO,name:'视频',icon:videoIcon, className:'video', drawRect:true, upload:true,
                param: {'shapeWidth': 100, 'shapeHeight': 100}},
            {cid:TOOL_ID.AUDIO,name:'音频',icon:audioIcon, className:'audio'}]
    },{
        name:'网页',
        key:8,
        gid:8,
        primary: 0,
        mode: modeType.dom,
        secondary: [
            {cid:TOOL_ID.HTML,name:'网页',icon:htmlIcon, className:'html', drawRect:true, param:{'shapeWidth': 100, 'shapeHeight': 100}}]
    },{
        name:'文件',
        key:9,
        gid:9,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.FILE,name:'文件',icon:fileIcon, className:'file'}]
    },{
        name:'页面',
        key:10,
        gid:10,
        primary: 0,
        mode: modeType.dom,
        secondary: [
            {cid:TOOL_ID.PAGE,name:'页面',icon:pageIcon, className:'page'}]
    },{
        name:'容器',
        key:11,
        gid:11,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.CONTAINER,name:'容器',icon:containerIcon, className:'container'}
        ]
    },{
        name:'排版容器',
        key:12,
        gid:12,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.COMPOSINGCONTAINER,name:'排版容器',icon:composingcontainerIcon, className:'composingcontainer'}
        ]
    },{
        name:'画布',
        key:13,
        gid:13,
        primary: 0,
        mode: modeType.dom,
        secondary: [
            {cid:TOOL_ID.CANVAS,name:'画布',icon:canvasIcon, className:'canvas', drawRect:true, param:{'shapeWidth': 300, 'shapeHeight': 300}}
        ]
    },{
        name:'时间轴',
        key:14,
        gid:14,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.TIMER, name:'添加时间轴', icon:timerIcon, className:'timer'},
            //{cid:TOOL_ID.TRACK, name:'轨迹', icon: trackIcon, className: 'track'},
            // {cid:TOOL_ID.EASING, name:'缓动', icon: easingIcon, className: 'easing'},
            // {cid:TOOL_ID.EFFECT, name:'动效', icon: effectIcon, className: 'effect'},
            {cid:TOOL_ID.SLIDE_TIMER, name:'滑动时间轴', icon: slidetimerIcon, className: 'slidetimer', drawRect:true,
                param: {'shapeWidth': 100, 'shapeHeight': 100, 'lineWidth':0, 'fillColor':'transparent', 'totalTime': 10}}
        ]
    },{
        name:'计数器',
        key:15,
        gid:15,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.COUNTER, name:'计数器', icon: counterIcon, className:'counter', drawRect:true, param: {'value':0, 'fontSize':26, 'fontFill':'#000000'}}]
    },{
        name:'数据库',
        key:16,
        gid:16,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.PERSONSALDB, name:'私有数据库', icon: personalDbIcon, DbType:1, className:'db'},
            {cid:TOOL_ID.ShAREDB, name:'共享数据库', icon: shareDbIcon, DbType: 0, className:'db'}
        ]
    },{
        name:'二维数组',
        key:17,
        gid:17,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.TWODARR, name:'二维数组', icon: twodarrIcon, className:'data', param:{'type': dataType.twoDArr}},
            {cid:TOOL_ID.ONEDARR, name:'一维数组', icon: onedarrIcon, className:'data', param:{'type': dataType.oneDArr}}]
    },{
        name:'连接',
        key:19,
        gid:19,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.COMINTERFACE, name:'连接', icon: cominterfaceIcon, className:'sock'}]
    },{
        name:'设备',
        key:22,
        gid:22,
        primary: 0,
        secondary: [
            {cid:TOOL_ID.REMOTEDEVICE, name:'移动设备', icon: remotedeviceIcon, className:'remotedevice'},
            {cid:TOOL_ID.REMOTEDEVICE, name:'PC设备', icon: pcdeviceIcon, className:'pcdevice'}
        ]
    },{
        name:'微信',
        key:23,
        gid:23,
        primary: 0,
        secondary: [{cid:TOOL_ID.WECAHT,name:'微信',icon:wechatIcon, className:'wechat'}]
    },{
        name:'组件',
        key:24,
        gid:24,
        primary: 0,
        secondary: [{cid:TOOL_ID.MODULE,name:'组件',icon:moduleIcon, className:'module'}]
    },{
        name:'表格',
        key:25,
        gid:25,
        primary: 0,
        secondary: [{cid:TOOL_ID.TABLE,name:'表格',icon:tableIcon, className:'table', drawRect:true,
            param:{'shapeWidth': 300, 'shapeHeight': 200, 'fillColor':'#fff', 'lineColor': '#8F9191'}
        }]
    }
    ]

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

export {modeType};
export default DEFAULT_TOOLBOX;
