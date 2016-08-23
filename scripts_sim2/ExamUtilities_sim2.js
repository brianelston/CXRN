function AddDialogForState(DialogueFile)
{
	//sets the volume, so can be adjusted for input volume
	AddDialogItem(DialogueFile, 0.4);
}
function DoClinicalExam()
{
	/*
		show image for hives, tell user for sim1
		play lung sound
	*/
	
	//only show if procedure has been started and not finished - may only want to show once...
	//AppendtoActionDisplay("Expiratory wheezing, no stridor (cough, cough).");	//nope, they need to learn that
	//ShowCLinicalExamImage("hives_SC1_small.jpg");
	//PlayAudioFile("audio/asthma_in_exp_severe.wav", 1.0);
	PlayAudioFileMultipleTimes("audio/asthma_in_exp_severe.ogg", 1.0, 5);
	
	//special for this sim
	//if(Machine.CurrentState == StateNameListEnum.Introduction)
	if(IsInIntroState())
	{
		SetTechResponse("Does your throat fell swollen?");
		SetPatientResponse("No, my throat feels fine.");
	}
}
///-----------------------------------------
function IsInIntroState()
{

	if(Machine.CurrentState == StateNameListEnum.Introduction ||
		(Machine.CurrentState >= StateNameListEnum.InitialDrop_1 &&
		Machine.CurrentState <= StateNameListEnum.DoNothingState))
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
		//PlayDialogFileForState();
	}
}
///-----------------------------------------
function GetVitalSigns()
{
	/*
		based on  the current state machine state we set the HR, BP, and pulse - and user response
	*/
	
	//might want to dissallow after first inquiry, as after that vitals only change in response to action or timer - though no harm
	
	PlayVitalsSfx();
	SetPatientVitalStatsFromState(Machine);
	StartSim2Timer();	//timer for initial drop
	
	SetInitialTechStatement();
	bVitalsorPulseOxClicked=true;
}
///-----------------------------------------
function GetPulseOximetry()
{
	/*
		based on  the current sate machine state we set the RR and saturation
	*/
	//load from state machine
	//also cancel timers if needed
	PlayVitalsSfx();
	SetPatientPulseOxStatsFromState(Machine);
	StartSim2Timer();	//timer for initial BP & sat drop
	
	SetInitialTechStatement();
	bVitalsorPulseOxClicked=true;
}