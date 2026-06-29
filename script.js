// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================
function getOrgs() { return JSON.parse(localStorage.getItem('organizations') || '[]'); }
function saveOrgs(orgs) { localStorage.setItem('organizations', JSON.stringify(orgs)); }
function getStaff() { return JSON.parse(localStorage.getItem('staff') || '[]'); }
function saveStaff(staff) { localStorage.setItem('staff', JSON.stringify(staff)); }
function getProtocol() { return JSON.parse(localStorage.getItem('protocol') || '[]'); }
function saveProtocol(protocol) { localStorage.setItem('protocol', JSON.stringify(protocol)); }
let currentOrgId = localStorage.getItem('currentOrgId') || null;

// ============================================================
// ПОЛУЧЕНИЕ СИЗ С ОНЛАЙН ИНСПЕКЦИИ (БЕЗ РУЧНОГО ВВОДА ПРОФЕССИЙ)
// ============================================================

async function getPPEFromOnlineInspection(profession) {
    try {
        // Кодируем профессию для URL
        const encodedProfession = encodeURIComponent(profession.trim());
        
        // ПРЯМАЯ ССЫЛКА НА ПОИСК НА ОНЛАЙН ИНСПЕКЦИИ
        const url = `https://онлайнинспекция.рф/ppe/search?q=${encodedProfession}`;
        
        console.log(`🔍 Запрос к Онлайн Инспекции: ${url}`);
        
        // Отправляем запрос как обычный браузер
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/html',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('📦 Получен HTML, длина:', html.length);
        
        // ПАРСИМ HTML И ВЫТАСКИВАЕМ СИЗ
        const ppeList = parsePPEFromHTML(html);
        
        if (ppeList.length > 0) {
            return {
                profession: profession,
                ppe: ppeList,
                source: 'Онлайн Инспекция'
            };
        }
        
        // Если не нашли - пробуем найти номер пункта
        const пункт = extractPunktFromHTML(html);
        if (пункт) {
            // Открываем страницу с номером пункта
            const punktUrl = `https://онлайнинспекция.рф/ppe/list?profession=${пункт}`;
            const punktResponse = await fetch(punktUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const punktHtml = await punktResponse.text();
            const ppeFromPunkt = parsePPEFromHTML(punktHtml);
            if (ppeFromPunkt.length > 0) {
                return {
                    profession: profession,
                    ppe: ppeFromPunkt,
                    source: 'Онлайн Инспекция (пункт ' + пункт + ')'
                };
            }
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Ошибка при запросе к Онлайн Инспекции:', error);
        return null;
    }
}

// ============================================================
// ПАРСИНГ HTML ДЛЯ ИЗВЛЕЧЕНИЯ СИЗ
// ============================================================

function parsePPEFromHTML(html) {
    const ppeList = [];
    const seen = new Set();
    
    // 1. Ищем блоки с СИЗ на странице Онлайн Инспекции
    const patterns = [
        // Основные паттерны для СИЗ
        /<div class="siz-item">\s*<div class="siz-name">(.*?)<\/div>/gi,
        /<div class="ppe-item">\s*<span class="ppe-name">(.*?)<\/span>/gi,
        /<div class="ppe-name">(.*?)<\/div>/gi,
        /<li class="ppe-list-item">(.*?)<\/li>/gi,
        /<td class="siz-name">(.*?)<\/td>/gi,
        /<span class="tooltip-name">(.*?)<\/span>/gi,
        // Паттерны для таблиц с СИЗ
        /<td[^>]*>([^<]*(?:костюм|халат|перчатки|очки|каска|обувь|респиратор|наушники|беруши|рукавицы|фартук|щиток|маска|жилет|пояс)[^<]*)<\/td>/gi
    ];
    
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
            let name = match[1].trim();
            // Очищаем от лишних тегов
            name = name.replace(/<[^>]*>/g, '').trim();
            // Убираем лишние пробелы
            name = name.replace(/\s+/g, ' ');
            if (name && name.length > 3 && !seen.has(name)) {
                seen.add(name);
                ppeList.push(name);
            }
        }
    }
    
    // 2. Ищем по ключевым словам в тексте страницы
    if (ppeList.length === 0) {
        console.log('🔍 Ищем СИЗ по ключевым словам...');
        const keywords = [
            'костюм', 'халат', 'комбинезон', 'рукавицы', 'перчатки', 
            'очки', 'щиток', 'каска', 'респиратор', 'беруши', 'наушники',
            'обувь', 'сапоги', 'ботинки', 'жилет', 'пояс', 'страховка',
            'сигнальный', 'защитный', 'диэлектрический', 'кислотостойкий',
            'фартук', 'экран', 'маска', 'подшлемник', 'краги'
        ];
        
        // Разбиваем HTML на текстовые блоки
        const textBlocks = html.split(/<[^>]*>/);
        for (const block of textBlocks) {
            const trimmed = block.trim();
            if (trimmed.length > 10 && trimmed.length < 300) {
                for (const keyword of keywords) {
                    if (trimmed.toLowerCase().includes(keyword) && !seen.has(trimmed)) {
                        seen.add(trimmed);
                        ppeList.push(trimmed);
                        break;
                    }
                }
            }
        }
    }
    
    // 3. Удаляем дубликаты и сортируем
    const unique = [...new Set(ppeList)];
    const filtered = unique
        .filter(item => item.length > 5)
        .filter(item => !item.includes('Корзина') && !item.includes('Вход') && !item.includes('Регистрация'));
    
    console.log(`📋 Найдено СИЗ: ${filtered.length} шт.`);
    return filtered;
}

