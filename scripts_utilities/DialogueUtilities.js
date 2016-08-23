//bfe 4.7.11 - dialog manager and utilities
//well need a dialogue manager if were going to play more than 1 dialogue, 

/*to prevent them from playing at the same time, allow them to queue up
	when playing then we add an event ended listener, and play the next one afterwards when its done
*/
var DialogPriorityEnum = {"QueueEnd" : 0,
"QueueNext" : 1};

var currentdialog=1;
var maxdialogs=6;
var numdialogs=0;
var DialogQueue;
var DialoguePlaying=false;

function PlayDialogueFile(infile, involume)
{
	if(infile == null)
		return;
		
	myDialogue = new Audio(infile);		//global var, allows stop
	myDialogue.volume=involume;			//0 to 1.0
	//type="audio/mpeg"
	
	myDialogue.addEventListener('ended', PlayNextDialogueItem, false);	//allow to play next one in queue
		
	myDialogue.play();
}

function CreateDialogManager()
{	
	currentdialog=1;
	numdialogs=0;
	
	DialogQueue=new Array(maxdialogs);

}
function StopDialog()
{
	myDialogue.pause();
}
function PlayNextDialogueItem()
{
	//play the first item, add an ended event listener, and shift the remaining dialogs down by one
	if(numdialogs >= 1)
	{
	
		if(DialogQueue[0].DialogueFile != null)
		{	DialoguePlaying=true;
			PlayDialogueFile(DialogQueue[0].DialogueFile, DialogQueue[0].DialogueVolume);
			
			//need to add an end event listener, then play the next one in the queue
		}
		
		for(var i = 0; i < (numdialogs-1); i++)	//and less than max-1 (numdialogs always less than max though)
		{	//shift them down the line
			DialogQueue[i] = DialogQueue[i+1];
		}
		
		DialogQueue[numdialogs] = null;
		numdialogs = numdialogs -1;
		//return;	//just skip it
	}
	else
	{
		numdialogs=0;
		DialogQueue[0] = null;
		DialoguePlaying=false;	//then the queue is done
	}
}
function AddDialogItem(DialogueFile, DialogueVolume)
{
	AddDialogItemWithPriority(DialogueFile, DialogueVolume, DialogPriorityEnum.QueueEnd);
}
function AddDialogItemWithPriority(DialogueFile, DialogueVolume, DialogPriority)
{
	if(numdialogs >= maxdialogs)
	{
		return;	//just skip it
	}
	
	//if(DialogPriority == DialogPriorityEnum.QueueEnd)
	{	DialogQueue[numdialogs]=new DialogItem(DialogueFile, DialogueVolume, DialogPriority);
		numdialogs = numdialogs+1;
	}
	/*else if(DialogPriority == DialogPriorityEnum.QueueNext)	//bfe 5.16.11 - untested
	{	
		//this would cause a bug if a dialog starts playing while we move this list around....
		//first shift the dialogs up
		for(var i = 2; i < (numdialogs-1); i++)	//and less than max-1 (numdialogs always less than max though)
		{	//shift them up the line
			DialogQueue[i] = DialogQueue[i-1];
		}
		
		//set this one to the front
		DialogQueue[1] = null;
		DialogQueue[1]=new DialogItem(DialogueFile, DialogueVolume, DialogPriority);
		numdialogs = numdialogs+1;
	}*/
	
	//if not playing, then start the dialogs up
	if(DialoguePlaying == false)
	{
		PlayNextDialogueItem();
	}

}
function DialogItem(DialogueFile, DialogueVolume, DialogPriority)
{
	this.DialogueFile=DialogueFile;			//name of file
	this.DialogueVolume=DialogueVolume;			
	this.DialogPriority=DialogPriority;			

}