---
title: "electron拦截网络请求，替换为本地文件"
date: "2021-11-08"
---

在ready之前，将自定义schema注册为标准协议：

``` js
protocol.registerSchemesAsPrivileged([{
    scheme: scheme,
    privileges: {
        // bypassCSP: true,
        standard: true,
        secure: true
    }
}])
```

createWindow时defaultSession下注册schema并设置回调函数，返回本地文件的内容：

``` js
session.defaultSession.protocol.registerBufferProtocol(scheme, (request, callback) => {
    console.log('registerBufferProtocol', request)
    callback({ mimeType: 'text/html', data: Buffer.from('<h5>register Response</h5>') })
})
session.defaultSession.protocol.interceptBufferProtocol(scheme, (details, callback) => {
    console.log('interceptBufferProtocol', details)
    getFileBuffByUrl(details.url).then((content)=>{
        callback(content)
    })
})
```

defaultSession拦截网络请求重定向到本地协议schema：

``` js
session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
        console.log('onBeforeRequest', details)
        callback({
            cancel: false,
            redirectURL: `${scheme}://www?name=hbyd5_youziyin`
        })
})
```

找不到直接拦截请求返回本地文件的electron接口，必须要绕一圈，可能跟Chromium的渲染库有关。
