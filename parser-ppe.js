// ============================================================
// СУПЕР-ПАРСЕР ПРИКАЗА 767н (СИЗ)
// Версия 2.0 - работает с любыми форматами
// ============================================================

let ppeDatabase = {};
let ppeLoaded = false;

// ============================================================
// ГЛАВНАЯ ФУНКЦИЯ ЗАГРУЗКИ
// ============================================================

function loadPPEFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const content = event.target.result;
                console.log('📄 Файл загружен, размер:', content.length, 'символов');
                console.log('📄 Первые 300 символов:', content.substring(0, 300));
                
                // Очищаем от мусора
                const cleaned = cleanContent(content);
                console.log('🧹 После очистки:', cleaned.length, 'символов');
                
                // Парсим
                const parsed = parsePPEUniversal(cleaned);
                const count = Object.keys(parsed).length;
                
                console.log(`📊 Распаршено профессий: ${count}`);
                
                if (count === 0) {
                    reject(new Error('❌ Не найдено ни одной профессии. Проверьте файл.'));
                    return;
                }
                
                // Сохраняем
                localStorage.setItem('ppeDatabase', JSON.stringify(parsed));
                ppeDatabase = parsed;
                ppeLoaded = true;
                
                // Выводим пример
                const firstKey = Object.keys(parsed)[0];
                console.log('✅ Пример:', firstKey, '→', parsed[firstKey].сиз.length, 'СИЗ');
                
                resolve(parsed);
                
            } catch (err) {
                console.error('❌ Ошибка:', err);
                reject(err);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Ошибка чтения файла'));
        };
        
        reader.readAsText(file, 'UTF-8');
    });
}

// ============================================================
// ОЧИСТКА ОТ МУСОРА
// ============================================================

function cleanContent(content) {
    const lines = content.split(/\r?\n/);
    const cleaned = [];
    let skipNext = false;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // Пропускаем пустые
        if (!line) continue;
        
        // Удаляем колонтитулы
        if (line.match(/приказ|минтруда|страница|№\s*\d+|утвержден|приложение|министерство|регистрация/i)) {
            continue;
        }
        
        // Удаляем номера страниц
        if (line.match(/^\s*\d+\s*$/) || line.match(/страница\s*\d+/i)) {
            continue;
        }
        
        // Удаляем линии
        if (line.match(/^[\s\-_=\*]{10,}$/)) {
            continue;
        }
        
        // Удаляем строки с "Таблица", "Приложение"
        if (line.match(/^таблица|^приложение/i)) {
            continue;
        }
        
        // Очищаем от лишних пробелов
        line = line.replace(/\s+/g, ' ').trim();
        
        // Удаляем номера в начале (1. 2. 3. и т.д.)
        line = line.replace(/^\d+\s*[\.\)]\s*/, '');
        
        if (line.length > 1) {
            cleaned.push(line);
        }
    }
    
    console.log(`🧹 Удалено ${lines.length - cleaned.length} строк мусора`);
    return cleaned.join('\n');
}

// ============================================================
// УНИВЕРСАЛЬНЫЙ ПАРСЕР
// ============================================================

