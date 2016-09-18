//动效
import React from 'react';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class Animation extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            className : 'root'
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
            // , {'name':'动效','class':'dx-btn', className:'effect'}
            case 'root':
                btnData = [
                    {'name':'物理世界','class':'physical-btn', className:'world'}
                ];
                break;
            case 'image':
            case 'imagelist':
            case 'text':
            case 'bitmaptext':
            case 'rect':
            case 'ellipse':
            case 'path':
            case 'qrcode':
            case 'counter':
                btnData = [
                    {'name':'轨迹','class':'locus-btn', className:'track'},
                    {'name':'缓动','class':'easing-btn', className:'easing'},
                    {'name':'物体','class':'object-btn', className:'body'}
                ];
                break;
            case 'container':
                btnData = [
                    {'name':'轨迹','class':'locus-btn', className:'track'},
                    {'name':'缓动','class':'easing-btn', className:'easing'}
                ];
                break;
            case 'video':
            case 'slidetimer':
                btnData = [
                    {'name':'缓动','class':'easing-btn', className:'easing'}
                ];
                break;
            case 'audio':
            case 'file':
            case 'composingcontainer':
            case 'timer':
            case 'database':
            case 'cominterface':
            case 'remotedevice':
            case 'pcdevice':
            case 'wechat':
                btnData = [];
                break;
            default : btnData = [];
        }
        //添加fx变量
        if (this.state.className !== 'text' || this.state.className !== 'counter'|| this.state.className !== 'twodvar') {
            btnData.unshift({'name':'变量fx','class':'fx-btn', className:'fx'});
        }

        return (
            <div className='Animation'>
                {
                    btnData.map((v,i)=>{
                        return <button key={i}
                                       className={ 'btn btn-clear ' + v.class }
                                       title={v.name}
                                       onClick={ this.addWidgetBtn.bind(this, v.className, v.param)} />
                    })
                }
            </div>
        );
    }
}

module.exports = Animation;