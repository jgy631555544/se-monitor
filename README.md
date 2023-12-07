# sdk 接入指南

# se-data-monitor 文档

## **简介**

**se-data-monitor** 是一个用 TypeScript 重新编写的监控系统，专为线上错误和性能监控设计。这个工具能够捕捉各种类型的前端错误，并收集重要的性能参数，帮助开发者优化网站和应用。

### **特性**

- **数据采集**：通过 JavaScript 收集监控数据和性能参数。
- **异常监控**：包括运行时错误、Promise 错误、框架错误和资源错误。
- **白屏错误录像**：使用 [rrweb](https://github.com/rrweb-io/rrweb) 实现错误时的场景回放。
- **用户行为监控**：记录路由变化、点击事件等用户行为。
- **性能数据**：包括首屏时间、LCP、FMP 等关键性能指标。

## **快速安装**

通过 npm 安装 se-data-monitor（已经暂时发到 npm 上了）

```bash
npm install se-data-monitor
```

## **目录介绍**

```
├── dist            编译代码
├── config          配置目录
├── demo            示例目录
├── src             源码目录
├── test            单元测试
├── CHANGELOG.md    变更日志
└── TODO.md         计划功能
```

### **dist**

dist 是运行编译命令后的输出代码，不会提交到版本中。

```bash
npm run build
```

本项目使用的模块打包工具是 [rollup](https://rollupjs.org/guide/en/)，而不是 [webpack](https://webpack.js.org/)。

rollup 的配置文件存在于 config 目录中。

### **config**

包含多个配置文件，支持不同的模块规范：

```jsx
const seMonitor = require("se-data-monitor");
import seMonitor from "se-data-monitor";
```

### **demo**

在 demo 目录中，保存着多个使用示例，但是若要访问，推荐安装  [http-server](https://github.com/http-party/http-server)。

运行命令后，就能在本地搭建服务器。

```bash
http-server ./se-data-monitor/
```

在浏览器地址栏中，输入  [http://localhost:8080/demo/xxx.html](http://localhost:8080/demo/xxx.html)  就能访问指定的示例了。

像监控通信，是必须要有服务器的，否则将无法访问。

### **test**

在 test 目录中，保存着单元测试代码，运行命令后，就能开启。不过目前的测试用例还不够完善

```bash
npm run test
```

## **使用指南**

### 初始化

```jsx
import seMonitor from "se-data-monitor";
const seMonitorInstance = seMonitor.setParams({
  src: "/ma.gif",
  psrc: "/pe.gif",
  token: "ITE",
  crash: {
    isOpen: false,
  },
  record: {
    isOpen: false,
  },
  console: {
    isOpen: false,
  },
});
window.seMonitor = seMonitorInstance;

// 主动打点
window.seMonitor.track("首页概览");
// 身份信息二次补充
window.seMonitor.setParams({
  identity: {
    id: data.Id,
    name: data.Name,
  },
});
```

- 在引入 se-data-monitor 后，需要使用 **`setParams()`** 方法配置必要的参数：
- 初始化后，会返回 seMonitor 的实例，实例带有两个方法
  - setParams：在初始化时没有进行初始化的信息，可以继续补充。例如：身份信息、维护人员信息等
  - track：参照神策的事件，实现 track 方法，可以进行主动的打点记录
    - 参数可以是任意类型

### setParams**参数配置**

以下是一些主要参数及其作用：

- **src（字符串）**：**必填项**，采集监控数据的后台接收地址，默认是 [//127.0.0.1:3000/ma.gif](https://127.0.0.1:3000/ma.gif)
- p**src（字符串）**：**必填项**，采集性能参数的后台接收地址，默认是 [//127.0.0.1:3000/pe.gif](https://127.0.0.1:3000/pe.gif)
- **token（字符串）**：**必填项**，项目标识符，可自定义，用于区分监控的不同项目
- **pkey（字符串）**：**必填项**，性能监控的项目 key，一个项目下面可能有多个不同的子项目，这样就能单独监控子项目的性能
- **subdir（字符串）**：子目录配置。这用于在 source map 地址中拼接，帮助您更准确地定位到错误源。
- **rate（数字）**：随机采样率，用于性能搜集。这个值介于 1 到 10 之间，10 表示 100% 发送数据。
- **version（字符串）**：版本号。这有助于在不同版本的应用中追踪问题。
- **author（字符串）**：页面维护人员。这有助于快速识别问题可能出现的责任范围。
- **record（对象）**：包含用于配置 rrweb 录像的选项。
  - **isOpen（布尔值）**：指定是否开启录像功能。
  - **isSendInPerformance（布尔值）**：指定是否在性能监控中发送录像数据。
  - **src（字符串）**：rrweb 地址，默认是官方提供的 CDN 地址：`//cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js`
- **error（对象）**：错误配置

  ```
  seMonitor.setParams({
    error: {
      /**
       * 过滤掉与业务无关或无意义的错误
       */
      isFilterErrorFunc: (event) =>   // (event: ErrorEvent) => boolean
          event.message === "Script error.",
      isFilterPromiseFunc: (desc) =>  // (desc: TypeAjaxDesc) => boolean
          desc.status == 401 || desc.url.indexOf("reports/ai/logs") >= 0
    }
  });

  ```

  - isFilterErrorFunc：需要过滤的脚本错误，默认是 null，可设置一个函数，参考 demo/error.html
  - isFilterPromiseFunc：需要过滤的 Promise 错误，默认是 null，可设置一个函数，参考 demo/error.html

- **console（对象）**: console 配置

  ```
  seMonitor.setParams({
    console: {
      isFilterLogFunc: (desc) =>     // (desc: string) => boolean
          desc && desc.indexOf("Agora-SDK") >= 0
    }
  });

  ```

  - isOpen: 是否开启，默认是 true，在本地调试时，可以将其关闭
  - isFilterLogFunc: 过滤要打印的内容，默认是 null，可设置一个函数，参考 demo/console.html

- **crash（对象）**：页面白屏配置

  ```
  seMonitor.setParams({
    validateCrash: () => {    // () => TypeCrashResult
      /**
       * 当root标签中的内容为空时，可认为页面已奔溃
       * 响应值格式：{success: true, prompt:'提示'}
       */
      return {
        success: document.getElementById("root").innerHTML.length > 0,
        prompt: "页面出现空白"
      };
    }
  });

  ```

  - isOpen: 是否监控页面奔溃，默认是 true
  - validateFunc: 自定义页面白屏的判断条件，默认是 null，可设置一个函数，参考 demo/crash.html

- **event（对象）**: 事件配置

  ```
  seMonitor.setParams({
    event: {
      isFilterFunc: (node) => {    // (element: HTMLElement) => boolean
        const nodeName = node.nodeName.toLowerCase();
        return nodeName !== 'a' && nodeName !== 'button' && nodeName !== 'li';
      }
    }
  });

  ```

  - isFilterClickFunc: 在点击事件中需要过滤的元素，默认是 null，可设置一个函数，参考 demo/event.html

- **ajax（对象）**：异步 Ajax 配置

  ```
  seMonitor.setParams({
    ajax: {
      isFilterSendFunc: (req) => {    // (req: TypeAjaxRequest) => boolean
        return req.status >= 500 || req.ajax.url === '/user';
      }
    }
  });

  ```

  - isFilterSendFunc: 在发送监控日志时需要过滤的通信，默认是 null，可设置一个函数，参考 demo/ajax.html

- **identity（对象）**：身份信息配置

  ```
  seMonitor.setParams({
    ajax: {
      getFunc: (params) => {
        params.identity.value = 'test';
      }
    }
  });
  ```

  - value: 自定义的身份信息字段
  - getFunc: 自定义的身份信息获取函数，默认是 null，可设置一个函数，参考 demo/identity.html

### **特殊属性**

在调用 setParams()  方法后，自动会在 seMonitor 对象中增加 reactError()  和 vueError()。

可在 React 项目中创建一个 ErrorBoundary 类，手动调用 reactError()  方法，下面是 reactError()  的源码。

```
public reactError(err: any, info: any): void {
  this.handleError({
    type: CONSTANT.ERROR_REACT,
    desc: {
      prompt: err.toString(),
      url: location.href
    },
    stack: info.componentStack,
  });
}

```

如果要对 Vue 进行错误捕获，那么就得重写 Vue.config.errorHandler()，其参数就是 Vue 对象，下面是 vueError()  的源码。

```
public vueError (vue: any): void {
  const _vueConfigErrorHandler = vue.config.errorHandler;
  vue.config.errorHandler =  (err: any, vm: any, info: any): void => {
    this.handleError({
      type: CONSTANT.ERROR_VUE,
      desc: {
        prompt: err.toString(), // 描述
        url: location.href
      },
      stack: err.stack,         // 堆栈
    });
    // 控制台打印错误
    if (typeof console !== 'undefined' && typeof console.error !== 'undefined') {
      console.error(err);
    }
    // 执行原始的错误处理程序
    if (typeof _vueConfigErrorHandler === 'function') {
      _vueConfigErrorHandler.call(err, vm, info);
    }
  };
}
```

## **源码修改**

在将代码下载下来后，首次运行需要先安装依赖。

```bash
npm install
```

一键打包生成 4 个脚本，3 种规范和 1 个 UMD 的压缩版本。

```bash
npm run build
```

还有个 build-custom 命令，可以基于 se-data-monitor 生成自定义逻辑的 UMD 脚本。

```bash
npm run build-custom
```

不过运行上述命令之前，要先在 src 目录中创建 index-custom.ts，那些自定义逻辑可以在该文件中编辑。

## 打点的数据结构及解析

### 主动打点：track

```jsx
{
  m: '{"category":"track","data":"\\"故障报警\\"","author":"","token":"ITE","subdir":"","identity":{"id":821722,"name":"chenzhongxi","customerId":1948230},"fingerprint":"15fe3a47","referer":"https://ite.itm.energymost.com/zh-cn/1dba46/alarm/false_100___false_______false_AlarmTime_1_0/0","timestamp":1700841509759}';
}
```

```json
{
  "category": "track", // 监控类型
  "data": "故障报警", // 监控数据
  "author": "", // 页面维护人员
  "token": "ITE", // 项目标识符，可自定义，用于区分监控的不同项目
  "subdir": "", // 一个项目下的子目录，用于拼接 source map 的脚本地址
  "identity": {
    // 身份信息，包含但不限于下面信息
    "id": 821722, // user id
    "name": "chenzhongxi", // user name
    "customerId": 1948230 // customer id
  },
  "fingerprint": "15fe3a47", // Canvas 指纹
  "referer": "https://ite.itm.energymost.com", // 标识请求的来源页面
  "timestamp": 1700841509759 // 时间戳
}
```

### 请求打点：ajax

```jsx
{
  m: '{"category":"ajax","data":{"type":"GET","url":"https://web-api.itm.energymost.com/api/user/822664","status":200,"endBytes":"1.76KB","interval":"843.8ms","network":{"bandwidth":0,"type":"4G"},"response":"{\\"Error\\":\\"0\\",\\"Message\\":[\\"\\"],\\"RequestId\\":null,\\"Result\\":{\\"Id\\":822664,\\"RealName\\":\\"sinosig\\",\\"UserType\\":818308,\\"UserTypeName\\":\\"SP-初始管理员Admin_IMDC专用\\",\\"RoleType\\":null,\\"Password\\":null,\\"Customers\\":[{\\"CustomerId\\":1621579,\\"CustomerName\\":\\"阳光保险集团\\",\\"CustomerCode\\":\\"sunshineinsurance\\",\\"CustomerImageId\\":\\"img-logo-803989\\",\\"SysType\\":8}],\\"Title\\":\\"客户管理员\\",\\"Telephone\\":\\"13811687961\\",\\"Email\\":\\"shiyu-ghq@sinosig.com\\",\\"Comment\\":\\"IMDC row\\",\\"Name\\":\\"sinosig\\",\\"DemoStatus\\":0,\\"SpId\\":98,\\"Status\\":1,\\"SpStatus\\":1,\\"SpDomain\\":\\"ite\\",\\"FedLoginUrl\\":null,\\"Version\\":151832954,\\"HasWholeCustomer\\":false,\\"PrivilegeCodes\\":[\\"2100\\",\\"2101\\",\\"2102\\",\\"2103\\",\\"2105\\",\\"2107\\",\\"2110\\",\\"2112\\",\\"2114\\",\\"2127\\",\\"2131\\",\\"2136\\",\\"2198\\",\\"8002\\",\\"8006\\",\\"8012\\",\\"8014\\"],\\"SpFullName\\":null,\\"SpName\\":\\"SPC 施耐德电气信息技术(中国)有限公司\\",\\"CustomerId\\":null}}"},"author":"","token":"ITE","subdir":"","identity":{"id":"","name":""},"fingerprint":"4d9fdc2b","referer":"https://ite.itm.energymost.com/zh-cn/18be4b/no-permission-tip","timestamp":1700841513083}';
}
```

```json
{
  "category": "ajax", // 监控类型
  "data": {
    "type": "GET", // 请求类型
    "url": "https://web-api.itm.energymost.com/api/user/822664", // 接口地址
    "status": 200, // 请求状态
    "endBytes": "1.76KB", // 数据量
    "interval": "843.8ms", // 请求时长
    "network": {
      // 网络相关
      "bandwidth": 0,
      "type": "4G"
    }
  },
  "author": "", // 页面维护人员
  "token": "ITE", // 项目标识符，可自定义，用于区分监控的不同项目
  "subdir": "", // 一个项目下的子目录，用于拼接 source map 的脚本地址
  "identity": {
    // 身份信息，包含但不限于下面信息
    "id": "", // user id
    "name": "" // user name
  },
  "fingerprint": "4d9fdc2b", // Canvas 指纹
  "referer": "https://ite.itm.energymost.com/zh-cn/18be4b/no-permission-tip", // 标识请求的来源页面
  "timestamp": 1700841513083 // 时间戳
}
```

### 点击打点：click

```jsx
{
  m: '{"category":"event","data":{"type":"click","desc":"<div class=login>登录</div>"},"author":"","token":"ITE","subdir":"","identity":{"id":"","name":""},"fingerprint":"055751dd","referer":"https://cmms.itm.energymost.com/zh-cn/login","timestamp":1700819733458}';
}
```

```json
{
  "category": "event", // 监控类型
  "data": {
    // 监控数据
    "type": "click", // 动作类型
    "desc": "<div class=login>登录</div>" // 相应DOM
  },
  "author": "", // 页面维护人员
  "token": "ITE", // 项目标识符，可自定义，用于区分监控的不同项目
  "subdir": "", // 一个项目下的子目录，用于拼接 source map 的脚本地址
  "identity": {
    // 身份信息，包含但不限于下面信息
    "id": "", // user id
    "name": "" // user name
  },
  "fingerprint": "055751dd", // Canvas 指纹
  "referer": "https://cmms.itm.energymost.com/zh-cn/login", // 标识请求的来源页面
  "timestamp": 1700819733458 // 时间戳
}
```

### **性能参数解析**

在提交到后台之前，脚本会对搜集到的性能参数进行计算，计算后取整或保留 1 位小数，单位都为毫秒（ms）。

- loadTime：页面加载总时间，有可能为 0，未触发 load 事件
- unloadEventTime：Unload 事件耗时
- loadEventTime：执行 onload 回调函数的时间
- interactiveTime：首次可交互时间
- domReadyTime：用户可操作时间（DOM Ready 时间）
  - 在初始 HTML 文档已完全加载和解析时触发，无需等待图像和 iframe 完成加载
- firstPaint：首次渲染的时间，即白屏时间（FP）
- firstPaintStart：记录 FP 时间点
- firstContentfulPaint：首次有实际内容渲染的时间（FCP）
- firstContentfulPaintStart：记录 FCP 时间点
- parseDomTime：解析 DOM 树的时间，DOM 中的所有脚本
  - 包括具有 async 属性的脚本，都已执行。并且加载 DOM 中定义的所有页面静态资源（图像、iframe 等）
- initDomTreeTime：请求完毕至 DOM 加载的耗时，在加载 DOM 并执行网页的阻塞脚本时触发
- readyStart：准备新页面的耗时
- redirectCount：重定向次数
- compression：传输内容压缩百分比
- redirectTime：重定向的时间
  - 拒绝重定向，例如  [https://pwstrick.com](https://pwstrick.com/)  就不该写成  [http://pwstrick.com](http://pwstrick.com/)
- appcacheTime：DNS 缓存耗时
- lookupDomainTime：DNS 查询耗时
- connectSslTime：SSL 连接耗时
- connectTime：TCP 连接耗时
- requestTime：内容加载完成的时间
- requestDocumentTime：请求文档，开始请求文档到开始接收文档之间的耗时
- responseDocumentTime：接收文档（内容传输），开始接收文档到文档接收完成之间的耗时
- TTFB：读取页面第一个字节的时间，包含重定向时间
- firstScreen：首屏时间，取 LCP、FMP 和 domReadyTime 之间的最大值
- maxDOMTreeDepth：DOM 节点的最大深度
- maxChildrenCount：DOM 节点的最大子节点数
- totalElementCount：DOM 的总节点数
- timing：原始性能参数
  - 通过  [performance.getEntriesByType['navigation'](0)](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming)  或  [performance.timing](https://developer.mozilla.org/en-US/docs/Web/API/Performance/timing)  得到的性能参数
  - fid：用户第一次与页面交互到浏览器对交互作出响应的时间
  - fmp：首次有效绘制时间，即首屏最有意义的内容的渲染时间
    - time：时间
    - element：字符串形式的最有意义的元素
  - lcp：最大内容在可视区域内变得可见的时间
    - time：时间
    - url：资源地址
    - element：字符串形式的最大内容的元素
- resource：静态资源的[性能参数](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)列表，只存储 1 分钟内的资源
  - name：资源名称
  - duration：资源接收的耗时，responseEnd 和 startTime 之间的差值
  - startTime：开始获取该资源的时间
