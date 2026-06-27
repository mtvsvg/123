// ============================================================
// ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
// ============================================================
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('mainPage').style.display = 'none';
    
    if (page === 'main') {
        document.getElementById('mainPage').style.display = 'block';
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Главная') link.classList.add('active'); 
        });
    } else if (page === 'training') {
        document.getElementById('trainingPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Обучение') link.classList.add('active'); 
        });
        initTrainingPage();
    } else if (page === 'map') {
        document.getElementById('mapPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { 
            if (link.textContent.trim() === 'Карта') link.classList.add('active'); 
        });
        initMapPage();
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
function getOrgs() { return JSON.parse(localStorage.getItem('organizations') || '[]'); }
function saveOrgs(orgs) { localStorage.setItem('organizations', JSON.stringify(orgs)); }
function getStaff() { return JSON.parse(localStorage.getItem('staff') || '[]'); }
function saveStaff(staff) { localStorage.setItem('staff', JSON.stringify(staff)); }
function getProtocol() { return JSON.parse(localStorage.getItem('protocol') || '[]'); }
function saveProtocol(protocol) { localStorage.setItem('protocol', JSON.stringify(protocol)); }
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
    if (currentOrgId) select.value = currentOrgId;
}
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
    let html = `<table class="staff-table"><thead><tr><th style="width:40px;"><input type="checkbox" id="selectAllStaff" onchange="toggleAllStaff()"></th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Должность</th><th>СНИЛС</th></tr></thead><tbody>`;
    staff.forEach((emp, index) => {
        html += `<tr><td><input type="checkbox" class="staff-check" data-index="${index}"></td><td>${emp.last_name}</td><td>${emp.first_name}</td><td>${emp.middle_name || ''}</td><td>${emp.position}</td><td>${emp.snils}</td></tr>`;
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
        if (staff[index]) selected.push({ ...staff[index] }); 
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
// ОЗНАКОМЛЕНИЕ
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
    const commonPositions = ['инженер','техник','механик','специалист','мастер','бригадир','директор','менеджер','бухгалтер','экономист','юрист','конструктор','технолог','электрик','сварщик','токарь','фрезеровщик','слесарь','водитель','грузчик','кладовщик','уборщик','охранник','программист','администратор','начальник','заведующий','главный','ведущий','старший','младший','помощник','заместитель','швея','вышивальщица','раскройщик','комплектовщик','упаковщик','контролер','наладчик','оператор','машинист','крановщик','стропальщик','троллейбуса','автобуса','трамвая','отк','спец','мех','энерг','снабж','электромонтер','диспетчер','фельдшер','медицинская','сестра','кассир','сторож','вахтер','аккумуляторщик','маляр','токарь','обмотчик','ремонтировщик','разр','отдела'];
    let nameParts = [], positionParts = [], i = 0;
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
function formatSnils(snils) { 
    if (!snils) return ''; 
    const clean = snils.replace(/\D/g, ''); 
    if (clean.length < 11) return snils; 
    return clean.slice(0,3) + '-' + clean.slice(3,6) + '-' + clean.slice(6,9) + ' ' + clean.slice(9,11); 
}
function escXml(str) { 
    if (!str) return ''; 
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); 
}

// ============================================================
// ПОЛУЧЕНИЕ СИЗ С САЙТА ОНЛАЙН ИНСПЕКЦИЯ
// ============================================================
async function getPPEByProfession(profession) {
    try {
        // Кодируем профессию для URL
        const encodedProfession = encodeURIComponent(profession);
        
        // Используем API Онлайн Инспекции
        const url = `https://xn--80akibicpdbetz7e2g.xn--p1ai/api/ppe/search?q=${encodedProfession}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка при получении СИЗ:', error);
        // Если API не доступен, используем локальную базу
        return getLocalPPE(profession);
    }
}

// Локальная база СИЗ (на основе Приказа 767н)
function getLocalPPE(profession) {
    const ppeDB = {
        'токарь': {
            profession: 'Токарь',
            ppe: [
                'Костюм для защиты от общих производственных загрязнений и механических воздействий (3-й класс защиты)',
                'Очки защитные закрытые',
                'Щиток защитный лицевой',
                'Респиратор',
                'Беруши противошумные',
                'Рукавицы с полимерным покрытием',
                'Обувь специальная с жестким подноском'
            ]
        },
        'сварщик': {
            profession: 'Сварщик',
            ppe: [
                'Костюм сварщика',
                'Щиток сварщика со светофильтром',
                'Очки защитные со светофильтром',
                'Беруши противошумные',
                'Рукавицы сварщика',
                'Обувь специальная с жестким подноском',
                'Респиратор для защиты от сварочных аэрозолей'
            ]
        },
        'электрик': {
            profession: 'Электромонтер',
            ppe: [
                'Костюм для защиты от механических воздействий',
                'Очки защитные закрытые',
                'Беруши противошумные',
                'Перчатки диэлектрические',
                'Обувь диэлектрическая',
                'Предохранительный пояс',
                'Каска защитная'
            ]
        },
        'строитель': {
            profession: 'Строитель',
            ppe: [
                'Костюм для защиты от механических воздействий',
                'Каска защитная',
                'Обувь с жестким подноском',
                'Очки защитные открытые',
                'Перчатки с полимерным покрытием',
                'Наушники противошумные'
            ]
        },
        'водитель': {
            profession: 'Водитель',
            ppe: [
                'Костюм для защиты от механических воздействий',
                'Ботинки с жестким подноском',
                'Перчатки с полимерным покрытием',
                'Жилет сигнальный 2-го класса'
            ]
        },
        'инженер': {
            profession: 'Инженер',
            ppe: [
                'Костюм для защиты от общих производственных загрязнений',
                'Обувь защитная',
                'Перчатки с полимерным покрытием',
                'Очки защитные'
            ]
        },
        'техник': {
            profession: 'Техник',
            ppe: [
                'Халат хлопчатобумажный',
                'Обувь защитная',
                'Перчатки',
                'Очки защитные'
            ]
        }
    };
    
    // Ищем по ключевому слову в профессии
    const lowerProf = profession.toLowerCase();
    for (const [key, value] of Object.entries(ppeDB)) {
        if (lowerProf.includes(key) || key.includes(lowerProf)) {
            return value;
        }
    }
    
    // Если не нашли, возвращаем общие рекомендации
    return {
        profession: profession,
        ppe: [
            'Костюм для защиты от общих производственных загрязнений',
            'Обувь защитная',
            'Перчатки',
            'Очки защитные',
            'Каска защитная (при необходимости)'
        ]
    };
}

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

    // Обработчики событий
    document.getElementById('showOrgFormBtn').addEventListener('click', function() { 
        document.getElementById('orgForm').classList.toggle('hidden'); 
    });
    document.getElementById('cancelOrgBtn').addEventListener('click', function() { 
        document.getElementById('orgForm').classList.add('hidden'); 
    });
    document.getElementById('saveOrgBtn').addEventListener('click', function() {
        const name = document.getElementById('orgNameInput').value.trim(); 
        const inn = document.getElementById('orgInnInput').value.trim();
        if (!name || !inn) { alert('Заполните название и ИНН'); return; }
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
        if (!orgId) { alert('Сначала выберите организацию для удаления'); return; }
        if (!confirm('Удалить выбранную организацию?')) return;
        let orgs = getOrgs(); 
        orgs = orgs.filter(o => o.id != parseInt(orgId)); 
        saveOrgs(orgs);
        if (currentOrgId == orgId) { currentOrgId = null; localStorage.removeItem('currentOrgId'); }
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

    document.getElementById('staffImportBtn').addEventListener('click', function() {
        const input = document.createElement('input'); 
        input.type = 'file'; 
        input.accept = '.txt,.csv'; 
        input.style.display = 'none'; 
        document.body.appendChild(input);
        input.onchange = function(e) {
            if (!e.target.files.length) { document.body.removeChild(input); return; }
            const file = e.target.files[0]; 
            const reader = new FileReader();
            reader.onload = function(event) {
                let content = event.target.result;
                if (/[    ]/.test(content) || !/[а-яА-Я]/.test(content)) {
                    try { 
                        const bytes = new Uint8Array(content.length); 
                        for (let i = 0; i < content.length; i++) bytes[i] = content.charCodeAt(i) & 0xFF; 
                        const decoder = new TextDecoder('windows-1251'); 
                        content = decoder.decode(bytes); 
                    } catch(e) {}
                }
                if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
                const employees = smartParse(content);
                if (employees.length === 0) { 
                    alert('❌ Не удалось распознать данные.'); 
                    document.body.removeChild(input); 
                    return; 
                }
                const currentStaff = getStaff();
                employees.forEach(emp => { 
                    if (!currentStaff.some(e => e.last_name === emp.last_name && e.first_name === emp.first_name && e.snils === emp.snils)) 
                        currentStaff.push(emp); 
                });
                saveStaff(currentStaff); 
                renderStaff(); 
                fillFamEmployeeSelect();
                alert(`✅ Загружено ${employees.length} сотрудников!`);
                document.body.removeChild(input);
            };
            reader.readAsBinaryString(file);
        };
        input.click();
    });

    document.getElementById('addSelectedBtn').addEventListener('click', function() {
        const selected = getSelectedStaff();
        if (selected.length === 0) { alert('Выберите хотя бы одного сотрудника'); return; }
        const currentProtocol = getProtocol();
        selected.forEach(emp => { 
            if (!currentProtocol.some(e => e.last_name === emp.last_name && e.first_name === emp.first_name && e.snils === emp.snils)) 
                currentProtocol.push(emp); 
        });
        saveProtocol(currentProtocol); 
        alert(`✅ Добавлено ${selected.length} сотрудников в протокол!`); 
        deselectAllStaff(); 
        showTab('protocol');
    });

    document.getElementById('generateBtn').addEventListener('click', function() {
        const protocolNumber = document.getElementById('protocolNumber').value.trim();
        const date = document.getElementById('protocolDate').value;
        const orgSelect = document.getElementById('orgSelect'); 
        const orgId = orgSelect.value; 
        const orgs = getOrgs(); 
        const org = orgs.find(o => o.id == parseInt(orgId));
        const employees = getProtocol(); 
        const selectedPrograms = getSelectedPrograms();
        if (!orgId || !org) { alert('Выберите организацию'); return; }
        if (!protocolNumber) { alert('Введите номер протокола'); return; }
        if (!date) { alert('Выберите дату протокола'); return; }
        if (employees.length === 0) { alert('В протоколе нет сотрудников'); return; }
        if (selectedPrograms.length === 0) { alert('Выберите хотя бы одну программу'); return; }
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

    document.getElementById('generateFamBtn').addEventListener('click', function() {
        const select = document.getElementById('famEmployeeSelect'); 
        const index = select.value;
        if (index === '') { alert('Выберите сотрудника'); return; }
        const staff = getStaff(); 
        const emp = staff[parseInt(index)];
        if (!emp) { alert('Сотрудник не найден'); return; }
        const checkboxes = document.querySelectorAll('.doc-check input[type="checkbox"]:checked'); 
        const documents = []; 
        checkboxes.forEach(cb => documents.push(cb.value));
        if (documents.length === 0) { alert('Выберите хотя бы один документ'); return; }
        const orgSelect = document.getElementById('orgSelect'); 
        const orgId = orgSelect.value; 
        const orgs = getOrgs(); 
        const org = orgs.find(o => o.id == parseInt(orgId));
        const orgName = org ? org.name : '___________'; 
        const orgInn = org ? org.inn : '___________';
        const date = new Date().toLocaleDateString('ru-RU'); 
        const contentDiv = document.getElementById('famContent');
        let html = `<div style="text-align:center;margin-bottom:16px;"><h3 style="font-size:16px;font-weight:700;color:#fff;">ЛИСТ ОЗНАКОМЛЕНИЯ</h3><p style="color:#8888aa;font-size:13px;">с локальными нормативными актами и документами по охране труда</p></div>
            <table style="width:100%;border-collapse:collapse;margin-top:8px;"><tr><td style="padding:4px 8px;font-weight:600;width:200px;color:#ccc;">Организация:</td><td style="padding:4px 8px;color:#ccc;">${orgName}</td></tr>
            <tr><td style="padding:4px 8px;font-weight:600;color:#ccc;">ИНН:</td><td style="padding:4px 8px;color:#ccc;">${orgInn}</td></tr>
            <tr><td style="padding:4px 8px;font-weight:600;color:#ccc;">Дата:</td><td style="padding:4px 8px;color:#ccc;">${date}</td></tr></table>
            <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
            <table style="width:100%;border-collapse:collapse;margin-top:8px;"><tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">ФИО сотрудника</th><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">Должность</th></tr>
            <tr><td style="padding:8px;color:#ccc;">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</td><td style="padding:8px;color:#ccc;">${emp.position}</td></tr></table>
            <hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;">
            <table class="fam-table"><thead><tr><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">№</th><th style="text-align:left;padding:8px;color:#8888aa;font-weight:500;">Наименование документа</th><th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Ознакомлен</th><th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Дата</th><th style="text-align:center;padding:8px;color:#8888aa;font-weight:500;">Подпись</th></tr></thead><tbody>`;
        documents.forEach((doc, i) => { 
            html += `<tr><td style="padding:8px;color:#ccc;">${i + 1}</td><td style="padding:8px;color:#ccc;">${doc}</td><td style="text-align:center;padding:8px;color:#ccc;">[ ]</td><td style="text-align:center;padding:8px;color:#ccc;">___ . ___ . 20___</td><td style="text-align:center;padding:8px;color:#ccc;">___________</td></tr>`; 
        });
        html += `</tbody></table><hr style="border-color:rgba(255,255,255,0.1);margin:12px 0;"><div style="font-size:12px;color:#8888aa;text-align:center;">С документами ознакомлен(а), согласен(на) и обязуюсь выполнять требования</div>
            <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px;color:#8888aa;"><div>СОТ: ___________________ / _____________ /</div><div>Сотрудник: ___________________ / _____________ /</div></div>`;
        contentDiv.innerHTML = html;
        document.getElementById('famResult').classList.remove('hidden');
    });
    document.getElementById('printFamBtn').addEventListener('click', function() { 
        window.print(); 
    });
}

