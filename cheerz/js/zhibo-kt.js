var pusher = null;
var token;
var player = new Array(5); // 0<-老师 1-4 学生
var playername = new Array(5);
var playerid = new Array(5);
var playercoin = new Array(5);
var playervideo = new Array(5);
var playeraddcoin = [0, 0, 0, 0, 0]; // 增量金币
var token, lid;
var lessondata, datacount;
var activeview = null;

var ismuted = true; // 是否静音
var isotherplay = false; // 是否开放其他用户
var userid;
var keepalive = null;
var iszhibo = 1; // 是否为直播 1:直播，2:回看课程

var default_volume = 1; // 系统本身音量

var classid; //课堂编号
var kt_starttime_interval = null;

// 课程内部音效
var s_wrong = null;
var s_good = null;

// 防止二次退出
var isquitlesson = false;

function zb_test_str(str) {
	console.log("zhibo-kt.html test string :" + str);
}

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

function quitlesson(backtofirstpage, serverlogout) {
	if (isquitlesson) return;
	isquitlesson = true;
	close_wrong();
	stopPusher();
	closePusher();
	pusher = null;
	for (i = 0; i <= 4; i++) {
		if (player[i] != null) {
			player[i].stop();
			player[i].close();
			player[i] = null;
		}
	}
	if (activeview) activeview.close();
	activeview = null;

	if (!serverlogout) return;
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
			if (backtofirstpage) {
				// 延迟推迟等待播放器关闭
				setTimeout(function() {
					if (iszhibo == 1) {
						jump('index', 'index.html');
					} else {
						jump('xq', 'kcxq.html');
					}
				}, 1000);
			}
		},
		error: function(xhr, type, errorThrown) {
			// 请求失败
			console.log("logout http fail");
			if (backtofirstpage) {
				setTimeout(function() {
					if (iszhibo == 1) {
						jump('index', 'index.html');
					} else {
						jump('xq', 'kcxq.html');
					}
				}, 1000);
			}
		}
	});
}

function initzhibo() {
	iszhibo = localStorage.getItem("isnowzhibo"); // 回看，不显示推流不显示学生视频
	// 回看隐藏视频
	if (iszhibo == 0) {
		$('#zhibo-list').hide();
		$('#pusher-box').hide();

		// 设置播放框位置
		// $('#kt').css({
		// 	"transform": "translateY(-50%)",
		// 	"top": "50%"
		// });
		// $('#laoshi-btn').css({
		// 	"transform": "translateY(-50%)",
		// 	"top": "50%"
		// });
	}

}

