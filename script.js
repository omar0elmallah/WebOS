// المتغيرات العامة
let windows = [];
let zIndexCounter = 1000;
let activeWindow = null;

// تهيئة النظام
document.addEventListener('DOMContentLoaded', function() {
    // تحديث الوقت والتاريخ
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // إعداد أحداث المستخدم
    setupEventListeners();
});

// تحديث الوقت والتاريخ
function updateDateTime() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('date').textContent = now.toLocaleDateString();
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
    // تسجيل الدخول
    document.getElementById('loginBtn').addEventListener('click', function() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('desktop').style.display = 'block';
    });
    
    // قائمة ابدأ
    document.getElementById('startMenuBtn').addEventListener('click', function() {
        const startMenu = document.getElementById('startMenu');
        startMenu.style.display = startMenu.style.display === 'grid' ? 'none' : 'grid';
    });
    
    // إغلاق قائمة ابدأ عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#startMenu') && !e.target.closest('#startMenuBtn')) {
            document.getElementById('startMenu').style.display = 'none';
        }
    });
    
    // فتح التطبيقات من قائمة ابدأ
    document.querySelectorAll('.app-item').forEach(item => {
        item.addEventListener('click', function() {
            const appName = this.getAttribute('data-app');
            openApp(appName);
            document.getElementById('startMenu').style.display = 'none';
        });
    });
    
    // فتح التطبيقات من أيقونات سطح المكتب
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('dblclick', function() {
            const appName = this.getAttribute('data-app');
            openApp(appName);
        });
    });
    
    // إيقاف التشغيل وإعادة التشغيل
    document.getElementById('shutdownBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to shutdown?')) {
            document.getElementById('desktop').style.display = 'none';
            document.getElementById('loginScreen').style.display = 'flex';
        }
    });
    
    document.getElementById('restartBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to restart?')) {
            location.reload();
        }
    });
}

