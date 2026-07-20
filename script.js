// ============================================================
// ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
// ============================================================
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const mainPage = document.getElementById('mainPage');
    if (mainPage) mainPage.style.display = 'none';
    
    if (page === 'main') {
        if (mainPage) mainPage.style.display = 'block';
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Главная') link.classList.add('active'); 
        });
    } else if (page === 'training') {
        const el = document.getElementById('trainingPage');
        if (el) el.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Обучение') link.classList.add('active'); 
        });
        initTrainingPage();
    } else if (page === 'map') {
        const el = document.getElementById('mapPage');
        if (el) el.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Карта') link.classList.add('active'); 
        });
        setTimeout(initMapPage, 50);
    } else if (page === 'risks') {
        const el = document.getElementById('risksPage');
        if (el) el.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Оценка рисков') link.classList.add('active'); 
        });
    } else if (page === 'analytics') {
        const el = document.getElementById('analyticsPage');
        if (el) el.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Аналитика') link.classList.add('active'); 
        });
    }
}

// ============================================================
// ХРАНИЛИЩЕ
// ============================================================
function getOrgs() { return JSON.parse(localStorage.getItem('organizations') || '[]'); }
function saveOrgs(orgs) { localStorage.setItem('organizations', JSON.stringify(orgs)); }
function getStaff() { return JSON.parse(localStorage.getItem('staff') || '[]'); }
function saveStaff(staff) { localStorage.setItem('staff', JSON.stringify(staff)); }
function getProtocol() { return JSON.parse(localStorage.getItem('protocol') || '[]'); }
function saveProtocol(protocol) { localStorage.setItem('protocol', JSON.stringify(protocol)); }

// ============================================================
// ОРГАНИЗАЦИИ
// ============================================================
function renderOrgs() {
    const select = document.getElementById('orgSelect');
    if (!select) return;
    const orgs = getOrgs();
    select.innerHTML = '<option value="">-- Выберите организацию --</option>';
    orgs.forEach(org => {
        const opt = document.createElement('option');
        opt.value = org.id;
        opt.textContent = `${org.name} (${org.inn})`;
        select.appendChild(opt);
    });
    const currentOrgId = localStorage.getItem('currentOrgId');
    if (currentOrgId) select.value = currentOrgId;
}
function selectOrg(id) { 
    localStorage.setItem('currentOrgId', id); 
}

// ============================================================
// ВКЛАДКИ
// ============================================================
function showTab(name) {
    document.querySelectorAll('.tab button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[id^="tab"]').forEach(t => t.classList.add('hidden'));
    
    if (name === 'staff') {
        const el = document.getElementById('tabStaff');
        if (el) el.classList.remove('hidden');
        document.querySelector('.tab button:nth-child(1)')?.classList.add('active');
        renderStaff();
        fillFamEmployeeSelect();
    } else if (name === 'protocol') {
        const el = document.getElementById('tabProtocol');
        if (el) el.classList.remove('hidden');
        document.querySelector('.tab button:nth-child(2)')?.classList.add('active');
        renderProtocol();
    } else if (name === 'familiarization') {
        const el = document.getElementById('tabFamiliarization');
        if (el) el.classList.remove('hidden');
        document.querySelector('.tab button:nth-child(3)')?.classList.add('active');
        fillFamEmployeeSelect();
    }
}

// ============================================================
// ШТАТНОЕ РАСПИСАНИЕ
// ============================================================
function renderStaff() {
    const container = document.getElementById('staffContainer');
    if (!container) return;
    const staff = getStaff();
    if (staff.length === 0) { 
        container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">Нет загруженных сотрудников. Нажмите "Загрузить файл".</p>'; 
        return; 
    }
    let html = `<table class="staff-table"><thead><tr><th style="width:40px;"><input type="checkbox" id="selectAllStaff" onchange="toggleAllStaff()"></th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Должность</th><th>СНИЛС</th></tr></thead><tbody>`;
    staff.forEach((emp, index) => {
        html += `<tr><td><input type="checkbox" class="staff-check" data-index="${index}"></td><td>${emp.last_name}</td><td>${emp.first_name}</td><td>${emp.middle_name || ''}</td><td>${emp.position}</td><td>${emp.snils}</td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}
function toggleAllStaff() { 
    const checked = document.getElementById('selectAllStaff')?.checked || false; 
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = checked); 
}
function selectAllStaff() { 
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = true); 
    const selectAll = document.getElementById('selectAllStaff'); 
    if (selectAll) selectAll.checked = true; 
}
function deselectAllStaff() { 
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = false); 
    const selectAll = document.getElementById('selectAllStaff'); 
    if (selectAll) selectAll.checked = false; 
}
function getSelectedStaff() { 
    const checkboxes = document.querySelectorAll('.staff-check:checked'); 
    const staff = getStaff(); 
    const selected = []; 
    checkboxes.forEach(cb => { 
        const index = parseInt(cb.dataset.index); 
        if (staff[index]) selected.push({ ...staff[index] }); 
    }); 
    return selected; 
}
function clearStaff() { 
    if (!confirm('Удалить всех сотрудников из штатного расписания?')) return; 
    saveStaff([]); 
    renderStaff(); 
    fillFamEmployeeSelect(); 
}

// ============================================================
// ПРОТОКОЛ
// ============================================================
function renderProtocol() {
    const container = document.getElementById('protocolContainer');
    if (!container) return;
    const protocol = getProtocol();
    if (protocol.length === 0) { 
        container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">В протоколе пока нет сотрудников.</p>'; 
        return; 
    }
    let html = `<table class="protocol-table"><thead><tr><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Должность</th><th>СНИЛС</th><th style="width:60px;">Действие</th></tr></thead><tbody>`;
    protocol.forEach((emp, index) => {
        html += `<tr><td>${emp.last_name}</td><td>${emp.first_name}</td><td>${emp.middle_name || ''}</td><td>${emp.position}</td><td>${emp.snils}</td><td><button class="btn-remove" onclick="removeFromProtocol(${index})">✖</button></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}
function removeFromProtocol(index) { 
    const protocol = getProtocol(); 
    protocol.splice(index, 1); 
    saveProtocol(protocol); 
    renderProtocol(); 
}

// ============================================================
// ПРОГРАММЫ
// ============================================================
function selectAllPrograms() { 
    document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]').forEach(cb => cb.checked = true); 
}
function clearAllPrograms() { 
    document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]').forEach(cb => cb.checked = false); 
}
function selectPrograms(ids) { 
    document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]').forEach(cb => { 
        cb.checked = ids.includes(parseInt(cb.value)); 
    }); 
}
function getSelectedPrograms() { 
    const checkboxes = document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]:checked'); 
    const programs = []; 
    checkboxes.forEach(cb => programs.push(parseInt(cb.value))); 
    return programs; 
}

