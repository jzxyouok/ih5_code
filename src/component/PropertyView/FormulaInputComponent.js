/**
 * Created by Brian on 19/10/2016.
 */

import React from 'react';
import $class from 'classnames'
import { Menu, Dropdown } from 'antd';
import { Input } from 'antd';

import WidgetStore, {varType} from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import { SelectTargetButton } from '../PropertyView/SelectTargetButton';
import { propertyMap } from '../PropertyMap'

const MenuItem = Menu.Item;

const inputType = {
    value: 1,
    formula: 2,
};

const minInputWidth = 10;

let initValue = (props) => {
    let value = null;
    let type = inputType.value;
    if(props.value) {
        value = props.value.value;
        type = props.value.type;
    }
    return {value:value, type:type};
};

class FormulaInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: initValue(props).value,
            currentType: initValue(props).type,
            objectList: [],
            objectDropDownVisible: false, //对象dropdown
            propertyDropDownVisible: false, //属性dropdown
            willDeleteObjIndex: null,
            on: false,
        };
        this.containerId = props.containerId || 'iH5-App';
        this.minWidth = props.minWidth||'244px';
        this.disabled = props.disabled || false;

        this.onChange = props.onChange;
        this.onChangeFocus = props.onFocus;
        this.onChangeBlur = props.onBlur;

        this.onStatusChange = this.onStatusChange.bind(this);

        this.onObjectVisibleChange = this.onObjectVisibleChange.bind(this);
        this.onObjectSelect = this.onObjectSelect.bind(this);
        this.onSelectTargetClick = this.onSelectTargetClick.bind(this);
        this.onGetObjectResult = this.onGetObjectResult.bind(this);

        this.onGetPropertyList = this.onGetPropertyList.bind(this);
        this.onPropertyVisibleChange = this.onPropertyVisibleChange.bind(this);
        this.onPropertySelect = this.onPropertySelect.bind(this);

        this.onFormulaPrePatternChange = this.onFormulaPrePatternChange.bind(this);
        this.onFormulaPatternChange = this.onFormulaPatternChange.bind(this);
        this.onFormulaPatternKeyDown = this.onFormulaPatternKeyDown.bind(this);
        this.onFormulaPatternBlur = this.onFormulaPatternBlur.bind(this);

        this.onInputTypeValueChange = this.onInputTypeValueChange.bind(this);

        this.checkValueObjValid = this.checkValueObjValid.bind(this); //不存在的obj清掉

        this.resizeInputWidth = this.resizeInputWidth.bind(this);
        this.doGetCaretPosition = this.doGetCaretPosition.bind(this);

        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        window.addEventListener('click', this.onBlur);
    }

    componentWillUnmount() {
        this.unsubscribe();
        window.removeEventListener('click', this.onBlur);
    }

    componentWillReceiveProps(nextProps) {
        this.containerId = nextProps.containerId || 'iH5-App';
        this.minWidth = nextProps.minWidth||'244px';
        this.disabled = nextProps.disabled || false;

        this.onChange = nextProps.onChange;
        this.onChangeFocus = nextProps.onFocus;
        this.onChangeBlur = nextProps.onBlur;

        this.setState({
            value: initValue(nextProps).value,
            currentType: initValue(nextProps).type,
            objectList: nextProps.objectList||[]
        });
    }

    onStatusChange(widget) {
        if(!widget) {
            return;
        }
        if(widget.allWidgets){
            this.setState({
                objectList: widget.allWidgets
            });
        } else if(widget.deleteWidget) {
            this.checkValueObjValid();
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }
    }

    checkValueObjValid(){
        let value = this.state.value;
        let type = this.state.currentType;
        if(value&&(type===inputType.formula)) {
            let changed = false;
            value.forEach((v, i)=>{
                if(v.objKey) {
                    let obj = WidgetStore.getWidgetByKey(v.objKey);
                    if(!obj) {
                        changed = true;
                        value.splice(i,1);
                    }
                }
            });
            if(value.length===0||(value.length===1&&value[0].objKey===null)){
                type = inputType.value;
                value = null;
                changed = true;
            }
            if(changed){
                this.setState({
                    value: value,
                    currentType: type,
                    willDeleteObjIndex: null
                }, ()=>{
                    this.onChange({value:this.state.value, type:this.state.currentType});
                })
            }
        }
    }

    onFocus(e) {
        if((this.onChangeFocus!=undefined&&this.onChangeFocus()!==false) || this.onChangeFocus===undefined) {
            if(e){
                e.stopPropagation();
            }
            if(!this.state.on) {
                this.setState({
                    on: true
                }, ()=>{
                    if(this.refs.formulaMode) {
                        this.refs.formulaMode.style.cursor = 'auto';
                        this.refs.formulaMode.style.width = 'auto';
                        this.refs.formulaMode.style.minWidth = this.minWidth;
                        this.refs.formulaMode.style.overflow = 'visible';
                        this.onChangeFocus();
                    }
                })
            }
            return true;
        } else {
            return false;
        }
    }

    onBlur() {
        if(this.state.on) {
            this.setState({
                on: false
            }, ()=>{
                if(this.refs.formulaMode) {
                    this.refs.formulaMode.style.cursor = 'pointer';
                    this.refs.formulaMode.style.width = this.minWidth;
                    this.refs.formulaMode.style.overflow = 'hidden';
                    this.onChangeBlur();
                }
            })
        }
    }

    // formula mode
    onObjectVisibleChange(flag){
        this.setState({
            objectDropDownVisible: flag
        })
    }

    onObjectSelect(target, e){
        let object = target.item.props.object;
        this.onGetObjectResult(object);
        this.setState({
            objectDropDownVisible: false
        })
    }

    onSelectTargetClick() {
        if(!this.onFocus()) {
            return false;
        }
        this.setState({
            objectDropDownVisible: false,
            willDeleteObjIndex: null
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
            let item = {objKey:object.key, property:null, pattern:null, prePattern:null};
            if(type === inputType.value) {
                //初次进入formula mode
                type = inputType.formula;
                value = [item];
            } else {
                value.push(item);
            }
            this.setState({
                value: value,
                currentType:type,
            }, ()=>{
                this.onChange({value:this.state.value, type:this.state.currentType});
            })
        }
    }

    onGetPropertyList(obj){
        let props = [];
        if(obj&&obj.className){
            let className = obj.className;
            if(obj.className === 'var'){
                switch (obj.type) {
                    case varType.string:
                        className = 'strVar';
                        break;
                    case varType.number:
                        className = 'intVar';
                        break;
                }
            }
            propertyMap[className].map((v)=> {
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

    onPropertyVisibleChange(flag) {
        this.setState({
            willDeleteObjIndex: null,
            // propertyDropDownVisible: flag
        })
    }

    onPropertySelect(v, i, target){
        if(this.state.on) {
            target.domEvent.stopPropagation();
        }
        let property = target.item.props.property;
        let value = this.state.value;
        if(value&&value.length>0){
            v.property = property;
            value[i] = v;
        }
        this.setState({
            value: value,
            // propertyDropDownVisible: false
        }, ()=>{
            this.onChange({value:this.state.value, type:this.state.currentType});
        })
    }

    onFormulaPrePatternChange(v, i, e) {
        let prePattern = e.target.value;
        let value = this.state.value;
        if(value&&value.length>0){
            v.prePattern = prePattern;
            value[i] = v;
        }
        this.setState({
            value: value,
            willDeleteObjIndex: null,
        }, ()=>{
            this.onChange({value:this.state.value, type:this.state.currentType});
        });
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
            willDeleteObjIndex: null,
        }, ()=>{
            this.onChange({value:this.state.value, type:this.state.currentType});
        });
    }

    onFormulaPatternKeyDown(v,i,e) {
        if(e.keyCode === 8) {
            let pos = this.doGetCaretPosition(e.target);
            if(pos=='0') {
                let willDeleteObjIndex = i;
                if(this.state.willDeleteObjIndex!=null&&this.state.willDeleteObjIndex===i) {
                    willDeleteObjIndex = null;
                    //delete obj here
                    let value = this.state.value;
                    let type = this.state.currentType;
                    let focus = '';
                    if(value.length>0) {
                        if(value.length===1) {
                            let combine = '';
                            if(value[i].prePattern) {
                                combine += value[i].prePattern;
                            }
                            if(value[i].pattern) {
                                combine += value[i].pattern;
                            }
                            value = combine===''?null:combine;
                            type = inputType.value;
                        } else if(value.length>1&&i===0){
                            let combine = '';
                            if(value[i].prePattern) {
                                combine += value[i].prePattern;
                            }
                            if(value[i].pattern) {
                                combine += value[i].pattern;
                            }
                            if(combine!=='') {
                                if(value[i+1].prePattern) {
                                    value[i+1].prePattern += combine;
                                } else {
                                    value[i+1].prePattern = combine;
                                }
                            }
                            focus = 'prePattern'+i;
                            type = inputType.formula;
                            value.splice(i,1);
                        } else {
                            let combine = '';
                            if(value[i].pattern) {
                                combine += value[i].pattern;
                            }
                            if(combine!=='') {
                                if(value[i-1].pattern) {
                                    value[i-1].pattern += combine;
                                } else {
                                    value[i-1].pattern = combine;
                                }
                            }
                            focus = 'pattern'+(i-1);
                            type = inputType.formula;
                            value.splice(i,1);
                        }
                        if(this.refs['pattern'+i]) {
                            this.refs['pattern'+i].refs.input.blur();
                        }
                    } else {
                        value = null;
                        type = inputType.value;
                    }
                    this.setState({
                        value: value,
                        currentType: type,
                        willDeleteObjIndex: willDeleteObjIndex,
                    }, ()=>{
                        if(this.state.currentType === inputType.value) {
                            setTimeout(()=> {
                                this.refs['valueInput'].refs.input.focus();
                            }, 100);
                        } else{
                            setTimeout(()=> {
                                this.refs[focus].refs.input.focus();
                            }, 100);
                        }
                    })
                } else {
                    this.setState({
                        willDeleteObjIndex: willDeleteObjIndex
                    })
                }
            }
        }
    }

    onFormulaPatternBlur(v,i,e) {
        if(this.state.willDeleteObjIndex!=null&&i===this.state.willDeleteObjIndex){
            this.setState({
                willDeleteObjIndex: null
            })
        }
    }

    doGetCaretPosition(oField) {
        // Initialize
        var iCaretPos = 0;
        // IE Support
        if (document.selection) {
            oField.focus();
            var oSel = document.selection.createRange();
            oSel.moveStart('character', -oField.value.length);
            iCaretPos = oSel.text.length;
        } else if (oField.selectionStart || oField.selectionStart == '0')
            iCaretPos = oField.selectionStart;
        return iCaretPos;
    }

    resizeInputWidth(value) {
        if(value){
            let length = 0;
            for (let i=0; i<value.length; i++) {
                if (value[i].charCodeAt(0)<299) {
                    length++;
                } else {
                    length+=1.8;
                }
            }
            if((length*7)>minInputWidth) {
                return length * 7;
            }
        }
        return minInputWidth;
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

        // let formulaObjDropDown = () =>{
        //     if(this.disabled) {
        //         return  (<div className={$class("formula--dropDown formula-obj-dropDown f--hlc")}>
        //             <div className="dropDown-title">选择对象</div>
        //             <span className="right-icon" />
        //         </div>)
        //     }  else {
        //         return (<Dropdown overlay={objectMenu} trigger={['click']}
        //                    getPopupContainer={() => document.getElementById(this.containerId)}
        //                    onVisibleChange={this.onObjectVisibleChange}
        //                    visible={this.state.objectDropDownVisible}>
        //             <div className={$class("formula--dropDown formula-obj-dropDown f--hlc")}>
        //                 <div className="dropDown-title">选择对象</div>
        //                 <span className="right-icon" />
        //             </div>
        //         </Dropdown>);
        //     }
        // };

        let formulaPropertyDropdown  = (obj, v, i) => {
            if(this.disabled) {
                return ( <div className={$class("formula--dropDown formula-obj-property-dropDown f--hlc")}>
                    <div className="dropDown-title">选择属性</div>
                    <span className="right-icon"/>
                </div>);
            } else {
                return (
                    <Dropdown overlay={getPropertyMenu(this.onGetPropertyList(obj),v,i)} trigger={['click']}
                              getPopupContainer={() => document.getElementById(this.containerId)}
                              onClick={this.onFocus}
                              onVisibleChange={this.onPropertyVisibleChange}>
                        <div className={$class("formula--dropDown formula-obj-property-dropDown f--hlc")}>
                            <div className="dropDown-title">选择属性</div>
                            <span className="right-icon" />
                        </div>
                    </Dropdown>
                );
            }
        };

        let formulaList = (v, i)=> {
            let obj = WidgetStore.getWidgetByKey(v.objKey);
            return (
                <div key={i} className="formula-mode-div f--hlc">
                    {
                        v.objKey===undefined || v.objKey === null || !obj
                            ? null
                            : (<div className="formula-obj f--hlc">
                            {
                                i===0
                                    ? (<Input disabled={this.disabled}
                                              value={v.prePattern}
                                              style={{width:this.resizeInputWidth(v.prePattern)}}
                                              className='formula-obj-prePattern'
                                              ref={'prePattern'+i}
                                              onClick={this.onFocus}
                                              onChange={this.onFormulaPrePatternChange.bind(this, v, i)}/>)
                                    : null
                            }
                            <div className={$class('formula-obj-div f--hlc',
                                {'complete': v.property},
                                {'will-delete-obj':this.state.willDeleteObjIndex===i})}>
                                <div className="formula-obj-name">
                                    <span>{obj.props.name}</span>
                                </div>
                                <div className="formula-obj-dot"></div>
                                {
                                    !v.property
                                        ? formulaPropertyDropdown(obj, v, i)
                                        : (<div className="formula-obj-property">
                                        <span>{v.property.showName}</span>
                                    </div>)
                                }
                            </div>
                            <Input disabled={this.disabled}
                                   value={v.pattern}
                                   style={{width:this.resizeInputWidth(v.pattern)}}
                                   className='formula-obj-pattern'
                                   ref={'pattern'+i}
                                   onKeyDown={this.onFormulaPatternKeyDown.bind(this, v, i)}
                                   onClick={this.onFocus}
                                   onBlur={this.onFormulaPatternBlur.bind(this,v,i)}
                                   onChange={this.onFormulaPatternChange.bind(this, v, i)}/>
                            {/*{*/}
                                {/*v.property*/}
                                    {/*? (<Input placeholder="公式"*/}
                                             {/*disabled={this.disabled}*/}
                                             {/*value={v.pattern}*/}
                                              {/*className='formula-obj-pattern'*/}
                                             {/*onChange={this.onFormulaPatternChange.bind(this, v, i)}/>)*/}
                                    {/*: null*/}
                            {/*}*/}
                            {/*{*/}
                                {/*v.property&&this.state.value.length-1===i*/}
                                    {/*? (<button className="add-obj-btn" onClick={this.onAddBtn} disabled={this.disabled}>*/}
                                    {/*<div className="btn-layer">*/}
                                        {/*<span className="heng"/>*/}
                                        {/*<span className="shu"/>*/}
                                    {/*</div>*/}
                                {/*</button>)*/}
                                    {/*: null*/}
                            {/*}*/}
                        </div>)
                    }
                </div>
            )
        };

        let formulaWidget = (
            <div className="formula-mode f--hlc"
                 style={{width:this.minWidth, overflow:'hidden', cursor:'pointer'}}
                 ref='formulaMode'
                 onClick={this.onFocus}>
                <SelectTargetButton className={'formula-object-icon'}
                                    disabled={this.disabled}
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
                {
                    this.disabled
                        ? (<div className={$class("formula--dropDown")}
                                style={{width:this.minWidth}}>
                        <div className="formula-title f--hlc">
                            <SelectTargetButton className={'formula-object-icon'}
                                                disabled={this.disabled}
                                                onClick={this.onSelectTargetClick}
                                                getResult={this.onGetObjectResult} />
                            <Input placeholder="比较值／对象" ref={'valueInput'}
                                   value={this.state.value}
                                   disabled={this.disabled}
                                   onChange={this.onInputTypeValueChange.bind(this)}/>
                            <span className="right-icon" />
                        </div>
                    </div>)
                        : (
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
                                    <Input placeholder="比较值／对象" ref={'valueInput'}
                                           value={this.state.value}
                                           disabled={this.disabled}
                                           onChange={this.onInputTypeValueChange.bind(this)}/>
                                    <span className="right-icon" />
                                </div>
                            </div>
                        </Dropdown>
                    )
                }
            </div>
        );

        return (
            <div className='formulaInput'>
                {
                    this.state.currentType === inputType.formula
                        ? formulaWidget
                        : valueWidget
                }
            </div>
        );
    }
}

export {FormulaInput};
