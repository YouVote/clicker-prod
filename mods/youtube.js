define(["ctype"], function(ctype){
	var widgetParams={
		"analysis":"barchart",
		"analysisParams":null
	}
	return {
		author:function(){
			var editDiv=document.createElement("div");
			var mcqOptions;
			var vm;
			this.coreTemplate='"FXfrncRey-4"';
			this.currParams=function(params){
				mcqOptions=params.youtubeId;
				console.log(mcqOptions)
			}
			this.getNewParams=function(){

			}
		},
		appEngine:function(params){// which means change this to coreParams, sideAppParams
			if(typeof(params)!="object" || typeof(params.core)=="undefined"){
				var newParams={};
				newParams.core=params;
				params = newParams;
			}

			// var youtubeId=params.core.youtubeId;
			var youtubeId=params.core;
			var widBody=document.createElement("iframe");
				widBody.src="https://www.youtube.com/embed/"+youtubeId;
				widBody.width="100%";
				widBody.height="100%";
			
			this.widHead=function(){
				var widHead='';
				return widHead;
			}
			this.widBody=function(){
				return widBody;
			}
			this.getAns=function(){
				return appObj.getAns();
			};
			this.putAns=function(currAns){
				appObj.putAns(currAns);
			}
			this.grayOut=function(){
				appObj.grayOut();
			}
		},
		webEngine:function(params){ // may change this to coreParams, sideWebParams
			var webObj=this;
			var responseDom=document.createElement("div")
			var analysisObj;
			var yvProdBaseAddr=params.system.yvProdBaseAddr;

			if(typeof(params)!="object" || typeof(params.core)=="undefined"){
				var _params={};
				_params.core=params;
				params = _params;
			}
			// side params is used to override default behaviour 
			// specified in widgetParams.
			// loop over side params, replace widgetParams.
			if(typeof(params["side"])=="object"){
				for(paramName in params["side"]){
					if(widgetParams[paramName]!=undefined){
						widgetParams[paramName]=params["side"][paramName];
					}
				}
			}
			// dont think this line is really necessary, work out why this is here.  
			params.side=widgetParams;

			// var youtubeId=params.core.youtubeId;
			var youtubeId=params.core;
			var widBody=document.createElement("iframe");
				widBody.src="https://www.youtube.com/embed/"+youtubeId;
				widBody.width="100%";
				widBody.height="100%";

			this.widHead=function(){
				var widHead='';
				return widHead;
			}

			this.widBody=function(){
				return widBody;
			}

			this.responseInput=function(){
				return this.widBody;
			}

			this.responseDom=function(){
				return responseDom;
			}
			this.processResponse=function(studentUuid,ans){
				data[ans]++;
				return analysisObj.update(data);
			}
			this.updateRespDim=function(height,width){
				analysisObj.updateDim(height,width);
			}
		}
	}
})