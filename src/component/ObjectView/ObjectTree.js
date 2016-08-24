//对象树
import React from 'react';

class ObjectTree extends React.Component {
    constructor (props) {
        super(props);
        this.state = {

        };
    }


    render() {
        let num = 0;
        let url = "/dist/img/thumbnails.png";
        let objectData = {
            showState:1,
            openState:2,
            children:[
                {showState:0,openState:0,name:"111",images:url,event:1,children:[]}
                , {showState:1,openState:1,name:"111",images:url,event:"",
                    children:[
                        {showState:0,openState:0,name:"222",images:url,event:"",children:[]}
                        , {showState:1,openState:1,name:"222",images:url,event:"",
                            children:[
                                {showState:0,openState:0,name:"333",images:url,event:"",children:[]}
                            ]}
                        , {showState:0,openState:0,name:"222",images:url,event:"",children:[]}
                    ]}
                , {showState:0,openState:0,name:"111",images:url,event:"",children:[]}
                , {showState:1,openState:1,name:"111",images:url,event:"",
                    children:[
                        {showState:0,openState:0,name:"222",images:url,event:"",children:[]}
                        , {showState:1,openState:1,name:"222",images:url,event:1,
                            children:[
                                {showState:0,openState:0,name:"333",images:url,event:"",children:[]}
                            ]}
                    ]}
                , {showState:0,openState:0,name:"111",images:url,event:"",children:[]}
            ]
        };

        let btn = (show)=>{
            //0图层及图层内的所有内容不可看，1可在舞台看见
            if(show === 0 ){
                return <div className="btn f--hcc hide-btn"><span /></div>;
            }else{
                return <div className="btn f--hcc show-btn"><span /></div>;
            }
        };

        let icon = (open)=>{
            // 0是该图层下不包含任何内容，1有内容，但是内容收起来， 2有内容，且展开内容
            if(open === 0){
                return null;
            }
            else if(open === 1){
                return <span className="icon close-icon" />;
            }
            else {
                return <span className="icon open-icon" />;
            }
        };

        let stageContent = (data)=>{
            num++;
            let content = data.map(xxx);
            num--;
            return content;
        };
        //Todo:active 选中状态，放在item-title后面，stage-title后面为选中舞台
        let xxx = (v,i)=>{
            return  <div className="item" key={i}>
                        <div className="item-title f--h f--hlc" style={{ paddingLeft: num === 0 ? "28px" :num *20 + 22 +"px" }}>
                            { btn(v.showState) }
                            { icon(v.openState) }
                            <img src={v.images} />
                            <p>{v.name}</p>
                            {
                                v.event
                                    ? <span className="event-icon" />
                                    : null
                            }
                        </div>
                        {
                            v.children.length === 0
                                ? null
                                : stageContent(v.children)
                        }
                    </div>;
        };

        return (
            <div className="ObjectTree">
                <div className="stage">
                    <div className="stage-title f--h f--hlc">
                        { btn(objectData.showState) }
                        { icon(objectData.openState) }
                        <span className="stage-icon" />
                        <p>舞台</p>
                    </div>

                    <div className="stage-content">
                        {
                            objectData.children.length === 0
                            ? null
                            : stageContent(objectData.children)
                        }
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ObjectTree;

