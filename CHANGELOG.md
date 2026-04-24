# CHANGELOG.md — CubicCraft 里程碑紀錄

---

## 2026-04 重啟：定位為 RR 平台旗艦遊戲

- 確立 2D 版（COC2D）作為 RR 強化學習平台外部遊戲環境的目標
- 部署規劃：cubiccraft.leaflune.org（Cloudflare Pages）
- RR 以外部 URL iframe 引入，不合併 repo
- 手稿整理完成，11 張 2016 年原始設計文件轉為 MD 存檔

---

## 早期開發（2016–202?）

### 3D 版初版（CodeCraft）
- Three.js 渲染 voxel 機體，球體碰撞近似
- 嵌入 Blockly 視覺化程式積木（ccBlocks.js / ccGenerator.js）
- Ace Editor 即時顯示 Blockly 輸出的 JS 程式碼
- 機體資料格式（craftData.js）與賽道資料格式（routeData.js）建立

### 2D 版 COC2D
- 以 Konva.js 重新實作 2D 物理模擬
- 完整剛體動力學：質心、轉動慣量、推力/扭矩、固定時間步
- Checkpoint 系統：位置/朝向/速度向量/靜止多條件驗證
- 三款機體定義：kernal（十字）、double（雙翼）、fighter（戰機）

---

## 2016 原始設計（手稿）

- 2016.05.30：CodeCraft 概念確立，三學年框架（競速→射擊→碰撞控制）
- 2016.05.31：離散粒子物理規格（1L/1M，光速 1000 L/s）
- 2016.06.02：5 種基本粒子 + 三族礦石加工系統
- 2016.06.06：Three.js 光源規劃（恆星/觀察者/引擎三光源）
- 2016.06.12：循序競速模式設計，checkpoint 以機體半徑 R 為基準
- 2016.06.13：第零階段規格（四款機體 Kernel/Quad/Fighter/Missile，10+ 賽道）
- 2016.07.05：物理量視覺化設計（火焰/軌跡尾/高度柱）
- 2016.07.08：Blockly 程式架構（cpu_run 每幀執行，變數隔離機制）
- 2016.07.09：Blockly 形態轉換鏈，Ace Editor 即時回饋
- 2016.09.09：自定義 Block 規格（8 種，手動/自動/混合系統）
