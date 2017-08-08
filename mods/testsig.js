define([],function(){
	return {
		authEngine:function(){
			this.templateParams=function(){
				return '\"\"';
			}
		},
		appEngine:function(params){
			var sigAw;
			var app=this;
			
			// why is onDomReady necessary?
			this.onDomReady=function(callback){	
				// domManager.onDomReady(callback);
			}
			this.widBody=function(){
				// return widBody;
				return "";
			}
			this.passSigAw=function(_sigAw){
				app.sigAw=_sigAw;
			}
			this.sigWa=function(data){
				console.log(data)
			}
		},
		webEngine:function(params){
			var sigWa;
			var web=this;
			// to be changed to widletArr
			this.responseInput=function(){
				var pushBtn=document.createElement("button");
				pushBtn.innerHTML="push";
				pushBtn.onclick=function(){
					web.sigWa("x");
				}
				return pushBtn;
			}
			this.responseDom=function(){
				return "";
			}
			this.passSigWa=function(_sigWa){
				web.sigWa=_sigWa;
			}
			this.sigAw=function(studentUuid,data){

			}
		}
	}
})