var Fluxy = require('fluxy');
var $ = Fluxy.$;
var AppConstants = require('../constants/app-constants');
var AppActions = require('../actions/app-actions');

var FormStore = Fluxy.createStore({

  getInitialState: function () {
    return {
      schema: {},
      item: {},
      options: {},
      pageResults: {}
    };
  },

  actions: [

    [AppConstants.GET_FORM_SCHEMA_COMPLETED, function (schema) {
      this.set('schema', schema);
    }],

    [AppConstants.CREATE_ENTITY_COMPLETED, function (options) {
      AppActions.alert({message: 'Item has been saved'});
    }],

    [AppConstants.CREATE_ENTITY_FAILED, function (err) {
      AppActions.alert(err);
    }],

    [AppConstants.UPDATE_ENTITY_COMPLETED, function (options) {
      AppActions.alert({message: 'Item has been saved'});
    }],

    [AppConstants.UPDATE_ENTITY_FAILED, function (err) {
      AppActions.alert({error: err, message: err});
    }],

    [AppConstants.DELETE_ENTITIES_COMPLETED, function (options) {
      AppActions.alert({message: 'Items have been deleted'});
    }],

    [AppConstants.DELETE_ENTITIES_FAILED, function (err) {
      AppActions.alert(err);
    }],

    [AppConstants.GET_ENTITY_COMPLETED, function (item) {
      this.set('item', item);
    }],

    [AppConstants.GET_ENTITY_FAILED, function (err) {
      AppActions.alert(err);
    }],

    [AppConstants.SAVE_VALUE_COMPLETED, function (options) {
      AppActions.alert({message: 'Value has been saved'});
    }],

    [AppConstants.SAVE_VALUE_FAILED, function (err) {
      AppActions.alert(err);
    }],

    [AppConstants.GET_SELECT_OPTIONS_COMPLETED, function (options) {
      var opts = $.js_to_clj(options);

      // TODO
      // dirty hack - not sure of cause
      var newopts = $.is_collection(opts) ? $.first(opts) : opts;

      this.set('options', $.merge(this.get('options'), newopts));
    }],

    [AppConstants.GET_SELECT_OPTIONS_FAILED, function (err) {
      AppActions.alert({error: err, message: err});
    }],

    [AppConstants.FETCH_PAGE_COMPLETED, function (pageResults) {
      this.set('pageResults', pageResults);
    }],

    [AppConstants.FETCH_PAGE_FAILED, function (err) {
      AppActions.alert(err);
    }],
  ],

  getFormSchema: function () {
    return this.getAsJS('schema');
  },

  getItem: function () {
    return this.getAsJS('item');
  },

  getSelectOptions: function (key) {
    return this.getAsJS(['options', key]) || [
        {
          value: '',
          label: 'Loading items...'
        }
      ];
  },

  getPageResults: function () {
    return this.getAsJS('pageResults');
  },
});

module.exports = FormStore;