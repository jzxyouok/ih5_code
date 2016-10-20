import Reflux from 'reflux';
import Actions from '../actions/SelectTargetAction';

export default Reflux.createStore({
    init: function() {
        this.listenTo(Actions['selectBtnClick'], this.selectBtnClick);
        this.activeStId = null;
    },

    selectBtnClick: function(btnId, willActive) {
        this.activeStId = btnId;
        if(!willActive) {
            this.activeStId = null;
        }
        this.trigger({stUpdate: {stId: this.activeStId, isActive: willActive}});
    }
});