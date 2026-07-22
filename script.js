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
    } else if (page === 'calendar') {
        const el = document.getElementById('calendarPage');
        if (el) el.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Календарь') link.classList.add('active'); 
        });
        renderCalendar();
    } else if (page === 'ppeCards') {
        const el = document.getElementById('ppeCardsPage');
        if (el) el.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Карточки СИЗ') link.classList.add('active'); 
        });
        initPPECardsPage();
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
function getProtocol() { return JSON.parse(localStorage.getItem('protocol') || '[]'); }
function saveProtocol(protocol) { localStorage.setItem('protocol', JSON.stringify(protocol)); }
function getEvents() { return JSON.parse(localStorage.getItem('calendarEvents') || '[]'); }
function saveEvents(events) { localStorage.setItem('calendarEvents', JSON.stringify(events)); }

// ============================================================
// ШТАТНОЕ РАСПИСАНИЕ
// ============================================================
function getStaffData() {
    const saved = localStorage.getItem('staffData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.departments && data.unassigned !== undefined) {
                return data;
            }
        } catch(e) {}
    }
    return { departments: {}, unassigned: [] };
}

function saveStaffData(data) {
    localStorage.setItem('staffData', JSON.stringify(data));
}

function getAllEmployees() {
    const data = getStaffData();
    const all = [];
    for (const [dept, deptData] of Object.entries(data.departments)) {
        if (deptData.employees) {
            deptData.employees.forEach(emp => {
                all.push({ ...emp, department: dept });
            });
        }
    }
    data.unassigned.forEach(emp => {
        all.push({ ...emp, department: null });
    });
    return all;
}

function findEmployeeBySnils(snils) {
    const all = getAllEmployees();
    return all.find(e => e.snils === snils) || null;
}

function removeEmployeeBySnils(snils) {
    const data = getStaffData();
    for (const [dept, deptData] of Object.entries(data.departments)) {
        const idx = deptData.employees.findIndex(e => e.snils === snils);
        if (idx !== -1) {
            deptData.employees.splice(idx, 1);
            saveStaffData(data);
            renderStaffWithDepartments();
            return;
        }
    }
    const idx = data.unassigned.findIndex(e => e.snils === snils);
    if (idx !== -1) {
        data.unassigned.splice(idx, 1);
        saveStaffData(data);
        renderStaffWithDepartments();
    }
}

function getSelectedStaffFromView() {
    const checkboxes = document.querySelectorAll('.staff-check:checked');
    const selected = [];
    const data = getStaffData();
    
    checkboxes.forEach(cb => {
        const snils = cb.dataset.snils;
        const dept = cb.dataset.department;
        if (dept && data.departments[dept]) {
            const emp = data.departments[dept].employees.find(e => e.snils === snils);
            if (emp) selected.push({ ...emp });
        } else {
            const emp = data.unassigned.find(e => e.snils === snils);
            if (emp) selected.push({ ...emp });
        }
    });
    return selected;
}

// ============================================================
// ОТРИСОВКА ШТАТНОГО РАСПИСАНИЯ
// ============================================================
function renderStaffWithDepartments() {
    const container = document.getElementById('staffContainer');
    if (!container) return;
    const data = getStaffData();
    const allCount = getAllEmployees().length;
    
    if (allCount === 0) {
        container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">Нет загруженных сотрудников. Нажмите "Загрузить файл".</p>';
        document.getElementById('staffTotalCount').textContent = 'Всего: 0';
        return;
    }
    
    document.getElementById('staffTotalCount').textContent = `Всего: ${allCount}`;
    
    let html = '';
    
    for (const [deptName, deptData] of Object.entries(data.departments)) {
        const count = deptData.employees ? deptData.employees.length : 0;
        const isOpen = localStorage.getItem(`dept_open_${deptName}`) !== 'false';
        
        html += `
            <div style="background:rgba(255,255,255,0.03);border-radius:10px;margin-bottom:8px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">
                <div class="department-header" onclick="toggleDepartment('${deptName}')">
                    <span class="dept-name">📁 ${deptName}</span>
                    <span class="dept-count">${count} сотрудников</span>
                    <div>
                        <button class="btn-delete" onclick="event.stopPropagation();deleteDepartment('${deptName}')" style="padding:4px 10px;font-size:12px;">🗑</button>
                    </div>
                </div>
                <div class="department-body" id="dept_${deptName}" style="${isOpen ? 'display:block;' : 'display:none;'}">
                    ${deptData.employees && deptData.employees.length > 0 ? 
                        deptData.employees.map((emp, idx) => `
                            <div class="employee-row">
                                <input type="checkbox" class="staff-check" data-snils="${emp.snils}" data-department="${deptName}">
                                <span class="emp-name" onclick="openEmployeeCardBySnils('${emp.snils}')">${emp.last_name} ${emp.first_name}</span>
                                <span class="emp-position">${emp.position}</span>
                                <span class="emp-snils">${formatSnils(emp.snils)}</span>
                                <button class="emp-remove" onclick="removeEmployeeBySnils('${emp.snils}')">✖</button>
                            </div>
                        `).join('') 
                    : '<div class="dept-empty">Нет сотрудников</div>'}
                </div>
            </div>
        `;
    }
    
    if (data.unassigned.length > 0) {
        html += `
            <div class="unassigned-section">
                <div class="unassigned-title">📂 Без службы (${data.unassigned.length})</div>
                <div style="padding:0 14px 10px;">
                    ${data.unassigned.map((emp, idx) => `
                        <div class="employee-row">
                            <input type="checkbox" class="staff-check" data-snils="${emp.snils}" data-unassigned="true">
                            <span class="emp-name" onclick="openEmployeeCardBySnils('${emp.snils}')">${emp.last_name} ${emp.first_name}</span>
                            <span class="emp-position">${emp.position}</span>
                            <span class="emp-snils">${formatSnils(emp.snils)}</span>
                            <button class="emp-remove" onclick="removeEmployeeBySnils('${emp.snils}')">✖</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    fillFamEmployeeSelect();
}

function toggleDepartment(deptName) {
    const body = document.getElementById(`dept_${deptName}`);
    if (!body) return;
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    localStorage.setItem(`dept_open_${deptName}`, String(!isOpen));
}

function deleteDepartment(deptName) {
    if (!confirm(`Удалить службу "${deptName}" со всеми сотрудниками?`)) return;
    const data = getStaffData();
    if (data.departments[deptName]) {
        if (data.departments[deptName].employees) {
            data.departments[deptName].employees.forEach(emp => {
                data.unassigned.push(emp);
            });
        }
        delete data.departments[deptName];
        saveStaffData(data);
        renderStaffWithDepartments();
        alert(`✅ Служба "${deptName}" удалена, сотрудники перемещены в "Без службы"`);
    }
}

function createDepartmentFromSelected() {
    const selected = getSelectedStaffFromView();
    if (selected.length === 0) {
        alert('❌ Выберите сотрудников!');
        return;
    }
    
    const deptName = prompt('Введите название службы:', 'Служба ' + (Object.keys(getStaffData().departments).length + 1));
    if (!deptName) return;
    
    const data = getStaffData();
    const selectedSnils = new Set(selected.map(e => e.snils));
    data.unassigned = data.unassigned.filter(e => !selectedSnils.has(e.snils));
    
    for (const [dept, deptData] of Object.entries(data.departments)) {
        data.departments[dept].employees = deptData.employees.filter(e => !selectedSnils.has(e.snils));
    }
    
    data.departments[deptName] = { employees: selected };
    
    saveStaffData(data);
    renderStaffWithDepartments();
    alert(`✅ Создана служба "${deptName}" (${selected.length} сотрудников)`);
}

function selectAllStaffInCurrentView() {
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = true);
}

function deselectAllStaff() {
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = false);
}

function clearAllStaff() {
    if (!confirm('Удалить ВСЕХ сотрудников из штатного расписания?')) return;
    saveStaffData({ departments: {}, unassigned: [] });
    renderStaffWithDepartments();
    alert('✅ Штатное расписание очищено');
}

// ============================================================
// ЗАГРУЗКА ШТАТНОГО РАСПИСАНИЯ
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
                const employees = smartParse(event.target.result);
                if (employees.length === 0) { alert('❌ Не удалось распознать сотрудников.'); return; }
                
                const data = getStaffData();
                employees.forEach(emp => {
                    const exists = getAllEmployees().some(e => e.snils === emp.snils);
                    if (!exists) {
                        data.unassigned.push(emp);
                    }
                });
                saveStaffData(data);
                renderStaffWithDepartments();
                alert(`✅ Загружено ${employees.length} новых сотрудников!`);
            } catch (err) { alert('❌ Ошибка: ' + err.message); }
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

// ============================================================
// ПАРСЕР ШТАТНОГО РАСПИСАНИЯ
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
    
    const famOrgSelect = document.getElementById('famOrgSelect');
    if (famOrgSelect) {
        famOrgSelect.innerHTML = '<option value="">-- Выберите организацию --</option>';
        orgs.forEach(org => {
            const opt = document.createElement('option');
            opt.value = org.id;
            opt.textContent = org.name;
            famOrgSelect.appendChild(opt);
        });
        if (currentOrgId) famOrgSelect.value = currentOrgId;
    }
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
        renderStaffWithDepartments();
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
        renderOrgs();
    }
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
    const all = getAllEmployees();
    select.innerHTML = '<option value="">-- Выберите сотрудника --</option>';
    all.forEach((emp, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = `${emp.last_name} ${emp.first_name} ${emp.middle_name || ''} — ${emp.position}`;
        select.appendChild(opt);
    });
}

function getFamEmployeeData() {
    const select = document.getElementById('famEmployeeSelect');
    const index = select ? parseInt(select.value) : -1;
    
    const manualLastName = document.getElementById('famManualLastName')?.value.trim() || '';
    const manualFirstName = document.getElementById('famManualFirstName')?.value.trim() || '';
    const manualMiddleName = document.getElementById('famManualMiddleName')?.value.trim() || '';
    const manualPosition = document.getElementById('famManualPosition')?.value.trim() || '';
    
    if (manualLastName && manualFirstName) {
        return {
            last_name: manualLastName,
            first_name: manualFirstName,
            middle_name: manualMiddleName,
            position: manualPosition || 'Должность не указана'
        };
    }
    
    if (isNaN(index) || index < 0) return null;
    const all = getAllEmployees();
    return all[index] || null;
}

function getOrgName() {
    const select = document.getElementById('famOrgSelect');
    if (!select) return '';
    const orgs = getOrgs();
    const org = orgs.find(o => o.id === parseInt(select.value));
    return org ? org.name : '';
}

