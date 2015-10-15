/*////////////////////////////////
//1. overview component
//   a. Monitoring component (contains the tab structure)
//      1. Tab1
//      2. Tab2
//      3. Tab3
//   b. Logs component
//      1. MessageList
//      2. Message
//
//////////////////////////////
*/

var tabList = [
  {
    'id': 1,
    'name': 'CPU',
    'url': '/cpu'
  }, {
    'id': 2,
    'name': 'RAM',
    'url': '/ram'
  }, {
    'id': 3,
    'name': 'NETWORK',
    'url': '/network'
  }
];

var Tab = React.createClass({
  handleClick: function(e) {
    e.preventDefault();
    this.props.handleClick();
  },

  render: function() {
    return (
      <li className={this.props.isCurrent
        ? 'current'
        : null}>
        <a href={this.props.url} onClick={this.handleClick}>
          {this.props.name}
        </a>
      </li>
    );
  }
});

var Tabs = React.createClass({
  handleClick: function(tab) {
    this.props.changeTab(tab);
  },

  render: function() {
    return (
      <div className="tabbable-custom nav-justified margintb_15">
        <ul className="nav nav-tabs nav-justified">
          {this.props.tabList.map(function (tab) {
            return (
              <Tab handleClick={this.handleClick.bind(this, tab)} isCurrent={(this.props.currentTab === tab.id)} key={tab.id} name={tab.name} url={tab.url}/>
            );
          }.bind(this))}
        </ul>
      </div>
    );
  }
});

var Monitoring = React.createClass({
  getInitialState: function() { //json data
    return {
      tabList: tabList,
      currentTab: 1,
      JsonD: ''
    };
  },

  changeTab: function(tab) {
    this.setState({
      currentTab: tab.id
    });
  },

  render: function() {
    return (
      <div>
        <Tabs changeTab={this.changeTab} currentTab={this.state.currentTab} tabList={this.state.tabList}/>
        <Content JsonD={this.state.JsonD} currentTab={this.state.currentTab} google={this.props.google} host={this.props.host} mhost={this.props.mhost}/>
      </div>
    );
  }
});

var Content = React.createClass({
  render: function() {
    return (
      <div className="content">
        {this.props.currentTab === 1
          ? <div className="cpu">
              <Cpu_total google={this.props.google} host={this.props.host} mhost={this.props.mhost}/>
            </div>
          : null}

        {this.props.currentTab === 2
          ? <div className="ram">
              <Memory google={this.props.google} host={this.props.host} mhost={this.props.mhost}/>

            </div>
          : null}

        {this.props.currentTab === 3
          ? <div className="network">
          <Network google={this.props.google} host={this.props.host} mhost={this.props.mhost}/>

          </div>
          : null}

      </div>
    );
  }
});

