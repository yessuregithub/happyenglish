function checklogin() {
	var token = localStorage.getItem("token");
	if (token == null || token == "" || typeof(token) == undefined) {
		jump('login', 'dl.html');
		return null;
	}
	return token;
}

var timesele;

function maskmobile(mobile) {
	mask = mobile;
	mask = mask.substr(0, 3) + '**' + mask.substr(8, 11);
	return mask;
}

function fetchuserinfo(token) {
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_userinfo.html',
		data: {
			token: token,
		},
		async: false, //用同步,否则在显示课程时可能还没有返回,不知道上课时间
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {
				localStorage.setItem("token", "");
				jump('login', 'dl.html');
				return;
			}
			if (data.rst == 1) {
				var nickshow = "";
				if (data.engname == null || data.engname == undefined || data.engname == "") {
					if (data.nickname == "") {
						nickshow = maskmobile(data.mobile);
					} else {
						nickshow = data.nickname;
					}
				} else {
					nickshow = data.engname;
				}
				$("#nickname").text(nickshow);
				localStorage.setItem('nickshow', nickshow);
				$("#coin").text(data.coin);
				timesele = data.timesele;
				if (data.avata != "")
					$("#ustx").html("<img src=" + data.avata + ">");
				if (data.timesele == 1) {
					$("#timesele1").attr({
						'class': 'selected'
					});
					$("#timesele2").attr({
						'class': ''
					});
				} else {
					$("#timesele1").attr({
						'class': ''
					});
					$("#timesele2").attr({
						'class': 'selected'
					});
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			// 请求失败  
			mui.alert("网络错误，请稍后再试");
		}
	});
}

function fetchuserinfo1(token) {
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_userinfo1.html',
		data: {
			token: token,
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {
				localStorage.setItem("token", "");
				jump('login', 'dl.html');
				return;
			}
			if (data.rst == 1) {
				$("#nickname").val(data.nickname);
				$("#engname").val(data.engname);
				if (data.birthday != "") bbs = data.birthday;
				else bbs = "请选择生日";
				$("#birthday").text(bbs);
				$("#birthday").attr({
					'default-val': data.birthday
				});
				$("#sex").val(data.sex);
				if (data.avata != "")
					$("#ustx").html("<img class='acc_imgin' src=" + data.avata + ">");
			}
		},
		error: function(xhr, type, errorThrown) {
			// 请求失败  
			mui.alert("网络错误，请稍后再试");
		}
	});
}

function listalllesson() {
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_listlesson.html',
		data: {
			token: "NULL",
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {
				localStorage.setItem("token", "");
				jump('login', 'dl.html');
				return;
			}
			if (data.rst == 1) {
				count = data.count;
				for (i = 0; i < count; i++) {
					if (data.lesson[i].isweekend == 1)
						$("#lessons").append(
							"<li><a href =javascript:zmxq(" + data.lesson[i].id + ",'qb-kc.html') class='item'><img src='" + data.lesson[
								i].coverurl +
							"'><div class='name'>" + data.lesson[i].engname + "</div></a></li>");
					else
						$("#lessons").append(
							"<li><a href =javascript:kcxq(" + data.lesson[i].id + ",'qb-kc.html') class='item'><img src='" + data.lesson[
								i].coverurl +
							"'><div class='name'>" + data.lesson[i].engname + "</div></a></li>");

				}
			}
		},
		error: function(xhr, type, errorThrown) {
			// 请求失败  
			mui.alert("网络错误，请稍后再试");
		}
	});
}


function lessondetail(lid) {
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_lessondetail.html',
		data: {
			lid: lid,
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {
				jump('index', 'index.html');
				return;
			}
			if (data.rst == 1) {
				pbooklink = data.lesson.pbook;
				$("#title").append("<h4>" + data.lesson.engname + "<br>" + data.lesson.cname + "</h4>");
				if (data.lesson.recommed == 1) $("#title").append("<span><img src='images/kc-mvp.png'></span>");
				$("#coin").text(data.lesson.coin);
				$("#cover").attr('src', data.lesson.coverurl);
				//var times = timetrans(data.lesson.starttime);
				$("#time").text(data.lesson.starttime);
				wordcount = data.wordcount;
				for (i = 0; i < wordcount; i++) {
					$("#words ul").append(
						"<li><div class='mui-clearfix'><div class='img-box'><img src='" + data.word[i].pict +
						"'></div><div class='txt-box'><span>" + data.word[i].word + "</span><span>" + data.word[i].cword +
						"</span></div><a href='javascript:playvoice(\"" + data.word[i].voiceurl + "\")' class='laba'></a></div></li>"
					);


				}
			}
		},
		error: function(xhr, type, errorThrown) {
			// 请求失败  
			mui.alert("网络错误，请稍后再试");
		}
	});
}

