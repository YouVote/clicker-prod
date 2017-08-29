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
			// why is onDomReady necessary? not necessary. 
			// implement this individually.
			// to call getAns, putAns, and grayOut.
			this.onDomReady=function(callback){	
				// domManager.onDomReady(callback);
			}
			// this.widHead()
			this.widBody=function(){
				var pushBtn=document.createElement("button");
				pushBtn.innerHTML="push";
				pushBtn.onclick=function(){
					app.sigAw("y");
				}
				return pushBtn;
			}
			// this.getAns(); this.putAns(); this.grayOut()
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
				console.log(studentUuid + " " + data)
			}
		}
	}
})