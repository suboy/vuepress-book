import{_ as e,o,c as t,f as i}from"./app-da893a5a.js";const p={},n=i("<ol><li><p>创建私钥 . 我通过运行此命令来执行此操作<br> openssl genrsa -out mykey.key 2048</p></li><li><p>创建CSR文件<br> openssl req -new -key mykey.key -out developer_identify.csr</p></li><li><p>将csr文件上传到iPhone开发站点 . 我在这里做以下事情:<br> 单击菜单标识符 - &gt;应用程序ID，选择正确的应用程序ID，单击编辑，单击创建证书，单击继续，选择上面创建的CSR文件并继续 . 等待网站告诉我一切正常，然后下载* aps_development.cer *文件</p></li><li><p>创建PEM文件<br> openssl x509 -in aps_development.cer -inform DER -out developer_identity.pem -outform PEM</p></li><li><p>最后，创建p12文件<br> openssl pkcs12 -export -inkey mykey.key -in developer_identity.pem -out iphone_dev.p12</p></li></ol>",1),s=[n];function l(r,c){return o(),t("div",null,s)}const d=e(p,[["render",l],["__file","windows-p12-ios.html.vue"]]);export{d as default};
