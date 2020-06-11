var pusher = null;
var token;
var player = new Array(5); // 0<-老师 1-4 学生
var playername = new Array(5);
var playerid = new Array(5);
var playercoin = new Array(5);
var playervideo = new Array(5);
var token, lid;
var lessondata, datacount;
var activeview = null;
var ismuted = false;
var userid;
var keepalive = null;

var classid; //课堂编号
var kt_starttime_interval = null;

function kt_setstarttime() {
	var starttime_ts = localStorage.getItem("less_starttime");
	if (starttime_ts == null) return;

	datetime = Date.now();
	timestamp = Math.floor(datetime / 1000);
	if (parseInt(timestamp / 86400) == parseInt(starttime_ts / 86400)) istoday = true;
	else istoday = false;

	// 倒数计时
	if (istoday && timestamp <= starttime_ts) {
		var div = document.getElementById("id_starttime");
		var endtime = new Date(parseInt(starttime_ts) * 1000);
		kt_starttime_interval = setInterval(function() {
			// 切换成直播状态
			if (new Date().getTime() >= endtime.getTime()) {
				clearInterval(kt_starttime_interval);
				$("#id_starttime_title").html("请注意保持课堂纪律哦！");
			} else {
				div.innerHTML = showtime(endtime);
			}
		}, 1000); //反复执行函数本身
	} else {
		$("#id_starttime_title").html("请注意保持课堂纪律哦！");
	}
}

function showtime(endtime) {
	var nowtime = new Date(); //获取当前时间
	var lefttime = endtime.getTime() - nowtime.getTime(); //距离结束时间的毫秒数

	var leftd = Math.floor(lefttime / (1000 * 60 * 60 * 24)); //计算天数
	var lefth = Math.floor(lefttime / (1000 * 60 * 60) % 24); //计算小时数
	var leftm = Math.floor(lefttime / (1000 * 60) % 60); //计算分钟数
	var lefts = Math.floor(lefttime / 1000 % 60); //计算秒数
	leftm = leftm < 10 ? "0" + leftm : leftm;
	lefts = lefts < 10 ? "0" + lefts : lefts;
	return lefth + ":" + leftm + ":" + lefts; //返回倒计时的字符串
}

function quitlesson(backtofirstpage) {
	// if (player[0] != null) {
	// 	player[0].removeEventListener('timeupdate', timeupdate, false);
	// }

	//??? document.removeEventListener("addcoin");
	// plus.device.setVolume(0.5);
	if (activeview) activeview.close();
	if (pusher) pusher.stop();
	if (pusher) pusher.close();
	// plus.device.setVolume(0.5);
	for (i = 0; i <= 4; i++)
		if (player[i] != null) {
			player[i].stop();
			player[i].close();
		}
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_quitlesson.html',
		async: true,
		dataType: 'json',
		data: {
			token: token,
			lid: lid
		},
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {}
			if (data.rst == 1) {}
			if (backtofirstpage) jump('index', 'index.html');

		},
		error: function(xhr, type, errorThrown) {
			// 请求失败
			console.log("logout http fail");
			if (backtofirstpage) jump('index', 'index.html');

		}
	});
}



