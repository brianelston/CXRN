//--------State machine tracking----------------
var StateItemList;

//use this enumeration to reference the correct statelist items, it will be a lot easier in the future
var StateNameListEnum = {"Introduction" : 0, 
"Wait_For_Vital_Signs" : 1,
"Wait_For_Input" : 2,
"Albutrol" : 3,
"Benedryl" : 4,
"Atropine" : 5,
"Solumedrol" : 6,
"IVFluid" : 7,
"EpinephrineSQ" : 8,
"Oxygen_10L_FM" : 9,
"Epinephrine_IV" : 10,
"Epinephrine_IV_NoFlush" : 11,
"NoEpiAny" : 12,
"NoEpiIV_Stage1_Oxygen" : 13,
"NoEpiIV_Stage1_NoOxygen" : 14,
"NoEpiIV_Stage2_Oxygen" : 15,
"NoEpiIV_Stage2_NoOxygen" : 16,
"NoEpiIV_Stage3" : 17,
"EpinephrineSQ_3mg_OrLess" : 18,
"Epinephrine_IV_MoreThan_pt5mg" : 19,
"Epinephrine_IV_pt2mg" : 20,
"EpinephrineSQ_2ndTime" : 21,
"NoEpiIV_Stage2_Oxygen_NoFlush" : 22,
"NoEpiIV_Stage2_NoOxygen_NoFlush" : 23,
"NoEpiIV_Stage3_postcallcode" : 24,
"Call_Code" : 25,
"EPI_IV_pt1mg_Less" : 26};

