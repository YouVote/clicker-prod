define(["async"], function(AsyncProxy){
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
			var respDom = document.createElement("div");
			var wordlist={};
			var wordCloudObj=new AsyncProxy();
			// todo: refactor all this and pull out the arbitrary parameters. 
			requirejs.config({
				paths: {
					cloud: "https://cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.5/d3.layout.cloud.min"
				}
			});
			require(["d3js","cloud"],function(d3,cloud){
				wordCloudObjTemp=new (function(respDom){
					var color = d3.scaleLinear()
						.domain([0,1,2,3,4,5,6,10,15,20,100])
						.range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", 
							"#777", "#666", "#555", "#444", "#333", "#222"]);
					svgDom=d3.select(respDom).append("svg")
						.attr("width", 600)
						.attr("height", 350)
						.attr("class", "wordcloud");
					function draw(words){
						svgDom.selectAll("*").remove();
						svgDom.append("g")
							.attr("transform", "translate(320,200)")
							.selectAll("text")
							.data(words)
							.enter().append("text")
							.style("font-size", function(d) { return d.size + "px"; })
							.style("fill", function(d, i) { return color(i); })
							.attr("transform", function(d) {
								return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
							})
							.text(function(d) { return d.text; });
					}
					this.generateWordCloud=function(freqList){
						cloud().size([600, 300])
							.words(freqList)
							.rotate(0)
							.fontSize(function(d) { return d.size; })
							.on("end", draw)
							.start();				
					}
				})(respDom)
				wordCloudObj.__reinstate__(wordCloudObjTemp)
			})

			function redraw(wordList){
				// wordlist to frequency_list.
				keySorted=Object.keys(wordList).sort(function(a,b){return wordList[b]-wordList[a]}); 
				var maxCount=wordList[keySorted[0]];
				var freqlist=[];
				for(key in keySorted){
					var word=keySorted[key]
					var keyCount=wordList[word];
					// algo for assigning textsize. 
					var size=Math.floor(20*keyCount/maxCount+Math.log(keyCount+1))+20;
					var wordObj={"text":word,"size":size};
					freqlist.push(wordObj);
				}
				wordCloudObj.generateWordCloud(freqlist);
			}
			this.responseInput=function(){
				return appObj;
			}
			this.responseDom=function(){
				return respDom;
			}
			this.processResponse=function(studentUuId,resp){
				(resp in wordlist) ? wordlist[resp]++ : wordlist[resp]=1;
				redraw(wordlist);
			}
		}
	}
});