// فتح تطبيق جديد
function openApp(appName) {
    const windowId = 'window_' + Date.now();
    const windowTemplate = document.getElementById('windowTemplate').content.cloneNode(true);
    const windowElement = windowTemplate.querySelector('.window');
    
    windowElement.id = windowId;
    windowElement.style.zIndex = zIndexCounter++;
    windowElement.style.left = '100px';
    windowElement.style.top = '100px';
    
    // إعداد محتوى التطبيق
    const windowContent = windowElement.querySelector('.window-content');
    const windowTitle = windowElement.querySelector('.window-title');
    
    switch(appName) {
        case 'fileExplorer':
            windowTitle.textContent = 'File Explorer';
            windowContent.innerHTML = `
                <div class="file-explorer">
                    <div class="sidebar">
                        <h3>Quick Access</h3>
                        <ul>
                            <li>Desktop</li>
                            <li>Documents</li>
                            <li>Downloads</li>
                            <li>Pictures</li>
                        </ul>
                    </div>
                    <div class="content-area">
                        <h3>This PC</h3>
                        <div class="files-grid">
                            <div class="file-item">Local Disk (C:)</div>
                            <div class="file-item">Local Disk (D:)</div>
                            <div class="file-item">DVD Drive (E:)</div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'notepad':
            windowTitle.textContent = 'Notepad';
            windowContent.innerHTML = `
                <textarea class="notepad-content" placeholder="Start typing..."></textarea>
            `;
            break;
            
        case 'calculator':
            windowTitle.textContent = 'Calculator';
            windowContent.innerHTML = `
                <div class="calculator">
                    <div class="calculator-display" id="calcDisplay">0</div>
                    <button onclick="clearCalculator()">C</button>
                    <button onclick="appendToCalculator('±')">±</button>
                    <button onclick="appendToCalculator('%')">%</button>
                    <button onclick="appendToCalculator('/')">/</button>
                    <button onclick="appendToCalculator('7')">7</button>
                    <button onclick="appendToCalculator('8')">8</button>
                    <button onclick="appendToCalculator('9')">9</button>
                    <button onclick="appendToCalculator('*')">×</button>
                    <button onclick="appendToCalculator('4')">4</button>
                    <button onclick="appendToCalculator('5')">5</button>
                    <button onclick="appendToCalculator('6')">6</button>
                    <button onclick="appendToCalculator('-')">-</button>
                    <button onclick="appendToCalculator('1')">1</button>
                    <button onclick="appendToCalculator('2')">2</button>
                    <button onclick="appendToCalculator('3')">3</button>
                    <button onclick="appendToCalculator('+')">+</button>
                    <button onclick="appendToCalculator('0')" style="grid-column: span 2;">0</button>
                    <button onclick="appendToCalculator('.')">.</button>
                    <button onclick="calculateResult()">=</button>
                </div>
            `;
            break;
            
        case 'browser':
            windowTitle.textContent = 'Web Browser';
            windowContent.innerHTML = `
                <div class="browser-toolbar">
                    <input type="text" placeholder="Enter URL" style="width: 80%; padding: 5px;">
                    <button>Go</button>
                </div>
                <iframe class="browser-content" src="about:blank"></iframe>
            `;
            break;
    }
    
    // إضافة النافذة إلى الحاوية
    document.getElementById('windowsContainer').appendChild(windowElement);
    
    // إضافة إلى قائمة النوافذ النشطة
    windows.push({
        id: windowId,
        element: windowElement,
        app: appName
    });
    
    // جعل النافذة نشطة
    makeWindowActive(windowId);
    
    // إضافة إلى شريط المهام
    addToTaskbar(windowId, appName);
    
    // إعداد التحكم بالنافذة
    setupWindowControls(windowElement, windowId);
}

// إعداد عناصر التحكم بالنافذة
function setupWindowControls(windowElement, windowId) {
    const header = windowElement.querySelector('.window-header');
    const minimizeBtn = windowElement.querySelector('.minimize-btn');
    const maximizeBtn = windowElement.querySelector('.maximize-btn');
    const closeBtn = windowElement.querySelector('.close-btn');
    
    // جعل النافذة نشطة عند النقر عليها
    windowElement.addEventListener('mousedown', function() {
        makeWindowActive(windowId);
    });
    
    // تصغير النافذة
    minimizeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        windowElement.style.display = 'none';
        // هنا يمكن إضافة منطق لإظهار النافذة في شريط المهام فقط
    });
    
    // تكبير/تصغير النافذة
    maximizeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (windowElement.classList.contains('maximized')) {
            windowElement.classList.remove('maximized');
            windowElement.style.width = '';
            windowElement.style.height = '';
            windowElement.style.top = '';
            windowElement.style.left = '';
        } else {
            windowElement.classList.add('maximized');
            windowElement.style.width = '100%';
            windowElement.style.height = 'calc(100% - 40px)';
            windowElement.style.top = '0';
            windowElement.style.left = '0';
        }
    });
    
    // إغلاق النافذة
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeWindow(windowId);
    });
    
    // سحب النافذة
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    
    header.addEventListener('mousedown', function(e) {
        if (windowElement.classList.contains('maximized')) return;
        
        isDragging = true;
        dragOffset.x = e.clientX - windowElement.offsetLeft;
        dragOffset.y = e.clientY - windowElement.offsetTop;
        
        makeWindowActive(windowId);
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            windowElement.style.left = (e.clientX - dragOffset.x) + 'px';
            windowElement.style.top = (e.clientY - dragOffset.y) + 'px';
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
}

// جعل النافذة نشطة
function makeWindowActive(windowId) {
    const window = windows.find(w => w.id === windowId);
    if (window) {
        // إعادة تعيين z-index لجميع النوافذ
        windows.forEach(w => {
            w.element.style.zIndex = 1000;
        });
        
        // جعل النافذة المحددة في المقدمة
        window.element.style.zIndex = zIndexCounter++;
        activeWindow = window;
    }
}

// إضافة إلى شريط المهام
function addToTaskbar(windowId, appName) {
    const taskbarApps = document.getElementById('taskbarApps');
    const taskbarApp = document.createElement('div');
    taskbarApp.className = 'taskbar-app';
    taskbarApp.textContent = appName;
    taskbarApp.setAttribute('data-window', windowId);
    
    taskbarApp.addEventListener('click', function() {
        const targetWindow = document.getElementById(windowId);
        if (targetWindow.style.display === 'none') {
            targetWindow.style.display = 'block';
        } else {
            makeWindowActive(windowId);
        }
    });
    
    taskbarApps.appendChild(taskbarApp);
}

// إغلاق النافذة
function closeWindow(windowId) {
    const windowIndex = windows.findIndex(w => w.id === windowId);
    if (windowIndex !== -1) {
        // إزالة النافذة من DOM
        const windowElement = document.getElementById(windowId);
        if (windowElement) {
            windowElement.remove();
        }
        
        // إزالة من شريط المهام
        const taskbarApp = document.querySelector(`.taskbar-app[data-window="${windowId}"]`);
        if (taskbarApp) {
            taskbarApp.remove();
        }
        
        // إزالة من المصفوفة
        windows.splice(windowIndex, 1);
        
        // إذا كانت النافذة النشطة هي التي أغلقت، اجعل النافذة التالية نشطة
        if (activeWindow && activeWindow.id === windowId) {
            activeWindow = windows.length > 0 ? windows[windows.length - 1] : null;
        }
    }
}

// وظائف الآلة الحاسبة
let calculatorValue = '0';
let previousValue = '0';
let operation = null;

function appendToCalculator(value) {
    if (calculatorValue === '0' || calculatorValue === 'Error') {
        calculatorValue = value;
    } else {
        calculatorValue += value;
    }
    updateCalculatorDisplay();
}

function clearCalculator() {
    calculatorValue = '0';
    previousValue = '0';
    operation = null;
    updateCalculatorDisplay();
}

function calculateResult() {
    try {
        // استبدال الرموز لجعلها صالحة للتقييم
        let expression = calculatorValue.replace(/×/g, '*').replace(/÷/g, '/');
        calculatorValue = eval(expression).toString();
    } catch (e) {
        calculatorValue = 'Error';
    }
    updateCalculatorDisplay();
}

function updateCalculatorDisplay() {
    const display = document.getElementById('calcDisplay');
    if (display) {
        display.textContent = calculatorValue;
    }
}
