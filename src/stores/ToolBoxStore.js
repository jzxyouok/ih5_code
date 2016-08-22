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
    },

    onSelect: function(buttonId, groupId, boxId) {
        //console.log("select", buttonId);
        toolBoxConfig.activeButtonId = buttonId;
        this.trigger(toolBoxConfig);
    },

    onOpenSecondary: function(groupId) {
        toolBoxConfig.openSecondaryId = groupId;
        this.trigger(toolBoxConfig);
    }

});