var lesson_data; // 全局直播课数据
var index_go_link = new Array(10);
// 处理点击index.html课程直播间
function clickedlesson(less_index) {
	weekend = lesson_data[less_index].isweekend;
	if (weekend == 1) {
		clickedlesson1(less_index);
		return;
	}
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_lessonenterrecord.html',
		data: {
			token: token,
			lid: lesson_data[less_index].id,
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			if (data.rst == 0) {
				mui.alert(data.msg);
			} else if (data.rst == 1) {
				clickedlesson1(less_index);
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert('网络错误,请稍后再试');
		}
	});
}

function kcxq(lid, source) {
	localStorage.setItem("value", lid);
	localStorage.setItem("referer", source);
	jump('kcxq', 'kcxq.html');
}

function zmxq(lid, source) {
	localStorage.setItem("value", lid);
	localStorage.setItem("less_id", lid);
	localStorage.setItem("referer", source);
	jump('kcxq', 'zhoumo-xq.html');
}


function clickedlesson1(less_index) {
	if (lesson_data == null) return;
	var i = less_index;
	var starttime = lesson_data[i].starttime;
	localStorage.setItem("less_starttime", starttime);
	localStorage.setItem("less_id", lesson_data[i].id);
	localStorage.setItem("cover", lesson_data[i].coverurl);
	localStorage.setItem("timesele", timesele);
	// jump('index_go', "index_go_link");
	window.location.href = index_go_link[less_index];
	console.log(starttime + ' link:' + index_go_link);
}

