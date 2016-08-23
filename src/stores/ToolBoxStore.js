/**
 * 用于左侧工具栏的 store
 */

import Reflux from 'reflux';
import Actions from '../actions/ToolBoxAction';

var toolBoxConfig = {
    activeButtonId: null,
    openSecondaryId: null
};

export default Reflux.createStore({
    init: function() {
        this.listenTo(Actions['onSelect'], this.onSelect);
        this.listenTo(Actions['onOpenSecondary'], this.onOpenSecondary);
        this.listenTo(Actions['onButtonClick'], this.onButtonClick);
    },

    onSelect: function(buttonId, groupId, boxId) {
        //console.log("select", buttonId);
        toolBoxConfig.activeButtonId = buttonId;
        toolBoxConfig.openSecondaryId = groupId;
        this.trigger(toolBoxConfig);
    },

    onOpenSecondary: function(groupId) {
        toolBoxConfig.openSecondaryId = groupId;
        this.trigger(toolBoxConfig);
    },

    onButtonClick: function(buttonId, groupId, boxId) {
        toolBoxConfig.activeButtonId = buttonId;
        this.trigger(toolBoxConfig);
    }

});