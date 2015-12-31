// <div class="ui card">
//   <div class="content">
//     <a class="ui left corner label">
//       <i class="location arrow icon"></i>
//     </a>
//     <div class="right floated like icon"><i class="right floated like icon"></i></div>
//     <div class="right floated like icon"><i class="right floated star icon"></i></div>
//     <div class="header">教学目标</div>
//     <div class="description">
//       <div><b>第1课时</b></div>
//       <div>教学目标1.。。。</div>
//       <div>教学目标2.。。。</div>
//       <div>教学目标3.。。。</div>
//       <div><b>第2课时</b></div>
//       <div>教学目标21.。。。</div>
//       <div>教学目标22.。。。</div>
//       <div>教学目标23.。。。</div>
//     </div>
//   </div>
//   <div class="extra content">
//     <div class="left floated"><i class="fire icon"></i> 111 </div>
//     <div class="right floated"><i class="location arrow icon"></i> 同步</div>
//   </div>
// </div>

var Card = React.createClass({
  getInitialState: function () {
    return {
      selectedItemName: ""
    };
  },
  selectItem:function(event){
    this.setState({selectedItemName:event.target.name});
  },
  renderHeadRightActions: function(schema,itemData) {
    return schema.headRightActions.map(function(itemSchema){
      var icon = itemSchema.active_icon && itemData[itemSchema.action + "_active"] ? itemSchema.active_icon : itemSchema.icon;
      icon = "right floated " + icon + " icon";
      return <div className={icon}><i className={icon}></i></div>
    });
  },
  renderExtraActions: function(schema,itemData) {
    return schema.extraActions.map(function(itemSchema){
      var actionTitle = itemSchema.title ? itemSchema.title : (itemSchema.titleProperty ? itemData[itemSchema.titleProperty] : "");
      var positionClassName = (itemSchema.position || "left") + " floated";
      var icon = itemSchema.active_icon && itemData[itemSchema.action + "_active"] ? itemSchema.active_icon : itemSchema.icon;
      icon += " icon";
      
      return <div className={positionClassName}><i className={icon}></i>{actionTitle}</div>
    });
  },
  render: function () {
    var schema = this.props.schema;
    var data = this.props.data;
    return (
      <div className="ui card">
        <div className="content">
          {this.renderHeadRightActions(schema, data)}
          <div className="header">{data.title}</div>
          <div className="description" dangerouslySetInnerHTML={{__html: data.description}}></div>
        </div>
        <div className="extra content">
          {this.renderExtraActions(schema, data)}
        </div>
      </div>
    );
  } 
});