function initclassroom(data) {
	// console.log(JSON.stringify(data));

	var odiv = document.getElementById("kt");
	var left = odiv.getBoundingClientRect().left;
	var top = odiv.getBoundingClientRect().top;
	var width = odiv.getBoundingClientRect().width;
	var height = odiv.getBoundingClientRect().height;
	activeview = plus.webview.create('about:blank', 'active', {
		top: top + 5, //把黑板的边框留一点出来
		left: left + 10,
		height: height - 10,
		width: width - 20
	});
	activeview.hide();

	// plus.device.setVolume(0.5);
	lessondata = data.lessondata;
	datacount = data.datacount;
	userid = data.userid; //自己的uid

	pushurl = 'rtmp://47.241.111.251/live?vhost=rotate.localhost/' + userid;
	pusher = new plus.video.LivePusher('pusherwin', {
		url: pushurl
	});
	
	// 6.11
	njsSetAudioSessionForIOS();

	for (i = 0; i < 5; i++) player[i] = null;
	for (i = 1; i <= 4; i++)
		if (data.player[i].id == userid) mypos = i; //先获得自己的序号
	for (i = 1; i <= 4; i++) { //重排序号
		pos = i;
		if (i == 1 && mypos == 1) pos = i;
		if (i == 1 && mypos != 1) {
			pos = mypos;
		}
		if (i == mypos) pos = 1;
		playername[pos] = data.player[i].name;
		playerid[pos] = data.player[i].id;
		playercoin[pos] = data.player[i].coin;
		playervideo[pos] = data.player[i].video;
		if (playername[pos] != "") {
			tag = "#name" + pos;
			$(tag).text(playername[pos]);
			tag = "#coin" + pos;
			$(tag).text(playercoin[pos]);
			tag = "#v" + pos;
			player[pos] = createvideo("v" + pos, "v" + pos, playervideo[pos]);
			player[pos].play();
			if (pos == 1) //自己始终静音
			{
				player[1].setStyles({
					muted: true,
				});
			}
		} else {
			tag = "#name" + pos;
			$(tag).text("");
			tag = "#coin" + pos;
			$(tag).text("-");
			tag = "#v" + pos;
			$(tag).html("<img src=\"images/wsx.jpg\">"); //显示未上线
		}
	}
	pusher.start(); //搞不明白为什么必须放在player后面,否则就不能推流! 可能是音频设置会被player修改。
	//在新的视频加入后，必须stop，然后再start pusher
	
	// plus.device.setVolume(0.5);
}

function debuggoless() {
	activeview.loadURL("hudong-yidongxq.html"); // todo
	for (j = 0; j < 4; j++) localStorage.setItem("playername" + (j + 1), playername[j]);
	activeview.show();
}


var lastplaytime = 0;

function checklessondata(lastplaytime, currtime) {
	for (i = 0; i < datacount; i++) {
		if (lastplaytime < lessondata[i].ts && currtime >= lessondata[i].ts) {
			console.log("lasttime:" + lastplaytime + ",currtime:" + currtime + " pop up " + lessondata[i].url);

			var unescape_para = unescape(lessondata[i].para);
			// unescape_para =
			// 	'{"tuzi":[{"que":"Which is #mouth#?","anw":2,"pic1":"http://ipdl.cheerz.cn/hpyy/pic/p3.jpg","pic2":"http://ipdl.cheerz.cn/hpyy/pic/p1.jpg"},{"que":"Which is #ear#?","anw":2,"pic1":"http://ipdl.cheerz.cn/hpyy/pic/p1.jpg","pic2":"http://ipdl.cheerz.cn/hpyy/pic/p4.jpg"},{"que":"Which is #eye#?","anw":2,"pic1":"http://ipdl.cheerz.cn/hpyy/pic/p4.jpg","pic2":"http://ipdl.cheerz.cn/hpyy/pic/p2.jpg"},{"que":"Which is #nose#?","anw":1,"pic1":"http://ipdl.cheerz.cn/hpyy/pic/p3.jpg","pic2":"http://ipdl.cheerz.cn/hpyy/pic/p4.jpg"},{"que":"Which is #eye#?","anw":1,"pic1":"http://ipdl.cheerz.cn/hpyy/pic/p2.jpg","pic2":"http://ipdl.cheerz.cn/hpyy/pic/p4.jpg"}]}';
			// lessondata[i].url = 'tuzi-youxi';

			localStorage.setItem("gid", lessondata[i].id);
			localStorage.setItem("ts", lessondata[i].ts);
			localStorage.setItem("gpara", unescape_para);

			console.log(lessondata[i].url + ":game get gamepara :" + unescape_para);

			activeview.loadURL(lessondata[i].url + ".html");
			for (j = 1; j <= 4; j++) {
				localStorage.setItem("playername" + j, playername[j]);
				localStorage.setItem("playerid" + j, playerid[j]);
			}
			activeview.show();
		}
	}
}

function timeupdate(e) {
	//console.log('statechange: ' + JSON.stringify(e));
	currtime = e.detail.currentTime;
	checklessondata(lastplaytime, currtime); //需要处理超时不返回，否则多次弹窗！
	lastplaytime = currtime;
}

