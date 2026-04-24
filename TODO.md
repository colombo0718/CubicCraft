# TODO.md — CubicCraft 待辦清單

---

## 🔥 當前優先：2D 版接入 RR 平台

- [ ] 移除 WASD 手動控制，改由 RR `action` 訊息驅動引擎開關
  > 保留手動模式作為 debug 用，透過 URL 參數或 flag 切換
- [ ] 實作 `gameInfo` 宣告（stateInfo / actionInfo）
  > state 維度：[x, y, vx, vy, angle, ω, dx_to_cp, dy_to_cp, dist_to_cp]
  > action：4 顆引擎的離散開關組合（0–15）或連續推力
- [ ] 實作 `reward_state` 回報（含 done 欄位）
  > checkpoint 通過 +reward，超時 done=true，偏離過遠 done=true
- [ ] 接收 `questInfo` 取得 sessionId，帶回 reward_state
- [ ] 部署到 Cloudflare Pages（cubiccraft.leaflune.org）

---

## 2D 版功能擴充

- [ ] 啟用 `double` 機體並接入遊戲選單
- [ ] 啟用 `fighter` 機體並接入遊戲選單
- [ ] 實作 `Missile` 機體（手稿第零階段提到，目前未做）
- [ ] 加入重力場（環境向量 g，可調強度）
- [ ] 加入地形/邊界碰撞偵測
- [ ] 賽道選擇 UI（route_1 / route_2 / 更多）
- [ ] 機體半徑 R 動態縮放 checkpoint 容忍範圍（手稿設計）
- [ ] 軌跡尾（tail line）視覺效果
- [ ] 引擎火光（PointLight 效果，2D 版用發光粒子模擬）

---

## 礦石 / 材料系統

- [ ] 定義礦石資料結構（顏色對應物理屬性：密度/導電/散熱等）
- [ ] 2D 版 block 顏色接上材料屬性（目前顏色只是視覺，無物理意義）
  > 這條是「宇宙憲法」裡 Material = Physics = Gameplay 的落地

---

## 3D 版維護

- [ ] 將 CDN 依賴（Three.js / jQuery / Blockly）改為本地托管或穩定 CDN
  > 目前 `blockly-demo.appspot.com` 不保證長期可用

---

## 長期 / 擱置

- [ ] 3D 版完整重啟（等 2D 版 RR 整合穩定後）
  > 技術棧：Three.js + Rapier.js + VOX Blueprint
  > 路已鋪好：CubicCode/BuildRobot.html 已實現 VOX→compound sphere 剛體 + 顏色語義標記 + HingeConstraint
- [ ] Blockly 自動駕駛模式（手稿提到 hybrid 手動+自動）
  > 可作為「玩家 vs RL agent」對比的示範場景，BC 起點
- [ ] 三個星際聯邦系統（見 CC世界設定.md §03）
  > 各聯邦有不同礦物資源 → 衍生不同機體文化，策略蟹化的具體落地
- [ ] 多機體編隊任務（文化引擎文件中的「協同精準文化」設定）
- [ ] 開發階段二：烽火連天——熱兵器（短槍/長槍/罐頭飛彈）
- [ ] 開發階段五：風雲變色——多體機動戰士（BuildRobot 架構移植）
