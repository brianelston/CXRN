
function AdvanceProgressMeter(PRList, statenumber)
{
	
	//WritetoDebug("progress = " + (statenumber+1));
	//WritetoProgressMeter(statenumber+1);
	
	var elSel = document.getElementById('progressdisplay');
	
	elSel.childNodes[statenumber].innerHTML = "<b>" + PRList[statenumber] + "</b>";
	elSel.childNodes[statenumber-1].innerHTML = PRList[statenumber-1] ;
	
	AppendtoActionDisplay(PRList[statenumber]);
	
	/*if(statenumber+1 == MaxStates)
	{
		WritetoProgressMeter("CORRECT");
	}*/
}

function CreateProgressList(PRList, statenumber) 
{
	//WritetoProgressMeter(statenumber+1);
	var elSel = document.getElementById('progressdisplay');
	
	
	//remove the old entries first
	while(elSel.hasChildNodes())
	{
		elSel.removeChild(elSel.childNodes[0])
	}
	
	//add the new items
	 for(var i=0; i < MaxStates ;i++)
	 {
	 	var elOptNew = document.createElement('li');
		elOptNew.value = i+1;
		
		if(i == 0)
		{
			elOptNew.innerHTML = "<b>" + PRList[0] + "</b>";
		}
		else	//first is bold
		{
			elOptNew.innerHTML = PRList[i];
		}
	
		elSel.appendChild(elOptNew);
	 }
	 
	 //display log
	 
	 ClearActionDisplay();
	 AppendtoActionDisplay(PRList[statenumber]);
}