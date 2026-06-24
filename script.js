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
// 📤 УМНЫЙ ИМПОРТ ИЗ ФАЙЛА
// ============================================================
document.getElementById('importBtn').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv,.xlsx,.xls';
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
            const content = event.target.result;
            const employees = smartParse(content);
            
            if (employees.length === 0) {
                alert('❌ Не удалось распознать данные. Проверьте формат файла.');
                document.body.removeChild(input);
                return;
            }
            
            // Очищаем и добавляем
            document.getElementById('employeesContainer').innerHTML = '';
            employees.forEach(emp => addEmployee(emp));
            alert(`✅ Загружено ${employees.length} сотрудников!`);
            document.body.removeChild(input);
        };
        
        reader.readAsText(file, 'UTF-8');
    };
    
    input.click();
});

// ============================================================
// 🧠 УМНЫЙ ПАРСЕР (ЛЮБОЙ ФОРМАТ)
// ============================================================
function smartParse(content) {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    const employees = [];
    
    lines.forEach(line => {
        // Пробуем разные разделители
        let parts = null;
        let delimiter = null;
        
        // Проверяем табуляцию
        if (line.includes('\t')) {
            parts = line.split('\t').map(s => s.trim());
            delimiter = '\t';
        }
        // Проверяем точку с запятой
        else if (line.includes(';')) {
            parts = line.split(';').map(s => s.trim());
            delimiter = ';';
        }
        // Проверяем запятую
        else if (line.includes(',')) {
            parts = line.split(',').map(s => s.trim());
            delimiter = ',';
        }
        
        // Если есть разделитель — парсим по частям
        if (parts && parts.length >= 2) {
            const emp = parseParts(parts);
            if (emp) employees.push(emp);
        } else {
            // Если разделителя нет — пробуем через пробелы
            const words = line.split(/\s+/).filter(w => w.length > 0);
            if (words.length >= 2) {
                const emp = parseWords(words);
                if (emp) employees.push(emp);
            }
        }
    });
    
    return employees;
}

// ===== ПАРСИНГ ПО ЧАСТЯМ (разделители) =====
function parseParts(parts) {
    let last_name = '', first_name = '', middle_name = '', position = '', snils = '';
    let is_passed = true;
    
    // Ищем СНИЛС (в любом формате)
    let snilsIndex = -1;
    parts.forEach((p, i) => {
        const clean = p.replace(/[\s-]/g, '');
        if (/^\d{11}$/.test(clean)) {
            snils = clean;
            snilsIndex = i;
        }
    });
    
    // Ищем "сдал"/"не сдал"
    let passedIndex = -1;
    parts.forEach((p, i) => {
        const lower = p.toLowerCase();
        if (lower.includes('сдал') || lower.includes('сдан') || lower.includes('не сдал') || lower.includes('не сдан')) {
            passedIndex = i;
            is_passed = !lower.includes('не');
        }
    });
    
    // Ищем должность (остальные слова, которые не ФИО и не СНИЛС и не "сдал")
    let positionParts = [];
    let nameParts = [];
    
    parts.forEach((p, i) => {
        if (i === snilsIndex || i === passedIndex) return;
        const lower = p.toLowerCase();
        // Если слово похоже на должность (длинное, не похоже на имя)
        if (p.length > 2 && !isNameWord(p) && !isSnilsWord(p)) {
            positionParts.push(p);
        } else {
            nameParts.push(p);
        }
    });
    
    position = positionParts.join(' ');
    
    // Парсим ФИО из nameParts
    if (nameParts.length >= 2) {
        last_name = nameParts[0] || '';
        first_name = nameParts[1] || '';
        middle_name = nameParts[2] || '';
    }
    
    // Если ФИО не распарсилось — пробуем найти 2-3 слова подряд
    if (!last_name && !first_name) {
        const allWords = parts.filter((p, i) => i !== snilsIndex && i !== passedIndex);
        if (allWords.length >= 2) {
            last_name = allWords[0] || '';
            first_name = allWords[1] || '';
            middle_name = allWords[2] || '';
            if (allWords.length > 3) {
                position = allWords.slice(3).join(' ');
            }
        }
    }
    
    // Если СНИЛС не найден — ищем среди всех частей
    if (!snils) {
        parts.forEach(p => {
            const clean = p.replace(/[\s-]/g, '');
            if (/^\d{11}$/.test(clean) && !snils) {
                snils = clean;
            }
        });
    }
    
    if (last_name && first_name) {
        return { last_name, first_name, middle_name, position, snils, is_passed };
    }
    return null;
}

// ===== ПАРСИНГ ПО СЛОВАМ (без разделителей) =====
function parseWords(words) {
    let last_name = '', first_name = '', middle_name = '', position = '', snils = '';
    let is_passed = true;
    
    // Ищем СНИЛС (в любом формате)
    let snilsIndex = -1;
    words.forEach((w, i) => {
        const clean = w.replace(/[\s-]/g, '');
        if (/^\d{11}$/.test(clean)) {
            snils = clean;
            snilsIndex = i;
        }
    });
    
    // Ищем "сдал"/"не сдал"
    let passedIndex = -1;
    words.forEach((w, i) => {
        const lower = w.toLowerCase();
        if (lower.includes('сдал') || lower.includes('сдан') || lower.includes('не сдал') || lower.includes('не сдан')) {
            passedIndex = i;
            is_passed = !lower.includes('не');
        }
    });
    
    // Убираем СНИЛС и "сдал" из списка слов
    let cleanWords = words.filter((_, i) => i !== snilsIndex && i !== passedIndex);
    
    // Ищем должность (слова, которые не похожи на ФИО)
    let nameWords = [];
    let positionWords = [];
    
    cleanWords.forEach((w, i) => {
        if (w.length > 2 && !isNameWord(w) && !isSnilsWord(w)) {
            positionWords.push(w);
        } else {
            nameWords.push(w);
        }
    });
    
    // Если nameWords меньше 2 — пробуем первые 3 слова как ФИО, остальное как должность
    if (nameWords.length < 2 && cleanWords.length >= 3) {
        nameWords = cleanWords.slice(0, 3);
        positionWords = cleanWords.slice(3);
    } else if (cleanWords.length >= 2) {
        // Берем первые 2-3 слова как ФИО
        nameWords = cleanWords.slice(0, Math.min(3, cleanWords.length));
        positionWords = cleanWords.slice(nameWords.length);
    }
    
    if (nameWords.length >= 2) {
        last_name = nameWords[0] || '';
        first_name = nameWords[1] || '';
        middle_name = nameWords[2] || '';
        position = positionWords.join(' ') || '';
    }
    
    if (last_name && first_name) {
        return { last_name, first_name, middle_name, position, snils, is_passed };
    }
    return null;
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function isNameWord(word) {
    // Проверяем, похоже ли слово на имя (начинается с заглавной, 2-15 букв)
    return /^[А-ЯЁ][а-яё]{1,14}$/.test(word) || /^[A-Z][a-z]{1,14}$/.test(word);
}

function isSnilsWord(word) {
    const clean = word.replace(/[\s-]/g, '');
    return /^\d{11}$/.test(clean);
}

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

    const blob = new Blob([xml], { type: 'application/xml' });
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
