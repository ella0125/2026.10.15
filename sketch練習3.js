// 定義測驗題目與選項資料庫
let questions = [
  // 建立第一題資料
  {
    // 設定第一題題目內容
    question: "1. 在 p5.js 中，哪一個函式只會在程式開始時執行一次？",
    // 設定第一題四個選項
    options: ["A. draw()", "B. setup()", "C. mousePressed()", "D. createCanvas()"],
    // 設定第一題正確答案索引
    answer: 1
  },
  // 建立第二題資料
  {
    // 設定第二題題目內容
    question: "2. 哪一個指令可以用來繪製一個圓形？",
    // 設定第二題四個選項
    options: ["A. rect()", "B. line()", "C. circle()", "D. triangle()"],
    // 設定第二題正確答案索引
    answer: 2
  },
  // 建立第三題資料
  {
    // 設定第三題題目內容
    question: "3. 若要設定畫布的背景顏色為黑色，應該使用哪個指令？",
    // 設定第三題四個選項
    options: ["A. background(0);", "B. background(255);", "C. fill(0);", "D. stroke(0);"],
    // 設定第三題正確答案索引
    answer: 0
  },
  // 建立第四題資料
  {
    // 設定第四題題目內容
    question: "4. p5.js 中用來代表滑鼠當前 X 軸座標的系統變數是？",
    // 設定第四題四個選項
    options: ["A. mousePos.x", "B. mouseX", "C. getMouseX()", "D. posX"],
    // 設定第四題正確答案索引
    answer: 1
  },
  // 建立第五題資料
  {
    // 設定第五題題目內容
    question: "5. 若要產生一個介於 0 到 100 之間的隨機浮點數，應該使用？",
    // 設定第五題四個選項
    options: ["A. random(100)", "B. round(100)", "C. abs(100)", "D. floor(100)"],
    // 設定第五題正確答案索引
    answer: 0
  }
];

// 設定中文字型名稱
const chineseFont = "LXGW WenKai TC";

// 設定英文字型名稱
const englishFont = "Edu QLD Hand";

// 設定目前題目索引
let currentQuestionIndex = 0;

// 設定目前答對題數
let score = 0;

// 設定目前選取的選項索引
let selectedOption = -1;

// 設定目前題目是否已作答
let hasAnswered = false;

// 設定下一題按鈕物件
let nextButton;

// 設定重新測驗按鈕物件
let restartButton;

// 設定 Google Fonts 是否已載入
let fontsReady = false;

// 設定畫布文字的目前字型
let currentCanvasFont = "";

// 設定畫布文字的目前大小
let currentCanvasFontSize = 0;

// p5.js 載入前置資源的函式
function preload() {
  // 不使用 p5.js preload 載入字型，改由 index.html 的 Google Fonts 載入
}

// p5.js 初始化函式
function setup() {
  // 建立符合瀏覽器大小的全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 設定畫布文字水平置中
  textAlign(CENTER, CENTER);

  // 設定矩形模式為中心模式
  rectMode(CENTER);

  // 設定 HTML 文件的預設字型
  document.documentElement.style.fontFamily = `"${chineseFont}", "${englishFont}", sans-serif`;

  // 設定 body 元素的預設字型
  document.body.style.fontFamily = `"${chineseFont}", "${englishFont}", sans-serif`;

  // 建立下一題按鈕
  nextButton = createButton("下一題");

  // 設定下一題按鈕的中文字型
  nextButton.style("font-family", `"${chineseFont}", "${englishFont}", sans-serif`);

  // 設定下一題按鈕的滑鼠游標
  nextButton.style("cursor", "pointer");

  // 設定下一題按鈕的背景顏色
  nextButton.style("background-color", "#588157");

  // 設定下一題按鈕的文字顏色
  nextButton.style("color", "#ffffff");

  // 移除下一題按鈕邊框
  nextButton.style("border", "none");

  // 設定下一題按鈕圓角
  nextButton.style("border-radius", "10px");

  // 設定下一題按鈕文字粗細
  nextButton.style("font-weight", "bold");

  // 綁定下一題按鈕事件
  nextButton.mousePressed(nextQuestion);

  // 建立重新測驗按鈕
  restartButton = createButton("重新測驗");

  // 設定重新測驗按鈕的中文字型
  restartButton.style("font-family", `"${chineseFont}", "${englishFont}", sans-serif`);

  // 設定重新測驗按鈕的滑鼠游標
  restartButton.style("cursor", "pointer");

  // 設定重新測驗按鈕的背景顏色
  restartButton.style("background-color", "#588157");

  // 設定重新測驗按鈕的文字顏色
  restartButton.style("color", "#ffffff");

  // 移除重新測驗按鈕邊框
  restartButton.style("border", "none");

  // 設定重新測驗按鈕圓角
  restartButton.style("border-radius", "10px");

  // 設定重新測驗按鈕文字粗細
  restartButton.style("font-weight", "bold");

  // 綁定重新測驗按鈕事件
  restartButton.mousePressed(restartQuiz);

  // 隱藏下一題按鈕
  nextButton.hide();

  // 隱藏重新測驗按鈕
  restartButton.hide();

  // 等待瀏覽器完成 Google Fonts 載入
  if (document.fonts && document.fonts.ready) {
    // 等待所有網頁字型載入完成
    document.fonts.ready.then(function () {
      // 標記字型已經準備完成
      fontsReady = true;

      // 重新套用 HTML 按鈕字型
      applyButtonFonts();
    });
  } else {
    // 瀏覽器不支援 Font Loading API 時直接使用 CSS 字型
    fontsReady = true;
  }
}