// ============================================================
// ОЗНАКОМЛЕНИЕ
// ============================================================
function fillFamEmployeeSelect() {
    const select = document.getElementById('famEmployeeSelect');
    if (!select) return;
    const staff = getStaff();
    select.innerHTML = '<option value="">-- Выберите сотрудника --</option>';
    staff.forEach((emp, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = `${emp.last_name} ${emp.first_name} ${emp.middle_name || ''} — ${emp.position}`;
        select.appendChild(opt);
    });
}

// ============================================================
// ПАРСЕР
// ============================================================
function smartParse(content) {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    const employees = [];
    lines.forEach(line => {
        let trimmed = line.trim();
        if (!trimmed) return;
        trimmed = trimmed.replace(/\t/g, ' ');
        trimmed = trimmed.replace(/\s+/g, ' ');
        trimmed = trimmed.trim();
        const result = parseLine(trimmed);
        if (result) employees.push(result);
    });
    return employees;
}
function parseLine(line) {
    let snils = ''; 
    let snilsMatch = line.match(/\d{3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{2}/);
    if (snilsMatch) { 
        snils = snilsMatch[0].replace(/[\s-]/g, ''); 
        line = line.replace(snilsMatch[0], '').trim(); 
    }
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) return null;
    const commonPositions = ['инженер','техник','механик','специалист','мастер','бригадир','директор','менеджер','бухгалтер','экономист','юрист','конструктор','технолог','электрик','сварщик','токарь','фрезеровщик','слесарь','водитель','грузчик','кладовщик','уборщик','охранник','программист','администратор','начальник','заведующий','главный','ведущий','старший','младший','помощник','заместитель','швея','вышивальщица','раскройщик','комплектовщик','упаковщик','контролер','наладчик','оператор','машинист','крановщик','стропальщик','троллейбуса','автобуса','трамвая','отк','спец','мех','энерг','снабж','электромонтер','диспетчер','фельдшер','медицинская','сестра','кассир','сторож','вахтер','аккумуляторщик','маляр','токарь','обмотчик','ремонтировщик','разр','отдела'];
    let nameParts = [], positionParts = [], i = 0;
    while (i < words.length) { 
        const w = words[i]; 
        const lower = w.toLowerCase(); 
        const isName = /^[А-ЯЁ][а-яё]{1,19}$/.test(w) || /^[A-Z][a-z]{1,19}$/.test(w); 
        const isPosition = commonPositions.some(pos => lower === pos || lower.includes(pos) || pos.includes(lower)); 
        if (isName && !isPosition && nameParts.length < 3) { 
            nameParts.push(w); 
            i++; 
        } else { 
            positionParts.push(w); 
            i++; 
        } 
    }
    if (nameParts.length < 2) { 
        const firstThree = words.slice(0, Math.min(3, words.length)); 
        if (firstThree.length >= 2) { 
            nameParts = firstThree; 
            positionParts = words.slice(firstThree.length); 
        } 
    }
    if (nameParts.length < 2) return null;
    return { 
        last_name: nameParts[0] || '', 
        first_name: nameParts[1] || '', 
        middle_name: nameParts[2] || '', 
        position: positionParts.join(' ') || '', 
        snils: snils || '', 
        is_passed: true 
    };
}
function formatSnils(snils) { 
    if (!snils) return ''; 
    const clean = snils.replace(/\D/g, ''); 
    if (clean.length < 11) return snils; 
    return clean.slice(0,3) + '-' + clean.slice(3,6) + '-' + clean.slice(6,9) + ' ' + clean.slice(9,11); 
}
function escXml(str) { 
    if (!str) return ''; 
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); 
}

// ============================================================
// ФУНКЦИЯ ДЛЯ МОДАЛЬНОГО ОКНА СИЗ (ОНЛАЙН-ИНСПЕКЦИЯ)
// ============================================================
let currentPPEWorkplace = null;

