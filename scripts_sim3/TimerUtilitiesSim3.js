//bfe 4.22.11 - working quick and dirty - fast and simple is the key here....

var bCountdownTimerStarted=false;

//---------------------------------------
var TimerNameListEnum = {"TimerIntroduction" : 0,
"TimerVitals" : 1,
"TimerNoEpiAny" : 2,
"TimerNoEpiIV_Stage1" : 3,
"TimerNoEpiIV_Stage2" : 4,
"TimerNoEpiIV_Stage3" : 5,
"TimerShowReport" : 6,
"TimerNoActivity" : 7};

function StartSim3Timer()
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
			StartTimerNoEpiAnyTimer();			
		break;
		case TimerNameListEnum.TimerNoEpiAny:	//then advance to the next timer
			StartTimerNoEpiIV_Stage1();
		break;
		case TimerNameListEnum.TimerNoEpiIV_Stage1:	//then advance to the next timer
			StartTimerNoEpiIV_Stage2();
		break;
		case TimerNameListEnum.TimerNoEpiIV_Stage2:	//then advance to the next timer
			StartTimerNoEpiIV_Stage3();
		break;
		case TimerNameListEnum.TimerNoActivity:	//no action
		
		break;
		default:
			WritetoActionLogIfFastTimer("DEBUG: StartSim3Timer restarted without cause: " + TimerIdenifier);
	}
}
function StartTimerNoEpiIV_Stage3()
{	//-------------------------------------------
	if(TimerIdenifier == TimerNameListEnum.TimerNoEpiIV_Stage3 || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;	
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoEpiIV_Stage3;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoEpiIV_Stage3Timer()",6000);
		}
		else
		{	//timerobject=setTimeout("SetNoEpiIV_Stage3Timer()",45000);
			timerobject=setTimeout("SetNoEpiIV_Stage3Timer()",30000);
		}
	}
}
function SetNoEpiIV_Stage3Timer()
{
	
	if(	StateItemList[StateNameListEnum.Call_Code].StateVisited == false)
	{	Machine.CurrentState=StateNameListEnum.NoEpiIV_Stage3;	
	}
	else
	{	Machine.CurrentState=StateNameListEnum.NoEpiIV_Stage3_postcallcode;	
	}
	WritetoActionLogIfFastTimer("DEBUG: SetNoEpiIV_Stage3Timer.");	
	//AddDialogItem("audio/ask_callcode.wav", 0.7);				
	
	StoreLASTStats(Machine);
	SetPatientStatsFromState(Machine);
	timer_is_on = false;
	PlayBeepSfx();
	TimerIdenifier = TimerNameListEnum.TimerNoActivity;	//prevent timer from restarting
	
	StartShowReportTimer(5000);	//we show the learning points in 5 secs
}
function StartTimerNoEpiIV_Stage2()
{	//-------------------------------------------
	if(TimerIdenifier == TimerNameListEnum.TimerNoEpiIV_Stage2 || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;	
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoEpiIV_Stage2;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoEpiIV_Stage2Timer()",6000);
		}
		else
		{	//timerobject=setTimeout("SetNoEpiIV_Stage2Timer()",45000);
			timerobject=setTimeout("SetNoEpiIV_Stage2Timer()",30000);
		}
	}
}
function SetNoEpiIV_Stage2Timer()
{

	if(StateItemList[StateNameListEnum.Epinephrine_IV_NoFlush].StateVisited == true)
	{	
		//AddDialogItem("audio/remember_flush.wav", 0.7);
		if(StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited == true)	//oxygen given changes the stats
		{
		
			Machine.CurrentState=StateNameListEnum.NoEpiIV_Stage2_Oxygen_NoFlush;	
			WritetoActionLogIfFastTimer("DEBUG: SetNoEpiIV_Stage2Timer. Oxygen. no flush.");	
		}				
		else
		{
			Machine.CurrentState=StateNameListEnum.NoEpiIV_Stage2_NoOxygen_NoFlush;	
			WritetoActionLogIfFastTimer("DEBUG: SetNoEpiIV_Stage2Timer. No oxygen. no flush.");					
		}
	}
	else
	{	if(StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited == true)	//oxygen given changes the stats
		{
			Machine.CurrentState=StateNameListEnum.NoEpiIV_Stage2_Oxygen;	
			WritetoActionLogIfFastTimer("DEBUG: SetNoEpiIV_Stage2Timer. Oxygen.");	
		}				
		else
		{
			Machine.CurrentState=StateNameListEnum.NoEpiIV_Stage2_NoOxygen;	
			WritetoActionLogIfFastTimer("DEBUG: SetNoEpiIV_Stage2Timer. No oxygen.");					
		}
	}
	
	StoreLASTStats(Machine);
	SetPatientStatsFromState(Machine);
	timer_is_on = false;
	PlayBeepSfx();
	
	stopTimer();
	StartSim3Timer();
}
function StartTimerNoEpiIV_Stage1()
{	//-------------------------------------------
	if(TimerIdenifier == TimerNameListEnum.TimerNoEpiIV_Stage1 || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;	
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoEpiIV_Stage1;
		bCountdownTimerStarted = true;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoEpiIV_Stage1Timer()",6000);
		}
		else
		{	//timerobject=setTimeout("SetNoEpiIV_Stage1Timer()",45000);
			timerobject=setTimeout("SetNoEpiIV_Stage1Timer()",30000);
		}
	}
}
function SetNoEpiIV_Stage1Timer()
{
	if(StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited == true)	//oxygen given changes the stats
	{
		Machine.CurrentState=StateNameListEnum.NoEpiIV_Stage1_Oxygen;	
		WritetoActionLogIfFastTimer("DEBUG: SetNoEpiIV_Stage1Timer. Oxygen.");	
	}				
	else
	{
		Machine.CurrentState=StateNameListEnum.NoEpiIV_Stage1_NoOxygen;	
		WritetoActionLogIfFastTimer("DEBUG: SetNoEpiIV_Stage1Timer. No oxygen.");					
	}
	StoreLASTStats(Machine);
	SetPatientStatsFromState(Machine);
	timer_is_on = false;
	PlayBeepSfx();
	
	stopTimer();
	StartSim3Timer();
}
function StartTimerNoEpiAnyTimer()
{	//-------------------------------------------
	if(TimerIdenifier == TimerNameListEnum.TimerNoEpiAny || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;	
		
	stopTimer();//stop the vitals timer if its running
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoEpiAny;
		bCountdownTimerStarted = true;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetTimerNoEpiAnyTimer()",6000);
		}
		else
		{	//timerobject=setTimeout("SetTimerNoEpiAnyTimer()",60000);
			timerobject=setTimeout("SetTimerNoEpiAnyTimer()",45000);
		}
	}
}
function SetTimerNoEpiAnyTimer()
{
	if(StateItemList[StateNameListEnum.EpinephrineSQ].StateVisited == true)	//then epi SQ > .3 mg - start no epi IV timer and skip this
	{
		stopTimer();
		StartSim3Timer();
		return;
	}
	

	WritetoActionLogIfFastTimer("DEBUG: SetTimerNoEpiAnyTimer.");
	Machine.CurrentState=StateNameListEnum.NoEpiAny;						//set this state to current
	StoreLASTStats(Machine);
	
	SetPatientStatsFromState(Machine);
	timer_is_on = false;
	PlayBeepSfx();
	
	stopTimer();
	StartSim3Timer();
}
function StartWaitForVitalTimer()
{	//at start os simul we ask user if no action taken

	if(TimerIdenifier == TimerNameListEnum.TimerVitals || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;

	if (!timer_is_on)
 	{
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerVitals;
		
		var timertime = WaitforVitalsTicks + 6000;
		
		if(WaitforVitalsTicks < 25000)
		{
			timertime = WaitforVitalsTicks;	//else is a restart
		}
		//alert(timertime);
	
		if(fasttimers == true)
		{	timerobject=setTimeout("AskUserIfWantsVitals()",3000);
		}
		else
		{	timerobject=setTimeout("AskUserIfWantsVitals()",timertime);	//5.23.11 - 36 secs now
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
	if(StateItemList[StateNameListEnum.Epinephrine_IV].StateVisited == true)	//then done
	{
		stopTimer();
		TimerIdenifier = TimerNameListEnum.TimerNoActivity;	//prevent timer from restarting
		return;
	}
	
	if(bVitalsorPulseOxClicked == false && bCountdownTimerStarted == false)
	{
		WritetoActionLogIfFastTimer("DEBUG: StartTimerIfNoAction.");
		//if were not in an intro state or a count down, then the user has done an action
		stopTimer();
				
		if(StateItemList[StateNameListEnum.EpinephrineSQ].StateVisited == true)	//then epi SQ > .3 mg - start no epi IV timer
		{
			TimerIdenifier = TimerNameListEnum.TimerNoEpiAny;
		}
		else
		{
			TimerIdenifier = TimerNameListEnum.TimerVitals;
		}
		StartSim3Timer();	
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

function StartShowReportTimer(amounttime)
{	//at start os simul we ask user if no action taken

	if(TimerIdenifier != TimerNameListEnum.TimerNoActivity)
		return;

	if (!timer_is_on)
 	{
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerShowReport;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("ShowReportTimerAction()",3000);
		}
		else
		{	timerobject=setTimeout("ShowReportTimerAction()",amounttime);
		}
	}
}
function ShowReportTimerAction()
{	
	stopTimer();
	TimerIdenifier = TimerNameListEnum.TimerNoActivity;
	InterpretShowLearningPoints();	//show the learning points
}