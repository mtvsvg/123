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
// ПРОГРАММЫ (быстрый выбор)
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
        <button class="btn-copy" onclick="copyEmployee(this)">📋</button>
        <button class="btn-remove" onclick="this.closest('.employee-card').remove()">✖</button>
    `;
    container.appendChild(div);
}

// ===== КОПИРОВАНИЕ СОТРУДНИКА =====
function copyEmployee(btn) {
    const card = btn.closest('.employee-card');
    const data = {
        last_name: card.querySelector('.emp-last').value,
        first_name: card.querySelector('.emp-first').value,
        middle_name: card.querySelector('.emp-middle').value,
        position: card.querySelector('.emp-position').value,
        snils: card.querySelector('.emp-snils').value,
        is_passed: card.querySelector('.emp-passed').checked
    };
    addEmployee(data);
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
// 🎤 ГОЛОСОВОЙ ВВОД (Web Speech API)
// ============================================================
document.getElementById('voiceBtn').addEventListener('click', function() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Голосовой ввод не поддерживается в этом браузере. Используйте Chrome или Edge.');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Показываем статус
    const btn = this;
    const originalText = btn.textContent;
    btn.textContent = '🎤 Слушаю...';
    btn.style.background = 'rgba(255,50,50,0.2)';
    btn.style.borderColor = 'rgba(255,50,50,0.3)';
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        console.log('Распознано:', transcript);
        
        // Парсим текст
        const employee = parseVoiceText(transcript);
        if (employee) {
            addEmployee(employee);
            alert('✅ Добавлен сотрудник: ' + employee.last_name + ' ' + employee.first_name);
        } else {
            alert('❌ Не удалось распознать данные. Формат: "Фамилия Имя Отчество, должность, СНИЛС, сдал/не сдал"');
        }
    };
    
    recognition.onerror = function(event) {
        alert('Ошибка распознавания: ' + event.error);
    };
    
    recognition.onend = function() {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.borderColor = '';
    };
    
    recognition.start();
});

function parseVoiceText(text) {
    // Очищаем текст
    text = text.replace(/[.,;:!?]/g, '');
    const parts = text.split(',').map(s => s.trim());
    
    if (parts.length < 2) {
        // Пробуем парсить через запятые
        const words = text.split(/\s+/);
        // Ищем СНИЛС
        const snilsMatch = text.match(/\d{3}-\d{3}-\d{3}\s?\d{2}/);
        const snils = snilsMatch ? snilsMatch[0] : '';
        
        // Ищем "сдал" или "не сдал"
        const passed = text.includes('не сдал') ? false : text.includes('сдал') ? true : true;
        
        // Ищем должность (обычно после ФИО)
        let position = '';
        let nameParts = [];
        let remaining = text;
        
        if (snils) {
            remaining = remaining.replace(snils, '').trim();
        }
        // Убираем "сдал"/"не сдал"
        remaining = remaining.replace(/сдал|не сдал/g, '').trim();
        
        // Пытаемся выделить должность (то, что после ФИО)
        const words2 = remaining.split(/\s+/);
        if (words2.length >= 3) {
            // Первые 3 слова — ФИО, остальное — должность
            nameParts = words2.slice(0, 3);
            position = words2.slice(3).join(' ');
        } else {
            nameParts = words2;
        }
        
        if (nameParts.length < 2) return null;
        
        return {
            last_name: nameParts[0] || '',
            first_name: nameParts[1] || '',
            middle_name: nameParts[2] || '',
            position: position || '',
            snils: snils || '',
            is_passed: passed
        };
    }
    
    // Если есть запятые — парсим по ним
    let namePart = parts[0].trim();
    const position = parts[1]?.trim() || '';
    const snils = parts[2]?.trim() || '';
    const passed = parts[3]?.trim()?.includes('не сдал') ? false : true;
    
    // Парсим ФИО
    const nameWords = namePart.split(/\s+/);
    if (nameWords.length < 2) return null;
    
    return {
        last_name: nameWords[0] || '',
        first_name: nameWords[1] || '',
        middle_name: nameWords[2] || '',
        position: position || '',
        snils: snils || '',
        is_passed: passed
    };
}

// ============================================================
// 📎 РАСПОЗНАВАНИЕ ФОТО (Tesseract.js)
// ============================================================
document.getElementById('photoBtn').addEventListener('click', function() {
    // Создаем скрытый input для выбора файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = async function(e) {
        if (!e.target.files.length) {
            document.body.removeChild(input);
            return;
        }
        
        const file = e.target.files[0];
        const btn = document.getElementById('photoBtn');
        const originalText = btn.textContent;
        btn.textContent = '⏳ Распознаю...';
        btn.style.background = 'rgba(255,200,0,0.2)';
        btn.style.borderColor = 'rgba(255,200,0,0.3)';
        
        try {
            // Используем Tesseract.js
            const result = await Tesseract.recognize(file, 'rus', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log('Прогресс:', m.progress);
                    }
                }
            });
            
            const text = result.data.text;
            console.log('Распознанный текст:', text);
            
            // Парсим текст
            const parsed = parsePhotoText(text);
            if (parsed) {
                // Заполняем поля
                if (parsed.protocol_number) {
                    document.getElementById('protocolNumber').value = parsed.protocol_number;
                }
                if (parsed.date) {
                    document.getElementById('protocolDate').value = parsed.date;
                }
                if (parsed.org_inn) {
                    // Проверяем, есть ли такая организация
                    const orgs = getOrgs();
                    let org = orgs.find(o => o.inn === parsed.org_inn);
                    if (!org && parsed.org_title) {
                        org = {
                            id: Date.now(),
                            name: parsed.org_title,
                            inn: parsed.org_inn
                        };
                        orgs.push(org);
                        saveOrgs(orgs);
                        renderOrgs();
                    }
                    if (org) {
                        document.getElementById('orgSelect').value = org.id;
                        selectOrg(org.id);
                    }
                }
                // Добавляем сотрудников
                if (parsed.employees && parsed.employees.length > 0) {
                    document.getElementById('employeesContainer').innerHTML = '';
                    parsed.employees.forEach(emp => {
                        addEmployee(emp);
                    });
                }
                alert('✅ Данные из фото загружены! Проверьте и отредактируйте при необходимости.');
            } else {
                alert('❌ Не удалось распознать данные на фото. Проверьте качество снимка.');
            }
        } catch (error) {
            console.error('Ошибка распознавания:', error);
            alert('Ошибка распознавания. Попробуйте другое фото.');
        }
        
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.borderColor = '';
        document.body.removeChild(input);
    };
    
    input.click();
});

function parsePhotoText(text) {
    const result = {
        protocol_number: '',
        date: '',
        org_inn: '',
        org_title: '',
        employees: []
    };
    
    // Ищем номер протокола (цифры с /)
    const protocolMatch = text.match(/\d{1,2}\s*\/\s*\d{2,4}/);
    if (protocolMatch) {
        result.protocol_number = protocolMatch[0].replace(/\s/g, '');
    }
    
    // Ищем дату (дд.мм.гггг или гггг-мм-дд)
    const dateMatch = text.match(/\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
        let d = dateMatch[0];
        if (d.includes('.')) {
            const parts = d.split('.');
            result.date = parts[2] + '-' + parts[1] + '-' + parts[0];
        } else {
            result.date = d;
        }
    }
    
    // Ищем ИНН (10 или 12 цифр)
    const innMatch = text.match(/\b\d{10}\b|\b\d{12}\b/);
    if (innMatch) {
        result.org_inn = innMatch[0
