var React = require('react');
var AppActions = require('../../actions/app-actions');
var FormStore = require('../../stores/form-store');
var FormStoreWatchMixin = require('../../mixins/form-store-watch-mixin');
var Placard = require('./placard');
var _ = require('../../helpers/functional');
window.$ = window.jQuery = require('jquery');

var valueFunctions = [];

var Readonly = React.createClass({

  mixins: [FormStoreWatchMixin(getFormSchema)],

  componentWillMount: function () {
    AppActions.getFormSchema(this.props.name);
  },

  render: function () {
    var schema = this.state.schema;
    var formType = this.props.formType || 'horizontal';
    var value = this.props.value || {};
    var fields = this._createElements(schema, formType, value);
    return (
      <form className="form-horizontal readonly" ref="form1">
        {fields}
      </form>
    );
  },

  _createElements: function (schema, formType, value) {
    var properties;
    if ('schema' in schema && !$.isEmptyObject(value)) {
      if ('properties' in schema.schema) {
        properties = schema.schema.properties;
      } else {
        properties = schema.schema;
      }

      var formOptions = schema.form;

      // TODO
      // The form options array was intended to communicate field order
      // as JSON object keys are unordered, as per the spec.
      // Enhance to use form options index to order fields, if given.
      if (formOptions && formOptions.constructor === Array) {
        var opts = {};
        for (var i = 0; i < formOptions.length; i++) {
          var opt = formOptions[i];
          var key = opt.key;
          delete opt.key;
          opts[key] = opt;
        }
        formOptions = opts;
      }

      return _.mapObject(function (k, v) {
        var opts = $.extend({}, {key: k, field: k, value: value[k], formType: formType}, v);
        if (formOptions && (k in formOptions)) {
          opts = $.extend({}, opts, formOptions[k]);
        }
        if (this.props.noChange) {
          var ReadonlyText = require('./readonly-text');
          return (
            <ReadonlyText {...opts} labelGridColumns={3}/>
          );
        }
        if (v.type === 'string' && !('enum' in v)) {
          if (opts.escape) {
            opts.value = encodeURI(opts.value);
          }
          if (opts.type === 'textarea') {
            return this._createTextarea(opts);
          }
          return this._createTextInput(opts);

        } else if (v.type === 'integer') {
          return this._createTextInput(opts);

        } else if (v.type === 'array' || 'enum' in v) {
          if (opts.type === 'pillbox') {
            return this._createPillbox(opts);
          }
          if (!v.hasOwnProperty('enum')) {
            opts.value = value[k + 'Id'];
          }
          return this._createSelect(opts);

        } else if (v.type === 'boolean') {
          return this._createBool(opts);
        }
      }.bind(this), properties);

    } else {
      return this._createLabel('Loading...');
    }
  },

  _createLabel: function (text) {
    return React.createElement('label', null, text);
  },

  _getTextValue: function (field) {
    return function () {
      return this.refs[field + '-input'].getDOMNode().value;
    }.bind(this)
  },

  _createTextInput: function (opts) {
    var TextInput = require('./text-input');
    return (
      <Placard field={opts.field} title={opts.title} onAccept={this._handleAccept(opts.field)} getValue={this._getTextValue(opts.field)}>
        <TextInput ref={opts.field + '-input'} {...opts} className="form-control placard-field glass" noContainer={true}/>
      </Placard>
    );
    // return (
    //   <Placard field={opts.field} title={opts.title} onAccept={this._handleAccept(opts.field)} getValue={this._getTextValue(opts.field)}>
    //     <input ref={opts.field + '-input'} className="form-control placard-field glass" id={opts.field} name={opts.field} defaultValue={opts.value}/>
    //   </Placard>
    // );
  },

  _createTextarea: function (opts) {
    var Textarea = require('./textarea');
    return (
      <Placard field={opts.field} title={opts.title} onAccept={this._handleAccept(opts.field)} getValue={this._getTextValue(opts.field)}>
        <Textarea ref={opts.field + '-input'} className="form-control placard-field glass" {...opts} rows={opts.rows || (opts.value ? 5 : 1)} noContainer={true}/>
      </Placard>
    );
    // return (
    //   <Placard field={opts.field} title={opts.title} onAccept={this._handleAccept(opts.field)} getValue={this._getTextValue(opts.field)}>
    //     <textarea ref={opts.field + '-input'} className="form-control placard-field glass" id={opts.field} name={opts.field} rows={opts.rows || (opts.value ? 5 : 1)} defaultValue={opts.value}/>
    //   </Placard>
    // );
  },

  _createPillbox: function (opts) {
    var field = opts.field;
    var Pillbox = require('./pillbox');
    valueFunctions.push(function () {
      var obj = {};
      obj[field] = $('#' + field).pillbox('items').map(function (obj) {
          return obj.text;
        });
      return obj;
    });
    return (
      <Pillbox {...opts} labelGridColumns={3}/>
    );
  },

  _createBool: function (opts) {
    var Check = require('./check');
    return (
      <Check {...opts} labelGridColumns={3} onAccept={this._handleAccept(opts.field)}/>
    );
  },

  _createSelect: function (opts) {
    var field = opts.field;
    if (opts.type === 'multiselect') {
      opts.multi = true;
      valueFunctions.push(function (data) {
        var obj = {};
        if (data && data[field]) {
          if (typeof data[field] === 'string') {
            obj[field] = data[field].split(',');
          } else {
            obj[field] = data[field];
          }
        } else {
          obj[field] = null;
        }
        return obj;
      });
      var MultiSelectable = require('./multi-selectable');
      return (
        <MultiSelectable {...opts} labelGridColumns={3} onAccept={this._handleAccept(field)}/>
      );
    }
    var Selectable = require('./selectable');
    return (
      <Selectable {...opts} labelGridColumns={3} onAccept={this._handleAccept(field)}/>
    );
  },

  _handleAccept: function (field) {
    return function (newValue) {
      if (typeof(this.props.onChange) === 'function') {
        this.props.onChange(field, newValue);
      }
    }.bind(this);
  }
});

function getFormSchema() {
  return {schema: FormStore.getFormSchema()};
}

module.exports = Readonly;