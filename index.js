var url = require('url');
var crypto = require('crypto');
var request = require('request');
var _ = require('lodash');

// isv签名库
var WechatCrypto = require('wechat-crypto');

// ISV api列表
var apis = [{
    path: 'get_permanent_code',
    alias: '',
    method: 'POST'
}, {
    path: 'get_auth_info',
    method: 'POST'
}, {
    path: 'get_agent',
    method: 'POST'
}, {
    path: 'activate_suite',
    method: 'POST'
}, {
    path: 'get_corp_token',
    method: 'POST'
}, {
    path: 'set_corp_ipwhitelist',
    method: 'POST'
}]

// 记录suite_access_token
var token;
// 记录suite_access_token过期时间
var tokenExpireTime;

/**
 * config
 * @param {string} token 创建套件时自定义的token
 * @param {string} encodingAESKey 创建套件时填写的加密秘钥
 * @param {string} suiteKey 套件key，当还没有创建套件时，请一定留空
 * @param {string} suiteSecret 套件secret，创建套件后才有，当还没有创建套件时可留空，创建成功后需要更新该值
 * @param {string} suiteTicket 获取套件token的时候是需要ticket的，请务必在调用接口前先拿到ticket，如果是首次使用，该值为空，需要在拿到推送ticket后保存该值，后续访问需要自行维护ticket
 usage: 
    var isv = new App({
        token: 'token',
        encodingAESKey: 'some key',
        suiteKey: 'suitekey',
        suiteSecret: 'suitesecret',
        suiteTicket: ''
    })
    isv.receive()
 **/
function App(config) {

    var defaults = {
        domain: 'https://oapi.dingtalk.com/service'
    };
    this.config = _.assign(defaults, config);

    this.cipher = new WechatCrypto(config.token, config.encodingAESKey, config.suiteKey || 'suite4xxxxxxxxxxxxxxx');

}
/**
 * 获取套件访问Token（suite_access_token）
 * @param {fun} callback 回调
 * @returns {undefined}
 **/
App.prototype.getToken = function(callback) {
    //log('获取token')
    var key = this.config.suiteKey;
    var secret = this.config.suiteSecret;
    var ticket = this.config.suiteTicket;
    request({
        method: 'POST',
        url: this.config.domain + '/get_suite_token',
        json: true,
        body: {
            suite_key: key,
            suite_secret: secret,
            suite_ticket: ticket
        }
    }, function(err, response, body) {
        if (err || !body || !body.suite_access_token) {
            //log('出错了', err);
            return callback && callback(err || 'request token error');
        }
        //console.log('token', body);
        token = body.suite_access_token;
        tokenExpireTime = Date.now() + body.expires_in * 1000 - 200;
        //console.log('记录token和过期时间', token, tokenExpireTime)
        callback && callback(err, token);
    })
}

/**
 * 统一请求接口
 * @param {string} path 请求路径，bui自动拼接成完整的url
 * @param {object} params 请求参数集合
 * @param {function} callback  回调，请求成功与否都会触发回调，成功回调会回传数据
 * @returns {undefined} 
 **/
App.prototype.doRequest = function(path, params, callback) {
    var _this = this;
    var action = function(t) {
        var url = _this.config.domain + '/' + path;
        if (t) {
            url += '?suite_access_token=' + t;
        }
        var method = 'GET';
        if (params.method === 'POST') {
            delete params.method;
            method = 'POST';
        }
        var obj = {
            method: method,
            url: url,
            json: true
        };

        if (method === 'POST') {
            obj.body = params;
        } else {
            obj.qs = params;
        }
        //console.log('request ===> ', url, JSON.stringify(obj, null, 4), '<===');
        //log('请求参数：', obj)
        request(obj, function(err, response, body) {
            // TODO: 如果token中途被打断，需要重新获取
            callback && callback(err, body);
        })
    };
    //判断是否有token，是否过期，过期的话重新获取
    if (token && tokenExpireTime && Date.now() < tokenExpireTime) {
        action(token);
    } else {
        // token过期或者未设置
        this.getToken(function(err, token) {
            if (err || !token) {
                return callback && callback(err || 'getToken error');
            }
            action(token);
        });
    }
}


/**
 * 批量生成接口
 **/
apis.forEach(function(item) {
    var p = item.path;
    var method = item.method;
    var alias = item.alias;
    var functionName = _.camelCase(alias || p);
    App.prototype[functionName] = function(params, callback) {
        if (_.isFunction(params)) {
            callback = params;
            params = {};
        }
        var params = params || {};
        var callback = callback || function() {};
        if (method === 'POST') {
            params.method = 'POST';
        }
        this.doRequest(p, params, function(err, json) {
            if (err) {
                //log('获取数据失败');
            }
            callback(err, json);
        });
    }
});

/**
 * 处理钉钉服务推送的信息
 * @param {obj} body 钉钉服务端推送的消息，如{encrypt: 'fjowjaofjowaf'}
 * @returns {obj} 加密后的信息
 **/
App.prototype.receive = function(body) {
    if (!body || !body.encrypt) {
        return;
    }
    var encrypt = body.encrypt;

    //解密推送信息
    var data = this.cipher.decrypt(encrypt);
    //解析数据结构
    var json = JSON.parse(data.message) || {};
    var msg = '';
    //处理不同类型的推送数据
    switch (json.EventType) {
        case 'check_create_suite_url':
            msg = json['Random'];
            break;
        case 'suite_ticket':
            this.cipher.id = json['SuiteKey'];
            this.config.suiteKey = json['SuiteKey'];
            this.config.suiteTicket = json['SuiteTicket'];
            //console.log('拿到suiteTicket', this.config.suiteTicket)
            msg = 'success';
            break;
        case 'tmp_auth_code':
            msg = 'success';
            break;
        case 'change_auth':
            msg = 'success';
            break;
        case 'check_update_suite_url':
            msg = json['Random'];
            break;
        case 'suite_relieve':
            msg = 'success';
        case 'check_suite_license_code':
            msg = 'success';
            break;
    }
    //加密文本
    var text = this.cipher.encrypt(msg);
    //生成随机串
    var stmp = Date.now();
    //生成随机数
    var nonce = Math.random().toString(36).substring(2);

    //签名文本
    var sign = this.cipher.getSignature(stmp, nonce, text);

    //返回给推送服务器的信息
    var result = {
        msg_signature: sign,
        timeStamp: stmp,
        nonce: nonce,
        encrypt: text
    };

    return {
        json: json,
        result: result
    };
}

/**
 * 签名jsapiticket
 * @param {obj} params 参数
    {
        nonceStr: Math.random().toString(36).substring(2), // 随机字符串
        ticket: ticket, // 通过企业api接口获取企业js_api_ticket  https://oapi.dingtalk.com/get_jsapi_ticket
        timeStamp: Date.now(), // 时间戳
        url: '' //当前页面的url
    }
 * @returns {string} 签名
 **/
App.prototype.signTicket = function(params) {
    var origUrl = params.url;
    var origUrlObj = url.parse(origUrl);
    delete origUrlObj['hash'];
    var newUrl = url.format(origUrlObj);
    var plain = 'jsapi_ticket=' + params.ticket +
        '&noncestr=' + params.nonceStr +
        '&timestamp=' + params.timeStamp +
        '&url=' + newUrl;

    var sha1 = crypto.createHash('sha1');
    sha1.update(plain, 'utf8');
    var signature = sha1.digest('hex');
    return signature;
}

module.exports = App;