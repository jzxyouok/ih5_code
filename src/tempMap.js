const propertyType = {
    Integer: 0,
    Number: 1,
    String: 2,
    Text: 3,
    Boolean: 4,
    Percentage: 5,
    Color: 6,
    Select:7,
    Float:8,
    Color2:9,
    Boolean2:10,
    Function:11,
    FormulaInput:12,
    Dropdown:13,
    TbSelect : 14,
    TbColor : 15,
    TbFont : 16,
    TdLayout : 17,
    DBCons: 18,
    DBOrder: 19,
    Range: 20,
    Object:21,
    Hidden: -1,
    Boolean3:22,
    ObjectSelect:23,
};

const widgetFlags = { Root: 1,
    Display: 2,
    Container: 4,
    Renderer: 8,
    Leaf: 16,
    Timer: 32,
    World: 64,
    Unique: 128,
    DomOnly: 256,
    CanvasOnly: 512 };

widgetFlags.FLAG_MASK = widgetFlags.Root | widgetFlags.Display | widgetFlags.Container;

const propertyMap2 = {
    'object':
    { dom:
    { funcs: [ { name: 'delete', info: '' } ],
        props: [],
        provides: 0 },
        canvas:
        { funcs: [ { name: 'delete', info: '' } ],
            props: [],
            provides: 0 },
        flex:
        { funcs: [ { name: 'delete', info: '' } ],
            props: [],
            provides: 0 } },
    'display':
    { dom:
    { funcs: [ { name: 'delete', info: '' } ],
        props: [],
        provides: 2 },
        canvas:
        { funcs: [ { name: 'delete', info: '' } ],
            props:
                [ { name: 'positionX', type: 0, default: 0 },
                    { name: 'positionY', type: 0, default: 0 },
                    { name: 'scaleX', type: 1, default: 1 },
                    { name: 'scaleY', type: 1, default: 1 } ],
            provides: 2 },
        flex:
        { funcs: [ { name: 'delete', info: '' } ],
            props: [],
            provides: 2 } },
    'container':
    { dom:
    { funcs: [ { name: 'delete', info: '' } ],
        props: [],
        provides: 6 },
        canvas:
        { funcs: [ { name: 'delete', info: '' } ],
            props:
                [ { name: 'positionX', type: 0, default: 0 },
                    { name: 'positionY', type: 0, default: 0 },
                    { name: 'scaleX', type: 1, default: 1 },
                    { name: 'scaleY', type: 1, default: 1 } ],
            provides: 6 },
        flex:
        { funcs: [ { name: 'delete', info: '' } ],
            props:
                [ { name: 'direction', type: 2, default: '' },
                    { name: 'alignItems', type: 2, default: '' } ],
            provides: 6 } },
    'canvas':
    { dom:
    { funcs: [ { name: 'delete', info: '' } ],
        props: [],
        provides: 10 },
        canvas:
        { funcs: [ { name: 'delete', info: '' } ],
            props:
                [ { name: 'positionX', type: 0, default: 0 },
                    { name: 'positionY', type: 0, default: 0 },
                    { name: 'scaleX', type: 1, default: 1 },
                    { name: 'scaleY', type: 1, default: 1 } ],
            provides: 10 },
        flex:
        { funcs: [ { name: 'delete', info: '' } ],
            props:
                [ { name: 'width', type: 0, default: 0 },
                    { name: 'height', type: 0, default: 0 } ],
            provides: 10 } },
    'root':
    { dom:
    { funcs: [ { name: 'delete', info: '' } ],
        props: [],
        provides: 7 },
        canvas:
        { funcs: [ { name: 'delete', info: '' } ],
            props:
                [ { name: 'positionX', type: 0, default: 0 },
                    { name: 'positionY', type: 0, default: 0 },
                    { name: 'scaleX', type: 1, default: 1 },
                    { name: 'scaleY', type: 1, default: 1 } ],
            provides: 7 },
        flex:
        { funcs: [ { name: 'delete', info: '' } ],
            props:
                [ { name: 'direction', type: 2, default: '' },
                    { name: 'alignItems', type: 2, default: '' },
                    { name: 'width', type: 0, default: 0 },
                    { name: 'height', type: 0, default: 0 },
                    { name: 'color', type: 6, default: '' } ],
            provides: 7 } },
    'image':
    { dom:
    { funcs: [ { name: 'delete', info: '' } ],
        props: [],
        provides: 2 },
        canvas:
        { funcs: [ { name: 'delete', info: '' } ],
            props:
                [ { name: 'positionX', type: 0, default: 0 },
                    { name: 'positionY', type: 0, default: 0 },
                    { name: 'scaleX', type: 1, default: 1 },
                    { name: 'scaleY', type: 1, default: 1 },
                    { name: 'link', type: 0, default: 0 } ],
            provides: 2 },
        flex:
        { funcs: [ { name: 'delete', info: '' } ],
            props: [ { name: 'link', type: 0, default: 0 } ],
            provides: 2 } },
    'text':
    { dom:
    { funcs: [ { name: 'delete', info: '' } ],
        props: [],
        provides: 2 },
        canvas:
        { funcs: [ { name: 'delete', info: '' } ],
            props:
                [ { name: 'positionX', type: 0, default: 0 },
                    { name: 'positionY', type: 0, default: 0 },
                    { name: 'scaleX', type: 1, default: 1 },
                    { name: 'scaleY', type: 1, default: 1 },
                    { name: 'value', type: 3, default: '' } ],
            provides: 2 },
        flex:
        { funcs: [ { name: 'delete', info: '' } ],
            props: [ { name: 'value', type: 3, default: '' } ],
            provides: 2 } },
};

