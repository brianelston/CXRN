//--------State machine tracking----------------
var StateItemList;

//use this enumeration to reference the correct statelist items, it will be a lot easier in the future
var StateNameListEnum = {"Introduction" : 0, 
"Wait_For_Vital_Signs" : 1,
"Wait_For_Input" : 2,
"Solumedrol" : 3,
"RaiseLegs" : 4,
"IVFluid" : 5,
"Oxygen_10L_FM" : 6,
"IVFluid_Only" : 7,
"Atropine_1mg_OrMore" : 8,
"Atropine" : 9,
"Atropine_And_IVFluid" : 10,
"CheckO2RaiseLegs" : 11,
"NoAtropineIvFluid" : 12,
"Atropine_pt6mg_OrLess" : 13};

//,"Report_State" : 5};
///---------------------------------------------------------------------------------------------------------
function CreateSim4States()
{	/*	Sim goals:	1) give proper IV fluid
					2) give atropine

	
	TODO:			Timers needed in sequence 
					1) till user asks for pulse and vitals, after 30 secs tech asks
					2) no raise legs and O2 1 minute
					3) no atropine or IV fluid 1 minute	
	*/

	//create global list for state items
	
	StateItemList=new Array(20);	//choose the appropriate number

	//these names MUST directly correspond to the StateNameListEnum ENUM
		
				//	(StateName, StateNextState, StateHR, StateBP, StateRR, StateSat, StateVisited, StateObjectiveMet, StatePatientResponse, StateTechSays)
	StateItemList[0]=new StateItem("Introduction", "Wait_For_Vital_Signs", 40, "80/50", 16, "98%", true, false, "I feel lightheaded.", "Doctor, My patient tried to stand up after her CT scan, she fainted and fell backwards onto the table.", null);		//intro movie
	StateItemList[1]=new StateItem("Wait_For_Vital_Signs", "Wait_For_Input", null, null, null, null, false, false, null, null, null);		//
	StateItemList[2]=new StateItem("Wait_For_Input", "Wait_For_Input", null, null, null, null, false, false, null, null, null);			//wait for input after an an action like medication or tech action
	StateItemList[3]=new StateItem("Solumedrol", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	
	StateItemList[4]=new StateItem("RaiseLegs", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	
	StateItemList[5]=new StateItem("IVFluid", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	
	StateItemList[6]=new StateItem("Oxygen_10L_FM", "Wait_For_Input", null, null, 16, "98%", false, false, null, null, null);		
	StateItemList[7]=new StateItem("IVFluid_Only", "Wait_For_Input", 45, "85/45", 16, "98%", false, false, "I still feel woozy. [Very slight improvement].", null, "SC4_IVFluid_Only.ogg");
	//StateItemList[8]=new StateItem("Atropine_1mg_OrMore", "Wait_For_Input", 180, "120/80", 18, "93%", false, false, "My chest hurts.", null, "SC4_Atropine_1mg.ogg");	
	StateItemList[8]=new StateItem("Atropine_1mg_OrMore", "Wait_For_Input", 150, "190/110", 18, "93%", false, false, "My chest hurts.", null, "SC4_Atropine_1mg.ogg");	
	StateItemList[9]=new StateItem("Atropine", "Wait_For_Input", 70, "85/45", 18, "95%", false, false, null, null);		//atropine alone
	StateItemList[10]=new StateItem("Atropine_And_IVFluid", "Wait_For_Input", 90, "120/80", 14, "98%", false, false, "I feel so much better. [CORRECT].", null, "SC4_Atr_IVFluid.ogg");		//atropine and IV
	StateItemList[11]=new StateItem("CheckO2RaiseLegs", "Wait_For_Input", null, null, null, null, false, false, null, "Should we raise their legs? How much oxygen do you want to give?", null);
	StateItemList[12]=new StateItem("NoAtropineIvFluid", "Wait_For_Input", 35, "70/40", null, null, false, false, null, "The patients blood pressure is dropping.", "pressure_dropping.ogg");		
	StateItemList[13]=new StateItem("Atropine_pt6mg_OrLess", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	

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


