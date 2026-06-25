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
// ВКЛАДКИ
// ============================================================
function showTab(name) {
    document.querySelectorAll('.tab button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[id^="tab"]').forEach(t => t.classList.add('hidden'));
    if (name === 'staff') {
        document.getElementById('tabStaff').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(1)').classList.add('active');
        renderStaff();
    } else if (name === 'protocol') {
        document.getElementById('tabProtocol').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(2)').classList.add('active');
        renderProtocol();
    }
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
                    <th style="width:40px;"><input type="checkbox" id="selectAllStaff" onchange="toggleAllStaff()"></th>
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
}

function toggleAllStaff() {
    const checked = document.getElementById('selectAllStaff').checked;
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = checked);
}

function selectAllStaff() {
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = true);
    const selectAll = document.getElementById('selectAllStaff');
    if (selectAll) selectAll.checked = true;
}

function deselectAllStaff() {
    document.querySelectorAll('.staff-check').forEach(cb => cb.checked = false);
    const selectAll = document.getElementById('selectAllStaff');
    if (selectAll) selectAll.checked = false;
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
// ИМПОРТ ШТАТНОГО РАСПИСАНИЯ
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
            let content = event.target.result;
            // Пробуем разные кодировки
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
            alert(`✅ Загружено ${employees.length} сотрудников в штатное расписание!`);
            document.body.removeChild(input);
        };
        reader.readAsBinaryString(file);
    };
    input.click();
});

// ============================================================
// ПАРСЕР (ЛЮБОЙ ПОРЯДОК)
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
    
    const commonPositions = ['инженер','техник','механик','специалист','мастер','бригадир',
        'директор','менеджер','бухгалтер','экономист','юрист','конструктор',
        'технолог','электрик','сварщик','токарь','фрезеровщик','слесарь',
        'водитель','грузчик','кладовщик','уборщик','охранник','программист',
        'администратор','начальник','заведующий','главный','ведущий',
        'старший','младший','помощник','заместитель','швея','вышивальщица',
        'раскройщик','комплектовщик','упаковщик','контролер','наладчик',
        'оператор','машинист','крановщик','стропальщик','троллейбуса',
        'автобуса','трамвая','отк','спец','мех','энерг','снабж'];
    
    let nameParts = [];
    let positionParts = [];
    let i = 0;
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

// ============================================================
// ДОБАВЛЕНИЕ В ПРОТОКОЛ
// ============================================================
document.getElementById('addSelectedBtn').addEventListener('click', function() {
    const selected = getSelectedStaff();
    if (selected.length === 0) {
        alert('Выберите хотя бы одного сотрудника');
        return;
    }
    const currentProtocol = getProtocol();
    selected.forEach(emp => {
        if (!currentProtocol.some(e => e.last_name === emp.last_name && e.first_name === emp.first_name && e.snils === emp.snils)) {
            currentProtocol.push(emp);
        }
    });
    saveProtocol(currentProtocol);
    alert(`✅ Добавлено ${selected.length} сотрудников в протокол!`);
    deselectAllStaff();
    showTab('protocol');
});

// ============================================================
// ПРОТОКОЛ
// ============================================================
function renderProtocol() {
    const container = document.getElementById('protocolContainer');
    const protocol = getProtocol();
    if (protocol.length === 0) {
        container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">В протоколе пока нет сотрудников. Добавьте их из штатного расписания.</p>';
        return;
    }
    let html = `
        <table class="protocol-table">
            <thead>
                <tr>
                    <th>Фамилия</th>
                    <th>Имя</th>
                    <th>Отчество</th>
                    <th>Должность</th>
                    <th>СНИЛС</th>
                    <th style="width:60px;">Действие</th>
                </tr>
            </thead>
            <tbody>
    `;
    protocol.forEach((emp, index) => {
        html += `
            <tr>
                <td>${emp.last_name}</td>
                <td>${emp.first_name}</td>
                <td>${emp.middle_name || ''}</td>
                <td>${emp.position}</td>
                <td>${emp.snils}</td>
                <td><button class="btn-remove" onclick="removeFromProtocol(${index})">✖</button></td>
            </tr>
        `;
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
//