// ============================================================
// КАРТА - С ПОДБОРОМ СИЗ ПО ПРОФЕССИИ
// ============================================================
let mapData = {
    workshops: [],
    currentWorkshop: 0,
    evacuationPoints: []
};
let mapMode = 'view';
let mapInited = false;
let tempWorkplacePos = null;
let isDragging = false;
let dragTarget = null;
let dragOffsetX = 0, dragOffsetY = 0;
let isResizing = false;
let resizeCorner = '';
let resizeStartX = 0, resizeStartY = 0;
let resizeStartW = 0, resizeStartH = 0;
let resizeStartXpos = 0, resizeStartYpos = 0;
let selectedWorkplaceIndex = -1; // Для контекстного меню

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Устанавливаем ОГРОМНЫЙ логический размер
canvas.width = 3000;
canvas.height = 1500;

function initMapPage() {
    if (mapInited) return;
    mapInited = true;
    
    const saved = localStorage.getItem('mapData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.workshops && parsed.workshops.length > 0) {
                mapData = parsed;
                if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
                const ws = getCurrentWorkshop();
                if (ws && ws.w < 2000) {
                    ws.x = 50;
                    ws.y = 50;
                    ws.w = 2900;
                    ws.h = 1400;
                }
                updateWorkshopSelect();
                updateInfo();
                drawMap();
            }
        } catch(e) {}
    }
    
    if (mapData.workshops.length === 0) {
        mapData.workshops.push({
            id: Date.now(),
            name: 'Основной цех',
            length: 30,
            width: 20,
            x: 50, 
            y: 50, 
            w: 2900, 
            h: 1400,
            workplaces: []
        });
        mapData.currentWorkshop = 0;
        mapData.evacuationPoints = [];
        updateWorkshopSelect();
        updateInfo();
        drawMap();
    }
    
    // Обработчики событий
    document.getElementById('editWorkshopBtn').addEventListener('click', function() {
        openWorkshopModal();
    });
    document.getElementById('addWorkerPlaceBtn').addEventListener('click', function() {
        const ws = getCurrentWorkshop();
        if (!ws) { alert('Сначала создайте участок'); return; }
        mapMode = 'addWorkplace';
        document.getElementById('mapMode').textContent = 'Добавление рабочего места';
        document.getElementById('mapMode').style.color = '#ff6b6b';
    });
    document.getElementById('addEvacuationBtn').addEventListener('click', function() {
        const ws = getCurrentWorkshop();
        if (!ws) { alert('Сначала создайте участок'); return; }
        mapMode = 'addEvacuation';
        document.getElementById('mapMode').textContent = 'Добавление выхода';
        document.getElementById('mapMode').style.color = '#4caf50';
    });
    document.getElementById('saveMapBtn').addEventListener('click', function() {
        saveMap();
        alert('✅ Карта сохранена!');
    });
    document.getElementById('saveWorkshopBtn').addEventListener('click', function() {
        saveWorkshop();
    });
    document.getElementById('saveWorkplaceBtn').addEventListener('click', function() {
        saveWorkplace();
    });
    document.getElementById('workshopSelect').addEventListener('change', function() {
        mapData.currentWorkshop = parseInt(this.value);
        updateInfo();
        drawMap();
        saveMap();
    });
    
    setupCanvasEvents();
    updateWorkshopSelect();
    updateInfo();
    drawMap();
}

