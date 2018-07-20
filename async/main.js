// stores function calls until loading object is reinstated 
// newly implemented to refactor common patterns for addressing
// asynchronous loading issues. Take note of limitations. 
define([],function(){
	// pass identifier of class it is serving here, for purposes of providing debug info. 
	return function(className="_untitled_"){ 
		var anointedObj=null;
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
				if(anointedObj==null){
					if(method=="__reinstate__"){
						return function(newObj){
							while(kivItem=kiv.popQueue()){
								var fn=newObj[kivItem.func];
								var args=kivItem.args;
								fn.apply(null,args);
							}
							anointedObj=newObj;
						}
					}else{
						return function(...val) {
							kiv.pushKiv(method,val);
							return null;
						}
					}
				}else{
					return function(...val){
						var fn=anointedObj[method];
						if(fn!=undefined){
							return fn.apply(null,val);
						}else{
							console.warn("Method "+method+" does not exist in "+className+" class. Method call is ignored by AsyncProxy.")
						}
					}
				}

			}
		})
		return proxy;
	}
})