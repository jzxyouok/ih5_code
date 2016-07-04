var bridge = window['VxBridge'];

module.exports = {
  create: function(width, height) {
    return bridge.create(width, height);
  },

  resetClass: function() {
    bridge.resetClass();
  },

  addClass: function(name) {
    bridge.addClass(name);
  },

  addWidget: function(parent, cls, id, props, timerWidget) {
    return bridge.addWidget(parent, cls, id, props, timerWidget);
  },

  removeWidget: function(widget) {
    bridge.removeWidget(widget);
  },

  setLinks: function(widget, obj) {
    bridge.setLinks(widget, obj);
  },

  getRoot: function() {
    return bridge.getRoot();
  },

  setRoot: function(n) {
    bridge.setRoot(n);
  },

  render: function() {
    bridge.render();
  },

  update: function(widget) {
    bridge.update(widget);
  },

  createGraphics: function() {
    return bridge.createGraphics();
  },

  encryptData: function(data, images) {
    return bridge.encryptData(data, images);
  },

  decryptData: function(data) {
    return bridge.decryptData(data);
  },

  createSelector: function() {
    return bridge.createSelector();
  },

  selectWidget: function(selector, widget, callback) {
    bridge.selectWidget(selector, widget, callback);
  },

  updateSelector: function(selector) {
    bridge.updateSelector(selector);
  },

  addMouseDownHandler: function(node, callback) {
    bridge.addMouseDownHandler(node, callback);
  }
};