function parsePPEUniversal(content) {
    const lines = content.split(/\r?\n/);
    const database = {};
    
    let currentProfession = '';
    let currentPPEs = [];
    let foundAny = false;
    
    // Расширенный список профессий
    const professionKeywords = [
        'инженер', 'техник', 'механик', 'мастер', 'бригадир',
        'специалист', 'токарь', 'фрезеровщик', 'слесарь',
        'электрик', 'сварщик', 'водитель', 'грузчик',
        'кладовщик', 'уборщик', 'охранник', 'оператор',
        'машинист', 'крановщик', 'стропальщик', 'диспетчер',
        'начальник', 'заведующий', 'главный', 'ведущий',
        'помощник', 'заместитель', 'медсестра', 'фельдшер',
        'лаборант', 'аппаратчик', 'наладчик', 'ремонтник',
        'электромонтер', 'сантехник', 'плотник', 'бетонщик',
        'арматурщик', 'монтажник', 'отделочник', 'маляр',
        'штукатур', 'плиточник', 'стекольщик', 'кровельщик',
        'работник', 'рабочий', 'укладчик', 'сборщик',
        'настройщик', 'контролер', 'комплектовщик', 'упаковщик'
    ];
    
    // Расширенный список СИЗ
    const ppeKeywords = [
        'костюм', 'перчатки', 'очки', 'респиратор', 'каска',
        'обувь', 'сиз', 'щетки', 'наушники', 'беруши',
        'маска', 'щиток', 'пояс', 'страховка', 'канат',
        'фартук', 'рукавицы', 'сапоги', 'ботинки', 'галоши',
        'куртка', 'брюки', 'плащ', 'накидка', 'жилет',
        'шлем', 'каска', 'очки', 'щиток', 'маска'
    ];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        // Проверяем на профессию
        const hasProfessionKeyword = professionKeywords.some(kw => 
            line.toLowerCase().includes(kw)
        );
        
        // Проверяем на СИЗ
        const hasPPEKeyword = ppeKeywords.some(kw => 
            line.toLowerCase().includes(kw)
        );
        
        // Проверка, что строка - это профессия
        const isProfession = (hasProfessionKeyword || line.length < 60) && 
                            !hasPPEKeyword &&
                            !line.match(/^\d+$/) &&
                            !line.match(/^[а-яА-Я]{1,2}$/);
        
        // Проверка, что строка - это СИЗ
        const isPPE = (hasPPEKeyword || line.includes('|') || line.includes('\t')) &&
                      line.length > 3;
        
        if (isProfession && currentProfession) {
            // Сохраняем предыдущую профессию
            if (currentProfession && currentPPEs.length > 0) {
                database[currentProfession] = {
                    профессия: currentProfession,
                    сиз: [...currentPPEs]
                };
                foundAny = true;
                console.log(`✅ ${currentProfession}: ${currentPPEs.length} СИЗ`);
            }
            currentProfession = line;
            currentPPEs = [];
            console.log(`🔍 Профессия: ${line}`);
        } 
        else if (isPPE && currentProfession) {
            const ppe = parsePPELineUniversal(line);
            if (ppe && !currentPPEs.includes(ppe)) {
                currentPPEs.push(ppe);
            }
        }
        // Если строка длинная и есть профессия - пробуем извлечь СИЗ
        else if (currentProfession && line.length > 10 && !isProfession) {
            const ppe = extractPPEFromTextUniversal(line);
            if (ppe && !currentPPEs.includes(ppe)) {
                currentPPEs.push(ppe);
            }
        }
    }
    
    // Сохраняем последнюю профессию
    if (currentProfession && currentPPEs.length > 0) {
        database[currentProfession] = {
            профессия: currentProfession,
            сиз: [...currentPPEs]
        };
        foundAny = true;
        console.log(`✅ ${currentProfession}: ${currentPPEs.length} СИЗ`);
    }
    
    console.log(`📊 ИТОГО: ${Object.keys(database).length} профессий`);
    return database;
}

// ============================================================
// ПАРСИНГ СТРОКИ С СИЗ (УНИВЕРСАЛЬНЫЙ)
// ============================================================

function parsePPELineUniversal(line) {
    // Удаляем мусор в начале
    line = line.replace(/^[\d\s\-\.\(\)]+/, '').trim();
    
    // Пробуем разделить по |
    let parts = line.split('|').map(s => s.trim()).filter(s => s.length > 0);
    
    // Если нет | - пробуем по табуляции
    if (parts.length < 2) {
        parts = line.split('\t').map(s => s.trim()).filter(s => s.length > 0);
    }
    
    // Если нет - пробуем по 3+ пробелам
    if (parts.length < 2) {
        parts = line.split(/\s{3,}/).map(s => s.trim()).filter(s => s.length > 0);
    }
    
    if (parts.length >= 2) {
        // Определяем тип
        let type = 'СИЗ';
        let name = parts[0];
        let norm = parts.length > 2 ? parts[2] : 'до износа';
        
        // Проверяем, может первый элемент - это тип?
        const typeKeywords = ['СИЗОД', 'СИЗ рук', 'СИЗ ног', 'СИЗ глаз', 'СИЗ головы', 
                             'СИЗ слуха', 'СИЗ дыхания', 'СИЗ падения', 'СИЗ лица',
                             'одежда', 'обувь', 'перчатки', 'каска'];
        
        if (typeKeywords.some(kw => parts[0].toLowerCase().includes(kw.toLowerCase()))) {
            type = parts[0];
            name = parts[1] || '';
            norm = parts.length > 2 ? parts[2] : 'до износа';
        }
        
        if (name.length > 2) {
            return `${type}|${name}|${norm}`;
        }
    }
    
    return extractPPEFromTextUniversal(line);
}

// ============================================================
// ИЗВЛЕЧЕНИЕ СИЗ ИЗ ТЕКСТА
// ============================================================