// ============================================================
// ИЗВЛЕЧЕНИЕ НОМЕРА ПУНКТА ИЗ HTML
// ============================================================

function extractPunktFromHTML(html) {
    // Ищем номер пункта в HTML
    const patterns = [
        /пункт\s*(\d+)/gi,
        /№\s*(\d+)/gi,
        /profession=(\d+)/gi,
        /list\?profession=(\d+)/gi
    ];
    
    for (const pattern of patterns) {
        let match = pattern.exec(html);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

// ============================================================
// ОСНОВНАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ СИЗ
// ============================================================

async function getPPEByProfession(profession) {
    if (!profession || profession.trim() === '') {
        return {
            profession: 'Не указана',
            ppe: ['Укажите должность для подбора СИЗ'],
            source: 'Ошибка'
        };
    }
    
    // Пробуем получить данные с Онлайн Инспекции
    try {
        const result = await getPPEFromOnlineInspection(profession);
        if (result && result.ppe && result.ppe.length > 0) {
            return result;
        }
    } catch (e) {
        console.warn('⚠️ Не удалось получить данные с Онлайн Инспекции');
    }
    
    // Если не получилось - используем минимальный базовый набор
    return {
        profession: profession,
        source: 'Базовый набор (не удалось загрузить с Онлайн Инспекции)',
        ppe: [
            'Костюм для защиты от общих производственных загрязнений — 1 шт.',
            'Обувь защитная — 1 пара',
            'Перчатки — 6 пар',
            'Очки защитные — 1 шт.'
        ]
    };
}

// ============================================================
// ОТКРЫТИЕ СТРАНИЦЫ ОНЛАЙН ИНСПЕКЦИИ
// ============================================================

function openOnlineInspection(profession) {
    if (!profession || profession.trim() === '') {
        alert('⚠️ Укажите должность для поиска СИЗ.');
        return;
    }
    const encoded = encodeURIComponent(profession.trim());
    const url = `https://онлайнинспекция.рф/ppe/search?q=${encoded}`;
    window.open(url, '_blank');
}

// ============================================================
// МОДАЛЬНОЕ ОКНО ДЛЯ СИЗ
// ============================================================

async function openPPEModal(wp) {
    if (!wp.position || wp.position.trim() === '') {
        alert('⚠️ Для этого рабочего места не указана должность.\nДобавьте должность в настройках рабочего места.');
        return;
    }
    
    const modal = document.getElementById('ppeModal');
    const loading = document.getElementById('ppeLoading');
    const content = document.getElementById('ppeContent');
    const error = document.getElementById('ppeError');
    
    loading.style.display = 'block';
    content.style.display = 'none';
    error.style.display = 'none';
    modal.classList.remove('hidden');
    
    document.getElementById('ppeEmployeeName').textContent = wp.name || 'Сотрудник';
    document.getElementById('ppePosition').textContent = wp.position || 'Должность не указана';
    
    try {
        const ppeData = await getPPEByProfession(wp.position);
        
        if (ppeData && ppeData.ppe && ppeData.ppe.length > 0) {
            const list = document.getElementById('ppeList');
            let html = '';
            
            // Информация об источнике
            html += `
                <div style="background:rgba(0,212,255,0.05);padding:8px 12px;border-radius:6px;margin-bottom:12px;border:1px solid rgba(0,212,255,0.1);">
                    <span style="color:#8888aa;font-size:12px;">
                        📋 Источник: <strong style="color:#00d4ff;">${ppeData.source || 'Онлайн Инспекция'}</strong>
                    </span>
                </div>
            `;
            
            // Список СИЗ
            if (ppeData.ppe.length > 0) {
                ppeData.ppe.forEach((item, index) => {
                    html += `
                        <div style="background:rgba(255,255,255,0.03);padding:12px 16px;border-radius:8px;border-left:3px solid #7c3aed;display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                            <span style="color:#7c3aed;font-weight:700;min-width:30px;">${index + 1}</span>
                            <span style="color:#ccc;flex:1;">${item}</span>
                            <span style="color:#4caf50;font-size:20px;">✅</span>
                        </div>
                    `;
                });
            } else {
                html += `
                    <div style="text-align:center;padding:20px;color:#8888aa;">
                        СИЗ не найдены для этой профессии
                    </div>
                `;
            }
            
            // Кнопка для проверки на сайте
            html += `
                <div style="margin-top:20px;padding-top:15px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
                    <button onclick="openOnlineInspection('${wp.position}')" 
                            style="background:rgba(124,58,237,0.2);border:1px solid #7c3aed;color:#b388ff;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;transition:all 0.2s;">
                        🔍 Проверить на сайте Онлайн Инспекция
                    </button>
                    <p style="color:#666;font-size:12px;margin-top:8px;">
                        Откроется страница с актуальными СИЗ по вашей профессии
                    </p>
                </div>
            `;
            
            list.innerHTML = html;
            
            wp.hasPPE = true;
            wp.ppeSource = ppeData.source || 'Онлайн Инспекция';
            saveMap();
            drawMap();
            
            loading.style.display = 'none';
            content.style.display = 'block';
        } else {
            throw new Error('СИЗ не найдены для данной профессии');
        }
    } catch (err) {
        console.error('Ошибка загрузки СИЗ:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
        error.innerHTML = `
            <div style="font-size:20px;margin-bottom:12px;">😕</div>
            <div style="font-size:16px;color:#ff6b6b;margin-bottom:8px;">
                Не удалось найти СИЗ для профессии "<strong>${wp.position}</strong>"
            </div>
            <div style="font-size:14px;color:#8888aa;max-width:400px;margin:0 auto;line-height:1.6;">
                Проверьте правильность написания профессии.<br>
                Попробуйте указать профессию в соответствии с Приказом 767н.<br>
                <span style="font-size:12px;color:#666;">Пример: Токарь, Сварщик, Электрик, Водитель троллейбуса</span>
            </div>
            <button onclick="openOnlineInspection('${wp.position}')" 
                    style="margin-top:16px;padding:8px 24px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3);border-radius:8px;color:#b388ff;cursor:pointer;font-size:14px;">
                🔍 Открыть на Онлайн Инспекции
            </button>
        `;
    }
}

// ============================================================
// ОСТАЛЬНЫЕ ФУНКЦИИ (для полноты кода)
// ============================================================

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('mainPage').style.display = 'none';
    
    if (page === 'main') {
        document.getElementById('mainPage').style.display = 'block';
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Главная') link.classList.add('active'); 
        });
    } else if (page === 'training') {
        document.getElementById('trainingPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Обучение') link.classList.add('active'); 
        });
        initTrainingPage();
    } else if (page === 'map') {
        document.getElementById('mapPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Карта') link.classList.add('active'); 
        });
        initMapPage();
    } else if (page === 'risks') {
        document.getElementById('risksPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Оценка рисков') link.classList.add('active'); 
        });
    } else if (page === 'analytics') {
        document.getElementById('analyticsPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Аналитика') link.classList.add('active'); 
        });
    }
}

