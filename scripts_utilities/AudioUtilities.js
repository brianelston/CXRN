//-------HELPERS - Audio---------------------

//channels for multiple sounds
var channel_max = 10;										// number of channels

var audiocount=0;
var audiotimesmax=1;
var audioplayingmulti=false;
	
audiochannels = new Array();
	for (a=0;a<channel_max;a++) {									// prepare the channels
		audiochannels[a] = new Array();
		audiochannels[a]['channel'] = new Audio();						// create a new audio object
		audiochannels[a]['finished'] = -1;							// expected end time for this channel
	}

function PlayAudio()
{
	PlayAudioFile("inhale_exhale_1.wav", 1.0);
}
function PlayAudioFileMultipleTimes(infile, involume, numtimes)
{
	//plays an audio file a specified number of times
	if(infile == null || audioplayingmulti == true)	//one at a time!
		return;
		
	audiocount=0;
	audiotimesmax=numtimes;
		
	myAudiomulti = new Audio(infile);		//global var, allows stop
	myAudiomulti.volume=involume;			//0 to 1.0
	
	myAudiomulti.addEventListener('ended', PlayAudioFileAgain, false);	//allow to play next one in queue
	audioplayingmulti=true;
	myAudiomulti.play();
}
function PlayAudioFileAgain()
{
	audiocount=audiocount+1;
	
	if(audiocount >= audiotimesmax)
	{	//were done
		audioplayingmulti=false;
		return;
	}
	
	myAudiomulti.currentTime = 0;
	myAudiomulti.play();
}


function PlayAudioFile(infile, involume)
{
	if(infile == null)
		return;
		
	myAudio = new Audio(infile);		//global var, allows stop
	myAudio.volume=involume;			//0 to 1.0
	myAudio.play();
}
function LoopAudio()
{
	myAudio = new Audio('audio/asthma_inspire_expire.wav');		//global var
	myAudio.addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
		}, false);
		myAudio.play();
}
function StopAudio()
{
	myAudio.pause();
}
function play_multi_sound(s) 
{
		for (a=0;a<audiochannels.length;a++) {
			thistime = new Date();
			if (audiochannels[a]['finished'] < thistime.getTime()) {			// is this channel finished?
				audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
				audiochannels[a]['channel'].src = document.getElementById(s).src;
				audiochannels[a]['channel'].load();
				audiochannels[a]['channel'].play();
				break;
			}
		}
}
function PlayLearningPointsSfx() 
{	///click on restart procedure
	PlayAudioFile("audio/wind-chime-1.ogg", 0.6);		
}
function PlayRestartSfx() 
{	///click on restart procedure
	PlayAudioFile("audio/button-11.ogg", 0.3);		
}
function PlayMedsTechSfx() 
{	///click on meds/tech action/flush
	PlayAudioFile("audio/button-21.ogg", 0.6);		
}
function PlayVitalsSfx() 
{	///click on vitals/pulse ox
	PlayAudioFile("audio/button-50.ogg", 0.6);		
}
function PlayBeepSfx() 
{	///for timer - something not good
	PlayAudioFile("audio/Beep.ogg", 0.3);		
}
function PlayDingSfx() 
{	//for good action, butnot correct solution
	PlayAudioFile("audio/Ding.ogg", 0.2);		
}
function PlayCorrectSfx() 
{	//for correct solution
	//PlayAudioFile("audio/dingdong.wav", 0.5);
//	PlayAudioFile("audio/doorbell.wav", 0.5);	
	PlayAudioFile("audio/doorbell.ogg", 0.2);	
}