function generateFamiliarization() {
    const emp = getFamEmployeeData();
    if (!emp) {
        alert('❌ Выберите сотрудника или заполните поля вручную!');
        return;
    }
    
    const docLabels = document.querySelectorAll('.doc-check');
    const docs = [];
    let soutNumber = '';
    let riskPosition = '';
    
    docLabels.forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        const nameInput = label.querySelector('.doc-name-edit');
        const soutInput = label.querySelector('#soutCardNumber');
        
        if (checkbox && checkbox.checked) {
            let docName = nameInput ? nameInput.value.trim() : checkbox.value;
            if (soutInput && docName === 'Специальная оценка условий труда') {
                soutNumber = soutInput.value.trim();
            }
            if (docName === 'Оценка профессиональных рисков') {
                riskPosition = emp.position;
            }
            docs.push(docName);
        }
    });
    
    const customInput = document.getElementById('famCustomDoc');
    const customDocs = customInput ? customInput.value.split('\n').filter(d => d.trim().length > 0) : [];
    docs.push(...customDocs);
    
    if (docs.length === 0) {
        alert('❌ Выберите хотя бы один документ!');
        return;
    }
    
    const orgName = getOrgName();
    const result = document.getElementById('famResult');
    const content = document.getElementById('famContent');
    
    if (result && content) {
        const now = new Date();
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} г.`;
        
        let positionGenitive = emp.position;
        const lastChar = emp.position.slice(-1);
        if (['а', 'я'].includes(lastChar)) {
            positionGenitive = emp.position.slice(0, -1) + 'ы';
        } else if (['й', 'ь'].includes(lastChar)) {
            positionGenitive = emp.position.slice(0, -1) + 'я';
        }
        
        let html = `
            <div style="padding:30px;background:linear-gradient(145deg, #ffffff 0%, #f5f5ff 100%);color:#1a1a3e;border-radius:12px;max-width:1000px;margin:0 auto;box-shadow:0 8px 40px rgba(0,0,0,0.15);border:1px solid rgba(124,58,237,0.15);">
                
                <div style="text-align:center;border-bottom:3px solid #7c3aed;padding-bottom:16px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                        <div style="font-size:14px;color:#555;text-align:left;">
                            ${orgName ? `<strong>${orgName}</strong>` : ''}
                        </div>
                    </div>
                    <h2 style="font-size:22px;color:#1a1a3e;margin:12px 0 4px 0;letter-spacing:1px;">ЛИСТ ОЗНАКОМЛЕНИЯ</h2>
                    <p style="font-size:14px;color:#666;margin:0;">с нормативными актами по охране труда</p>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;background:#f0f0f8;padding:16px 20px;border-radius:8px;">
                    <div>
                        <p style="margin:4px 0;font-size:15px;color:#333;"><strong style="color:#555;">Фамилия:</strong> ${emp.last_name}</p>
                        <p style="margin:4px 0;font-size:15px;color:#333;"><strong style="color:#555;">Имя:</strong> ${emp.first_name}</p>
                        <p style="margin:4px 0;font-size:15px;color:#333;"><strong style="color:#555;">Отчество:</strong> ${emp.middle_name || '—'}</p>
                    </div>
                    <div>
                        <p style="margin:4px 0;font-size:15px;color:#333;"><strong style="color:#555;">Должность:</strong> ${emp.position}</p>
                        <p style="margin:4px 0;font-size:15px;color:#333;"><strong style="color:#555;">Дата:</strong> ${dateStr}</p>
                    </div>
                </div>
                
                <div style="border-top:2px solid #7c3aed;padding-top:16px;">
                    <p style="font-weight:700;color:#1a1a3e;margin-bottom:10px;font-size:16px;">📋 Ознакомлен(а) со следующими нормативными актами:</p>
                    <ol style="padding-left:24px;margin:0;line-height:2.2;font-size:15px;color:#333;">
        `;
        
        docs.forEach(doc => {
            let displayDoc = doc;
            if (doc === 'Специальная оценка условий труда' && soutNumber) {
                displayDoc = `Специальная оценка условий труда (карта № ${soutNumber})`;
            }
            if (doc === 'Оценка профессиональных рисков') {
                displayDoc = `Карта оценки профессиональных рисков для <u>${positionGenitive}</u>`;
            }
            html += `<li style="font-size:15px;color:#333;">${displayDoc}</li>`;
        });
        
        html += `
                    </ol>
                </div>
                
                <div style="margin-top:24px;padding-top:18px;border-top:2px solid #eee;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;text-align:center;">
                    <div>
                        <div style="border-bottom:1px solid #333;height:40px;"></div>
                        <p style="font-size:12px;color:#666;margin:4px 0 0 0;">Подпись сотрудника</p>
                    </div>
                    <div>
                        <div style="border-bottom:1px solid #333;height:40px;"></div>
                        <p style="font-size:12px;color:#666;margin:4px 0 0 0;">Дата</p>
                    </div>
                    <div>
                        <div style="border-bottom:1px solid #333;height:40px;"></div>
                        <p style="font-size:12px;color:#666;margin:4px 0 0 0;">Расшифровка подписи</p>
                    </div>
                </div>
                
                <div style="margin-top:16px;padding-top:12px;border-top:1px solid #eee;text-align:center;">
                    <p style="font-size:11px;color:#999;margin:0;">Документ сформирован автоматически в системе «ОхранаТруда.Про»</p>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        result.classList.remove('hidden');
    }
}

// ============================================================
// СПИСОК ТИПОВ СИЗ
// ============================================================
const PPE_TYPES = [
    'Одежда специальная защитная',
    'Средства защиты ног',
    'Средства защиты рук',
    'Средства защиты головы',
    'Средства защиты глаз и лица',
    'Средства защиты слуха',
    'Средства защиты органов дыхания',
    'Средства защиты от падения с высоты',
    'Средства защиты кожи',
    'Средства защиты комплексные'
];

// ============================================================
// МОДАЛЬНОЕ ОКНО СИЗ
// ============================================================
let currentPPEWorkplace = null;
let ppeItems = [];

function openPPEModal(wp) {
    if (!wp || !wp.position || wp.position.trim() === '') {
        alert('⚠️ Для этого рабочего места не указана должность.');
        return;
    }
    currentPPEWorkplace = wp;
    ppeItems = wp.ppeItems || [];
    
    const modal = document.getElementById('ppeModal');
    const loading = document.getElementById('ppeLoading');
    const content = document.getElementById('ppeContent');
    const error = document.getElementById('ppeError');
    const list = document.getElementById('ppeList');
    
    if (!modal) return;
    
    loading.style.display = 'none';
    content.style.display = 'block';
    error.style.display = 'none';
    modal.classList.remove('hidden');
    
    document.getElementById('ppeEmployeeName').textContent = wp.name || 'Сотрудник';
    document.getElementById('ppePosition').textContent = wp.position || 'Должность не указана';
    
    renderPPEList();
}

function renderPPEList() {
    const list = document.getElementById('ppeList');
    if (!list) return;
    
    const typeOptions = PPE_TYPES.map(t => {
        return `<option value="${t}" style="color:#fff;background:#1a1a3e;padding:8px;">${t}</option>`;
    }).join('');
    
    let html = `
        <div style="background:rgba(0,212,255,0.08);padding:10px 14px;border-radius:8px;margin-bottom:14px;border:1px solid rgba(0,212,255,0.15);">
            <span style="color:#8888aa;font-size:13px;">
                📋 Добавьте СИЗ для <strong style="color:#00d4ff;">"${currentPPEWorkplace.position}"</strong>
            </span>
            <span style="color:#4caf50;font-size:12px;margin-left:12px;">● ${ppeItems.length} добавлено</span>
        </div>
        
        <div style="margin-bottom:14px;background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06);">
            <div style="display:grid;grid-template-columns:1.4fr 2fr 0.8fr 0.8fr 1fr auto;gap:10px;align-items:end;">
                <div>
                    <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Тип СИЗ</label>
                    <select id="ppeTypeSelect" style="width:100%;padding:10px 12px;background:#1a1a3e;border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#fff;font-size:13px;cursor:pointer;min-width:180px;">
                        <option value="" selected disabled style="color:#888;background:#1a1a3e;">▼ Выберите тип...</option>
                        ${typeOptions}
                    </select>
                </div>
                <div>
                    <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Наименование</label>
                    <input type="text" id="ppeNameInput" placeholder="Костюм х/б" style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
                </div>
                <div>
                    <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Кол-во</label>
                    <input type="text" id="ppeCountInput" placeholder="1 шт." style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
                </div>
                <div>
                    <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Срок</label>
                    <input type="text" id="ppeTermInput" placeholder="12 мес" style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
                </div>
                <div>
                    <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Модель</label>
                    <input type="text" id="ppeModelInput" placeholder="Артикул" style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
                </div>
                <div>
                    <button onclick="addPPEItem()" style="padding:10px 20px;background:linear-gradient(135deg,#7c3aed,#00d4ff);border:none;border-radius:6px;color:#fff;font-weight:600;cursor:pointer;width:100%;font-size:14px;">➕ Добавить</button>
                </div>
            </div>
        </div>
    `;
    
    if (ppeItems.length === 0) {
        html += `<div style="text-align:center;padding:20px;color:#666;font-size:14px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px dashed rgba(255,255,255,0.06);">Нет добавленных СИЗ.</div>`;
    } else {
        html += `
            <div style="max-height:300px;overflow-y:auto;border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                    <thead style="position:sticky;top:0;background:#1a1a3e;z-index:2;">
                        <tr style="border-bottom:2px solid rgba(124,58,237,0.3);">
                            <th style="padding:8px 10px;color:#8888aa;text-align:left;">№</th>
                            <th style="padding:8px 10px;color:#8888aa;text-align:left;">Тип</th>
                            <th style="padding:8px 10px;color:#8888aa;text-align:left;">Наименование</th>
                            <th style="padding:8px 10px;color:#8888aa;text-align:left;">Кол-во</th>
                            <th style="padding:8px 10px;color:#8888aa;text-align:left;">Срок</th>
                            <th style="padding:8px 10px;color:#8888aa;text-align:left;">Модель</th>
                            <th style="width:40px;text-align:center;color:#8888aa;">✖</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        ppeItems.forEach((item, index) => {
            html += `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                    <td style="padding:8px 10px;color:#7c3aed;font-weight:600;">${index+1}</td>
                    <td style="padding:8px 10px;color:#7c3aed;">${item.type || '—'}</td>
                    <td style="padding:8px 10px;color:#fff;">${item.name || ''}</td>
                    <td style="padding:8px 10px;color:#4caf50;">${item.count || '—'}</td>
                    <td style="padding:8px 10px;color:#ffc107;">${item.term || '—'}</td>
                    <td style="padding:8px 10px;color:#b388ff;">${item.model || '—'}</td>
                    <td style="padding:8px 10px;text-align:center;">
                        <button onclick="removePPEItem(${index})" style="background:rgba(255,70,70,0.15);border:none;border-radius:4px;color:#ff6b6b;cursor:pointer;padding:2px 10px;">✖</button>
                    </td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
    }
    
    html += `
        <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:14px;">
            <button onclick="savePPEItems()" style="padding:10px 28px;background:linear-gradient(135deg,#4caf50,#2e7d32);border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">💾 Сохранить</button>
            <button onclick="exportPPE()" style="padding:10px 28px;background:linear-gradient(135deg,#7c3aed,#00d4ff);border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">📥 Экспорт PDF</button>
            <button onclick="closePPEModal()" style="padding:10px 28px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#aaa;cursor:pointer;">✖ Закрыть</button>
        </div>
    `;
    list.innerHTML = html;
}

function addPPEItem() {
    const type = document.getElementById('ppeTypeSelect').value;
    const name = document.getElementById('ppeNameInput').value.trim();
    const count = document.getElementById('ppeCountInput').value.trim();
    const term = document.getElementById('ppeTermInput').value.trim();
    const model = document.getElementById('ppeModelInput').value.trim();
    
    if (!name) { alert('❌ Введите наименование СИЗ!'); return; }
    if (!type || type === 'Выберите тип...') { alert('❌ Выберите тип СИЗ!'); return; }
    
    ppeItems.push({ type, name, count, term, model });
    document.getElementById('ppeNameInput').value = '';
    document.getElementById('ppeCountInput').value = '';
    document.getElementById('ppeTermInput').value = '';
    document.getElementById('ppeModelInput').value = '';
    document.getElementById('ppeTypeSelect').value = '';
    renderPPEList();
}

function removePPEItem(index) {
    ppeItems.splice(index, 1);
    renderPPEList();
}

