// ============================================================
// ХРАНИЛИЩЕ
// ============================================================
function getOrgs() {
    return JSON.parse(localStorage.getItem('organizations') || '[]');
}
function saveOrgs(orgs) {
    localStorage.setItem('organizations', JSON.stringify(orgs));
}
function getStaff() {
    return JSON.parse(localStorage.getItem('staff') || '[]');
}
function saveStaff(staff) {
    localStorage.setItem('staff', JSON.stringify(staff));
}
function getProtocol() {
    return JSON.parse(localStorage.getItem('protocol') || '[]');
}
function saveProtocol(protocol) {
    localStorage.setItem('protocol', JSON.stringify(protocol));
}
function getEmployees() {
    return JSON.parse(localStorage.getItem('employees') || '[]');
}
function saveEmployees(emps) {
    localStorage.setItem('employees', JSON.stringify(emps));
}
function getHistory() {
    return JSON.parse(localStorage.getItem('history') || '[]');
}
function saveHistory(hist) {
    localStorage.setItem('history', JSON.stringify(hist));
}

let currentOrgId = localStorage.getItem('currentOrgId') || null;
let protocolNumber = localStorage.getItem('protocolNumber') || '';
let protocolDate = localStorage.getItem('protocolDate') || '';

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
    if (currentOrgId) {
        select.value = currentOrgId;
    }
}

document.getElementById('showOrgFormBtn').addEventListener('click', function() {
    document.getElementById('orgForm').classList.toggle('hidden');
});

document.getElementById('cancelOrgBtn').addEventListener('click', function() {
    document.getElementById('orgForm').classList.add('hidden');
});

document.getElementById('saveOrgBtn').addEventListener('click', function() {
    const name = document.getElementById('orgNameInput').value.trim();
    const inn = document.getElementById('orgInnInput').value.trim();
    if (!name || !inn) {
        alert('Заполните название и ИНН');
        return;
    }
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
    if (!orgId) {
        alert('Сначала выберите организацию для удаления');
        return;
    }
    if (!confirm('Удалить выбранную организацию?')) return;
    let orgs = getOrgs();
    orgs = orgs.filter(o => o.id != parseInt(orgId));
    saveOrgs(orgs);
    if (currentOrgId == orgId) {
        currentOrgId = null;
        localStorage.removeItem('currentOrgId');
    }
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

function selectOrg(id) {
    currentOrgId = id;
    localStorage.setItem('currentOrgId', currentOrgId);
}

// ============================================================
// ВКЛАДКИ
// ============================================================
function showTab(name) {
    document.querySelectorAll('.tab button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[id^="tab"]').forEach(t => t.classList.add('hidden'));
    const tabs = {
        'staff': { el: 'tabStaff', index: 0 },
        'protocol': { el: 'tabProtocol', index: 1 },
        'employees': { el: 'tabEmployees', index: 2 },
        'history': { el: 'tabHistory', index: 3 }
    };
    if (tabs[name]) {
        document.getElementById(tabs[name].el).classList.remove('hidden');
        document.querySelectorAll('.tab button')[tabs[name].index].classList.add('active');
    }
    if (name === 'protocol') renderProtocol();
    if (name === 'employees') renderEmployeeDB();
    if (name === 'history') renderHistory();
}

// ============================================================
// ШТАТНОЕ РАСПИСАНИЕ
// ============================================================
function renderStaff() {
    const container = document.getElementById('staffContainer');
    const staff = getStaff();
    if (staff.length === 0) {
        container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">Нет загруженных сотрудников. Нажмите "Загрузить файл".</p>';
        return;
    }
    let html = `
        <table class="staff-table">
            <thead>
                <tr>
                    <th style="width:40px;">
                        <input type="checkbox" id="selectAllStaff" onchange="toggleAllStaff()">
                    </th>
                    <th>Фамилия</th>
                    <th>Имя</th>
                    <th>Отчество</th>
                    <th>Должность</th>
                    <th>СНИЛС</th>
                </tr>
            </thead>
            <tbody>
    `;
    staff.forEach((emp, index) => {
        html += `
            <tr>
                <td><input type="checkbox" class="staff-check" data-index="${index}"></td>
                <td>${emp.last_name}</td>
                <td>${emp.first_name}</td>
                <td>${emp.middle_name || ''}</td>
                <td>${emp.position}</td>
                <td>${emp.snils}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    updateSelectedCount();
}

function toggleAllStaff() {
    const checked = document.getElementById('selectAllStaff').checked;
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = checked);
    updateSelectedCount();
}

function selectAllStaff() {
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = true);
    const selectAll = document.getElementById('selectAllStaff');
    if (selectAll) selectAll.checked = true;
    updateSelectedCount();
}

function deselectAllStaff() {
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = false);
    const selectAll = document.getElementById('selectAllStaff');
    if (selectAll) selectAll.checked = false;
    updateSelectedCount();
}

function updateSelectedCount() {
    const count = document.querySelectorAll('.staff-check:checked').length;
    document.getElementById('selectedCount').textContent = count;
}

function getSelectedStaff() {
    const checkboxes = document.querySelectorAll('.staff-check:checked');
    const staff = getStaff();
    const selected = [];
    checkboxes.forEach(cb => {
        const index = parseInt(cb.dataset.index);
        if (staff[index]) {
            selected.push({ ...staff[index] });
        }
    });
    return selected;
}

function clearStaff() {
    if (!confirm('Удалить всех сотрудников из штатного расписания?')) return;
    saveStaff([]);
    renderStaff();
}

// ============================================================
// 📤 ИМПОРТ ШТАТНОГО РАСПИСАНИЯ
// ============================================================
document.getElementById('staffImportBtn').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = function(e) {
        if (!e.target.files.length) {
            document.body.removeChild(input);
            return;
        }
        
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const bytes = new Uint8Array(event.target.result);
            let content = '';
            
            try {
                const decoder = new TextDecoder('utf-8', { fatal: true });
                content = decoder.decode(bytes);
                if (!/[а-яА-Я]/.test(content)) throw new Error('Нет русских букв');
            } catch(e) {
                try {
                    const decoder = new TextDecoder('windows-1251');
                    content = decoder.decode(bytes);
                } catch(e2) {
                    const decoder = new TextDecoder('utf-8');
                    content = decoder.decode(bytes);
                }
            }
            
            if (/[����]/.test(content) || !/[а-яА-Я]/.test(content)) {
                try {
                    const decoder = new TextDecoder('windows-1251');
                    content = decoder.decode(bytes);
                } catch(e) {}
            }
            
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
            
            const employees = smartParse(content);
            if (employees.length === 0) {
                alert('❌ Не удалось распознать данные. Проверьте формат файла.');
                document.body.removeChild(input);
                return;
            }
            
            const currentStaff = getStaff();
            employees.forEach(emp => {
                if (!currentStaff.some(e => e.last_name === emp.last_name && e.first_name === emp.first_name && e.snils === emp.snils)) {
                    currentStaff.push(emp);
                }
            });
            saveStaff(currentStaff);
            renderStaff();
            alert(`✅ Загружено ${employees.length} сотрудников в штатное расписание!
