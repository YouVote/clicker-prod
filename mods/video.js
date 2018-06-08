define(['d3js','jquery'],function(d3){ // the archetypal sync module.
// this is functional, but need a lot of refactoring and touch-up.
	return {
		author:function(){
			this.coreTemplate='\"http://html5videoformatconverter.com/data/images/happyfit2.mp4\"';
		},
		appEngine:function(params){
			var app=this; var sigAw;
			// todo: figure out params rules, there are some inconsistencies.
			// var video=JSON.stringify(params); 
			// sync issues sorted out. left with refactoring this. 
			// web-app synchronisation system
			var synchObj=new(function(){
				// these times are in milliseconds
				// because Date.getTime() returns milliseconds.
				// take note that video times are in seconds, so convert accordingly
				var timePing,timePong;
				var webSyncTime, appSyncTime;
				this.getPing=function(){
					timePing=(new Date).getTime();
					return timePing;
				}
				this.logPong=function(webTime){
					timePong=(new Date).getTime();
					appSyncTime=Math.floor((timePing+timePong)/2);
					webSyncTime=webTime;
				}
				this.getCorrection=function(){
					return webSyncTime-appSyncTime;
				}
			})();
			// video system
			var videoObj=new (function(getCorrection){
				var playPromise;
				// the target video state
				var videoState={state:"pause",vidTime:0,cmdTime:(new Date).getTime()};
				var videoDom=$('<video/>',{
					width:'100%', src:params, type:'video/mp4', autoplay:false,
					controls:false, loop:false, muted:true, preload:true
				}).get(0);
				videoDom.volume=0; // muted:true does not seem to work
				function computeCurrentVideoTime(){
					var appCurrTime=(new Date()).getTime();
					var appCmdTime=videoState.cmdTime-getCorrection();
					var currVidTime=(appCurrTime-appCmdTime)/1000+videoState.vidTime;
					return currVidTime;
				}
				videoDom.onmousedown=function(){
					// send signal to web
					var sig={cmd:"response",resState:"down"}
					app.sigAw(sig);
				}
				videoDom.onmouseup=function(){
					// send signal to web
					var sig={cmd:"response",resState:"up"}
					app.sigAw(sig);
				}
				// other events: onplay, onseeked, oncanplaythrough, onloadedmetadata
				
				videoDom.onwaiting=function(){
					// console.log("app onwaiting triggered");
				}
				videoDom.onplaying=function(){
					// can be triggered from both video.play() and recovery from waiting state.
					// check which one it is, and if it is a recovery from waiting state, send 
					// video through play() call to resync the video.
					// console.log("app onplaying triggered");
					// basically syncing time
					// needed because everytime currentTime changed, onwaiting will be triggered.
					// 0.3s is arbitrary. pull this parameter out to somewhere more prominent
					// when refactoring the syncing system. 
					if(Math.abs(videoDom.currentTime-computeCurrentVideoTime())>0.3){
						videoDom.currentTime=computeCurrentVideoTime(); 
						// console.log("playing: "+videoDom.currentTime)
					}
				}
				function pause(){
					videoDom.pause();
					videoDom.currentTime=videoState.vidTime;
				}
				function play(){
					// toResetSync=true;
					videoDom.play().catch(error => {
						console.log("play error: "+error)
					});
				}
				this.execCurrState=function(){
					if(videoState.state=="play"){
						play();
					}else if(videoState.state=="pause"){
						pause();
					}
				}
				this.execState=function(newVideoState){
					videoState=newVideoState;
					this.execCurrState();
				}
				this.dom=function(){
					return videoDom;
				}
			})(synchObj.getCorrection);

			// this.widHead()
			this.widBody=function(){
				return videoObj.dom();
			}
			// this.getAns(); this.putAns(); this.grayOut()
			this.passSigAw=function(_sigAw){
				app.sigAw=_sigAw;
				// call...
				var sig={cmd:"timecheck",appTime:synchObj.getPing()}
				app.sigAw(sig);
			}
			this.sigWa=function(sig){
				// console.log(sig)
				if(sig.cmd=="execVideo"){
					videoObj.execState(sig.state)
				}else if(sig.cmd=="timecheck"){
					synchObj.logPong(sig.webTime);
					// extract video state, and execute it. 
					// maybe check if state exists... 
					videoObj.execState(sig.state)
				}
			}
		},
		webEngine:function(params){
			// sync issues sorted out. left with refactoring this. 
			var web=this; 
			web.signalBroadcast=function(){};// temp function that will be swapped out
			var videoObj=new (function(){
				// Note: video.currentTime is in s, while d.getTime() is in milliseconds.
				var videoState={state:"pause",vidTime:0,cmdTime:(new Date).getTime()}
				var videoDom=$('<video/>',{
					width:'100%', src:params.core, type:'video/mp4',
					controls:true, loop:false, muted:false, preload:true
				}).get(0);
				// send signal to app when video state changes
				function pushState(){
					web.signalBroadcast({cmd:"execVideo",webTime:(new Date()).getTime(),state:videoState});
				}
				videoDom.onpause=function(){
					videoState={state:"pause",vidTime:videoDom.currentTime,cmdTime:(new Date).getTime()};
					pushState();
				}
				videoDom.onseeked=function(){
					// this leaves the current state unchanged 
					videoState.vidTime=videoDom.currentTime;
					videoState.cmdTime=(new Date).getTime();
					pushState()
				}
				videoDom.onplay=function(){
					videoState={state:"play",vidTime:videoDom.currentTime,cmdTime:(new Date).getTime()};
					pushState();
				}
				videoDom.onwaiting=function(){
					// caused by buffering - send pause signal to apps
					videoState={state:"pause",vidTime:videoDom.currentTime,cmdTime:(new Date).getTime()};
					pushState();
				}
				videoDom.onplaying=function(){
					// triggered on first play, or after waiting. 
					// if previously waiting, send play signal to apps
					if(videoState.state=="pause"){
						videoState={state:"play",vidTime:videoDom.currentTime,cmdTime:(new Date).getTime()};
						pushState();
					}
				}
				this.dom=function(){
					return videoDom;
				}
				this.getState=function(){
					return videoState;
				}
			})();
			var analysisObj=new (function(){
				var studentState={};
				var total=0; var collateUp=0;
				var respDom=document.createElement("div");
				var svg=d3.select(respDom)
					.append("svg")
					.attr("width",200)
					.attr("height",20)
				var bgRect=svg.append("rect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", 0)
					.attr("height", 200)
					.style("fill", "rgb(150,150,150)")
				var topRect=svg.append("rect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", 0)
					.attr("height", 200)
					.style("fill", "rgb(0,0,255)")
				this.respDom=function(){
					return respDom;
				}
				// mod not directly informed of new student entering... 
				// only deduced from the fact that student uuid is unique. 
				// may want to make it more formal. 
				this.logsig=function(uuid,state){
					if(!(uuid in studentState)){
						total++;
					}
					if(studentState[uuid]!=state){
						state=="down" ? collateUp++ : collateUp--;
					}
					studentState[uuid]=state;
					if(total==0){
						topRect.attr("width",0)
						bgRect.attr("width",0);
					}else{
						widthPixels=collateUp/total*200;
						topRect.attr("width",widthPixels)
						bgRect.attr("width",200);
					}
				}
			})(); 
			this.responseInput=function(){
				return analysisObj.respDom();
			}
			this.responseDom=function(){
				return videoObj.dom();
			}
			this.passSigWaBroadcast=function(_signalBroadcast){
				web.signalBroadcast=_signalBroadcast;
			}
			this.passSigWaTarget=function(_signalTarget){
				web.signalTarget=_signalTarget;
			}
			this.sigAw=function(studentUuid,data){
				if(data.cmd=="timecheck"){
					var sig={cmd:"timecheck",webTime:(new Date()).getTime(),state:videoObj.getState()}
					web.signalTarget(studentUuid,sig);
				}else if(data.cmd=="response"){
					// console.log("response: uuid-"+studentUuid+" state-"+data.resState);
					analysisObj.logsig(studentUuid,data.resState);
				}
			}
		}
	}
})