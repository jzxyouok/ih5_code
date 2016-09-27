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
  'initTree',                     //对象树的数据
  'render',                       //重新加载数据
  'updateProperties',             //更新属性
  'initEventTree',                //初始化事件树
  'removeEventTree',              //删除事件树
  'enableEventTree',              //事件树内全部事件的可执行与否
  'activeEventTree',              //激活事件树
  'addEvent',                     //添加事件
  'removeEvent',                  //删除事件
  'enableEvent',                  //单个事件的可执行与否
  'renameWidget',                 //重命名组件
  'selectFunction',               //选择函数
  'addFunction',                  //添加函数
  'changeFunction',               //修改函数
  'removeFunction',               //删除函数
  'copyFunction',                 //复制函数
  'pasteFunction',                //黏贴函数
  'cutFunction',                  //剪切函数
  'selectVariable',               //选择变量
  'addVariable',                  //添加变量
  'changeVariable',               //添加变量
  'removeVariable',               //添加变量
  'copyVariable',                 //复制变量
  'pasteVariable',                //黏贴变量
  'cutVariable',                  //剪切变量
  'changeName',                   //修改名字(暂时可以用作函数和变量的名字修改)
  'resetTrack',
  'syncTrack',
  'deletePoint',
  'saveNode',                     //保存文件
  'setRulerLine',               //设置对齐线的显现
  'setFont',
  'setImageText',
  'imageTextSize',             //用于实时获取字体图片的宽高
  'ajaxSend',
  'saveFontList',
  'activeHandle']);
