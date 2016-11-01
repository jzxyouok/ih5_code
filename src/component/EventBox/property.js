//事件的属性
import React from 'react';
import ReactDOM from 'react-dom';
import $class from 'classnames'
import WidgetStore, {varType, funcType, nodeType, nodeAction, classList} from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import { SwitchMore,DropDownInput ,ConInputNumber} from  '../PropertyView/PropertyViewComponet';
import { Form, Input, InputNumber, Slider, Switch, Collapse,Select,Dropdown,Menu} from 'antd';
import { FormulaInput } from '../PropertyView/FormulaInputComponent';
import { SelectTargetButton } from '../PropertyView/SelectTargetButton';
import { RangeComponent } from '../PropertyView/RangeComponent';
import { DBOrderComponent } from '../PropertyView/DBOrderComponent';
import { propertyMap, propertyType, checkChildClass, checkIsClassType } from '../PropertyMap'
import  PropertyViewSetUp from '../PropertyView/PropertyViewSetUp';


const Option = Select.Option;
const Panel = Collapse.Panel;
const MenuItem = Menu.Item;

const optionType = {
    widget: 1, //是树节点（有key）
    normal: 2,  //普通参数（比如int，string）
    class: 3, //类别
};

class Property extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            expanded: true,
            isLarge: props.isLarge,
            activeKey: this.props.activeKey,//当前激活的widgetkey
            wKey: this.props.wKey,      //specfic所在的widgetkey
            event: this.props.event,        //对应的事件
            specific: this.props.specific,  //specific
            objectList: null,    //目标对象的列表
            actionList: null,    //对象动作列表
            objectDropdownVisible: false, //是否显示对象的下拉框
            actionDropdownVisible: false, //是否显示动作的下拉框
            currentObject: this.props.specific.object,
            currentAction: this.props.specific.action,  //name&property
            currentEnable: this.props.specific.enable,  //是否enable
            // didActiveSelectTargetMode: false  //是否激活了选择目标对象
        };
        this.expandBtn = this.expandBtn.bind(this);

        this.onStatusChange = this.onStatusChange.bind(this);
        this.onSpecificDelete = this.onSpecificDelete.bind(this);
        this.onSpecificAdd = this.onSpecificAdd.bind(this);
        this.onSpecificEnable = this.onSpecificEnable.bind(this);

        this.onObjectVisibleChange = this.onObjectVisibleChange.bind(this);
        this.onObjectSelect = this.onObjectSelect.bind(this);
        this.onActionVisibleChange = this.onActionVisibleChange.bind(this);
        this.onActionSelect = this.onActionSelect.bind(this);
        this.onGetActionList = this.onGetActionList.bind(this);
        this.onChangePropDom = this.onChangePropDom.bind(this);
        this.onPropertyContentSelect = this.onPropertyContentSelect.bind(this);

        this.onPropsObjButtonClick = this.onPropsObjButtonClick.bind(this);
        this.onPropsObjResultGet = this.onPropsObjResultGet.bind(this);

        this.onSTResultGet = this.onSTResultGet.bind(this);
        this.onSTButtonClick = this.onSTButtonClick.bind(this);

        this.onGetClassListByKey = this.onGetClassListByKey.bind(this);

        this.onFormulaInputFocus = this.onFormulaInputFocus.bind(this);
        this.onFormulaInputBlur = this.onFormulaInputBlur.bind(this);

        this.getSetPropsObj=this.getSetPropsObj.bind(this);
        this.getPropertyViewSetUpResult=this.getPropertyViewSetUpResult.bind(this);

        this.arrList = []; //数组类型变量列表
        this.classNameList = []; //类别列表
        this.customClassList = [];
        this.funcListLength = 0;
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.activeKey){
            this.setState({
                isLarge: nextProps.isLarge,
                activeKey: nextProps.activeKey,
                event: nextProps.event,
                wKey: nextProps.wKey,
                specific: nextProps.specific,

                currentObject: nextProps.specific.object,
                currentAction: nextProps.specific.action,
                currentEnable: nextProps.specific.enable
            }, ()=>{
                //获取动作
                if(this.state.currentObject){
                    this.onGetActionList(this.state.currentObject);
                }
            });
        }
    }

    componentDidMount() {
        this.unsubscribe = WidgetStore.listen(this.onStatusChange);
        this.onStatusChange(WidgetStore.getAllWidgets());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onStatusChange(widget) {
        if(!widget) {
            return;
        }
        if (widget.redrawEventTree) {
            this.forceUpdate();
        } else if (widget.classList) {
            this.customClassList = widget.classList;
            if(this.state.currentObject) {
                this.onGetClassListByKey(this.state.currentObject);
                this.forceUpdate();
            }
        } else if(widget.allWidgets){
            this.setState({
                objectList: widget.allWidgets
            }, ()=>{
                this.arrList = [];
                this.state.objectList.forEach(v=>{
                    if(v.className === 'data') {
                        this.arrList.push(v);
                    }
                });
            });
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }
    }

    onGetActionList(key){
        let obj = WidgetStore.getWidgetByKey(key);

        if(!obj||!obj.className) {
            this.setState({
                actionList: []
            });
            return;
        }

        let actionList = [];
        let className = obj.className;

        //添加自定义func
        if(className !== 'var') {
            for(let i=0; i<obj.funcList.length; i++){
                let func = obj.funcList[i];
                let act = { func:func.key, type: funcType.customize};
                //params
                if(func.params){
                    let property = [];
                    func.params.forEach(p =>{
                        if(p.name&&p.type){
                            property.push({'name':p.name, 'showName':p.name, 'value':null, 'type':propertyType.FormulaInput}); //'type':p.type.type
                        }
                    });
                    if(property.length>0){
                        act['property']= property;
                    }
                }
                actionList.push(act);
            }
            this.funcListLength = obj.funcList.length;
        }

        if(className === 'var'){
            switch (obj.type) {
                case varType.number:
                    className = 'intVar';
                    break;
                case varType.string:
                    className = 'strVar';
                    break;
                default:
                    break;
            }
        }
        if(propertyMap&&propertyMap[className]) {
            propertyMap[className].map((item, index) => {
                if (item.isFunc) {
                    let temp = JSON.parse(JSON.stringify(item));
                    if (temp.info) {
                        delete temp.info;
                    }
                    delete temp.isFunc;
                    temp.type = funcType.default;
                    actionList.push(temp);
                }
            });
        }

        actionList.unshift(this.getSetPropsObj());
        this.setState({
            actionList: actionList
        })
    }
    getPropertyViewSetUpResult(node){
        console.log('node',node);
    }
    getSetPropsObj() {
        let widget = WidgetStore.getWidgetByKey(this.state.currentObject);
        let className = widget.className;
        let obj = {
            name: 'setProps',
            showName: '设置属性',
            type: funcType.default,
            className:className
        }
        // let propertyList=[];
        // propertyMap[className].map((v, i)=> {
        //     if (v.isProperty && v.name != 'id') {
        //         let o = v;
        //         o.value =o.value ?o.value : null;
        //         propertyList.push(o);
        //     }
        // });
        // obj.property=propertyList;
        return obj;
    }
    onSTButtonClick(){
        if(this.state.activeKey !== this.state.wKey) {
            return false;
        }
        if(!this.state.currentEnable) {
            return false;
        }
        this.setState({
            objectDropdownVisible: false
        });
        return true;
    }

    onSTResultGet(result){
        let getTarget = false;
        this.state.objectList.forEach((v)=>{
            if(result.key === v.key){
                getTarget = true;
            }
        });
        if (getTarget) { 
            this.setState({
                currentObject: result.key,
            }, ()=>{
                WidgetActions['changeSpecific'](this.state.specific, {'object':this.state.currentObject});
            })
        }
    }

    onSpecificAdd() {
        if(this.state.activeKey !== this.state.wKey) {
            return;
        }
        if(this.state.event&&!this.state.event.enable) {
            return;
        }
        WidgetActions['addSpecific'](this.state.event);
    }

    onSpecificDelete() {
        if(this.state.activeKey !== this.state.wKey) {
            return;
        }
        if(this.state.event&&!this.state.event.enable) {
            return;
        }
        WidgetActions['deleteSpecific'](this.state.specific.sid ,this.state.event);
    }

    onSpecificEnable() {
        if(this.state.activeKey !== this.state.wKey) {
            return;
        }
        if(this.state.event&&!this.state.event.enable) {
            return;
        }
        this.setState({
            currentEnable: !this.state.currentEnable,
            expanded: !this.state.currentEnable
        }, ()=>{
            WidgetActions['enableSpecific'](this.state.specific, this.state.currentEnable);
        })
    }

    expandBtn(expanded) {
        if(this.state.activeKey !== this.state.wKey) {
            return;
        }
        if(!this.state.currentEnable) {
            return;
        }
        this.setState({
            expanded: expanded
        });
    }

    onObjectSelect(e){
        e.domEvent.stopPropagation();
        let object = e.item.props.object;
        if(this.state.currentObject === object.key) {
            this.setState({
                objectDropdownVisible: false
            });
            return;
        }
        this.setState({
            currentObject: object.key,
            objectDropdownVisible: false
        }, ()=> {
           WidgetActions['changeSpecific'](this.state.specific, {'object':this.state.currentObject});
        });
    }

    onObjectVisibleChange(flag) {
        if(this.state.activeKey !== this.state.wKey) {
            return;
        }
        if(!this.state.currentEnable) {
            return;
        }
        this.setState({
            objectDropdownVisible: flag,

        });
    }

    onActionSelect(e){
        e.domEvent.stopPropagation();
        let action = e.item.props.action;
        if(this.state.currentAction&&action.type===this.state.currentAction.type) {
            switch (action.type){
                case funcType.customize:
                    if(action.func == this.state.currentAction.func){
                        this.setState({
                            actionDropdownVisible: false
                        });
                        return;
                    }
                    break;
                default:
                    if(action.name == this.state.currentAction.name){
                        this.setState({
                            actionDropdownVisible: false
                        });
                        return;
                    }
                    break;
            }
        }
        if(action.name === 'create' && action.type!==funcType.customize){
            if(!(this.state.currentAction&&action.name === this.state.currentAction.name)) {
                this.onGetClassListByKey(this.state.currentObject);
            }
        }
        this.setState({
            currentAction: action,
            actionDropdownVisible: false
        }, ()=> {
            WidgetActions['changeSpecific'](this.state.specific, {action:this.state.currentAction});
        });
    }

    onActionVisibleChange(flag) {
        if(this.state.activeKey !== this.state.wKey) {
            return;
        }
        if(!this.state.currentEnable) {
            return;
        }
        this.setState({
            actionDropdownVisible: flag
        });
    }

    onPropsObjButtonClick(){
        if(this.state.activeKey !== this.state.wKey) {
            return false;
        }
        if(!this.state.currentEnable) {
            return false;
        }
        return true;
    }

    onPropsObjResultGet(prop, index, result){
        let getTarget = false;
        this.state.objectList.forEach((v)=>{
            if(result.key === v.key){
                getTarget = true;
            }
        });
        if (getTarget) {
            prop.value = result.key;
            let property = this.state.currentAction.property;
            property[index] = prop;
            let action = this.state.currentAction;
            action.property = property;
            this.setState({
                currentAction: action,
            }, ()=>{
                WidgetActions['changeSpecific'](this.state.specific, {property:this.state.currentAction.property});
            });
        }
    }

    onPropertyContentSelect(prop, index, type, e) {
        e.domEvent.stopPropagation();
        let data = e.item.props.data;
        switch (type) {
            case optionType.widget:
                prop.value = data.key;
                break;
            default:
                prop.value = data;
        }
        let property = this.state.currentAction.property;
        property[index] = prop;
        let action = this.state.currentAction;
        action.property = property;
        this.setState({
            currentAction: action,
        }, ()=>{
            WidgetActions['changeSpecific'](this.state.specific, {property:this.state.currentAction.property});
        });
    }
    onGetClassListByKey(key) {
        this.classNameList = [];
        let widget = WidgetStore.getWidgetByKey(key);
        if(widget) {
            if(widget.className === 'root' || widget.className === 'container') {
                this.customClassList = classList;
                this.customClassList.forEach(v=>{
                    this.classNameList.push(v)
                });
            }
            for (let cls in propertyMap) {
                if(checkChildClass(widget, cls)&&checkIsClassType(cls)){
                    this.classNameList.push(cls);
                }
            }
        }
    }

    onFormulaInputFocus() {
        if(this.state.activeKey !== this.state.wKey) {
            return false;
        }
        if(this.state.event&&!this.state.event.enable) {
            return false;
        }
        this.refs.pProperty.style.overflow = 'visible';
        document.getElementById('EventBox').style.overflow = 'visible';
        document.getElementById('EBContentLayer').style.overflow = 'visible';
        return true;
    }

    onFormulaInputBlur() {
        this.refs.pProperty.style.overflow = 'hidden';
        document.getElementById('EventBox').style.overflow = 'hidden';
        document.getElementById('EBContentLayer').style.overflow = 'scroll';
    }
    onChangePropDom(prop, index, e){
        var value = null;
        switch (prop.type) {
            case propertyType.String:
            case propertyType.color2:
                value = e.target.value;
                break;
            case propertyType.Integer:
            case propertyType.Number:
            case propertyType.Float:
            case propertyType.Boolean2:
            case propertyType.Boolean3:
            case propertyType.FormulaInput:
            case propertyType.Range:
            case propertyType.DBOrder:
                value = e;
                break;
            case propertyType.Function:
            default:
                break;
        }
        prop.value = value;
        let property = this.state.currentAction.property;
        property[index] = prop;
        let action = this.state.currentAction;
        action.property = property;

        this.setState({
            currentAction: action,
        }, ()=>{
            WidgetActions['changeSpecific'](this.state.specific, {property:this.state.currentAction.property});
        });
    }
    getProps(item, index) {
        var defaultProp = {
            size: 'small',
            placeholder:item.default,
            disabled: item.readOnly !== undefined,
            onChange:  this.onChangePropDom.bind(this, item, index)
        };
        switch (item.type) {
            case propertyType.String:
            case propertyType.Integer:
            case propertyType.Float:
            case propertyType.Number:
                defaultProp.value = item.value;
                break;
            case propertyType.Boolean2:
                if(item.value==false){
                    defaultProp.checked = 2;
                }else if(item.value==true){
                    defaultProp.checked = 0;
                }else{
                    defaultProp.checked = 1;
                }
                break;
            case propertyType.FormulaInput:
                defaultProp.value = item.value;
                break;
            case propertyType.Range:
                defaultProp.type="number";
                defaultProp.value = item.value;
                break;
            case propertyType.DBOrder:
                defaultProp.value = item.value;
            case propertyType.Function:
                break;
            case propertyType.Select:
                if(item.name=='scaleType'){
                    defaultProp.options=[];
                    for(var i in  item.options){
                        defaultProp.options.push(i);
                    }
                }
                break;
            case propertyType.Color2:
                break;
            default:
                break;
        }

        //设置值

        if(item.type !== propertyType.FormulaInput) {
            let widget = WidgetStore.getWidgetByKey(this.state.currentObject);
            if(widget.node[item.name] &&  !defaultProp.value){
                defaultProp.value =widget.node[item.name];
            }

        }
        return defaultProp;
    }
    render() {
        let propertyId = 'spec-item-'+ this.state.specific.sid;

        let w = WidgetStore.getWidgetByKey(this.state.currentObject);
        let f = null;
        if (this.state.currentAction&&this.state.currentAction.type === funcType.customize) {
            f = WidgetStore.getWidgetByKey(this.state.currentAction.func);
        }

        let propertyContent = (v1,i1)=>{
            //设置通用默认参数和事件
            return  <div className={$class("pp--list f--hlc", {'hidden':v1.type===propertyType.Hidden})} key={i1} >
                        <div className="pp--name">{ v1.showName }</div>
                        { type(v1.type, this.getProps(v1, i1), v1, i1)}
                    </div>
        };

        let menuWidgetList = (v3, i3)=>{
            return <MenuItem data={v3} key={i3}>{v3.props.name}</MenuItem>;
        };
        let menuNormalList = (v3, i3)=> {
            return <MenuItem data={v3} key={i3}>{v3}</MenuItem>;
        };
        let menuClassList = (v3, i3)=> {
            return <MenuItem data={v3} key={i3}
                             className={$class({'customize-last':i3===this.customClassList.length-1})}>{v3}
                             </MenuItem>;
        };

        let propertySelectMenu = (list, item, index, type)=> {
            return (<Menu onClick={this.onPropertyContentSelect.bind(this, item, index, type)}>
                {
                    !list||list.length==0
                        ? null
                        : type === optionType.widget
                            ? list.map(menuWidgetList)
                            : type === optionType.class
                                ? list.map(menuClassList)
                                : list.map(menuNormalList)
                }
            </Menu>);
        };

        let propertyDropDownMenu = (list, item, index, title, pid, type)=>{
            let selectedValue = null;
            let showValue = null;
            let menu = propertySelectMenu(list, item, index, type);
            switch (type){
                case optionType.widget:
                    selectedValue = WidgetStore.getWidgetByKey(item.value);
                    showValue = (!selectedValue || !selectedValue.props || !selectedValue.props.name)?title:selectedValue.props.name;
                    break;
                default:
                    selectedValue = item.value;
                    showValue = !selectedValue?title:selectedValue;
                    break;
            }
            return (<Dropdown overlay={menu} trigger={['click']}
                             getPopupContainer={() => document.getElementById(pid)}>
                <div className={$class("p--dropDown short")}>
                    <div className="title f--hlc">
                        {
                            showValue
                        }
                        <span className="icon" />
                    </div>
                </div>
            </Dropdown>);
        };

        let propertyObjDropDownMenu = (list, item, index, type)=>{
            let itemObj = WidgetStore.getWidgetByKey(item.value);
            return (<Dropdown overlay={propertySelectMenu(list, item, index, type)} trigger={['click']}
                       getPopupContainer={() => document.getElementById(propertyId)}>
                <div className={$class("p--dropDown short")}>
                    <div className="title p--title f--hlc" style={{width: '196px'}}>
                        <SelectTargetButton className={'p--icon'}
                                            disabled={!this.state.currentEnable}
                                            targetList={this.state.objectList}
                                            onClick={this.onPropsObjButtonClick.bind(this, index)}
                                            getResult={this.onPropsObjResultGet.bind(this, item, index)} />
                        { !itemObj || !itemObj.props || !itemObj.props.name
                            ?'选择对象'
                            :itemObj.props.name
                        }
                        <span className="icon" />
                    </div>
                </div>
            </Dropdown>);
        };

        let type = (type, defaultProp, item, index)=>{
            switch (type) {
                case propertyType.String:
                    return <Input {...defaultProp}/>;
                {/*return <input {...defaultProp} className="flex-1" type="text" placeholder={value}/>;*/}
                case propertyType.Integer:
                    return <ConInputNumber {...defaultProp}/>;
                // return <input className="flex-1" type="text" placeholder={value}/>;
                case propertyType.Float:
                case propertyType.Number:
                    return <ConInputNumber step={0.1} {...defaultProp}/>;
                case propertyType.Boolean3:
                    return <Switch checkedChildren={'开'} unCheckedChildren={'关'} {...defaultProp}/>
                case propertyType.Boolean2:
                    return <SwitchMore   {...defaultProp}/>;
                case propertyType.Boolean:
                    return <Switch   {...defaultProp} />;
                case propertyType.Color2:
                    return  <Input ref={(inputDom) => {
                        if (inputDom) {
                            var dom = ReactDOM.findDOMNode(inputDom).firstChild;
                            if (!dom.jscolor) {
                                dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                                dom.jscolor.onFineChange = defaultProp.onChange;
                            }
                        }
                    }}  {...defaultProp}  /> ;
                case propertyType.FormulaInput:
                    return <FormulaInput containerId={propertyId}
                                         disabled={!this.state.currentEnable}
                                         objectList={this.state.objectList}
                                         onFocus={this.onFormulaInputFocus}
                                         onBlur={this.onFormulaInputBlur}
                                         {...defaultProp}/>;
                case propertyType.Select:
                    let titleTemp = '';
                    let oType = optionType.normal;
                    let list = [];
                    if(w&&w.className === 'db'){
                        if(item.name ==='data') {
                            titleTemp = '来源';
                            oType = optionType.widget;
                            list = w.dbItemList;
                        }
                    } else if(item.name === 'class'){
                        titleTemp = '类别';
                        oType = optionType.class;
                        list = this.classNameList;
                    } else if(item.name=='scaleType'){

                        titleTemp =defaultProp.placeholder ;
                        oType = optionType.class;
                        list = defaultProp.options;
                    }else {
                        return <div>未定义类型</div>;
                    }
                    return propertyDropDownMenu(list, item, index, titleTemp, propertyId, oType);
                case propertyType.Object:
                    return propertyObjDropDownMenu(this.state.objectList, item, index, optionType.widget);
                case propertyType.Range:
                    return <RangeComponent {...defaultProp}/>;
                case propertyType.DBOrder:
                    return <DBOrderComponent pId={propertyId} {...defaultProp}/>;
                case propertyType.Function:
                    return <div>未定义类型</div>;
                case propertyType.Hidden:
                    return null;
                default:
                    return <div>未定义类型</div>;
            }
        };


        let objectMenuItem = (v1,i)=>{
            return  <MenuItem key={i} object={v1}>{v1.props.name}</MenuItem>
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

        let actionMenuItem = (v2, i)=>{
            let func = WidgetStore.getWidgetByKey(v2.func);
            switch (v2.type) {
                case funcType.customize:
                    if(func){
                        return <MenuItem key={i} action={v2} className={$class({'customize-last':i===this.funcListLength-1})}>
                            {func.props.name}
                        </MenuItem>;
                    } else {
                        return null;
                    }
                case funcType.default:
                    return <MenuItem key={i} action={v2}>{v2.showName}</MenuItem>;
            }
        };

        let actionMenu = (
            <Menu onClick={this.onActionSelect}>
                {
                    !this.state.actionList||this.state.actionList.length==0
                        ? null
                        : this.state.actionList.map(actionMenuItem)
                }
            </Menu>
        );

        return (
            <div className={$class("Property f--h", {'Property-not-enable':!this.state.currentEnable})} id={propertyId}>
                <div className="P--left-line"></div>
                <div className="P--content flex-1 f--h">
                    <span className={$class("p--close-line", {'p--close-not-enable': this.state.event&&!this.state.event.enable})}
                          onClick={this.onSpecificDelete}/>
                    <div className="p--main flex-1 f--h">
                        <div className="p--left">
                            <div className="p--left-div f--hlc">
                                <div className="enable-button-div">
                                    <button className={$class("p--icon")}
                                            disabled={this.state.event&&!this.state.event.enable}
                                            onClick={this.onSpecificEnable}/>
                                </div>
                                <Dropdown overlay={objectMenu} trigger={['click']}
                                          getPopupContainer={() => document.getElementById(propertyId)}
                                          onVisibleChange={this.onObjectVisibleChange}
                                          visible={this.state.objectDropdownVisible}>
                                    <div className={$class("p--dropDown short", {'active':this.state.objectDropdownVisible})}>
                                        <div className="title p--title f--hlc">
                                            <SelectTargetButton className={'p--icon'}
                                                disabled={!this.state.currentEnable}
                                                targetList={this.state.objectList}
                                                onClick={this.onSTButtonClick}
                                                getResult={this.onSTResultGet} />
                                            { !w || !w.props || !w.props.name
                                                ?'目标对象'
                                                :w.props.name
                                            }
                                            <span className="icon" />
                                        </div>
                                    </div>
                                </Dropdown>
                            </div>

                            <button className="add-btn"
                                    disabled={this.state.event&&!this.state.event.enable}
                                 onClick={this.onSpecificAdd}>
                                <div className="btn-layer">
                                    <span className="heng"/>
                                    <span className="shu"/>
                                </div>
                            </button>
                        </div>

                        <div className="p--right flex-1">
                            <div className="p--property" ref='pProperty' style={{width:this.state.isLarge?'554px':'475px'}}>
                                <Dropdown overlay={actionMenu} trigger={['click']}
                                          getPopupContainer={() => document.getElementById(propertyId)}
                                          onVisibleChange={this.onActionVisibleChange}
                                          visible={this.state.actionDropdownVisible}>
                                    <div className={$class("p--dropDown long", {'active':this.state.actionDropdownVisible})}>
                                        <div className="title p--title f--hlc">
                                            <span className="p--icon" />
                                            {
                                                !w||!this.state.currentAction
                                                    ? '目标动作'
                                                    : this.state.currentAction.type === funcType.customize
                                                        ? f&&f.props
                                                            ? f.props.name
                                                            : '目标动作'
                                                        : this.state.currentAction.showName
                                            }
                                            <span className="icon" />
                                        </div>
                                    </div>
                                </Dropdown>
                                {/*是否展开属性内容*/}
                                <div className={$class("pp-content f--h", {'hidden': !this.state.expanded} )}>
                                    {
                                        !w||!this.state.currentAction ||
                                        !this.state.currentAction.property ||
                                         this.state.currentAction.property.length === 0
                                            ? <div   className={$class("pp--list-layer flex-1", {'hidden':!(this.state.currentAction&&this.state.currentAction.className)} )}>
                                            {
                                                this.state.currentAction&&this.state.currentAction.className
                                                    ?<PropertyViewSetUp
                                                     okey={this.state.currentObject}
                                                     classType={this.state.currentAction.className}
                                                     getResult={this.getPropertyViewSetUpResult}
                                                />
                                                    :null
                                             }
                                            </div>
                                            : <div className="pp--list-layer flex-1">
                                            {
                                                this.state.currentAction.property.map(propertyContent)
                                            }
                                        </div>
                                    }
                                </div>

                                <button className={$class("up-btn", {'expanded-props': this.state.expanded})}
                                        onClick={this.expandBtn.bind(this, false)}
                                        disabled={!w||!this.state.currentAction||
                                        !this.state.currentAction.property ||
                                         this.state.currentAction.property.length==0||
                                        !this.state.currentEnable}>
                                    <div className="btn-layer">
                                    </div>
                                </button>
                                <button className={$class("down-btn", {'expanded-props': this.state.expanded})}
                                        onClick={this.expandBtn.bind(this, true)}
                                        disabled={!w||!this.state.currentAction||
                                        !this.state.currentAction.property ||
                                        this.state.currentAction.property.length==0||
                                        !this.state.currentEnable}>
                                    <div className="btn-layer">
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = Property;


