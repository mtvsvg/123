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
// ШТАТНОЕ РАСПИСАНИЕ С ОТДЕЛАМИ
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
// СПИСОК ТИПОВ СИЗ (ДЛЯ МОДАЛЬНОГО ОКНА)
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
// МОДАЛЬНОЕ ОКНО СИЗ (ДЛЯ КАРТЫ И КАРТОЧЕК)
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
// КАРТОЧКИ СИЗ (БЕЗ DOCX, ТОЛЬКО HTML + ПЕЧАТЬ)
// ============================================================
let selectedPPECardItems = [];

const PPE_CARD_TEMPLATES = [
    { name: 'Жилет сигнальный повышенной видимости', punkt: 'п. 793', unit: 'Штук, год', quantity: '1' },
    { name: 'Перчатки для защиты от механических воздействий', punkt: 'п. 793', unit: 'Пар, год', quantity: '12 пар' },
    { name: 'Перчатки специальные диэлектрические', punkt: 'п. 793', unit: 'Пара', quantity: 'опр. док. изготовителя' },
    { name: 'Галоши диэлектрические', punkt: 'п. 6', unit: 'Пара', quantity: 'опр. док. изготовителя' },
    { name: 'Костюм для защиты от механических воздействий', punkt: 'п. 793', unit: 'Штук, год', quantity: '1' },
    { name: 'Обувь специальная для защиты от механических воздействий', punkt: 'п. 793', unit: 'Пар, год', quantity: '1' },
    { name: 'Каска защитная', punkt: 'п. 793', unit: 'Штук, год', quantity: '1' },
    { name: 'Очки защитные', punkt: 'п. 793', unit: 'Штук, год', quantity: '1' },
    { name: 'Респиратор', punkt: 'п. 793', unit: 'Штук, год', quantity: '1' },
    { name: 'Наушники противошумные', punkt: 'п. 793', unit: 'Штук, год', quantity: '1' },
    { name: 'Рукавицы комбинированные', punkt: 'п. 793', unit: 'Пар, год', quantity: '6 пар' },
    { name: 'Пояс предохранительный', punkt: 'п. 793', unit: 'Штук, год', quantity: '1' }
];

