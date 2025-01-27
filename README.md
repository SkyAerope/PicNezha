# PicNezha

使用 api 将哪吒监控数据转换成图片

> [!WARNING]
> 仅 v0 测试可用，咱没用过 v1，不清楚 v1 的 api 是什么样的

## 示例

![image](https://github.com/user-attachments/assets/4c742fca-8b9f-48ef-b88d-9e1d557e770e)

> 示例图片是静态的

## 如何使用

1. fork 本库并导入到 vercel，然后在探针后台创建 api token
2. 设置环境变量
   ```
   API_URL=你的探针地址，如https://example.com/，不需要包括/api/v1/server/details
   TOKEN=你的探针后台创建的api token
   TEXT=（可选）图片中header的文本，若不填则使用API_URL
   ```
3. 部署后，访问`https://网址/status`即可看到图片

## 常问问题

### 1. 如何更换字体？

参考代码开头注册字体，并修改代码中的`ctx.font`

中英文和 emoji 均可更换

更换时请注意字体文件大小限制：单文件超过 25 MB 在 GitHub 需使用 LFS，所有文件[超过 250 MB 无法在 vercel 使用](https://vercel.com/docs/functions/runtimes#size-limits)。

![image](https://github.com/user-attachments/assets/a8231061-9aaf-45b9-abd3-974d5609a9a8)

> 像这个字体就有点大了

### 2. 为什么仓库中会出现一个未被使用的字体`NotoColorEmoji.ttf`？

方便你换 emoji 字体的，删掉也不影响

### 3. 为什么安装了 canvas 库但是没有在脚本中使用？

若不安装，vercel 运行脚本时会出现以下报错，安装之后可以解决

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

### 4. 为什么要更换 canvas 库？

本来在开发环境好好的，在 vercel 上面就长这样
![image](https://github.com/user-attachments/assets/9e73da21-096b-41a0-97c1-45336f6077a8)
顺便可以修复使用某些字体时，emoji 变黑白的问题

## 协议和使用限制

本项目基于[Apache-2.0 license](LICENSE)开源，使用时请遵守该协议。

可以对生成的图片右下角的版权信息样式做适当调整，但请不要删除它或让它很难阅读

> 举例：如果你制作了暗黑模式的卡片，你需要把它改成浅色文本

同时，宣传本项目前，请先评估对方遵守协议的可能性。如果可能性较低，建议不要宣传。
