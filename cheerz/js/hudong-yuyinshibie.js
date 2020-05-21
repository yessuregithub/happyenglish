var token;
var words;
var r;
var baidu_token;
var endrecordcounter = 0;
var endrecorder;

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	//debug
	gamepara = "images/eye.jpg|eye";
	gamedata = gamepara.split("|");
	$("#pict").attr("src", gamedata[0]);
	words = gamedata[1];
	r = plus.audio.getRecorder();
	r.record({
		filename: "_doc/audio/",
		samplerate: "16000",
		channels: "mono",
	}, function(fn) {
		anlyvoice(fn);
		//alert("Audio " + fn + " record success!");
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
			baidu_token = data.access_token;
			anlyvoice1(fn, baidu_token);
		},
		error: function(xhr, type, errorThrown) {
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
			alert(exception.toString());
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
		processscore(2);
		return;
	} //没能解析
	var resultcount = baiduresult.result.length;
	if (resultcount == 0) {
		processscore(3);
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
	processscore(score);
}

function processscore(score) {
	console.log("get score:" + score);
}
