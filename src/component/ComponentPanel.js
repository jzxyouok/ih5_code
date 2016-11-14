import React from 'react';
//import ComponentList from './ComponentList';
import { Collapse } from 'antd';
const Panel = Collapse.Panel;

//let rectIcon = require('../images/rectNormal.png');
//let ellipseIcon = require('../images/ellipseNormal.png');
//let curveIcon = require('../images/curveNormal.png');
//let textIcon = require('../images/textNormal.png');
//let videoIcon = require('../images/videoNormal.png');
//let audioIcon = require('../images/audioNormal.png');
//let containerIcon = require('../images/containerNormal.png');
//let timerIcon = require('../images/timerNormal.png');
//let trackIcon = require('../images/trackNormal.png');
//let wechatIcon = require('../images/wechatNormal.png');
//let slidetimerIcon = require('../images/slidetimerNormal.png');
//let bitmaptextIcon = require('../images/bitmaptextNormal.png');
//let imageIcon = require('../images/imageNormal.png');
//let igroupIcon = require('../images/igroupNormal.png');
//let folderIcon = require('../images/folder.svg');
//let buttonIcon = require('../images/base/button.svg');
//let tapAreaIcon = require('../images/base/tapArea.svg');
//let qrcodeIcon = require('../images/base/qrCode.svg');
//let fileIcon = require('../images/base/file.svg');
//let counterIcon = require('../images/base/counter.svg');
//let remotedeviceIcon = require('../images/base/remoteDevice.svg');
//let pcdeviceIcon = require('../images/base/pcDevice.svg');
//let onedarrIcon = require('../images/base/oneDArr.svg');
//let twodarrIcon = require('../images/base/twoDArr.svg');
//let composingcontainerIcon = require('../images/base/composingContainer.svg');
//let cominterfaceIcon = require('../images/base/comInterface.svg');
//let htmlIcon = require('../images/base/html.svg');
//let pageIcon = require('../images/base/page.svg');
//let canvasIcon = require('../images/base/canvas.svg');
//let inputIcon = require('../images/base/input.svg');
//let worldIcon = require('../images/worldNormal.png');
//let bodyIcon = require('../images/bodyNormal.png');
//let easingIcon = require('../images/easingNormal.png');
//let effectIcon = require('../images/effectNormal.png');

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
                {cid:this.cid++,icon:"imageIcon", className:'image', drawRect:true, upload:true},
                {cid:this.cid++,icon:"igroupIcon", className:'imagelist', drawRect:true, upload:true},
                {cid:this.cid++,icon:"timerIcon", className:'timer'},
                {cid:this.cid++,icon:"containerIcon", className:'container'},
                {cid:this.cid++,icon:"rectIcon", className:'rect', drawRect:true, param: this.shapeParam},
                {cid:this.cid++,icon:"ellipseIcon", className:'ellipse', drawRect:true, param: this.shapeParam},
                {cid:this.cid++,icon:"curveIcon", className:'path', drawRect:true, param: this.shapeParam},
                {cid:this.cid++,icon:"slidetimerIcon", className:'slidetimer', drawRect:true, param: {'shapeWidth': 100, 'shapeHeight': 100, 'lineWidth':0, 'fillColor':'transparent', 'totalTime': 10}},
                {cid:this.cid++,icon:"textIcon", className:'text', drawRectText:true, param: {'text': 'Text'}},
                {cid:this.cid++,icon:"videoIcon", className:'video', drawRect:true, upload:true,},
                {cid:this.cid++,icon:"audioIcon", className:'audio'},
                {cid:this.cid++,icon:"trackIcon", className:'track'},
                {cid:this.cid++,icon:"worldIcon", className:'world'},
                {cid:this.cid++,icon:"bodyIcon", className:'body'},
                {cid:this.cid++,icon:"easingIcon", className:'easing'},
                {cid:this.cid++,icon:"pageIcon", className:'page'},
                {cid:this.cid++,icon:"effectIcon", className:'effect'},
                {cid:this.cid++,icon:"canvasIcon", className:'canvas', param: {'width': '100%', 'height': '100%'}},
                {cid:this.cid++,icon:"domIcon", className:'dom', param: {'width': '100%', 'height': '100%'}},
                {cid:this.cid++,icon:"wechatIcon", className:'wechat'},
                {cid:this.cid++,icon:"bitmaptextIcon", className:'bitmaptext', drawRectText:true, param:{'shapeWidth': 100, 'shapeHeight': 100}},
                {cid:this.cid++,icon:"folderIcon", className:'folder'},
                {cid:this.cid++,icon:"buttonIcon", className:'button', drawRect:true, param: {'value': 'Text', 'fillColor':'#2187F3', 'lineColor':'#2187F3','fontFill':'#000000', 'radius':20}},
                {cid:this.cid++,icon:"tapAreaIcon", className:'taparea', drawRect:true, param: {'fillColor':'transparent'}},
                {cid:this.cid++,icon:"qrcodeIcon", className:'qrcode', drawRectText:true, param:{'shapeWidth': 100, 'shapeHeight': 100, 'data': '0'}},
                {cid:this.cid++,icon:"fileIcon", className:'file'},
                {cid:this.cid++,icon:"counterIcon", className:'counter', drawRect:true, param: {'value':0}},
                {cid:this.cid++,icon:"remotedeviceIcon", className:'remotedevice'},
                {cid:this.cid++,icon:"pcdeviceIcon", className:'pcdevice'},
                {cid:this.cid++,icon:"onedarrIcon", className:'oneDArr'},
                {cid:this.cid++,icon:"twodarrIcon", className:'twoDArr'},
                {cid:this.cid++,icon:"flexIcon", className:'flex', param: {'width': '100%', 'height': '100%'}},
                {cid:this.cid++,icon:"cominterfaceIcon", className:'cominterface'},
                {cid:this.cid++,icon:"htmlIcon", className:'html', drawRect:true, param:{'shapeWidth': 100, 'shapeHeight': 100}},
                {cid:this.cid++,icon:"pageIcon", className:'page'},
                {cid:this.cid++,icon:"canvasIcon", className:'canvas', drawRect:true, param: {'width': 300, 'height': 300}},
                {cid:this.cid++,icon:"inputIcon", className:'input', param:{'shapeWidth': 200, 'shapeHeight': 50}},
                {cid:this.cid++,icon:"tableIcon", className:'table', param:{'shapeWidth': 300, 'shapeHeight': 200, 'fillColor':'transparent'}},
            ]
            }
        ];
    }

    render() {
        //var panels = this.panels;
        //
        //var items = [];
        //for (var i = 0; i < panels.length; i++) {
        //    items.push(
        //        <Panel header={panels[i].name} key={panels[i].key}>
        //          <ComponentList content={panels[i].cplist} />
        //        </Panel>
        //    );
        //}

        return (
            <div>
                {
                    //<Collapse defaultActiveKey={['1']} onChange={callback} accordion>
                    //    {items}
                    //</Collapse>
                }
            </div>
        );
    }
}

module.exports = ComponentPanel;

