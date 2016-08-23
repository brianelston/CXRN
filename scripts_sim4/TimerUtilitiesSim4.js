//bfe 4.22.11 - working quick and dirty - fast and simple is the key here....

var bCountdownTimerStarted=false;

//---------------------------------------
var TimerNameListEnum = {"TimerIntroduction" : 0,
"TimerVitals" : 1,
"TimerCheckO2AndRaiselegs" : 2,
"TimerNoAtropineIvFluid" : 3,
"TimerNoActivity" : 4};

function StartSim4Timer()
{
	//need to account for timer already being on
	//if new state comes in from user input, then stop the timer
	
	//AppendtoActionDisplay("DEBUG: StartSim2Timercalled with: " + TimerIdenifier);
		
	switch(TimerIdenifier)
	{
		case TimerNameListEnum.TimerIntroduction:	//waiting for start
			StartWaitForVitalTimer();	//after 30 secs
		break;
		case TimerNameListEnum.TimerVitals:		//then advance to the next timer
			StartTimerCheckO2AndRaiselegs();			
		break;
		case TimerNameListEnum.TimerCheckO2AndRaiselegs:		//then advance to the next timer
			StartTimerNoAtropineIvFluid();			
		break;

		default:
			WritetoActionLogIfFastTimer("DEBUG: StartSim3Timer restarted without cause: " + TimerIdenifier);
	}
}
function StartTimerNoAtropineIvFluid()
{	//-------------------------------------------
	if(TimerIdenifier == TimerNameListEnum.TimerNoAtropineIvFluid || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;	
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoAtropineIvFluid;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoAtropineIvFluid()",6000);
		}
		else
		{	//timerobject=setTimeout("SetNoAtropineIvFluid()",60000);
			timerobject=setTimeout("SetNoAtropineIvFluid()",45000);
		}
	}
}
function SetNoAtropineIvFluid()
{				
	Machine.CurrentState=StateNameListEnum.NoAtropineIvFluid;	
	WritetoActionLogIfFastTimer("DEBUG: SetNoAtropineIvFluid.");	
	
	StoreLASTStats(Machine);
	SetPatientStatsFromState(Machine);
	PlayBeepSfx();
	
	stopTimer();
	TimerIdenifier = TimerNameListEnum.TimerNoActivity;
}
function StartTimerCheckO2AndRaiselegs()
{	//-------------------------------------------
	if(TimerIdenifier == TimerNameListEnum.TimerCheckO2AndRaiselegs || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;	
		
	stopTimer();//stop the vitals timer if its running
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerCheckO2AndRaiselegs;
		bCountdownTimerStarted = true;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetCheckO2AndRaiselegs()",12000);
		}
		else
		{	//timerobject=setTimeout("SetCheckO2AndRaiselegs()",60000);
			timerobject=setTimeout("SetCheckO2AndRaiselegs()",45000);
		}
	}
}
function SetCheckO2AndRaiselegs()
{
	if(StateItemList[StateNameListEnum.RaiseLegs].StateVisited == true && StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited == true)	//oxygen given changes the stats
	{
		stopTimer();
		StartSim4Timer();
		return;
	}				
		
	Machine.CurrentState=StateNameListEnum.CheckO2RaiseLegs;	
	WritetoActionLogIfFastTimer("DEBUG: SetCheckO2AndRaiselegs.");	
	AddDialogItem("audio/ask_raiselegs.ogg", 0.8);				//need new dialog, ask legsandoxygen
	
	StoreLASTStats(Machine);
	SetPatientStatsFromState(Machine);
	
	stopTimer();
	StartSim4Timer();
}

function StartWaitForVitalTimer()
{	//at start os simul we ask user if no action taken

	if(TimerIdenifier == TimerNameListEnum.TimerVitals || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;

	if (!timer_is_on)
 	{
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerVitals;
		var timertime = WaitforVitalsTicks + 4000;
		
		if(WaitforVitalsTicks < 25000)
		{
			timertime = WaitforVitalsTicks;//else is a restart
		}
	
		if(fasttimers == true)
		{	timerobject=setTimeout("AskUserIfWantsVitals()",3000);
		}
		else
		{	timerobject=setTimeout("AskUserIfWantsVitals()",timertime);
		}
	}
}
function AskUserIfWantsVitals()
{	
	//if user does not ask for vitals or pulse ox, then tech asks user
	timer_is_on = false;
	AddDialogItem("audio/ask_vitals.ogg", 0.7);
	SetTechResponse("Should I get vitals? Do you want pulse oximetry?");
	//and play an audio file if we can get one
}
function StartTimerIfNoAction()
{
	//here we start the countdown timers if the users performs an action...but does not first click vitals or pulse ox (which start the simul)
	
	if(bVitalsorPulseOxClicked == false && bCountdownTimerStarted == false)
	{
		WritetoActionLogIfFastTimer("DEBUG: StartTimerIfNoAction.");
		//if were not in an intro state or a count down, then the user has done an action
		stopTimer();
		TimerIdenifier = TimerNameListEnum.TimerVitals;
		StartSim4Timer();	
	}
}
function ResetSimTimer()
{
	//------SPECIFIC--------------
	bCountdownTimerStarted=false;
	
	//------GENERAL--------------
	StoreLASTStats(Machine);	
	//keeptrack of last stats when all this starts up, since it changes the stats can interfere with user requests
	stopTimer();
	timercount=0;
	TimerIdenifier = TimerNameListEnum.TimerIntroduction;
}