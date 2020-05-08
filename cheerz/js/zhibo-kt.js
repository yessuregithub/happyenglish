var pusher, token;
var player = new Array(5); // 0<-老师 1<-自己 2-4 同学
var playername = new Array(5);
var playercoin = new Array(5);
var playervideo = new Array(5);

var classid; //课堂编号
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
		setInterval(function() {
			div.innerHTML = showtime(endtime);
		}, 1000); //反复执行函数本身
	} else {
		$("#id_starttime_title").html("请注意保持课堂纪律哦！");
	}
}

function showtime(endtime) {
	var nowtime = new Date(); //获取当前时间
	var lefttime = endtime.getTime() - nowtime.getTime(); //距离结束时间的毫秒数

	// var leftdate = new Date(lefttime);
	// console.log(lefttime + "  , " + leftdate + "  ,  " + endtime + "  ,  " + nowtime);

	var leftd = Math.floor(lefttime / (1000 * 60 * 60 * 24)); //计算天数
	var lefth = Math.floor(lefttime / (1000 * 60 * 60) % 24); //计算小时数
	var leftm = Math.floor(lefttime / (1000 * 60) % 60); //计算分钟数
	var lefts = Math.floor(lefttime / 1000 % 60); //计算秒数
	leftm = leftm < 10 ? "0" + leftm : leftm;
	lefts = lefts < 10 ? "0" + lefts : lefts;
	return lefth + ":" + leftm + ":" + lefts; //返回倒计时的字符串
}

function quitlesson() {
	pusher.stop();
	pusher.close();
	for (i = 1; i <= 4; i++)
		if (player[i] != null) {
			player[i].stop();
			player[i].close();
		}
	jump('index', 'index.html');
}

function initclassroom(data) {
	//console.log(JSON.stringify(data));
	for (i = 1; i <= 4; i++) player[i] = null;
	for (i = 1; i <= 4; i++) {
		playername[i] = data.player[i].name;
		playercoin[i] = data.player[i].coin;
		playervideo[i] = data.player[i].video;
		if (playername[i] != "") {
			tag = "#name" + i;
			$(tag).text(playername[i]);
			tag = "#coin" + i;
			$(tag).text(playercoin[i]);
			tag = "#v" + i;
			$(tag).html("<div id=\"v" + i + "\" style=\"width:100%;height:100%;background-color:#000000\">"); //准备视频区域
			player[i] = createvideo("v" + i, "v" + i, playervideo[i]);
			player[i].play();
		} else {
			tag = "#name" + i;
			$(tag).text("");
			tag = "#coin" + i;
			$(tag).text("-");
			tag = "#v" + i;
			$(tag).html("<img src=\"images/wsx.jpg\">"); //显示未上线
		}
	}
	pusher.start();  //搞不明白为什么必须放在player后面,否则就不能推流!
}

function createvideo(videoid, divid, url) {
	var odiv = document.getElementById(divid);
	var left = odiv.getBoundingClientRect().left;
	var top = odiv.getBoundingClientRect().top;
	var width = odiv.getBoundingClientRect().width;
	var height = odiv.getBoundingClientRect().height;
	var player = plus.video.createVideoPlayer(videoid, {
		src: url,
		top: top,
		left: left,
		width: width,
		height: height,
		direction: -90,
	});
	plus.webview.currentWebview().append(player);
	return player;
}


function createpusher(videoid, divid, url) {
	var pusher = null;
	var odiv = document.getElementById(divid);
	var left = odiv.getBoundingClientRect().left;
	var top = odiv.getBoundingClientRect().top;
	var width = odiv.getBoundingClientRect().width;
	var height = odiv.getBoundingClientRect().height;
	pusher = new plus.video.LivePusher(videoid, {
		url: url,
		mode: 'SD',
		top: top,
		left: left,
		width: width,
		height: height,
	});
	return pusher;
} 


function enterlesson() {
	token = localStorage.getItem("token");
	lid = localStorage.getItem("less_id");

	if (token == null || token == "" || typeof(token) == undefined) {
		jump('login', 'dl.html');
		return null;
	}
	if (lid == null || lid == "" || typeof(lid) == undefined) {
		jump('index', 'index.html');
		return null;
	}
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
				return;
			}
		},
		error: function(xhr, type, errorThrown) {
			// 请求失败  
			mui.alert("网络错误，请稍后再试");
		}
	});
}