function getCurrentWorkshop() {
    return mapData.workshops[mapData.currentWorkshop] || null;
}

function updateWorkshopSelect() {
    const select = document.getElementById('workshopSelect');
    select.innerHTML = '';
    mapData.workshops.forEach((ws, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = ws.name || `Участок ${index + 1}`;
        if (index === mapData.currentWorkshop) opt.selected = true;
        select.appendChild(opt);
    });
}

function updateInfo() {
    const ws = getCurrentWorkshop();
    document.getElementById('workshopSize').textContent = ws ? `${ws.name}` : 'не задан';
    document.getElementById('workerCount').textContent = ws ? ws.workplaces.length : 0;
    document.getElementById('evacuationCount').textContent = mapData.evacuationPoints ? mapData.evacuationPoints.length : 0;
}

function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    return { 
        x: (clientX - rect.left) * scaleX, 
        y: (clientY - rect.top) * scaleY 
    };
}

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const ws = getCurrentWorkshop();
    if (!ws) return;
    
    // Фон
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Сетка
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath(); 
        ctx.moveTo(i, 0); 
        ctx.lineTo(i, canvas.height); 
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath(); 
        ctx.moveTo(0, i); 
        ctx.lineTo(canvas.width, i); 
        ctx.stroke();
    }
    
    // Участок
    const grad = ctx.createLinearGradient(ws.x, ws.y, ws.x + ws.w, ws.y + ws.h);
    grad.addColorStop(0, 'rgba(74, 158, 255, 0.08)');
    grad.addColorStop(1, 'rgba(74, 158, 255, 0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(ws.x, ws.y, ws.w, ws.h);
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(ws.x, ws.y, ws.w, ws.h);
    ctx.setLineDash([]);
    
    ctx.fillStyle = 'rgba(74, 158, 255, 0.6)';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🏭 ${ws.name} (${ws.length}×${ws.width} м)`, ws.x + ws.w/2, ws.y + 45);
    
    // Углы для растягивания
    const cornerSize = 16;
    const corners = [
        { cx: ws.x, cy: ws.y },
        { cx: ws.x + ws.w, cy: ws.y },
        { cx: ws.x, cy: ws.y + ws.h },
        { cx: ws.x + ws.w, cy: ws.y + ws.h }
    ];
    corners.forEach(c => {
        ctx.fillStyle = 'rgba(74, 158, 255, 0.9)';
        ctx.fillRect(c.cx - cornerSize/2, c.cy - cornerSize/2, cornerSize, cornerSize);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(c.cx - cornerSize/2, c.cy - cornerSize/2, cornerSize, cornerSize);
    });
    
    // Рабочие места
    if (ws.workplaces) {
        ws.workplaces.forEach((wp, index) => {
            const zoneSize = wp.zone || 50;
            const x = wp.x - zoneSize/2;
            const y = wp.y - zoneSize/2;
            const w = zoneSize;
            const h = zoneSize;
            
            // Чёрно-жёлтая зона
            ctx.fillStyle = 'rgba(255, 193, 7, 0.25)';
            ctx.fillRect(x, y, w, h);
            
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.clip();
            
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 4;
            for (let i = -h; i < w + h; i += 14) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i + h, y + h);
                ctx.stroke();
            }
            ctx.restore();
            
            ctx.strokeStyle = 'rgba(255, 193, 7, 0.7)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
            
            // Человечек
            const centerX = wp.x;
            const centerY = wp.y;
            const scale = 1.8;
            
            // Определяем цвет в зависимости от наличия СИЗ
            let color = '#ff6b6b';
            if (wp.hasPPE) {
                color = '#4caf50'; // Зелёный - СИЗ подобраны
            }
            
            ctx.fillStyle = color;
            ctx.shadowColor = `${color}40`;
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.arc(centerX, centerY - 18 * scale, 14 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillRect(centerX - 10 * scale, centerY - 6 * scale, 20 * scale, 24 * scale);
            ctx.fillRect(centerX - 16 * scale, centerY + 16 * scale, 9 * scale, 14 * scale);
            ctx.fillRect(centerX + 7 * scale, centerY + 16 * scale, 9 * scale, 14 * scale);
            ctx.fillRect(centerX - 20 * scale, centerY + 2 * scale, 7 * scale, 12 * scale);
            ctx.fillRect(centerX + 13 * scale, centerY + 2 * scale, 7 * scale, 12 * scale);
            
            // Название
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(wp.name.substring(0, 20), centerX, centerY + 55 * scale);
            if (wp.position) {
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.font = '13px sans-serif';
                ctx.fillText(wp.position.substring(0, 25), centerX, centerY + 72 * scale);
            }
            
            // Иконка СИЗ если есть
            if (wp.hasPPE) {
                ctx.font = '18px sans-serif';
                ctx.fillText('🦺', centerX + 35 * scale, centerY - 25 * scale);
            }
        });
    }
    
    // Точки эвакуации
    if (mapData.evacuationPoints) {
        mapData.evacuationPoints.forEach((ep) => {
            const ew = 100, eh = 50;
            const ex = ep.x - ew/2;
            const ey = ep.y - eh/2;
            
            ctx.fillStyle = '#2e7d32';
            ctx.shadowColor = 'rgba(46, 125, 50, 0.4)';
            ctx.shadowBlur = 25;
            ctx.fillRect(ex, ey, ew, eh);
            ctx.shadowBlur = 0;
            
            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = 2;
            ctx.strokeRect(ex, ey, ew, eh);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🚪 ВЫХОД', ep.x, ep.y);
            ctx.textBaseline = 'alphabetic';
        });
    }
}

function setupCanvasEvents() {
    // Контекстное меню (ПКМ)
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws || !ws.workplaces) return;
        
        // Ищем ближайшее рабочее место
        let found = -1;
        let minDist = 50;
        ws.workplaces.forEach((wp, index) => {
            const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
            if (dist < minDist) {
                minDist = dist;
                found = index;
            }
        });
        
        if (found >= 0) {
            selectedWorkplaceIndex = found;
            const menu = document.getElementById('contextMenu');
            menu.style.left = e.clientX + 'px';
            menu.style.top = e.clientY + 'px';
            menu.classList.remove('hidden');
        }
    });
    
    // Закрываем контекстное меню при клике вне его
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('contextMenu');
        if (!menu.contains(e.target)) {
            menu.classList.add('hidden');
        }
    });
    
    canvas.addEventListener('click', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        if (coords.x < ws.x || coords.x > ws.x + ws.w || coords.y < ws.y || coords.y > ws.y + ws.h) {
            alert('Кликните внутри участка');
            return;
        }
        if (mapMode === 'addWorkplace') {
            openWorkplaceModal(coords.x, coords.y);
        } else if (mapMode === 'addEvacuation') {
            const name = prompt('Введите название выхода (опционально):', '');
            if (name !== null) {
                if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
                mapData.evacuationPoints.push({ 
                    x: coords.x, 
                    y: coords.y, 
                    name: name.trim() || 'Выход', 
                    id: Date.now() 
                });
                updateInfo();
                drawMap();
                saveMap();
                mapMode = 'view';
                document.getElementById('mapMode').textContent = 'Просмотр';
                document.getElementById('mapMode').style.color = '#00d4ff';
            }
        }
    });
    
    canvas.addEventListener('dblclick', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        let found = -1;
        if (ws.workplaces) {
            ws.workplaces.forEach((wp, index) => {
                const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                if (dist < 35) found = index;
            });
            if (found >= 0) {
                if (confirm(`Удалить рабочее место "${ws.workplaces[found].name}"?`)) {
                    ws.workplaces.splice(found, 1);
                    updateInfo();
                    drawMap();
                    saveMap();
                    return;
                }
            }
        }
        if (mapData.evacuationPoints) {
            let evacFound = -1;
            mapData.evacuationPoints.forEach((ep, index) => {
                const dist = Math.sqrt((coords.x - ep.x) ** 2 + (coords.y - ep.y) ** 2);
                if (dist < 35) evacFound = index;
            });
            if (evacFound >= 0) {
                if (confirm(`Удалить выход "${mapData.evacuationPoints[evacFound].name}"?`)) {
                    mapData.evacuationPoints.splice(evacFound, 1);
                    updateInfo();
                    drawMap();
                    saveMap();
                    return;
                }
            }
        }
    });
    
    // Перетаскивание и растягивание
    canvas.addEventListener('mousedown', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        if (ws.workplaces) {
            for (let i = ws.workplaces.length - 1; i >= 0; i--) {
                const wp = ws.workplaces[i];
                const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                if (dist < 35) {
                    isDragging = true;
                    dragTarget = i;
                    dragOffsetX = coords.x - wp.x;
                    dragOffsetY = coords.y - wp.y;
                    canvas.style.cursor = 'grabbing';
                    return;
                }
            }
        }
        
        const cornerSize = 20;
        const corners = [
            { cx: ws.x, cy: ws.y, corner: 'tl' },
            { cx: ws.x + ws.w, cy: ws.y, corner: 'tr' },
            { cx: ws.x, cy: ws.y + ws.h, corner: 'bl' },
            { cx: ws.x + ws.w, cy: ws.y + ws.h, corner: 'br' }
        ];
        for (let c of corners) {
            if (Math.abs(coords.x - c.cx) < cornerSize && Math.abs(coords.y - c.cy) < cornerSize) {
                isResizing = true;
                resizeCorner = c.corner;
                resizeStartX = coords.x;
                resizeStartY = coords.y;
                resizeStartW = ws.w;
                resizeStartH = ws.h;
                resizeStartXpos = ws.x;
                resizeStartYpos = ws.y;
                canvas.style.cursor = c.corner === 'tl' ? 'nw-resize' : c.corner === 'tr' ? 'ne-resize' : c.corner === 'bl' ? 'sw-resize' : 'se-resize';
                return;
            }
        }
    });
    
    canvas.addEventListener('mousemove', function(e) {
        const coords = getCanvasCoords(e);
        const ws = getCurrentWorkshop();
        if (!ws) return;
        
        if (isDragging && dragTarget !== null) {
            const wp = ws.workplaces[dragTarget];
            if (wp) {
                let newX = coords.x - dragOffsetX;
                let newY = coords.y - dragOffsetY;
                newX = Math.max(ws.x + 15, Math.min(ws.x + ws.w - 15, newX));
                newY = Math.max(ws.y + 15, Math.min(ws.y + ws.h - 15, newY));
                wp.x = newX;
                wp.y = newY;
                drawMap();
            }
            return;
        }
        
        if (isResizing) {
            const dx = coords.x - resizeStartX;
            const dy = coords.y - resizeStartY;
            
            switch(resizeCorner) {
                case 'tl':
                    ws.x = Math.max(0, resizeStartXpos + dx);
                    ws.y = Math.max(0, resizeStartYpos + dy);
                    ws.w = Math.max(100, resizeStartW - dx);
                    ws.h = Math.max(100, resizeStartH - dy);
                    break;
                case 'tr':
                    ws.y = Math.max(0, resizeStartYpos + dy);
                    ws.w = Math.max(100, resizeStartW + dx);
                    ws.h = Math.max(100, resizeStartH - dy);
                    break;
                case 'bl':
                    ws.x = Math.max(0, resizeStartXpos + dx);
                    ws.w = Math.max(100, resizeStartW - dx);
                    ws.h = Math.max(100, resizeStartH + dy);
                    break;
                case 'br':
                    ws.w = Math.max(100, resizeStartW + dx);
                    ws.h = Math.max(100, resizeStartH + dy);
                    break;
            }
            drawMap();
            return;
        }
        
        let cursor = 'default';
        if (ws.workplaces) {
            for (let wp of ws.workplaces) {
                const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                if (dist < 35) {
                    cursor = 'grab';
                    break;
                }
            }
        }
        if (cursor === 'default') {
            const cornerSize = 20;
            const corners = [
                { cx: ws.x, cy: ws.y, c: 'nw-resize' },
                { cx: ws.x + ws.w, cy: ws.y, c: 'ne-resize' },
                { cx: ws.x, cy: ws.y + ws.h, c: 'sw-resize' },
                { cx: ws.x + ws.w, cy: ws.y + ws.h, c: 'se-resize' }
            ];
            for (let c of corners) {
                if (Math.abs(coords.x - c.cx) < cornerSize && Math.abs(coords.y - c.cy) < cornerSize) {
                    cursor = c.c;
                    break;
                }
            }
        }
        canvas.style.cursor = cursor;
    });
    
    canvas.addEventListener('mouseup', function(e) {
        if (isDragging) {
            isDragging = false;
            dragTarget = null;
            canvas.style.cursor = 'default';
            saveMap();
        }
        if (isResizing) {
            isResizing = false;
            canvas.style.cursor = 'default';
            saveMap();
        }
    });
    
    canvas.addEventListener('mouseleave', function() {
        if (isDragging) {
            isDragging = false;
            dragTarget = null;
            canvas.style.cursor = 'default';
            saveMap();
        }
        if (isResizing) {
            isResizing = false;
            canvas.style.cursor = 'default';
            saveMap();
        }
    });
}

// ============================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С КОНТЕКСТНЫМ МЕНЮ
// ============================================================
function showWorkplacePPE() {
    const menu = document.getElementById('contextMenu');
    menu.classList.add('hidden');
    
    const ws = getCurrentWorkshop();
    if (!ws || !ws.workplaces || selectedWorkplaceIndex < 0 || selectedWorkplaceIndex >= ws.workplaces.length) {
        alert('Рабочее место не найдено');
        return;
    }
    
    const wp = ws.workplaces[selectedWorkplaceIndex];
    if (!wp.position) {
        alert('Для этого рабочего места не указана должность. Добавьте должность в настройках.');
        return;
    }
    
    // Открываем модальное окно с СИЗ
    openPPEModal(wp);
}

function editWorkplace() {
    const menu = document.getElementById('contextMenu');
    menu.classList.add('hidden');
    
    const ws = getCurrentWorkshop();
    if (!ws || !ws.workplaces || selectedWorkplaceIndex < 0 || selectedWorkplaceIndex >= ws.workplaces.length) {
        alert('Рабочее место не найдено');
        return;
    }
    
    const wp = ws.workplaces[selectedWorkplaceIndex];
    // Открываем модалку редактирования
    tempWorkplacePos = { x: wp.x, y: wp.y };
    const modal = document.getElementById('workplaceModal');
    modal.classList.remove('hidden');
    document.getElementById('workplaceNameInput').value = wp.name || '';
    document.getElementById('workplacePositionInput').value = wp.position || '';
    document.getElementById('workplaceZoneInput').value = wp.zone || 50;
    document.getElementById('workplaceNameInput').focus();
    
    // Меняем кнопку на "Сохранить" и сохраняем индекс
    const saveBtn = document.getElementById('saveWorkplaceBtn');
    saveBtn.textContent = '💾 Сохранить';
    saveBtn.dataset.editIndex = selectedWorkplaceIndex;
}

function deleteWorkplace() {
    const menu = document.getElementById('contextMenu');
    menu.classList.add('hidden');
    
    const ws = getCurrentWorkshop();
    if (!ws || !ws.workplaces || selectedWorkplaceIndex < 0 || selectedWorkplaceIndex >= ws.workplaces.length) return;
    
    if (confirm(`Удалить рабочее место "${ws.workplaces[selectedWorkplaceIndex].name}"?`)) {
        ws.workplaces.splice(selectedWorkplaceIndex, 1);
        selectedWorkplaceIndex = -1;
        updateInfo();
        drawMap();
        saveMap();
    }
}

// ============================================================
// МОДАЛЬНОЕ ОКНО ДЛЯ СИЗ
// ============================================================
let currentPPEWorkplace = null;

async function openPPEModal(wp) {
    currentPPEWorkplace = wp;
    const modal = document.getElementById('ppeModal');
    const loading = document.getElementById('ppeLoading');
    const content = document.getElementById('ppeContent');
    const error = document.getElementById('ppeError');
    
    // Показываем загрузку
    loading.style.display = 'block';
    content.style.display = 'none';
    error.style.display = 'none';
    modal.classList.remove('hidden');
    
    // Заполняем информацию о сотруднике
    document.getElementById('ppeEmployeeName').textContent = wp.name || 'Сотрудник';
    document.getElementById('ppePosition').textContent = wp.position || 'Должность не указана';
    
    try {
        // Получаем СИЗ
        const ppeData = await getPPEByProfession(wp.position);
        
        if (ppeData && ppeData.ppe && ppeData.ppe.length > 0) {
            // Отображаем список СИЗ
            const list = document.getElementById('ppeList');
            let html = '';
            ppeData.ppe.forEach((item, index) => {
                html += `
                    <div style="background:rgba(255,255,255,0.03);padding:12px 16px;border-radius:8px;border-left:3px solid #7c3aed;display:flex;align-items:center;gap:12px;">
                        <span style="color:#7c3aed;font-weight:700;min-width:30px;">${index + 1}</span>
                        <span style="color:#ccc;flex:1;">${item}</span>
                        <span style="color:#4caf50;font-size:20px;">✅</span>
                    </div>
                `;
            });
            list.innerHTML = html;
            
            // Помечаем рабочее место как имеющее СИЗ
            wp.hasPPE = true;
            saveMap();
            drawMap();
            
            loading.style.display = 'none';
            content.style.display = 'block';
        } else {
            throw new Error('СИЗ не найдены');
        }
    } catch (err) {
        console.error('Ошибка загрузки СИЗ:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
        error.innerHTML = `
            ❌ Не удалось загрузить данные по профессии "${wp.position}".<br>
            <span style="font-size:14px;color:#8888aa;">Проверьте правильность написания профессии или попробуйте позже.</span>
        `;
    }
}

function closePPEModal() {
    document.getElementById('ppeModal').classList.add('hidden');
    currentPPEWorkplace = null;
}

function exportPPE() {
    if (!currentPPEWorkplace) return;
    
    const content = document.getElementById('ppeContent');
    const html = content.innerHTML;
    
    // Создаем окно для печати
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>СИЗ для ${currentPPEWorkplace.name}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                h1 { color: #1a1a3e; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
                .item { padding: 10px 15px; margin: 8px 0; background: #f5f5f5; border-left: 3px solid #7c3aed; }
                .footer { margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 15px; }
            </style>
        </head>
        <body>
            <h1>🦺 Средства индивидуальной защиты</h1>
            <p><strong>Сотрудник:</strong> ${currentPPEWorkplace.name}</p>
            <p><strong>Должность:</strong> ${currentPPEWorkplace.position}</p>
            <hr>
            <div id="ppeList">
                ${document.getElementById('ppeList').innerHTML}
            </div>
            <div class="footer">
                <p>Основано на Приказе Минтруда РФ от 29.10.2021 № 767н</p>
                <p>Сформировано: ${new Date().toLocaleDateString('ru-RU')}</p>
            </div>
            <script>
                window.print();
            <\/script>
        </body>
        </html>
    `);
    win.document.close();
}

