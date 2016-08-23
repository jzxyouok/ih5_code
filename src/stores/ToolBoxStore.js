/**
 * 用于左侧工具栏的 store
 */

import Reflux from 'reflux';
import Actions from '../actions/ToolBoxAction';
import defaultTool from '../component/ToolBox/DEFAUL_TOOLBOX';

var selectSecondary = function(config, gid, cid) {
    // 是否有更新
    let hasUpdate = false;

    let data = config.data;
    let group = null;
    let groupIndex;
    for(let i =0; i < data.length; i++) {
       if(data[i].gid===gid) {
           group = data[i];
           groupIndex = i;
           break;
       }
    }

    if(group===null || !group.secondary instanceof Array) return;
    for(let j=0; j<group.secondary.length; j++) {
        if(group.secondary[j].cid===cid) {
            let temp = group.primary;
            group.primary = group.secondary[j];
            group.secondary[j] = temp;
            data[groupIndex] = group;
            hasUpdate = true;
            break;
        }
    }
    return hasUpdate;
};

var toolBoxConfig = {
    activeButtonId: null,
    openSecondaryId: null,
    data: defaultTool
};

export default Reflux.createStore({
    init: function() {
        this.listenTo(Actions['selectPrimary'], this.selectPrimary);
        this.listenTo(Actions['selectSecondary'], this.selectSecondary);
    },

    selectPrimary: function(buttonId, groupId, boxId) {
        this.clickPrimary(buttonId);
        this.openSecondary(groupId);
        this.trigger(toolBoxConfig);
    },

    selectSecondary: function(buttonId, groupId, boxId) {
        this.clickPrimary(buttonId);
        this.openSecondary(null);
        let hasUpdate = selectSecondary(toolBoxConfig.data, groupId, buttonId);
        this.trigger(toolBoxConfig, hasUpdate);
    },

    openSecondary: function(groupId, update) {
        toolBoxConfig.openSecondaryId = groupId;
        if(arguments.length>=2 && update) {
            this.trigger(toolBoxConfig);
        }
    },

    clickPrimary: function(buttonId) {
        toolBoxConfig.activeButtonId = buttonId;
    }

});