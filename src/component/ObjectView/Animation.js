//动效
import React from 'react';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';
import {checkChildClass} from '../PropertyMap';

const animationData = [
    {name:'变量', class:'var-btn', className:'var', disabled:false, param:{key:'', value:''}},
    {name:'函数', class:'func-btn', className:'func', disabled:false, param:{key:'',value:''}},
    {name:'轨迹', class:'locus-btn', className:'track', disabled:false},
    {name:'缓动', class:'easing-btn', className:'easing', disabled:false},
    {name:'物体', class:'object-btn', className:'body', disabled:false}
];

class Animation extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            data: animationData
        };
        this.onStatusChange = this.onStatusChange.bind(this);
        this.checkAnimationEnable = this.checkAnimationEnable.bind(this);
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
            this.checkAnimationEnable(widget.selectWidget);
        } else if (widget.selectFunction) {
            this.checkAnimationEnable(widget.selectFunction);
        }
    }

    checkAnimationEnable(widget) {
        //过滤可选的功能组件
        let data = animationData;
        for(let i = 0; i<data.length; i++) {
            if(data[i].className === 'func'&&
                (widget.className !== 'func'&&
                widget.className != 'vars')) {
                data[i].disabled = false;
            } else if((data[i].className === 'var')
                &&(widget.className !== 'twodvar'&&
                widget.className !== 'counter' &&
                widget.className !== 'func' &&
                widget.className != 'vars')) {
                data[i].disabled = false;
            } else {
                if (checkChildClass(widget, data[i].className)) {
                    data[i].disabled = false;
                } else {
                    data[i].disabled = true;
                }
            }
        }
        this.setState({
            data: data
        });
    };

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