function initclassroom(data) {
	// 加载音效
	load_wrong();

	if (ismuted) $("#pingbivoice").attr("class", "pingbi");
	else $("#pingbivoice").attr("class", "nothing");
	if (isotherplay) $("#pingbivideo").attr("class", "nothing");
	else $("#pingbivideo").attr("class", "pingbi");

	// 加载互动子页面
	var odiv = document.getElementById("kt_content");
	var left = odiv.getBoundingClientRect().left;
	var top = odiv.getBoundingClientRect().top;
	var width = odiv.getBoundingClientRect().width;
	var height = odiv.getBoundingClientRect().height;
	// activeview = plus.webview.create('blank.html', 'active', {
	// 	top: top + 5, //把黑板的边框留一点出来
	// 	left: left + 10,
	// 	height: height - 10,
	// 	width: width - 20
	// });
	activeview = plus.webview.create('blank.html', 'active', {
		top: top, //把黑板的边框留一点出来
		left: left,
		height: height,
		width: width
	});
	activeview.hide();

	lessondata = data.lessondata;
	datacount = data.datacount;
	userid = data.userid; //自己的uid

	// 回看则不推流不显示学生端
	if (iszhibo != 1) {
		$('#pingbivoice').hide();
		$('#pingbivideo').hide();
		return;
	}

	// // 创建推流
	// initPusher(userid);
	// setTimeout(function() {
	// 	if (pusher) {
	// 		startPusher();
	// 	}
	// }, 500);

	// 学生端player创建
	for (i = 0; i < 5; i++) player[i] = null;


	for (i = 1; i <= 4; i++)
		if (data.player[i].id == userid) mypos = i; //先获得自己的序号
	for (i = 1; i <= 4; i++) { //重排序号
		console.log("data.player: " + JSON.stringify(data.player[i]));
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
		playeraddcoin[pos] = 0;

		// todo delete
		// playervideo[pos] = "rtmp://47.114.84.56/live/" + data.player[i].id;
		console.log(pos + 'player [' + pos + '] vurl:' + playervideo[pos]);

		if (playername[pos] != "") {

			tag = "#name" + pos;
			$(tag).text(playername[pos]);
			tag = "#coin" + pos;
			$(tag).text(playercoin[pos]);
			tag = "#v" + pos;
			// 自己使用用推流摄像头
			if (pos == 1 && mui.os.android) {
				// 显示自己的摄像头
			} else {
				player[pos] = createvideo("v" + pos, "v" + pos, playervideo[pos], pos);

				if (pos > 1) {
					if (isotherplay) {
						// player[pos].setStyles({
						// 	muted: ismuted,
						// });
						player[pos].play();
					} else {
						// player[pos].pause();
					}
				} else if (pos == 1) {
					player[pos].play();
				}

				// 静音操作
				if (pos == 1) {
					player[1].setStyles({
						muted: true,
					});
				} else if (pos > 1) {
					player[pos].setStyles({
						muted: ismuted,
					});
				}
			}
		} else {
			tag = "#name" + pos;
			$(tag).text("");
			tag = "#coin" + pos;
			$(tag).text("0");
			tag = "#v" + pos;
			$(tag).html("<img src=\"images/wsx.jpg\">"); //显示未上线
		}
	}

	// 创建推流
	initPusher(userid);
	startPusher();
	// setTimeout(function() {
	// 	if (pusher) {
	// 		startPusher();
	// 	}
	// }, 500);
}


var lastplaytime = 0;

function timeupdate(e) {
	//console.log('statechange: ' + JSON.stringify(e));
	currtime = e.detail.currentTime;
	checklessondata(lastplaytime, currtime); //需要处理超时不返回，否则多次弹窗！
	lastplaytime = currtime;
}

function ended(e) {
	quitlesson(false, false);
	var iszhibo = localStorage.getItem("isnowzhibo");
	if (iszhibo == 1) {
		localStorage.setItem("referer", "zhibo-kt.html");

		jump('ended', 'kc-end.html');
	} else {
		jump('xq', 'kcxq.html');
	}
}