function renderOrgs() {
    const select = document.getElementById('orgSelect');
    const orgs = getOrgs();
    select.innerHTML = '<option value="">-- Выберите организацию --</option>';
    orgs.forEach(org => {
        const opt = document.createElement('option');
        opt.value = org.id;
        opt.textContent = `${org.name} (${org.inn})`;
        select.appendChild(opt);
    });
    if (currentOrgId) select.value = currentOrgId;
}

function selectOrg(id) { 
    currentOrgId = id; 
    localStorage.setItem('currentOrgId', currentOrgId); 
}

function showTab(name) {
    document.querySelectorAll('.tab button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[id^="tab"]').forEach(t => t.classList.add('hidden'));
    
    if (name === 'staff') {
        document.getElementById('tabStaff').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(1)').classList.add('active');
        renderStaff();
        fillFamEmployeeSelect();
    } else if (name === 'protocol') {
        document.getElementById('tabProtocol').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(2)').classList.add('active');
        renderProtocol();
    } else if (name === 'familiarization') {
        document.getElementById('tabFamiliarization').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(3)').classList.add('active');
        fillFamEmployeeSelect();
    }
}

function renderStaff() {
    const container = document.getElementById('staffContainer');
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
    const checked = document.getElementById('selectAllStaff').checked; 
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

function renderProtocol() {
    const container = document.getElementById('protocolContainer');
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

function fillFamEmployeeSelect() {
    const select = document.getElementById('famEmployeeSelect');
    const staff = getStaff();
    select.innerHTML = '<option value="">-- Выберите сотрудника --</option>';
    staff.forEach((emp, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = `${emp.last_name} ${emp.first_name} ${emp.middle_name || ''} — ${emp.position}`;
        select.appendChild(opt);
    });
}

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
// ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ ОБУЧЕНИЯ
// ============================================================
let trainingInited = false;

function initTrainingPage() {
    if (trainingInited) return;
    trainingInited = true;
    renderOrgs(); 
    renderStaff(); 
    renderProtocol(); 
    fillFamEmployeeSelect();

    document.getElementById('showOrgFormBtn').addEventListener('click', function() { 
        document.getElementById('orgForm').classList.toggle('hidden'); 
    });
    document.getElementById('cancelOrgBtn').addEventListener('click', function() { 
        document.getElementById('orgForm').classList.add('hidden'); 
    });
    document.getElementById('saveOrgBtn').addEventListener('click', function() {
        const name = document.getElementById('orgNameInput').value.trim(); 
        const inn = document.getElementById('orgInnInput').value.trim();
        if (!name || !inn) { alert('Заполните название и ИНН'); return; }
        const orgs = getOrgs(); 
        const newOrg = { id: Date.now(), name: name, inn: inn }; 
        orgs.push(newOrg); 
        saveOrgs(orgs);
        document.getElementById('orgNameInput').value = ''; 
        document.getElementById('orgInnInput').value = ''; 
        document.getElementById('orgForm').classList.add('hidden');
        renderOrgs(); 
        document.getElementById('orgSelect').value = newOrg.id; 
        selectOrg(newOrg.id); 
        alert('✅ Организация добавлена!');
    });
    document.getElementById('deleteOrgBtn').addEventListener('click', function() {
        const select = document.getElementById('orgSelect'); 
        const orgId = select.value;
        if (!orgId) { alert('Сначала выберите организацию для удаления'); return; }
        if (!confirm('Удалить выбранную организацию?')) return;
        let orgs = getOrgs(); 
        orgs = orgs.filter(o => o.id != parseInt(orgId)); 
        saveOrgs(orgs);
        if (currentOrgId == orgId) { currentOrgId = null; localStorage.removeItem('currentOrgId'); }
        renderOrgs(); 
        document.getElementById('orgSelect').value = ''; 
        alert('✅ Организация удалена');
    });
    document.getElementById('orgSelect').addEventListener('change', function() { 
        if (this.value) { 
            selectOrg(parseInt(this.value)); 
        } else { 
            currentOrgId = null; 
            localStorage.removeItem('currentOrgId'); 
        } 
    });

    document.getElementById('staffImportBtn').addEventListener('click', function() {
        const input = document.createElement('input'); 
        input.type = 'file'; 
        input.accept = '.txt,.csv'; 
        input.style.display = 'none'; 
        document.body.appendChild(input);
        input.onchange = function(e) {
            if (!e.target.files.length) { document.body.removeChild(input); return; }
            const file = e.target.files[0]; 
            const reader = new FileReader();
            reader.onload = function(event) {
                let content = event.target.result;
                if (/[    ]/.test(content) || !/[а-яА-Я]/.test(content)) {
                    try { 
                        const bytes = new Uint8Array(content.length); 
                        for (let i = 0; i < content.length; i++) bytes[i] = content.charCodeAt(i) & 0xFF; 
                        const decoder = new TextDecoder('windows-1251'); 
                        content = decoder.decode(bytes); 
                    } catch(e) {}
                }
                if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
                const employees = smartParse(content);
                if (employees.length === 0) { 
                    alert('❌ Не удалось распознать данные.'); 
                    document.body.removeChild(input); 
                    return; 
                }
                const currentStaff = getStaff();
                employees.forEach(emp => { 
                    if (!currentStaff.some(e => e.last_name === emp.last_name && e.first_name === emp.first_name && e.snils === emp.snils)) 
                        currentStaff.push(emp); 
                });
                saveStaff(currentStaff); 
                renderStaff(); 
                fillFamEmployeeSelect();
                alert(`✅ Загружено ${employees.length} сотрудников!`);
                document.body.removeChild(input);
            };
            reader.readAsBinaryString(file);
        };
        input.click();
    });

    document.getElementById('addSelectedBtn').addEventListener('click', function() {
        const selected = getSelectedStaff();
        if (selected.length === 0) { alert('Выберите хотя бы одного сотрудника'); return; }
        const currentProtocol = getProtocol();
        selected.forEach(emp => { 
            if (!currentProtocol.some(e => e.last_name === emp.last_name && e.first_name === emp.first_name && e.snils === emp.snils)) 
                currentProtocol.push(emp); 
        });
        saveProtocol(currentProtocol); 
        alert(`✅ Добавлено ${selected.length} сотрудников в протокол!`); 
        deselectAllStaff(); 
        showTab('protocol');
    });

    document.getElementById('generateBtn').addEventListener('click', function() {
        const protocolNumber = document.getElementById('protocolNumber').value.trim();
        const date = document.getElementById('protocolDate').value;
        const orgSelect = document.getElementById('orgSelect'); 
        const orgId = orgSelect.value; 
        const orgs = getOrgs(); 
        const org = orgs.find(o => o.id == parseInt(orgId));
        const employees = getProtocol(); 
        const selectedPrograms = getSelectedPrograms();
        if (!orgId || !org) { alert('Выберите организацию'); return; }
        if (!protocolNumber) { alert('Введите номер протокола'); return; }
        if (!date) { alert('Выберите дату протокола'); return; }
        if (employees.length === 0) { alert('В протоколе нет сотрудников'); return; }
        if (selectedPrograms.length === 0) { alert('Выберите хотя бы одну программу'); return; }
        const programs = { 
            1: "Оказание первой помощи пострадавшим", 
            2: "Использование (применение) средств индивидуальной защиты", 
            3: "Общие вопросы охраны труда и функционирования системы управления охраной труда", 
            4: "Безопасные методы и приемы выполнения работ при воздействии вредных и (или) опасных производственных факторов, источников опасности, идентифицированных в рамках специальной оценки условий труда и оценки профессиональных рисков" 
        };
        let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'; 
        xml += '<RegistrySet xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
        employees.forEach(emp => { 
            selectedPrograms.forEach(progId => {
                xml += '\t<RegistryRecord>\n'; 
                xml += '\t\t<Worker>\n';
                xml += `\t\t\t<LastName>${escXml(emp.last_name)}</LastName>\n`;
                xml += `\t\t\t<FirstName>${escXml(emp.first_name)}</FirstName>\n`;
                xml += `\t\t\t<MiddleName>${escXml(emp.middle_name || '')}</MiddleName>\n`;
                xml += `\t\t\t<Snils>${escXml(formatSnils(emp.snils))}</Snils>\n`;
                xml += `\t\t\t<Position>${escXml(emp.position)}</Position>\n`;
                xml += `\t\t\t<EmployerInn>${escXml(org.inn)}</EmployerInn>\n`;
                xml += `\t\t\t<EmployerTitle>${escXml(org.name)}</EmployerTitle>\n`;
                xml += '\t\t</Worker>\n'; 
                xml += '\t\t<Organization>\n';
                xml += `\t\t\t<Inn>${escXml(org.inn)}</Inn>\n`;
                xml += `\t\t\t<Title>${escXml(org.name)}</Title>\n`;
                xml += '\t\t</Organization>\n';
                xml += `\t\t<Test isPassed="true" learnProgramId="${progId}">\n`;
                xml += `\t\t\t<Date>${escXml(date)}</Date>\n`;
                xml += `\t\t\t<ProtocolNumber>${escXml(protocolNumber)}</ProtocolNumber>\n`;
                xml += `\t\t\t<LearnProgramTitle>${escXml(programs[progId] || 'Неизвестная программа')}</LearnProgramTitle>\n`;
                xml += '\t\t</Test>\n'; 
                xml += '\t</RegistryRecord>\n';
            }); 
        });
        xml += '</RegistrySet>';
        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        document.getElementById('downloadLink').href = url;
        document.getElementById('downloadLink').download = `${protocolNumber.replace('/', '_')}_${date}.xml`;
        document.getElementById('resultBlock').classList.remove('hidden');
        alert('✅ XML создан! Нажмите "Скачать XML"');
    });

    document.getElementById('generateFamBtn').addEventListener('click', function() {
        const select = document.getElementById('famEmployeeSelect'); 
        const index = select.value;
        if (index === '') { alert('Выберите сотрудника'); return; }
        const staff = getStaff(); 
        const emp = staff[parseInt(index)];
        if (!emp) { alert('Сотрудник не найден'); return; }
        const checkboxes = document.querySelectorAll('.doc-check input[type="checkbox"]:checked'); 
        const documents = []; 
        checkboxes.forEach(cb => documents.push(cb.value));
        if (documents.length === 0) { alert('Выберите хотя бы один документ'); return; }
        const orgSelect = document.getElementById('orgSelect'); 
        const orgId = orgSelect.value; 
        const orgs = getOrgs(); 
        const org = orgs.find(o => o.id == parseInt(orgId));
        const orgName = org ? org.name : '___________'; 
        const orgInn = org ? org.inn : '___________';
        const date = new Date().toLocaleDateString('ru-RU'); 
        const contentDiv = document.getElementById('famContent');
        let html = `<div style="text-align:center;margin-bottom:16px;"><h3 style="font-size:16px;font-weight:700;color:#fff;">ЛИСТ ОЗНАКОМЛЕНИЯ</h3><p style="color:#8888aa;font-size:13px;">с локальными нормативными актами и документами по охране труда</p></div>
            <table style="width:100%;border-collapse:collapse;margin-top:8px;"><tr><td style="padding:4px 8px;font-weight:600;width:200px;color:#ccc;">Организация:</td><td style="padding:4px 8px;color:#ccc;">${orgName}</td></tr>
            <tr><td style="padding:4px 8px;font-weight:600;color:#ccc;">ИНН:</td><td style="padding:4px 8px;color:#ccc;">${orgInn}</td></tr>
            <tr><td style="padding:4px 8px;font-weight:600;color:#ccc;">Дата:</td><td style="padding:4px 8px;color:#ccc;">${date}</td></tr></table>
            <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
            <table style="width:100%;border-collapse:collapse;margin-top:8px;"><tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">ФИО сотрудника</th><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">Должность</th></tr>
            <tr><td style="padding:8px;color:#ccc;">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</td><td style="padding:8px;color:#ccc;">${emp.position}</td></tr></table>
            <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
            <table class="fam-table"><thead><tr><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">№</th><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">Наименование документа</th><th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Ознакомлен</th><th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Дата</th><th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Подпись</th></tr></thead><tbody>`;
        documents.forEach((doc, i) => { 
            html += `<tr><td style="padding:8px;color:#ccc;">${i + 1}</td><td style="padding:8px;color:#ccc;">${doc}</td><td style="text-align:center;padding:8px;color:#ccc;">[ ]</td><td style="text-align:center;padding:8px;color:#ccc;">___ . ___ . 20___</td><td style="text-align:center;padding:8px;color:#ccc;">___________</td></tr>`; 
        });
        html += `</tbody></table><hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;"><div style="font-size:12px;color:#8888aa;text-align:center;">С документами ознакомлен(а), согласен(на) и обязуюсь выполнять требования</div>
            <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px;color:#8888aa;"><div>СОТ: ___________________ / _____________ /</div><div>Сотрудник: ___________________ / _____________ /</div></div>`;
        contentDiv.innerHTML = html;
        document.getElementById('famResult').classList.remove('hidden');
    });
    document.getElementById('printFamBtn').addEventListener('click', function() { 
        window.print(); 
    });
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
let currentPPEWorkplace = null;

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 4000;
canvas.height = 2000;

function initMapPage() {
    if (mapInited) return;
    mapInited = true;
    
    const saved = localStorage.getItem('mapData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.workshops && parsed.workshops.length > 0) {
                mapData = parsed;
                if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
                const ws = getCurrentWorkshop();
                if (ws && ws.w < 3000) {
                    ws.x = 50;
                    ws.y = 50;
                    ws.w = 3900;
                    ws.h = 1900;
                }
                updateWorkshopSelect();
                updateInfo();
                drawMap();
            }
        } catch(e) {}
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
        updateWorkshopSelect();
        updateInfo();
        drawMap();
    }
    
    document.getElementById('editWorkshopBtn').addEventListener('click', function() {
        openWorkshopModal();
    });
    document.getElementById('addWorkerPlaceBtn').addEventListener('click', function() {
        const ws = getCurrentWorkshop();
        if (!ws) { alert('Сначала создайте участок'); return; }
        mapMode = 'addWorkplace';
        document.getElementById('mapMode').textContent = 'Добавление рабочего места';
        document.getElementById('mapMode').style.color = '#ff6b6b';
    });
    document.getElementById('addEvacuationBtn').addEventListener('click', function() {
        const ws = getCurrentWorkshop();
        if (!ws) { alert('Сначала создайте участок'); return; }
        mapMode = 'addEvacuation';
        document.getElementById('mapMode').textContent = 'Добавление выхода';
        document.getElementById('mapMode').style.color = '#4caf50';
    });
    document.getElementById('saveMapBtn').addEventListener('click', function() {
        saveMap();
        alert('✅ Карта сохранена!');
    });
    document.getElementById('saveWorkshopBtn').addEventListener('click', function() {
        saveWorkshop();
    });
    document.getElementById('saveWorkplaceBtn').addEventListener('click', function() {
        saveWorkplace();
    });
    document.getElementById('workshopSelect').addEventListener('change', function() {
        mapData.currentWorkshop = parseInt(this.value);
        updateInfo();
        drawMap();
        saveMap();
    });
    
    document.getElementById('deleteSelectedBtn').addEventListener('click', function() {
        deleteSelectedWorkplace();
    });
    
    setupCanvasEvents();
    updateWorkshopSelect();
    updateInfo();
    drawMap();
}

function getCurrentWorkshop() {
    return mapData.workshops[mapData.currentWorkshop] || null;
}

function updateWorkshopSelect() {
    const select = document.getElementById('workshopSelect');
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
    document.getElementById('workshopSize').textContent = ws ? `${ws.name}` : 'не задан';
    document.getElementById('workerCount').textContent = ws ? ws.workplaces.length : 0;
    document.getElementById('evacuationCount').textContent = mapData.evacuationPoints ? mapData.evacuationPoints.length : 0;
}

function getCanvasCoords(e) {
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
            if (!wp.position) {
                alert('⚠️ Для этого рабочего места не указана должность.\nДобавьте должность в настройках рабочего места.');
                return;
            }
            selectedWorkplaceIndex = found;
            drawMap();
            openPPEModal(wp);
        }
    });
    
    canvas.addEventListener('click', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        if (coords.x < ws.x || coords.x > ws.x + ws.w || coords.y < ws.y || coords.y > ws.y + ws.h) {
            if (mapMode !== 'addWorkplace' && mapMode !== 'addEvacuation') {
                selectedWorkplaceIndex = -1;
                drawMap();
            }
            return;
        }
        
        if (mapMode === 'addWorkplace') {
            openWorkplaceModal(coords.x, coords.y);
        } else if (mapMode === 'addEvacuation') {
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
                document.getElementById('mapMode').textContent = 'Просмотр';
                document.getElementById('mapMode').style.color = '#00d4ff';
            }
        } else {
            let found = -1;
            if (ws.workplaces) {
                ws.workplaces.forEach((wp, index) => {
                    const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                    if (dist < 40) found = index;
                });
            }
            selectedWorkplaceIndex = found;
            drawMap();
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
    modal.classList.remove('hidden');
    document.getElementById('workshopNameInput').value = ws.name || '';
    document.getElementById('workshopLengthInput').value = ws.length || 30;
    document.getElementById('workshopWidthInput').value = ws.width || 20;
    document.getElementById('workshopNameInput').focus();
}

