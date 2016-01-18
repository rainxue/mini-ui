// class CardList extends React.Component {
//   render() {
//     return <div>Hello {this.props.name}</div>;
//   }
// }

// class CardList extends React.Component {
//   constructor(props) {
//     super(props);
//     //this.state = {count: props.initialCount};
//     this.state = { items: [] };
//   }  
//   // state : {
//   //     items: []
//   // }
//   componentDidMount() {
//     $.get(this.props.source, function(result) {
//       if (this.isMounted()) {
//         this.setState({
//           items: result
//         });
//       }
//     }.bind(this));
//   }
//   render(){
//     var _this = this;
//     return (
//           <div className="ui" >
//            {
//              this.state.items.map(function(item){
//                return <Card schema={_this.props.schema} data={item} />
//              })
//            }
//            </div>
//            );
//   }
// }


var CardList = React.createClass({
  getInitialState: function () {
    return {
      items: []
    };
  },
  componentDidMount: function() {
    $.get(this.props.source, function(result) {
      if (this.isMounted()) {
        this.setState({
          items: result
        });
      }
    }.bind(this));
  },
  // render: function(){
  //   var _this = this;
  //   return (
  //          <div className="ui cards">
  //          {
  //            this.state.items.map(function(item){
  //              return <Card schema={_this.props.schema} data={item} />
  //            })
  //          }
  //          </div>
  //          );
  // },
  render: function(){
    var _this = this;
    var items = [];
    this.state.items.map(function(item){
      items.push(<Card schema={_this.props.schema} data={item} />);
    });
    if(items.length==0) items.push(<div>无数据</div>);
    return <div className="ui cards">{items}</div>
  }
});