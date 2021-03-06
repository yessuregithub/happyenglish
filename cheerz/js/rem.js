/* 
 * minimobile.js v0.0.1 by chenyaowen 
 * 在保留作者签名的情况下，允许使用与商业用途
 */
// var usePadDesign = false;
if (!window.Zepto && !window.jQuery) {
	console.log("minimobile 是基于Zepto.js 或者 jQuery.js 的，请检查页面是否已在miniMobile之前引入！")
};
(function(win, lib) {
	//摘自淘宝移动端
	var doc = win.document;
	var docEl = doc.documentElement;
	var metaEl = doc.querySelector('meta[name="viewport"]');
	var flexibleEl = doc.querySelector('meta[name="flexible"]');
	var dpr = 0;
	var scale = 0;
	var tid;
	var flexible = lib.flexible || (lib.flexible = {});
	var designPixel = 1920; //设计稿件尺寸


	if (mui.os.ipad) {
		console.log("is ipad");
		designPixel = 1920;
	}

	if (metaEl) {
		//console.warn('将根据已有的meta标签来设置缩放比例');       
		var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
		if (match) {
			scale = parseFloat(match[1]);
			dpr = parseInt(1 / scale);
		}
	} else if (flexibleEl) {
		var content = flexibleEl.getAttribute('content');
		if (content) {
			var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
			var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
			if (initialDpr) {
				dpr = parseFloat(initialDpr[1]);
				scale = parseFloat((1 / dpr).toFixed(2));
			}
			if (maximumDpr) {
				dpr = parseFloat(maximumDpr[1]);
				scale = parseFloat((1 / dpr).toFixed(2));
			}
		}
	}
	if (!dpr && !scale) {
		var isAndroid = win.navigator.appVersion.match(/android/gi);
		var isIPhone = win.navigator.appVersion.match(/iphone/gi);
		var devicePixelRatio = win.devicePixelRatio;
		if (isIPhone) {
			if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
				dpr = 3;
			} else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
				dpr = 2;
			} else {
				dpr = 1;
			}
		} else {
			dpr = 1;
		}
		scale = 1 / dpr;
	}

	docEl.setAttribute('data-dpr', dpr);
	if (!metaEl) {
		metaEl = doc.createElement('meta');
		metaEl.setAttribute('name', 'viewport');
		metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale +
			', user-scalable=no');
		if (docEl.firstElementChild) {
			docEl.firstElementChild.appendChild(metaEl);
		} else {
			var wrap = doc.createElement('div');
			wrap.appendChild(metaEl);
			doc.write(wrap.innerHTML);
		}
	}

	// function refreshRem(){
	//     var width = docEl.getBoundingClientRect().width;
	//     if (width / dpr > designPixel) {    //如果分辨率不是1，那么获取的物理宽度应该乘以分辨率，才是最终可用的width
	//         width = width * dpr;
	//     }
	//     var rem = width / (designPixel/100); //计算最终还原到设计图上的比例，从而设置到文档上
	//     docEl.style.fontSize = rem + 'px';
	//     flexible.rem = win.rem = rem;
	// }

	function refreshRem() {
		var width = docEl.getBoundingClientRect().width;
		if (width / dpr > designPixel) { //如果分辨率不是1，那么获取的物理宽度应该乘以分辨率，才是最终可用的width
			width = width * dpr;
		}
		var rem = width / (designPixel / 100); //计算最终还原到设计图上的比例，从而设置到文档上
		// rem *= 1.33; // todo test
		// console.log("usePadDesign = "+usePadDesign);
		// 
		if (mui.os.ipad && typeof usePadDesign != 'undefined' && usePadDesign) {
			rem *= 1.33;
			// console.log('use pad design');
		} else {
			// console.log('use phone design');
		}
		// console.log('dpr = ' + dpr + ' rem = ' + rem + ' bw=' + docEl.getBoundingClientRect().width + 'bh=' + docEl.getBoundingClientRect()
		// 	.height);
		docEl.style.fontSize = rem + 'px';
		flexible.rem = win.rem = rem;
	}

	win.addEventListener('resize', function() {
		clearTimeout(tid);
		tid = setTimeout(refreshRem, 300);
	}, false);
	win.addEventListener('pageshow', function(e) {
		if (e.persisted) {
			clearTimeout(tid);
			tid = setTimeout(refreshRem, 300);
		}
	}, false);

	if (doc.readyState === 'complete') {
		doc.body.style.fontSize = 14 * dpr + 'px';
	} else {
		doc.addEventListener('DOMContentLoaded', function(e) {
			doc.body.style.fontSize = 14 * dpr + 'px';
		}, false);
	}
	refreshRem();

	flexible.dpr = win.dpr = dpr;
	flexible.refreshRem = refreshRem;
	flexible.rem2px = function(d) {
		var val = parseFloat(d) * this.rem;
		if (typeof d === 'string' && d.match(/rem$/)) {
			val += 'px';
		}
		return val;
	}
	flexible.px2rem = function(d) {
		var val = parseFloat(d) / this.rem;
		if (typeof d === 'string' && d.match(/px$/)) {
			val += 'rem';
		}
		return val;
	}

	flexible.pos2px = function(pos) {
		var val = dpr * pos;
		return val;
	}

	flexible.usePadFit = function(touse) {
		if (typeof usePadDesign == 'undefined') return;
		usePadDesign = touse;
		console.log('usePadFit=' + touse);
		this.refreshRem();
	}

})(window, window['lib'] || (window['lib'] = {}));
