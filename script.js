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
// ПРОГРАММЫ
// ============================================================
function selectAllPrograms() {
    document.querySelectorAll('#programsContainer input[type="checkbox"]').forEach(cb => cb.checked = true);
}
function clearAllPrograms() {
    document.querySelectorAll('#programsContainer input[type="checkbox"]').forEach(cb => cb.checked = false);
}
function selectPrograms(ids) {
    document.querySelectorAll('#programsContainer input[type="checkbox"]').forEach(cb => {
        cb.checked = ids.includes(parseInt(cb.value));
    });
}
function getSelectedPrograms() {
    const checkboxes = document.querySelectorAll('#programsContainer input[type="checkbox"]:checked');
    const programs = [];
    checkboxes.forEach(cb => programs.push(parseInt(cb.value)));
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
        <button class="btn-copy" onclick="copyEmployee(this)">📋</button>
        <button class="btn-remove" onclick="this.closest('.employee-card').remove()">✖</button>
    `;
    container.appendChild(div);
}

function copyEmployee(btn) {
    const card = btn.closest('.employee-card');
    addEmployee({
        last_name: card.querySelector('.emp-last').value,
        first_name: card.querySelector('.emp-first').value,
        middle_name: card.querySelector('.emp-middle').value,
        position: card.querySelector('.emp-position').value,
        snils: card.querySelector('.emp-snils').value,
        is_passed: card.querySelector('.emp-passed').checked
    });
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

// ============================================================
// 📤 ИМПОРТ ИЗ ФАЙЛА
// ============================================================
document.getElementById('importBtn').addEventListener('click', function() {
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
            let content = event.target.result;
            
            // Пробуем разные кодировки
            if (content.includes('�') || content.includes('�')) {
                try {
                    const bytes = new Uint8Array(content.length);
                    for (let i = 0; i < content.length; i++) {
                        bytes[i] = content.charCodeAt(i) & 0xFF;
                    }
                    const decoder = new TextDecoder('windows-1251');
                    content = decoder.decode(bytes);
                } catch(e) {}
            }
            
            const employees = smartParse(content);
            
            if (employees.length === 0) {
                alert('❌ Не удалось распознать данные. Проверьте формат файла.');
                document.body.removeChild(input);
                return;
            }
            
            document.getElementById('employeesContainer').innerHTML = '';
            employees.forEach(emp => addEmployee(emp));
            alert(`✅ Загружено ${employees.length} сотрудников!`);
            document.body.removeChild(input);
        };
        
        reader.readAsBinaryString(file);
    };
    
    input.click();
});

// ============================================================
// 🧠 УМНЫЙ ПАРСЕР
// ============================================================
function smartParse(content) {
    // Удаляем BOM
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    const employees = [];
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const result = parseLine(trimmed);
        if (result) {
            employees.push(result);
        }
    });
    
    return employees;
}

function parseLine(line) {
    // Проверяем табуляцию
    if (line.includes('\t')) {
        const parts = line.split('\t').map(s => s.trim());
        if (parts.length >= 4) {
            let last_name = parts[0] || '';
            let first_name = parts[1] || '';
            let middle_name = parts[2] || '';
            let position = '';
            let snils = '';
            
            let snilsIndex = -1;
            parts.forEach((p, i) => {
                const clean = p.replace(/[\s-]/g, '');
                if (/^\d{11}$/.test(clean)) {
                    snils = clean;
                    snilsIndex = i;
                }
            });
            
            if (snilsIndex >= 0) {
                const nameParts = [];
                parts.forEach((p, i) => {
                    if (i === snilsIndex) return;
                    if (i < 3) {
                        nameParts.push(p);
                    } else {
                        position += p + ' ';
                    }
                });
                if (nameParts.length >= 2) {
                    last_name = nameParts[0] || '';
                    first_name = nameParts[1] || '';
                    middle_name = nameParts[2] || '';
                }
                position = position.trim();
            } else {
                if (parts.length >= 4) {
                    last_name = parts[0] || '';
                    first_name = parts[1] || '';
                    middle_name = parts[2] || '';
                    position = parts.slice(3).join(' ') || '';
                }
            }
            
            if (last_name && first_name) {
                return {
                    last_name: last_name,
                    first_name: first_name,
                    middle_name: middle_name || '',
                    position: position || '',
                    snils: snils || '',
                    is_passed: true
                };
            }
        }
    }
    
    // Через пробелы
    line = line.replace(/\s+/g, ' ').trim();
    
    let snils = '';
    let snilsMatch = line.match(/\d{3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{2}/);
    if (snilsMatch) {
        snils = snilsMatch[0].replace(/[\s-]/g, '');
    }
    
    let remaining = line;
    if (snils) {
        remaining = remaining.replace(snilsMatch[0], '').trim();
    }
    
    const words = remaining.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) return null;
    
    let nameEnd = 0;
    let nameCount = 0;
    
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (/^[А-ЯЁ][а-яё]{1,19}$/.test(w) || /^[A-Z][a-z]{1,19}$/.test(w)) {
            nameCount++;
            if (nameCount >= 3) {
                nameEnd = i + 1;
                break;
            }
        } else {
            if (nameCount >= 2) {
                nameEnd = i;
                break;
            } else {
                nameCount = 0;
            }
        }
    }
    
    if (nameEnd === 0 || nameEnd < 2) {
        nameEnd = Math.min(3, words.length);
    }
    
    const nameWords = words.slice(0, nameEnd);
    const positionWords = words.slice(nameEnd);
    
    let last_name = nameWords[0] || '';
    let first_name = nameWords[1] || '';
    let middle_name = nameWords[2] || '';
    let position = positionWords.join(' ') || '';
    
    if (!position && words.length > nameEnd) {
        position = words.slice(nameEnd).join(' ');
    }
    
    let is_passed = true;
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('не сдал') || lowerLine.includes('не сдан') || lowerLine.includes('несдал')) {
        is_passed = false;
    }
    
    if (last_name && first_name) {
        return {
            last_name: last_name,
            first_name: first_name,
            middle_name: middle_name || '',
            position: position || '',
            snils: snils || '',
            is_passed: is_passed
        };
    }
    
    return null;
}

// ============================================================
// ГЕНЕРАЦИЯ XML (С ПРАВИЛЬНОЙ КОДИРОВКОЙ)
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
            xml += `\t\t\t<MiddleName>${escXml(emp.middle_name)}</MiddleName>\n`;
            xml += `\t\t\t<Snils>${escXml(emp.snils)}</Snils>\n`;
            xml += `\t\t\t<Position>${escXml(emp.position)}</Position>\n`;
            xml += `\t\t\t<EmployerInn>${escXml(org.inn)}</EmployerInn>\n`;
            xml += `\t\t\t<EmployerTitle>${escXml(org.name)}</EmployerTitle>\n`;
            xml += '\t\t</Worker>\n';
            xml += '\t\t<Organization>\n';
            xml += `\t\t\t<Inn>${escXml(org.inn)}</Inn>\n`;
            xml += `\t\t\t<Title>${escXml(org.name)}</Title>\n`;
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

    // ===== СОЗДАЁМ XML С ПРАВИЛЬНОЙ КОДИРОВКОЙ =====
    // Используем Blob с правильным типом и кодировкой
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    document.getElementById('downloadLink').href = url;
    document.getElementById('downloadLink').download = `${protocolNumber.replace('/', '_')}_${date}.xml`;
    document.getElementById('resultBlock').classList.remove('hidden');

    alert('✅ XML создан в кодировке UTF-8! Нажмите "Скачать XML"');
});

function escXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    renderOrgs();
    if (document.querySelectorAll('.employee-card').length === 0) {
        addEmployee();
    }
});
