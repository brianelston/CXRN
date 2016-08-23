//bfe 4.22.11 - working quick and dirty - fast and simple is the key here....

var bCountdownTimerStarted=false;

//---------------------------------------
var TimerNameListEnum = {"TimerIntroduction" : 0,
"TimerNoOxygen" : 1,
"TimerNoEpiorIVFluid" : 2,
"TimerNoEpi_Stage1" : 3,
"TimerNoEpi_Stage2" : 4,
"TimerNoEpi_Stage3" : 5,
"TimerShowReport" : 6,
"TimerNoActivity" : 7};

function StartSim5Timer()
{
	//need to account for timer already being on
	//if new state comes in from user input, then stop the timer
	
	//AppendtoActionDisplay("DEBUG: StartSim2Timercalled with: " + TimerIdenifier);
		
	switch(TimerIdenifier)
	{
		case TimerNameListEnum.TimerIntroduction:	//waiting for start
			StartWaitForOxygenTimer();	
		break;
		case TimerNameListEnum.TimerNoOxygen:		//then advance to the next timer
			StartTimerNoEpiOrIVFluid();			
		break;
		case TimerNameListEnum.TimerNoEpiorIVFluid:		//then advance to the next timer
			StartTimerNoEpi_Stage1();			
		break;
		case TimerNameListEnum.TimerNoEpi_Stage1:		//then advance to the next timer
			StartTimerNoEpi_Stage2();			
		break;
		case TimerNameListEnum.TimerNoEpi_Stage2:		//then advance to the next timer
			StartTimerNoEpi_Stage3();			
		break;

		default:
			WritetoActionLogIfFastTimer("DEBUG: StartSim3Timer restarted without cause: " + TimerIdenifier);
	}
}function StartTimerNoEpi_Stage3()
{	//at start os simul we ask user if no action taken

	if(TimerIdenifier == TimerNameListEnum.TimerNoEpi_Stage3 || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;

	if (!timer_is_on)
 	{
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoEpi_Stage3;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoEpi_Stage3Timer()",6000);
		}
		else
		{	//timerobject=setTimeout("SetNoEpi_Stage3Timer()",45000);
			timerobject=setTimeout("SetNoEpi_Stage3Timer()",30000);
		}
	}
}
function SetNoEpi_Stage3Timer()
{				
	Machine.CurrentState=StateNameListEnum.No_Epi_Stage3;	
	WritetoActionLogIfFastTimer("DEBUG: SetNoEpi_Stage3Timer.");	
	
	StoreLASTStats(Machine);
	SetPatientStatsFromState(Machine);
	PlayBeepSfx();
	//AddDialogItem("audio/ask_callcode.wav", 0.7);
	
	stopTimer();
	TimerIdenifier = TimerNameListEnum.TimerNoActivity;	//all done
}
function StartTimerNoEpi_Stage2()
{	//at start os simul we ask user if no action taken

	if(TimerIdenifier == TimerNameListEnum.TimerNoEpi_Stage2 || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;

	if (!timer_is_on)
 	{
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoEpi_Stage2;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoEpi_Stage2Timer()",6000);
		}
		else
		{	//timerobject=setTimeout("SetNoEpi_Stage2Timer()",45000);
			timerobject=setTimeout("SetNoEpi_Stage2Timer()",30000);
		}
	}
}
function SetNoEpi_Stage2Timer()
{				
	//if no IV fluids, tell user
	if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
	{
		Machine.CurrentState=StateNameListEnum.No_Epi_Stage2;	
	}
	else
	{
		Machine.CurrentState=StateNameListEnum.No_Epi_Stage2_NoIVFluid;	
	}
	WritetoActionLogIfFastTimer("DEBUG: SetNoEpi_Stage2Timer.");	
	
	StoreLASTStats(Machine);
	SetPatientStatsFromState(Machine);
	PlayBeepSfx();
	
	stopTimer();
	StartSim5Timer();
}
function StartTimerNoEpi_Stage1()
{	//at start os simul we ask user if no action taken

	if(TimerIdenifier == TimerNameListEnum.TimerNoEpi_Stage1 || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;

	if (!timer_is_on)
 	{
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoEpi_Stage1;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoEpi_Stage1Timer()",6000);
		}
		else
		{	//timerobject=setTimeout("SetNoEpi_Stage1Timer()",45000);
			timerobject=setTimeout("SetNoEpi_Stage1Timer()",30000);
		}
	}
}
function SetNoEpi_Stage1Timer()
{				
	//if no IV fluids, tell user
	if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
	{
		Machine.CurrentState=StateNameListEnum.No_Epi_Stage1;	
	}
	else
	{
		Machine.CurrentState=StateNameListEnum.No_Epi_Stage1_NoIVFluid;	
	}
	WritetoActionLogIfFastTimer("DEBUG: SetNoEpi_Stage1Timer.");	
	
	StoreLASTStats(Machine);
	SetPatientStatsFromState(Machine);
	PlayBeepSfx();
	
	stopTimer();
	StartSim5Timer();
}
function StartTimerNoEpiOrIVFluid()
{	//at start os simul we ask user if no action taken

	if(TimerIdenifier == TimerNameListEnum.TimerNoEpiorIVFluid || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;

	if (!timer_is_on)
 	{
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoEpiorIVFluid;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoEpiorIVFluidTimer()",6000);
		}
		else
		{	timerobject=setTimeout("SetNoEpiorIVFluidTimer()",15000);
		}
	}
}
function SetNoEpiorIVFluidTimer()
{	
	if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true || StateItemList[StateNameListEnum.EPI_PEN_JR].StateVisited == true || StateItemList[StateNameListEnum.EPI_SQ].StateVisited == true)
	{
		stopTimer();
		StartSim5Timer();
		return;
	}				
		
	Machine.CurrentState=StateNameListEnum.No_EpiOrIvFluid;	
	WritetoActionLogIfFastTimer("DEBUG: SetNoEpiorIVFluidTimer.");	
	
	StoreLASTStats(Machine);
	SetPatientStatsFromState(Machine);
	PlayBeepSfx();
	
	stopTimer();
	StartSim5Timer();
}
//---------
function StartWaitForOxygenTimer()
{	//at start os simul we ask user if no action taken

	if(TimerIdenifier == TimerNameListEnum.TimerNoOxygen || TimerIdenifier == TimerNameListEnum.TimerNoActivity)
		return;

	if (!timer_is_on)
 	{
 		timer_is_on=true;
		TimerIdenifier = TimerNameListEnum.TimerNoOxygen;
	
		if(fasttimers == true)
		{	timerobject=setTimeout("SetNoOxygenTimer()",6000);
		}
		else
		{	//timerobject=setTimeout("SetNoOxygenTimer()",45000);
			timerobject=setTimeout("SetNoOxygenTimer()",30000);
		}
	}
}
function SetNoOxygenTimer()
{	
	if(StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited == true )	//oxygen given changes the stats
	{
		stopTimer();
		StartSim5Timer();
		return;
	}				
		
	Machine.CurrentState=StateNameListEnum.No_Oxygen;	
	WritetoActionLogIfFastTimer("DEBUG: SetNoOxygenTimer.");	
	
	StoreLASTStats(Machine);
	SetPatientStatsFromState(Machine);
	PlayBeepSfx();
	
	stopTimer();
	StartSim5Timer();
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
		StartSim5Timer();		//bfe 8.26.11 - bug was sim 4 timer - unused though
	}
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