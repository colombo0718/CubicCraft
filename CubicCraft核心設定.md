# CC-CubicCraft｜不會被技術棧帶走的「核心設定」（宇宙憲法級）

> 目標：把 CC 從「某個前端/某個引擎/某個 Blockly 版本」抽離，留下永遠可移植、可重做、可擴張的 IP 核心。

## 01｜離散磚塊宇宙（Discrete Brick Cosmos）
- 世界的最小結構單位是「磚塊/粒子」（你後來用 VOX 來承載它）。
- 重點不是 VOX 格式，而是：**世界能被離散化、能被組裝、能被演化搜尋**。
- VOX 只是好用的「設計語言」；即便未來換成別的格式，這條宇宙觀仍不變。:contentReference[oaicite:0]{index=0}

## 02｜外觀立方、交互球體（Cube Look, Sphere Physics）
- 視覺上保持 voxel 的立方辨識度；物理上用球體/球簇近似碰撞與接觸（穩定、不卡角、便宜）。
- 這是 CC 的“祖傳手感”：顆粒宇宙 + 可預期的接觸結果。
- 任何物理引擎都能實現「compound of spheres」，所以它是可移植設定。:contentReference[oaicite:1]{index=1}

## 03｜固定節拍的真實（Fixed Timestep / Simulation-First）
- CC 的“真實”由固定節拍的模擬決定，而不是由幀率決定。
- 這讓：回放、競技裁判、RL 訓練、跨裝置一致性，都變成可能。:contentReference[oaicite:2]{index=2}

## 04｜可重現（Determinism）是一條世界規則，不是工程選項
- 你要把它寫成世界法則：**同樣輸入序列 → 同樣結果**（至少在“競技/評測/訓練”模式要成立）。
- 因為 SS 若走「只同步輸入」的 deterministic lockstep，成本會極低、回放超強；rollback 也建立在 determinism 上。:contentReference[oaicite:3]{index=3}

## 05｜材料/礦石＝物理屬性＝能力語言（Material = Physics = Gameplay）
- 這是你礦石系統的真正價值：不是“有多少礦”，而是**礦石把玩家能理解的名詞，綁到可計算的物理參數**。
- 最終你會得到一張「CC 元素週期表」：密度/摩擦/導電/耐熱/磁性/脆性/能量儲存…對應到推進、武器、護盾、散熱、控制難度等玩法。

## 06｜機體設計本身就是玩法（Morphology as Gameplay）
- CC 的核心不是「操控一台固定戰機破關」，而是：
  - 破關策略（controller/policy）可優化
  - **機體形體（morphology）也可被探索、被演化、被 RL 搜尋**
- 這在研究界叫 morphology + controller 的共設計/共優化；你直覺完全踩在正路上。:contentReference[oaicite:4]{index=4}

## 07｜單一任務最適化 vs 多任務泛化（Specialist vs Generalist）
- CC 必須把「任務集合」當成宇宙的一部分，而不是關卡列表：
  - 單一任務：極致化（最快、最省能、最穩）
  - 多任務：泛化（同一機體跨任務表現穩）
- 這會自然產生“流派”，並成為 SS 競技的賽制基礎（指定任務集/禁用材料/重量上限等）。

## 08｜品質-多樣性（Quality-Diversity）是 CC 的內容引擎
- 你要的不是只找“最強那一台”，而是收集「不同風格都很強」的一整張圖鑑（門派化）。
- MAP-Elites 這種 QD 思路非常貼 CC：一邊保持多樣性、一邊保證品質。:contentReference[oaicite:5]{index=5}

## 09｜Blueprint 是“宇宙資產”，不是某個工具輸出的檔案
- 你可以永遠把 VOX 當輸入，但 CC 核心資產應該抽象成：
  - 幾何（voxel occupancy）
  - 語義標記（關節/推進器/功能點：你用色碼就能做到）
  - 材料配置（礦石/屬性）
  - 版本與授權（可交易/可分享/可競技驗證）
- 這樣不管未來 MagicaVoxel、Three.js、甚至 XR 介面怎麼換，你的資產都不會死。:contentReference[oaicite:6]{index=6}

## 10｜2D 螢幕上的 3D 感：不是“畫面更炫”，是“深度資訊規格”
- 把 3D 感寫成「視覺語法」與「HUD 規則」：
  - 深度線索：遮擋、透視、相對大小、霧化、運動視差、材質梯度等（至少兩種同時存在）:contentReference[oaicite:7]{index=7}
  - 可切換資訊圖層：速度向量、預測軌跡、相對高度/深度刻度、危險接觸提示…
- 這些是“規則”，能跨平台、跨裝置、跨引擎延續。

## 11｜可觀測、可回放、可裁判（Telemetry / Replay / Judgeability）
- CC 旗艦價值的一半來自「可驗證」：為什麼這台強？強在哪？怎麼重現？
- 把回放/狀態摘要/評分報告當成宇宙產物（可分享、可比賽提交），它比任何 UI 都耐久。

## 12｜模式分層：COC2D 是入口，CC3D 是殿堂
- 這不是降級，而是“認知曲線設計”：
  - 2D：讓大眾先理解材料、任務、設計-迭代
  - 3D：讓進階玩家享受完整空間資訊與 SS 競技
- 兩者共用同一套「宇宙憲法」（材料/設計/任務/評分/回放），只是呈現與操作不同。

---
# 一句話總結（你可以直接拿去當 CC 的定位文案）
CC 的核心不是某個引擎做出的 3D 戰機遊戲，
而是「離散磚塊物理宇宙」裡，機體設計與策略控制都能被玩家與 RL 共同探索的任務競技平台。:contentReference[oaicite:8]{index=8}