function savePPEItems() {
    if (!currentPPEWorkplace) return;
    if (ppeItems.length === 0) { alert('⚠️ Добавьте хотя бы одно СИЗ!'); return; }
    currentPPEWorkplace.ppeItems = ppeItems;
    currentPPEWorkplace.hasPPE = true;
    currentPPEWorkplace.ppeSource = 'Введено вручную';
    saveMap();
    drawMap();
    alert(`✅ Сохранено ${ppeItems.length} СИЗ!`);
    closePPEModal();
}

function closePPEModal() {
    document.getElementById('ppeModal').classList.add('hidden');
    currentPPEWorkplace = null;
    ppeItems = [];
}

function exportPPE() {
    if (!currentPPEWorkplace) { alert('Нет данных'); return; }
    let ppeText = '';
    ppeItems.forEach((item, i) => {
        ppeText += `<div style="padding:8px 12px;margin:4px 0;background:#f5f5f5;border-radius:4px;border-left:3px solid #7c3aed;">
            <span style="font-weight:700;color:#7c3aed;">${i+1}.</span>
            <span><strong>${item.type}:</strong> ${item.name}</span>
            <span style="color:#4caf50;float:right;">${item.count || ''} ${item.term || ''}</span>
            ${item.model ? `<br><span style="color:#888;font-size:12px;margin-left:28px;">📦 ${item.model}</span>` : ''}
        </div>`;
    });
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>СИЗ</title><style>body{font-family:Arial;padding:40px;color:#333;max-width:900px;margin:0 auto;}h1{color:#1a1a3e;border-bottom:3px solid #7c3aed;padding-bottom:10px;}.header-info{background:#f5f5f5;padding:15px;border-radius:8px;margin:20px 0;}.footer{margin-top:30px;padding-top:15px;border-top:1px solid #ddd;font-size:12px;color:#888;text-align:center;}</style></head><body>
        <h1>🦺 Средства индивидуальной защиты</h1>
        <div class="header-info"><p><strong>Сотрудник:</strong> ${currentPPEWorkplace.name}</p><p><strong>Должность:</strong> ${currentPPEWorkplace.position}</p><p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p></div>
        <hr>${ppeText}<div class="footer"><p>Данные введены специалистом по ОТ</p></div>
        <script>window.print();<\/script></body></html>`);
    win.document.close();
}

// ============================================================
// КАРТОЧКИ СИЗ - ОСНОВНАЯ ФУНКЦИОНАЛЬНОСТЬ
// ============================================================
let selectedPPECardItems = [];

// ШАБЛОНЫ СИЗ
const PPE_CARD_TEMPLATES = [
    { name: 'Жилет сигнальный повышенной видимости' },
    { name: 'Перчатки для защиты от механических воздействий' },
    { name: 'Перчатки специальные диэлектрические' },
    { name: 'Галоши диэлектрические' },
    { name: 'Костюм для защиты от механических воздействий' },
    { name: 'Обувь специальная для защиты от механических воздействий' },
    { name: 'Каска защитная' },
    { name: 'Очки защитные' },
    { name: 'Респиратор' },
    { name: 'Наушники противошумные' },
    { name: 'Рукавицы комбинированные' },
    { name: 'Пояс предохранительный' }
];

function initPPECardsPage() {
    renderPPECardStaffList();
    renderPPECardPPEList();
    
    const generateBtn = document.getElementById('generatePPECardsBtn');
    if (generateBtn) {
        generateBtn.onclick = function() {
            console.log('🔄 Кнопка генерации нажата');
            generatePPECardsHTML();
        };
    }
}

function renderPPECardStaffList() {
    const container = document.getElementById('ppeCardStaffList');
    if (!container) return;
    const all = getAllEmployees();
    
    if (all.length === 0) {
        container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">Нет загруженных сотрудников. Сначала загрузите штатное расписание.</p>';
        return;
    }
    
    let html = '<div style="max-height:400px;overflow-y:auto;">';
    all.forEach((emp, idx) => {
        html += `
            <div class="employee-row">
                <input type="checkbox" class="ppe-card-staff-check" data-snils="${emp.snils}">
                <span class="emp-name" onclick="openEmployeeCardBySnils('${emp.snils}')">${emp.last_name} ${emp.first_name}</span>
                <span class="emp-position">${emp.position}</span>
                <span class="emp-snils">${formatSnils(emp.snils)}</span>
                ${emp.department ? `<span style="color:#8888aa;font-size:12px;margin-left:auto;">${emp.department}</span>` : '<span style="color:#666;font-size:12px;margin-left:auto;">Без службы</span>'}
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderPPECardPPEList() {
    const container = document.getElementById('ppeCardPPEList');
    if (!container) return;
    
    let html = '';
    PPE_CARD_TEMPLATES.forEach((ppe, idx) => {
        const checked = selectedPPECardItems.some(item => item.name === ppe.name) ? 'checked' : '';
        const existing = selectedPPECardItems.find(item => item.name === ppe.name);
        html += `
            <div class="ppe-item-select">
                <input type="checkbox" class="ppe-card-ppe-check" data-index="${idx}" ${checked}>
                <label>${ppe.name}</label>
                <input type="text" class="ppe-punkt-input" placeholder="п. ___" value="${existing?.punkt || ''}" style="width:80px;padding:4px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#fff;font-size:12px;">
                <input type="text" class="ppe-unit-input" placeholder="Штук, год" value="${existing?.unit || ''}" style="width:100px;padding:4px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#fff;font-size:12px;">
                <input type="text" class="ppe-quantity-input" placeholder="Кол-во" value="${existing?.quantity || ''}" style="width:70px;padding:4px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#fff;font-size:12px;">
            </div>
        `;
    });
    
    html += `
        <div style="width:100%;margin-top:8px;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:6px;border:1px dashed rgba(255,255,255,0.06);display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <input type="text" id="ppeCardCustomName" placeholder="Свое СИЗ (наименование)" style="flex:2;min-width:150px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
            <input type="text" id="ppeCardCustomPunkt" placeholder="Пункт норм" style="flex:1;min-width:80px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
            <input type="text" id="ppeCardCustomUnit" placeholder="Ед. изм." style="flex:1;min-width:80px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
            <input type="text" id="ppeCardCustomQuantity" placeholder="Кол-во" style="flex:1;min-width:70px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
            <button onclick="addCustomPPEToCardList()" style="padding:6px 16px;background:linear-gradient(135deg,#7c3aed,#00d4ff);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px;">➕ Добавить</button>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Обработчики
    document.querySelectorAll('.ppe-card-ppe-check').forEach(cb => {
        cb.addEventListener('change', function() {
            const idx = parseInt(this.dataset.index);
            const ppe = PPE_CARD_TEMPLATES[idx];
            const container = this.closest('.ppe-item-select');
            const punktInput = container.querySelector('.ppe-punkt-input');
            const unitInput = container.querySelector('.ppe-unit-input');
            const quantityInput = container.querySelector('.ppe-quantity-input');
            
            if (this.checked) {
                const existing = selectedPPECardItems.find(item => item.name === ppe.name);
                if (!existing) {
                    selectedPPECardItems.push({
                        name: ppe.name,
                        punkt: punktInput ? punktInput.value.trim() || 'п. ___' : 'п. ___',
                        unit: unitInput ? unitInput.value.trim() || 'Штук, год' : 'Штук, год',
                        quantity: quantityInput ? quantityInput.value.trim() || '1' : '1'
                    });
                }
            } else {
                selectedPPECardItems = selectedPPECardItems.filter(item => item.name !== ppe.name);
            }
            updatePPECardSelectionCount();
        });
    });
    
    document.querySelectorAll('.ppe-punkt-input, .ppe-unit-input, .ppe-quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const container = this.closest('.ppe-item-select');
            const cb = container.querySelector('.ppe-card-ppe-check');
            if (cb && cb.checked) {
                const idx = parseInt(cb.dataset.index);
                const ppe = PPE_CARD_TEMPLATES[idx];
                const punktInput = container.querySelector('.ppe-punkt-input');
                const unitInput = container.querySelector('.ppe-unit-input');
                const quantityInput = container.querySelector('.ppe-quantity-input');
                
                const existing = selectedPPECardItems.find(item => item.name === ppe.name);
                if (existing) {
                    existing.punkt = punktInput ? punktInput.value.trim() || 'п. ___' : 'п. ___';
                    existing.unit = unitInput ? unitInput.value.trim() || 'Штук, год' : 'Штук, год';
                    existing.quantity = quantityInput ? quantityInput.value.trim() || '1' : '1';
                }
            }
        });
    });
    
    updatePPECardSelectionCount();
}

function addCustomPPEToCardList() {
    const name = document.getElementById('ppeCardCustomName').value.trim();
    const punkt = document.getElementById('ppeCardCustomPunkt').value.trim() || 'п. ___';
    const unit = document.getElementById('ppeCardCustomUnit').value.trim() || 'Штук, год';
    const quantity = document.getElementById('ppeCardCustomQuantity').value.trim() || '1';
    
    if (!name) {
        alert('❌ Введите наименование СИЗ!');
        return;
    }
    
    if (!selectedPPECardItems.some(item => item.name === name)) {
        selectedPPECardItems.push({ name, punkt, unit, quantity });
    }
    
    document.getElementById('ppeCardCustomName').value = '';
    document.getElementById('ppeCardCustomPunkt').value = '';
    document.getElementById('ppeCardCustomUnit').value = '';
    document.getElementById('ppeCardCustomQuantity').value = '';
    
    renderPPECardPPEList();
    alert('✅ СИЗ добавлено в список');
}

function updatePPECardSelectionCount() {
    const header = document.querySelector('#ppeCardPPEList')?.previousElementSibling;
    if (header) {
        header.textContent = `🦺 Выберите СИЗ для выдачи (выбрано: ${selectedPPECardItems.length}):`;
    }
}

function addPPEToCardList() {
    document.getElementById('ppeCardCustomName').focus();
}

function getSelectedPPECardEmployees() {
    const checkboxes = document.querySelectorAll('.ppe-card-staff-check:checked');
    const all = getAllEmployees();
    const selected = [];
    checkboxes.forEach(cb => {
        const snils = cb.dataset.snils;
        const emp = all.find(e => e.snils === snils);
        if (emp) selected.push(emp);
    });
    return selected;
}

function clearPPECardSelection() {
    document.querySelectorAll('.ppe-card-staff-check').forEach(cb => cb.checked = false);
    document.querySelectorAll('.ppe-card-ppe-check').forEach(cb => cb.checked = false);
    selectedPPECardItems = [];
    renderPPECardPPEList();
    document.getElementById('ppeCardResult').classList.add('hidden');
    alert('✅ Выбор очищен');
}

// ============================================================
// ГЕНЕРАЦИЯ КАРТОЧЕК СИЗ - ПРАВИЛЬНАЯ ВЕРСИЯ (ГОРИЗОНТАЛЬНЫЙ РАЗРЕЗ)
// ============================================================
function generatePPECardsHTML() {
    console.log('🔄 generatePPECardsHTML вызвана');
    
    const employees = getSelectedPPECardEmployees();
    console.log('👤 Выбрано сотрудников:', employees.length);
    
    if (employees.length === 0) {
        alert('❌ Выберите хотя бы одного сотрудника!');
        return;
    }
    
    if (selectedPPECardItems.length === 0) {
        alert('❌ Выберите хотя бы одно СИЗ!');
        return;
    }
    
    const manager = document.getElementById('ppeCardManager').value.trim() || 'М.В. Чибисов';
    const managerPosition = document.getElementById('ppeCardManagerPosition').value.trim() || 'Начальник службы движения';
    const cardNumber = document.getElementById('ppeCardNumber').value.trim() || '___';
    const department = document.getElementById('ppeCardDepartment').value.trim() || '';
    const gender = document.getElementById('ppeCardGender').value || 'М';
    const height = document.getElementById('ppeCardHeight').value.trim() || '';
    const clothesSize = document.getElementById('ppeCardClothesSize').value.trim() || '';
    const shoeSize = document.getElementById('ppeCardShoeSize').value.trim() || '';
    
    const resultDiv = document.getElementById('ppeCardResult');
    const contentDiv = document.getElementById('ppeCardResultContent');
    
    // Разбиваем сотрудников на пары (по 2 на лист)
    let cardCount = 0;
    let totalPairs = Math.ceil(employees.length / 2);
    
    // Функция построения таблицы СИЗ для лицевой стороны
    function buildPPETable() {
        let rows = '';
        selectedPPECardItems.forEach((ppe, idx) => {
            rows += `
                <tr>
                    <td style="border:1px solid #000;padding:3px;font-size:9px;">${ppe.name}</td>
                    <td style="border:1px solid #000;padding:3px;font-size:9px;text-align:center;">${ppe.punkt}</td>
                    <td style="border:1px solid #000;padding:3px;font-size:9px;text-align:center;">${ppe.unit}</td>
                    <td style="border:1px solid #000;padding:3px;font-size:9px;text-align:center;">${ppe.quantity}</td>
                </tr>
            `;
        });
        return rows;
    }
    
    // Функция построения оборотной таблицы (10 строк)
    function buildReverseTable() {
        let rows = '';
        for (let r = 0; r < 10; r++) {
            rows += `
                <tr>
                    <td style="border:1px solid #000;padding:1px;height:16px;font-size:7px;"></td>
                    <td style="border:1px solid #000;padding:1px;height:16px;font-size:7px;"></td>
                    <td style="border:1px solid #000;padding:1px;height:16px;font-size:7px;"></td>
                    <td style="border:1px solid #000;padding:1px;height:16px;font-size:7px;"></td>
                    <td style="border:1px solid #000;padding:1px;height:16px;font-size:7px;"></td>
                    <td style="border:1px solid #000;padding:1px;height:16px;font-size:7px;"></td>
                    <td style="border:1px solid #000;padding:1px;height:16px;font-size:7px;"></td>
                    <td style="border:1px solid #000;padding:1px;height:16px;font-size:7px;"></td>
                    <td style="border:1px solid #000;padding:1px;height:16px;font-size:7px;"></td>
                    <td style="border:1px solid #000;padding:1px;height:16px;font-size:7px;"></td>
                </tr>
            `;
        }
        return rows;
    }
    
    // Функция создания ЛИЦЕВОЙ карточки для одного сотрудника
    function createFaceCard(emp, isLeft) {
        const borderStyle = isLeft ? 'border-right:1px dashed #999;padding-right:6px;' : 'padding-left:6px;';
        return `
            <div style="${borderStyle}">
                <!-- ШАПКА -->
                <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:3px;margin-bottom:4px;">
                    <div style="font-size:12px;font-weight:bold;">ЛИЧНАЯ КАРТОЧКА N ${cardNumber}</div>
                    <div style="font-size:12px;font-weight:bold;">учета выдачи СИЗ</div>
                </div>
                
                <!-- ИНФОРМАЦИЯ О СОТРУДНИКЕ -->
                <table style="width:100%;border-collapse:collapse;font-size:8px;margin-bottom:3px;">
                    <tr>
                        <td style="width:55%;vertical-align:top;padding:1px;border:1px solid #000;">
                            <div><strong>Фамилия</strong> ${emp.last_name}</div>
                            <div><strong>Имя</strong> ${emp.first_name}</div>
                            <div><strong>Отчество</strong> ${emp.middle_name || ''}</div>
                            <div><strong>Табельный номер</strong> ________</div>
                            <div><strong>Структурное подразделение</strong> ${department}</div>
                            <div><strong>Профессия (должность)</strong> ${emp.position}</div>
                            <div><strong>Дата поступления на работу</strong> __________</div>
                            <div><strong>Дата изменения профессии (должности) или перевода</strong> __________</div>
                        </td>
                        <td style="width:45%;vertical-align:top;padding:1px;border:1px solid #000;">
                            <div><strong>Пол</strong> ${gender}</div>
                            <div><strong>Рост</strong> ${height}</div>
                            <div style="margin-top:2px;"><strong>Размер:</strong></div>
                            <div style="padding-left:6px;"><strong>одежды</strong> ${clothesSize}</div>
                            <div style="padding-left:6px;"><strong>обуви</strong> ${shoeSize}</div>
                            <div style="padding-left:6px;"><strong>головного убора</strong> ___</div>
                            <div><strong>СИЗОД</strong> ___</div>
                            <div><strong>СИЗ рук</strong> ___________</div>
                        </td>
                    </tr>
                </table>
                
                <!-- ТАБЛИЦА СИЗ -->
                <table style="width:100%;border-collapse:collapse;font-size:8px;border:1px solid #000;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000;padding:2px;text-align:center;width:32%;font-size:8px;">Наименование СИЗ</th>
                            <th style="border:1px solid #000;padding:2px;text-align:center;width:22%;font-size:8px;">Пункт Норм</th>
                            <th style="border:1px solid #000;padding:2px;text-align:center;width:26%;font-size:8px;">Единица измерения, периодичность выдачи</th>
                            <th style="border:1px solid #000;padding:2px;text-align:center;width:20%;font-size:8px;">Количество на период</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${buildPPETable()}
                    </tbody>
                </table>
                
                <!-- ПОДПИСЬ -->
                <div style="margin-top:4px;font-size:9px;">
                    <div>${managerPosition} __________ ${manager}</div>
                    <div style="font-size:7px;">(подпись) (фамилия, инициалы)</div>
                </div>
            </div>
        `;
    }
    
    // Функция создания ОБОРОТНОЙ карточки для одного сотрудника
    function createReverseCard(emp, isLeft) {
        const borderStyle = isLeft ? 'border-right:1px dashed #999;padding-right:6px;' : 'padding-left:6px;';
        return `
            <div style="${borderStyle}">
                <div style="font-weight:bold;font-size:10px;text-align:center;margin-bottom:2px;">Данные о выдаче СИЗ</div>
                <div style="font-size:8px;text-align:center;margin-bottom:2px;color:#666;">${emp.last_name} ${emp.first_name}</div>
                
                <!-- ОБОРОТНАЯ ТАБЛИЦА с колонками 1-10 -->
                <table style="width:100%;border-collapse:collapse;font-size:6px;border:1px solid #000;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000;padding:1px;text-align:center;width:10%;">Наименование СИЗ</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;width:12%;">Модель, марка, артикул</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;width:8%;">дата</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;width:8%;">кол-во</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;width:10%;">Лично/дозатор</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;width:10%;">подпись</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;width:8%;">дата</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;width:8%;">кол-во</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;width:10%;">Подпись</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;width:8%;">Акт</th>
                        </tr>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000;padding:1px;text-align:center;font-size:5px;">1</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;font-size:5px;">2</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;font-size:5px;">3</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;font-size:5px;">4</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;font-size:5px;">5</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;font-size:5px;">6</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;font-size:5px;">7</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;font-size:5px;">8</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;font-size:5px;">9</th>
                            <th style="border:1px solid #000;padding:1px;text-align:center;font-size:5px;">10</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${buildReverseTable()}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    let allPagesHTML = '';
    let pairNum = 0;
    
    // Группируем сотрудников по парам
    for (let i = 0; i < employees.length; i += 2) {
        const emp1 = employees[i];
        const emp2 = employees[i + 1] || null;
        pairNum++;
        cardCount += emp2 ? 2 : 1;
        
        // ============================================================
        // ЛИСТ 1 - ЛИЦЕВЫЕ СТОРОНЫ (сотрудник А слева, сотрудник Б справа)
        // ============================================================
        let facePageHTML = `
        <div style="page-break-after:always;padding:8px;font-family:'Times New Roman',Times,serif;max-width:1000px;margin:0 auto;background:#fff;color:#000;border:1px solid #999;border-radius:2px;min-height:100vh;display:flex;flex-direction:column;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;flex:1;">
                ${createFaceCard(emp1, true)}
                ${emp2 ? createFaceCard(emp2, false) : `<div style="display:flex;align-items:center;justify-content:center;color:#ccc;font-size:16px;border:1px dashed #ddd;padding-left:6px;">Пустая карточка</div>`}
            </div>
            <!-- Линия разреза по горизонтали (посередине) -->
            <div style="border-top:2px dashed #ff0000;margin:4px 0;text-align:center;font-size:8px;color:#ff0000;">✂️ ЛИНИЯ РАЗРЕЗА</div>
        </div>
        `;
        
        // ============================================================
        // ЛИСТ 2 - ОБОРОТНЫЕ СТОРОНЫ (сотрудник А слева, сотрудник Б справа)
        // ============================================================
        let reversePageHTML = `
        <div style="page-break-after:always;padding:8px;font-family:'Times New Roman',Times,serif;max-width:1000px;margin:0 auto;background:#fff;color:#000;border:1px solid #999;border-radius:2px;min-height:100vh;display:flex;flex-direction:column;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;flex:1;">
                ${createReverseCard(emp1, true)}
                ${emp2 ? createReverseCard(emp2, false) : `<div style="display:flex;align-items:center;justify-content:center;color:#ccc;font-size:16px;border:1px dashed #ddd;padding-left:6px;">Пустая оборотная сторона</div>`}
            </div>
            <!-- Линия разреза по горизонтали (посередине) -->
            <div style="border-top:2px dashed #ff0000;margin:4px 0;text-align:center;font-size:8px;color:#ff0000;">✂️ ЛИНИЯ РАЗРЕЗА</div>
        </div>
        `;
        
        allPagesHTML += facePageHTML + reversePageHTML;
    }
    
    // Открываем в новой вкладке
    const win = window.open('', '_blank');
    if (!win) {
        alert('❌ Браузер заблокировал открытие нового окна. Разрешите всплывающие окна для этого сайта.');
        return;
    }
    
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Карточки учета СИЗ</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    background: #f0f0f0; 
                    padding: 10px; 
                    margin: 0;
                }
                @page {
                    size: A4;
                    margin: 5mm 5mm 5mm 5mm;
                }
                @media print {
                    body { background: #fff; padding: 0; margin: 0; }
                    .no-print { display: none; }
                    div[style*="page-break-after:always"] { 
                        page-break-after: always; 
                    }
                    .no-print { display: none !important; }
                }
                .no-print {
                    text-align: center;
                    padding: 15px;
                    background: #fff;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    border-bottom: 2px solid #7c3aed;
                }
                .no-print button {
                    padding: 8px 24px;
                    margin: 0 8px;
                    background: linear-gradient(135deg, #7c3aed, #00d4ff);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .no-print button:hover {
                    transform: scale(1.02);
                }
                .no-print .btn-secondary {
                    background: #666;
                }
                @media print {
                    .no-print { display: none !important; }
                }
                /* Скрываем красную линию разреза при печати */
                @media print {
                    div[style*="border-top:2px dashed #ff0000"] {
                        border-top: 1px dashed #ccc !important;
                        color: #ccc !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="no-print">
                <h3>🖨️ Карточки готовы к печати (${cardCount} сотрудников, ${totalPairs} пар)</h3>
                <button onclick="window.print()">🖨️ Печать</button>
                <button class="btn-secondary" onclick="window.close()">✖ Закрыть</button>
                <p style="font-size:11px;color:#666;margin-top:4px;">
                    📄 Для каждой пары сотрудников: 1 лист с лицевыми сторонами + 1 лист с оборотными сторонами
                </p>
                <p style="font-size:10px;color:#888;">
                    ✂️ Разрез по горизонтали (посередине листа)
                </p>
                <p style="font-size:10px;color:#888;">
                    📋 Всего листов: ${totalPairs * 2}
                </p>
            </div>
            ${allPagesHTML}
            <script>
                setTimeout(() => window.print(), 1500);
            <\/script>
        </body>
        </html>
    `);
    win.document.close();
    
    resultDiv.classList.remove('hidden');
    contentDiv.innerHTML = `
        <p>✅ Создано карточек: <strong>${cardCount}</strong></p>
        <p>📋 Сотрудники: ${employees.map(e => `${e.last_name} ${e.first_name}`).join(', ')}</p>
        <p>🦺 СИЗ: ${selectedPPECardItems.map(e => e.name).join(', ')}</p>
        <p style="color:#8888aa;font-size:13px;margin-top:8px;">🖨️ Откроется новое окно для печати.</p>
        <p style="color:#8888aa;font-size:12px;">📄 Всего листов: ${totalPairs * 2} (${totalPairs} лицевых + ${totalPairs} оборотных)</p>
        <p style="color:#8888aa;font-size:12px;">✂️ Разрез по горизонтали (посередине листа)</p>
    `;
}
// ============================================================
// КАЛЕНДАРЬ
// ============================================================
let currentDate = new Date();
let selectedDate = null;

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const title = document.getElementById('calendarMonthTitle');
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    title.textContent = `${months[month]} ${year}`;
    
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = `
        <div class="weekday">Пн</div><div class="weekday">Вт</div><div class="weekday">Ср</div>
        <div class="weekday">Чт</div><div class="weekday">Пт</div><div class="weekday">Сб</div><div class="weekday">Вс</div>
    `;
    
    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay();
    if (startDay === 0) startDay = 7;
    startDay = startDay - 1;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const events = getEvents();
    
    for (let i = startDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.innerHTML = `<span class="day-number">${day}</span>`;
        if (dayEvents.length > 0) {
            dayDiv.innerHTML += `<div class="day-events">${dayEvents.slice(0, 2).map(e => 
                `<span class="event-text ${getEventStatus(e)}">${e.title}</span>`
            ).join('')}</div>`;
        }
        dayDiv.onclick = () => selectDay(dateStr);
        grid.appendChild(dayDiv);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        if (dateStr === todayStr) dayDiv.classList.add('today');
        dayDiv.innerHTML = `<span class="day-number">${day}</span>`;
        if (dayEvents.length > 0) {
            dayDiv.innerHTML += `<div class="day-events">${dayEvents.slice(0, 2).map(e => 
                `<span class="event-text ${getEventStatus(e)}">${e.title}</span>`
            ).join('')}</div>`;
            if (dayEvents.length > 2) {
                dayDiv.innerHTML += `<span style="font-size:9px;color:#8888aa;">+${dayEvents.length - 2} еще</span>`;
            }
        }
        dayDiv.onclick = () => selectDay(dateStr);
        grid.appendChild(dayDiv);
    }
    
    const totalDays = startDay + daysInMonth;
    const remaining = 42 - totalDays;
    for (let day = 1; day <= remaining; day++) {
        const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.innerHTML = `<span class="day-number">${day}</span>`;
        if (dayEvents.length > 0) {
            dayDiv.innerHTML += `<div class="day-events">${dayEvents.slice(0, 2).map(e => 
                `<span class="event-text ${getEventStatus(e)}">${e.title}</span>`
            ).join('')}</div>`;
        }
        dayDiv.onclick = () => selectDay(dateStr);
        grid.appendChild(dayDiv);
    }
    
    if (selectedDate) {
        selectDay(selectedDate);
    }
    
    const newEventDate = document.getElementById('newEventDate');
    if (newEventDate) {
        newEventDate.value = todayStr;
    }
}

function getEventStatus(event) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (event.date < todayStr) return 'overdue';
    if (event.date === todayStr) return 'today-event';
    if (event.done) return 'done';
    return 'upcoming';
}

function selectDay(dateStr) {
    selectedDate = dateStr;
    const events = getEvents();
    const dayEvents = events.filter(e => e.date === dateStr);
    const sidebar = document.getElementById('selectedDayEvents');
    
    if (dayEvents.length === 0) {
        sidebar.innerHTML = `<p style="color:#666;font-size:13px;">Нет событий на ${dateStr}</p>`;
        return;
    }
    
    const dateObj = new Date(dateStr);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    
    let html = `<p style="color:#ccc;font-size:13px;margin-bottom:8px;"><strong>${formattedDate}</strong></p>`;
    dayEvents.forEach((event, index) => {
        const statusClass = getEventStatus(event);
        const statusLabel = {
            'overdue': '🔴 Просрочено',
            'today-event': '🟡 Сегодня',
            'upcoming': '🟢 Предстоит',
            'done': '✅ Выполнено'
        };
        html += `
            <div class="event-item">
                <div>
                    <span class="event-title">${event.title}</span>
                    <span class="event-type">${event.type || 'Событие'}</span>
                    <span style="font-size:10px;color:#8888aa;margin-left:8px;">${statusLabel[statusClass] || ''}</span>
                </div>
                <button class="event-delete" onclick="deleteEvent(${index}, '${dateStr}')">✖</button>
            </div>
        `;
    });
    sidebar.innerHTML = html;
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function addEvent() {
    const titleInput = document.getElementById('newEventTitle');
    const typeSelect = document.getElementById('newEventType');
    const dateInput = document.getElementById('newEventDate');
    
    const title = titleInput.value.trim();
    const type = typeSelect.value;
    const date = dateInput.value;
    
    if (!title) {
        alert('❌ Введите название события!');
        titleInput.focus();
        return;
    }
    if (!date) {
        alert('❌ Выберите дату!');
        dateInput.focus();
        return;
    }
    
    const events = getEvents();
    events.push({
        id: Date.now(),
        title: title,
        type: type,
        date: date,
        done: false,
        createdAt: new Date().toISOString()
    });
    saveEvents(events);
    
    titleInput.value = '';
    renderCalendar();
    selectDay(date);
    alert('✅ Событие добавлено!');
}

function deleteEvent(index, dateStr) {
    if (!confirm('Удалить это событие?')) return;
    const events = getEvents();
    const filtered = events.filter((e, i) => {
        if (i === index && e.date === dateStr) return false;
        return true;
    });
    saveEvents(filtered);
    renderCalendar();
    selectDay(dateStr);
}

function markTrainingFromProtocol() {
    const protocol = getProtocol();
    if (protocol.length === 0) {
        alert('❌ В протоколе нет сотрудников!');
        return;
    }
    
    if (!confirm(`📅 Отметить в календаре обучение для ${protocol.length} сотрудников?`)) return;
    
    const all = getAllEmployees();
    const today = new Date().toISOString().split('T')[0];
    let updated = 0;
    
    protocol.forEach(empFromProtocol => {
        const found = all.find(e => e.snils === empFromProtocol.snils);
        if (found) {
            const data = getStaffData();
            for (const [dept, deptData] of Object.entries(data.departments)) {
                const idx = deptData.employees.findIndex(e => e.snils === empFromProtocol.snils);
                if (idx !== -1) {
                    deptData.employees[idx].trainingDate = today;
                    updated++;
                    saveStaffData(data);
                    break;
                }
            }
            if (!updated) {
                const idx = data.unassigned.findIndex(e => e.snils === empFromProtocol.snils);
                if (idx !== -1) {
                    data.unassigned[idx].trainingDate = today;
                    updated++;
                    saveStaffData(data);
                }
            }
        }
    });
    
    renderStaffWithDepartments();
    
    const events = getEvents();
    const existing = events.filter(e => e.date === today && e.title.includes('Обучение'));
    if (existing.length === 0 && updated > 0) {
        events.push({
            id: Date.now(),
            title: `Обучение ${updated} сотрудников`,
            type: 'Обучение',
            date: today,
            done: false,
            createdAt: new Date().toISOString()
        });
        saveEvents(events);
    }
    
    alert(`✅ Обновлено ${updated} сотрудников! Дата обучения: ${today}`);
}

// ============================================================
// ПЕРСОНАЛЬНАЯ КАРТОЧКА СОТРУДНИКА
// ============================================================
function openEmployeeCardBySnils(snils) {
    const all = getAllEmployees();
    const emp = all.find(e => e.snils === snils);
    if (!emp) {
        alert('❌ Сотрудник не найден');
        return;
    }
    openEmployeeCard(emp);
}

function openEmployeeCard(emp) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'employeeModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:550px;">
            <div class="modal-header">
                <h3>👤 ${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✖</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label style="color:#ccc;">Должность</label>
                    <input type="text" value="${emp.position}" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;" readonly>
                </div>
                <div class="form-group">
                    <label style="color:#ccc;">📅 Дата последнего инструктажа</label>
                    <input type="date" id="empInstructionDate" value="${emp.instructionDate || ''}" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                </div>
                <div class="form-group">
                    <label style="color:#ccc;">📅 Дата обучения</label>
                    <input type="date" id="empTrainingDate" value="${emp.trainingDate || ''}" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                </div>
                <div class="form-group">
                    <label style="color:#ccc;">🦺 СИЗ</label>
                    <div style="max-height:150px;overflow-y:auto;background:rgba(255,255,255,0.03);border-radius:6px;padding:8px;">
                        ${emp.ppeItems && emp.ppeItems.length > 0 ? emp.ppeItems.map((item, i) => 
                            `<div style="padding:6px 10px;background:rgba(76,175,80,0.1);border-radius:4px;margin-bottom:4px;color:#ccc;font-size:13px;">✅ ${item.name} (${item.type})</div>`
                        ).join('') : '<div style="color:#666;font-size:13px;">Нет добавленных СИЗ</div>'}
                    </div>
                    <button onclick="openPPEModalForEmployee('${emp.snils}')" style="margin-top:8px;padding:6px 16px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3);border-radius:6px;color:#b388ff;cursor:pointer;font-size:13px;">➕ Добавить СИЗ</button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="this.closest('.modal-overlay').remove()">Закрыть</button>
                <button class="btn-primary" onclick="saveEmployeeDataFromModal('${emp.snils}')" style="width:auto;padding:10px 24px;">💾 Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveEmployeeDataFromModal(snils) {
    const data = getStaffData();
    let emp = null;
    
    for (const [dept, deptData] of Object.entries(data.departments)) {
        const idx = deptData.employees.findIndex(e => e.snils === snils);
        if (idx !== -1) {
            emp = deptData.employees[idx];
            const instructionDate = document.getElementById('empInstructionDate')?.value || '';
            const trainingDate = document.getElementById('empTrainingDate')?.value || '';
            emp.instructionDate = instructionDate;
            emp.trainingDate = trainingDate;
            saveStaffData(data);
            renderStaffWithDepartments();
            document.getElementById('employeeModal')?.remove();
            alert('✅ Данные сохранены!');
            return;
        }
    }
    
    const idx = data.unassigned.findIndex(e => e.snils === snils);
    if (idx !== -1) {
        emp = data.unassigned[idx];
        const instructionDate = document.getElementById('empInstructionDate')?.value || '';
        const trainingDate = document.getElementById('empTrainingDate')?.value || '';
        emp.instructionDate = instructionDate;
        emp.trainingDate = trainingDate;
        saveStaffData(data);
        renderStaffWithDepartments();
        document.getElementById('employeeModal')?.remove();
        alert('✅ Данные сохранены!');
    }
}

function openPPEModalForEmployee(snils) {
    const data = getStaffData();
    let emp = null;
    
    for (const [dept, deptData] of Object.entries(data.departments)) {
        const found = deptData.employees.find(e => e.snils === snils);
        if (found) { emp = found; break; }
    }
    if (!emp) {
        emp = data.unassigned.find(e => e.snils === snils);
    }
    if (!emp) { alert('❌ Сотрудник не найден'); return; }
    
    const tempWorkplace = {
        name: `${emp.last_name} ${emp.first_name}`,
        position: emp.position,
        ppeItems: emp.ppeItems || []
    };
    
    currentPPEWorkplace = tempWorkplace;
    ppeItems = tempWorkplace.ppeItems || [];
    openPPEModal(tempWorkplace);
    
    const originalSave = savePPEItems;
    savePPEItems = function() {
        if (!currentPPEWorkplace) return;
        if (ppeItems.length === 0) { alert('⚠️ Добавьте хотя бы одно СИЗ!'); return; }
        
        const data = getStaffData();
        let target = null;
        for (const [dept, deptData] of Object.entries(data.departments)) {
            const found = deptData.employees.find(e => e.snils === snils);
            if (found) { target = found; break; }
        }
        if (!target) {
            target = data.unassigned.find(e => e.snils === snils);
        }
        if (target) {
            target.ppeItems = ppeItems;
            saveStaffData(data);
        }
        currentPPEWorkplace.ppeItems = ppeItems;
        currentPPEWorkplace.hasPPE = true;
        alert(`✅ Сохранено ${ppeItems.length} СИЗ!`);
        closePPEModal();
        savePPEItems = originalSave;
        renderStaffWithDepartments();
    };
}

// ============================================================
// КАРТА (сокращённая версия)
// ============================================================
let mapData = {
    workshops: [],
    currentWorkshop: 0,
    evacuationPoints: [],
    fireExtinguishers: [],
    evacuationRoutes: []
};
let mapMode = 'view';
let mapInited = false;
let tempObjectPos = null;
let tempObjectType = null;
let isDragging = false;
let dragTarget = null;
let dragTargetType = null;
let dragOffsetX = 0, dragOffsetY = 0;
let isResizing = false;
let resizeCorner = '';
let resizeStartX = 0, resizeStartY = 0;
let resizeStartW = 0, resizeStartH = 0;
let resizeStartXpos = 0, resizeStartYpos = 0;
let selectedObjectIndex = -1;
let selectedObjectType = null;
let tempRoutePoints = [];

function initMapPage() {
    console.log('🗺️ Карта инициализируется');
    if (mapInited) return;
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) { console.error('Canvas не найден!'); return; }
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
                if (!mapData.fireExtinguishers) mapData.fireExtinguishers = [];
                if (!mapData.evacuationRoutes) mapData.evacuationRoutes = [];
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
        mapData.fireExtinguishers = [];
        mapData.evacuationRoutes = [];
    }
    
    setupMapButtons();
    setupCanvasEvents();
    updateWorkshopSelect();
    updateInfo();
    drawMap();
    console.log('✅ Карта готова');
}

function setupMapButtons() {
    const editBtn = document.getElementById('editWorkshopBtn');
    if (editBtn) editBtn.onclick = openWorkshopModal;
    
    const addWorkerBtn = document.getElementById('addWorkerPlaceBtn');
    if (addWorkerBtn) addWorkerBtn.onclick = function() {
        if (!getCurrentWorkshop()) { alert('Сначала создайте участок'); return; }
        mapMode = 'addWorkplace';
        document.getElementById('mapMode').textContent = 'Кликните на карту для добавления рабочего места';
        document.getElementById('mapMode').style.color = '#ff6b6b';
        document.getElementById('mapCanvas').style.cursor = 'crosshair';
    };
    
    const addEvacBtn = document.getElementById('addEvacuationBtn');
    if (addEvacBtn) addEvacBtn.onclick = function() {
        if (!getCurrentWorkshop()) { alert('Сначала создайте участок'); return; }
        mapMode = 'addEvacuation';
        document.getElementById('mapMode').textContent = 'Кликните на карту для добавления выхода';
        document.getElementById('mapMode').style.color = '#4caf50';
        document.getElementById('mapCanvas').style.cursor = 'crosshair';
    };
    
    const addFeBtn = document.getElementById('addFireExtinguisherBtn');
    if (addFeBtn) addFeBtn.onclick = function() {
        if (!getCurrentWorkshop()) { alert('Сначала создайте участок'); return; }
        mapMode = 'addFireExtinguisher';
        document.getElementById('mapMode').textContent = 'Кликните на карту для добавления огнетушителя';
        document.getElementById('mapMode').style.color = '#ff1744';
        document.getElementById('mapCanvas').style.cursor = 'crosshair';
    };
    
    const addRouteBtn = document.getElementById('addEvacuationRouteBtn');
    if (addRouteBtn) addRouteBtn.onclick = function() {
        if (!getCurrentWorkshop()) { alert('Сначала создайте участок'); return; }
        mapMode = 'addEvacuationRoute';
        tempRoutePoints = [];
        document.getElementById('mapMode').textContent = 'Кликните точки маршрута эвакуации';
        document.getElementById('mapMode').style.color = '#ffc107';
        document.getElementById('mapCanvas').style.cursor = 'crosshair';
    };
    
    const saveBtn = document.getElementById('saveMapBtn');
    if (saveBtn) saveBtn.onclick = function() { saveMap(); alert('✅ Карта сохранена!'); };
    
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (deleteBtn) deleteBtn.onclick = deleteSelectedObject;
    
    const clearBtn = document.querySelector('.btn-add[onclick="clearMap()"]');
    if (clearBtn) clearBtn.onclick = clearMap;
    
    const workshopSelect = document.getElementById('workshopSelect');
    if (workshopSelect) workshopSelect.onchange = function() {
        mapData.currentWorkshop = parseInt(this.value);
        updateInfo();
        drawMap();
        saveMap();
    };
    
    const saveWorkshopBtn = document.getElementById('saveWorkshopBtn');
    if (saveWorkshopBtn) saveWorkshopBtn.onclick = saveWorkshop;
    
    const saveWorkplaceBtn = document.getElementById('saveWorkplaceBtn');
    if (saveWorkplaceBtn) saveWorkplaceBtn.onclick = saveWorkplace;
    
    const saveFeBtn = document.getElementById('saveFireExtinguisherBtn');
    if (saveFeBtn) saveFeBtn.onclick = saveFireExtinguisher;
    
    const feDateInput = document.getElementById('feDateInput');
    if (feDateInput) {
        feDateInput.onchange = function() {
            const nextDateInput = document.getElementById('feNextDateInput');
            const typeSelect = document.getElementById('feTypeSelect');
            if (nextDateInput && this.value && typeSelect) {
                const date = new Date(this.value);
                const type = typeSelect.value;
                let years = 5;
                if (type === 'ОУ') years = 10;
                else if (type === 'ОВ') years = 1;
                else if (type === 'ОХ') years = 10;
                else if (type === 'ОПУ') years = 5;
                date.setFullYear(date.getFullYear() + years);
                nextDateInput.value = date.toISOString().split('T')[0];
                document.getElementById('feNextLabel').textContent = `✅ Перезарядка через ${years} лет (${date.toISOString().split('T')[0]})`;
            }
        };
    }
    
    const feTypeSelect = document.getElementById('feTypeSelect');
    if (feTypeSelect) {
        feTypeSelect.onchange = function() {
            const dateInput = document.getElementById('feDateInput');
            if (dateInput && dateInput.value) {
                dateInput.dispatchEvent(new Event('change'));
            }
        };
    }
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
    document.getElementById('workshopSize').textContent = ws ? ws.name : 'не задан';
    document.getElementById('workerCount').textContent = ws ? ws.workplaces.length : 0;
    document.getElementById('evacuationCount').textContent = mapData.evacuationPoints ? mapData.evacuationPoints.length : 0;
    document.getElementById('fireExtinguisherCount').textContent = mapData.fireExtinguishers ? mapData.fireExtinguishers.length : 0;
}

function getCanvasCoords(e) {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function drawMap() {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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
    
    ctx.fillStyle = 'rgba(74,158,255,0.05)';
    ctx.fillRect(ws.x, ws.y, ws.w, ws.h);
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5,5]);
    ctx.strokeRect(ws.x, ws.y, ws.w, ws.h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(74,158,255,0.6)';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🏭 ${ws.name} (${ws.length}×${ws.width} м)`, ws.x + ws.w/2, ws.y + 55);
    
    const cornerSize = 20;
    [[ws.x, ws.y], [ws.x+ws.w, ws.y], [ws.x, ws.y+ws.h], [ws.x+ws.w, ws.y+ws.h]].forEach(([cx, cy]) => {
        ctx.fillStyle = 'rgba(74,158,255,0.9)';
        ctx.fillRect(cx - cornerSize/2, cy - cornerSize/2, cornerSize, cornerSize);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - cornerSize/2, cy - cornerSize/2, cornerSize, cornerSize);
    });
    
    if (mapData.evacuationRoutes) {
        mapData.evacuationRoutes.forEach(route => {
            if (route.points && route.points.length >= 2) {
                ctx.beginPath();
                ctx.moveTo(route.points[0].x, route.points[0].y);
                for (let i = 1; i < route.points.length; i++) {
                    ctx.lineTo(route.points[i].x, route.points[i].y);
                }
                ctx.strokeStyle = '#4caf50';
                ctx.lineWidth = 4;
                ctx.setLineDash([10,6]);
                ctx.shadowColor = 'rgba(76,175,80,0.3)';
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.setLineDash([]);
                const last = route.points[route.points.length-1];
                const prev = route.points[route.points.length-2];
                const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
                ctx.fillStyle = '#4caf50';
                ctx.beginPath();
                ctx.moveTo(last.x, last.y);
                ctx.lineTo(last.x - 18*Math.cos(angle-0.5), last.y - 18*Math.sin(angle-0.5));
                ctx.lineTo(last.x - 18*Math.cos(angle+0.5), last.y - 18*Math.sin(angle+0.5));
                ctx.closePath();
                ctx.fill();
                if (route.name) {
                    const midX = (route.points[0].x + route.points[route.points.length-1].x) / 2;
                    const midY = (route.points[0].y + route.points[route.points.length-1].y) / 2 - 20;
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.fillRect(midX - 80, midY - 14, 160, 28);
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 15px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(route.name, midX, midY);
                    ctx.textBaseline = 'alphabetic';
                }
            }
        });
    }
    
    if (mapData.fireExtinguishers) {
        mapData.fireExtinguishers.forEach(fe => {
            const x = fe.x - 22, y = fe.y - 32;
            ctx.shadowColor = 'rgba(255,23,68,0.4)';
            ctx.shadowBlur = 25;
            ctx.fillStyle = '#ff1744';
            ctx.fillRect(x+4, y+6, 36, 44);
            ctx.fillRect(x+10, y, 24, 12);
            ctx.fillStyle = '#b71c1c';
            ctx.fillRect(x+16, y-6, 12, 10);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('ОГНЕТ', x+22, y+26);
            ctx.fillText('УШИТЕЛЬ', x+22, y+38);
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(fe.model || 'ОП-5', x+22, y+58);
        });
    }
    
    if (mapData.evacuationPoints) {
        mapData.evacuationPoints.forEach(ep => {
            const ew = 120, eh = 60;
            const ex = ep.x - ew/2, ey = ep.y - eh/2;
            ctx.fillStyle = '#2e7d32';
            ctx.shadowColor = 'rgba(46,125,50,0.4)';
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
            if (ep.name) {
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(ep.name, ep.x, ep.y + 35);
            }
        });
    }
    
    if (ws.workplaces) {
        ws.workplaces.forEach(wp => {
            const zone = wp.zone || 60;
            const x = wp.x - zone/2, y = wp.y - zone/2;
            ctx.fillStyle = 'rgba(255,193,7,0.25)';
            ctx.fillRect(x, y, zone, zone);
            ctx.strokeStyle = 'rgba(255,193,7,0.7)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, zone, zone);
            const color = wp.hasPPE ? '#4caf50' : '#ff6b6b';
            ctx.fillStyle = color;
            ctx.shadowColor = `${color}40`;
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(wp.x, wp.y - 36, 30, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillRect(wp.x - 22, wp.y - 12, 44, 52);
            ctx.fillRect(wp.x - 36, wp.y + 36, 20, 32);
            ctx.fillRect(wp.x + 16, wp.y + 36, 20, 32);
            ctx.fillRect(wp.x - 44, wp.y + 4, 16, 28);
            ctx.fillRect(wp.x + 28, wp.y + 4, 16, 28);
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(wp.name.substring(0,20), wp.x, wp.y + 120);
            if (wp.position) {
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '14px sans-serif';
                ctx.fillText(wp.position.substring(0,25), wp.x, wp.y + 156);
            }
            if (wp.hasPPE) {
                ctx.font = '22px sans-serif';
                ctx.fillText('🦺', wp.x + 80, wp.y - 56);
            }
        });
    }
}

function setupCanvasEvents() {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    
    canvas.addEventListener('click', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        if (coords.x < ws.x || coords.x > ws.x + ws.w || coords.y < ws.y || coords.y > ws.y + ws.h) {
            if (mapMode === 'view') {
                selectedObjectIndex = -1;
                selectedObjectType = null;
                drawMap();
            }
            return;
        }
        
        if (mapMode === 'addWorkplace') {
            openWorkplaceModal(coords.x, coords.y);
            return;
        }
        if (mapMode === 'addEvacuation') {
            const name = prompt('Название выхода:', 'Выход ' + ((mapData.evacuationPoints?.length || 0) + 1));
            if (name !== null) {
                if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
                mapData.evacuationPoints.push({ x: coords.x, y: coords.y, name: name.trim() || 'Выход', id: Date.now() });
                updateInfo(); drawMap(); saveMap();
                mapMode = 'view';
                document.getElementById('mapMode').textContent = 'Просмотр';
                document.getElementById('mapMode').style.color = '#00d4ff';
                canvas.style.cursor = 'default';
            }
            return;
        }
        if (mapMode === 'addFireExtinguisher') {
            tempObjectPos = { x: coords.x, y: coords.y };
            document.getElementById('fireExtinguisherModal').classList.remove('hidden');
            const now = new Date();
            document.getElementById('feDateInput').value = now.toISOString().split('T')[0];
            const typeSelect = document.getElementById('feTypeSelect');
            const type = typeSelect ? typeSelect.value : 'ОП';
            let years = 5;
            if (type === 'ОУ') years = 10;
            else if (type === 'ОВ') years = 1;
            else if (type === 'ОХ') years = 10;
            else if (type === 'ОПУ') years = 5;
            now.setFullYear(now.getFullYear() + years);
            document.getElementById('feNextDateInput').value = now.toISOString().split('T')[0];
            document.getElementById('feNextLabel').textContent = `✅ Перезарядка через ${years} лет (${now.toISOString().split('T')[0]})`;
            return;
        }
        if (mapMode === 'addEvacuationRoute') {
            tempRoutePoints.push({ x: coords.x, y: coords.y });
            drawMap();
            const ctx = canvas.getContext('2d');
            tempRoutePoints.forEach((p, i) => {
                ctx.fillStyle = i === 0 ? '#4caf50' : '#ffc107';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 8, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(i+1, p.x, p.y);
                ctx.textBaseline = 'alphabetic';
            });
            if (tempRoutePoints.length >= 2) {
                const name = prompt('Название пути эвакуации:', 'Путь ' + ((mapData.evacuationRoutes?.length || 0) + 1));
                if (name !== null && name.trim() !== '') {
                    if (!mapData.evacuationRoutes) mapData.evacuationRoutes = [];
                    mapData.evacuationRoutes.push({ points: [...tempRoutePoints], name: name.trim(), color: '#4caf50', id: Date.now() });
                    tempRoutePoints = [];
                    updateInfo(); drawMap(); saveMap();
                } else {
                    tempRoutePoints = [];
                    drawMap();
                }
                mapMode = 'view';
                document.getElementById('mapMode').textContent = 'Просмотр';
                document.getElementById('mapMode').style.color = '#00d4ff';
                canvas.style.cursor = 'default';
            } else {
                alert('🔄 Кликните вторую точку');
            }
            return;
        }
        
        if (mapMode === 'view') {
            let found = false;
            if (ws.workplaces) {
                for (let i = ws.workplaces.length - 1; i >= 0; i--) {
                    if (Math.hypot(coords.x - ws.workplaces[i].x, coords.y - ws.workplaces[i].y) < 40) {
                        selectedObjectIndex = i; selectedObjectType = 'workplace'; found = true; break;
                    }
                }
            }
            if (!found && mapData.evacuationPoints) {
                for (let i = mapData.evacuationPoints.length - 1; i >= 0; i--) {
                    if (Math.hypot(coords.x - mapData.evacuationPoints[i].x, coords.y - mapData.evacuationPoints[i].y) < 50) {
                        selectedObjectIndex = i; selectedObjectType = 'evacuation'; found = true; break;
                    }
                }
            }
            if (!found && mapData.fireExtinguishers) {
                for (let i = mapData.fireExtinguishers.length - 1; i >= 0; i--) {
                    if (Math.hypot(coords.x - mapData.fireExtinguishers[i].x, coords.y - mapData.fireExtinguishers[i].y) < 35) {
                        selectedObjectIndex = i; selectedObjectType = 'fireExtinguisher'; found = true; break;
                    }
                }
            }
            if (!found && mapData.evacuationRoutes) {
                for (let i = mapData.evacuationRoutes.length - 1; i >= 0; i--) {
                    const route = mapData.evacuationRoutes[i];
                    if (route.points) {
                        for (let j = 0; j < route.points.length - 1; j++) {
                            const p1 = route.points[j], p2 = route.points[j+1];
                            const d = distanceToSegment(coords.x, coords.y, p1.x, p1.y, p2.x, p2.y);
                            if (d < 15) {
                                selectedObjectIndex = i; selectedObjectType = 'route'; found = true; break;
                            }
                        }
                    }
                    if (found) break;
                }
            }
            if (!found) { selectedObjectIndex = -1; selectedObjectType = null; }
            drawMap();
        }
    });
    
    canvas.addEventListener('dblclick', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws || !ws.workplaces || mapMode !== 'view') return;
        for (let i = 0; i < ws.workplaces.length; i++) {
            if (Math.hypot(coords.x - ws.workplaces[i].x, coords.y - ws.workplaces[i].y) < 40) {
                const wp = ws.workplaces[i];
                if (!wp.position) { alert('⚠️ Укажите должность!'); return; }
                selectedObjectIndex = i;
                selectedObjectType = 'workplace';
                drawMap();
                openPPEModal(wp);
                return;
            }
        }
    });
    
    canvas.addEventListener('mousedown', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws || mapMode !== 'view') return;
        
        for (let i = ws.workplaces.length - 1; i >= 0; i--) {
            if (Math.hypot(coords.x - ws.workplaces[i].x, coords.y - ws.workplaces[i].y) < 40) {
                isDragging = true; dragTarget = i; dragTargetType = 'workplace';
                dragOffsetX = coords.x - ws.workplaces[i].x; dragOffsetY = coords.y - ws.workplaces[i].y;
                canvas.style.cursor = 'grabbing'; return;
            }
        }
        for (let i = mapData.evacuationPoints.length - 1; i >= 0; i--) {
            if (Math.hypot(coords.x - mapData.evacuationPoints[i].x, coords.y - mapData.evacuationPoints[i].y) < 50) {
                isDragging = true; dragTarget = i; dragTargetType = 'evacuation';
                dragOffsetX = coords.x - mapData.evacuationPoints[i].x; dragOffsetY = coords.y - mapData.evacuationPoints[i].y;
                canvas.style.cursor = 'grabbing'; return;
            }
        }
        for (let i = mapData.fireExtinguishers.length - 1; i >= 0; i--) {
            if (Math.hypot(coords.x - mapData.fireExtinguishers[i].x, coords.y - mapData.fireExtinguishers[i].y) < 35) {
                isDragging = true; dragTarget = i; dragTargetType = 'fireExtinguisher';
                dragOffsetX = coords.x - mapData.fireExtinguishers[i].x; dragOffsetY = coords.y - mapData.fireExtinguishers[i].y;
                canvas.style.cursor = 'grabbing'; return;
            }
        }
    });
    
    canvas.addEventListener('mousemove', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        if (isDragging && dragTarget !== null && dragTargetType) {
            if (dragTargetType === 'workplace' && ws.workplaces[dragTarget]) {
                const wp = ws.workplaces[dragTarget];
                wp.x = Math.max(ws.x+20, Math.min(ws.x+ws.w-20, coords.x - dragOffsetX));
                wp.y = Math.max(ws.y+20, Math.min(ws.y+ws.h-20, coords.y - dragOffsetY));
                drawMap(); return;
            }
            if (dragTargetType === 'evacuation' && mapData.evacuationPoints[dragTarget]) {
                const ep = mapData.evacuationPoints[dragTarget];
                ep.x = Math.max(ws.x+20, Math.min(ws.x+ws.w-20, coords.x - dragOffsetX));
                ep.y = Math.max(ws.y+20, Math.min(ws.y+ws.h-20, coords.y - dragOffsetY));
                drawMap(); return;
            }
            if (dragTargetType === 'fireExtinguisher' && mapData.fireExtinguishers[dragTarget]) {
                const fe = mapData.fireExtinguishers[dragTarget];
                fe.x = Math.max(ws.x+20, Math.min(ws.x+ws.w-20, coords.x - dragOffsetX));
                fe.y = Math.max(ws.y+20, Math.min(ws.y+ws.h-20, coords.y - dragOffsetY));
                drawMap(); return;
            }
        }
        
        let cursor = 'default';
        if (ws.workplaces) {
            for (let wp of ws.workplaces) {
                if (Math.hypot(coords.x - wp.x, coords.y - wp.y) < 40) { cursor = 'grab'; break; }
            }
        }
        if (cursor === 'default' && mapData.evacuationPoints) {
            for (let ep of mapData.evacuationPoints) {
                if (Math.hypot(coords.x - ep.x, coords.y - ep.y) < 50) { cursor = 'grab'; break; }
            }
        }
        if (cursor === 'default' && mapData.fireExtinguishers) {
            for (let fe of mapData.fireExtinguishers) {
                if (Math.hypot(coords.x - fe.x, coords.y - fe.y) < 35) { cursor = 'grab'; break; }
            }
        }
        canvas.style.cursor = cursor;
    });
    
    canvas.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false; dragTarget = null; dragTargetType = null;
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
            isDragging = false; dragTarget = null; dragTargetType = null;
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

function distanceToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx*dx + dy*dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1)*dx + (py - y1)*dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - x1 - t*dx, py - y1 - t*dy);
}

function deleteSelectedObject() {
    if (selectedObjectIndex < 0 || !selectedObjectType) {
        alert('Сначала выберите объект (кликните на него)');
        return;
    }
    let msg = '';
    if (selectedObjectType === 'workplace') {
        const ws = getCurrentWorkshop();
        if (!ws || !ws.workplaces[selectedObjectIndex]) return;
        msg = `Удалить рабочее место "${ws.workplaces[selectedObjectIndex].name}"?`;
    } else if (selectedObjectType === 'evacuation') {
        if (!mapData.evacuationPoints[selectedObjectIndex]) return;
        msg = `Удалить выход "${mapData.evacuationPoints[selectedObjectIndex].name}"?`;
    } else if (selectedObjectType === 'fireExtinguisher') {
        if (!mapData.fireExtinguishers[selectedObjectIndex]) return;
        msg = `Удалить огнетушитель "${mapData.fireExtinguishers[selectedObjectIndex].model}"?`;
    } else if (selectedObjectType === 'route') {
        if (!mapData.evacuationRoutes[selectedObjectIndex]) return;
        msg = `Удалить путь "${mapData.evacuationRoutes[selectedObjectIndex].name}"?`;
    }
    if (!confirm(msg)) return;
    if (selectedObjectType === 'workplace') {
        const ws = getCurrentWorkshop();
        ws.workplaces.splice(selectedObjectIndex, 1);
    } else if (selectedObjectType === 'evacuation') {
        mapData.evacuationPoints.splice(selectedObjectIndex, 1);
    } else if (selectedObjectType === 'fireExtinguisher') {
        mapData.fireExtinguishers.splice(selectedObjectIndex, 1);
    } else if (selectedObjectType === 'route') {
        mapData.evacuationRoutes.splice(selectedObjectIndex, 1);
    }
    selectedObjectIndex = -1;
    selectedObjectType = null;
    updateInfo();
    drawMap();
    saveMap();
    alert('✅ Удалено');
}

