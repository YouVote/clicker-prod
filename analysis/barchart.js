define(["d3js"],function(d3){
	var analysisParams={
		axisStrokeWidth:3,
		axisSpace:2, barSpace:5, //in percentage
		barColor:'#7755ff',
		barOffset:150
	}
	return {
		author:function(){

		},
		engine:function(coreParams,sideParams){
			// var opt=params.options, N=opt.length;
			// var opt=params.core, N=opt.length;
			var opt=coreParams, N=opt.length;
			var pHeight=500, pWidth=600;
			var dataBar,barScale;
			
			// if(typeof(params["analysisParams"])=="object"){
			// for(paramName in params["analysisParams"]){
			// analysisParams[paramName]=params["analysisParams"][paramName];
				console.log(sideParams)
			if(typeof(sideParams)=="object"){
				for(paramName in sideParams){
					if(analysisParams[paramName]!=undefined){
						analysisParams[paramName]=sideParams[paramName];
					}
				}
			}

			var ap=analysisParams; // shorten name
			var data=new Array(opt.length).fill(0);
			var respDom=document.createElement("div");

			function draw(height,width){
				var d3Obj, label, vAxis, yScale;
				yScale=d3.scaleLinear()
					.domain([-0.5,N-0.5])
					.range([0,height]);
				barScale=d3.scaleLinear()
					.domain([0,20])
					.range([0,width-ap.barOffset])
				d3Obj=d3.select(respDom).append("svg")
					.attr('height',height).attr('width',width)
				label=d3Obj.selectAll("text.graphLabels").data(opt).enter().append("text")
					.attr("class","graphLabels")
				vAxis=d3Obj.selectAll("line.axisLine").data(opt).enter().append("line")
					.attr("class","axisLine")
				dataBar=d3Obj.selectAll("rect").data(opt).enter().append('rect')
					.style('fill',ap.barColor)
					.attr('x',ap.barOffset+ap.axisStrokeWidth/2)
					.attr('y',function(d,i){
						return yScale(-0.5+i+0.01*ap.barSpace);
					})
					.attr('height',yScale(0.5-0.02*ap.barSpace))
				label.data(opt)
					.attr("dominant-baseline", "central").attr("text-anchor","end")
					.attr("dx","-10").attr("font-size",15)
					.attr("x",ap.barOffset)
					.attr("y",function(d,i){return yScale(i);})
					.html(function(d){return d;})
				vAxis.data(opt)
					.attr("x1",ap.barOffset).attr("x2",ap.barOffset)
					.attr("stroke-width",ap.axisStrokeWidth).attr("stroke","#333")
					.attr("y1",function(d,i){
						return yScale(i-0.5+0.01*ap.axisSpace);
					})
					.attr("y2",function(d,i){
						return yScale(i+0.5-0.01*ap.axisSpace);
				 	})
			}
			draw(pHeight,pWidth);

			this.dom=function(){
				return respDom;
			}

			this.update=function(newData){
				data=newData;
				dataBar
					.data(newData)
					.attr('width',function(d,i){
						return barScale(d);
					})
			}
			this.updateDim=function(height,width){
				draw(height,width)
			}
		}
	}
})