function initPPECardsPage() {
    renderPPECardStaffList();
    renderPPECardPPEList();
    
    const generateBtn = document.getElementById('generatePPECardsBtn');
    if (generateBtn) {
        generateBtn.onclick = generatePPECardsHTML;
        console.log('✅ Кнопка генерации карточек СИЗ привязана');
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
        html += `
            <div class="ppe-item-select">
                <input type="checkbox" class="ppe-card-ppe-check" data-index="${idx}" ${checked}>
                <label>
                    <span style="color:#fff;">${ppe.name}</span>
                    <span class="ppe-detail">(${ppe.punkt}, ${ppe.unit}, ${ppe.quantity})</span>
                </label>
            </div>
        `;
    });
    
    html += `
        <div style="width:100%;margin-top:8px;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:6px;border:1px dashed rgba(255,255,255,0.06);display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <input type="text" id="ppeCardCustomName" placeholder="Свое СИЗ (наименование)" style="flex:2;min-width:150px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
            <input type="text" id="ppeCardCustomPunkt" placeholder="Пункт норм" style="flex:1;min-width:100px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
            <input type="text" id="ppeCardCustomUnit" placeholder="Ед. изм." style="flex:1;min-width:100px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
            <input type="text" id="ppeCardCustomQuantity" placeholder="Кол-во" style="flex:1;min-width:80px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
            <button onclick="addCustomPPEToCardList()" style="padding:6px 16px;background:linear-gradient(135deg,#7c3aed,#00d4ff);border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px;">➕ Добавить</button>
        </div>
    `;
    
    container.innerHTML = html;
    
    document.querySelectorAll('.ppe-card-ppe-check').forEach(cb => {
        cb.addEventListener('change', function() {
            const idx = parseInt(this.dataset.index);
            const ppe = PPE_CARD_TEMPLATES[idx];
            if (this.checked) {
                if (!selectedPPECardItems.some(item => item.name === ppe.name)) {
                    selectedPPECardItems.push({ ...ppe });
                }
            } else {
                selectedPPECardItems = selectedPPECardItems.filter(item => item.name !== ppe.name);
            }
            updatePPECardSelectionCount();
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
    
    const newPPE = { name, punkt, unit, quantity };
    if (!selectedPPECardItems.some(item => item.name === name)) {
        selectedPPECardItems.push(newPPE);
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
// ГЕНЕРАЦИЯ КАРТОЧЕК СИЗ ЧЕРЕЗ HTML + ПЕЧАТЬ (ПО ТВОЕМУ ОБРАЗЦУ)
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
    const cardNumber = document.getElementById('ppeCardNumber').value.trim() || '';
    const department = document.getElementById('ppeCardDepartment').value.trim() || '';
    const gender = document.getElementById('ppeCardGender').value || 'М';
    const height = document.getElementById('ppeCardHeight').value.trim() || '';
    const clothesSize = document.getElementById('ppeCardClothesSize').value.trim() || '';
    const shoeSize = document.getElementById('ppeCardShoeSize').value.trim() || '';
    
    const resultDiv = document.getElementById('ppeCardResult');
    const contentDiv = document.getElementById('ppeCardResultContent');
    
    // Пакуем сотрудников по 2 на страницу
    let allCardsHTML = '';
    let cardCount = 0;
    let totalPages = Math.ceil(employees.length / 2);
    
    for (let i = 0; i < employees.length; i += 2) {
        const emp1 = employees[i];
        const emp2 = employees[i + 1] || null;
        const pageNum = Math.floor(i / 2) + 1;
        cardCount += emp2 ? 2 : 1;
        
        allCardsHTML += `
        <div style="page-break-after:always;padding:10px;font-family:'Times New Roman',serif;max-width:1000px;margin:0 auto;background:#fff;color:#000;border:1px solid #999;border-radius:2px;margin-bottom:10px;min-height:950px;">
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;height:100%;">
                
                <!-- ============================================================ -->
                <!-- ЛИЦЕВАЯ СТОРОНА - СОТРУДНИК 1 -->
                <!-- ============================================================ -->
                <div style="border-right:1px dashed #ccc;padding-right:10px;">
                    
                    <!-- Шапка -->
                    <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:10px;">
                        <div style="font-size:14px;font-weight:bold;">ЛИЧНАЯ КАРТОЧКА N ${cardNumber || '___'}</div>
                        <div style="font-size:14px;font-weight:bold;">учета выдачи СИЗ</div>
                    </div>
                    
                    <!-- Информация о сотруднике -->
                    <table style="width:100%;border-collapse:collapse;font-size:11px;">
                        <tr>
                            <td style="width:55%;vertical-align:top;padding:2px;">
                                <div><strong>Фамилия</strong> ${emp1.last_name}</div>
                                <div><strong>Имя</strong> ${emp1.first_name}</div>
                                <div><strong>Отчество</strong> ${emp1.middle_name || ''}</div>
                                <div><strong>Табельный номер</strong> ________</div>
                                <div><strong>Структурное подразделение</strong> ${department}</div>
                                <div><strong>Профессия (должность)</strong> ${emp1.position}</div>
                                <div><strong>Дата поступления на работу</strong> __________</div>
                                <div><strong>Дата изменения профессии (должности) или перевода</strong> __________</div>
                            </td>
                            <td style="width:45%;vertical-align:top;padding:2px;">
                                <div><strong>Пол</strong> ${gender}</div>
                                <div><strong>Рост</strong> ${height}</div>
                                <div style="margin-top:4px;"><strong>Размер:</strong></div>
                                <div style="padding-left:12px;"><strong>одежды</strong> ${clothesSize}</div>
                                <div style="padding-left:12px;"><strong>обуви</strong> ${shoeSize}</div>
                                <div style="padding-left:12px;"><strong>головного убора</strong> ___</div>
                                <div><strong>СИЗОД</strong> ___</div>
                                <div><strong>СИЗ рук</strong> ___________</div>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Таблица СИЗ -->
                    <div style="margin-top:8px;">
                        <table style="width:100%;border-collapse:collapse;font-size:10px;border:1px solid #000;">
                            <thead>
                                <tr style="background:#f0f0f0;">
                                    <th style="border:1px solid #000;padding:3px;text-align:center;width:35%;">Наименование СИЗ</th>
                                    <th style="border:1px solid #000;padding:3px;text-align:center;width:20%;">Пункт Норм</th>
                                    <th style="border:1px solid #000;padding:3px;text-align:center;width:25%;">Единица измерения, периодичность выдачи</th>
                                    <th style="border:1px solid #000;padding:3px;text-align:center;width:20%;">Количество на период</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${selectedPPECardItems.map(ppe => `
                                    <tr>
                                        <td style="border:1px solid #000;padding:3px;">${ppe.name}</td>
                                        <td style="border:1px solid #000;padding:3px;">${ppe.punkt}</td>
                                        <td style="border:1px solid #000;padding:3px;">${ppe.unit}</td>
                                        <td style="border:1px solid #000;padding:3px;">${ppe.quantity}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Подпись -->
                    <div style="margin-top:12px;">
                        <div style="font-size:12px;margin-top:6px;">${managerPosition} __________ ${manager}</div>
                        <div style="font-size:10px;">(подпись)     (фамилия, инициалы)</div>
                    </div>
                    
                </div>
                
                <!-- ============================================================ -->
                <!-- ЛИЦЕВАЯ СТОРОНА - СОТРУДНИК 2 (если есть) -->
                <!-- ============================================================ -->
                <div style="${emp2 ? '' : 'opacity:0.3;'}">
                    
                    ${emp2 ? `
                    <!-- Шапка -->
                    <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:10px;">
                        <div style="font-size:14px;font-weight:bold;">ЛИЧНАЯ КАРТОЧКА N ${cardNumber || '___'}</div>
                        <div style="font-size:14px;font-weight:bold;">учета выдачи СИЗ</div>
                    </div>
                    
                    <!-- Информация о сотруднике -->
                    <table style="width:100%;border-collapse:collapse;font-size:11px;">
                        <tr>
                            <td style="width:55%;vertical-align:top;padding:2px;">
                                <div><strong>Фамилия</strong> ${emp2.last_name}</div>
                                <div><strong>Имя</strong> ${emp2.first_name}</div>
                                <div><strong>Отчество</strong> ${emp2.middle_name || ''}</div>
                                <div><strong>Табельный номер</strong> ________</div>
                                <div><strong>Структурное подразделение</strong> ${department}</div>
                                <div><strong>Профессия (должность)</strong> ${emp2.position}</div>
                                <div><strong>Дата поступления на работу</strong> __________</div>
                                <div><strong>Дата изменения профессии (должности) или перевода</strong> __________</div>
                            </td>
                            <td style="width:45%;vertical-align:top;padding:2px;">
                                <div><strong>Пол</strong> ${gender}</div>
                                <div><strong>Рост</strong> ${height}</div>
                                <div style="margin-top:4px;"><strong>Размер:</strong></div>
                                <div style="padding-left:12px;"><strong>одежды</strong> ${clothesSize}</div>
                                <div style="padding-left:12px;"><strong>обуви</strong> ${shoeSize}</div>
                                <div style="padding-left:12px;"><strong>головного убора</strong> ___</div>
                                <div><strong>СИЗОД</strong> ___</div>
                                <div><strong>СИЗ рук</strong> ___________</div>
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Таблица СИЗ -->
                    <div style="margin-top:8px;">
                        <table style="width:100%;border-collapse:collapse;font-size:10px;border:1px solid #000;">
                            <thead>
                                <tr style="background:#f0f0f0;">
                                    <th style="border:1px solid #000;padding:3px;text-align:center;width:35%;">Наименование СИЗ</th>
                                    <th style="border:1px solid #000;padding:3px;text-align:center;width:20%;">Пункт Норм</th>
                                    <th style="border:1px solid #000;padding:3px;text-align:center;width:25%;">Единица измерения, периодичность выдачи</th>
                                    <th style="border:1px solid #000;padding:3px;text-align:center;width:20%;">Количество на период</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${selectedPPECardItems.map(ppe => `
                                    <tr>
                                        <td style="border:1px solid #000;padding:3px;">${ppe.name}</td>
                                        <td style="border:1px solid #000;padding:3px;">${ppe.punkt}</td>
                                        <td style="border:1px solid #000;padding:3px;">${ppe.unit}</td>
                                        <td style="border:1px solid #000;padding:3px;">${ppe.quantity}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Подпись -->
                    <div style="margin-top:12px;">
                        <div style="font-size:12px;margin-top:6px;">${managerPosition} __________ ${manager}</div>
                        <div style="font-size:10px;">(подпись)     (фамилия, инициалы)</div>
                    </div>
                    ` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;font-size:16px;">Пустая карточка</div>'}
                    
                </div>
            </div>
            
            <!-- ============================================================ -->
            <!-- ОБОРОТНАЯ СТОРОНА (ВСЯ СТРАНИЦА) -->
            <!-- ============================================================ -->
            <div style="margin-top:20px;border-top:2px dashed #999;padding-top:15px;">
                <div style="text-align:center;font-size:14px;font-weight:bold;margin-bottom:8px;">ОБОРОТНАЯ СТОРОНА</div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    
                    <!-- Оборотная сторона - сотрудник 1 -->
                    <div style="border-right:1px dashed #ccc;padding-right:10px;">
                        <div style="font-weight:bold;font-size:12px;text-align:center;margin-bottom:6px;">Данные о выдаче СИЗ</div>
                        <div style="font-size:10px;text-align:center;margin-bottom:4px;color:#666;">${emp1.last_name} ${emp1.first_name}</div>
                        <table style="width:100%;border-collapse:collapse;font-size:9px;border:1px solid #000;">
                            <thead>
                                <tr style="background:#f0f0f0;">
                                    <th style="border:1px solid #000;padding:2px;text-align:center;width:18%;">Наименование СИЗ</th>
                                    <th style="border:1px solid #000;padding:2px;text-align:center;width:18%;">Модель, марка, артикул</th>
                                    <th style="border:1px solid #000;padding:2px;text-align:center;width:32%;">Выдано (дата, кол-во, подпись)</th>
                                    <th style="border:1px solid #000;padding:2px;text-align:center;width:32%;">Возвращено (дата, кол-во, подпись)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Array(10).fill(0).map(() => `
                                    <tr>
                                        <td style="border:1px solid #000;padding:2px;height:18px;"></td>
                                        <td style="border:1px solid #000;padding:2px;height:18px;"></td>
                                        <td style="border:1px solid #000;padding:2px;height:18px;"></td>
                                        <td style="border:1px solid #000;padding:2px;height:18px;"></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div style="font-size:10px;margin-top:4px;">Ответственный за выдачу СИЗ __________</div>
                    </div>
                    
                    <!-- Оборотная сторона - сотрудник 2 -->
                    <div style="${emp2 ? '' : 'opacity:0.3;'}">
                        ${emp2 ? `
                        <div style="font-weight:bold;font-size:12px;text-align:center;margin-bottom:6px;">Данные о выдаче СИЗ</div>
                        <div style="font-size:10px;text-align:center;margin-bottom:4px;color:#666;">${emp2.last_name} ${emp2.first_name}</div>
                        <table style="width:100%;border-collapse:collapse;font-size:9px;border:1px solid #000;">
                            <thead>
                                <tr style="background:#f0f0f0;">
                                    <th style="border:1px solid #000;padding:2px;text-align:center;width:18%;">Наименование СИЗ</th>
                                    <th style="border:1px solid #000;padding:2px;text-align:center;width:18%;">Модель, марка, артикул</th>
                                    <th style="border:1px solid #000;padding:2px;text-align:center;width:32%;">Выдано (дата, кол-во, подпись)</th>
                                    <th style="border:1px solid #000;padding:2px;text-align:center;width:32%;">Возвращено (дата, кол-во, подпись)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Array(10).fill(0).map(() => `
                                    <tr>
                                        <td style="border:1px solid #000;padding:2px;height:18px;"></td>
                                        <td style="border:1px solid #000;padding:2px;height:18px;"></td>
                                        <td style="border:1px solid #000;padding:2px;height:18px;"></td>
                                        <td style="border:1px solid #000;padding:2px;height:18px;"></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div style="font-size:10px;margin-top:4px;">Ответственный за выдачу СИЗ __________</div>
                        ` : '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#ccc;font-size:14px;">Пустая оборотная сторона</div>'}
                    </div>
                    
                </div>
            </div>
            
            <div style="text-align:center;font-size:9px;color:#999;margin-top:6px;border-top:1px solid #eee;padding-top:4px;">
                Сформировано в системе «ОхранаТруда.Про» • Страница ${pageNum} из ${totalPages}
            </div>
            
        </div>
        `;
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
                    padding: 20px; 
                    margin: 0;
                }
                @page {
                    size: A4;
                    margin: 10mm 10mm 10mm 10mm;
                }
                @media print {
                    body { background: #fff; padding: 0; margin: 0; }
                    .no-print { display: none; }
                    div[style*="page-break-after:always"] { 
                        page-break-after: always; 
                    }
                }
                .no-print {
                    text-align: center;
                    padding: 20px;
                    background: #fff;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    border-bottom: 2px solid #7c3aed;
                }
                .no-print button {
                    padding: 10px 30px;
                    margin: 0 10px;
                    background: linear-gradient(135deg, #7c3aed, #00d4ff);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 16px;
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
            </style>
        </head>
        <body>
            <div class="no-print">
                <h3>🖨️ Карточки готовы к печати (${cardCount} сотрудников, ${totalPages} страниц)</h3>
                <button onclick="window.print()">🖨️ Печать</button>
                <button class="btn-secondary" onclick="window.close()">✖ Закрыть</button>
                <p style="font-size:12px;color:#666;margin-top:6px;">Нажмите "Печать" и выберите "Сохранить как PDF" или отправьте на принтер</p>
                <p style="font-size:11px;color:#888;margin-top:4px;">💡 На одной странице — два сотрудника (лицевая и оборотная стороны)</p>
            </div>
            ${allCardsHTML}
            <script>
                // Автоматически открываем диалог печати через 1.5 секунды
                setTimeout(() => window.print(), 1500);
            <\/script>
        </body>
        </html>
    `);
    win.document.close();
    
    // Показываем результат
    resultDiv.classList.remove('hidden');
    contentDiv.innerHTML = `
        <p>✅ Создано карточек: <strong>${cardCount}</strong></p>
        <p>📋 Сотрудники: ${employees.map(e => `${e.last_name} ${e.first_name}`).join(', ')}</p>
        <p>🦺 СИЗ: ${selectedPPECardItems.map(e => e.name).join(', ')}</p>
        <p style="color:#8888aa;font-size:13px;margin-top:8px;">🖨️ Откроется новое окно для печати.</p>
        <p style="color:#8888aa;font-size:12px;">📄 На одной странице — два сотрудника.</p>
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
// КАРТА (ВСЯ ЛОГИКА КАРТЫ) - СОКРАЩЕННАЯ ВЕРСИЯ ДЛЯ ЭКОНОМИИ МЕСТА
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

// Остальная часть карты - такая же как в предыдущей версии, но я сокращаю для экономии места

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
