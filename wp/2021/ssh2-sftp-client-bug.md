---
title: "项目用到的ssh2-sftp-client 组件有bug"
date: "2021-08-23"
---

作者没有考虑到windows和linux下ENOENT的错误码不同，导致上传文件失败，平台兼容性还是很重要的

``` js
function haveLocalAccess(filePath, mode = "r") {
  const accessMode =
    fs.constants.F_OK | (mode === "w") ? fs.constants.W_OK : fs.constants.R_OK;

  try {
    fs.accessSync(filePath, accessMode);
    const type = localExists(filePath);
    return {
      status: true,
      type: type,
      details: "access OK",
      code: 0,
    };
  } catch (err) {
    if (err.errno === -2) {
  // windows: -4058
      return {
        status: false,
        type: null,
        details: "not exist",
        code: -2,
      };
    } else if (err.errno === -13) {
      const type = localExists(filePath);
      return {
        status: false,
        type: type,
        details: "permission denied",
        code: -13,
      };
    } else if (err.errno === -20) {
      return {
        status: false,
        type: null,
        details: "parent not a directory",
      };
    } else {
      throw err;
    }
  }
}
```

![](images/image.png)
