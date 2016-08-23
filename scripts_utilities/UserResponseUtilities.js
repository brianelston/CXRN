var LASTIVMedAdministered=null;	//string
var TotalEpiIM=new Number(0.0);	//float - #1
var TotalAtropine=new Number(0.0);	//float - #4
var TotalEPI_IV=new Number(0.0);	//float - #3

function ResetTrackingVariables()
{	
	LASTIVMedAdministered=null;	//tracking for using flush & IV
	TotalEpiIM=0.0;
	TotalAtropine=0.0;
	TotalEPI_IV=0.0;
}

function AdministerMedication()
{
	//PlayVitalsSfx();
	InterpretAdministerMedication(Machine);
}
function DoTechAction()
{
	//PlayVitalsSfx();
	InterpretTechAction(Machine);
}
function FlushIV()
{
	//PlayVitalsSfx();
	InterpretFlushIV(Machine);
}
function StopScenario()
{
	BUTTONAdvanceProgressMeter();
	StopAllTimerActivity();	//stop any countdowns
	AppendtoActionDisplay("Scenario stopped for learning points. Please restart procedure.");
}
function ShowLearningPoints()
{
	StopScenario();
	
	PlayVitalsSfx();
	InterpretShowLearningPoints();

}
function ShowReport()
{
	StopScenario();
	
	PlayVitalsSfx();
	InterpretShowReport();
}

//-----------------------------------
function SetStatsAndFlagsAfterMedication(LocalMachine)
{
	try
	{
		SetPatientStatsFromState(LocalMachine);
		//StateItemList[LocalMachine.CurrentState].StateVisited = true;				//set visited flag
	}
	catch(err)
	{
		AppendtoActionDisplay("try/catch error in SetStatsAndFlagsAfterMedication");
	}
}
function SetPatientResponseColorRed()
{
	try
	{
				
		var item =  document.getElementById("PatientResponseDisplay");
		item.style.color="red";
	}
	catch(err)
	{
	}
}
function SetPatientResponseColorBlack()
{
	try
	{
				
		var item =  document.getElementById("PatientResponseDisplay");
		item.style.color="black";
	}
	catch(err)
	{
	}
}

function GetDosageUnit() 
{
	len = document.SelectDoseUnits.DoseUnit.length

	for (i = 0; i <len; i++) 
	{
		if (document.SelectDoseUnits.DoseUnit[i].checked) 
		{
			//chosen = document.SelectDoseUnits.DoseUnit[i].value;
			return document.SelectDoseUnits.DoseUnit[i];
		}
	}
}

