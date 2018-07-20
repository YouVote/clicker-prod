define(["async"], function(AsyncProxy){
	var widgetParams={
		"analysis":"pilechart",
		"analysisParams":null
	}
	return{
		author:function(){
			this.coreTemplate='\"\"';
		},
		appEngine:function(params){
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
		webEngine:function(params){
			// include d3 in here
			var appObj=document.createElement("input");
			appObj.style.width="100%";
			appObj.type="number";
			var numlist={};
			var analysisObj;

			var yvProdBaseAddr=params.system.yvProdBaseAddr;
			// loop over side params, replace widgetParams.
			if(typeof(params)!="object" || typeof(params.core)=="undefined"){
				var _params={};
				_params.core=params;
				params = _params;
			}

			if(typeof(params["side"])=="object"){
				for(paramName in params["side"]){
					if(widgetParams[paramName]!=undefined){
						widgetParams[paramName]=params["side"][paramName];
					}
				}
			}
			params.side=widgetParams;
			
			var analysisObj=new AsyncProxy(widgetParams['analysis']);
			require([yvProdBaseAddr+"/analysis/"+widgetParams['analysis']+".js"],function(analysis){
				analysisObjTemp=new analysis.engine(params.core,params.side["analysisParams"]);
				analysisObj.__reinstate__(analysisObjTemp);
			})

			this.passInputDom=function(inputDom){
				$(inputDom).html(appObj);
			}
			this.passRespDom=function(respDom){
				// this is like an init
				analysisObj.passDom(respDom);
			}
			this.updateRespDim=function(height,width){
				analysisObj.updateDim(height,width)
			}
			this.processResponse=function(studentUuId,resp){
				(resp in numlist) ? numlist[resp]++ : numlist[resp]=1;
				analysisObj.update(numlist);
			}
		}
	}
});