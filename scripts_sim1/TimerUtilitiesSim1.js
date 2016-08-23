var bCountdownTimerStarted=false;

//---------------------------------------
var TimerNameListEnum = {"TimerIntroduction" : 0,
"TimerVitals" : 1,
"TimerInitialDrop" : 2,
"TimerNoEpi" : 3,
"TimerNeedHelp" : 4,
"TimerNoActivity" : 5};


function StartSim1Timer()
{
	
	//need to account for timer already being on
	//if new state comes in from user input, then stop the timer
		
	switch(TimerIdenifier)
	{
		case TimerNameListEnum.TimerIntroduction:	//waiting for start
			StartWaitForVitalTimer();	//after 30 secs
		break;
		case TimerNameListEnum.TimerVitals:	//then advance to the next timer
			StartInitialDropTimer();	//runs 40 seconds total....
		break;
		case TimerNameListEnum.TimerInitialDrop:	//then advance to the next timer
			StartNoEpiTimer();
		break;
		case TimerNameListEnum.TimerNoEpi:	//then advance to the next timer
			StartNeedHelpTimer();
		break;
		case TimerNameListEnum.TimerNoActivity:	//no action
		
		break;
		default:
			//alert("Timer started without cause: StartSim1Timer");
	}
}
function StartNeedHelpTimer()
{	//start when user hits vitals/pulse ox at start

	if(TimerIdenifier == TimerNameListEnum.TimerNeedHelp || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNeedHelp;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNeedHelpState()",6000);//1 minute later BP decrease, HR increase
		}
		else
		{	
			//timerobject=setTimeout("SetNoEpiState()",60000);//1 minute later BP decrease, HR increase
			timerobject=setTimeout("SetNeedHelpState()",45000);//1 minute later BP decrease, HR increase
		}
	}
}

function SetNeedHelpState()
{
	//for now just a one-time event - might want a countdown through 2 states

	WritetoActionLogIfFastTimer("DEBUG: SetNeedHelpState.");
	Machine.CurrentState=StateNameListEnum.Need_help;						//set this state to current
	StoreLASTStats(Machine);
	SetStatsAndFlagsAfterMedication(Machine);
	timer_is_on = false;
	PlayBeepSfx();
	TimerIdenifier = TimerNameListEnum.TimerNoActivity;	//prevent timer from restarting
}


function StartNoEpiTimer()
{	//start when user hits vitals/pulse ox at start

	if(TimerIdenifier == TimerNameListEnum.TimerNoEpi || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;
		
	bCountdownTimerStarted=true;
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoEpi;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoEpiState()",6000);//1 minute later BP decrease, HR increase
		}
		else
		{	
			//timerobject=setTimeout("SetNoEpiState()",60000);//1 minute later BP decrease, HR increase
			timerobject=setTimeout("SetNoEpiState()",40000);//1 minute later BP decrease, HR increase
		}
	}
}

