var token;
var words;
var r;
var baidu_token;
var endrecordcounter = 0;
var endrecorder;

function startgame() {

	var gamepara = localStorage.getItem("gpara");
	json = JSON.parse(gamepara);
	$("#pict").attr("src", json.image);
	words = json.word;
	r = plus.audio.getRecorder();
	r.record({
		filename: "_doc/audio/",
		samplerate: "16000",
		channels: "mono",
	}, function(fn) {
		console.log("get voice fn:" + fn);
		// anlyvoice(fn); // 由于时间太短，等不到百度识别就切场景了，暂时不使用百度语音
		// mui.alert("录到声音了！");
		addcoin(1);
	}, function(e) {
		mui.alert("请在系统设置中允许APP使用麦克风");
		return;
	});
	endrecorder = setInterval(endrecord, 100);
}


function endrecord() {
	endrecordcounter++;
	$('.second.circle').circleProgress({
		value: endrecordcounter / 50
	});
	$('.second.circle').circleProgress('redraw');
	if (endrecordcounter > 50) {
		clearInterval(endrecorder);
		r.stop();
	}
}

function anlyvoice(fn) { //第一步，获得token
	// TODO: 先弹出来一个动画，转圈之类
	//获得acess_token
	console.log('baidu acess_token');
	mui.ajax({
		url: 'https://aip.baidubce.com/oauth/2.0/token',
		data: {
			grant_type: "client_credentials",
			client_id: "iHbDygjghUvvhQGn45zEUQpx",
			client_secret: "1gUeAljoIuceH4MpqbGD5usKZdhXwPqa"
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			console.log('baidu:' + JSON.stringify(data));
			mui.alert("baidu response=" + JSON.stringify(data));
			baidu_token = data.access_token;
			anlyvoice1(fn, baidu_token);
		},
		error: function(xhr, type, errorThrown) {
			console.log('baidu:' + JSON.stringify(xhr));
			mui.alert("呀，现在网络有点问题，下次再试试!");
		}
	});
}

function anlyvoice1(fn, token) { //第二步，读取文件并转码bas64
	plus.io.resolveLocalFileSystemURL(fn, function(entry) {
		entry.file(function(file) {
			var reader = new plus.io.FileReader();
			reader.onloadend = function(e) {
				puresult = e.target.result;
				pos = puresult.indexOf("base64,");
				pos = pos + 7;
				rst = puresult.substring(pos);
				anlyvoice2(fn, token, rst, file.size);
			};
			reader.readAsDataURL(file);

		}, function(e) {
			mui.toast("读写出现异常: " + e.message);
		})
	})
}

function anlyvoice2(fn, token, base64, filesize) { //进行识别
	var fileExtension = fn.substring(fn.lastIndexOf('.') + 1);
	var request = {
		format: fileExtension,
		rate: 16000,
		dev_pid: 1737,
		channel: 1,
		token: token,
		cuid: 'czapp',
		len: filesize,
		speech: base64,
	};
	var encoded = $.toJSON(request);

	//console.log("encoded=" + encoded);
	mui.ajax({
		url: "http://vop.baidu.com/server_api",
		type: 'POST',
		data: encoded,
		dataType: 'json',
		contentType: 'application/json',
		success: function(data, status, xhr) {
			anlyvoice3(data);
		},
		Error: function(xhr, error, exception) {
			mui.alert(exception.toString());
		}
	});
}

function anlyvoice3(baiduresult) {
	var score = 0;
	var errcode = baiduresult.err_no;
	if (errcode == 3301) {
		processscore(0);
		return;
	} //没读
	else if (errcode != 0) {
		// processscore(2);
		processscore(0);
		return;
	} //没能解析
	var resultcount = baiduresult.result.length;
	if (resultcount == 0) {
		// processscore(3);
		processscore(1); // 读了都给1分
		return;
	} //实在差得太多？
	score = -1;
	for (i = 0; i < resultcount; i++) {
		wordget = baiduresult.result[i];
		console.log("server word:" + wordget + " need word:" + words);
		pos1 = wordget.indexOf(words);
		pos2 = words.indexOf(wordget);
		if ((pos1 != -1 || pos2 != -1) && score == -1) score = 10 - i;
	}
	if (score == -1) score = 5; //读错了
	// processscore(score);
	processscore(1); // 读了都给1分

	mui.alert("errcode:" + errcode + "识别数：" + resultcount + " 子集：" + baiduresult.result + " 得:" + score + " 分");
	// debug
}


function processscore(score) {
	addcoin(score);

	// document.postMessage(addcoin, score);
	// if (score > 0) localStorage.setItem("incoin", score);
	// localStorage.setItem("incoin", 10); debug
	// setTimeout(function() {
	// 	plus.webview.currentWebview().hide();
	// }, 5000);
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
