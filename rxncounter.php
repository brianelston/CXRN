<?php

$hours = 24;

$file = "rxnhitcounts.txt";

error_reporting(E_ALL ^ E_NOTICE);

if (file_exists($file)) 
{

$cookiename = 'rxncount_solo_';
$count = intval(trim(file_get_contents($file))) or $count = 0;

if (!isset($_COOKIE[$cookiename]))
{
		$count = $count + 1;
		$fp = @fopen($file,'w+') or die('ERROR: Can\'t write to the file ('.$file.')');
		flock($fp, LOCK_EX);
		fputs($fp, $count);
		flock($fp, LOCK_UN);
		fclose($fp);

	/* set cookie */
		header('P3P: CP="NOI NID"');
		setcookie($cookiename, 1, time()+60*60*$hours);
}
echo 'document.write(\''.$count.'\');';
exit();
} 
else 
{
}
?>