// p5.js 每一幀執行一次的主要繪圖函式
function draw() {
  // 設定淡灰色背景
  background("#f7f3ee");

  // 判斷測驗是否已經結束
  if (currentQuestionIndex < questions.length) {
    // 繪製測驗畫面
    drawQuiz();
  } else {
    // 繪製結果畫面
    drawResult();
  }
}

// 設定 HTML 按鈕的字型
function applyButtonFonts() {
  // 設定下一題按鈕的中文字型與英文字型
  nextButton.style("font-family", `"${chineseFont}", "${englishFont}", sans-serif`);

  // 設定重新測驗按鈕的中文字型與英文字型
  restartButton.style("font-family", `"${chineseFont}", "${englishFont}", sans-serif`);
}

// 設定 Canvas 中文字型或英文字型
function setCanvasFont(fontName, fontSize) {
  // 建立目前字型與文字大小的識別字串
  let fontKey = fontName + "-" + fontSize;

  // 判斷目前字型是否與要求的字型不同
  if (currentCanvasFont !== fontKey) {
    // 設定 p5.js Canvas 字型
    textFont(fontName);

    // 設定 p5.js Canvas 文字大小
    textSize(fontSize);

    // 記錄目前使用的字型與文字大小
    currentCanvasFont = fontKey;

    // 記錄目前使用的 Canvas 文字大小
    currentCanvasFontSize = fontSize;
  }
}

// 判斷字元是否為中文字元
function isChineseCharacter(character) {
  // 使用 Unicode 範圍判斷中文與中文標點
  return /[\u2E80-\u9FFF\uF900-\uFAFF\u3000-\u303F]/.test(character);
}

// 取得字串中的中文字與英文字分段資料
function splitTextByFont(message) {
  // 建立分段陣列
  let runs = [];

  // 建立目前使用的字型名稱
  let activeFont = "";

  // 建立目前累積的文字
  let activeText = "";

  // 逐一讀取字串中的每個字元
  for (let i = 0; i < message.length; i++) {
    // 取得目前字元
    let character = message[i];

    // 判斷目前字元是否為中文
    let fontName = isChineseCharacter(character) ? chineseFont : englishFont;

    // 判斷目前字型是否與上一個字型相同
    if (fontName === activeFont) {
      // 將字元加入目前分段
      activeText += character;
    } else {
      // 判斷目前是否已有文字分段
      if (activeText.length > 0) {
        // 將前一段文字加入分段陣列
        runs.push({
          text: activeText,
          font: activeFont
        });
      }

      // 開始新的字型分段
      activeFont = fontName;

      // 設定新的分段文字
      activeText = character;
    }
  }

  // 判斷最後是否還有未加入的文字
  if (activeText.length > 0) {
    // 將最後一段加入分段陣列
    runs.push({
      text: activeText,
      font: activeFont
    });
  }

  // 回傳混合字型分段資料
  return runs;
}

// 計算混合字型文字總寬度
function getMixedTextWidth(message, fontSize) {
  // 取得文字分段資料
  let runs = splitTextByFont(message);

  // 建立文字總寬度
  let totalWidth = 0;

  // 逐一計算每個分段的寬度
  for (let i = 0; i < runs.length; i++) {
    // 設定目前分段字型與文字大小
    setCanvasFont(runs[i].font, fontSize);

    // 累加目前分段的文字寬度
    totalWidth += textWidth(runs[i].text);
  }

  // 回傳混合文字總寬度
  return totalWidth;
}

