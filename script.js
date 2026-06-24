// ============================================================
// ХРАНИЛИЩЕ
// ============================================================
function getOrganizations() {
    return JSON.parse(localStorage.getItem('organizations') || '[]');
}
function saveOrganizations(orgs) {
    localStorage.setItem('organizations', JSON.stringify(orgs));
}
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

let currentOrgId = localStorage.getItem('currentOrgId') || null;

// ============================================================
// ОРГАНИЗАЦИИ
// ============================================================
function renderOrganizations() {
    const selector = document.getElementById('orgSelector');
    const orgs = getOrganizations();
    selector.innerHTML = '<option value="">-- Выберите организацию --</option>';
    orgs.forEach(org => {
        const option = document.createElement('option');
        option.value = org.id;
        option.textContent = `${org.title} (${org.inn})`;
        selector.appendChild(option);
    });
    if (currentOrgId) {
        selector.value = currentOrgId;
        const org = orgs.find(o => o.id == currentOrgId);
        if (org) {
            document.getElementById('orgTitle').value = org.title;
            document.getElementById('orgInn').value = org.inn;
        }
    } else {
        document.getElementById('orgTitle').value = '';
        document.getElementById('orgInn').value = '';
    }
}

function showAddOrgForm() {
    document.getElementById('addOrgForm').classList.remove('hidden');
}

function addOrganization() {
    const title = document.getElementById('newOrgTitle').value.trim();
    const inn = document.getElementById('newOrgInn').value.trim();
    if (!title || !inn) {
        alert('Заполните название и ИНН');
        return;
    }
    const orgs = getOrganizations();
    const newOrg = {
        id: Date.now(),
        title: title,
        inn: inn
    };
    orgs.push(newOrg);
    saveOrganizations(orgs);
    document.getElementById('newOrgTitle').value = '';
    document.getElementById('newOrgInn').value = '';
    document.getElementById('addOrgForm').classList.add('hidden');
    renderOrganizations();
    document.getElementById('orgSelector').value = newOrg.id;
    selectOrganization(newOrg.id);
}

function selectOrganization(orgId) {
    currentOrgId = orgId;
    localStorage.setItem('currentOrgId', currentOrgId);
    const orgs = getOrganizations();
    const org = orgs.find(o => o.id == orgId);
    if (org) {
        document.getElementById('orgTitle').value = org.title;
        document.getElementById('orgInn').value = org.inn;
    }
}

// Событие выбора организации
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('orgSelector').addEventListener('change', function() {
        if (this.value) {
            selectOrganization(parseInt(this.value));
        } else {
            document.getElementById('orgTitle').value = '';
            document.getElementById('orgInn').value = '';
        }
    });
});

// ============================================================
// ВКЛАДКИ
// ============================================================
function showTab(name) {
    document.querySelectorAll('.tab button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[id^="tab"]').forEach(t => t.classList.add('hidden'));
    if (name === 'protocol') {
        document.getElementById('tabProtocol').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(1)').classList.add('active');
    } else if (name === 'photo') {
        document.getElementById('tabPhoto').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(2)').classList.add('active');
    } else if (name === 'employees') {
        document.getElementById('tabEmployees').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(3)').classList.add('active');
        renderEmployeeDB();
    } else if (name === 'history') {
        document.getElementById('tabHistory').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(4)').classList.add('active');
        renderHistory();
    }
}

function goToDataTab() {
    showTab('protocol');
}

// ============================================================
// ФОТО
// ============================================================
let uploadedFile = null;
let recognizedEmployees = [];

const fileInput = document.getElementById('fileInput');
if (fileInput) {
    fileInput.addEventListener('change', function(e) {
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
}

const uploadArea = document.getElementById('uploadArea');
if (uploadArea) {
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#7c3aed';
        this.style.background = 'rgba(124, 58, 237, 0.1)';
    });
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = 'rgba(124, 58, 237, 0.4)';
        this.style.background = 'rgba(255,255,255,0.03)';
    });
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'rgba(124, 58, 237, 0.4)';
        this.style.background = 'rgba(255,255,255,0.03)';
        if (e.dataTransfer.files.length > 0) {
            uploadedFile = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = function(ev) {
                document.getElementById('imagePreview').src = ev.target.result;
                document.getElementById('photoPreview').classList.remove('hidden');
                document.getElementById('uploadArea').style.display = 'none';
            };
            reader.readAsDataURL(uploadedFile);
        }
    });
}

function recognizePhoto() {
    if (!uploadedFile) {
        alert('Сначала загрузите фото!');
        return;
    }

    // ЗАГЛУШКА - имитация распознавания
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

    let html = `<p><strong>📌 Номер:</strong> ${mockData.protocol_number}</p>
                <p><strong>📅 Дата:</strong> ${mockData.date}</p>
                <p><strong>🏢 ИНН:</strong> ${mockData.org_inn}</p>
                <p><strong>🏢 Организация:</strong> ${mockData.org_title}</p>
                <p><strong>👥 Сотрудники (${mockData.employees.length}):</strong></p>
                <ul>`;
    mockData.employees.forEach(e => {
        html += `<li>${e.last_name} ${e.first_name} ${e.middle_name || ''} — ${e.position} (${e.is_passed ? '✅ сдал' : '❌ не сдал'})</li>`;
    });
    html += '</ul>';
    document.getElementById('recognizedData').innerHTML = html;
    document.getElementById('recognitionResult').classList.remove('hidden');
}

function fillFormFromRecognition() {
    // Проверяем, есть ли организация с таким ИНН
    const orgs = getOrganizations();
    const existingOrg = orgs.find(o => o.inn === "2634800610");
    if (existingOrg) {
        document.getElementById('orgSelector').value = existingOrg.id;
        selectOrganization(existingOrg.id);
    } else {
        // Добавляем новую организацию
        const newOrg = {
            id: Date.now(),
            title: "ООО 'Бэби-Бум'",
            inn: "2634800610"
        };
        orgs.push(newOrg);
        saveOrganizations(orgs);
        renderOrganizations();
        document.getElementById('orgSelector').value = newOrg.id;
        selectOrganization(newOrg.id);
    }
    
    document.getElementById('protocolNumber').value = "01/26";
    document.getElementById('protocolDate').value = "2026-06-23";
    
    document.getElementById('employeesList').innerHTML = '';
    recognizedEmployees.forEach(emp => {
        addEmployeeRow(emp);
    });
    showTab('protocol');
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
        alert('Заполните все поля: организация, номер протокола и дата');
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
            e.first
