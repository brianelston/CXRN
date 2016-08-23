function DoClinicalExam()
{
	/*
		show image for hives, tell user for sim1
		play lung sound
	*/
	
	//only show if procedure has been started and not finished - may only want to show once...	
	ShowCLinicalExamImage("baby_hives_small.jpg");
	//PlayAudioFileMultipleTimes("audio/in_ex_1_infant.wav", 1.0, 5);
	//PlayAudioFileMultipleTimes("audio/asthma_in_exp_severe.wav", 1.0, 5);
	PlayAudioFile("audio/inhale_exhale_1.ogg", 1.0);
	
	//special for this sim
	if(IsInIntroState())
	{
		//SetPatientResponse("Patient has hives on chest and abdomomen.");
		SetTechResponse("There are hives all over his face and arms.");
	}
	
					
	AppendtoActionDisplay("Patient is a sedated 8 kg 8 month old boy. There are hives all over his face and arms.");
	alert("Patient is a sedated 8 kg 8 month old boy.");
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
	//StartSim5Timer();	//timer for initial drop
	
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
	//StartSim5Timer();	//timer for initial BP & sat drop
	
	SetInitialTechStatement();
	bVitalsorPulseOxClicked=true;
}

function SetInitialStartStats()
{
	SetVitalSigns(StateItemList[Machine.CurrentState].StateHR, StateItemList[Machine.CurrentState].StateBP);
	SetPulseOximetry(StateItemList[Machine.CurrentState].StateRR, StateItemList[Machine.CurrentState].StateSat);
	//SetPatientVitalStatsFromState(Machine);
	//SetPatientPulseOxStatsFromState(Machine);
	//StartSim5Timer();	//timer for initial drop
}