// 繪製中英文混合文字
function drawMixedText(message, centerX, centerY, fontSize) {
  // 取得中英文分段資料
  let runs = splitTextByFont(message);

  // 計算整段文字總寬度
  let totalWidth = getMixedTextWidth(message, fontSize);

  // 計算文字繪製起始 X 座標
  let drawX = centerX - totalWidth / 2;

  // 逐一繪製每個字型分段
  for (let i = 0; i < runs.length; i++) {
    // 設定目前分段字型與文字大小
    setCanvasFont(runs[i].font, fontSize);

    // 設定文字左對齊，方便分段繪製
    textAlign(LEFT, CENTER);

    // 繪製目前分段文字
    text(runs[i].text, drawX, centerY);

    // 累加目前分段文字寬度
    drawX += textWidth(runs[i].text);
  }

  // 恢復文字水平置中
  textAlign(CENTER, CENTER);
}

// 繪製可自動換行的中英文混合文字
function drawWrappedMixedText(message, centerX, centerY, maxWidth, lineHeight, fontSize) {
  // 將題目依照空白與字元切分
  let tokens = message.match(/[\u4e00-\u9fff\u3000-\u303f]|[^\u4e00-\u9fff\u3000-\u303f\s]+|\s+/g) || [message];

  // 建立換行文字陣列
  let lines = [];

  // 建立目前換行文字
  let currentLine = "";

  // 逐一處理文字片段
  for (let i = 0; i < tokens.length; i++) {
    // 取得目前文字片段
    let token = tokens[i];

    // 建立測試文字
    let testLine = currentLine + token;

    // 判斷測試文字是否超出最大寬度
    if (getMixedTextWidth(testLine, fontSize) > maxWidth && currentLine.length > 0) {
      // 將目前文字加入換行陣列
      lines.push(currentLine.trim());

      // 將目前文字片段作為下一行開頭
      currentLine = token.trim();
    } else {
      // 將文字片段加入目前文字
      currentLine = testLine;
    }
  }

  // 將最後一行文字加入陣列
  if (currentLine.trim().length > 0) {
    // 將最後一行放入換行陣列
    lines.push(currentLine.trim());
  }

  // 計算文字第一行的起始 Y 座標
  let startY = centerY - ((lines.length - 1) * lineHeight) / 2;

  // 逐行繪製文字
  for (let i = 0; i < lines.length; i++) {
    // 繪製目前這一行混合字型文字
    drawMixedText(lines[i], centerX, startY + i * lineHeight, fontSize);
  }
}

// 計算目前選項的繪製位置
function getOptionPosition(index) {
  // 計算選項框寬度
  let boxWidth = min(width * 0.85, 650);

  // 計算選項框高度
  let boxHeight = constrain(height * 0.07, 48, 68);

  // 計算選項框間距
  let spacing = boxHeight + constrain(height * 0.02, 10, 18);

  // 計算選項起始位置
  let startY = constrain(height * 0.25, 120, 200);

  // 計算選項中心 X 座標
  let x = width / 2;

  // 計算選項中心 Y 座標
  let y = startY + index * spacing;

  // 回傳選項位置與尺寸
  return {
    x: x,
    y: y,
    width: boxWidth,
    height: boxHeight
  };
}

// 繪製測驗畫面
function drawQuiz() {
  // 取得目前題目
  let q = questions[currentQuestionIndex];

  // 計算題目文字大小
  let titleFontSize = constrain(min(width * 0.04, height * 0.035), 18, 30);

  // 計算選項文字大小
  let optionFontSize = constrain(min(width * 0.035, height * 0.028), 16, 24);

  // 計算題目區域中心位置
  let questionY = constrain(height * 0.12, 70, 120);

  // 設定題目文字顏色
  fill("#303030");

  // 繪製可以換行的題目文字
  drawWrappedMixedText(q.question, width / 2, questionY, width * 0.85, titleFontSize * 1.35, titleFontSize);

  // 逐一繪製四個選項
  for (let i = 0; i < q.options.length; i++) {
    // 取得目前選項位置
    let option = getOptionPosition(i);

    // 設定選項 X 座標
    let x = option.x;

    // 設定選項 Y 座標
    let y = option.y;

    // 設定預設選項背景顏色
    let optionColor = color("#dfe7ef");

    // 設定預設選項文字顏色
    let optionTextColor = color("#202020");

    // 判斷目前是否已經作答
    if (hasAnswered) {
      // 判斷是否為正確答案
      if (i === q.answer) {
        // 設定正確答案背景顏色
        optionColor = color("#588157");

        // 設定正確答案文字顏色
        optionTextColor = color("#ffffff");

        // 讓正確答案上下跳動
        y += sin(frameCount * 0.15) * 8;
      } else if (i === selectedOption && selectedOption !== q.answer) {
        // 設定錯誤答案背景顏色
        optionColor = color("#bc4749");

        // 設定錯誤答案文字顏色
        optionTextColor = color("#ffffff");

        // 讓錯誤答案左右移動
        x += sin(frameCount * 0.3) * 10;
      }
    }

    // 儲存目前繪圖狀態
    push();

    // 設定矩形繪製模式
    rectMode(CENTER);

    // 設定選項背景顏色
    fill(optionColor);

    // 移除選項外框
    noStroke();

    // 繪製選項背景矩形
    rect(x, y, option.width, option.height, 12);

    // 還原繪圖狀態
    pop();

    // 設定選項文字顏色
    fill(optionTextColor);

    // 繪製中英文混合選項文字
    drawMixedText(q.options[i], x, y, optionFontSize);
  }

  // 判斷目前是否已作答
  if (hasAnswered) {
    // 計算下一題按鈕寬度
    let buttonWidth = constrain(width * 0.25, 120, 180);

    // 計算下一題按鈕高度
    let buttonHeight = constrain(height * 0.06, 42, 56);

    // 計算下一題按鈕位置
    let buttonY = getOptionPosition(3).y + getOptionPosition(3).height / 2 + buttonHeight / 2 + 24;

    // 設定下一題按鈕尺寸
    nextButton.size(buttonWidth, buttonHeight);

    // 設定下一題按鈕字體大小
    nextButton.style("font-size", buttonHeight * 0.42 + "px");

    // 設定下一題按鈕位置
    nextButton.position(width / 2 - buttonWidth / 2, buttonY);

    // 顯示下一題按鈕
    nextButton.show();
  } else {
    // 尚未作答時隱藏下一題按鈕
    nextButton.hide();
  }
}

