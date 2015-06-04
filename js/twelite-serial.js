(function() {
	'use strict';

	var TweLiteSerial = {};
	window.TweLiteSerial = TweLiteSerial;

	// Message to send
	// data: 
	// 	var data = {
	//      deviceID: 0x78, // all child devices
	//      command:  0x80, // send
	//      version: 0x01,
	//      digital: [1, 0, 0, 1], // DI1, DI2, DI3, DI4
	//      digitalChanged: [1, 1, 1, 1], / DI1 changed, DI2 changed, DI3 changed, DI4 changed
	//      pwm1: 0xFFFF,
	//      pwm2: 0xFFFF,
	//      pwm3: 0xFFFF,
	//      pwm4: 0xFFFF,
	//      checkusm: -1 // don't use checksum
	//    };
	TweLiteSerial.Message = function (data) {
		this.data = {};
		if (typeof(data) === 'string') {
			var bucket = data.match(/^:(\w{2})(\w{2})(\w{2})(\w{2})(\w{2})(\w{4})(\w{4})(\w{4})(\w{4})(\w{2})\s*$/);
			bucket = bucket.slice(1);
			var KEYS = [ 'deviceID', 'command', 'version', 'digital', 'digitalChanged', 'pwm1', 'pwm2', 'pwm3', 'pwm4', 'checkusm' ];
			KEYS.forEach(function (key, index) {
				console.log(bucket[index]);
				this[key] = parseInt(bucket[index], 16);
			}, this);
		} else if (typeof(data) === 'object') {
			for (var key in data) {
				if (key === 'digital') {
					this.setDigital(data[key]);
				} else if (key === 'digitalChanged') {
					this.setDigitalChanged(data[key]);
				} else {
					this[key] = data[key];
				}
			}
		}
	}

	TweLiteSerial.Message.prototype = {
		//
		// output:
		// 	deviceID (1-byte) 送信先の論理デバイスID (0x00=親機, 0x78=全ての子機)
		// 	command  (1-byte) コマンド(0x80: 送信)
		// 	version  (1-byte) プロトコルバージョン (0x01 固定)
		// 	digital  (1-byte) DI の状態ビット。DI1(0x1) DI2(0x2) DI3(0x4) DI4(0x8)。1がOn(Lowレベル)。
		// 	digitalChanged (1-byte) DI1(0x1) DI2(0x2) DI3(0x4) DI4(0x8)。1が変更対象。
		// 	pwm1     (2-byte) PWM
		// 	pwm2     (2-byte) PWM
		// 	pwm3     (2-byte) PWM
		// 	pwm4     (2-byte) PWM
		// 	checkusm (1-byte) チェックサム		
		//
		makeLine: function() {
			var data = this.data;
			var message = ':' +
				data.deviceID +
				data.command +
				data.version +
				data.digital +
				data.digitalChanged +
				data.pwm1 + data.pwm2 + data.pwm3 + data.pwm4 +
				data.checkusm;
			return message
		},
		set deviceID(value) {
			this.data.deviceID = TweLiteSerial.hexString(value);
		},
		set command(value) {
			this.data.command = TweLiteSerial.hexString(value);
		},
		set version(value) {
			this.data.version = TweLiteSerial.hexString(value);
		},
		set digital(value) {
			this.data.digital = TweLiteSerial.hexString(value);
		},
		set digitalChanged(value) {
			this.data.digitalChanged = TweLiteSerial.hexString(value);
		},
		set pwm1(value) {
			this.data.pwm1 = TweLiteSerial.hexString(value, 2);
		},
		set pwm2(value) {
			this.data.pwm2 = TweLiteSerial.hexString(value, 2);
		},
		set pwm3(value) {
			this.data.pwm3 = TweLiteSerial.hexString(value, 2);
		},
		set pwm4(value) {
			this.data.pwm4 = TweLiteSerial.hexString(value, 2);
		},
		set checkusm(value) {
			if (value < 0) {
				this.data.checkusm = 'X'; // don't calc checksum
			} else {
				this.data.checkusm = TweLiteSerial.hexString(value);
			}
		},

		setDigital: function(digitalInputs, updateDigitalChanged) {
    	if (digitalInputs.length != 4) {
    		throw new RangeError('Digital input length ' + digitalInputs.length + ' is invalid');
    	}
			var digital = bitArrayToByte(digitalInputs);
			if (updateDigitalChanged) {
				var currentDigital = parseInt(this.data.digital);
				var changed = digital ^ currentDigital;
				this.digitalChanged = changed;
			}
			this.digital = digital;
		},

		setDigitalChanged: function(digitalChanged) {
    	if (digitalChanged.length != 4) {
    		throw new RangeError('Digital changed length ' + digitalChanged.length + ' is invalid');
    	}
			this.digitalChanged = bitArrayToByte(digitalChanged);
		}
	};

	//
	// size: size of the number in count of bytes
	//
	TweLiteSerial.hexString = function (number, size) {
		var _size = (size || 1);
		var hex = Number(number).toString(16);	
		var padSize = (_size * 2) - hex.length;
		var pad = '';
		for (var i = 0; i < padSize; i++) {
			pad += '0';
		}
		return (pad + hex).toUpperCase();
	}

	//
	// deviceID   [0](1-byte) 送信元の論理デバイスID (0x78 は子機からの通知)
	// command    [1](1-byte) コマンド(0x81: IO状態の通知)
	// packetID   [2](1-byte) パケット識別子 (アプリケーションIDより生成される)
	// version    [3](1-byte) プロトコルバージョン (0x01 固定)
	// lqi        [4](1-byte) LQI値、電波強度に応じた値で 0xFF が最大、0x00 が最小
	// uniqueID   [5](4-byte) 送信元の個体識別番号
	// receiverID [6](1-byte) 宛先の論理デバイスID
	// timestamp  [7](2-byte) タイムスタンプ (秒64カウント)
	// relayed    [8](1-byte) 中継フラグ(中継済みなら1)
	// voltage    [9](2-byte) 電源電圧[mV]
	// unused    [10](1-byte) 未使用
	// digital          [11](1-byte) DI の状態ビット。DI1(0x1) DI2(0x2) DI3(0x4) DI4(0x8)。1がOn(Lowレベル)。
	// digitalChanged   [12](1-byte) DI1(0x1) DI2(0x2) DI3(0x4) DI4(0x8)。1が変更対象。
	// analog           [13](4-byte) e1～e4: AD1～AD4の変換値。0～2000[mV]のAD値を16で割った値を格納。
	// analogCorrection [14](1-byte) AD1～AD4の補正値　（LSBから順に２ビットずつ補正値、LSB側が　AD1, MSB側が AD4）
	// checkusm         [15](1-byte) チェックサム
	//
	TweLiteSerial.parseLine = function (line) {
		var data = {};
		var bucket = line.match(/^:(\w{2})(\w{2})(\w{2})(\w{2})(\w{2})(\w{8})(\w{2})(\w{4})(\w{2})(\w{4})(\w{2})(\w{2})(\w{2})(\w{8})(\w{2})(\w{1,2})\s*$/);
		bucket = bucket.slice(1);
		var KEYS = [ 'deviceID', 'command', 'packetID', 'version', 'lqi', 'uniqueID', 'receiverID', 'timestamp', 'relayed', 'voltage', 'unused', 'digital', 'digitalChanged', 'analog', 'analogCorrection', 'checksum' ];
		var analog;
		KEYS.forEach(function(key, index) {
			switch (key) {
			case 'digital':
			case 'digitalChanged':
				data[key] = parseDigital(bucket[index]);
				break;
			case 'analog':
				data[key] = parseAnalog(bucket[index], bucket[index+1]);
			case 'analogCorrection':
				break;
			default:
				data[key] = parseInt(bucket[index], 16);
			}
		});
		return data;
	}

	function parseDigital(hexDigital) {
		var digital = [];
		var digitalValue = parseInt(hexDigital, 16);
		for (var i = 0; i < 4; i++) {
			digital[i] = (digitalValue >> i) & 0x1;
		}
		return digital;
	}

	function parseAnalog(hexAnalog, hexAnalogCorrection) {
		var analog = [];
		var correction = parseInt(hexAnalogCorrection, 16);
		for (var i = 0; i < 4; i++) {
			var av = parseInt(hexAnalog.substr(i*2, 2), 16);
			if (av == 0xFF) {
				analog[i] = -1;
			} else {
				var cor = (correction >> (i * 2)) & 0x03;
				analog[i] = (av * 4 + cor) * 4;
			}
		}
		return analog;
	}

	function bitArrayToByte(array) {
		var value = 0;
    for (var i = 0; i < array.length; i++) {
    	var bit = array[i];
    	if (!(bit == 0 || bit == 1)) {
    		throw new RangeError('Bit value ' + bit + ' should be 1 or 0');
    	}
    	value |= (bit << i);
    }
    return value;
	}
})();
