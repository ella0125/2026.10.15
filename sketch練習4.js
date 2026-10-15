const CJK_FONT = `LXGW WenKai TC`; // 設定中文與中文標點使用的 Google Fonts 字型名稱
const LATIN_FONT = `Edu QLD Hand`; // 設定英文、數字與拉丁字元使用的 Google Fonts 字型名稱
let questionTable; // 儲存 preload() 載入的 CSV 題庫表格
let allQuestions = []; // 儲存從 CSV 轉換完成的 15 題完整題庫
let questions = []; // 儲存每次測驗隨機抽出的 5 題
let dataReady = false; // 記錄題庫資料是否已經準備完成
let currentQuestion = 0; // 記錄目前顯示的題目索引
let score = 0; // 記錄目前測驗答對的題數
let selectedIndex = -1; // 記錄目前選取的選項索引
let answered = false; // 記錄目前題目是否已經作答
let quizFinished = false; // 記錄目前測驗是否已經完成
let feedbackStartFrame = 0; // 記錄答題回饋動畫開始的畫格
let optionRects = []; // 儲存四個選項的原始位置資料
let nextButton; // 儲存 HTML 下一題按鈕物件
let restartButton; // 儲存 HTML 重新測驗按鈕物件
let fontsRequested = false; // 記錄是否已經啟動 Google Fonts 載入流程
let fontsReady = false; // 記錄 Google Fonts 是否已經準備完成
let appliedFontKey = ``; // 儲存最近一次套用的 canvas 字型與大小
const colors = { // 建立測驗介面使用的顏色設定物件
  page: `#f2e8cf`, // 設定整個頁面的背景顏色
  panel: `#fffaf0`, // 設定題目與結果面板的背景顏色
  text: `#283618`, // 設定主要文字顏色
  muted: `#606c38`, // 設定輔助說明文字顏色
  border: `#a3a380`, // 設定進度條底色與邊界相關顏色
  normalOption: `#e9edc9`, // 設定尚未作答選項的背景顏色
  hoverOption: `#ccd5ae`, // 設定滑鼠移入選項時的背景顏色
  correct: `#588157`, // 設定正確答案的指定背景顏色
  wrong: `#bc4749`, // 設定使用者選錯答案的指定背景顏色
  button: `#386641`, // 設定 HTML 按鈕的背景顏色
  buttonHover: `#6a994e`, // 設定 HTML 按鈕移入時的背景顏色
  white: `#ffffff` // 設定深色背景上的反白文字顏色
}; // 結束顏色設定物件
function preload() { // 定義 p5.js 在 setup() 前執行的資源載入函式
  questionTable = loadTable(`questions.csv`, `csv`, `header`); // 使用固定檔名與 header 模式載入 CSV 題庫
} // 結束 preload() 函式
function setup() { // 定義 p5.js 初始化函式
  const canvas = createCanvas(windowWidth, windowHeight); // 建立符合瀏覽器視窗大小的全螢幕畫布
  canvas.elt.setAttribute(`aria-label`, `p5.js 指令練習測驗畫布`); // 為畫布加入方便輔助工具辨識的說明
  textWrap(WORD); // 設定 p5.js 文字繪製的基本換行模式
  rectMode(CORNER); // 設定矩形預設使用左上角座標定位
  ellipseMode(CENTER); // 設定橢圓預設使用中心點定位
  parseQuestionTable(); // 將 CSV 的每一列轉換為程式使用的題目物件
  applyDocumentFontStyles(); // 設定文件、畫布與按鈕的字型 CSS
  waitForGoogleFonts(); // 等待 index.html 載入的兩種 Google Fonts
  createHtmlButtons(); // 建立下一題與重新測驗的 HTML 按鈕
  resetQuiz(); // 啟動第一次測驗並隨機抽出五題
} // 結束 setup() 函式
function parseQuestionTable() { // 定義將 loadTable 結果轉成題目陣列的函式
  allQuestions = []; // 清除可能存在的舊題庫資料
  for (let rowIndex = 0; rowIndex < questionTable.getRowCount(); rowIndex += 1) { // 逐列讀取 CSV 中的每一題
    const row = questionTable.getRow(rowIndex); // 取得目前 CSV 列物件
    const answer = Number(row.getString(`answer`)); // 將 answer 欄位轉為數字索引
    const parsedQuestion = { // 建立符合測驗介面格式的題目物件
      id: row.getString(`id`), // 讀取題目編號欄位
      question: row.getString(`question`), // 讀取題目文字欄位
      options: [row.getString(`optionA`), row.getString(`optionB`), row.getString(`optionC`), row.getString(`optionD`)], // 依固定欄位順序建立四個選項
      answer: answer // 儲存 0 到 3 的正確答案索引
    }; // 結束目前題目物件建立
    if (parsedQuestion.question && parsedQuestion.options.length === 4 && answer >= 0 && answer <= 3) { // 只保留格式正確且具有四個選項的題目
      allQuestions.push(parsedQuestion); // 將合法題目加入完整題庫
    } // 結束題目格式檢查
  } // 結束 CSV 題庫逐列處理
  dataReady = allQuestions.length >= 5; // 確認題庫至少有五題才能開始測驗
} // 結束 CSV 題庫轉換函式
function applyDocumentFontStyles() { // 定義設定 HTML 文件與畫布字型的函式
  document.documentElement.style.setProperty(`--quiz-cjk-font`, `'${CJK_FONT}'`); // 將中文字型名稱寫入 CSS 自訂屬性
  document.documentElement.style.setProperty(`--quiz-latin-font`, `'${LATIN_FONT}'`); // 將英文字型名稱寫入 CSS 自訂屬性
  document.body.style.fontFamily = `'${CJK_FONT}', '${LATIN_FONT}', sans-serif`; // 將網頁 body 預設字型設為混合字型備援
  const canvasElement = document.querySelector(`canvas`); // 取得 p5.js 產生的 canvas DOM 元素
  if (canvasElement) { // 確認 canvas DOM 元素存在後才套用 CSS 字型
    canvasElement.style.fontFamily = `'${CJK_FONT}', '${LATIN_FONT}', sans-serif`; // 設定 canvas DOM 元素的字型備援
  } // 結束 canvas 元素存在判斷
} // 結束文件字型樣式函式
function waitForGoogleFonts() { // 定義等待 Google Fonts 完成載入的函式
  if (fontsRequested) { // 判斷是否已經啟動過字型載入流程
    return; // 已啟動時直接離開以避免重複建立 Promise
  } // 結束重複啟動判斷
  fontsRequested = true; // 標記字型載入流程已經啟動
  if (!document.fonts || !document.fonts.load || !document.fonts.ready) { // 判斷瀏覽器是否支援 Font Loading API
    fontsReady = true; // 不支援時使用 index.html 與 CSS 的備援字型
    appliedFontKey = ``; // 清除字型快取以便繪圖時重新設定字型
    return; // 結束不支援 Font Loading API 的處理
  } // 結束 Font Loading API 支援判斷
  const cjkTask = document.fonts.load(`16px '${CJK_FONT}'`); // 請瀏覽器載入中文 Google Fonts
  const latinTask = document.fonts.load(`16px '${LATIN_FONT}'`); // 請瀏覽器載入英文 Google Fonts
  Promise.all([cjkTask, latinTask]).then(() => document.fonts.ready).then(() => { // 等待兩種字型與文件字型集合都完成
    fontsReady = true; // 標記兩種 Google Fonts 已經準備完成
    appliedFontKey = ``; // 清除快取以確保下一幀重新使用載入後字型
  }).catch(() => { // 處理瀏覽器或網路無法載入字型的情況
    fontsReady = true; // 載入失敗時仍使用 CSS 備援字型繼續執行
    appliedFontKey = ``; // 清除快取以保留後續重新計算字型的機會
  }); // 結束字型 Promise 處理
} // 結束等待 Google Fonts 函式
function createHtmlButtons() { // 定義建立 HTML 操作按鈕的函式
  nextButton = createButton(`下一題`); // 建立下一題 HTML 按鈕
  restartButton = createButton(`重新測驗`); // 建立重新測驗 HTML 按鈕
  setHtmlMixedText(nextButton, `下一題`); // 依字元類型設定下一題按鈕的字型
  setHtmlMixedText(restartButton, `重新測驗`); // 依字元類型設定重新測驗按鈕的字型
  styleHtmlButton(nextButton); // 套用下一題按鈕的共同樣式
  styleHtmlButton(restartButton); // 套用重新測驗按鈕的共同樣式
  nextButton.mousePressed(goToNextQuestion); // 綁定下一題按鈕的點擊事件
  restartButton.mousePressed(resetQuiz); // 綁定重新測驗按鈕的點擊事件
  nextButton.hide(); // 初始化時隱藏下一題按鈕
  restartButton.hide(); // 初始化時隱藏重新測驗按鈕
} // 結束建立 HTML 按鈕函式
function styleHtmlButton(button) { // 定義設定 HTML 按鈕樣式的函式
  button.style(`cursor`, `pointer`); // 將滑鼠游標設為可點擊樣式
  button.style(`background-color`, colors.button); // 設定按鈕背景顏色
  button.style(`color`, colors.white); // 設定按鈕文字顏色
  button.style(`border`, `none`); // 移除瀏覽器預設邊框
  button.style(`border-radius`, `14px`); // 設定按鈕圓角
  button.style(`font-size`, `20px`); // 設定按鈕預設文字大小
  button.style(`font-weight`, `normal`); // 避免瀏覽器粗體覆蓋指定字型外觀
  button.style(`font-family`, `'${CJK_FONT}', '${LATIN_FONT}', sans-serif`); // 設定按鈕的混合字型備援順序
  button.style(`padding`, `0 18px`); // 設定按鈕左右內距
  button.style(`z-index`, `20`); // 讓按鈕顯示在全螢幕畫布上方
  button.elt.setAttribute(`type`, `button`); // 將按鈕指定為一般按鈕避免表單提交
} // 結束 HTML 按鈕樣式函式
function setHtmlMixedText(button, content) { // 定義為 HTML 按鈕逐字指定字型的函式
  while (button.elt.firstChild) { // 持續檢查按鈕內是否存在舊內容
    button.elt.removeChild(button.elt.firstChild); // 清除舊文字節點或元素
  } // 結束清除舊內容迴圈
  for (const character of Array.from(content)) { // 逐一處理按鈕內容中的 Unicode 字元
    const span = document.createElement(`span`); // 建立單一字元的 span 元素
    span.textContent = character; // 將目前字元放入 span 元素
    span.style.fontFamily = `'${getFontFamilyForCharacter(character)}', sans-serif`; // 依字元種類套用中文或英文字型
    button.elt.appendChild(span); // 將字型設定完成的字元加入按鈕
  } // 結束按鈕逐字處理迴圈
} // 結束 HTML 混合字型文字函式
function applyCanvasFont(fontFamily, size) { // 定義設定 canvas 文字字型與大小的函式
  const fontKey = `${fontFamily}|${size}`; // 使用字型與大小組合目前設定的唯一鍵值
  if (appliedFontKey === fontKey) { // 判斷本次設定是否與上一個文字片段相同
    return; // 相同時不重複設定以降低每幀運算量
  } // 結束字型快取判斷
  textFont(fontFamily); // 將 p5.js canvas 文字套用到指定字型
  textSize(size); // 將 p5.js canvas 文字套用到指定大小
  appliedFontKey = fontKey; // 記錄本次已經套用的字型與大小
} // 結束 canvas 字型設定函式
function isChineseCharacter(character) { // 定義判斷字元是否屬於中文或中式標點的函式
  return /[\u2e80-\u2fff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u.test(character); // 回傳中文、中文標點與中日韓字元的判斷結果
} // 結束中文字元判斷函式
function getFontFamilyForCharacter(character) { // 定義依字元選擇字型的函式
  return isChineseCharacter(character) ? CJK_FONT : LATIN_FONT; // 中文使用 LXGW WenKai TC，其餘字元使用 Edu QLD Hand
} // 結束字型選擇函式
function getMixedTextRuns(content) { // 定義將混合文字切成不同字型片段的函式
  const runs = []; // 建立儲存字型片段的陣列
  for (const character of Array.from(String(content))) { // 逐一讀取文字中的 Unicode 字元
    const fontFamily = getFontFamilyForCharacter(character); // 取得目前字元應該使用的字型
    const lastRun = runs[runs.length - 1]; // 取得上一個文字片段以便合併相同字型
    if (lastRun && lastRun.fontFamily === fontFamily) { // 判斷目前字元是否可以加入上一個相同字型片段
      lastRun.text += character; // 將目前字元接到上一個片段末端
    } else { // 處理需要建立新字型片段的情況
      runs.push({fontFamily: fontFamily, text: character}); // 建立新的字型片段並記錄文字內容
    } // 結束相同字型片段判斷
  } // 結束混合文字逐字處理迴圈
  return runs; // 回傳依字型分組的文字片段陣列
} // 結束混合文字分組函式
function measureMixedLine(line, size) { // 定義計算混合字型單行文字寬度的函式
  let lineWidth = 0; // 初始化整行文字寬度
  for (const run of getMixedTextRuns(line)) { // 逐一處理單行內的字型片段
    applyCanvasFont(run.fontFamily, size); // 套用目前片段對應的 Google Fonts 與文字大小
    lineWidth += textWidth(run.text); // 累加目前片段在 canvas 上的實際寬度
  } // 結束字型片段寬度計算迴圈
  return lineWidth; // 回傳整行混合文字寬度
} // 結束混合文字寬度計算函式
function wrapMixedText(content, maxWidth, size) { // 定義依實際字寬進行響應式換行的函式
  const lines = []; // 建立儲存換行結果的陣列
  const paragraphs = String(content).split(`\n`); // 先依照明確換行符號切分段落
  for (const paragraph of paragraphs) { // 逐一處理文字段落
    let currentLine = ``; // 初始化目前正在組合的文字行
    for (const character of Array.from(paragraph)) { // 逐一加入每個 Unicode 字元並測量寬度
      const candidateLine = currentLine + character; // 建立加入新字元後的候選文字行
      if (currentLine.length > 0 && measureMixedLine(candidateLine, size) > maxWidth) { // 判斷加入字元後是否超過可用寬度
        lines.push(currentLine); // 將尚未超出的文字行加入結果
        currentLine = character; // 以目前字元作為下一行的開頭
      } else { // 處理候選文字仍可放入同一行的情況
        currentLine = candidateLine; // 更新目前正在組合的文字行
      } // 結束文字寬度判斷
    } // 結束段落逐字換行迴圈
    lines.push(currentLine || ` `); // 將段落最後一行加入結果並保留空段落高度
  } // 結束所有段落換行迴圈
  return lines.length > 0 ? lines : [` `]; // 回傳換行結果並在空內容時保留一行
} // 結束混合文字換行函式
function drawMixedLine(line, x, y, size) { // 定義繪製單行混合字型文字的函式
  let cursorX = x; // 設定目前文字片段的起始 X 座標
  for (const run of getMixedTextRuns(line)) { // 逐一繪製每個字型片段
    applyCanvasFont(run.fontFamily, size); // 套用目前片段對應的 Google Fonts
    text(run.text, cursorX, y); // 在目前游標位置繪製字型片段
    cursorX += textWidth(run.text); // 將游標移至目前片段結束位置
  } // 結束單行字型片段繪製迴圈
} // 結束單行混合字型繪製函式
function drawMixedText(content, x, y, maxWidth, lineHeight, horizontalAlign, verticalAlign, size) { // 定義支援換行與中英混合字型的繪製函式
  const lines = wrapMixedText(content, maxWidth, size); // 依照混合字型的實際寬度計算換行結果
  const totalHeight = lines.length * lineHeight; // 計算所有文字行需要的總高度
  let startY = y; // 初始化第一行文字的 Y 座標
  if (verticalAlign === CENTER) { // 判斷是否要求整段文字垂直置中
    startY = y - totalHeight / 2; // 將文字第一行向上移動半個總高度
  } else if (verticalAlign === BOTTOM) { // 判斷是否要求整段文字靠下對齊
    startY = y - totalHeight; // 將文字第一行向上移動完整總高度
  } // 結束垂直對齊判斷
  textAlign(LEFT, TOP); // 將片段先設定為左上對齊以利精確串接
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) { // 逐行繪製換行後的文字
    const line = lines[lineIndex]; // 取得目前需要繪製的文字行
    const lineWidth = measureMixedLine(line, size); // 計算目前文字行的實際寬度
    let startX = x; // 初始化目前文字行的起始 X 座標
    if (horizontalAlign === CENTER) { // 判斷是否要求文字水平置中
      startX = x - lineWidth / 2; // 將文字行向左移動半個文字寬度
    } else if (horizontalAlign === RIGHT) { // 判斷是否要求文字靠右對齊
      startX = x - lineWidth; // 將文字行向左移動完整文字寬度
    } // 結束水平對齊判斷
    drawMixedLine(line, startX, startY + lineIndex * lineHeight, size); // 繪製目前文字行的字型片段
  } // 結束多行文字繪製迴圈
} // 結束混合文字繪製函式
function draw() { // 定義 p5.js 每一畫格都會執行的繪圖函式
  background(colors.page); // 清除畫布並繪製頁面背景
  if (!dataReady) { // 判斷題庫是否未成功準備完成
    fill(colors.text); // 設定載入提示文字顏色
    drawMixedText(`題庫載入失敗，請確認 questions.csv 存在且格式正確。`, width / 2, height / 2, width * 0.86, 32, CENTER, CENTER, constrain(width * 0.022, 18, 28)); // 顯示題庫載入錯誤提示
    return; // 題庫未準備完成時停止後續測驗繪製
  } // 結束題庫準備判斷
  drawTopBar(); // 繪製測驗標題與進度區域
  if (quizFinished) { // 判斷測驗是否已經完成
    drawResultScreen(); // 完成時繪製結果頁面
  } else { // 處理測驗尚未完成的情況
    drawQuizScreen(); // 進行中時繪製題目與選項頁面
  } // 結束測驗狀態判斷
} // 結束 draw() 函式
function drawTopBar() { // 定義繪製測驗頂端標題與進度的函式
  noStroke(); // 移除標題區形狀外框
  fill(colors.text); // 設定標題文字顏色
  drawMixedText(`p5.js 指令練習測驗`, width * 0.07, height * 0.075, width * 0.65, constrain(width * 0.03, 25, 38), LEFT, CENTER, constrain(width * 0.026, 22, 36)); // 繪製中英文混合測驗標題
  if (!quizFinished) { // 判斷目前是否還在答題階段
    fill(colors.muted); // 設定進度文字顏色
    drawMixedText(`第 ${currentQuestion + 1} / ${questions.length} 題`, width * 0.93, height * 0.075, width * 0.35, constrain(width * 0.02, 20, 30), RIGHT, CENTER, constrain(width * 0.016, 15, 21)); // 繪製目前題數與五題總數
    drawProgressBar(); // 繪製目前測驗進度條
  } // 結束答題階段判斷
} // 結束頂端區域繪製函式
function drawProgressBar() { // 定義繪製測驗進度條的函式
  const barX = width * 0.07; // 計算進度條左側座標
  const barY = height * 0.115; // 計算進度條上方座標
  const barW = width * 0.86; // 計算進度條寬度
  const barH = max(7, height * 0.012); // 計算進度條高度
  noStroke(); // 移除進度條外框
  fill(colors.border); // 設定進度條底色
  rect(barX, barY, barW, barH, barH / 2); // 繪製進度條底色
  fill(colors.button); // 設定已完成進度顏色
  const progressW = barW * ((currentQuestion + (answered ? 1 : 0)) / questions.length); // 依目前答題狀態計算進度寬度
  rect(barX, barY, progressW, barH, barH / 2); // 繪製已完成的進度部分
} // 結束進度條繪製函式
function drawQuizScreen() { // 定義繪製單題測驗畫面的函式
  restartButton.hide(); // 答題階段隱藏結果頁重新測驗按鈕
  const panelX = width * 0.07; // 計算題目面板左側座標
  const panelY = height * 0.17; // 計算題目面板上方座標
  const panelW = width * 0.86; // 計算題目面板寬度
  const panelH = min(height * 0.25, 230); // 計算題目面板高度
  drawPanel(panelX, panelY, panelW, panelH); // 繪製題目圓角面板
  drawQuestionText(panelX, panelY, panelW, panelH); // 繪製目前題目文字
  drawOptions(); // 繪製四個選項
  drawFeedback(); // 繪製作答回饋提示
  drawNextButton(); // 更新下一題按鈕的位置與顯示狀態
} // 結束單題測驗畫面繪製函式
function drawPanel(x, y, w, h) { // 定義繪製圓角面板的函式
  noStroke(); // 移除面板外框
  fill(colors.panel); // 設定面板背景顏色
  rect(x, y, w, h, 20); // 繪製圓角內容面板
} // 結束面板繪製函式
function drawQuestionText(panelX, panelY, panelW, panelH) { // 定義繪製目前題目文字的函式
  const current = questions[currentQuestion]; // 取得目前隨機測驗中的題目物件
  fill(colors.text); // 設定題目文字顏色
  drawMixedText(current.question, panelX + panelW * 0.06, panelY + panelH * 0.17, panelW * 0.88, constrain(width * 0.035, 28, 44), LEFT, TOP, constrain(width * 0.027, 22, 36)); // 以混合字型與響應式換行繪製題目
} // 結束題目文字繪製函式
function drawOptions() { // 定義繪製四個選項卡片的函式
  optionRects = []; // 清除上一畫格的選項位置資料
  const current = questions[currentQuestion]; // 取得目前題目物件
  for (let index = 0; index < current.options.length; index += 1) { // 逐一處理目前題目的四個選項
    const baseRect = getOptionRect(index); // 計算目前選項的原始位置
    optionRects.push(baseRect); // 儲存原始位置供滑鼠命中判斷使用
    const animatedRect = getAnimatedOptionRect(baseRect, index); // 計算套用動畫後的選項位置
    const optionFill = getOptionFill(index); // 取得目前選項應使用的背景顏色
    const isHovering = isPointInsideRect(mouseX, mouseY, baseRect); // 判斷滑鼠是否位於選項上方
    noStroke(); // 移除選項卡片外框
    if (!answered && isHovering) { // 判斷尚未作答且滑鼠位於選項上方
      fill(colors.hoverOption); // 使用滑鼠移入時的選項顏色
    } else { // 處理其他選項狀態
      fill(optionFill); // 使用依作答結果決定的選項顏色
    } // 結束選項滑鼠狀態判斷
    rect(animatedRect.x, animatedRect.y, animatedRect.w, animatedRect.h, 14); // 繪製目前選項的圓角卡片
    drawOptionLabel(index, animatedRect); // 繪製選項英文字母與中英文混合內容
  } // 結束四個選項繪製迴圈
} // 結束選項繪製函式
function getOptionRect(index) { // 定義計算選項原始位置的函式
  const isNarrow = width < 700; // 判斷目前畫布是否適合使用手機單欄版面
  const sideMargin = width * 0.07; // 設定選項區域的左右邊界
  const gap = isNarrow ? width * 0.035 : width * 0.025; // 依版面模式設定選項間距
  const optionW = isNarrow ? width * 0.86 : (width * 0.86 - gap) / 2; // 計算選項卡片寬度
  const optionH = isNarrow ? min(height * 0.09, 70) : min(height * 0.115, 82); // 計算選項卡片高度
  const optionTop = isNarrow ? height * 0.47 : height * 0.48; // 計算選項區域上方座標
  const column = isNarrow ? 0 : index % 2; // 計算目前選項所在欄位
  const row = isNarrow ? index : floor(index / 2); // 計算目前選項所在列數
  const x = sideMargin + column * (optionW + gap); // 計算目前選項左側座標
  const y = optionTop + row * (optionH + gap); // 計算目前選項上方座標
  return {x: x, y: y, w: optionW, h: optionH}; // 回傳目前選項的原始位置資料
} // 結束選項原始位置計算函式
function getAnimatedOptionRect(baseRect, index) { // 定義計算答題回饋動畫位置的函式
  const current = questions[currentQuestion]; // 取得目前題目物件
  let offsetX = 0; // 初始化左右動畫位移量
  let offsetY = 0; // 初始化上下動畫位移量
  const isWrongAnswer = answered && selectedIndex !== current.answer; // 判斷使用者是否答錯目前題目
  if (isWrongAnswer && index === current.answer) { // 判斷目前選項是否為答錯後的正確答案
    offsetY = sin((frameCount - feedbackStartFrame) * 0.22) * min(14, height * 0.018); // 讓正確選項持續上下跳動
  } // 結束正確答案上下動畫判斷
  if (isWrongAnswer && index === selectedIndex) { // 判斷目前選項是否為使用者選錯的答案
    offsetX = sin((frameCount - feedbackStartFrame) * 0.3) * min(16, width * 0.018); // 讓錯誤選項持續左右移動
  } // 結束錯誤答案左右動畫判斷
  return {x: baseRect.x + offsetX, y: baseRect.y + offsetY, w: baseRect.w, h: baseRect.h}; // 回傳套用動畫位移後的位置資料
} // 結束選項動畫位置函式
function getOptionFill(index) { // 定義取得選項背景顏色的函式
  const current = questions[currentQuestion]; // 取得目前題目物件
  if (!answered) { // 判斷目前題目是否尚未作答
    return colors.normalOption; // 尚未作答時回傳一般選項背景色
  } // 結束尚未作答判斷
  if (index === current.answer) { // 判斷目前選項是否為正確答案
    return colors.correct; // 回傳指定的 #588157 正確背景色
  } // 結束正確答案判斷
  if (index === selectedIndex) { // 判斷目前選項是否為使用者選錯的答案
    return colors.wrong; // 回傳指定的 #bc4749 錯誤背景色
  } // 結束錯誤答案判斷
  return colors.normalOption; // 其他選項維持一般背景色
} // 結束選項背景色函式
function drawOptionLabel(index, rectData) { // 定義繪製選項文字的函式
  const current = questions[currentQuestion]; // 取得目前題目物件
  const label = `${String.fromCharCode(65 + index)}. ${current.options[index]}`; // 組合英文選項代號與選項文字
  const isHighlighted = answered && (index === selectedIndex || index === current.answer); // 判斷目前選項是否需要反白文字
  fill(isHighlighted ? colors.white : colors.text); // 依選項狀態設定文字顏色
  drawMixedText(label, rectData.x + rectData.w * 0.05, rectData.y + rectData.h / 2, rectData.w * 0.9, rectData.h, LEFT, CENTER, constrain(width * 0.019, 16, 25)); // 以混合字型與響應式換行繪製選項文字
} // 結束選項文字繪製函式
function drawFeedback() { // 定義繪製答題回饋訊息的函式
  if (!answered) { // 判斷使用者是否尚未作答
    fill(colors.muted); // 設定操作提示文字顏色
    drawMixedText(`請選擇一個答案`, width / 2, height * 0.815, width * 0.86, 28, CENTER, CENTER, constrain(width * 0.017, 15, 22)); // 繪製尚未作答的操作提示
    return; // 尚未作答時結束回饋繪製
  } // 結束尚未作答判斷
  const isCorrect = selectedIndex === questions[currentQuestion].answer; // 判斷本題答案是否正確
  const message = isCorrect ? `回答正確！` : `回答錯誤，綠色跳動選項才是正確答案。`; // 依答題結果建立回饋文字
  fill(isCorrect ? colors.correct : colors.wrong); // 依答題結果設定回饋文字顏色
  drawMixedText(message, width / 2, height * 0.815, width * 0.86, 28, CENTER, CENTER, constrain(width * 0.018, 16, 24)); // 繪製答題結果回饋訊息
} // 結束答題回饋函式
function drawNextButton() { // 定義更新 HTML 下一題按鈕的函式
  if (!answered) { // 判斷目前題目是否尚未作答
    nextButton.hide(); // 尚未作答時隱藏下一題按鈕
    return; // 尚未作答時結束按鈕更新
  } // 結束尚未作答判斷
  const buttonW = min(width * 0.34, 260); // 計算下一題按鈕寬度
  const buttonH = min(height * 0.075, 58); // 計算下一題按鈕高度
  const buttonX = width / 2 - buttonW / 2; // 計算下一題按鈕左側座標
  const buttonY = height * 0.865; // 計算下一題按鈕上方座標
  nextButton.size(buttonW, buttonH); // 更新下一題按鈕響應式尺寸
  nextButton.position(buttonX, buttonY); // 更新下一題按鈕響應式位置
  nextButton.style(`font-size`, `${constrain(buttonH * 0.4, 14, 20)}px`); // 更新下一題按鈕響應式文字大小
  nextButton.show(); // 顯示已經可以使用的下一題按鈕
} // 結束下一題按鈕更新函式
function drawResultScreen() { // 定義繪製測驗結果頁面的函式
  nextButton.hide(); // 結果頁隱藏下一題按鈕
  const panelW = min(width * 0.76, 760); // 計算結果面板寬度
  const panelH = min(height * 0.55, 430); // 計算結果面板高度
  const panelX = width / 2 - panelW / 2; // 計算結果面板左側座標
  const panelY = height * 0.2; // 計算結果面板上方座標
  drawPanel(panelX, panelY, panelW, panelH); // 繪製結果面板
  fill(colors.text); // 設定結果標題文字顏色
  drawMixedText(`測驗完成！`, width / 2, panelY + panelH * 0.22, panelW * 0.86, 62, CENTER, CENTER, constrain(width * 0.04, 30, 54)); // 繪製測驗完成標題
  fill(colors.muted); // 設定成績文字顏色
  drawMixedText(`你答對了 ${score} / ${questions.length} 題`, width / 2, panelY + panelH * 0.47, panelW * 0.86, 42, CENTER, CENTER, constrain(width * 0.026, 22, 36)); // 繪製答對題數統計
  fill(colors.text); // 設定鼓勵文字顏色
  drawMixedText(getResultMessage(), width / 2, panelY + panelH * 0.63, panelW * 0.86, 32, CENTER, CENTER, constrain(width * 0.018, 16, 24)); // 繪製依分數變化的鼓勵文字
  drawRestartButton(panelY + panelH * 0.76); // 更新結果頁重新測驗按鈕
} // 結束結果頁繪製函式
function getResultMessage() { // 定義依分數取得鼓勵文字的函式
  if (score === questions.length) { // 判斷使用者是否全部答對
    return `太棒了！你已經熟悉這些 p5.js 指令。`; // 回傳滿分鼓勵文字
  } // 結束滿分判斷
  if (score >= 3) { // 判斷使用者是否答對至少三題
    return `表現很好，再練習一下就能更熟悉！`; // 回傳中高分鼓勵文字
  } // 結束中高分判斷
  return `繼續練習，你一定能掌握 p5.js 基礎指令！`; // 回傳持續練習的鼓勵文字
} // 結束鼓勵文字函式
function drawRestartButton(buttonY) { // 定義更新 HTML 重新測驗按鈕的函式
  const buttonW = min(width * 0.38, 290); // 計算重新測驗按鈕寬度
  const buttonH = min(height * 0.08, 62); // 計算重新測驗按鈕高度
  const buttonX = width / 2 - buttonW / 2; // 計算重新測驗按鈕左側座標
  restartButton.size(buttonW, buttonH); // 更新重新測驗按鈕響應式尺寸
  restartButton.position(buttonX, buttonY); // 更新重新測驗按鈕響應式位置
  restartButton.style(`font-size`, `${constrain(buttonH * 0.4, 14, 20)}px`); // 更新重新測驗按鈕響應式文字大小
  restartButton.show(); // 顯示結果頁重新測驗按鈕
} // 結束重新測驗按鈕更新函式
function mousePressed() { // 定義 p5.js 滑鼠按下事件並支援觸控點擊
  if (!dataReady || quizFinished || answered) { // 判斷題庫未準備、測驗完成或本題已作答的情況
    return; // 不可選項時直接結束滑鼠事件
  } // 結束不可選項狀態判斷
  for (let index = 0; index < optionRects.length; index += 1) { // 逐一檢查四個選項的點擊範圍
    if (isPointInsideRect(mouseX, mouseY, optionRects[index])) { // 判斷滑鼠或觸控座標是否落於選項內
      selectAnswer(index); // 記錄使用者的選項並啟動答題回饋
      return; // 成功選取後立即結束滑鼠事件處理
    } // 結束選項命中判斷
  } // 結束選項命中檢查迴圈
} // 結束滑鼠按下事件函式
function selectAnswer(index) { // 定義處理使用者選擇答案的函式
  selectedIndex = index; // 記錄使用者選取的選項索引
  answered = true; // 將目前題目標記為已作答
  feedbackStartFrame = frameCount; // 記錄答題當下的畫格作為動畫起點
  if (selectedIndex === questions[currentQuestion].answer) { // 判斷使用者是否選取正確答案
    score += 1; // 答對時將分數增加一分
  } // 結束答題正確判斷
} // 結束選答案函式
function goToNextQuestion() { // 定義前往下一題或結果頁的函式
  if (!answered) { // 判斷使用者是否尚未完成目前題目
    return; // 尚未作答時不允許前往下一題
  } // 結束尚未作答判斷
  if (currentQuestion === questions.length - 1) { // 判斷目前是否為隨機五題中的最後一題
    quizFinished = true; // 將測驗狀態設定為已完成
    nextButton.hide(); // 進入結果頁時隱藏下一題按鈕
    return; // 結束前往下一題處理
  } // 結束最後一題判斷
  currentQuestion += 1; // 將目前題目索引往後移動一題
  selectedIndex = -1; // 清除上一題選項索引
  answered = false; // 將新題目設定為尚未作答
  feedbackStartFrame = 0; // 重設答題動畫起始畫格
  nextButton.hide(); // 切換題目時先隱藏下一題按鈕
} // 結束前往下一題函式
function resetQuiz() { // 定義開始或重新開始測驗的函式
  if (!dataReady) { // 判斷完整題庫是否尚未成功載入
    return; // 題庫未準備完成時不開始測驗
  } // 結束題庫準備判斷
  const shuffledQuestions = shuffle(allQuestions.slice(), true); // 使用 p5.js shuffle 複製並隨機排列完整 15 題
  questions = shuffledQuestions.slice(0, 5); // 從隨機排列後的題庫取出不重複的前五題
  currentQuestion = 0; // 將目前題目索引重設為第一題
  score = 0; // 將答對題數重設為零
  selectedIndex = -1; // 清除使用者選項索引
  answered = false; // 將作答狀態重設為尚未作答
  quizFinished = false; // 將測驗完成狀態重設為未完成
  feedbackStartFrame = 0; // 將答題動畫起始畫格重設為零
  optionRects = []; // 清除舊測驗的選項位置資料
  if (nextButton) { // 確認下一題按鈕已經建立後再進行隱藏
    nextButton.hide(); // 重新測驗時隱藏下一題按鈕
  } // 結束下一題按鈕存在判斷
  if (restartButton) { // 確認重新測驗按鈕已經建立後再進行隱藏
    restartButton.hide(); // 重新開始時隱藏重新測驗按鈕
  } // 結束重新測驗按鈕存在判斷
} // 結束重新開始測驗函式
function isPointInsideRect(pointX, pointY, rectData) { // 定義判斷點是否落在矩形範圍內的函式
  if (!rectData || rectData.w === undefined) { // 判斷矩形資料是否不存在或尚未完成
    return false; // 沒有有效矩形資料時回傳未命中
  } // 結束矩形資料檢查
  return pointX >= rectData.x && pointX <= rectData.x + rectData.w && pointY >= rectData.y && pointY <= rectData.y + rectData.h; // 回傳點是否位於矩形範圍內
} // 結束矩形命中判斷函式
function windowResized() { // 定義瀏覽器視窗改變或手機旋轉時的處理函式
  resizeCanvas(windowWidth, windowHeight); // 將畫布重新調整為目前視窗大小
  appliedFontKey = ``; // 視窗尺寸改變後清除字型快取以重新計算文字尺寸
} // 結束視窗尺寸改變函式
