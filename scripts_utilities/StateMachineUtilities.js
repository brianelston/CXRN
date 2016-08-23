var Machine;	//the state machine instance

//--------STATE MACHINE CLASS-----------------
function StateMachine(SimName, SimNumber, CurrentState, InitialState, CurrentProgressState)
{
	this.SimName=SimName;
	this.SimNumber=SimNumber;			//which simulation is running
	this.CurrentState=CurrentState;		//whats the state of the machine
	this.InitialState=InitialState;		//whats first state of the machine
	this.CurrentProgressState=CurrentProgressState;		//whats the progress state of the simulation to display to user
} 

function ResetStateMachine()
{
	Machine.CurrentState=Machine.InitialState;
	//and call the functions that process input
}