define([], function(){
	return{
		author:function(){
			this.coreTemplate='\"\"';
		},
		appEngine:function(){
			var appObj=document.createElement("input");
			appObj.style.width="100%";
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
			var appObj=document.createElement("input");
			appObj.style.width="100%";
			var respDom=document.createElement("div");
			this.responseInput=function(){
				return appObj;
			}
			this.responseDom=function(){
				return respDom;
			}
			this.processResponse=function(studentUuId,resp){
				respDom.innerHTML+=resp+"<br/>";
			}
		}
	}
});