function openFireExtinguisherModal() {
    document.getElementById('fireExtinguisherModal').classList.remove('hidden');
}

function closeFireExtinguisherModal() {
    document.getElementById('fireExtinguisherModal').classList.add('hidden');
    tempObjectPos = null;
    mapMode = 'view';
    document.getElementById('mapMode').textContent = 'Просмотр';
    document.getElementById('mapMode').style.color = '#00d4ff';
    document.getElementById('mapCanvas').style.cursor = 'default';
}

function saveFireExtinguisher() {
    if (!tempObjectPos) { alert('Ошибка'); return; }
    const type = document.getElementById('feTypeSelect').value;
    const volume = document.getElementById('feVolumeSelect').value;
    const model = document.getElementById('feModelInput').value.trim() || `${type}-${volume}`;
    const date = document.getElementById('feDateInput').value;
    const nextDate = document.getElementById('feNextDateInput').value;
    if (!mapData.fireExtinguishers) mapData.fireExtinguishers = [];
    mapData.fireExtinguishers.push({
        x: tempObjectPos.x, y: tempObjectPos.y,
        type, volume, model, date, nextDate, id: Date.now()
    });
    closeFireExtinguisherModal();
    updateInfo();
    drawMap();
    saveMap();
    alert('✅ Огнетушитель добавлен!');
}

