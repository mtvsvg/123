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
    } else if (page === 'med') {
        const el = document.getElementById('medPage');
        if (el) el.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Медосмотры') link.classList.add('active'); 
        });
        initMedPage();
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
function getMedOrgs() { return JSON.parse(localStorage.getItem('medOrganizations') || '[]'); }
function saveMedOrgs(orgs) { localStorage.setItem('medOrganizations', JSON.stringify(orgs)); }
function getPersons() { return JSON.parse(localStorage.getItem('authorizedPersons') || '[]'); }
function savePersons(persons) { localStorage.setItem('authorizedPersons', JSON.stringify(persons)); }
function getServices() { return JSON.parse(localStorage.getItem('orgServices') || '[]'); }
function saveServices(services) { localStorage.setItem('orgServices', JSON.stringify(services)); }
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
        const totalEl = document.getElementById('staffTotalCount');
        if (totalEl) totalEl.textContent = 'Всего: 0';
        return;
    }
    
    const totalEl = document.getElementById('staffTotalCount');
    if (totalEl) totalEl.textContent = `Всего: ${allCount}`;
    
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
        const result = parseLine(line);
        if (result) employees.push(result);
    });
    console.log('📊 Распознано сотрудников:', employees.length);
    return employees;
}

function parseLine(line) {
    // Убираем пробелы по краям и разбиваем по табуляции ИЛИ 2+ пробелам
    const trimmed = line.trim();
    if (!trimmed) return null;
    
    // Разбиваем: сначала пробуем по табуляции
    let parts = trimmed.split(/\t+/).map(p => p.trim()).filter(p => p.length > 0);
    
    // Если табуляция не сработала — по 2+ пробелам
    if (parts.length < 5) {
        parts = trimmed.split(/\s{2,}/).map(p => p.trim()).filter(p => p.length > 0);
    }
    
    // Если и это не помогло — по одинарным пробелам (но тогда ФИО не соберётся)
    if (parts.length < 5) {
        console.warn('⚠️ Строка не разбилась на 5+ частей:', trimmed);
        return null;
    }
    
    console.log('🔍 Разобрана строка на', parts.length, 'частей:', parts);
    
    // ФИКСИРОВАННЫЙ ПОРЯДОК:
    // parts[0] = ФИО (Батурин Владимир Александрович)
    // parts[1] = Подразделение (Администрация)
    // parts[2] = Должность (Научный руководитель)
    // parts[3] = Полис (2651 8408 3900 0749)
    // parts[4] = Дата рождения (12.08.1951)
    // parts[5] = Пол (м)
    // parts[6] = Вредные факторы (необязательно)
    
    // Разбиваем ФИО на слова
    const nameWords = parts[0].split(/\s+/).filter(w => w.length > 0);
    
    if (nameWords.length < 2) {
        console.warn('⚠️ ФИО содержит меньше 2 слов:', parts[0]);
        return null;
    }
    
    const last_name = nameWords[0] || '';
    const first_name = nameWords[1] || '';
    const middle_name = nameWords[2] || '';
    const department = parts[1] || '';
    const position = parts[2] || '';
    
    // Полис — очищаем от пробелов
    let policy = '';
    if (parts[3]) {
        policy = parts[3].replace(/\s/g, '');
    }
    
    // Дата рождения
    let birthDate = '';
    if (parts[4]) {
        birthDate = parts[4].trim();
    }
    
    // Пол
    let gender = '';
    if (parts[5]) {
        const g = parts[5].trim().toLowerCase();
        if (g === 'м' || g === 'м.') gender = 'М';
        else if (g === 'ж' || g === 'ж.') gender = 'Ж';
    }
    
    // Вредные факторы (если есть 7-я часть)
    let factors = '';
    if (parts[6]) {
        factors = parts[6].trim();
    }
    
    return {
        last_name: last_name,
        first_name: first_name,
        middle_name: middle_name,
        department: department,
        position: position,
        snils: '',
        policyNumber: policy,
        birthDate: birthDate,
        gender: gender,
        medFactors: factors,
        is_passed: true
    };
}

function formatSnils(snils) { 
    if (!snils) return ''; 
    const clean = snils.replace(/\D/g, ''); 
    if (clean.length < 11) return snils; 
    return clean.slice(0,3) + '-' + clean.slice(3,6) + '-' + clean.slice(6,9) + ' ' + clean.slice(9,11); 
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
}

function escXml(str) { 
    if (!str) return ''; 
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); 
}
// ============================================================
// ОРГАНИЗАЦИИ (РАБОТОДАТЕЛИ)
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
// УПОЛНОМОЧЕННЫЕ ЛИЦА (ПОДПИСАНТЫ)
// ============================================================
function renderPersons() {
    const select = document.getElementById('personSelect');
    if (!select) return;
    const persons = getPersons();
    select.innerHTML = '<option value="">-- Выберите уполномоченное лицо --</option>';
    persons.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} — ${p.position}`;
        select.appendChild(opt);
    });
}

function initPersonForm() {
    const showBtn = document.getElementById('showPersonFormBtn');
    const saveBtn = document.getElementById('savePersonBtn');
    const cancelBtn = document.getElementById('cancelPersonBtn');
    const deleteBtn = document.getElementById('deletePersonBtn');
    
    if (showBtn) showBtn.onclick = function() {
        document.getElementById('personForm').classList.remove('hidden');
    };
    if (cancelBtn) cancelBtn.onclick = function() {
        document.getElementById('personForm').classList.add('hidden');
    };
    if (saveBtn) saveBtn.onclick = function() {
        const name = document.getElementById('personNameInput').value.trim();
        const position = document.getElementById('personPositionInput').value.trim();
        if (!name || !position) { alert('Заполните ФИО и должность'); return; }
        const persons = getPersons();
        persons.push({ id: Date.now(), name, position });
        savePersons(persons);
        renderPersons();
        document.getElementById('personForm').classList.add('hidden');
        document.getElementById('personNameInput').value = '';
        document.getElementById('personPositionInput').value = '';
        alert('✅ Уполномоченное лицо добавлено');
    };
    if (deleteBtn) deleteBtn.onclick = function() {
        const id = parseInt(document.getElementById('personSelect').value);
        if (!id) { alert('Выберите лицо'); return; }
        if (!confirm('Удалить?')) return;
        let persons = getPersons();
        persons = persons.filter(p => p.id !== id);
        savePersons(persons);
        renderPersons();
        alert('✅ Удалено');
    };
}

function getSelectedPersonName() {
    const select = document.getElementById('personSelect');
    if (!select || !select.value) return '';
    const persons = getPersons();
    const p = persons.find(x => x.id == select.value);
    return p ? p.name : '';
}

function getSelectedPersonPosition() {
    const select = document.getElementById('personSelect');
    if (!select || !select.value) return '';
    const persons = getPersons();
    const p = persons.find(x => x.id == select.value);
    return p ? p.position : '';
}

// ============================================================
// СЛУЖБЫ ОРГАНИЗАЦИИ
// ============================================================
function renderServices() {
    const container = document.getElementById('serviceList');
    if (!container) return;
    const services = getServices();
    if (services.length === 0) {
        container.innerHTML = '<span style="color:#8888aa;">Службы не добавлены</span>';
        return;
    }
    container.innerHTML = services.map(s => 
        `<span style="display:inline-block;background:rgba(124,58,237,0.15);color:#b388ff;padding:4px 10px;border-radius:6px;margin:3px;font-size:13px;">${s.name} <span style="cursor:pointer;color:#ff6b6b;margin-left:6px;" onclick="deleteService(${s.id})">✖</span></span>`
    ).join('');
}

function deleteService(id) {
    if (!confirm('Удалить службу?')) return;
    let services = getServices();
    services = services.filter(s => s.id !== id);
    saveServices(services);
    renderServices();
}

function initServiceForm() {
    const showBtn = document.getElementById('showServiceFormBtn');
    const saveBtn = document.getElementById('saveServiceBtn');
    const cancelBtn = document.getElementById('cancelServiceBtn');
    
    if (showBtn) showBtn.onclick = function() {
        document.getElementById('serviceForm').classList.remove('hidden');
    };
    if (cancelBtn) cancelBtn.onclick = function() {
        document.getElementById('serviceForm').classList.add('hidden');
    };
    if (saveBtn) saveBtn.onclick = function() {
        const name = document.getElementById('serviceNameInput').value.trim();
        if (!name) { alert('Введите название службы'); return; }
        const services = getServices();
        services.push({ id: Date.now(), name });
        saveServices(services);
        renderServices();
        document.getElementById('serviceForm').classList.add('hidden');
        document.getElementById('serviceNameInput').value = '';
        alert('✅ Служба добавлена');
    };
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
    
    let html = '<div style="max-height:500px;overflow-y:auto;">';
    all.forEach((emp) => {
        const savedData = JSON.parse(localStorage.getItem('ppeCardStaffData_' + emp.snils) || '{}');
        const cardNumber = savedData.cardNumber || '';
        const workplaceId = savedData.workplaceId || '';
        const checked = savedData.checked || false;
        
        html += `
            <div class="staff-item-with-fields" data-snils="${emp.snils}">
                <div class="staff-info">
                    <input type="checkbox" class="ppe-card-staff-check" data-snils="${emp.snils}" ${checked ? 'checked' : ''}>
                    <span class="emp-name" onclick="openEmployeeCardBySnils('${emp.snils}')">${emp.last_name} ${emp.first_name}</span>
                    <span class="emp-position">${emp.position}</span>
                    <span class="emp-snils">${formatSnils(emp.snils)}</span>
                    ${emp.department ? `<span style="color:#8888aa;font-size:11px;">${emp.department}</span>` : ''}
                </div>
                <div class="staff-fields">
                    <span class="field-label">№ карточки:</span>
                    <input type="text" class="staff-card-number" data-snils="${emp.snils}" placeholder="001" value="${cardNumber}" style="width:70px;">
                    <span class="field-label">ID рабочего места:</span>
                    <input type="text" class="staff-workplace-id" data-snils="${emp.snils}" placeholder="РМ-001" value="${workplaceId}" style="width:90px;">
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
    
    document.querySelectorAll('.staff-card-number, .staff-workplace-id').forEach(input => {
        input.addEventListener('change', function() {
            const snils = this.dataset.snils;
            const cardNumber = document.querySelector(`.staff-card-number[data-snils="${snils}"]`)?.value || '';
            const workplaceId = document.querySelector(`.staff-workplace-id[data-snils="${snils}"]`)?.value || '';
            const checked = document.querySelector(`.ppe-card-staff-check[data-snils="${snils}"]`)?.checked || false;
            localStorage.setItem('ppeCardStaffData_' + snils, JSON.stringify({ cardNumber, workplaceId, checked }));
        });
    });
    
    document.querySelectorAll('.ppe-card-staff-check').forEach(cb => {
        cb.addEventListener('change', function() {
            const snils = this.dataset.snils;
            const cardNumber = document.querySelector(`.staff-card-number[data-snils="${snils}"]`)?.value || '';
            const workplaceId = document.querySelector(`.staff-workplace-id[data-snils="${snils}"]`)?.value || '';
            const checked = this.checked;
            localStorage.setItem('ppeCardStaffData_' + snils, JSON.stringify({ cardNumber, workplaceId, checked }));
        });
    });
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
    const el = document.getElementById('ppeCardCustomName');
    if (el) el.focus();
}