// ============================================================
// РЕДАКТИРОВАНИЕ РАБОЧЕГО МЕСТА (ПЕРЕОПРЕДЕЛЯЕМ saveWorkplace)
// ============================================================
// Сохраняем оригинальную функцию
const originalSaveWorkplace = window.saveWorkplace;

// Переопределяем для поддержки редактирования
window.saveWorkplace = function() {
    const saveBtn = document.getElementById('saveWorkplaceBtn');
    const editIndex = saveBtn.dataset.editIndex;
    
    if (editIndex !== undefined && editIndex !== '') {
        // Режим редактирования
        const ws = getCurrentWorkshop();
        if (!ws || !ws.workplaces || editIndex >= ws.workplaces.length) return;
        
        const wp = ws.workplaces[editIndex];
        wp.name = document.getElementById('workplaceNameInput').value.trim() || wp.name;
        wp.position = document.getElementById('workplacePositionInput').value.trim() || wp.position;
        wp.zone = parseInt(document.getElementById('workplaceZoneInput').value) || 50;
        
        // Сбрасываем флаг СИЗ, так как должность могла измениться
        wp.hasPPE = false;
        
        closeWorkplaceModal();
        updateInfo();
        drawMap();
        saveMap();
        
        // Возвращаем кнопку в исходное состояние
        saveBtn.textContent = 'Добавить';
        delete saveBtn.dataset.editIndex;
        
        alert('✅ Рабочее место обновлено!');
    } else {
        // Режим добавления (оригинальная логика)
        originalSaveWorkplace();
    }
};

