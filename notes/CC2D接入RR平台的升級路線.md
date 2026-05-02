# CC2D 接入 RR 平台的升級路線

> CC2D 不只是 RR 的一個新遊戲，它的複雜度會倒逼 RR 平台在算法、系統、知識遷移三個方向升級。

---

## 01｜State 複雜度爆炸 → 算法升級

RR 現有的算法升級路線，是被遊戲的**狀態複雜度**自然逼出來的：

| 遊戲 | 狀態 | 動作 | 算法 | 升級原因 |
|---|---|---|---|---|
| 迷宮 / MAB | 離散低維 | 離散 | Q-table | 基礎 |
| CC2D kernal | 連續多維（物理模擬） | 離散 2⁴=16 | **DQN** | state 需要 NN 才能處理 |
| CC2D fighter | 連續多維（物理模擬） | 離散 2⁹=512 | **DQN** | 同上 |
| 未來連續動作遊戲 | 連續多維 | **連續多維** | SAC | action 本身是連續值 |

**關鍵：CC2D 的挑戰在 state，不在 action**

```
state：位置、速度、角度、角速度、與 checkpoint 的距離向量
      → 高維連續物理量 → 需要 NN → DQN

action：4 顆引擎的 on/off 組合 = 16 種離散選擇
      → DQN 天生處理，不需要 policy gradient
```

不是因為想教新算法才換算法，而是任務本身把算法逼到那裡。這個「被逼出來的升級」正是 RR 課程設計的核心敘事。

**建議實作順序：**
- 短期：CC2D kernal（4 引擎 on/off）→ 現有 DQN 先接上
- 中期：CC2D fighter → 仍是 DQN，但 state 與 reward 設計更複雜
- 長期：引入連續動作遊戲（如賽車）→ SAC 發揮完整效能

**PPO 不在主線：** PPO 是 on-policy 算法，每批 episode 跑完即丟，不支援錄放系統（Replay Buffer），排除在 CC 升級路徑之外。

---

## 02｜Blockly 腳本的定位：RL 的助推器

Blockly 腳本 Agent 不是為了跟 RL 競爭表現，它的存在意義是：

**人類先用腳本寫出「勉強能通關」的策略，把這段經驗餵給 RL 當起點。**

以 CC2D kernal 為例：
1. 人類用 Blockly 寫出基本控制邏輯，勉強完成 route_2
2. 把這段 episode 存進錄放系統
3. DQN 從這批示範資料開始（Behavioral Cloning 熱身）
4. RL 繼續優化，突破人類腳本的上限

Blockly 腳本是「木魚腦袋」——再多 BC 也不會自己改善，但它負責的是縮短 RL 的撞牆期，不是替代 RL。越複雜的機體，人類越只能寫出勉強通關的腳本，RL 的優化空間就越大。

---

## 03｜錄放系統 → 跨算法、跨機體的知識資產

**Episode 格式：一律存完整 SARS 序列**

```
{ state, action, reward, next_state, done }  × N steps
附加元資料：機體型號、任務、步數、最終得分、演算法
```

**錄放系統的適用邊界：off-policy only**

| 算法 | 類型 | 支援錄放 |
|---|---|---|
| Q-table / DQN | off-policy | ✓ |
| SAC | off-policy（原生 Replay Buffer） | ✓ |
| PPO / A2C | on-policy（用完即棄） | ✗ |

存的格式越單純越長命，讀取端按需取用：

| 使用情境 | 取用方式 |
|---|---|
| 同機體 BC | SARS 全用，直接 Imitation Learning |
| 跨機體遷移 | 只讀 state 軌跡，做 reward shaping |
| 跨任務分析 | LLM 讀整段 state，找規律 |
| 生成 Blockly 腳本 | LLM 分析 → 輸出決策樹 → 腳本照執行 |

**跨機體的關鍵洞察：**

```
狀態軌跡（State Trajectory）  → 跨機體可遷移（描述「該怎麼飛」）
動作序列（Action Sequence）    → 機體專屬，跨機體忽略
```

kernal 通關的狀態軌跡，描述的是「這個關卡應該用什麼位置/速度/姿態通過」——這個知識對 fighter 也有參考價值，fighter 只是需要自己想辦法用那 9 顆引擎重現那條路。

紀錄與算法解耦，紀錄也與機體解耦。存一份，用法無限。

---

## 04｜訓練速度問題

CC2D 透過 Playwright bridge 與 RR 通訊時，速度受限：

| 方案 | 速度 | 說明 |
|---|---|---|
| Playwright bridge（目前 RR 架構） | ~38 steps/sec | IPC + RAF 限制 |
| gameStep() 同步函數 | ~1000 steps/sec | 移除 RAF，暴露同步 step 函數 |

DQN 訓練需要大量 episode，38 steps/sec 會是瓶頸。接入 CC2D 時需評估是否改走 gameStep() 路線。

---

## 05｜升級全景

```
現在                          接入 CC2D 後倒逼的升級

Q-table（低維離散 state）  →  DQN（高維連續 state，NN 近似 Q）
無腳本系統                 →  Blockly 腳本作為 BC 資料來源
無錄放系統                 →  SARS 錄放 + 跨機體知識遷移
示範遊戲缺說服力           →  CC2D 展示「RL 真的能解決太空任務」
```

**算法路線圖（含後續）：**

```
Q-table  → Maze / MAB（低維 state + 離散 action）
DQN      → CC2D（高維 state + 離散 action，主線）
SAC      → 未來連續動作遊戲（entropy 探索 + 原生 Replay Buffer）
PPO      → 不在主線（on-policy，不支援錄放系統）
```

CC2D 是 RR 目前最有說服力的旗艦遊戲，也是逼出這一系列升級的引擎。