function closeWorkshopModal() {
    document.getElementById('workshopModal').classList.add('hidden');
}

function saveWorkshop() {
    const ws = getCurrentWorkshop();
    if (!ws) return;
    const name = document.getElementById('workshopNameInput').value.trim() || 'Участок';
    const length = parseInt(document.getElementById('workshopLengthInput').value) || 30;
    const width = parseInt(document.getElementById('workshopWidthInput').value) || 20;
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
    modal.classList.remove('hidden');
    document.getElementById('workplaceNameInput').value = '';
    document.getElementById('workplacePositionInput').value = '';
    document.getElementById('workplaceZoneInput').value = 60;
    document.getElementById('workplaceNameInput').focus();
}

function closeWorkplaceModal() {
    document.getElementById('workplaceModal').classList.add('hidden');
    tempWorkplacePos = null;
    mapMode = 'view';
    document.getElementById('mapMode').textContent = 'Просмотр';
    document.getElementById('mapMode').style.color = '#00d4ff';
}

function saveWorkplace() {
    if (!tempWorkplacePos) return;
    const ws = getCurrentWorkshop();
    if (!ws) return;
    const name = document.getElementById('workplaceNameInput').value.trim() || 'Рабочее место ' + (ws.workplaces.length + 1);
    const position = document.getElementById('workplacePositionInput').value.trim() || '';
    const zone = parseInt(document.getElementById('workplaceZoneInput').value) || 60;
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

function closePPEModal() {
    document.getElementById('ppeModal').classList.add('hidden');
    currentPPEWorkplace = null;
}

function exportPPE() {
    if (!currentPPEWorkplace) return;
    
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
                .item { padding: 12px 18px; margin: 10px 0; background: #fafafa; border-left: 4px solid #7c3aed; border-radius: 4px; }
                .item .num { color: #7c3aed; font-weight: 700; margin-right: 12px; }
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
                📋 Источник: ${currentPPEWorkplace.ppeSource || 'Приказ Минтруда РФ от 29.10.2021 № 767н'}
            </div>
            <hr style="margin: 20px 0;">
            <div id="ppeList">
                ${document.getElementById('ppeList').innerHTML}
            </div>
            <div class="footer">
                <p>Основано на Приказе Минтруда РФ от 29.10.2021 № 767н</p>
                <p>«Об утверждении Единых типовых норм выдачи средств индивидуальной защиты»</p>
                <p style="margin-top:10px;color:#aaa;">Сформировано в системе «ОхранаТруда.Про»</p>
            </div>
            <script>window.print();</script>
        </body>
        </html>
    `);
    win.document.close();
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mainPage').style.display = 'block';
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === 'Главная') link.classList.add('active');
    });
});
