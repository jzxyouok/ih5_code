//事件的属性
import React from 'react';
import ReactDOM from 'react-dom';
import $class from 'classnames'
import WidgetStore, {varType, funcType, isCustomizeWidget} from '../../stores/WidgetStore'
import WidgetActions from '../../actions/WidgetActions'
import { SwitchMore } from  '../PropertyView/PropertyViewComponet';
import { Form, Input, InputNumber, Slider, Switch, Collapse,Select,Dropdown,Menu } from 'antd';
import { FormulaInput } from '../PropertyView/FormulaInputComponent';
import { SelectTargetButton } from '../PropertyView/SelectTargetButton';
import { RangeComponent } from '../PropertyView/RangeComponent';
import { DBOrderComponent } from '../PropertyView/DBOrderComponent';
import { DBConsComponent } from '../PropertyView/DBConsComponent';
import { propertyMap, propertyType, checkChildClass, checkIsClassType } from '../PropertyMap'
import  PropertyViewSetUp from '../PropertyView/PropertyViewSetUp';
import  $ from 'jquery';


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
            objectList: [],    //目标对象的列表
            actionList: [],    //对象动作列表
            objectDropdownVisible: false, //是否显示对象的下拉框
            actionDropdownVisible: false, //是否显示动作的下拉框
            currentObject: this.props.specific.object,
            currentAction: this.props.specific.action,  //name&property
            currentEnable: this.props.specific.enable,  //是否enable
            contactObj: null,
            editTargetObj: false,
        };
        this.expandBtn = this.expandBtn.bind(this);

        this.onStatusChange = this.onStatusChange.bind(this);
        this.onSpecificDelete = this.onSpecificDelete.bind(this);
        this.onSpecificAdd = this.onSpecificAdd.bind(this);
        this.onSpecificEnable = this.onSpecificEnable.bind(this);

        this.onObjectVisibleChange = this.onObjectVisibleChange.bind(this);
        this.onObjectSelect = this.onObjectSelect.bind(this);
        this.onStartEditTargetObj = this.onStartEditTargetObj.bind(this);
        this.onEndEditTargetObj = this.onEndEditTargetObj.bind(this);

        this.onActionVisibleChange = this.onActionVisibleChange.bind(this);
        this.onActionSelect = this.onActionSelect.bind(this);
        this.onGetActionList = this.onGetActionList.bind(this);
        this.onGetActionPropertyFIList = this.onGetActionPropertyFIList.bind(this);

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

        this.setDefaultMappingProps = this.setDefaultMappingProps.bind(this);

        this.arrList = []; //数组类型变量列表
        this.classNameList = []; //类别列表
        this.customClassList = []; //用于保存自定义类
        this.customList = []; //用于loop自定义类
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
        this.onStatusChange(WidgetStore.getStore());
        this.onStatusChange(WidgetStore.getAllWidgets());
        $('.pp--list input,.pp--list textarea').focus(function () {
             $(this).select();
        });
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
        } else if (widget.contactObj!==undefined) {
            this.setState({
                contactObj: widget.contactObj
            }, ()=>{
                if(this.state.contactObj === null && this.state.currentObject === 'param.target') {
                    WidgetActions['changeSpecific'](this.state.specific, {'object':'this'});
                }
            });
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }
    }

    onGetActionList(key){
        let obj = WidgetStore.getWidgetByKey(key);
        if(key === 'this') {
            obj = WidgetStore.getWidgetByKey(this.state.wKey);
        } else if (key === 'param.target'&&this.state.contactObj) {
            obj = WidgetStore.getWidgetByKey(this.state.contactObj);
        }
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

        if(className !== 'var' && className !== 'db') {
            //设置属性
            actionList.push(this.getSetPropsObj());
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
        let objRoot = null;
        if(obj.className === 'var'|| obj.className === 'dbItem' || obj.className === 'func') {
            objRoot = obj.widget.rootWidget;
        } else {
            objRoot = obj.rootWidget;
        }
        if(objRoot.className==='root'&&objRoot.props.isStage) {
            actionList.push({
                name: 'deleteRootComponent',
                showName: '删除组件',
                type: funcType.default
            });
        }

        this.setState({
            actionList: actionList
        })
    }

    setDefaultMappingProps(className, list, type) {
        if(className=='table'){
            className='tableForSet';
        }
        let formulaInputType = ['width', 'height', 'positionX', 'positionY', 'rotation', 'alpha', 'value', 'fontSize'];
        propertyMap[className].map((v,i)=>{
            if(v.isProperty&& v.name !='id'){
                let vObj=JSON.parse(JSON.stringify(v));
                (delete vObj.isProperty);
                vObj.isProp=true;
                if(vObj.name=='scaleX'){
                    vObj.name='width';
                }else if(v.name=='scaleY') {
                    vObj.name = 'height';
                }
                if(formulaInputType.indexOf(vObj.name)>=0) {
                    vObj.type = propertyType.FormulaInput;
                }
                if(v.name!='initVisible') {
                    switch (type) {
                        case 'change':
                            list.splice(list.length - 1, 0, vObj);
                            break;
                        default:
                            list.push(vObj);
                            break;
                    }
                }
            }
        });
    }

    getSetPropsObj() {
        let obj = {
            name: 'setProps',
            showName: '设置属性',
            type: funcType.default
        };
        let node = WidgetStore.getWidgetByKey(this.state.currentObject);
        if(this.state.currentObject === 'this') {
            node = WidgetStore.getWidgetByKey(this.state.wKey);
        } else if (this.state.currentObject === 'param.target'&&this.state.contactObj) {
            node = WidgetStore.getWidgetByKey(this.state.contactObj);
        }
        let propertyList=[];
        if(node){
            let className=node.className;
            this.setDefaultMappingProps(className, propertyList, 'add');
        }
        obj.property= propertyList;
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
        let key = null;
        if(object === 'this' || (object === 'param.target'&&this.state.contactObj)) {
            key = object;
        } else {
            key = object.key;
        }
        if(this.state.currentObject === key) {
            this.setState({
                objectDropdownVisible: false
            });
            return;
        }
        this.setState({
            currentObject: key,
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
        if(this.state.editTargetObj) {
            return;
        }
        this.setState({
            objectDropdownVisible: flag,

        });
    }

    onStartEditTargetObj(targetName ,e) {
        if(this.state.activeKey !== this.state.wKey) {
            return;
        }
        if(!this.state.currentEnable) {
            return;
        }
        e.stopPropagation();
        this.setState({
            editTargetObj: true,
            objectDropdownVisible: false
        }, ()=>{
            if(targetName === '目标对象') {
                targetName = '';
            }
            this.refs['tarObjInput'].refs.input.value = targetName;
            this.refs['tarObjInput'].refs.input.focus();
        });
    }

    onEndEditTargetObj(e) {
        //search
        let value = e.target.value;
        let final = null;
        let hasSameObject = false;
        if(value === 'this' || value === '目标对象'){
            final = 'this';
        } else if ((value === '碰撞目标对象' || value === 'param.target')&&this.state.contactObj){
            final = 'param.target';
        } else {
            //检查是否在obejctlist内
            let resultIndexList = [];
            this.state.objectList.forEach((v,i)=>{
                if(value === v.props.name){
                    resultIndexList.push(i);
                }
            });
            if(resultIndexList.length>0) {
                resultIndexList.forEach((v,i)=>{
                    if(this.state.objectList[v].key === this.state.currentObject) {
                        hasSameObject = true;
                    }
                });
                if(!hasSameObject) {
                    final = this.state.objectList[resultIndexList[0]].key;
                }
            }
        }
        this.setState({
            editTargetObj: false,
            objectDropdownVisible: false
        });
        if (final!==null&&final!==this.state.currentObject) {
            this.setState({
                currentObject: final
            }, ()=> {
                WidgetActions['changeSpecific'](this.state.specific, {'object':this.state.currentObject});
            });
        }
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
            actionDropdownVisible: false,
            expanded: true, //选择后默认打开
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

    onPropsObjResultGet(list, prop, index, result){
        let getTarget = false;
        list.forEach((v)=>{
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
        if(type === optionType.class && this.state.currentAction.name === 'create') {
            let className = data;
            //不需要替换1，2和最后1个
            let newProperty = [property[0], property[1], property[property.length-1]];
            if (isCustomizeWidget(className)) {
                className = 'container';
            }
            this.setDefaultMappingProps(className, newProperty, 'change');
            property = newProperty;
        }
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
        this.customList = [];
        let widget = WidgetStore.getWidgetByKey(key);
        if(key === 'this') {
            widget = WidgetStore.getWidgetByKey(this.state.wKey);
        } else if (key === 'param.target'&&this.state.contactObj) {
            widget = WidgetStore.getWidgetByKey(this.state.contactObj);
        }
        if(widget) {
            if(widget.className === 'root' || widget.className === 'container' || widget.className === 'timer'
                || widget.className === 'slidetimer' || widget.className === 'world') {
                this.customClassList.forEach(v=>{
                    this.classNameList.push('_'+v);
                });
                this.customList = this.customClassList;
            }
            for (let cls in propertyMap) {
                if(checkChildClass(widget, cls)&&checkIsClassType(cls)){
                    this.classNameList.push(cls);
                }
            }
        }
    }

    onGetActionPropertyFIList() {
        let fIList = [];
        this.state.objectList.forEach(v=>{
            fIList.push(v);
        });
        if(this.state.event.conFlag === 'click'||this.state.event.conFlag === 'touchDown'
            || this.state.event.conFlag === 'touchUp') {
            fIList.unshift({className:'DIY', key:'globalXY', props:{name:'点击坐标'}})
        }
        return fIList;
    }

    onFormulaInputFocus(canChange) {
        if(this.state.activeKey !== this.state.wKey) {
            return false;
        }
        if(this.state.event&&!this.state.event.enable) {
            return false;
        }
        if(canChange) {
            if(document.getElementById('EBContentLayer').scrollTop != 0) {
                //为了滚动后不会跳
                let top = document.getElementById('EBContentLayer').scrollTop;
                document.getElementById('EventBox').style.top = -top+37+'px';
            }
            this.refs['pProperty'].style.overflow = 'visible';
            document.getElementById('EventBox').style.overflow = 'visible';
            document.getElementById('EventBox').style.zIndex = 51;
            document.getElementById('EBContentLayer').style.overflow = 'visible';
            document.getElementById('EBContentLayer').style.overflow = 'visible';
        }
        return true;
    }

    onFormulaInputBlur() {
        this.refs['pProperty'].style.overflow = 'hidden';
        document.getElementById('EventBox').style.overflow = 'hidden';
        document.getElementById('EBContentLayer').style.overflow = 'scroll';
        document.getElementById('EventBox').style.top = '37px';
        document.getElementById('EventBox').style.zIndex = 50;
    }

    getPropertyViewSetUpResult(index, prop){
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

    onChangePropDom(prop, index, e){
        let value = null;
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
            case propertyType.DBCons:
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
            disabled: !this.state.currentEnable,
            onChange:  this.onChangePropDom.bind(this, item, index)
        };
        switch (item.type) {
            case propertyType.String:
            case propertyType.Integer:
            case propertyType.Float:
            case propertyType.Number:
            case propertyType.FormulaInput:
            case propertyType.DBOrder:
            case propertyType.DBCons:
                defaultProp.value = item.value;
                break;
            case propertyType.Range:
                defaultProp.type="number";
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
            case propertyType.Function:
                break;
            default:
                break;
        }
        return defaultProp;
    }

    render() {
        let propertyId = 'spec-item-'+ this.state.specific.sid;

        let w = null;
        if(this.state.currentObject === 'this') {
            w = WidgetStore.getWidgetByKey(this.state.wKey);
        } else if (this.state.currentObject === 'param.target'&&this.state.contactObj) {
            w = WidgetStore.getWidgetByKey(this.state.contactObj)
        } else {
            w = WidgetStore.getWidgetByKey(this.state.currentObject);
        }
        let f = null;
        if (this.state.currentAction&&this.state.currentAction.type === funcType.customize) {
            f = WidgetStore.getWidgetByKey(this.state.currentAction.func);
        }

        let propertyContent = (v1,i1)=>{
            //设置通用默认参数和事件
            return  <div className={$class("pp--list f--hlc",
                         {'hidden':v1.type===propertyType.Hidden},
                         {'db-cons-list':v1.type===propertyType.DBCons})}
                         key={i1}>
                        <div className="pp--name">{ v1.showName?v1.showName:v1.name }</div>
                        {
                            v1.isProp===true
                            ?<PropertyViewSetUp
                                oKey={
                                    this.state.currentAction.name==='setProps'
                                        ? this.state.currentObject==='this'
                                            ? this.state.wKey
                                            : this.state.currentObject==='param.target'
                                                ? this.state.contactObj
                                                : this.state.currentObject
                                        : null}
                                property={v1}
                                propertyId={propertyId}
                                objectList={this.onGetActionPropertyFIList()}
                                onFInputFocus={this.onFormulaInputFocus}
                                onFInputBlur={this.onFormulaInputBlur}
                                getResult={this.getPropertyViewSetUpResult.bind(this,i1)}
                            />
                            :typeComponent(v1.type, this.getProps(v1, i1), v1, i1)
                        }
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
                             className={$class({'customize-last':i3===this.customList.length-1})}>
                                {
                                    v3&&v3.substr(0,1) === "_"
                                    ?v3.substr(1)
                                    :v3
                                }
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
                case optionType.class:
                    selectedValue = item.value;
                    showValue = !selectedValue?title:selectedValue;
                default:
                    selectedValue = item.value;
                    showValue = !selectedValue?title:selectedValue.substr(0,1) === "_"?selectedValue.substr(1):selectedValue;
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
                <div className={$class("p--dropDown p--obj-dropDown")}>
                    <div className="title p--title f--hlc">
                        <SelectTargetButton className={'p--icon'}
                                            disabled={!this.state.currentEnable}
                                            targetList={list}
                                            onClick={this.onPropsObjButtonClick.bind(this, index)}
                                            getResult={this.onPropsObjResultGet.bind(this, list, item, index)} />
                        { !itemObj || !itemObj.props || !itemObj.props.name
                            ?'选择对象'
                            :itemObj.props.name
                        }
                        <span className="icon" />
                    </div>
                </div>
            </Dropdown>);
        };

        let typeComponent = (type, defaultProp, item, index)=>{
            switch (type) {
                case propertyType.String:
                    return <Input {...defaultProp}/>;
                {/*return <input {...defaultProp} className="flex-1" type="text" placeholder={value}/>;*/}
                case propertyType.Integer:
                    return <InputNumber {...defaultProp}/>;
                // return <input className="flex-1" type="text" placeholder={value}/>;
                case propertyType.Float:
                case propertyType.Number:
                    return <InputNumber step={0.1} {...defaultProp}/>;
                case propertyType.Boolean3:
                    return <Switch checkedChildren={'开'} unCheckedChildren={'关'} {...defaultProp}/>;
                case propertyType.Boolean2:
                    return <SwitchMore   {...defaultProp}/>;
                case propertyType.Boolean:
                    return <Switch   {...defaultProp} />;
                case propertyType.FormulaInput:
                    return <FormulaInput containerId={propertyId}
                                         disabled={!this.state.currentEnable}
                                         objectList={this.onGetActionPropertyFIList()}
                                         onFocus={this.onFormulaInputFocus}
                                         onBlur={this.onFormulaInputBlur}
                                         {...defaultProp}/>;
                case propertyType.Select:
                    let sTitleTemp = '';
                    let sType = optionType.normal;
                    let sList = [];
                    if(item.name === 'class'){
                        sTitleTemp = '类别';
                        sType = optionType.class;
                        sList = this.classNameList;
                    } else {
                        return <div>未定义类型</div>;
                    }
                    return propertyDropDownMenu(sList, item, index, sTitleTemp, propertyId, sType);
                case propertyType.ObjectSelect:
                    let objTitleTemp = '';
                    let objType = optionType.normal;
                    let objList = [];
                    if(w&&w.className === 'db'&&item.name ==='data'){
                        objTitleTemp = '来源';
                        objType = optionType.widget;
                        objList = w.dbItemList;
                    } else {
                        return <div>未定义类型</div>;
                    }
                    return propertyDropDownMenu(objList, item, index, objTitleTemp, propertyId, objType);
                case propertyType.Object:
                    let oList = this.state.objectList;
                    if(w&&w.className === 'db' && item.name === 'object') {
                        oList = [];
                        this.state.objectList.forEach(v=>{
                            if (v.className === 'data') {
                                oList.push(v);
                            }
                        });
                    }
                    return propertyObjDropDownMenu(oList, item, index, optionType.widget);
                case propertyType.Range:
                    return <RangeComponent {...defaultProp}/>;
                case propertyType.DBOrder:
                    return <DBOrderComponent pId={propertyId} obj={w} {...defaultProp}/>;
                case propertyType.DBCons:
                    return <DBConsComponent pId={propertyId}
                                            obj={w}
                                            objectList={this.state.objectList}
                                            onFocus={this.onFormulaInputFocus}
                                            onBlur={this.onFormulaInputBlur}
                                            {...defaultProp}/>;
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
                <MenuItem key={'this'} object={'this'}>当前对象</MenuItem>
                <MenuItem key={'param.target'} className={$class({'hidden':!this.state.contactObj})} object={'param.target'}>碰撞目标对象</MenuItem>
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

        let targetObjInput = ()=>{
            let targetName = '目标对象';
            if(this.state.currentObject === 'this') {
                targetName = '当前对象';
            } else if(this.state.currentObject === 'param.target'&&this.state.contactObj) {
                targetName = '碰撞目标对象';
            } else if (w && w.props && w.props.name) {
                targetName = w.props.name;
            }
            return (
                <div className="target-obj-input f--hlc">
                    <div onClick={this.onStartEditTargetObj.bind(this, targetName)}
                         className={$class('ant-input ant-input-sm ant-fade-input',
                        {'hidden':this.state.editTargetObj})}
                         style={{'cursor':this.state.currentEnable?'auto':'not-allowed'}}>
                        {
                            targetName
                        }
                    </div>
                    <Input ref="tarObjInput"
                           className={$class({'hidden':!this.state.editTargetObj})}
                           onBlur={this.onEndEditTargetObj}
                           onPressEnter={this.onEndEditTargetObj}
                           disabled={!this.state.currentEnable}
                           size='small'/>
                </div>
            )
        };

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
                                                getResult={this.onSTResultGet.bind(this)} />
                                            {
                                                targetObjInput()
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
                            <div className="p--property" ref='pProperty' style={{width:'475px'}}>
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
                                         ?null
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