function openWorkshopModal() {
    const ws = getCurrentWorkshop();
    if (!ws) { alert('Сначала создайте участок'); return; }
    document.getElementById('workshopModal').classList.remove('hidden');
    document.getElementById('workshopNameInput').value = ws.name || '';
    document.getElementById('workshopLengthInput').value = ws.length || 30;
    document.getElementById('workshopWidthInput').value = ws.width || 20;
}

function closeWorkshopModal() {
    document.getElementById('workshopModal').classList.add('hidden');
}

function saveWorkshop() {
    const ws = getCurrentWorkshop();
    if (!ws) return;
    ws.name = document.getElementById('workshopNameInput').value.trim() || 'Участок';
    ws.length = parseInt(document.getElementById('workshopLengthInput').value) || 30;
    ws.width = parseInt(document.getElementById('workshopWidthInput').value) || 20;
    closeWorkshopModal();
    updateWorkshopSelect();
    updateInfo();
    drawMap();
    saveMap();
}

function openWorkplaceModal(x, y) {
    tempObjectPos = { x, y };
    document.getElementById('workplaceModal').classList.remove('hidden');
    document.getElementById('workplaceNameInput').value = '';
    document.getElementById('workplacePositionInput').value = '';
    document.getElementById('workplaceZoneInput').value = 50;
}

