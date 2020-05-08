function kt_setstarttime() {
	var starttime_ts = localStorage.getItem("less_startime");
	if (starttime_ts == null) return;

	datetime = Date.now();
	timestamp = Math.floor(datetime / 1000);
	if (parseInt(timestamp / 86400) == parseInt(starttime_ts / 86400)) istoday = true;
	else istoday = false;

	// 倒数计时
	if (istoday) {
		var div = document.getElementById("id_startime");
		var endtime = new Date(parseInt(starttime_ts) * 1000);
		setInterval(function() {
			div.innerHTML = showtime(endtime);
		}, 1000); //反复执行函数本身
	} else {
		$("#id_startime_title").html("");
	}
}


function showtime(endtime) {
	var nowtime = new Date(); //获取当前时间
	// endtime = new Date("2020/8/8");  //定义结束时间
	var lefttime = endtime.getTime() - nowtime.getTime(); //距离结束时间的毫秒数
	// var leftd = Math.floor(lefttime / (1000 * 60 * 60 * 24)); //计算天数
	var lefth = Math.floor(lefttime / (1000 * 60 * 60) % 24); //计算小时数
	var leftm = Math.floor(lefttime / (1000 * 60) % 60); //计算分钟数
	var lefts = Math.floor(lefttime / 1000 % 60); //计算秒数
	return lefth + ":" + leftm + ":" + lefts; //返回倒计时的字符串
}
