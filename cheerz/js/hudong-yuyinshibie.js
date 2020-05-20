var token;
var words;
var r;
var baidu_token;

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
		alert("Audio " + fn + " record success!");
	}, function(e) {
		alert("Audio record failed: " + e.message);
	});
	setTimeout(endrecord, 5000);
}

function endrecord() {
	r.stop();
}

function anlyvoice(fn) { //第一步，获得token
	// TODO: 先弹出来一个动画，转圈之类
	//获得acess_token
	mui.ajax({
		url: 'https://aip.baidubce.com/oauth/2.0/token',
		data: {
			grant_type: "client_credentials",
			client_id: "api_key",
			client_secret: "Secret Key"
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
				//console.log(e.target.result);  //BASE64的录音文件
				//console.log("filesize="+file.size);
				//TODO 从带编码头的BASE64里面取出纯内容
				anlyvoice2(fn, token, e.target.result, file.size);
			};
			reader.readAsDataURL(file);

		}, function(e) {
			mui.toast("读写出现异常: " + e.message);
		})
	})
}

function anlyvoice2(fn, token, base64, file.size) { //进行识别
}