function closeWorkplaceModal() {
    document.getElementById('workplaceModal').classList.add('hidden');
    tempObjectPos = null;
    mapMode = 'view';
    document.getElementById('mapMode').textContent = 'Просмотр';
    document.getElementById('mapMode').style.color = '#00d4ff';
    document.getElementById('mapCanvas').style.cursor = 'default';
}

function saveWorkplace() {
    if (!tempObjectPos) { alert('Ошибка'); return; }
    const ws = getCurrentWorkshop();
    if (!ws) { alert('Участок не найден'); return; }
    const name = document.getElementById('workplaceNameInput').value.trim() || 'Рабочее место ' + (ws.workplaces.length + 1);
    const position = document.getElementById('workplacePositionInput').value.trim() || '';
    const zone = parseInt(document.getElementById('workplaceZoneInput').value) || 50;
    ws.workplaces.push({
        x: tempObjectPos.x, y: tempObjectPos.y,
        name, position, zone,
        id: Date.now(), hasPPE: false, ppeItems: [], ppeSource: null
    });
    closeWorkplaceModal();
    updateInfo();
    drawMap();
    saveMap();
    alert('✅ Рабочее место добавлено!');
}

function addNewWorkshop() {
    const name = prompt('Название участка:', 'Участок ' + (mapData.workshops.length + 1));
    if (!name) return;
    mapData.workshops.push({
        id: Date.now(), name, length: 30, width: 20,
        x: 50, y: 50, w: 3900, h: 1900, workplaces: []
    });
    mapData.currentWorkshop = mapData.workshops.length - 1;
    if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
    if (!mapData.fireExtinguishers) mapData.fireExtinguishers = [];
    if (!mapData.evacuationRoutes) mapData.evacuationRoutes = [];
    updateWorkshopSelect();
    updateInfo();
    drawMap();
    saveMap();
}

