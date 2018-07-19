define([],function(){
	require.config({ urlArgs: "v=" +  (new Date()).getTime() });
	require.config({
		paths:{
			"mathjax": "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax"
		},
		shim:{
			"mathjax":{
				exports:"MathJax",
				init:function(){
					MathJax.Hub.Config({
						skipStartupTypeset: true,
						HTML: ["input/TeX","output/HTML-CSS"],
						TeX: { extensions: ["AMSmath.js","AMSsymbols.js"],
							equationNumbers: { autoNumber: "AMS" } },
						extensions: ["tex2jax.js"],
						jax: ["input/TeX","output/HTML-CSS"],
						tex2jax: { 
							inlineMath: [ ['$','$'], ["\\(","\\)"] ],
							displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
							processEscapes: true },
						"HTML-CSS": { availableFonts: ["TeX"],
						 	linebreaks: { automatic: true } }
					});
				}
			},
		}
	});

	return function(contRep){
		var data=null;
		var params={};
		if(typeof(contRep)=="string"){
			data=contRep;
		}else if(typeof(contRep)=="object"){
			data=contRep.data;
			if(contRep["mathjax"]!=undefined){
				params.mathjax=contRep.mathjax;
			}
		}
		this.putInto=function(div){ 
			// div may be 
			// 1) a jQuery object, 
			// 2) a DOM object, or 
			// 3) a css selector string. 
			$(div).html(data)
			if(params.mathjax==true){
				require(["mathjax"],function(mj){
					mj.Hub.Queue(["Typeset",mj.Hub,$(div).get(0)])
				})
			}
		}
		this.getDom=function(){
			var div=document.createElement("div");
			this.putInto(div);
			return div;
		}
		this.data=data;
	};
})