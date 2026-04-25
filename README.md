# CubicCraft

離散磚塊物理宇宙，在這裡機體設計與自動控制都可以被探索。

所有物體由等大礦石粒子構成。機體的質心、轉動慣量、引擎扭矩全由幾何即時計算——改變形狀，就改變飛行動力學。

## 版本

**3D 版**（`index.html`）— Three.js 渲染，搭配 Blockly 視覺化程式積木。玩家用拖拉積木的方式編寫機體控制邏輯。

**2D 版 / COC2D**（`2D/index.html`）— Konva.js 2D 物理模擬，完整剛體動力學（推力、扭矩、角動量），多條件 Checkpoint 系統。定位為入門版本，同時作為 [Rein Room](https://reinforcelab.vercel.app) 強化學習平台的遊戲環境。

## 物理

- 質量 = block 數量
- 質心、轉動慣量由 block 位置即時計算
- 引擎扭矩 = r × F（位置向量 × 推力向量）
- 物理跑在 Web Worker，每幀固定時間步（dt = 1/60 s），與渲染同步

## 設計文件

- [`CubicCraft核心設定.md`](CubicCraft核心設定.md) — 宇宙憲法（跨引擎可移植的核心設定）
- [`CC宇宙的風格與文化引擎.md`](CC宇宙的風格與文化引擎.md) — 文化生成引擎（策略蟹化）
- [`CC世界設定.md`](CC世界設定.md) — 礦石系統、故事劇情、五個開發階段、七種玩法
- [`manuscript/`](manuscript/) — 2016 年原始設計手稿（11 頁）