let propMapping = {
    'id': {showName:'ID', type: propertyType.String, default: ''},
    'width': {showName:'W', type: propertyType.Integer, default: 0, group:'position'},
    'height': {showName:'H',type: propertyType.Integer, default: 0, group:'position'},
    'scaleType': {showName:'适配', type: propertyType.Select, default:'满屏', options:{'居上':2,'居中':3,'居下':4,'满屏':5}, group:'tools'},
    'color': {showName:'舞台颜色', type: propertyType.Color2, default: '', group:'tools'},
    'clipped': {showName:'剪切', type: propertyType.Boolean, default: false, group:'tools'},
    'title': {showName:'标题', type: propertyType.String, default: ''},
    'desc': {showName:'描述', type: propertyType.String, default: ''},
    'imgUrl': {showName:'', type: propertyType.String, default: ''}
};

let eventMapping = {
    'init': {showName:'初始化'},
    'click': {showName:'点击', info:['globalX','globalY']},
    'touchDown': {showName:'手指按下', info:['globalX','globalY']},
    'touchUp': {showName:'手指松开', info:['globalX','globalY']},
    'swipeLeft': {showName:'向左滑动'},
    'swipeRight': {showName:'向右滑动'},
    'swipeUp': {showName:'向上滑动'},
    'swipeDown': {showName:'向下滑动'},
};

let funcMapping = {
    'getRoot': {showName:'获取父级对象'},
    'delete': {showName: '删除对象'},
    'create': {showName:'创建对象', property:[
            {'name':'class', showName:'类别', 'value':null, 'type':propertyType.Select},
            {'name':'id', showName:'ID', 'value':null, 'type':propertyType.String},
            {'name':'bottom', showName:'是否置底', 'value':null, 'type':propertyType.Boolean2},
        ]},
    'gotoPage': {showName:'跳转到页面', property:[
            {'name':'page', showName:'页面', 'value':null, 'type':propertyType.Integer},
        ]},
    'gotoPageNum': {showName:'跳转到页数', property:[
            {'name':'num', showName:'页数', 'value':null, 'type':propertyType.Integer},
        ]},
    'nextPage': {showName:'下一页'},
    'prevPage': {showName:'上一页'},
    'getTouchX': {showName:'获取点击的X坐标'},
    'getTouchY': {showName:'获取点击的Y坐标'},
};

function dealWithProperties(prop){
    let m = propMapping[prop.name];
    if(m) {
        for(let p in m) {
            prop[p] = m[p];
        }
    }
}

function dealWithEvents(event){
    let e = funcMapping[event.name];
    if(e) {
        for(let p in e) {
            event[p] = e[p];
        }
    }
}

function dealWithFuncs(func){
    let f = funcMapping[func.name];
    if(f) {
        for(let p in f) {
            func[p] = f[p];
        }
    }
}

//对propertyMap的属性，事件，动作进行处理
for (let property in propertyMap2) {
    let prop = propertyMap2[property];
    for(let type in prop) {
        let t = prop[type];
        if(t.props&&t.props.length>0) {
            t.props.forEach((p)=>{
                //对属性处理
                dealWithProperties(p);
            });
        }
        if(t.events&&t.events.length>0) {
            t.events.forEach((e)=>{
                //对事件进行处理
                dealWithEvents(e);
            });
        }
        if(t.funcs&&t.funcs.length>0) {
            t.funcs.forEach((f)=>{
                //对动作进行处理
                dealWithFuncs(f);
            });
        }
    }
}

export {propertyMap2};
