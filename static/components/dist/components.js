"use strict";

var VerticalMenu = React.createClass({
  displayName: "VerticalMenu",

  getInitialState: function getInitialState() {
    return {
      selectedItemName: ""
    };
  },

  // componentDidMount: function () {
  //   this.timer = setInterval(function () {
  //     var opacity = this.state.opacity;
  //     opacity -= .05;
  //     if (opacity < 0.1) {
  //       opacity = 1.0;
  //     }
  //     this.setState({
  //       opacity: opacity
  //     });
  //   }.bind(this), 100);
  // },
  selectItem: function selectItem(event) {
    this.setState({ selectedItemName: event.target.name });
  },
  renderItems: function renderItems(items) {
    var _this = this;
    return items.map(function (item) {
      var hasSubitems = item.items;
      return hasSubitems ? React.createElement(
        "div",
        { className: "item" },
        item.name,
        React.createElement(
          "div",
          { className: "menu" },
          _this.renderItems(item.items)
        )
      ) : React.createElement(
        "a",
        { className: _this.state.selectedItemName == item.name ? "active item" : "item", onClick: _this.selectItem, name: item.name },
        item.name
      );
    });
  },
  render: function render() {
    var items = this.props.items;
    return React.createElement(
      "div",
      { className: "ui vertical menu" },
      this.renderItems(items)
    );
  }
});//# sourceMappingURL=components.map