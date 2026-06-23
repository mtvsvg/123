// ============================================================
// ХРАНИЛИЩЕ (localStorage)
// ============================================================
function getEmployees() {
    return JSON.parse(localStorage.getItem('employees') || '[]');
}
function saveEmployees(employees) {
    localStorage.setItem('employees', JSON.stringify(employees));
}
function getHistory() {
    return JSON.parse(localStorage.getItem('history') || '[]');
}
function saveHistory(history) {
    localStorage.setItem('history', JSON.stringify(history));
}

// ============================================================
// ВКЛАДКИ
// ============================================================
function showTab(name) {
    document.querySelectorAll('.tab button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[id^="tab"]').forEach(t => t.classList.add('hidden'));
    if (name === 'protocol') {
        document.getElementById('tabProtocol').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(1)').classList.add('active');
    } else if (name === 'employees') {
        document.getElementById('tabEmployees').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(2)').classList.add('active');
        renderEmployeeDB();
    } else if (name === 'history') {
        document.getElementById('tabHistory').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(3)').classList.add('active');
        renderHistory();
    }
}

// ============================================================
// ФОТО + РАСПОЗНАВАНИЕ (ЗАГЛУШКА)
// ============================================================
let uploadedFile = null;
let recognizedEmployees = [];

document.getElementById('fileInput').addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        uploadedFile = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(ev) {
            document.getElementById('imagePreview').src = ev.target.result;
            document.getElementById('photoPreview').classList.remove('hidden');
            document.getElementById('uploadArea').style.display = 'none';
        };
        reader.readAsDataURL(uploadedFile);
    }
});

function recognizePhoto() {
    if (!uploadedFile) {
        alert('Сначала загрузите фото!');
        return;
    }
    // ЗАГЛУШКА: имитация распознавания
    const mockData = {
        protocol_number: "01/26",
        date: "2026-06-23",
        org_inn: "2634800610",
        org_title: "ООО 'Бэби-Бум'",
        employees: [
            { last_name: "Иванов", first_name: "Иван", middle_name: "Иванович", position: "Инженер", is_passed: true },
            { last_name: "Петров", first_name: "Петр", middle_name: "Петрович", position: "Техник", is_passed: false }
        ]
    };

    recognizedEmployees = mockData.employees;
    let html = `<p><strong>Номер:</strong> ${mockData.protocol_number}</p>
                <p><strong>Дата:</strong> ${mockData.date}</p>
                <p><strong>ИНН:</strong> ${mockData.org_inn}</p>
                <p><strong>Организация:</strong> ${mockData.org_title}</p>
                <p><strong>Сотрудники (${mockData.employees.length}):</strong></p><ul>`;
    mockData.employees.forEach(e => {
        html += `<li>${e.last_name} ${e.first_name} — ${e.position} (${e.is_passed ? '✅ сдал' : '❌ не сдал'})</li>`;
    });
    html += '</ul>';
    document.getElementById('recognizedData').innerHTML = html;
    document.getElementById('recognitionResult').classList.remove('hidden');
}

function fillFormFromRecognition() {
    document.getElementById('protocolNumber').value = '01/26';
    document.getElementById('protocolDate').value = '2026-06-23';
    document.getElementById('orgInn').value = '2634800610';
    document.getElementById('orgTitle').value = "ООО 'Бэби-Бум'";
    
    document.getElementById('employeesList').innerHTML = '';
    recognizedEmployees.forEach(emp => {
        addEmployeeRow(emp);
    });
}

// ============================================================
// СОТРУДНИКИ
// ============================================================
function addEmployeeRow(data) {
    const container = document.getElementById('employeesList');
    const div = document.createElement('div');
    div.className = 'employee-card employee-row';
    div.innerHTML = `
        <div class="emp-row">
            <input type="text" class="emp-last" placeholder="Фамилия" value="${data?.last_name || ''}">
            <input type="text" class="emp-first" placeholder="Имя" value="${data?.first_name || ''}">
            <input type="text" class="emp-middle" placeholder="Отчество" value="${data?.middle_name || ''}">
        </div>
        <div class="emp-row">
            <input type="text" class="emp-position" placeholder="Должность" value="${data?.position || ''}">
            <input type="text" class="emp-snils" placeholder="СНИЛС" value="${data?.snils || ''}">
            <label>
                <input type="checkbox" class="emp-passed" ${data?.is_passed !== false ? 'checked' : ''}>
                Сдал
            </label>
            <button class="btn-secondary" onclick="this.closest('.employee-card').remove()" style="padding:4px 12px;">✖</button>
        </div>
    `;
    container.appendChild(div);
    setTimeout(() => autoFillSnilsForRow(div), 100);
}

