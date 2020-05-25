// 互动游戏 - 图片轮播
var anw_rw; // 选对选错
var mv_gj;
var mv_nt;
var count15;
var anw;
var pic_url;

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	//debug
	gamepara = "cake|images/03.png|images/04.png|images/05.png|3";
	//单词|第一图|第二图|第三图|答案
	gamedata = gamepara.split("|");

	var word = gamedata[0];
	pic_url = new Array(3);
	pic_url[0] = gamedata[1];
	pic_url[1] = gamedata[2];
	pic_url[2] = gamedata[3];
	anw = parseInt(gamedata[4]);

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

	var opt = genopt(18);
	setQues(opt);

	// 设置游戏持续时间
	// setTimeout(function() {
	// 	clearInterval(count15);
	// 	plus.webview.currentWebview().hide();
	// }, (duration * 1000));
}

// 生成一轮选项
function genopt(optcount) {
	var opt = new Array();
	var opt_opt_count = optcount / 3;
	c1 = c2 = c3 = 0;
	for (var i = 0; i < optcount; i++) {
		var found = false;
		while (!found) {
			found = true;
			var val = (Math.round(Math.random() * 1000) % 3) + 1;
			if (i > 1 && i % 2 == 0) {
				if (val == opt[i - 1] && val == opt[i - 2]) {
					found = false;
					continue;
				}
				if (val == 1 && c1 == opt_opt_count) {
					found = false;
					continue;
				} else {
					c1++;
				}
				if (val == 2 && c2 == opt_opt_count) {
					found = false;
					continue;
				} else {
					c2++;
				}
				if (val == 3 && c3 == opt_opt_count) {
					found = false;
					continue;
				} else {
					c3++;
				}
			}
			opt[i] = val;
		}
		// console.log(opt[i]);
	}
	return opt;
}

function setQues(opt) {
	console.log("anw = " + anw + ", opt = " + opt);
	$(".dong-list").find(".dui").remove();
	$(".dong-list").find(".dongimg").remove();

	var donglist = $(".dong-list").find(".img-box");
	var tupianlist = $(".dong-list").find(".tupian");

	if (donglist.length != opt.length) return;
	for (var i = 0; i < donglist.length; i++) {
		var purl = pic_url[opt[i] - 1];
		console.log(i + " : " + purl);

		$(tupianlist[i]).append("<img class='dongimg' src=" + purl + ">");
		if (anw == opt[i]) {
			$(donglist[i]).append("<div class='dui'></div>");
		}
	}
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