function SetNoEpiState()
{
	//for now just a one-time event - might want a countdown through 2 states

	WritetoActionLogIfFastTimer("DEBUG: SetNoEpiState.");
	Machine.CurrentState=StateNameListEnum.No_Epipehphrine_BPHRchange;						//set this state to current
	StoreLASTStats(Machine);
	SetStatsAndFlagsAfterMedication(Machine);
	timer_is_on = false;
	PlayBeepSfx();
	//TimerIdenifier = TimerNameListEnum.TimerNoActivity;	//prevent timer from restarting
	StartSim1Timer();
}
function StartInitialDropTimer()
{	//start when user hits vitals/pulse ox at start

	if(TimerIdenifier == TimerNameListEnum.TimerInitialDrop || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;
		
	stopTimer();//stop the vitals timer if its running

	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerInitialDrop;
	
		timerobject=setTimeout("DoBPandSatDrop()", 4000);//4 seconds each, then it simplifies the update vals
	}
}
//hard code or calculate...just make sure the timer stops after first med or tech action
function DoBPandSatDrop()
{

	//AppendtoActionDisplay("DoBPandSatDrop:state : " + Machine.CurrentState);
	
	//might be easier to skip based on state....
	if(Machine.CurrentState != StateNameListEnum.Hypotension_Introduction &&
		Machine.CurrentState != StateNameListEnum.Intro_BP_Sat_Drop1 &&
		Machine.CurrentState != StateNameListEnum.Intro_BP_Sat_Drop2 &&
		Machine.CurrentState != StateNameListEnum.Intro_BP_Sat_Drop3 &&
		Machine.CurrentState != StateNameListEnum.Intro_BP_Sat_Drop4)
		{
			//if were not in an intro state or a count down, then the user has done an action
			timer_is_on = false;
			//start the no epi timer here...user did something significant
			//there might be a messagebox up, ideally would wait till its done to start new timer
			StartSim1Timer();
			return;
		}

	timercount=timercount+1;
	
	if(timercount < 3)	//bfe 3.22.11 - 4 seconds per tickcount
	{
		//do nothing
	}
	else if(timercount < 7)	//(28 secs)...for next 20-30 secs BP & sat drops, sat supposed to go a bit longer, but lets keep it simple for now
	{
	
		switch(timercount)
		{
			case 3:
				PlayBeepSfx();
				Machine.CurrentState=StateNameListEnum.Intro_BP_Sat_Drop1;						//set this state to current
			break;
			case 4:
				PlayBeepSfx();
				Machine.CurrentState=StateNameListEnum.Intro_BP_Sat_Drop2;						//set this state to current
			break;
			case 5:
				PlayBeepSfx();
				Machine.CurrentState=StateNameListEnum.Intro_BP_Sat_Drop3;						//set this state to current
			break;
			case 6:
				PlayBeepSfx();
				Machine.CurrentState=StateNameListEnum.Intro_BP_Sat_Drop4;						//set this state to current
				StoreLASTStats(Machine);
				SetStatsAndFlagsAfterMedication(Machine);
				
				timer_is_on = false;
				//start the no epi timer here...or if user does meds/tech action, but not epi IM
				StartSim1Timer();
				return;
			break;
			default:
			
			timer_is_on = false;
			return;	//done
		
		}
		StoreLASTStats(Machine);
		SetStatsAndFlagsAfterMedication(Machine);
	}
	else
	{
		timer_is_on = false;
		return;	//do not reset timer...
	}

	//we stop this if the user does any tech action or meds that change BP or sat....
	//we could just check if the state changed then cancel...alternatively
	
	if(fasttimers == true)
	{	timerobject=setTimeout("DoBPandSatDrop()",2000);
	}
	else
	{	timerobject=setTimeout("DoBPandSatDrop()",4000);
	}
}
function StartWaitForVitalTimer()
{	//at start os simul we ask user if no action taken

	if(TimerIdenifier == TimerNameListEnum.TimerVitals || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;

	if (!timer_is_on)
 	{
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerVitals;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("AskUserIfWantsVitals()",3000);
		}
		else
		{	timerobject=setTimeout("AskUserIfWantsVitals()",WaitforVitalsTicks);
		}
	}
}
function AskUserIfWantsVitals()
{	//if user does not ask for vitals or pulse ox, then tech asks user
	timer_is_on = false;
	AddDialogItem("audio/ask_vitals_female.ogg", 0.7);
	SetTechResponse("Should I get vitals? Do you want pulse oximetry?");
	
}
function StartTimerIfNoAction()
{
	//we need to start the no meds timer if user does something, but does not do meds or tech action
	if(bVitalsorPulseOxClicked == false && bCountdownTimerStarted == false)
	{
	
		WritetoActionLogIfFastTimer("DEBUG: StartTimerIfNoAction.");
		//if were not in an intro state or a count down, then the user has done an action
		stopTimer();
			
		TimerIdenifier = TimerNameListEnum.TimerInitialDrop;	//
		StartSim1Timer();	
	}
}
function ResetSimTimer()
{
	
	bCountdownTimerStarted=false;

	StoreLASTStats(Machine);	
	//keeptrack of last stats when all this starts up, since it changes the stats can interfere with user requests
	stopTimer();
	timercount=0;
	TimerIdenifier = TimerNameListEnum.TimerIntroduction;
}