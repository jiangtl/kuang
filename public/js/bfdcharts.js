var d3 = require('d3');

function BfdChart (config) {
	this.container = config.container;
	this.width = config.width;
	this.height = config.height;
	
	this.colors = ["#3A6791", "#BA5982", "#BC844B", "#645C83"];
}
BfdChart.prototype.createSvg = function() {
	//在 container 里添加一个 SVG 画布   
	this.svg = d3.select(this.container)
		.append("svg")
		.attr("width", this.width)
		.attr("height", this.height)
	this.tooltip = this.createTooltip()
  setGradient(this.svg)
	return this;
}
BfdChart.prototype.createRect = function(config) {
	var rect = this.svg.append("rect")
    .attr("class", config.className)
    .attr("width", this.width)
    .attr("height", this.height);

  return this;
}
BfdChart.prototype.createFishEye = function(config) {
	this.fisheyeConfig = config;
	this.fisheye = d3.fisheye.circular().radius(config.radius || 150);
	return this;
}
BfdChart.prototype.createTooltip = function() {
	var div = d3.select(this.container)
		.append('div')
		.attr('class', 'tooltip')
		.style({
			position: 'absolute',
			left: 0,
			top: 0,
			opacity: 0,
			'pointer-events': 'none'
		})

	return div;
}
BfdChart.prototype.setSvgLayout = function(w, h) {
	document.querySelector('svg').setAttribute('style', "width:" + w + "px;height:" + h + 'px');
}
BfdChart.prototype.setData = function(data) {
	this.data = data
}
BfdChart.prototype.reDrawFishEye = function(data) {
	this.data = data
	this.remove()
	this.drawFishEye()
}
BfdChart.prototype.remove = function() {
	this.svg.selectAll("rect").remove()
  this.svg.selectAll("text").remove()
  this.svg.selectAll("line").remove()
  this.svg.selectAll("circle").remove()
}
BfdChart.prototype.drawFishEye = function() {
	var svg = this.svg;
	var tooltip = this.tooltip;
	var data = this.data;
	var width = this.width;
	var height = this.height;
	var colors = this.colors;
	var fisheye = this.fisheye;
  console.log(d3.layout)
  var force = d3.layout.force()
    .charge(-500)
    .linkDistance(function(d) {
      return d.value * 100
    })
    .size([this.width, this.height]);

  var n = data.nodes.length;
  var links = data.links;
  // createLinks by Group
  force.nodes(data.nodes).links(links);
  // Initialize the positions deterministically, for better results.
  data.nodes.forEach(function(d, i) {
    if(i == 0) {
      d.x = width / 2 - 50;
      d.y = height / 2 + 50;
    } else {
      d.x = d.y = height / n * i;
    }        
  });
  force.start();
  for (var i = n*3; i > 0; --i) {
    force.tick();
  }
  force.stop();

  var ox = 0,
      oy = 0;
  data.nodes.forEach(function(d) {
    ox += d.x, oy += d.y;
  });
  ox = ox / n - width / 2, oy = oy / n - height / 2;
  data.nodes.forEach(function(d) {
    d.x -= ox, d.y -= oy;
  });

  var link = svg.selectAll(".link")
    .data(links)
    .enter().append("line")
    .attr("class", "link")
    .attr("x1", function(d) {
      return d.source.x;
    })
    .attr("y1", function(d) {
      return d.source.y;
    })
    .attr("x2", function(d) {
      return d.target.x;
    })
    .attr("y2", function(d) {
      return d.target.y;
    })
    .style("stroke-width", function(d) {
      return Math.sqrt(d.value);
    })
    .on('click', function(d) {
      return d;
    })

  var node = svg.selectAll(".node")
    .data(data.nodes)
    .enter().append("circle")
    .attr("class", "node")
    //.attr("opacity", "0.9")
    .style("fill", function(d) {
      //colors[d.group]
      var gradientName = "gradient" + (parseInt(d.group) + 1)
      if(d.blacklist == 1) {
        gradientName = "gradient5"
      } else if(d.delay == 1) {
        gradientName = "gradient6"
      }
      return "url(#" + gradientName + ")"
    })
    .attr("cx", function(d) {
      return d.x;
    })
    .attr("cy", function(d) {
      return d.y;
    })
    .attr("r", function(d) {
      return 20 - d.group * 4
    })
    /*.on('click', function(d) {
      return d;
    })*/
    .on("mousemove", function(d, i) {
        d3.select(this).attr("opacity", "1")//.style("fill", colors[d.group])
        tooltip.transition()
          .duration(200)
          .style("opacity", .9)
        var data = [{name: "姓&nbsp;&nbsp;&nbsp;&nbsp;名", value: d.name}, {name: "身份证", value: d.id_no}];
        tooltip.html(getToolTipHtml(data))
          .style("left", (d3.event.offsetX + 15) + "px")
          .style("top", (d3.event.offsetY - tooltip[0][0].clientHeight / 2 + 10) + "px")
      })
      .on("mouseout", function(d) {
        //d3.select(this).attr("opacity", "0.9")//.style("fill", colors[d.group])
        tooltip.transition()
          .duration(200)
          .style("opacity", 0)
      })
      .on("mouseup", function(d, i) {
        force.stop();
        return d
      })
      .on("mousedown", function(d, i) {
        force.start();
        for (var i = n; i > 0; --i) {
			    force.tick();
			  }
        return d
      })
      .call(force.drag);

  var text = svg.selectAll()
    .data(data.nodes)
    .enter()
    .append("text")
    .style("fill", function(d) {
      return '#fff'
    })
    .attr("dx", function(d) {
      return (20 - d.group * 4) + 1
    })
    .attr("dy", -10)
    .text(function(d) {
      return d.name
    })
    .attr('opacity', 1)

  var relationText = svg.selectAll("text.label")
    .data(links)
    .enter().append("text")
    .attr("class", "label")
    /*.attr("transform", function(d) {
      var r = angle(d.source, d.target)
      return "translate(5,50)"
    })*/
    .attr("rotate", function(d){
      var r = angle(d.source, d.target)
      //console.log(d.target.name, r)
      return 0;
    })
    .attr("dx", function(d) {
      return (d.target.x + d.source.x)/2;
    })
    .attr("dy", function(d) {
      return (d.target.y + d.source.y)/2;
    })
    .style("fill", function(d) {
      return '#fff'
    })
    .text(function(d) {
      return d.relation 
    });

  svg.on("mousemove", function() {
    fisheye.focus(d3.mouse(this));
    node.each(function(d) {
        d.fisheye = fisheye(d);
      })
      .attr("cx", function(d) {
        return d.fisheye.x;
      })
      .attr("cy", function(d) {
        return d.fisheye.y;
      })
      .attr("r", function(d) {
        return d.fisheye.z * (20 - d.group * 4)
      });

    link.attr("x1", function(d) {
        return d.source.fisheye.x;
      })
      .attr("y1", function(d) {
        return d.source.fisheye.y;
      })
      .attr("x2", function(d) {
        return d.target.fisheye.x;
      })
      .attr("y2", function(d) {
        return d.target.fisheye.y;
      });

    text.attr('x', function(d) {
        return d.fisheye.x;
      })
      .attr('y', function(d) {
        return d.fisheye.y;
      })

    relationText.attr('dx', function(d) {
        return (d.target.fisheye.x + d.source.fisheye.x)/2;
      })
      .attr('dy', function(d) {
        return (d.target.fisheye.y + d.source.fisheye.y)/2;
      })
  });
}

