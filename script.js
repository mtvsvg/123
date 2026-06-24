// ============================================================
// ХРАНИЛИЩЕ
// ============================================================
function getOrgs() {
    return JSON.parse(localStorage.getItem('organizations') || '[]');
}
function saveOrgs(orgs) {
    localStorage.setItem('organizations', JSON.stringify(orgs));
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

// ===== ПОКАЗАТЬ/СКРЫТЬ ФОРМУ =====
document.getElementById('showOrgFormBtn').addEventListener('click', function() {
    const form = document.getElementById('orgForm');
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
        document.getElementById('orgNameInput').focus();
    }
});

document.getElementById('cancelOrgBtn').addEventListener('click', function() {
    document.getElementById('orgForm').classList.add('hidden');
});

// ===== СОХРАНИТЬ ОРГАНИЗАЦИЮ =====
document.getElementById('saveOrgBtn').addEventListener('click', function() {
    const name = document.getElementById('orgNameInput').value.trim();
    const inn = document.getElementById('orgInnInput').value.trim();
    if (!name || !inn) {
        alert('Заполните название и ИНН');
        return;
    }
    const orgs = getOrgs();
    const newOrg = {
        id: Date.now(),
        name: name,
        inn: inn
    };
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

// ===== УДАЛИТЬ ОРГАНИЗАЦИЮ =====
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

// ===== ВЫБОР ОРГАНИЗАЦИИ =====
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
// ПОЛУЧЕНИЕ ВЫБРАННЫХ ПРОГРАММ
// ============================================================
function getSelectedPrograms() {
    const checkboxes = document.querySelectorAll('#programsContainer input[type="checkbox"]:checked');
    const programs = [];
    checkboxes.forEach(cb => {
        programs.push(parseInt(cb.value));
    });
    return programs;
}

// ============================================================
// СОТРУДНИКИ
// ============================================================
function addEmployee(data) {
    const container = document.getElementById('employeesContainer');
    const div = document.createElement('div');
    div.className = 'employee-card';
    div.innerHTML = `
        <input type="text" class="emp-last" placeholder="Фамилия" value="${data?.last_name || ''}">
        <input type="text" class="emp-first" placeholder="Имя" value="${data?.first_name || ''}">
        <input type="text" class="emp-middle" placeholder="Отчество" value="${data?.middle_name || ''}">
        <input type="text" class="emp-position" placeholder="Должность" value="${data?.position || ''}">
        <input type="text" class="emp-snils" placeholder="СНИЛС" value="${data?.snils || ''}">
        <label class="emp-check">
            <input type="checkbox" class="emp-passed" ${data?.is_passed !== false ? 'checked' : ''}>
            Сдал
        </label>
        <button class="btn-remove" onclick="this.closest('.employee-card').remove()">✖</button>
    `;
    container.appendChild(div);
}

function getEmployeesFromForm() {
    const cards = document.querySelectorAll('.employee-card');
    const result = [];
    cards.forEach(card => {
        const last = card.querySelector('.emp-last').value.trim();
        const first = card.querySelector('.emp-first').value.trim();
        const middle = card.querySelector('.emp-middle').value.trim();
        const position = card.querySelector('.emp-position').value.trim();
        const snils = card.querySelector('.emp-snils').value.trim();
        const passed = card.querySelector('.emp-passed').checked;
        if (last || first || position) {
            result.push({ last_name: last, first_name: first, middle_name: middle, position, snils, is_passed: passed });
        }
    });
    return result;
}

// Добавляем первого сотрудника при загрузке
document.addEventListener('DOMContentLoaded', function() {
    renderOrgs();
    if (document.querySelectorAll('.employee-card').length === 0) {
        addEmployee();
    }
});

// ============================================================
// ГЕНЕРАЦИЯ XML
// ============================================================
document.getElementById('generateBtn').addEventListener('click', function() {
    const protocolNumber = document.getElementById('protocolNumber').value.trim();
    const date = document.getElementById('protocolDate').value;
    const orgSelect = document.getElementById('orgSelect');
    const orgId = orgSelect.value;
    const orgs = getOrgs();
    const org = orgs.find(o => o.id == parseInt(orgId));
    const employees = getEmployeesFromForm();
    const selectedPrograms = getSelectedPrograms();

    // ===== ПРОВЕРКИ =====
    if (!orgId || !org) {
        alert('Выберите организацию');
        return;
    }
    if (!protocolNumber || !date) {
        alert('Заполните номер и дату протокола');
        return;
    }
    if (employees.length === 0) {
        alert('Добавьте хотя бы одного сотрудника');
        return;
    }
    if (selectedPrograms.length === 0) {
        alert('Выберите хотя бы одну программу обучения');
        return;
    }
    let hasError = false;
    employees.forEach(emp => {
        if (!emp.snils) {
            alert(`У сотрудника ${emp.last_name} ${emp.first_name} не указан СНИЛС!`);
            hasError = true;
        }
    });
    if (hasError) return;

    // ===== ПРОГРАММЫ =====
    const programs = {
        1: "Оказание первой помощи пострадавшим",
        2: "Использование (применение) средств индивидуальной защиты",
        3: "Общие вопросы охраны труда и функционирования системы управления охраной труда",
        4: "Безопасные методы и приемы выполнения работ при воздействии вредных и (или) опасных производственных факторов, источников опасности, идентифицированных в рамках специальной оценки условий труда и оценки профессиональных рисков"
    };

    // ===== ФОРМИРУЕМ XML =====
    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    xml += '<RegistrySet xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';

    employees.forEach(emp => {
        selectedPrograms.forEach(progId => {
            xml += '\t<RegistryRecord>\n';
            xml += '\t\t<Worker>\n';
            xml += `\t\t\t<LastName>${escapeXml(emp.last_name)}</LastName>\n`;
            xml += `\t\t\t<FirstName>${escapeXml(emp.first_name)}</FirstName>\n`;
            xml += `\t\t\t<MiddleName>${escapeXml(emp.middle_name)}</MiddleName>\n`;
            xml += `\t\t\t<Snils>${escapeXml(emp.snils)}</Snils>\n`;
            xml += `\t\t\t<Position>${escapeXml(emp.position)}</Position>\n`;
            xml += `\t\t\t<EmployerInn>${escapeXml(org.inn)}</EmployerInn>\n`;
            xml += `\t\t\t<EmployerTitle>${escapeXml(org.name)}</EmployerTitle>\n`;
            xml += '\t\t</Worker>\n';
            xml += '\t\t<Organization>\n';
            xml += `\t\t\t<Inn>${escapeXml(org.inn)}</Inn>\n`;
            xml += `\t\t\t<Title>${escapeXml(org.name)}</Title>\n`;
            xml += '\t\t</Organization>\n';
            xml += `\t\t<Test isPassed="${emp.is_passed ? 'true' : 'false'}" learnProgramId="${progId}">\n`;
            xml += `\t\t\t<Date>${escapeXml(date)}</Date>\n`;
            xml += `\t\t\t<ProtocolNumber>${escapeXml(protocolNumber)}</ProtocolNumber>\n`;
            xml += `\t\t\t<LearnProgramTitle>${escapeXml(programs[progId] || 'Неизвестная программа')}</LearnProgramTitle>\n`;
            xml += '\t\t</Test>\n';
            xml += '\t</RegistryRecord>\n';
        });
    });

    xml += '</RegistrySet>';

    // ===== СОХРАНЯЕМ В ИСТОРИЮ =====
    const history = getHistory();
    history.push({
        protocolNumber,
        date,
        orgName: org.name,
        programs: selectedPrograms.join(', '),
        employees: employees.map(e => `${e.last_name} ${e.first_name}`).join(', '),
        xml,
        created: new Date().toISOString()
    });
    saveHistory(history);

    // ===== СОХРАНЯЕМ СОТРУДНИКОВ =====
    const existing = getEmployees();
    employees.forEach(emp => {
        if (!emp.snils) return;
        const found = existing.find(e =>
            e.last_name === emp.last_name &&
            e.first_name === emp.first_name &&
            e.position === emp.position
        );
        if (!found) {
            existing.push({ ...emp });
        } else {
            found.snils = emp.snils;
        }
    });
    saveEmployees(existing);

    // ===== СКАЧИВАЕМ =====
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    document.getElementById('downloadLink').href = url;
    document.getElementById('downloadLink').download = `${protocolNumber.replace('/', '_')}_${date}.xml`;
    document.getElementById('resultBlock').classList.remove('hidden');

    alert('✅ XML создан! Нажмите "Скачать XML"');
});

function escapeXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// ДОБАВЛЕНИЕ СОТРУДНИКА (глобально)
// ============================================================
window.addEmployee = function(data) {
    const container = document.getElementById('employeesContainer');
    const div = document.createElement('div');
    div.className = 'employee-card';
    div.innerHTML = `
        <input type="text" class="emp-last" placeholder="Фамилия" value="${data?.last_name || ''}">
        <input type="text" class="emp-first" placeholder="Имя" value="${data?.first_name || ''}">
        <input type="text" class="emp-middle" placeholder="Отчество" value="${data?.middle_name || ''}">
        <input type="text" class="emp-position" placeholder="Должность" value="${data?.position || ''}">
        <input type="text" class="emp-snils" placeholder="СНИЛС" value="${data?.snils || ''}">
        <label class="emp-check">
            <input type="checkbox" class="emp-passed" ${data?.is_passed !== false ? 'checked' : ''}>
            Сдал
        </label>
        <button class="btn-remove" onclick="this.closest('.employee-card').remove()">✖</button>
    `;
    container.appendChild(div);
};
