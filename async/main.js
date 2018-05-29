// stores function calls until loading object is reinstated 
// newly implemented to refactor common patterns for addressing
// asynchronous loading issues. Take note of limitations. 
define([],function(){
	return function(){
		var anoitedObj=null;
		var kivObj=new (function(){
			var kivQueue=[];
			this.pushKiv=function(method,args){
				var kivItem={"func":method,"args":args}
				kivQueue.push(kivItem);
			}
			this.popQueue=function(){
				return kivQueue.shift();
			}
		})();
		var proxy=new Proxy(kivObj,{
			get:function(kiv,method){
				if(anoitedObj==null){
					if(method=="__reinstate__"){
						return function(newObj){
							while(kivItem=kiv.popQueue()){
								var fn=newObj[kivItem.func];
								var args=kivItem.args;
								fn.apply(null,args);
							}
							anoitedObj=newObj;
						}
					}else{
						return function(...val) {
							kiv.pushKiv(method,val);
							return null;
						}
					}
				}else{
					return function(...val){
						var fn=anoitedObj[method];
						var args=val;
						return fn.apply(null,args);
					}
				}

			}
		})
		return proxy;
	}
})