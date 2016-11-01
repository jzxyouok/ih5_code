/**
 * Created by Brian on 1/11/2016.
 */
import React from 'react';
import $class from 'classnames';
import { Input, InputNumber} from 'antd';

class RangeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value || {from: null, to: null}
        };
        this.onChange = this.onChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value || {from: null, to: null}
        });
    }

    onChange(type,e) {
        let value = this.state.value;
        let eValue = null;
        if(this.props.type&&this.props.type==='number') {
            eValue = e;
        } else {
            eValue = e.target.value;
        }
        switch (type) {
            case 'from':
                value.from = eValue;
                break;
            case 'to':
                value.to = eValue;
                break;
            default:
                break;
        }
        this.setState({
            value: value
        }, ()=>{
            this.props.onChange(this.state.value);
        })
    }

    render() {
        return (<div className="range-inputs f--hlc">
            {
                this.props.type&&this.props.type==='number'
                    ? <div className="f--hlc">
                    <InputNumber onChange={this.onChange.bind(this, 'from')} value={this.state.value.from} size={this.props.size}/>
                    <span style={{padding: '0 4px'}}>—</span>
                <InputNumber onChange={this.onChange.bind(this, 'to')} value={this.state.value.to} size={this.props.size}/>
                </div>
                    : <div className="f--hlc">
                    <Input onChange={this.onChange.bind(this, 'from')} value={this.state.value.from} size={this.props.size}/>
                    <span style={{padding: '0 4px'}}>—</span>
                <Input onChange={this.onChange.bind(this, 'to')} value={this.state.value.to} size={this.props.size}/>
                </div>
            }
        </div>);
    }
}

export {RangeComponent};