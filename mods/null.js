define([], function(){
	return {
		author:function(){
			this.coreTemplate='""';
		},
		appEngine:function(params){
			var optDiv=document.createElement("div");
			$(optDiv).html("waiting for question");
			var domManager=new function(){
				var domReady=false; var domReadyCallback=null;
				this.domReady=function(){
					if(domReadyCallback!=null){domReadyCallback();}
					domReady=true;
				}
				this.onDomReady=function(callback){
					if(domReady){callback();}
					domReadyCallback=callback;
				}
			}();
			this.onDomReady=function(callback){	
				domManager.onDomReady(callback);
			}

			this.widHead=function(){
				var widHead='';
				return widHead;
			}
			this.widBody=function(){
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
			this.passInputDom=function(inputDom){

			}
			this.passRespDom=function(respDom){
				
			}
			this.updateRespDim=function(height,width){

			}
			this.processResponse=function(studentUuid,ans){

			}
		}
	}
})