// Переопределяем closeWorkplaceModal для сброса состояния
const originalCloseWorkplace = window.closeWorkplaceModal;
window.closeWorkplaceModal = function() {
    originalCloseWorkplace();
    const saveBtn = document.getElementById('saveWorkplaceBtn');
    saveBtn.textContent = 'Добавить';
    delete saveBtn.dataset.editIndex;
};

// ============================================================
// ОСТАЛЬНЫЕ ФУНКЦИИ КАРТЫ
// ============================================================
function openWorkshopModal() {
    const ws = getCurrentWorkshop();
    if (!ws) { alert('Сначала создайте участок'); return; }
    const modal = document.getElementById('workshopModal');
    modal.classList.remove('hidden');
    document.getElementById('workshopNameInput').value = ws.name || '';
    document.getElementById('workshopLengthInput').value = ws.length || 30;
    document.getElementById('workshopWidthInput').value = ws.width || 20;
    document.getElementById('workshopNameInput').focus();
}

function closeWorkshopModal() {
    document.getElementById('workshopModal').classList.add('hidden');
}

function saveWorkshop() {
    const ws = getCurrentWorkshop();
    if (!ws) return;
    const name = document.getElementById('workshopNameInput').value.trim() || 'Участок';
    const length = parseInt(document.getElementById('workshopLengthInput').value) || 30;
    const width = parseInt(document.getElementById('workshopWidthInput').value) || 20;
    ws.name = name;
    ws.length = length;
    ws.width = width;
    closeWorkshopModal();
    updateWorkshopSelect();
    updateInfo();
    drawMap();
    saveMap();
}

