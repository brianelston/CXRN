var timercount=0;
var timerobject;
var timer_is_on=false;

var fasttimers=false;	//true;	//for testing quicker
//var fasttimers=true;	//true;	//for testing quicker

var TimerIdenifier;
var WaitforVitalsTicks=30000;
var RestartWaitforVitalsTicks=10000;

//---------------------------------------
function stopTimer()
{
	clearTimeout(timerobject);
	timer_is_on=false;
}
function StopAllTimerActivity()
{
	stopTimer();
	TimerIdenifier = TimerNameListEnum.TimerNoActivity;
}

function WritetoActionLogIfFastTimer(textval)
{
	if(fasttimers == true)
	{
		AppendtoActionDisplay(textval);
	}

}