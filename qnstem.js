define([],function(){ return {
	authorEngine:function(){
		var editDiv=document.createElement("div");
		var p;
		this.currParams=function(newParam){
			p=newParam;
		}
		this.editDom=function(changeCallback){
			require(["vue"],function(Vue){
				var vm=new Vue({
					el:editDiv,
					template:'\
						<div id="editable" contenteditable="true"\
						v-on:blur="changed" v-html="content"></div>\
						',
					data:{
						content:p
					},
					methods: {
						changed: function(event) {
							this.content = $(event.target).html();
						}
					},
					watch:{
						content:function(newContent){
							changeCallback(newContent)
						}
					}
				})

			})
			return editDiv;
		}			
	}
}})