function getSelectedPPECardEmployees() {
    const checkboxes = document.querySelectorAll('.ppe-card-staff-check:checked');
    const all = getAllEmployees();
    const selected = [];
    checkboxes.forEach(cb => {
        const snils = cb.dataset.snils;
        const emp = all.find(e => e.snils === snils);
        if (emp) {
            const cardNumber = document.querySelector(`.staff-card-number[data-snils="${snils}"]`)?.value.trim() || '';
            const workplaceId = document.querySelector(`.staff-workplace-id[data-snils="${snils}"]`)?.value.trim() || '';
            selected.push({
                ...emp,
                cardNumber: cardNumber,
                workplaceId: workplaceId
            });
        }
    });
    return selected;
}

function clearPPECardSelection() {
    document.querySelectorAll('.ppe-card-staff-check').forEach(cb => cb.checked = false);
    document.querySelectorAll('.ppe-card-ppe-check').forEach(cb => cb.checked = false);
    selectedPPECardItems = [];
    
    const all = getAllEmployees();
    all.forEach(emp => {
        localStorage.removeItem('ppeCardStaffData_' + emp.snils);
    });
    
    renderPPECardStaffList();
    renderPPECardPPEList();
    const res = document.getElementById('ppeCardResult');
    if (res) res.classList.add('hidden');
    alert('✅ Выбор очищен');
}
// ============================================================
// ГЕНЕРАЦИЯ КАРТОЧЕК СИЗ - С ВЫБОРОМ КОЛИЧЕСТВА НА ЛИСТЕ
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
    
    const isDuty = document.querySelector('input[name="cardType"][value="duty"]')?.checked || false;
    const cardsPerPage = parseInt(document.querySelector('input[name="cardsPerPage"]:checked')?.value || '2');
    
    const gender = document.getElementById('ppeCardGender').value || 'М';
    const height = document.getElementById('ppeCardHeight').value.trim() || '';
    const clothesSize = document.getElementById('ppeCardClothesSize').value.trim() || '';
    const shoeSize = document.getElementById('ppeCardShoeSize').value.trim() || '';
    const manager = document.getElementById('ppeCardManager').value.trim() || '_______________';
    const managerPosition = document.getElementById('ppeCardManagerPosition').value.trim() || '_______________';
    
    const dutyDepartment = document.getElementById('dutyDepartment')?.value.trim() || '';
    const dutyResponsibleName = document.getElementById('dutyResponsibleName')?.value.trim() || '';
    const dutyResponsiblePosition = document.getElementById('dutyResponsiblePosition')?.value.trim() || '';
    const dutyOrder = document.getElementById('dutyOrder')?.value.trim() || '';
    
    const resultDiv = document.getElementById('ppeCardResult');
    const contentDiv = document.getElementById('ppeCardResultContent');
    
    let cardCount = 0;
    let totalPages = Math.ceil(employees.length / cardsPerPage);
    
    // Универсальная таблица СИЗ для лицевой стороны
    function buildPPETableFull(fullPage) {
        let rows = '';
        const rowHeight = fullPage ? '60px' : '38px';
        const cellPad = fullPage ? '8px 12px' : '6px 8px';
        const fontSize = fullPage ? '12px' : '11px';
        
        selectedPPECardItems.forEach((ppe) => {
            rows += `
                <tr>
                    <td style="border:1px solid #000;padding:${cellPad};font-size:${fontSize};height:${rowHeight};">${ppe.name}</td>
                    <td style="border:1px solid #000;padding:${cellPad};font-size:${fontSize};text-align:center;height:${rowHeight};">${ppe.punkt || ''}</td>
                    <td style="border:1px solid #000;padding:${cellPad};font-size:${fontSize};text-align:center;height:${rowHeight};">${ppe.unit || ''}</td>
                    <td style="border:1px solid #000;padding:${cellPad};font-size:${fontSize};text-align:center;height:${rowHeight};">${ppe.quantity || ''}</td>
                </tr>
            `;
        });
        
        const emptyRows = 4 - selectedPPECardItems.length;
        for (let i = 0; i < emptyRows; i++) {
            rows += `
                <tr>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};"></td>
                </tr>
            `;
        }
        return rows;
    }
    
    // ЛИЦЕВАЯ КАРТОЧКА - ЛИЧНАЯ
    function createPersonalFaceCard(emp, fullPage) {
        const dept = document.getElementById('ppeCardDepartment')?.value.trim() || '';
        const cardNumber = emp.cardNumber || '___';
        
        const fontSize = fullPage ? '13px' : '10px';
        const titleSize = fullPage ? '20px' : '15px';
        const subtitleSize = fullPage ? '17px' : '13px';
        const headerFontSize = fullPage ? '13px' : '10px';
        const pad = fullPage ? '6px 10px' : '6px 8px';
        
        const signHeight = fullPage ? '35px' : '26px';
        const signFontSize = fullPage ? '11px' : '9px';
        
        return `
            <div style="position:absolute;top:0;left:0;width:100%;height:${fullPage ? '100%' : '50%'};padding:${fullPage ? '20px 30px' : '10px 14px 8px 14px'};${fullPage ? '' : 'border-bottom:2px dashed #ff0000;'}overflow:hidden;display:flex;flex-direction:column;">
                <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:${fullPage ? '10px' : '4px'};margin-bottom:${fullPage ? '12px' : '6px'};flex-shrink:0;">
                    <div style="font-size:${titleSize};font-weight:bold;">ЛИЧНАЯ КАРТОЧКА N ${cardNumber}</div>
                    <div style="font-size:${subtitleSize};font-weight:bold;">учета выдачи СИЗ</div>
                </div>
                
                <table style="width:100%;border-collapse:collapse;font-size:${fontSize};margin-bottom:${fullPage ? '10px' : '4px'};flex-shrink:0;">
                    <tr>
                        <td style="width:55%;vertical-align:top;padding:${fullPage ? '6px 10px' : '2px 5px'};border:1px solid #000;">
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Фамилия</strong> ${emp.last_name}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Имя</strong> ${emp.first_name}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Отчество</strong> ${emp.middle_name || ''}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Табельный номер</strong> ________</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Структурное подразделение</strong> ${dept}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Профессия (должность)</strong> ${emp.position}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Дата поступления на работу</strong> __________</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Дата изменения профессии (должности) или перевода</strong> __________</div>
                        </td>
                        <td style="width:45%;vertical-align:top;padding:${fullPage ? '6px 10px' : '2px 5px'};border:1px solid #000;">
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Пол</strong> ${gender}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Рост</strong> ${height}</div>
                            <div style="margin-top:${fullPage ? '6px' : '3px'};"><strong>Размер:</strong></div>
                            <div style="padding-left:6px;margin:${fullPage ? '3px 0' : '1px 0'};"><strong>одежды</strong> ${clothesSize}</div>
                            <div style="padding-left:6px;margin:${fullPage ? '3px 0' : '1px 0'};"><strong>обуви</strong> ${shoeSize}</div>
                            <div style="padding-left:6px;margin:${fullPage ? '3px 0' : '1px 0'};"><strong>головного убора</strong> ___</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>СИЗОД</strong> ___</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>СИЗ рук</strong> ___________</div>
                        </td>
                    </tr>
                </table>
                
                <table style="width:100%;border-collapse:collapse;font-size:${headerFontSize};border:1px solid #000;flex:1;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000;padding:${pad};text-align:center;width:32%;font-size:${headerFontSize};font-weight:bold;">Наименование СИЗ</th>
                            <th style="border:1px solid #000;padding:${pad};text-align:center;width:22%;font-size:${headerFontSize};font-weight:bold;">Пункт Норм</th>
                            <th style="border:1px solid #000;padding:${pad};text-align:center;width:26%;font-size:${headerFontSize};font-weight:bold;">Единица измерения, периодичность выдачи</th>
                            <th style="border:1px solid #000;padding:${pad};text-align:center;width:20%;font-size:${headerFontSize};font-weight:bold;">Количество на период</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${buildPPETableFull(fullPage)}
                    </tbody>
                </table>
                
                <div style="margin-top:${fullPage ? '20px' : '10px'};font-size:${fontSize};flex-shrink:0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;align-items:end;">
                    <div style="text-align:center;">
                        <div style="font-size:${fontSize};margin-bottom:2px;min-height:${fullPage ? '22px' : '16px'};">${managerPosition}</div>
                        <div style="border-bottom:1px solid transparent;height:${signHeight};"></div>
                        <div style="font-size:${signFontSize};color:#333;margin-top:2px;">(должность)</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:${fontSize};margin-bottom:2px;min-height:${fullPage ? '22px' : '16px'};">&nbsp;</div>
                        <div style="border-bottom:1px solid #000;height:${signHeight};"></div>
                        <div style="font-size:${signFontSize};color:#333;margin-top:2px;">(подпись)</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:${fontSize};margin-bottom:2px;min-height:${fullPage ? '22px' : '16px'};">${manager}</div>
                        <div style="border-bottom:1px solid transparent;height:${signHeight};"></div>
                        <div style="font-size:${signFontSize};color:#333;margin-top:2px;">(фамилия, инициалы)</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ЛИЦЕВАЯ КАРТОЧКА - ДЕЖУРНАЯ
    function createDutyFaceCard(emp, fullPage) {
        const cardNumber = emp.cardNumber || '___';
        const workplaceId = emp.workplaceId || '________';
        
        const fontSize = fullPage ? '12px' : '10px';
        const titleSize = fullPage ? '16px' : '13px';
        const subtitleSize = fullPage ? '15px' : '12px';
        const smallSize = fullPage ? '11px' : '10px';
        const headerFontSize = fullPage ? '13px' : '10px';
        const pad = fullPage ? '6px 10px' : '4px 6px';
        
        const signHeight = fullPage ? '35px' : '26px';
        const signFontSize = fullPage ? '11px' : '9px';
        
        return `
            <div style="position:absolute;top:0;left:0;width:100%;height:${fullPage ? '100%' : '50%'};padding:${fullPage ? '20px 30px' : '10px 14px 8px 14px'};${fullPage ? '' : 'border-bottom:2px dashed #ff0000;'}overflow:hidden;display:flex;flex-direction:column;">
                <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:${fullPage ? '10px' : '4px'};margin-bottom:${fullPage ? '12px' : '6px'};flex-shrink:0;">
                    <div style="font-size:${fullPage ? '14px' : '12px'};font-weight:bold;color:#555;">Приложение N 3</div>
                    <div style="font-size:${smallSize};color:#555;">к Правилам обеспечения работников средствами индивидуальной защиты</div>
                    <div style="font-size:${smallSize};color:#555;">и смывающими средствами, утвержденным приказом Минтруда России</div>
                    <div style="font-size:${smallSize};color:#555;margin-bottom:4px;">от 29 октября 2021 г. N 766н</div>
                    <div style="font-size:${titleSize};font-weight:bold;">КАРТОЧКА N ${cardNumber}</div>
                    <div style="font-size:${subtitleSize};font-weight:bold;">учета выдачи дежурных СИЗ</div>
                </div>
                
                <div style="font-size:${fontSize};margin-bottom:${fullPage ? '10px' : '4px'};flex-shrink:0;">
                    <div style="margin:${fullPage ? '4px 0' : '1px 0'};"><strong>Идентификатор рабочего места, за которым закреплены дежурные СИЗ:</strong> ${workplaceId}</div>
                    <div style="margin:${fullPage ? '4px 0' : '1px 0'};"><strong>Структурное подразделение</strong> ${dutyDepartment || '________________'}</div>
                    <div style="margin:${fullPage ? '4px 0' : '1px 0'};"><strong>Фамилия, имя, отчество (при наличии) ответственного</strong> ${dutyResponsibleName || '________________'}</div>
                    <div style="margin:${fullPage ? '4px 0' : '1px 0'};"><strong>Профессия (должность) ответственного</strong> ${dutyResponsiblePosition || '________________'}</div>
                    <div style="margin:${fullPage ? '4px 0' : '1px 0'};"><strong>Предусмотрена приказом (номер и дата приказа об утверждении Норм) выдача:</strong> ${dutyOrder || '________________'}</div>
                </div>
                
                <table style="width:100%;border-collapse:collapse;font-size:${headerFontSize};border:1px solid #000;flex:1;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000;padding:${pad};text-align:center;width:32%;font-size:${headerFontSize};font-weight:bold;">Наименование СИЗ</th>
                            <th style="border:1px solid #000;padding:${pad};text-align:center;width:22%;font-size:${headerFontSize};font-weight:bold;">Пункт Норм</th>
                            <th style="border:1px solid #000;padding:${pad};text-align:center;width:26%;font-size:${headerFontSize};font-weight:bold;">Единица измерения, периодичность выдачи</th>
                            <th style="border:1px solid #000;padding:${pad};text-align:center;width:20%;font-size:${headerFontSize};font-weight:bold;">Количество на период</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${buildPPETableFull(fullPage)}
                    </tbody>
                </table>
                
                <div style="margin-top:${fullPage ? '20px' : '8px'};font-size:${fontSize};flex-shrink:0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;align-items:end;">
                    <div style="text-align:center;">
                        <div style="font-size:${fontSize};margin-bottom:2px;min-height:${fullPage ? '22px' : '16px'};">Ответственное лицо</div>
                        <div style="border-bottom:1px solid transparent;height:${signHeight};"></div>
                        <div style="font-size:${signFontSize};color:#333;margin-top:2px;">&nbsp;</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:${fontSize};margin-bottom:2px;min-height:${fullPage ? '22px' : '16px'};">&nbsp;</div>
                        <div style="border-bottom:1px solid #000;height:${signHeight};"></div>
                        <div style="font-size:${signFontSize};color:#333;margin-top:2px;">(подпись)</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:${fontSize};margin-bottom:2px;min-height:${fullPage ? '22px' : '16px'};">${manager}</div>
                        <div style="border-bottom:1px solid transparent;height:${signHeight};"></div>
                        <div style="font-size:${signFontSize};color:#333;margin-top:2px;">(фамилия, инициалы)</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ОБОРОТНАЯ КАРТОЧКА (с заголовками Выдано/Возвращено)
    function createReverseCard(emp, fullPage) {
        const headerFontSize = fullPage ? '11px' : '8px';
        const subHeaderFontSize = fullPage ? '10px' : '7px';
        const cellPad = fullPage ? '6px 8px' : '4px 6px';
        const rowHeight = fullPage ? '50px' : '30px';
        
        let rows = '';
        selectedPPECardItems.forEach((ppe) => {
            rows += `
                <tr>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};font-weight:bold;">${ppe.name}</td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                </tr>
            `;
        });
        
        const emptyRows = 6 - selectedPPECardItems.length;
        for (let i = 0; i < emptyRows; i++) {
            rows += `
                <tr>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                    <td style="border:1px solid #000;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '11px' : '9px'};"></td>
                </tr>
            `;
        }
        
        return `
            <div style="position:absolute;top:0;left:0;width:100%;height:${fullPage ? '100%' : '50%'};padding:${fullPage ? '20px 30px' : '10px 14px 8px 14px'};${fullPage ? '' : 'border-bottom:2px dashed #ff0000;'}overflow:hidden;display:flex;flex-direction:column;">
                <div style="text-align:center;font-size:${fullPage ? '16px' : '13px'};font-weight:bold;margin-bottom:${fullPage ? '12px' : '6px'};flex-shrink:0;">Оборотная сторона</div>
                
                <table style="width:100%;border-collapse:collapse;font-size:${headerFontSize};border:1px solid #000;flex:1;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;width:11%;font-size:${headerFontSize};font-weight:bold;" rowspan="2">Наименование СИЗ</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;width:12%;font-size:${headerFontSize};font-weight:bold;" rowspan="2">Модель, марка, артикул, класс защиты СИЗ</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${headerFontSize};font-weight:bold;" colspan="3">Выдано</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${headerFontSize};font-weight:bold;" colspan="3">Возвращено</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;width:10%;font-size:${headerFontSize};font-weight:bold;" rowspan="2">Акт списания (дата, номер)</th>
                        </tr>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">дата</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">кол-во</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">подпись получившего СИЗ</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">дата</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">кол-во</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">подпись сдавшего СИЗ</th>
                        </tr>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">1</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">2</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">3</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">4</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">5</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">6</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">7</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">8</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">9</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    let allPagesHTML = '';
    let cardIndex = 0;
    
    if (cardsPerPage === 2) {
        for (let i = 0; i < employees.length; i += 2) {
            const emp1 = employees[i];
            const emp2 = employees[i + 1] || null;
            cardIndex++;
            cardCount += emp2 ? 2 : 1;
            
            const faceCardFunc = isDuty ? createDutyFaceCard : createPersonalFaceCard;
            
            let facePageHTML = `
            <div style="page-break-after:always;position:relative;width:100%;height:297mm;margin:0 auto;background:#fff;color:#000;border:1px solid #999;box-sizing:border-box;overflow:hidden;font-family:'Times New Roman',Times,serif;">
                ${faceCardFunc(emp1, false)}
                ${emp2 ? faceCardFunc(emp2, false).replace('top:0', 'top:50%').replace('border-bottom', 'border-top') : `<div style="position:absolute;top:50%;left:0;width:100%;height:50%;display:flex;align-items:center;justify-content:center;color:#999;font-size:20px;border-top:1px dashed #ddd;">ПУСТАЯ КАРТОЧКА</div>`}
                <div style="position:absolute;top:50%;left:0;width:100%;height:2px;border-top:2px dashed #ff0000;z-index:10;"></div>
            </div>
            `;
            
            let reversePageHTML = `
            <div style="page-break-after:always;position:relative;width:100%;height:297mm;margin:0 auto;background:#fff;color:#000;border:1px solid #999;box-sizing:border-box;overflow:hidden;font-family:'Times New Roman',Times,serif;">
                ${createReverseCard(emp1, false)}
                ${emp2 ? createReverseCard(emp2, false).replace('top:0', 'top:50%').replace('border-bottom', 'border-top') : `<div style="position:absolute;top:50%;left:0;width:100%;height:50%;display:flex;align-items:center;justify-content:center;color:#999;font-size:20px;border-top:1px dashed #ddd;">ПУСТАЯ ОБОРОТНАЯ СТОРОНА</div>`}
                <div style="position:absolute;top:50%;left:0;width:100%;height:2px;border-top:2px dashed #ff0000;z-index:10;"></div>
            </div>
            `;
            
            allPagesHTML += facePageHTML + reversePageHTML;
        }
    } else {
        employees.forEach(emp => {
            cardCount++;
            
            const faceCardFunc = isDuty ? createDutyFaceCard : createPersonalFaceCard;
            
            let facePageHTML = `
            <div style="page-break-after:always;position:relative;width:100%;height:297mm;margin:0 auto;background:#fff;color:#000;border:1px solid #999;box-sizing:border-box;overflow:hidden;font-family:'Times New Roman',Times,serif;">
                ${faceCardFunc(emp, true)}
            </div>
            `;
            
            let reversePageHTML = `
            <div style="page-break-after:always;position:relative;width:100%;height:297mm;margin:0 auto;background:#fff;color:#000;border:1px solid #999;box-sizing:border-box;overflow:hidden;font-family:'Times New Roman',Times,serif;">
                ${createReverseCard(emp, true)}
            </div>
            `;
            
            allPagesHTML += facePageHTML + reversePageHTML;
        });
    }
    
    const win = window.open('', '_blank');
    if (!win) {
        alert('❌ Браузер заблокировал открытие нового окна. Разрешите всплывающие окна для этого сайта.');
        return;
    }
    
    const cardTypeName = isDuty ? 'ДЕЖУРНЫХ' : 'ЛИЧНЫХ';
    const modeText = cardsPerPage === 2 ? '2 карточки на лист' : '1 карточка на лист';
    
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Карточки учета СИЗ</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Times New Roman', Times, serif; background: #f0f0f0; padding: 0; margin: 0; }
                @page { size: A4 portrait; margin: 0; }
                @media print {
                    body { background: #fff; padding: 0; margin: 0; }
                    .no-print { display: none; }
                    div[style*="page-break-after:always"] { page-break-after: always; }
                    div[style*="border-top:2px dashed #ff0000"] { border-top: 1px dashed #ccc !important; }
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
                .no-print button:hover { transform: scale(1.02); }
                .no-print .btn-secondary { background: #666; }
                @media print { .no-print { display: none !important; } }
            </style>
        </head>
        <body>
            <div class="no-print">
                <h3>🖨️ Карточки ${cardTypeName} готовы к печати (${cardCount} шт., ${modeText})</h3>
                <button onclick="window.print()">🖨️ Печать</button>
                <button class="btn-secondary" onclick="window.close()">✖ Закрыть</button>
                <p style="font-size:11px;color:#666;margin-top:4px;">📄 ${modeText}</p>
                <p style="font-size:10px;color:#888;">📋 У каждого сотрудника свой номер карточки и ID рабочего места</p>
                <p style="font-size:10px;color:#888;">📊 На оборотной стороне: заголовки "Выдано" и "Возвращено"</p>
                <p style="font-size:10px;color:#888;">📋 Всего листов: ${totalPages * 2}</p>
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
        <p>✅ Создано ${cardTypeName.toLowerCase()} карточек: <strong>${cardCount}</strong></p>
        <p>📋 Режим: <strong>${modeText}</strong></p>
        <p>📋 Сотрудники: ${employees.map(e => `${e.last_name} ${e.first_name} (№${e.cardNumber || '___'})`).join(', ')}</p>
        <p>🦺 СИЗ: ${selectedPPECardItems.map(e => e.name).join(', ')}</p>
        <p style="color:#8888aa;font-size:13px;margin-top:8px;">🖨️ Откроется новое окно для печати.</p>
        <p style="color:#8888aa;font-size:12px;">📄 Всего листов: ${totalPages * 2}</p>
        <p style="color:#8888aa;font-size:12px;">📋 Режим: ${modeText}</p>
    `;
}

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ ТИПА КАРТОЧКИ
// ============================================================
function toggleCardType() {
    const isDuty = document.querySelector('input[name="cardType"][value="duty"]')?.checked || false;
    const dutyFields = document.getElementById('dutyFields');
    const personalFields = document.getElementById('personalFields');
    
    if (isDuty) {
        if (dutyFields) dutyFields.style.display = 'block';
        if (personalFields) personalFields.style.display = 'none';
    } else {
        if (dutyFields) dutyFields.style.display = 'none';
        if (personalFields) personalFields.style.display = 'block';
    }
}
// ============================================================
// РАЗДЕЛ "МЕДОСМОТРЫ" - ВИДЫ ДЕЯТЕЛЬНОСТИ ПО ПРИКАЗУ №342н
// ============================================================
const PSYCHO_ACTIVITIES = [
    { id: 1, title: 'Деятельность, связанная с управлением транспортными средствами или управлением движением транспортных средств по профессиям и должностям согласно перечню работ, профессий, должностей, непосредственно связанных с управлением транспортными средствами или управлением движением транспортных средств' },
    { id: 2, title: 'Деятельность, связанная с производством, транспортировкой, хранением и применением взрывчатых материалов и веществ' },
    { id: 3, title: 'Деятельность в области использования атомной энергии, осуществляемая работниками объектов использования атомной энергии при наличии у них разрешений, выдаваемых органами Федеральной службы по экологическому, технологическому и атомному надзору' },
    { id: 4, title: 'Деятельность, связанная с оборотом оружия' },
    { id: 5, title: 'Деятельность, связанная с проведением аварийно-спасательных работ, а также с работой, выполняемой пожарной охраной при тушении пожаров' },
    { id: 6, title: 'Деятельность, непосредственно связанная с управлением подъемными механизмами (кранами), подлежащими учету в органах Федеральной службы по экологическому, технологическому и атомному надзору' },
    { id: 7, title: 'Деятельность по непосредственному забору, очистке и распределению воды питьевых нужд систем централизованного водоснабжения' },
    { id: 8, title: 'Педагогическая деятельность в организациях, осуществляющих образовательную деятельность' },
    { id: 9, title: 'Деятельность по присмотру и уходу за детьми' },
    { id: 11, title: 'Деятельность в сфере электроэнергетики, связанная с организацией и осуществлением монтажа, наладки, технического обслуживания, ремонта, управления режимом работы электроустановок' },
    { id: 12, title: 'Деятельность в сфере теплоснабжения, связанная с организацией и осуществлением монтажа, наладки, технического обслуживания, ремонта, управления режимом работы объектов теплоснабжения' },
    { id: 13, title: 'Деятельность, непосредственно связанная с обслуживанием оборудования, работающего под избыточным давлением более 0,07 МПа и подлежащего учету в органах Федеральной службы по экологическому, технологическому и атомному надзору: пара, газа (в газообразном, сжиженном состоянии); воды при температуре более 115 °С; иных жидкостей при температуре, превышающей температуру их кипения при избыточном давлении 0,07 МПа' },
    { id: 14, title: 'Деятельность, непосредственно связанная с диспетчеризацией производственных процессов в химической (нефтехимической) промышленности, включая деятельность операторов производственного оборудования в химической (нефтехимической) промышленности (при производстве химических веществ 1 и 2 классов опасности)' },
    { id: 15, title: 'Деятельность, связанная с добычей угля подземным способом' },
    { id: 16, title: 'Деятельность, связанная с эксплуатацией, ремонтом скважин и установок при переработке высокосернистой нефти, очистке нефти и газа от сероводорода, очистке нефтеналивных судов, цистерн, резервуаров, добычей и обработкой озокерита, экстракционноозокеритовым производством' },
    { id: 17, title: 'Деятельность, непосредственно связанная с контактами с возбудителями инфекционных заболеваний - патогенными микроорганизмами I и II группы патогенности, возбудителями особо опасных инфекций, а также с биологическими токсинами (микробного, растительного и животного происхождения) или с доступом к указанным субстанциям' }
];

// ============================================================
// ИНИЦИАЛИЗАЦИЯ РАЗДЕЛА "МЕДОСМОТРЫ"
// ============================================================
function initMedPage() {
    renderMedOrgSelects();
    const today = new Date().toISOString().split('T')[0];
    const medDate = document.getElementById('medDate');
    const psychoDate = document.getElementById('psychoDate');
    if (medDate && !medDate.value) medDate.value = today;
    if (psychoDate && !psychoDate.value) psychoDate.value = today;
    showMedTab('med');
}

function renderMedOrgSelects() {
    const orgSelect = document.getElementById('medOrgSelect');
    if (orgSelect) {
        const orgs = getOrgs();
        orgSelect.innerHTML = '<option value="">-- Выберите организацию --</option>';
        orgs.forEach(org => {
            const opt = document.createElement('option');
            opt.value = org.id;
            opt.textContent = `${org.name} (${org.inn})`;
            orgSelect.appendChild(opt);
        });
        const currentOrgId = localStorage.getItem('currentOrgId');
        if (currentOrgId) orgSelect.value = currentOrgId;
    }
    const psychoOrgSelect = document.getElementById('psychoOrgSelect');
    if (psychoOrgSelect) {
        const orgs = getOrgs();
        psychoOrgSelect.innerHTML = '<option value="">-- Выберите организацию --</option>';
        orgs.forEach(org => {
            const opt = document.createElement('option');
            opt.value = org.id;
            opt.textContent = `${org.name} (${org.inn})`;
            psychoOrgSelect.appendChild(opt);
        });
        const currentOrgId = localStorage.getItem('currentOrgId');
        if (currentOrgId) psychoOrgSelect.value = currentOrgId;
    }
    const medOrgSelect = document.getElementById('medMedOrgSelect');
    if (medOrgSelect) {
        const medOrgs = getMedOrgs();
        medOrgSelect.innerHTML = '<option value="">-- Выберите медорганизацию --</option>';
        medOrgs.forEach(org => {
            const opt = document.createElement('option');
            opt.value = org.id;
            opt.textContent = `${org.name}${org.ogrn ? ' (ОГРН: ' + org.ogrn + ')' : ''}`;
            medOrgSelect.appendChild(opt);
        });
    }
    const psychoMedOrgSelect = document.getElementById('psychoMedOrgSelect');
    if (psychoMedOrgSelect) {
        const medOrgs = getMedOrgs();
        psychoMedOrgSelect.innerHTML = '<option value="">-- Выберите медорганизацию --</option>';
        medOrgs.forEach(org => {
            const opt = document.createElement('option');
            opt.value = org.id;
            opt.textContent = `${org.name}${org.ogrn ? ' (ОГРН: ' + org.ogrn + ')' : ''}`;
            psychoMedOrgSelect.appendChild(opt);
        });
    }
}

function showMedTab(name) {
    document.querySelectorAll('#medPage .tab button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#medPage [id^="medTab"]').forEach(t => t.classList.add('hidden'));
    
    if (name === 'med') {
        const el = document.getElementById('medTabMed');
        if (el) el.classList.remove('hidden');
        document.querySelector('#medPage .tab button:nth-child(1)')?.classList.add('active');
        renderMedEmployeeList('med');
    } else if (name === 'psycho') {
        const el = document.getElementById('medTabPsycho');
        if (el) el.classList.remove('hidden');
        document.querySelector('#medPage .tab button:nth-child(2)')?.classList.add('active');
        renderMedEmployeeList('psycho');
    }
}

function renderMedEmployeeList(mode = 'med') {
    const container = document.getElementById(mode === 'med' ? 'medEmployeeList' : 'psychoEmployeeList');
    if (!container) return;
    const all = getAllEmployees();
    
    if (all.length === 0) {
        container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">Нет загруженных сотрудников.</p>';
        return;
    }
    
    const services = getServices();
    const servicesOptions = services.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    
    let html = '<div style="max-height:500px;overflow-y:auto;">';
    all.forEach(emp => {
        const savedMed = JSON.parse(localStorage.getItem(`medData_${emp.snils}`) || '{}');
        const savedPsycho = JSON.parse(localStorage.getItem(`psychoData_${emp.snils}`) || '{}');
        
        if (mode === 'med') {
            const factors = savedMed.factors || emp.medFactors || '';
            const checked = savedMed.checked || false;
            const birthDate = savedMed.birthDate || emp.birthDate || '';
            const gender = savedMed.gender || emp.gender || '';
            const policy = savedMed.policy || emp.policyNumber || '';
            const service = savedMed.service || emp.department || '';
            
            html += `
                <div data-snils="${emp.snils}" style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
                        <input type="checkbox" class="med-check" data-snils="${emp.snils}" ${checked ? 'checked' : ''} style="width:18px;height:18px;accent-color:#7c3aed;">
                        <span class="emp-name" style="color:#00d4ff;font-size:14px;">${emp.last_name} ${emp.first_name}</span>
                        <span style="color:#8888aa;font-size:13px;">${emp.position}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 2fr;gap:8px;">
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Дата рождения</label>
                            <input type="date" class="med-birth-date" data-snils="${emp.snils}" value="${birthDate}" style="width:100%;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Пол</label>
                            <select class="med-gender" data-snils="${emp.snils}" style="width:100%;padding:6px 8px;background:#1a1a3e;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                                <option value="">--</option>
                                <option value="М" ${gender === 'М' ? 'selected' : ''}>М</option>
                                <option value="Ж" ${gender === 'Ж' ? 'selected' : ''}>Ж</option>
                            </select>
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">№ полиса</label>
                            <input type="text" class="med-policy" data-snils="${emp.snils}" value="${policy}" placeholder="1234 5678..." style="width:100%;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Служба</label>
                            <select class="med-service" data-snils="${emp.snils}" style="...">
    <option value="">--</option>
    ${(() => {
        const allServices = services.map(s => s.name);
        if (service && !allServices.includes(service)) {
            allServices.unshift(service);
        }
        return allServices.map(name => 
            `<option value="${name}" ${service === name ? 'selected' : ''}>${name}${!services.some(s => s.name === name) && name ? ' (из штатки)' : ''}</option>`
        ).join('');
    })()}
</select>
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Вредные факторы (Приказ №29н)</label>
                            <input type="text" class="med-factors" data-snils="${emp.snils}" value="${factors}" placeholder="4.3.1, 4.3.2, 18.1" style="width:100%;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (mode === 'psycho') {
            const activityId = savedPsycho.activityId || emp.psychoActivity || '';
            const checked = savedPsycho.checked || false;
            const birthDate = savedPsycho.birthDate || emp.birthDate || '';
            const gender = savedPsycho.gender || emp.gender || '';
            const regAddress = savedPsycho.regAddress || emp.registrationAddress || '';
            const service = savedPsycho.service || emp.department || '';
            
            const activityOptions = PSYCHO_ACTIVITIES.map(a => 
                `<option value="${a.id}" ${activityId == a.id ? 'selected' : ''}>${a.id}. ${a.title.substring(0, 60)}${a.title.length > 60 ? '...' : ''}</option>`
            ).join('');
            
            html += `
                <div data-snils="${emp.snils}" style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
                        <input type="checkbox" class="psycho-check" data-snils="${emp.snils}" ${checked ? 'checked' : ''} style="width:18px;height:18px;accent-color:#7c3aed;">
                        <span class="emp-name" style="color:#00d4ff;font-size:14px;">${emp.last_name} ${emp.first_name}</span>
                        <span style="color:#8888aa;font-size:13px;">${emp.position}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 2fr;gap:8px;">
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Дата рождения</label>
                            <input type="date" class="psycho-birth-date" data-snils="${emp.snils}" value="${birthDate}" style="width:100%;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Пол</label>
                            <select class="psycho-gender" data-snils="${emp.snils}" style="width:100%;padding:6px 8px;background:#1a1a3e;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                                <option value="">--</option>
                                <option value="М" ${gender === 'М' ? 'selected' : ''}>М</option>
                                <option value="Ж" ${gender === 'Ж' ? 'selected' : ''}>Ж</option>
                            </select>
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Адрес регистрации</label>
                            <input type="text" class="psycho-address" data-snils="${emp.snils}" value="${regAddress}" placeholder="г. ..., ул. ..." style="width:100%;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Служба</label>
                            <select class="psycho-service" data-snils="${emp.snils}" style="width:100%;padding:6px 8px;background:#1a1a3e;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                                <option value="">--</option>
                                ${services.map(s => `<option value="${s.name}" ${service === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Вид деятельности (Приказ №342н)</label>
                            <select class="psycho-activity" data-snils="${emp.snils}" style="width:100%;padding:6px 8px;background:#1a1a3e;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                                <option value="">-- Выберите вид --</option>
                                ${activityOptions}
                            </select>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    html += '</div>';
    container.innerHTML = html;
    
    if (mode === 'med') {
        container.querySelectorAll('.med-check, .med-birth-date, .med-gender, .med-policy, .med-factors, .med-service').forEach(el => {
            el.addEventListener('change', saveMedData);
            el.addEventListener('input', saveMedData);
        });
    }
    if (mode === 'psycho') {
        container.querySelectorAll('.psycho-check, .psycho-birth-date, .psycho-gender, .psycho-address, .psycho-activity, .psycho-service').forEach(el => {
            el.addEventListener('change', savePsychoData);
            el.addEventListener('input', savePsychoData);
        });
    }
}

function saveMedData() {
    const snils = this.dataset.snils;
    const checked = document.querySelector(`.med-check[data-snils="${snils}"]`)?.checked || false;
    const birthDate = document.querySelector(`.med-birth-date[data-snils="${snils}"]`)?.value || '';
    const gender = document.querySelector(`.med-gender[data-snils="${snils}"]`)?.value || '';
    const policy = document.querySelector(`.med-policy[data-snils="${snils}"]`)?.value || '';
    const factors = document.querySelector(`.med-factors[data-snils="${snils}"]`)?.value || '';
    const service = document.querySelector(`.med-service[data-snils="${snils}"]`)?.value || '';
    
    localStorage.setItem(`medData_${snils}`, JSON.stringify({ checked, birthDate, gender, policy, factors, service }));
    
    const data = getStaffData();
    let found = false;
    for (const [dept, deptData] of Object.entries(data.departments)) {
        const idx = deptData.employees.findIndex(e => e.snils === snils);
        if (idx !== -1) {
            deptData.employees[idx].birthDate = birthDate;
            deptData.employees[idx].gender = gender;
            deptData.employees[idx].policyNumber = policy;
            deptData.employees[idx].medFactors = factors;
            deptData.employees[idx].department = service;
            found = true;
            break;
        }
    }
    if (!found) {
        const idx = data.unassigned.findIndex(e => e.snils === snils);
        if (idx !== -1) {
            data.unassigned[idx].birthDate = birthDate;
            data.unassigned[idx].gender = gender;
            data.unassigned[idx].policyNumber = policy;
            data.unassigned[idx].medFactors = factors;
            data.unassigned[idx].department = service;
        }
    }
    saveStaffData(data);
}

function savePsychoData() {
    const snils = this.dataset.snils;
    const checked = document.querySelector(`.psycho-check[data-snils="${snils}"]`)?.checked || false;
    const birthDate = document.querySelector(`.psycho-birth-date[data-snils="${snils}"]`)?.value || '';
    const gender = document.querySelector(`.psycho-gender[data-snils="${snils}"]`)?.value || '';
    const regAddress = document.querySelector(`.psycho-address[data-snils="${snils}"]`)?.value || '';
    const activityId = document.querySelector(`.psycho-activity[data-snils="${snils}"]`)?.value || '';
    const service = document.querySelector(`.psycho-service[data-snils="${snils}"]`)?.value || '';
    
    localStorage.setItem(`psychoData_${snils}`, JSON.stringify({ checked, birthDate, gender, regAddress, activityId, service }));
    
    const data = getStaffData();
    let found = false;
    for (const [dept, deptData] of Object.entries(data.departments)) {
        const idx = deptData.employees.findIndex(e => e.snils === snils);
        if (idx !== -1) {
            deptData.employees[idx].birthDate = birthDate;
            deptData.employees[idx].gender = gender;
            deptData.employees[idx].registrationAddress = regAddress;
            deptData.employees[idx].psychoActivity = activityId;
            deptData.employees[idx].department = service;
            found = true;
            break;
        }
    }
    if (!found) {
        const idx = data.unassigned.findIndex(e => e.snils === snils);
        if (idx !== -1) {
            data.unassigned[idx].birthDate = birthDate;
            data.unassigned[idx].gender = gender;
            data.unassigned[idx].registrationAddress = regAddress;
            data.unassigned[idx].psychoActivity = activityId;
            data.unassigned[idx].department = service;
        }
    }
    saveStaffData(data);
}

function filterMedEmployees(mode) {
    const input = document.getElementById(mode === 'med' ? 'medSearchInput' : 'psychoSearchInput');
    const query = (input?.value || '').toLowerCase().trim();
    const container = document.getElementById(mode === 'med' ? 'medEmployeeList' : 'psychoEmployeeList');
    if (!container) return;
    
    const items = container.querySelectorAll('[data-snils]');
    items.forEach(item => {
        const nameEl = item.querySelector('.emp-name');
        const name = (nameEl?.textContent || '').toLowerCase();
        item.style.display = (query === '' || name.includes(query)) ? '' : 'none';
    });
}

const service = emp.department || '';
    const orgId = document.getElementById('medOrgSelect')?.value;
    const medOrgId = document.getElementById('medMedOrgSelect')?.value;
    const directionType = document.getElementById('medDirectionType')?.value || 'ПРЕДВАРИТЕЛЬНЫЙ';
    const directionNumber = document.getElementById('medDirectionNumber')?.value || '___';
    const directionDate = document.getElementById('medDate')?.value || new Date().toISOString().split('T')[0];
    
    if (!orgId) { alert('❌ Выберите организацию!'); return; }
    if (!medOrgId) { alert('❌ Выберите медицинскую организацию!'); return; }
    
    const org = getOrgs().find(o => o.id === parseInt(orgId));
    const medOrg = getMedOrgs().find(o => o.id === parseInt(medOrgId));
    if (!org || !medOrg) { alert('❌ Организация не найдена!'); return; }
    
    const checkboxes = document.querySelectorAll('.med-check:checked');
    if (checkboxes.length === 0) { alert('❌ Выберите хотя бы одного сотрудника!'); return; }
    
    let allDirectionsHTML = '';
    let count = 0;
    
    checkboxes.forEach(cb => {
        const snils = cb.dataset.snils;
        const emp = getAllEmployees().find(e => e.snils === snils);
        if (!emp) return;
        
        const savedMed = JSON.parse(localStorage.getItem(`medData_${snils}`) || '{}');
        const birthDate = savedMed.birthDate || emp.birthDate || '';
        const gender = savedMed.gender || emp.gender || '';
        const policy = savedMed.policy || emp.policyNumber || '';
        const factors = savedMed.factors || emp.medFactors || '';
        const service = savedMed.service || emp.department || '';
        
        count++;
        
        allDirectionsHTML += `
        <div style="page-break-after:always;padding:20px 30px;font-family:'Times New Roman',Times,serif;font-size:12pt;color:#000;background:#fff;width:100%;min-height:297mm;box-sizing:border-box;position:relative;">
            <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:20px;">
                <div style="font-size:14pt;font-weight:bold;">${org.name}</div>
                <div style="font-size:10pt;color:#555;">${org.email || ''}${org.email && org.phone ? ', ' : ''}${org.phone || ''}</div>
                ${org.okved ? `<div style="font-size:10pt;color:#555;">ОКВЭД ${org.okved}</div>` : ''}
            </div>
            
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:12pt;font-weight:bold;">${medOrg.name}</div>
                <div style="font-size:10pt;color:#555;">${medOrg.address || ''}${medOrg.ogrn ? ', ОГРН ' + medOrg.ogrn : ''}</div>
                ${medOrg.phone ? `<div style="font-size:10pt;color:#555;">тел. ${medOrg.phone}</div>` : ''}
            </div>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;font-size:12pt;">
                <div><strong>Дата выдачи:</strong> ${formatDate(directionDate)}</div>
                <div><strong>№:</strong> ${directionNumber}</div>
            </div>
            
            <div style="text-align:center;font-size:14pt;font-weight:bold;margin:30px 0 20px;">Направление на медицинский осмотр</div>
            <div style="text-align:center;font-size:12pt;font-weight:bold;margin-bottom:30px;">${directionType}</div>
            
            <table style="width:100%;border-collapse:collapse;font-size:11pt;margin-bottom:20px;">
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;width:35%;"><strong>Ф.И.О. работника:</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</td></tr>
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;"><strong>Дата рождения:</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${formatDate(birthDate)}</td></tr>
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;"><strong>Пол работника:</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${gender}</td></tr>
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;"><strong>Наименование структурного подразделения:</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${service}</td></tr>
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;"><strong>Наименование должности:</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${emp.position}</td></tr>
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;"><strong>Вредные и (или) опасные факторы, виды работ (Приказ № 29н):</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${factors}</td></tr>
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;"><strong>№ страхового полиса и (или) ДМС:</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${policy}</td></tr>
            </table>
            
            <div style="margin-bottom:40px;font-size:11pt;">
                <div><strong>Сведения о заключениях предварительного/периодического МО, выданных ранее:</strong></div>
                <div style="border-bottom:1px solid #000;height:30px;margin-top:5px;"></div>
            </div>
            
            <div style="margin-top:60px;font-size:12pt;">
                <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
                    <colgroup>
                        <col style="width:40%;">
                        <col style="width:60%;">
                    </colgroup>
                    <tr>
                        <td style="vertical-align:bottom;padding:0 5px;">
                            <div style="border-bottom:1px solid #000;height:35px;"></div>
                            <div style="font-size:10pt;text-align:center;margin-top:3px;">(подпись)</div>
                        </td>
                        <td style="vertical-align:bottom;padding:0 5px;text-align:center;">
                            <div style="font-size:11pt;">${getSelectedPersonName() || '________________________'}</div>
                            <div style="font-size:10pt;color:#555;">${getSelectedPersonPosition() || 'Ф.И.О., должность'}</div>
                        </td>
                    </tr>
                </table>
                <div style="margin-top:40px;font-size:12pt;text-align:center;">М.П.</div>
            </div>
        </div>
        `;
    });
    
    openPrintWindow(allDirectionsHTML, `Направления на медосмотр (${count} шт.)`);
}

function generatePsychoDirections() {
    const orgId = document.getElementById('psychoOrgSelect')?.value;
    const medOrgId = document.getElementById('psychoMedOrgSelect')?.value;
    const directionDate = document.getElementById('psychoDate')?.value || new Date().toISOString().split('T')[0];
    
    if (!orgId) { alert('❌ Выберите организацию!'); return; }
    if (!medOrgId) { alert('❌ Выберите медицинскую организацию!'); return; }
    
    const org = getOrgs().find(o => o.id === parseInt(orgId));
    const medOrg = getMedOrgs().find(o => o.id === parseInt(medOrgId));
    if (!org || !medOrg) { alert('❌ Организация не найдена!'); return; }
    
    const checkboxes = document.querySelectorAll('.psycho-check:checked');
    if (checkboxes.length === 0) { alert('❌ Выберите хотя бы одного сотрудника!'); return; }
    
    let allDirectionsHTML = '';
    let count = 0;
    
    checkboxes.forEach(cb => {
        const snils = cb.dataset.snils;
        const emp = getAllEmployees().find(e => e.snils === snils);
        if (!emp) return;
        
        const savedPsycho = JSON.parse(localStorage.getItem(`psychoData_${snils}`) || '{}');
        const birthDate = savedPsycho.birthDate || emp.birthDate || '';
        const gender = savedPsycho.gender || emp.gender || '';
        const regAddress = savedPsycho.regAddress || emp.registrationAddress || '';
        const activityId = savedPsycho.activityId || emp.psychoActivity || '';
        const service = savedPsycho.service || emp.department || '';
        
        const activity = PSYCHO_ACTIVITIES.find(a => a.id == activityId);
        if (!activity) { alert(`❌ Для ${emp.last_name} не выбран вид деятельности!`); return; }
        
        count++;
        
        allDirectionsHTML += `
        <div style="page-break-after:always;padding:20px 30px;font-family:'Times New Roman',Times,serif;font-size:11pt;color:#000;background:#fff;width:100%;min-height:297mm;box-sizing:border-box;position:relative;">
            <div style="text-align:center;font-size:10pt;color:#555;margin-bottom:20px;">
                <div style="font-weight:bold;">ОБРАЗЕЦ</div>
                <div>(подготовлен на основании положений Приказа Минздрава РФ от 20.05.2022 №342н)</div>
            </div>
            
            <div style="text-align:center;font-size:14pt;font-weight:bold;margin:20px 0 30px;">Направление на обязательное психиатрическое освидетельствование</div>
            
            <table style="width:100%;border-collapse:collapse;font-size:11pt;margin-bottom:20px;">
                <tr><td style="padding:4px 0;width:35%;"><strong>Наименование работодателя:</strong></td><td style="padding:4px 0;">${org.name}</td></tr>
                <tr><td style="padding:4px 0;"><strong>Адрес электронной почты, контактный номер телефона:</strong></td><td style="padding:4px 0;">${org.email || ''}${org.email && org.phone ? ', ' : ''}${org.phone || ''}</td></tr>
                <tr><td style="padding:4px 0;"><strong>ОКВЭД:</strong></td><td style="padding:4px 0;">${org.okved || '___'}</td></tr>
            </table>
            
            <table style="width:100%;border-collapse:collapse;font-size:11pt;margin-bottom:20px;">
                <tr><td style="padding:4px 0;width:35%;"><strong>Наименование медицинской организации:</strong></td><td style="padding:4px 0;">${medOrg.name}</td></tr>
                <tr><td style="padding:4px 0;"><strong>Фактический адрес местонахождения:</strong></td><td style="padding:4px 0;">${medOrg.address || ''}${medOrg.ogrn ? ', ОГРН ' + medOrg.ogrn : ''}</td></tr>
            </table>
            
            <table style="width:100%;border-collapse:collapse;font-size:11pt;margin-bottom:20px;">
                <tr><td style="padding:4px 0;width:35%;"><strong>Ф.И.О. работника:</strong></td><td style="padding:4px 0;">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</td></tr>
                <tr><td style="padding:4px 0;"><strong>Дата рождения:</strong></td><td style="padding:4px 0;">${formatDate(birthDate)} <strong style="margin-left:20px;">Пол:</strong> ${gender}</td></tr>
                <tr><td style="padding:4px 0;"><strong>Адрес регистрации:</strong></td><td style="padding:4px 0;">${regAddress}</td></tr>
            </table>
            
            <div style="font-size:11pt;margin-bottom:10px;">
                <div><strong>Наименование структурного подразделения работодателя, в котором работник осуществляет отдельный вид (виды) деятельности:</strong></div>
                <div style="margin-top:3px;">${service || '(заполняется при наличии)'}</div>
            </div>
            
            <div style="font-size:11pt;margin-bottom:20px;">
                <div><strong>Наименование должности (профессии):</strong> ${emp.position}</div>
            </div>
            
            <div style="font-size:11pt;margin-bottom:30px;">
                <div><strong>Вид (виды) деятельности осуществляемый в соответствии с Приложением №2 к Приказу Министерства здравоохранения РФ от 20.05.2022 г. № 342н:</strong></div>
                <div style="margin-top:5px;padding:5px;border-bottom:1px solid #000;">${activity.id}. ${activity.title}</div>
            </div>
            
            <div style="margin-bottom:30px;font-size:11pt;">
                <div><strong>Сведения о заключениях, выданных по результатам обязательных предварительных и (или) периодических медицинских осмотров работников, предусмотренных ст. 220 ТК РФ (при наличии):</strong></div>
                <div style="border-bottom:1px solid #000;height:25px;margin-top:5px;"></div>
            </div>
            
            <div style="font-size:11pt;margin-bottom:20px;">
                <strong>Дата выдачи направления работнику:</strong> ${formatDate(directionDate)}
            </div>
            
            <table style="width:100%;border-collapse:collapse;font-size:11pt;margin-top:40px;table-layout:fixed;">
                <colgroup>
                    <col style="width:40%;">
                    <col style="width:60%;">
                </colgroup>
                <tr>
                    <td style="vertical-align:bottom;padding:0 5px;">
                        <div style="border-bottom:1px solid #000;height:35px;"></div>
                        <div style="font-size:10pt;text-align:center;margin-top:3px;">(подпись)</div>
                    </td>
                    <td style="vertical-align:bottom;padding:0 5px;text-align:center;">
                        <div style="font-size:11pt;">${getSelectedPersonName() || '________________________'}</div>
                        <div style="font-size:10pt;color:#555;">${getSelectedPersonPosition() || 'Ф.И.О., должность работодателя (его представителя)'}</div>
                    </td>
                </tr>
            </table>
            
            <div style="margin-top:30px;font-size:11pt;">
                <strong>Дата формирования направления:</strong> ${formatDate(directionDate)}
            </div>
            
            <div style="margin-top:40px;font-size:12pt;text-align:center;">М.П.</div>
        </div>
        `;
    });
    
    openPrintWindow(allDirectionsHTML, `Направления на психосвидетельствование (${count} шт.)`);
}

function openPrintWindow(html, title) {
    const win = window.open('', '_blank');
    if (!win) {
        alert('❌ Браузер заблокировал открытие нового окна. Разрешите всплывающие окна.');
        return;
    }
    
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Times New Roman', Times, serif; background: #f0f0f0; padding: 0; margin: 0; }
                @page { size: A4 portrait; margin: 0; }
                @media print {
                    body { background: #fff; padding: 0; margin: 0; }
                    .no-print { display: none; }
                    div[style*="page-break-after:always"] { page-break-after: always; }
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
                .no-print button:hover { transform: scale(1.02); }
                .no-print .btn-secondary { background: #666; }
                @media print { .no-print { display: none !important; } }
            </style>
        </head>
        <body>
            <div class="no-print">
                <h3>🖨️ ${title}</h3>
                <button onclick="window.print()">🖨️ Печать</button>
                <button class="btn-secondary" onclick="window.close()">✖ Закрыть</button>
                <p style="font-size:11px;color:#666;margin-top:4px;">📄 Один лист А4 на одно направление</p>
            </div>
            ${html}
            <script>
                setTimeout(() => window.print(), 1500);
            <\/script>
        </body>
        </html>
    `);
    win.document.close();
}

function openAddMedOrgModal() {
    const modal = document.getElementById('addMedOrgModal');
    if (modal) modal.classList.remove('hidden');
}

function closeAddMedOrgModal() {
    const modal = document.getElementById('addMedOrgModal');
    if (modal) modal.classList.add('hidden');
}

function saveNewMedOrg() {
    const name = document.getElementById('newMedOrgName')?.value.trim();
    const address = document.getElementById('newMedOrgAddress')?.value.trim();
    const ogrn = document.getElementById('newMedOrgOgrn')?.value.trim();
    const phone = document.getElementById('newMedOrgPhone')?.value.trim();
    
    if (!name) { alert('❌ Введите название медорганизации!'); return; }
    
    const medOrgs = getMedOrgs();
    medOrgs.push({ id: Date.now(), name, address, ogrn, phone });
    saveMedOrgs(medOrgs);
    
    renderMedOrgSelects();
    closeAddMedOrgModal();
    
    document.getElementById('newMedOrgName').value = '';
    document.getElementById('newMedOrgAddress').value = '';
    document.getElementById('newMedOrgOgrn').value = '';
    document.getElementById('newMedOrgPhone').value = '';
    
    alert('✅ Медорганизация добавлена!');
}
// ============================================================
// ГЕНЕРАЦИЯ XML - ФОРМАТ РЕЕСТРА
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
    
    const PROGRAM_TITLES = {
        1: 'Оказание первой помощи пострадавшим',
        2: 'Использование (применение) средств индивидуальной защиты',
        3: 'Общие вопросы охраны труда и функционирования системы управления охраной труда',
        4: 'Безопасные методы и приемы выполнения работ при воздействии вредных и (или) опасных производственных факторов, источников опасности, идентифицированных в рамках специальной оценки условий труда и оценки профессиональных рисков'
    };
    
    const programs = [];
    document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]:checked').forEach(cb => {
        const id = parseInt(cb.value);
        const fullTitle = PROGRAM_TITLES[id];
        if (fullTitle) {
            programs.push({ id: id, title: fullTitle });
        }
    });
    
    if (programs.length === 0) { alert('❌ Выберите программы!'); return; }
    
    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    xml += '<RegistrySet xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
    
    protocol.forEach(emp => {
        programs.forEach(program => {
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
            xml += `\t\t<Test isPassed="true" learnProgramId="${program.id}">\n`;
            xml += `\t\t\t<Date>${escXml(date)}</Date>\n`;
            xml += `\t\t\t<ProtocolNumber>${escXml(number)}</ProtocolNumber>\n`;
            xml += `\t\t\t<LearnProgramTitle>${escXml(program.title)}</LearnProgramTitle>\n`;
            xml += '\t\t</Test>\n';
            xml += '\t</RegistryRecord>\n';
        });
    });
    
    xml += '</RegistrySet>';
    
    const resultBlock = document.getElementById('resultBlock');
    const downloadLink = document.getElementById('downloadLink');
    resultBlock.classList.remove('hidden');
    
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `Реестр_${number}_${date}.xml`;
    
    const preview = document.createElement('pre');
    preview.style.cssText = 'max-height:200px;overflow:auto;background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;font-size:11px;color:#aaa;margin-top:12px;';
    preview.textContent = xml.substring(0, 500) + '...';
    resultBlock.querySelector('pre')?.remove();
    resultBlock.appendChild(preview);
    
    alert(`✅ Создано ${protocol.length * programs.length} записей`);
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
function initTrainingPage() {
    renderOrgs();
    renderStaffWithDepartments();
    renderProtocol();
    fillFamEmployeeSelect();
    renderPersons();
    renderServices();
    initPersonForm();
    initServiceForm();
    
    const showOrgFormBtn = document.getElementById('showOrgFormBtn');
    if (showOrgFormBtn) showOrgFormBtn.onclick = function() {
        document.getElementById('orgForm').classList.remove('hidden');
    };
    const saveOrgBtn = document.getElementById('saveOrgBtn');
    if (saveOrgBtn) saveOrgBtn.onclick = function() {
        const name = document.getElementById('orgNameInput').value.trim();
        const inn = document.getElementById('orgInnInput').value.trim();
        const email = document.getElementById('orgEmailInput')?.value.trim() || '';
        const phone = document.getElementById('orgPhoneInput')?.value.trim() || '';
        const okved = document.getElementById('orgOkvedInput')?.value.trim() || '';
        const address = document.getElementById('orgAddressInput')?.value.trim() || '';
        
        if (!name || !inn) { alert('Заполните название и ИНН'); return; }
        
        const orgs = getOrgs();
        orgs.push({ id: Date.now(), name, inn, email, phone, okved, address });
        saveOrgs(orgs);
        renderOrgs();
        document.getElementById('orgForm').classList.add('hidden');
        document.getElementById('orgNameInput').value = '';
        document.getElementById('orgInnInput').value = '';
        if (document.getElementById('orgEmailInput')) document.getElementById('orgEmailInput').value = '';
        if (document.getElementById('orgPhoneInput')) document.getElementById('orgPhoneInput').value = '';
        if (document.getElementById('orgOkvedInput')) document.getElementById('orgOkvedInput').value = '';
        if (document.getElementById('orgAddressInput')) document.getElementById('orgAddressInput').value = '';
        alert('✅ Организация добавлена');
    };
    const cancelOrgBtn = document.getElementById('cancelOrgBtn');
    if (cancelOrgBtn) cancelOrgBtn.onclick = function() {
        document.getElementById('orgForm').classList.add('hidden');
    };
    const deleteOrgBtn = document.getElementById('deleteOrgBtn');
    if (deleteOrgBtn) deleteOrgBtn.onclick = function() {
        const id = parseInt(document.getElementById('orgSelect').value);
        if (!id) { alert('Выберите организацию'); return; }
        if (!confirm('Удалить?')) return;
        let orgs = getOrgs();
        orgs = orgs.filter(o => o.id !== id);
        saveOrgs(orgs);
        renderOrgs();
        alert('✅ Удалено');
    };
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) generateBtn.onclick = generateXML;
    const addSelectedBtn = document.getElementById('addSelectedBtn');
    if (addSelectedBtn) addSelectedBtn.onclick = addSelectedToProtocol;
    const staffImportBtn = document.getElementById('staffImportBtn');
    if (staffImportBtn) staffImportBtn.onclick = importStaffFile;
    const generateFamBtn = document.getElementById('generateFamBtn');
    if (generateFamBtn) generateFamBtn.onclick = generateFamiliarization;
    const printFamBtn = document.getElementById('printFamBtn');
    if (printFamBtn) printFamBtn.onclick = function() {
        const content = document.getElementById('famContent');
        if (!content.innerHTML) { alert('Сначала сформируйте лист'); return; }
        const win = window.open('', '_blank');
        win.document.write(`<!DOCTYPE html><html><head><title>Лист ознакомления</title>
            <style>body{font-family:Arial;padding:40px;color:#222;max-width:1000px;margin:0 auto;}*{print-color-adjust:exact;}@media print{body{padding:20px;}}</style>
        </head><body>${content.innerHTML}<script>window.print();window.close();<\/script></body></html>`);
        win.document.close();
    };
    
    initPPECardsPage();
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
// DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Загрузка...');
    const mainPage = document.getElementById('mainPage');
    if (mainPage) mainPage.style.display = 'block';
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === 'Главная') link.classList.add('active');
    });
    initTrainingPage();
    console.log('✅ Готово!');
});
