var Reflux = require('reflux');

export default Reflux.createActions([
  'selectWidget',                 //选中舞台组件、对象树图层
  'addWidget',                    //添加组件
  'addClass',                     //自定义组件
  'sortClass',                    //排序组件
  'deleteClass',                  //删除组件
  'removeWidget',                 //删除组件
  'copyWidget',                   //复制组件
  'pasteWidget',                  //粘贴组件
  'cutWidget',                    //剪切组件
  'lockWidget',                   //锁定组件
  'reorderWidget',                //移动组件
  'moveWidget',                   //跨层移动组件
  'alignWidgets',                 //分布或排序
  'initTree',                     //对象树的数据
  'render',                       //重新加载数据
  'updateProperties',             //更新属性

  'initEventTree',                //初始化事件树
  'removeEventTree',              //删除事件树
  'enableEventTree',              //事件树内全部事件的可执行与否
  'activeEventTree',              //激活事件树

  'addEvent',                     //添加事件
  'enableEvent',                  //单个事件的可执行与否
  'delEvent',                     //删除整条事件

  'getAllWidgets',                //获取所有的对象
  'reorderEventTreeList',         //重排事件列表

  'addSpecific',                  //添加事件目标
  'deleteSpecific',               //删除事件目标
  'changeSpecific',               //修改事件目标
  'enableSpecific',               //enable／disable事件目标

  'addEventChildren'  ,          //添加新的判断逻辑
  'delEventChildren'  ,          //删除判断逻辑
  'enableEventChildren',         //单个条件的可执行与否
  'recordEventTreeList',         //记录事件树

  'selectFadeWidget',             //选择伪对象
  'addFadeWidget',                //添加伪对象
  'changeFunction',               //修改函数
  'changeVariable',               //添加变量
  'changeDBItem',                 //修改数据库Item

  'pasteTreeNode',                  //黏贴功能入口
  'cutTreeNode',                    //剪切功能入口
  'copyTreeNode',                   //复制功能入口
  'deleteTreeNode',                 //删除功能入口
  'renameTreeNode',                 //重命名功能入口
  'originSizeTreeNode',             //原始大小功能入口
  'originPercentTreeNode',          //原始比例功能入口

  'resetTrack',
  'syncTrack',
  'deletePoint',
  'saveNode',                     //保存文件
  'setRulerLine',               //设置对齐线的显现
   'setRulerLineBtn',            //设置关于对齐线显现的按钮状态
  'setFont',
  'setImageText',
  'imageTextSize',             //用于实时获取字体图片的宽高
  'ajaxSend',
  'saveFontList',
  'activeHandle',

  'renameWidget',
  'didSelectTarget',         //选择了目标对象

  'updateConOptions',        //更新触发条件
  'closeKeyboardMove',      //禁止键盘左右上下移动

  'updateHistoryRecord',
  'revokedHistory',
  'replyHistory',
  'chooseHistory',
  'cleanHistory',
  'addProps',                 //给this.selectNode 添加一个属性
  'setVersion',                 //版本
  'changeResource',             //修改资源入口
]);
