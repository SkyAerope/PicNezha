# PicNezha
使用api将哪吒监控数据转换成图片

> [!WARNING]
> 仅v0测试可用，咱没用过v1，不清楚v1的api是什么样的

## 示例
![image](https://github.com/user-attachments/assets/13813b2d-fc31-4f2a-b320-07f4a74a26f1)

## 如何使用
1. fork本库并导入到vercel，然后在探针后台创建api token
2. 设置环境变量
   ```
   API_URL=你的探针地址，如https://example.com/，不需要包括/api/v1/server/details
   TOKEN=你的探针后台创建的api token
   ```
3. 部署后，访问`https://网址/status`即可看到图片

## 常问问题
### 1. 为什么安装了canvas库但是不使用？
  若不安装，vercel运行脚本时会出现以下报错，安装之后可以解决
  ```
  Error: libfontconfig.so.1: cannot open shared object file: No such file or directory
      at Module._extensions..node (node:internal/modules/cjs/loader:1586:18)
      at Module.load (node:internal/modules/cjs/loader:1288:32)
      at Module._load (node:internal/modules/cjs/loader:1104:12)
      at /opt/rust/nodejs.js:2:12071
      at Function.ur (/opt/rust/nodejs.js:2:12445)
      at Se.e.<computed>.be._load (/opt/rust/nodejs.js:2:12041)
      at Module.require (node:internal/modules/cjs/loader:1311:19)
      at s (/opt/rust/bytecode.js:2:1094)
      at Object.<anonymous> (/var/task/node_modules/skia-canvas/lib/classes/neon.js:15:29)
      at Module.<anonymous> (/opt/rust/bytecode.js:2:1435) {
    code: 'ERR_DLOPEN_FAILED'
  }
  Node.js process exited with exit status: 1. The logs above can help with debugging the issue.
  ```
