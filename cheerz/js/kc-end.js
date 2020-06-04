function initdata(lid) {
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_getstudyrecord.html',
		data: {
			token: token,
			lid: lid,
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
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
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert('网络错误,请稍后再试');
		}
	});
}