function ended(e) {
	quitlesson(false);
	jump('ended', 'kc-end.html');
}

function muteplayer() {
	for (i = 1; i <= 4; i++) {
		if (player[i] == null) continue;
		console.log("mute " + i + "before");
		player[i].setStyles({
			muted: !ismuted,
		});
		if (i == 1) player[1].setStyles({
			muted: true,
		});
		console.log("mute after");
	}
	ismuted = !ismuted;
	if (ismuted) $("#pingbi").attr("class", "pingbi");
	else $("#pingbi").attr("class", "nothing");

}

function createvideo(videoid, divid, url) {
	var odiv = document.getElementById(divid);
	var left = odiv.getBoundingClientRect().left;
	var top = odiv.getBoundingClientRect().top;
	var width = odiv.getBoundingClientRect().width;
	var height = odiv.getBoundingClientRect().height;
	var player = plus.video.createVideoPlayer(videoid, {
		src: url, //留点边框
		top: top + 2,
		left: left + 2,
		width: width - 4,
		height: height - 4,
	});
	plus.webview.currentWebview().append(player);
	console.log("added video " + divid + " " + url);
	return player;
}


function enterlesson() {

	// check add 金币
	incoin_t = setInterval(function() {
		var coin = localStorage.getItem("incoin");
		if (coin != null && parseInt(coin) > 0) {
			console.log("get coin " + coin);
			localStorage.removeItem("incoin");
			addcoin();
		}
	}, 1000);


	setInterval(pullmessage, 5000);
	token = localStorage.getItem("token");
	lid = localStorage.getItem("less_id");
	cover = localStorage.getItem("cover");
	if (token == null || token == "" || typeof(token) == undefined) {
		jump('login', 'dl.html');
		return null;
	}
	if (lid == null || lid == "" || typeof(lid) == undefined) {
		jump('index', 'index.html');
		return null;
	}
	$("#vtarea").html("<img src='" + cover + "'>");
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_enterlesson.html',
		async: true,
		dataType: 'json',
		data: {
			token: token,
			lid: lid
		},
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {
				mui.alert(data.msg);
				jump('index', 'index.html');
				return;
			}
			if (data.rst == 1) {
				initclassroom(data);

				//debuggoless(); // todo delete
				return;
			}
			if (data.rst == 2) { //服务器认为已经在课堂，强制退出
				console.log("server report duplication session");
				quitlesson(false);
				setTimeout(reenter, 2000);
				return;
			}
			//
		},
		error: function(xhr, type, errorThrown) {
			// 请求失败  
			mui.alert("网络错误，请稍后再试");
		}
	});

}

function reenter() {
	enterlesson();
}

function playerleave(uid) {
	pos = 0;
	for (i = 1; i <= 4; i++)
		if (playerid[i] == uid) {
			pos = i;
			break;
		}
	if (pos == 0) return;
	player[pos].stop();
	player[pos].close();
	player[pos] = null;
	playername[pos] = "";
	playercoin[pos] = "-";
	tag = "#name" + pos;
	$(tag).text("");
	tag = "#coin" + pos;
	$(tag).text("-");
	pusher.stop();
	pusher.start();
}

function addplayer(uid, name, coin, url) {
	order = -1;
	for (i = 1; i <= 4; i++)
		if (playername[i] == "") {
			order = i;
			break;
		}
	if (order == -1) return; //table full
	playername[order] = name;
	playercoin[order] = coin;
	playervideo[order] = url;
	playerid[order] = uid;
	tag = "#name" + order;
	$(tag).text(playername[order]);
	tag = "#coin" + order;
	$(tag).text(playercoin[order]);
	tag = "#v" + order;
	player[order] = createvideo("v" + order, "v" + order, playervideo[order]);
	player[order].play();
	pusher.stop();
	pusher.start();
	// plus.device.setVolume(0.5);
}

