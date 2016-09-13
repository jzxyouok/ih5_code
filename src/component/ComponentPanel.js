import React from 'react';
import ComponentList from './ComponentList';
import { Collapse } from 'antd';
const Panel = Collapse.Panel;

// let testicon = require('../images/testicon.svg');
// let testicon1 = require('../images/testicon1.svg');
// let testicon2 = require('../images/testicon2.svg');
// let testicon3 = require('../images/testicon3.svg');
// let testicon4 = require('../images/testicon4.svg');

//let imageIcon = require('../images/imageNormal.png');
let rectIcon = require('../images/rectNormal.png');
let ellipseIcon = require('../images/ellipseNormal.png');
let curveIcon = require('../images/curveNormal.png');
let textIcon = require('../images/textNormal.png');
let videoIcon = require('../images/videoNormal.png');
let audioIcon = require('../images/audioNormal.png');
let containerIcon = require('../images/containerNormal.png');
let timerIcon = require('../images/timerNormal.png');
let trackIcon = require('../images/trackNormal.png');
let worldIcon = require('../images/worldNormal.png');
let bodyIcon = require('../images/bodyNormal.png');
let easingIcon = require('../images/easingNormal.png');
let pageIcon = require('../images/pageNormal.png');
let effectIcon = require('../images/effectNormal.png');
let canvasIcon = require('../images/canvasNormal.png');
let wechatIcon = require('../images/wechatNormal.png');
let slidetimerIcon = require('../images/slidetimerNormal.png');
let bitmaptextIcon = require('../images/bitmaptextNormal.png');
let imageIcon = require('../images/imageNormal.png');
let igroupIcon = require('../images/igroupNormal.png');

let folderIcon = require('../images/folder.svg');
let buttonIcon = require('../images/base/button.svg');
let transbuttonIcon = require('../images/base/transButton.svg');
let qrcodeIcon = require('../images/base/qrCode.svg');
let fileIcon = require('../images/base/file.svg');
let counterIcon = require('../images/base/counter.svg');
let databaseIcon = require('../images/base/database.svg');
let remotedeviceIcon = require('../images/base/remoteDevice.svg');
let pcdeviceIcon = require('../images/base/pcDevice.svg');
let twodvarIcon = require('../images/base/twoDvar.svg');

function callback() {
    //console.log(key);
}

class ComponentPanel extends React.Component {
    constructor (props) {
        super(props);
        this.cid = 1;
        this.shapeParam = {'shapeWidth': 100, 'shapeHeight': 100, 'fillColor':'#FFFFFF', 'lineColor': '#000000'};
        this.panels = [
            {name:'基础组件',key:1,cplist: [
                {cid:this.cid++,icon:imageIcon, className:'image', upload:true},
                {cid:this.cid++,icon:igroupIcon, className:'imagelist', upload:true},
                {cid:this.cid++,icon:timerIcon, className:'timer'},
                {cid:this.cid++,icon:containerIcon, className:'container'},
                {cid:this.cid++,icon:rectIcon, className:'rect', param: this.shapeParam},
                {cid:this.cid++,icon:ellipseIcon, className:'ellipse', param: this.shapeParam},
                {cid:this.cid++,icon:curveIcon, className:'path', param: this.shapeParam},
                {cid:this.cid++,icon:slidetimerIcon, className:'slidetimer', param: {'shapeWidth': 100, 'shapeHeight': 100, 'lineWidth':0, 'fillColor':'transparent', 'totalTime': 10}},
                {cid:this.cid++,icon:textIcon, className:'text', param: {'text': 'Text'}},
                {cid:this.cid++,icon:videoIcon, className:'video'},
                {cid:this.cid++,icon:audioIcon, className:'audio'},
                {cid:this.cid++,icon:trackIcon, className:'track'},
                {cid:this.cid++,icon:worldIcon, className:'world'},
                {cid:this.cid++,icon:bodyIcon, className:'body'},
                {cid:this.cid++,icon:easingIcon, className:'easing'},
                {cid:this.cid++,icon:pageIcon, className:'page'},
                {cid:this.cid++,icon:effectIcon, className:'effect'},
                {cid:this.cid++,icon:canvasIcon, className:'canvas', param: {'width': 300, 'height': 300}},
                {cid:this.cid++,icon:wechatIcon, className:'wechat'},
                {cid:this.cid++,icon:bitmaptextIcon, className:'bitmaptext', param:{'shapeWidth': 100, 'shapeHeight': 100}},
                {cid:this.cid++,icon:folderIcon, className:'folder'},

                {cid:this.cid++,icon:buttonIcon, className:'button'},
                {cid:this.cid++,icon:transbuttonIcon, className:'transbutton'},
                {cid:this.cid++,icon:qrcodeIcon, className:'qrcode'},
                {cid:this.cid++,icon:fileIcon, className:'file'},
                {cid:this.cid++,icon:counterIcon, className:'counter'},
                {cid:this.cid++,icon:databaseIcon, className:'database'},
                {cid:this.cid++,icon:remotedeviceIcon, className:'remotedevice'},
                {cid:this.cid++,icon:pcdeviceIcon, className:'pcdevice'},
                {cid:this.cid++,icon:twodvarIcon, className:'twodvar'}]
            }
        ];
    }

