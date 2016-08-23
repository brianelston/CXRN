//bfe 4.4.11 - working quick and dirty - fast and simple is the key here....

//var fasttimers=false;	//true;	//for testing quicker
//var fasttimers=true;	//true;	//for testing quicker

var didnoalbutroltimer=false;	//1 minute no albutrol
var didnooxygentimer=false;		//1 mre minute no oxygen
var bCountdownTimerStarted=false;
var didnoalbutrol4minutestimer=false;	//4 minutes no albutrol

//---------------------------------------
var TimerNameListEnum = {"TimerIntroduction" : 0,
"TimerVitals" : 1,
"TimerInitialDrop" : 2,
"TimerDoNothing" : 3,
"TimerNoAlbutrol" : 4,
"TimerNoOxygen" : 5,
"TimerNoAlbutrol4Minutes" : 6,
"TimerCallCode" : 7,
"TimerNoActivity" : 8};

function StartSim2Timer()
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
			StartInitialDropTimer();			
		break;
		case TimerNameListEnum.TimerInitialDrop:	//then advance to the next timer
			StartDoNothingTimer();
		break;
		case TimerNameListEnum.TimerDoNothing:	
		case TimerNameListEnum.TimerNoAlbutrol:
		case TimerNameListEnum.TimerNoOxygen:
		
			StartAlbutrolorOxygenTimer();
		break;
		case TimerNameListEnum.TimerNoAlbutrol4Minutes:
			
			StartCallCodeTimer();
		break;
		case TimerNameListEnum.TimerNoActivity:	//no action
		
		break;
		default:
			WritetoActionLogIfFastTimer("DEBUG: StartSim2Timer restarted without cause: " + TimerIdenifier);
	}
}
function AdvanceToAlbutrolorOxygenTimer()	//if user hits albutrol or oxygen, we want to immediately advance to that portion of the countdown
{
	//do we need to reset TimerIdenifier?
	stopTimer();
	StartAlbutrolorOxygenTimer();

}
function StartAlbutrolorOxygenTimer()
{	//start when user hits vitals/pulse ox at start

	if(TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;
		
		//check if alutrol state entered, if not start that timer
		//chaeck if oxygen state entered, if not start that one
		//also only allow each timer once....
			
	bCountdownTimerStarted=true;
	
	if(StateItemList[StateNameListEnum.Albutrol].StateVisited == false && didnoalbutroltimer == false)
	{	
		didnoalbutroltimer = true;
		StartNoAlbutrolTimer();
	}//else if no oxygen
	else if(StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited == false && didnooxygentimer == false)	//note only works for correct dosage O2
	{	didnooxygentimer = true;
		StartNoOxygenTimer();
	}//else already done it
	else if(StateItemList[StateNameListEnum.Albutrol].StateVisited == false && didnoalbutrol4minutestimer == false)
	{	
		didnoalbutrol4minutestimer = true;
		StartNoAlbutrol4MinuteTimer();
	}
	else
	{
		stopTimer();
		TimerIdenifier = TimerNameListEnum.TimerNoActivity;	//prevent timer from restarting
		
		//also can get here if admin oxygen early, but no albutrol
		WritetoActionLogIfFastTimer("DEBUG: Timer restarted without state to enter. Oxygen or Albutrol given without the other.");
	}
}
function StartCallCodeTimer()
{	//-------------------------------------------
	if(TimerIdenifier == TimerNameListEnum.TimerCallCode || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;	
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerCallCode;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetCallCodeTimer()",6000);
		}
		else
		{	//timerobject=setTimeout("SetCallCodeTimer()",45000);
			timerobject=setTimeout("SetCallCodeTimer()",15000);
		}
	}
}
function SetCallCodeTimer()
{
	//for now just a one-time event - might want a countdown through 2 states
	if(StateItemList[StateNameListEnum.Albutrol].StateVisited == true)
	{
		//done with timers if we got here
		stopTimer();
			
		TimerIdenifier = TimerNameListEnum.TimerNoActivity;	//prevent timer from restarting
		return;
	}

	WritetoActionLogIfFastTimer("DEBUG: SetCallCodeTimer.");
	timer_is_on = false;
	PlayBeepSfx();
	TimerIdenifier = TimerNameListEnum.TimerNoActivity;	//prevent timer from restarting
	
	AddDialogItem("audio/ask_callcode.ogg", 0.7);
	SetTechResponse("Should we call a code?");
}