// 繪製測驗結果畫面
function drawResult() {
  // 隱藏下一題按鈕
  nextButton.hide();

  // 設定結果標題文字大小
  let titleSize = constrain(min(width * 0.06, height * 0.05), 28, 46);

  // 設定結果分數文字大小
  let scoreSize = constrain(min(width * 0.045, height * 0.038), 20, 34);

  // 設定結果標題文字顏色
  fill("#303030");

  // 繪製結果標題
  drawMixedText("測驗結束！", width / 2, height * 0.36, titleSize);

  // 設定分數文字顏色
  fill("#588157");

  // 繪製分數文字
  drawMixedText(`您一共答對了 ${score} / ${questions.length} 題`, width / 2, height * 0.48, scoreSize);

  // 設定重新測驗按鈕寬度
  let buttonWidth = constrain(width * 0.3, 140, 200);

  // 設定重新測驗按鈕高度
  let buttonHeight = constrain(height * 0.06, 42, 56);

  // 設定重新測驗按鈕位置
  let buttonY = height * 0.58;

  // 設定重新測驗按鈕尺寸
  restartButton.size(buttonWidth, buttonHeight);

  // 設定重新測驗按鈕字體大小
  restartButton.style("font-size", buttonHeight * 0.42 + "px");

  // 設定重新測驗按鈕位置
  restartButton.position(width / 2 - buttonWidth / 2, buttonY);

  // 顯示重新測驗按鈕
  restartButton.show();
}

// 處理滑鼠或觸控點擊事件
function mousePressed() {
  // 如果已經作答或測驗結束則停止處理
  if (hasAnswered || currentQuestionIndex >= questions.length) {
    // 結束滑鼠事件
    return;
  }

  // 逐一檢查四個選項
  for (let i = 0; i < questions[currentQuestionIndex].options.length; i++) {
    // 取得目前選項位置
    let option = getOptionPosition(i);

    // 判斷點擊是否位於目前選項範圍
    if (
      mouseX > option.x - option.width / 2 &&
      mouseX < option.x + option.width / 2 &&
      mouseY > option.y - option.height / 2 &&
      mouseY < option.y + option.height / 2
    ) {
      // 記錄使用者選擇的選項
      selectedOption = i;

      // 標記目前題目已經作答
      hasAnswered = true;

      // 判斷使用者答案是否正確
      if (i === questions[currentQuestionIndex].answer) {
        // 答對時增加分數
        score++;
      }

      // 結束選項檢查迴圈
      break;
    }
  }
}

// 切換到下一題
function nextQuestion() {
  // 增加目前題目索引
  currentQuestionIndex++;

  // 清除選取的選項
  selectedOption = -1;

  // 設定目前題目為尚未作答
  hasAnswered = false;

  // 隱藏下一題按鈕
  nextButton.hide();
}

// 重新開始測驗
function restartQuiz() {
  // 將題目索引重設為第一題
  currentQuestionIndex = 0;

  // 將答對分數歸零
  score = 0;

  // 清除選取的選項
  selectedOption = -1;

  // 設定目前題目為尚未作答
  hasAnswered = false;

  // 隱藏重新測驗按鈕
  restartButton.hide();
}

// 當視窗大小改變時重新調整畫布
function windowResized() {
  // 重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}