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
let textIcon = require('../images/textNormal.png');
let containerIcon = require('../images/containerNormal.png');
let timerIcon = require('../images/timerNormal.png');
let trackIcon = require('../images/trackNormal.png');
let worldIcon = require('../images/worldNormal.png');
let bodyIcon = require('../images/bodyNormal.png');
let easingIcon = require('../images/easingNormal.png');

function callback() {
    //console.log(key);
}

class ComponentPanel extends React.Component {

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
        var panels = [
            {name:'基础组件',key:1,cplist: [
                {cid:1,icon:timerIcon, className:'timer'},
                {cid:2,icon:containerIcon, className:'container'},
                {cid:3,icon:rectIcon, className:'rect', param: {'width': 100, 'height': 100, 'bgcolor':0xFFFFFF}},
                {cid:4,icon:textIcon, className:'text', param: {'text': 'Text'}},
                {cid:5,icon:trackIcon, className:'track'},
                {cid:5,icon:worldIcon, className:'world'},
                {cid:5,icon:bodyIcon, className:'body'},
                {cid:5,icon:easingIcon, className:'easing'}
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

