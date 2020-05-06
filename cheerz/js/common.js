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
					l_ename = data.lesson[i].engname;
					l_coverurl = data.lesson[i].coverurl;
					l_recommed = data.lesson[i].recommed;
					l_id=data.lesson[i].id;
					if (l_recommed == 1)
						$("#lessons").append(
							"<li><a href ='javascript:kcxq("+l_id+")' class='item'><img src='" + l_coverurl +
							"'><div class='mvp'>MVP</div><div class='name'>" + l_ename + "</div></a></li>");
					else
						$("#lessons").append(
							"<li><a href ='javascript:kcxq("+l_id+")' class='item'><img src='" + l_coverurl +
							"'><div class='name'>" + l_ename + "</div></a></li>");

				}
			}
		},
		error: function(xhr, type, errorThrown) {
			// 请求失败  
			mui.alert("网络错误，请稍后再试");
		}
	});
}

function jump(title, url) {
	/*	mui.openWindow({
			id: title,
			url: url
		});
		*/
	window.location.href = url;
}
