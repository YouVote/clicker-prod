define(["async"], function(AsyncProxy){
	return{
		author:function(){
			this.coreTemplate='\"\"';
		},
		appEngine:function(){
			var appObj=document.createElement("input");
			appObj.style.width="100%";
			appObj.type="number";
			this.widBody=function(){
				return appObj;
			}
			this.getAns=function(){
				return appObj.value;
			};
			this.putAns=function(currAns){
				appObj.value=currAns;
			}
			this.grayOut=function(){
				appObj.disabled=true;
			}
		},
		webEngine:function(){
			// include d3 in here
			var appObj=document.createElement("input");
			appObj.style.width="100%";
			appObj.type="number";
			var numlist={};
			var analysisObj=new AsyncProxy();
			// var respDom=document.createElement("div");
			function initRespDom(respDom){
				require(["d3js"],function(d3){
					analysisObjTemp=new(function(respDom){
						var svg=d3.select(respDom).append("svg")
							.attr("width",500).attr("height",500)
						var plot;
						this.generatePlot=function(freqList){
							plot=svg.selectAll("circle")
								.data(freqList)
								.enter()
									.append("circle")

						}
						// try to do an addEntry instead. 
						this.addEntry=function(num){
							
						}
					})(respDom)
					analysisObj.__reinstate__(analysisObjTemp)
				})
			}
			// this.responseInput=function(){
			// 	return appObj;
			// }
			// this.responseDom=function(){
			// 	return respDom;
			// }
			this.passInputDom=function(inputDom){
				$(inputDom).html(appObj);
			}
			this.passRespDom=function(respDom){
				initRespDom(respDom);
			}
			this.processResponse=function(studentUuId,resp){
				(resp in numlist) ? numlist[resp]++ : numlist[resp]=1;
				analysisObj.generatePlot(numlist);
			}
		}
	}
});