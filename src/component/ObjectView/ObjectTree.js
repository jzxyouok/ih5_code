//对象树
import React from 'react';
import $class from "classnames"

class ObjectTree extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            nid : null
            , openData : []
        };
        this.chooseBtn = this.chooseBtn.bind(this);
        //this.openBtn = this.openBtn.bind(this);
        //this.closeBtn = this.closeBtn.bind(this);
    }

    chooseBtn(data){
        this.setState({
            nid : data
        })
    }

    //openBtn(id){
    //    let data = this.state.openData;
    //    data.push(id);
    //    console.log(data);
    //    this.setState({
    //        openData : data
    //    });
    //}
    //
    //closeBtn(id){
    //    let data = this.state.openData;
    //    let index = data.indexOf(id);
    //    data.splice(index, 1);
    //    console.log(data);
    //    this.setState({
    //        openData : data
    //    })
    //}

    render() {
        let num = 0;
        let url = "/dist/img/thumbnails.png";
        let objectData = {
            showState:1,
            openState:2,
            nid:1,
            children:[
                {showState:0,openState:0,name:"111",images:url,event:1,nid:2,children:[]}
                , {showState:1,openState:2,name:"111",images:url,event:"",nid:3,
                    children:[
                        {showState:0,openState:0,name:"222",images:url,event:"",nid:4,children:[]}
                        , {showState:1,openState:1,name:"222",images:url,event:"",nid:5,
                            children:[
                                {showState:0,openState:0,name:"333",images:url,event:"",nid:6,children:[]}
                            ]}
                        , {showState:0,openState:0,name:"222",images:url,event:"",nid:7,children:[]}
                    ]}
                , {showState:0,openState:0,name:"111",images:url,event:"",nid:8,children:[]}
                , {showState:1,openState:1,name:"111",images:url,event:"",nid:9,
                    children:[
                        {showState:0,openState:0,name:"222",images:url,event:"",nid:10,children:[]}
                        , {showState:1,openState:1,name:"222",images:url,event:1,nid:11,
                            children:[
                                {showState:0,openState:0,name:"333",images:url,event:"",nid:12,children:[]}
                            ]}
                    ]}
                , {showState:0,openState:0,name:"111",images:url,event:"",nid:13,children:[]}
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
                return <span className="icon open-icon"  />;
            }
        };

        let stageContent = (data)=>{
            num++;
            let content = data.map(fuc);
            num--;
            return content;
        };

        //Todo:active 选中状态，放在item-title后面，stage-title后面为选中舞台
        let fuc = (v,i)=>{
            return  <div className="item" key={i}>
                        <div className={$class("item-title f--h f--hlc",{"active": v.nid === this.state.nid})}
                             onClick={this.chooseBtn.bind(this,v.nid)}
                             style={{ paddingLeft: num === 0 ? "28px" :num *20 + 22 +"px" }}>
                            { btn(v.showState) }
                            { icon(v.openState, v.nid) }
                            <img src={v.images} />
                            <p>{v.name}</p>
                            {
                                v.event
                                    ? <span className="event-icon" />
                                    : null
                            }
                        </div>

                        <div className={$class({"hidden": v.openState === 0 || v.openState === 1 })}>
                            {
                                v.children.length === 0
                                    ? null
                                    : stageContent(v.children)
                            }
                        </div>
                    </div>;
        };

        return (
            <div className="ObjectTree">
                <div className="stage">
                    <div className={$class("stage-title f--h f--hlc",{"active": objectData.nid == this.state.nid})}
                         onClick={this.chooseBtn.bind(this,objectData.nid)}>
                        { btn(objectData.showState) }
                        { icon(objectData.openState, objectData.nid) }
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

