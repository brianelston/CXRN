function AddDialogForState(DialogueFile)
{
	//sets the volume, so can be adjusted for input volume
	AddDialogItem(DialogueFile, 0.7);
}

function DoClinicalExam()
{
	/*
		show image for hives, tell user for sim1
		play lung sound
	*/
	
	//only show if procedure has been started and not finished - may only want to show once...
	AppendtoActionDisplay("Hives on chest and abdomen.");
	AppendtoActionDisplay("Breathing normal, lungs clear.");
	ShowCLinicalExamImage("hives_SC1_small.jpg");
	PlayAudioFile("audio/inhale_exhale_1.ogg", 1.0);
}
///-----------------------------------------
function SetInitialTechStatement()
{

	if(Machine.CurrentState == StateNameListEnum.Hypotension_Introduction ||
		Machine.CurrentState == StateNameListEnum.Intro_BP_Sat_Drop1 ||
		Machine.CurrentState == StateNameListEnum.Intro_BP_Sat_Drop2 ||
		Machine.CurrentState == StateNameListEnum.Intro_BP_Sat_Drop3 ||
		Machine.CurrentState == StateNameListEnum.Intro_BP_Sat_Drop4)
	{
		SetTechResponsefromState(Machine);
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
	StartSim1Timer();	//timer for initial BP & sat drop
	
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
	StartSim1Timer();	//timer for initial BP & sat drop
	
	SetInitialTechStatement();
	bVitalsorPulseOxClicked=true;
}