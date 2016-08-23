//-------HELPERS - The actual simulation states for user feedback, and progress tracking---------------------
/*
NOTES: 
	bfe 4.15.11 - scenario 3 - bronchospasm and larygeal edema
*/
var OxygenNasalCannula = true;	//if not face mask then nasal

function PerformIVAction(LocalMachine)
{

}
function AlertUserRememberFlush()
{
		SetTechResponse("Did you remember to flush?");
}
function AlertUserNoVitalChange()
{
		alert("No change in vitals.");
}
function AlertUserIncorrectDosage()
{
		alert("Incorrect dose.");
}
function IfHaveStartedCountdown()
{	//4.20.11 - ....prevent from changing stats that are counting down
	if(StateItemList[StateNameListEnum.NoAtropineIvFluid].StateVisited == true)
	{
		return true;
	}
	
	return false;
}
function PerformCorrectSolution(LocalMachine)
{
	AppendtoActionDisplay("CORRECT. IV fluid and Atropine 0.6 - 1mg IV. Patient feels a lot better.");
	LocalMachine.CurrentState=StateNameListEnum.Atropine_And_IVFluid;
	SetPatientStatsFromState(LocalMachine);
				
	//show complettion
	BUTTONAdvanceProgressMeter();
	StopAllTimerActivity();	//stop any countdowns
				
	PlayCorrectSfx();
	SetPatientResponseColorRed();
				
	alert("CORRECT. IV fluid and Atropine 0.6 - 1mg IV. \n\nCorrect completion of scenario.");
	InterpretShowLearningPoints();	//show the learning points
}
function PerformSolumedrolState(LocalMachine, deliverymethod)
{
	AppendtoActionDisplay("Solumedrol administered "+ deliverymethod +". Correct dose. No change in vitals.");
	PlayDingSfx();
	alert("Solumedrol can prevent a delayed reaction, please select a medication that will be effective immediately.");
}
function PerformAtropine_1mg_OrMoreState(LocalMachine)
{		
	LocalMachine.CurrentState=StateNameListEnum.Atropine_1mg_OrMore;						//set this state to current
	SetPatientStatsFromState(LocalMachine);							//set the stats display - they change for this
				
	AppendtoActionDisplay(TotalAtropine + "mg atropine administered via IV. Change in vitals.");
	PlayDingSfx();
	//alert("Change in vitals.");
	
	
	BUTTONAdvanceProgressMeter();
	StopAllTimerActivity();	//stop any countdowns
				
	//PlayCorrectSfx();
	SetPatientResponseColorRed();
				
	alert("End of scenario, the dose exceeded the recommended initial dose.");
	InterpretShowLearningPoints();	//show the learning points
}
function PerformAtropine_pt6mg_OrLess(LocalMachine)
{		
	AppendtoActionDisplay(TotalAtropine + " mg Atropine administered. No change in vitals.");
	AlertUserNoVitalChange();
}
function PerformAtropineState(LocalMachine)
{		
	//CORRECT dose of atropine
	StateItemList[StateNameListEnum.Atropine].StateVisited = true;				//artificially set visited flag
	EvaluateIVFluidandAtropine(LocalMachine);									//then calculate a final state...
}
function InterpretFlushIV(LocalMachine)
{
	//store out in case is null
	StoreLASTStats(LocalMachine);
	SetTechResponse("");	//likely has become invalid to current situation
	//StartTimerIfNoAction();
	
	switch(LASTIVMedAdministered)
	{
		case null:
		
		return;
		break;
		case StateNameListEnum.Solumedrol:
				PerformSolumedrolState(LocalMachine, "via IV flush");
		break;
		case StateNameListEnum.Atropine_1mg_OrMore:				
				PerformAtropine_1mg_OrMoreState(LocalMachine);
		break;
		case StateNameListEnum.Atropine:		
				PerformAtropineState(LocalMachine);
		break;
		case StateNameListEnum.Atropine_pt6mg_OrLess:		
				PerformAtropine_pt6mg_OrLess(LocalMachine);
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
	
	switch(meditem.text)	//these are the displayed text in the html page
	{
	case "Epinephrine IM":
		//fall through to SQ, IV all the same...all doses incorrect,
		case "Epinephrine SQ":
		case "Epinephrine IV":
			AlertUserNoVitalChange();
		break;
		case "Benadryl":
			//if dose is 25/50 mg, else incorrect
			if(meddosenumber < 25 || meddosenumber > 50 || doseunit.value != "mg (milligrams)")
			{	
				AlertUserIncorrectDosage();
				return;
			}
			AppendtoActionDisplay("Benedryl administered. Correct dose. No change in vitals.");
			PlayDingSfx();
			return;
		break;
		case "Atropine":
			//if dose is .6-1mg
			//we want this to be cumulative
			if(doseunit.value == "mg (milligrams)")
			{
				TotalAtropine = (parseFloat(TotalAtropine) + parseFloat(meddosenumber))
				TotalAtropine = TotalAtropine.toPrecision(2);
				//alert(" TotalAtropine = " + TotalAtropine);
			}
			else
			{
				AppendtoActionDisplay("Atropine administered. No change in vitals.");
				AlertUserNoVitalChange();
				return;
			}
		
			if(TotalAtropine < 0.6)
			{	
				if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
				{
					PerformAtropine_pt6mg_OrLess(LocalMachine);	//if IV fluid flowing, dont need to flush
					return;
				}
				//wait till flush to do
				LASTIVMedAdministered=StateNameListEnum.Atropine_pt6mg_OrLess;	//need to flush to admin, store out drug in IV
				AppendtoActionDisplay("Atropine in IV.");
				return;
			}
			else if(TotalAtropine > 1.0) 
			{	
				if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
				{
					PerformAtropine_1mg_OrMoreState(LocalMachine);	//if IV fluid flowing, dont need to flush
					return;
				}
				//wait till flush to do
				LASTIVMedAdministered=StateNameListEnum.Atropine_1mg_OrMore;	//need to flush to admin, store out drug in IV
				AppendtoActionDisplay("Atropine in IV.");
				return;
			}
			else	//its the correct dosage
			{
				if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
				{
					PerformAtropineState(LocalMachine);	//if IV fluid flowing, dont need to flush
					return;
				}
				//wait till flush to do
				LASTIVMedAdministered=StateNameListEnum.Atropine;	//need to flush to admin, store out drug in IV
				AppendtoActionDisplay("Atropine in IV.");
				return;
			}
		break;
			case "Solumedrol Steroid":	//dose of 250 mg IV correct
			//this scenario assumes the IV is already connected
			if(meddosenumber != 40 || doseunit.value != "mg (milligrams)")
			{	
				AlertUserIncorrectDosage();
				return;
			}
			
		    if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
			{
				PerformSolumedrolState(LocalMachine, "via IV fluid");	//if IV fluid flowing, dont need to flush
				return;
			}
			//wait till flush to do
			LASTIVMedAdministered=StateNameListEnum.Solumedrol;	//need to flush to admin, store out drug in IV
			AppendtoActionDisplay("Solumedrol in IV.");
			return;
		break;
		
		case "Albuterol Inhaler":
			if(meddosenumber != 2 || doseunit.value != "puffs") 
			{	//may still want to set state visited variable, no only if correct dosage given per instructions
				AlertUserIncorrectDosage();
				return;
			}			
			AppendtoActionDisplay("Albutrol administered. Correct dose. No change in vitals.");
			PlayDingSfx();
			return;
		
		break;
		default:
			//alert("error in InterpretAdministerMedication");
			return;	//prevent setting the below stats
	}
	
	SetPatientStatsFromState(LocalMachine);

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
			//do we need to tell user that i helps, though does not change vitals?
			AppendtoActionDisplay("Legs raised. No change in vitals, but patient is improving.");
			LocalMachine.CurrentState=StateNameListEnum.RaiseLegs;						//we can test against when needed
			PlayDingSfx();
			//AlertUserNoVitalChange();	
			alert("No change in vitals, but patient is improving.");
		break;
				
		case "Start Second IV Line":	//IV line
			AppendtoActionDisplay("Additional IV line in.");
			alert("Additional IV line in.");
			return;
		break;	
		case "Start IV Fluids":	//IV fluids
			//We need a state so we can track if this has happened
			//NOTE: we need the buttons for 1) wide open 2) 500 ml 3) 250 ml - though dose does not affect this simulation - doing it does
			AddDialogItem("audio/ask_IVfluid.ogg", 0.7);
			ShowIVFluidOverlay();
			return;
		break;	
		case "Call Code":	//CALL CODE
			AppendtoActionDisplay("Code team has been alerted and is on their way.");
			alert("Code team has been alerted and is on their way.");

			return;
		break;	
		case "Give Oxygen":		//OXYGEN
								
			//we need a dialog manager to queue up dialog so it doesnt overlap if we have more than 1!
			AddDialogItem("audio/ask_oxygen.ogg", 0.7);
			ShowOxygenOverlay();
			return;
			
		break;
		default:
			//alert("error in InterpretTechAction");
			return;
	}
//no states set

	SetPatientStatsFromState(LocalMachine);	//sets visited flag
}
//-------------------------------------------
function RespondToOxygenDelivery(amountO2)
{
	meddosenumber = amountO2;
	
	if (meddosenumber==null || meddosenumber=="" || isNaN(meddosenumber))
	{
		alert("Incorrect entry. Please enter in number of liters.");
		return;
	}
		
	if (OxygenNasalCannula || meddosenumber < 6 || meddosenumber > 10)	//nasal cannula or too little oxegen
	{
		AlertUserIncorrectDosage();;
		return;
	}
	else	//face mask
	{
		//otherwise we have the correct dose of oxygen
		
		AppendtoActionDisplay("Oxygen administered: amount = " + meddosenumber + " L" );		
		AppendtoActionDisplay("Oxygen given. Correct dosage with face mask. Change in vitals.");
		Machine.CurrentState=StateNameListEnum.Oxygen_10L_FM;					//store so we can later test for
		//once O2 is given, then RR & sat stay same (#1, 4, 5)
		
		PlayDingSfx();
		SetPatientStatsFromState(Machine);
		TurnOffSatandRRUpdate();	//once oxygen is given, we dont change sat or RR
	}
}
function InterpretIvFluid(buttonselected)
{
	if(buttonselected == 2)	//250 ml - no good
	{
		AlertUserNoVitalChange();
		return;
	}
	//only 500 ml and 1 L good, 250 mL bad (3)

	
	//need to evaluate based on IV fluid and atropine
	//Machine.CurrentState=StateNameListEnum.IVFluid;							//dont go into this state, only if iv fluid alone
	
	StateItemList[StateNameListEnum.IVFluid].StateVisited = true;				//artificially set visited flag
	EvaluateIVFluidandAtropine(Machine);									//then calculate a final state...
	//SetPatientStatsFromState(Machine);
}

