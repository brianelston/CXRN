//-----------------------------------
function include(file) 
{
   if (document.createElement && document.getElementsByTagName) {
     var head = document.getElementsByTagName('head')[0];

     var script = document.createElement('script');
     script.setAttribute('type', 'text/javascript');
     script.setAttribute('src', file);

     head.appendChild(script);
   } else {
     alert('Your browser can\'t deal with the DOM standard. That means it\'s old. Please update your browser before continueing!');
   }
}
//-----------------------------------

include('scripts_utilities/DisplayUtilities.js');
include('scripts_utilities/StateMachineUtilities.js');


include('scripts_sim3/Sim3_states.js');
include('scripts_utilities/UserResponseUtilities.js');
include('scripts_sim3/Sim3_UserResponse.js');
include('scripts_utilities/ProgressList.js');

include('scripts_utilities/MovieUtilities.js');
include('scripts_utilities/DialogueUtilities.js');
include('scripts_utilities/AudioUtilities.js');
include('scripts_utilities/ExamUtilities.js');
include('scripts_sim3/ExamUtilities_sim3.js');
include('scripts_utilities/TimerUtilities.js');
include('scripts_sim3/TimerUtilitiesSim3.js');

include('scripts_utilities/jquery_1_2_5.js');
//include('scripts_utilities/jquery.alerts.js');
//-----------------------------------
function StartScenario()
{
	PlayRestartSfx();
	WaitforVitalsTicks=RestartWaitforVitalsTicks;
	StartSimulationSim3();
}

function StartSimulationSim3()
{
	//show a progress display - radio buton style
	//if already running or finished ask for confirmation

	//set the state variables
	Machine=new StateMachine("BronchospasmAndLaryngealEdema2", 1, 0, 0, 0);	//state is Wait_For_Input
	ResetStateMachine();
	ResetStatVars();
	
	//show pogress meter
	SetProgressList();	//could be driven by statelist
	//create the state list machine
	CreateSim3States();
	
	//actually we want to set to start state
	BUTTONAdvanceProgressMeter();
	
	ClearUserResponseToInput();
	SetTechResponse("");
	
	//dont do till simulation started, not on page load....
	//set up the timer events
	ResetSimTimer();
	StartWaitForVitalTimer();
	
	//clear clinical exam info - no image sim2
	//HideClinicalExamImage();
	CreateDialogManager();
}
//---------------TEST ONLY------------------------------

function SetProgressList() 
{
	//BUTTON TEST ONLY
	//redo the old item with non bold!
	Machine=new StateMachine("BronchospasmAndLaryngealEdema2", 1, 0, 0, 0);
	ResetStateMachine();
	
	//set up the progress list
	with (Machine) CreateProgressList(StateProgress, CurrentProgressState);

}
function BUTTONAdvanceProgressMeter()
{
	if(Machine.CurrentProgressState == MaxStates-1)
	{	return;
	}	
	WritetoDebug("progress = " + (Machine.CurrentProgressState+1));
		
	Machine.CurrentProgressState = Machine.CurrentProgressState + 1;
	with (Machine) AdvanceProgressMeter(StateProgress, CurrentProgressState);
}
function waitPreloadPage() { //DOM

// wmode parameter does the trick - set the id to allow JS comms
flashembed("mainmovieSIM", {src: "Scenario3_H264.swf", wmode: 'opaque', id: 'mainmovie'});

//NOTE: this function must not be moved
var buttons = $("#NasalorFaceMask button").click(function(e) {
	
	// get user input
	var NasalorFace = buttons.index(this) === 0;

	// do something with the answer
	InterpretOxygenStatus(NasalorFace);
});


$("#HowMuchOxygen form").submit(function(e) {

	// close the overlay
	$("#HowMuchOxygen").overlay().close();

	// get user input
	var input = $("input", this).val();
	
	RespondToOxygenDelivery(input);

	// do not submit the form
	return e.preventDefault();
});

var IVbuttons = $("#IVFluidAmountBox button").click(function(e) {
	
	// do something with the answer
	InterpretIvFluid(IVbuttons.index(this));
});

StartSimulationSim3();

}