function deleteWorkshop() {
    if (mapData.workshops.length <= 1) { alert('Нельзя удалить единственный участок'); return; }
    if (!confirm('Удалить участок?')) return;
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
    if (!confirm('Очистить участок?')) return;
    const ws = getCurrentWorkshop();
    if (ws) {
        ws.workplaces = [];
        mapData.evacuationPoints = [];
        mapData.fireExtinguishers = [];
        mapData.evacuationRoutes = [];
        selectedObjectIndex = -1;
        selectedObjectType = null;
        tempRoutePoints = [];
        updateInfo();
        drawMap();
        saveMap();
    }
}

// ============================================================
// ДОБАВЛЕНИЕ В ПРОТОКОЛ ИЗ ШТАТКИ
// ============================================================
function addSelectedToProtocol() {
    const selected = getSelectedStaffFromView();
    if (selected.length === 0) { alert('❌ Выберите сотрудников!'); return; }
    const protocol = getProtocol();
    const existing = new Set(protocol.map(e => e.snils));
    let added = 0;
    selected.forEach(emp => {
        if (!existing.has(emp.snils)) { protocol.push({...emp}); existing.add(emp.snils); added++; }
    });
    saveProtocol(protocol);
    renderProtocol();
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = false);
    alert(`✅ Добавлено ${added} сотрудников!`);
}

// ============================================================
// ГЕНЕРАЦИЯ XML
// ============================================================
function generateXML() {
    const orgSelect = document.getElementById('orgSelect');
    const orgs = getOrgs();
    const org = orgs.find(o => o.id === parseInt(orgSelect.value));
    if (!org) { alert('❌ Выберите организацию!'); return; }
    const protocol = getProtocol();
    if (protocol.length === 0) { alert('❌ Нет сотрудников в протоколе!'); return; }
    
    const number = document.getElementById('protocolNumber').value.trim() || '01/26';
    const date = document.getElementById('protocolDate').value || new Date().toISOString().split('T')[0];
    
    const programs = [];
    document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]:checked').forEach(cb => {
        const label = cb.closest('.program-check');
        if (label) programs.push(label.textContent.trim());
    });
    if (programs.length === 0) { alert('❌ Выберите программы!'); return; }
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<Протокол>\n';
    xml += `  <Номер>${escXml(number)}</Номер>\n  <Дата>${escXml(date)}</Дата>\n  <Организация>${escXml(org.name)}</Организация>\n`;
    xml += '  <Программы>\n';
    programs.forEach(p => xml += `    <Программа>${escXml(p)}</Программа>\n`);
    xml += '  </Программы>\n  <Сотрудники>\n';
    protocol.forEach((emp, i) => {
        xml += `    <Сотрудник>\n      <Номер>${i+1}</Номер>\n      <Фамилия>${escXml(emp.last_name)}</Фамилия>\n      <Имя>${escXml(emp.first_name)}</Имя>\n`;
        xml += `      <Отчество>${escXml(emp.middle_name || '')}</Отчество>\n      <Должность>${escXml(emp.position)}</Должность>\n`;
        xml += `      <СНИЛС>${escXml(formatSnils(emp.snils))}</СНИЛС>\n      <Результат>Пройдено</Результат>\n    </Сотрудник>\n`;
    });
    xml += '  </Сотрудники>\n</Протокол>';
    
    const resultBlock = document.getElementById('resultBlock');
    const downloadLink = document.getElementById('downloadLink');
    resultBlock.classList.remove('hidden');
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `Протокол_${number}_${date}.xml`;
    const preview = document.createElement('pre');
    preview.style.cssText = 'max-height:200px;overflow:auto;background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;font-size:11px;color:#aaa;margin-top:12px;';
    preview.textContent = xml.substring(0, 500) + '...';
    resultBlock.querySelector('pre')?.remove();
    resultBlock.appendChild(preview);
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
function initTrainingPage() {
    renderOrgs();
    renderStaffWithDepartments();
    renderProtocol();
    fillFamEmployeeSelect();
    
    document.getElementById('showOrgFormBtn').onclick = function() {
        document.getElementById('orgForm').classList.remove('hidden');
    };
    document.getElementById('saveOrgBtn').onclick = function() {
        const name = document.getElementById('orgNameInput').value.trim();
        const inn = document.getElementById('orgInnInput').value.trim();
        if (!name || !inn) { alert('Заполните все поля'); return; }
        const orgs = getOrgs();
        orgs.push({ id: Date.now(), name, inn });
        saveOrgs(orgs);
        renderOrgs();
        document.getElementById('orgForm').classList.add('hidden');
        document.getElementById('orgNameInput').value = '';
        document.getElementById('orgInnInput').value = '';
        alert('✅ Организация добавлена');
    };
    document.getElementById('cancelOrgBtn').onclick = function() {
        document.getElementById('orgForm').classList.add('hidden');
    };
    document.getElementById('deleteOrgBtn').onclick = function() {
        const id = parseInt(document.getElementById('orgSelect').value);
        if (!id) { alert('Выберите организацию'); return; }
        if (!confirm('Удалить?')) return;
        let orgs = getOrgs();
        orgs = orgs.filter(o => o.id !== id);
        saveOrgs(orgs);
        renderOrgs();
        alert('✅ Удалено');
    };
    document.getElementById('generateBtn').onclick = generateXML;
    document.getElementById('addSelectedBtn').onclick = addSelectedToProtocol;
    document.getElementById('staffImportBtn').onclick = importStaffFile;
    document.getElementById('generateFamBtn').onclick = generateFamiliarization;
    document.getElementById('printFamBtn').onclick = function() {
        const content = document.getElementById('famContent');
        if (!content.innerHTML) { alert('Сначала сформируйте лист'); return; }
        const win = window.open('', '_blank');
        win.document.write(`<!DOCTYPE html><html><head><title>Лист ознакомления</title>
            <style>body{font-family:Arial;padding:40px;color:#222;max-width:1000px;margin:0 auto;}*{print-color-adjust:exact;}@media print{body{padding:20px;}}</style>
        </head><body>${content.innerHTML}<script>window.print();window.close();<\/script></body></html>`);
        win.document.close();
    };
    
    renderCalendar();
    initPPECardsPage();
}

// ============================================================
// DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Загрузка...');
    document.getElementById('mainPage').style.display = 'block';
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === 'Главная') link.classList.add('active');
    });
    initTrainingPage();
    console.log('✅ Готово!');
});
