var React = require('react');
var Placard = require('./placard');
var Label = require('./label');
var List = require('./list');

var MultiSelectable = React.createClass({

  getInitialState: function () {
    return {
      editing: false,
      value: null,
      label: 'Loading...'
    }
  },

  handleClick: function () {
    if (!this.state.editing) {
      this.oldValue = this.state.value;
      this.setState({editing: true});
      this.refs.list1.unselectAll();
    }
  },

  handleAccept: function (newValue) {
    this.setState({
      editing: false,
      value: newValue,
      label: this.refs.list1.getLabel(newValue)
    });
    if (typeof(this.props.onAccept) === 'function') {
      this.props.onAccept(newValue.split(','));
    }
  },

  handleCancel: function (event) {
    this.setState({
      editing: false,
      value: this.oldValue,
      label: this.refs.list1.getLabel(this.oldValue)
    });
  },

  getListValue: function () {
    return this.state.value;
  },

  removeOption: function (i) {
    var options = this.state.value.split(',');
    options.splice(i, 1);
    var newValue = options.join();
    newValue = newValue.length ? newValue : null;
    this.setState({
      value: newValue,
      label: this.refs.list1.getLabel(newValue)
    });
  },

  handleListLoad: function () {
    var value = this.refs.list1.idToValue(this.props.value);
    this.setState({
      value: value,
      label: this.refs.list1.getLabel(value)
    });
  },

  handleListChange: function () {
    var options;
    if (this.state.value) {
      options = this.state.value.split(',');
    } else {
      options = [];
    }
    var selectedValue = this.refs.list1.getValue();
    if (selectedValue && options.indexOf(selectedValue) === -1) {
      options.push(selectedValue);
      var newValue = options.join();
      this.setState({
        value: newValue,
        label: this.refs.list1.getLabel(newValue)
      });
    }
    this.refs.list1.unselectAll();
  },

  render: function () {
    return (
      <Placard {...this.props} onClick={this.handleClick} onAccept={this.handleAccept} onCancel={this.handleCancel} getValue={this.getListValue}>
        <input ref={this.props.field + '-input'} className="form-control placard-field glass" type="text"
               id={this.props.field} value={this.state.label} readOnly={true}
               style={{display: (this.state.editing ? 'none' : 'block')}}/>
        <div className="selected-options">
          {this.state.editing && this.state.label ? this.state.label.split(',').map(function (l, i) {
            return (
              <span className="label label-info">
                {l}
                <span className="glyphicon glyphicon-remove" aria-hidden="true" onClick={this.removeOption.bind(this, i)}></span>
              </span>
            )
          }.bind(this)) : null}
        </div>
        <div style={{display: (this.state.editing ? 'block' : 'none')}}>
          <List ref="list1" {...this.props} noContainer={true} onChange={this.handleListChange} onLoad={this.handleListLoad}/>
        </div>
      </Placard>
    );
  }
});

module.exports = MultiSelectable;