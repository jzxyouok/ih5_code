import Reflux from 'reflux';
import Actions from '../actions/SelectTargetAction';

export default Reflux.createStore({
    init: function() {
        this.listenTo(Actions['selectBtnClick'], this.selectBtnClick);
        this.activeStId = null;
    },

    selectBtnClick: function(btnId, willActive, targetList) {
        this.activeStId = btnId;
        this.targetList = targetList;
        if(!willActive) {
            this.activeStId = null;
            this.targetList = [];
        }
        this.trigger({stUpdate: {stId: this.activeStId, isActive: willActive, targetList:this.targetList}});
    }
});