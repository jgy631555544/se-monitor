/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2023-01-12 10:17:17
 * @LastEditTime: 2023-07-04 14:40:03
 * @Description: 入口，自动初始化
 * @FilePath: /web/seMonitor/src/index.ts
 */
import ErrorMonitor from './lib/error';
import ActionMonitor from './lib/action';
import PerformanceMonitor from './lib/performance';

import { TypeShinParams, TypeCaculateTiming } from './typings';
/**
 * 默认属性
 */
const defaults: TypeShinParams = {
  src: '//127.0.0.1:3000/ma.gif',       // 采集监控数据的后台接收地址
  psrc: '//127.0.0.1:3000/pe.gif',      // 采集性能参数的后台接收地址
  pkey: '',                             // 性能监控的项目key
  subdir: '',                           // 一个项目下的子目录
  rate: 5,                              // 随机采样率，用于性能搜集，范围是 1~10，10 表示百分百发送
  version: '',                          // 版本，便于追查出错源
  author: '',                           // 页面维护人员，便于追踪错源出自谁的手
  record: {
    isOpen: true,                       // 是否开启录像功能
    isSendInPerformance: false,         // 是否将性能监控的录像发送到服务器
    src: '//cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js'   // 录像地址
  },
  error: {
    isFilterErrorFunc: null,            // 需要过滤的代码错误
    isFilterPromiseFunc: null,          // 需要过滤的Promise错误
  },
  console: {
    isOpen: true,               // 默认是开启，在本地调试时，可以将其关闭
    isFilterLogFunc: null,      // 过滤要打印的内容
  },
  crash: {
    isOpen: true,               // 是否监控页面奔溃，默认开启
    validateFunc: null,         // 自定义页面白屏的判断条件，返回值包括 {success: true, prompt:'提示'}
  },
  event: {
    isFilterClickFunc: null,    // 在点击事件中需要过滤的元素
  },
  ajax: {
    isFilterSendFunc: null      // 在发送监控日志时需要过滤的通信
  },
  identity: {                   // 身份相关信息：user、customer等
    id: '',
    name: ''
  },
};
// 外部可以调用的属性
interface TypeShin {
  setParams: (params: TypeShinParams) => ActionMonitor;
  track: (params: any) => void;
  reactError?: (err: any, info: any) => void;
  vueError?: (vue: any) => void;
}
const seMonitor: TypeShin = {
  setParams,
  track
};
/**
 * 未初始化时提醒
 * @param params
 */
function track(): void{
  console.error('SDK未初始化');
}
/**
 * 自定义参数
 * @param params
 */
function setParams(params: TypeShinParams): ActionMonitor {
  if (!params) {
    return null;
  }
  const combination = defaults;
  // 为所有参数赋默认值
  for(const key in params) {
    const value = params[key];
    // 当参数值是对象时，需要对其属性挨个赋值
    if(typeof value === 'object') {
      for(const childKey in value) {
        combination[key][childKey] = value[childKey];
      }
    }else {
      combination[key] = value;
    }
  }
  // 埋入自定义的身份信息
  const { getFunc } = combination.identity;
  getFunc && getFunc(combination);

  // 监控页面错误
  const error = new ErrorMonitor(combination);
  error.registerErrorEvent();                   // 注册 error 事件
  error.registerUnhandledrejectionEvent();      // 注册 unhandledrejection 事件
  error.registerLoadEvent();                    // 注册 load 事件
  error.recordPage();                           // 是否启动录像回放
  seMonitor.reactError = error.reactError.bind(error);   // 对外提供 React 的错误处理
  seMonitor.vueError = error.vueError.bind(error);       // 对外提供 Vue 的错误处理

  // 启动性能监控
  const pe = new PerformanceMonitor(combination);
  pe.observerLCP();      // 监控 LCP
  pe.observerFID();      // 监控 FID
  const setRecord = (data: TypeCaculateTiming): void => {
    // 只对白屏时间超过 4 秒的页面进行录像存储
    if(data.firstPaint > 4000)
      data.record = error.getRecentRecord();
  };
  pe.registerLoadAndHideEvent(setRecord);    // 注册 load 和页面隐藏事件

  // 为原生对象注入自定义行为
  const action = new ActionMonitor(combination);
  // 自动监听
  action.injectConsole();   // 监控打印
  action.injectRouter();    // 监听路由
  action.injectEvent();     // 监听事件
  action.injectAjax();      // 监听Ajax
  // 手动监听
  seMonitor.track = (params: any) => action.track(params);
  return action;
}

export default seMonitor;
