//动效
import React from 'react';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class Animation extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            className : "root"
        };
        this.onStatusChange = this.onStatusChange.bind(this);
        this.addWidgetBtn = this.addWidgetBtn.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getStore());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        //是否选中图层或者舞台上的组件
        if(widget.selectWidget){
            this.setState({
                className : widget.selectWidget.className
            });
            //console.log(widget.selectWidget.className);
        }
    }

    addWidgetBtn(className,param){
        WidgetActions['addWidget'](className, param);
    }

    render() {
        let btnData = [];
        switch (this.state.className){
            case "root" :
                btnData = [{"name":"物理世界","class":"physical-btn","className":"world"}];
                break;
            case "container":
                btnData = [{"name":"物理世界","class":"physical-btn","className":"world"}];
                break;
            case "page" :
                btnData = [{"name":"轨迹","class":"locus-btn", className:'track'}
                           , {"name":"动效","class":"dx-btn", className:'effect'}
                           , {"name":"缓动","class":"easing-btn", className:'easing'}];
                break;
            case "image" :
                btnData = [{"name":"轨迹","class":"locus-btn", className:'track'}
                    , {"name":"动效","class":"dx-btn", className:'effect'}
                    , {"name":"缓动","class":"easing-btn", className:'easing'}
                    , {"name":"物理世界","class":"physical-btn","className":"world"}
                    , {"name":"物体","class":"object-btn", className:'body'}];
                break;
            case "imagelist" :
                btnData = [{"name":"轨迹","class":"locus-btn", className:'track'}
                    , {"name":"动效","class":"dx-btn", className:'effect'}
                    , {"name":"缓动","class":"easing-btn", className:'easing'}
                    , {"name":"物理世界","class":"physical-btn","className":"world"}
                    , {"name":"物体","class":"object-btn", className:'body'}];
                break;
            case "text" :
                btnData = [{"name":"轨迹","class":"locus-btn", className:'track'}
                    , {"name":"动效","class":"dx-btn", className:'effect'}
                    , {"name":"缓动","class":"easing-btn", className:'easing'}
                    , {"name":"物理世界","class":"physical-btn","className":"world"}
                    , {"name":"物体","class":"object-btn", className:'body'}];
                break;
            case "bitmaptext" :
                btnData = [{"name":"轨迹","class":"locus-btn", className:'track'}
                    , {"name":"动效","class":"dx-btn", className:'effect'}
                    , {"name":"缓动","class":"easing-btn", className:'easing'}
                    , {"name":"物理世界","class":"physical-btn","className":"world"}
                    , {"name":"物体","class":"object-btn", className:'body'}];
                break;
            case "rect" :
                btnData = [{"name":"轨迹","class":"locus-btn", className:'track'}
                    , {"name":"动效","class":"dx-btn", className:'effect'}
                    , {"name":"缓动","class":"easing-btn", className:'easing'}
                    , {"name":"物理世界","class":"physical-btn","className":"world"}
                    , {"name":"物体","class":"object-btn", className:'body'}];
                break;
            case "ellipse" :
                btnData = [{"name":"轨迹","class":"locus-btn", className:'track'}
                    , {"name":"动效","class":"dx-btn", className:'effect'}
                    , {"name":"缓动","class":"easing-btn", className:'easing'}
                    , {"name":"物理世界","class":"physical-btn","className":"world"}
                    , {"name":"物体","class":"object-btn", className:'body'}];
                break;
            case "path" :
                btnData = [{"name":"轨迹","class":"locus-btn", className:'track'}
                    , {"name":"动效","class":"dx-btn", className:'effect'}
                    , {"name":"缓动","class":"easing-btn", className:'easing'}
                    , {"name":"物理世界","class":"physical-btn","className":"world"}
                    , {"name":"物体","class":"object-btn", className:'body'}];
                break;
            case "wechat" :
                btnData = [];
                break;
            case "video" :
                btnData = [];
                break;
            case "audio" :
                btnData = [];
                break;
            case "timer" :
                btnData = [];
                break;
            case "slidetimer" :
                btnData = [];
                break;
            default : btnData = [];
        }
        return (
            <div className="Animation">
                {
                    btnData.map((v,i)=>{
                        return <button key={i}
                                       className={ "btn btn-clear " + v.class }
                                       title={v.name}
                                       onClick={ this.addWidgetBtn.bind(this, v.className, v.param)} />
                    })
                }
            </div>
        );
    }
}

module.exports = Animation;