var Reflux = require('reflux');

export default Reflux.createActions([
  'selectWidget',                 //选中舞台组件、对象树图层
  'addWidget',                    //添加组件
  'addClass',                     //自定义组件
  'removeWidget',                 //删除组件
  'copyWidget',                   //复制组件
  'pasteWidget',                  //粘贴组件
  'cutWidget',                    //剪切组件
  'lockWidget',                   //锁定组件
  'reorderWidget',                //移动组件
  'initTree',                     //对象树的数据
  'render',                       //重新加载数据
  'updateProperties',             //更新属性
  'initEventTree',                //初始化事件树
  'removeEvent',                  //删除单个事件
  'removeEventTree',              //删除事件树
  'enableEvent',                  //单个事件的可执行与否
  'enableEventTree',              //事件树内全部事件的可执行与否,
  'renameWidget',                 //重命名组件
  'resetTrack',
  'syncTrack',
  'deletePoint',
  'saveNode',                     //保存文件
  'chooseFile',
  'setFont',
  'setImageText',
  'ajaxSend',
  'activeHandle']);
