define(["d3js"],function(d3){
	return {
		engine:function(coreParams,sideParams){
			var svg;
			this.passDom=function(respDom){
				svg=d3.select(respDom).append("svg");
			}
			this.update=function(data){

			}
			this.updateDim=function(height,width){
				svg.attr("height",height).attr("width",width);
			}
		}
	}
})