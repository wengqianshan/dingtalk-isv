# dingtalk-isv

## API

#### receive

> 接收服务端推送消息

接收参数
````
{
    encrypt: 'fjowjaofjowaffewafewaf=='
}
````

返回
````
{
    json: {
        "EventType": "suite_ticket",
        "SuiteKey": "suite123456788",
        "SuiteTicket": "fewafjeowafjoewjafoeawjfioewa",
        "TimeStamp": "1418984194106"
    },
    result: {
        msg_signature: 'fjeowajfoewajfieawjfiejwaoif',
        timeStamp: 1418984194116,
        nonce: 'xjfjoifjewjoa',
        encrypt: 'jfoewjafioejawfjewaifewiafnauif'
    }
}
````

#### signTicket

> 签名 js api ticket

接收参数
````
{
    nonceStr: Math.random().toString(36).substring(2), // 随机字符串
    ticket: ticket, // 通过企业api接口获取企业js_api_ticket  https://oapi.dingtalk.com/get_jsapi_ticket
    timeStamp: Date.now(), // 时间戳
    url: '' //当前页面的url
}
````

返回
````
oc2VTMHyQ4gXmnDk/b2B/0nv+iBB1lEok6odjk4hYFhpd
````


#### getPermanentCode

> 获取企业的永久授权码

接收参数
````
{
    "tmp_auth_code": " value"
}
````

返回
````
{
    "permanent_code": "xxxx",
    "auth_corp_info":
    {
        "corpid": "xxxx",
        "corp_name": "name"
    }
}
````

详见: https://open-doc.dingtalk.com/doc2/detail.htm?treeId=175&articleId=104945&docType=1#s3

#### getAuthInfo

> 获取企业授权的授权数据

接收参数
````
{
    "auth_corpid":"auth_corpid_value",
    "permanent_code":"code_value",
    "suite_key":"key_value"
}
````

返回
````
{
   "auth_corp_info":{
      "corp_logo_url":"http://xxxx.png",
      "corp_name":"corpid",
      "corpid":"auth_corpid_value",
      "industry":"互联网",
      "invite_code" : "1001",
      "license_code": "xxxxx",
          "auth_channel": "xxxxx",
      "is_authenticated":true,
      "invite_url":"invite_url:https://yfm.dingtalk.com/invite/index?code=xxxx"
    },
    "auth_user_info":
    {
        "userId":""
    },
    "auth_info":{
    "agent":[{
            "agent_name":"aaaa",
            "agentid":1,
            "appid":-3,
            "logo_url":"http://aaaaaa.com"
    }
    ,{
            "agent_name":"bbbb",
            "agentid":4,
            "appid":-2,
            "logo_url":"http://vvvvvv.com"
    }]
    },
          "errcode":0,
          "errmsg":"ok"
}
````

详见: https://open-doc.dingtalk.com/doc2/detail.htm?treeId=175&articleId=104945&docType=1#s5

#### getAgent

> 获取企业的应用信息

接收参数
````
{   "suite_key":"key_value",
    "auth_corpid":"auth_corpid_value",
    "permanent_code":"code_value",
    "agentid":541
}
````

返回
````
{
    "agentid":541,
    "name":"公告",
    "logo_url":"http://xxxxxxx/png",
    "description":"企业重要消息",
    "close":1,
    "errcode":0,
    "errmsg":"ok"
}
````

详见: https://open-doc.dingtalk.com/doc2/detail.htm?treeId=175&articleId=104945&docType=1#s6

#### activateSuite

> 激活授权套件

接收参数
````
{
    "suite_key":"key_value",
    "auth_corpid":"auth_corpid_value",
    "permanent_code":"permanent_code"
}
````

返回
````
{
    "errcode":0,
    "errmsg":"ok"
}
````

详见: https://open-doc.dingtalk.com/doc2/detail.htm?treeId=175&articleId=104945&docType=1#s7

#### getCorpToken 

> 获取企业授权的access_token

接收参数
````
{
    "auth_corpid": "auth_corpid_value",
    "permanent_code": "code_value"
}
````

返回
````
{
    "access_token": "xxxxxx",
    "expires_in": 7200
}
````

详见: https://open-doc.dingtalk.com/doc2/detail.htm?treeId=175&articleId=104945&docType=1#s4

#### setCorpIpwhitelist

> ISV为授权方的企业单独设置IP白名单

接收参数
````
{
    "auth_corpid":"dingabcdefgxxx",
    "ip_whitelist":["1.2.3.4","5.6.*.*"]
}
````

返回
````
{
    "errcode":0,
    "errmsg":"ok"
}
````

详见: https://open-doc.dingtalk.com/doc2/detail.htm?treeId=175&articleId=104945&docType=1#s9


