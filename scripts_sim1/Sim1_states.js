//-------HELPERS - The actual simulation states for user feedback, and progress tracking---------------------
/*
NOTES: 
	medication class	badministed
						dosage
*/

//--------State machine tracking----------------
//var MaxStates = 3;	
//progress states tell the user what their next action should be
//var StateProgress=["Introduction: Please watch movie then start.", "Waiting for Input.", "Completion."];

var StateItemList;
//var ObjectiveItemList;

//use this enumeration to reference the correct statelist items, it will be a lot easier in the future
var StateNameListEnum = {"Hypotension_Introduction" : 0, 
"Wait_For_Vital_Signs" : 1,
"Wait_For_Input" : 2,
"Raise_Legs" : 3,
"IV_Not_Allowed" : 4,
"Call_Code" : 5,
"Benedryl" : 6,
"Atropine" : 7,
"EpiniphrineIM_0_3" : 8,
"EpiniphrineIM_0_5_orMore" : 9,
"EpiniphrineIM_0_1_to_0_3" : 10,
"Intro_BP_Sat_Drop1" : 11,
"Intro_BP_Sat_Drop2" : 12,
"Intro_BP_Sat_Drop3" : 13,
"Intro_BP_Sat_Drop4" : 14,
"No_Epipehphrine_BPHRchange" : 15,
"Oxygen_10L_FM" : 16,
"Need_help" : 17};

