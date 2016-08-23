//well need to store out the last RR and sat, and use if needed, ie user admins medication with no sat/rr before hitting pulse ox
//bug because current values are stored in th state or the display, and both are lost in that case
var MaxStates = 3;	
//progress states tell the user what their next action should be
var StateProgress=["Introduction: Please watch movie then start.", "Waiting for Input.", "Completion."];


var LASTRespitoryRate; 
var LASTOxygenSaturation; 
var LASTHeartRate;  
var LASTBPRate; 

function StoreLASTStats(LocalMachine)
{
	//store these off when we change states, then if the user clicks on pulse ox we use them as backup if 
	//they have entered a new state that has no pulse ox of its own
	//other: just store these out in globals and update to avoid all this hassle
	
	//NOTE: need to add HR to this
	if(StateItemList[LocalMachine.CurrentState].StateRR != null)
	{
		LASTRespitoryRate = StateItemList[LocalMachine.CurrentState].StateRR;
	}
	if(StateItemList[LocalMachine.CurrentState].StateSat != null)
	{
		LASTOxygenSaturation = StateItemList[LocalMachine.CurrentState].StateSat;
	}
	if(StateItemList[LocalMachine.CurrentState].StateHR != null)
	{
		LASTHeartRate = StateItemList[LocalMachine.CurrentState].StateHR;
	}
	if(StateItemList[LocalMachine.CurrentState].StateBP != null)
	{
		LASTBPRate = StateItemList[LocalMachine.CurrentState].StateBP;
	}
}
function PlayDialogFileForState()
{
	if(StateItemList[Machine.CurrentState].StateDialogFile != null)
	{	
		AddDialogForState("audio/" + StateItemList[Machine.CurrentState].StateDialogFile);
	}
}
//-----------------------------------
function SetPatientStatsFromState(LocalMachine)
{	
	//Todo: onnlt call from state change function. vitals or pulse ox needs own version
	
	StateItemList[LocalMachine.CurrentState].StateVisited = true;				//set visited flag
	//we load these into the stateitemlist array...esentially what the characteristics of the state are regarding patient response
	SetUserResponseToInput(
		//StateItemList[LocalMachine.CurrentState].StateHR, 
		StateItemList[LocalMachine.CurrentState].StateHR != null ? StateItemList[LocalMachine.CurrentState].StateHR: LASTHeartRate, 
		StateItemList[LocalMachine.CurrentState].StateBP != null ? StateItemList[LocalMachine.CurrentState].StateBP: LASTBPRate, 
		StateItemList[LocalMachine.CurrentState].StateRR != null ? StateItemList[LocalMachine.CurrentState].StateRR: LASTRespitoryRate, 
		StateItemList[LocalMachine.CurrentState].StateSat != null ? StateItemList[LocalMachine.CurrentState].StateSat: LASTOxygenSaturation, 
		StateItemList[LocalMachine.CurrentState].StatePatientResponse, 
		StateItemList[LocalMachine.CurrentState].StateTechSays);
	//probably better to not write if display is '?', but that creates another bug....which circumvents this fix
	
	//and play the audio file if one exists
	PlayDialogFileForState();
}
function StoreOldStatsAndUpdate()
{
	StoreLASTStats(Machine);
	SetStatsAndFlagsAfterMedication(Machine);
}
//-----------------------------------
function WritetoDebug(intext)
{
	//remove for now
	//var item = document.getElementById('DebugDisplay');
	//item.innerHTML = intext;
}
function WritetoProgressMeter(intext)
{
	//set the progress display counter
	var item = document.getElementById('ProgressMeter');
	item.innerHTML = "Progress: " + intext;
}
function AppendtoActionDisplay(intext)
{
	//append new user display to old
	var item = document.getElementById('ActionDisplay');
	var oldtxt = item.innerHTML
	//item.innerHTML = oldtxt + "\n" + intext;
	//todo: keep the focus on the last item, or add to top!
	item.innerHTML = intext + "\n" + oldtxt;
}
function ClearActionDisplay()
{
	//we need to store this out if later we want to recall
	//clear out the old list
	var item = document.getElementById('ActionDisplay');
	item.innerHTML = "";
}
function WritetoPatientBackground(intext)
{
	//show the patients background
	var item = document.getElementById('PatientBackground');
	item.innerHTML = intext;
}