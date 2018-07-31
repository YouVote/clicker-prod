define(["d3js"],function(d3){ // the archetypal chart for mcq
	var analysisParams={
		leftOffset:100, rightOffset:50,
		topOffset:0, bottomOffset:50,
		topChartPadding:20, bottomChartPadding:20,
		spacingRatio:0.2,
		barFill:"#aa88ff",
		barStroke:"#4422cc",
		barStrokeWidth:1
	}
	return {
		engine:function(coreParams,sideParams){
		// three different types of parameters in this module - 
		// 1. analysis params: can be set at the start, but does not change throughout session. expressed as AP.sth.
		// 2. dynamic data: height, width, dataArray, and entriesArray. Changes through during session. 
		// 3. derived params: depends on mixture of analysis params and dynamic data, expressed as function. 
			if(typeof(sideParams)=="object"){
				for(paramName in sideParams){
					if(paramName in analysisParams){
						analysisParams[paramName]=sideParams[paramName];
					}
				}
			}
			// 1. analysis params:
			var AP=analysisParams; // shorten name

			// 2. dynamic data:
			var entriesArray=coreParams; // does not change
			var dataArray=new Array(entriesArray.length).fill(0); // changed by new responses
			var height=400, width=600; // changed by setCanvasSize window

			// 3. derived parameters - express as functions so that formulas used become clear. 
			var N=function(){ // number of entries
				return entriesArray.length;
			}
			var chartHeight=function(){ // area in canvas dedicated to chart (excludes axes)
				return height-AP.topOffset-AP.bottomOffset;
			}
			var entryHeight=function(){ // distance between each entry
				return (chartHeight()-AP.topChartPadding-AP.bottomChartPadding)/(N()-AP.spacingRatio);
			}
			var entriesPosArr=function(){ // y-positions of the entries axis points for input into entriesScale
				var arr=[];
				for(var i=0;i<N();i++)
					arr.push(entryHeight()*(i+(1-AP.spacingRatio)/2)+AP.topChartPadding);
				return arr;
			}; 
			var currDataAxisRange;
			var dataAxisRange=function(){ // work out the range of data axis for input into dataScale
				var maxRange=Math.max.apply(null, dataArray), order=0;
				if(maxRange<5){
					return 6;
				}else{
					while(maxRange>1){ order++; maxRange/=10; }
					return (Math.ceil(maxRange*10)+1)*10**(order-1);
				}
			}
			// d3 scales - converting index/data values into pixels.
			var dataScale=function(){
				return d3.scaleLinear()
						.domain([0,dataAxisRange()])
						.range([0,width-AP.leftOffset-AP.rightOffset]);
			}
			var entriesScale=function(){
				return d3.scaleOrdinal()
						.domain(entriesArray)
						.range(entriesPosArr());
			}
			var dataAxisGen=function(){
				return d3.axisBottom(dataScale()).ticks(5);
			}
			var entriesAxisGen=function(){
				return d3.axisLeft().scale(entriesScale());
			}

			// initialize d3 objects
			var respDom=document.createElement("div");
			// an object belongs here somewhere. 
			function initRespDom(respDom){
			}
			var canvas=d3.select(respDom).append("svg");
			// var svg=document.createElement("svg");
			// var canvas=d3.select(svg);
			var bar=canvas.append("g");
			bar.selectAll("rect").data(dataArray)
				.enter().append("rect")
				.attr("fill",AP.barFill)
				.attr("stroke-width",AP.barStrokeWidth)
				.attr("stroke",AP.barStroke)
				.exit().remove();
			var dataAxis=canvas.append("g");
			var entriesAxis=canvas.append("g");
			var entriesLine=canvas.append("line");
			entriesLine
				.attr("stroke","black")
				.attr("stroke-width","1");
				
			// main barchart functions. 
			var setCanvasSize=function(newHeight=400,newWidth=600){
				// dom height and width may not be wellformed - test this to prevent errors.
				if(!isNaN(newHeight) && !isNaN(newWidth)){
					// height and width is now updated and will affect all the other functions 
					height=newHeight; width=newWidth;
				}
				// set min height. todo: work out min height necessary to prevent errors from negative rectangle heights. 
				height=(height<100 ? 100:height); width=(width<100 ? 100:width);
				$(respDom).css("height",height); $(respDom).css("width",width);
				canvas.attr("height",height).attr("width",width);
			}
			var redrawBarChart=function(transDur=0){ 
				bar.attr("transform","translate("+AP.leftOffset+","+AP.topOffset+AP.topChartPadding+")")
					.selectAll("rect").data(dataArray)
					.attr("height",entryHeight()*(1-AP.spacingRatio))
					.attr("y",function(d,i){return i*entryHeight();}) 
					.transition(d3.transition().duration(transDur))
					.attr("width",function(d){return dataScale()(d);})
			}
			var redrawDataAxis=function(transDur=0){
				dataAxis.attr("transform","translate("+AP.leftOffset+","+(AP.topOffset+chartHeight())+")")
					.transition(d3.transition().duration(transDur))
					.call(dataAxisGen())
			}
			var redrawEntriesAxis=function(){
				entriesAxis.attr("transform","translate("+(AP.leftOffset-1)+","+AP.topOffset+")")
					.call(entriesAxisGen())
				entriesLine
					.attr("x1", AP.leftOffset)
					.attr("y1", AP.topOffset)
					.attr("x2", AP.leftOffset)
					.attr("y2", AP.topOffset+chartHeight());
			}

			this.passDom=function(dom){
				// console.log("bar pass dom")
				$(dom).html(respDom)
				// minus to account for padding and prevent unbounded growth.
				// Todo: work out a systematic way to incorporate this mechanism
				// return respDom;
			}
			this.update=function(newDataArray){ 
				// dataArray is now updated and will affect all the other functions 
				dataArray=newDataArray;
				if(currDataAxisRange!=dataAxisRange()){
					redrawDataAxis(500);
					currDataAxisRange=dataAxisRange();
				}
				redrawBarChart(200);
			}
			this.updateDim=function(height,width){
				// console.log("bar update dim, h:" +height+", w:"+width)
				setCanvasSize(height,width);
				redrawBarChart();
				redrawEntriesAxis();
				redrawDataAxis();
			}
		}
	}
})