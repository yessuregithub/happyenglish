// 互动游戏 - 图片轮播
var anw_rw; // 选对选错
var mv_gj;
var mv_nt;
var count15;
var anw;
var pic_url;
var count15;
var genOpts;
var rightCount; // 答对次数
var clickedOpts; // 已选中
var rightOpts; // 已选中正确
var score = 0;

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	// gamepara = '{"word":"ear","img1":"http:\/\/ipdl.cheerz.cn\/hpyy\/pic\/p1.jpg","img2":"http:\/\/ipdl.cheerz.cn\/hpyy\/pic\/p2.jpg","img3":"http:\/\/ipdl.cheerz.cn\/hpyy\/pic\/p3.jpg","img4":"http:\/\/ipdl.cheerz.cn\/hpyy\/pic\/p4.jpg","answer":4}';
	//debug
	json = JSON.parse(gamepara);
	//单词|第一图|第二图|第三图|答案

	var word = json.word;
	pic_url = new Array(4);
	pic_url[0] = json.img1;
	pic_url[1] = json.img2;
	pic_url[2] = json.img3;
	pic_url[3] = json.img4;
	anw = parseInt(json.answer);

	score = 0;

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

	// 选项设置
	var itemCount = $("#A2").find(".item").length;

	rightCount = 0;
	genOpts = genopt(itemCount);
	setQues(genOpts);
	clickedOpts = new Array();
	rightOpts = new Array();

	// 设置游戏持续时间
	var duration = 15 + 35;
	setTimeout(function() {
		clearInterval(count15);
		// plus.webview.currentWebview().hide();  // 不要hide再show会导致跳帧
	}, (duration * 1000));
}

// 生成一轮选项
function genopt(optcount) {
	var opt = new Array();
	var opt_opt_count = Math.round(optcount / 4);
	// var w_opt_count = opt_opt_count - 2;
	// var r_opt_count = optcount - 3 * w_opt_count;
	var w_opt_count = opt_opt_count;
	var r_opt_count = opt_opt_count + 3;
	c1 = c2 = c3 = c4 = 0;
	for (var i = 0; i < optcount; i++) {
		var found = false;
		var val, opt_count;
		while (!found) {
			found = true;
			val = (Math.round(Math.random() * 1000) % 4) + 1;
			opt_count = (val == anw) ? r_opt_count : w_opt_count;
			if (i > 0) {
				if (val == opt[i - 1]) {
					found = false;
					continue;
				}
				if (val == 1) {
					if (c1 == opt_count) {
						found = false;
						continue;

					} else {
						c1++;
					}
				}

				if (val == 2) {
					if (c2 == opt_count) {
						found = false;
						continue;

					} else {
						c2++;
					}
				}

				if (val == 3) {
					if (c3 == opt_count) {
						found = false;
						continue;

					} else {
						c3++;
					}
				}

				if (val == 4) {
					if (c4 == opt_count) {
						found = false;
						continue;

					} else {
						c4++;
					}
				}
			}
			// console.log('opt val = ' + val + ' opt_count=' + opt_count + ' cccc: ' + c1 + ', ' + c2 + ', ' + c3 + ', ' + c4);
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

		$(tupianlist[i]).append("<img class='dongimg' src=" + purl + ">");
	}
}

function pro_result(index) {
	if ($.inArray(index, clickedOpts) != -1) {
		return;
	}
	clickedOpts.push(index);
	var choice = genOpts[index];

	// console.log('click:', index + " choice: " + choice + " | " + rightCount);
	if (choice == anw) {
		rightOpts.push(index);

		rightCount++;
		$('#score').html(rightCount);
		if (rightCount == 1) {
			addcoin(1);
		} else if (rightCount == 3) {
			addcoin(1);
		}
		var donglist = $("#uc_01").find(".img-box");
		if (donglist[index]) {
			$(donglist[index]).append("<div class='dui'></div>");
		}
		play_good();
	} else {
		play_wrong();
	}
}

function addcoin(coin) {
	var iszhibo = localStorage.getItem("isnowzhibo");
	if (iszhibo == 1) {
		// 加金币
		var ts = Math.round(new Date().getTime() / 1000);
		var gurl = localStorage.getItem("gurl");
		var cha = gurl + "_" + ts;
		var memo = "_add" + coin;
		addcointoserv(coin, cha, memo);
	}
}

function endgame() {
	$("#result").show();
	if (rightCount > 0) $("#res_gj").show();
	else $("#res_nt").show();
	if (rightCount > 0) mv_gj.play();
	else mv_nt.play();
}