function muteplayer() {
	for (i = 2; i <= 4; i++) {
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
	if (ismuted) $("#pingbivoice").attr("class", "pingbi");
	else $("#pingbivoice").attr("class", "nothing");
}

function stopotherplayer() {
	pausePusher();
	isotherplay = !isotherplay;
	for (i = 2; i <= 4; i++) {
		if (player[i] == null) continue;
		if (isotherplay) {
			player[i].play();
		} else {
			player[i].stop();
		}
	}
	if (isotherplay) $("#pingbivideo").attr("class", "nothing");
	else $("#pingbivideo").attr("class", "pingbi");
	resumePusher();
}

function checklessondata(lastplaytime, currtime) {
	for (i = 0; i < datacount; i++) {
		if (lastplaytime < lessondata[i].ts && currtime >= lessondata[i].ts) {
			// console.log("lasttime:" + lastplaytime + ",currtime:" + currtime + " pop up " + lessondata[i].url);

			var unescape_para = unescape(lessondata[i].para);
			localStorage.setItem("gid", lessondata[i].id);
			localStorage.setItem("ts", lessondata[i].ts);
			localStorage.setItem("gpara", unescape_para);
			localStorage.setItem("gurl", lessondata[i].url);

			// console.log(lessondata[i].url + ":game get gamepara :" + unescape_para);
			// 提前执行前个页面离开函数
			activeview.evalJS('if (typeof(leaveURL) != "undefined") (leaveURL())');
			activeview.loadURL(lessondata[i].url + ".html");
			for (j = 1; j <= 4; j++) {
				localStorage.setItem("playername" + j, playername[j]);
				localStorage.setItem("playerid" + j, playerid[j]);
			}
			activeview.show();
		}
	}
}

function enterlesson() {
	isquitlesson = false;
	default_volume = plus.device.getVolume();
	console.log('enterless');
	console.log('default volume=' + default_volume);
	if (default_volume < 0.5) {
		default_volume = 0.7;
		plus.device.setVolume(default_volume);
		console.log('reset volume=' + default_volume);
	}

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
	// $("#vcover").html("<img src='" + cover + "'>");
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
				mui.alert('进入直播间', data.msg);
				jump('index', 'index.html');
				return;
			}
			if (data.rst == 1) {
				initclassroom(data);
				// debuggoless(); // todo delete
				return;
			}
			if (data.rst == 2) { //服务器认为已经在课堂，强制退出
				console.log("server report duplication session");
				quitlesson(false, true);
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
	if (!player[pos]) return;
	player[pos].stop();
	player[pos].close();
	player[pos] = null;
	playername[pos] = "";
	playercoin[pos] = "-";
	tag = "#name" + pos;
	$(tag).text("");
	tag = "#coin" + pos;
	$(tag).text("-");

	// pusher.stop();
	// pusher.start();
	// console.log("pusher.start();346");
}

function addplayer(uid, name, coin, url) {
	pausePusher();

	order = -1;
	for (i = 1; i <= 4; i++)
		if (playername[i] == "") {
			order = i;
			break;
		}
	if (order == -1) return; //table full
	playername[order] = name;
	playercoin[order] = coin;
	playeraddcoin[order] = 0;
	playervideo[order] = url;
	playerid[order] = uid;
	tag = "#name" + order;
	$(tag).text(playername[order]);
	tag = "#coin" + order;
	$(tag).text(playercoin[order]);
	tag = "#v" + order;
	player[order] = createvideo("v" + order, "v" + order, playervideo[order], order);
	if (order > 1) {
		if (isotherplay) {
			player[order].play();
		} else {
			// player[order].pause();
		}
	}

	resumePusher();
	plus.device.setVolume(default_volume);
}

function startlesson(offset, url) {
	if (player[0] != null) return;
	pausePusher();

	console.log('start video:' + offset);
	player[0] = createvideo("vt", "vtarea", url, 0);
	player[0].addEventListener('timeupdate', timeupdate, false);
	player[0].addEventListener('ended', ended, false);
	player[0].addEventListener('error', function(e) {
		mui.alert('video err' + JSON.stringify(e));
		plus.device.setVolume(default_volume);
	}, false);
	testoffset = 0; //debug 
	player[0].seek(testoffset);
	player[0].play();

	resumePusher();
	plus.device.setVolume(default_volume);
}

// 更新直播间用户金币
function updateplaycoin(args) {
	// console.log("updateplaycoin" + args);
	var now_playercoin = JSON.parse(args);
	for (i = 0; i < now_playercoin.length; i++) {
		var id = parseInt(now_playercoin[i].id);
		var coin = parseInt(now_playercoin[i].coin);
		if (id == 0) continue;

		var pos = getPlayPosById(id);
		var old_coin = playercoin[pos];

		if (coin <= old_coin) continue;

		var add_coin = coin - old_coin;
		playeraddcoin[pos] += add_coin;
		playercoin[pos] = coin;
		console.log("玩家" + pos + " 添加了" + add_coin + "个金币");

		showaddcoin(pos);
	}
}

// 添加金币闪烁动画
var blink_t;

// 展示添加金币
function showaddcoin(pos) {
	var mycoin = playercoin[pos];
	$('#coin' + pos).text(mycoin);

	var cointag = "#coin" + pos + "_img";
	var _interv = setInterval(function() {
		if ($(cointag).is(":hidden"))
			$(cointag).show();
		else
			$(cointag).hide();
	}, 100);
	setTimeout(function() {
		if (_interv) {
			clearInterval(_interv);
			_interv = null;
		}
		$(cointag).show();
	}, 800);
}

function getPlayPosById(id) {
	for (i = 1; i <= 4; i++) {
		if (playerid[i] && playerid[i] != "") {
			if (playerid[i] == id)
				return i;
		}
	}
	return -1;
}

function docommand(cmds) {
	cmd = cmds[0];
	if (cmd == "addplayer" && iszhibo == 1) addplayer(cmds[1], cmds[2], cmds[3], cmds[4]);
	else if (cmd == "lessonstart") startlesson(cmds[1], cmds[2]);
	else if (cmd == "leavelesson" && iszhibo == 1) playerleave(cmds[1]);
	else if (cmd == "coinupdate" && iszhibo == 1) updateplaycoin(cmds[1]);
}

function pullmessage() {
	token = localStorage.getItem("token");
	lid = localStorage.getItem("less_id");

	if (token == null || token == "" || typeof(token) == undefined) {
		quitlesson(true, true);
		return null;
	}
	if (lid == null || lid == "" || typeof(lid) == undefined) {
		quitlesson(true, true);
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
				// mui.alert('获取信息', data.msg);
				console.log('pullmessage(),rst=0,---> ' + data.msg)
				quitlesson(true, true);
				return;
			}
			if (data.rst == 1) {
				// console.log(JSON.stringify(data));
				commandcount = data.msgcount;
				for (i = 0; i < commandcount; i++) {
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
			quitlesson(true, true);
		}
	});

}

