// Constants for the grid and effect
const numb = 70; 
const step = 10; 
const distThreshold = 70; 
const distortionAmount = 20; 
let dots = []; 

// 🌟 作品連結設定
const externalLinks = {
    'Work 1': 'https://zyeii06.github.io/20251014_4/',
    'Work 2': 'https://hackmd.io/@lcienz/BJBl5dyngg'
};

// 🌟 iframe 相關變數
let contentFrame; 
const iframeScale = 0.8; // iframe 佔全螢幕寬高的 80%

// 選單動畫相關變數
let menuContainer;         
let menuWidth = 180;       
let menuCurrentX = -menuWidth; 
let menuTargetX = -menuWidth;  
const menuSlideThreshold = 100; 

// 作品樣式配置 (作品三為默認動畫樣式)
const styles = {
    'Work 1': {
        background: 0,    
        dotColor: 255     
    },
    'Work 2': {
        background: [0, 50, 100], 
        dotColor: [255, 200, 0]   
    },
    'Work 3': { 
        background: 255,   
        dotColor: [200, 0, 0] 
    }
};

let currentWork = 'Work 3'; // 初始為作品三，顯示動畫

// The Dot class (保持不變)
class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y); 
    this.origin = this.pos.copy(); 
    this.speed = createVector(0, 0); 
  }
  
  update(m) {
    let mouseToOrigin = this.origin.copy();
    mouseToOrigin.sub(m);
    const d = mouseToOrigin.mag();
    const c = map(d, 0, distThreshold, 0, PI);
    
    mouseToOrigin.normalize();
    mouseToOrigin.mult(distortionAmount * sin(c));
    const target = createVector(this.origin.x + mouseToOrigin.x, this.origin.y + mouseToOrigin.y);

    let strokeWidth;
    if (d < distThreshold) {
      strokeWidth = 1 + 10 * abs(cos(c / 2));
    } else {
      strokeWidth = map(min(d, max(width, height)), 0, max(width, height), 5, 0.1);
    }
    
    let acceleration = this.pos.copy();
    acceleration.sub(target);
    acceleration.mult(-map(m.dist(this.pos), 0, 2 * max(width, height), 0.1, 0.01));
    
    this.speed.add(acceleration);
    this.speed.mult(0.87);
    this.pos.add(this.speed);

    strokeWeight(strokeWidth);
    point(this.pos.x, this.pos.y);
  }
}

// 初始化點陣列，確保置中
function initializeDots() {
    dots = []; 
    const gridDim = numb * step;
    const dx = (width - gridDim) / 2; 
    const dy = (height - gridDim) / 2; 
    
    for (let i = 0; i < numb; i++) {
        dots[i] = [];
        for (let j = 0; j < numb; j++) {
            const x = i * step + dx;
            const y = j * step + dy;
            dots[i][j] = new Dot(x, y);
        }
    }
}

// 🌟 核心切換邏輯：控制 iframe
function changeWork(workName) {
    currentWork = workName;

    if (workName === 'Work 1' || workName === 'Work 2') {
        // 作品一或二：顯示 iframe
        const url = externalLinks[workName];
        contentFrame.src = url;
        contentFrame.style.display = 'block';
    } else if (workName === 'Work 3') {
        // 作品三：隱藏 iframe，顯示動畫
        contentFrame.style.display = 'none';
        contentFrame.src = ''; // 清空 src 釋放資源
    }
}

// 🌟 調整 iframe 尺寸的函式
function resizeIframe() {
    if (!contentFrame) return;

    // 計算 80% 的寬高
    const newWidth = windowWidth * iframeScale;
    const newHeight = windowHeight * iframeScale;

    contentFrame.style.width = newWidth + 'px';
    contentFrame.style.height = newHeight + 'px';
}


// --- p5.js Setup Function ---
function setup() {
  // 設置畫布為全螢幕
  createCanvas(displayWidth, displayHeight); 
  initializeDots();
  
  // 🌟 獲取 iframe 元素並調整尺寸
  contentFrame = document.getElementById('contentFrame');
  if (contentFrame) {
      resizeIframe(); // 初始設置尺寸
  }

  // 創建選單容器 (Menu Container)
  menuContainer = createDiv();
  menuContainer.style('width', menuWidth + 'px');
  menuContainer.style('height', '100%'); 
  menuContainer.style('position', 'absolute');
  menuContainer.style('top', '0');
  menuContainer.style('left', menuCurrentX + 'px'); 
  menuContainer.style('background-color', 'rgba(10, 10, 10, 0.8)'); 
  menuContainer.style('padding-top', '50px');
  menuContainer.style('box-shadow', '2px 0 5px rgba(0,0,0,0.5)');
  menuContainer.style('z-index', '1000'); 
  
  // 創建按鈕並添加到容器中
  const buttonNames = Object.keys(styles);
  
  for (let name of buttonNames) {
    let button = createButton(name);
    
    // 設置按鈕樣式
    button.style('display', 'block'); 
    button.style('width', '80%');
    button.style('margin', '15px auto');
    button.style('padding', '10px');
    button.style('background-color', '#555');
    button.style('color', '#FFF');
    button.style('border', 'none');
    button.style('cursor', 'pointer');
    
    // 設置按鈕點擊事件
    button.mousePressed(() => changeWork(name));
    
    // 將按鈕添加到容器中
    menuContainer.child(button);
  }
  
  // 確保初始狀態下 iframe 是隱藏的
  if (contentFrame) {
      contentFrame.style.display = 'none';
  }
}

// --- p5.js Draw Function ---
function draw() {
  // 🌟 選單滑動邏輯
  if (mouseX < menuSlideThreshold) {
    menuTargetX = 0; 
  } else {
    menuTargetX = -menuWidth; 
  }
  
  menuCurrentX = lerp(menuCurrentX, menuTargetX, 0.1); 
  menuContainer.style('left', menuCurrentX + 'px');

  // --- 繪製點動畫 ---
  
  const currentStyle = styles[currentWork];
  
  // 1. 繪製背景
  fill(currentStyle.background);
  noStroke();
  rect(0, 0, width, height); 
  
  // 2. 設定點的顏色
  stroke(currentStyle.dotColor); 

  // 繪製點的動畫
  const m = createVector(mouseX, mouseY);
  for (let i = 0; i < numb; i++) {
    for (let j = 0; j < numb; j++) {
      dots[i][j].update(m);
    }
  }
}


/**
 * 處理視窗大小改變
 */
function windowResized() {
  resizeCanvas(displayWidth, displayHeight);
  initializeDots();
  menuContainer.style('height', '100%'); 
  
  // 🌟 視窗改變時，重新調整 iframe 尺寸
  resizeIframe();
}v