function getEmployeesFromForm() {
    const rows = document.querySelectorAll('.employee-row');
    const result = [];
    rows.forEach(row => {
        const last = row.querySelector('.emp-last').value.trim();
        const first = row.querySelector('.emp-first').value.trim();
        const middle = row.querySelector('.emp-middle').value.trim();
        const position = row.querySelector('.emp-position').value.trim();
        const snils = row.querySelector('.emp-snils').value.trim();
        const passed = row.querySelector('.emp-passed').checked;
        if (last || first || position) {
            result.push({ last_name: last, first_name: first, middle_name: middle, position, snils, is_passed: passed });
        }
    });
    return result;
}

function autoFillSnilsForRow(row) {
    const last = row.querySelector('.emp-last').value.trim();
    const first = row.querySelector('.emp-first').value.trim();
    const middle = row.querySelector('.emp-middle').value.trim();
    const position = row.querySelector('.emp-position').value.trim();
    const snilsInput = row.querySelector('.emp-snils');
    if (!last || !first || snilsInput.value) return;
    const employees = getEmployees();
    const found = employees.find(emp =>
        emp.last_name.toLowerCase() === last.toLowerCase() &&
        emp.first_name.toLowerCase() === first.toLowerCase() &&
        (emp.middle_name || '').toLowerCase() === (middle || '').toLowerCase() &&
        emp.position.toLowerCase() === position.toLowerCase()
    );
    if (found && found.snils) {
        snilsInput.value = found.snils;
    }
}

