// <div class="ui vertical menu">
//   <div class="item">
//     第一章 Home
//     <div class="menu">
//       <div class="item">1.1 Search
//         <div class="menu">
//           <div class="item">1.1.1 Add1</div>
//           <a class="active item">1.1.2 Add2</a>
//           <a class="item">1.1.3 Add3</a>
//         </div>
//       </div>
//       <a class="active item">1.2 Add</a>
//       <a class="item"><i class="checkmark icon"></i> 1.3 Remove</a>
//     </div>
//   </div>
//   <a class="item">
//     第二章 顶顶顶
//   </a>
//   <a class="item">
//     第三章
//   </a>
// </div>

var VerticalMenu = React.createClass({
  getInitialState: function () {
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
  selectItem:function(event){
    this.setState({selectedItemName:event.target.name});
  },
  renderItems: function(items){
    var _this = this;
    return (
      items.map(function(item){
        return item.items&&item.items.length>0 ? (
          <div className="item">{item.name}
              <div className="menu">
                { _this.renderItems(item.items) }
              </div>
          </div>
        ) : (
          <a className={_this.state.selectedItemName==item.name ? "active item":"item"} onClick={_this.selectItem} name={item.name}>{item.name}</a>
        );
      })
    );
  },
  render: function () {
    var items = this.props.items;
    return (
      <div className="ui vertical menu">
        { this.renderItems(items) }
      </div>
    );
  } 
});

