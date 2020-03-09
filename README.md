## cloudbase-adapter-vv_game

[![NPM Version](https://img.shields.io/npm/v/cloudbase-adapter-vv_game.svg?style=flat)](https://www.npmjs.com/package/cloudbase-adapter-vv_game)
[![](https://img.shields.io/npm/dt/cloudbase-adapter-vv_game.svg)](https://www.npmjs.com/package/cloudbase-adapter-vv_game)

tcb-js-sdk Vivo小游戏适配器

## 安装
```bash
npm i cloudbase-adapter-vv_game -S
```

### Unpkg
可以使用unpkg托管的js文件，地址如下：
https://unpkg.com/cloudbase-adapter-vv_game/dist/index.js

## 使用
### ES Module
```javascript
import tcb from 'tsb-js-sdk';
import adapter from 'cloudbase-adapter-vv_game';

// 以下两种方式二选一
// 1.单参数传入
tcb.useAdapters(adapter);
// 2.数组形式传参
tcb.useAdapters([adapter]);
// adapter必须在init之前传入
tcb.init();
```

### CommonJS
```javascript
const tcb = require('tsb-js-sdk');
const {adapter} = require('cloudbase-adapter-vv_game');

// 以下两种方式二选一
// 1.单参数传入
tcb.useAdapters(adapter);
// 2.数组形式传参
tcb.useAdapters([adapter]);
// adapter必须在init之前传入
tcb.init();
```