---
title: 選擇題測驗卷網站講義（學生版）.md
tags: [作業筆記]

---

---
title: 選擇題測驗卷網站講義（學生版）

---

---
title: 選擇題測驗卷網站講義（學生版）
tags: [114程式設計與實習_上學期]

---

# 選擇題測驗卷網站講義（學生版）

學號：＿＿＿＿＿＿＿＿　　姓名：＿＿＿＿＿＿＿＿

> **填寫方式**
> 1. 每個學習都要放：**執行截圖**、**三次問 AI 的提示詞**、**最後採用的程式碼**。
> 2. 問 AI 的提示詞請**逐字貼上**自己實際輸入的內容（不要寫摘要），第一次、第二次、第三次依序記錄。
> 3. 程式碼貼在「點開貼上」的收合區塊裡，貼上**你最後真正採用、而且能執行**的版本。

---

## 學習1：產生一個選擇題測驗卷網站

https://cfchen58.synology.me/115/week4/stage1/

**這個階段的目標：** 用 p5.js 做出一個一次顯示一題、四個選項、答完會顯示對錯與總分的測驗網站（題目先寫在程式裡）。
**這個階段會修改的檔案：** index.html、sketch.js

### 執行截圖

![2026.10.08-1](https://hackmd.io/_uploads/S1NLc2Vjfe.gif)

### 第一次問 AI
```tex!
使用p5.js撰寫一個選擇題網頁測驗系統，我已經產生了一個p5.js專案，請把程式碼寫到sketch.js檔案內，每條指令都須加上中文註解。測驗系統題目設定為五題，測驗題目的內容為程式設計p5.js簡易指令練習測驗，系統採用全銀幕畫布，使用者答錯時，系統會在正確答案選項上，加上588157背景顏色，該選項要上下跳動。答錯時選項採用bc4749背景顏色，選項左右移動，選擇題選項共有四個選項，當五題結束後，需顯示答對題數，每次顯示一個題目，需要有下一題的按鈕
```
答對畫面
![image](https://hackmd.io/_uploads/BJrEwnEsze.png)

### 程式碼內容

:::info
:::spoiler 點開貼上學習1的程式碼
```javascript=
// 定義測驗題目與選項資料庫
let questions = [
  {
    question: "1. 在 p5.js 中，哪一個函式只會在程式開始時執行一次？",
    options: ["A. draw()", "B. setup()", "C. mousePressed()", "D. createCanvas()"],
    answer: 1 // 正確答案索引（索引從 0 開始，1 為 B. setup()）
  },
  {
    question: "2. 哪一個指令可以用來繪製一個圓形？",
    options: ["A. rect()", "B. line()", "C. circle()", "D. triangle()"],
    answer: 2 // 正確答案索引為 C. circle()
  },
  {
    question: "3. 若要設定畫布的背景顏色為黑色，應該使用哪個指令？",
    options: ["A. background(0);", "B. background(255);", "C. fill(0);", "D. stroke(0);"],
    answer: 0 // 正確答案索引為 A. background(0);
  },
  {
    question: "4. p5.js 中用來代表滑鼠當前 X 軸座標的系統變數是？",
    options: ["A. mousePos.x", "B. mouseX", "C. getMouseX()", "D. posX"],
    answer: 1 // 正確答案索引為 B. mouseX
  },
  {
    question: "5. 若要產生一個介於 0 到 100 之間的隨機浮點數，應該使用？",
    options: ["A. random(100)", "B. round(100)", "C. abs(100)", "D. floor(100)"],
    answer: 0 // 正確答案索引為 A. random(100)
  }
];

// 當前進行到第幾題的索引
let currentQuestionIndex = 0;

// 記錄答對的總題數
let score = 0;

// 記錄使用者選中的選項索引，-1 表示尚未選擇
let selectedOption = -1;

// 標記目前這題是否已經選擇答案
let hasAnswered = false;

// 下一題按鈕的物件變數
let nextButton;

// p5.js 設定畫布與初始化函式
function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 設定文字對齊方式為居中
  textAlign(CENTER, CENTER);
  
  // 建立「下一題」按鈕
  nextButton = createButton('下一題');
  
  // 設定按鈕尺寸與樣式
  nextButton.size(120, 45);
  nextButton.style('font-size', '18px');
  nextButton.style('cursor', 'pointer');
  nextButton.style('background-color', '#4CAF50');
  nextButton.style('color', 'white');
  nextButton.style('border', 'none');
  nextButton.style('border-radius', '8px');
  
  // 綁定按鈕點擊事件處理函式
  nextButton.mousePressed(nextQuestion);
  
  // 初始化隱藏按鈕，等作答後才顯示
  nextButton.hide();
}

// p5.js 主重複繪製函式
function draw() {
  // 設定淺灰色背景，清空前一幀畫面
  background(245);
  
  // 判斷是否所有題目均已回答完畢
  if (currentQuestionIndex < questions.length) {
    // 若還有題目，繪製測驗介面
    drawQuiz();
  } else {
    // 若題目已結束，顯示結算成績畫面
    drawResult();
  }
}

// 繪製單一題目與選項的介面函式
function drawQuiz() {
  // 取得當前題目的資料
  let q = questions[currentQuestionIndex];
  
  // 設定題目文字顏色為深灰色
  fill(40);
  // 設定題目文字大小
  textSize(24);
  // 在畫布上方繪製題目文字
  text(q.question, width / 2, height * 0.18);
  
  // 計算選項畫面的整體版面尺寸
  let boxWidth = min(width * 0.7, 500); // 選項框寬度
  let boxHeight = 55;                   // 選項框高度
  let startY = height * 0.28;           // 第一個選項的初始 Y 座標
  let spacing = 70;                     // 選項之間的間距
  
  // 迴圈繪製 4 個選項
  for (let i = 0; i < 4; i++) {
    // 預設選項框的中心 X, Y 座標
    let x = width / 2;
    let y = startY + i * spacing;
    
    // 預設選項框背景顏色（淺灰藍色）
    let bgColor = color('#E2E8F0');
    // 預設選項文字顏色
    let textColor = color(30);
    
    // 若玩家已經作答，則進行提示動畫與顏色計算
    if (hasAnswered) {
      // 情況一：正確答案選項（亮綠色背景 #588157 + 上下跳動動畫）
      if (i === q.answer) {
        bgColor = color('#588157');
        textColor = color(255);
        // 使用 sin 函式產生平滑的上下跳動效果
        y += sin(frameCount * 0.15) * 8;
      } 
      // 情況二：玩家選錯的選項（暗紅色背景 #bc4749 + 左右搖晃動畫）
      else if (i === selectedOption && selectedOption !== q.answer) {
        bgColor = color('#bc4749');
        textColor = color(255);
        // 使用 sin 函式產生平滑的左右晃動效果
        x += sin(frameCount * 0.3) * 10;
      }
    }
    
    // 繪製選項卡片的矩形背景
    push();
    rectMode(CENTER);
    fill(bgColor);
    noStroke();
    rect(x, y, boxWidth, boxHeight, 10); // 最後參數 10 為圓角半徑
    pop();
    
    // 繪製選項內部的文字
    fill(textColor);
    textSize(18);
    text(q.options[i], x, y);
  }
  
  // 更新「下一題」按鈕的位置並顯示
  if (hasAnswered) {
    nextButton.position(width / 2 - 60, startY + 4 * spacing + 10);
    nextButton.show();
  } else {
    nextButton.hide();
  }
}

// 繪製最終測驗結果畫面
function drawResult() {
  // 隱藏「下一題」按鈕
  nextButton.hide();
  
  // 繪製成績標題文字
  fill(30);
  textSize(36);
  text("測驗結束！", width / 2, height * 0.35);
  
  // 顯示答對題數統計資訊
  textSize(28);
  fill('#2A9D8F');
  text(`您一共答對了 ${score} / ${questions.length} 題`, width / 2, height * 0.48);
}

// 滑鼠點擊事件監聽函式
function mousePressed() {
  // 若已經作答完該題，或所有題目已結束，則不處理選項點擊
  if (hasAnswered || currentQuestionIndex >= questions.length) {
    return;
  }
  
  // 計算選項卡片的對應座標
  let boxWidth = min(width * 0.7, 500);
  let boxHeight = 55;
  let startY = height * 0.28;
  let spacing = 70;
  
  // 判斷滑鼠點擊位置是否在某個選項範圍內
  for (let i = 0; i < 4; i++) {
    let x = width / 2;
    let y = startY + i * spacing;
    
    // 計算滑鼠座標是否落於第 i 個矩形框框內
    if (mouseX > x - boxWidth / 2 && mouseX < x + boxWidth / 2 &&
        mouseY > y - boxHeight / 2 && mouseY < y + boxHeight / 2) {
      
      // 記錄玩家選擇的選項
      selectedOption = i;
      // 標記該題已作答
      hasAnswered = true;
      
      // 若選擇正確，答對題數加 1
      if (i === questions[currentQuestionIndex].answer) {
        score++;
      }
      break;
    }
  }
}

// 點擊「下一題」按鈕後執行的邏輯函式
function nextQuestion() {
  // 切換至下一題
  currentQuestionIndex++;
  // 重置選擇狀態為未選擇
  selectedOption = -1;
  // 重置作答狀態為未作答
  hasAnswered = false;
  // 隱藏下一題按鈕
  nextButton.hide();
}

// 當瀏覽器視窗大小改變時自動調適畫布尺寸
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

```
:::


---

## 學習2：網頁設定為響應式網頁

https://cfchen58.synology.me/115/week4/stage2/

**這個階段的目標：** 讓網站在電腦、平板、手機（直向與橫向）都能正常顯示，視窗大小改變時版面自動調整。
**這個階段會修改的檔案：** index.html、sketch.js

### 執行截圖
![2026.10.08-2](https://hackmd.io/_uploads/r18IThNsfl.gif)
### 第一次問 AI

```tex!
網頁設定為響應式網頁，讓網站在電腦、平板、手機（直向與橫向）都能正常顯示，視窗大小改變時版面自動調整。
```

### 程式碼內容

:::info
:::spoiler 點開貼上學習2的程式碼
```javascript=
// 定義測驗題目與選項資料庫
let questions = [
  {
    question: "1. 在 p5.js 中，哪一個函式只會在程式開始時執行一次？",
    options: ["A. draw()", "B. setup()", "C. mousePressed()", "D. createCanvas()"],
    answer: 1 // 正確答案索引（1 為 B. setup()）
  },
  {
    question: "2. 哪一個指令可以用來繪製一個圓形？",
    options: ["A. rect()", "B. line()", "C. circle()", "D. triangle()"],
    answer: 2 // 正確答案索引為 C. circle()
  },
  {
    question: "3. 若要設定畫布的背景顏色為黑色，應該使用哪個指令？",
    options: ["A. background(0);", "B. background(255);", "C. fill(0);", "D. stroke(0);"],
    answer: 0 // 正確答案索引為 A. background(0);
  },
  {
    question: "4. p5.js 中用來代表滑鼠當前 X 軸座標的系統變數是？",
    options: ["A. mousePos.x", "B. mouseX", "C. getMouseX()", "D. posX"],
    answer: 1 // 正確答案索引為 B. mouseX
  },
  {
    question: "5. 若要產生一個介於 0 到 100 之間的隨機浮點數，應該使用？",
    options: ["A. random(100)", "B. round(100)", "C. abs(100)", "D. floor(100)"],
    answer: 0 // 正確答案索引為 A. random(100)
  }
];

// 當前進行到第幾題的索引
let currentQuestionIndex = 0;

// 記錄答對的總題數
let score = 0;

// 記錄使用者選中的選項索引，-1 表示尚未選擇
let selectedOption = -1;

// 標記目前這題是否已經選擇答案
let hasAnswered = false;

// 下一題按鈕的物件變數
let nextButton;

// p5.js 設定畫布與初始化函式
function setup() {
  // 建立全螢幕畫布，完全覆蓋瀏覽器視窗
  createCanvas(windowWidth, windowHeight);
  
  // 設定文字對齊方式為水平與垂直居中
  textAlign(CENTER, CENTER);
  
  // 建立「下一題」按鈕
  nextButton = createButton('下一題');
  
  // 設定按鈕基礎樣式
  nextButton.style('cursor', 'pointer');
  nextButton.style('background-color', '#4CAF50');
  nextButton.style('color', 'white');
  nextButton.style('border', 'none');
  nextButton.style('border-radius', '8px');
  nextButton.style('font-weight', 'bold');
  
  // 綁定按鈕點擊事件處理函式
  nextButton.mousePressed(nextQuestion);
  
  // 初始化隱藏按鈕
  nextButton.hide();
}

// p5.js 主重複繪製函式
function draw() {
  // 設定淺灰色背景，清空前一幀畫面
  background(245);
  
  // 判斷是否所有題目均已回答完畢
  if (currentQuestionIndex < questions.length) {
    // 若還有題目，繪製測驗介面
    drawQuiz();
  } else {
    // 若題目已結束，顯示結算成績畫面
    drawResult();
  }
}

// 繪製單一題目與選項的響應式介面函式
function drawQuiz() {
  // 取得當前題目的資料
  let q = questions[currentQuestionIndex];
  
  // --- 響應式佈局參數計算 ---
  // 動態設定題目文字大小（根據視窗寬度與高度調整，並設有上限與下限）
  let titleFontSize = constrain(min(width * 0.04, height * 0.035), 16, 26);
  // 動態設定選項文字大小
  let optionFontSize = constrain(min(width * 0.035, height * 0.028), 13, 20);
  
  // 動態計算選項框的寬度與高度
  let boxWidth = min(width * 0.85, 600); 
  let boxHeight = constrain(height * 0.07, 40, 60);
  
  // 動態計算選項之間的垂直間距與起始點 Y 座標
  let spacing = boxHeight + constrain(height * 0.02, 8, 16);
  let startY = constrain(height * 0.25, 100, 200);

  // 繪製題目文字
  fill(40);
  textSize(titleFontSize);
  // 啟用自動換行，確保題目太長時在手機上不會超出螢幕
  rectMode(CENTER);
  text(q.question, width / 2, startY - boxHeight * 1.5, boxWidth, boxHeight * 2);
  
  // 迴圈繪製 4 個選項
  for (let i = 0; i < 4; i++) {
    // 預設選項框的中心 X, Y 座標
    let x = width / 2;
    let y = startY + i * spacing;
    
    // 預設選項框背景顏色（淺灰藍色）
    let bgColor = color('#E2E8F0');
    // 預設選項文字顏色
    let textColor = color(30);
    
    // 若玩家已經作答，則進行提示動畫與顏色計算
    if (hasAnswered) {
      // 情況一：正確答案選項（亮綠色背景 #588157 + 上下跳動動畫）
      if (i === q.answer) {
        bgColor = color('#588157');
        textColor = color(255);
        // 使用 sin 函式產生平滑的上下跳動效果
        y += sin(frameCount * 0.15) * 8;
      } 
      // 情況二：玩家選錯的選項（暗紅色背景 #bc4749 + 左右搖晃動畫）
      else if (i === selectedOption && selectedOption !== q.answer) {
        bgColor = color('#bc4749');
        textColor = color(255);
        // 使用 sin 函式產生平滑的左右晃動效果
        x += sin(frameCount * 0.3) * 10;
      }
    }
    
    // 繪製選項卡片的矩形背景
    push();
    rectMode(CENTER);
    fill(bgColor);
    noStroke();
    rect(x, y, boxWidth, boxHeight, 10); // 10 為圓角半徑
    pop();
    
    // 繪製選項內部的文字
    fill(textColor);
    textSize(optionFontSize);
    text(q.options[i], x, y);
  }
  
  // 更新「下一題」按鈕的位置與動態尺寸並顯示
  if (hasAnswered) {
    let btnW = constrain(width * 0.25, 100, 160);
    let btnH = constrain(height * 0.06, 35, 50);
    let btnY = startY + 4 * spacing + 10;
    
    nextButton.size(btnW, btnH);
    nextButton.style('font-size', constrain(btnH * 0.4, 14, 20) + 'px');
    nextButton.position(width / 2 - btnW / 2, btnY);
    nextButton.show();
  } else {
    nextButton.hide();
  }
}

// 繪製最終測驗結果畫面
function drawResult() {
  // 隱藏「下一題」按鈕
  nextButton.hide();
  
  // 動態計算結果頁面字體大小
  let titleSize = constrain(min(width * 0.06, height * 0.05), 24, 40);
  let scoreSize = constrain(min(width * 0.045, height * 0.038), 18, 30);
  
  // 繪製成績標題文字
  fill(30);
  textSize(titleSize);
  text("測驗結束！", width / 2, height * 0.38);
  
  // 顯示答對題數統計資訊
  textSize(scoreSize);
  fill('#2A9D8F');
  text(`您一共答對了 ${score} / ${questions.length} 題`, width / 2, height * 0.5);
}

// 滑鼠點擊事件監聽函式（相容手機觸控點擊）
function mousePressed() {
  // 若已經作答完該題，或所有題目已結束，則不處理選項點擊
  if (hasAnswered || currentQuestionIndex >= questions.length) {
    return;
  }
  
  // 重新計算當前視窗下的選項卡片對應座標與尺寸
  let boxWidth = min(width * 0.85, 600);
  let boxHeight = constrain(height * 0.07, 40, 60);
  let spacing = boxHeight + constrain(height * 0.02, 8, 16);
  let startY = constrain(height * 0.25, 100, 200);
  
  // 判斷滑鼠/觸控點擊位置是否落於某個選項範圍內
  for (let i = 0; i < 4; i++) {
    let x = width / 2;
    let y = startY + i * spacing;
    
    // 計算點擊座標範圍
    if (mouseX > x - boxWidth / 2 && mouseX < x + boxWidth / 2 &&
        mouseY > y - boxHeight / 2 && mouseY < y + boxHeight / 2) {
      
      // 記錄玩家選擇的選項
      selectedOption = i;
      // 標記該題已作答
      hasAnswered = true;
      
      // 若選擇正確，答對題數加 1
      if (i === questions[currentQuestionIndex].answer) {
        score++;
      }
      break;
    }
  }
}

// 點擊「下一題」按鈕後執行的邏輯函式
function nextQuestion() {
  // 切換至下一題
  currentQuestionIndex++;
  // 重置選擇狀態為未選擇
  selectedOption = -1;
  // 重置作答狀態為未作答
  hasAnswered = false;
  // 隱藏下一題按鈕
  nextButton.hide();
}

// 當瀏覽器視窗大小改變或手機旋轉螢幕時自動調適畫布與版面
function windowResized() {
  // 重新將畫布調適為新的視窗寬高
  resizeCanvas(windowWidth, windowHeight);
}

```
:::


---

## 學習3：設定嵌入 Google 字型，網頁文字採用這些字型

https://cfchen58.synology.me/115/week4/stage3/

**這個階段的目標：** 從 Google Fonts 嵌入繁體中文字型，並讓畫布上的題目與選項文字使用這些字型。
**這個階段會修改的檔案：** index.html、sketch.js

### 執行截圖

（把截圖拖曳到這裡，或貼上圖片連結）

![學習3截圖](請貼上截圖)

### 第一次問 AI

```tex!
（逐字貼上你第一次問 AI 的提示詞）
```

### 第二次問 AI

```tex!
（逐字貼上你第二次問 AI 的提示詞）
```

### 第三次問 AI

```tex!
（逐字貼上你第三次問 AI 的提示詞）
```

### 程式碼內容

:::info
:::spoiler 點開貼上學習3的程式碼
```javascript=
//學習3程式碼所在

```
:::


---

## 學習4：設定題庫並抽題顯示題目網頁（CSV 檔案）

https://cfchen58.synology.me/115/week4/stage4/

**這個階段的目標：** 把題目移到 questions.csv，網站讀取題庫後每次隨機抽出 5 題。
**這個階段會修改的檔案：** index.html、sketch.js、questions.csv

### 執行截圖

（把截圖拖曳到這裡，或貼上圖片連結）

![學習4截圖](請貼上截圖)

### 第一次問 AI

```tex!
（逐字貼上你第一次問 AI 的提示詞）
```

### 第二次問 AI

```tex!
（逐字貼上你第二次問 AI 的提示詞）
```

### 第三次問 AI

```tex!
（逐字貼上你第三次問 AI 的提示詞）
```

### 程式碼內容

:::info
:::spoiler 點開貼上學習4的程式碼
```javascript=
//學習4程式碼所在

```
:::


---

## 學習5：利用 Google Sheets 當題庫

https://cfchen58.synology.me/115/week4/stage5/

**這個階段的目標：** 把題庫放在 Google 試算表，網站直接讀取，老師改試算表，網站題目就跟著更新。
**這個階段會修改的檔案：** index.html、sketch.js（questions.csv 當備用題庫）

### 執行截圖

（把截圖拖曳到這裡，或貼上圖片連結）

![學習5截圖](請貼上截圖)

### 第一次問 AI

```tex!
（逐字貼上你第一次問 AI 的提示詞）
```

### 第二次問 AI

```tex!
（逐字貼上你第二次問 AI 的提示詞）
```

### 第三次問 AI

```tex!
（逐字貼上你第三次問 AI 的提示詞）
```

### 程式碼內容

:::info
:::spoiler 點開貼上學習5的程式碼
```javascript=
//學習5程式碼所在

```
:::


---

## 我的心得

這五個學習中，哪一個最困難？你是怎麼解決的？（請寫出實際發生的事）

＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿
