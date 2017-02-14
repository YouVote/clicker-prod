define([], function(){
	return {
		authEngine:function(){
			this.templateParams=function(){
				return '{}'
			}
		},
		appEngine:function(params,domReadyCallback){
			var optDiv=document.createElement("div");
			$(optDiv).html("waiting for question");

			this.responseDom=function(){
				return optDiv;
			}
			this.getAns=function(){
				return null;
			};
			this.putAns=function(currAns){
				
			}
			this.grayOut=function(){
				
			}
		},
		webEngine:function(params,webEngineReadyCallback){
			var optDiv=document.createElement("div");
			var respDom=document.createElement("div");
			$(optDiv).html("options go here");
			$(respDom).html("responses go here");
			this.responseInput=function(){
				return optDiv;
			}
			this.responseDom=function(){
				return respDom;
			}
			this.processResponse=function(studentUuid,ans){

			}
		}
	}
})