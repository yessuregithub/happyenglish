var token;
var stage;
var second, totalseconds;
var counter;
var checked=false;
var answerindex;

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	//debug
	gamepara = "images/zb.jpg|Suck my ________?|It is something you love!|Mouse|Dick|2";
	//图片|第一句话|第二句话|可选单词1|可选单词2|答案
	gamedata = gamepara.split("|");
	$("#words1").text(gamedata[1]);
	$("#words2").text(gamedata[2]);
	$("#showimage").attr("src", gamedata[0]);
	$("#anwser1").text(gamedata[3]);
	$("#anwser2").text(gamedata[4]);
	answerindex=parseInt(gamedata[5])-1;
	stage = 1;
	setTimeout(showselect, 15000);
}

function showselect() {
	stage = 2;
	$("#uc_01").show();
	$("#timecount").attr("style", "width:100%");
	$("#progress1").show();
	second = 5;
	totalseconds = 5;
	counter=setInterval(countdown, 100);
}

function countdown() {
	second -= 0.1;
	var length = Math.round((second * 100) / totalseconds);
	$("#timecount").attr("style", "width:" + length + "%");
	if (second < 0.1) {
		clearInterval(counter);
		processanswer(false);
	}
}

function processanswer(correct)
{
	}
