define(['ctype'], function(ctype){
	return {
		authEngine:function(){
			this.templateParams=function(){
				//params.options refer to this part
				//options is the name to be called (i.e. can be changed, with
				//other sections to be changed accordingly also.)

				return '{"url":["http://www.physicsclassroom.com/getattachment/reviews/vectors/q52.gif"]}'
			}
		},
		appEngine:function(params,domReadyCallback){
			// this section affects the user interface
			var optDiv=document.createElement("div");
			var inputDoms;
			var ansSvg;
			var aHeight = 300, 
				aWidth = 300;
			var aMargin = {top : 10, bottom : 10, right : 10, left : 10};
			var ansChart, url;
			var ansTransfer = [];
			var ansDataset = [];
			var radius = 4;
			//require d3js does nt work here
			require([],function(){
				url=params.url[0];

				ansSvg = d3.select(optDiv).append('svg')
					.attr('height',aHeight).attr('width',aWidth)
					.style('background-color', 'white')


				ansChart = ansSvg.append('g')
						.append('image')
						.attr('xlink:href', url)
						.attr('width', '100%')
						.attr('height', '100%')
						.attr('preserveAspectRatio', 'none')


				ansChart.on("click", function() {

				    var coords = d3.mouse(this);

				    //To ensure only one data point will be selected to be transferred as answer
				    ansTransfer.shift(); 
				    
				    //coordinates as of the screen itself 
				    var newData= {
				    x: (coords[0]),  
				    y: (coords[1])
				    };

				    var transData = {
				    	x: coords[0],
				    	y: aHeight-coords[1]
				    };
				    ansDataset.push(newData);
				    ansTransfer.push(transData);
					
					makeCircle(ansDataset);
					ansDataset.shift();
				});

				function makeCircle(data){
					ansSvg.selectAll("circle").remove();
				    ansSvg.selectAll("circle")  // For new circle, go through the update process
					    .data(data)
					    .enter()
					    .append("circle")
					    .attr("cx", function(d) {return d.x})
					    .attr('cy', function(d) {return d.y})
					    .attr('r', radius)
					    .attr("fill","blue")
				}

		        domReadyCallback();
			})

			this.responseDom=function(){
				// console.log("1");
				return optDiv;
			}
			this.getAns=function(){
				if(typeof ansTransfer != "undefined" && ansTransfer != null && ansTransfer.length > 0){
					return ansTransfer;
					console.log(ansTransfer);
				}
				return null;
			};
			this.putAns=function(currAns){
				// console.log("3");
				// inputDoms[currAns].attr("checked","checked").checkboxradio("refresh");
			}

			// in clicker-app/core/question.js
			this.grayOut=function(){
				//to lock the svg screen so no need new data points could
				//be clicked after submitting
				ansSvg.on("click",null);
			}

			
			
		},
		webEngine:function(params,webEngineReadyCallback){
			var url=params.url;
			//console.log(opt);
			// Array[4]
			// 0: "T = mg"1: "T &gt mg"2: "T &lt mg"3: "not able to tell"length: 4__proto__: Array[0]

			var d3Obj, chart;
			var pHeight=600, pWidth=600;
			var pMargin = {top : 10, bottom : 10, left : 30, right : 10};
			var data = [];
			var respDom=document.createElement("div");

			require([`d3js`],function(d3) {

				d3Obj=d3.select(respDom).append(`svg`)
					.attr('height',pHeight).attr('width',pWidth)

				chart = d3Obj.append('g')
						.append('image')
						.attr('xlink:href', url)
						.attr('width', '100%')
						.attr('height', '100%')
						.attr('preserveAspectRatio', 'none')


				webEngineReadyCallback();

			});

			function update(newData){

			    d3Obj.selectAll("circle")  // For new circle, go through the update process
				    .data(newData)
				    .enter()
				    .append("circle")
				    .attr("cx", function(d,i) {return (d[0].x*(pWidth/300))}) 
				    //formula for scaling from axis to svg
				    .attr('cy', function(d,i) {return pHeight-(d[0].y*(pHeight/300))})
				    .attr('r', 8)
				    .attr("fill","red")


			}
			this.responseInput=function(){
				var optDiv=document.createElement("div");
				return optDiv;
			}
			this.responseDom=function(){
				return respDom;
			}
			this.processResponse=function(studentUuid,ans){
				data.push(ans);
				// console.log(data);
				update(data);

			}
		}
	}
})