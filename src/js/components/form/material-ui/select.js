var React = require('react');
var mui = require('material-ui');
var DropDownMenu = mui.DropDownMenu;
var KeyLine = mui.Utils.KeyLine;
var request = require('superagent');
var DomUtils = require('../../helpers/dom');

var ds1url = window.apiBaseURL || '/api';

function _createMenuItems(objs) {
  var menuItems = objs.map(function (obj) {
    return {
      payload: obj.id,
      text: obj.name
    };
  });
  menuItems.unshift({
    payload: 0,
    'text': 'Select item'
  });
  return menuItems;
}

var Select = React.createClass({

  getInitialState: function () {
    return {
      menuItems: [
        {
          payload: 0,
          text: 'Loading items...'
        }
      ]
    };
  },

  componentDidMount: function () {
    var source = this.props.source.replace('$ds1url', ds1url);
    var self = this;
    request
      .get(source)
      .end(function (res) {
        var menuItems;
        if (self.isMounted()) {
          if (res.ok) {
            if (self.props.paged) {
              menuItems = _createMenuItems(res.body[1]);
            } else {
              menuItems = _createMenuItems(res.body);
            }
            self.setState({menuItems: menuItems});
            var textItems = menuItems.map(function (item) {
              return item.text;
            });
            var menu = self.refs.dropdown.refs.menuItems;
            var menuElem = menu.getDOMNode();
            var computedStyle = document.defaultView.getComputedStyle(menuElem);
            var font = computedStyle.font;
            var height = KeyLine.Desktop.MENU_ITEM_HEIGHT * menuItems.length + KeyLine.Desktop.GUTTER_LESS;
            var width = DomUtils.computeMaxTextWidth(textItems, font) + 48;
            width = KeyLine.getIncrementalDim(width);
            menu._initialMenuHeight = parseInt(height);
            var el = self.getDOMNode();
            el.style.width = menuElem.style.width = parseInt(width) + 'px';
          }
        }
      });
  },

  render: function () {
    return (
      <div>
        <DropDownMenu ref="dropdown" menuItems={this.state.menuItems}/>
      </div>
    );
  }
});

module.exports = Select;