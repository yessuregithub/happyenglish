var worddatas;
var wordcount; // 单词数
var optdata; // 3选项数据
var rightno; // 本轮正确单词编号

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	// json = JSON.parse(gamepara);

	// debug 测试5个实际应该有20个 ，根据数量生成
	json = [{
		"wno": 1,
		"wpic1": "w1.png",
		"wpic2": "p1.png",
		"sound": "s1.mp3"
	}, {
		"wno": 2,
		"wpic1": "w2.png",
		"wpic2": "p2.png",
		"sound": "s2.mp3"
	}, {
		"wno": 3,
		"wpic1": "w3.png",
		"wpic2": "p3.png",
		"sound": "s3.mp3"
	}, {
		"wno": 4,
		"wpic1": "w4.png",
		"wpic2": "p4.png",
		"sound": "s4.mp3"
	}, {
		"wno": 5,
		"wpic1": "w5.png",
		"wpic2": "p5.png",
		"sound": "s5.mp3"
	}];

	worddatas = json;
	wordcount = worddatas.length;

	genopt();
	setQues(opt);
}

function setQues(opt) {
	// 贴题目	
}

function getRandom(min, max) {
	return Math.round(Math.random() * 10000) % max + min;
}

function getDataByNo(wno) {
	if (!worddatas) return null;
	for (var i = 0; i < worddatas.length; i++) {
		if (worddatas[i].wno == wno) {
			return worddatas[i];
		}
	}
	return null;
}

function genopt() {
	var opts = new Array();
	var optw = new Array();

	var newno = rightno;
	while (newno == rightno) {
		newno = getRandom(1, wordcount);
	}
	rightno = newno;

	optw.push(newno);
	var rightdata = getDataByNo(rightno);

	var tmp = getRandom(0, 2);
	opts[tmp] = rightdata;


	// opt2
	newno = rightno;
	while (true) {
		newno = getRandom(1, wordcount);
		if ($.inArray(newno, optw) == -1) {
			optw.push(newno);
			break;
		}
	}
	var optdata = getDataByNo(newno);
	opts[(tmp + 1) % 3] = optdata;

	// opt3
	while (true) {
		newno = getRandom(1, wordcount);
		if ($.inArray(newno, optw) == -1) {
			optw.push(newno);
			break;
		}
	}
	var optdata = getDataByNo(newno);
	opts[(tmp + 2) % 3] = optdata;

	console.log(opts)
}
