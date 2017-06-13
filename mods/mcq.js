define(["ctype"], function(ctype){
	return {
		authEngine:function(){
			var editDiv=document.createElement("div");
			var widgetParams;
			var vm;

			this.templateParams=function(){
				return '{"options":["T = mg","T &gt mg","T &lt mg","not able to tell"]}'
			}
			this.currParams=function(params){
				widgetParams=params;
				// console.log(widgetParams)
				// console.log(widgetParams["options"]);
			}
			this.editDom=function(updateCallback){
				var style=$('\
					<style>\
						label.radio-inline{\
							text-align:left; padding-left:30px;\
							white-space: normal;\
						}\
						i.option-control{\
							position:absolute;top:9px;right:9px;display:block;\
						}\
						i.xicon:hover{\
							margin:-3px;\
							padding:2px;\
							border:1px solid #777;\
							border-radius: 3px;\
							color:#dd0000;\
							background-color:white;\
						}\
						i.xicon:active{\
							margin: -1px -4px -4px -1px;\
							padding:2px;\
							border:1px solid #777;\
							border-radius: 3px;\
							color:#dd0000;\
							background-color:white;\
						}\
						i.picon{\
							color:#0000dd;\
						}\
						div.optfield{\
							cursor:text;\
							padding-right:18px;\
						}\
						div.optfield > input {\
							width:100%;\
							margin:-3px -2px -3px -2px;\
						}\
					</style>\
					');
					
				style.appendTo('head');
				require(["vue"],function(Vue){
					var initial_options=widgetParams.options;
					var optField={
						template:'\
							<div class="optfield">\
								<input ref="editor" type="text" v-bind:value="opt" v-on:input="updateOpt(i,$event.target.value)" v-if="editing" v-on:blur="editOff" v-on:mouseup="setFocus"></input>\
								<div v-else v-on:mousedown="editOn">{{opt}}</div>\
							</div>\
						',
						data:function(){
							return {
								editing:false
							}
						},
						props:["opt","updateOpt","i"],
						methods:{
							editOn:function(){
								this.editing=true;
							},
							editOff:function(){
								this.editing=false;
							},
							setFocus:function(){
								this.$refs.editor.focus()
							}
						}
					}
					var mcqOpt={
						template:'\
							<label class="form-check-label btn btn-default radio-inline" v-on:mouseenter="showX=true"\
								v-on:mouseleave="showX=false">\
							<input class="form-check-input" name="a" type="radio"> <opt-field :opt="opt" :updateOpt="update" :i="i"></opt-field>\
								<i class="option-control xicon glyphicon glyphicon-remove" v-on:click="remove(i)" v-if="showX"></i>\
							</label>\
						',
						data:function(){
							return{
								showX:false
							}
						},
						props:["opt","i","remove","update"],
						components:{
							"opt-field":optField
						}
					}
					var vm=new Vue({
						el:editDiv,
						template:'\
						<div class="container" style="width:100%;">\
							<div class="form-group btn-group-vertical btn-block justify-content-end" >\
								<mcq-opt v-for="(opt,i) in options" :opt="opt" :i="i" :remove="remove" :update="update"></mcq-opt>\
							</div>\
							<div class="form-group btn-group-vertical btn-block justify-content-end" style="margin-top:-15px;">\
								<label class="form-check-label btn btn-default radio-inline " v-on:click="add" v-on:mouseenter="showP=true" v-on:mouseleave="showP=false">\
									<input class="form-check-input" type="radio" disabled>add option <i class="option-control picon glyphicon glyphicon-plus" v-if="showP"></i>\
								</label>\
							</div>\
							{{options}}\
						</div>\
						',
						data:{
							options:initial_options,
							showP:false
						},
						methods:{
							remove:function(i){
								this.options.splice(i,1)
							},
							add:function(){
								this.options.push("new option")
							},
							update:function(i,newValue){
						        Vue.set(this.options, i, newValue)
							}
						},
						components:{
							"mcq-opt":mcqOpt
						},
						watch:{
							options:function(newOptions){
								updateCallback({"options":newOptions});
							}
						}
					})
				})
				return editDiv;
			}
			this.getNewParams=function(){

			}
		},
		appEngine:function(params,domReadyCallback){
			var optDiv=document.createElement("div");
			var inputDoms;
			require([],function(){
				opt=params.options;
				inputDoms=[];
				var fsDom=$('<fieldset data-role="controlgroup">');
				for(var o=0;o<opt.length;o++){
					var optContent=new ctype(opt[o])
					var label=document.createElement("label")
					label.htmlFor="x"+o;
					optContent.putInto(label)
					fsDom.append(label)
					inputDoms[o]=$('<input type="radio" name="a" id="x'+o+'">');
					fsDom.append(inputDoms[o]);
				}
				$(optDiv).append(fsDom);
				$(optDiv).trigger("create");
				$(optDiv).append(fsDom).enhanceWithin()
				domReadyCallback();
			})

			this.responseDom=function(){
				return optDiv;
			}
			this.getAns=function(){
				for(var i=0; i<inputDoms.length; i++){
					if(inputDoms[i].prop('checked')){return i;}
				}
				return null;
			};
			this.putAns=function(currAns){
				// occassional error "Cannot read property '1' of undefined"
				// when questions are clicked through too fast. 
				// (try to call putAns from domReadyCallback?)
				inputDoms[currAns].attr("checked","checked").checkboxradio("refresh");
			}
			this.grayOut=function(){
				inputDoms.forEach(function(inputDom){
					inputDom.prop('disabled',true).checkboxradio("refresh");
				});
			}
		},
		webEngine:function(params,webEngineReadyCallback){
			var opt=params.options;
			var d3Obj, label, vAxis, dataBar;
			var yScale, barScale;

			var axisStrokeWidth=3;
			var axisSpace=2, barSpace=5; //in percentage
			var pHeight=500, pWidth=600, barColor='#7755ff';
			var barOffset=150;

			var data=new Array(opt.length).fill(0);
			var respDom=document.createElement("div");

			require(["d3js"],function(d3) {
				yScale=d3.scaleLinear()
					.domain([-0.5,opt.length-0.5])
					.range([0,pHeight]);
				barScale=d3.scaleLinear()
					.domain([0,20])
					.range([0,pWidth-barOffset])
				d3Obj=d3.select(respDom).append("svg")
					.attr('height',pHeight).attr('width',pWidth)
				label=d3Obj.selectAll("text.graphLabels").data(opt).enter().append("text")
					.attr("class","graphLabels")
				vAxis=d3Obj.selectAll("line.axisLine").data(opt).enter().append("line")
					.attr("class","axisLine")
				dataBar=d3Obj.selectAll("rect").data(opt).enter().append('rect')
					.style('fill',barColor)
					.attr('x',barOffset+axisStrokeWidth/2)
					.attr('y',function(d,i){
						return yScale(-0.5+i+0.01*barSpace);
					})
					.attr('height',yScale(0.5-0.02*barSpace))
				label.data(opt)
					.attr("dominant-baseline", "central").attr("text-anchor","end")
					.attr("dx","-10").attr("font-size",15)
					.attr("x",barOffset)
					.attr("y",function(d,i){return yScale(i);})
					.html(function(d){return d;})

					//MathJax.Hub.Typeset(x)
				vAxis.data(opt)
					.attr("x1",barOffset).attr("x2",barOffset)
					.attr("stroke-width",axisStrokeWidth).attr("stroke","#333")
					.attr("y1",function(d,i){
						return yScale(i-0.5+0.01*axisSpace);
					})
					.attr("y2",function(d,i){
						return yScale(i+0.5-0.01*axisSpace);
				 	})
				webEngineReadyCallback();
			});

			function update(newData){
				dataBar.data(newData)
					.attr('width',function(d,i){
						return barScale(d);
					})
			}
			this.responseInput=function(opt$,optFrameResize){
				var optDiv=document.createElement("div");
				var inputDoms;
				require([],function(){
					opt=params.options;
					inputDoms=[];
					var fsDom=$('<fieldset data-role="controlgroup">');
					for(var o=0;o<opt.length;o++){
						var optContent=new ctype(opt[o])
						var label=document.createElement("label")
						label.htmlFor="x"+o;
						optContent.putInto(label)
						fsDom.append(label)
						inputDoms[o]=$('<input type="radio" name="a" id="x'+o+'">');
						fsDom.append(inputDoms[o]);
					}
					opt$(optDiv).append(fsDom).enhanceWithin();
					optFrameResize(optDiv);
				})
				return optDiv;
			}
			this.responseDom=function(){
				return respDom;
			}
			this.processResponse=function(studentUuid,ans){
				data[ans]++;
				update(data);
			}
		}
	}
})