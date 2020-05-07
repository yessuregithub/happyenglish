function checklogin() {
	var token = localStorage.getItem("token");
	if (token == null || token == "" || typeof(token) == undefined) {
		jump('login', 'dl.html');
		return null;
	}
	return token;
}


function fetchuserinfo(token) {
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_userinfo.html',
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
				mui.openWindow({
					id: 'login',
					url: 'dl.html'
				});
				return;
			}
			if (data.rst == 1) {
				$("#nickname").text(data.nickname);
				$("#coin").text(data.coin);
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
				mui.openWindow({
					id: 'login',
					url: 'dl.html'
				});
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
				mui.openWindow({
					id: 'login',
					url: 'dl.html'
				});
				return;
			}
			if (data.rst == 1) {
				count = data.count;
				for (i = 0; i < count; i++) {
					if (data.lesson[i].recommed == 1)
						$("#lessons").append(
							"<li><a href ='javascript:kcxq(" + data.lesson[i].id + ")' class='item'><img src='" + data.lesson[i].coverurl +
							"'><div class='mvp'>MVP</div><div class='name'>" + data.lesson[i].engname + "</div></a></li>");
					else
						$("#lessons").append(
							"<li><a href ='javascript:kcxq(" + data.lesson[i].id + ")' class='item'><img src='" + data.lesson[i].coverurl +
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
				$("#title").append("<h4>" + data.lesson.engname + "<br>" + data.lesson.cname + "</h4>");
				if (data.lesson.recommed == 1) $("#title").append("<span><img src='images/kc-mvp.png'></span>");
				$("#coin").text(data.lesson.coin);
				$("#cover").attr('src', data.lesson.coverurl);
				var times = timetrans(data.lesson.starttime);
				$("#time").text(times);
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
				mui.openWindow({
					id: 'login',
					url: 'dl.html'
				});
				return;
			}
			if (data.rst == 1) {
				count = data.count;
				for (i = 0; i < count; i++) {
					if (data.lesson[i].cname == "") title = "<h4>" + data.lesson[i].engname + "</h4>";
					else title = "<p>" + data.lesson[i].engname + "</p><p>" + data.lesson[i].cname + "</p>";
					datetime = Date.now();
					timestamp = Math.floor(datetime / 1000);
					if (parseInt(datetime / 86400) == parseInt(data.lesson[i].starttime / 86400)) istoday = true;
					else istoday = false;
					if (istoday) promptword = "进入教室";
					else promptword = "回看课程";
					$("#lessons ul").append(
						"<li><div class='sliding-title'>" + title + "</div><div class='img-box'><img src='" + data.lesson[i].coverurl +
						"'></div><div class='txt-box'><span>" + starttimetrans(data.lesson[i].starttime, istoday) +
						"</span><a href='zhibo-kt.html' class='jinru'>" + promptword + "</a></div></li>"
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
				var quelist = data.qalist;

				// 布局页面
				var i = 0;
				var _html = "";
				for (i = 0; i < count; i++) {
					var id = quelist[i].id;
					var que = quelist[i].q;
					var ans = quelist[i].a;
					_html += "<li><a href=\"wt-xq.html?id=" + id + "\">" + que + "</a></li>";
					// console.log(count + ',id = ' + id + 'que=' + que);

					// 记录本地缓存
					if (id != null) {
						localStorage.setItem("wtque" + id, que);
						localStorage.setItem("wtans" + id, ans);
					}
				}
				console.log(_html);
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

function getqabyid() {
	var queid = getUrlParam("id");
	var ans = localStorage.getItem("wtans" + queid);
	var que = localStorage.getItem("wtque" + queid);
	
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
	var date = new Date(date * 1000); //如果date为13位不需要乘1000
	var Y = date.getFullYear();
	var M = date.getMonth() + 1;
	var D = date.getDate();
	var h = date.getHours();
	var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
	if (istoday) return '今天' + h + ':' + m + '开课';
	else return Y + '.' + M + '.' + D + '已开课';
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

function jump(title, url) {
	/*	mui.openWindow({
			id: title,
			url: url
		});
		*/
	window.location.href = url;
}
