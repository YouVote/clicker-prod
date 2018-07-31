define(["async","ctype"], function(AsyncProxy,ctype){ // the archetypal (original) ans system module.
	var widgetParams={
		"analysis":"barchart",
		"analysisParams":null
	}
	return {
		author:function(){
			var editDiv=document.createElement("div");
			var mcqOptions;
			var vm;

			this.coreTemplate='["T = mg","T &gt mg","T &lt mg","not able to tell"]';
			// for fill response dev env (to be developed)
			this.testFillResponse='3';

			this.currParams=function(params){
				mcqOptions=params;
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
					var initial_options=mcqOptions;
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
								<mcq-opt v-for="(opt,i) in options" :key="i" :opt="opt" :i="i" :remove="remove" :update="update"></mcq-opt>\
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
		appEngine:function(params){// which means change this to coreParams, sideAppParams
			// var appObj=null; var appKivQueue=[];
			var appObj=new AsyncProxy()
			var widBody=document.createElement("div");
			if(typeof(params)!="object" || typeof(params.core)=="undefined"){
				var newParams={};
				newParams.core=params;
				params = newParams;
			}
			var mcqOpts=params.core;
			require(["vue"],function(Vue){ 
				var opt={
					template:'<div ref="content"></div>',
					props:["optData"],
					mounted:function(){
						var optContent=new ctype(this.optData);
						optContent.putInto(this.$refs.content);
					}
				}
				appObjTemp=new Vue({
					el:widBody,
					template:'\
					<div class="form-group btn-group-vertical btn-block justify-content-end">\
					<label v-for="(opt,i) in options"class="form-check-label btn btn-default radio-inline"><input name="a" v-bind:value="i" type="radio" class="form-check-input" v-model="choice" v-bind:disabled="disabled"> \
					<optfield :optData="opt"></optfield></label></div>\
					',
					data:{
						options:mcqOpts,
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
				appObj.__reinstate__(appObjTemp)
			})
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
		webEngine:function(params){ // may change this to coreParams, sideWebParams
			var yvProdBaseAddr=params.system.yvProdBaseAddr;
			// loop over side params, replace widgetParams.
			if(typeof(params)!="object" || typeof(params.core)=="undefined"){
				var _params={};
				_params.core=params;
				params = _params;
			}

			if(typeof(params["side"])=="object"){
				for(paramName in params["side"]){
					if(paramName in widgetParams){
						widgetParams[paramName]=params["side"][paramName];
					}
				}
			}
			params.side=widgetParams;
			
			var analysisObj=new AsyncProxy(widgetParams['analysis']);
			require([yvProdBaseAddr+"/analysis/"+widgetParams['analysis']+".js"],function(analysis){
				analysisObjTemp=new analysis.engine(params.core,params.side["analysisParams"]);
				// $(responseDom).html(analysisObjTemp.passDom())
				analysisObj.__reinstate__(analysisObjTemp);
			})
			// var opt=params.options;
			var mcqOpts=params.core;
			var widletObj; widBody=document.createElement("div");
			var data=new Array(mcqOpts.length).fill(0);
			require(["vue"],function(Vue){
			// require vue should be placed right at the top because will definitely need it
			// use asyncproxy for stuff you are not sure of needing e.g. the choice of chart (barchart). 
				var opt={
					template:'<div ref="content"></div>',
					props:["optData"],
					mounted:function(){
						var optContent=new ctype(this.optData);
						optContent.putInto(this.$refs.content);
					}
				}
				widletObj=new Vue({
					el:widBody,
					template:'\
					<div class="form-group btn-group-vertical btn-block justify-content-end">\
					<label v-for="(opt,i) in options"class="form-check-label btn btn-default radio-inline"><input name="a" v-bind:value="i" type="radio" class="form-check-input" v-model="choice" v-bind:disabled="disabled"> \
					<optfield :optData="opt"></optfield></label></div>\
					',
					data:{
						options:mcqOpts,
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

			// this.responseInput=function(dom){
			// 	return this.widBody;
			// }
			// this.responseDom=function(dom){ // should responseDomObj, to extract height and width from. 
			// 	return responseDom;
			// }
			this.passInputDom=function(inputDom){
				$(inputDom).html(widBody);
			}
			this.passRespDom=function(respDom){
				analysisObj.passDom(respDom)
			}
			this.processResponse=function(studentUuid,ans){
				// called by yvWebKernel/questionHandler.js
				// in case analysisObj not ready, 
				data[ans]++;
				analysisObj.update(data);
			}

			// called by yvWebKernel when window resize. 
			this.updateRespDim=function(height,width){
				// console.log("mcq updateRespDim")
				analysisObj.updateDim(height,width);
			}
		}
	}
})