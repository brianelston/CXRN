//-------HELPERS - The actual simulation states for user feedback, and progress tracking---------------------
/*
NOTES: 
	bfe 4.1.11 - scenario 2 - bronchospasm and larygeal edema
*/
var LASTIVMedAdministered=null;

function AlertUserCountdownStarted()
{
	alert("The patient has regressed beyond this medication being effective by this method of administration.");
}
function AlertUserRememberFlush()
{
		SetTechResponse("Did you remember to flush?");
}
function ResetTrackingVariables()
{	
	LASTIVMedAdministered=null;	//tracking for using flush & IV
	
}
function PerformIVAction(LocalMachine)
{

}
function AlertUserNoVitalChange()
{
		alert("No change in vitals.");
}
function AlertUserIncorrectDosage()
{
		alert("Incorrect dose.");
}
function IfHaveStartedNoAlbutrolCountdown()
{	//4.19.11 - we only allow no albutrol or oxygen here....prevent from changing stats
	if(StateItemList[StateNameListEnum.NoAlbutrol].StateVisited == true)
	{
		return true;
	}
	
	return false;
}
function InterpretFlushIV(LocalMachine)
{
	//store out in case is null
	StoreLASTStats(LocalMachine);
	SetTechResponse("");	//likely has become invalid to current situation
	
	//user clicks flush IV - required for solumedrol and IV epi
	//We should check a LASTUserState variable to track what the last user input was, 
	//to prevent timer states from confounding the flush check.....could just check a last med
	
	switch(LASTIVMedAdministered)
	{
		case null:
		
		return;
		break;
		case StateNameListEnum.Solumedrol:
		
			AppendtoActionDisplay("Solumedrol administered via IV flush. Correct dose. Change in vitals.");
			LocalMachine.CurrentState=StateNameListEnum.Solumedrol;						//set this state to current
			PlayDingSfx();
			SetStatsAndFlagsAfterMedication(LocalMachine);
			alert("Solumedrol can prevent a delayed reaction, please select a medication that will be effective immediately.");
		break;
	
	}
	
	LASTIVMedAdministered = null;	//void it out
}
function InterpretAdministerMedication(LocalMachine)
{
	//store out in case is null
	StoreLASTStats(LocalMachine);
	SetTechResponse("");	//likely has become invalid to current situation
	StartTimerIfNoAction();

	//with units we have a default.....probably dont want with medication
	//then set variables to store this out and then respond to
	var med=document.getElementById("SelectMedication");
	var meditem=med.options[med.selectedIndex];

	var meddose=document.getElementById("AmountMedication");
	
	//var doselist=document.getElementById("SelectDoseUnits");
	//var doseunit=doselist.options[doselist.selectedIndex];
	var doseunit=GetDosageUnit();
	
	//make sure the dose is a good number....
	var meddosenumber = meddose.value;
	if(isNaN(meddosenumber))	//check if is a number
	{
		alert("This is NOT a valid number for dose.");
		return;
	}
		
	if(doseunit == null)	//check if is a number
	{
		alert("Please select a dosage unit.");
		return;
	}

	if(med.selectedIndex == 0)
	{
		//also check for a dose and unit
		alert("Please select a medication.");
		return;
	}
	else
	{
		//medication response and advance state machine to that medication
		AppendtoActionDisplay("Medication administered: " + meditem.text +", amount = " + meddose.value + " " + doseunit.value + ".");
	}
	
	//4.1.11 - hard coding med names and units from html text not good, should get them and then test...
	
	switch(meditem.text)	//these are the displayed text in the html page
	{
		case "Epinephrine IM":
		//fall through to SQ, IV all the same...all doses incorrect,
		case "Epinephrine SQ":
		case "Epinephrine IV":
			alert("There is another better choice to begin with.");
			//SetTechResponse("There is another better choice to begin with.");
		break;
		case "Benadryl":
			//if dose is 25/50 mg, else incorrect
			if(meddosenumber < 25 || meddosenumber > 50 || doseunit.value != "mg (milligrams)")
			{	
				AlertUserIncorrectDosage();
				return;
			}
			if(IfHaveStartedNoAlbutrolCountdown())
			{	AlertUserCountdownStarted();
				return;
			}
			
			//what to do with incorrect dose? do we set the state to benedryl or not? its still bad
			AppendtoActionDisplay("Benedryl administered. Correct dose. Change in vitals.");
			LocalMachine.CurrentState=StateNameListEnum.Benedryl;						//set this state to current
			PlayDingSfx();
			alert("Benadryl thickens secretions and can worsen shortness of breath.");
			
		break;
		case "Atropine":
			//if dose is 1 mg or 10 ml, else incorrect
			if(((meddosenumber !=1 || doseunit.value != "mg (milligrams)") && (meddosenumber !=10 || doseunit.value != "mL (milliliters)")))
			{	
				AlertUserIncorrectDosage();
				return;
			}
			if(IfHaveStartedNoAlbutrolCountdown())
			{	AlertUserCountdownStarted();
				return;
			}
			//what to do with incorrect dose? do we set the state to benedryl or not? its still bad
			AppendtoActionDisplay("Atropine administered. Correct dose. Change in vitals.");
			LocalMachine.CurrentState=StateNameListEnum.Atropine;						//set this state to current
			PlayDingSfx();
		
		break;
			case "Solumedrol Steroid":	//dose of 250 mg IV correct
			//this scenario assumes the IV is already connected
			if(meddosenumber != 40 || doseunit.value != "mg (milligrams)" )
			{	
				AlertUserIncorrectDosage();
				return;
			}
			if(IfHaveStartedNoAlbutrolCountdown())
			{	AlertUserCountdownStarted();
				return;
			}
			
			//probably want to wait till flush to do
			LASTIVMedAdministered=StateNameListEnum.Solumedrol;	//need to flush to admin, store out drug in IV
			AppendtoActionDisplay("Solumedrol in IV.");
			//AlertUserRememberFlush();
		
		break;
		
		case "Albuterol Inhaler":
			if(meddosenumber != 2 || doseunit.value != "puffs") 
			{	//may still want to set state visited variable, no only if correct dosage given per instructions
				AlertUserIncorrectDosage();
				return;
			}
			//if albutrol and correct oxygen, were done
			//first set the bvisited flag for the next tests...
			
			StateItemList[StateNameListEnum.Albutrol].StateVisited = true;				//artificially set visited flag
			EvaluateOxygenAndAlbutrol(LocalMachine);
			return;
		
		break;
		default:
			//alert("error in InterpretAdministerMedication");
			return;	//prevent setting the below stats
	}
	
	SetPatientStatsFromState(LocalMachine);

}
function EvaluateOxygenAndAlbutrol(LocalMachine)
{
	//6-10L face mask is correct with albutrol
	
	/*NOTE: if NS or FM < 8L and albutrol, then different
	if albutrol and correct oxygen delivery, then done....
	states
	1) albutrol alone
	2) 02 correct, but alone
	3) o2 wrong dose, but alone
	4) albutrol and too little o2 - same as (1)
	5) albutol and correct o2 - CORRECT

	*/
	//call to interpret from both oxygen and albutrol...so that way they can communicate; i.e. doesnt matter which is last in a correct solution
	//start from best down, with correct albutrol and oxygen....
	if(StateItemList[StateNameListEnum.Albutrol].StateVisited == true && StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited == true)
	{
		AppendtoActionDisplay("CORRECT. Albutrol and Oxygen 6-10L FM. Patient feels so much better. [Lungs: clear]. [CORRECT]");
		LocalMachine.CurrentState=StateNameListEnum.AlbutrolAndOxygen_10L_FM;				//is current
		SetPatientStatsFromState(LocalMachine);
				
		//show complettion
		BUTTONAdvanceProgressMeter();
		StopAllTimerActivity();	//stop any countdowns
				
		PlayCorrectSfx();
		SetPatientResponseColorRed();
				
		alert("CORRECT. Albutrol and Oxygen 6-10L FM. \n\nCorrect completion of scenario.");
		InterpretShowLearningPoints();	//show the learning points
	}	
	else if(StateItemList[StateNameListEnum.Albutrol].StateVisited == true)// && StateItemList[StateNameListEnum.Oxygen_TooLittle].StateVisited == true)
	{
		//then albutrol and no or too little oxygen or no oxygen
		AppendtoActionDisplay("Albutrol administered. Change in vitals.");
		LocalMachine.CurrentState=StateNameListEnum.AlbutrolAndOxygenTooLittle;						//set this state to current
		PlayDingSfx();
		SetPatientStatsFromState(LocalMachine);
		alert("Change in vitals.");
		
		AdvanceToAlbutrolorOxygenTimer();
	}
	else if(StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited == true)
	{
		//then oxygen alone
		LocalMachine.CurrentState=StateNameListEnum.Oxygen_10L_FM;						//set this state to current
		SetPatientStatsFromState(LocalMachine);							//set the stats display - they change for this
				
		AppendtoActionDisplay("Oxygen given. Correct dosage with face mask. Change in vitals.");
		PlayDingSfx();
		alert("Change in vitals.");
		//if oxygen alone start o2 timer
		
		AdvanceToAlbutrolorOxygenTimer();	//note only works for correct dosage O2
	}
	else if(StateItemList[StateNameListEnum.Oxygen_TooLittle].StateVisited == true)
	{
		//then oxygen alone
		LocalMachine.CurrentState=StateNameListEnum.Oxygen_TooLittle;						//set this state to current
	
		SetPatientStatsFromState(LocalMachine);							//set the stats display - they change for this
		AlertUserIncorrectDosage();
		//if oxygen alone start o2 timer
	}
	/*else if(StateItemList[StateNameListEnum.Albutrol].StateVisited == true)
	{
		//if albutrol alone start o2 timer
		LocalMachine.CurrentState=StateNameListEnum.Albutrol;						//set this state to current
		SetPatientStatsFromState(LocalMachine);							//set the stats display - they change for this
		AppendtoActionDisplay("Albutrol administered. Correct dose. No change in vitals.");
		AlertUserNoVitalChange();
	}*/
	
}
//-----------------------------------
function InterpretTechAction(LocalMachine)
{
	StoreLASTStats(LocalMachine);
	SetTechResponse("");
	StartTimerIfNoAction();
	
	var techlist=document.getElementById("SelectTechAction");
	var techaction=techlist.options[techlist.selectedIndex];

	if(techlist.selectedIndex == 0)
	{
		alert("Please select a action.");
	}
	else
	{
		AppendtoActionDisplay("Action = " + techaction.text + ".");
	}
	
	//set what the new state should be
	//store the global progress 
	switch(techaction.text)	//these are the displayed text in the html page
	{
		case "Raise Legs":	//RAISE LEGS
			//nochange in vitals
			AlertUserNoVitalChange();
		break;
				
		case "Start Second IV Line":	//IV line
			AppendtoActionDisplay("Additional IV line in.");
			alert("Additional IV line in.");
		
		break;	
		case "Start IV Fluids":	//IV fluids
			//no change
			
			AppendtoActionDisplay("IV fluid started. No change in vitals.");
			alert("IV fluid started. No change in vitals.");	
			//NOTE: we need the buttons for 1) wide open 2) 500 ml 3) 250 ml - though it does not affect this simulation
			
		break;	
		case "Call Code":	//CALL CODE
			//dont set the state, keep the countdown if its going
			//LocalMachine.CurrentState=StateNameListEnum.Call_Code;						//set this state to current
			AppendtoActionDisplay("Code team has been alerted and is on their way.");
			alert("Code team has been alerted and is on their way.");

			//4.19.11 - only do after user passes out....check if we have entered that state
			if(StateItemList[StateNameListEnum.NoAlbutrol4Minutes].StateVisited == true)
			{	
				WritetoActionLogIfFastTimer("DEBUG: call code after no albutrol for 4 minutes - show report.");
				InterpretShowLearningPoints();	//show the learning points
			}
		break;	
		case "Give Oxygen":		//OXYGEN
								
			//$.alerts.okButton = "Nasal cannula";
			//$.alerts.cancelButton = "Face mask";
			
			//we need a dialog manager to queue up dialog so it doesnt overlap if we have more than 1!
			AddDialogItem("audio/ask_oxygen.ogg", 0.7);
			ShowOxygenOverlay();
			
		break;
		default:
			//alert("error in InterpretTechAction");
			return;
	}
	
	try
	{
		StateItemList[LocalMachine.CurrentState].StateVisited = true;				//set visited flag
	}
	catch(err)
	{
	}
}
//-------------------------------------------
function EvaluateTooLittleOxygenOrAlbutrol()
{
	//NOTE: if NS or FM < 6L and albutrol, then different - goto state Oxygen_WrongDose
	StateItemList[StateNameListEnum.Oxygen_TooLittle].StateVisited = true;				//artificially set visited flag
	EvaluateOxygenAndAlbutrol(Machine); //let it do the tracking
}
//-------------------------------------------
function ShowWrongDoseOxygen()
{
	//only occurs if too much oxygen
	AlertUserIncorrectDosage();
}
//-------------------------------------------

