// 互动游戏 - 图片轮播
var anw_rw; // 选对选错
var mv_gj;
var mv_nt;
var count15;

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	//debug
	gamepara = "cake|images/03.png|images/04.png|images/05.png|3";
	//单词|第一图|第二图|第三图|答案
	gamedata = gamepara.split("|");

	var word = gamedata[0];
	var pic1 = gamedata[1];
	var pic2 = gamedata[2];
	var pic3 = gamedata[3];
	var anw = gamedata[4];

	$("#hd-yn-que").html(word);


	// 加载欢喜动画
	$("#result").hide();
	$("#res_gj").hide();
	$("#res_nt").hide();
	mv_gj = new seqframe({
		container: document.getElementById('res_gj'),
		urlRoot: 'movie/goodjob/',
		imgType: 'png',
		frameNumber: 5,
		framePerSecond: 10,
		loadedAutoPlay: false,
		loop: 1,
	});
	mv_gj.load();

	mv_nt = new seqframe({
		container: document.getElementById('res_nt'),
		urlRoot: 'movie/nicetry/',
		imgType: 'png',
		frameNumber: 5,
		framePerSecond: 10,
		loadedAutoPlay: false,
		loop: 1,
	});
	mv_nt.load();

	// 设置游戏持续时间
	// setTimeout(function() {
	// 	clearInterval(count15);
	// 	plus.webview.currentWebview().hide();
	// }, (duration * 1000));
}

function processanswer(correct) {

}

function endgame(correct) {
	$("#result").show();
	if (correct) $("#res_gj").show();
	else $("#res_nt").show();
	if (correct) mv_gj.play();
	else mv_nt.play();
}
