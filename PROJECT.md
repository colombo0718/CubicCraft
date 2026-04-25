# PROJECT.md — CubicCraft 專案快速指引

## 這個專案是什麼

**CubicCraft（CC）** 是一個離散磚塊物理宇宙的太空機體競技遊戲平台。
世界由等大礦石粒子組成，機體的質心、慣性矩、推力扭矩全由幾何即時計算，所有運動依真實物理方程演算。

目前有兩個版本：
- **3D 版**（`index.html`）：Three.js 渲染 + Blockly 視覺化程式積木，為原始旗艦版本
- **2D 版 COC2D**（`2D/index.html`）：Konva.js 渲染，現階段開發重點，目標接入 RR 強化學習平台

## 線上網址

- 主站：`cubiccraft.leaflune.org`（Cloudflare Pages，已部署）
- 2D 版：`cubiccraft.leaflune.org/2D/`
- RR 整合入口：`reinforcelab.vercel.app/?game=https://cubiccraft.leaflune.org/2D`
- GitHub：`https://github.com/colombo0718/CubicCraft`

---

## 架構概覽

```
index.html          3D 主版入口（Three.js + Blockly + Ace Editor）
CodeCraft.js        3D 版主邏輯
ccBlocks.js         自定義 Blockly 積木定義
ccGenerator.js      自定義 Blockly → JS 產生器
craftData.js        3D 機體資料
routeData.js        3D 賽道資料
2D/
  index.html        COC2D 主版（Konva.js 渲染 + Worker 物理 + RR 協定）
  physics.worker.js 物理 Worker（手搓剛體，100% 離線，無外部依賴）
  CraftData.js      2D 機體資料（kernal / double / fighter）
  codecraft.html    （舊版，備存）
tools/              Playwright 自動化腳本（record_cc2d / record_rr / check_flicker）
media/              音效、圖片、游標資源
jquery-ui/          jQuery UI 主題（TechGreen）
manuscript/         2016 年原始設計手稿（11 張 JPG + 對應 MD）
```

---

## 2D 版物理架構

### 執行緒架構
物理跑在 **Web Worker**（`physics.worker.js`），與主執行緒完全隔離。
- 主執行緒：Konva 渲染 + RR postMessage + 鍵盤輸入
- Worker：剛體積分，由 rAF loop 每幀送 `{type:'step'}` 驅動（60Hz，`FIXED_DT=1/60`）
- Worker → 主執行緒：每幀回傳 `{type:'state', x, y, vx, vy, rotation, ...}`

### 機體建構（`buildCraft`，視覺端）
- 質量 = block 數量
- 質心 = Σ(block 位置) / mass（Worker 內重算）
- 轉動慣量 I = Σ dist²(block, 質心)（Worker 內）
- 引擎扭矩 = r × F（叉積）（Worker 內）

### Worker 每步積分
```
F_sum → a = F/m → v += a·dt → pos += v·dt
τ_sum → α = τ/I → ω += α·dt → θ += ω·dt
```

### Checkpoint 驗證（`runway.check`）
- ord 0：僅位置（posGap < 3·err）
- ord 1：位置 + 朝向（facGap < 10·err）
- ord 2：位置 + 速度向量角 or 靜止
- ord 3：位置 + 朝向 + 速度向量角 or 靜止

---

## RR 平台整合規格（已實作）

CC 2D 版已接入 RR（Rein Room）強化學習平台，使用 postMessage 雙向通訊。

### state 向量（9 維）
```
[x, y, vx, vy, angle, ω, dx_to_cp, dy_to_cp, dist_to_cp]
```

### action（5 種離散）
```
0: 無  1: up  2: down  3: left  4: right
```
對應 `RR_ACTIONS` 映射表，送入 Worker 的 `setEngines`。

### reward 設計（已實作）
- 通過 checkpoint：+1（全關卡通過額外 +10）
- 時間懲罰：-0.01 / 每物理步
- 超過 maxSteps（5000）：done=true

### 通訊流程
```
RR → CC: questInfo（sessionId）
CC → RR: gameInfo（stateInfo / actionInfo）
RR → CC: action
CC → RR: reward_state（reward, state, done, sessionId）
RR → CC: pause / accel
```

參考 RR 協定：`RR平台可控遊戲環境宣告與通訊協定.md`

---

## 已知問題 / Quirks

- 3D 版依賴多個外部 CDN（`blockly-demo.appspot.com`、`ajax.googleapis.com`），長期可用性存疑
- 2D 版目前 `double` 和 `fighter` 機體在 CraftData.js 中有定義，但 index.html 裡被註解掉
- 手稿提到的第四款機體 `Missile` 尚未實作
- 2D 版目前無重力場、無碰撞偵測

---

## 設計文件索引

| 文件 | 內容 |
|---|---|
| `CubicCraft核心設定.md` | 宇宙憲法，跨引擎可移植的核心設定 |
| `CC宇宙的風格與文化引擎.md` | 文化生成引擎，策略蟹化 |
| `CC世界設定.md` | 礦石系統、故事劇情、五個開發階段、七種玩法 |
| `CC2D接入RR平台的升級路線.md` | 算法升級路線、Blockly 助推器、錄放系統設計 |
| `manuscript/` | 2016 年原始設計手稿（11 頁） |

---

## 開發規範

- **現階段重點**：2D 版接入 RR 協定，3D 版維持現狀不動大改
- 機體/賽道資料格式需嚴謹規範，為未來更多機體與關卡預留擴充空間
- commit 訊息中英文皆可，清楚說明改動內容即可
