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
            
            if (/[����]/.test(content) || !/[а-яА-Я]/.test(content)) {
                try {
                    const bytes = new Uint8Array(content.length);
                    for (let i = 0; i < content.length; i++) {
                        bytes[i] = content.charCodeAt(i) & 0xFF;
                    }
                    const decoder = new TextDecoder('windows-1251');
                    content = decoder.decode(bytes);
                } catch(e) {}
            }
            
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }
            
            const employees = smartParse(content);
            
            if (employees.length === 0) {
                alert('❌ Не удалось распознать данные. Проверьте формат файла.');
                return;
            }
            
            document.getElementById('employeesContainer').innerHTML = '';
            employees.forEach(emp => addEmployee(emp));
            alert(`✅ Загружено ${employees.length} сотрудников!`);
        };
        
        reader.readAsBinaryString(file);
    };
    
    input.click();
});

// ============================================================
// 🧠 УМНЫЙ ПАРСЕР
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
        
        const result = parseLineUniversal(trimmed);
        if (result) {
            employees.push(result);
        }
    });
    
    return employees;
}

function parseLineUniversal(line) {
    // 1. Находим СНИЛС (в любом формате)
    let snils = '';
    let snilsMatch = line.match(/\d{3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{2}/);
    if (snilsMatch) {
        snils = snilsMatch[0].replace(/[\s-]/g, '');
        line = line.replace(snilsMatch[0], '').trim();
    }
    
    let words = line.split(/\s+/).filter(w => w.length > 0);
    
    let is_passed = true;
    const newWords = [];
    for (let w of words) {
        const lower = w.toLowerCase();
        if (lower.includes('сдал') || lower.includes('сдан')) {
            is_passed = !lower.includes('не');
        } else {
            newWords.push(w);
        }
    }
    words = newWords;
    
    if (words.length < 2) return null;
    
    let nameParts = [];
    let positionParts = [];
    
    const commonPositions = [
        'инженер', 'техник', 'механик', 'специалист', 'мастер', 'бригадир',
        'директор', 'менеджер', 'бухгалтер', 'экономист', 'юрист', 'конструктор',
        'технолог', 'электрик', 'сварщик', 'токарь', 'фрезеровщик', 'слесарь',
        'водитель', 'грузчик', 'кладовщик', 'уборщик', 'охранник', 'программист',
        'системный', 'администратор', 'начальник', 'заведующий', 'главный',
        'ведущий', 'старший', 'младший', 'помощник', 'заместитель', 'швея',
        'вышивальщица', 'раскройщик', 'комплектовщик', 'упаковщик', 'контролер',
        'наладчик', 'оператор', 'машинист', 'крановщик', 'стропальщик'
    ];
    
    let i = 0;
    while (i < words.length) {
        const w = words[i];
        const lower = w.toLowerCase();
        
        const isName = /^[А-ЯЁ][а-яё]{1,19}$/.test(w) || /^[A-Z][a-z]{1,19}$/.test(w);
        const isPosition = commonPositions.some(pos => lower === pos || lower.includes(pos) || pos.includes(lower));
        
        if (isName && !isPosition && nameParts.length < 3) {
            nameParts.push(w);
            i++;
        } else if (isName && !isPosition && nameParts.length >= 3) {
            positionParts.push(w);
            i++;
        } else {
            positionParts.push(w);
            i++;
        }
    }
    
    if (nameParts.length < 2) {
        const firstThree = words.slice(0, Math.min(3, words.length));
        if (firstThree.length >= 2) {
            const likelyName = firstThree.every(w => /^[А-ЯЁ][а-яё]{1,19}$/.test(w) || /^[A-Z][a-z]{1,19}$/.test(w));
            if (likelyName || firstThree.length === 3) {
                nameParts = firstThree;
                positionParts = words.slice(firstThree.length);
            }
        }
    }
    
    if (nameParts.length < 2) {
        nameParts = words.slice(0, 2);
        positionParts = words.slice(2);
    }
    
    if (nameParts.length < 2) return null;
    
    let last_name = nameParts[0] || '';
    let first_name = nameParts[1] || '';
    let middle_name = nameParts[2] || '';
    let position = positionParts.join(' ') || '';
    
    if (!position && words.length > nameParts.length) {
        position = words.slice(nameParts.length).join(' ');
    }
    
    return {
        last_name: last_name,
        first_name: first_name,
        middle_name: middle_name || '',
        position: position || '',
        snils: snils || '',
        is_passed: is_passed
    };
}

// ============================================================
// 🔧 ФОРМАТИРОВАНИЕ СНИЛС
// ============================================================
function formatSnils(snils) {
    // Удаляем все лишние символы, оставляем только цифры
    let clean = snils.replace(/\D/g, '');
    
    // Если меньше 11 цифр — возвращаем как есть
    if (clean.length < 11) return snils;
    
    // Берем последние 11 цифр (на случай, если ввели что-то лишнее)
    clean = clean.slice(-11);
    
    // Форматируем: XXX-XXX-XXX XX
    return clean.slice(0, 3) + '-' + clean.slice(3, 6) + '-' + clean.slice(6, 9) + ' ' + clean.slice(9, 11);
}

// ============================================================
// ГЕНЕРАЦИЯ XML (С ФОРМАТИРОВАНИЕМ СНИЛС)
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
        // ===== ФОРМАТИРУЕМ СНИЛС =====
        const formattedSnils = formatSnils(emp.snils);
        
        selectedPrograms.forEach(progId => {
            xml += '\t<RegistryRecord>\n';
            xml += '\t\t<Worker>\n';
            xml += `\t\t\t<LastName>${escXml(emp.last_name)}</LastName>\n`;
            xml += `\t\t\t<FirstName>${escXml(emp.first_name)}</FirstName>\n`;
            xml += `\t\t\t<MiddleName>${escXml(emp.middle_name)}</MiddleName>\n`;
            xml += `\t\t\t<Snils>${escXml(formattedSnils)}</Snils>\n`;
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

    const encoder = new TextEncoder();
    const encoded = encoder.encode(xml);
    const blob = new Blob([encoded], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    document.getElementById('downloadLink').href = url;
    document.getElementById('downloadLink').download = `${protocolNumber.replace('/', '_')}_${date}.xml`;
    document.getElementById('resultBlock').classList.remove('hidden');

    alert('✅ XML создан! Нажмите "Скачать XML"');
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
