// ============================================================
// ПАРСЕР ПРИКАЗА 767н (СИЗ)
// ============================================================

let ppeDatabase = {};
let ppeLoaded = false;

function loadPPEFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const content = event.target.result;
                const parsed = parsePPEContent(content);
                
                if (Object.keys(parsed).length === 0) {
                    reject(new Error('Не удалось распарсить файл. Проверьте формат.'));
                    return;
                }
                
                localStorage.setItem('ppeDatabase', JSON.stringify(parsed));
                ppeDatabase = parsed;
                ppeLoaded = true;
                
                resolve(parsed);
            } catch (err) {
                reject(err);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Ошибка чтения файла'));
        };
        
        reader.readAsText(file, 'UTF-8');
    });
}

function parsePPEContent(content) {
    const lines = content.split(/\r?\n/);
    const database = {};
    
    let startParsing = false;
    let currentProfession = '';
    let currentPPEs = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        if (line.includes('Профессия') || line.includes('Должность')) {
            startParsing = true;
            continue;
        }
        
        if (!startParsing) continue;
        
        const isProfession = /[а-яА-ЯёЁ]/.test(line) && 
                           line.length > 3 && line.length < 80 &&
                           !line.includes('|') && 
                           !line.includes('СИЗ') &&
                           !line.includes('Норма');
        
        const isPPELine = line.includes('|') || 
                         line.includes('СИЗ') || 
                         line.includes('костюм') || 
                         line.includes('перчатки') || 
                         line.includes('очки') ||
                         line.includes('респиратор') ||
                         line.includes('каска') ||
                         line.includes('обувь');
        
        if (isProfession && !isPPELine) {
            if (currentProfession && currentPPEs.length > 0) {
                database[currentProfession] = {
                    профессия: currentProfession,
                    сиз: [...currentPPEs]
                };
            }
            currentProfession = line;
            currentPPEs = [];
        } else if (isPPELine && currentProfession) {
            const ppe = parsePPELine(line);
            if (ppe) {
                currentPPEs.push(ppe);
            }
        }
    }
    
    if (currentProfession && currentPPEs.length > 0) {
        database[currentProfession] = {
            профессия: currentProfession,
            сиз: [...currentPPEs]
        };
    }
    
    if (Object.keys(database).length === 0) {
        return parsePPEAlternative(lines);
    }
    
    return database;
}

function parsePPEAlternative(lines) {
    const database = {};
    let currentProfession = '';
    let currentPPEs = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        const professionKeywords = ['инженер', 'техник', 'механик', 'мастер', 'бригадир', 
                                   'специалист', 'токарь', 'фрезеровщик', 'слесарь', 
                                   'электрик', 'сварщик', 'водитель', 'грузчик', 
                                   'кладовщик', 'уборщик', 'охранник', 'оператор',
                                   'машинист', 'крановщик', 'стропальщик', 'диспетчер',
                                   'начальник', 'заведующий', 'главный', 'ведущий'];
        
        const isProfession = professionKeywords.some(keyword => 
            line.toLowerCase().includes(keyword)
        ) && line.length < 60;
        
        if (isProfession) {
            if (currentProfession && currentPPEs.length > 0) {
                database[currentProfession] = {
                    профессия: currentProfession,
                    сиз: [...currentPPEs]
                };
            }
            currentProfession = line;
            currentPPEs = [];
        } else if (currentProfession && line.length > 10) {
            const ppe = extractPPEFromText(line);
            if (ppe) {
                currentPPEs.push(ppe);
            }
        }
    }
    
    if (currentProfession && currentPPEs.length > 0) {
        database[currentProfession] = {
            профессия: currentProfession,
            сиз: [...currentPPEs]
        };
    }
    
    return database;
}

function parsePPELine(line) {
    line = line.replace(/\s+/g, ' ').trim();
    const parts = line.split(/[|\t]/).map(s => s.trim()).filter(s => s.length > 0);
    
    if (parts.length >= 2) {
        const type = parts[0] || 'СИЗ';
        const name = parts[1] || '';
        const norm = parts[2] || 'до износа';
        return `${type}|${name}|${norm}`;
    }
    
    return extractPPEFromText(line);
}

function extractPPEFromText(text) {
    const ppeTypes = ['СИЗОД', 'СИЗ рук', 'СИЗ ног', 'СИЗ глаз', 'СИЗ головы', 
                     'СИЗ слуха', 'СИЗ дыхания', 'СИЗ падения'];
    
    let type = 'СИЗ';
    let name = text;
    let norm = 'до износа';
    
    for (const t of ppeTypes) {
        if (text.includes(t)) {
            type = t;
            name = text.replace(t, '').trim();
            break;
        }
    }
    
    const normMatch = text.match(/(\d+)\s*(мес|месяц|месяца|месяцев)/i);
    if (normMatch) {
        norm = normMatch[0];
        name = name.replace(normMatch[0], '').trim();
    }
    
    if (name.length < 3) return null;
    
    return `${type}|${name}|${norm}`;
}

function loadPPEFromStorage() {
    const saved = localStorage.getItem('ppeDatabase');
    if (saved) {
        try {
            ppeDatabase = JSON.parse(saved);
            ppeLoaded = true;
            return ppeDatabase;
        } catch(e) {
            console.error('Ошибка загрузки базы СИЗ:', e);
        }
    }
    return null;
}

function isPPELoaded() {
    return ppeLoaded && Object.keys(ppeDatabase).length > 0;
}

function getPPEByProfession(profession) {
    if (!profession) return null;
    
    if (!ppeLoaded) {
        loadPPEFromStorage();
    }
    
    if (!ppeLoaded || Object.keys(ppeDatabase).length === 0) {
        console.warn('⚠️ База СИЗ не загружена');
        return null;
    }
    
    const trimmed = profession.trim().toLowerCase();
    
    for (const [key, value] of Object.entries(ppeDatabase)) {
        if (key.toLowerCase() === trimmed) {
            return value;
        }
    }
    
    for (const [key, value] of Object.entries(ppeDatabase)) {
        const keyLower = key.toLowerCase();
        if (trimmed.includes(keyLower) || keyLower.includes(trimmed)) {
            return value;
        }
    }
    
    const words = trimmed.split(/\s+/);
    for (const [key, value] of Object.entries(ppeDatabase)) {
        const keyLower = key.toLowerCase();
        let matchCount = 0;
        for (const word of words) {
            if (word.length > 3 && keyLower.includes(word)) {
                matchCount++;
            }
        }
        if (matchCount >= 2) {
            return value;
        }
    }
    
    return null;
}

window.loadPPEFromFile = loadPPEFromFile;
window.loadPPEFromStorage = loadPPEFromStorage;
window.isPPELoaded = isPPELoaded;
window.getPPEByProfession = getPPEByProfession;
window.ppeDatabase = ppeDatabase;

console.log('✅ parser-ppe.js загружен');
