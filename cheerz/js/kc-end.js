function initdata(lid) {
	comefrom = localStorage.getItem("referer");
	console.log("comefrom=" + comefrom);
	if (comefrom.indexOf("zhibo-kt.html") != -1) {
		fromtype = 1;
	} else {
		fromtype = 2;
		returnlink = "kcxq.html";
	}
	console.log("fromtype=" + fromtype);
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_getstudyrecord.html',
		data: {
			token: token,
			lid: lid,
			type: fromtype
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			console.log("getstudyrecord() " + "lid:" + lid + JSON.stringify(data));

			if (data.rst == 0) {
				jump('login', 'dl.html');
			} else if (data.rst == 2) {
				mui.alert('你还没有学习过本课哦!');
			} else if (data.rst == 1) {
				$("#lessonname").text(data.lessonname);
				$("#nickname").text(data.nickname);
				$("#coincount").text(data.coincount);
				$("#wordcount").text(data.wordcount);
				$("#order").text(data.order);
				$("#lessoncount").text(data.lessoncount);
				$norder = parseInt(data.order);
				if ($norder != 1) {
					$("#mvp").html("");
					$("#fx_mvp").html("");
				}

				// 分享设置图
				var cover = localStorage.getItem('cover');
				cover = cover + "?" + new Date().getTime();
				// cover = "images/donghua.png"; // test
				// console.log(cover);
				// console.log(data.avata);
				$("#fx_nickname").text(data.nickname);
				$("#fx_coincount").text(data.coincount);
				$("#fx_wordcount").text(data.wordcount);
				$("#fx_lessoncount").text(data.lessoncount);
				$("#cover").attr('src', cover);
				if (data.avata != "") {
					$("#ustx").html("<img class='acc_imgin' src=" + data.avata + ">");
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert('网络错误,请稍后再试');
		}
	});
}

function share_div(share_type) {
	console.log('share_div:' + share_type);
	clipDomImage('fen', 'hpyy_share.png', false, true, share_type);
}

// 截图
var ws; // 当前窗口
function clipDomImage(domID, fileName, showScreen, save_doc, share_type) {
	console.log("clipDomImage");
	var odiv = document.getElementById(domID);
	if (!odiv) return;

	plus.nativeUI.showWaiting();


	var left = odiv.getBoundingClientRect().left;
	var top = odiv.getBoundingClientRect().top;
	var width = odiv.getBoundingClientRect().width;
	var height = odiv.getBoundingClientRect().height;

	left = left.toFixed(2);
	top = top.toFixed(2);
	width = width.toFixed(2);
	height = height.toFixed(2);


	var clipregin = {
		'top': top + 'px',
		'left': left + 'px',
		'width': width + 'px',
		'height': height + 'px'
	};

	var wsclip = {
		top: '0px',
		left: '0px',
		width: '100%',
		height: '100%'
	};
	if (mui.os.ios) {
		wsclip = clipregin;
	}

	console.log('clipregin:' + JSON.stringify(clipregin));

	var bitmap = new plus.nativeObj.Bitmap('bitmap');

	var save_succ = false;
	ws.draw(bitmap, function() {
		console.log('截屏绘制图片成功');
		save_succ = true;

		// 显示到屏幕上
		console.log('save_succ' + save_succ);
		if (showScreen && save_succ) {
			var img = new Image();
			img.src = bitmap.toBase64Data();
			if (document.getElementById('show_box')) {
				document.getElementById('show_box').appendChild(img);
			}
		}

		// 保存相册
		if (save_doc && save_succ) {
			save_share(bitmap, clipregin, fileName, share_type);
		} else {
			bitmap.clear();
		}
		plus.nativeUI.closeWaiting();
	}, function(e) {
		save_succ = false;
		console.log('截屏绘制图片失败：' + JSON.stringify(e));
		plus.nativeUI.closeWaiting();
	}, {
		clip: wsclip
	});
}


function save_share(bitmap, clipregin, filename, share_type) {
	var savealbum = false;
	var clip = {
		top: '0px',
		left: '0px',
		width: '100%',
		height: '100%'
	}; 
	if(mui.os.android) {
		clip = clipregin;
	}
	bitmap.save(
		"_doc/" + filename, {
			overwrite: true,
			clip: clip
		},
		function(i) {
			//保存到系统相册
			plus.gallery.save(
				i.target,
				function(d) {
					//销毁Bitmap图片
					bitmap.clear();
					savealbum = true;
					console.log("保存图片到相册成功");

					// 分享
					if (share_type != -1) {
						var path = "file://" + plus.io.convertLocalFileSystemURL("_doc/" + filename);
						shareImage(path, share_type); //传入参数调用微信分享接口			
					} else {
						plus.nativeUI.alert('已保存至您的相册');
					}
				},
				function() {
					savealbum = false;
					console.log("保存保存失败");
				}
			);
		},
		function() {
			bitmap.clear();
		}
	);
}

// 分享分类
var shares = null;
var sweixin = null;
var buttons = [{
		title: '我的好友',
		extra: {
			scene: 'WXSceneSession'
		}
	},
	{
		title: '朋友圈',
		extra: {
			scene: 'WXSceneTimeline'
		}
	}
];

/**
 * 分享服务
 */
function updateSerivces() {
	plus.share.getServices(function(s) {
		shares = {};
		for (var i in s) {
			var t = s[i];
			shares[t.id] = t;
		}
		sweixin = shares['weixin'];
	}, function(e) {
		console('获取分享服务列表失败：' + e.message);
	});
}

// 分享图片
function shareImage(path, sharetype) {
	console.log("sharetype:" + sharetype);
	var msg = {
		type: 'image'
	};

	msg.pictures = [path];
	if (sharetype == -1) {
		// 相册
		share(sweixin, msg, -1);
		return;
	}

	if (sweixin) {
		// 好友
		if (sharetype == 1) {
			share(sweixin, msg, buttons[0]);
		} else if (sharetype == 2) {
			// 朋友圈
			share(sweixin, msg, buttons[1]);
		}
	} else {
		console.log('当前环境不支持微信分享操作');
		plus.nativeUI.alert('当前环境不支持微信分享操作!');
	}
}

// 分享
function share(srv, msg, button) {

	if (!srv) {
		//console('无效的分享服务！');
		return;
	}
	if (button.extra == -1) {
		if (savealbum) {
			plus.nativeUI.alert('保存相册成功');
		}
		return;
	}
	button && (msg.extra = button.extra);
	// 发送分享
	if (srv.authenticated) {
		//console('---已授权---');
		doShare(srv, msg);
	} else {
		//console('---未授权---');
		srv.authorize(function() {
			doShare(srv, msg);
		}, function(e) {
			console('认证授权失败：' + JSON.stringify(e));
		});
	}
}
// 发送分享
function doShare(srv, msg) {
	//console(JSON.stringify(msg));
	srv.send(msg, function() {
		console('分享到"' + srv.description + '"成功！');
	}, function(e) {
		console('分享到"' + srv.description + '"失败: ' + JSON.stringify(e));
	});
}
