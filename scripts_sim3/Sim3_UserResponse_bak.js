//-------HELPERS - The actual simulation states for user feedback, and progress tracking---------------------
/*
NOTES: 
	bfe 4.15.11 - scenario 3 - bronchospasm and larygeal edema
*/
var OxygenNasalCannula = true;	//if not face mask then nasal

function PerformIVAction(LocalMachine)
{

}
function AlertUserCountdownStarted()
{
	alert("The patient has regressed beyond this medication being effective by this method of administration.");
}
function AlertUserIncorrectMeds()
{
	alert("Incorrect medication.");
}
function AlertUserNoVitalChange()
{
		alert("No change in vitals.");
}
function AlertUserIncorrectDosage()
{
		alert("Incorrect dose.");
}
function AlertUserRememberFlush()
{
		SetTechResponse("Did you remember to flush?");
}
function IfHaveStartedCountdown()
{	//4.20.11 - ....prevent from changing stats that are counting down
	if(StateItemList[StateNameListEnum.NoEpiAny].StateVisited == true)
	{
		return true;
	}
	
	return false;
}
function PerformCorrectSolution(LocalMachine)
{
	StopAllTimerActivity();	//stop any countdowns
	AppendtoActionDisplay("CORRECT. Epinephine 0.1 mg IV with flush or IV fluid. \nPatient feels a lot better. [Lungs: clear]. [CORRECT].");
	LocalMachine.CurrentState=StateNameListEnum.Epinephrine_IV;
	SetPatientStatsFromState(LocalMachine);
				
	//show complettion
	BUTTONAdvanceProgressMeter();
				
	PlayCorrectSfx();
	SetPatientResponseColorRed();
				
	alert("CORRECT. Epinephine 0.1 mg IV with flush or IV fluid. \n\nCorrect completion of scenario.");
	InterpretShowLearningPoints();	//show the learning points
}
function PerformSolumedrolState(LocalMachine, deliverymethod)
{
	AppendtoActionDisplay("Solumedrol administered "+ deliverymethod +". Correct dose. Change in vitals.");
	LocalMachine.CurrentState=StateNameListEnum.Solumedrol;						//set this state to current
	PlayDingSfx();
	SetStatsAndFlagsAfterMedication(LocalMachine);
	alert("Solumedrol can prevent a delayed reaction, please select a medication that will be effective immediately.");
}
function PerformEpinephrine_IV_MoreThan_pt5mgState(LocalMachine)
{
//Patient's laryngeal edema corrected but the dose is greater than initially recommended
	StopAllTimerActivity();	//stop any countdowns
	LocalMachine.CurrentState=StateNameListEnum.Epinephrine_IV_MoreThan_pt5mg;			
	//AppendtoActionDisplay("Epinephrine IV administered. Change in vitals.");
	//PlayDingSfx();
	SetStatsAndFlagsAfterMedication(LocalMachine);
	
		//-------------------------------
	AppendtoActionDisplay("Epinephine 0.5 mg or more IV with flush or IV fluid. \nCompletion of scenario although the dose is greater than initially recommended.");
				
	//show complettion
	BUTTONAdvanceProgressMeter();
	PlayDingSfx();
	SetPatientResponseColorRed();
				//Completion of scenario although the dose is greater than initially recommended
	alert("Epinephine Epinephine 0.5 mg or more IV fluid. \n\nCompletion of scenario although the dose is greater than initially recommended.");
	
	//in 15 secs show report
	StartShowReportTimer(15000);
}
function PerformEpinephrine_IV_pt2mgState(LocalMachine)
{	//this is now the correct solution too...just different

	StopAllTimerActivity();	//stop any countdowns
	LocalMachine.CurrentState=StateNameListEnum.Epinephrine_IV_pt2mg;			
	//AppendtoActionDisplay("Epinephrine IV administered. Change in vitals.");
	//PlayDingSfx();
	SetStatsAndFlagsAfterMedication(LocalMachine);
	
	//-------------------------------
	AppendtoActionDisplay("Epinephine 0.2 - 0.4 mg IV with flush or IV fluid. \nCompletion of scenario although the dose is greater than initially recommended.");
				
	//show complettion
	BUTTONAdvanceProgressMeter();
	PlayDingSfx();
	SetPatientResponseColorRed();
				//Completion of scenario although the dose is greater than initially recommended
	alert("Epinephine 0.2 - 0.4 mg IV with flush or IV fluid. \n\nCompletion of scenario although the dose is greater than initially recommended.");
	
	//in 15 secs show report
	StartShowReportTimer(15000);
	//InterpretShowReport();	//show the learning points
	
}
function PerformAtropineState(LocalMachine)
{
	AppendtoActionDisplay("Atropine administered via IV. Correct dose. Change in vitals.");
	LocalMachine.CurrentState=StateNameListEnum.Atropine;						//set this state to current
	PlayDingSfx();
	SetStatsAndFlagsAfterMedication(LocalMachine);
}
function InterpretFlushIV(LocalMachine)
{
	//store out in case is null
	StoreLASTStats(LocalMachine);
	SetTechResponse("");	//likely has become invalid to current situation
	//StartTimerIfNoAction();
	
	//user clicks flush IV - required for solumedrol and IV epi
	//to prevent timer states from confounding the flush check.....could just check a last med
	
	switch(LASTIVMedAdministered)
	{
		case null:
		
		return;
		break;
		case StateNameListEnum.Solumedrol:
				if(IfHaveStartedCountdown())
				{
					AlertUserIncorrectMeds();	
					return;
				}
				PerformSolumedrolState(LocalMachine, "via IV flush");
		break;
		case StateNameListEnum.Epinephrine_IV:				//done, epi in IV and flushed
				PerformCorrectSolution(LocalMachine);
		break;
		case StateNameListEnum.Epinephrine_IV_MoreThan_pt5mg:				//done, epi in IV and flushed
				PerformEpinephrine_IV_MoreThan_pt5mgState(LocalMachine);
		break;
		case StateNameListEnum.Epinephrine_IV_pt2mg:				//done, epi in IV and flushed
				PerformEpinephrine_IV_pt2mgState(LocalMachine);
		break;
		case StateNameListEnum.Atropine:		
				if(IfHaveStartedCountdown())
				{
					AlertUserIncorrectMeds();	
					return;
				}		
				PerformAtropineState(LocalMachine);
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
//	var doseunit=doselist.options[doselist.selectedIndex];
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
			SetTechResponse("The EPI pen/IM needle is missing.");
			AppendtoActionDisplay("The EPI pen/IM needle is missing.");
			alert("The EPI pen/IM needle is missing.");	
			return;
		break;
		case "Epinephrine SQ":
		
			if((doseunit.value != "mg (milligrams)" && doseunit.value != "mL (milliliters)"))
			{	//different message box if we have started the countdown
				AlertUserIncorrectDosage();
				return;
			}
			else if(IfHaveStartedCountdown())
			{
				AlertUserCountdownStarted();	
				return;
			}
			else if(meddosenumber < 0.3)	
			{	
				//LocalMachine.CurrentState=StateNameListEnum.EpinephrineSQ_3mg_OrLess;			
				//AppendtoActionDisplay("Epinephrine SQ administered. Change in vitals.");
				//PlayDingSfx();
				AlertUserNoVitalChange();
				return;
			}
			else
			{
				
				if(StateItemList[StateNameListEnum.EpinephrineSQ].StateVisited == true)
				{	
					LocalMachine.CurrentState=StateNameListEnum.EpinephrineSQ_2ndTime;				//2x or more
					AppendtoActionDisplay("Epinephrine SQ administered. Correct dose. Change in vitals.");
					PlayDingSfx();
					SetPatientStatsFromState(LocalMachine);
					alert("Epinephrine SQ is not effective. Consider another route.");
					return;
				}
				else
				{
					//bfe 5.11.11 - if its the second time here we want to inform the user
					LocalMachine.CurrentState=StateNameListEnum.EpinephrineSQ;				
					AppendtoActionDisplay("Epinephrine SQ administered. Correct dose. Change in vitals.");
					PlayDingSfx();
				}
			}
		break;
		case "Epinephrine IV":	//.1 mg is correct, or 1  mL
			if((meddosenumber < 0.1 || doseunit.value != "mg (milligrams)" || meddosenumber > 1.0) && (meddosenumber < 1 || doseunit.value != "mL (milliliters)"  || meddosenumber > 10.0))			
			{	
				AlertUserIncorrectDosage();
				return;
			}
			else if((meddosenumber >= 0.5 || doseunit.value != "mg (milligrams)") && (meddosenumber >= 5 || doseunit.value != "mL (milliliters)"))
			{	//incorrect solution
				//needs a flush
							
				if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
				{
					PerformEpinephrine_IV_MoreThan_pt5mgState(LocalMachine);	//if IV fluid flowing, dont need to flush
					return;
				}
				//wait till flush to do
				LASTIVMedAdministered=StateNameListEnum.Epinephrine_IV_MoreThan_pt5mg;	//need to flush to admin, store out drug in IV
				AppendtoActionDisplay("Epinephrine in IV.");
				//AlertUserRememberFlush();
				return;
			}
			else if((meddosenumber > 0.1 || doseunit.value != "mg (milligrams)") && (meddosenumber > 1 || doseunit.value != "mL (milliliters)"))
			{	//correct solution
				//needs a flush
				
				if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
				{
					PerformEpinephrine_IV_pt2mgState(LocalMachine);	//if IV fluid flowing, dont need to flush
					return;
				}
				//wait till flush to do
				LASTIVMedAdministered=StateNameListEnum.Epinephrine_IV_pt2mg;	//need to flush to admin, store out drug in IV
				AppendtoActionDisplay("Epinephrine in IV.");
				//AlertUserRememberFlush();
				return;
			}
			else	//.1 mg
			{
				//need to flush to admin, if IV fluid not running
				if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
				{	//then user is done, correct
					PerformCorrectSolution(LocalMachine);
					return;
				}
				else
				{
					//else we go into wait for flush state
					//wait till flush to do
					LASTIVMedAdministered=StateNameListEnum.Epinephrine_IV;	//need to flush to admin, store out drug in IV
				
					if(IfHaveStartedCountdown())
					{
						AppendtoActionDisplay("Epiniphrine in IV.");
						StateItemList[StateNameListEnum.Epinephrine_IV_NoFlush].StateVisited = true;	//set so we know if to alert user in timer
						//AlertUserRememberFlush();
						return;	//dont update the stats - were already in countdown mode
					}
					//domnt allow the stats to change
					PlayDingSfx();
					AppendtoActionDisplay("Epiniphrine in IV. Change in vitals.");
					LocalMachine.CurrentState=StateNameListEnum.Epinephrine_IV_NoFlush;
					SetPatientStatsFromState(LocalMachine);
					
					//AlertUserRememberFlush();
					return;
				}
			}
		break;
		case "Benadryl":
			//if dose is 25/50 mg, else incorrect
			if(meddosenumber < 25 || meddosenumber > 50 || doseunit.value != "mg (milligrams)")
			{	
				AlertUserIncorrectDosage();
				return;
			}
			else if(IfHaveStartedCountdown())
			{
				AlertUserIncorrectMeds();
				return;
			}
			AppendtoActionDisplay("Benedryl administered. Correct dose. Change in vitals.");
			LocalMachine.CurrentState=StateNameListEnum.Benedryl;						//set this state to current
			PlayDingSfx();
			SetPatientStatsFromState(LocalMachine);
			alert("Benadryl thickens secretions and can worsen shortness of breath.");
			return;
			
		break;
		case "Atropine":
			//if dose is 1 mg or 10 ml, else incorrect
			if(((meddosenumber !=1 || doseunit.value != "mg (milligrams)") && (meddosenumber !=10 || doseunit.value != "mL (milliliters)")))
			{	
				AlertUserIncorrectDosage();
				return;
			}
			else if(IfHaveStartedCountdown())
			{
				AlertUserIncorrectMeds();
				return;
			}
			//atropine is also a flush or IV
			
			if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
			{
				PerformAtropineState(LocalMachine);	//if IV fluid flowing, dont need to flush
				return;
			}
			//wait till flush to do
			LASTIVMedAdministered=StateNameListEnum.Atropine;	//need to flush to admin, store out drug in IV
			AppendtoActionDisplay("Atropine in IV.");
			//AlertUserRememberFlush();
			return;
		
		break;
			case "Solumedrol Steroid":	//dose of 250 mg IV correct
			//this scenario assumes the IV is already connected
			if(meddosenumber != 40 || doseunit.value != "mg (milligrams)")
			{	
				AlertUserIncorrectDosage();
				return;
			}
			else if(IfHaveStartedCountdown())
			{
				AlertUserIncorrectMeds();
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
			//AlertUserRememberFlush();
			return;
		break;
		
		case "Albuterol Inhaler":
			if(meddosenumber != 2 || doseunit.value != "puffs") 
			{	//may still want to set state visited variable, no only if correct dosage given per instructions
				AlertUserIncorrectDosage();
				return;
			}	
			else if(IfHaveStartedCountdown())
			{
				AlertUserIncorrectMeds();
				return;
			}		
			LocalMachine.CurrentState=StateNameListEnum.Albutrol;						//set this state to current
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
			//nochange in vitals
			AlertUserNoVitalChange();
		break;
				
		case "Start Second IV Line":	//IV line
			AppendtoActionDisplay("Additional IV line in.");
			alert("Additional IV line in.");
		
		break;	
		case "Start IV Fluids":	//IV fluids
			//We need a state so we can track if this has happened
			//NOTE: we need the buttons for 1) wide open 2) 500 ml 3) 250 ml - though dose does not affect this simulation - doing it does
			
			AddDialogItem("audio/ask_IVfluid.ogg", 0.7);
			ShowIVFluidOverlay();
			
		break;	
		case "Call Code":	//CALL CODE
			AppendtoActionDisplay("Code team has been alerted and is on their way.");
			StateItemList[StateNameListEnum.Call_Code].StateVisited = true;
			alert("Code team has been alerted and is on their way.");

			//4.19.11 - only do after user passes out....check if we have entered that state
			if(StateItemList[StateNameListEnum.NoEpiIV_Stage3].StateVisited == true)
			{	
				StopAllTimerActivity();	//since were going to start a new timer
				WritetoActionLogIfFastTimer("DEBUG: call code after no albutrol for 4 minutes - show report.");
				InterpretShowLearningPoints();	//show the learning points
			}
		break;	
		case "Give Oxygen":		//OXYGEN
			
			//we need a dialog manager to queue up dialog so it doesnt overlap if we have more than 1!
			AddDialogItem("audio/ask_oxygen.ogg", 0.7);
			ShowOxygenOverlay();
			
		break;
		default:
			//alert("error in InterpretTechAction");
			return;
	}
//no states set
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
		AppendtoActionDisplay("Oxygen given. Correct dosage with face mask. No change in vitals.");
		Machine.CurrentState=StateNameListEnum.Oxygen_10L_FM;					//store so we can later test for
		PlayDingSfx();
		SetPatientStatsFromState(Machine);
	}
}
function InterpretIvFluid(buttonselected)
{
	//doesnt matter how much they give, just if they did
	AppendtoActionDisplay("IV fluid started. No change in vitals.");
	Machine.CurrentState=StateNameListEnum.IVFluid;					//store so we can later test for if IV fluid is started
	PlayDingSfx();
	SetPatientStatsFromState(Machine);
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


