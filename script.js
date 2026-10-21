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
                                <input type="checkbox" class="staff-check" data-snils="${emp.snils || emp.tabNumber}" data-department="${deptName}">
                                <span class="emp-name" onclick="openEmployeeCardBySnils('${emp.snils || emp.tabNumber}')">${emp.last_name} ${emp.first_name}</span>
                                <span class="emp-position">${emp.position}</span>
                                <span class="emp-snils">${formatSnils(emp.snils)}</span>
                                <button class="emp-remove" onclick="removeEmployeeBySnils('${emp.snils || emp.tabNumber}')">✖</button>
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
                            <input type="checkbox" class="staff-check" data-snils="${emp.snils || emp.tabNumber}" data-unassigned="true">
                            <span class="emp-name" onclick="openEmployeeCardBySnils('${emp.snils || emp.tabNumber}')">${emp.last_name} ${emp.first_name}</span>
                            <span class="emp-position">${emp.position}</span>
                            <span class="emp-snils">${formatSnils(emp.snils)}</span>
                            <button class="emp-remove" onclick="removeEmployeeBySnils('${emp.snils || emp.tabNumber}')">✖</button>
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
        alert(`✅ Служба "${deptName}" удалена`);
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
    alert(`✅ Создана служба "${deptName}"`);
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
                    data.unassigned.push(emp);
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
    content = content.replace(/^\uFEFF/, '');
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    const employees = [];
    lines.forEach(line => {
        const result = parseLine(line);
        if (result) employees.push(result);
    });
    return employees;
}

function parseLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return null;
    
    let snils = '';
    const snilsMatch = trimmed.match(/\d{3}-\d{3}-\d{3}\s\d{2}/);
    if (snilsMatch) {
        snils = snilsMatch[0].replace(/[\s-]/g, '');
    }
    
    let birthDate = '';
    const dateMatch = trimmed.match(/\d{1,2}\.\d{1,2}\.\d{4}/);
    if (dateMatch) {
        birthDate = dateMatch[0];
    }
    
    let tabNumber = '';
    const tabMatch = trimmed.match(/\s(\d{4,5})(?:\s|\t)/);
    if (tabMatch) {
        const candidate = tabMatch[1];
        if (!snilsMatch || !snilsMatch[0].replace(/[\s-]/g, '').includes(candidate)) {
            if (!dateMatch || !dateMatch[0].includes(candidate)) {
                tabNumber = candidate;
            }
        }
    }
    
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) return null;
    
    const nameWords = [];
    for (let i = 0; i < words.length && nameWords.length < 3; i++) {
        const w = words[i];
        if (/^[А-ЯЁ][а-яё\-]+$/.test(w)) {
            nameWords.push(w);
        } else {
            break;
        }
    }
    
    if (nameWords.length < 2) return null;
    
    const last_name = nameWords[0];
    const first_name = nameWords[1];
    const middle_name = nameWords[2] || '';
    
    let position = '';
    if (dateMatch) {
        const afterDate = trimmed.substring(trimmed.indexOf(dateMatch[0]) + dateMatch[0].length).trim();
        position = afterDate.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    if (!position) {
        let remaining = trimmed;
        for (const nw of nameWords) {
            remaining = remaining.replace(nw, ' ');
        }
        if (snilsMatch) remaining = remaining.replace(snilsMatch[0], ' ');
        if (dateMatch) remaining = remaining.replace(dateMatch[0], ' ');
        if (tabNumber) remaining = remaining.replace(new RegExp('\\s' + tabNumber + '\\s'), ' ');
        position = remaining.replace(/\t+/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    return {
        last_name: last_name,
        first_name: first_name,
        middle_name: middle_name,
        position: position,
        department: '',
        snils: snils,
        policyNumber: '',
        birthDate: birthDate,
        gender: '',
        medFactors: '',
        tabNumber: tabNumber,
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
// ОРГАНИЗАЦИИ
// ============================================================
function renderOrgs() {
    const select = document.getElementById('orgSelect');
    if (select) {
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
    
    const famOrgSelect = document.getElementById('famOrgSelect');
    if (famOrgSelect) {
        const orgs = getOrgs();
        famOrgSelect.innerHTML = '<option value="">-- Выберите организацию --</option>';
        orgs.forEach(org => {
            const opt = document.createElement('option');
            opt.value = org.id;
            opt.textContent = org.name;
            famOrgSelect.appendChild(opt);
        });
        const currentOrgId = localStorage.getItem('currentOrgId');
        if (currentOrgId) famOrgSelect.value = currentOrgId;
    }
}

function selectOrg(id) { 
    localStorage.setItem('currentOrgId', id); 
}

// ============================================================
// УПОЛНОМОЧЕННЫЕ ЛИЦА
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
// СЛУЖБЫ
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
    let emp = getFamEmployeeData();
    const isEmptyTemplate = !emp;
    
    if (isEmptyTemplate) {
        emp = {
            last_name: '________________________',
            first_name: '________________________',
            middle_name: '________________________',
            position: '________________________'
        };
    }
    
    const docLabels = document.querySelectorAll('.doc-check');
    const docs = [];
    let soutNumber = '';
    
    docLabels.forEach(label => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        const nameInput = label.querySelector('.doc-name-edit');
        const soutInput = label.querySelector('#soutCardNumber');
        
        if (checkbox && checkbox.checked) {
            let docName = nameInput ? nameInput.value.trim() : checkbox.value;
            if (soutInput && docName === 'Специальная оценка условий труда') {
                soutNumber = soutInput.value.trim();
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
                const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        
        const famDateInput = document.getElementById('famCustomDate')?.value;
        let dateStr;
        if (famDateInput) {
            const d = new Date(famDateInput);
            dateStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} г.`;
        } else {
            const now = new Date();
            dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} г.`;
        }
        
        let positionGenitive = emp.position;
if (!isEmptyTemplate) {
    const lastChar = emp.position.slice(-1);
    if (['а', 'я'].includes(lastChar)) {
        positionGenitive = emp.position.slice(0, -1) + 'ы';
    } else if (['й', 'ь'].includes(lastChar)) {
        positionGenitive = emp.position.slice(0, -1) + 'я';
    }
}
        
        let html = '';
        html += '<div style="padding:40px 50px;background:#ffffff;color:#1a1a2e;max-width:900px;margin:0 auto;font-family:Times New Roman,serif;box-shadow:0 4px 20px rgba(0,0,0,0.08);border-radius:4px;border:1px solid #e0e0e8;">';
        html += '<div style="text-align:center;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #7c3aed;">';
        if (orgName) {
            html += '<div style="font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">' + orgName + '</div>';
        }
        html += '<h1 style="font-size:22px;color:#1a1a2e;margin:0;letter-spacing:1.5px;font-weight:700;">ЛИСТ ОЗНАКОМЛЕНИЯ</h1>';
        html += '<p style="font-size:13px;color:#888;margin:6px 0 0 0;font-style:italic;">с нормативными актами по охране труда</p>';
        html += '</div>';
        
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;padding:18px 24px;background:#f8f8fc;border-left:4px solid #7c3aed;border-radius:4px;">';
        html += '<div><div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Фамилия</div><div style="font-size:15px;color:#1a1a2e;font-weight:600;padding-bottom:6px;border-bottom:1px solid #d0d0dc;">' + emp.last_name + '</div></div>';
        html += '<div><div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Имя</div><div style="font-size:15px;color:#1a1a2e;font-weight:600;padding-bottom:6px;border-bottom:1px solid #d0d0dc;">' + emp.first_name + '</div></div>';
        html += '<div><div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Отчество</div><div style="font-size:15px;color:#1a1a2e;font-weight:600;padding-bottom:6px;border-bottom:1px solid #d0d0dc;">' + (emp.middle_name || '—') + '</div></div>';
        html += '<div><div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Должность</div><div style="font-size:15px;color:#1a1a2e;font-weight:600;padding-bottom:6px;border-bottom:1px solid #d0d0dc;">' + emp.position + '</div></div>';
        html += '</div>';
        
        html += '<div style="margin-bottom:28px;">';
        html += '<div style="font-size:15px;color:#1a1a2e;font-weight:700;margin-bottom:14px;padding-bottom:6px;border-bottom:1px solid #e0e0e8;">Ознакомлен(а) со следующими нормативными актами:</div>';
        html += '<ol style="padding-left:0;margin:0;list-style:none;">';
        
        docs.forEach((doc, idx) => {
            let displayDoc = doc;
            if (doc === 'Специальная оценка условий труда' && soutNumber) {
                displayDoc = 'Специальная оценка условий труда (карта № ' + soutNumber + ')';
            }
            if (doc === 'Оценка профессиональных рисков') {
                displayDoc = 'Карта оценки профессиональных рисков для ' + positionGenitive;
            }
            html += '<li style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px;margin-bottom:6px;background:#fafafe;border-radius:4px;border:1px solid #ececf4;font-size:14px;color:#1a1a2e;line-height:1.5;">';
            html += '<span style="display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;background:#7c3aed;color:#fff;border-radius:50%;font-size:12px;font-weight:700;flex-shrink:0;">' + (idx + 1) + '</span>';
            html += '<span style="padding-top:2px;">' + displayDoc + '</span>';
            html += '</li>';
        });
        
        html += '</ol>';
        html += '</div>';
        
        html += '<div style="margin-top:40px;padding-top:24px;border-top:2px solid #e0e0e8;display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;">';
        html += '<div><div style="height:50px;border-bottom:1px solid #1a1a2e;"></div><div style="font-size:11px;color:#888;text-align:center;margin-top:6px;">Подпись сотрудника</div></div>';
        html += '<div><div style="height:50px;border-bottom:1px solid #1a1a2e;"></div><div style="font-size:11px;color:#888;text-align:center;margin-top:6px;">Дата</div></div>';
        html += '<div><div style="height:50px;border-bottom:1px solid #1a1a2e;"></div><div style="font-size:11px;color:#888;text-align:center;margin-top:6px;">Расшифровка подписи</div></div>';
        html += '</div>';
        
        html += '<div style="margin-top:32px;text-align:right;font-size:12px;color:#888;font-style:italic;">' + dateStr + '</div>';
        html += '</div>';
        
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
    
    if (!modal) return;
    
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';
    if (error) error.style.display = 'none';
    modal.classList.remove('hidden');
    
    const nameEl = document.getElementById('ppeEmployeeName');
    const posEl = document.getElementById('ppePosition');
    if (nameEl) nameEl.textContent = wp.name || 'Сотрудник';
    if (posEl) posEl.textContent = wp.position || 'Должность не указана';
    
    renderPPEList();
}

function renderPPEList() {
    const list = document.getElementById('ppeList');
    if (!list) return;
    
    const typeOptions = PPE_TYPES.map(t => 
        `<option value="${t}" style="color:#fff;background:#1a1a3e;padding:8px;">${t}</option>`
    ).join('');
    
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
    alert(`✅ Сохранено ${ppeItems.length} СИЗ!`);
    closePPEModal();
}

function closePPEModal() {
    const modal = document.getElementById('ppeModal');
    if (modal) modal.classList.add('hidden');
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
    win.document.write(`<!DOCTYPE html><html><head><title>СИЗ</title><style>body{font-family:Arial;padding:40px;color:#333;max-width:900px;margin:0 auto;}h1{color:#1a1a3e;border-bottom:3px solid #7c3aed;padding-bottom:10px;}</style></head><body>
        <h1>🦺 Средства индивидуальной защиты</h1>
        <p><strong>Сотрудник:</strong> ${currentPPEWorkplace.name}</p>
        <p><strong>Должность:</strong> ${currentPPEWorkplace.position}</p>
        <hr>${ppeText}
        <script>window.print();<\/script></body></html>`);
    win.document.close();
}

// ============================================================
// КАРТОЧКИ СИЗ - ШАБЛОНЫ
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
            generatePPECardsHTML();
        };
    }
}

function renderPPECardStaffList() {
    const container = document.getElementById('ppeCardStaffList');
    if (!container) return;
    const all = getAllEmployees();
    
    if (all.length === 0) {
        container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">Нет загруженных сотрудников.</p>';
        return;
    }
    
    let html = '<div style="max-height:500px;overflow-y:auto;">';
    all.forEach((emp) => {
        const savedData = JSON.parse(localStorage.getItem('ppeCardStaffData_' + (emp.snils || emp.tabNumber)) || '{}');
        const cardNumber = savedData.cardNumber || '';
        const workplaceId = savedData.workplaceId || '';
        const checked = savedData.checked || false;
        const empId = emp.snils || emp.tabNumber;
        
        html += `
            <div class="staff-item-with-fields" data-snils="${empId}">
                <div class="staff-info">
                    <input type="checkbox" class="ppe-card-staff-check" data-snils="${empId}" ${checked ? 'checked' : ''}>
                    <span class="emp-name" onclick="openEmployeeCardBySnils('${empId}')">${emp.last_name} ${emp.first_name}</span>
                    <span class="emp-position">${emp.position}</span>
                    <span class="emp-snils">${formatSnils(emp.snils)}</span>
                </div>
                <div class="staff-fields">
                    <span class="field-label">№ карточки:</span>
                    <input type="text" class="staff-card-number" data-snils="${empId}" placeholder="001" value="${cardNumber}" style="width:70px;">
                    <span class="field-label">ID рабочего места:</span>
                    <input type="text" class="staff-workplace-id" data-snils="${empId}" placeholder="РМ-001" value="${workplaceId}" style="width:90px;">
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
            <input type="text" id="ppeCardCustomName" placeholder="Свое СИЗ" style="flex:2;min-width:150px;padding:6px 10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:13px;">
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
    
    updatePPECardSelectionCount();
}

function addCustomPPEToCardList() {
    const name = document.getElementById('ppeCardCustomName').value.trim();
    const punkt = document.getElementById('ppeCardCustomPunkt').value.trim() || 'п. ___';
    const unit = document.getElementById('ppeCardCustomUnit').value.trim() || 'Штук, год';
    const quantity = document.getElementById('ppeCardCustomQuantity').value.trim() || '1';
    
    if (!name) { alert('❌ Введите наименование СИЗ!'); return; }
    
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

function getSelectedPPECardEmployees() {
    const checkboxes = document.querySelectorAll('.ppe-card-staff-check:checked');
    const all = getAllEmployees();
    const selected = [];
    checkboxes.forEach(cb => {
        const snils = cb.dataset.snils;
        const emp = all.find(e => (e.snils || e.tabNumber) === snils);
        if (emp) {
            const cardNumber = document.querySelector(`.staff-card-number[data-snils="${snils}"]`)?.value.trim() || '';
            const workplaceId = document.querySelector(`.staff-workplace-id[data-snils="${snils}"]`)?.value.trim() || '';
            selected.push({ ...emp, cardNumber, workplaceId });
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
        localStorage.removeItem('ppeCardStaffData_' + (emp.snils || emp.tabNumber));
    });
    
    renderPPECardStaffList();
    renderPPECardPPEList();
    const res = document.getElementById('ppeCardResult');
    if (res) res.classList.add('hidden');
    alert('✅ Выбор очищен');
}

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
// ГЕНЕРАЦИЯ КАРТОЧЕК СИЗ
// ============================================================
function generatePPECardsHTML() {
    const employees = getSelectedPPECardEmployees();
    
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
    
    function buildPPETableFull(fullPage) {
        let rows = '';
        const rowHeight = fullPage ? '20px' : '16px';
        const cellPad = fullPage ? '2px 8px' : '1px 5px';
        const fontSize = fullPage ? '11px' : '9px';
        
        selectedPPECardItems.forEach((ppe) => {
            rows += `
                <tr>
                    <td style="border:0.5px solid #444;padding:${cellPad};font-size:${fontSize};height:${rowHeight};">${ppe.name}</td>
                    <td style="border:0.5px solid #444;padding:${cellPad};font-size:${fontSize};text-align:center;height:${rowHeight};">${ppe.punkt || ''}</td>
                    <td style="border:0.5px solid #444;padding:${cellPad};font-size:${fontSize};text-align:center;height:${rowHeight};">${ppe.unit || ''}</td>
                    <td style="border:0.5px solid #444;padding:${cellPad};font-size:${fontSize};text-align:center;height:${rowHeight};">${ppe.quantity || ''}</td>
                </tr>
            `;
        });
        
        const emptyRows = Math.max(0, (fullPage ? 9 : 6) - selectedPPECardItems.length);
        for (let i = 0; i < emptyRows; i++) {
            rows += `
                <tr>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};"></td>
                </tr>
            `;
        }
        return rows;
    }
    
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
                        <td style="width:55%;vertical-align:top;padding:${fullPage ? '6px 10px' : '2px 5px'};border:0.5px solid #444;">
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Фамилия</strong> ${emp.last_name}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Имя</strong> ${emp.first_name}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Отчество</strong> ${emp.middle_name || ''}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Табельный номер</strong> ${emp.tabNumber || '________'}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Структурное подразделение</strong> ${dept || emp.department || ''}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Профессия (должность)</strong> ${emp.position}</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Дата поступления на работу</strong> __________</div>
                            <div style="margin:${fullPage ? '3px 0' : '1px 0'};"><strong>Дата изменения профессии (должности) или перевода</strong> __________</div>
                        </td>
                        <td style="width:45%;vertical-align:top;padding:${fullPage ? '6px 10px' : '2px 5px'};border:0.5px solid #444;">
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
                
                <table style="width:100%;border-collapse:collapse;font-size:${headerFontSize};border:0.5px solid #444;flex:1;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="border:0.5px solid #444;padding:${pad};text-align:center;width:32%;font-size:${headerFontSize};font-weight:bold;">Наименование СИЗ</th>
                            <th style="border:0.5px solid #444;padding:${pad};text-align:center;width:22%;font-size:${headerFontSize};font-weight:bold;">Пункт Норм</th>
                            <th style="border:0.5px solid #444;padding:${pad};text-align:center;width:26%;font-size:${headerFontSize};font-weight:bold;">Единица измерения, периодичность выдачи</th>
                            <th style="border:0.5px solid #444;padding:${pad};text-align:center;width:20%;font-size:${headerFontSize};font-weight:bold;">Количество на период</th>
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
                        <div style="border-bottom:0.5px solid #444;height:${signHeight};"></div>
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
                    <div style="margin:${fullPage ? '4px 0' : '1px 0'};"><strong>Структурное подразделение</strong> ${dutyDepartment || emp.department || '________________'}</div>
                    <div style="margin:${fullPage ? '4px 0' : '1px 0'};"><strong>Фамилия, имя, отчество (при наличии) ответственного</strong> ${dutyResponsibleName || '________________'}</div>
                    <div style="margin:${fullPage ? '4px 0' : '1px 0'};"><strong>Профессия (должность) ответственного</strong> ${dutyResponsiblePosition || '________________'}</div>
                    <div style="margin:${fullPage ? '4px 0' : '1px 0'};"><strong>Предусмотрена приказом (номер и дата приказа об утверждении Норм) выдача:</strong> ${dutyOrder || '________________'}</div>
                </div>
                
                <table style="width:100%;border-collapse:collapse;font-size:${headerFontSize};border:0.5px solid #444;flex:1;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="border:0.5px solid #444;padding:${pad};text-align:center;width:32%;font-size:${headerFontSize};font-weight:bold;">Наименование СИЗ</th>
                            <th style="border:0.5px solid #444;padding:${pad};text-align:center;width:22%;font-size:${headerFontSize};font-weight:bold;">Пункт Норм</th>
                            <th style="border:0.5px solid #444;padding:${pad};text-align:center;width:26%;font-size:${headerFontSize};font-weight:bold;">Единица измерения, периодичность выдачи</th>
                            <th style="border:0.5px solid #444;padding:${pad};text-align:center;width:20%;font-size:${headerFontSize};font-weight:bold;">Количество на период</th>
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
                        <div style="border-bottom:0.5px solid #444;height:${signHeight};"></div>
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
    
    function createReverseCard(emp, fullPage) {
        const headerFontSize = fullPage ? '11px' : '8px';
        const subHeaderFontSize = fullPage ? '10px' : '7px';
        const cellPad = fullPage ? '1px 6px' : '1px 4px';
        const rowHeight = fullPage ? '28px' : '22px';
        
        let rows = '';
        selectedPPECardItems.forEach((ppe) => {
            rows += `
                <tr>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};font-weight:bold;">${ppe.name}</td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                </tr>
            `;
        });
        
        const emptyRows = Math.max(0, (fullPage ? 10 : 7) - selectedPPECardItems.length);
        for (let i = 0; i < emptyRows; i++) {
            rows += `
                <tr>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                    <td style="border:0.5px solid #444;padding:${cellPad};height:${rowHeight};font-size:${fullPage ? '10px' : '8px'};"></td>
                </tr>
            `;
        }
        
        return `
            <div style="position:absolute;top:0;left:0;width:100%;height:${fullPage ? '100%' : '50%'};padding:${fullPage ? '20px 30px' : '10px 14px 8px 14px'};${fullPage ? '' : 'border-bottom:2px dashed #ff0000;'}overflow:hidden;display:flex;flex-direction:column;">
                <div style="text-align:center;font-size:${fullPage ? '16px' : '13px'};font-weight:bold;margin-bottom:${fullPage ? '12px' : '6px'};flex-shrink:0;">Оборотная сторона</div>
                
                <table style="width:100%;border-collapse:collapse;font-size:${headerFontSize};border:1px solid #000;flex:1;">
                    <thead>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;width:17%;font-size:${headerFontSize};font-weight:bold;" rowspan="2">Наименование СИЗ</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;width:17%;font-size:${headerFontSize};font-weight:bold;" rowspan="2">Модель, марка, артикул</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${headerFontSize};font-weight:bold;" colspan="3">Выдано</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${headerFontSize};font-weight:bold;" colspan="3">Возвращено</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;width:9%;font-size:${headerFontSize};font-weight:bold;" rowspan="2">Акт списания</th>
                        </tr>
                        <tr style="background:#f0f0f0;">
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">дата</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">кол-во</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">подпись</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">дата</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">кол-во</th>
                            <th style="border:1px solid #000;padding:${cellPad};text-align:center;font-size:${subHeaderFontSize};">подпись</th>
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
    
    if (cardsPerPage === 2) {
        for (let i = 0; i < employees.length; i += 2) {
            const emp1 = employees[i];
            const emp2 = employees[i + 1] || null;
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
                ${emp2 ? createReverseCard(emp2, false).replace('top:0', 'top:50%').replace('border-bottom', 'border-top') : `<div style="position:absolute;top:50%;left:0;width:100%;height:50%;display:flex;align-items:center;justify-content:center;color:#999;font-size:20px;border-top:1px dashed #ddd;">ПУСТАЯ ОБОРОТНАЯ</div>`}
                <div style="position:absolute;top:50%;left:0;width:100%;height:2px;border-top:2px dashed #ff0000;z-index:10;"></div>
            </div>
            `;
            
            allPagesHTML += facePageHTML + reversePageHTML;
        }
    } else {
        employees.forEach(emp => {
            cardCount++;
            const faceCardFunc = isDuty ? createDutyFaceCard : createPersonalFaceCard;
            
            allPagesHTML += `
            <div style="page-break-after:always;position:relative;width:100%;height:297mm;margin:0 auto;background:#fff;color:#000;border:1px solid #999;box-sizing:border-box;overflow:hidden;font-family:'Times New Roman',Times,serif;">
                ${faceCardFunc(emp, true)}
            </div>
            `;
            
            allPagesHTML += `
            <div style="page-break-after:always;position:relative;width:100%;height:297mm;margin:0 auto;background:#fff;color:#000;border:1px solid #999;box-sizing:border-box;overflow:hidden;font-family:'Times New Roman',Times,serif;">
                ${createReverseCard(emp, true)}
            </div>
            `;
        });
    }
    
    const win = window.open('', '_blank');
    if (!win) {
        alert('❌ Браузер заблокировал открытие нового окна.');
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
                .no-print .btn-secondary { background: #666; }
                @media print { .no-print { display: none !important; } }
            </style>
        </head>
        <body>
            <div class="no-print">
                <h3>🖨️ Карточки ${cardTypeName} (${cardCount} шт., ${modeText})</h3>
                <button onclick="window.print()">🖨️ Печать</button>
                <button class="btn-secondary" onclick="window.close()">✖ Закрыть</button>
            </div>
            ${allPagesHTML}
            <script>
                setTimeout(() => window.print(), 1500);
            <\/script>
        </body>
        </html>
    `);
    win.document.close();
    
    if (resultDiv) resultDiv.classList.remove('hidden');
    if (contentDiv) contentDiv.innerHTML = `
        <p>✅ Создано ${cardTypeName.toLowerCase()} карточек: <strong>${cardCount}</strong></p>
        <p>📋 Режим: <strong>${modeText}</strong></p>
        <p>📋 Сотрудники: ${employees.map(e => `${e.last_name} ${e.first_name}`).join(', ')}</p>
        <p>🦺 СИЗ: ${selectedPPECardItems.map(e => e.name).join(', ')}</p>
    `;
}
// ============================================================
// ВИДЫ ДЕЯТЕЛЬНОСТИ ПО ПРИКАЗУ №342н
// ============================================================
let manualMedEmployees = [];
let manualPsychoEmployees = [];
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
    { id: 13, title: 'Деятельность, непосредственно связанная с обслуживанием оборудования, работающего под избыточным давлением более 0,07 МПа и подлежащего учету в органах Федеральной службы по экологическому, технологическому и атомному надзору' },
    { id: 14, title: 'Деятельность, непосредственно связанная с диспетчеризацией производственных процессов в химической (нефтехимической) промышленности' },
    { id: 15, title: 'Деятельность, связанная с добычей угля подземным способом' },
    { id: 16, title: 'Деятельность, связанная с эксплуатацией, ремонтом скважин и установок при переработке высокосернистой нефти' },
    { id: 17, title: 'Деятельность, непосредственно связанная с контактами с возбудителями инфекционных заболеваний - патогенными микроорганизмами I и II группы патогенности' }
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
    
    const staffEmployees = getAllEmployees();
    const all = staffEmployees.map(e => ({ ...e, department: e.department || '' }));
    
    // Добавляем ручных
    if (mode === 'med') {
        manualMedEmployees.forEach(e => all.push(e));
    } else if (mode === 'psycho') {
        manualPsychoEmployees.forEach(e => all.push(e));
    }
    
    if (all.length === 0) {
        container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">Нет загруженных сотрудников.</p>';
        return;
    }
    
    let html = '<div style="max-height:500px;overflow-y:auto;">';
    
    all.forEach(emp => {
        const empId = emp.snils || emp.tabNumber;
        const savedMed = JSON.parse(localStorage.getItem(`medData_${empId}`) || '{}');
        const savedPsycho = JSON.parse(localStorage.getItem(`psychoData_${empId}`) || '{}');
        
        if (mode === 'med') {
            const factors = savedMed.factors || emp.medFactors || '';
            const checked = savedMed.checked || false;
            const birthDate = savedMed.birthDate || emp.birthDate || '';
            const gender = savedMed.gender || emp.gender || '';
            const policy = savedMed.policy || emp.policyNumber || '';
            
            html += `
                <div data-snils="${empId}" style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
                        <input type="checkbox" class="med-check" data-snils="${empId}" ${checked ? 'checked' : ''} style="width:18px;height:18px;accent-color:#7c3aed;">
                        <span class="emp-name" style="color:#00d4ff;font-size:14px;">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</span>
                        <span style="color:#8888aa;font-size:13px;">${emp.position}</span>
                        ${emp.department ? `<span style="color:#b388ff;font-size:12px;">📁 ${emp.department}</span>` : ''}
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 2fr;gap:8px;">
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Дата рождения</label>
                            <input type="text" class="med-birth-date" data-snils="${empId}" value="${birthDate}" placeholder="12.08.1951" style="width:100%;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Пол</label>
                            <select class="med-gender" data-snils="${empId}" style="width:100%;padding:6px 8px;background:#1a1a3e;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                                <option value="">--</option>
                                <option value="М" ${gender === 'М' ? 'selected' : ''}>М</option>
                                <option value="Ж" ${gender === 'Ж' ? 'selected' : ''}>Ж</option>
                            </select>
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">№ полиса</label>
                            <input type="text" class="med-policy" data-snils="${empId}" value="${policy}" placeholder="1234 5678..." style="width:100%;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Вредные факторы (Приказ №29н)</label>
                            <input type="text" class="med-factors" data-snils="${empId}" value="${factors}" placeholder="4.3.1, 4.3.2, 18.1" style="width:100%;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
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
            
            const activityOptions = PSYCHO_ACTIVITIES.map(a => 
                `<option value="${a.id}" ${activityId == a.id ? 'selected' : ''}>${a.id}. ${a.title.substring(0, 60)}${a.title.length > 60 ? '...' : ''}</option>`
            ).join('');
            
            html += `
                <div data-snils="${empId}" style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
                        <input type="checkbox" class="psycho-check" data-snils="${empId}" ${checked ? 'checked' : ''} style="width:18px;height:18px;accent-color:#7c3aed;">
                        <span class="emp-name" style="color:#00d4ff;font-size:14px;">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</span>
                        <span style="color:#8888aa;font-size:13px;">${emp.position}</span>
                        ${emp.department ? `<span style="color:#b388ff;font-size:12px;">📁 ${emp.department}</span>` : ''}
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 2fr;gap:8px;">
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Дата рождения</label>
                            <input type="text" class="psycho-birth-date" data-snils="${empId}" value="${birthDate}" placeholder="12.08.1951" style="width:100%;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Пол</label>
                            <select class="psycho-gender" data-snils="${empId}" style="width:100%;padding:6px 8px;background:#1a1a3e;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                                <option value="">--</option>
                                <option value="М" ${gender === 'М' ? 'selected' : ''}>М</option>
                                <option value="Ж" ${gender === 'Ж' ? 'selected' : ''}>Ж</option>
                            </select>
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Адрес регистрации</label>
                            <input type="text" class="psycho-address" data-snils="${empId}" value="${regAddress}" placeholder="г. ..., ул. ..." style="width:100%;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
                        </div>
                        <div>
                            <label style="color:#8888aa;font-size:11px;display:block;margin-bottom:3px;">Вид деятельности (Приказ №342н)</label>
                            <select class="psycho-activity" data-snils="${empId}" style="width:100%;padding:6px 8px;background:#1a1a3e;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;">
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
        container.querySelectorAll('.med-check, .med-birth-date, .med-gender, .med-policy, .med-factors').forEach(el => {
            el.addEventListener('change', saveMedData);
            el.addEventListener('input', saveMedData);
        });
    }
    if (mode === 'psycho') {
        container.querySelectorAll('.psycho-check, .psycho-birth-date, .psycho-gender, .psycho-address, .psycho-activity').forEach(el => {
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
    
    localStorage.setItem(`medData_${snils}`, JSON.stringify({ checked, birthDate, gender, policy, factors }));
    
    const data = getStaffData();
    let found = false;
    for (const [dept, deptData] of Object.entries(data.departments)) {
        const idx = deptData.employees.findIndex(e => (e.snils || e.tabNumber) === snils);
        if (idx !== -1) {
            deptData.employees[idx].birthDate = birthDate;
            deptData.employees[idx].gender = gender;
            deptData.employees[idx].policyNumber = policy;
            deptData.employees[idx].medFactors = factors;
            found = true;
            break;
        }
    }
    if (!found) {
        const idx = data.unassigned.findIndex(e => (e.snils || e.tabNumber) === snils);
        if (idx !== -1) {
            data.unassigned[idx].birthDate = birthDate;
            data.unassigned[idx].gender = gender;
            data.unassigned[idx].policyNumber = policy;
            data.unassigned[idx].medFactors = factors;
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
    
    localStorage.setItem(`psychoData_${snils}`, JSON.stringify({ checked, birthDate, gender, regAddress, activityId }));
    
    const data = getStaffData();
    let found = false;
    for (const [dept, deptData] of Object.entries(data.departments)) {
        const idx = deptData.employees.findIndex(e => (e.snils || e.tabNumber) === snils);
        if (idx !== -1) {
            deptData.employees[idx].birthDate = birthDate;
            deptData.employees[idx].gender = gender;
            deptData.employees[idx].registrationAddress = regAddress;
            deptData.employees[idx].psychoActivity = activityId;
            found = true;
            break;
        }
    }
    if (!found) {
        const idx = data.unassigned.findIndex(e => (e.snils || e.tabNumber) === snils);
        if (idx !== -1) {
            data.unassigned[idx].birthDate = birthDate;
            data.unassigned[idx].gender = gender;
            data.unassigned[idx].registrationAddress = regAddress;
            data.unassigned[idx].psychoActivity = activityId;
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
// ============================================================
// ГЕНЕРАЦИЯ НАПРАВЛЕНИЙ НА МЕДОСМОТР (29н)
// ============================================================
function generateMedDirections() {
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
        let emp = getAllEmployees().find(e => (e.snils || e.tabNumber) === snils);
        if (!emp) emp = manualMedEmployees.find(e => (e.snils || e.tabNumber) === snils);
        if (!emp) return;
        
        const savedMed = JSON.parse(localStorage.getItem(`medData_${snils}`) || '{}');
        const birthDate = savedMed.birthDate || emp.birthDate || '';
        const gender = savedMed.gender || emp.gender || '';
        const policy = savedMed.policy || emp.policyNumber || '';
        const factors = savedMed.factors || emp.medFactors || '';
        const department = emp.department || '';
        
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
                <div><strong>Дата выдачи:</strong> ${directionDate}</div>
                <div><strong>№:</strong> ${directionNumber}</div>
            </div>
            
            <div style="text-align:center;font-size:14pt;font-weight:bold;margin:30px 0 20px;">Направление на медицинский осмотр</div>
            <div style="text-align:center;font-size:12pt;font-weight:bold;margin-bottom:30px;">${directionType}</div>
            
            <table style="width:100%;border-collapse:collapse;font-size:11pt;margin-bottom:20px;">
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;width:35%;"><strong>Ф.И.О. работника:</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</td></tr>
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;"><strong>Дата рождения:</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${birthDate}</td></tr>
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;"><strong>Пол работника:</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${gender}</td></tr>
                <tr><td style="padding:6px 0;border-bottom:1px solid #ccc;"><strong>Наименование структурного подразделения:</strong></td><td style="padding:6px 0;border-bottom:1px solid #ccc;">${department}</td></tr>
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

// ============================================================
// ГЕНЕРАЦИЯ НАПРАВЛЕНИЙ НА ПСИХОСВИДЕТЕЛЬСТВОВАНИЕ (342н)
// ============================================================
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
        let emp = getAllEmployees().find(e => (e.snils || e.tabNumber) === snils);
        if (!emp) emp = manualPsychoEmployees.find(e => (e.snils || e.tabNumber) === snils);
        if (!emp) return;
        
        const savedPsycho = JSON.parse(localStorage.getItem(`psychoData_${snils}`) || '{}');
        const birthDate = savedPsycho.birthDate || emp.birthDate || '';
        const gender = savedPsycho.gender || emp.gender || '';
        const regAddress = savedPsycho.regAddress || emp.registrationAddress || '';
        const activityId = savedPsycho.activityId || emp.psychoActivity || '';
        const department = emp.department || '';
        
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
                <tr><td style="padding:4px 0;"><strong>Дата рождения:</strong></td><td style="padding:4px 0;">${birthDate} <strong style="margin-left:20px;">Пол:</strong> ${gender}</td></tr>
                <tr><td style="padding:4px 0;"><strong>Адрес регистрации:</strong></td><td style="padding:4px 0;">${regAddress}</td></tr>
            </table>
            
            <div style="font-size:11pt;margin-bottom:10px;">
                <div><strong>Наименование структурного подразделения работодателя, в котором работник осуществляет отдельный вид (виды) деятельности:</strong></div>
                <div style="margin-top:3px;">${department || '(заполняется при наличии)'}</div>
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
                <strong>Дата выдачи направления работнику:</strong> ${directionDate}
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
                        <div style="font-size:10pt;color:#555;">${getSelectedPersonPosition() || 'Ф.И.О., должность'}</div>
                    </td>
                </tr>
            </table>
            
            <div style="margin-top:30px;font-size:11pt;">
                <strong>Дата формирования направления:</strong> ${directionDate}
            </div>
            
            <div style="margin-top:40px;font-size:12pt;text-align:center;">М.П.</div>
        </div>
        `;
    });
    
    openPrintWindow(allDirectionsHTML, `Направления на психосвидетельствование (${count} шт.)`);
}

// ============================================================
// ОКНО ПЕЧАТИ
// ============================================================
function openPrintWindow(html, title) {
    const win = window.open('', '_blank');
    if (!win) {
        alert('❌ Браузер заблокировал открытие нового окна.');
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
                .no-print .btn-secondary { background: #666; }
                @media print { .no-print { display: none !important; } }
            </style>
        </head>
        <body>
            <div class="no-print">
                <h3>🖨️ ${title}</h3>
                <button onclick="window.print()">🖨️ Печать</button>
                <button class="btn-secondary" onclick="window.close()">✖ Закрыть</button>
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

// ============================================================
// МЕДОРГАНИЗАЦИИ - МОДАЛЬНОЕ ОКНО
// ============================================================
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
// ПЕРСОНАЛЬНАЯ КАРТОЧКА СОТРУДНИКА (РЕДАКТИРОВАНИЕ)
// ============================================================
function openEmployeeCardBySnils(snils) {
    const all = getAllEmployees();
    const emp = all.find(e => e.snils === snils || e.tabNumber === snils);
    if (!emp) { alert('❌ Сотрудник не найден'); return; }
    openEmployeeCard(emp);
}

function openEmployeeCard(emp) {
    const actualSnils = emp.snils || emp.tabNumber || '';
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'employeeModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:600px;max-height:90vh;overflow-y:auto;">
            <div class="modal-header">
                <h3>✏️ Редактирование сотрудника</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✖</button>
            </div>
            <div class="modal-body">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div class="form-group">
                        <label style="color:#ccc;font-size:13px;">Фамилия</label>
                        <input type="text" id="editLastName" value="${emp.last_name || ''}" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                    </div>
                    <div class="form-group">
                        <label style="color:#ccc;font-size:13px;">Имя</label>
                        <input type="text" id="editFirstName" value="${emp.first_name || ''}" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                    </div>
                </div>
                
                <div class="form-group">
                    <label style="color:#ccc;font-size:13px;">Отчество</label>
                    <input type="text" id="editMiddleName" value="${emp.middle_name || ''}" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                </div>
                
                <div class="form-group">
                    <label style="color:#ccc;font-size:13px;">Должность</label>
                    <input type="text" id="editPosition" value="${emp.position || ''}" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                </div>
                
                <div class="form-group">
                    <label style="color:#ccc;font-size:13px;">Структурное подразделение</label>
                    <input type="text" id="editDepartment" value="${emp.department || ''}" placeholder="Администрация" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div class="form-group">
                        <label style="color:#ccc;font-size:13px;">СНИЛС</label>
                        <input type="text" id="editSnils" value="${emp.snils || ''}" placeholder="123-456-789 00" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                    </div>
                    <div class="form-group">
                        <label style="color:#ccc;font-size:13px;">Табельный номер</label>
                        <input type="text" id="editTabNumber" value="${emp.tabNumber || ''}" placeholder="26663" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                    </div>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div class="form-group">
                        <label style="color:#ccc;font-size:13px;">Дата рождения</label>
                        <input type="text" id="editBirthDate" value="${emp.birthDate || ''}" placeholder="12.08.1951" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                    </div>
                    <div class="form-group">
                        <label style="color:#ccc;font-size:13px;">Пол</label>
                        <select id="editGender" style="width:100%;padding:10px;background:#1a1a3e;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                            <option value="">--</option>
                            <option value="М" ${emp.gender === 'М' ? 'selected' : ''}>М</option>
                            <option value="Ж" ${emp.gender === 'Ж' ? 'selected' : ''}>Ж</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label style="color:#ccc;font-size:13px;">№ полиса ОМС</label>
                    <input type="text" id="editPolicy" value="${emp.policyNumber || ''}" placeholder="1234 5678 9012 3456" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                </div>
                
                <div class="form-group">
                    <label style="color:#ccc;font-size:13px;">Вредные факторы (Приказ №29н)</label>
                    <input type="text" id="editFactors" value="${emp.medFactors || ''}" placeholder="4.3.1, 4.3.2, 18.1" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                </div>
                
                <div class="form-group">
                    <label style="color:#ccc;font-size:13px;">Адрес регистрации (для психо)</label>
                    <input type="text" id="editAddress" value="${emp.registrationAddress || ''}" placeholder="г. ..., ул. ..." style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
                </div>
            </div>
            <div class="modal-footer" style="display:flex;gap:10px;justify-content:space-between;">
                <button class="btn-delete" onclick="deleteEmployeeFromModal('${actualSnils}')" style="padding:10px 20px;">🗑 Удалить</button>
                <div style="display:flex;gap:10px;">
                    <button class="btn-cancel" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                    <button class="btn-primary" onclick="saveEmployeeDataFromModal('${actualSnils}')" style="width:auto;padding:10px 24px;">💾 Сохранить</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveEmployeeDataFromModal(oldSnils) {
    const newLastName = document.getElementById('editLastName')?.value.trim() || '';
    const newFirstName = document.getElementById('editFirstName')?.value.trim() || '';
    const newMiddleName = document.getElementById('editMiddleName')?.value.trim() || '';
    const newPosition = document.getElementById('editPosition')?.value.trim() || '';
    const newDepartment = document.getElementById('editDepartment')?.value.trim() || '';
    const newSnilsRaw = document.getElementById('editSnils')?.value.trim() || '';
    const newTabNumber = document.getElementById('editTabNumber')?.value.trim() || '';
    const newBirthDate = document.getElementById('editBirthDate')?.value.trim() || '';
    const newGender = document.getElementById('editGender')?.value || '';
    const newPolicy = document.getElementById('editPolicy')?.value.trim() || '';
    const newFactors = document.getElementById('editFactors')?.value.trim() || '';
    const newAddress = document.getElementById('editAddress')?.value.trim() || '';
    
    if (!newLastName || !newFirstName) {
        alert('❌ Фамилия и Имя обязательны!');
        return;
    }
    
    const newSnils = newSnilsRaw.replace(/\D/g, '');
    
    const data = getStaffData();
    let found = false;
    
    for (const [dept, deptData] of Object.entries(data.departments)) {
        const idx = deptData.employees.findIndex(e => e.snils === oldSnils || e.tabNumber === oldSnils);
        if (idx !== -1) {
            deptData.employees[idx] = {
                ...deptData.employees[idx],
                last_name: newLastName,
                first_name: newFirstName,
                middle_name: newMiddleName,
                position: newPosition,
                snils: newSnils,
                tabNumber: newTabNumber,
                birthDate: newBirthDate,
                gender: newGender,
                policyNumber: newPolicy,
                medFactors: newFactors,
                registrationAddress: newAddress
            };
            found = true;
            break;
        }
    }
    
    if (!found) {
        const idx = data.unassigned.findIndex(e => e.snils === oldSnils || e.tabNumber === oldSnils);
        if (idx !== -1) {
            data.unassigned[idx] = {
                ...data.unassigned[idx],
                last_name: newLastName,
                first_name: newFirstName,
                middle_name: newMiddleName,
                position: newPosition,
                snils: newSnils,
                tabNumber: newTabNumber,
                birthDate: newBirthDate,
                gender: newGender,
                policyNumber: newPolicy,
                medFactors: newFactors,
                registrationAddress: newAddress
            };
        }
    }
    
    saveStaffData(data);
    document.getElementById('employeeModal')?.remove();
    renderStaffWithDepartments();
    alert('✅ Данные сохранены!');
}

function deleteEmployeeFromModal(snils) {
    if (!confirm('Удалить этого сотрудника?')) return;
    const data = getStaffData();
    
    for (const [dept, deptData] of Object.entries(data.departments)) {
        const idx = deptData.employees.findIndex(e => e.snils === snils || e.tabNumber === snils);
        if (idx !== -1) {
            deptData.employees.splice(idx, 1);
            saveStaffData(data);
            document.getElementById('employeeModal')?.remove();
            renderStaffWithDepartments();
            alert('✅ Удалено');
            return;
        }
    }
    
    const idx = data.unassigned.findIndex(e => e.snils === snils || e.tabNumber === snils);
    if (idx !== -1) {
        data.unassigned.splice(idx, 1);
        saveStaffData(data);
        document.getElementById('employeeModal')?.remove();
        renderStaffWithDepartments();
        alert('✅ Удалено');
    }
}
// ============================================================
// ГЕНЕРАЦИЯ XML (реестр обучения)
// ============================================================
function generateXML() {
    const orgSelect = document.getElementById('orgSelect');
    const orgs = getOrgs();
    const org = orgs.find(o => o.id === parseInt(orgSelect?.value));
    if (!org) { alert('❌ Выберите организацию!'); return; }
    
    const protocol = getProtocol();
    if (protocol.length === 0) { alert('❌ Нет сотрудников в протоколе!'); return; }
    
    const number = document.getElementById('protocolNumber')?.value.trim() || '01/26';
    const date = document.getElementById('protocolDate')?.value || new Date().toISOString().split('T')[0];
    
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
    if (resultBlock) resultBlock.classList.remove('hidden');
    
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    if (downloadLink) {
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `Реестр_${number}_${date}.xml`;
    }
    
    alert(`✅ Создано ${protocol.length * programs.length} записей`);
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ОБУЧЕНИЯ
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
    if (printFamBtn) {
        printFamBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const content = document.getElementById('famContent');
            if (!content || !content.innerHTML || content.innerHTML.trim() === '') {
                alert('❌ Сначала сформируйте лист ознакомления');
                return;
            }
            
            const win = window.open('', '_blank');
            if (!win) {
                alert('❌ Разрешите всплывающие окна для этого сайта');
                return;
            }
            
            win.document.write(`<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Лист ознакомления</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Times New Roman', Times, serif; 
                        background: #f0f0f0; 
                        padding: 20px;
                    }
                    @page { size: A4 portrait; margin: 15mm; }
                    @media print {
                        body { background: #fff; padding: 0; }
                        .no-print { display: none !important; }
                    }
                    .no-print {
                        text-align: center;
                        padding: 15px;
                        background: #fff;
                        margin-bottom: 20px;
                        border-radius: 8px;
                        border-bottom: 2px solid #7c3aed;
                    }
                    .no-print button {
                        padding: 10px 28px;
                        margin: 0 8px;
                        background: linear-gradient(135deg, #7c3aed, #00d4ff);
                        border: none;
                        border-radius: 8px;
                        color: #fff;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .no-print .btn-secondary {
                        background: #666;
                    }
                </style>
            </head>
            <body>
                <div class="no-print">
                    <button onclick="window.print()">🖨️ Печать</button>
                    <button class="btn-secondary" onclick="window.close()">✖ Закрыть</button>
                </div>
                ${content.innerHTML}
                <script>
                    setTimeout(function() { window.print(); }, 800);
                <\/script>
            </body>
            </html>`);
            win.document.close();
        });
    }
    const famCustomDate = document.getElementById('famCustomDate');
    if (famCustomDate && !famCustomDate.value) {
        famCustomDate.value = new Date().toISOString().split('T')[0];
    }
    initPPECardsPage();
}
// ============================================================
// РУЧНОЙ ВВОД СОТРУДНИКОВ ДЛЯ МЕДОСМОТРОВ
// ============================================================
function toggleMedManualForm() {
    const form = document.getElementById('medManualForm');
    if (form) form.classList.toggle('hidden');
}

function togglePsychoManualForm() {
    const form = document.getElementById('psychoManualForm');
    if (form) form.classList.toggle('hidden');
    
    const activitySelect = document.getElementById('psychoManualActivity');
    if (activitySelect && activitySelect.options.length <= 1) {
        activitySelect.innerHTML = '<option value="">Вид деятельности</option>' +
            PSYCHO_ACTIVITIES.map(a => `<option value="${a.id}">${a.id}. ${a.title.substring(0, 80)}${a.title.length > 80 ? '...' : ''}</option>`).join('');
    }
}

function addManualMedEmployee() {
    const lastName = document.getElementById('manualLastName')?.value.trim();
    const firstName = document.getElementById('manualFirstName')?.value.trim();
    const middleName = document.getElementById('manualMiddleName')?.value.trim() || '';
    const position = document.getElementById('manualPosition')?.value.trim();
    const department = document.getElementById('manualDepartment')?.value.trim() || '';
    const birthDate = document.getElementById('manualBirthDate')?.value.trim() || '';
    const gender = document.getElementById('manualGender')?.value || '';
    const policy = document.getElementById('manualPolicy')?.value.trim() || '';
    const factors = document.getElementById('manualFactors')?.value.trim() || '';
    
    if (!lastName || !firstName || !position) {
        alert('❌ Заполните Фамилию, Имя и Должность!');
        return;
    }
    
    const snils = 'manual_med_' + Date.now();
    const manualEmp = {
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName,
        position: position,
        department: department,
        birthDate: birthDate,
        gender: gender,
        policyNumber: policy,
        medFactors: factors,
        snils: snils,
        tabNumber: snils,
        is_manual: true
    };
    
    manualMedEmployees.push(manualEmp);
    localStorage.setItem(`medData_${snils}`, JSON.stringify({
        checked: true,
        birthDate, gender, policy, factors, department
    }));
    
    // Очищаем форму
    ['manualLastName','manualFirstName','manualMiddleName','manualPosition','manualDepartment',
     'manualBirthDate','manualPolicy','manualFactors'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['manualGender'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    document.getElementById('medManualForm').classList.add('hidden');
    renderMedEmployeeList('med');
    alert('✅ Сотрудник добавлен!');
}

function addManualPsychoEmployee() {
    const lastName = document.getElementById('psychoManualLastName')?.value.trim();
    const firstName = document.getElementById('psychoManualFirstName')?.value.trim();
    const middleName = document.getElementById('psychoManualMiddleName')?.value.trim() || '';
    const position = document.getElementById('psychoManualPosition')?.value.trim();
    const department = document.getElementById('psychoManualDepartment')?.value.trim() || '';
    const birthDate = document.getElementById('psychoManualBirthDate')?.value.trim() || '';
    const gender = document.getElementById('psychoManualGender')?.value || '';
    const address = document.getElementById('psychoManualAddress')?.value.trim() || '';
    const activityId = document.getElementById('psychoManualActivity')?.value || '';
    
    if (!lastName || !firstName || !position) {
        alert('❌ Заполните Фамилию, Имя и Должность!');
        return;
    }
    if (!activityId) {
        alert('❌ Выберите вид деятельности!');
        return;
    }
    
    const snils = 'manual_psycho_' + Date.now();
    const manualEmp = {
        last_name: lastName,
        first_name: firstName,
        middle_name: middleName,
        position: position,
        department: department,
        birthDate: birthDate,
        gender: gender,
        registrationAddress: address,
        psychoActivity: activityId,
        snils: snils,
        tabNumber: snils,
        is_manual: true
    };
    
    manualPsychoEmployees.push(manualEmp);
    localStorage.setItem(`psychoData_${snils}`, JSON.stringify({
        checked: true,
        birthDate, gender, regAddress: address, activityId, department
    }));
    
    ['psychoManualLastName','psychoManualFirstName','psychoManualMiddleName','psychoManualPosition',
     'psychoManualDepartment','psychoManualBirthDate','psychoManualAddress'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['psychoManualGender','psychoManualActivity'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    document.getElementById('psychoManualForm').classList.add('hidden');
    renderMedEmployeeList('psycho');
    alert('✅ Сотрудник добавлен!');
}
// ============================================================
// DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const mainPage = document.getElementById('mainPage');
    if (mainPage) mainPage.style.display = 'block';
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === 'Главная') link.classList.add('active');
    });
    initTrainingPage();
});


// ============================================================
// УЧЁТ СОТРУДНИКОВ: обучение / медосмотр / психо / СИЗ + ПРОТОКОЛ НАРУШЕНИЙ
// Данные: localStorage['empRecords'] = { <СНИЛС|табельный|ФИО>: {...} }
// ============================================================
function rgEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function rgKey(e) { return e.snils || e.tabNumber || ((e.last_name || '') + '_' + (e.first_name || '') + '_' + (e.birthDate || '')); }
function getEmpRecords() { try { return JSON.parse(localStorage.getItem('empRecords') || '{}'); } catch (e) { return {}; } }
function saveEmpRecords(r) { localStorage.setItem('empRecords', JSON.stringify(r)); }
function rgRec(key) {
    const r = getEmpRecords()[key] || {};
    return {
        training: r.training || { status: '', program: '', date: '', next: '' },
        med: r.med || { status: '', date: '', next: '' },
        psycho: r.psycho || { status: '', date: '', next: '' },
        ppeIssued: r.ppeIssued || '',
        ppeMissing: r.ppeMissing || ''
    };
}
function rgFio(e) { return [e.last_name, e.first_name, e.middle_name].filter(Boolean).join(' '); }
function rgExpired(next) { return !!next && next < new Date().toISOString().split('T')[0]; }
function rgState(b) {
    if (b.status === 'no') return { cls: 'bad', txt: 'Не пройдено' };
    if (b.status === 'yes' && rgExpired(b.next)) return { cls: 'bad', txt: 'Просрочено' };
    if (b.status === 'yes') return { cls: 'ok', txt: 'Пройдено' };
    return { cls: 'na', txt: 'Нет данных' };
}
function rgPpeState(r) {
    const miss = r.ppeMissing.split('\n').map(s => s.trim()).filter(Boolean).length;
    const got = r.ppeIssued.split('\n').map(s => s.trim()).filter(Boolean).length;
    if (miss) return { cls: 'bad', txt: 'Не выдано: ' + miss };
    if (got) return { cls: 'ok', txt: 'Выдано: ' + got };
    return { cls: 'na', txt: 'Нет данных' };
}
function renderRegistry() {
    const box = document.getElementById('registryTable');
    if (!box) return;
    const q = ((document.getElementById('registrySearch') || {}).value || '').toLowerCase();
    let emps = getAllEmployees().filter(e => (rgFio(e) + ' ' + (e.position || '')).toLowerCase().includes(q));
    const dm = (document.getElementById('rgDateMode') || {}).value || '', dFrom = (document.getElementById('rgFrom') || {}).value || '', dTo = (document.getElementById('rgTo') || {}).value || '';
    const hits = {};
    if (dm) emps = emps.filter(e => {
        const h = getTrainingMatches(e).filter(m => { const iso = rgIso(dm === 'check' ? m.checkDate : m.regDate); return iso && (!dFrom || iso >= dFrom) && (!dTo || iso <= dTo); });
        if (h.length) hits[rgKey(e)] = h; return h.length > 0;
    });
    let bad = 0, ok = 0;
    const rows = emps.map(e => {
        const k = rgKey(e), r = rgRec(k);
        const st = [rgTrainingState(e, r), rgState(r.med), rgState(r.psycho), rgPpeState(r)];
        if (st.some(s => s.cls === 'bad')) bad++; else if (st.every(s => s.cls === 'ok')) ok++;
        const cell = (s, tab) => `<td><span class="rg-badge ${s.cls}" onclick="openRegistryModal(decodeURIComponent('${encodeURIComponent(k)}'))">${s.txt}</span></td>`;
        return `<tr><td><a href="#" class="rg-name" onclick="event.preventDefault();openRegistryModal(decodeURIComponent('${encodeURIComponent(k)}'))">${rgEsc(rgFio(e))}</a></td><td>${rgEsc(e.position)}</td>${cell(st[0])}${cell(st[1])}${cell(st[2])}${cell(st[3])}${dm ? '<td style="font-size:12px;">' + (hits[k] || []).map(m => rgEsc(trProgShort(m.prog)) + ': проверка ' + rgEsc(m.checkDate) + ', в реестре ' + rgEsc(m.regDate) + (m.type === 'full' ? '' : ' ⚠')).join('<br>') + '</td>' : ''}</tr>`;
    }).join('');
    document.getElementById('registrySummary').innerHTML =
        `<div class="rg-card"><b>${emps.length}</b><span>сотрудников</span></div>` +
        `<div class="rg-card ok"><b>${ok}</b><span>без замечаний</span></div>` +
        `<div class="rg-card bad"><b>${bad}</b><span>с нарушениями</span></div>`;
    box.innerHTML = emps.length
        ? `<table class="rg-table"><thead><tr><th>ФИО</th><th>Должность</th><th>Обучение</th><th>Медосмотр</th><th>Психо</th><th>СИЗ</th>${dm ? '<th>Даты по реестру</th>' : ''}</tr></thead><tbody>${rows}</tbody></table>`
        : '<p style="color:#8888aa;text-align:center;padding:30px;">Сотрудников нет. Загрузите штатное расписание в разделе «Обучение».</p>';
}
function openRegistryModal(key) {
    const e = getAllEmployees().find(x => rgKey(x) === key);
    if (!e) { alert('❌ Сотрудник не найден'); return; }
    const r = rgRec(key);
    const sel = (id, v) => `<select id="${id}" class="rg-input"><option value=""${v === '' ? ' selected' : ''}>— нет данных —</option><option value="yes"${v === 'yes' ? ' selected' : ''}>Пройдено</option><option value="no"${v === 'no' ? ' selected' : ''}>Не пройдено</option></select>`;
    const old = document.getElementById('registryModal'); if (old) old.remove();
    const m = document.createElement('div');
    m.className = 'modal-overlay'; m.id = 'registryModal';
    m.innerHTML = `<div class="modal-content" style="max-width:640px;max-height:90vh;overflow-y:auto;">
        <div class="modal-header"><h3>📋 ${rgEsc(rgFio(e))}</h3><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✖</button></div>
        <div style="padding:16px 20px;">
            ${registryDetailsHtml(e)}
            <h4 class="rg-h">Обучение по охране труда (ручная отметка, приоритетнее реестра)</h4>
            <div class="rg-grid">${sel('rgTrSt', r.training.status)}<input id="rgTrProg" class="rg-input" placeholder="Программа (А, Б, В, ПП...)" value="${rgEsc(r.training.program)}"><label>Дата<input type="date" id="rgTrDate" class="rg-input" value="${rgEsc(r.training.date)}"></label><label>Следующее до<input type="date" id="rgTrNext" class="rg-input" value="${rgEsc(r.training.next)}"></label></div>
            <h4 class="rg-h">Медосмотр</h4>
            <div class="rg-grid">${sel('rgMedSt', r.med.status)}<span></span><label>Дата<input type="date" id="rgMedDate" class="rg-input" value="${rgEsc(r.med.date)}"></label><label>Следующий до<input type="date" id="rgMedNext" class="rg-input" value="${rgEsc(r.med.next)}"></label></div>
            <h4 class="rg-h">Психосвидетельствование</h4>
            <div class="rg-grid">${sel('rgPsSt', r.psycho.status)}<span></span><label>Дата<input type="date" id="rgPsDate" class="rg-input" value="${rgEsc(r.psycho.date)}"></label><label>Следующее до<input type="date" id="rgPsNext" class="rg-input" value="${rgEsc(r.psycho.next)}"></label></div>
            <h4 class="rg-h">СИЗ (по одному в строке) <button class="btn-secondary" style="float:right;padding:4px 10px;font-size:12px;" onclick="autoPickPPE(decodeURIComponent('${encodeURIComponent(key)}'))">⚙️ Подобрать по нормам 767н</button></h4>
            <div class="rg-grid"><label>Выдано<textarea id="rgPpeOk" class="rg-input" rows="4">${rgEsc(r.ppeIssued)}</textarea></label><label>Не выдано (нарушение)<textarea id="rgPpeNo" class="rg-input" rows="4">${rgEsc(r.ppeMissing)}</textarea></label></div>
        </div>
        <div class="modal-footer"><button class="btn-primary" id="rgSaveBtn">Сохранить</button><button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Отмена</button></div>
    </div>`;
    document.body.appendChild(m);
    const v = id => document.getElementById(id).value;
    document.getElementById('rgSaveBtn').addEventListener('click', function () {
        const all = getEmpRecords();
        all[key] = {
            training: { status: v('rgTrSt'), program: v('rgTrProg').trim(), date: v('rgTrDate'), next: v('rgTrNext') },
            med: { status: v('rgMedSt'), date: v('rgMedDate'), next: v('rgMedNext') },
            psycho: { status: v('rgPsSt'), date: v('rgPsDate'), next: v('rgPsNext') },
            ppeIssued: v('rgPpeOk').trim(), ppeMissing: v('rgPpeNo').trim()
        };
        saveEmpRecords(all);
        m.remove();
        renderRegistry();
    });
}
function generateViolationsProtocol() {
    const today = new Date();
    const due = new Date(today.getTime() + 30 * 86400000);
    const fmt = d => d.toLocaleDateString('ru-RU');
    const rows = [];
    getAllEmployees().forEach(e => {
        const r = rgRec(rgKey(e));
        const add = (v, m) => rows.push({ fio: rgFio(e), pos: e.position || '', v: v, m: m });
        if (r.training.status === '' && localStorage.getItem('trainingApplied') && !getTrainingMatches(e).some(m => /^успешно/i.test(m.result))) add('Не найдена запись об успешной проверке знаний в реестре обученных лиц', 'Организовать обучение по охране труда и внесение сведений в реестр');
        else if (r.training.status === 'no') add('Не пройдено обучение по охране труда' + (r.training.program ? ' (программа ' + r.training.program + ')' : ''), 'Организовать и провести обучение, оформить протокол проверки знаний');
        else if (r.training.status === 'yes' && rgExpired(r.training.next)) add('Истёк срок обучения по охране труда (' + new Date(r.training.next).toLocaleDateString('ru-RU') + ')', 'Организовать повторное обучение и проверку знаний');
        if (r.med.status === 'no') add('Не пройден обязательный периодический медицинский осмотр', 'Выдать направление, обеспечить прохождение осмотра');
        else if (r.med.status === 'yes' && rgExpired(r.med.next)) add('Просрочен периодический медицинский осмотр', 'Выдать направление, обеспечить прохождение осмотра');
        if (r.psycho.status === 'no') add('Не пройдено психиатрическое освидетельствование', 'Выдать направление, обеспечить прохождение освидетельствования');
        else if (r.psycho.status === 'yes' && rgExpired(r.psycho.next)) add('Просрочено психиатрическое освидетельствование', 'Выдать направление, обеспечить прохождение освидетельствования');
        r.ppeMissing.split('\n').map(s => s.trim()).filter(Boolean).forEach(p => add('Не выданы СИЗ: ' + p, 'Выдать СИЗ, внести запись в личную карточку учёта выдачи СИЗ'));
    });
    if (!rows.length) { alert('✅ Нарушений не найдено. Отметьте «Не пройдено» / «Не выдано» в карточках сотрудников или проверьте сроки.'); return; }
    const org = (typeof getOrgName === 'function' ? getOrgName() : '') || '________________________';
    const body = rows.map((x, i) => `<tr><td>${i + 1}</td><td>${rgEsc(x.fio)}<br><small>${rgEsc(x.pos)}</small></td><td>${rgEsc(x.v)}</td><td>${rgEsc(x.m)}</td><td>${fmt(due)}</td><td></td></tr>`).join('');
    const html = `<div style="font-family:'Times New Roman',serif;color:#000;padding:10mm;">
        <h2 style="text-align:center;margin:0 0 4px;">ПРОТОКОЛ</h2>
        <p style="text-align:center;margin:0 0 14px;">выявленных нарушений требований охраны труда и мероприятий по их устранению<br>${rgEsc(org)} · от ${fmt(today)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;" border="1" cellpadding="6">
        <thead><tr style="background:#f3f0ff;"><th>№</th><th>Работник</th><th>Выявленное нарушение</th><th>Мероприятие по устранению</th><th>Срок</th><th>Отметка об исполнении</th></tr></thead>
        <tbody>${body}</tbody></table>
        <p style="margin-top:30px;">Ответственный за охрану труда: ______________ / ______________<br><br>Руководитель организации: ______________ / ______________</p></div>`;
    openPrintWindow(html, 'Протокол устранения нарушений');
}
// Подключение страницы «Учёт» к навигации (оригинальный showPage не трогаем)
(function () {
    const orig = showPage;
    showPage = function (page) {
        const rp = document.getElementById('registryPage');
        if (rp) rp.classList.add('hidden');
        if (page === 'registry') {
            orig('__none');
            if (rp) rp.classList.remove('hidden');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.textContent.indexOf('Учёт') !== -1));
            renderRegistry();
        } else {
            orig(page);
        }
    };
})();


// ============================================================
// ИМПОРТ ВЫПИСОК ИЗ РЕЕСТРА ОБУЧЕННЫХ ЛИЦ (PDF) И СОПОСТАВЛЕНИЕ СО ШТАТКОЙ
// Хранение: localStorage['trainingRegistry'] = { orgs:[], progs:[], recs:[[reg,fio,snils,pos,orgIdx,progIdx,protocol,result,checkDate,regDate],...] }
// Совпадение: СНИЛС или ФИО. Должность совпала -> 'full', не совпала -> 'fio'.
// ============================================================
async function loadPdfJs() {
    if (window.pdfjsLib) return window.pdfjsLib;
    const bases = ['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/', 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/'];
    let lastErr = null;
    for (const base of bases) {
        try {
            await new Promise((res, rej) => {
                const sc = document.createElement('script');
                sc.src = base + 'pdf.min.js';
                sc.onload = res;
                sc.onerror = () => rej(new Error('не загрузился ' + sc.src));
                document.head.appendChild(sc);
            });
            let wsrc = base + 'pdf.worker.min.js';
            try { const txt = await (await fetch(wsrc)).text(); wsrc = URL.createObjectURL(new Blob([txt], { type: 'text/javascript' })); } catch (e) { /* останется прямая ссылка */ }
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = wsrc;
            return window.pdfjsLib;
        } catch (e) { lastErr = e; }
    }
    throw new Error('Не удалось загрузить библиотеку чтения PDF (проверьте интернет). ' + (lastErr ? lastErr.message : ''));
}
function getTrainingRegistry() {
    try { const r = JSON.parse(localStorage.getItem('trainingRegistry')); if (r && r.recs) return r; } catch (e) {}
    return { orgs: [], progs: [], recs: [] };
}
function saveTrainingRegistry(r) { localStorage.setItem('trainingRegistry', JSON.stringify(r)); }
function trNorm(s) { return String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^а-яa-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
function trSamePos(a, b) {
    a = trNorm(a); b = trNorm(b);
    if (!a || !b) return false;
    if (a === b || a.includes(b) || b.includes(a)) return true;
    const ta = a.split(' ').filter(w => w.length > 3).map(w => w.slice(0, 5)), tb = b.split(' ').filter(w => w.length > 3).map(w => w.slice(0, 5));
    if (!ta.length || !tb.length) return false;
    const common = ta.filter(w => tb.includes(w)).length;
    return common / Math.min(ta.length, tb.length) >= 0.7;
}

// Разбор страницы: items -> записи. Колонки по X (масштаб относительно ширины 935pt).
function parseRegistryPage(items, pageWidth) {
    const k = pageWidth / 935, B = [0, 120 * k, 250 * k, 380 * k, 635 * k];
    const colOf = x => { let c = 0; for (let i = 0; i < B.length; i++) if (x >= B[i] - 1) c = i; return c; };
    const raw = items.filter(i => i.str && i.str.trim()).map(i => ({ x: i.transform[4], y: -i.transform[5], s: i.str.trim() }));
    raw.sort((a, b) => a.y - b.y || a.x - b.x);
    const lines = [];
    raw.forEach(it => {
        const c = colOf(it.x);
        const last = lines.slice(-12).reverse().find(l => l.c === c && Math.abs(l.y - it.y) < 2.5);
        if (last) last.s += ' ' + it.s; else lines.push({ c: c, y: it.y, x: it.x, s: it.s });
    });
    lines.sort((a, b) => a.y - b.y || a.x - b.x);
    const starts = lines.filter(l => l.c === 3 && /пройдена в/.test(l.s)).map(l => l.y);
    const out = [];
    starts.forEach((s, i) => {
        const e = i + 1 < starts.length ? starts[i + 1] - 3 : Infinity;
        const blk = lines.filter(l => l.y >= s - 3 && l.y < e);
        const col = n => blk.filter(l => l.c === n).map(l => l.s).join(' ');
        const c1 = col(0), c2 = col(1), c3 = col(2), c45 = col(3) + ' ' + col(4);
        const dates = c45.match(/\d{2}\.\d{2}\.\d{4}/g) || [];
        const c4 = col(3).replace(/\d{2}\.\d{2}\.\d{4}/g, '').replace(/\s+/g, ' ');
        const snM = c2.match(/\d{3}-\d{3}-\d{3} \d{2}/);
        const fio = c2.replace(/\d{3}-\d{3}-\d{3} \d{2}/, '').replace(/\s+/g, ' ').trim();
        const innM = c3.match(/\b\d{10,12}\b/);
        let org = '', pos = c3;
        if (innM) { const i2 = c3.indexOf(innM[0]); org = c3.slice(0, i2).trim(); pos = c3.slice(i2 + innM[0].length).trim(); }
        const tm = c4.match(/Место обучения:\s*(\d{10,12})?\s*(.*?)\s*Номер протокола:\s*(\S+)/);
        let prog = '';
        const pm = c4.match(/Программа обучения:\s*(.*?)\s*Результат:\s*(.*)$/);
        const pm2 = c4.match(/Номер протокола:\s*\S+\s*(.*?)\s*Результат:\s*(.*)$/);
        const resM = (pm || pm2);
        if (resM) prog = resM[1].trim();
        const resRaw = resM ? resM[2].trim() : '';
        const resK = resRaw.match(/^(Не\s?успешно|Успешно|Неуспешно)/i);
        const result = resK ? resK[1] : resRaw.slice(0, 30);
        const reg = (c1.match(/\d{9}/) || [''])[0];
        if (!fio) return;
        const inSys = (col(3).match(/пройдена в системе:\s*(Да|Нет)/i) || ['', ''])[1];
        out.push({ workOrg: org, workInn: innM ? innM[0] : '', inSystem: inSys, reg: reg, fio: fio, snils: snM ? snM[0] : '', pos: pos, trainOrg: tm ? ((tm[1] ? tm[1] + ' ' : '') + tm[2]).trim() : '', protocol: tm ? tm[3] : '', prog: prog, result: result, checkDate: dates[0] || '', regDate: dates[1] || '' });
    });
    return out;
}
async function importRegistryFiles(fileList) {
    const status = document.getElementById('registryImportStatus');
    if (status) status.textContent = 'Загружаю библиотеку чтения PDF…';
    const pdfjs = await loadPdfJs();
    const reg = getTrainingRegistry();
    const known = new Set(reg.recs.map(r => r[0] + '|' + r[5] + '|' + r[6]));
    let added = 0, skipped = 0;
    for (const file of fileList) {
        const buf = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buf }).promise;
        for (let p = 1; p <= pdf.numPages; p++) {
            if (status) status.textContent = `${file.name}: страница ${p} из ${pdf.numPages}…`;
            const page = await pdf.getPage(p);
            const vp = page.getViewport({ scale: 1 });
            const tc = await page.getTextContent();
            parseRegistryPage(tc.items, vp.width).forEach(r => {
                let oi = reg.orgs.indexOf(r.trainOrg); if (oi < 0) { reg.orgs.push(r.trainOrg); oi = reg.orgs.length - 1; }
                let pi = reg.progs.indexOf(r.prog); if (pi < 0) { reg.progs.push(r.prog); pi = reg.progs.length - 1; }
                const key = r.reg + '|' + pi + '|' + r.protocol;
                if (known.has(key)) { skipped++; return; }
                known.add(key);
                let wi = reg.orgs.indexOf(r.workOrg); if (wi < 0) { reg.orgs.push(r.workOrg); wi = reg.orgs.length - 1; }
                reg.recs.push([r.reg, r.fio, r.snils, r.pos, oi, pi, r.protocol, r.result, r.checkDate, r.regDate, wi, r.workInn, r.inSystem]);
                added++;
            });
            if (p % 20 === 0) await new Promise(r => setTimeout(r, 0));
        }
    }
    try { saveTrainingRegistry(reg); } catch (e) { alert('❌ Не хватает места в localStorage. Очистите старые реестры или импортируйте меньше файлов.'); return; }
        localStorage.setItem('trainingApplied', String(Date.now()));
    return { added: added, skipped: skipped };
}
let pendingRegistryFiles = [];
function addRegistryFiles(input) {
    [...input.files].forEach(f => { if (!pendingRegistryFiles.some(x => x.name === f.name && x.size === f.size)) pendingRegistryFiles.push(f); });
    input.value = '';
    renderPendingRegistryFiles();
}
function removePendingRegistryFile(i) { pendingRegistryFiles.splice(i, 1); renderPendingRegistryFiles(); }
function renderPendingRegistryFiles() {
    const el = document.getElementById('registryPendingList'); if (!el) return;
    el.innerHTML = pendingRegistryFiles.map((f, i) => `<div class="rg-file">📄 ${rgEsc(f.name)} <small>(${Math.round(f.size / 1024)} КБ)</small> <a href="#" onclick="event.preventDefault();removePendingRegistryFile(${i})">✖</a></div>`).join('');
    const btn = document.getElementById('registryApplyBtn'); if (btn) btn.disabled = false;
}
async function applyRegistryFiles() {
    const status = document.getElementById('registryImportStatus');
    const btn = document.getElementById('registryApplyBtn');
    const reg0 = getTrainingRegistry();
    if (!pendingRegistryFiles.length && !reg0.recs.length) { if (status) { status.style.color = '#f87171'; status.textContent = '❌ Сначала выберите PDF-файлы реестровых записей.'; } return; }
    if (btn) btn.disabled = true;
    if (status) status.style.color = '#c4b5fd';
    try {
        let res = { added: 0, skipped: 0 };
        if (pendingRegistryFiles.length) res = await importRegistryFiles(pendingRegistryFiles);
        else localStorage.setItem('trainingApplied', String(Date.now()));
        pendingRegistryFiles = []; renderPendingRegistryFiles();
        _trIndex = null;
        renderRegistryImportInfo();
        renderStaffWithDepartments();
        if (status) status.textContent = `✅ Применено. Новых записей: ${res.added}, дублей: ${res.skipped}. Результаты — на странице «Учёт».`;
        showPage('registry');
    } catch (e) {
        console.error(e);
        if (status) { status.style.color = '#f87171'; status.textContent = '❌ Ошибка: ' + e.message; }
        else alert('❌ Ошибка: ' + e.message);
    }
    if (btn) btn.disabled = false;
}
function clearTrainingRegistry() {
    if (!confirm('Удалить все импортированные реестры? Штатка не изменится.')) return;
    localStorage.removeItem('trainingRegistry');
    renderRegistryImportInfo(); renderStaffWithDepartments();
}
// Совпадения для одного сотрудника
let _trIndex = null, _trIndexLen = -1;
function trIndex() {
    const reg = getTrainingRegistry();
    if (_trIndex && _trIndexLen === reg.recs.length) return _trIndex;
    const bySn = {}, byFio = {}, byLF = {};
    reg.recs.forEach((r, i) => {
        const sn = String(r[2]).replace(/\D/g, ''); if (sn) (bySn[sn] = bySn[sn] || []).push(i);
        const f = trNorm(r[1]); (byFio[f] = byFio[f] || []).push(i);
        const w = f.split(' '); if (w.length >= 2) { const k = w[0] + ' ' + w[1]; (byLF[k] = byLF[k] || []).push(i); }
    });
    _trIndex = { reg: reg, bySn: bySn, byFio: byFio, byLF: byLF }; _trIndexLen = reg.recs.length;
    return _trIndex;
}
function getTrainingMatches(e) {
    const ix = trIndex();
    const fio = trNorm([e.last_name, e.first_name, e.middle_name].filter(Boolean).join(' '));
    const fw = fio.split(' ');
    const sn = String(e.snils || '').replace(/\D/g, '');
    const kind = new Map();
    if (sn.length === 11) (ix.bySn[sn] || []).forEach(i => kind.set(i, 'snils'));
    (ix.byFio[fio] || []).forEach(i => { if (!kind.has(i)) kind.set(i, 'fio'); });
    if (fw.length >= 2) (ix.byLF[fw[0] + ' ' + fw[1]] || []).forEach(i => {
        if (kind.has(i)) return;
        const rw = trNorm(ix.reg.recs[i][1]).split(' ');
        if (fw[2] && rw[2] && fw[2][0] !== rw[2][0]) return;
        kind.set(i, 'lf');
    });
    return [...kind.entries()].map(([i, k]) => {
        const r = ix.reg.recs[i];
        const posOk = trSamePos(r[3], e.position);
        return { reg: r[0], fio: r[1], snils: r[2], pos: r[3], trainOrg: ix.reg.orgs[r[4]], prog: ix.reg.progs[r[5]], protocol: r[6], result: r[7], checkDate: r[8], regDate: r[9],
            workOrg: r[10] != null ? ix.reg.orgs[r[10]] : '', workInn: r[11] || '', inSystem: r[12] || '',
            how: k, posOk: posOk, type: (k === 'snils' || (k === 'fio' && posOk)) ? 'full' : 'fio' };
    }).sort((a, b) => (b.checkDate.split('.').reverse().join('') > a.checkDate.split('.').reverse().join('')) ? 1 : -1);
}
function trProgShort(p) {
    p = trNorm(p);
    if (p.startsWith('общие вопросы')) return 'А';
    if (p.includes('воздействии вредных')) return 'Б';
    if (p.includes('перв') && p.includes('помощ')) return 'ПП';
    if (p.includes('средств индивидуальной защиты')) return 'СИЗ';
    if (p.includes('высот')) return 'Высота';
    if (p.includes('земляных')) return 'Земляные';
    if (p.includes('строительных')) return 'Строит.';
    if (p.includes('полотна')) return 'Дороги';
    return p.slice(0, 14);
}
function openTrainingResults(key) {
    const e = getAllEmployees().find(x => rgKey(x) === key); if (!e) return;
    const ms = getTrainingMatches(e);
    const old = document.getElementById('trainingResultsModal'); if (old) old.remove();
    const rows = ms.map(m => `<tr><td>${rgEsc(m.prog)}</td><td>${rgEsc(m.trainOrg)}</td><td>${rgEsc(m.protocol)}</td><td>${rgEsc(m.result)}</td><td>${rgEsc(m.checkDate)}</td><td>${rgEsc(m.regDate)}</td><td>${m.type === 'full' ? '✅ ФИО и должность' : '⚠️ только ФИО<br><small>в реестре: ' + rgEsc(m.pos) + '</small>'}</td></tr>`).join('');
    const m = document.createElement('div'); m.className = 'modal-overlay'; m.id = 'trainingResultsModal';
    m.innerHTML = `<div class="modal-content" style="max-width:1000px;max-height:90vh;overflow:auto;"><div class="modal-header"><h3>🎓 ${rgEsc(rgFio(e))} — результаты по реестру</h3><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✖</button></div><div style="padding:16px 20px;overflow-x:auto;">${ms.length ? `<table class="rg-table"><thead><tr><th>Программа</th><th>Организация-обучатель</th><th>Протокол</th><th>Результат</th><th>Проверка знаний</th><th>Внесено в реестр</th><th>Совпадение</th></tr></thead><tbody>${rows}</tbody></table>` : '<p style="color:#8888aa">В импортированных реестрах записей нет.</p>'}</div></div>`;
    document.body.appendChild(m);
}
// Бейдж в строках штатки
(function () {
    const orig = renderStaffWithDepartments;
    renderStaffWithDepartments = function () {
        orig.apply(this, arguments);
        try { decorateStaffWithTraining(); } catch (e) { console.error(e); }
    };
})();
function decorateStaffWithTraining() {
    if (!getTrainingRegistry().recs.length) return;
    const emps = getAllEmployees();
    document.querySelectorAll('#staffContainer .employee-row').forEach(row => {
        const cb = row.querySelector('.staff-check'); if (!cb) return;
        const id = cb.dataset.snils;
        const e = emps.find(x => (x.snils || x.tabNumber) === id); if (!e) return;
        const ms = getTrainingMatches(e);
        const b = document.createElement('span');
        const full = ms.filter(m => m.type === 'full').length;
        b.className = 'rg-badge ' + (ms.length ? (full ? 'ok' : 'warn') : 'bad');
        b.style.marginLeft = '8px';
        b.title = 'Результаты обучения по реестру';
        b.textContent = ms.length ? '🎓 ' + [...new Set(ms.map(m => trProgShort(m.prog)))].join(', ') + (full ? '' : ' ⚠') : '🎓 нет в реестре';
        b.onclick = ev => { ev.stopPropagation(); openTrainingResults(rgKey(e)); };
        const name = row.querySelector('.emp-name'); if (name) name.after(b);
    });
}
function renderRegistryImportInfo() {
    const el = document.getElementById('registryImportInfo'); if (!el) return;
    const reg = getTrainingRegistry();
    let full = 0, fioOnly = 0, none = 0;
    if (reg.recs.length) getAllEmployees().forEach(e => { const ms = getTrainingMatches(e); if (!ms.length) none++; else if (ms.some(m => m.type === 'full')) full++; else fioOnly++; });
    el.innerHTML = reg.recs.length ? `В базе: <b>${reg.recs.length}</b> записей. Сотрудников: полное совпадение — <b style="color:#34d399">${full}</b>, только ФИО — <b style="color:#fbbf24">${fioOnly}</b>, нет в реестре — <b style="color:#f87171">${none}</b>.` : 'Реестры ещё не импортированы.';
}
document.addEventListener('DOMContentLoaded', function () {
    renderRegistryImportInfo();
});


// ============================================================
// НОРМЫ СИЗ (приказ 767н): база хранится локально, импорт строками «Профессия | СИЗ | Норма»
// ВАЖНО: база наполняется из официального текста приказа, в коде её нет.
// ============================================================
function getPpeNorms() { try { return JSON.parse(localStorage.getItem('ppeNorms') || '[]'); } catch (e) { return []; } }
function openPpeNormsModal() {
    const old = document.getElementById('ppeNormsModal'); if (old) old.remove();
    const m = document.createElement('div'); m.className = 'modal-overlay'; m.id = 'ppeNormsModal';
    const cur = getPpeNorms();
    m.innerHTML = `<div class="modal-content" style="max-width:760px;max-height:90vh;overflow:auto;"><div class="modal-header"><h3>📚 Нормы СИЗ (767н)</h3><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✖</button></div>
    <div style="padding:16px 20px;"><p style="color:#8888aa;font-size:13px;">Одна строка — одна позиция: <b>Профессия | Наименование СИЗ | Норма выдачи</b>. В базе сейчас: <b>${cur.length}</b> позиций. Вставьте текст или загрузите .txt/.csv — новые строки добавятся к существующим.</p>
    <textarea id="ppeNormsText" class="rg-input" rows="10" placeholder="Электросварщик ручной сварки | Костюм для защиты от искр и брызг металла | 1 шт. на 12 мес."></textarea>
    <input type="file" id="ppeNormsFile" accept=".txt,.csv" style="margin-top:8px;color:#8888aa;"></div>
    <div class="modal-footer"><button class="btn-primary" id="ppeNormsSave">Добавить в базу</button><button class="btn-secondary" id="ppeNormsClear">Очистить базу</button></div></div>`;
    document.body.appendChild(m);
    document.getElementById('ppeNormsFile').addEventListener('change', function () {
        const f = this.files[0]; if (!f) return;
        const r = new FileReader(); r.onload = () => { document.getElementById('ppeNormsText').value = r.result; }; r.readAsText(f, 'utf-8');
    });
    document.getElementById('ppeNormsSave').addEventListener('click', function () {
        const add = document.getElementById('ppeNormsText').value.split(/\r?\n/).map(l => l.split(/\||;|\t/).map(x => x.trim())).filter(a => a.length >= 2 && a[0] && a[1]).map(a => ({ prof: a[0], name: a[1], norm: a[2] || '' }));
        if (!add.length) { alert('Не найдено строк формата «Профессия | СИЗ | Норма»'); return; }
        try { localStorage.setItem('ppeNorms', JSON.stringify(getPpeNorms().concat(add))); } catch (e) { alert('❌ Не хватает места'); return; }
        m.remove(); alert('✅ Добавлено позиций: ' + add.length);
    });
    document.getElementById('ppeNormsClear').addEventListener('click', function () { if (confirm('Очистить всю базу норм?')) { localStorage.removeItem('ppeNorms'); m.remove(); } });
}
function autoPickPPE(key) {
    const e = getAllEmployees().find(x => rgKey(x) === key); if (!e) return;
    const norms = getPpeNorms();
    if (!norms.length) { alert('База норм 767н пуста. Откройте «📚 Нормы СИЗ (767н)» на странице «Учёт» и загрузите нормы.'); return; }
    const found = norms.filter(n => trSamePos(n.prof, e.position));
    if (!found.length) { alert('Для должности «' + (e.position || '') + '» в базе норм ничего не найдено. Добавьте её вручную.'); return; }
    const issued = document.getElementById('rgPpeOk').value.toLowerCase();
    const box = document.getElementById('rgPpeNo');
    const have = box.value.split('\n').map(s => s.trim().toLowerCase());
    const lines = found.filter(n => !issued.includes(n.name.toLowerCase()) && !have.some(h => h.startsWith(n.name.toLowerCase()))).map(n => n.name + (n.norm ? ' — ' + n.norm : ''));
    box.value = (box.value.trim() ? box.value.trim() + '\n' : '') + lines.join('\n');
}


function registryDetailsHtml(e) {
    const applied = !!localStorage.getItem('trainingApplied');
    const ms = getTrainingMatches(e);
    if (!getTrainingRegistry().recs.length) return '<div class="rg-reg-box"><b>Реестр обученных лиц:</b> файлы ещё не загружены (раздел «Обучение» → «Применить»).</div>';
    if (!ms.length) return '<div class="rg-reg-box bad"><b>✖ В загруженных реестрах не найден</b> (искал по СНИЛС, ФИО, фамилии и имени).</div>';
    const how = { snils: 'по СНИЛС', fio: 'по ФИО', lf: 'по фамилии и имени (проверьте!)' };
    const f = (l, v) => v ? `<div><span>${l}</span>${rgEsc(v)}</div>` : '';
    return '<h4 class="rg-h">Сведения из реестра обученных лиц</h4>' + ms.map(m => `<div class="rg-reg-box ${/^успешно/i.test(m.result) ? 'ok' : 'bad'}">
        <div class="rg-reg-title">${/^успешно/i.test(m.result) ? '✔' : '✖'} ${rgEsc(m.prog)}</div>
        ${f('Номер в реестре', m.reg)}${f('ФИО в реестре', m.fio)}${f('СНИЛС', m.snils)}${f('Место работы', m.workOrg)}${f('ИНН места работы', m.workInn)}${f('Должность в реестре', m.pos)}
        ${f('Место обучения', m.trainOrg)}${f('Номер протокола', m.protocol)}${f('Результат', m.result)}${f('Проверка знаний пройдена в системе', m.inSystem)}
        ${f('Дата проверки знаний', m.checkDate)}${f('Дата внесения в реестр', m.regDate)}
        <div style="margin-top:6px;font-size:12px;color:#8888aa;">Совпадение ${how[m.how]}${m.posOk ? '' : ' · ⚠ должность в реестре отличается от штатки'}</div></div>`).join('');
}
function rgTrainingState(e, r) {
    if (r.training.status !== '') return rgState(r.training);
    if (!localStorage.getItem('trainingApplied')) return { cls: 'na', txt: 'Нет данных' };
    const ms = getTrainingMatches(e);
    const okm = ms.filter(m => /^успешно/i.test(m.result));
    if (!okm.length) return { cls: 'bad', txt: '✖ ' + (ms.length ? 'Не пройдено' : 'Нет в реестре') };
    const sure = okm.some(m => m.type === 'full');
    const progs = [...new Set(okm.map(m => trProgShort(m.prog)))].join(', ');
    return sure ? { cls: 'ok', txt: '✔ ' + progs } : { cls: 'warn', txt: '✔ ' + progs + ' ⚠' };
}


// ============================================================
// ИНСТРУКТАЖИ (журнал) И ТЕСТЫ (банк вопросов, прохождение, протокол)
// localStorage: briefingJournal, testBank, testResults
// ============================================================
const SF_TYPES = { INTRO: 'Вводный', PRIMARY: 'Первичный на рабочем месте', REPEAT: 'Повторный', UNPLANNED: 'Внеплановый', TARGET: 'Целевой' };
function sfGet(k) { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } }
function sfSet(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function sfUid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function sfFmt(d) { return d ? d.split('-').reverse().join('.') : ''; }
function sfYear(e) { const m = String(e.birthDate || '').match(/(19|20)\d{2}/); return m ? m[0] : ''; }
function sfShuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function sfOrg() { return (typeof getOrgName === 'function' ? getOrgName() : '') || '________________________'; }

function sfTab(name) {
    ['brief', 'bank', 'test', 'results'].forEach(t => {
        const p = document.getElementById('sfTab_' + t), b = document.getElementById('sfBtn_' + t);
        if (p) p.classList.toggle('hidden', t !== name);
        if (b) b.classList.toggle('active', t === name);
    });
    if (name === 'brief') { sfRenderEmps(); sfRenderJournal(); }
    if (name === 'bank') sfRenderBank();
    if (name === 'test') sfFillTestSelects();
    if (name === 'results') sfRenderResults();
}
function sfInit() {
    const t = document.getElementById('sfBrType');
    if (t && !t.options.length) t.innerHTML = Object.keys(SF_TYPES).map(k => `<option value="${k}">${SF_TYPES[k]}</option>`).join('');
    const f = document.getElementById('sfJrType');
    if (f && !f.options.length) f.innerHTML = '<option value="">Все виды</option>' + Object.keys(SF_TYPES).map(k => `<option value="${k}">${SF_TYPES[k]}</option>`).join('');
    const d = document.getElementById('sfBrDate'); if (d && !d.value) d.value = new Date().toISOString().split('T')[0];
    sfTab('brief');
}

// ---------- Инструктажи ----------
function sfRenderEmps() {
    const q = ((document.getElementById('sfBrSearch') || {}).value || '').toLowerCase();
    const box = document.getElementById('sfBrEmps'); if (!box) return;
    const list = getAllEmployees().filter(e => (rgFio(e) + ' ' + (e.position || '')).toLowerCase().includes(q));
    box.innerHTML = list.length ? list.map(e => `<label class="sf-emp"><input type="checkbox" class="sf-br-chk" value="${rgEsc(rgKey(e))}"> ${rgEsc(rgFio(e))} <small>${rgEsc(e.position || '')}</small></label>`).join('') : '<p style="color:#8888aa">Сотрудников нет. Загрузите штатку в разделе «Обучение».</p>';
}
function sfToggleAll(on) { document.querySelectorAll('.sf-br-chk').forEach(c => { c.checked = on; }); }
function sfSaveBriefing() {
    const keys = [...document.querySelectorAll('.sf-br-chk:checked')].map(c => c.value);
    const v = id => (document.getElementById(id) || {}).value || '';
    const type = v('sfBrType'), date = v('sfBrDate'), instr = v('sfBrInstr').trim(), pos = v('sfBrInstrPos').trim(), reason = v('sfBrReason').trim();
    if (!keys.length) { alert('Отметьте хотя бы одного сотрудника'); return; }
    if (!date) { alert('Укажите дату'); return; }
    if (!instr) { alert('Укажите ФИО инструктирующего'); return; }
    if ((type === 'UNPLANNED' || type === 'TARGET') && !reason) { alert('Для внепланового и целевого инструктажа укажите причину'); return; }
    const j = sfGet('briefingJournal'), all = getAllEmployees();
    keys.forEach(k => {
        const e = all.find(x => rgKey(x) === k); if (!e) return;
        j.push({ id: sfUid(), no: j.length + 1, type: type, date: date, key: k, fio: rgFio(e), year: sfYear(e), position: e.position || '', dept: e.department || e.dept || '', instr: instr, instrPos: pos, reason: reason });
    });
    sfSet('briefingJournal', j);
    sfToggleAll(false);
    sfRenderJournal();
    alert('✅ Записано в журнал: ' + keys.length);
}
function sfRenderJournal() {
    const box = document.getElementById('sfJournal'); if (!box) return;
    const f = (document.getElementById('sfJrType') || {}).value || '';
    const rows = sfGet('briefingJournal').filter(r => !f || r.type === f);
    box.innerHTML = rows.length ? `<table class="rg-table"><thead><tr><th>№</th><th>Дата</th><th>ФИО</th><th>Должность</th><th>Вид</th><th>Инструктор</th><th></th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.no}</td><td>${sfFmt(r.date)}</td><td>${rgEsc(r.fio)}</td><td>${rgEsc(r.position)}</td><td>${SF_TYPES[r.type]}${r.remote ? ' 🔗' : ''}</td><td>${rgEsc(r.instr)}</td><td><a href="#" class="rg-name" onclick="event.preventDefault();sfDelBriefing('${r.id}')">✖</a></td></tr>`).join('')}</tbody></table>` : '<p style="color:#8888aa">Записей нет.</p>';
}
function sfDelBriefing(id) { if (!confirm('Удалить запись из журнала?')) return; sfSet('briefingJournal', sfGet('briefingJournal').filter(r => r.id !== id)); sfRenderJournal(); }
function sfPrintJournal() {
    const f = (document.getElementById('sfJrType') || {}).value || '';
    const rows = sfGet('briefingJournal').filter(r => !f || r.type === f);
    if (!rows.length) { alert('Нет записей для печати'); return; }
    const td = 'border:1px solid #000;padding:5px;vertical-align:top;';
    const body = rows.map((r, i) => `<tr><td style="${td}">${i + 1}</td><td style="${td}">${sfFmt(r.date)}</td><td style="${td}">${rgEsc(r.fio)}</td><td style="${td}">${r.year}</td><td style="${td}">${rgEsc(r.position)}${r.dept ? '<br><small>' + rgEsc(r.dept) + '</small>' : ''}</td><td style="${td}">${SF_TYPES[r.type]}${r.reason ? '<br><small>' + rgEsc(r.reason) + '</small>' : ''}</td><td style="${td}">${rgEsc(r.instr)}<br><small>${rgEsc(r.instrPos)}</small></td><td style="${td}"></td><td style="${td}font-size:10px;">${r.remote ? 'Дистанционно<br>' + sfFmt(r.done) : ''}</td></tr>`).join('');
    const html = `<style>@page{size:A4 landscape;margin:10mm}</style><div style="font-family:'Times New Roman',serif;color:#000;font-size:12px;"><h2 style="text-align:center;margin:0 0 4px;">ЖУРНАЛ РЕГИСТРАЦИИ ИНСТРУКТАЖЕЙ ПО ОХРАНЕ ТРУДА</h2><p style="text-align:center;margin:0 0 10px;">${rgEsc(sfOrg())}${f ? ' · ' + SF_TYPES[f] + ' инструктаж' : ''}</p><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f3f0ff;"><th style="${td}">№</th><th style="${td}">Дата</th><th style="${td}">ФИО инструктируемого</th><th style="${td}">Год рожд.</th><th style="${td}">Профессия, должность</th><th style="${td}">Вид инструктажа, причина</th><th style="${td}">ФИО, должность инструктирующего</th><th style="${td}">Подпись инструктирующего</th><th style="${td}">Подпись инструктируемого</th></tr></thead><tbody>${body}</tbody></table></div>`;
    openPrintWindow(html, 'Журнал инструктажей');
}

// ---------- Банк вопросов ----------
// Формат: «# Тема», «? Вопрос», «+ верный ответ», «- неверный ответ»
function sfImportBank() {
    const txt = (document.getElementById('sfBankText') || {}).value || '';
    const bank = sfGet('testBank'); let topic = '', cur = null, added = 0;
    const push = () => { if (cur && cur.options.length >= 2 && cur.options.some(o => o.ok)) { bank.push(cur); added++; } cur = null; };
    txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean).forEach(l => {
        if (l[0] === '#') { push(); topic = l.slice(1).trim(); }
        else if (l[0] === '?') { push(); cur = { id: sfUid() + bank.length, topic: topic, text: l.slice(1).trim(), options: [] }; }
        else if ((l[0] === '+' || l[0] === '-') && cur) cur.options.push({ t: l.slice(1).trim(), ok: l[0] === '+' });
    });
    push();
    if (!added) { alert('Вопросы не распознаны. Проверьте формат: # Тема, ? Вопрос, + верный, - неверный (минимум 2 ответа, хотя бы один верный).'); return; }
    sfSet('testBank', bank); document.getElementById('sfBankText').value = ''; sfRenderBank();
    alert('✅ Добавлено вопросов: ' + added);
}
function sfRenderBank() {
    const box = document.getElementById('sfBankList'); if (!box) return;
    const bank = sfGet('testBank'), by = {};
    bank.forEach(q => { by[q.topic || 'Без темы'] = (by[q.topic || 'Без темы'] || 0) + 1; });
    box.innerHTML = Object.keys(by).length ? Object.keys(by).map(t => `<div class="rg-reg-box"><b>${rgEsc(t)}</b> — вопросов: ${by[t]} <a href="#" class="rg-name" style="float:right" onclick="event.preventDefault();sfDelTopic(decodeURIComponent('${encodeURIComponent(t)}'))">🗑 удалить тему</a></div>`).join('') : '<p style="color:#8888aa">Банк пуст.</p>';
}
function sfDelTopic(t) { if (!confirm('Удалить все вопросы темы «' + t + '»?')) return; sfSet('testBank', sfGet('testBank').filter(q => (q.topic || 'Без темы') !== t)); sfRenderBank(); }

// ---------- Прохождение теста ----------
let sfRun = null;
function sfFillTestSelects() {
    const topics = [...new Set(sfGet('testBank').map(q => q.topic || 'Без темы'))];
    const ts = document.getElementById('sfTestTopic'); if (ts) ts.innerHTML = topics.map(t => `<option>${rgEsc(t)}</option>`).join('') || '<option value="">— банк пуст —</option>';
    const es = document.getElementById('sfTestEmp'); if (es) es.innerHTML = getAllEmployees().map(e => `<option value="${rgEsc(rgKey(e))}">${rgEsc(rgFio(e))}</option>`).join('');
}
function sfBeginTest() {
    const topic = document.getElementById('sfTestTopic').value, key = document.getElementById('sfTestEmp').value;
    const n = Math.max(1, parseInt(document.getElementById('sfTestN').value) || 10), pass = parseInt(document.getElementById('sfTestPass').value) || 80;
    const pool = sfGet('testBank').filter(q => (q.topic || 'Без темы') === topic);
    if (!pool.length || !key) { alert('Выберите тему из банка и сотрудника'); return; }
    const qs = sfShuffle(pool).slice(0, n).map(q => ({ q: q, opts: sfShuffle(q.options) }));
    sfRun = { key: key, topic: topic, pass: pass, qs: qs, tr: sfLeaveTracker() };
    document.getElementById('sfTestArea').innerHTML = qs.map((x, i) => {
        const multi = x.q.options.filter(o => o.ok).length > 1;
        return `<div class="rg-reg-box"><b>${i + 1}. ${rgEsc(x.q.text)}</b>${multi ? ' <small>(несколько верных)</small>' : ''}${x.opts.map((o, j) => `<label class="sf-opt"><input type="${multi ? 'checkbox' : 'radio'}" name="sfq${i}" value="${j}"> ${rgEsc(o.t)}</label>`).join('')}</div>`;
    }).join('') + '<button class="btn-primary" onclick="sfFinishTest()">Завершить тест</button>';
}
function sfFinishTest() {
    if (!sfRun) return;
    const e = getAllEmployees().find(x => rgKey(x) === sfRun.key); if (!e) return;
    let right = 0; const wrong = [];
    sfRun.qs.forEach((x, i) => {
        const chosen = new Set([...document.querySelectorAll(`input[name="sfq${i}"]:checked`)].map(c => +c.value));
        const ok = x.opts.every((o, j) => o.ok === chosen.has(j));
        if (ok) right++; else wrong.push({ q: x.q.text, correct: x.opts.filter(o => o.ok).map(o => o.t) });
    });
    const leaves = sfRun.tr.stop();
    const total = sfRun.qs.length, score = Math.round(right / total * 100), passed = score >= sfRun.pass;
    const res = sfGet('testResults');
    const attempt = res.filter(r => r.key === sfRun.key && r.topic === sfRun.topic).length + 1;
    const date = new Date().toISOString().split('T')[0];
    res.push({ id: sfUid(), key: sfRun.key, fio: rgFio(e), position: e.position || '', topic: sfRun.topic, date: date, total: total, right: right, score: score, pass: sfRun.pass, passed: passed, attempt: attempt, wrong: wrong, leaves: leaves });
    sfSet('testResults', res);
    if (passed && document.getElementById('sfTestToAccount').checked) {
        const all = getEmpRecords(), cur = all[sfRun.key] || {};
        const next = new Date(); next.setFullYear(next.getFullYear() + 1);
        cur.training = { status: 'yes', program: sfRun.topic, date: date, next: next.toISOString().split('T')[0], source: 'lms' };
        all[sfRun.key] = cur; saveEmpRecords(all);
    }
    document.getElementById('sfTestArea').innerHTML = `<div class="rg-reg-box ${passed ? 'ok' : 'bad'}"><div class="rg-reg-title">${passed ? '✔ Тест сдан' : '✖ Тест не сдан'}: ${score}% (верно ${right} из ${total}, проходной ${sfRun.pass}%)</div>${sfLeavesHtml(leaves)}${wrong.map(w => `<div style="margin-top:8px;font-size:13px;"><b>${rgEsc(w.q)}</b><br><span style="color:#34d399">Верно: ${rgEsc(w.correct.join('; '))}</span></div>`).join('')}<div style="margin-top:10px;"><button class="btn-secondary" onclick="sfPrintResult('${res[res.length - 1].id}')">🖨 Протокол</button></div></div>`;
    sfRun = null;
}
function sfRenderResults() {
    const box = document.getElementById('sfResults'); if (!box) return;
    const r = sfGet('testResults').slice().reverse();
    box.innerHTML = r.length ? `<table class="rg-table"><thead><tr><th>Дата</th><th>ФИО</th><th>Тема</th><th>Попытка</th><th>Результат</th><th>Уходы</th><th></th></tr></thead><tbody>${r.map(x => `<tr><td>${sfFmt(x.date)}</td><td>${rgEsc(x.fio)}</td><td>${rgEsc(x.topic)}</td><td>${x.attempt}</td><td><span class="rg-badge ${x.passed ? 'ok' : 'bad'}">${x.passed ? '✔' : '✖'} ${x.score}%</span></td><td>${(x.leaves && x.leaves.length) ? '<span class="rg-badge bad">⚠ ' + x.leaves.length + '</span>' : '<span class="rg-badge ok">нет</span>'}</td><td><a href="#" class="rg-name" onclick="event.preventDefault();sfPrintResult('${x.id}')">🖨</a></td></tr>`).join('')}</tbody></table>` : '<p style="color:#8888aa">Тестов ещё не проходили.</p>';
}
function sfPrintResult(id) {
    const r = sfGet('testResults').find(x => x.id === id); if (!r) return;
    const html = `<div style="font-family:'Times New Roman',serif;color:#000;padding:15mm;font-size:14px;"><h2 style="text-align:center;margin:0 0 6px;">ПРОТОКОЛ ТЕСТИРОВАНИЯ</h2><p style="text-align:center;margin:0 0 18px;">${rgEsc(sfOrg())} · ${sfFmt(r.date)}</p>
    <p><b>Работник:</b> ${rgEsc(r.fio)}<br><b>Должность:</b> ${rgEsc(r.position)}<br><b>Тема:</b> ${rgEsc(r.topic)}<br><b>Попытка:</b> ${r.attempt}</p>
    <p>Вопросов: ${r.total}; верных ответов: ${r.right}; результат: <b>${r.score}%</b>; проходной балл: ${r.pass}%.<br><b>Итог: ${r.passed ? 'ТЕСТ СДАН' : 'ТЕСТ НЕ СДАН'}</b></p>
    
    ${sfLeavesHtml(r.leaves, true)}<p style="margin-top:40px;">Работник: ______________ / ${rgEsc(r.fio)}<br><br>Ответственный: ______________ / ______________</p></div>`;
    openPrintWindow(html, 'Протокол тестирования');
}

// Подключение страницы к навигации
(function () {
    const prev = showPage;
    showPage = function (page) {
        const sp = document.getElementById('safetyPage');
        if (sp) sp.classList.add('hidden');
        if (page === 'safety') {
            prev('__none');
            if (sp) sp.classList.remove('hidden');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.textContent.indexOf('Инструктажи') !== -1));
            sfInit();
        } else prev(page);
    };
})();
// «Усвоено (LMS)» в Учёте
(function () {
    const prev = rgTrainingState;
    rgTrainingState = function (e, r) {
        if (r.training && r.training.status === 'yes' && r.training.source === 'lms' && !rgExpired(r.training.next)) return { cls: 'warn', txt: '✔ Усвоено (тест)' };
        return prev(e, r);
    };
})();


// ============================================================
// ДИСТАНЦИОННЫЙ ИНСТРУКТАЖ ПО ССЫЛКЕ (без сервера)
// Содержимое инструктажа/теста зашито в саму ссылку (#learn=...). Сотрудник проходит и получает КОД результата,
// который присылает вам; вы вставляете код в «Принять результаты».
// ============================================================
function b64uEnc(bytes) { let s = ''; bytes.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64uDec(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; return Uint8Array.from(atob(str), c => c.charCodeAt(0)); }
async function rmEncode(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    if (window.CompressionStream) {
        const cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter(); w.write(raw); w.close();
        return 'z' + b64uEnc(new Uint8Array(await new Response(cs.readable).arrayBuffer()));
    }
    return 'r' + b64uEnc(raw);
}
async function rmDecode(s) {
    let bytes = b64uDec(s.slice(1));
    if (s[0] === 'z') { const ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(bytes); w.close(); bytes = new Uint8Array(await new Response(ds.readable).arrayBuffer()); }
    return JSON.parse(new TextDecoder().decode(bytes));
}
// ---------- Сторона специалиста ----------
async function sfMakeLinks() {
    const v = id => (document.getElementById(id) || {}).value || '';
    const keys = [...document.querySelectorAll('.sf-br-chk:checked')].map(c => c.value);
    const type = v('sfBrType'), text = v('sfRmText').trim(), instr = v('sfBrInstr').trim();
    let base = v('sfRmBase').trim();
    if (!keys.length) { alert('Отметьте сотрудников выше в списке'); return; }
    if (!text) { alert('Впишите текст инструктажа'); return; }
    if (!instr) { alert('Укажите ФИО инструктирующего'); return; }
    if (!base) { alert('Укажите адрес сайта, на котором лежит копия сервиса (см. подсказку ниже)'); return; }
    if (/^file:/i.test(base)) { alert('Адрес file:// не откроется на телефоне сотрудника. Нужен адрес сайта (подсказка ниже).'); return; }
    localStorage.setItem('sfBaseUrl', base);
    base = base.split('#')[0];
    let qs;
    if (document.getElementById('sfRmWithTest').checked) {
        const topic = v('sfRmTopic'), n = Math.max(1, parseInt(v('sfRmN')) || 10);
        const pool = sfGet('testBank').filter(q => (q.topic || 'Без темы') === topic);
        if (!pool.length) { alert('В банке нет вопросов по выбранной теме'); return; }
        qs = sfShuffle(pool).slice(0, n).map(q => ({ t: q.text, o: q.options.map(o => [o.t, o.ok ? 1 : 0]) }));
    }
    const all = getAllEmployees(), box = document.getElementById('sfRmLinks'); box.innerHTML = ''; let txt = '';
    for (const k of keys) {
        const e = all.find(x => rgKey(x) === k); if (!e) continue;
        const d = { v: 1, k: k, f: rgFio(e), p: e.position || '', ty: type, ti: v('sfRmTitle').trim() || (SF_TYPES[type] + ' инструктаж'), b: text, m: Math.max(0, parseInt(v('sfRmMin')) || 0), d: v('sfBrDate'), i: instr, ip: v('sfBrInstrPos').trim(), r: v('sfBrReason').trim(), x: v('sfRmExp') };
        if (qs) { d.q = qs; d.ps = Math.max(1, parseInt(v('sfRmPass')) || 80); }
        const link = base + '#learn=' + await rmEncode(d);
        txt += rgFio(e) + ' — ' + link + '\n\n';
        const row = document.createElement('div'); row.className = 'rg-reg-box';
        row.innerHTML = `<b>${rgEsc(rgFio(e))}</b> <small style="color:#8888aa">(${link.length} симв.)</small><input class="rg-input" readonly style="margin-top:6px;" value="${rgEsc(link)}" onclick="this.select()">`;
        box.appendChild(row);
    }
    const cp = document.createElement('button'); cp.className = 'btn-primary'; cp.textContent = '📋 Скопировать все (ФИО — ссылка)';
    cp.onclick = () => navigator.clipboard.writeText(txt).then(() => alert('Скопировано'), () => alert('Не удалось скопировать, выделите ссылки вручную'));
    box.appendChild(cp);
}
async function sfAcceptCodes() {
    const raw = (document.getElementById('sfRmCodes') || {}).value || '';
    const tokens = raw.split(/\s+/).filter(t => t.indexOf('OT1.') === 0);
    if (!tokens.length) { alert('Коды не найдены (они начинаются с OT1.)'); return; }
    const j = sfGet('briefingJournal'), res = sfGet('testResults'), all = getAllEmployees();
    const toAcc = document.getElementById('sfRmAcc').checked;
    let ok = 0, dup = 0, bad = 0;
    for (const t of tokens) {
        let r; try { r = await rmDecode(t.slice(4)); } catch (e) { bad++; continue; }
        if (!r || !r.k || !r.done) { bad++; continue; }
        if (j.some(x => x.key === r.k && x.done === r.done.slice(0, 10) && x.fin === r.done)) { dup++; continue; }
        const e = all.find(x => rgKey(x) === r.k);
        const date = r.d || r.done.slice(0, 10);
        j.push({ id: sfUid(), no: j.length + 1, type: r.ty, date: date, key: r.k, fio: r.f, year: e ? sfYear(e) : '', position: r.p || '', dept: e ? (e.department || e.dept || '') : '', instr: r.i, instrPos: r.ip, reason: r.r || '', remote: true, done: r.done.slice(0, 10), fin: r.done, readSec: r.rs });
        if (r.t) {
            res.push({ id: sfUid(), key: r.k, fio: r.f, position: r.p || '', topic: r.ti, date: r.done.slice(0, 10), total: r.tt, right: r.rt, score: r.s, pass: r.ps, passed: !!r.ok, attempt: r.a || 1, wrong: [], leaves: (r.lv || []).map(x => ({ at: x[0], sec: x[1] })) });
            if (r.ok && toAcc) {
                const recs = getEmpRecords(), cur = recs[r.k] || {}, nx = new Date(r.done); nx.setFullYear(nx.getFullYear() + 1);
                cur.training = { status: 'yes', program: r.ti, date: r.done.slice(0, 10), next: nx.toISOString().slice(0, 10), source: 'lms' };
                recs[r.k] = cur; saveEmpRecords(recs);
            }
        }
        ok++;
    }
    sfSet('briefingJournal', j); sfSet('testResults', res);
    sfRenderJournal();
    alert(`Принято: ${ok}. Дублей: ${dup}. Ошибочных кодов: ${bad}.`);
    if (ok) document.getElementById('sfRmCodes').value = '';
}
function sfFillRemoteTopics() {
    const topics = [...new Set(sfGet('testBank').map(q => q.topic || 'Без темы'))];
    const ts = document.getElementById('sfRmTopic'); if (ts) ts.innerHTML = topics.map(t => `<option>${rgEsc(t)}</option>`).join('') || '<option value="">— банк пуст —</option>';
    const b = document.getElementById('sfRmBase'); if (b && !b.value) b.value = localStorage.getItem('sfBaseUrl') || (/^https?:/i.test(location.href) ? location.href.split('#')[0] : '');
}
(function () {
    const prev = sfTab;
    sfTab = function (name) { prev(name); if (name === 'brief') sfFillRemoteTopics(); };
})();

// ---------- Сторона сотрудника (светлая мобильная страница) ----------
function lnKey(hash) { let h = 0; for (let i = 0; i < hash.length; i++) h = (h * 31 + hash.charCodeAt(i)) | 0; return 'learnDone_' + h; }
async function lnBoot() {
    const m = location.hash.match(/^#learn=(.+)$/);
    if (!m) return;
    let d; try { d = await rmDecode(m[1]); } catch (e) { document.body.innerHTML = '<p style="padding:30px;font-family:sans-serif">Ссылка повреждена. Попросите прислать её заново.</p>'; return; }
    Array.from(document.body.children).forEach(el => { el.style.display = 'none'; });
    if (d.x && new Date().toISOString().slice(0, 10) > d.x) { document.body.insertAdjacentHTML('beforeend', '<div style="font-family:sans-serif;padding:40px;text-align:center;color:#444;background:#fff">Срок действия ссылки истёк. Запросите новую у специалиста по охране труда.</div>'); return; }
    document.body.style.background = '#f4f5fa'; document.body.style.color = '#1a1a2e';
    const root = document.createElement('div'); root.id = 'learnRoot'; root.className = 'ln-root'; document.body.appendChild(root);
    const saved = localStorage.getItem(lnKey(m[1]));
    if (saved) return lnShowResult(root, saved);
    lnRun(root, d, m[1]);
}
function lnRun(root, d, hash) {
    const st = { read: 0, blur: 0, scrolled: false, attempts: 0 };
    root.innerHTML = `<div class="ln-brand">ОхранаТруда.Про</div><div class="ln-card"><h1>${rgEsc(d.ti)}</h1><p class="ln-who">Сотрудник: <b>${rgEsc(d.f)}</b>${d.p ? ' · ' + rgEsc(d.p) : ''}</p><div class="ln-text">${rgEsc(d.b)}</div><div id="lnEnd"></div><div class="ln-status" id="lnStatus"></div><div id="lnAct"><button class="ln-btn" id="lnNext" disabled>Далее</button></div></div>`;
    const nextBtn = document.getElementById('lnNext'), status = document.getElementById('lnStatus');
    const upd = () => {
        const left = Math.max(0, (d.m || 0) - st.read), ok = left === 0 && st.scrolled;
        status.textContent = ok ? '✔ Можно продолжать' : (left > 0 ? `Прочитайте материал: осталось ${left} с. ` : '') + (st.scrolled ? '' : 'Прокрутите текст до конца.');
        nextBtn.disabled = !ok;
    };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') st.blur++; });
    new IntersectionObserver(es => { if (es[0].isIntersecting) { st.scrolled = true; upd(); } }).observe(document.getElementById('lnEnd'));
    setInterval(() => { if (document.visibilityState === 'visible') st.read++; upd(); }, 1000);
    upd();
    const finish = async extra => {
        const r = Object.assign({ v: 1, k: d.k, f: d.f, p: d.p, ty: d.ty, ti: d.ti, d: d.d, i: d.i, ip: d.ip, r: d.r, done: new Date().toISOString(), rs: st.read, bl: st.blur }, extra);
        const code = 'OT1.' + await rmEncode(r);
        localStorage.setItem(lnKey(hash), code);
        lnShowResult(root, code);
    };
    const ack = () => {
        root.querySelector('.ln-card').insertAdjacentHTML('beforeend', '');
        document.getElementById('lnAct').innerHTML = '<label class="ln-check"><input type="checkbox" id="lnAck"> Инструктаж получил(а), содержание понятно, вопросов не имею</label><button class="ln-btn" id="lnDone" disabled>Подтвердить</button>';
        const cb = document.getElementById('lnAck'), b = document.getElementById('lnDone');
        cb.onchange = () => { b.disabled = !cb.checked; };
        b.onclick = () => finish({ t: 0 });
    };
    const test = () => {
        root.querySelector('.ln-card').innerHTML = '<h1>Перед тестом</h1><p>⚠ Во время теста нельзя переключаться на другие вкладки и приложения (например, чтобы найти ответ в интернете). Все уходы со страницы фиксируются и будут показаны проверяющему.</p><button class="ln-btn" id="lnGo">Понятно, начать тест</button>';
        document.getElementById('lnGo').onclick = testRun;
    };
    const testRun = () => {
        st.attempts++; st.tr = sfLeaveTracker();
        const qs = sfShuffle(d.q).map(q => ({ t: q.t, o: sfShuffle(q.o) }));
        root.querySelector('.ln-card').innerHTML = `<h1>Тест</h1>${qs.map((q, i) => { const multi = q.o.filter(o => o[1]).length > 1; return `<div class="ln-q"><b>${i + 1}. ${rgEsc(q.t)}</b>${multi ? ' <small>(несколько верных)</small>' : ''}${q.o.map((o, j) => `<label class="ln-opt"><input type="${multi ? 'checkbox' : 'radio'}" name="lq${i}" value="${j}"> ${rgEsc(o[0])}</label>`).join('')}</div>`; }).join('')}<button class="ln-btn" id="lnFin">Завершить тест</button>`;
        window.scrollTo(0, 0);
        document.getElementById('lnFin').onclick = () => {
            let right = 0;
            qs.forEach((q, i) => { const ch = new Set([...document.querySelectorAll(`input[name="lq${i}"]:checked`)].map(c => +c.value)); if (q.o.every((o, j) => !!o[1] === ch.has(j))) right++; });
            st.lv = (st.lv || []).concat(st.tr.stop().map(x => [x.at, x.sec]));
            const score = Math.round(right / qs.length * 100), ok = score >= d.ps;
            if (!ok && st.attempts < 3) {
                root.querySelector('.ln-card').innerHTML = `<h1>Не сдано: ${score}%</h1><p>Нужно не менее ${d.ps}%. Использовано попыток: ${st.attempts} из 3.</p><button class="ln-btn" id="lnAgain">Пройти ещё раз</button>`;
                document.getElementById('lnAgain').onclick = testRun; return;
            }
            finish({ t: 1, s: score, rt: right, tt: qs.length, ok: ok ? 1 : 0, ps: d.ps, a: st.attempts, lv: st.lv });
        };
    };
    nextBtn.onclick = () => { if (d.q && d.q.length) test(); else ack(); };
}
async function lnShowResult(root, code) {
    let r = {}; try { r = await rmDecode(code.slice(4)); } catch (e) {}
    const line = r.t ? (r.ok ? `✔ Тест сдан: ${r.s}%` : `✖ Тест не сдан: ${r.s}%`) : '✔ Ознакомление подтверждено';
    root.innerHTML = `<div class="ln-brand">ОхранаТруда.Про</div><div class="ln-card"><h1>${line}</h1><p>Отправьте этот код специалисту по охране труда (сообщением), чтобы результат был засчитан:</p><textarea class="ln-code" id="lnCode" readonly>${rgEsc(code)}</textarea><button class="ln-btn" id="lnCopy">📋 Скопировать код</button>${navigator.share ? '<button class="ln-btn ln-btn2" id="lnShare">📤 Отправить…</button>' : ''}</div>`;
    document.getElementById('lnCopy').onclick = () => { const t = document.getElementById('lnCode'); t.select(); (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => alert('Скопировано'), () => { document.execCommand('copy'); }); };
    const sh = document.getElementById('lnShare'); if (sh) sh.onclick = () => navigator.share({ text: code }).catch(() => {});
}
lnBoot();

function rgIso(d) { const m = String(d || '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/); return m ? m[3] + '-' + m[2] + '-' + m[1] : ''; }

function sfStartTest() {
    if (!document.getElementById('sfTestTopic').value || !document.getElementById('sfTestEmp').value) { alert('Выберите тему из банка и сотрудника'); return; }
    document.getElementById('sfTestArea').innerHTML = '<div class="rg-reg-box bad"><div class="rg-reg-title">⚠ Предупреждение перед тестом</div>Во время теста нельзя переключаться на другие вкладки, окна и приложения (например, чтобы найти ответ в интернете). Все уходы со страницы теста фиксируются и будут показаны проверяющему в конце.<div style="margin-top:10px;"><button class="btn-primary" onclick="sfBeginTest()">Понятно, начать тест</button></div></div>';
}
function sfLeaveTracker() {
    const list = []; let st = null;
    const out = () => { if (st === null) st = Date.now(); };
    const back = () => { if (st !== null) { list.push({ at: new Date(st).toISOString(), sec: Math.round((Date.now() - st) / 1000) }); st = null; } };
    const vis = () => { if (document.visibilityState === 'hidden') out(); else back(); };
    document.addEventListener('visibilitychange', vis); window.addEventListener('blur', out); window.addEventListener('focus', back);
    return { stop() { document.removeEventListener('visibilitychange', vis); window.removeEventListener('blur', out); window.removeEventListener('focus', back); back(); return list; } };
}
function sfLeavesHtml(leaves, plain) {
    if (!leaves || !leaves.length) return plain ? '<p>Уходов со страницы теста не зафиксировано.</p>' : '<div style="margin-top:8px;color:#34d399;">✔ Уходов со страницы теста не зафиксировано</div>';
    const tot = leaves.reduce((a, x) => a + (x.sec || 0), 0);
    const items = leaves.map(x => (x.at ? new Date(x.at).toLocaleTimeString('ru-RU') : '') + ' — ' + x.sec + ' с').join('; ');
    return plain ? `<p><b>Уходы со страницы теста:</b> ${leaves.length}, суммарно ${tot} с (${items}).</p>` : `<div style="margin-top:8px;color:#f87171;"><b>⚠ Уходов со страницы теста: ${leaves.length}, суммарно ${tot} с</b><br><small>${items}</small></div>`;
}


// ============================================================
// СЛУЖБЫ (группы сотрудников) + МОНИТОРИНГ ИНСТРУКТАЖЕЙ
// localStorage: empGroups = [{ id, name, keys:[rgKey], periods:{ТИП:месяцев} }]
// Последний инструктаж берётся из журнала (briefingJournal); напоминание — раз в день при открытии сайта.
// ============================================================
let grpCur = null;
function grpGet() { return sfGet('empGroups'); }
function grpSet(v) { sfSet('empGroups', v); }
function grpAddMonths(iso, m) { const d = new Date(iso + 'T00:00:00'); d.setMonth(d.getMonth() + m); return d.toISOString().slice(0, 10); }
function grpLast(key, type) { const dates = sfGet('briefingJournal').filter(r => r.key === key && r.type === type).map(r => r.date).sort(); return dates.length ? dates[dates.length - 1] : ''; }
function grpState(key, type, months) {
    const last = grpLast(key, type);
    if (!last) return { cls: 'bad', txt: 'нет записей', last: '', next: '' };
    const next = grpAddMonths(last, months), today = new Date().toISOString().slice(0, 10), soon = grpAddMonths(today, 0).slice(0, 8);
    const days = Math.round((new Date(next) - new Date(today)) / 86400000);
    if (days < 0) return { cls: 'bad', txt: 'просрочен ' + sfFmt(next), last: last, next: next };
    if (days <= 14) return { cls: 'warn', txt: 'до ' + sfFmt(next) + ' (' + days + ' дн.)', last: last, next: next };
    return { cls: 'ok', txt: 'до ' + sfFmt(next), last: last, next: next };
}
function grpTypes(g) { return [...new Set(['REPEAT'].concat(Object.keys(g.periods || {}).filter(t => g.periods[t] > 0)))]; }
function grpRender() {
    const root = document.getElementById('grpRoot'); if (!root) return;
    const gs = grpGet(); if (!grpCur && gs.length) grpCur = gs[0].id;
    root.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">${gs.map(g => `<button class="sf-tab ${g.id === grpCur ? 'active' : ''}" onclick="grpSelect('${g.id}')">${rgEsc(g.name)} (${g.keys.length})</button>`).join('')}<button class="btn-secondary" onclick="grpNew()">➕ Создать службу</button><button class="btn-secondary" onclick="grpShowDue(true)">🔔 Проверить сроки</button></div><div id="grpDetail"></div>`;
    const g = gs.find(x => x.id === grpCur), det = document.getElementById('grpDetail');
    if (!g) { det.innerHTML = '<p style="color:#8888aa">Создайте службу (например, «Водители»), добавьте сотрудников — вся информация по ним будет в одной таблице.</p>'; return; }
    const all = getAllEmployees(), types = grpTypes(g);
    const rows = g.keys.map(k => {
        const e = all.find(x => rgKey(x) === k); if (!e) return '';
        const r = rgRec(k), tr = rgTrainingState(e, r), md = rgState(r.med), ps = rgPpeState(r);
        const b = (s) => `<span class="rg-badge ${s.cls}">${s.txt}</span>`;
        return `<tr><td><a href="#" class="rg-name" onclick="event.preventDefault();openRegistryModal(decodeURIComponent('${encodeURIComponent(k)}'))">${rgEsc(rgFio(e))}</a></td><td>${rgEsc(e.position)}</td><td>${b(tr)}</td><td>${b(md)}</td><td>${b(ps)}</td>${types.map(t => `<td>${b(grpState(k, t, (g.periods || {})[t] || 6))}</td>`).join('')}</tr>`;
    }).join('');
    det.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;"><button class="btn-primary" onclick="grpMembers('${g.id}')">👥 Состав</button><button class="btn-secondary" onclick="grpRename('${g.id}')">✏️ Переименовать</button><button class="btn-secondary" onclick="grpDelete('${g.id}')">🗑 Удалить службу</button></div>
    <div style="overflow-x:auto;">${g.keys.length ? `<table class="rg-table"><thead><tr><th>ФИО</th><th>Должность</th><th>Обучение</th><th>Медосмотр</th><th>СИЗ</th>${types.map(t => `<th>${SF_TYPES[t]} инструктаж</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>` : '<p style="color:#8888aa">В службе пока нет сотрудников. Нажмите «Состав».</p>'}</div>
    <h4 class="rg-h">Периодичность инструктажей (месяцев, 0 — не контролировать)</h4>
    <div class="rg-grid" style="grid-template-columns:repeat(5,1fr);">${Object.keys(SF_TYPES).map(t => `<label>${SF_TYPES[t]}<input type="number" min="0" class="rg-input" value="${(g.periods || {})[t] != null ? g.periods[t] : (t === 'REPEAT' ? 6 : 0)}" onchange="grpPeriod('${g.id}','${t}',this.value)"></label>`).join('')}</div>
    <h4 class="rg-h">Записать инструктаж всей службе</h4>
    <div class="rg-grid"><label>Вид<select id="grpType" class="rg-input">${Object.keys(SF_TYPES).map(t => `<option value="${t}">${SF_TYPES[t]}</option>`).join('')}</select></label><label>Дата<input type="date" id="grpDate" class="rg-input" value="${new Date().toISOString().slice(0, 10)}"></label><label>Инструктирующий (ФИО)<input id="grpInstr" class="rg-input"></label><label>Должность инструктирующего<input id="grpInstrPos" class="rg-input"></label></div>
    <label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:#8888aa;margin-top:8px;">Причина (для внепланового и целевого)<input id="grpReason" class="rg-input"></label>
    <button class="btn-primary" style="margin-top:10px;" onclick="grpRecord('${g.id}')">✅ Записать в журнал всем (${g.keys.length})</button>`;
}
function grpSelect(id) { grpCur = id; grpRender(); }
function grpNew() {
    const name = (prompt('Название службы (например, Водители):') || '').trim(); if (!name) return;
    const gs = grpGet(), g = { id: sfUid(), name: name, keys: [], periods: { REPEAT: 6 } }; gs.push(g); grpSet(gs); grpCur = g.id; grpRender(); grpMembers(g.id);
}
function grpRename(id) { const gs = grpGet(), g = gs.find(x => x.id === id); const n = (prompt('Новое название:', g.name) || '').trim(); if (n) { g.name = n; grpSet(gs); grpRender(); } }
function grpDelete(id) { if (!confirm('Удалить службу? Сотрудники и журнал не удаляются.')) return; grpSet(grpGet().filter(x => x.id !== id)); grpCur = null; grpRender(); }
function grpPeriod(id, t, v) { const gs = grpGet(), g = gs.find(x => x.id === id); g.periods = g.periods || {}; g.periods[t] = Math.max(0, parseInt(v) || 0); grpSet(gs); grpRender(); }
function grpMembers(id) {
    const g = grpGet().find(x => x.id === id), old = document.getElementById('grpModal'); if (old) old.remove();
    const m = document.createElement('div'); m.className = 'modal-overlay'; m.id = 'grpModal';
    m.innerHTML = `<div class="modal-content" style="max-width:640px;max-height:90vh;overflow:auto;"><div class="modal-header"><h3>👥 Состав: ${rgEsc(g.name)}</h3><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✖</button></div><div style="padding:16px 20px;"><input id="grpSearch" class="rg-input" placeholder="🔍 Поиск по ФИО или должности" style="margin-bottom:8px;"><div id="grpList" class="sf-emps" style="max-height:50vh;"></div></div><div class="modal-footer"><button class="btn-primary" id="grpSave">Сохранить</button></div></div>`;
    document.body.appendChild(m);
    const sel = new Set(g.keys), all = getAllEmployees();
    const draw = () => {
        const q = document.getElementById('grpSearch').value.toLowerCase();
        document.getElementById('grpList').innerHTML = all.filter(e => (rgFio(e) + ' ' + (e.position || '')).toLowerCase().includes(q)).map(e => `<label class="sf-emp"><input type="checkbox" value="${rgEsc(rgKey(e))}" ${sel.has(rgKey(e)) ? 'checked' : ''}> ${rgEsc(rgFio(e))} <small>${rgEsc(e.position || '')}</small></label>`).join('');
        document.querySelectorAll('#grpList input').forEach(c => { c.onchange = () => { if (c.checked) sel.add(c.value); else sel.delete(c.value); }; });
    };
    document.getElementById('grpSearch').oninput = draw; draw();
    document.getElementById('grpSave').onclick = () => { const gs = grpGet(), gg = gs.find(x => x.id === id); gg.keys = [...sel]; grpSet(gs); m.remove(); grpRender(); };
}
function grpRecord(id) {
    const g = grpGet().find(x => x.id === id), v = i => (document.getElementById(i) || {}).value || '';
    const type = v('grpType'), date = v('grpDate'), instr = v('grpInstr').trim(), reason = v('grpReason').trim();
    if (!g.keys.length) { alert('В службе нет сотрудников'); return; }
    if (!date || !instr) { alert('Укажите дату и ФИО инструктирующего'); return; }
    if ((type === 'UNPLANNED' || type === 'TARGET') && !reason) { alert('Укажите причину'); return; }
    const j = sfGet('briefingJournal'), all = getAllEmployees();
    g.keys.forEach(k => { const e = all.find(x => rgKey(x) === k); if (!e) return; j.push({ id: sfUid(), no: j.length + 1, type: type, date: date, key: k, fio: rgFio(e), year: sfYear(e), position: e.position || '', dept: e.department || e.dept || '', instr: instr, instrPos: v('grpInstrPos').trim(), reason: reason }); });
    sfSet('briefingJournal', j); grpRender(); alert('✅ Записано в журнал: ' + g.keys.length);
}
function grpDueList() {
    const out = [], all = getAllEmployees();
    grpGet().forEach(g => grpTypes(g).forEach(t => {
        const months = (g.periods || {})[t] != null ? g.periods[t] : 6; if (!months) return;
        g.keys.forEach(k => { const st = grpState(k, t, months); if (st.cls === 'bad' || st.cls === 'warn') { const e = all.find(x => rgKey(x) === k); if (e) out.push({ g: g.name, t: t, fio: rgFio(e), st: st }); } });
    }));
    return out;
}
function grpShowDue(force) {
    const list = grpDueList(), today = new Date().toISOString().slice(0, 10);
    if (!list.length) { if (force) alert('✅ Всё в сроке: инструктажи служб не просрочены.'); return; }
    if (!force && localStorage.getItem('grpDueShown') === today) return;
    localStorage.setItem('grpDueShown', today);
    const old = document.getElementById('grpDueModal'); if (old) old.remove();
    const by = {}; list.forEach(x => { (by[x.g + ' — ' + SF_TYPES[x.t] + ' инструктаж'] = by[x.g + ' — ' + SF_TYPES[x.t] + ' инструктаж'] || []).push(x); });
    const m = document.createElement('div'); m.className = 'modal-overlay'; m.id = 'grpDueModal';
    m.innerHTML = `<div class="modal-content" style="max-width:700px;max-height:90vh;overflow:auto;"><div class="modal-header"><h3>🔔 Пора провести инструктаж</h3><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✖</button></div><div style="padding:16px 20px;">${Object.keys(by).map(k => `<h4 class="rg-h">${rgEsc(k)}</h4>${by[k].map(x => `<div style="font-size:14px;padding:3px 0;">${rgEsc(x.fio)} <span class="rg-badge ${x.st.cls}">${x.st.txt}</span></div>`).join('')}`).join('')}</div><div class="modal-footer"><button class="btn-primary" onclick="this.closest('.modal-overlay').remove();showPage('groups')">Открыть «Службы»</button></div></div>`;
    document.body.appendChild(m);
}
(function () {
    const prev = showPage;
    showPage = function (page) {
        const gp = document.getElementById('groupsPage');
        if (gp) gp.classList.add('hidden');
        if (page === 'groups') {
            prev('__none'); if (gp) gp.classList.remove('hidden');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.textContent.indexOf('Службы сотрудников') !== -1));
            grpRender();
        } else prev(page);
    };
})();
document.addEventListener('DOMContentLoaded', function () { if (!/^#learn=/.test(location.hash)) setTimeout(() => grpShowDue(false), 800); });
