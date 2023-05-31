---
title: "安装PHP并配置nginx"
date: "2021-03-16"
---

查询php的最新版本: apt search php7

安装: apt-get install php7.4-fpm php7.4-mysql php7.4-common php7.4-curl php7.4-cli php7.4-mcrypt php7.4-mbstring php7.4-dom

查看php服务: service php7.4-fpm status

配置nginx:

location ~ .php?.\*$ {  
  fastcgi\_split\_path\_info ^(.+.php)(/.+)$;  
  include snippets/fastcgi-php.conf;  
  fastcgi\_pass unix:/var/run/php/php7.4-fpm.sock;  
}

php.ini  
user, group要设置成nginx
