/**
 * Created by Brian on 19/10/2016.
 */

import React from 'react';
import $class from 'classnames'
import { Menu, Dropdown } from 'antd';
import { Input } from 'antd';

import WidgetStore from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import { SelectTargetButton } from '../PropertyView/SelectTargetButton';
import { propertyMap } from '../PropertyMap'

const inputType = {
    value: 1,
    formula: 2,
};

const MenuItem = Menu.Item;

class FormulaInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value&&props.value.value? props.value.value: null,
            currentType: props.value&&props.value.type? props.value.type : inputType.value,
            objectDropDownVisible: false, //对象dropdown
            propertyDropDownVisible: false, //属性dropdown
            objectList: []
        };
        this.containerId = props.containerId || 'iH5-App';
        this.minWidth = props.minWidth||'244px';
        this.onChange = props.onChange;

        this.onStatusChange = this.onStatusChange.bind(this);

        this.onObjectVisibleChange = this.onObjectVisibleChange.bind(this);
        this.onObjectSelect = this.onObjectSelect.bind(this);

        this.onPropertyVisibleChange = this.onPropertyVisibleChange.bind(this);
        this.onPropertySelect = this.onPropertySelect.bind(this);

        this.onFormulaPatternChange = this.onFormulaPatternChange.bind(this);

        this.onSelectTargetClick = this.onSelectTargetClick.bind(this);
        this.onGetObjectResult = this.onGetObjectResult.bind(this);

        this.onInputTypeValueChange = this.onInputTypeValueChange.bind(this);

        this.onGetPropertyList = this.onGetPropertyList.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    componentWillReceiveProps(nextProps) {
        this.containerId = nextProps.containerId || 'iH5-App';
        this.setState({
            value: nextProps.value&&nextProps.value.value? nextProps.value.value: null,
            currentType: nextProps.value&&nextProps.value.type? nextProps.value.type : inputType.value,
            objectList: nextProps.objectList||[]
        })
    }

    onStatusChange(widget) {
        if(!widget) {
            return;
        }
        if(widget.allWidgets){
            this.setState({
                objectList: widget.allWidgets
            });
        }
    }

    // formula mode
    onObjectVisibleChange(flag){
        this.setState({
            objectDropDownVisible: flag
        })
    }

    onObjectSelect(target){
        let object = target.item.props.object;
        this.onGetObjectResult(object);
        this.setState({
            objectDropDownVisible: false
        })
    }

    onSelectTargetClick() {
        this.setState({
            objectDropDownVisible: false
        });
        return true;
    }

    onGetObjectResult(object){
        let getTarget = false;
        this.state.objectList.forEach((v)=>{
            if(object.key === v.key){
                getTarget = true;
            }
        });
        if (getTarget) {
            let type = this.state.currentType;
            let value = this.state.value;
            let item = {objKey:object.key, property:null, pattern:null};
            if(type === inputType.value) {
                //初次进入formula mode
                type = inputType.formula;
                value = [item];
            } else {
                value.push(item);
            }
            this.setState({
                value: value,
                currentType:type
            }, ()=>{
                this.onChange({value:this.state.value, type:this.state.currentType});
            })
        }
    }

    onPropertyVisibleChange(flag) {
        this.setState({
            propertyDropDownVisible: flag
        })
    }

    onGetPropertyList(obj){
        let props = [];
        if(obj&&obj.className){
            propertyMap[obj.className].map((v, i)=> {
                if (v.isProperty && v.name != 'id') {
                    if(v.showName=='W'){
                        props.push({name:v.name, showName:'宽度'});
                    }else if(v.showName=='H'){
                        props.push({name:v.name, showName:'高度'});
                    }else if(v.showName=='中心点'){
                    }else{
                        props.push({name:v.name, showName:v.showName});
                    }
                }
            });
        }
        return props;
    }

    onPropertySelect(v, i, target){
        let property = target.item.props.property;
        let value = this.state.value;
        if(value&&value.length>0){
            v.property = property;
            value[i] = v;
        }
        this.setState({
            value: value,
            propertyDropDownVisible: false
        }, ()=>{
            this.onChange({value:this.state.value, type:this.state.currentType});
        })
    }

    onFormulaPatternChange(v, i, e) {
        let pattern = e.target.value;
        let value = this.state.value;
        if(value&&value.length>0){
            v.pattern = pattern;
            value[i] = v;
        }
        this.setState({
            value: value,
        }, ()=>{
            this.onChange({value:this.state.value, type:this.state.currentType});
        })
    }

    //value mode
    onInputTypeValueChange(e) {
        this.setState({
            value:e.target.value,
            currentType:inputType.value
        }, ()=>{
            this.onChange({value:this.state.value, type:this.state.currentType});
        });
    }

    render() {
        let objectMenuItem = (v1,i1)=>{
            return  <MenuItem key={i1} object={v1}>{v1.props.name}</MenuItem>
        };

        let objectMenu = (
            <Menu onClick={this.onObjectSelect}>
                {
                    !this.state.objectList||this.state.objectList.length==0
                        ? null
                        : this.state.objectList.map(objectMenuItem)
                }
            </Menu>
        );

        let propertyMenuItem = (v1,i1)=>{
            return  <MenuItem key={i1} property={v1}>{v1.showName?v1.showName:v1.name}</MenuItem>
        };

        let getPropertyMenu = (list, v, i)=>{
            return(
                <Menu onClick={this.onPropertySelect.bind(this, v, i)}>
                    {
                        !list||list.length==0
                            ? null
                            : list.map(propertyMenuItem)
                    }
                </Menu>
            );
        };

        let formulaList = (v, i)=> {
            let obj = WidgetStore.getWidgetByKey(v.objKey);
            if(!obj){
                return (
                    <div key={i} className="formula-mode-div f--hlc">
                        还没做
                        {/*<Dropdown overlay={objectMenu} trigger={['click']}*/}
                                  {/*getPopupContainer={() => document.getElementById(this.containerId)}*/}
                                  {/*onVisibleChange={this.onObjectVisibleChange()}*/}
                                  {/*visible={this.state.objectDropDownVisible}>*/}
                            {/*<div className={$class("formula--dropDown formula-obj-dropDown f--hlc")}>*/}
                                {/*选择对象*/}
                                {/*<span className="right-icon" />*/}
                            {/*</div>*/}
                        {/*</Dropdown>*/}
                    </div>
                )
            } else if(obj&&!v.property){
                return (
                    <div key={i} className="formula-mode-div f--hlc">
                        <div className="formula-obj f--hlc">
                            <div className="formula-obj-name">
                                <span>{obj.props.name}</span>
                            </div>
                            <div className="formula-obj-dot"></div>
                            <Dropdown overlay={getPropertyMenu(this.onGetPropertyList(obj),v,i)} trigger={['click']}
                                      getPopupContainer={() => document.getElementById(this.containerId)}
                                      onVisibleChange={this.onPropertyVisibleChange}
                                      visible={this.state.propertyDropDownVisible}>
                                <div className={$class("formula--dropDown formula-obj-property-dropDown f--hlc")}>
                                    选择属性
                                    <span className="right-icon" />
                                </div>
                            </Dropdown>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div key={i} className="formula-mode-div f--hlc">
                        <div className="formula-obj formular-obj-com f--hlc">
                            <div className="formula-obj-name">
                                <span>{obj.props.name}</span>
                            </div>
                            <div className="formula-obj-dot"></div>
                            <div className="formula-obj-property">
                                <span>{v.property.showName}</span>
                            </div>
                        </div>
                        <Input placeholder="公式" value={v.pattern} onChange={this.onFormulaPatternChange.bind(this, v, i)}/>
                        {
                            this.state.value&&this.state.value.length-1===i
                                ? (<button className="add-obj-btn">
                                    <div className="btn-layer">
                                        <span className="heng"/>
                                        <span className="shu"/>
                                    </div>
                                    </button>)
                                : null
                        }
                    </div>
                )
            }
        };

        let formulaWidget = (
            <div className="formula-mode f--hlc"
                 style={{width:this.minWidth}}>
                <SelectTargetButton className={'formula-object-icon'}
                                    disabled={false}
                                    onClick={this.onSelectTargetClick}
                                    getResult={this.onGetObjectResult} />
                    {
                        this.state.currentType === inputType.formula && this.state.value && this.state.value.length>0
                            ? this.state.value.map(formulaList)
                            : null
                    }
            </div>
        );

        let valueWidget = (
            <div className="value-mode">
                <Dropdown overlay={objectMenu} trigger={['click']}
                          getPopupContainer={() => document.getElementById(this.containerId)}
                          onVisibleChange={this.onObjectVisibleChange}
                          visible={this.state.objectDropDownVisible}>
                    <div className={$class("formula--dropDown")}
                        style={{width:this.minWidth}}>
                        <div className="formula-title f--hlc">
                            <SelectTargetButton className={'formula-object-icon'}
                                                disabled={false}
                                                onClick={this.onSelectTargetClick}
                                                getResult={this.onGetObjectResult} />
                            <Input placeholder="比较值／对象" value={this.state.value} onChange={this.onInputTypeValueChange.bind(this)}/>
                            <span className="right-icon" />
                        </div>
                    </div>
                </Dropdown>
            </div>
        );

        return (
            <div className='formulaInput'>
                {
                    this.state.currentType === inputType.value
                        ? valueWidget
                        : formulaWidget
                }
            </div>
        );
    }
}

export {FormulaInput};
