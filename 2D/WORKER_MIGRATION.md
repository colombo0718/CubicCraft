# CC2D Physics Worker 遷移筆記

> 記錄把物理引擎搬進 Web Worker 的完整思考過程，以及 Rapier.js 的坑。

---

## 一、為什麼要搬到 Worker

### 根本問題：同一個 renderer process

CC2D（`cubiccraft.leaflune.org`）和 RR（`reinforcelab.leaflune.org`）雖然是不同 origin，但 Chrome 的 site isolation 是以 **eTLD+1（leaflune.org）** 為邊界，不是以 subdomain 為邊界。

結果：兩個 iframe 住在**同一個 renderer process** 的 JS 主執行緒裡。

```
RR iframe: setInterval(...Plotly.update..., 1000)
             ↓ 每秒凍結主執行緒幾十 ms
CC2D iframe: rAF 被延遲
             ↓ 物理步不跑
             ↓ 遊戲時間停頓
```

### Worker 的解法

Web Worker 在 OS 層級跑在獨立的執行緒。Plotly 凍結主執行緒時，Worker 的 `setInterval` 完全不受影響，物理步照跑。

---

## 二、Rapier.js 的坑（為什麼最終沒用）

### 計畫

用 Rapier.js（Rust 寫的 WASM 物理引擎）替代手搓物理。優點：
- 真正的 rigid body dynamics
- 未來可以加碰撞偵測
- determinism（宇宙憲法 §04）

### 實際問題：CDN 依賴鏈

原本設計用 `importScripts` 從 jsDelivr 載入：
```javascript
importScripts('https://cdn.jsdelivr.net/npm/@dimforge/rapier2d-compat@0.12.0/rapier.min.js')
```

**問題 1：`rapier.min.js` 根本不存在。**

查了 jsDelivr 的 package 清單，`@dimforge/rapier2d-compat@0.12.0` 的根目錄只有：
```
rapier.cjs.js   1.5 MB   ← CommonJS，importScripts 無法用
rapier.es.js    1.5 MB   ← ES module，需要 type:module Worker
rapier_wasm2d.js         ← WASM loader
rapier_wasm2d_bg.wasm    ← 實際 WASM 二進位
```

**問題 2：「compat」版本不等於「單一檔案」版本。**

「compat」的意思是「不需要 bundler 就能用」，但仍然需要 `.wasm` 二進位檔。`importScripts` 只能載入一個 JS 檔，WASM 另外需要 fetch。

**問題 3：沉默失敗。**

Worker 裡 `importScripts` 失敗會丟錯誤，但錯誤發生在 `RAPIER.init().then()` 之外，我的 `.catch()` 根本接不到。主執行緒看到的只是 Worker 完全沒有回應。

### 正確的 Rapier.js 使用方式（留作日後參考）

```javascript
// 方法 A：本機檔案（最可靠）
// 把 rapier.es.js + rapier_wasm2d_bg.wasm 下載到 2D/ 目錄
// physics.worker.js 改成 type:module
import init, * as RAPIER from './rapier.es.js'
await init()  // 載入 WASM

// 方法 B：module Worker + CDN
// new Worker('./physics.worker.js', {type:'module'})
import init, * as RAPIER from 'https://cdn.jsdelivr.net/npm/@dimforge/rapier2d-compat@0.12.0/rapier.es.js'
await init()  // WASM 從同一個 CDN 的相對路徑自動抓
```

---

## 三、手搓物理在 Worker 裡其實就夠了

對目前的場景（無牆壁、無碰撞、只有推力），Rapier 帶來的好處有限：

| 功能 | 手搓物理 | Rapier |
|---|---|---|
| 推力積分 | ✓ | ✓ |
| 轉動慣量 | ✓ | ✓（自動算） |
| 碰撞偵測 | ✗ | ✓（現在用不到） |
| 關節/約束 | ✗ | ✓（現在用不到） |
| Determinism | 接近 | 嚴格保證 |

**結論**：先用手搓 + Worker 解決執行緒隔離問題；等需要碰撞偵測（牆壁、機體互打）時再引入 Rapier，並改成本機服務。

---

## 四、非同步物理的設計

### 舊架構（同步）

```
rAF 每幀
  └── 固定步長累加器
        └── while(accum >= dt) { game.flash() }
              ├── 套用引擎
              ├── 積分（Victor 手搓）
              ├── 檢查 checkpoint
              └── 累計 reward
```

物理和渲染在同一個 call stack 裡，完全同步。

### 新架構（rAF 驅動，已落地）

```
Worker（獨立執行緒）         Main Thread（rAF 60 Hz）
                              └── game.flash()       ← setEngines + 噴焰視覺
                                  game.renderFrame() ← camera + HUD
                                  field.draw()       ← 同步立即繪製（非 batchDraw）
                                  postMessage({type:'step'})
                                        │
                              Worker 收到 step
                                  └── doStep()
                                        └── postMessage(state)
                                                │
                              onmessage（下一幀前到達）
                                  ├── craft.x/y/rotation 等
                                  ├── 檢查 checkpoint
                                  └── 累計 reward
```

**關鍵設計決策：**
- `setInterval` 已移除，改由 rAF loop 結尾送 `{type:'step'}` 驅動，每幀精確一步（`FIXED_DT=1/60`）
- `space.batchDraw()` 改為 `field.draw()`（同步立即繪製），避免 camera 與 craft 位置因 batchDraw 非同步造成的脫幀閃動（詳見 `BUG_REPORT_2026-04-25.md`）
- Worker 回傳時機：rAF 結尾送 step → Worker 約 1ms 內完成並回傳 → onmessage 在下一幀 rAF 前更新位置 → 下一幀用最新狀態渲染，1 幀延遲但完全穩定

---

## 五、座標系對齊

這是設計過程中最容易出錯的地方。

```
Konva Stage: scale={x:6, y:-6}
             ↑ y 軸反轉！正 y = 螢幕上方
```

因此：
- 物理的 y 軸是向上（正 y = up），和 Rapier 的預設一樣
- Konva 的 rotation 單位是度（degrees），CW 為正（但 y 反轉後效果是 CCW）
- 手搓物理的 `rotaVelo` 累加單位其實是「遊戲單位角加速度 × 秒」，不是嚴格的 deg/s，但 kernal 機體的 torque 都是 0（對稱設計），所以這個單位問題不影響實際表現

---

## 六、這個遷移的代價

- Victor.js 完全移除（180 行引入，換成 ~50 行的 Worker）
- `buildCraft` 從物理+視覺混合 → 純視覺
- `game.flash()` 從「跑物理+更新視覺」→ 純更新視覺噴焰
- checkpoint 偵測從 rAF 循環移到 `onmessage`
- RR 秒數停頓問題：從根本架構解決，不是 patch