function listcurrlesson(token) {

	mui.ajax({
		url: 'http://47.241.5.29/Home_index_listcurrlesson.html',
		data: {
			token: token,
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {

			// 请求成功
			if (data.rst == 0) {
				localStorage.setItem("token", "");
				jump('login', 'dl.html');
				return;
			}
			if (data.rst == 1) {
				if (data.viptill < Date.parse(new Date()) / 1000) isvip = false;
				else isvip = true;
				count = data.count;
				lesson_data = data.lesson;
				dd = new Date().getDay();
				if (dd == 6 || dd == 0) todayweekend = true;
				else todayweekend = false;

				for (i = 0; i < count; i++) {
					//只在周末显示周末游戏
					//debug closed if (!todayweekend && data.lesson[i].isweekend==1) continue;
					if (data.lesson[i].cname == "") title = "<h4>" + data.lesson[i].engname + "</h4>";
					else title = "<p>" + data.lesson[i].engname + "</p><p>" + data.lesson[i].cname + "</p>";
					datetime = Date.now();
					timestamp = Math.floor(datetime / 1000);
					//if (parseInt((timestamp - 28800) / 86400) == parseInt((data.lesson[i].starttime - 28800) / 86400)) istoday =
					if (timetranssimple(timestamp) == data.lesson[i].starttime) istoday = true;
					else istoday = false;
					//console.log("istoday="+istoday);
					if (data.lesson[i].isweekend == "1") isweekend = true;
					else isweekend = false;
					// 开始时间

					if (!isvip) {
						promptword = "历史课程";
						link = 'qb-kc.html';
					} else {
						if (istoday && !isweekend) {
							// 当前进入直播才加金币，互动不加
							localStorage.setItem("isnowzhibo", 1);
							promptword = "进入教室";
							link = 'zhibo-kt.html'
						} else if (istoday && isweekend) {
							promptword = "开始挑战";
							link = "javascript:zmxq(" + data.lesson[i].id + ",'index.html')";
						} else {
							if (isweekend) {
								promptword = "周末挑战详情";
								link = "javascript:zmxq(" + data.lesson[i].id + ",'index.html')";
							} else {
								promptword = "课程详情";
								link = "javascript:kcxq(" + data.lesson[i].id + ",'index.html')";
							}
						};
					}
					console.log("go link:" + link + " weekend:" + isweekend + " today:" + istoday + " lesstime:" + data.lesson[i].starttime);
					//link = 'zhoumo-xq.html' // todo debug
					index_go_link[i] = link;

					$("#lessons ul").append(
						"<li><div class='sliding-title'>" + title + "</div><a href='javascript:clickedlesson(" + i +
						")'><div class='img-box'><img src='" + data.lesson[i].coverurl +
						"'></div></a><div class='txt-box'><span>" + starttimetrans(data.lesson[i].starttime, istoday) +
						"</span><a href='javascript:clickedlesson(" + i + ")' class='jinru'>" + promptword +
						"</a></div></li>"
					);

				}


			}
		},
		error: function(xhr, type, errorThrown) {
			// 请求失败  
			mui.alert("网络错误，请稍后再试");
		}
	});
}

var weekenddata;

function loadweekendlist() {
	lid = localStorage.getItem("less_id");
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_weekendlist.html',
		async: true,
		dataType: 'json',
		type: 'post',
		data: {
			lid: lid,
			token: token,
		},
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {
				jump('index', 'index.html');
				return;
			}
			if (data.rst == 1) {
				datetime = Date.now();
				timestamp = Math.floor(datetime / 1000);
				if (timetranssimple(timestamp) == data.data.starttime) istoday = true;
				else istoday = false;
				// if (istoday) {
				// 	$("#operation1").show();
				// 	$("#operation2").show();
				// } else {
				// 	$("#operation1").hide();
				// 	$("#operation2").hide();
				// }
				$("#operation1").show();
				$("#operation2").show();
				var timesele = localStorage.getItem('timesele');
				if (timesele == "1") ts = "19:30";
				else ts = "20:00";
				$("#cover1").attr("src", data.data.weekendpic1);
				$("#cover2").attr("src", data.data.weekendpic2);
				$("#time1").text("开启时间 " + data.data.starttime + " " + ts);
				$("#time2").text("开启时间 " + data.data.starttime + " " + ts);
				//$("#coin1").text(data.data.coin);
				//$("#coin2").text(data.data.coin);
				weekenddata = data;
				loadbestscore(weekenddata.data.id, weekenddata.data.weekendurl1, "#bestscore1", "#coin1");
				loadbestscore(weekenddata.data.id, weekenddata.data.weekendurl2, "#bestscore2", "#coin2");
				/*
								if (data.data.first == 0) {
									$("#coin1").text("0");
									$("#coin2").text("0");

								}
					*/
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("网络错误，请稍后再试");
		}
	});
}

function loadbestscore(lid, url, tag, tag1) {

	var token = localStorage.getItem("token");
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_bestcharecord.html',
		data: {
			token: token,
			lid: lid,
			gurl: url,
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			console.log("loadbestscore()" + JSON.stringify(data));
			if (data.rst == 0) {} else if (data.rst == 1) {
				bestscore = data.score;
				$(tag).text(bestscore);
				$(tag1).text(data.coin);
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert('网络错误,请稍后再试');
		}
	});
}

// 上传周末游戏分数
function setgamescore(lid, url, gscore) {
	var token = localStorage.getItem("token");
	var verify = md5(lid + url + gscore);

	mui.ajax({
		url: 'http://47.241.5.29/Home_index_charecord.html',
		data: {
			token: token,
			lid: lid,
			gurl: url,
			coin: 20,
			score: gscore,
			verify: verify
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			if (data.rst == 0) {} else if (data.rst == 1) {}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert('网络错误,请稍后再试');
		}
	});
}

