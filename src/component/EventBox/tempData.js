let eventTempData = [
    {
        key: 1,
        name:'stage',
        props: {
            eventTree:[
                {   eid:1 ,
                    condition:'触发条件',
                    children:[],
                    specificList:[
                        {
                            sid:1,
                            object: '目标对象',
                            params: [
                                {   action: '目标动作',
                                    property: []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        key: 2,
        name:'rect',
        props: {
            eventTree: [
                {
                    eid: 2,
                    condition: '点击',
                    children: [{
                        bind: 'or',
                        object: '某某计数器',
                        action: '计算',
                        judgment: '=',
                        value: 'true',
                        calculator: 'true'
                    }],
                    specificList: [
                        {
                            sid: 2,
                            object: '某某图片',
                            params: [
                                {
                                    action: '设置属性',
                                    property: [
                                        {name: 'x坐标', types: '0', value: '1920'},
                                        {name: 'y坐标', types: '0', value: '1366'},
                                        {name: '剪切', types: '1', value: '-1'},
                                        {name: '复制', types: '1', value: '0'},
                                        {name: '粘贴', types: '1', value: '1'},
                                        {name: '属性名字', types: '2', value: '20'}
                                    ]
                                }
                            ]
                        }
                    ]
                }, {
                    eid: 3,
                    zhongHidden:true,
                    logicalFlag:'and',
                    conFlag:'触发条件',
                    condition: '触发条件',
                    children: [],
                    specificList: [
                        {
                            sid: 3,
                            object: '某某图片',
                            params: [
                                {
                                    action: '设置属性',
                                    property: [
                                        {name: 'x坐标', types: 0, value: '1920'},
                                        {name: 'y坐标', types: 0, value: '1366'},
                                        {name: '剪切', types: 1, value: -1},
                                        {name: '复制', types: 1, value: 0},
                                        {name: '粘贴', types: 1, value: 1},
                                        {name: '属性名字', types: 2, value: '20'}
                                    ]
                                }
                            ]
                        }, {
                            sid: 4,
                            object: '某某计数器',
                            params: [
                                {
                                    action: '赋值',
                                    property: [
                                        {name: '值', types: '0', value: '100'}
                                    ]
                                }
                            ]
                        }
                    ]
                }, {
                    eid: 4,
                    condition: '触发条件',
                    children: [
                        {bind: 'or', object: '图片', action: '隐藏', judgment: '=', value: 'true'},
                        {bind: 'or', object: '图片', action: '隐藏', judgment: '=', value: 'true'}
                    ],
                    specificList: [
                        {
                            sid: 5,
                            object: '目标对象',
                            params: [
                                {
                                    action: '目标动作',
                                    property: []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        key: 3,
        name:'cccc',
        props: {
            eventTree: [
                {
                    eid: 5,
                    condition: '触发条件',
                    children: [],
                    specificList: [
                        {
                            sid: 6,
                            object: '目标对象',
                            params: [
                                {
                                    action: '目标动作',
                                    property: []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        key: 4,
        name:'dddd',
        props: {
            eventTree: [
                {
                    eid: 6,
                    condition: '触发条件',
                    children: [],
                    specificList: [
                        {
                            sid: 7,
                            object: '目标对象',
                            params: [
                                {
                                    action: '目标动作',
                                    property: []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
];

export{eventTempData};