define(["d3js"],function(d3){
	return function(params){
		var opt=params.options;
		var d3Obj, label, vAxis, dataBar;
		var yScale, barScale;

		var axisStrokeWidth=3;
		var axisSpace=2, barSpace=5; //in percentage
		var pHeight=500, pWidth=600, barColor='#7755ff';
		var barOffset=150;

		var data=new Array(opt.length).fill(0);
		var respDom=document.createElement("div");

		require(["d3js"],function(d3) {
			yScale=d3.scaleLinear()
				.domain([-0.5,opt.length-0.5])
				.range([0,pHeight]);
			barScale=d3.scaleLinear()
				.domain([0,20])
				.range([0,pWidth-barOffset])
			d3Obj=d3.select(respDom).append("svg")
				.attr('height',pHeight).attr('width',pWidth)
			label=d3Obj.selectAll("text.graphLabels").data(opt).enter().append("text")
				.attr("class","graphLabels")
			vAxis=d3Obj.selectAll("line.axisLine").data(opt).enter().append("line")
				.attr("class","axisLine")
			dataBar=d3Obj.selectAll("rect").data(opt).enter().append('rect')
				.style('fill',barColor)
				.attr('x',barOffset+axisStrokeWidth/2)
				.attr('y',function(d,i){
					return yScale(-0.5+i+0.01*barSpace);
				})
				.attr('height',yScale(0.5-0.02*barSpace))
			label.data(opt)
				.attr("dominant-baseline", "central").attr("text-anchor","end")
				.attr("dx","-10").attr("font-size",15)
				.attr("x",barOffset)
				.attr("y",function(d,i){return yScale(i);})
				.html(function(d){return d;})
			vAxis.data(opt)
				.attr("x1",barOffset).attr("x2",barOffset)
				.attr("stroke-width",axisStrokeWidth).attr("stroke","#333")
				.attr("y1",function(d,i){
					return yScale(i-0.5+0.01*axisSpace);
				})
				.attr("y2",function(d,i){
					return yScale(i+0.5-0.01*axisSpace);
			 	})
		});

		this.dom=function(){
			return respDom;
		}

		this.update=function(newData){
			dataBar
				.data(newData)
				.attr('width',function(d,i){
					return barScale(d);
				})

		}
	}

})