function createvideo(videoid, divid, url, pos) {
	var odiv = document.getElementById(divid);
	var left = odiv.getBoundingClientRect().left;
	var top = odiv.getBoundingClientRect().top;
	var width = odiv.getBoundingClientRect().width;
	var height = odiv.getBoundingClientRect().height;
	console.log('create refer:' + divid + ',left:' + left + ',top:' + top + ',width:' + width + ',height:' + height);
	// left = left + 2;
	// top = top + 2;
	// width = width - 4;
	// height = height - 4;

	var is_videomuted = false;
	if (pos == 0) {
		is_videomuted = false;
	} else if (pos == 1) {
		is_videomuted = true;
	} else {
		is_videomuted = ismuted;
	}

	var player = plus.video.createVideoPlayer(videoid, {
		src: url, //留点边框
		top: top + 'px',
		left: left + 'px',
		width: width + 'px',
		height: height + 'px',
		muted: is_videomuted,
		'controls': true, // todo delete 测试完关闭控制
		'show-progress': true, // todo delete 测试完关闭控制
		'enable-progress-gesture': true, // todo delete 测试完关闭控制
		'show-fullscreen-btn': false,
		'show-play-btn': false,
		'show-center-play-btn': false,
	});
	// player.addEventListener("error", function(e) {
	// 	console.log("video error " + JSON.stringify(e))
	// }, false);

	// player.addEventListener('waiting', function(e) {
	// 	console.log("video waiting " + JSON.stringify(e));
	// }, false);

	plus.webview.currentWebview().append(player);
	// console.log("#### added video " + pos + " " + url);
	return player;
}

//第三方推流
//https://github.com/zhenyan-chang/RTMP-LivePlay   支持横竖屏切换! 
//https://github.com/runner365/GPUImageRtmpPush   这个更有名
//https://github.com/sandyCK/OpenLiveiOSPusher     这个似乎比较简单,全用第三库
// 又拍云 七牛 阿里 腾讯等 也可以考虑接入,如果老板不在乎这点钱
// 
// 推流
function initPusher(userid) {
	// pushurl = 'rtmp://47.241.111.251/live?vhost=rotate.localhost/' + userid;
	if (mui.os.ios) {
		pushurl2 = 'rtmp://47.114.84.56:1935/live?vhost=rotate.localhost/' + userid; // 阿里	
	} else {
		pushurl2 = 'rtmp://47.114.84.56:1935/live/' + userid; // 阿里
	}

	console.log("pushurl:" + pushurl2);

	var odiv = document.getElementById('v1');
	var left = odiv.getBoundingClientRect().left;
	var top = odiv.getBoundingClientRect().top;
	var width = odiv.getBoundingClientRect().width;
	var height = odiv.getBoundingClientRect().height;
	left = left + 2;
	top = top + 2;
	width = width - 4;
	height = height - 4;

	pusher = new plus.video.LivePusher('pusher-box', {
		'url': pushurl2,
		'aspect': '16:9',
		'mode': 'SD',
		top: top + 'px',
		left: left + 'px',
		width: width + 'px',
		height: height + 'px'
		// 'muted': true,
	});
	if (mui.os.android) {
		plus.webview.currentWebview().append(pusher);
	}


	// 监听状态变化事件
	// pusher.addEventListener("statechange", function(e) {
	// 	console.log('### pusher statechange: ' + JSON.stringify(e));
	// }, false);

	// pusher.addEventListener("error", function(e) {
	// 	console.log('### pusher error: ' + JSON.stringify(e));
	// }, false);

	// pusher.addEventListener("netstatus", function(e) {
	// 	console.log('### pusher netstatus: ' + JSON.stringify(e));
	// }, false);

	// njsAdjustCameraForIOS();
}