// 上传金币
function addcointoserv(coin, cha, memo) {
	cha = cha.replace(/\./g, "");
	cha = cha.replace(/\//g, "");
	memo = memo.replace(/\./g, "");
	memo = memo.replace(/\//g, "");

	console.log("addcointoserv()" + coin)
	var token = localStorage.getItem("token");
	var verify = md5(token + coin + cha); // token+coin+cha

	console.log("token:" + token);
	console.log("coin:" + coin);
	console.log("cha:" + cha);
	console.log("memo:" + memo);
	console.log("verify:" + token + coin + cha);
	console.log("md5:" + verify);

	mui.ajax({
		url: 'http://47.241.5.29/Home_index_addcoin.html',
		data: {
			token: token,
			coin: coin,
			cha: cha,
			memo: memo,
			verify: verify
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			console.log("add coin rst " + JSON.stringify(data));
			if (data.rst == 0) {} else if (data.rst == 1) {}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert('网络错误,请稍后再试');
		}
	});
}

var qalist; // 问题页面的全局数据
function listqa() {
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_qalist.html',

		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {
				jump('index', 'index.html');
				return;
			}
			if (data.rst == 1) {
				var count = data.count;
				qalist = data.qalist;

				// 布局页面
				var i = 0;
				var _html = "";
				for (i = 0; i < count; i++) {
					var id = qalist[i].id;
					var que = qalist[i].q;

					_html += "<li><a href='javascript:clickedquestion(" + id + ")'>" + que + "</a></li>";
				}
				// console.log(_html);

				$("#wt-list").html(_html);
				return;
			}
		},
		error: function(xhr, type, errorThrown) {
			// 请求失败  
			mui.alert("网络错误，请稍后再试");
		}
	});
}
// 点击问答详情
function clickedquestion(queid) {
	var count = qalist.length;
	for (i = 0; i < count; i++) {
		var id = qalist[i].id;
		if (queid == id) {
			var que = qalist[i].q;
			var ans = qalist[i].a;
			localStorage.setItem('ques', que);
			localStorage.setItem('answ', ans);
			jump('detial', "wt-xq.html");
			break;
		}
	}
}


function getwtxq() {
	var ans = localStorage.getItem("answ");
	var que = localStorage.getItem("ques");

	if (ans != null && que != null) {
		var _html1 = "";
		var _html2 = "";
		_html1 += "<span>" + que + "</span>";
		_html2 += "<p>" + ans + "</p>";
		$("#txt-que").html(_html1);
		$("#txt-box").html(_html2);
	}
}

// 获取跳转url参数
function getUrlParam(key) {
	var reg = new RegExp(key + '=([^&]*)');
	var results = location.href.match(reg);
	return results ? results[1] : null;
}

function starttimetrans(date, istoday) {
	if (istoday) {
		if (timesele == 1) ts = "19:30";
		else ts = "20:00";
		return '今天' + ts + '开课';
	} else return date + '开课';
}

function timetrans(date) {
	var date = new Date(date * 1000); //如果date为13位不需要乘1000
	var Y = date.getFullYear() + '.';
	var M = date.getMonth() + 1 + '.';
	var D = date.getDate() + ' ';
	var h = date.getHours() + ':';
	var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
	return Y + M + D + h + m;
}

function timetranssimple(date) {
	var date = new Date(date * 1000); //如果date为13位不需要乘1000
	var Y = date.getFullYear();
	var M = date.getMonth() + 1;
	var D = date.getDate();
	var rst = Y + "-";
	if (M < 10) rst = rst + "0" + M + "-";
	else rst = rst + M + "-";
	if (D < 10) rst = rst + "0" + D;
	else rst = rst + D;

	return rst;
}


function getRandom(min, max) {
	return Math.round(Math.random() * 10000) % max + min;
}

// 返回并重新加载老页面
function jump_setback(url) {
	localStorage.setItem("backurl", window.location.href);
	window.location.href = url;
}

function jump_back() {
	var url = localStorage.getItem("backurl");
	if (url) {
		window.location.href = url;
	}
}

function jump(title, url) {
	/*mui.openWindow({
		id: title,
		url: url
	});
*/
	window.location.href = url;
}

// 获取当前第几周
function getCurrWeek() {
	var d1 = new Date();
	var d2 = new Date();
	d2.setMonth(0);
	d2.setDate(1);
	var rq = d1 - d2;
	var s1 = Math.ceil(rq / (24 * 60 * 60 * 1000));
	var s2 = Math.ceil(s1 / 7);
	console.log("今天是本年第" + s1 + "天，第" + s2 + "周");

	return s2;
}

// json 解析后再转义，否则句子中夹带引号，我发解析
function unescape(str) {
	var rst;
	rst = str.replace(/&quot;/g, "\""); //&quot;
	rst = rst.replace(/\\/g, "");
	return rst;
}

function unescape_quot(str) {
	var rst;
	rst = str.replace(/#/g, "\""); //&quot;
	return rst;
}

function rem2px(remval) {
	var px = lib.flexible.rem2px(remval);
	return px;
}

function px2rem(pxval) {
	var remv = lib.flexible.px2rem(pxval);
	return remv;
}
