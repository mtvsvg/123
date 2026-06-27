// ============================================================
// ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
// ============================================================
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('mainPage').style.display = 'none';
    if (page === 'main') {
        document.getElementById('mainPage').style.display = 'block';
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { if (link.textContent.trim() === 'Главная') link.classList.add('active'); });
    } else if (page === 'training') {
        document.getElementById('trainingPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { if (link.textContent.trim() === 'Обучение') link.classList.add('active'); });
        initTrainingPage();
    } else if (page === 'map') {
        document.getElementById('mapPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { if (link.textContent.trim() === 'Карта') link.classList.add('active'); });
        initMapPage();
    } else if (page === 'risks') {
        document.getElementById('risksPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { if (link.textContent.trim() === 'Оценка рисков') link.classList.add('active'); });
    } else if (page === 'analytics') {
        document.getElementById('analyticsPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { if (link.textContent.trim() === 'Аналитика') link.classList.add('active'); });
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
let currentOrgId = localStorage.getItem('currentOrgId') || null;

// ============================================================
// ОРГАНИЗАЦИИ
// ============================================================
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
function selectOrg(id) { currentOrgId = id; localStorage.setItem('currentOrgId', currentOrgId); }

// ============================================================
// ВКЛАДКИ
// ============================================================
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

// ============================================================
// ШТАТНОЕ РАСПИСАНИЕ
// ============================================================
function renderStaff() {
    const container = document.getElementById('staffContainer');
    const staff = getStaff();
    if (staff.length === 0) { container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">Нет загруженных сотрудников. Нажмите "Загрузить файл".</p>'; return; }
    let html = `<table class="staff-table"><thead><tr><th style="width:40px;"><input type="checkbox" id="selectAllStaff" onchange="toggleAllStaff()"></th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Должность</th><th>СНИЛС</th></tr></thead><tbody>`;
    staff.forEach((emp, index) => {
        html += `<tr><td><input type="checkbox" class="staff-check" data-index="${index}"></td><td>${emp.last_name}</td><td>${emp.first_name}</td><td>${emp.middle_name || ''}</td><td>${emp.position}</td><td>${emp.snils}</td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}
function toggleAllStaff() { const checked = document.getElementById('selectAllStaff').checked; document.querySelectorAll('.staff-check').forEach(cb => cb.checked = checked); }
function selectAllStaff() { document.querySelectorAll('.staff-check').forEach(cb => cb.checked = true); const selectAll = document.getElementById('selectAllStaff'); if (selectAll) selectAll.checked = true; }
function deselectAllStaff() { document.querySelectorAll('.staff-check').forEach(cb => cb.checked = false); const selectAll = document.getElementById('selectAllStaff'); if (selectAll) selectAll.checked = false; }
function getSelectedStaff() { const checkboxes = document.querySelectorAll('.staff-check:checked'); const staff = getStaff(); const selected = []; checkboxes.forEach(cb => { const index = parseInt(cb.dataset.index); if (staff[index]) selected.push({ ...staff[index] }); }); return selected; }
function clearStaff() { if (!confirm('Удалить всех сотрудников из штатного расписания?')) return; saveStaff([]); renderStaff(); fillFamEmployeeSelect(); }

// ============================================================
// ПРОТОКОЛ
// ============================================================
function renderProtocol() {
    const container = document.getElementById('protocolContainer');
    const protocol = getProtocol();
    if (protocol.length === 0) { container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">В протоколе пока нет сотрудников.</p>'; return; }
    let html = `<table class="protocol-table"><thead><tr><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Должность</th><th>СНИЛС</th><th style="width:60px;">Действие</th></tr></thead><tbody>`;
    protocol.forEach((emp, index) => {
        html += `<tr><td>${emp.last_name}</td><td>${emp.first_name}</td><td>${emp.middle_name || ''}</td><td>${emp.position}</td><td>${emp.snils}</td><td><button class="btn-remove" onclick="removeFromProtocol(${index})">✖</button></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}
function removeFromProtocol(index) { const protocol = getProtocol(); protocol.splice(index, 1); saveProtocol(protocol); renderProtocol(); }

// ============================================================
// ПРОГРАММЫ
// ============================================================
function selectAllPrograms() { document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]').forEach(cb => cb.checked = true); }
function clearAllPrograms() { document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]').forEach(cb => cb.checked = false); }
function selectPrograms(ids) { document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]').forEach(cb => { cb.checked = ids.includes(parseInt(cb.value)); }); }
function getSelectedPrograms() { const checkboxes = document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]:checked'); const programs = []; checkboxes.forEach(cb => programs.push(parseInt(cb.value))); return programs; }

// ============================================================
// ОЗНАКОМЛЕНИЕ
// ============================================================
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
    let snils = ''; let snilsMatch = line.match(/\d{3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{2}/);
    if (snilsMatch) { snils = snilsMatch[0].replace(/[\s-]/g, ''); line = line.replace(snilsMatch[0], '').trim(); }
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) return null;
    const commonPositions = ['инженер','техник','механик','специалист','мастер','бригадир','директор','менеджер','бухгалтер','экономист','юрист','конструктор','технолог','электрик','сварщик','токарь','фрезеровщик','слесарь','водитель','грузчик','кладовщик','уборщик','охранник','программист','администратор','начальник','заведующий','главный','ведущий','старший','младший','помощник','заместитель','швея','вышивальщица','раскройщик','комплектовщик','упаковщик','контролер','наладчик','оператор','машинист','крановщик','стропальщик','троллейбуса','автобуса','трамвая','отк','спец','мех','энерг','снабж','электромонтер','диспетчер','фельдшер','медицинская','сестра','кассир','сторож','вахтер','аккумуляторщик','маляр','токарь','обмотчик','ремонтировщик','разр','отдела'];
    let nameParts = [], positionParts = [], i = 0;
    while (i < words.length) { const w = words[i]; const lower = w.toLowerCase(); const isName = /^[А-ЯЁ][а-яё]{1,19}$/.test(w) || /^[A-Z][a-z]{1,19}$/.test(w); const isPosition = commonPositions.some(pos => lower === pos || lower.includes(pos) || pos.includes(lower)); if (isName && !isPosition && nameParts.length < 3) { nameParts.push(w); i++; } else { positionParts.push(w); i++; } }
    if (nameParts.length < 2) { const firstThree = words.slice(0, Math.min(3, words.length)); if (firstThree.length >= 2) { nameParts = firstThree; positionParts = words.slice(firstThree.length); } }
    if (nameParts.length < 2) return null;
    return { last_name: nameParts[0] || '', first_name: nameParts[1] || '', middle_name: nameParts[2] || '', position: positionParts.join(' ') || '', snils: snils || '', is_passed: true };
}
function formatSnils(snils) { if (!snils) return ''; const clean = snils.replace(/\D/g, ''); if (clean.length < 11) return snils; return clean.slice(0,3) + '-' + clean.slice(3,6) + '-' + clean.slice(6,9) + ' ' + clean.slice(9,11); }
function escXml(str) { if (!str) return ''; return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ============================================================
// ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ ОБУЧЕНИЯ
// ============================================================
let trainingInited = false;
function initTrainingPage() {
    if (trainingInited) return;
    trainingInited = true;
    renderOrgs(); renderStaff(); renderProtocol(); fillFamEmployeeSelect();

    document.getElementById('showOrgFormBtn').addEventListener('click', function() { document.getElementById('orgForm').classList.toggle('hidden'); });
    document.getElementById('cancelOrgBtn').addEventListener('click', function() { document.getElementById('orgForm').classList.add('hidden'); });
    document.getElementById('saveOrgBtn').addEventListener('click', function() {
        const name = document.getElementById('orgNameInput').value.trim(); const inn = document.getElementById('orgInnInput').value.trim();
        if (!name || !inn) { alert('Заполните название и ИНН'); return; }
        const orgs = getOrgs(); const newOrg = { id: Date.now(), name: name, inn: inn }; orgs.push(newOrg); saveOrgs(orgs);
        document.getElementById('orgNameInput').value = ''; document.getElementById('orgInnInput').value = ''; document.getElementById('orgForm').classList.add('hidden');
        renderOrgs(); document.getElementById('orgSelect').value = newOrg.id; selectOrg(newOrg.id); alert('✅ Организация добавлена!');
    });
    document.getElementById('deleteOrgBtn').addEventListener('click', function() {
        const select = document.getElementById('orgSelect'); const orgId = select.value;
        if (!orgId) { alert('Сначала выберите организацию для удаления'); return; }
        if (!confirm('Удалить выбранную организацию?')) return;
        let orgs = getOrgs(); orgs = orgs.filter(o => o.id != parseInt(orgId)); saveOrgs(orgs);
        if (currentOrgId == orgId) { currentOrgId = null; localStorage.removeItem('currentOrgId'); }
        renderOrgs(); document.getElementById('orgSelect').value = ''; alert('✅ Организация удалена');
    });
    document.getElementById('orgSelect').addEventListener('change', function() { if (this.value) { selectOrg(parseInt(this.value)); } else { currentOrgId = null; localStorage.removeItem('currentOrgId'); } });

    document.getElementById('staffImportBtn').addEventListener('click', function() {
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.txt,.csv'; input.style.display = 'none'; document.body.appendChild(input);
        input.onchange = function(e) {
            if (!e.target.files.length) { document.body.removeChild(input); return; }
            const file = e.target.files[0]; const reader = new FileReader();
            reader.onload = function(event) {
                let content = event.target.result;
                if (/[����]/.test(content) || !/[а-яА-Я]/.test(content)) {
                    try { const bytes = new Uint8Array(content.length); for (let i = 0; i < content.length; i++) bytes[i] = content.charCodeAt(i) & 0xFF; const decoder = new TextDecoder('windows-1251'); content = decoder.decode(bytes); } catch(e) {}
                }
                if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
                const employees = smartParse(content);
                if (employees.length === 0) { alert('❌ Не удалось распознать данные.'); document.body.removeChild(input); return; }
                const currentStaff = getStaff();
                employees.forEach(emp => { if (!currentStaff.some(e => e.last_name === emp.last_name && e.first_name === emp.first_name && e.snils === emp.snils)) currentStaff.push(emp); });
                saveStaff(currentStaff); renderStaff(); fillFamEmployeeSelect();
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
        selected.forEach(emp => { if (!currentProtocol.some(e => e.last_name === emp.last_name && e.first_name === emp.first_name && e.snils === emp.snils)) currentProtocol.push(emp); });
        saveProtocol(currentProtocol); alert(`✅ Добавлено ${selected.length} сотрудников в протокол!`); deselectAllStaff(); showTab('protocol');
    });

    document.getElementById('generateBtn').addEventListener('click', function() {
        const protocolNumber = document.getElementById('protocolNumber').value.trim();
        const date = document.getElementById('protocolDate').value;
        const orgSelect = document.getElementById('orgSelect'); const orgId = orgSelect.value; const orgs = getOrgs(); const org = orgs.find(o => o.id == parseInt(orgId));
        const employees = getProtocol(); const selectedPrograms = getSelectedPrograms();
        if (!orgId || !org) { alert('Выберите организацию'); return; }
        if (!protocolNumber) { alert('Введите номер протокола'); return; }
        if (!date) { alert('Выберите дату протокола'); return; }
        if (employees.length === 0) { alert('В протоколе нет сотрудников'); return; }
        if (selectedPrograms.length === 0) { alert('Выберите хотя бы одну программу'); return; }
        const programs = { 1: "Оказание первой помощи пострадавшим", 2: "Использование (применение) средств индивидуальной защиты", 3: "Общие вопросы охраны труда и функционирования системы управления охраной труда", 4: "Безопасные методы и приемы выполнения работ при воздействии вредных и (или) опасных производственных факторов, источников опасности, идентифицированных в рамках специальной оценки условий труда и оценки профессиональных рисков" };
        let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'; xml += '<RegistrySet xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
        employees.forEach(emp => { selectedPrograms.forEach(progId => {
            xml += '\t<RegistryRecord>\n'; xml += '\t\t<Worker>\n';
            xml += `\t\t\t<LastName>${escXml(emp.last_name)}</LastName>\n`;
            xml += `\t\t\t<FirstName>${escXml(emp.first_name)}</FirstName>\n`;
            xml += `\t\t\t<MiddleName>${escXml(emp.middle_name || '')}</MiddleName>\n`;
            xml += `\t\t\t<Snils>${escXml(formatSnils(emp.snils))}</Snils>\n`;
            xml += `\t\t\t<Position>${escXml(emp.position)}</Position>\n`;
            xml += `\t\t\t<EmployerInn>${escXml(org.inn)}</EmployerInn>\n`;
            xml += `\t\t\t<EmployerTitle>${escXml(org.name)}</EmployerTitle>\n`;
            xml += '\t\t</Worker>\n'; xml += '\t\t<Organization>\n';
            xml += `\t\t\t<Inn>${escXml(org.inn)}</Inn>\n`;
            xml += `\t\t\t<Title>${escXml(org.name)}</Title>\n`;
            xml += '\t\t</Organization>\n';
            xml += `\t\t<Test isPassed="true" learnProgramId="${progId}">\n`;
            xml += `\t\t\t<Date>${escXml(date)}</Date>\n`;
            xml += `\t\t\t<ProtocolNumber>${escXml(protocolNumber)}</ProtocolNumber>\n`;
            xml += `\t\t\t<LearnProgramTitle>${escXml(programs[progId] || 'Неизвестная программа')}</LearnProgramTitle>\n`;
            xml += '\t\t</Test>\n'; xml += '\t</RegistryRecord>\n';
        }); });
        xml += '</RegistrySet>';
        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        document.getElementById('downloadLink').href = url;
        document.getElementById('downloadLink').download = `${protocolNumber.replace('/', '_')}_${date}.xml`;
        document.getElementById('resultBlock').classList.remove('hidden');
        alert('✅ XML создан! Нажмите "Скачать XML"');
    });

    document.getElementById('generateFamBtn').addEventListener('click', function() {
        const select = document.getElementById('famEmployeeSelect'); const index = select.value;
        if (index === '') { alert('Выберите сотрудника'); return; }
        const staff = getStaff(); const emp = staff[parseInt(index)];
        if (!emp) { alert('Сотрудник не найден'); return; }
        const checkboxes = document.querySelectorAll('.doc-check input[type="checkbox"]:checked'); const documents = []; checkboxes.forEach(cb => documents.push(cb.value));
        if (documents.length === 0) { alert('Выберите хотя бы один документ'); return; }
        const orgSelect = document.getElementById('orgSelect'); const orgId = orgSelect.value; const orgs = getOrgs(); const org = orgs.find(o => o.id == parseInt(orgId));
        const orgName = org ? org.name : '___________'; const orgInn = org ? org.inn : '___________';
        const date = new Date().toLocaleDateString('ru-RU'); const contentDiv = document.getElementById('famContent');
        let html = `<div style="text-align:center;margin-bottom:16px;"><h3 style="font-size:16px;font-weight:700;color:#fff;">ЛИСТ ОЗНАКОМЛЕНИЯ</h3><p style="color:#8888aa;font-size:13px;">с локальными нормативными актами и документами по охране труда</p></div>
            <table style="width:100%;border-collapse:collapse;margin-top:8px;"><tr><td style="padding:4px 8px;font-weight:600;width:200px;color:#ccc;">Организация:</td><td style="padding:4px 8px;color:#ccc;">${orgName}</td></tr>
            <tr><td style="padding:4px 8px;font-weight:600;color:#ccc;">ИНН:</td><td style="padding:4px 8px;color:#ccc;">${orgInn}</td></tr>
            <tr><td style="padding:4px 8px;font-weight:600;color:#ccc;">Дата:</td><td style="padding:4px 8px;color:#ccc;">${date}</td></tr></table>
            <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
            <table style="width:100%;border-collapse:collapse;margin-top:8px;"><tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">ФИО сотрудника</th><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">Должность</th></tr>
            <tr><td style="padding:8px;color:#ccc;">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</td><td style="padding:8px;color:#ccc;">${emp.position}</td></tr></table>
            <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
            <table class="fam-table"><thead><tr><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">№</th><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">Наименование документа</th><th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Ознакомлен</th><th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Дата</th><th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Подпись</th></tr></thead><tbody>`;
        documents.forEach((doc, i) => { html += `<tr><td style="padding:8px;color:#ccc;">${i + 1}</td><td style="padding:8px;color:#ccc;">${doc}</td><td style="text-align:center;padding:8px;color:#ccc;">[ ]</td><td style="text-align:center;padding:8px;color:#ccc;">___ . ___ . 20___</td><td style="text-align:center;padding:8px;color:#ccc;">___________</td></tr>`; });
        html += `</tbody></table><hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;"><div style="font-size:12px;color:#8888aa;text-align:center;">С документами ознакомлен(а), согласен(на) и обязуюсь выполнять требования</div>
            <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px;color:#8888aa;"><div>СОТ: ___________________ / _____________ /</div><div>Сотрудник: ___________________ / _____________ /</div></div>`;
        contentDiv.innerHTML = html;
        document.getElementById('famResult').classList.remove('hidden');
    });
    document.getElementById('printFamBtn').addEventListener('click', function() { window.print(); });
}

// ============================================================
// КАРТА (ОБНОВЛЁННАЯ — ПЕРЕТАСКИВАНИЕ + ФИКС РАСТЯГИВАНИЯ)
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

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

function initMapPage() {
    if (mapInited) return;
    mapInited = true;
    
    // Загрузка данных
    const saved = localStorage.getItem('mapData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.workshops && parsed.workshops.length > 0) {
                mapData = parsed;
                if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
                updateWorkshopSelect();
                updateInfo();
                drawMap();
            }
        } catch(e) {}
    }
    
    // Если нет цехов — создаём дефолтный
    if (mapData.workshops.length === 0) {
        mapData.workshops.push({
            id: Date.now(),
            name: 'Основной цех',
            length: 30,
            width: 20,
            x: 50, y: 50, w: 800, h: 500,
            workplaces: []
        });
        mapData.currentWorkshop = 0;
        mapData.evacuationPoints = [];
        updateWorkshopSelect();
        updateInfo();
        drawMap();
    }
    
    // События
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
    document.getElementById('workshopSize').textContent = ws ? `${ws.name} (${ws.length}×${ws.width} м)` : 'не задан';
    document.getElementById('workerCount').textContent = ws ? ws.workplaces.length : 0;
    document.getElementById('evacuationCount').textContent = mapData.evacuationPoints ? mapData.evacuationPoints.length : 0;
}

function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 900 / rect.width;
    const scaleY = 600 / rect.height;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    return { x: Math.max(0, Math.min(900, (clientX - rect.left) * scaleX)), y: Math.max(0, Math.min(600, (clientY - rect.top) * scaleY)) };
}

function drawMap() {
    ctx.clearRect(0, 0, 900, 600);
    
    const ws = getCurrentWorkshop();
    if (!ws) return;
    
    // Фон
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 900, 600);
    
    // Сетка
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 900; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 600); ctx.stroke();
    }
    for (let i = 0; i < 600; i += 50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(900, i); ctx.stroke();
    }
    
    // Рисуем участок
    const grad = ctx.createLinearGradient(ws.x, ws.y, ws.x + ws.w, ws.y + ws.h);
    grad.addColorStop(0, 'rgba(74, 158, 255, 0.06)');
    grad.addColorStop(1, 'rgba(74, 158, 255, 0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(ws.x, ws.y, ws.w, ws.h);
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(ws.x, ws.y, ws.w, ws.h);
    ctx.setLineDash([]);
    
    // Название участка
    ctx.fillStyle = 'rgba(74, 158, 255, 0.6)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🏭 ${ws.name} (${ws.length}×${ws.width} м)`, ws.x + ws.w/2, ws.y + 30);
    
    // Углы для растягивания
    const corners = [
        { cx: ws.x, cy: ws.y, cursor: 'nw-resize' },
        { cx: ws.x + ws.w, cy: ws.y, cursor: 'ne-resize' },
        { cx: ws.x, cy: ws.y + ws.h, cursor: 'sw-resize' },
        { cx: ws.x + ws.w, cy: ws.y + ws.h, cursor: 'se-resize' }
    ];
    corners.forEach(c => {
        ctx.fillStyle = 'rgba(74, 158, 255, 0.8)';
        ctx.fillRect(c.cx - 6, c.cy - 6, 12, 12);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(c.cx - 6, c.cy - 6, 12, 12);
    });
    
    // Рабочие места с чёрно-жёлтой зоной
    if (ws.workplaces) {
        ws.workplaces.forEach((wp) => {
            const zoneSize = wp.zone || 40;
            const x = wp.x - zoneSize/2;
            const y = wp.y - zoneSize/2 - 10;
            const w = zoneSize;
            const h = zoneSize;
            
            // Жёлтый фон
            ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
            ctx.fillRect(x, y, w, h);
            
            // Чёрные диагональные полосы
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.clip();
            
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 4;
            for (let i = -h; i < w + h; i += 12) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i + h, y + h);
                ctx.stroke();
            }
            ctx.restore();
            
            // Рамка зоны
            ctx.strokeStyle = 'rgba(255, 193, 7, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
            
            // Человечек (внутри зоны, по центру)
            ctx.fillStyle = '#ff6b6b';
            ctx.shadowColor = 'rgba(255, 107, 107, 0.3)';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(wp.x, wp.y - 10, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillRect(wp.x - 7, wp.y - 2, 14, 18);
            ctx.fillRect(wp.x - 12, wp.y + 12, 7, 10);
            ctx.fillRect(wp.x + 5, wp.y + 12, 7, 10);
            
            // Название
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(wp.name.substring(0, 14), wp.x, wp.y + 42);
            if (wp.position) {
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.font = '8px sans-serif';
                ctx.fillText(wp.position.substring(0, 16), wp.x, wp.y + 54);
            }
        });
    }
    
    // Точки эвакуации
    if (mapData.evacuationPoints) {
        mapData.evacuationPoints.forEach((ep) => {
            const ew = 60, eh = 30;
            const ex = ep.x - ew/2;
            const ey = ep.y - eh/2;
            
            ctx.fillStyle = '#2e7d32';
            ctx.shadowColor = 'rgba(46, 125, 50, 0.4)';
            ctx.shadowBlur = 15;
            ctx.fillRect(ex, ey, ew, eh);
            ctx.shadowBlur = 0;
            
            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = 2;
            ctx.strokeRect(ex, ey, ew, eh);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('ВЫХОД', ep.x, ep.y);
            ctx.textBaseline = 'alphabetic';
        });
    }
}

function setupCanvasEvents() {
    // === КЛИК ДЛЯ ДОБАВЛЕНИЯ ===
    canvas.addEventListener('click', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        // Проверяем, что клик внутри участка
        if (coords.x < ws.x || coords.x > ws.x + ws.w || coords.y < ws.y || coords.y > ws.y + ws.h) {
            alert('Кликните внутри участка');
            return;
        }
        if (mapMode === 'addWorkplace') {
            openWorkplaceModal(coords.x, coords.y);
        } else if (mapMode === 'addEvacuation') {
            const name = prompt('Введите название выхода (опционально):', '');
            if (name !== null) {
                if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
                mapData.evacuationPoints.push({ x: coords.x, y: coords.y, name: name.trim() || 'Выход', id: Date.now() });
                updateInfo();
                drawMap();
                saveMap();
                mapMode = 'view';
                document.getElementById('mapMode').textContent = 'Просмотр';
                document.getElementById('mapMode').style.color = '#00d4ff';
            }
        }
    });
    
    // === ДВОЙНОЙ КЛИК ДЛЯ УДАЛЕНИЯ ===
    canvas.addEventListener('dblclick', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        // Проверяем рабочие места
        let found = -1;
        if (ws.workplaces) {
            ws.workplaces.forEach((wp, index) => {
                const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                if (dist < 20) found = index;
            });
            if (found >= 0) {
                if (confirm(`Удалить рабочее место "${ws.workplaces[found].name}"?`)) {
                    ws.workplaces.splice(found, 1);
                    updateInfo();
                    drawMap();
                    saveMap();
                    return;
                }
            }
        }
        // Проверяем выходы
        if (mapData.evacuationPoints) {
            let evacFound = -1;
            mapData.evacuationPoints.forEach((ep, index) => {
                const dist = Math.sqrt((coords.x - ep.x) ** 2 + (coords.y - ep.y) ** 2);
                if (dist < 20) evacFound = index;
            });
            if (evacFound >= 0) {
                if (confirm(`Удалить выход "${mapData.evacuationPoints[evacFound].name}"?`)) {
                    mapData.evacuationPoints.splice(evacFound, 1);
                    updateInfo();
                    drawMap();
                    saveMap();
                    return;
                }
            }
        }
    });
    
    // === НАЧАЛО ПЕРЕТАСКИВАНИЯ (ЛКМ ПО ЧЕЛОВЕЧКУ) ===
    canvas.addEventListener('mousedown', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        // Проверяем, кликнули ли по человечку (рабочему месту)
        if (ws.workplaces) {
            for (let i = ws.workplaces.length - 1; i >= 0; i--) {
                const wp = ws.workplaces[i];
                const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                if (dist < 20) {
                    isDragging = true;
                    dragTarget = i;
                    dragOffsetX = coords.x - wp.x;
                    dragOffsetY = coords.y - wp.y;
                    canvas.style.cursor = 'grabbing';
                    return;
                }
            }
        }
        
        // Проверяем углы для растягивания
        const corners = [
            { cx: ws.x, cy: ws.y, corner: 'tl' },
            { cx: ws.x + ws.w, cy: ws.y, corner: 'tr' },
            { cx: ws.x, cy: ws.y + ws.h, corner: 'bl' },
            { cx: ws.x + ws.w, cy: ws.y + ws.h, corner: 'br' }
        ];
        for (let c of corners) {
            if (Math.abs(coords.x - c.cx) < 10 && Math.abs(coords.y - c.cy) < 10) {
                isResizing = true;
                resizeCorner = c.corner;
                resizeStartX = coords.x;
                resizeStartY = coords.y;
                resizeStartW = ws.w;
                resizeStartH = ws.h;
                resizeStartXpos = ws.x;
                resizeStartYpos = ws.y;
                canvas.style.cursor = c.cursor === 'tl' ? 'nw-resize' : c.cursor === 'tr' ? 'ne-resize' : c.cursor === 'bl' ? 'sw-resize' : 'se-resize';
                return;
            }
        }
    });
    
    // === ДВИЖЕНИЕ МЫШИ ===
    canvas.addEventListener('mousemove', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        // Перетаскивание человечка
        if (isDragging && dragTarget !== null) {
            const wp = ws.workplaces[dragTarget];
            if (wp) {
                let newX = coords.x - dragOffsetX;
                let newY = coords.y - dragOffsetY;
                // Ограничиваем внутри участка
                newX = Math.max(ws.x + 10, Math.min(ws.x + ws.w - 10, newX));
                newY = Math.max(ws.y + 10, Math.min(ws.y + ws.h - 10, newY));
                wp.x = newX;
                wp.y = newY;
                drawMap();
            }
            return;
        }
        
        // Растягивание участка
        if (isResizing) {
            const dx = coords.x - resizeStartX;
            const dy = coords.y - resizeStartY;
            
            switch(resizeCorner) {
                case 'tl':
                    ws.x = Math.max(0, Math.min(900 - 50, resizeStartXpos + dx));
                    ws.y = Math.max(0, Math.min(600 - 50, resizeStartYpos + dy));
                    ws.w = Math.max(50, resizeStartW - dx);
                    ws.h = Math.max(50, resizeStartH - dy);
                    break;
                case 'tr':
                    ws.y = Math.max(0, Math.min(600 - 50, resizeStartYpos + dy));
                    ws.w = Math.max(50, resizeStartW + dx);
                    ws.h = Math.max(50, resizeStartH - dy);
                    break;
                case 'bl':
                    ws.x = Math.max(0, Math.min(900 - 50, resizeStartXpos + dx));
                    ws.w = Math.max(50, resizeStartW - dx);
                    ws.h = Math.max(50, resizeStartH + dy);
                    break;
                case 'br':
                    ws.w = Math.max(50, resizeStartW + dx);
                    ws.h = Math.max(50, resizeStartH + dy);
                    break;
            }
            drawMap();
            return;
        }
        
        // Меняем курсор при наведении на углы или человечков
        let cursor = 'default';
        
        // Проверяем человечков
        if (ws.workplaces) {
            for (let wp of ws.workplaces) {
                const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                if (dist < 20) {
                    cursor = 'grab';
                    break;
                }
            }
        }
        
        // Проверяем углы (если не наведены на человечка)
        if (cursor === 'default') {
            const corners = [
                { cx: ws.x, cy: ws.y, c: 'nw-resize' },
                { cx: ws.x + ws.w, cy: ws.y, c: 'ne-resize' },
                { cx: ws.x, cy: ws.y + ws.h, c: 'sw-resize' },
                { cx: ws.x + ws.w, cy: ws.y + ws.h, c: 'se-resize' }
            ];
            for (let c of corners) {
                if (Math.abs(coords.x - c.cx) < 10 && Math.abs(coords.y - c.cy) < 10) {
                    cursor = c.c;
                    break;
                }
            }
        }
        
        canvas.style.cursor = cursor;
    });
    
    // === ОТПУСКАНИЕ ЛКМ ===
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
    document.getElementById('workplaceZoneInput').value = 40;
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
    const zone = parseInt(document.getElementById('workplaceZoneInput').value) || 40;
    ws.workplaces.push({ x: tempWorkplacePos.x, y: tempWorkplacePos.y, name: name, position: position, zone: zone, id: Date.now() });
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
        x: 50, y: 50, w: 800, h: 500,
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
    alert('✅ Карта сохранена!');
}

function clearMap() {
    if (!confirm('Очистить текущий участок?')) return;
    const ws = getCurrentWorkshop();
    if (ws) {
        ws.workplaces = [];
        mapData.evacuationPoints = [];
        updateInfo();
        drawMap();
        saveMap();
    }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mainPage').style.display = 'block';
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === 'Главная') link.classList.add('active');
    });
});
