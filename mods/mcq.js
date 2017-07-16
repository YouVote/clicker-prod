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
		appEngine:function(params){
			var appObj; var widBody=document.createElement("div");
			var domManager=new function(){
				var domReady=false; var domReadyCallback=null;
				this.domReady=function(){
					if(domReadyCallback!=null){domReadyCallback();}
					domReady=true;
				}
				this.onDomReady=function(callback){
					if(domReady){callback();}
					domReadyCallback=callback;
				}
			}();
			require(["vue"],function(Vue){
				var opt={
					template:'<div ref="content"></div>',
					props:["optData"],
					mounted:function(){
						var optContent=new ctype(this.optData);
						optContent.putInto(this.$refs.content);
					}
				}
				appObj=new Vue({
					el:widBody,
					template:'\
					<div class="form-group btn-group-vertical btn-block justify-content-end">\
					<label v-for="(opt,i) in options"class="form-check-label btn btn-default radio-inline"><input name="a" v-bind:value="i" type="radio" class="form-check-input" v-model="choice" v-bind:disabled="disabled"> \
					<optfield :optData="opt"></optfield></label></div>\
					',
					data:{
						options:params.options,
						choice:null,
						disabled:false
					},
					methods:{
						putAns:function(newChoice){
							this.choice=newChoice;
						},
						getAns:function(){
							return this.choice;
						},
						grayOut:function(state){
							if(state==undefined){state=true;}
							this.disabled=state;
						}
					},
					components:{
						"optfield":opt
					}
				})
				domManager.domReady();
			})
			this.onDomReady=function(callback){	
				domManager.onDomReady(callback);
			}
			this.widHead=function(){
				var widHead='\
				<style>\
					body{padding:5px;}\
					label.radio-inline{text-align:left; padding-left:30px;white-space: normal;}\
					div.optfield > input {width:100%;margin:-3px -2px -3px -2px;}\
				</style>\
				';
				return widHead;
			}
			this.widBody=function(){
				return widBody;
			}
			this.getAns=function(){
				return appObj.getAns();
			};
			this.putAns=function(currAns){
				appObj.putAns(currAns);
			}
			this.grayOut=function(){
				appObj.grayOut();
			}
		},
		webEngine:function(params){
			var webObj=this;
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
			});

			function update(newData){
				dataBar.data(newData)
					.attr('width',function(d,i){
						return barScale(d);
					})
			}
			var appObj; this.widBody=document.createElement("div");
			require(["vue"],function(Vue){
				var opt={
					template:'<div ref="content"></div>',
					props:["optData"],
					mounted:function(){
						var optContent=new ctype(this.optData);
						optContent.putInto(this.$refs.content);
					}
				}
				appObj=new Vue({
					el:webObj.widBody,
					template:'\
					<div class="form-group btn-group-vertical btn-block justify-content-end">\
					<label v-for="(opt,i) in options"class="form-check-label btn btn-default radio-inline"><input name="a" v-bind:value="i" type="radio" class="form-check-input" v-model="choice" v-bind:disabled="disabled"> \
					<optfield :optData="opt"></optfield></label></div>\
					',
					data:{
						options:params.options,
						choice:null,
						disabled:false
					},
					methods:{
						putAns:function(newChoice){
							this.choice=newChoice;
						},
						getAns:function(){
							return this.choice;
						},
						grayOut:function(state){
							if(state==undefined){state=true;}
							this.disabled=state;
						}
					},
					components:{
						"optfield":opt
					}
				})
			})
			this.widHead=function(){
				var widHead='\
				<style>\
					label.radio-inline{text-align:left; padding-left:30px;white-space: normal;}\
					div.optfield > input {width:100%;margin:-3px -2px -3px -2px;}\
				</style>\
				';
				return widHead;
			}

			this.responseInput=function(){
				return this.widBody;
			}

			this.responseDom=function(){
				return respDom;
			}
			this.processResponse=function(studentUuid,ans){
				data[ans]++;
				console.log(data, ans);
				update(data);
			}
		}
	}
})