function extractPPEFromTextUniversal(text) {
    // Удаляем номера в начале
    text = text.replace(/^[\d\s\-\.]+/, '').trim();
    
    if (text.length < 3) return null;
    
    // Ищем тип
    const typeKeywords = ['СИЗОД', 'СИЗ рук', 'СИЗ ног', 'СИЗ глаз', 'СИЗ головы', 
                         'СИЗ слуха', 'СИЗ дыхания', 'СИЗ падения', 'СИЗ лица'];
    
    let type = 'СИЗ';
    let name = text;
    let norm = 'до износа';
    
    // Пробуем найти тип
    for (const t of typeKeywords) {
        if (text.toLowerCase().includes(t.toLowerCase())) {
            type = t;
            name = text.replace(new RegExp(t, 'i'), '').trim();
            break;
        }
    }
    
    // Ищем срок носки
    const normMatch = text.match(/(\d+)\s*(мес|месяц|месяца|месяцев|год|года|лет|шт|пара)/i);
    if (normMatch) {
        norm = normMatch[0];
        name = name.replace(normMatch[0], '').trim();
    }
    
    // Ищем название СИЗ по ключевым словам
    const ppeNames = ['костюм', 'перчатки', 'очки', 'респиратор', 'каска',
                     'обувь', 'щетки', 'наушники', 'беруши', 'маска', 'щиток',
                     'пояс', 'фартук', 'рукавицы', 'сапоги', 'ботинки', 'галоши',
                     'куртка', 'брюки', 'плащ', 'накидка', 'жилет', 'шлем'];
    
    let foundName = '';
    for (const ppe of ppeNames) {
        if (name.toLowerCase().includes(ppe)) {
            // Берем часть строки от найденного слова
            const index = name.toLowerCase().indexOf(ppe);
            foundName = name.substring(index).trim();
            // Обрезаем до 50 символов
            if (foundName.length > 50) {
                foundName = foundName.substring(0, 50);
            }
            break;
        }
    }
    
    if (foundName) {
        name = foundName;
    }
    
    if (name.length < 2) return null;
    
    return `${type}|${name}|${norm}`;
}

// ============================================================
// ЗАГРУЗКА ИЗ STORAGE
// ============================================================

function loadPPEFromStorage() {
    const saved = localStorage.getItem('ppeDatabase');
    if (saved) {
        try {
            ppeDatabase = JSON.parse(saved);
            ppeLoaded = true;
            console.log(`✅ Загружено из localStorage: ${Object.keys(ppeDatabase).length} профессий`);
            return ppeDatabase;
        } catch(e) {
            console.error('❌ Ошибка загрузки:', e);
        }
    }
    return null;
}

function isPPELoaded() {
    return ppeLoaded && Object.keys(ppeDatabase).length > 0;
}

// ============================================================
// ПОИСК СИЗ ПО ПРОФЕССИИ
// ============================================================

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
    console.log(`🔍 Ищем СИЗ для: "${trimmed}"`);
    
    // 1. Точное совпадение
    for (const [key, value] of Object.entries(ppeDatabase)) {
        if (key.toLowerCase() === trimmed) {
            console.log(`✅ Точное совпадение: "${key}"`);
            return value;
        }
    }
    
    // 2. Частичное совпадение
    for (const [key, value] of Object.entries(ppeDatabase)) {
        const keyLower = key.toLowerCase();
        if (trimmed.includes(keyLower) || keyLower.includes(trimmed)) {
            console.log(`✅ Частичное совпадение: "${key}"`);
            return value;
        }
    }
    
    // 3. По словам
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
            console.log(`✅ По словам: "${key}"`);
            return value;
        }
    }
    
    console.log(`❌ СИЗ не найдены`);
    return null;
}

// ============================================================
// ОТЛАДКА
// ============================================================

function debugPPE() {
    console.log('=== ДЕБАГ БАЗЫ СИЗ ===');
    console.log('Загружена:', ppeLoaded);
    console.log('Количество профессий:', Object.keys(ppeDatabase).length);
    const keys = Object.keys(ppeDatabase);
    console.log('Первые 5 профессий:', keys.slice(0, 5));
    if (keys.length > 0) {
        console.log('Пример данных:', ppeDatabase[keys[0]]);
    }
    console.log('=======================');
}

function testPPE(profession) {
    console.log(`🔍 ТЕСТ: "${profession}"`);
    const result = getPPEByProfession(profession);
    if (result) {
        console.log('✅ Найдено:', result);
    } else {
        console.log('❌ Не найдено');
    }
}

// ============================================================
// ЭКСПОРТ
// ============================================================

window.loadPPEFromFile = loadPPEFromFile;
window.loadPPEFromStorage = loadPPEFromStorage;
window.isPPELoaded = isPPELoaded;
window.getPPEByProfession = getPPEByProfession;
window.ppeDatabase = ppeDatabase;
window.debugPPE = debugPPE;
window.testPPE = testPPE;

console.log('✅ Супер-парсер загружен!');
console.log('📖 Используй debugPPE() для отладки');
console.log('🔍 Используй testPPE("Токарь") для теста');
