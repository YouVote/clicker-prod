define(['ctype'], function(ctype){
	//to add shim stuff in later to try.
	//3 things, define, requirejs, require.
	return {
		author:function(){
			// this.templateParams=function(){
			// 	//params.options refer to this part
			// 	//options is the name to be called (i.e. can be changed, with
			// 	//other sections to be changed accordingly also.)

			// 	return '{"videoUrl":"pendulum.mp4"}'
			// }
			this.coreTemplate='"pendulum.mp4"';
		},
		// appEngine:function(params,domReadyCallback){
		appEngine:function(params){
			// this section affects the user interface
			var optDiv=document.createElement("div");
			var inputDoms;
			var aHeight = 400, 
				aWidth = 400;
			var aMargin = {top : 10, bottom : 10, right : 10, left : 10};
			var videoLength, slider, from, to;
			var frameRate = 29;
			var timing;
			var startTime, endTime;
			var test = 0.1;
			var startSec = 0;
			var temp,vid;
			var vidH = $('<div/>').attr('id','vid').appendTo(optDiv);
			var vidS = params.videoUrl;
			//to add require.config
			requirejs.config({
				paths : { 
					"ion-rangeslider" : "https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.1.7/js/ion.rangeSlider.min",	
				}
			});
			require([`ion-rangeslider`], function(){
				$('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.1.7/css/ion.rangeSlider.min.css">');
				$('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.1.7/css/ion.rangeSlider.skinModern.min.css">');

			})
			require(['jquery', `ion-rangeslider`, `d3js`],function(ionRangeSlider, d3){
				//to initialise the video content
				vid = $('<video/>',{
					id : 'video',
					width : '100%',
					src : vidS,
					controls : false,
					loop : true,
					muted : true
				});
				$(vid).click(function(){
					if($(this).get(0).paused){
						$(this).get(0).play();
					}else{
						$(this).get(0).pause();
					}
				});
				vid.appendTo(vidH);
				var slide2 = $('<div/>').attr('id', 'slider').appendTo(vidH);

				//allow video to load to get metadata for video first to
				//allow initialisation of slider
				$(function(){
					setTimeout(function(){
						//this step (temp) is one of the steps to initialise the slider
						temp = $(`<input type='text' id='range' value='' name='range' />`);
						temp.appendTo(slide2);
						videoLength = ($(vid).get(0).duration);
						$(temp).ionRangeSlider({
							hide_min_max: true,
							keyboard: true,
							min: startSec,
							max: videoLength,
							from: videoLength*0,
							to: videoLength*1,
							type: 'double',
							step: 0.1,
							postfix: "s",
							onChange : function(data) {
								from = data.from;
								to = data.to;
								if(from != startTime){
									$(vid).get(0).currentTime = from;
								}
								if(to != endTime &&
									$(vid).get(0).paused){
									$(vid).get(0).currentTime = to;
								}
								// startVid(from);
							},
							onFinish : function(data){
								startTime = parseFloat($('.irs-from').text());
								endTime = parseFloat($('.irs-to').text());
								ansTransfer = [startTime, endTime];
							},
						});
						slider = $('#range').data("ionRangeSlider");

					}, 400);
				});

				var timeHolder = $('<p/>').attr('id','timer').appendTo(vidH);

				$(vid).get(0).onplay = function(){
					//setInterval used for a more detailed timing instead of ontimeupdate
					timing = setInterval(function(){
						document.getElementById('timer').innerHTML = $(vid).get(0).currentTime;
						//looping conditions based on slider's values
						//from -> start of slider
						//to -> end of slider
						if($(vid).get(0).currentTime > to ||
							$(vid).get(0).currentTime < from ){
							$(vid).get(0).currentTime = from;
						}
					}, 1000/frameRate);
				};

				$(vid).get(0).onpause = function(){
					clearInterval(timing);
				};
		        // domReadyCallback();
			})

			this.responseDom=function(){
				return optDiv;
			}
			this.getAns=function(){
				if(typeof ansTransfer != "undefined" && ansTransfer != null && ansTransfer.length > 0){
					return ansTransfer;
				}
				return null;
			};
			this.putAns=function(currAns){
				// inputDoms[currAns].attr("checked","checked").checkboxradio("refresh");
			}
			// in clicker-app/core/question.js
			this.grayOut=function(){
				//to lock the svg screen so no need new data points could
				//be clicked after submitting
				slider.update({
					disable : true,
				});
			}
		},
		// webEngine:function(params,webEngineReadyCallback){
		webEngine:function(params){
			var pHeight=600, pWidth=600;
			var pMargin = {top : 10, bottom : 10, left : 30, right : 10};
			var rectOpacity = 0.85;

			var respDom=document.createElement("div");
			var videoLength, slider, to;
			var frameRate = 29;
			var timing, slider;
			var test = 0.1;
			var startSec = 0;
			var startTime, endTime;
			var overMove, overStatic, div;
			var from = 0;
			var chartline, lineData;
			var vidS = params.videoUrl;
			var vidDiv = $('<div/>').attr('id', 'video').appendTo(respDom);
			var vidH = $('<div/>').attr('id','vid').appendTo(vidDiv);
			var data = {};
			var x,y,cline;
			var svg, svgC, svgH;

			requirejs.config({
				paths : { 
					"ion-rangeslider" : "https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.1.7/js/ion.rangeSlider.min",	
				}
			});
			require([`ion-rangeslider`], function(){
				$('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.1.7/css/ion.rangeSlider.min.css">');
				$('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.1.7/css/ion.rangeSlider.skinModern.min.css">');

			})
			require([`ion-rangeslider`, `d3js`],function(ionRangeSlider, d3) {
				vid = $('<video/>',{
					id : 'video1',
					width : (pWidth - pMargin.left - pMargin.right),
					src : vidS,
					type : 'video/mp4',
					controls : false,
					loop : false,
					muted : true
				});

				vid.appendTo(vidH);
				var slide = $('<div/>').attr('id', 'slider').appendTo(respDom);
				var slideH = $('<div/>').attr('id', 'sliderH').appendTo(slide);
				temp = $(`<input type='text' id='range' value='' name='range' />`);
				temp.appendTo(slideH);

				setTimeout(function(){
					videoLength = ($(vid).get(0).duration);
					$('#vid').css('opacity', 0.5).css('position', 'absolute')
						.css('z-index', '2')
						.css('padding-left', pMargin.left)
						.css('padding-right', pMargin.right)
						.css('padding-top', pMargin.top)
						.css('padding-bottom', pMargin.bottom);
					// data = new Array(Math.floor(videoLength*10)+1).fill(0);
					$('#range').ionRangeSlider({
						hide_min_max: true,
						keyboard: true,
						min: startSec,
						max: videoLength,
						from: videoLength*0,
						to: videoLength*1,
						type: 'double',
						step: 0.1,
						postfix: "s",
						onChange : function(data) {
							from = data.from;
							to = data.to;
							if(from != startTime){
								$(vid).get(0).currentTime = from;
							}
							if(to != endTime &&
								$(vid).get(0).paused){
								$(vid).get(0).currentTime = to;
							}
						},
						onFinish : function(data){
							startTime = parseFloat($('.irs-from').text());
							endTime = parseFloat($('.irs-to').text());
						},
					});
					slider = $('#range').data("ionRangeSlider");

				}, 300);

				setTimeout(function(){
					$('#slider').css('padding-top', $(vid).get(0).clientHeight + 30)
						.css('width', $(vid).get(0).clientWidth+pMargin.left)
						.css('padding-left', pMargin.left);
					var periods = Math.ceil($(vid).get(0).duration*10);
					data.a = [];
					data.b = [];
					for(i=0; i<=periods;i++){
						data.a.push(i);
						data.b.push(0);
					}
					//This section is to generate random data for charting purposes

					// data.a = [];
					// data.b = [];
					// for(i=0; i<=periods;i++){
					// 	data.a.push(i);
					// 	data.b.push(Math.floor(Math.random()*50));
					// }

					var lineData = data.b.map(function (_, idx) {
					    return { a: data.a[idx], b: data.b[idx] }; 
					});					

					svg = d3.select('#video').append('svg')
						.attr('height', $(vid).get(0).clientHeight + pMargin.top)
						.attr('width', $(vid).get(0).clientWidth+pMargin.left+pMargin.right)
						.style('position', 'absolute')
						.style('padding-left', pMargin.left + 'px')
						.style('padding-right', pMargin.right + 'px')
						.style('padding-top', pMargin.top + 'px')
						.style('padding-bottom', pMargin.bottom + 'px')

					var div = d3.select('#video').append('div')
						.attr('class', 'tooltip')
						.style('opacity', '0')
						.style('position', 'absolute')
						.style('text-align', 'center')
						.style('width', '60px')
						.style('height', '40px')
						.style('padding', '2px')
						.style('background', 'lightsteelblue')
						.style('border', '0')
						.style('border-radius', '9px')

					d3.select('#video').on('click',function(){
						if($(vid).get(0).paused){
							$(vid).get(0).play();
						}else{
							$(vid).get(0).pause();
						}	
					});

					x = d3.scaleTime()
						.range([0,$(vid).get(0).clientWidth]);
					y = d3.scaleLinear()
						.range([$(vid).get(0).clientHeight-pMargin.bottom,pMargin.top]);

					cline = d3.line()
						.x(function(d){return x(d.a);})
						.y(function(d){return y(d.b);})


					x.domain([d3.min(data.a), d3.max(data.a)]); 
					y.domain([0, d3.max(data.b)]);

					svg.append("g")
						.attr('transform', 'translate(' + [0,$(vid).get(0).clientHeight + 10] + ')')
						.call(d3.axisTop(x).tickSize(0))
						.selectAll('text').remove();
					// Add the Y Axis
					svg.append("g").attr('transform', 'translate(' + 0 + `,0)`)
						.attr('id', 'yaxis')
						.call(d3.axisLeft(y).tickSize(0))
						.style('visibility', 'hidden')
						.selectAll('text').remove();
					svgC = svg.append('g')
						.attr('transform', 'translate(' + 0 + `,0)`);
					svgH = svgC.selectAll('circle').data(lineData)
						.enter()
						.append('circle')
						.attr('cx', function(d){return x(d.a);})
						.attr('cy', function(d){return y(d.b);})
						.attr('r', (x([lineData][0][1].a) - x([lineData][0][0].a))/2)
						.attr('opacity', 0)	

					chartline = svgC.append('path')
						.data([lineData])
						.attr('id', 'line2')
						.attr('d', cline)
						.style('fill', 'none')
					overMove = svg
						.append('rect')
						.attr('x', 0)
						.attr('y', 0)
						.attr('width', $(vid).get(0).clientWidth)
						.attr('height', $(vid).get(0).clientHeight)
						.attr('fill', 'white')
						.attr('opacity', rectOpacity)
					overStatic = svg
						.append('rect')
						.attr('x', 0)
						.attr('y', 0)
						.attr('width', 0)
						.attr('height', $(vid).get(0).clientHeight)
						.attr('fill', 'white')
						.attr('opacity', rectOpacity)
						// This is for html div to appear near the respective circles
						// svgH.attr('opacity', function(d,i){
						// 	if(x(d.a)< x1+distance && x(d.a)>x1-distance){
						// 		div.transition()
						// 			.duration(00)
						// 			.style('opacity', 1);
						// 		div.html((i)/10 + 's' + `<br>` + data.b[i])
						// 			.style('left', (x(d.a)+ 200)+"px")
						// 			.style('top', (y(d.b) + 30) + 'px');	
						// 		console.log(i);
						// 		return 1;
						// 	}else{return 0;}
						// })

						//This is for html div to appear near mouse
					d3.select('#video').on('mousemove', function(){
						var distance = 0.5 * (x([lineData][0][1].a) - x([lineData][0][0].a));
						// console.log(distance);
						var x0 = x.invert((d3.mouse(this)[0])-30),
							x1 = (d3.mouse(this)[0]-30);
						svgH.attr('opacity', function(d,i){
							if(x(d.a)< x1+distance && x(d.a)>x1-distance){
								div.transition()
									.duration(00)
									.style('opacity', 1);
								div.html((i)/10 + 's' + `<br>` + data.b[i])
									.style('left', (d3.event.pageX + 20)+"px")
									.style('top', (d3.event.pageY) + 'px');	
								return 1;
							}else{
								return 0;}
						})
						slider.update({
							onChange : function(data) {
								from = data.from;
								to = data.to;
								endSec = data.to;
								startVid(from);
								overMove.attr('x', to*20*distance+1)
								overStatic.attr('width', from*20*distance)
							}
						});	
					});
					d3.select('#video').on('mouseout',function(){
						div.transition()
							.duration(200)
							.style('opacity', 0)
						svgH
							.transition()
							.duration(200)
							.attr('opacity', 0)
					})
				},400);

				$(vid).get(0).onplay = function(){
					$('#vid').css('opacity', 0.8)
					chartline.transition()
						.duration(300)
						.style('stroke-width', '2px')
						.style('stroke', function(){
								return 'steelblue';
						});			
					svg.selectAll('circle')
						.attr('fill', 'steelblue')		
					timing = setInterval(function(){
						if($(vid).get(0).currentTime > to ){
							$(vid).get(0).currentTime = from;
						}
						overMove.attr('x', pMargin.left+$(vid).get(0).currentTime/$(vid).get(0).duration*$(vid).get(0).clientWidth)
						overStatic.attr('width', from/$(vid).get(0).duration*$(vid).get(0).clientWidth)
					}, 1000/frameRate);
				}

				$(vid).get(0).onpause = function(){
					$('#vid').css('opacity', 0.4);
					chartline.transition()
						.duration(300)
						.style('stroke', function(){
								return 'black';
						});
					svg.selectAll('circle')
						.attr('fill', 'black')
					overMove.attr('x', pMargin.left+$(vid).get(0).currentTime/$(vid).get(0).duration*$(vid).get(0).clientWidth)
					overStatic.attr('width', from/$(vid).get(0).duration*$(vid).get(0).clientWidth)
					clearInterval(timing);
				}

				function startVid(time){
					$(vid).get(0).currentTime=time;
				}
				// webEngineReadyCallback();
			});

			function update(newData){


			}
			this.responseInput=function(){
				var optDiv=document.createElement("div");
				var inputDoms;
				require([],function(){

			    })
				return optDiv;
			}
			this.responseDom=function(){
				return respDom;
			}
			this.processResponse=function(studentUuid,ans){
				require([`d3js`],function( d3) {
				//whenever a new response has been submitted by an user
					svgC.selectAll('#line2').remove();
					svg.selectAll('#yaxis').remove();
					svg.selectAll('circle').remove();
					var start = ans[0];
					var end = ans[1];
					for(i=start*10;i<=end*10;i++){
						data.b[i]++;
					}

					lineData = data.b.map(function (_, idx) {
					    return { a: data.a[idx], b: data.b[idx] }; 
					});	

					y.domain([0, d3.max(data.b)]);
					
					svg.append("g").attr('transform', 'translate(' + 0 + `,0)`)
						.attr('id','yaxis')
						.call(d3.axisLeft(y).tickSize(0))
						.style('visibility', 'hidden')
						.selectAll('text')
						.remove();
						
					chartline = svgC.append('path')
						.data([lineData])
						.attr('id', 'line2')
						.attr('d', cline)
						.style('fill', 'none')
						.style('stroke-width', 2)
						.style('stroke', function(){
							if($(vid).get(0).paused){
								return 'black';
							}else{
								return 'steelblue';
							}
						})
					svgH = svgC.selectAll('circle').data(lineData)
						.enter()
						.append('circle')
						.attr('cx', function(d){return x(d.a);})
						.attr('cy', function(d){return y(d.b);})
						.attr('r', (x([lineData][0][1].a) - x([lineData][0][0].a))/2)
						.attr('opacity', 0)	
						.attr('fill', 'black')
				});
			}
		}
	}
})