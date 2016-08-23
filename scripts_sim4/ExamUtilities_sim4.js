function AddDialogForState(DialogueFile)
{
	//sets the volume, so can be adjusted for input volume
	AddDialogItem(DialogueFile, 0.3);
}
function DoClinicalExam()
{
	/*
		show image for hives, tell user for sim1
		play lung sound
	*/
	
	//only show if procedure has been started and not finished - may only want to show once...
	//AppendtoActionDisplay("Hoarseness, tounge swollen, stridor, anxious.");	
	//ShowCLinicalExamImage("hives_SC1_small.jpg");
	PlayAudioFileMultipleTimes("audio/inhale_exhale_1.ogg", 1.0, 3);
	
	//special for this sim
	if(IsInIntroState())
	{
		SetPatientResponse("No, I feel lightheaded, I…I feel bad.");
		SetTechResponse("You look pale, sweaty and clammy. Are you feeling ok?");
	}
}
///-----------------------------------------
function IsInIntroState()
{

	if(Machine.CurrentState == StateNameListEnum.Introduction)
	{
		return true;
	}

	return false;
}
function SetInitialTechStatement()
{
	if(IsInIntroState())
	{
		SetTechResponse(StateItemList[0].StateTechSays);
		SetPatientResponse(StateItemList[0].StatePatientResponse);
	}
}
///-----------------------------------------
function GetVitalSigns()
{
	/*
		based on  the current state machine state we set the HR, BP, and pulse - and user response
	*/
	PlayVitalsSfx();
	SetPatientVitalStatsFromState(Machine);
	StartSim4Timer();	//timer for initial drop
	
	SetInitialTechStatement();
	bVitalsorPulseOxClicked=true;
}
///-----------------------------------------
function GetPulseOximetry()
{
	/*
		based on  the current sate machine state we set the RR and saturation
	*/
	
	PlayVitalsSfx();
	SetPatientPulseOxStatsFromState(Machine);
	StartSim4Timer();	//timer for initial BP & sat drop
	
	SetInitialTechStatement();
	bVitalsorPulseOxClicked=true;
}