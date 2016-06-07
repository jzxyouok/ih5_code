import Reflux from 'reflux'

var ApiActions = Reflux.createActions([
    'login',
    'logout',
    'getsvcs',
    'getcase',
    'setcase'
]);

module.exports = ApiActions;