var Cpu_total = React.createClass({

  getInitialState: function getInitialState() {
    return {
      JsonD: ''
    };
  },

  componentDidMount: function() {
 //this.drawCharts();
 this.updateData();

     setInterval(this.updateData, 2000);

  },
  componentDidUpdate: function() {

    this.drawCharts();
  },

  updateData: function() {
    console.log("yessss");
    $.get(this.props.host, function(data) {
      console.log(data);

      this.setState({
        JsonD: data
      })
    }.bind(this));

  },

  drawCharts: function() {
    var stats = this.state.JsonD;
    console.log(stats);
    if (stats.spec.has_cpu && !this.hasResource(stats, "cpu")) {
      return;
    }

    var titles = [
      "Time", "Total"
    ];
    var data = [];
    for (var i = 1; i < stats.stats.length; i++) {

      var cur = stats.stats[i];
      var prev = stats.stats[i - 1];
      var intervalInNs = this.getInterval(cur.timestamp, prev.timestamp);

      var elements = [];
      elements.push(cur.timestamp);
      elements.push((cur.cpu.usage.total - prev.cpu.usage.total) / intervalInNs);
      data.push(elements);
    }

    var min = Infinity;
    var max = -Infinity;

    for (var i = 0; i < data.length; i++) {
      if (data[i] != null) {
        data[i][0] = new Date(data[i][0]);
      }

      for (var j = 1; j < data[i].length; j++) {
        var val = data[i][j];
        if (val < min) {
          min = val;
        }
        if (val > max) {
          max = val;
        }
      }
    }

    var minWindow = min - (max - min) / 15;
    if (minWindow < 0) {
      minWindow = 0;
    }
    var dataTable = new google.visualization.DataTable();

    dataTable.addColumn('datetime', titles[0]);
    for (var i = 1; i < titles.length; i++) {
      dataTable.addColumn('number', titles[i]);
    }
    dataTable.addRows(data);

    var opts = {
      curveType: 'function',
      height: 300,
      legend: {
        position: "none"
      },
      focusTarget: "category",
      vAxis: {
        title: "Cores",
        viewWindow: {
          min: minWindow
        }
      },
      legend: {
        position: 'bottom'
      }
    };
    if (min == max) {
      opts.vAxis.viewWindow.max = 3.1 * max;
      opts.vAxis.viewWindow.min = 0.9 * max;
    }

    var chart = new this.props.google.visualization.LineChart(document.getElementById("chart_1"));
 //  var chart2 = new google.visualization.LineChart(document.getElementById("chart_2"));

    chart.draw(dataTable, opts);
 //  chart2.draw(dataTable, opts);

  },

  hasResource: function(stats, resource) {
    return stats.stats.length > 0 && stats.stats[0][resource];
  },

  getInterval: function(current, previous) {
    var cur = new Date(current);
    var prev = new Date(previous);

    return (cur.getTime() - prev.getTime()) * 1000000;
  },

  render: function() {
    return (
      <div>
        <div id="chart_1"></div>
      </div>

    );
  }
});

var Memory = React.createClass({

  getInitialState: function getInitialState() {
    return {
      JsonD: ''
    };
  },

  componentDidMount: function() {
   this.updateData();
    setInterval(this.updateData, 1000);
  //  this.drawCharts();
  },
  componentDidUpdate: function() {
    this.drawCharts();
  },
  updateData: function() {
    $.get(this.props.host, function(data) {
      this.setState({
        JsonD: data
      })
    }.bind(this));
    $.get(this.props.mhost, function(mdata) {
      console.log(mdata);
      this.setState({
        machineInfo: mdata
      })
    }.bind(this));
  },
  drawCharts: function() {
    var stats = this.state.JsonD;
    var options = {
      title: 'megam',
      'width': 400,
      'height': 300
    };
    var titles = [
      "Time", "Total", "Hot"
    ];
    var data = [];
    for (var i = 1; i < stats.stats.length; i++) {
      var cur = stats.stats[i];
      var oneMegabyte = 1024 * 1024;
      var oneGigabyte = 1024 * oneMegabyte;
      var elements = [];
      elements.push(cur.timestamp);
      elements.push(cur.memory.usage / oneMegabyte);
      elements.push(cur.memory.working_set / oneMegabyte);
      data.push(elements);
    }
 //  var memory_limit = this.state.machineInfo.memory_capacity;
 //  if (stats.spec.memory.limit && (stats.spec.memory.limit < memory_limit)) {
 //    memory_limit = stats.spec.memory.limit;
 //  }
    var memory_limit = 1000000;
    var min = Infinity;
    var max = -Infinity;
    for (var i = 0; i < data.length; i++) {
      if (data[i] != null) {
        data[i][0] = new Date(data[i][0]);
      }
      for (var j = 1; j < data[i].length; j++) {
        var val = data[i][j];
        if (val < min) {
          min = val;
        }
        if (val > max) {
          max = val;
        }
      }
    }
    var minWindow = min - (max - min) / 10;
    if (minWindow < 0) {
      minWindow = 0;
    }
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('datetime', titles[0]);
    for (var i = 1; i < titles.length; i++) {
      dataTable.addColumn('number', titles[i]);
    }
    dataTable.addRows(data);
    var opts = {
      curveType: 'function',
      height: 300,
      legend: {
        position: "none"
      },
      focusTarget: "category",
      vAxis: {
        title: "Megabytes",
        viewWindow: {
          min: minWindow
        }
      },
      legend: {
        position: 'bottom'
      }
    };
    if (min == max) {
      opts.vAxis.viewWindow.max = 1.1 * max;
      opts.vAxis.viewWindow.min = 0.9 * max;
    }
    var chart = new google.visualization.LineChart(document.getElementById("chart_2"));
    chart.draw(dataTable, opts);
  },
  render: function() {
    return React.DOM.div({
      id: "chart_2",
      style: {
        height: "500px"
      }
    });
  }
});

