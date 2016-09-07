//对象视图（工具右边对象树、资源等）

import React from 'react';
import $class from 'classnames';
import $ from 'jquery';

//import Outline from './Outline';
//import ParamsPanel from './ParamsPanel';
import ObjectTree from './ObjectTree';
import Resource from './Resource';
import Animation from './Animation';

import WidgetActions from '../../actions/WidgetActions';

class ObjectView extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            whichContent : 0,
            whichContentData : ["对象树","资源"],
            width : null
        };
        this.toggleBtn = this.toggleBtn.bind(this);
        this.create = this.create.bind(this);
        this.delete = this.delete.bind(this);
        this.dragLeftBtn = this.dragLeftBtn.bind(this);
    }

    componentDidMount() {
        this.dragLeftBtn();
    }

    componentWillUnmount() {

    }

    toggleBtn(i){
        this.setState({
            whichContent : i
        })
    }

    create(className,param){
        WidgetActions['addWidget'](className,param);
    }

    delete(){
        WidgetActions['removeWidget']();
    }

    dragLeftBtn(){
        let move = false;
        let _x;
        let self = this;
        let initialWidth = 280;
        $(".drag-left").mousedown(function(e){
            move=true;
            _x=e.pageX;
        });
        $(document).mousemove(function(e){
            if(move){
                let x = -( e.pageX - _x);
                self.setState({
                    width : initialWidth + x
                });
            }
        }).mouseup(function(){
            move=false;
            initialWidth = self.state.width <=280 ? 280 : self.state.width;
        });
    }

    render() {
        let content;
        switch (this.state.whichContent){
            case 0 :
                content = <ObjectTree />;
                break;
            case 1 :
                content = <Resource />;
                break;
        }

        return (
            <div className="ObjectView" style={{width:this.state.width}}>
                <div className="drag-left"></div>

                <nav className="ov--nav f--h">
                    <ul className="ul-clear flex-1 f--h">
                        {
                            this.state.whichContentData.map((v,i)=>{
                                return  <li key={i}
                                            className={$class({ "active": i === this.state.whichContent})}
                                            onClick={ this.toggleBtn.bind(this, i) }>
                                            {v}
                                        </li>
                            })
                        }
                    </ul>

                    <button className="btn btn-clear" title="收起" />
                </nav>

                <div className="ov--main f--h">
                    <div className="ov--content flex-1">
                        { content }
                    </div>

                    <Animation />
                </div>

                <div className="ov--footer f--h f--hlc">
                    {
                        // not-allowed 为不可点击
                    }
                    <button className="btn btn-clear lock-btn not-allowed" title="锁住" />
                    <button className="btn btn-clear folder-btn" title="文件夹"  />
                    <button className="btn btn-clear container-btn" title="容器" onClick={ this.create.bind(this,"container",null)} />
                    <button className="btn btn-clear event-btn" title="事件" />
                    <button className="btn btn-clear new-btn" title="新建" />
                    <button className="btn btn-clear delete-btn" title="删除" onClick={ this.delete } />
                </div>

                {
                    //<Outline />
                    //<br />
                    //<ParamsPanel />
                }
            </div>
        );
    }
}

module.exports = ObjectView;
