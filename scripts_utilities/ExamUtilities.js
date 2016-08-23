//-------HELPERS - Examination---------------------
var bVitalsorPulseOxClicked=false;

var bUpdateSat = true;
var bUpdateRR = true;

function AddDialogForState(DialogueFile)
{
	//sets the volume, so can be adjusted for input volume
	AddDialogItem(DialogueFile, 0.7);
}
function ResetStatVars()
{
	bUpdateSat = true;
	bUpdateRR = true;
}
function TurnOffSatandRRUpdate()
{
	bUpdateSat = false;
	bUpdateRR = false;

}

function ShowCLinicalExamImage(valstring)
{
	try
	{
		if(valstring == null)
			return;
			
		var item =  document.getElementById("ClinicalImageDisplay");
		item.src=valstring;
		item.style.visibility="visible"
		//may also want to set hidden/visible
	}
	catch(err)
	{
	}
}
function HideClinicalExamImage()
{
		var item =  document.getElementById("ClinicalImageDisplay");
		item.style.visibility="hidden"
}
//-----------------------------------
function SetPatientResponse(valstring)
{
	try
	{
		if(valstring == null)
			return;
			
		var item =  document.getElementById("PatientResponseDisplay");
		item.innerHTML="<b>Patient says: </b>" + valstring;
	}
	catch(err)
	{
	}
}
function SetTechResponsefromState(LocalMachine)
{
	SetTechResponse(StateItemList[LocalMachine.CurrentState].StateTechSays);

}
function SetTechResponse(valstring)
{
	try
	{
		if(valstring == null)
			return;
			
		var item =  document.getElementById("TechtResponseDisplay");
		item.innerHTML="<b>Tech says: </b>" + valstring;
	}
	catch(err)
	{
	}
}
///-----------------------------------------
function ClearUserResponseToInput()
{	//clear the display and patient says field
	SetUserResponseToInput("?", "?", "?", "?", "", "");
	WritetoProgressMeter("");
	SetPatientResponseColorBlack();

	bVitalsorPulseOxClicked=false;
}
function SetUserResponseToInput(HeartRateValue, BPRateValue, RESPValue, OxygenSatValue, PatientResponseText, TechSaysText)
{
	SetVitalSigns(HeartRateValue, BPRateValue);
	SetPulseOximetry(RESPValue, OxygenSatValue);
	SetPatientResponse(PatientResponseText);
	SetTechResponse(TechSaysText);
}

function SetPatientPulseOxStatsFromState(LocalMachine)
{
	//specifically for user calling for pulse ox
		
	SetPulseOximetry(StateItemList[LocalMachine.CurrentState].StateRR, StateItemList[LocalMachine.CurrentState].StateSat);
	SetPatientResponse(StateItemList[LocalMachine.CurrentState].StatePatientResponse);
	
}
function SetPulseOximetry(RESPValue, OxygenSatValue)
{
	/*
		based on  the current sate machine state we set the RR and saturation
	*/
	SetRespiroryRateDisplay(RESPValue);
	SetOxygenSaturationDisplay(OxygenSatValue);
}
function SetOxygenSaturationDisplay(valstring)
{
	try
	{
		if(valstring == null || bUpdateSat == false)
			return;
			
		var item =  document.getElementById("OxygenSaturationDisplay");
		
		item.innerHTML="Sat: " + valstring;
	}
	catch(err)
	{
	}
}
function SetRespiroryRateDisplay(valstring)
{
	try
	{
		if(valstring == null  || bUpdateRR == false)
			return;
			
		var item =  document.getElementById("RespiroryRateDisplay");
			
		//if(item.innerHTML == 'RR: ?')
		//	return;
			
		item.innerHTML="RR: " + valstring;
	}
	catch(err)
	{
	}
}
///-----------------------------------------
function SetPatientVitalStatsFromState(LocalMachine)
{
	//specifically for when user requests vital signs
		
	SetVitalSigns(StateItemList[LocalMachine.CurrentState].StateHR, StateItemList[LocalMachine.CurrentState].StateBP);
	SetPatientResponse(StateItemList[LocalMachine.CurrentState].StatePatientResponse);
	
}
function SetVitalSigns(HeartRateValue, BPRateValue)
{
	//set HR & BP
	SetHeartRate(HeartRateValue);
	SetBpRate(BPRateValue);
}
///-----------------------------------------
function SetHeartRate(valstring)
{
	try
	{
		if(valstring == null)
			return;
			
		var item =  document.getElementById("HeartRateDisplay");
		item.innerHTML="HR: " + valstring;
	}
	catch(err)
	{
	}
}
function SetBpRate(valstring)
{
	try
	{
		if(valstring == null)
			return;
			
		var item =  document.getElementById("BloodPressureDisplay");
		item.innerHTML="BP: " + valstring;
	}
	catch(err)
	{
	}
}
///-----------------------------------------