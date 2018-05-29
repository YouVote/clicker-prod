define(['ctype'], function(ctype){
	return {
		author:function(){
			this.coreTemplate='{"imgUrl":"https://i.ytimg.com/vi/eeR6PM5hCiM/maxresdefault.jpg"}';
		},

		appEngine:function(params){
			// this section affects the user interface
			var optDiv=document.createElement("div");
			// todo: impose core/side params here
			var url=params.imgUrl;
			var pictObj=null;
			var pictKivQueue=[];
			// side params
			var aHeight=300,aWidth=300;var radius=4;
			var aMargin={top:10,bottom:10,right:10,left:10};
			
			// var domManager=new function(){
			// 	var domReady=false; var domReadyCallback=null;
			// 	this.domReady=function(){
			// 		if(domReadyCallback!=null){domReadyCallback();}
			// 		domReady=true;
			// 	}
			// 	this.onDomReady=function(callback){
			// 		if(domReady){callback();}
			// 		domReadyCallback=callback;
			// 	}
			// }();
			// this.onDomReady=function(callback){	
			// 	domManager.onDomReady(callback);
			// }

			require(["d3js"],function(d3){
				pictObj=new (function(){
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
				while(kivItem=pictKivQueue.shift()){
					var fn=pictObj[kivItem.func];
					var args=kivItem.args;
					fn.apply(null,args);
				}
			})

			this.widBody=function(){
				return optDiv;
			}
			this.getAns=function(){
				//  implement asycn here too
				if(pictObj!=null){
					return pictObj.getAns();
				}else{
					console.warn("pictObj not ready to getAns");
				}
			};
			this.putAns=function(currAns){
				if(pictObj!=null){
					pictObj.putAns(currAns);
				}else{
					var kivItem={func:"putAns",args:[currAns]};
					pictKivQueue.push(kivItem);
				}
			}

			// in clicker-app/core/question.js
			this.grayOut=function(){
				//to lock the svg screen so no need new data points could
				//be clicked after submitting
				// ansSvg.on("click",null);
				if(pictObj!=null){
					pictObj.grayOut();
				}else{
					var kivItem={func:"grayOut",args:[]};
					pictKivQueue.push(kivItem);
				}
			}
		},
		webEngine:function(params){
			var url=params.imgUrl;
			var pictObj=null;
			var pictKivQueue=[];
			
			var studentResponses=[];
			var respDom=document.createElement("div");
			// side params
			var pHeight=600,pWidth=600;
			var pMargin={top:10,bottom:10,left:30,right:10};
			
			require(["d3js"],function(d3){
				pictObj=new (function(){
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
				// webEngineReadyCallback();
				while(kivItem=pictKivQueue.shift()){
					var fn=pictObj[kivItem.func];
					var args=kivItem.args;
					fn.apply(null,args);
				}
			});

			this.responseInput=function(){
				var optDiv=document.createElement("div");
				return optDiv;
			}
			this.responseDom=function(){
				return respDom;
			}
			this.processResponse=function(studentUuid,ans){
				studentResponses.push(ans);
				if(pictObj!=null){
					pictObj.update(ans);
				}else{
					var kivItem={func:"update",args:[ans]};
					pictKivQueue.push(kivItem);
				}
			}
			this.updateRespDim=function(height,width){

			}
		}
	}
})