///---------------------------------------------------------------------------------------------------------
function CreateSim1States()
{	/*	Sim goals:	1) give IM Epinephrine
					2) check amount and dose of Epinephrine
			
			Avoid:
					1) No benedryl
					2) No subcutaneous Epinephrine
					
			States: 1) show intro
					2) allow user to enter medication or tech action if
						A) benedryl, inform user patient not well
						B) Epinephrine, if correct dose (.3 mg IM), then done
							i) If incorrect dose && < .3 mg IM epi, then continue unless
							ii) if incorrect dose && > .3 mg IM epi, then failure

	
	TODO:			Timers 3 needed in sequence 
					1) till user asks for pulse and vitals, after 30 secs tech asks
					2) countdown after first vitals displayed, 30 secs, sat & BP drop
					3) after that (2 done) wait 1 minute and if no epiniphrine (or < .1 mg) BP down, HR up
	*/

	//create global list for state items
	
	StateItemList=new Array(20);	//choose the appropriate number

	//if they do nothing BP drops and SAT drops
	//these names MUST directly correspond to the StateNameListEnum ENUM
		
				//	(StateName, StateNextState, StateHR, StateBP, StateRR, StateSat, StateVisited, StateObjectiveMet, StatePatientResponse, StateTechSays)
	StateItemList[0]=new StateItem("Hypotension_Introduction", "Wait_For_Vital_Signs", 120, "120/80", 16, "99%", true, false, "[Complaining] I don't feel so good. I am lightheaded, sick to my stomach, and I itch all over.", "Doctor, it looks like the patient has hives all over her body. She is sweaty, clammy, and not responding well. Oh no! The IV has fallen out. We've lost our IV!", null);		//intro movie
	StateItemList[1]=new StateItem("Wait_For_Vital_Signs", "Wait_For_Input", 120, "120/180", null, null, false, false, null, null, null);	//after the user request vitals they need to admin epiniphrine with 1 minute or vitals change
	StateItemList[2]=new StateItem("Wait_For_Input", "Wait_For_Input", 120, "120/180", null, null, false, false, null, null, null);			//wait for input after an an action like medication or tech action
	StateItemList[3]=new StateItem("Raise_Legs", "Wait_For_Input", 100, "90/50", null, null, false, false, "[Slightly Improved].", null, null);				//tech raised legs
	StateItemList[4]=new StateItem("IV_Not_Allowed", "Wait_For_Input", null, null, null, null, false, false, null, null, null);			//Cant use the IV in this scenario, its fallen out, for 1)flush IV, 2) Start IV Line 3) Start IV
	StateItemList[5]=new StateItem("Call_Code", "Wait_For_Input", null, null, null, null, false, false, null, null, null);				//call to code
	StateItemList[6]=new StateItem("Benedryl", "Wait_For_Input", 130, "70/40", 20, "92%",  false, false, "I don't feel so good.... I feel really dizzy.", "Benedryl administered. BP dropping.", "SC1_Benedryl.ogg");		//Benedryl, not good
	//StateItemList[7]=new StateItem("Atropine", "Wait_For_Input", 180, "80/40", null, null,  false, false, "I feel funny.", null, "SC1_Atropine.wav");				 //Atropine, funny/odd
	StateItemList[7]=new StateItem("Atropine", "Wait_For_Input", 180, "80/40", null, null,  false, false, "I feel funny.", null, "SC1_Atropine.ogg");				 //Atropine, funny/odd
	StateItemList[8]=new StateItem("EpiniphrineIM_0_3", "Completion", 90, "140/90", 16, "99%",  false, false, "I feel better and the itching is better. [CORRECT].", null, "SC1_EpiIM_0_3.ogg");		//Epiniphrine, correct dose
	StateItemList[9]=new StateItem("EpiniphrineIM_0_5_orMore", "Wait_For_Input", 130, "160/90", 22, "92%",  false, false, "My chest hurts. [Tightness and racing heart]. ", null, "SC1_EpiIM_0_5.ogg");		//Epiniphrine, too much
	StateItemList[10]=new StateItem("EpiniphrineIM_0_1_to_0_3", "Wait_For_Input", null, null, null, null,  false, false, null, null, null);		//Epiniphrine, too little
																	//I think HR and RR should be null here...
	StateItemList[11]=new StateItem("Intro_BP_Sat_Drop1", "Wait_For_Input", null, "110/70", null, "98", false, false, null, null, null);		//Bp & sat drops at start
	StateItemList[12]=new StateItem("Intro_BP_Sat_Drop2", "Wait_For_Input", null, "100/60", null, "97", false, false, null, null, null);		//Bp & sat drops at start
	StateItemList[13]=new StateItem("Intro_BP_Sat_Drop3", "Wait_For_Input", null, "90/50", null, "96", false, false, null, null, null);			//Bp & sat drops at start
	StateItemList[14]=new StateItem("Intro_BP_Sat_Drop4", "Wait_For_Input", null, "80/50", null, "95", false, false, null, null, null);			//Bp & sat drops at start
	StateItemList[15]=new StateItem("No_Epipehphrine_BPHRchange", "Wait_For_Input", 190, "70/40", null, "75%", false, false, "Doctor, I feel really bad.... ugh... ugh... (mumbles incoherently)", "Mam, mam..... the patient is unresponsive.", "SC1_No_Epi.ogg");	//No epinephrine for another minute after
	StateItemList[16]=new StateItem("Oxygen_10L_FM", "Wait_For_Input", null, null, 16, "99%", false, false, null, null, null);				//gave oxygen correctly
	StateItemList[17]=new StateItem("Need_help", "Wait_For_Input", null, null, null, null, false, false, null, "Do you need help?", "Need_help.ogg");				//call to code
		
	//first time through add an event listener to the movie so the simulation only starts after movie finished? may be too complex for budget, so just start state machine immediately....
	//though need to wait the time length of the movie before starting iniital countdown timers
	//might need 2 buttons 1) view movie	2) start scenario - which start timers...till then all controls locked out...
	
	
	ResetTrackingVariables();
	//CreateSim1ObjectiveItems();
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

var ObjectiveNameListEnum = {"NoBenedryl" : 0,
"EpiniphrineIM_0_3" : 1,
"NoSQEpinephrine" : 2};

function CreateSim1ObjectiveItems()
{
	ObjectiveItemList=new Array(20);	//choose the appropriate number
	
	ObjectiveItemList[0]=new ObjectiveItem("NoBenedryl", true);
	ObjectiveItemList[1]=new ObjectiveItem("EpiniphrineIM_0_3", false);
	ObjectiveItemList[2]=new ObjectiveItem("NoSQEpinephrine", true);
}
function ObjectiveItem(ObjectiveName, ObjectiveMet)
{
	/*	class ObjectiveItem
		Defines macro objectives that must be met (or avoided) to have 100% successfull completion of this task
		a list of these comprises the simulation goals
	*/
	this.ObjectiveName=ObjectiveName;	//name
	this.ObjectiveMet=ObjectiveMet;		//Is this correct for the scenario?
	
	//keep track of all medications administered

}

