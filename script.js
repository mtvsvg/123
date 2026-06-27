// ============================================================
// ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
// ============================================================
function showPage(page) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('mainPage').style.display = 'none';
    
    // Показываем нужную
    if (page === 'main') {
        document.getElementById('mainPage').style.display = 'block';
        // Обновляем активную ссылку в навигации
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.textContent.trim() === 'Главная') link.classList.add('active');
        });
    } else if (page === 'training') {
        document.getElementById('trainingPage').classList.remove('hidden');
        // Обновляем активную ссылку
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.textContent.trim() === 'Обучение') link.classList.add('active');
        });
        // Переинициализируем обработчики для страницы обучения
        initTrainingPage();
    } else if (page === 'risks') {
        document.getElementById('risksPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.textContent.trim() === 'Оценка рисков') link.classList.add('active');
        });
    } else if (page === 'analytics') {
        document.getElementById('analyticsPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.textContent.trim() === 'Аналитика') link.classList.add('active');
        });
    }
}

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
// ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ ОБУЧЕНИЯ
// ============================================================
let trainingInited = false;

function initTrainingPage() {
    if (trainingInited) return;
    trainingInited = true;
    
    renderOrgs();
    renderStaff();
    renderProtocol();
    fillFamEmployeeSelect();
    
    // ---- Обработчики для организации ----
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
    
    // ---- Обработчики для штатного расписания ----
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
                fillFamEmployeeSelect();
                alert(`✅ Загружено ${employees.length} сотрудников в штатное расписание!`);
                document.body.removeChild(input);
            };
            reader.readAsBinaryString(file);
        };
        input.click();
    });
    
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
    
    // ---- Обработчик генерации XML ----
    document.getElementById('generateBtn').addEventListener('click', function() {
        const protocolNumber = document.getElementById('protocolNumber').value.trim();
        const date = document.getElementById('protocolDate').value;
        const orgSelect = document.getElementById('orgSelect');
        const orgId = orgSelect.value;
        const orgs = getOrgs();
        const org = orgs.find(o => o.id == parseInt(orgId));
        const employees = getProtocol();
        const selectedPrograms = getSelectedPrograms();

        if (!orgId || !org) {
            alert('Выберите организацию');
            return;
        }
        if (!protocolNumber) {
            alert('Введите номер протокола');
            return;
        }
        if (!date) {
            alert('Выберите дату протокола');
            return;
        }
        if (employees.length === 0) {
            alert('В протоколе нет сотрудников');
            return;
        }
        if (selectedPrograms.length === 0) {
            alert('Выберите хотя бы одну программу обучения');
            return;
        }

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
                xml += `\t\t<Test isPassed="true" learnProgramId="${progId}">\n`;
                xml += `\t\t\t<Date>${escXml(date)}</Date>\n`;
                xml += `\t\t\t<ProtocolNumber>${escXml(protocolNumber)}</ProtocolNumber>\n`;
                xml += `\t\t\t<LearnProgramTitle>${escXml(programs[progId] || 'Неизвестная программа')}</LearnProgramTitle>\n`;
                xml += '\t\t</Test>\n';
                xml += '\t</RegistryRecord>\n';
            });
        });

        xml += '</RegistrySet>';

        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        document.getElementById('downloadLink').href = url;
        document.getElementById('downloadLink').download = `${protocolNumber.replace('/', '_')}_${date}.xml`;
        document.getElementById('resultBlock').classList.remove('hidden');

        alert('✅ XML создан! Нажмите "Скачать XML"');
    });

    // ---- Обработчики для ознакомления ----
    document.getElementById('generateFamBtn').addEventListener('click', function() {
        const select = document.getElementById('famEmployeeSelect');
        const index = select.value;
        if (index === '') {
            alert('Выберите сотрудника');
            return;
        }
        
        const staff = getStaff();
        const emp = staff[parseInt(index)];
        if (!emp) {
            alert('Сотрудник не найден');
            return;
        }
        
        const checkboxes = document.querySelectorAll('.doc-check input[type="checkbox"]:checked');
        const documents = [];
        checkboxes.forEach(cb => {
            documents.push(cb.value);
        });
        
        if (documents.length === 0) {
            alert('Выберите хотя бы один документ для ознакомления');
            return;
        }
        
        const orgSelect = document.getElementById('orgSelect');
        const orgId = orgSelect.value;
        const orgs = getOrgs();
        const org = orgs.find(o => o.id == parseInt(orgId));
        const orgName = org ? org.name : '___________';
        const orgInn = org ? org.inn : '___________';
        
        const date = new Date().toLocaleDateString('ru-RU');
        const resultDiv = document.getElementById('famResult');
        const contentDiv = document.getElementById('famContent');
        
        let html = `
            <div style="text-align:center;margin-bottom:16px;">
                <h3 style="font-size:16px;font-weight:700;color:#fff;">ЛИСТ ОЗНАКОМЛЕНИЯ</h3>
                <p style="color:#8888aa;font-size:13px;">с локальными нормативными актами и документами по охране труда</p>
            </div>
            <table style="width:100%;border-collapse:collapse;margin-top:8px;">
                <tr>
                    <td style="padding:4px 8px;font-weight:600;width:200px;color:#ccc;">Организация:</td>
                    <td style="padding:4px 8px;color:#ccc;">${orgName}</td>
                </tr>
                <tr>
                    <td style="padding:4px 8px;font-weight:600;color:#ccc;">ИНН:</td>
                    <td style="padding:4px 8px;color:#ccc;">${orgInn}</td>
                </tr>
                <tr>
                    <td style="padding:4px 8px;font-weight:600;color:#ccc;">Дата:</td>
                    <td style="padding:4px 8px;color:#ccc;">${date}</td>
                </tr>
            </table>
            <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
            <table style="width:100%;border-collapse:collapse;margin-top:8px;">
                <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                    <th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">ФИО сотрудника</th>
                    <th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">Должность</th>
                </tr>
                <tr>
                    <td style="padding:8px;color:#ccc;">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</td>
                    <td style="padding:8px;color:#ccc;">${emp.position}</td>
                </tr>
            </table>
            <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
            <table class="fam-table">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">№</th>
                        <th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">Наименование документа</th>
                        <th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Ознакомлен</th>
                        <th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Дата</th>
                        <th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Подпись</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        documents.forEach((doc, i) => {
            html += `
                <tr>
                    <td style="padding:8px;color:#ccc;">${i + 1}</td>
                    <td style="padding:8px;color:#ccc;">${doc}</td>
                    <td style="text-align:center;padding:8px;color:#ccc;">[ ]</td>
                    <td style="text-align:center;padding:8px;color:#ccc;">___ . ___ . 20___</td>
                    <td style="text-align:center;padding:8px;color:#ccc;">___________</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
            <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
            <div style="font-size:12px;color:#8888aa;text-align:center;">
                С документами ознакомлен(а), согласен(на) и обязуюсь выполнять требования
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px;color:#8888aa;">
                <div>СОТ: ___________________ / _____________ /</div>
                <div>Сотрудник: ___________________ / _____________ /</div>
            </div>
        `;
        
        contentDiv.innerHTML = html;
        resultDiv.classList.remove('hidden');
    });

    document.getElementById('printFamBtn').addEventListener('click', function() {
        window.print();
    });
}

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

function selectOrg(id) {
    currentOrgId = id;
    localStorage.setItem('currentOrgId', currentOrgId);
}

// ============================================================
// ВКЛАДКИ ВНУТРИ ОБУЧЕНИЯ
// ============================================================
function showTab(name) {
    document.querySelectorAll('.tab button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[id^="tab"]').forEach(t => t.classList.add('hidden'));
    if (name === 'staff') {
        document.getElementById('tabStaff').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(1)').classList.add('active');
        renderStaff();
        fillFamEmployeeSelect();
    } else if (name === 'protocol') {
        document.getElementById('tabProtocol').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(2)').classList.add('active');
        renderProtocol();
    } else if (name === 'familiarization') {
        document.getElementById('tabFamiliarization').classList.remove('hidden');
        document.querySelector('.tab button:nth-child(3)').classList.add('active');
        fillFamEmployeeSelect();
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
    fillFamEmployeeSelect();
}

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

function clearProtocol() {
    if (!confirm('Очистить протокол?')) return;
    saveProtocol([]);
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
// ЗАПОЛНЕНИЕ ВЫПАДАЮЩЕГО СПИСКА ДЛЯ ОЗНАКОМЛЕНИЯ
// ============================================================
function fillFamEmployeeSelect() {
    const select = document.getElementById('famEmployeeSelect');
    const staff = getStaff();
    select.innerHTML = '<option value="">-- Выберите сотрудника --</option>';
    staff.forEach((emp, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = `${emp.last_name} ${emp.first_name} ${emp.middle_name || ''} — ${emp.position}`;
        select.appendChild(opt);
    });
}

// ============================================================
// ПАРСЕР
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
    
    const commonPositions = [
        'инженер','техник','механик','специалист','мастер','бригадир',
        'директор','менеджер','бухгалтер','экономист','юрист','конструктор',
        'технолог','электрик','сварщик','токарь','фрезеровщик','слесарь',
        'водитель','грузчик','кладовщик','уборщик','охранник','программист',
        'администратор','начальник','заведующий','главный','ведущий',
        'старший','младший','помощник','заместитель','швея','вышивальщица',
        'раскройщик','комплектовщик','упаковщик','контролер','наладчик',
        'оператор','машинист','крановщик','стропальщик','троллейбуса',
        'автобуса','трамвая','отк','спец','мех','энерг','снабж','электромонтер',
        'диспетчер','фельдшер','медицинская','сестра','кассир','сторож','вахтер',
        'аккумуляторщик','маляр','токарь','обмотчик','ремонтировщик','разр','отдела'
    ];
    
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
// ФОРМАТИРОВАНИЕ СНИЛС
// ============================================================
function formatSnils(snils) {
    if (!snils) return '';
    const clean = snils.replace(/\D/g, '');
    if (clean.length < 11) return snils;
    return clean.slice(0,3) + '-' + clean.slice(3,6) + '-' + clean.slice(6,9) + ' ' + clean.slice(9,11);
}

// ============================================================
// Экранирование XML
// ============================================================
function escXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Показываем главную страницу
    document.getElementById('mainPage').style.display = 'block';
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    // Подсвечиваем активную ссылку
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === 'Главная') link.classList.add('active');
    });
});