function EvaluateIVFluidandAtropine(LocalMachine)
{
	//6-10L face mask is correct with albutrol
	
	/*NOTE: if NS or FM < 8L and albutrol, then different
	if albutrol and correct oxygen delivery, then done....
	states
	1) too much atropine
	2) IV fluid only
	3) atropine only
	4) atropine and IV fluid (500ml/1L) - CORRECT

	*/
	//uses precedence to parse...
	
	if(StateItemList[StateNameListEnum.Atropine].StateVisited == true && StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
	{
		PerformCorrectSolution(LocalMachine);
	}	
	else if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
	{
		//then IV fluid alone
		AppendtoActionDisplay("IV fluid started. Change in vitals.");
		PlayDingSfx();
		LocalMachine.CurrentState=StateNameListEnum.IVFluid_Only;		
		SetPatientStatsFromState(LocalMachine);
		alert("Change in vitals.");
	}
	else if(StateItemList[StateNameListEnum.Atropine].StateVisited == true)
	{
		//then atropine alone
		LocalMachine.CurrentState=StateNameListEnum.Atropine;					//set this state to current
		SetPatientStatsFromState(LocalMachine);							//set the stats display - they change for this
				
		AppendtoActionDisplay(TotalAtropine + " mg atropine administered. Change in vitals.");
		PlayDingSfx();
		alert("Change in vitals.");
	}
}

function ShowIVFluidOverlay()
{
	$("#IVFluidAmountBox").overlay({mask: '#000', closeOnClick: false, closeOnEsc: false, load: true}).load();
}
function InterpretOxygenStatus(r)
{
	OxygenNasalCannula=r;	//store it out
	
	//interpret the return from the custom message box
	$("#HowMuchOxygen").overlay({mask: '#000', closeOnClick: false, closeOnEsc: false, load: true}).load();
}
function ShowOxygenOverlay()
{
	$("#NasalorFaceMask").overlay({mask: '#000', closeOnClick: false, closeOnEsc: false, load: true}).load();
}
function InterpretShowReport()
{
	//SHOW LEARNING POINTS
	//should also disable input.....though need a better method to do so....
	$("#Overlay1").overlay({mask: '#000', load: true, fixed: false}).load();
}

function InterpretShowLearningPoints()
{
	$("#LearningPoints").overlay({mask: '#000', load: true, fixed: false}).load();
}

