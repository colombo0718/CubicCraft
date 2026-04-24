# PROJECT.md — CubicCraft 專案快速指引

## 這個專案是什麼

**CubicCraft（CC）** 是一個離散磚塊物理宇宙的太空機體競技遊戲平台。
世界由等大礦石粒子組成，機體的質心、慣性矩、推力扭矩全由幾何即時計算，所有運動依真實物理方程演算。

目前有兩個版本：
- **3D 版**（`index.html`）：Three.js 渲染 + Blockly 視覺化程式積木，為原始旗艦版本
- **2D 版 COC2D**（`2D/index.html`）：Konva.js 渲染，現階段開發重點，目標接入 RR 強化學習平台

## 線上網址

- 計畫部署：`cubiccraft.leaflune.org`（Cloudflare Pages，尚未部署）
- 2D 版預計網址：`cubiccraft.leaflune.org/2D/index.html`
- GitHub：（待補）

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
  index.html        COC2D 主版（Konva.js 物理模擬 + Checkpoint 系統）
  CraftData.js      2D 機體資料（kernal / double / fighter）
  codecraft.html    （舊版，備存）
media/              音效、圖片、游標資源
jquery-ui/          jQuery UI 主題（TechGreen）
manuscript/         2016 年原始設計手稿（11 張 JPG + 對應 MD）
```

---

## 2D 版物理架構

### 機體建構（`buildCraft`）
- 質量 = block 數量
- 質心 = Σ(block 位置) / mass
- 轉動慣量 I = Σ dist²(block, 質心)
- 引擎扭矩 = r × F（叉積，位置向量 × 推力向量）

### 每幀更新（`craft.run(dt)`）
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

## RR 平台整合規格（規劃中）

CC 2D 版目標成為 RR（Rein Room）強化學習平台的外部遊戲環境，使用 postMessage 雙向通訊。

### 預計 state 向量
```
[x, y, vx, vy, angle, ω, dx_to_cp, dy_to_cp, dist_to_cp]
```

### 預計 action
- 離散：0–15（4 顆引擎的開關組合）
- 連續：每顆引擎的推力大小（0~1）

### reward 設計
- 通過 checkpoint：+100
- 時間懲罰：-0.1/幀
- 偏離過遠：負分或 done=true

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