function openPPEModal(wp) {
    if (!wp || !wp.position || wp.position.trim() === '') {
        alert('⚠️ Для этого рабочего места не указана должность.\nДобавьте должность в настройках рабочего места.');
        return;
    }
    
    currentPPEWorkplace = wp;
    
    const modal = document.getElementById('ppeModal');
    const loading = document.getElementById('ppeLoading');
    const content = document.getElementById('ppeContent');
    const error = document.getElementById('ppeError');
    const list = document.getElementById('ppeList');
    
    if (!modal) {
        console.error('❌ Модальное окно не найдено!');
        return;
    }
    
    loading.style.display = 'block';
    content.style.display = 'none';
    error.style.display = 'none';
    modal.classList.remove('hidden');
    
    const nameEl = document.getElementById('ppeEmployeeName');
    const posEl = document.getElementById('ppePosition');
    if (nameEl) nameEl.textContent = wp.name || 'Сотрудник';
    if (posEl) posEl.textContent = wp.position || 'Должность не указана';
    
    try {
        const searchQuery = wp.position.trim();
        const encodedQuery = encodeURIComponent(searchQuery);
        const url = `https://xn--80akibicpdbetz7e2g.xn--p1ai/ppe/search?q=${encodedQuery}`;
        
        let html = `
            <div style="background:rgba(0,212,255,0.05);padding:12px 16px;border-radius:8px;margin-bottom:16px;border:1px solid rgba(0,212,255,0.1);">
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:32px;">🔍</span>
                    <div>
                        <div style="color:#00d4ff;font-weight:600;font-size:16px;">
                            Поиск СИЗ на Онлайн-Инспекции
                        </div>
                        <div style="color:#8888aa;font-size:13px;margin-top:4px;">
                            Должность: <strong style="color:#fff;">${wp.position}</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background:rgba(255,255,255,0.03);padding:16px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);text-align:center;">
                <div style="font-size:48px;margin-bottom:12px;">🌐</div>
                <div style="color:#ccc;font-size:16px;margin-bottom:8px;">
                    Сайт Онлайн-Инспекции откроется в новой вкладке
                </div>
                <div style="color:#8888aa;font-size:13px;margin-bottom:16px;">
                    Там вы найдете актуальные СИЗ для профессии<br>
                    <span style="color:#7c3aed;font-weight:500;">"${wp.position}"</span>
                </div>
                <button onclick="openOnlineInspection('${wp.position}')" 
                        style="padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#00d4ff);border:none;border-radius:12px;color:#fff;font-size:18px;font-weight:600;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 20px rgba(124,58,237,0.3);"
                        onmouseover="this.style.transform='scale(1.05)'" 
                        onmouseout="this.style.transform='scale(1)'">
                    🔍 Открыть Онлайн-Инспекцию
                </button>
            </div>
            
            <div style="margin-top:16px;padding:12px;background:rgba(255,193,7,0.05);border-radius:8px;border:1px solid rgba(255,193,7,0.1);">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:18px;">💡</span>
                    <span style="color:#8888aa;font-size:12px;">
                        Выберите СИЗ на сайте и вернитесь, чтобы отметить их как подобранные
                    </span>
                </div>
            </div>
            
            <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                <button onclick="markPPEAsFound()" 
                        style="padding:8px 20px;background:rgba(76,175,80,0.15);border:1px solid rgba(76,175,80,0.3);border-radius:8px;color:#4caf50;cursor:pointer;font-size:14px;">
                    ✅ Отметить СИЗ как подобранные
                </button>
                <button onclick="closePPEModal()" 
                        style="padding:8px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#aaa;cursor:pointer;font-size:14px;">
                    ✖ Закрыть
                </button>
            </div>
        `;
        
        list.innerHTML = html;
        
        loading.style.display = 'none';
        content.style.display = 'block';
        
    } catch (err) {
        console.error('Ошибка:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
        error.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <div style="font-size:48px;margin-bottom:12px;">❌</div>
                <div style="font-size:18px;color:#ff6b6b;margin-bottom:8px;">
                    Ошибка при загрузке данных
                </div>
                <div style="color:#8888aa;font-size:14px;">
                    ${err.message || 'Попробуйте позже'}
                </div>
            </div>
        `;
    }
}

function openOnlineInspection(profession) {
    const encoded = encodeURIComponent(profession.trim());
    const url = `https://xn--80akibicpdbetz7e2g.xn--p1ai/ppe/search?q=${encoded}`;
    window.open(url, '_blank');
}

function markPPEAsFound() {
    if (!currentPPEWorkplace) return;
    
    currentPPEWorkplace.hasPPE = true;
    currentPPEWorkplace.ppeSource = 'Онлайн-Инспекция';
    saveMap();
    drawMap();
    
    alert('✅ Рабочее место отмечено как обеспеченное СИЗ!\n\n🟢 Теперь на карте оно будет зеленым.');
    closePPEModal();
}

function closePPEModal() {
    const modal = document.getElementById('ppeModal');
    if (modal) modal.classList.add('hidden');
    currentPPEWorkplace = null;
}

function exportPPE() {
    if (!currentPPEWorkplace) {
        alert('Нет данных для экспорта');
        return;
    }
    
    const items = document.querySelectorAll('#ppeList .ppe-item');
    let ppeText = '';
    items.forEach((item, index) => {
        const nameEl = item.querySelector('div div:first-child');
        const name = nameEl ? nameEl.textContent : '';
        ppeText += `<div style="padding:8px 12px;margin:4px 0;background:#f5f5f5;border-radius:4px;border-left:3px solid #7c3aed;">
            <span style="font-weight:700;color:#7c3aed;">${index + 1}.</span> 
            <span>${name}</span> 
            <span style="color:#4caf50;float:right;">✅</span>
        </div>`;
    });
    
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>СИЗ для ${currentPPEWorkplace.name}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
                h1 { color: #1a1a3e; border-bottom: 3px solid #7c3aed; padding-bottom: 10px; }
                .header-info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .header-info p { margin: 5px 0; }
                .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #888; text-align: center; }
                .source { background: #e8f5e9; padding: 10px; border-radius: 6px; margin: 15px 0; font-size: 14px; }
            </style>
        </head>
        <body>
            <h1>🦺 Средства индивидуальной защиты</h1>
            <div class="header-info">
                <p><strong>Сотрудник:</strong> ${currentPPEWorkplace.name}</p>
                <p><strong>Должность:</strong> ${currentPPEWorkplace.position}</p>
                <p><strong>Дата формирования:</strong> ${new Date().toLocaleDateString('ru-RU', {day:'2-digit', month:'long', year:'numeric'})}</p>
            </div>
            <div class="source">
                📋 Источник: ${currentPPEWorkplace.ppeSource || 'Онлайн-Инспекция'}
            </div>
            <hr style="margin: 20px 0;">
            ${ppeText || '<p style="color:#888;">Нет данных о СИЗ</p>'}
            <div class="footer">
                <p>Данные получены с сайта Онлайн-Инспекция</p>
            </div>
            <script>window.print();</script>
        </body>
        </html>
    `);
    win.document.close();
}

// ============================================================
// КАРТА
// ============================================================
let mapData = {
    workshops: [],
    currentWorkshop: 0,
    evacuationPoints: []
};
let mapMode = 'view';
let mapInited = false;
let tempWorkplacePos = null;
let isDragging = false;
let dragTarget = null;
let dragOffsetX = 0, dragOffsetY = 0;
let isResizing = false;
let resizeCorner = '';
let resizeStartX = 0, resizeStartY = 0;
let resizeStartW = 0, resizeStartH = 0;
let resizeStartXpos = 0, resizeStartYpos = 0;
let selectedWorkplaceIndex = -1;

function initMapPage() {
    console.log('🗺️ initMapPage вызвана');
    
    if (mapInited) {
        console.log('⚠️ Карта уже инициализирована');
        return;
    }
    
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) {
        console.error('❌ Canvas с id="mapCanvas" не найден!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ Не удалось получить контекст canvas!');
        return;
    }
    
    canvas.width = 4000;
    canvas.height = 2000;
    
    mapInited = true;
    
    const saved = localStorage.getItem('mapData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.workshops && parsed.workshops.length > 0) {
                mapData = parsed;
                if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
            }
        } catch(e) {
            console.error('Ошибка загрузки данных:', e);
        }
    }
    
    if (mapData.workshops.length === 0) {
        mapData.workshops.push({
            id: Date.now(),
            name: 'Основной цех',
            length: 30,
            width: 20,
            x: 50,
            y: 50,
            w: 3900,
            h: 1900,
            workplaces: []
        });
        mapData.currentWorkshop = 0;
        mapData.evacuationPoints = [];
    }
    
    const editBtn = document.getElementById('editWorkshopBtn');
    if (editBtn) editBtn.addEventListener('click', openWorkshopModal);
    
    const addWorkerBtn = document.getElementById('addWorkerPlaceBtn');
    if (addWorkerBtn) {
        addWorkerBtn.addEventListener('click', function() {
            const ws = getCurrentWorkshop();
            if (!ws) { alert('Сначала создайте участок'); return; }
            mapMode = 'addWorkplace';
            const modeEl = document.getElementById('mapMode');
            if (modeEl) {
                modeEl.textContent = 'Добавление рабочего места (кликните на карту)';
                modeEl.style.color = '#ff6b6b';
            }
            const canvasEl = document.getElementById('mapCanvas');
            if (canvasEl) canvasEl.style.cursor = 'crosshair';
        });
    }
    
    const addEvacBtn = document.getElementById('addEvacuationBtn');
    if (addEvacBtn) {
        addEvacBtn.addEventListener('click', function() {
            const ws = getCurrentWorkshop();
            if (!ws) { alert('Сначала создайте участок'); return; }
            mapMode = 'addEvacuation';
            const modeEl = document.getElementById('mapMode');
            if (modeEl) {
                modeEl.textContent = 'Добавление выхода (кликните на карту)';
                modeEl.style.color = '#4caf50';
            }
            const canvasEl = document.getElementById('mapCanvas');
            if (canvasEl) canvasEl.style.cursor = 'crosshair';
        });
    }
    
    const saveBtn = document.getElementById('saveMapBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveMap();
            alert('✅ Карта сохранена!');
        });
    }
    
    const saveWorkshopBtn = document.getElementById('saveWorkshopBtn');
    if (saveWorkshopBtn) saveWorkshopBtn.addEventListener('click', saveWorkshop);
    
    const saveWorkplaceBtn = document.getElementById('saveWorkplaceBtn');
    if (saveWorkplaceBtn) saveWorkplaceBtn.addEventListener('click', saveWorkplace);
    
    const workshopSelect = document.getElementById('workshopSelect');
    if (workshopSelect) {
        workshopSelect.addEventListener('change', function() {
            mapData.currentWorkshop = parseInt(this.value);
            updateInfo();
            drawMap();
            saveMap();
        });
    }
    
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (deleteBtn) deleteBtn.addEventListener('click', deleteSelectedWorkplace);
    
    setupCanvasEvents();
    
    updateWorkshopSelect();
    updateInfo();
    drawMap();
    
    console.log('✅ Карта инициализирована успешно!');
}

function getCurrentWorkshop() {
    return mapData.workshops[mapData.currentWorkshop] || null;
}

function updateWorkshopSelect() {
    const select = document.getElementById('workshopSelect');
    if (!select) return;
    select.innerHTML = '';
    mapData.workshops.forEach((ws, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = ws.name || `Участок ${index + 1}`;
        if (index === mapData.currentWorkshop) opt.selected = true;
        select.appendChild(opt);
    });
}

function updateInfo() {
    const ws = getCurrentWorkshop();
    const sizeEl = document.getElementById('workshopSize');
    const countEl = document.getElementById('workerCount');
    const evacEl = document.getElementById('evacuationCount');
    if (sizeEl) sizeEl.textContent = ws ? `${ws.name}` : 'не задан';
    if (countEl) countEl.textContent = ws ? ws.workplaces.length : 0;
    if (evacEl) evacEl.textContent = mapData.evacuationPoints ? mapData.evacuationPoints.length : 0;
}

function getCanvasCoords(e) {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function drawMap() {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const ws = getCurrentWorkshop();
    if (!ws) return;
    
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    const grad = ctx.createLinearGradient(ws.x, ws.y, ws.x + ws.w, ws.y + ws.h);
    grad.addColorStop(0, 'rgba(74, 158, 255, 0.08)');
    grad.addColorStop(1, 'rgba(74, 158, 255, 0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(ws.x, ws.y, ws.w, ws.h);
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(ws.x, ws.y, ws.w, ws.h);
    ctx.setLineDash([]);
    
    ctx.fillStyle = 'rgba(74, 158, 255, 0.6)';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🏭 ${ws.name} (${ws.length}×${ws.width} м)`, ws.x + ws.w/2, ws.y + 55);
    
    const cornerSize = 20;
    const corners = [
        { cx: ws.x, cy: ws.y },
        { cx: ws.x + ws.w, cy: ws.y },
        { cx: ws.x, cy: ws.y + ws.h },
        { cx: ws.x + ws.w, cy: ws.y + ws.h }
    ];
    corners.forEach(c => {
        ctx.fillStyle = 'rgba(74, 158, 255, 0.9)';
        ctx.fillRect(c.cx - cornerSize/2, c.cy - cornerSize/2, cornerSize, cornerSize);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(c.cx - cornerSize/2, c.cy - cornerSize/2, cornerSize, cornerSize);
    });
    
    if (ws.workplaces) {
        ws.workplaces.forEach((wp, index) => {
            const zoneSize = wp.zone || 60;
            const x = wp.x - zoneSize/2;
            const y = wp.y - zoneSize/2;
            const w = zoneSize;
            const h = zoneSize;
            
            ctx.fillStyle = 'rgba(255, 193, 7, 0.25)';
            ctx.fillRect(x, y, w, h);
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.clip();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 4;
            for (let i = -h; i < w + h; i += 14) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i + h, y + h);
                ctx.stroke();
            }
            ctx.restore();
            
            ctx.strokeStyle = 'rgba(255, 193, 7, 0.7)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
            
            const centerX = wp.x;
            const centerY = wp.y;
            const scale = 2.0;
            
            let color = '#ff6b6b';
            if (wp.hasPPE) {
                color = '#4caf50';
            }
            
            ctx.fillStyle = color;
            ctx.shadowColor = `${color}40`;
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(centerX, centerY - 18 * scale, 15 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillRect(centerX - 11 * scale, centerY - 6 * scale, 22 * scale, 26 * scale);
            ctx.fillRect(centerX - 18 * scale, centerY + 18 * scale, 10 * scale, 16 * scale);
            ctx.fillRect(centerX + 8 * scale, centerY + 18 * scale, 10 * scale, 16 * scale);
            ctx.fillRect(centerX - 22 * scale, centerY + 2 * scale, 8 * scale, 14 * scale);
            ctx.fillRect(centerX + 14 * scale, centerY + 2 * scale, 8 * scale, 14 * scale);
            
            if (index === selectedWorkplaceIndex) {
                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 3;
                ctx.setLineDash([8, 4]);
                ctx.strokeRect(x - 10, y - 10, w + 20, h + 20);
                ctx.setLineDash([]);
            }
            
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(wp.name.substring(0, 20), centerX, centerY + 60 * scale);
            if (wp.position) {
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.font = '14px sans-serif';
                ctx.fillText(wp.position.substring(0, 25), centerX, centerY + 78 * scale);
            }
            
            if (wp.hasPPE) {
                ctx.font = '22px sans-serif';
                ctx.fillText('🦺', centerX + 40 * scale, centerY - 28 * scale);
            }
            
            if (wp.ppeSource) {
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.font = '10px sans-serif';
                ctx.fillText(wp.ppeSource, centerX, centerY + 95 * scale);
            }
        });
    }
    
    if (mapData.evacuationPoints) {
        mapData.evacuationPoints.forEach((ep) => {
            const ew = 120, eh = 60;
            const ex = ep.x - ew/2;
            const ey = ep.y - eh/2;
            
            ctx.fillStyle = '#2e7d32';
            ctx.shadowColor = 'rgba(46, 125, 50, 0.4)';
            ctx.shadowBlur = 30;
            ctx.fillRect(ex, ey, ew, eh);
            ctx.shadowBlur = 0;
            
            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = 2;
            ctx.strokeRect(ex, ey, ew, eh);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🚪 ВЫХОД', ep.x, ep.y);
            ctx.textBaseline = 'alphabetic';
        });
    }
}

function setupCanvasEvents() {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) {
        console.error('❌ Canvas не найден в setupCanvasEvents!');
        return;
    }
    
    console.log('✅ setupCanvasEvents вызвана, canvas найден');
    
    canvas.addEventListener('click', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        console.log('🖱️ Клик по карте:', coords.x, coords.y, 'Режим:', mapMode);
        
        if (coords.x < ws.x || coords.x > ws.x + ws.w || coords.y < ws.y || coords.y > ws.y + ws.h) {
            if (mapMode !== 'addWorkplace' && mapMode !== 'addEvacuation') {
                selectedWorkplaceIndex = -1;
                drawMap();
            }
            return;
        }
        
        if (mapMode === 'addWorkplace') {
            console.log('✅ Открываем модалку для рабочего места');
            openWorkplaceModal(coords.x, coords.y);
            return;
        }
        
        if (mapMode === 'addEvacuation') {
            const name = prompt('Введите название выхода (опционально):', '');
            if (name !== null) {
                if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
                mapData.evacuationPoints.push({
                    x: coords.x,
                    y: coords.y,
                    name: name.trim() || 'Выход',
                    id: Date.now()
                });
                updateInfo();
                drawMap();
                saveMap();
                mapMode = 'view';
                const modeEl = document.getElementById('mapMode');
                if (modeEl) {
                    modeEl.textContent = 'Просмотр';
                    modeEl.style.color = '#00d4ff';
                }
                canvas.style.cursor = 'default';
            }
            return;
        }
        
        let found = -1;
        if (ws.workplaces) {
            ws.workplaces.forEach((wp, index) => {
                const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                if (dist < 40) found = index;
            });
        }
        selectedWorkplaceIndex = found;
        drawMap();
    });
    
    canvas.addEventListener('dblclick', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws || !ws.workplaces) return;
        
        let found = -1;
        ws.workplaces.forEach((wp, index) => {
            const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
            if (dist < 40) found = index;
        });
        
        if (found >= 0) {
            const wp = ws.workplaces[found];
            if (!wp.position || wp.position.trim() === '') {
                alert('⚠️ Для этого рабочего места не указана должность.\nДобавьте должность в настройках рабочего места.');
                return;
            }
            selectedWorkplaceIndex = found;
            drawMap();
            openPPEModal(wp);
        }
    });
    
    canvas.addEventListener('mousedown', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        if (ws.workplaces) {
            for (let i = ws.workplaces.length - 1; i >= 0; i--) {
                const wp = ws.workplaces[i];
                const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                if (dist < 40) {
                    isDragging = true;
                    dragTarget = i;
                    dragOffsetX = coords.x - wp.x;
                    dragOffsetY = coords.y - wp.y;
                    canvas.style.cursor = 'grabbing';
                    return;
                }
            }
        }
        
        const cornerSize = 25;
        const corners = [
            { cx: ws.x, cy: ws.y, corner: 'tl' },
            { cx: ws.x + ws.w, cy: ws.y, corner: 'tr' },
            { cx: ws.x, cy: ws.y + ws.h, corner: 'bl' },
            { cx: ws.x + ws.w, cy: ws.y + ws.h, corner: 'br' }
        ];
        for (let c of corners) {
            if (Math.abs(coords.x - c.cx) < cornerSize && Math.abs(coords.y - c.cy) < cornerSize) {
                isResizing = true;
                resizeCorner = c.corner;
                resizeStartX = coords.x;
                resizeStartY = coords.y;
                resizeStartW = ws.w;
                resizeStartH = ws.h;
                resizeStartXpos = ws.x;
                resizeStartYpos = ws.y;
                canvas.style.cursor = c.corner === 'tl' ? 'nw-resize' : c.corner === 'tr' ? 'ne-resize' : c.corner === 'bl' ? 'sw-resize' : 'se-resize';
                return;
            }
        }
    });
    
    canvas.addEventListener('mousemove', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        if (isDragging && dragTarget !== null) {
            const wp = ws.workplaces[dragTarget];
            if (wp) {
                let newX = coords.x - dragOffsetX;
                let newY = coords.y - dragOffsetY;
                newX = Math.max(ws.x + 20, Math.min(ws.x + ws.w - 20, newX));
                newY = Math.max(ws.y + 20, Math.min(ws.y + ws.h - 20, newY));
                wp.x = newX;
                wp.y = newY;
                drawMap();
            }
            return;
        }
        
        if (isResizing) {
            const dx = coords.x - resizeStartX;
            const dy = coords.y - resizeStartY;
            
            switch(resizeCorner) {
                case 'tl':
                    ws.x = Math.max(0, resizeStartXpos + dx);
                    ws.y = Math.max(0, resizeStartYpos + dy);
                    ws.w = Math.max(200, resizeStartW - dx);
                    ws.h = Math.max(200, resizeStartH - dy);
                    break;
                case 'tr':
                    ws.y = Math.max(0, resizeStartYpos + dy);
                    ws.w = Math.max(200, resizeStartW + dx);
                    ws.h = Math.max(200, resizeStartH - dy);
                    break;
                case 'bl':
                    ws.x = Math.max(0, resizeStartXpos + dx);
                    ws.w = Math.max(200, resizeStartW - dx);
                    ws.h = Math.max(200, resizeStartH + dy);
                    break;
                case 'br':
                    ws.w = Math.max(200, resizeStartW + dx);
                    ws.h = Math.max(200, resizeStartH + dy);
                    break;
            }
            drawMap();
            return;
        }
        
        let cursor = 'default';
        if (ws.workplaces) {
            for (let wp of ws.workplaces) {
                const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                if (dist < 40) {
                    cursor = 'grab';
                    break;
                }
            }
        }
        if (cursor === 'default') {
            const cornerSize = 25;
            const corners = [
                { cx: ws.x, cy: ws.y, c: 'nw-resize' },
                { cx: ws.x + ws.w, cy: ws.y, c: 'ne-resize' },
                { cx: ws.x, cy: ws.y + ws.h, c: 'sw-resize' },
                { cx: ws.x + ws.w, cy: ws.y + ws.h, c: 'se-resize' }
            ];
            for (let c of corners) {
                if (Math.abs(coords.x - c.cx) < cornerSize && Math.abs(coords.y - c.cy) < cornerSize) {
                    cursor = c.c;
                    break;
                }
            }
        }
        canvas.style.cursor = cursor;
    });
    
    canvas.addEventListener('mouseup', function(e) {
        if (isDragging) {
            isDragging = false;
            dragTarget = null;
            canvas.style.cursor = 'default';
            saveMap();
        }
        if (isResizing) {
            isResizing = false;
            canvas.style.cursor = 'default';
            saveMap();
        }
    });
    
    canvas.addEventListener('mouseleave', function() {
        if (isDragging) {
            isDragging = false;
            dragTarget = null;
            canvas.style.cursor = 'default';
            saveMap();
        }
        if (isResizing) {
            isResizing = false;
            canvas.style.cursor = 'default';
            saveMap();
        }
    });
}

