define(["async","ctype"], function(AsyncProxy,ctype){ // the archetypal async module.
	var widgetParams={}
	return {
		author:function(){
			this.coreTemplate='"https://mothership.sg/wp-content/uploads/2016/09/singapore_map.jpg"';
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
			// loop over side params, replace widgetParams.
			if(typeof(params)!="object" || typeof(params.core)=="undefined"){
				var _params={};
				_params.core=params;
				params = _params;
			}

			if(typeof(params["side"])=="object"){
				for(paramName in params["side"]){
					if(paramName in widgetParams){
						widgetParams[paramName]=params["side"][paramName];
					}
				}
			}
			params.side=widgetParams;

			var pHeight=500,pWidth=600;
			var url=params.core;
			var img=new Image(); img.src=url; 
			var imgHeight=0, imgWidth=0, imgRatio=0;
			img.onload=function(){
				imgHeight=img.height;
				imgWidth=img.width;
				imgRatio=imgHeight/imgWidth;
			}

			var pictObj=new AsyncProxy("picture");
			require(["d3js"],function(d3){
				pictObjTemp=new (function(){
					var pictDom=document.createElement("div");
					var canvas=d3.select(pictDom).append('svg')
					var imgObj=canvas.append('image')
							.attr('xlink:href', url)
					var respHeight=0, respWidth=0, dimRatio=0;
					var dataArr=[];
					this.passRespDom=function(respDom){
						// too many div in div, but just use this for now. 
						$(respDom).html(pictDom);
					}
					this.updateRespDim=function(height,width){
						dimRatio=height/width;
						if(dimRatio>imgRatio){
							respWidth=width;
							respHeight=width*imgRatio;
						}else{
							respHeight=height;
							respWidth=height/imgRatio;
						}
						canvas
							.attr('height', respHeight)
							.attr('width', respWidth)
						imgObj
							.attr('height', respHeight)
							.attr('width', respWidth)
							.attr('preserveAspectRatio', 'none')

						// may want to refactor this with updateData
						canvas.selectAll('ellipse')
							.data(dataArr)
							.attr('cx',function(d){
								return d.x*(respWidth/300); // 300 width is from app
							})
							.attr('cy',function(d){
								return (300-d.y)*(respHeight/300); // 300 height is from app
							})
							.attr('rx',function(){
								return 4*(respWidth/300); // 4 is radius from app
							})
							.attr('ry',function(){
								return 4*(respHeight/300); // 4 is radius from app
							})
					}
					this.updateData=function(newDataArr){
						dataArr=newDataArr;
						canvas.selectAll('ellipse')
							.data(dataArr).enter()
							.append('ellipse')
							.attr('cx',function(d){
								return d.x*(respWidth/300); // 300 width is from app
							})
							.attr('cy',function(d){
								return (300-d.y)*(respHeight/300); // 300 height is from app
							})
							.attr('rx',function(){
								return 4*(respWidth/300); // 4 is radius from app
							})
							.attr('ry',function(){
								return 4*(respHeight/300); // 4 is radius from app
							})
							.attr("fill","red")
					}
				})
				pictObj.__reinstate__(pictObjTemp);
			});
			
			var studentResponses=[];

			this.passInputDom=function(inputDom){}
			this.passRespDom=function(respDom){
				pictObj.passRespDom(respDom)
			}
			this.processResponse=function(studentUuid,ans){
				// some problem with app.getAns that returns ans as 
				// an array of a single object, but I dont want to deal with that now. 
				// so just taking the short cut. 
				studentResponses.push(ans[0]);
				pictObj.updateData(studentResponses);
			}
			this.updateRespDim=function(height,width){
				pictObj.updateRespDim(height,width)
			}
		}
	}
})