const CJK_FONT = `LXGW WenKai TC`; // 設定中文與中文標點使用的字型
const LATIN_FONT = `Edu QLD Hand`; // 設定英文、數字與拉丁字元使用的字型
const googleSheetURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQxn2bs1yaD8ZZsvNeu9yljqK33kgZ0LFKI3LfsEU9Cntkl-AFHdNHHuQZzc9oQquZscBdqbwGlMd-p/pub?gid=1888291053&single=true&output=csv`; // 保留 Google Sheets 公開 CSV 網址常數
const QUIZ_SIZE = 5; // 設定每次測驗抽出的題目數量
const REQUIRED_COLUMNS = [`id`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `answer`]; // 設定 CSV 必須存在的欄位
let questionTable = null; // 儲存遠端 CSV 解析後的 p5.Table
let allQuestions = []; // 儲存完整且有效的遠端題庫
let questions = []; // 儲存本次隨機抽出的題目
let appState = `loading`; // 記錄載入中、測驗中或錯誤狀態
let errorMessage = ``; // 儲存題庫錯誤畫面要顯示的訊息
let currentQuestion = 0; // 記錄目前題目索引
let score = 0; // 記錄本次測驗答對題數
let selectedIndex = -1; // 記錄使用者選取的選項索引
let answered = false; // 記錄目前題目是否已作答
let quizFinished = false; // 記錄測驗是否已經完成
let feedbackStartFrame = 0; // 記錄答題動畫開始的畫格
let optionRects = []; // 儲存選項原始位置供滑鼠命中判斷
let nextButton = null; // 儲存下一題 HTML 按鈕
let restartButton = null; // 儲存重新測驗 HTML 按鈕
let retryButton = null; // 儲存重新載入題庫 HTML 按鈕
let fontsReady = false; // 記錄 Google Fonts 是否完成載入
let fontsRequested = false; // 記錄是否已啟動字型載入流程
let appliedFontKey = ``; // 快取目前 canvas 字型設定
const colors = { // 建立測驗介面顏色設定
  page: `#f2e8cf`, // 設定頁面背景色
  panel: `#fffaf0`, // 設定面板背景色
  text: `#283618`, // 設定主要文字色
  muted: `#606c38`, // 設定輔助文字色
  border: `#a3a380`, // 設定進度條底色
  normal: `#e9edc9`, // 設定一般選項背景色
  hover: `#ccd5ae`, // 設定滑鼠移入選項背景色
  correct: `#588157`, // 設定答錯時正確答案背景色
  wrong: `#bc4749`, // 設定答錯時錯誤答案背景色
  button: `#386641`, // 設定按鈕背景色
  white: `#ffffff`, // 設定深色背景上的文字色
  error: `#9b2226` // 設定錯誤標題文字色
}; // 結束顏色設定
function preload() { // 定義 p5.js 資源預載入函式
  try { // 捕捉 loadTable 可能發生的同步錯誤
    questionTable = loadTable(googleSheetURL, `csv`, `header`, onTableLoaded, onTableError); // 使用 loadTable 與 header 正確解析含逗號引號的 CSV
  } catch (error) { // 處理 loadTable 呼叫階段的例外
    onTableError(error); // 將例外轉成使用者可讀的錯誤狀態
  } // 結束同步錯誤處理
} // 結束 preload 函式
function onTableLoaded(table) { // 定義題庫成功載入 callback
  questionTable = table; // 儲存 callback 傳回的 p5.Table
} // 結束成功載入 callback
function onTableError(error) { // 定義題庫失敗載入 callback
  const detail = error && error.message ? error.message : String(error || `未知錯誤`); // 取得錯誤細節文字
  errorMessage = `遠端題庫載入失敗。請確認 Google Sheets 已公開發布為 CSV。\n錯誤細節：${detail}`; // 建立清楚的錯誤訊息
  appState = `error`; // 切換到錯誤狀態避免操作測驗
} // 結束失敗載入 callback
function setup() { // 定義 p5.js 初始化函式
  const canvas = createCanvas(windowWidth, windowHeight); // 建立全螢幕響應式畫布
  canvas.elt.setAttribute(`aria-label`, `p5.js 題庫測驗畫布`); // 為畫布設定輔助工具說明
  textWrap(WORD); // 設定 p5.js 文字換行模式
  rectMode(CORNER); // 設定矩形使用左上角座標
  applyDocumentFontStyles(); // 設定 HTML 與 canvas 的混合字型樣式
  createHtmlButtons(); // 建立所有 HTML 操作按鈕
  waitForGoogleFonts(); // 等待 index.html 載入的 Google Fonts 完成
  if (appState !== `error` && questionTable) { // 判斷遠端表格是否成功取得
    buildQuestionPool(); // 將 p5.Table 轉換為程式使用的題庫資料
  } else if (appState !== `error`) { // 處理沒有表格且沒有錯誤 callback 的情況
    errorMessage = `遠端題庫載入失敗，沒有取得可使用的 CSV 資料。`; // 設定無資料錯誤訊息
    appState = `error`; // 切換到錯誤狀態
  } // 結束表格狀態判斷
} // 結束 setup 函式
function applyDocumentFontStyles() { // 定義套用文件字型的函式
  document.documentElement.style.fontFamily = `'${CJK_FONT}', '${LATIN_FONT}', sans-serif`; // 設定根元素混合字型
  document.body.style.fontFamily = `'${CJK_FONT}', '${LATIN_FONT}', sans-serif`; // 設定 body 混合字型
  const canvasElement = document.querySelector(`canvas`); // 取得 canvas DOM 元素
  if (canvasElement) { // 確認 canvas 元素存在
    canvasElement.style.fontFamily = `'${CJK_FONT}', '${LATIN_FONT}', sans-serif`; // 設定 canvas DOM 備援字型
  } // 結束 canvas 元素判斷
} // 結束文件字型設定函式
function waitForGoogleFonts() { // 定義等待 Google Fonts 的函式
  if (fontsRequested) { // 判斷是否已經啟動載入流程
    return; // 避免重複建立字型載入工作
  } // 結束重複載入判斷
  fontsRequested = true; // 標記字型載入流程已啟動
  if (!document.fonts || !document.fonts.load || !document.fonts.ready) { // 判斷瀏覽器是否支援 Font Loading API
    fontsReady = true; // 不支援時使用 CSS 備援字型
    return; // 結束不支援瀏覽器處理
  } // 結束 API 支援判斷
  const cjkTask = document.fonts.load(`16px '${CJK_FONT}'`); // 請瀏覽器載入中文 Google Font
  const latinTask = document.fonts.load(`16px '${LATIN_FONT}'`); // 請瀏覽器載入英文 Google Font
  Promise.all([cjkTask, latinTask]).then(() => document.fonts.ready).then(() => { // 等待兩種字型與 fonts.ready 完成
    fontsReady = true; // 標記字型已經準備完成
    appliedFontKey = ``; // 清除字型快取讓 canvas 重新套用
  }).catch(() => { // 處理字型載入失敗情況
    fontsReady = true; // 失敗時仍使用 CSS 備援字型
    appliedFontKey = ``; // 清除字型快取
  }); // 結束字型 Promise 處理
} // 結束等待字型函式
function createHtmlButtons() { // 定義建立 HTML 按鈕的函式
  nextButton = createButton(`下一題`); // 建立下一題按鈕
  restartButton = createButton(`重新測驗`); // 建立重新測驗按鈕
  retryButton = createButton(`重新載入題庫`); // 建立重新載入題庫按鈕
  styleHtmlButton(nextButton); // 設定下一題按鈕樣式
  styleHtmlButton(restartButton); // 設定重新測驗按鈕樣式
  styleHtmlButton(retryButton); // 設定重新載入按鈕樣式
  nextButton.mousePressed(goToNextQuestion); // 綁定下一題按鈕事件
  restartButton.mousePressed(resetQuiz); // 綁定重新測驗按鈕事件
  retryButton.mousePressed(reloadQuestionBank); // 綁定重新載入按鈕事件
  hideAllButtons(); // 初始化時隱藏全部按鈕
} // 結束按鈕建立函式
function styleHtmlButton(button) { // 定義 HTML 按鈕共同樣式函式
  button.style(`cursor`, `pointer`); // 設定可點擊游標
  button.style(`background-color`, colors.button); // 設定按鈕背景色
  button.style(`color`, colors.white); // 設定按鈕文字色
  button.style(`border`, `none`); // 移除按鈕邊框
  button.style(`border-radius`, `14px`); // 設定按鈕圓角
  button.style(`font-size`, `20px`); // 設定按鈕文字大小
  button.style(`font-family`, `'${CJK_FONT}', '${LATIN_FONT}', sans-serif`); // 設定按鈕混合字型
  button.style(`z-index`, `20`); // 讓按鈕位於 canvas 上方
  button.style(`padding`, `0 18px`); // 設定按鈕左右內距
  button.elt.setAttribute(`type`, `button`); // 避免按鈕觸發表單提交
} // 結束按鈕樣式函式
function buildQuestionPool() { // 定義建立完整題庫的函式
  const columns = questionTable.columns || []; // 取得 CSV 標題欄位陣列
  const missing = REQUIRED_COLUMNS.filter((name) => !columns.includes(name)); // 找出缺少的必要欄位
  if (missing.length > 0) { // 判斷是否缺少必要欄位
    errorMessage = `題庫欄位不完整，缺少：${missing.join(`、`)}`; // 建立欄位錯誤訊息
    appState = `error`; // 切換到錯誤狀態
    return; // 停止解析避免程式崩潰
  } // 結束必要欄位檢查
  const parsed = []; // 建立有效題目暫存陣列
  for (let row = 0; row < questionTable.getRowCount(); row += 1) { // 逐列讀取遠端 CSV
    const id = tableValue(row, `id`); // 讀取題目識別碼
    const question = tableValue(row, `question`); // 讀取題目文字
    const options = [tableValue(row, `optionA`), tableValue(row, `optionB`), tableValue(row, `optionC`), tableValue(row, `optionD`)]; // 依欄位讀取四個選項
    const answerText = tableValue(row, `answer`); // 讀取正確答案索引文字
    if (isBlankRecord(id, question, options, answerText)) { // 判斷是否為空白列
      continue; // 忽略空白列
    } // 結束空白列判斷
    const answer = Number(answerText); // 將答案索引轉換成數字
    if (!question || options.some((value) => !value) || !Number.isInteger(answer) || answer < 0 || answer > 3) { // 驗證題目資料格式
      continue; // 忽略不完整或錯誤資料列
    } // 結束資料格式驗證
    parsed.push({ id: id, question: question, options: options, answer: answer }); // 儲存有效題目物件
  } // 結束逐列解析
  allQuestions = parsed; // 將有效題目設為完整題庫
  if (allQuestions.length < QUIZ_SIZE) { // 判斷題庫是否少於五題
    errorMessage = `目前有效題庫只有 ${allQuestions.length} 題，至少需要 ${QUIZ_SIZE} 題才能開始測驗。`; // 建立題數不足訊息
    appState = `error`; // 切換到錯誤畫面
    return; // 題數不足時停止後續流程
  } // 結束題數檢查
  beginQuiz(); // 題庫有效時開始第一次測驗
} // 結束建立題庫函式
function tableValue(row, column) { // 定義依欄位名稱安全讀取資料的函式
  try { // 捕捉單一欄位讀取例外
    return String(questionTable.getString(row, column) ?? ``).trim(); // 讀取欄位並移除前後空白
  } catch (error) { // 處理欄位讀取失敗
    return ``; // 讀取失敗時回傳空字串
  } // 結束安全讀取處理
} // 結束資料讀取函式
function isBlankRecord(id, question, options, answerText) { // 定義判斷整列是否空白的函式
  return [id, question, ...options, answerText].every((value) => String(value).trim() === ``); // 所有欄位空白時回傳 true
} // 結束空白列判斷函式
function beginQuiz() { // 定義開始或重新開始測驗的函式
  if (allQuestions.length < QUIZ_SIZE) { // 再次保護題庫數量
    errorMessage = `有效題庫不足 ${QUIZ_SIZE} 題，無法開始測驗。`; // 設定題數不足訊息
    appState = `error`; // 切換到錯誤狀態
    return; // 停止抽題避免錯誤
  } // 結束數量保護
  questions = shuffle([...allQuestions]).slice(0, QUIZ_SIZE); // 洗牌後抽出不重複的五題
  currentQuestion = 0; // 重設目前題目索引
  score = 0; // 重設答對題數
  selectedIndex = -1; // 清除選項選取狀態
  answered = false; // 重設作答狀態
  quizFinished = false; // 重設測驗完成狀態
  feedbackStartFrame = 0; // 重設動畫開始畫格
  appState = `quiz`; // 切換到測驗狀態
  hideAllButtons(); // 隱藏不該出現的按鈕
} // 結束開始測驗函式
function reloadQuestionBank() { // 定義重新載入題庫事件
  window.location.reload(); // 重新載入網頁以取得 Google Sheets 最新資料
} // 結束重新載入函式
function hideAllButtons() { // 定義隱藏所有 HTML 按鈕的函式
  if (nextButton) { nextButton.hide(); } // 隱藏下一題按鈕
  if (restartButton) { restartButton.hide(); } // 隱藏重新測驗按鈕
  if (retryButton) { retryButton.hide(); } // 隱藏重新載入題庫按鈕
} // 結束隱藏按鈕函式
function draw() { // 定義 p5.js 每畫格執行的繪圖函式
  background(colors.page); // 清除畫布並繪製頁面背景
  if (appState === `error`) { // 優先判斷是否發生題庫錯誤
    drawErrorScreen(); // 顯示遠端題庫錯誤畫面
    return; // 錯誤狀態停止後續繪圖
  } // 結束錯誤狀態判斷
  if (!fontsReady || appState === `loading`) { // 判斷字型或題庫是否仍在載入
    drawLoadingScreen(); // 顯示載入中畫面
    return; // 載入期間禁止操作測驗
  } // 結束載入狀態判斷
  if (quizFinished) { // 判斷測驗是否已完成
    drawResultScreen(); // 繪製測驗結果畫面
  } else { // 處理測驗進行中的狀態
    drawTopBar(); // 繪製標題與進度列
    drawQuizScreen(); // 繪製目前題目與選項
  } // 結束測驗完成判斷
} // 結束 draw 函式
function drawLoadingScreen() { // 定義載入畫面繪製函式
  hideAllButtons(); // 載入期間隱藏操作按鈕
  fill(colors.text); // 設定載入標題顏色
  drawMixedText(`正在載入遠端題庫…`, width / 2, height * 0.43, width * 0.8, 42, CENTER, CENTER, constrain(width * 0.035, 24, 36)); // 顯示載入中訊息
  fill(colors.muted); // 設定輔助文字顏色
  drawMixedText(`請稍候，題目載入完成後即可開始測驗。`, width / 2, height * 0.53, width * 0.82, 30, CENTER, CENTER, constrain(width * 0.019, 16, 22)); // 顯示等待說明
} // 結束載入畫面函式
function drawErrorScreen() { // 定義錯誤畫面繪製函式
  hideAllButtons(); // 錯誤狀態隱藏其他操作按鈕
  fill(colors.error); // 設定錯誤標題顏色
  drawMixedText(`遠端題庫載入錯誤`, width / 2, height * 0.27, width * 0.82, 48, CENTER, CENTER, constrain(width * 0.04, 28, 44)); // 顯示錯誤標題
  fill(colors.text); // 設定錯誤細節顏色
  drawMixedText(errorMessage || `無法讀取 Google Sheets 題庫。`, width / 2, height * 0.46, width * 0.78, 30, CENTER, CENTER, constrain(width * 0.019, 16, 23)); // 顯示錯誤細節
  const buttonW = min(width * 0.5, 310); // 計算重新載入按鈕寬度
  const buttonH = min(height * 0.08, 60); // 計算重新載入按鈕高度
  retryButton.size(buttonW, buttonH); // 設定重新載入按鈕尺寸
  retryButton.position(width / 2 - buttonW / 2, height * 0.66); // 設定重新載入按鈕位置
  retryButton.style(`font-size`, `${constrain(buttonH * 0.38, 14, 21)}px`); // 設定重新載入按鈕字型大小
  retryButton.show(); // 顯示重新載入題庫按鈕
} // 結束錯誤畫面函式
function drawTopBar() { // 定義上方標題與進度列繪製函式
  fill(colors.text); // 設定標題文字顏色
  drawMixedText(`p5.js 指令練習測驗`, width * 0.07, height * 0.075, width * 0.58, 36, LEFT, CENTER, constrain(width * 0.026, 22, 36)); // 繪製測驗標題
  fill(colors.muted); // 設定進度文字顏色
  drawMixedText(`第 ${currentQuestion + 1} / ${questions.length} 題`, width * 0.93, height * 0.075, width * 0.34, 30, RIGHT, CENTER, constrain(width * 0.016, 15, 21)); // 繪製題數進度
  drawProgressBar(); // 繪製進度條
} // 結束上方列函式
function drawProgressBar() { // 定義進度條繪製函式
  const x = width * 0.07; // 計算進度條左側位置
  const y = height * 0.115; // 計算進度條上方位置
  const w = width * 0.86; // 計算進度條寬度
  const h = max(7, height * 0.012); // 計算進度條高度
  noStroke(); // 移除進度條外框
  fill(colors.border); // 設定進度條底色
  rect(x, y, w, h, h / 2); // 繪製進度條底色
  fill(colors.button); // 設定已完成進度顏色
  rect(x, y, w * ((currentQuestion + (answered ? 1 : 0)) / questions.length), h, h / 2); // 繪製已完成進度
} // 結束進度條函式
function drawQuizScreen() { // 定義單題測驗畫面繪製函式
  const panelX = width * 0.07; // 計算題目面板左側位置
  const panelY = height * 0.17; // 計算題目面板上方位置
  const panelW = width * 0.86; // 計算題目面板寬度
  const panelH = min(height * 0.25, 230); // 計算題目面板高度
  drawPanel(panelX, panelY, panelW, panelH); // 繪製題目面板
  fill(colors.text); // 設定題目文字顏色
  drawMixedText(questions[currentQuestion].question, panelX + panelW * 0.06, panelY + panelH * 0.18, panelW * 0.88, constrain(width * 0.035, 28, 44), LEFT, TOP, constrain(width * 0.027, 22, 36)); // 繪製題目內容
  drawOptions(); // 繪製四個選項
  drawFeedback(); // 繪製作答回饋
  drawNextButton(); // 更新下一題按鈕
} // 結束單題畫面函式
function drawPanel(x, y, w, h) { // 定義面板繪製函式
  noStroke(); // 移除面板外框
  fill(colors.panel); // 設定面板背景色
  rect(x, y, w, h, 20); // 繪製圓角面板
} // 結束面板函式
function drawOptions() { // 定義選項繪製函式
  optionRects = []; // 清空上一畫格的命中位置
  for (let index = 0; index < questions[currentQuestion].options.length; index += 1) { // 逐一處理四個選項
    const base = getOptionRect(index); // 取得選項原始位置
    optionRects.push(base); // 儲存原始位置供點擊判斷
    const rectData = getAnimatedRect(base, index); // 取得動畫後選項位置
    const hovering = isInside(mouseX, mouseY, base); // 判斷滑鼠是否位於選項上
    noStroke(); // 移除選項外框
    fill(!answered && hovering ? colors.hover : getOptionFill(index)); // 設定選項背景色
    rect(rectData.x, rectData.y, rectData.w, rectData.h, 14); // 繪製圓角選項
    drawOptionLabel(index, rectData); // 繪製選項文字
  } // 結束選項迴圈
} // 結束選項繪製函式
function getOptionRect(index) { // 定義計算選項位置的函式
  const narrow = width < 700; // 判斷是否採用手機單欄版面
  const margin = width * 0.07; // 設定選項區域左右邊界
  const gap = narrow ? min(height * 0.012, 9) : width * 0.025; // 設定選項之間的間距
  const w = narrow ? width * 0.86 : (width * 0.86 - gap) / 2; // 計算選項寬度
  const h = narrow ? min(height * 0.075, 56) : min(height * 0.115, 82); // 計算選項高度
  const top = narrow ? height * 0.43 : height * 0.48; // 計算選項區域上方位置
  const column = narrow ? 0 : index % 2; // 計算目前選項欄位
  const row = narrow ? index : floor(index / 2); // 計算目前選項列數
  return { x: margin + column * (w + gap), y: top + row * (h + gap), w: w, h: h }; // 回傳選項矩形
} // 結束選項位置函式
function getAnimatedRect(base, index) { // 定義計算答錯動畫位置的函式
  let dx = 0; // 初始化水平位移
  let dy = 0; // 初始化垂直位移
  const answer = questions[currentQuestion].answer; // 取得正確答案索引
  if (answered && selectedIndex !== answer && index === answer) { // 判斷目前是否為答錯後的正確答案
    dy = sin((frameCount - feedbackStartFrame) * 0.22) * min(14, height * 0.018); // 讓正確答案上下跳動
  } // 結束正確答案動畫判斷
  if (answered && selectedIndex !== answer && index === selectedIndex) { // 判斷目前是否為答錯後的錯誤答案
    dx = sin((frameCount - feedbackStartFrame) * 0.3) * min(16, width * 0.018); // 讓錯誤答案左右移動
  } // 結束錯誤答案動畫判斷
  return { x: base.x + dx, y: base.y + dy, w: base.w, h: base.h }; // 回傳含動畫位移的矩形
} // 結束動畫位置函式
function getOptionFill(index) { // 定義取得選項背景色的函式
  if (!answered) { return colors.normal; } // 尚未作答時回傳一般背景色
  if (index === questions[currentQuestion].answer) { return colors.correct; } // 正確答案回傳綠色背景
  if (index === selectedIndex) { return colors.wrong; } // 選錯答案回傳紅色背景
  return colors.normal; // 其他選項維持一般背景色
} // 結束選項背景色函式
function drawOptionLabel(index, rectData) { // 定義繪製選項標籤的函式
  const label = `${String.fromCharCode(65 + index)}. ${questions[currentQuestion].options[index]}`; // 組合選項英文字母與內容
  const highlighted = answered && (index === selectedIndex || index === questions[currentQuestion].answer); // 判斷是否使用反白文字
  fill(highlighted ? colors.white : colors.text); // 設定選項文字顏色
  drawMixedText(label, rectData.x + rectData.w * 0.05, rectData.y + rectData.h / 2, rectData.w * 0.9, rectData.h, LEFT, CENTER, constrain(width * 0.019, 16, 25)); // 繪製混合字型選項文字
} // 結束選項標籤函式
function drawFeedback() { // 定義作答回饋繪製函式
  if (!answered) { // 判斷是否尚未作答
    fill(colors.muted); // 設定提示文字顏色
    drawMixedText(`請選擇一個答案`, width / 2, height * 0.79, width * 0.86, 28, CENTER, CENTER, constrain(width * 0.017, 15, 22)); // 顯示作答提示
    return; // 尚未作答時結束繪製
  } // 結束尚未作答判斷
  const correct = selectedIndex === questions[currentQuestion].answer; // 判斷本題是否答對
  fill(correct ? colors.correct : colors.wrong); // 依結果設定回饋文字顏色
  drawMixedText(correct ? `回答正確！` : `回答錯誤，綠色跳動選項才是正確答案。`, width / 2, height * 0.79, width * 0.86, 28, CENTER, CENTER, constrain(width * 0.018, 16, 24)); // 顯示作答結果
} // 結束作答回饋函式
function drawNextButton() { // 定義更新下一題按鈕的函式
  if (!answered) { nextButton.hide(); return; } // 尚未作答時隱藏下一題按鈕
  const w = min(width * 0.34, 260); // 計算下一題按鈕寬度
  const h = min(height * 0.075, 58); // 計算下一題按鈕高度
  nextButton.size(w, h); // 設定下一題按鈕尺寸
  nextButton.position(width / 2 - w / 2, height * 0.865); // 設定下一題按鈕位置
  nextButton.style(`font-size`, `${constrain(h * 0.4, 14, 20)}px`); // 設定下一題按鈕字型大小
  nextButton.show(); // 顯示下一題按鈕
} // 結束下一題按鈕函式
function drawResultScreen() { // 定義結果畫面繪製函式
  nextButton.hide(); // 結果頁隱藏下一題按鈕
  const w = min(width * 0.76, 760); // 計算結果面板寬度
  const h = min(height * 0.55, 430); // 計算結果面板高度
  const x = width / 2 - w / 2; // 計算結果面板左側位置
  const y = height * 0.2; // 計算結果面板上方位置
  drawPanel(x, y, w, h); // 繪製結果面板
  fill(colors.text); // 設定結果標題顏色
  drawMixedText(`測驗完成！`, width / 2, y + h * 0.22, w * 0.86, 62, CENTER, CENTER, constrain(width * 0.04, 30, 54)); // 繪製結果標題
  fill(colors.muted); // 設定成績文字顏色
  drawMixedText(`你答對了 ${score} / ${questions.length} 題`, width / 2, y + h * 0.47, w * 0.86, 42, CENTER, CENTER, constrain(width * 0.026, 22, 36)); // 顯示答對題數
  fill(colors.text); // 設定鼓勵文字顏色
  drawMixedText(resultMessage(), width / 2, y + h * 0.63, w * 0.86, 32, CENTER, CENTER, constrain(width * 0.018, 16, 24)); // 顯示鼓勵文字
  const buttonW = min(width * 0.38, 290); // 計算重新測驗按鈕寬度
  const buttonH = min(height * 0.08, 62); // 計算重新測驗按鈕高度
  restartButton.size(buttonW, buttonH); // 設定重新測驗按鈕尺寸
  restartButton.position(width / 2 - buttonW / 2, y + h * 0.76); // 設定重新測驗按鈕位置
  restartButton.style(`font-size`, `${constrain(buttonH * 0.4, 14, 20)}px`); // 設定重新測驗按鈕字型大小
  restartButton.show(); // 顯示重新測驗按鈕
} // 結束結果畫面函式
function resultMessage() { // 定義依分數取得鼓勵文字的函式
  if (score === questions.length) { return `太棒了！你已經熟悉這些 p5.js 指令。`; } // 回傳滿分鼓勵文字
  if (score >= 3) { return `表現很好，再練習一下就能更熟悉！`; } // 回傳中高分鼓勵文字
  return `繼續練習，你一定能掌握 p5.js 基礎指令！`; // 回傳持續練習鼓勵文字
} // 結束鼓勵文字函式
function mousePressed() { // 定義滑鼠與觸控點擊事件
  if (appState !== `quiz` || quizFinished || answered || !fontsReady) { return; } // 載入、錯誤、結果或已作答時不處理點擊
  for (let index = 0; index < optionRects.length; index += 1) { // 逐一檢查所有選項
    if (isInside(mouseX, mouseY, optionRects[index])) { selectAnswer(index); return; } // 命中選項時記錄答案並結束事件
  } // 結束選項命中檢查
} // 結束滑鼠事件函式
function selectAnswer(index) { // 定義選擇答案的函式
  selectedIndex = index; // 記錄使用者選項索引
  answered = true; // 將目前題目標記為已作答
  feedbackStartFrame = frameCount; // 記錄動畫起始畫格
  if (selectedIndex === questions[currentQuestion].answer) { score += 1; } // 答對時增加分數
} // 結束選擇答案函式
function goToNextQuestion() { // 定義下一題按鈕事件函式
  if (!answered) { return; } // 尚未作答時不允許進入下一題
  if (currentQuestion === questions.length - 1) { quizFinished = true; nextButton.hide(); return; } // 最後一題後切換結果頁
  currentQuestion += 1; // 將題目索引增加一題
  selectedIndex = -1; // 清除上一題選項索引
  answered = false; // 將新題目設為尚未作答
  feedbackStartFrame = 0; // 重設動畫起始畫格
  nextButton.hide(); // 切換題目時隱藏下一題按鈕
} // 結束下一題函式
function resetQuiz() { // 定義重新測驗事件函式
  beginQuiz(); // 重新洗牌並抽出五題
} // 結束重新測驗函式
function isInside(px, py, rectData) { // 定義判斷座標是否在矩形內的函式
  return !!rectData && px >= rectData.x && px <= rectData.x + rectData.w && py >= rectData.y && py <= rectData.y + rectData.h; // 回傳命中結果
} // 結束矩形命中函式
function applyCanvasFont(fontFamily, size) { // 定義套用 canvas 字型的函式
  const key = `${fontFamily}|${size}`; // 建立字型設定快取鍵
  if (appliedFontKey === key) { return; } // 相同字型設定時避免重複套用
  textFont(fontFamily); // 設定 canvas 文字字型
  textSize(size); // 設定 canvas 文字大小
  appliedFontKey = key; // 儲存目前字型設定鍵
} // 結束 canvas 字型函式
function isChineseCharacter(character) { // 定義判斷中文與中文標點的函式
  return /[\u2E80-\u2FFF\u3000-\u303F\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u.test(character); // 使用 Unicode 範圍判斷中文字元
} // 結束中文判斷函式
function fontFor(character) { // 定義依字元取得字型的函式
  return isChineseCharacter(character) ? CJK_FONT : LATIN_FONT; // 中文用 LXGW 其他字元用 Edu QLD
} // 結束字型選擇函式
function textRuns(content) { // 定義切分中英混合文字的函式
  const runs = []; // 建立字型片段陣列
  for (const character of Array.from(String(content))) { // 逐一處理 Unicode 字元
    const family = fontFor(character); // 取得目前字元字型
    const last = runs[runs.length - 1]; // 取得前一個字型片段
    if (last && last.family === family) { last.text += character; } // 相同字型時合併文字片段
    else { runs.push({ family: family, text: character }); } // 不同字型時建立新片段
  } // 結束逐字分段
  return runs; // 回傳字型片段陣列
} // 結束文字分段函式
function mixedWidth(line, size) { // 定義測量混合字型寬度的函式
  let total = 0; // 初始化總寬度
  for (const run of textRuns(line)) { // 逐一測量每個字型片段
    applyCanvasFont(run.family, size); // 套用片段字型與大小
    total += textWidth(run.text); // 累加片段寬度
  } // 結束片段測量
  return total; // 回傳整行寬度
} // 結束寬度測量函式
function wrapMixed(content, maxWidth, size) { // 定義混合字型自動換行函式
  const lines = []; // 建立換行結果陣列
  for (const paragraph of String(content).split(`\n`)) { // 逐段處理明確換行文字
    let line = ``; // 建立目前文字行
    for (const character of Array.from(paragraph)) { // 逐字加入目前文字行
      const candidate = line + character; // 建立候選文字行
      if (line && mixedWidth(candidate, size) > maxWidth) { lines.push(line); line = character; } // 超過寬度時換行
      else { line = candidate; } // 未超過寬度時繼續累積
    } // 結束段落逐字處理
    lines.push(line); // 儲存段落最後一行
  } // 結束所有段落處理
  return lines.length ? lines : [` `]; // 回傳換行結果並保留空行高度
} // 結束自動換行函式
function drawMixedLine(line, x, y, size) { // 定義繪製單行混合字型文字的函式
  let cursor = x; // 設定文字游標位置
  for (const run of textRuns(line)) { // 逐一繪製字型片段
    applyCanvasFont(run.family, size); // 套用片段字型與大小
    text(run.text, cursor, y); // 繪製目前片段
    cursor += textWidth(run.text); // 移動文字游標
  } // 結束片段繪製
} // 結束單行繪製函式
function drawMixedText(content, x, y, maxWidth, lineHeight, horizontal, vertical, size) { // 定義支援換行與混合字型的文字函式
  const lines = wrapMixed(content, maxWidth, size); // 取得自動換行結果
  const totalHeight = lines.length * lineHeight; // 計算文字總高度
  let startY = y; // 初始化第一行垂直位置
  if (vertical === CENTER) { startY = y - totalHeight / 2; } // 垂直置中時調整起始位置
  if (vertical === BOTTOM) { startY = y - totalHeight; } // 靠下對齊時調整起始位置
  textAlign(LEFT, TOP); // 設定片段使用左上對齊
  for (let index = 0; index < lines.length; index += 1) { // 逐行繪製文字
    const line = lines[index]; // 取得目前文字行
    const lineWidth = mixedWidth(line, size); // 計算目前文字行寬度
    let startX = x; // 初始化目前文字行水平位置
    if (horizontal === CENTER) { startX = x - lineWidth / 2; } // 水平置中時調整起始位置
    if (horizontal === RIGHT) { startX = x - lineWidth; } // 靠右對齊時調整起始位置
    drawMixedLine(line, startX, startY + index * lineHeight, size); // 繪製目前文字行
  } // 結束逐行繪製
} // 結束混合文字函式
function windowResized() { // 定義視窗大小改變事件
  resizeCanvas(windowWidth, windowHeight); // 重新調整全螢幕畫布
  appliedFontKey = ``; // 清除字型快取以重新測量文字
} // 結束視窗大小事件