var Network = React.createClass({

   getInitialState: function getInitialState() {
    return {
      JsonD: ''
    };
   },

   componentDidMount: function() {
    this.updateData();
    setInterval(this.updateData, 1000);
    this.drawCharts();
  },

  componentDidUpdate: function() {
    this.drawCharts();
  },

  updateData: function() {
    console.log("yessss");
    $.get(this.props.host, function(data) {
      console.log(data);
      console.log("got data-->");

      this.setState({
        JsonD: data
      })
    }.bind(this));

  },
  drawCharts: function() {
    var stats = this.state.JsonD;
    for (var i = 1; i < 10; i++) {
     console.log(stats.stats[i].network.interfaces); }
    //if (stats.spec.has_network && !this.hasResource(stats, "network")) {
    //  return;
    //}
  // Get interface index.
    var interfaceIndex = -1;
    if (stats.stats.length > 0) {
      interfaceIndex = this.getNetworkInterfaceIndex("eth0", stats.stats[0].network.interfaces);
    }
    if (interfaceIndex < 0) {
      console.log("Unable to find interface\"", interfaceName, "\" in ", stats.stats.network);
      return;
    }
    var titles = [
      "Time", "Tx bytes", "Rx bytes"
    ];
    var data = [];
    for (var i = 1; i < stats.stats.length; i++) {
      var cur = stats.stats[i];
      var prev = stats.stats[i - 1];
      var intervalInSec = this.getInterval(cur.timestamp, prev.timestamp) / 1000000000;
      var elements = [];
      elements.push(cur.timestamp);
      elements.push((cur.network.interfaces[interfaceIndex].tx_bytes - prev.network.interfaces[interfaceIndex].tx_bytes) / intervalInSec);
      elements.push((cur.network.interfaces[interfaceIndex].rx_bytes - prev.network.interfaces[interfaceIndex].rx_bytes) / intervalInSec);
      data.push(elements);
    }

          var min = Infinity;
          var max = -Infinity;

          for (var i = 0; i < data.length; i++) {
            if (data[i] != null) {
              data[i][0] = new Date(data[i][0]);
            }

            for (var j = 1; j < data[i].length; j++) {
              var val = data[i][j];
              if (val < min) {
                min = val;
              }
              if (val > max) {
                max = val;
              }
            }
          }

          var minWindow = min - (max - min) / 15;
          if (minWindow < 0) {
            minWindow = 0;
          }
          var dataTable = new google.visualization.DataTable();

          dataTable.addColumn('datetime', titles[0]);
          for (var i = 1; i < titles.length; i++) {
            dataTable.addColumn('number', titles[i]);
          }
          dataTable.addRows(data);

          var opts = {
            curveType: 'function',
            height: 300,
            legend: {
              position: "none"
            },
            focusTarget: "category",
            vAxis: {
              title: "Cores",
              viewWindow: {
                min: minWindow
              }
            },
            legend: {
              position: 'bottom'
            }
          };
          if (min == max) {
            opts.vAxis.viewWindow.max = 3.1 * max;
            opts.vAxis.viewWindow.min = 0.9 * max;
          }

          var chart = new this.props.google.visualization.LineChart(document.getElementById("chart_1"));
       //  var chart2 = new google.visualization.LineChart(document.getElementById("chart_2"));

          chart.draw(dataTable, opts);
       //  chart2.draw(dataTable, opts);

        },

        hasResource: function(stats, resource) {
          return stats.stats.length > 0 && stats.stats[0][resource];
        },

         getNetworkInterfaceIndex: function(interfaceName, interfaces) {
        	for (var i = 0; i < interfaces.length; i++) {
        		if (interfaces[i].name == interfaceName) {
        			return i;
        		}
        	}
        	return -1;
        },

        getInterval: function(current, previous) {
          var cur = new Date(current);
          var prev = new Date(previous);

          return (cur.getTime() - prev.getTime()) * 1000000;
        },

        render: function() {
          return (
            <div>
              <div id="chart_1"></div>
            </div>

          );
        }

});
