---
title: "git获取不到远程分支，git fetch也不行"
date: "2022-06-10"
---

有时候远程git远程创建了分支，但在本地怎么都拉去不到，可以修改下面的配置
配置 git config remote.origin.fetch +refs/heads/_:refs/remotes/origin/_
