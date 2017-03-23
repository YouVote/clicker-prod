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

	return function(a){
		var data=null;
		var params={};
		if(typeof(a)=="string"){
			data=a;
		}else if(typeof(a)=="object"){
			data=a.data;
			if(a["mathjax"]!=undefined){
				params.mathjax=a.mathjax;
			}
		}
		this.putInto=function(div){
			div.innerHTML=data;
			if(params.mathjax==true){
				require(["mathjax"],function(mj){
					mj.Hub.Queue(["Typeset",mj.Hub,div])
				})
			}
		}
		this.data=data;
	};
})