function deleteSelectedWorkplace() {
    const ws = getCurrentWorkshop();
    if (!ws || !ws.workplaces) {
        alert('Нет рабочих мест для удаления');
        return;
    }
    
    if (selectedWorkplaceIndex < 0 || selectedWorkplaceIndex >= ws.workplaces.length) {
        alert('Сначала выберите рабочее место (кликните на него)');
        return;
    }
    
    const wp = ws.workplaces[selectedWorkplaceIndex];
    if (confirm(`Удалить рабочее место "${wp.name}"?`)) {
        ws.workplaces.splice(selectedWorkplaceIndex, 1);
        selectedWorkplaceIndex = -1;
        updateInfo();
        drawMap();
        saveMap();
        alert('✅ Рабочее место удалено');
    }
}

function openWorkshopModal() {
    const ws = getCurrentWorkshop();
    if (!ws) { alert('Сначала создайте участок'); return; }
    const modal = document.getElementById('workshopModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    const nameInput = document.getElementById('workshopNameInput');
    const lengthInput = document.getElementById('workshopLengthInput');
    const widthInput = document.getElementById('workshopWidthInput');
    if (nameInput) nameInput.value = ws.name || '';
    if (lengthInput) lengthInput.value = ws.length || 30;
    if (widthInput) widthInput.value = ws.width || 20;
    if (nameInput) nameInput.focus();
}

function closeWorkshopModal() {
    const modal = document.getElementById('workshopModal');
    if (modal) modal.classList.add('hidden');
}

function saveWorkshop() {
    const ws = getCurrentWorkshop();
    if (!ws) return;
    const nameInput = document.getElementById('workshopNameInput');
    const lengthInput = document.getElementById('workshopLengthInput');
    const widthInput = document.getElementById('workshopWidthInput');
    const name = nameInput ? nameInput.value.trim() || 'Участок' : 'Участок';
    const length = lengthInput ? parseInt(lengthInput.value) || 30 : 30;
    const width = widthInput ? parseInt(widthInput.value) || 20 : 20;
    ws.name = name;
    ws.length = length;
    ws.width = width;
    closeWorkshopModal();
    updateWorkshopSelect();
    updateInfo();
    drawMap();
    saveMap();
}

function openWorkplaceModal(x, y) {
    tempWorkplacePos = { x, y };
    const modal = document.getElementById('workplaceModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    const nameInput = document.getElementById('workplaceNameInput');
    const posInput = document.getElementById('workplacePositionInput');
    const zoneInput = document.getElementById('workplaceZoneInput');
    if (nameInput) nameInput.value = '';
    if (posInput) posInput.value = '';
    if (zoneInput) zoneInput.value = 50;
    if (nameInput) nameInput.focus();
}

function closeWorkplaceModal() {
    const modal = document.getElementById('workplaceModal');
    if (modal) modal.classList.add('hidden');
    tempWorkplacePos = null;
    mapMode = 'view';
    const modeEl = document.getElementById('mapMode');
    if (modeEl) {
        modeEl.textContent = 'Просмотр';
        modeEl.style.color = '#00d4ff';
    }
    const canvas = document.getElementById('mapCanvas');
    if (canvas) canvas.style.cursor = 'default';
}

function saveWorkplace() {
    if (!tempWorkplacePos) {
        alert('Ошибка: позиция не определена');
        return;
    }
    const ws = getCurrentWorkshop();
    if (!ws) {
        alert('Ошибка: участок не найден');
        return;
    }
    
    const nameInput = document.getElementById('workplaceNameInput');
    const posInput = document.getElementById('workplacePositionInput');
    const zoneInput = document.getElementById('workplaceZoneInput');
    
    const name = nameInput ? nameInput.value.trim() || 'Рабочее место ' + (ws.workplaces.length + 1) : 'Рабочее место ' + (ws.workplaces.length + 1);
    const position = posInput ? posInput.value.trim() || '' : '';
    const zone = zoneInput ? parseInt(zoneInput.value) || 50 : 50;
    
    ws.workplaces.push({
        x: tempWorkplacePos.x,
        y: tempWorkplacePos.y,
        name: name,
        position: position,
        zone: zone,
        id: Date.now(),
        hasPPE: false,
        ppeSource: null
    });
    
    closeWorkplaceModal();
    updateInfo();
    drawMap();
    saveMap();
    
    alert('✅ Рабочее место добавлено! Двойной клик по нему для просмотра СИЗ.');
}

function addNewWorkshop() {
    const name = prompt('Введите название нового участка:', 'Участок ' + (mapData.workshops.length + 1));
    if (!name) return;
    mapData.workshops.push({
        id: Date.now(),
        name: name,
        length: 30,
        width: 20,
        x: 50,
        y: 50,
        w: 3900,
        h: 1900,
        workplaces: []
    });
    mapData.currentWorkshop = mapData.workshops.length - 1;
    if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
    updateWorkshopSelect();
    updateInfo();
    drawMap();
    saveMap();
}

function deleteWorkshop() {
    if (mapData.workshops.length <= 1) {
        alert('Нельзя удалить единственный участок');
        return;
    }
    if (!confirm('Удалить текущий участок со всеми данными?')) return;
    mapData.workshops.splice(mapData.currentWorkshop, 1);
    if (mapData.currentWorkshop >= mapData.workshops.length) {
        mapData.currentWorkshop = mapData.workshops.length - 1;
    }
    updateWorkshopSelect();
    updateInfo();
    drawMap();
    saveMap();
}

function saveMap() {
    localStorage.setItem('mapData', JSON.stringify(mapData));
}

function clearMap() {
    if (!confirm('Очистить текущий участок?')) return;
    const ws = getCurrentWorkshop();
    if (ws) {
        ws.workplaces = [];
        mapData.evacuationPoints = [];
        selectedWorkplaceIndex = -1;
        updateInfo();
        drawMap();
        saveMap();
    }
}

// ============================================================
// ГЕНЕРАЦИЯ XML ПРОТОКОЛА
// ============================================================

function generateXML() {
    console.log('🚀 generateXML вызвана');
    
    const orgSelect = document.getElementById('orgSelect');
    const orgId = orgSelect ? orgSelect.value : '';
    const orgs = getOrgs();
    const org = orgs.find(o => o.id === parseInt(orgId));
    
    if (!org) {
        alert('❌ Выберите организацию!');
        return;
    }
    
    const protocol = getProtocol();
    if (protocol.length === 0) {
        alert('❌ В протоколе нет сотрудников! Добавьте их из штатного расписания.');
        return;
    }
    
    const numberInput = document.getElementById('protocolNumber');
    const dateInput = document.getElementById('protocolDate');
    
    const number = numberInput ? numberInput.value.trim() || '01/26' : '01/26';
    const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    
    const programCheckboxes = document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]:checked');
    const programs = [];
    programCheckboxes.forEach(cb => {
        const label = cb.closest('.program-check');
        if (label) {
            programs.push(label.textContent.trim());
        }
    });
    
    if (programs.length === 0) {
        alert('❌ Выберите хотя бы одну программу обучения!');
        return;
    }
    
    const xml = buildXML(org, protocol, number, date, programs);
    
    const resultBlock = document.getElementById('resultBlock');
    const downloadLink = document.getElementById('downloadLink');
    
    if (resultBlock && downloadLink) {
        resultBlock.classList.remove('hidden');
        
        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = `Протокол_${number}_${date}.xml`;
        
        const preview = document.createElement('pre');
        preview.style.cssText = 'max-height:300px;overflow:auto;background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;font-size:11px;color:#aaa;text-align:left;margin-top:12px;';
        preview.textContent = xml.substring(0, 500) + '...';
        
        const oldPreview = resultBlock.querySelector('pre');
        if (oldPreview) oldPreview.remove();
        
        resultBlock.appendChild(preview);
        
        console.log('✅ XML сгенерирован успешно!');
    }
}

function buildXML(org, employees, number, date, programs) {
    const dateFormatted = formatDate(date);
    const currentDate = new Date().toISOString().split('T')[0];
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<Протокол xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
    
    xml += '  <ОбщиеСведения>\n';
    xml += `    <НомерПротокола>${escXml(number)}</НомерПротокола>\n`;
    xml += `    <ДатаПроведения>${escXml(dateFormatted)}</ДатаПроведения>\n`;
    xml += `    <ДатаФормирования>${escXml(currentDate)}</ДатаФормирования>\n`;
    xml += `    <Организация>\n`;
    xml += `      <Наименование>${escXml(org.name)}</Наименование>\n`;
    xml += `      <ИНН>${escXml(org.inn)}</ИНН>\n`;
    xml += `    </Организация>\n`;
    xml += '  </ОбщиеСведения>\n\n';
    
    xml += '  <ПрограммыОбучения>\n';
    programs.forEach((prog, index) => {
        xml += `    <Программа Номер="${index + 1}">${escXml(prog)}</Программа>\n`;
    });
    xml += '  </ПрограммыОбучения>\n\n';
    
    xml += '  <СписокСотрудников>\n';
    employees.forEach((emp, index) => {
        xml += '    <Сотрудник>\n';
        xml += `      <Номер>${index + 1}</Номер>\n`;
        xml += `      <Фамилия>${escXml(emp.last_name)}</Фамилия>\n`;
        xml += `      <Имя>${escXml(emp.first_name)}</Имя>\n`;
        xml += `      <Отчество>${escXml(emp.middle_name || '')}</Отчество>\n`;
        xml += `      <Должность>${escXml(emp.position)}</Должность>\n`;
        xml += `      <СНИЛС>${escXml(formatSnils(emp.snils))}</СНИЛС>\n`;
        xml += `      <Результат>Пройдено</Результат>\n`;
        xml += '    </Сотрудник>\n';
    });
    xml += '  </СписокСотрудников>\n';
    
    xml += '</Протокол>';
    
    return xml;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
}

// ============================================================
// ГЕНЕРАЦИЯ ЛИСТА ОЗНАКОМЛЕНИЯ
// ============================================================

function generateFamiliarization() {
    const select = document.getElementById('famEmployeeSelect');
    const index = select ? parseInt(select.value) : -1;
    
    if (isNaN(index) || index < 0) {
        alert('❌ Выберите сотрудника!');
        return;
    }
    
    const staff = getStaff();
    const emp = staff[index];
    if (!emp) {
        alert('❌ Сотрудник не найден!');
        return;
    }
    
    const docCheckboxes = document.querySelectorAll('.doc-check input[type="checkbox"]:checked');
    const docs = [];
    docCheckboxes.forEach(cb => {
        docs.push(cb.value);
    });
    
    if (docs.length === 0) {
        alert('❌ Выберите хотя бы один документ для ознакомления!');
        return;
    }
    
    const result = document.getElementById('famResult');
    const content = document.getElementById('famContent');
    
    if (result && content) {
        let html = `
            <div style="padding:20px;background:#fff;color:#222;border-radius:8px;max-width:800px;margin:0 auto;">
                <h2 style="text-align:center;font-size:18px;border-bottom:2px solid #7c3aed;padding-bottom:10px;">
                    ЛИСТ ОЗНАКОМЛЕНИЯ
                </h2>
                <div style="margin:16px 0;">
                    <p><strong>Сотрудник:</strong> ${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</p>
                    <p><strong>Должность:</strong> ${emp.position}</p>
                    <p><strong>СНИЛС:</strong> ${formatSnils(emp.snils)}</p>
                    <p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                </div>
                <div style="border-top:1px solid #ddd;padding-top:12px;">
                    <p><strong>Ознакомлен(а) со следующими документами:</strong></p>
                    <ol style="padding-left:20px;">
        `;
        
        docs.forEach(doc => {
            html += `<li>${doc}</li>`;
        });
        
        html += `
                    </ol>
                </div>
                <div style="margin-top:20px;display:flex;justify-content:space-between;border-top:1px solid #ddd;padding-top:16px;">
                    <div>
                        <p>_____________</p>
                        <p style="font-size:12px;color:#666;">Подпись сотрудника</p>
                    </div>
                    <div>
                        <p>_____________</p>
                        <p style="font-size:12px;color:#666;">Дата</p>
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        result.classList.remove('hidden');
    }
}

// ============================================================
// ИМПОРТ ШТАТНОГО РАСПИСАНИЯ
// ============================================================

function importStaffFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv,.doc,.docx';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const content = event.target.result;
                const employees = smartParse(content);
                
                if (employees.length === 0) {
                    alert('❌ Не удалось распознать сотрудников. Проверьте формат файла.');
                    return;
                }
                
                const existing = getStaff();
                const merged = [...existing, ...employees];
                saveStaff(merged);
                
                renderStaff();
                fillFamEmployeeSelect();
                
                alert(`✅ Загружено ${employees.length} сотрудников! Всего: ${merged.length}`);
            } catch (err) {
                alert('❌ Ошибка при загрузке: ' + err.message);
                console.error(err);
            }
        };
        
        reader.readAsText(file, 'UTF-8');
    };
    
    input.click();
}

function addSelectedToProtocol() {
    const selected = getSelectedStaff();
    if (selected.length === 0) {
        alert('❌ Выберите хотя бы одного сотрудника в штатном расписании');
        return;
    }
    
    const protocol = getProtocol();
    const existingSnils = new Set(protocol.map(e => e.snils));
    
    let added = 0;
    selected.forEach(emp => {
        if (!existingSnils.has(emp.snils)) {
            protocol.push({ ...emp });
            existingSnils.add(emp.snils);
            added++;
        }
    });
    
    saveProtocol(protocol);
    renderProtocol();
    
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = false);
    const selectAll = document.getElementById('selectAllStaff');
    if (selectAll) selectAll.checked = false;
    
    alert(`✅ Добавлено ${added} сотрудников в протокол!`);
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

function initTrainingPage() {
    renderOrgs();
    renderStaff();
    renderProtocol();
    fillFamEmployeeSelect();
    
    const showOrgBtn = document.getElementById('showOrgFormBtn');
    const saveOrgBtn = document.getElementById('saveOrgBtn');
    const cancelOrgBtn = document.getElementById('cancelOrgBtn');
    const deleteOrgBtn = document.getElementById('deleteOrgBtn');
    const generateBtn = document.getElementById('generateBtn');
    const addSelectedBtn = document.getElementById('addSelectedBtn');
    const importBtn = document.getElementById('staffImportBtn');
    const generateFamBtn = document.getElementById('generateFamBtn');
    
    if (showOrgBtn) {
        showOrgBtn.addEventListener('click', function() {
            document.getElementById('orgForm').classList.remove('hidden');
        });
    }
    
    if (saveOrgBtn) {
        saveOrgBtn.addEventListener('click', function() {
            const nameInput = document.getElementById('orgNameInput');
            const innInput = document.getElementById('orgInnInput');
            const name = nameInput ? nameInput.value.trim() : '';
            const inn = innInput ? innInput.value.trim() : '';
            if (!name || !inn) { alert('Заполните все поля'); return; }
            const orgs = getOrgs();
            orgs.push({ id: Date.now(), name, inn });
            saveOrgs(orgs);
            renderOrgs();
            document.getElementById('orgForm').classList.add('hidden');
            if (nameInput) nameInput.value = '';
            if (innInput) innInput.value = '';
            alert('✅ Организация добавлена!');
        });
    }
    
    if (cancelOrgBtn) {
        cancelOrgBtn.addEventListener('click', function() {
            document.getElementById('orgForm').classList.add('hidden');
        });
    }
    
    if (deleteOrgBtn) {
        deleteOrgBtn.addEventListener('click', function() {
            const select = document.getElementById('orgSelect');
            const id = select ? parseInt(select.value) : 0;
            if (!id) { alert('Выберите организацию'); return; }
            if (!confirm('Удалить организацию?')) return;
            let orgs = getOrgs();
            orgs = orgs.filter(o => o.id !== id);
            saveOrgs(orgs);
            renderOrgs();
            alert('✅ Организация удалена');
        });
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generateXML);
    }
    
    if (addSelectedBtn) {
        addSelectedBtn.addEventListener('click', addSelectedToProtocol);
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', importStaffFile);
    }
    
    if (generateFamBtn) {
        generateFamBtn.addEventListener('click', generateFamiliarization);
    }
}

// ============================================================
// DOM READY
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM загружен');
    
    const mainPage = document.getElementById('mainPage');
    if (mainPage) mainPage.style.display = 'block';
    
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === 'Главная') link.classList.add('active');
    });
    
    initTrainingPage();
    
    const printFamBtn = document.getElementById('printFamBtn');
    if (printFamBtn) {
        printFamBtn.addEventListener('click', function() {
            const content = document.getElementById('famContent');
            if (!content) return;
            
            const win = window.open('', '_blank');
            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Лист ознакомления</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #222; max-width: 800px; margin: 0 auto; }
                        * { print-color-adjust: exact; }
                    </style>
                </head>
                <body>
                    ${content.innerHTML}
                    <script>
                        window.print();
                        window.close();
                    <\/script>
                </body>
                </html>
            `);
            win.document.close();
        });
    }
    
    console.log('✅ Все инициализировано!');
});
