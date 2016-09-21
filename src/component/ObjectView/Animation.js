//动效
import React from 'react';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';
import {checkChildClass} from '../PropertyMap';

const animationData = [
    {name:'变量fx', class:'fx-btn', className:'fx', disabled:false},
    {name:'轨迹', class:'locus-btn', className:'track', disabled:false},
    {name:'缓动', class:'easing-btn', className:'easing', disabled:false},
    {name:'物体', class:'object-btn', className:'body', disabled:false}
];

class Animation extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            className : 'root',
            data: animationData
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
            //过滤可选的功能组件
            let data = animationData;
            for(let i = 0; i<data.length; i++) {
                if (checkChildClass(widget.selectWidget, data[i].className)) {
                    data[i].disabled = false;
                } else {
                    data[i].disabled = true;
                }
            }

            this.setState({
                className : widget.selectWidget.className,
                data: data
            });
            //console.log(widget.selectWidget.className);
        }
    }

    addWidgetBtn(className,param){
        WidgetActions['addWidget'](className, param);
    }

    render() {
        return (
            <div className='Animation'>
                {
                    this.state.data.map((v,i)=>{
                        return <button key={i}
                                       className={ 'btn btn-clear btn-animation ' + v.class }
                                       disabled={v.disabled}
                                       title={v.name}
                                       onClick={ this.addWidgetBtn.bind(this, v.className, v.param)} />
                    })
                }
            </div>
        );
    }
}

module.exports = Animation;