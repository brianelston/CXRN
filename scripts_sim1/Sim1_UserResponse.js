//-------HELPERS - The actual simulation states for user feedback, and progress tracking---------------------
/*
NOTES: 
	medication class	badministed
						dosage
*/
function PerformIVAction(LocalMachine)
{

}
function AlertUserNoVitalChange()
{
		//alert("Incorrect dose.");
		alert("No change in vitals.");
}
function AlertUserIncorrectDosage()
{
		alert("Incorrect dose.");
}
function InterpretFlushIV(LocalMachine)
{
	AppendtoActionDisplay("IV has fallen out and is not available. Unsuccessfull attempt with IV.");
	alert("IV has fallen out and is not available. Unsuccessfull attempt to flush.");

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
		alert("Please select a medication");
		return;
	}
	else
	{
		//medication response and advance state machine to that medication
		AppendtoActionDisplay("Medication administered: " + meditem.text +", amount = " + meddose.value + " " + doseunit.value + ".");
	}
	
	//3.21.11 - hard coding med names and units from html text not good, should get them and then test...
	//though the system is (too) interwoven already, but only way to get anything done when we only have a few days on the budget ;-<
	
	switch(meditem.text)	//these are the displayed text in the html page
	{
		case "Epinephrine IM":
			//if dose is 3 mg. 3ml - correct
			
			if(doseunit.value == "mg (milligrams)" || doseunit.value == "mL (milliliters)")
			{
				TotalEpiIM = (parseFloat(TotalEpiIM) + parseFloat(meddosenumber))
				TotalEpiIM = TotalEpiIM.toPrecision(2);
				//alert(" TotalEpiIM = " + TotalEpiIM);
			}
			else
			{	//AppendtoActionDisplay(meditem.text + " administered. No change in vitals.");
				AlertUserIncorrectDosage();
				return;
			}
			
			if(TotalEpiIM >= 0.1)	//then we cancel the no epi timer
			{
				StopAllTimerActivity();
			}
			
			//if(TotalEpiIM >= 0.1 && TotalEpiIM < 0.3)
			if(TotalEpiIM < 0.3)
			{
					LocalMachine.CurrentState=StateNameListEnum.EpiniphrineIM_0_1_to_0_3;		//is current
					SetStatsAndFlagsAfterMedication(LocalMachine);
					AppendtoActionDisplay(meditem.text + " administered. " + TotalEpiIM + " mg Epinephrine IM. No change in vitals.");
					AlertUserNoVitalChange();
					return;
			}
			else if(TotalEpiIM > 0.29 && TotalEpiIM < 0.31)	//both mg and ml are valid
			//else if(TotalEpiIM == 0.3 )	//both mg and ml are valid
			{	//requires a range for cumulative, as the javascript math functions have a lot of roundoff error
				//once the do this and were done
			
				AppendtoActionDisplay("Correct dose 0.3 mg Epinephrine IM given. Patient feels better and itching is better. [CORRECT]");
				LocalMachine.CurrentState=StateNameListEnum.EpiniphrineIM_0_3;				//is current
				SetStatsAndFlagsAfterMedication(LocalMachine);
				//TODO: STOP SIMULATOR FROM TAKING INPUT THAT CHANGES STATE - set progress meter to completion, waiting for restart
				
				//show complettion
				BUTTONAdvanceProgressMeter();
				StopAllTimerActivity();
				
				PlayCorrectSfx();
				SetPatientResponseColorRed();
				
				alert("CORRECT dose 0.3 mg Epinephrine IM. Successfull completion of scenario.");
				InterpretShowLearningPoints();	//show the learning points
				return;
			}
			else if(TotalEpiIM >= 0.3)
			{	//from wang email 5-19...if too much just end scenario...not sure of text to display though....
			
				AppendtoActionDisplay("Change in Vitals. " + TotalEpiIM + " mg Epinephrine IM. This exceeds the recommended dose.");
				LocalMachine.CurrentState=StateNameListEnum.EpiniphrineIM_0_5_orMore;		//is current
				SetStatsAndFlagsAfterMedication(LocalMachine);
				
					//show complettion
				BUTTONAdvanceProgressMeter();
				StopAllTimerActivity();
				
				//PlayCorrectSfx();
				PlayDingSfx();
				SetPatientResponseColorRed();
						
				alert("Change in Vitals. " + TotalEpiIM + " mg Epinephrine IM. This exceeds the recommended dose.");
				InterpretShowLearningPoints();	//show the learning points
				return;
			}

		break;
		//fall through to SQ, all the same...all doses incorrect,
		case "Epinephrine SQ":
		
			/*var bvitalschange=false;
			if(doseunit.value == "mg (milligrams)" || doseunit.value == "mL (milliliters)")
			{
				if(meddosenumber >= 0.1)	//then we cancel the no epi timer
				{
					StopAllTimerActivity();
				}
			
				//if dose is > 0.5 mg, incorrect
				if(meddosenumber >= 0.5)
				{	
					LocalMachine.CurrentState=StateNameListEnum.EpiniphrineIM_0_5_orMore;		//is current
					//PlayDingSfx();
					bvitalschange=true;
				}
				else if(meddosenumber >= 0.1 && meddosenumber < 0.3)
				{
					LocalMachine.CurrentState=StateNameListEnum.EpiniphrineIM_0_1_to_0_3;		//is current
					AppendtoActionDisplay(meditem.text + " administered. No change in vitals.");
					AlertUserNoVitalChange();
					return;
				}
				else
				{
				//is user admins meds before timer counts down, then we need to cancel BPsatdrop & askforvitals
				}
			}
			
			if(bvitalschange)
			{
				AppendtoActionDisplay(meditem.text + " administered. Change in vitals.");
			}
			else
			{
				AppendtoActionDisplay(meditem.text + " administered. No change in vitals.");
				AlertUserIncorrectDosage();
			}*/
			
				AppendtoActionDisplay(meditem.text + " administered. No change in vitals.");
				AlertUserNoVitalChange();
				return;
		
		break;
		case "Benadryl":
			//if correct amount or not
			//if dose is 25/50 mg, else incorrect
			if(meddosenumber < 25 || meddosenumber > 50 || doseunit.value != "mg (milligrams)")
			{	//may still want to set state visited variable, no only if correct dosage given per instructions
				AlertUserIncorrectDosage();
				return;
			}
			//what to do with incorrect dose? do we set the state to benedryl or not? its still bad
			AppendtoActionDisplay("Benedryl administered: Correct dose, but should not be administered. Change in vitals.");
			LocalMachine.CurrentState=StateNameListEnum.Benedryl;						//set this state to current
			PlayDingSfx();
			
		break;
		case "Atropine":
			//if dose is 1 mg or 10 ml, else incorrect
			if((meddosenumber !=1 || doseunit.value != "mg (milligrams)") && (meddosenumber !=10 || doseunit.value != "mL (milliliters)"))
			{	//may still want to set state visited variable, no only if correct dosage given per instructions
				AlertUserIncorrectDosage();
				return;
			}
			//what to do with incorrect dose? do we set the state to benedryl or not? its still bad
			AppendtoActionDisplay("Atropine administered: Correct dose, but patient feels funny. Change in vitals.");
			LocalMachine.CurrentState=StateNameListEnum.Atropine;						//set this state to current
			PlayDingSfx();
		
		break;
		
		case "Epinephrine IV":
			AppendtoActionDisplay("IV has fallen out and is not available. Unsuccessfull attempt with IV.");
			alert("IV has fallen out and is not available. Unsuccessfull attempt with Epinephrine IV.");
			return;
		break;
		case "Solumedrol Steroid":
			//administered by IV, which is not allowed in this scenario..else would be 250 mg
			AppendtoActionDisplay("IV has fallen out and is not available. Unsuccessfull attempt with IV.");
			alert("IV has fallen out and is not available. Unsuccessfull attempt with Solumedrol IV.");
			return;
		
		break;
		case "Albuterol Inhaler":
			if(meddosenumber != 2 || doseunit.value != "puffs") 
			{	//may still want to set state visited variable, no only if correct dosage given per instructions
				//alert("Incorrect dose.");
				AlertUserIncorrectDosage();
				return;
			}
			//if correct amount or not, its in puffs, so lets skip that for now
			AppendtoActionDisplay("Albutrol administered. Correct dose. No change in vitals.");
			return;
		
		break;
		default:
			//alert("error in InterpretAdministerMedication");
			return;	//prevent setting the below stats
	}
	
	SetStatsAndFlagsAfterMedication(LocalMachine);

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
		alert("Please select a action");
	}
	else
	{
		//dont use an alert, set an enum for action, then advance state machine to that action
		AppendtoActionDisplay("Action = " + techaction.text + ".");
	}
	
	//set what the new state should be
	//store the global progress 
	switch(techaction.text)	//these are the displayed text in the html page
	{
		case "Raise Legs":	//RAISE LEGS
		//is this going to be persistent? may want to use globals
			LocalMachine.CurrentState=StateNameListEnum.Raise_Legs;						//set this state to current
			
			AppendtoActionDisplay("[Slightly Improved]. Change in vitals.");
			SetPatientStatsFromState(LocalMachine);		//set th stats display - they change for this
			PlayDingSfx();
			alert("Raised legs \n [Slightly Improved]");
			
		break;	
		case "Start Second IV Line":
			LocalMachine.CurrentState=StateNameListEnum.IV_Not_Allowed;						//set this state to current
			AppendtoActionDisplay("Unsuccessful attempt to start 2nd IV.");
			alert("Unsuccessful attempt to start 2nd IV.");
		
		break;
		case "Start IV Fluids":
		case "Flush IV":	//IV
			LocalMachine.CurrentState=StateNameListEnum.IV_Not_Allowed;						//set this state to current
			AppendtoActionDisplay("IV has fallen out and is not available. Unsuccessfull attempt with IV.");
			alert("IV has fallen out and is not available. Unsuccessfull attempt with IV.");
			
		break;	
		case "Call Code":	//CALL CODE
			LocalMachine.CurrentState=StateNameListEnum.Call_Code;						//set this state to current
			AppendtoActionDisplay("Code team has been alerted and is on their way.");
			alert("Code team has been alerted and is on their way.");

		break;	
		case "Give Oxygen":		//OXYGEN
						
			//var typeofoxygen;
			//$.alerts.okButton = "Nasal cannula";
			//$.alerts.cancelButton = "Face mask";
			
			AddDialogItem("audio/ask_oxygen_female.ogg", 0.7);
			//jConfirm('Nasal Cannula or Face mask?\n \n ', 'Oxygen?', InterpretOxygenStatus);
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
var OxygenNasalCannula = true;	//if not face mask then nasal

function RespondToOxygenDelivery(amountO2)
{
	meddosenumber = amountO2;
	if (meddosenumber==null || meddosenumber=="" || isNaN(meddosenumber))
	{
		alert("Incorrect entry. Please enter in number of liters.");
		return;
	}
	
			
	if (OxygenNasalCannula)	//nasal cannula
	{
		alert("No change in vitals.");
		return;
	}
	else
	{
		//6-10L face mask is correct
		if(meddosenumber < 6 || meddosenumber > 10)// || doseunit.text != "L (Liters)")
		{	//may still want to set state visited variable, no only if correct dosage given per instructions
			alert("No change in vitals.");
			return;
		}
		//otherwise we have the correct dose of oxygen
		Machine.CurrentState=StateNameListEnum.Oxygen_10L_FM;						//set this state to current
		SetPatientStatsFromState(Machine);							//set the stats display - they change for this
		AppendtoActionDisplay("Oxygen administered: amount = " + meddosenumber + " L" );
		AppendtoActionDisplay("Oxygen given. Correct dosage with face mask. Change in vitals.");
		PlayDingSfx();
		
		alert("Change in vitals.");
				
		StateItemList[Machine.CurrentState].StateVisited = true;				//set visited flag
		TurnOffSatandRRUpdate();	//once oxygen is given, we dont change sat or RR
	}

}

function InterpretOxygenStatus(r)
{
	//interpret the return from the custom message box
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
	//I think we want a new page or an alert box here.....
	
	$("#Overlay1").overlay({mask: '#000', load: true, fixed: false}).load();
	
	//document.write("were done");
	/*alert("Learning Points for Scenario 1:\n\n1. Do not give diphenhydramine to a hypotensive patient as it may exacerbate the hypotension and thicken secretions which may exacerbate laryngeal edema and bronchospasm.\n\n 2. Do not give subcutaneous epinephrine to a hypotensive patient as systemic absorption of epinephrine is unlikely.  If a patient is hypotensive, they will be vasoconstricted peripherally and the tiny blood vessels in the subcutaneous fat will be vasoconstricted as well.  You need to ideally give0.1 mg (1 mL) of epinephrine 1:10,000 intravenously to treat a hypotensive patient with a contrast reaction, however if the IV is not available you should give 0.3 mg (0.3 mL) of epinephrine 1:1000 intramuscularly.  The key to blood pressure is that if the blood pressure is low you DO NOT give subcutaneous epinephrine. The blood pressure does not tell you what to give, but alternatively tells you what not to give.\n\n3. If you want to give oxygen, give it via an effective delivery system which is facemask.  You want to give the oxygen at a fast enough flow rate in order to clear the CO2 from the mask which is 6-10L O2/min.  If you have a nonrebreather facemask (a facemask with a bag on the end), you want to make sure the bag stays inflated during both inspiration and expiration to ensure adequate oxygen delivery.  If the bag deflates on inspiration, then you need to increase the rate of oxygen delivery (possibly to more than 10 L/min.) to ensure that the bag remains inflated the whole time.\n\n4. Do not give O2 by nasal cannula as it as ineffective way to deliver adequate oxygen particularly if the patient is to go on to develop respiratory problems.  You want to make sure that you have given him as much 100% oxygen as possible in the lungs in case he does end up with respiratory issues.\n\n5. Proper dosing of epinephrine:\n\na. Epinephrine 0.1 mg (0.1 mL) subcutaneously in the subcutaneous tissues of the upper arm for mild reactions requiring medication in a normal tensive patient.  You can repeat this as needed up to 0.3 mg (0.3 mL) and if you need more, likely you want to give it more directly- intravenously if possible.\n\nb. Epinephrine 0.3  mg(0.3 mL) intramuscularly in the deltoid muscle of the upper arm or anterior thigh muscle.");
	*/
}