function getCameraPara() {
	var cmr = plus.camera.getCamera(2);
	console.log(JSON.stringify(cmr.supportedVideoResolutions));

	var fmt = cmr.supportedVideoFormats[0];
	console.log("Resolution: " + res + ", Format: " + fmt);
	cmr.startVideoCapture(function(path) {
			alert("Capture video success: " + path);
		},
		function(error) {
			alert("Capture video failed: " + error.message);
		}, {
			resolution: res,
			format: fmt
		}
	);
}

// 暂停推流
function pausePusher() {
	if (!pusher) return;
	console.log("pausePusher()");
	pusher.pause();
}

function stopPusher() {
	if (!pusher) return;
	console.log("stopPusher()");
	pusher.stop();
}

function closePusher() {
	if (!pusher) return;
	console.log("closePusher()");
	pusher.close();
}

// 继续推流
var resuming = false;

function resumePusher() {
	if (!pusher) return;
	console.log("resumePusher()");
	pusher.resume();

	setTimeout(function() {
		njsSetAudioSessionForIOS();
	}, 500)

}


// 开始推流
function startPusher() {
	if (!pusher) return;

	console.log("startPusher()");
	pusher.start(function() {
		console.log('Start pusher success!');
	}, function(e) {
		console.log('Start pusher failed: ' + JSON.stringify(e));
	});

	njsSetAudioSessionForIOS();
}

// 推流失败切换国内服务器
function updatePusher(pushurl) {
	if (mui.os.ios) {
		pushurl = pushurl + '/live?vhost=rotate.localhost/' + userid; // 阿里	
	} else {
		pushurl = pushurl + '/live/' + userid; // 阿里
	}

	if (!pusher) return;
	pusher.setStyles({
		url: pushurl
	});
}

function repaireIOS() {
	njsSetAudioSessionForIOS();
	plus.device.setVolume(0.9);
	default_volume = 0.9;

	setTimeout(function() {
		close_wrong();
		load_wrong();
	}, 1000);
}

function njsSetAudioSessionForIOS() {
	if (!mui.os.ios) return;
	// console.log("njsSetAudioSessionForIOS");
	var AVAudioSession = plus.ios.importClass("AVAudioSession");
	AVAudioSession.sharedInstance().setCategorywithOptionserror("AVAudioSessionCategoryMultiRoute",
		"AVAudioSessionCategoryOptionDefaultToSpeaker | AVAudioSessionCategoryOptionAllowBluetooth",
		null);
	AVAudioSession.sharedInstance().setModeerror("AVAudioSessionModeVideoRecording", null);
	AVAudioSession.sharedInstance().setActiveerror("YES", null);
	plus.ios.deleteObject(AVAudioSession);
}

function njsAdjustCameraForIOS() {
	if (!mui.os.ios) return;

	// console.log("njsAdjustCameraForIOS");
	// var h5ca = plus.ios.importClass("H5SetCamera");
	// h5ca.setLanscapeCamera();

	var h5ca = plus.ios.newObject("H5SetCamera");
	plus.ios.invoke(h5ca, "setLanscapeCamera");
	plus.ios.deleteObject(h5ca);
}

// 加载音效
function load_wrong() {
	s_wrong = plus.audio.createPlayer("audio/wrong.mp3");
	s_good = plus.audio.createPlayer("audio/good1.mp3");
}

// 音频
function play_wrong() {
	if (s_wrong) {
		// console.log("play wrong sound");
		s_wrong.stop();
		s_wrong.play();
	}
}

function play_good() {
	if (s_good) {
		// console.log("play good sound");
		s_good.stop();
		s_good.play();
	}
}

function close_wrong() {
	if (s_wrong != null) {
		s_wrong.stop();
		s_wrong.close();
		s_wrong = null;
	}
	if (s_good != null) {
		s_good.stop();
		s_good.close();
		s_good = null;
	}
}