function openWorkplaceModal(x, y) {
    tempWorkplacePos = { x, y };
    const modal = document.getElementById('workplaceModal');
    modal.classList.remove('hidden');
    document.getElementById('workplaceNameInput').value = '';
    document.getElementById('workplacePositionInput').value = '';
    document.getElementById('workplaceZoneInput').value = 50;
    document.getElementById('workplaceNameInput').focus();
}

function addNewWorkshop() {
    const name = prompt('Введите название нового участка:', 'Участок ' + (mapData.workshops.length + 1));
    if (!name) return;
    mapData.workshops.push({
        id: Date.now(),
        name: name,
        length: 30,
        width: 20,
        x: 50, 
        y: 50, 
        w: 2900, 
        h: 1400,
        workplaces: []
    });
    mapData.currentWorkshop = mapData.workshops.length - 1;
    if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
    updateWorkshopSelect();
    updateInfo();
    drawMap();
    saveMap();
}

function deleteWorkshop() {
    if (mapData.workshops.length <= 1) {
        alert('Нельзя удалить единственный участок');
        return;
    }
    if (!confirm('Удалить текущий участок со всеми данными?')) return;
    mapData.workshops.splice(mapData.currentWorkshop, 1);
    if (mapData.currentWorkshop >= mapData.workshops.length) {
        mapData.currentWorkshop = mapData.workshops.length - 1;
    }
    updateWorkshopSelect();
    updateInfo();
    drawMap();
    saveMap();
}

function saveMap() {
    localStorage.setItem('mapData', JSON.stringify(mapData));
}

function clearMap() {
    if (!confirm('Очистить текущий участок?')) return;
    const ws = getCurrentWorkshop();
    if (ws) {
        ws.workplaces = [];
        mapData.evacuationPoints = [];
        updateInfo();
        drawMap();
        saveMap();
    }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mainPage').style.display = 'block';
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === 'Главная') link.classList.add('active');
    });
});
