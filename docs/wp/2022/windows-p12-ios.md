---
title: "在Windows上创建p12 iOS开发人员证书"
date: "2022-10-20"
---

1. 创建私钥 . 我通过运行此命令来执行此操作  
    openssl genrsa -out mykey.key 2048  
    
2. 创建CSR文件  
    openssl req -new -key mykey.key -out developer\_identify.csr  
    
3. 将csr文件上传到iPhone开发站点 . 我在这里做以下事情:  
    单击菜单标识符 - >应用程序ID，选择正确的应用程序ID，单击编辑，单击创建证书，单击继续，选择上面创建的CSR文件并继续 . 等待网站告诉我一切正常，然后下载\* aps\_development.cer \*文件  
    
4. 创建PEM文件  
    openssl x509 -in aps\_development.cer -inform DER -out developer\_identity.pem -outform PEM  
    
5. 最后，创建p12文件  
    openssl pkcs12 -export -inkey mykey.key -in developer\_identity.pem -out iphone\_dev.p12
