define(["d3js"],function(d3){ // the archetypal chart for numbers
	return {
		engine:function(coreParams,sideParams){
			var height=400, width=600; // default height and width
			var canvas, svg, valAxis, drawNode, simulation;
			var dataVal=[], dataPos=[];
			var topOffset=50, botOffset=100;
			var leftOffset=100, rightOffset=50;

			var maxRange=60;
			// distinguish between simulation and display spaces.
			// work everything in the simulation space, then translate to display, and keep the two clean and seperate. 
			// keep track of the scale, and keep it the same in x and y coordinates. 

			// in simulation space. 
			var forceGravityX=function(){
				var nodes;
				function force(alpha){
					for (var i=0, n=nodes.length; i<n; ++i) {
						var node = nodes[i];
						if(node.x>0){
							node.vx += -0.01*alpha*(node.x);
						} else{
							node.vx += -alpha*(node.x);
						}
					}
				}
				force.initialize = function(initNodes) {
					nodes=initNodes;
				};
				return force;
			}
			var forceQuadWell=function(){
				var nodes;
				function force(alpha){
					for (var i=0, n=nodes.length; i<n; ++i) {
						var node = nodes[i];
						node.vy+= -0.5*alpha*(node.y-node.val);
					}
				}
				force.initialize = function(initNodes) {
					nodes=initNodes;
				};
				return force;
			}

			var valAxisRange=function(){ // work out the range of data axis for input into dataScale
				var mR=Math.max.apply(null, dataVal), order=0;
				if(mR<50){
					return 60;
				}else{
					while(mR>1.9){order++; mR/=10;}
					if(mR<1.2){
						return (Math.ceil(mR*10+1))*10**(order-1);
					}else if(mr<1.4){ // 1.2-1.39
						return 1.5*10**order;
					}else{ // 1.4 - 1.89
						return 2*10**order;
					}
				}
			}
			// xScale and yScale are important for mapping simulation space (data value) 
			// into visualization space (pixels).
			var map=function(){ // trying to consolidate it into a single object. 

			}  
			var yScale=function(){
				return d3.scaleLinear()
						.domain([0,valAxisRange()])
						.range([height-botOffset,topOffset]);
			}
			var xScale=function(){
				var yS=yScale();
				var factor=yS(1)-yS(0);
				factor=((factor<0) ? -factor : factor);
				return function(x){
					return x*factor+leftOffset;
				}
			}
			// var valAxisGen=function(){
			// 	// how does axisLeft know the domain of yScale? 
			// 	return d3.axisLeft(yScale()).ticks(5).tickSize(0);
			// }
			var redrawAxis=function(){
				valAxis.attr("transform","translate("+(leftOffset-10)+",0)")
					// .call(valAxisGen())
					.call(d3.axisLeft(yScale()).ticks(5).tickSize(0))
			}
			this.passDom=function(respDom){
				// called once, like an init. 
				canvas=d3.select(respDom).append("svg");
				svg=canvas.append("g").attr("class","nodes");
				valAxis=canvas.append("g").attr("class","valAxis");
			}
			this.update=function(newData){
				// plot pile chart on data
				newData=Number.parseFloat(newData); // will behave weirdly (multiply by 10 each step) if newData is a string. 
				dataVal.push(newData)
				// check if it is bigger than maxRange, work out new scale if so
				if(maxRange!=valAxisRange()){
					// recalculate scale, redraw axis, and replot points. 
					redrawAxis();
					maxRange=valAxisRange();
				}
				dataPos.push({"x":-1,"y":newData,"val":newData});
				// initialize the new data. 
				svg.selectAll("circle").data(dataPos).enter()
					.append("circle").attr("r", 5)// this is factor * 0.5 (radius)
					.attr("fill","#ccccff")
					.attr("stroke","blue")
					.attr("cx",function(d){return d.x;})
					.attr("cy",function(d){return valAxisRange(d.y);});
				// update drawNode selection. 
				drawNode=svg.selectAll("circle").data(dataPos);
				// run simulation. 
				simulation = d3.forceSimulation().nodes(dataPos)
					.velocityDecay(0.08)
					.alphaDecay(0.05)
					.alphaMin(0.01)
					// .alphaMin(0.0001)
					.force("collide_force", d3.forceCollide(0.5).iterations(10).strength(0.5))
					.force("gravity_x", forceGravityX())
					.force("quad_y", forceQuadWell())
					.on("tick", function(d){ 
						// turns simulation space into visualization space through xScale and yScale. 
						drawNode
							.attr("cx",function(d){return xScale()(d.x);})
							.attr("cy",function(d){return yScale()(d.y);});
					});

			}
			this.updateDim=function(newHeight,newWidth){
				height=newHeight; width=newWidth;
				canvas.attr("height",height).attr("width",width);
				// redraw axis(), redraw data()
				// drawing too many axes as dimensions change
				redrawAxis();
			}
		}
	}
})