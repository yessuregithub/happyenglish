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
				console.log(cover);
				$("#fx_nickname").text(data.nickname);
				$("#fx_coincount").text(data.coincount);
				$("#fx_wordcount").text(data.wordcount);
				$("#fx_lessoncount").text(data.lessoncount);
				$("#cover").attr('src', cover);
				$("#ustx").html("<img class='acc_imgin' src=" + data.avata + ">");
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert('网络错误,请稍后再试');
		}
	});
}

shareY(T) {
	$(".mui-ex").hide();
	plus.nativeUI.showWaiting("正在生成图片...");
	if (T == 1) {
		var cntElem = document.getElementById('fen');
	} else {
		var cntElem = document.getElementById('fen');
	}

	var shareContent = cntElem; //需要截图的包裹的（原生的）DOM 对象
	var width = shareContent.offsetWidth; //获取dom 宽度
	var height = shareContent.offsetHeight; //获取dom 高度
	var canvas = document.createElement("canvas"); //创建一个canvas节点
	var scale = 2; //定义任意放大倍数 支持小数
	canvas.width = width * scale; //定义canvas 宽度 * 缩放
	canvas.height = height * scale; //定义canvas高度 *缩放
	canvas.getContext("2d").scale(scale, scale); //获取context,设置scale 
	var opts = {
		scale: scale, // 添加的scale 参数
		canvas: canvas, //自定义 canvas
		// logging: true, //日志开关，便于查看html2canvas的内部执行流程
		width: width, //dom 原始宽度
		height: height,
		useCORS: true // 【重要】开启跨域配置
	};

	html2canvas(shareContent, opts).then(function(canvas) {
		// H5 plus事件处理

		var context = canvas.getContext('2d');
		// 【重要】关闭抗锯齿
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.msImageSmoothingEnabled = false;
		context.imageSmoothingEnabled = false;
		var dataUrl = canvas.toDataURL("image/jpeg");

		var bitmap = new plus.nativeObj.Bitmap();
		var result = new Date().getTime();
		var filename = result + "_picture" + ".jpeg";
		bitmap.loadBase64Data(dataUrl);

		bitmap.save(
			"_doc/" + filename, {
				overwrite: true
			},
			function(i) {
				//保存到系统相册
				plus.gallery.save(
					i.target,
					function(d) {
						//销毁Bitmap图片
						bitmap.clear();
						console.log("保存图片到相册成功");
					},
					function() {
						console.log("保存保存失败");
					}
				);
			},
			function() {
				bitmap.clear();
			}
		);
		plus.nativeUI.closeWaiting();
		var path = "file://" + plus.io.convertLocalFileSystemURL("_doc/" + filename);
		shareImage(path); //传入参数调用微信分享接口
	})
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
		},
		{
			title: '我的收藏',
			extra: {
				scene: 'WXSceneFavorite'
			}
		}
	];

	// H5 plus事件处理
	// function plusReady() {
	// 	updateSerivces();
	// }
	// if (window.plus) {
	// 	plusReady();
	// } else {
	// 	document.addEventListener('plusready', plusReady, false);
	// }
	/**
	 * 更新分享服务
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
	function shareImage(path) {
		var msg = {
			type: 'image'
		};

		msg.pictures = [path];
		//console.log(msg.pictures)
		sweixin ? plus.nativeUI.actionSheet({
			title: '分享图片到微信',
			cancel: '取消',
			buttons: buttons
		}, function(e) {
			(e.index > 0) && share(sweixin, msg, buttons[e.index - 1]);
		}) : plus.nativeUI.alert('当前环境不支持微信分享操作!');
	}

	// 分享
	function share(srv, msg, button) {

		if (!srv) {
			//console('无效的分享服务！');
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
				//console('认证授权失败：' + JSON.stringify(e));
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

},
