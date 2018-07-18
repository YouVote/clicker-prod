define(["async","ctype"], function(AsyncProxy,ctype){ // the archetypal async module.
	return {
		author:function(){
			// this.coreTemplate='{"imgUrl":"https://i.ytimg.com/vi/eeR6PM5hCiM/maxresdefault.jpg"}';
			this.coreTemplate='"https://i.ytimg.com/vi/eeR6PM5hCiM/maxresdefault.jpg"';
		},

		appEngine:function(params){
			// this section affects the user interface
			if(typeof(params)!="object" || typeof(params.core)=="undefined"){
				var newParams={};
				newParams.core=params;
				params = newParams;
			}
			var url=params.core;

			var optDiv=document.createElement("div");
			// var pictObj=null; var pictKivQueue=[];
			var pictObj=new AsyncProxy();
			// side params
			var aHeight=300,aWidth=300;var radius=4;
			var aMargin={top:10,bottom:10,right:10,left:10};

			require(["d3js"],function(d3){
				pictObjTemp=new (function(){
					var ansTransfer = [];
					var ansDataset = [];
					var ansSvg=d3.select(optDiv).append('svg')
						.attr('height',aHeight).attr('width',aWidth)
						.style('background-color', 'white')

					var ansChart = ansSvg.append('g')
						.append('image')
						.attr('xlink:href', url)
						.attr('width', '100%')
						.attr('height', '100%')
						.attr('preserveAspectRatio', 'none')

					ansChart.on("click", function() {
						var coords = d3.mouse(this);
						//To ensure only one data point will be selected to be transferred as answer
						ansTransfer.shift(); 
						//coordinates as of the screen itself 
						var newData={x:(coords[0]),y:(coords[1])};
						var transData = {x: coords[0],y: aHeight-coords[1]};
						ansDataset.push(newData);
						ansTransfer.push(transData);
						makeCircle(ansDataset);
						ansDataset.shift();
					});

					function makeCircle(data){
						ansSvg.selectAll("circle").remove();
						ansSvg.selectAll("circle")  // For new circle, go through the update process
							.data(data)
							.enter()
							.append("circle")
							.attr("cx", function(d) {return d.x})
							.attr('cy', function(d) {return d.y})
							.attr('r', radius)
							.attr("fill","blue")
					}
					this.getAns=function(){
						if(typeof ansTransfer!="undefined" && 
							ansTransfer!=null && ansTransfer.length>0){
							return ansTransfer;
						}else{
							return null;
						}
					}
					this.putAns=function(data){
						makeCircle(data);
					}
					this.grayOut=function(){
						// to lock the svg screen so no new data points could
						// be clicked after submitting
						ansSvg.on("click",null);
					}
				})();
				pictObj.__reinstate__(pictObjTemp)
			})

			this.widBody=function(){
				return optDiv;
			}
			this.getAns=function(){
				return pictObj.getAns();
			};
			this.putAns=function(currAns){
				pictObj.putAns(currAns);
			}

			// in clicker-app/core/question.js
			this.grayOut=function(){
				// to lock the svg screen so no need new data points could
				// be clicked after submitting
				pictObj.grayOut();
			}
		},
		webEngine:function(params){
			if(typeof(params)!="object" || typeof(params.core)=="undefined"){
				var newParams={};
				newParams.core=params;
				params = newParams;
			}
			var url=params.core;

			// var pictObj=null;
			// var pictKivQueue=[];
			var pictObj=new AsyncProxy();
			
			var studentResponses=[];
			// var respDom=document.createElement("div");
			// side params
			var pHeight=600,pWidth=600;
			var pMargin={top:10,bottom:10,left:30,right:10};
			function initRespDom(respDom){
				require(["d3js"],function(d3){
					pictObjTemp=new (function(){
						var d3Obj=d3.select(respDom).append(`svg`)
							.attr('height',pHeight).attr('width',pWidth)
						d3Obj.append('g')
							.append('image')
							.attr('xlink:href', url)
							.attr('width', '100%')
							.attr('height', '100%')
							.attr('preserveAspectRatio', 'none')

						this.update=function(data){
							d3Obj.selectAll("circle")  // For new circle, go through the update process
								.data(data)
								.enter()
								.append("circle")
								.attr("cx", function(d,i) {
									return (d.x*(pWidth/300));
								}) 
								.attr('cy', function(d,i) {
									// formula for scaling from axis to svg
									return pHeight-(d.y*(pHeight/300));
								})
								.attr('r', 8)
								.attr("fill","red")
						}	
					})();
					pictObj.__reinstate__(pictObjTemp)
				});
			}
			// this.responseInput=function(){
			// 	var optDiv=document.createElement("div");
			// 	return optDiv;
			// }
			// this.responseDom=function(){
			// 	return respDom;
			// }
			this.passInputDom=function(inputDom){
			}
			this.passRespDom=function(respDom){
				initRespDom(respDom);
			}
			this.processResponse=function(studentUuid,ans){
				studentResponses.push(ans);
				pictObj.update(ans);
			}
			this.updateRespDim=function(height,width){

			}
		}
	}
})