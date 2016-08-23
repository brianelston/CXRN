//-------HELPERS - The actual simulation states for user feedback, and progress tracking---------------------
/*
NOTES: 
	bfe 5.13.11 - scenario 5 - pediatric anaphylatic shock
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
function AlertUserBetterChoice()
{
		alert("There is a better route for pediatric patients.");
}
function AlertUserCountdownStarted()
{
	alert("The patient has regressed beyond this medication being effective by this method of administration.");
}
function IfHaveStartedCountdown()
{	//4.20.11 - ....prevent from changing stats that are counting down
	if(StateItemList[StateNameListEnum.No_Epi_Stage1].StateVisited == true)
	{
		return true;
	}
	
	return false;
}
function PerformCorrectSolution(LocalMachine)
{
	AppendtoActionDisplay("CORRECT. IV fluid and Epinephrine. Patient feels a lot better. [CORRECT].");
	LocalMachine.CurrentState=StateNameListEnum.EPI_and_IVFluid;
	SetPatientStatsFromState(LocalMachine);
				
	//show complettion
	BUTTONAdvanceProgressMeter();
	StopAllTimerActivity();	//stop any countdowns
				
	PlayCorrectSfx();
	SetPatientResponseColorRed();
				
	alert("CORRECT. IV fluid and Epinephrine. \n\nCorrect completion of scenario.");
	
	InterpretShowLearningPoints();	//show the learning points
}
function PerformSolumedrolState(LocalMachine, deliverymethod)
{
	AppendtoActionDisplay("Solumedrol administered "+ deliverymethod +". Correct dose 2 mg/kg. No change in vitals.");	
	PlayDingSfx();
	alert("Solumedrol can prevent a delayed reaction, please select a medication that will be effective immediately.");
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
	
	switch(LASTIVMedAdministered)
	{
		case null:
		
		return;
		break;
		case StateNameListEnum.Solumedrol:
				PerformSolumedrolState(LocalMachine, "via IV flush");
		break;
		case StateNameListEnum.Atropine:		
				PerformAtropineState(LocalMachine);
		break;
		case StateNameListEnum.EPI_toomuch:			
				AppendtoActionDisplay("Epi IV administered. Change in vitals. This exceeds the recommended dose for a patient of this weight.");	
				SetEpiTooMuch();
		break;
		case StateNameListEnum.EPI_SQ:		
				StateItemList[StateNameListEnum.EPI_SQ].StateVisited = true;				
				EvaluateIVFluidandEpinephrine(Machine);	
		break;
		case StateNameListEnum.EPI_IV:		
				StateItemList[StateNameListEnum.EPI_IV].StateVisited = true;				
				EvaluateIVFluidandEpinephrine(Machine);	
		break;
	}
	
	LASTIVMedAdministered = null;	//void it out
}
function SetEpiTooMuch()
{
	//AlertUserIncorrectDosage();
	
	//AppendtoActionDisplay("Epi IV administered. Incorrect dose. Change in vitals.");
	Machine.CurrentState=StateNameListEnum.EPI_toomuch;						//set this state to current
	PlayDingSfx();
	SetStatsAndFlagsAfterMedication(Machine);
    
    StartShowReportTimer(5000); //bfe 8.21.12 - new
}
function InterpretAdministerMedication(LocalMachine)
{
	//store out in case is null
	StoreLASTStats(LocalMachine);
	SetTechResponse("");	//likely has become invalid to current situation
	//StartTimerIfNoAction();

	//with units we have a default.....probably dont want with medication
	//then set variables to store this out and then respond to
	var med=document.getElementById("SelectMedication");
	var meditem=med.options[med.selectedIndex];

	var meddose=document.getElementById("AmountMedication");
	
	var doseunit;
	doseunit=GetDosageUnit();
	
	//make sure the dose is a good number....
	//note....if UW, then dont need a dose or unit
	var meddosenumber = meddose.value;
	if(isNaN(meddosenumber))	//check if is a number
	{
		alert("This is NOT a valid number for dose.");
		return;
	}
	
	if(meditem.text != "Epi pen®/Epi pen JR®")
	{
		if(doseunit == null)	//check 
		{
			alert("Please select a dosage unit.");
			return;
		}
	}


	if(med.selectedIndex == 0)
	{
		//also check for a dose and unit
		alert("Please select a medication.");
		return;
	}
	else
	{
		if(meditem.text == "Epi pen®/Epi pen JR®")
		{
			AppendtoActionDisplay("Medication administered: " + meditem.text + ".");
		}
		else
		{
			//medication response and advance state machine to that medication
			AppendtoActionDisplay("Medication administered: " + meditem.text +", amount = " + meddose.value + " " + doseunit.value + ".");
		}
	}
	
	switch(meditem.text)	//these are the displayed text in the html page
	{	
		case "Epinephrine IM":
		case "Epi pen®/Epi pen JR®":
			if(bUWUsage == false)
			{
				AlertUserBetterChoice();
				return;
                
              //  if(meddosenumber == 0.15 && doseunit.value == "mg (milligrams)")
				//{   //bfe added 8.21.12
               // }
                
			}
			else
			{	//inside the UW, correct answer is Epi pen JR. 
				//first show a modal message box
				DisplayEpiPenQuestion();
				return;
			}
		break;
		case "Epinephrine IV"://was SQ, just keep using the same flag
		//case "Epinephrine SQ":
			if(bUWUsage == true)
			{
				AlertUserBetterChoice();
				return;
			}
			else
			{	//outside the UW, correct answer is .08 mg SQ 
			
				if(meddosenumber > 0.08 && doseunit.value == "mg (milligrams)")
				{
					//SetEpiTooMuch();
					if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
					{
						AppendtoActionDisplay("Epi IV administered. Incorrect dose. Change in vitals.");
						SetEpiTooMuch();
						return;
					}
					//wait till flush to do
					LASTIVMedAdministered=StateNameListEnum.EPI_toomuch;	//need to flush to admin, store out drug in IV
					AppendtoActionDisplay("Epiniephrine in IV.");
					return;
				}
				else if(meddosenumber != 0.08 || doseunit.value != "mg (milligrams)")
				{	
					AlertUserIncorrectDosage();
					return;
				}
							
				if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
				{
					StateItemList[StateNameListEnum.EPI_IV].StateVisited = true;				
					EvaluateIVFluidandEpinephrine(Machine);		
					return;
				}
				//wait till flush to do
				LASTIVMedAdministered=StateNameListEnum.EPI_IV;	//need to flush to admin, store out drug in IV
				AppendtoActionDisplay("Epiniephrine in IV.");					
				return;
			}
		break;
		case "Epinephrine SQ":
			//AlertUserBetterChoice();
			if(bUWUsage == true)
			{
				AlertUserBetterChoice();
				return;
			}
			else
			{	//outside the UW, correct answer is .08 mg SQ 
			
				if(meddosenumber > 0.08 && doseunit.value == "mg (milligrams)")
				{
					AppendtoActionDisplay("Epi SQ administered. Incorrect dose. Change in vitals.");
					SetEpiTooMuch();
                    //InterpretShowLearningPoints();	//show the learning points
					return;
				}
				else if(meddosenumber != 0.08 || doseunit.value != "mg (milligrams)")
				{	
					AlertUserIncorrectDosage();
					return;
				}
				
				StateItemList[StateNameListEnum.EPI_SQ].StateVisited = true;				//artificially set visited flag
				EvaluateIVFluidandEpinephrine(Machine);									//then calculate a final state...
				return;
			}
		break;
		case "Benadryl":
			//pediatric - dose 1-2mg/kg
			if(meddosenumber < 8 || meddosenumber > 16 || doseunit.value != "mg (milligrams)")
			{	
				AlertUserIncorrectDosage();
				return;
			}	
			if(IfHaveStartedCountdown())
			{
				AlertUserCountdownStarted();
				return;
			}
			AppendtoActionDisplay("Benedryl administered. Correct dose of 1-2mg/kg. Change in vitals.");
			PlayDingSfx();
			LocalMachine.CurrentState=StateNameListEnum.Benedryl;			
			
		break;
		case "Atropine":
			//if dose is .16 is correct
			//if(((meddosenumber !=1 || doseunit.value != "mg (milligrams)") && (meddosenumber !=10 || doseunit.value != "mL (milliliters)")))
			if((meddosenumber < .1 || meddosenumber > .2 || doseunit.value != "mg (milligrams)") && (meddosenumber < 1 || meddosenumber > 2 || doseunit.value != "mL (milliliters)"))
			{	
				AlertUserIncorrectDosage();
				return;
			}
			if(IfHaveStartedCountdown())
			{
				AlertUserCountdownStarted();
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
			case "Solumedrol Steroid":	//dose of 40 mg IV correct for adult, 2 mg/kg for pediatric
			//this scenario assumes the IV is already connected
			if(meddosenumber != 16 || doseunit.value != "mg (milligrams)")
			{	
				AlertUserIncorrectDosage();
				return;
			}
			if(IfHaveStartedCountdown())
			{
				AlertUserCountdownStarted();
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
			AppendtoActionDisplay("Albutrol administered. Correct dose. Change in vitals.");
			PlayDingSfx();
			LocalMachine.CurrentState=StateNameListEnum.Albutrol;
		
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
	//StartTimerIfNoAction();
	
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
			
			LocalMachine.CurrentState=StateNameListEnum.RaiseLegs;
			SetPatientStatsFromState(LocalMachine);
			AlertUserNoVitalChange();
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
			
				//4.19.11 - only do after user passes out....check if we have entered that state
			if(StateItemList[StateNameListEnum.No_Epi_Stage3].StateVisited == true)
			{	
				WritetoActionLogIfFastTimer("DEBUG: call code after no epinephrine for 3:15 - show report.");
				InterpretShowLearningPoints();	//show the learning points
			}
			
			return;
		break;	
		case "Give Oxygen":		//OXYGEN
									
			//we need a dialog manager to queue up dialog so it doesnt overlap if we have more than 1!
			//AddDialogItem("audio/ask_oxygen.wav", 0.7);
			AddDialogItem("audio/ask_total_oxygen.ogg", 0.7);
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
		AlertUserIncorrectDosage();
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
	if(buttonselected == 0 || buttonselected == 1 )	//250 ml - no good
	{
		AlertUserIncorrectDosage();
		return;
	}
	// 500 ml and 1 L bad, 250 mL good (3)

	//need to evaluate based on IV fluid and EPI
	StateItemList[StateNameListEnum.IVFluid].StateVisited = true;				//artificially set visited flag
	EvaluateIVFluidandEpinephrine(Machine);									//then calculate a final state...
}
function EvaluateIVFluidandEpinephrine(LocalMachine)
{
	//IV fluid with epi pen is correct
	//uses precedence to parse...EPI_IV
	 
	if((StateItemList[StateNameListEnum.EPI_PEN_JR].StateVisited == true || StateItemList[StateNameListEnum.EPI_SQ].StateVisited == true || StateItemList[StateNameListEnum.EPI_IV].StateVisited == true) && StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
	{
		PerformCorrectSolution(LocalMachine);
	}	//then epi and no IV
	else if(StateItemList[StateNameListEnum.EPI_PEN_JR].StateVisited == true)
	{		
		LocalMachine.CurrentState=StateNameListEnum.EPI_NoIVFluid;					//epi, no IV
		SetPatientStatsFromState(LocalMachine);							//set the stats display - they change for this
				
		AppendtoActionDisplay("Epi Pen Jr® administered. Correct dose. Change in vitals.");
		PlayDingSfx();
	}	
	else if(StateItemList[StateNameListEnum.EPI_SQ].StateVisited == true)
	{		
		LocalMachine.CurrentState=StateNameListEnum.EPI_NoIVFluid;					//epi, no IV
		SetPatientStatsFromState(LocalMachine);							//set the stats display - they change for this
				
		//AppendtoActionDisplay("Epinephrine SQ administered. Correct dose. Change in vitals.");
		AppendtoActionDisplay("Epinephrine SQ administered. Correct dose. Change in vitals.");
		PlayDingSfx();
	}
	else if(StateItemList[StateNameListEnum.EPI_IV].StateVisited == true)
	{		
		LocalMachine.CurrentState=StateNameListEnum.EPI_NoIVFluid;					//epi, no IV
		SetPatientStatsFromState(LocalMachine);							//set the stats display - they change for this
				
		//AppendtoActionDisplay("Epinephrine SQ administered. Correct dose. Change in vitals.");
		AppendtoActionDisplay("Epinephrine IV administered. Correct dose. Change in vitals.");
		PlayDingSfx();
	}
	else if(StateItemList[StateNameListEnum.IVFluid].StateVisited == true)
	{
		//then IV fluid alone
		AppendtoActionDisplay("IV fluid started. Change in vitals.");
		PlayDingSfx();
		
		if(StateItemList[StateNameListEnum.Oxygen_10L_FM].StateVisited == true)
		{	LocalMachine.CurrentState=StateNameListEnum.IVFluid_AndOxygen;		
		}
		else //no oxygen
		{	LocalMachine.CurrentState=StateNameListEnum.IVFluid_NoOxygen;	
		}
		
		SetPatientStatsFromState(LocalMachine);
		alert("Change in vitals.");
	}
}
function InterpretEpiPenChoice(EpiChoice)
{
	var EpiPen = EpiChoice;
	if(EpiPen == true)
	{	//incorrect...too much
		
		AppendtoActionDisplay("Epi Pen® administered. Change in vitals. This exceeds the recommended dose for a patient of this weight.");
		SetEpiTooMuch();
		
		BUTTONAdvanceProgressMeter();
		StopAllTimerActivity();	//stop any countdowns
				
		SetPatientResponseColorRed();
	
		alert("Change in vitals. \n\nThis exceeds the recommended dose for a patient of this weight.");
		StartShowReportTimer(5000);
		return;
	}
	else
	{
		StateItemList[StateNameListEnum.EPI_PEN_JR].StateVisited = true;				//artificially set visited flag
		EvaluateIVFluidandEpinephrine(Machine);									//then calculate a final state...
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
{	//show shortened scenario help
	$("#LearningPoints").overlay({mask: '#000', load: true, fixed: false}).load();
}
function DisplayEpiPenQuestion()
{	//show epi pen

	AddDialogItem("audio/epipen_jr.ogg", 0.7);
	$("#EpiPenQuestion").overlay({mask: '#000', closeOnClick: false, closeOnEsc: false, load: true}).load();
}