// ============================================================
// ГЕНЕРАЦИЯ XML
// ============================================================
function generateXML(allPrograms = false) {
    const protocolNumber = document.getElementById('protocolNumber').value.trim();
    const date = document.getElementById('protocolDate').value;
    const orgInn = document.getElementById('orgInn').value.trim();
    const orgTitle = document.getElementById('orgTitle').value.trim();
    const employees = getEmployeesFromForm();
    const selectedProgramId = parseInt(document.getElementById('programSelect').value);

    if (!protocolNumber || !date || !orgInn || !orgTitle) {
        alert('Заполните все поля протокола (номер, дата, ИНН, организация)');
        return;
    }
    if (employees.length === 0) {
        alert('Добавьте хотя бы одного сотрудника');
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

    const programs = {
        1: "Оказание первой помощи пострадавшим",
        2: "Использование (применение) средств индивидуальной защиты",
        3: "Общие вопросы охраны труда и функционирования системы управления охраной труда",
        4: "Безопасные методы и приемы выполнения работ при воздействии вредных и (или) опасных производственных факторов, источников опасности, идентифицированных в рамках специальной оценки условий труда и оценки профессиональных рисков"
    };

    let programIds = allPrograms ? [1,2,3,4] : [selectedProgramId];

    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    xml += '<RegistrySet xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';

    employees.forEach(emp => {
        programIds.forEach(progId => {
            xml += '\t<RegistryRecord>\n';
            xml += '\t\t<Worker>\n';
            xml += `\t\t\t<LastName>${escXml(emp.last_name)}</LastName>\n`;
            xml += `\t\t\t<FirstName>${escXml(emp.first_name)}</FirstName>\n`;
            xml += `\t\t\t<MiddleName>${escXml(emp.middle_name)}</MiddleName>\n`;
            xml += `\t\t\t<Snils>${escXml(emp.snils)}</Snils>\n`;
            xml += `\t\t\t<Position>${escXml(emp.position)}</Position>\n`;
            xml += `\t\t\t<EmployerInn>${escXml(orgInn)}</EmployerInn>\n`;
            xml += `\t\t\t<EmployerTitle>${escXml(orgTitle)}</EmployerTitle>\n`;
            xml += '\t\t</Worker>\n';
            xml += '\t\t<Organization>\n';
            xml += `\t\t\t<Inn>${escXml(orgInn)}</Inn>\n`;
            xml += `\t\t\t<Title>${escXml(orgTitle)}</Title>\n`;
            xml += '\t\t</Organization>\n';
            xml += `\t\t<Test isPassed="${emp.is_passed ? 'true' : 'false'}" learnProgramId="${progId}">\n`;
            xml += `\t\t\t<Date>${escXml(date)}</Date>\n`;
            xml += `\t\t\t<ProtocolNumber>${escXml(protocolNumber)}</ProtocolNumber>\n`;
            xml += `\t\t\t<LearnProgramTitle>${escXml(programs[progId] || 'Неизвестная программа')}</LearnProgramTitle>\n`;
            xml += '\t\t</Test>\n';
            xml += '\t</RegistryRecord>\n';
        });
    });

    xml += '</RegistrySet>';

    // Сохраняем в историю
    const history = getHistory();
    history.push({
        protocolNumber,
        date,
        orgTitle,
        employees: employees.map(e => `${e.last_name} ${e.first_name}`).join(', '),
        programs: programIds.join(', '),
        xml,
        created: new Date().toISOString()
    });
    saveHistory(history);

    // Сохраняем сотрудников в базу
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

    // Скачиваем
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    document.getElementById('downloadLink').href = url;
    document.getElementById('downloadLink').download = `${protocolNumber.replace('/', '_')}_${date}.xml`;
    document.getElementById('result').classList.remove('hidden');

    renderHistory();
    renderEmployeeDB();
    alert('✅ XML создан! Нажмите "Скачать XML"');
}

function escXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// БАЗА СОТРУДНИКОВ
// ============================================================
function renderEmployeeDB() {
    const container = document.getElementById('employeeDB');
    const employees = getEmployees();
    if (employees.length === 0) {
        container.innerHTML = '<p style="color:#6a6a8a;">База пуста. Сотрудники добавляются автоматически при создании протокола.</p>';
        return;
    }
    let html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;margin-top:12px;">';
    html += '<thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><th style="text-align:left;padding:8px;">ФИО</th><th style="text-align:left;padding:8px;">Должность</th><th style="text-align:left;padding:8px;">СНИЛС</th></tr></thead><tbody>';
    employees.forEach(emp => {
        html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:8px;">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</td>
            <td style="padding:8px;">${emp.position}</td>
            <td style="padding:8px;">${emp.snils || '—'}</td>
        </tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function clearEmployees() {
    if (confirm('Удалить всех сотрудников из базы?')) {
        saveEmployees([]);
        renderEmployeeDB();
    }
}

// ============================================================
// ИСТОРИЯ
// ============================================================
function renderHistory() {
    const container = document.getElementById('historyList');
    const history = getHistory();
    if (history.length === 0) {
        container.innerHTML = '<p style="color:#6a6a8a;">История пуста.</p>';
        return;
    }
    let html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;margin-top:12px;">';
    html += '<thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><th style="text-align:left;padding:8px;">Номер</th><th style="text-align:left;padding:8px;">Дата</th><th style="text-align:left;padding:8px;">Организация</th><th style="text-align:left;padding:8px;">Программы</th><th style="text-align:left;padding:8px;">Сотрудники</th></tr></thead><tbody>';
    history.slice().reverse().forEach(item => {
        html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:8px;">${item.protocolNumber}</td>
            <td style="padding:8px;">${item.date}</td>
            <td style="padding:8px;">${item.orgTitle || ''}</td>
            <td style="padding:8px;">${item.programs || ''}</td>
            <td style="padding:8px;">${item.employees || ''}</td>
        </tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function clearHistory() {
    if (confirm('Удалить всю историю?')) {
        saveHistory([]);
        renderHistory();
    }
}

// ============================================================
// АВТОПОДСТАНОВКА СНИЛС (глобальная)
// ============================================================
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('emp-snils') && e.target.value === '') {
        const row = e.target.closest('.employee-row');
        if (!row) return;
        const last = row.querySelector('.emp-last').value.trim();
        const first = row.querySelector('.emp-first').value.trim();
        const middle = row.querySelector('.emp-middle').value.trim();
        const position = row.querySelector('.emp-position').value.trim();
        if (!last || !first) return;
        const employees = getEmployees();
        const found = employees.find(emp =>
            emp.last_name.toLowerCase() === last.toLowerCase() &&
            emp.first_name.toLowerCase() === first.toLowerCase() &&
            (emp.middle_name || '').toLowerCase() === (middle || '').toLowerCase() &&
            emp.position.toLowerCase() === position.toLowerCase()
        );
        if (found && found.snils) {
            e.target.value = found.snils;
        }
    }
});

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
function init() {
    renderHistory();
    renderEmployeeDB();
    if (document.querySelectorAll('.employee-row').length === 0) {
        addEmployeeRow();
    }
}

init();
