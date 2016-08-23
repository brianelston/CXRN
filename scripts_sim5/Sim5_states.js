//--------State machine tracking----------------
var StateItemList;

//use this enumeration to reference the correct statelist items, it will be a lot easier in the future
var StateNameListEnum = {"Introduction" : 0, 
"Wait_For_Vital_Signs" : 1,
"Wait_For_Input" : 2,
"IVFluid" : 3,
"Oxygen_10L_FM" : 4,
"IVFluid_AndOxygen" : 5,
"IVFluid_NoOxygen" : 6,
"Benedryl" : 7,
"Atropine" : 8,
"Albutrol" : 9,
"EPI_toomuch" : 10,
"EPI_PEN_JR" : 11,
"EPI_and_IVFluid" : 12,
"EPI_NoIVFluid" : 13,
"EPI_SQ" : 14,	//EPI IV now, same flag though
"No_Oxygen" : 15,
"No_EpiOrIvFluid" : 16,
"No_Epi_Stage1" : 17,
"No_Epi_Stage2" : 18,
"No_Epi_Stage3" : 19,
"RaiseLegs" : 20,
"No_Epi_Stage2_NoIVFluid" : 21,
"No_Epi_Stage1_NoIVFluid" : 22,
"EPI_IV" : 23};

//,"Report_State" : 5};
///---------------------------------------------------------------------------------------------------------
function CreateSim5States()
{	/*	Sim goals:	1) give proper IV fluid
					2) give epinephrine

	*/

	//create global list for state items
	
	StateItemList=new Array(25);	//choose the appropriate number

	//these names MUST directly correspond to the StateNameListEnum ENUM
		
				//	(StateName, StateNextState, StateHR, StateBP, StateRR, StateSat, StateVisited, StateObjectiveMet, StatePatientResponse, StateTechSays)
	StateItemList[0]=new StateItem("Introduction", "Wait_For_Vital_Signs", 150, "60/30", 20, "92%", true, false, null, "The BP is dropping to 60/30 and HR is 150. The nurse gave a normal saline bolus, but he’s not any better.", null);		//intro movie
	StateItemList[1]=new StateItem("Wait_For_Vital_Signs", "Wait_For_Input", null, null, null, null, false, false, null, null, null);		//
	StateItemList[2]=new StateItem("Wait_For_Input", "Wait_For_Input", null, null, null, null, false, false, null, null, null);			//wait for input after an an action like medication or tech action
	StateItemList[3]=new StateItem("IVFluid", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	
	StateItemList[4]=new StateItem("Oxygen_10L_FM", "Wait_For_Input", null, null, 19, "99%", false, false, null, null, null);	
	StateItemList[5]=new StateItem("IVFluid_AndOxygen", "Wait_For_Input", 150, "75/40", 22, "99%", false, false, null, "[Slight improvement].", null);	
	StateItemList[6]=new StateItem("IVFluid_NoOxygen", "Wait_For_Input", 150, "75/40", 22, "90%", false, false, null, "[Slight improvement].", null);	
	StateItemList[7]=new StateItem("Benedryl", "Wait_For_Input", 180, null, null, null, false, false, null, null, null);	
	StateItemList[8]=new StateItem("Atropine", "Wait_For_Input", 180, null, null, null, false, false, null, null, null);	
	StateItemList[9]=new StateItem("Albutrol", "Wait_For_Input", 180, null, null, null, false, false, null, null, null);	
	StateItemList[10]=new StateItem("EPI_toomuch", "Wait_For_Input", 180, "150/70", 24, "90%", false, false, null, "This is higher than the typical dose.", null);	
	StateItemList[11]=new StateItem("EPI_PEN_JR", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	
	StateItemList[12]=new StateItem("EPI_and_IVFluid", "Wait_For_Input", 100, "100/60", 19, "98%", false, false, null, "The patient feels better. [CORRECT].", null);	//correct
	StateItemList[13]=new StateItem("EPI_NoIVFluid", "Wait_For_Input", 115, "90/50", 19, "98%", false, false, null, null, null);	
	StateItemList[14]=new StateItem("EPI_SQ", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	
	StateItemList[15]=new StateItem("No_Oxygen", "Wait_For_Input", null, null, null, "90%", false, false, null, null, null);	
	StateItemList[16]=new StateItem("No_EpiOrIvFluid", "Wait_For_Input", 180, "53/30", 25, "90%", false, false, null, null, null);
	StateItemList[17]=new StateItem("No_Epi_Stage1", "Wait_For_Input", 200, "50/30", 28, "85%", false, false, null, null, null);	
	StateItemList[18]=new StateItem("No_Epi_Stage2", "Wait_For_Input", 210, "47/30", 0, "60%", false, false, null, "The patient is not breathing.", "Not_breathing.ogg");	
	//StateItemList[16]=new StateItem("No_EpiOrIvFluid", "Wait_For_Input", 180, "50/30", 25, "90%", false, false, null, null, null);
	//StateItemList[17]=new StateItem("No_Epi_Stage1", "Wait_For_Input", 200, "47/30", 28, "85%", false, false, null, null, null);	
	//StateItemList[18]=new StateItem("No_Epi_Stage2", "Wait_For_Input", 210, "53/32", 0, "60%", false, false, "[The patient is not breathing].", null, null);
	StateItemList[19]=new StateItem("No_Epi_Stage3", "Wait_For_Input", 0, "Non-palpable", null, null, false, false, null, "The patient is not breathing. Should we call a code?", "ask_callcode.ogg");	
	StateItemList[20]=new StateItem("RaiseLegs", "Wait_For_Input", null, null, null, null, false, false, null, "[Slight improvement].", null);	
	StateItemList[21]=new StateItem("No_Epi_Stage2_NoIVFluid", "Wait_For_Input", 210, "47/30", 0, "60%", false, false, null, "Do you want IV fluids?", "Want_IVFluids.ogg");
	StateItemList[22]=new StateItem("No_Epi_Stage1_NoIVFluid", "Wait_For_Input", 200, "50/30", 28, "85%", false, false, null, "Do you want IV fluids?", "Want_IVFluids.ogg");		
	StateItemList[23]=new StateItem("EPI_IV", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	

	ResetTrackingVariables();
}

function StateItem(StateName, StateNextState, StateHR, StateBP, StateRR, StateSat, StateVisited, StateObjectiveMet, StatePatientResponse, StateTechSays, StateDialogFile)
{
	/* class StateItem
	   an individual state item, this should represent one mode...
	   a list of these comprises all of he states for a given simulation, and their operation
	   needs a callback function, but this scenario is simple, and the timeline is tight
	*/
	this.StateName=StateName;		//name
	this.StateNextState=StateNextState;			//What state do we advance to, or do we (NULL?)??
	//we want to also store the user feedback response to the state
	
	this.StateHR=StateHR;			//HR bfe 3.21.11
	this.StateBP=StateBP;			//BP
	this.StateRR=StateRR;			//RR
	this.StateSat=StateSat;			//SAT
	//also need timer class for BP, RR, and no action
	
	
	this.StateVisited=StateVisited;			//Is this a required objective?
	this.StateObjectiveMet=StateObjectiveMet;	//Has this objective been met? FALSE at start
	
	this.StatePatientResponse=StatePatientResponse;	//patient says
	this.StateTechSays=StateTechSays;	//tech says
	this.StateDialogFile=StateDialogFile;	//patient dialog audio
} 