function StartNoAlbutrol4MinuteTimer()
{	
	if(TimerIdenifier == TimerNameListEnum.TimerNoAlbutrol4Minutes || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;	
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoAlbutrol4Minutes;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoAlbutrol4MinuteTimer()",6000);//1 minute
		}
		else
		{		//2 minute if no oxygen
				//3 minute if oxygen since we skipped that wait - total wait of 4 minutes
			if(didnooxygentimer == true)
			{	//timerobject=setTimeout("SetNoAlbutrol4MinuteTimer()",120000);//2 minute 
				timerobject=setTimeout("SetNoAlbutrol4MinuteTimer()",30000);//2 minute 
			
			}
			else
			{
				//timerobject=setTimeout("SetNoAlbutrol4MinuteTimer()",180000);//2 minute 
				timerobject=setTimeout("SetNoAlbutrol4MinuteTimer()",45000);//2 minute 
			}
		}
	}
}
function SetNoAlbutrol4MinuteTimer()
{
	//for now just a one-time event - might want a countdown through 2 states
	if(StateItemList[StateNameListEnum.Albutrol].StateVisited == true)
	{
		//done with timers if we got here
		stopTimer();
			
		TimerIdenifier = TimerNameListEnum.TimerNoActivity;	//prevent timer from restarting
		return;
	}

	WritetoActionLogIfFastTimer("DEBUG: SetNoAlbutrol4MinuteTimer.");
	Machine.CurrentState=StateNameListEnum.NoAlbutrol4Minutes;						//set this state to current
	StoreLASTStats(Machine);
	SetStatsAndFlagsAfterMedication(Machine);
	timer_is_on = false;
	PlayBeepSfx();
	
	//then 45 secs later ask if we should call code
	stopTimer();
	StartSim2Timer();
}
function StartNoOxygenTimer()
{	
	if(TimerIdenifier == TimerNameListEnum.TimerNoOxygen || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;	
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoOxygen;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoOxygenState()",6000);//1 minute later BP decrease, HR increase
		}
		else
		{	//timerobject=setTimeout("SetNoOxygenState()",60000);//1 minute later BP decrease, HR increase
			timerobject=setTimeout("SetNoOxygenState()",30000);//1 minute later BP decrease, HR increase
		}
	}
}
function SetNoOxygenState()
{
	//for now just a one-time event - might want a countdown through 2 states
	if(StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited == true)
	{
		//done with timers if we got here
		stopTimer();
			
		StartSim2Timer();
		return;
	}

	WritetoActionLogIfFastTimer("DEBUG: SetNoOxygenState.");
	Machine.CurrentState=StateNameListEnum.NoOxygen;						//set this state to current
	StoreLASTStats(Machine);
	SetStatsAndFlagsAfterMedication(Machine);
	timer_is_on = false;
	PlayBeepSfx();
	
	//start a final no albutrol timer
	stopTimer();
	StartSim2Timer();
	
}
function StartNoAlbutrolTimer()
{	
	if(TimerIdenifier == TimerNameListEnum.TimerNoAlbutrol || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoAlbutrol;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoAlbutrolState()",6000);//1 minute later BP decrease, HR increase
		}
		else
		{	//timerobject=setTimeout("SetNoAlbutrolState()",60000);//1 minute later BP decrease, HR increase
			timerobject=setTimeout("SetNoAlbutrolState()",30000);//1 minute later BP decrease, HR increase
		}
	}
}
function SetNoAlbutrolState()
{
	//for now just a one-time event - might want a countdown through 2 states
	if(StateItemList[StateNameListEnum.Albutrol].StateVisited == true)
	{
		//if user did albutrol, then just advance to oxygen
		stopTimer();
			
		StartSim2Timer();
		return;
	}

	WritetoActionLogIfFastTimer("DEBUG: SetNoAlbutrolState.");
	Machine.CurrentState=StateNameListEnum.NoAlbutrol;						//set this state to current
	StoreLASTStats(Machine);
	SetStatsAndFlagsAfterMedication(Machine);
	PlayBeepSfx();
	
	//start a no oxygen timer
	stopTimer();
	StartSim2Timer();
}
function StartDoNothingTimer()
{	
	if(TimerIdenifier == TimerNameListEnum.TimerDoNothing || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;
		
	if (!timer_is_on)
 	{
		timercount=0;
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerDoNothing;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetDoNothingState()",6000);//1 minute later BP decrease, HR increase
		}
		else
		{	//timerobject=setTimeout("SetDoNothingState()",60000);//1 minute later BP decrease, HR increase
			timerobject=setTimeout("SetDoNothingState()",45000);//1 minute later BP decrease, HR increase
		}
	}
}
function SetDoNothingState()
{
	//for now just a one-time event - might want a countdown through 2 states
	if(!IsInIntroState())
	{
		//if were not in an intro state or a count down, then the user has done an action		
		stopTimer();
			
		StartSim2Timer();
		return;
	}

	WritetoActionLogIfFastTimer("DEBUG: SetDoNothingState.");
	Machine.CurrentState=StateNameListEnum.DoNothingState;						//set this state to current
	StoreLASTStats(Machine);
	SetStatsAndFlagsAfterMedication(Machine);
	timer_is_on = false;
	PlayBeepSfx();
	
	//start a no albutrol timer, or no oxygen timer
	stopTimer();
	StartSim2Timer();
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
	
		timerobject=setTimeout("DoInitialDrop()", 2000);//4 seconds each, then it simplifies the update vals
	}
}
//hard code or calculate...just make sure the timer stops after first med or tech action
//these need to be a state......else user gets wrong response when asking for stats
function DoInitialDrop()
{
	//WritetoActionLogIfFastTimer("DoBPandSatDrop:state : " + Machine.CurrentState);
	//then the user did something so we start no albutrol timer
		
	if(!IsInIntroState())
	{
		//if were not in an intro state or a count down, then the user has done an action
		stopTimer();
			
		TimerIdenifier = TimerNameListEnum.TimerDoNothing;	//force the timer machine to skip past this state, user did something start no albutrol or no oxygen
		StartSim2Timer();
		return;
	}
		
	timercount=timercount+1;
	
	if(timercount < 2)//3)	//bfe 3.22.11 - 4 seconds per tickcount
	{
		//do nothing
	}
	else if(timercount < 7)//12)	//20 seconds of this
	{
	
		switch(timercount)
		{
		
			case 2:
				PlayBeepSfx();
				Machine.CurrentState=StateNameListEnum.InitialDrop_5;					
			break;
			case 3:
				PlayBeepSfx();
				Machine.CurrentState=StateNameListEnum.InitialDrop_6;	
			break;
			case 4:
				PlayBeepSfx();
				Machine.CurrentState=StateNameListEnum.InitialDrop_7;	
			break;
			case 5:
				PlayBeepSfx();
				Machine.CurrentState=StateNameListEnum.InitialDrop_8;	
			break;
			case 6:
				PlayBeepSfx();
				Machine.CurrentState=StateNameListEnum.InitialDrop_9;	
				StoreLASTStats(Machine);
				SetPatientStatsFromState(Machine);
				
				timer_is_on = false;
				//start the no epi timer here...or if user does meds/tech action, but not epi IM
				StartSim2Timer();
				return;
			break;
			default:
			
			timer_is_on = false;
			return;	//done
		}
		
		StoreLASTStats(Machine);
		SetPatientStatsFromState(Machine);
	}
	else
	{
		timer_is_on = false;
		return;	//do not reset timer...
	}

	//we stop this if the user does any tech action or meds that change BP or sat....
	//we could just check if the state changed then cancel...alternatively
	
	timerobject=setTimeout("DoInitialDrop()",2000);
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
{	
	//if user does not ask for vitals or pulse ox, then tech asks user
	timer_is_on = false;
	AddDialogItem("audio/ask_vitals.ogg", 0.7);
	SetTechResponse("Should I get vitals? Do you want pulse oximetry?");
	//and play an audio file if we can get one
}
function StartTimerIfNoAction()
{
//	if(!IsInIntroState() && timer_is_on == false && TimerIdenifier != TimerNameListEnum.TimerNoActivity)
	if(bVitalsorPulseOxClicked == false && bCountdownTimerStarted == false)
	{
	
		WritetoActionLogIfFastTimer("DEBUG: StartTimerIfNoAction.");
		//if were not in an intro state or a count down, then the user has done an action
		stopTimer();
			
		TimerIdenifier = TimerNameListEnum.TimerDoNothing;	//force the timer machine to skip past this state, user did something start no albutrol or no oxygen
		StartSim2Timer();	
	}
}
function ResetSimTimer()
{
	//------SPECIFIC--------------
	didnoalbutroltimer=false;
	didnooxygentimer=false;
	bCountdownTimerStarted=false;
	didnoalbutrol4minutestimer=false;
	
	//------GENERAL--------------
	StoreLASTStats(Machine);	
	//keeptrack of last stats when all this starts up, since it changes the stats can interfere with user requests
	stopTimer();
	timercount=0;
	TimerIdenifier = TimerNameListEnum.TimerIntroduction;
}