---
title: "添加sftp only帐号"
date: "2019-07-15"
---

有时候ssh到远程主机，只想传文件不会用到shell，就可以创建一个sftp only的账号

1. 新建用户sftp, useradd -d /home/sftp -s /sbin/nologin sftp

3. home/sftp目录要是root:root 755  
    本身sftp没有权限  
    在home目录下建立sftp的数据目录data用于上传数据  
    mkdir /home/sftp  
    mkdir /home/sftp/.ssh

5. 生成rsa密钥对  
    其中id\_rsa是私钥, id\_rsa.pub是公钥, 公钥放服务器, 私钥放ssh客户端  
    ssh-keygen -t rsa  
    cat id\_rsa.pub >> authorized\_keys  
    .ssh要sftp用户可读

7. /etc/ssh/sshd\_config追加:  
    Match Group sftp // 对于sftp组的用户的特别配置  
    X11Forwarding no // 禁止x11转发  
    AllowTcpForwarding no //禁止tcp转发  
    ForceCommand internal-sftp //只能用sftp命令  
    ChrootDirectory %h //所有活动限制在home目录  
    Match all

9. 为了避免权限问题, sftp home的目录可mount到实际目录  
    mount --bind /var/cdn cdn  
    mount --bind /var/html html