function getToolTipHtml(data) {
  if (data.length == 0) {
    return '';
  }
  var tmp = '<tr><td style="color:#fff;padding:0">{name}：</td><td style="padding:0"><b>{value}</b></td></tr>';
  var trs = '';
  for (var i = 0; i < data.length; i++) {
    var name = data[i].name;
    var value = data[i].value;
    trs += tmp.replace("{name}", name).replace("{value}", value);
  }    
  return '<table>' + trs + '</table>';
}

function setGradient(svg) {
  var gradient1 = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient1")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  gradient1.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#FFF")
    .attr("stop-opacity", 1);
  
  gradient1.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#3A6791")
    .attr("stop-opacity", 1);

  var gradient2 = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient2")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  gradient2.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#FFF")
    .attr("stop-opacity", 1);
  
  gradient2.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#BA5982")
    .attr("stop-opacity", 1);

  var gradient3 = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient3")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  gradient3.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#FFF")
    .attr("stop-opacity", 1);
  
  gradient3.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#BC844B")
    .attr("stop-opacity", 1);

  var gradient4 = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient4")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  gradient4.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#FFF")
    .attr("stop-opacity", 1);
  
  gradient4.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "red")
    .attr("stop-opacity", 1);

  var gradient5 = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient5")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  gradient5.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#FFF")
    .attr("stop-opacity", 1);
  
  gradient5.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "red")
    .attr("stop-opacity", 1);

  var gradient6 = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient6")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  gradient6.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#FFF")
    .attr("stop-opacity", 1);
  
  gradient6.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#E1670E")
    .attr("stop-opacity", 1);
}

function angle(start,end){
  var diff_x = end.x - start.x,
      diff_y = end.y - start.y;
  //返回角度,不是弧度
  return 360*Math.atan(diff_y/diff_x)/(2*Math.PI);
}

exports.BfdChart = BfdChart