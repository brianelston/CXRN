//-----------------------------------
function include(file) 
{
   if (document.createElement && document.getElementsByTagName) {
     var head = document.getElementsByTagName('head')[0];

     var script = document.createElement('script');
     script.setAttribute('type', 'text/javascript');
     script.setAttribute('src', file);

     head.appendChild(script);
   } else {
     alert('Your browser can\'t deal with the DOM standard. That means it\'s old. Please update your browser before continueing!');
   }
}
//-----------------------------------

var numMovies = 6;
//var movienames=["Video_Intro.swf", "Video_Epi_IV.swf", "Video_Epi_IM.swf", "Video_Epi_SQ.swf", "Video_Atropine.swf"];
var movienames=["Video_Epi_IV.swf", "Video_Epi_IM.swf", "Video_Epi_SQ.swf", "Video_Atropine.swf", "Video_Albutrol.swf", "Video_EpiPenJR.swf"];
var medimagenames=["EPIIV.jpg", "Epipen.jpg", "EPISQ.jpg", "Atropine.jpg", "Albuterol.jpg", "EpipenJR.jpg"];

//EpipenJR.jpg

include('ProgressList.js');

include('scripts_utilities/MovieUtilities.js');
//include('scripts_utilities/CountUtilities.js');

function SetSpecificMedImage(inchoice)
{		
	var item =  document.getElementById("MedicationlImageDisplay");
	item.src=medimagenames[inchoice];;
	//item.style.visibility="visible"
}

function SetSpecificMovieAndImage(inchoice)
{
	SetSpecificMovie(inchoice);
	SetSpecificMedImage(inchoice);

}