var OxygenNasalCannula = true;	//if not face mask then nasal

function RespondToOxygenDelivery(amountO2)
{
	meddosenumber = amountO2;
	
	if (meddosenumber==null || meddosenumber=="" || isNaN(meddosenumber))
	{
		alert("Incorrect entry. Please enter in number of liters.");
		return;
	}
		
	if (OxygenNasalCannula || meddosenumber < 6)	//nasal cannula or too little oxegen
	{
		EvaluateTooLittleOxygenOrAlbutrol();
		return;
	}
	else	//face mask
	{
		//NOTE: if NS or FM < 6L and albutrol, then different
		if(meddosenumber > 10)
		{	//may still want to set state visited variable, no only if correct dosage given per instructions
			
			ShowWrongDoseOxygen();
			return;
		}
		//otherwise we have the correct dose of oxygen
		
		AppendtoActionDisplay("Oxygen administered: amount = " + meddosenumber + " L" );
				
		StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited = true;				//artificially set visited flag
		EvaluateOxygenAndAlbutrol(Machine);
	}

}

function InterpretOxygenStatus(r)
{
	OxygenNasalCannula=r;	//store it out
	
	$("#HowMuchOxygen").overlay({mask: '#000', closeOnClick: false, closeOnEsc: false, load: true}).load();
}
function ShowOxygenOverlay()
{
	$("#NasalorFaceMask").overlay({mask: '#000', closeOnClick: false, closeOnEsc: false, load: true}).load();
	
}
function InterpretShowLearningPoints()
{
	$("#LearningPoints").overlay({mask: '#000', load: true, fixed: false}).load();
}
function InterpretShowReport()
{
	//should also disable input.....
	$("#Overlay1").overlay({mask: '#000', load: true, fixed: false}).load();
	
	//SHOW LEARNING POINTS
/*	alert("Learning Points for Scenario 2: \n\n1. If you want to give oxygen, give it via an effective delivery system which is facemask.  You want to give the oxygen at a fast enough flow rate in order to clear the CO2 from the mask which is 6-10L O2/min.  If you have a nonrebreather facemask (a facemask with a bag on the end), you want to make sure the bag stays inflated during both inspiration and expiration to ensure adequate oxygen delivery.  If the bag deflates on inspiration, then you need to increase the rate of oxygen delivery (possibly to more than 10 L/min.) to ensure that the bag remains inflated the whole time.\n\n2.  Bronchospasm causes expiratory wheezing on clinical exam because the air can get in but since the distal bronchioles are constricted the air cannot get out.\n\n3.  The initial treatment for bronchospasm should be a b2 agonist inhaler such as Albuterol since it acts directly on the b2 receptors of the smooth muscles of the distal airways which are constricted.  The b2 agonist will help relax those distal airway smooth muscles and acts directly on the site of problem so it should be the first choice.  The dose is 2 puffs of Albuterol which can be repeated up to 3 times.  The effect should be pretty immediate if it's working.  If after re-dosing, there is no effect, then administer epinephrine.  The epinephrine dose depends on the blood pressure:\n\n- if the blood pressure is low give 0.3 mg (0.3 mL) of 1:1000 epinephrine IM (EpiPen) or 0.1 mg (1 mL) of the 1:10,000 epinephrine intravenously.\n\n- if the blood pressure is normal give either 0.1 mg (0.1 mL) of 1:1000 epinephrine SQ can re-dose up to 0.3 mg or 0.1 mg (1mL) of 1:10,000 epinephrine IV, or 0.3 mg (0.3 mL) of the 1:1000 epinephrine IM.\n\nYou can give epinephrine and it will help with bronchospasm, however it not the ACR recommended first choice for bronchospasm which is a beta 2 agonist to act directly on the constricted distal smooth muscles first.  In reality, if you gave epinephrine the patient probably would have gotten better and our scenario does not account for that action because the goal of the scenario is to learn to manage bronchospasm initially with a beta 2 agonist such as Albuterol.  If the patient is still not responding after redosing of the Albuterol, then you can supplement with epinephrine.");
*/
}



