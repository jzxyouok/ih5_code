//对象视图（工具右边对象树、资源等）

import React from 'react';
import $class from 'classnames'

//import Outline from './Outline';
//import ParamsPanel from './ParamsPanel';
import ObjectTree from './ObjectTree'
import Resource from './Resource'
import Animation from './Animation'

import WidgetActions from '../../actions/WidgetActions'

class ObjectView extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            whichContent : 0,
            whichContentData : ["对象树","资源"]
        };
        this.toggleBtn = this.toggleBtn.bind(this);
        this.create = this.create.bind(this);
    }

    toggleBtn(i){
        this.setState({
            whichContent : i
        })
    }

    create(className,param){
        WidgetActions['addWidget'](className,param);
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
            <div className="ObjectView">
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
                   <button className="btn btn-clear delete-btn" title="删除" />
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
