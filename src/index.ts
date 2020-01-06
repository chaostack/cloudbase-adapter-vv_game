import {
  AbstractSDKRequest,
  IRequestOptions,
  IUploadRequestOptions,
  SDKAdapterInterface,
  StorageInterface,
  StorageType,
  WebSocketContructor,
  WebSocketInterface,
  formatUrl
} from '@cloudbase/adapter-interface';

declare const qg;

function isMatch(): boolean {
  if (typeof qg === 'undefined') {
    return false;
  }
  if (!qg.onHide) {
    return false;
  }
  if (!qg.offHide) {
    return false;
  }
  if (!qg.onShow) {
    return false;
  }
  if (!qg.offShow) {
    return false;
  }
  if (!qg.getSystemInfoSync) {
    return false;
  }
  if (!qg.getProvider) {
    return false;
  }
  if (!qg.getStorageSync) {
    return false;
  }
  if (!qg.setStorageSync) {
    return false;
  }
  if (!qg.createWebSocket) {
    return false;
  }
  if (!qg.request) {
    return false;
  }

  try {
    const provider: string = qg.getProvider();
    if (provider.toLocaleUpperCase() !== 'VIVO') {
      return false;
    }

  } catch (e) {
    return false;
  }

  try {
    if (!qg.getSystemInfoSync()) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
}

class VVRequest extends AbstractSDKRequest {
  post(options: IRequestOptions) {
    const {
      url,
      data,
      headers
    } = options;
    return new Promise((resolve, reject) => {
      qg.request({
        url: formatUrl('https:', url),
        data: JSON.stringify(data),
        method: 'POST',
        dataType: 'json',
        header: headers,
        success(res) {
          resolve(res);
        },
        fail(err) {
          reject(err);
        }
      });
    });
  }
  upload(options: IUploadRequestOptions) {
    return new Promise(resolve => {
      const {
        url,
        file,
        name,
        data,
        headers
      } = options;
      const formdata = [];
      for (const key in data) {
        formdata.push({
          name: key,
          value: data[key]
        });
      }
      qg.uploadFile({
        url: formatUrl('https:', url),
        files: [{
          uri: file,
          filename: name
        }],
        data: formdata,
        header: headers,
        success(res) {
          const result = {
            // 注意：取code而非statusCode
            statusCode: res.code,
            data: res.data || {}
          };
          // 200转化为201（如果指定）
          if (res.statusCode === 200 && data.success_action_status) {
            result.statusCode = parseInt(data.success_action_status, 10);
          }
          resolve(result);
        },
        fail(err) {
          resolve(err);
        }
      });
    });
  }
  download(options: IRequestOptions) {
    const {
      url,
      headers
    } = options;
    return new Promise((resolve, reject) => {
      qg.download({
        url: formatUrl('https:', url),
        header: headers,
        success(res) {
          if (res.statusCode === 200 && res.tempFilePath) {
            // 由于涉及权限问题，只返回临时链接不保存到设备
            resolve({
              statusCode: 200,
              tempFilePath: res.tempFilePath
            });
          } else {
            resolve(res);
          }
        },
        fail(err) {
          reject(err);
        }
      });
    });
  }
}

const VVStorage: StorageInterface = {
  setItem(key: string, value: any) {
    qg.setStorageSync({
      key,
      value
    });
  },
  getItem(key: string): any {
    return qg.getStorageSync({
      key
    });
  },
  removeItem(key: string) {
    qg.deleteStorageSync({
      key
    });
  },
  clear() {
    qg.clearStorageSync();
  }
};

class VVWebSocket {
  constructor(url: string, options: object = {}) {
    const READY_STATE = {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    };
    let readyState = READY_STATE.CONNECTING;

    const ws = qg.createWebSocket({
      url,
      ...options
    });
    const socketTask: WebSocketInterface = {
      set onopen(cb) {
        ws.onopen = e => {
          readyState = READY_STATE.OPEN;
          cb && cb(e);
        };
      },
      set onmessage(cb) {
        ws.onmessage = cb;
      },
      set onclose(cb) {
        ws.onclose = e => {
          readyState = READY_STATE.CLOSED;
          cb && cb(e);
        };
      },
      set onerror(cb) {
        ws.onerror = cb;
      },
      send: (data) => ws.send(data),
      close: (code? : number, reason? : string) => ws.close({
        code,
        reason
      }),
      get readyState() {
        return readyState;
      },
      CONNECTING: READY_STATE.CONNECTING,
      OPEN: READY_STATE.OPEN,
      CLOSING: READY_STATE.CLOSING,
      CLOSED: READY_STATE.CLOSED
    };
    return socketTask;
  }
}


function genAdapter() {
  // 小程序无sessionStorage
  const adapter: SDKAdapterInterface = {
    root: window,
    reqClass: VVRequest,
    wsClass: VVWebSocket as WebSocketContructor,
    localStorage: VVStorage,
    primaryStorage: StorageType.local
  };
  return adapter;
}

const adapter = {
  genAdapter,
  isMatch,
  runtime: 'vv_game'
};

try{
  window['tcbAdapterVVGame'] = adapter;
}catch(e){}
export {adapter};
export default adapter;