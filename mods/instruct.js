define([], function(){
	return {
		author:function(){
			this.coreTemplate='""';
		},
		appEngine:function(params){
			var optDiv=document.createElement("div");
			optDiv.innerHTML="Welcome to <span class='youvote you'>You</span><span class='youvote vote'>Vote</span>!";
			optDiv.style.padding="20px";
			optDiv.style.fontSize="30px";
			optDiv.style.textAlign="center";
			this.widHead=function(){
				var widHead=`
				<style>
					.youvote{
						font-family: "Trebuchet MS","Lucida Grande","Lucida Sans Unicode","Lucida Sans",Tahoma,sans-serif; 
						font-weight:bold;
					}
					.you{
						color:#ff0000;
					}
					.vote{
						color:rgb(0,176,240);
					}
				</style>
				`;
				return widHead;
			}
			this.widBody=function(){
				return optDiv;
			}
			this.getAns=function(){
				return null;
			};
			this.putAns=function(currAns){
				
			}
			this.grayOut=function(){
				
			}
		},
		webEngine:function(params,webEngineReadyCallback){
			var optDiv=document.createElement("div");
			var respDom=document.createElement("div");
			$(optDiv).html("options go here");
			$(respDom).html("responses go here");
			this.passInputDom=function(inputDom){
				var instructions=`
					<p> Instructions: </p> 
					<p> 1. Install app</p> 
					<p>Android - Search for '<a href='https://play.google.com/store/apps/details?id=com.gabrielwu84.youvote' target='_blank'>YouVote</a>' on google play store,<br/> 
					iOS - Search for '<a href='https://itunes.apple.com/us/app/youvote-apollos/id1333893087?mt=8' target='_blank'>YouVote Apollos</a>' on the appstore.</p> 
					<p> 2. Open app and fill in your name</p> 
					<p> 3. Enter the lesson id shown on the top left corner and click enter</p>
				`;
				inputDom.innerHTML=instructions;
			}
			this.passRespDom=function(respDom){
				
			}
			this.updateRespDim=function(height,width){

			}
			this.processResponse=function(studentUuid,ans){

			}
		}
	}
})