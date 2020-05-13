function seqframe(object) {
  return {
    container: object.container, //序列容器
    urlRoot: object.urlRoot, //序列根目录
    imgType: object.imgType || 'png', //序列格式
    frameNumber: object.frameNumber, //序列帧数
    framePerSecond: object.framePerSecond || 18, //每秒帧数
    imgList: {
        length: 0
    },
    percent: 0,
    loadedAutoPlay: object.loadedAutoPlay || false,
    loop: object.loop || 0,  //是否循环，0：无限循环
    pauseTimer: '',  //播放序列计时器
    success: object.success || function(){},  //加载成功执行的函数
    index: 1,  //当前图片序号
    load: function() {
      var that = this;
      for (var start = 1; start <= that.frameNumber; start++) {
        (function(index) {
          var img = new Image();
          img.onload = function() {
              that.imgList.length++;
              that.imgList[index] = this;
              that.percent = Math.round(100 * that.imgList.length / that.frameNumber);
              that.loadSuccess();
              that.autoPlay();
          };
          img.onerror = function() {
              that.imgList.length++;
              that.percent = Math.round(100 * that.imgList.length / that.frameNumber);
              that.loadSuccess();
              that.autoPlay();
          };
          img.src = that.urlRoot + index + '.' + that.imgType;
        })(start);
      }
    },
    play: function() {
      if (this.percent == 100) {
          var that = this;
          that.index = 1;
          var step = function() {
              if(that.index == 1) {
                that.container.innerHTML = '';
              }
              if (that.imgList[that.index - 1]) {
                  that.container.removeChild(that.imgList[that.index - 1]);
              }
              that.container.appendChild(that.imgList[that.index]);
              // 序列增加
              that.index++;
              // 如果超过最大限制
              if (that.index <= that.frameNumber) {
                  that.pauseTimer = setTimeout(step, Math.round(1000 / that.framePerSecond));
              } else {
                  if(that.loop-1 > 0){
                    that.play();
                    that.loop--;
                  }
                  if(that.loop-1 < 0){
                    that.play();
                  }
              }
          };
          step();
      }
    },
    autoPlay: function() {
      if(this.loadedAutoPlay){
        this.play();
      }
    },
    pause: function(callBack) {
      this.loop = 1;
      if(typeof callBack === "function") {
        var restTime = (this.frameNumber - this.index + 3)*Math.round(1000 / this.framePerSecond);
        setTimeout(function() {
          callBack();
        }, restTime)
      }
    },
    loadSuccess: function(successFun) {
      if(this.percent == 100){
        this.success();
      }
    }
  }
}
