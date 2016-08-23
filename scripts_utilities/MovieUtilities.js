//-------HELPERS - MOVIES---------------------
function getFlashMovieObject(movieName)
{
  if (window.document[movieName]) 
  {
    return window.document[movieName];
  }
  if (navigator.appName.indexOf("Microsoft Internet")==-1)
  {
    if (document.embeds && document.embeds[movieName])
      return document.embeds[movieName]; 
  }
  else // if (navigator.appName.indexOf("Microsoft Internet")!=-1)
  {
    return document.getElementById(movieName);
  }
}

var moviecount = 0;
//var movienames=["Video_Intro.swf", "Scenario2_H264.swf", "Scenario3_H264.swf", "Scenario4_H264.swf"];

function ChangeMovie()
{
	var flashMovie=getFlashMovieObject("mainmovie");
	
	moviecount = moviecount+1;
	if(moviecount > (numMovies-1))
	{
		moviecount = 0;
	}
	
	flashMovie.src=movienames[moviecount];
}

function SetSpecificMovie(inchoice)
{
	var flashMovie=getFlashMovieObject("mainmovie");
	flashMovie.src=movienames[inchoice];
}

function PlayFlashMovie()
{
	var flashMovie=getFlashMovieObject("mainmovie");
	flashMovie.playMyVideo();
}

function StopFlashMovie()
{
	var flashMovie=getFlashMovieObject("mainmovie");
	flashMovie.pauseMyVideo();
}
