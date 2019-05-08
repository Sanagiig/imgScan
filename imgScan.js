/**
 * html5调用摄像头扫码
 */
;
(function (win, doc) {
    'use strict'

    function imgScan(div_id) {
        this.div_id = div_id;
        this.div_can = null;
        this.videos = [];
        this.medioConfig = {};
        this.can_open = false;
        this.canvas = doc.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')
        this.init();
    }

    imgScan.prototype = {
        init: function () {

            win.URL = (win.URL || win.webkitURL || win.mozURL || win.msURL);
            var promisifiedOldGUM = function (constraints) {
                var getUserMedia = (navigator.getUserMedia ||
                    navigator.webkitGetUserMedia || navigator.mozGetUserMedia);
                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }
                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            };
            if (navigator.mediaDevices === undefined) {
                navigator.mediaDevices = {};
            }
            if (navigator.mediaDevices.getUserMedia === undefined) {
                navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
            }

            var self = this;
            // 初始化canvas
            self.canvas.setAttribute('id', 'canvas' + Date.now() * Math.random())
            self.canvas.width = 340;
            self.canvas.height = 305;
            self.div_can = doc.getElementById(self.div_id);
            self.div_can.appendChild(self.canvas);
            navigator.mediaDevices.enumerateDevices().then(function (devices) {
                devices.forEach(function (dv) {
                    var kind = dv.kind;
                    if (kind.match(/^video.*/)) {
                        self.videos.push(dv.deviceId);
                    }
                });
                var len = self.videos.length;
                self.can_open = true;
                self.medioConfig = {
                    audio: false,
                    video: {
                        deviceId: self.videos[len - 1]
                    }
                }
            });
        },
        openScan: function () {
            var self = this;
            if (self.can_open) {
                var vd = doc.createElement('video');
                vd.setAttribute('id', 'video_id');
                navigator.mediaDevices.getUserMedia(self.medioConfig).then(function (stream) {
                    try {
                        self.div_can.appendChild(vd);
                        vd.src = win.URL.createObjectURL(stream);
                    } catch (e) {
                        vd.srcObject = stream;
                    }
                    vd.play();
                }).catch(function (err) {
                    console.log('err', err)
                });

            }
        },

        closeScan: function () {
            this.div_can.innerHTML = '';
        },
        // 截图
        updateImage: function (func) {
            var video = doc.getElementById('video_id');
            if (video) {
                this.ctx.drawImage(video, 0, 0, 340, 305);
            }
        },

        Base64ToBlob: function (base64) {
            var code = win.atob(base64.split(',')[1]);
            var len = code.length;
            var as = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                as[i] = code.charCodeAt(i);
            }
            return new Blob([as], {
                type: 'image/png'
            });
        },

        // 上传或处理图片
        getBlob: function (func) {
            if (this.canvas.toBlob === undefined) {
                var base64 = canvas.toDataURL();
                var blob = self.Base64ToBlob(base64);
                func(blob)
            } else {
                this.canvas.toBlob(function (blob) {
                    func(blob)
                });
            }
        },

        // 上传或处理图片(base64)
        getBase64: function (func) {
            func(this.canvas.toDataURL());
        }
    }
    win.imgScan = imgScan;
}(window, document));