# Bug Report — CC2D 閃動 & RR 無法控制機體

**日期**：2026-04-25  
**版本**：Web Worker 物理架構（手搓，非 Rapier）

---

## 問題一：機體閃動（在有速度後）

### 現象
機體獲得速度後，畫面出現週期性閃動：機體偏離畫面中心，再瞬間彈回。速度越高越明顯。

### 檢測方法
用 Playwright 開啟遊戲頁面，以 60ms 間隔連續截圖 30 幀，同時用鍵盤模擬持續按 W 讓機體加速。截圖後逐幀比對機體在畫面中的位置。

觀察：高速（vel > 100）時，機體在部分幀出現明顯偏離畫面中央，且兩幀相鄰截圖中機體位置有跳躍感。

### 根因分析

**原因 A — 物理步進頻率與渲染頻率不整數比**

物理 Worker 使用 `setInterval(doStep, 10)`（100Hz），渲染是 60fps，比例 = 1.667 步/幀。這代表每個渲染幀，有時收到 1 個物理狀態更新，有時收到 2 個。當收到 2 個時，craft 位置跳過一步，畫面上看起來就像抖動一下。

**原因 B — Konva `batchDraw()` 非同步（主因）**

Konva 的 `batchDraw()` 實作如下：

```javascript
BaseLayer.prototype.batchDraw = function () {
    if (!this._waitingForDraw) {
        this._waitingForDraw = true;
        requestAnimationFrame(function () {
            layer.draw();  // 實際繪製排到「下一幀」
        });
    }
};
```

它不是立即繪製，而是把繪製排到下一個 rAF。結合我們的 loop 架構：

```
幀 N（我們的 rAF loop）：
  1. renderFrame() → camera 更新為 craft 的當前位置 x_N
  2. space.batchDraw() → 把「實際畫」排定到幀 N+1 的 rAF
  3. postMessage({type:'step'}) → Worker 計算出 x_{N+1} 並回傳
  4. onmessage → craft.x = x_{N+1}

幀 N+1（Konva 排定的 rAF，先於我們的 loop 執行）：
  → 繪製 craft 位置 x_{N+1}，但 camera 還停在 x_N（我們的 loop 還沒跑）
  → craft 偏離畫面中心！

幀 N+1（我們的 rAF loop）：
  → renderFrame() 更新 camera = x_{N+1}，batchDraw 再排到幀 N+2
  → 表面上「彈回中心」
```

每一幀都是「偏離 → 彈回」，形成閃動。速度越快，x_{N+1} 和 x_N 差距越大，閃動越明顯。

### 解決方式

**針對原因 A**：移除 `setInterval`，改由 rAF loop 結尾直接送 `{type:'step'}` 給 Worker，讓物理每幀精確執行一次，`FIXED_DT` 改為 `1/60`。

**針對原因 B**：把 `space.batchDraw()` 改為 `field.draw()`。`field.draw()` 是同步立即繪製，在當前 rAF 幀內完成，不另外排定新的 rAF。這樣 camera 更新和繪製永遠在同一幀，不再有競爭。

```javascript
// 修改前
space.batchDraw()

// 修改後
field.draw()
```

---

## 問題二：RR 送出 action，火焰有出現，但機體完全不動

### 現象
透過 RR 平台控制 CC2D 時：
- 時間有在走（物理在跑）
- action 對應的引擎火焰視覺有出現
- 機體位置數值完全不變

### 檢測方法
對照 `game.flash()` 的程式碼，分別追蹤「視覺火焰觸發路徑」與「Worker setEngines 傳送路徑」。

### 根因分析

`game.flash()` 負責同時更新視覺和通知 Worker，但 `postMessage({type:'setEngines',...})` 只在 `else` 分支（鍵盤模式）裡：

```javascript
game.flash = function(){
  var up, down, left, right
  if(game.rr.active){
    // 從 RR currentJets 讀取 up/down/left/right
    // ← 這裡沒有 postMessage！
  } else {
    // 讀鍵盤
    physicsWorker.postMessage({type:'setEngines', engines:{...}})  // 只有這裡有
  }
  craft.jet('up',up); craft.jet('down',down)   // 視覺永遠會跑
  craft.jet('left',left); craft.jet('right',right)
}
```

視覺（`craft.jet()`）在 if/else 外面，兩種模式都會執行，所以火焰看起來有反應。但 Worker 的引擎狀態從未被更新，物理計算一直以「全部引擎關閉」為準，機體當然不動。

### 解決方式

把 `postMessage({type:'setEngines',...})` 移到 if/else 外面，讓兩種模式都能通知 Worker：

```javascript
game.flash = function(){
  var up, down, left, right
  if(game.rr.active){
    // 讀 RR currentJets
  } else {
    // 讀鍵盤
  }
  physicsWorker.postMessage({type:'setEngines', engines:{up:up,down:down,left:left,right:right}})
  craft.jet('up',up); craft.jet('down',down)
  craft.jet('left',left); craft.jet('right',right)
}
```

---

## 驗證

修復後，用 Playwright 分別對以下兩個場景截圖確認：

1. **直接遊戲頁面**（鍵盤控制）：機體加速到 vel=174.9 時，畫面中 craft 位置穩定在中央，無偏移。

2. **RR 控制**（postMessage 控制）：RR 送出 action 後機體正確移動，vel=71.6 時仍居中，引擎火焰對應正確。