//,"Report_State" : 5};
///---------------------------------------------------------------------------------------------------------
function CreateSim3States()
{	/*	Sim goals:	1) give proper IV epinehrine
					2) flush or have IV fluid for admin of drug

	
	TODO:			Timers needed in sequence 
					1) till user asks for pulse and vitals, after 30 secs tech asks
					2) no epi 1 minute
					3) 45 secs no epi .1 mg IV
					4) 45 secs no epi .1 mg IV - worse
					5) 45 secs no epi .1 mg IV	-unconcious
	
	*/

	//create global list for state items
	
	StateItemList=new Array(30);	//choose the appropriate number

	//these names MUST directly correspond to the StateNameListEnum ENUM
		
				//	(StateName, StateNextState, StateHR, StateBP, StateRR, StateSat, StateVisited, StateObjectiveMet, StatePatientResponse, StateTechSays)
	StateItemList[0]=new StateItem("Introduction", "Wait_For_Vital_Signs", 120, "120/80", 24, "88%", true, false, "Doc, I feel like I'm having more trouble breathing.", "The patient is complaining of shortness of breath and she seems to be having trouble talking.", null);		//intro movie
	StateItemList[1]=new StateItem("Wait_For_Vital_Signs", "Wait_For_Input", null, null, null, null, false, false, null, null, null);		//after the user request vitals they need to admin epiniphrine with 1 minute or vitals change
	StateItemList[2]=new StateItem("Wait_For_Input", "Wait_For_Input", null, null, null, null, false, false, null, null, null);			//wait for input after an an action like medication or tech action
	StateItemList[3]=new StateItem("Albutrol", "Wait_For_Input", null, null, null, null, false, false, "Doc, I fell like I am having more trouble breathing. [Lungs: stridor].", null, "SC3_Intro.ogg");	
	StateItemList[4]=new StateItem("Benedryl", "Wait_For_Input", 180, "140/90", 30, "85%", false, false, "[Lungs: stridor].", null, null);	
	StateItemList[5]=new StateItem("Atropine", "Wait_For_Input", 180, "140/90", 30, "85%", false, false, "[Lungs: stridor].", null, null);	
	StateItemList[6]=new StateItem("Solumedrol", "Wait_For_Input", 180, "140/90", 30, "85%", false, false, "[Lungs: stridor].", null, null);	
	StateItemList[7]=new StateItem("IVFluid", "Wait_For_Input", null, null, null, null, false, false, "[Lungs: stridor].", null, null);	
	StateItemList[8]=new StateItem("EpinephrineSQ", "Wait_For_Input", 110, "135/90", 22, "90%", false, false, "I feel a little better, but still have tightness in my throat.", null, "SC3_EpinephrineSQ.ogg");	
	StateItemList[9]=new StateItem("Oxygen_10L_FM", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	
	StateItemList[10]=new StateItem("Epinephrine_IV", "Wait_For_Input", 90, "135/85", 18, "99%", false, false, "I feel a lot better. [Lungs: clear]. [CORRECT].", null, "SC3_Epinephrine_IV.ogg");		//correct, .1 mg or1 mL
	StateItemList[11]=new StateItem("Epinephrine_IV_NoFlush", "Wait_For_Input", 125, "140/90", 30, "85%", false, false, "(Gasping). [Lungs: stridor, hoarse].", null, null);
	StateItemList[12]=new StateItem("NoEpiAny", "Wait_For_Input", 125, "140/90", 30, "85%", false, false, "My throat is closing off. [Lungs: stridor, hoarse, whispering].", null, "SC3_NoEpiAny.ogg");
	StateItemList[13]=new StateItem("NoEpiIV_Stage1_Oxygen", "Wait_For_Input", 190, "200/110", 35, "75%", false, false, null, null, null);
	StateItemList[14]=new StateItem("NoEpiIV_Stage1_NoOxygen", "Wait_For_Input", 190, "200/110", 35, "70%", false, false, null, null, null);
	StateItemList[15]=new StateItem("NoEpiIV_Stage2_Oxygen", "Wait_For_Input", 190, "200/110", 0, "65%", false, false, null, "The patient is not breathing.", "Not_breathing.ogg");
	StateItemList[16]=new StateItem("NoEpiIV_Stage2_NoOxygen", "Wait_For_Input", 190, "200/110", 0, "60%", false, false, null, "The patient is not breathing.", "Not_breathing.ogg");
	StateItemList[17]=new StateItem("NoEpiIV_Stage3", "Wait_For_Input", 0, "Non-palpable", 0, "0%", false, false, "(Unresponsive). [Has passed out].", "The patient has no pulse. Should we call a code?", "ask_callcode.ogg");
	StateItemList[18]=new StateItem("EpinephrineSQ_3mg_OrLess", "Wait_For_Input", 125, "140/90", 30, "85%", false, false, "(Gasping). [Lungs: stridor].", null, null);	///5.11.11 - removed
	StateItemList[19]=new StateItem("Epinephrine_IV_MoreThan_pt5mg", "Wait_For_Input", 100, "190/100", 16, "100%", false, false, "My breathing is much better but now I have quite a bit of tightness in my chest and numbness in my left arm.", null, "SC3_Epi_IV_pt5mg.ogg");	
	StateItemList[20]=new StateItem("Epinephrine_IV_pt2mg", "Wait_For_Input",  90, "135/85", 18, "99%", false, false, "My breathing is much better, but now I feel some tightness in my chest.", "Patient's laryngeal edema corrected but the dose is greater than initially recommended.", "SC3_Epi_IV_pt2mg.ogg");	//also correct
	
	StateItemList[21]=new StateItem("EpinephrineSQ_2ndTime", "Wait_For_Input", 110, "135/90", 22, "90%", false, false, "My throat is closing.", "Consider another route.", "SC3_EpiSQ_2X.ogg");	
	StateItemList[22]=new StateItem("NoEpiIV_Stage2_Oxygen_NoFlush", "Wait_For_Input", 190, "200/110", 0, "65%", false, false, "[The patient is not breathing].", "Did you remember to flush?", "remember_flush.ogg");
	StateItemList[23]=new StateItem("NoEpiIV_Stage2_NoOxygen_NoFlush", "Wait_For_Input", 190, "200/110", 0, "60%", false, false, "[The patient is not breathing].", "Did you remember to flush?", "remember_flush.ogg");
	StateItemList[24]=new StateItem("NoEpiIV_Stage3_postcallcode", "Wait_For_Input", 0, "Non-palpable", 0, "0%", false, false, "(Unresponsive). [Has passed out].", "The patient has no pulse.", "No_pulse.ogg");
	StateItemList[25]=new StateItem("Call_Code", "Wait_For_Input", null, null, null, null, false, false, null, null, null);
	StateItemList[26]=new StateItem("EPI_IV_pt1mg_Less", "Wait_For_Input", null, null, null, null, false, false, null, null, null);

	
	/*StateItemList[3]=new StateItem("Raise_Legs", "Wait_For_Input", 100, "90/50", null, null, false, false, "[Slightly Improved]", null);				//tech raised legs

	*/
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