function startlesson(offset, url) {
	if (player[0] != null) return;
	console.log("start lesson:" + url);
	tag = "#vtarea";
	$(tag).html("<div id=\"vt\" style=\"width:100%;height:100%;background-color:#000000\"></div>"); //准备视频区域
	player[0] = createvideo("vt", "vt", url);
	player[0].addEventListener('timeupdate', timeupdate, false);
	player[0].addEventListener('ended', ended, false);
	player[0].play();
	testoffset = 0; //debug 
	player[0].seek(testoffset);
	pusher.pause();
	pusher.start();
	console.log("n#1");
	//原型 [[AVAudioSession sharedInstance] overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:&error];
	//调用说明 https://ask.dcloud.net.cn/article/88
	//官方文档 https://www.html5plus.org/doc/zh_cn/ios.html

	//	var AVAudioSession = plus.ios.importClass("AVAudioSession");
	//	AVAudioSession.sharedInstance().setCategoryerror("AVAudioSessionCategoryPlayback", null);

	// var AVAudioSession = plus.ios.importClass("AVAudioSession");
	// console.log("n#2");
	// //(sharedInstance,"overrideOutputAudioPort:error:","spkr",null);  //方法1
	// //console.log("n#2.1");
	// //IOS 11? sharedInstance.setCategory("AVAudioSessionCategoryPlayAndRecord","AVAudioSessionModeDefault");
	// console.log("n#2.2");
	// //AVAudioSession.sharedInstance().setActive("YES", null);
	// AVAudioSession.sharedInstance().setCategoryerror("AVAudioSessionCategoryPlayAndRecord", null);
	// console.log("n#2.3");
	// //AVAudioSession.sharedInstance().overrideOutputAudioPort("AVAudioSessionPortOverrideSpeaker", null); //方法2 调用出错
	// console.log("n#3");
	// plus.ios.deleteObject(AVAudioSession);
	// console.log("n#4");
	
	// 6.11
	// njsSetAudioSessionForIOS();
}
//第三方推流
//https://github.com/zhenyan-chang/RTMP-LivePlay   支持横竖屏切换! 
//https://github.com/runner365/GPUImageRtmpPush   这个更有名
//https://github.com/sandyCK/OpenLiveiOSPusher     这个似乎比较简单,全用第三库
// 又拍云 七牛 阿里 腾讯等 也可以考虑接入,如果老板不在乎这点钱
// 

function njsSetAudioSessionForIOS() {
	console.log("njsSetAudioSessionForIOS");
	// AVAudioSession * session = [AVAudioSession sharedInstance];
	// [session setCategory: AVAudioSessionCategoryPlayAndRecord withOptions: AVAudioSessionCategoryOptionMixWithOthers error:nil];

	var AVAudioSession = plus.ios.importClass("AVAudioSession");
	AVAudioSession.sharedInstance().setCategoryerror("AVAudioSessionCategoryPlayAndRecord","AVAudioSessionCategoryOptionMixWithOthers", null);
	plus.ios.deleteObject(AVAudioSession);
}

function docommand(cmds) {
	cmd = cmds[0];
	if (cmd == "addplayer") addplayer(cmds[1], cmds[2], cmds[3], cmds[4]);
	else if (cmd == "lessonstart") startlesson(cmds[1], cmds[2]);
	else if (cmd == "leavelesson") playerleave(cmds[1]);
}

function pullmessage() {
	token = localStorage.getItem("token");
	lid = localStorage.getItem("less_id");

	if (token == null || token == "" || typeof(token) == undefined) {
		quitlesson(true);
		return null;
	}
	if (lid == null || lid == "" || typeof(lid) == undefined) {
		quitlesson(true);
		return null;
	}
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_pullmessage.html',
		async: true,
		dataType: 'json',
		data: {
			token: token,
			lid: lid
		},
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {
				mui.alert(data.msg);
				quitlesson(true);
				return;
			}
			if (data.rst == 1) {
				commandcount = data.msgcount;
				for (i = 0; i < commandcount; i++) {
					//console.log(JSON.stringify(data));
					//console.log("do cmd:" + data.cmd[i].cmd);
					cmds = data.cmd[i].cmd.split("|");
					docommand(cmds);
				}
				return;
			}
		},
		error: function(xhr, type, errorThrown) {}
	});

}

function askquit() {
	var btnArray = ['No', 'Yes'];
	mui.confirm('确定要离开教室(Yes/No)？', '确认', btnArray, function(e) {
		if (e.index == 1) {
			quitlesson(true);
		}
	});

}
