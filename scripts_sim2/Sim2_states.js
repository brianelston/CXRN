//--------State machine tracking----------------
var StateItemList;

//use this enumeration to reference the correct statelist items, it will be a lot easier in the future
var StateNameListEnum = {"Introduction" : 0, 
"Wait_For_Vital_Signs" : 1,
"Wait_For_Input" : 2,
"Oxygen_10L_FM" : 3,
"Oxygen_TooLittle" : 4,
"Call_Code" : 5,
"Benedryl" : 6,
"Atropine" : 7,
"Solumedrol" : 8,
"Albutrol" : 9,
"AlbutrolAndOxygen_10L_FM" : 10,
"AlbutrolAndOxygenTooLittle" : 11,
"InitialDrop_1" : 12,
"InitialDrop_2" : 13,
"InitialDrop_3" : 14,
"InitialDrop_4" : 15,
"InitialDrop_5" : 16,
"InitialDrop_6" : 17,
"InitialDrop_7" : 18,
"InitialDrop_8" : 19,
"InitialDrop_9" : 20,
"DoNothingState" : 21,
"NoAlbutrol" : 22,
"NoOxygen" : 23,
"NoAlbutrol4Minutes" : 24};

//,"Report_State" : 5};
///---------------------------------------------------------------------------------------------------------
function CreateSim2States()
{	/*	Sim goals:	1) give proper O2
					2) check amount and dose of Epinephrine IV or SQ
					3) treat bronchospasm & largyneal edema
			
					
			States: 1) show intro
					2) allow user to enter medication or tech action if
						A) albutrol
						B) proper O2

	
	TODO:			Timers needed in sequence 
					1) till user asks for pulse and vitals, after 30 secs tech asks
					2) initial sat drop
					3) no oxygen
					4) no albutr0l
	
	*/

	//create global list for state items
	
	StateItemList=new Array(30);	//choose the appropriate number

	//should the state name also be a callback function?NOTE: MOVE VITAL STATS TO CALLBACK FUNCTION - also patient response
		
	//after movie we wait for user to request vitals, if they do another action progress to that state
	//if they do nothing BP drops and SAT drops
	//these names MUST directly correspond to the StateNameListEnum ENUM
		
				//	(StateName, StateNextState, StateHR, StateBP, StateRR, StateSat, StateVisited, StateObjectiveMet, StatePatientResponse, StateTechSays)

	StateItemList[0]=new StateItem("Introduction", "Wait_For_Vital_Signs", 120, "120/80", 24, "95%", true, false, "Doc, I feel like I'm having trouble breathing. (cough, cough, cough).", "My patient is having trouble breathing.", null);		//intro movie
	StateItemList[1]=new StateItem("Wait_For_Vital_Signs", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	//after the user request vitals they need to admin epiniphrine with 1 minute or vitals change
	StateItemList[2]=new StateItem("Wait_For_Input", "Wait_For_Input", null, null, null, null, false, false, null, null, null);			//wait for input after an an action like medication or tech action
	StateItemList[3]=new StateItem("Oxygen_10L_FM", "Wait_For_Input", 120, "130/80", 24, "92%", false, false, "I am a little better, but I still feel short of breath. [Slightly Improved; Lungs: wheezes].", null, "SC2_Oxygen_10L_FM.ogg");				//gave oxygen correctly
	StateItemList[4]=new StateItem("Oxygen_TooLittle", "Wait_For_Input", null, null, null, null, false, false, "I'm still having trouble breathing. (Slightly labored, breathless). [Lungs: wheezes, coughs].", null, "SC2_Oxygen_TooLittle.ogg");				//gave oxygen incorrectly
	StateItemList[5]=new StateItem("Call_Code", "Wait_For_Input", null, null, null, null, false, false, null, null, null);	
	StateItemList[6]=new StateItem("Benedryl", "Wait_For_Input", 120, "130/90", 30, "87%", false, false, "(Gasping). [Lungs: wheezes, coughs].", null, null);	
	//StateItemList[7]=new StateItem("Atropine", "Wait_For_Input", 180, "130/90", 30, "87%", false, false, "(Gasping). [Lungs: wheezes, coughs].", null, null);	
	StateItemList[7]=new StateItem("Atropine", "Wait_For_Input", 180, "180/100", 30, "87%", false, false, "(Gasping). [Lungs: wheezes, coughs].", null, null);	
	StateItemList[8]=new StateItem("Solumedrol", "Wait_For_Input", 120, "130/90", 30, "87%", false, false, "(Gasping). [Lungs: wheezes, coughs].", null, null);	
	StateItemList[9]=new StateItem("Albutrol", "Wait_For_Input", null, null, null, null, false, false, null, null);		//placeholder for state machine testing against oxygen - albutrol alone
	StateItemList[10]=new StateItem("AlbutrolAndOxygen_10L_FM", "Wait_For_Input", 90, "130/80", 16, "98%", false, false, "I feel so much better. [Lungs: clear]. [CORRECT].", null, "SC2_Albutrol_O2.ogg");		//CORRECT
	StateItemList[11]=new StateItem("AlbutrolAndOxygenTooLittle", "Wait_For_Input", 110, "140/90", 22, "91%", false, false, "I feel a little better but I still feel a little short of breath. [Slightly Improved; Lungs: clear].", null, "SC2_Albutrol_O2little.wav");	
	StateItemList[12]=new StateItem("InitialDrop_1", "Wait_For_Input", null, null, null, "98%", false, false, null, null, null);//bfe 4.25.11 - not using drop 1-4 anymore
	StateItemList[13]=new StateItem("InitialDrop_2", "Wait_For_Input", null, null, null, "97%", false, false, null, null, null);
	StateItemList[14]=new StateItem("InitialDrop_3", "Wait_For_Input", null, null, null, "96%", false, false, null, null, null);
	StateItemList[15]=new StateItem("InitialDrop_4", "Wait_For_Input", null, null, null, "95%", false, false, null, null, null);
	StateItemList[16]=new StateItem("InitialDrop_5", "Wait_For_Input", null, "130/95", null, "94%", false, false, null, null, null);
	StateItemList[17]=new StateItem("InitialDrop_6", "Wait_For_Input", null, null, null, "93%", false, false, null, null, null);
	StateItemList[18]=new StateItem("InitialDrop_7", "Wait_For_Input", null, null, null, "92%", false, false, null, null, null);
	StateItemList[19]=new StateItem("InitialDrop_8", "Wait_For_Input", null, null, null, "91%", false, false, null, null, null);
	StateItemList[20]=new StateItem("InitialDrop_9", "Wait_For_Input", null, null, null, "90%", false, false, null, null, null);
	StateItemList[21]=new StateItem("DoNothingState", "Wait_For_Input", 130, "150/90", null, null, false, false, null, null, null);
	StateItemList[22]=new StateItem("NoAlbutrol", "Wait_For_Input", 130, "150/90", 30, "87%", false, false, "(Gasping). [Lungs: wheezes, coughs].", null, null);
	StateItemList[23]=new StateItem("NoOxygen", "Wait_For_Input", 130, "140/90", 26, "87%", false, false, "I can't...<i>(pause)</i> breath. (Labored breathing). [Lungs: wheezes, coughs].", null, "SC2_No_O2.ogg");
	StateItemList[24]=new StateItem("NoAlbutrol4Minutes", "Wait_For_Input", null, null, 0, "65%", false, false, "(Unresponsive). [Has passed out].", "The patient is not breathing.", "Not_breathing.ogg");
	
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