    render() {

        // var panels = [
        //     {name:'基础组件',key:1,cplist: [
        //         {cid:'1',icon:testicon},
        //         {cid:'3',icon:testicon2},
        //         {cid:'4',icon:testicon3},
        //         {cid:'5',icon:testicon4}
        //         ]
        //     },
        //     {name:'排版容器',key:2,cplist:[
        //         {cid:'1',icon:testicon},
        //         {cid:'2',icon:testicon1},
        //         {cid:'3',icon:testicon2},
        //         {cid:'4',icon:testicon3},
        //         {cid:'5',icon:testicon4}
        //         ]
        //     },
        //     {name:'动效动画',key:3,cplist:[{cid:'3',icon:'http://img.zcool.cn/community/014abe557e8ed50000002d5c19e576.jpg'}]},
        //     {name:'交互组件',key:4,cplist:[{cid:'4',icon:'http://img.zcool.cn/community/014abe557e8ed50000002d5c19e576.jpg'}]},
        //     {name:'物理组件',key:5,cplist:[{cid:'5',icon:'http://img.zcool.cn/community/014abe557e8ed50000002d5c19e576.jpg'}]},
        //     {name:'数据组件',key:6,cplist:[{cid:'6',icon:'http://img.zcool.cn/community/014abe557e8ed50000002d5c19e576.jpg'}]},
        //     {name:'应用组件',key:7,cplist:[{cid:'7',icon:'http://img.zcool.cn/community/014abe557e8ed50000002d5c19e576.jpg'}]}
        // ];
        var cid = 1;
        var shapeParam = {'shapeWidth': 100, 'shapeHeight': 100, 'fillColor':'#FFFFFF', 'lineColor': '#000000'};
        var panels = [
            {name:'基础组件',key:1,cplist: [
                {cid:cid++,icon:imageIcon, className:'image', upload:true},
                {cid:cid++,icon:igroupIcon, className:'imagelist', upload:true},
                {cid:cid++,icon:timerIcon, className:'timer'},
                {cid:cid++,icon:containerIcon, className:'container'},
                {cid:cid++,icon:rectIcon, className:'rect', param: shapeParam},
                {cid:cid++,icon:ellipseIcon, className:'ellipse', param: shapeParam},
                {cid:cid++,icon:curveIcon, className:'path', param: shapeParam},
                {cid:cid++,icon:slidetimerIcon, className:'slidetimer', param: {'shapeWidth': 100, 'shapeHeight': 100, 'lineWidth':0, 'fillColor':'transparent', 'totalTime': 10}},
                {cid:cid++,icon:textIcon, className:'text', param: {'text': 'Text'}},
                {cid:cid++,icon:videoIcon, className:'video'},
                {cid:cid++,icon:audioIcon, className:'audio'},
                {cid:cid++,icon:trackIcon, className:'track'},
                {cid:cid++,icon:worldIcon, className:'world'},
                {cid:cid++,icon:bodyIcon, className:'body'},
                {cid:cid++,icon:easingIcon, className:'easing'},
                {cid:cid++,icon:pageIcon, className:'page'},
                {cid:cid++,icon:effectIcon, className:'effect'},
                {cid:cid++,icon:canvasIcon, className:'canvas', param: {'width': 300, 'height': 300}},
                {cid:cid++,icon:wechatIcon, className:'wechat'},
                {cid:cid++,icon:bitmaptextIcon, className:'bitmaptext', param:{'shapeWidth': 100, 'shapeHeight': 100}},
                {cid:cid++,icon:folderIcon, className:'folder'}
                ]
            }
        ];

        var items = [];
        for (var i = 0; i < panels.length; i++) {
            items.push(
                <Panel header={panels[i].name} key={panels[i].key}>
                  <ComponentList content={panels[i].cplist} />
                </Panel>
            );
        }

        return (
            <div>
                <Collapse defaultActiveKey={['1']} onChange={callback} accordion>
                    {items}
                </Collapse>
            </div>
        );
    }
}

module.exports = ComponentPanel;

