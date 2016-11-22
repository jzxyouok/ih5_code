import Reflux from 'reflux';
import Actions from '../actions/effectAction';

export default Reflux.createStore({
    init: function() {
        this.listenTo(Actions['getEffectList'], this.getEffectList);
        this.listenTo(Actions['createEffect'], this.createEffect);
    },

    getEffectList: function(effectList) {
        this.trigger({effectList : effectList});
    },

    createEffect: function (bool) {
        this.trigger({createEffect : bool});
    }
});

