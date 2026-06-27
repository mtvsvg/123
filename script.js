Ты прав! Исправляю все 4 пункта. Вот полный код:

---

## 📁 ПОЛНЫЙ РАБОЧИЙ КОД (3 ФАЙЛА)

---

### 1. `index.html`

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Охрана труда — Цифровой помощник</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- ============================================================ -->
<!-- ГЛАВНАЯ СТРАНИЦА -->
<!-- ============================================================ -->
<div id="mainPage">
    <header class="header">
        <div class="container header-inner">
            <div class="logo">
                <span class="logo-icon">🛡️</span>
                <span class="logo-text">ОхранаТруда<span class="logo-dot">.</span>Про</span>
            </div>
            <nav class="nav">
                <a href="#" class="nav-link active" onclick="showPage('main')">Главная</a>
                <a href="#" class="nav-link" onclick="showPage('training')">Обучение</a>
                <a href="#" class="nav-link" onclick="showPage('map')">Карта</a>
                <a href="#" class="nav-link" onclick="showPage('risks')">Оценка рисков</a>
                <a href="#" class="nav-link" onclick="showPage('analytics')">Аналитика</a>
            </nav>
            <button class="btn-login" onclick="alert('Вход в разработке')">Войти</button>
        </div>
    </header>

    <section class="hero">
        <div class="container hero-inner">
            <div class="hero-content">
                <div class="hero-badge">🚀 Новая версия 2.0</div>
                <h1 class="hero-title">Умная охрана<br>труда для <span class="highlight">современных</span> компаний</h1>
                <p class="hero-desc">Автоматизируйте обучение, оценивайте риски и создавайте протоколы в несколько кликов.</p>
                <div class="hero-buttons">
                    <button class="btn-primary btn-hero" onclick="showPage('training')">Начать работу →</button>
                    <button class="btn-secondary btn-hero" onclick="alert('Подробнее в разработке')">Узнать больше</button>
                </div>
                <div class="hero-stats">
                    <div class="stat-item"><span class="stat-number">500+</span><span class="stat-label">сотрудников</span></div>
                    <div class="stat-item"><span class="stat-number">120+</span><span class="stat-label">протоколов</span></div>
                    <div class="stat-item"><span class="stat-number">98%</span><span class="stat-label">экономия времени</span></div>
                </div>
            </div>
            <div class="hero-image">
                <div class="hero-img-wrapper">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 350'%3E%3Crect width='400' height='350' fill='%231a1a3e'/%3E%3Ccircle cx='200' cy='150' r='80' fill='%237c3aed' opacity='0.2'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%237c3aed' opacity='0.4'/%3E%3Crect x='140' y='230' width='120' height='10' rx='5' fill='%237c3aed' opacity='0.3'/%3E%3Crect x='150' y='250' width='100' height='10' rx='5' fill='%237c3aed' opacity='0.2'/%3E%3Ctext x='200' y='135' text-anchor='middle' font-size='60' fill='%2300d4ff' opacity='0.9'%3E🛡️%3C/text%3E%3Ctext x='200' y='200' text-anchor='middle' font-size='16' fill='%238888aa'%3EЦифровая охрана труда%3C/text%3E%3C/svg%3E" alt="Охрана труда" class="hero-img">
                </div>
            </div>
        </div>
    </section>

    <section class="features">
        <div class="container">
            <div class="section-label">Преимущества</div>
            <h2 class="section-title">Почему выбирают <span class="highlight">нас</span></h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">📋</div>
                    <h3>Генерация протоколов</h3>
                    <p>Загрузите штатное расписание, выберите сотрудников и создайте протокол за минуту.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📝</div>
                    <h3>Листы ознакомления</h3>
                    <p>Автоматически формируйте листы ознакомления с инструкциями, СОУТ и профрисками.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🗺️</div>
                    <h3>Карта цеха</h3>
                    <p>Визуализируйте рабочие места, расставляйте сотрудников и оценивайте риски.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔄</div>
                    <h3>Автоматизация</h3>
                    <p>Система сама напомнит о сроках обучения и обновит данные по сотрудникам.</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container footer-inner">
            <div>
                <div class="logo"><span class="logo-icon">🛡️</span><span class="logo-text">ОхранаТруда<span class="logo-dot">.</span>Про</span></div>
                <p class="footer-desc">Цифровой помощник специалиста по охране труда</p>
            </div>
            <div class="footer-links">
                <a href="#" onclick="showPage('main')">Главная</a>
                <a href="#" onclick="showPage('training')">Обучение</a>
                <a href="#" onclick="showPage('map')">Карта</a>
                <a href="#" onclick="showPage('risks')">Оценка рисков</a>
                <a href="#" onclick="showPage('analytics')">Аналитика</a>
            </div>
            <div class="footer-copy"><p>© 2026 ОхранаТруда.Про</p></div>
        </div>
    </footer>
</div>

<!-- ============================================================ -->
<!-- СТРАНИЦА "ОБУЧЕНИЕ" -->
<!-- ============================================================ -->
<div id="trainingPage" class="page hidden">
    <div class="container">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h1 style="font-size:28px;font-weight:700;background:linear-gradient(135deg,#00d4ff,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">📄 Генератор протоколов</h1>
            <button class="btn-secondary" onclick="showPage('main')">← На главную</button>
        </div>

        <div class="block">
            <div class="block-header">
                <h2>🏢 Организация</h2>
                <button class="btn-add" id="showOrgFormBtn">➕ Добавить</button>
            </div>
            <div id="orgForm" class="org-form hidden">
                <input type="text" id="orgNameInput" placeholder="Название организации">
                <input type="text" id="orgInnInput" placeholder="ИНН">
                <button class="btn-save" id="saveOrgBtn">Сохранить</button>
                <button class="btn-cancel" id="cancelOrgBtn">Отмена</button>
            </div>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                <select id="orgSelect" class="org-select" style="flex:1;min-width:200px;">
                    <option value="">-- Выберите организацию --</option>
                </select>
                <button class="btn-delete" id="deleteOrgBtn" title="Удалить">🗑</button>
            </div>
        </div>

        <div class="tab">
            <button class="active" onclick="showTab('staff')">📋 Штатное расписание</button>
            <button onclick="showTab('protocol')">📝 Протокол</button>
            <button onclick="showTab('familiarization')">📋 Ознакомление</button>
        </div>

        <div id="tabStaff">
            <div class="block">
                <div class="block-header">
                    <h2>📋 Штатное расписание</h2>
                    <button class="btn-add" id="staffImportBtn">📤 Загрузить файл</button>
                </div>
                <p style="color:#8888aa;font-size:14px;margin-bottom:12px;">Загрузите файл со штатным расписанием. Выберите сотрудников для добавления в протокол.</p>
                <div id="staffContainer"><p style="color:#6a6a8a;text-align:center;padding:20px;">Нет загруженных сотрудников. Нажмите "Загрузить файл".</p></div>
                <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">
                    <button class="btn-primary" id="addSelectedBtn" style="width:auto;padding:10px 24px;">➕ Добавить выбранных в протокол</button>
                    <button class="btn-secondary" onclick="selectAllStaff()">✅ Выбрать всех</button>
                    <button class="btn-secondary" onclick="deselectAllStaff()">✖ Снять всех</button>
                    <button class="btn-secondary" onclick="clearStaff()">🗑 Очистить</button>
                </div>
            </div>
        </div>

        <div id="tabProtocol" class="hidden">
            <div class="block">
                <h2>📝 Протокол</h2>
                <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;">
                    <div class="form-group" style="flex:1;min-width:150px;margin-bottom:0;">
                        <label>Номер протокола</label>
                        <input type="text" id="protocolNumber" placeholder="01/26">
                    </div>
                    <div class="form-group" style="flex:1;min-width:150px;margin-bottom:0;">
                        <label>Дата</label>
                        <input type="date" id="protocolDate">
                    </div>
                </div>

                <h3 style="margin-top:12px;">📚 Программы обучения</h3>
                <div style="display:flex;flex-wrap:wrap;gap:12px;margin:8px 0 16px 0;">
                    <label class="program-check"><input type="checkbox" value="1" checked> 1. Оказание первой помощи</label>
                    <label class="program-check"><input type="checkbox" value="2"> 2. Использование СИЗ</label>
                    <label class="program-check"><input type="checkbox" value="3"> 3. Общие вопросы охраны труда</label>
                    <label class="program-check"><input type="checkbox" value="4"> 4. Безопасные методы и приемы работ</label>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
                    <button class="btn-add" onclick="selectAllPrograms()">✅ Все</button>
                    <button class="btn-add" onclick="selectPrograms([1,4])">📌 1+4</button>
                    <button class="btn-add" onclick="clearAllPrograms()">✖ Снять</button>
                </div>

                <div id="protocolContainer"><p style="color:#6a6a8a;text-align:center;padding:20px;">В протоколе пока нет сотрудников. Добавьте их из штатного расписания.</p></div>
                <button class="btn-generate" id="generateBtn" style="margin-top:16px;">⚡ Создать XML</button>
                <div id="resultBlock" class="result-block hidden">
                    <h3>✅ XML готов!</h3>
                    <a id="downloadLink" href="#" download>📥 Скачать XML</a>
                    <button class="btn-cancel" onclick="document.getElementById('resultBlock').classList.add('hidden')">✖ Закрыть</button>
                </div>
            </div>
        </div>

        <div id="tabFamiliarization" class="hidden">
            <div class="block">
                <h2>📋 Лист ознакомления</h2>
                <p style="color:#8888aa;font-size:14px;margin-bottom:12px;">Выберите сотрудника и сформируйте лист ознакомления.</p>
                <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;align-items:end;">
                    <div class="form-group" style="flex:2;min-width:200px;margin-bottom:0;">
                        <label>Выберите сотрудника:</label>
                        <select id="famEmployeeSelect" style="width:100%;"><option value="">-- Выберите сотрудника --</option></select>
                    </div>
                    <button class="btn-primary" id="generateFamBtn" style="width:auto;padding:10px 24px;">📄 Составить лист</button>
                </div>
                <div style="margin-top:12px;">
                    <h4 style="color:#ccc;margin-bottom:8px;">Документы для ознакомления:</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        <label class="doc-check"><input type="checkbox" value="Инструкция по охране труда" checked> 📄 Инструкция по охране труда</label>
                        <label class="doc-check"><input type="checkbox" value="СОУТ (Спецоценка условий труда)" checked> 📊 СОУТ</label>
                        <label class="doc-check"><input type="checkbox" value="Оценка профессиональных рисков" checked> ⚠️ Оценка профрисков</label>
                        <label class="doc-check"><input type="checkbox" value="Нормы выдачи СИЗ" checked> 🦺 Нормы выдачи СИЗ</label>
                        <label class="doc-check"><input type="checkbox" value="Правила внутреннего трудового распорядка" checked> 📋 ПВТР</label>
                        <label class="doc-check"><input type="checkbox" value="Инструкция по пожарной безопасности" checked> 🔥 Пожарная безопасность</label>
                        <label class="doc-check"><input type="checkbox" value="Инструкция по электробезопасности" checked> ⚡ Электробезопасность</label>
                    </div>
                </div>
                <div id="famResult" class="hidden" style="margin-top:16px;padding:16px;background:rgba(0,212,255,0.05);border-radius:12px;border:1px solid rgba(0,212,255,0.15);">
                    <h3 style="color:#00d4ff;margin-bottom:8px;">✅ Лист ознакомления сформирован</h3>
                    <div id="famContent" style="font-size:14px;line-height:1.6;color:#ccc;"></div>
                    <button class="btn-primary" id="printFamBtn" style="margin-top:12px;width:auto;padding:10px 24px;">🖨️ Печать / PDF</button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ============================================================ -->
<!-- СТРАНИЦА "КАРТА" -->
<!-- ============================================================ -->
<div id="mapPage" class="page hidden">
    <div class="container">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
            <h1 style="font-size:28px;font-weight:700;background:linear-gradient(135deg,#00d4ff,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">🗺️ Карта цеха</h1>
            <button class="btn-secondary" onclick="showPage('main')">← На главную</button>
        </div>

        <!-- Панель управления -->
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;padding:16px;background:rgba(255,255,255,0.03);border-radius:14px;border:1px solid rgba(255,255,255,0.06);">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <label style="color:#8888aa;font-size:13px;">Участок:</label>
                <select id="workshopSelect" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:6px 12px;color:#fff;font-size:14px;min-width:120px;"></select>
                <button class="btn-add" onclick="addNewWorkshop()">➕ Новый участок</button>
                <button class="btn-add" id="editWorkshopBtn">✏️ Редактировать</button>
                <button class="btn-add" onclick="deleteWorkshop()">🗑 Удалить участок</button>
            </div>
        </div>

        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;padding:16px;background:rgba(255,255,255,0.03);border-radius:14px;border:1px solid rgba(255,255,255,0.06);">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <button class="btn-add" id="addWorkerPlaceBtn">👤 Рабочее место</button>
                <button class="btn-add" id="addEvacuationBtn">🚪 Выход</button>
                <button class="btn-add" onclick="clearMap()">🗑 Очистить участок</button>
                <button class="btn-primary" id="saveMapBtn" style="width:auto;padding:8px 20px;">💾 Сохранить</button>
            </div>
        </div>

        <!-- Информация -->
        <div id="mapInfo" style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px 16px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.05);display:flex;gap:20px;flex-wrap:wrap;">
            <span style="color:#8888aa;font-size:13px;">📐 Участок: <strong id="workshopSize" style="color:#fff;">не задан</strong></span>
            <span style="color:#8888aa;font-size:13px;">👤 Рабочие места: <strong id="workerCount" style="color:#fff;">0</strong></span>
            <span style="color:#8888aa;font-size:13px;">🚪 Выходы: <strong id="evacuationCount" style="color:#4caf50;">0</strong></span>
            <span style="color:#8888aa;font-size:13px;">💡 Режим: <strong id="mapMode" style="color:#00d4ff;">Просмотр</strong></span>
        </div>

        <!-- Холст -->
        <div style="position:relative;background:rgba(255,255,255,0.02);border-radius:14px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">
            <canvas id="mapCanvas" width="900" height="600" style="width:100%;height:auto;display:block;cursor:crosshair;"></canvas>
        </div>

        <!-- Легенда -->
        <div style="display:flex;gap:20px;margin-top:12px;flex-wrap:wrap;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
            <span style="color:#8888aa;font-size:12px;">🟦 <span style="color:#4a9eff;">Участок</span></span>
            <span style="color:#8888aa;font-size:12px;">👤 <span style="color:#ff6b6b;">Рабочее место</span></span>
            <span style="color:#8888aa;font-size:12px;">⚠️ <span style="color:#ff8f00;">Зона рабочего места</span></span>
            <span style="color:#8888aa;font-size:12px;">🚪 <span style="color:#4caf50;">Выход</span></span>
            <span style="color:#8888aa;font-size:12px;">🔄 <span style="color:#8888aa;">Перетащите человечка</span></span>
            <span style="color:#8888aa;font-size:12px;">❌ <span style="color:#ff6b6b;">Двойной клик — удалить</span></span>
        </div>
    </div>
</div>

<!-- ============================================================ -->
<!-- МОДАЛЬНЫЕ ОКНА -->
<!-- ============================================================ -->

<!-- Модальное окно для редактирования участка -->
<div id="workshopModal" class="modal-overlay hidden">
    <div class="modal-content" style="max-width:400px;">
        <div class="modal-header">
            <h3>✏️ Редактирование участка</h3>
            <button class="modal-close" onclick="closeWorkshopModal()">✖</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Название участка</label>
                <input type="text" id="workshopNameInput" placeholder="Цех №1">
            </div>
            <div class="form-group">
                <label>Длина (м)</label>
                <input type="number" id="workshopLengthInput" placeholder="30" min="1" value="30">
            </div>
            <div class="form-group">
                <label>Ширина (м)</label>
                <input type="number" id="workshopWidthInput" placeholder="20" min="1" value="20">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-cancel" onclick="closeWorkshopModal()">Отмена</button>
            <button class="btn-primary" id="saveWorkshopBtn" style="width:auto;padding:10px 24px;">Сохранить</button>
        </div>
    </div>
</div>

<!-- Модальное окно для добавления рабочего места -->
<div id="workplaceModal" class="modal-overlay hidden">
    <div class="modal-content" style="max-width:400px;">
        <div class="modal-header">
            <h3>👤 Добавление рабочего места</h3>
            <button class="modal-close" onclick="closeWorkplaceModal()">✖</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Название рабочего места</label>
                <input type="text" id="workplaceNameInput" placeholder="Токарный станок №3">
            </div>
            <div class="form-group">
                <label>Должность сотрудника (опционально)</label>
                <input type="text" id="workplacePositionInput" placeholder="Токарь">
            </div>
            <div class="form-group">
                <label>Размер зоны (px)</label>
                <input type="number" id="workplaceZoneInput" value="40" min="10" max="100">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-cancel" onclick="closeWorkplaceModal()">Отмена</button>
            <button class="btn-primary" id="saveWorkplaceBtn" style="width:auto;padding:10px 24px;">Добавить</button>
        </div>
    </div>
</div>

<!-- ============================================================ -->
<!-- СТРАНИЦА "ОЦЕНКА РИСКОВ" -->
<!-- ============================================================ -->
<div id="risksPage" class="page hidden">
    <div class="container" style="text-align:center;padding:60px 20px;">
        <div style="font-size:80px;margin-bottom:20px;">🧠</div>
        <h2 style="font-size:28px;margin-bottom:12px;">Оценка профессиональных рисков</h2>
        <p style="color:#8888aa;font-size:18px;max-width:600px;margin:0 auto 24px;">В разработке</p>
        <button class="btn-secondary" onclick="showPage('main')">← На главную</button>
    </div>
</div>

<!-- ============================================================ -->
<!-- СТРАНИЦА "АНАЛИТИКА" -->
<!-- ============================================================ -->
<div id="analyticsPage" class="page hidden">
    <div class="container" style="text-align:center;padding:60px 20px;">
        <div style="font-size:80px;margin-bottom:20px;">📊</div>
        <h2 style="font-size:28px;margin-bottom:12px;">Аналитика</h2>
        <p style="color:#8888aa;font-size:18px;max-width:600px;margin:0 auto 24px;">В разработке</p>
        <button class="btn-secondary" onclick="showPage('main')">← На главную</button>
    </div>
</div>

<script src="script.js"></script>
</body>
</html>
```

---

### 2. `style.css`

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #0a0a1a; color: #e0e0e0; min-height: 100vh; }
#mainPage { background: linear-gradient(145deg, #0a0a1a 0%, #12122a 50%, #0a0a1a 100%); min-height: 100vh; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

.header { padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05); position: sticky; top: 0; background: rgba(10,10,26,0.8); backdrop-filter: blur(12px); z-index: 100; }
.header-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.logo { display: flex; align-items: center; gap: 10px; }
.logo-icon { font-size: 28px; }
.logo-text { font-size: 22px; font-weight: 700; color: #fff; }
.logo-dot { color: #7c3aed; }
.nav { display: flex; gap: 8px; flex-wrap: wrap; }
.nav-link { color: #8888aa; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 15px; font-weight: 500; transition: all 0.2s; cursor: pointer; }
.nav-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
.nav-link.active { color: #fff; background: rgba(124,58,237,0.2); }
.btn-login { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
.btn-login:hover { background: rgba(255,255,255,0.12); }

.hero { padding: 60px 0 40px; }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
.hero-badge { display: inline-block; background: rgba(124,58,237,0.15); color: #b388ff; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; margin-bottom: 16px; }
.hero-title { font-size: 44px; font-weight: 700; line-height: 1.15; margin-bottom: 16px; color: #fff; }
.highlight { background: linear-gradient(135deg, #00d4ff, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-desc { color: #8888aa; font-size: 18px; line-height: 1.6; margin-bottom: 24px; }
.hero-buttons { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; }
.btn-hero { padding: 12px 32px; font-size: 16px; }
.btn-primary { background: linear-gradient(135deg, #7c3aed, #00d4ff); border: none; color: #fff; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.btn-primary:hover { transform: scale(1.02); box-shadow: 0 8px 30px rgba(124,58,237,0.3); }
.btn-secondary { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 12px 24px; border-radius: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { background: rgba(255,255,255,0.12); }
.hero-stats { display: flex; gap: 40px; flex-wrap: wrap; }
.stat-number { font-size: 28px; font-weight: 700; color: #fff; display: block; }
.stat-label { color: #8888aa; font-size: 14px; }

.hero-image { display: flex; justify-content: center; align-items: center; }
.hero-img-wrapper { width: 100%; max-width: 400px; background: rgba(255,255,255,0.02); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); padding: 20px; }
.hero-img { width: 100%; height: auto; display: block; }

.features { padding: 40px 0 60px; }
.section-label { color: #7c3aed; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin-bottom: 8px; }
.section-title { font-size: 32px; font-weight: 700; text-align: center; color: #fff; margin-bottom: 40px; }
.features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.feature-card { background: rgba(255,255,255,0.03); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s; }
.feature-card:hover { transform: translateY(-4px); border-color: rgba(124,58,237,0.2); background: rgba(255,255,255,0.05); }
.feature-icon { font-size: 36px; margin-bottom: 12px; }
.feature-card h3 { font-size: 18px; color: #fff; margin-bottom: 8px; }
.feature-card p { color: #8888aa; font-size: 14px; line-height: 1.6; }

.footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 32px 0; }
.footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
.footer-desc { color: #666; font-size: 14px; margin-top: 4px; }
.footer-links { display: flex; gap: 20px; }
.footer-links a { color: #8888aa; text-decoration: none; font-size: 14px; transition: color 0.2s; cursor: pointer; }
.footer-links a:hover { color: #fff; }
.footer-copy { color: #555; font-size: 13px; }

.page { min-height: 100vh; padding: 30px 0 60px; }
.page.hidden { display: none !important; }

.block { background: rgba(255,255,255,0.03); border-radius: 14px; padding: 18px 20px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.05); }
.block-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.block-header h2 { font-size: 18px; color: #ccc; font-weight: 600; margin: 0; }
.btn-add { background: rgba(124,58,237,0.2); color: #b388ff; border: 1px solid rgba(124,58,237,0.3); padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s; }
.btn-add:hover { background: rgba(124,58,237,0.35); }
.btn-save { background: #7c3aed; color: #fff; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.2s; }
.btn-save:hover { background: #6a2fd4; }
.btn-cancel { background: rgba(255,255,255,0.06); color: #aaa; border: 1px solid rgba(255,255,255,0.1); padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.2s; }
.btn-cancel:hover { background: rgba(255,255,255,0.12); }
.btn-delete { background: rgba(255,70,70,0.15); color: #ff6b6b; border: 1px solid rgba(255,70,70,0.2); padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 16px; transition: background 0.2s; }
.btn-delete:hover { background: rgba(255,70,70,0.25); }
.btn-generate { width: 100%; padding: 16px; background: linear-gradient(135deg, #7c3aed, #00d4ff); border: none; border-radius: 12px; color: #fff; font-size: 18px; font-weight: 700; cursor: pointer; transition: transform 0.15s, box-shadow 0.2s; margin-top: 8px; }
.btn-generate:hover { transform: scale(1.01); box-shadow: 0 8px 30px rgba(124,58,237,0.35); }

.org-form { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; padding: 12px; background: rgba(255,255,255,0.04); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); }
.org-form input { flex: 2; min-width: 140px; padding: 10px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 15px; outline: none; }
.org-form input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.2); }
.org-form .btn-save, .org-form .btn-cancel { flex: 0; min-width: 80px; }
input, select { width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 15px; outline: none; }
input:focus, select:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.2); }
input::placeholder { color: #666; }
.org-select { margin-top: 4px; cursor: pointer; }
.org-select option { background: #1a1a3e; color: #fff; }
.hidden { display: none !important; }

.tab { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; flex-wrap: wrap; }
.tab button { background: none; border: none; color: #8888aa; padding: 8px 18px; font-size: 15px; cursor: pointer; border-radius: 8px; transition: all 0.2s; font-weight: 500; }
.tab button.active { background: rgba(124,58,237,0.2); color: #fff; }
.tab button:hover { background: rgba(255,255,255,0.05); color: #fff; }

.staff-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.staff-table th { text-align: left; padding: 10px 8px; color: #8888aa; font-weight: 500; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.staff-table td { padding: 8px 8px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
.staff-table tr:hover { background: rgba(255,255,255,0.03); }
.staff-table input[type="checkbox"] { width: 18px; height: 18px; accent-color: #7c3aed; cursor: pointer; }

.protocol-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.protocol-table th { text-align: left; padding: 10px 8px; color: #8888aa; font-weight: 500; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.protocol-table td { padding: 8px 8px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
.protocol-table .btn-remove { background: rgba(255,70,70,0.15); color: #ff6b6b; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.protocol-table .btn-remove:hover { background: rgba(255,70,70,0.25); }

.program-check { display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 14px; cursor: pointer; padding: 6px 12px; background: rgba(255,255,255,0.04); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); transition: background 0.2s; }
.program-check:hover { background: rgba(255,255,255,0.08); }
.program-check input[type="checkbox"] { width: 18px; height: 18px; accent-color: #7c3aed; cursor: pointer; }

.doc-check { display: flex; align-items: center; gap: 8px; color: #ccc; font-size: 14px; cursor: pointer; padding: 6px 12px; background: rgba(255,255,255,0.04); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); transition: background 0.2s; }
.doc-check:hover { background: rgba(255,255,255,0.08); }
.doc-check input[type="checkbox"] { width: 18px; height: 18px; accent-color: #7c3aed; cursor: pointer; }

.result-block { margin-top: 16px; padding: 20px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2); border-radius: 12px; text-align: center; }
.result-block h3 { color: #00d4ff; margin-bottom: 10px; }
.result-block a { display: inline-block; background: #7c3aed; color: #fff; padding: 10px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 8px 0; }
.result-block a:hover { background: #6a2fd4; }
.result-block .btn-cancel { margin-top: 8px; }

/* ===== КАРТА ===== */
#mapCanvas { background: radial-gradient(ellipse at center, #141430 0%, #0a0a1a 100%); width: 100%; height: auto; aspect-ratio: 900/600; cursor: crosshair; touch-action: none; }

/* ===== МОДАЛЬНЫЕ ОКНА ===== */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}
.modal-overlay.hidden { display: none !important; }
.modal-content {
    background: #1a1a3e;
    border-radius: 24px;
    max-width: 500px;
    width: 90%;
    padding: 0;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
    border: 1px solid rgba(255,255,255,0.1);
    overflow: hidden;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.modal-header h3 { margin: 0; color: #fff; font-size: 18px; }
.modal-close { background: none; border: none; color: #a0a0c0; font-size: 24px; cursor: pointer; padding: 0 4px; transition: color 0.2s; }
.modal-close:hover { color: #fff; }
.modal-body { padding: 20px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 12px 20px; border-top: 1px solid rgba(255,255,255,0.08); }
.modal-footer .btn-primary { width: auto; padding: 8px 20px; }
.modal-footer .btn-cancel { padding: 8px 20px; }

#workshopSelect { cursor: pointer; }
#workshopSelect option { background: #1a1a3e; color: #fff; }

@media (max-width: 768px) { .hero-inner { grid-template-columns: 1fr; text-align: center; } .hero-title { font-size: 32px; } .hero-stats { justify-content: center; } .hero-buttons { justify-content: center; } .features-grid { grid-template-columns: 1fr 1fr; } .nav { gap: 4px; } .nav-link { padding: 6px 12px; font-size: 13px; } }
@media (max-width: 500px) { .features-grid { grid-template-columns: 1fr; } }
```

---

### 3. `script.js` (ОБНОВЛЁННЫЙ — ПЕРЕТАСКИВАНИЕ, ФИКС РАСТЯГИВАНИЯ)

```javascript
// ============================================================
// ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
// ============================================================
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('mainPage').style.display = 'none';
    if (page === 'main') {
        document.getElementById('mainPage').style.display = 'block';
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { if (link.textContent.trim() === 'Главная') link.classList.add('active'); });
    } else if (page === 'training') {
        document.getElementById('trainingPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { if (link.textContent.trim() === 'Обучение') link.classList.add('active'); });
        initTrainingPage();
    } else if (page === 'map') {
        document.getElementById('mapPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { if (link.textContent.trim() === 'Карта') link.classList.add('active'); });
        initMapPage();
    } else if (page === 'risks') {
        document.getElementById('risksPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { if (link.textContent.trim() === 'Оценка рисков') link.classList.add('active'); });
    } else if (page === 'analytics') {
        document.getElementById('analyticsPage').classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => { if (link.textContent.trim() === 'Аналитика') link.classList.add('active'); });
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
function selectOrg(id) { currentOrgId = id; localStorage.setItem('currentOrgId', currentOrgId); }

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
    if (staff.length === 0) { container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">Нет загруженных сотрудников. Нажмите "Загрузить файл".</p>'; return; }
    let html = `<table class="staff-table"><thead><tr><th style="width:40px;"><input type="checkbox" id="selectAllStaff" onchange="toggleAllStaff()"></th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Должность</th><th>СНИЛС</th></tr></thead><tbody>`;
    staff.forEach((emp, index) => {
        html += `<tr><td><input type="checkbox" class="staff-check" data-index="${index}"></td><td>${emp.last_name}</td><td>${emp.first_name}</td><td>${emp.middle_name || ''}</td><td>${emp.position}</td><td>${emp.snils}</td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}
function toggleAllStaff() { const checked = document.getElementById('selectAllStaff').checked; document.querySelectorAll('.staff-check').forEach(cb => cb.checked = checked); }
function selectAllStaff() { document.querySelectorAll('.staff-check').forEach(cb => cb.checked = true); const selectAll = document.getElementById('selectAllStaff'); if (selectAll) selectAll.checked = true; }
function deselectAllStaff() { document.querySelectorAll('.staff-check').forEach(cb => cb.checked = false); const selectAll = document.getElementById('selectAllStaff'); if (selectAll) selectAll.checked = false; }
function getSelectedStaff() { const checkboxes = document.querySelectorAll('.staff-check:checked'); const staff = getStaff(); const selected = []; checkboxes.forEach(cb => { const index = parseInt(cb.dataset.index); if (staff[index]) selected.push({ ...staff[index] }); }); return selected; }
function clearStaff() { if (!confirm('Удалить всех сотрудников из штатного расписания?')) return; saveStaff([]); renderStaff(); fillFamEmployeeSelect(); }

// ============================================================
// ПРОТОКОЛ
// ============================================================
function renderProtocol() {
    const container = document.getElementById('protocolContainer');
    const protocol = getProtocol();
    if (protocol.length === 0) { container.innerHTML = '<p style="color:#6a6a8a;text-align:center;padding:20px;">В протоколе пока нет сотрудников.</p>'; return; }
    let html = `<table class="protocol-table"><thead><tr><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Должность</th><th>СНИЛС</th><th style="width:60px;">Действие</th></tr></thead><tbody>`;
    protocol.forEach((emp, index) => {
        html += `<tr><td>${emp.last_name}</td><td>${emp.first_name}</td><td>${emp.middle_name || ''}</td><td>${emp.position}</td><td>${emp.snils}</td><td><button class="btn-remove" onclick="removeFromProtocol(${index})">✖</button></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}
function removeFromProtocol(index) { const protocol = getProtocol(); protocol.splice(index, 1); saveProtocol(protocol); renderProtocol(); }

// ============================================================
// ПРОГРАММЫ
// ============================================================
function selectAllPrograms() { document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]').forEach(cb => cb.checked = true); }
function clearAllPrograms() { document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]').forEach(cb => cb.checked = false); }
function selectPrograms(ids) { document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]').forEach(cb => { cb.checked = ids.includes(parseInt(cb.value)); }); }
function getSelectedPrograms() { const checkboxes = document.querySelectorAll('#tabProtocol .program-check input[type="checkbox"]:checked'); const programs = []; checkboxes.forEach(cb => programs.push(parseInt(cb.value))); return programs; }

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
    let snils = ''; let snilsMatch = line.match(/\d{3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{2}/);
    if (snilsMatch) { snils = snilsMatch[0].replace(/[\s-]/g, ''); line = line.replace(snilsMatch[0], '').trim(); }
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) return null;
    const commonPositions = ['инженер','техник','механик','специалист','мастер','бригадир','директор','менеджер','бухгалтер','экономист','юрист','конструктор','технолог','электрик','сварщик','токарь','фрезеровщик','слесарь','водитель','грузчик','кладовщик','уборщик','охранник','программист','администратор','начальник','заведующий','главный','ведущий','старший','младший','помощник','заместитель','швея','вышивальщица','раскройщик','комплектовщик','упаковщик','контролер','наладчик','оператор','машинист','крановщик','стропальщик','троллейбуса','автобуса','трамвая','отк','спец','мех','энерг','снабж','электромонтер','диспетчер','фельдшер','медицинская','сестра','кассир','сторож','вахтер','аккумуляторщик','маляр','токарь','обмотчик','ремонтировщик','разр','отдела'];
    let nameParts = [], positionParts = [], i = 0;
    while (i < words.length) { const w = words[i]; const lower = w.toLowerCase(); const isName = /^[А-ЯЁ][а-яё]{1,19}$/.test(w) || /^[A-Z][a-z]{1,19}$/.test(w); const isPosition = commonPositions.some(pos => lower === pos || lower.includes(pos) || pos.includes(lower)); if (isName && !isPosition && nameParts.length < 3) { nameParts.push(w); i++; } else { positionParts.push(w); i++; } }
    if (nameParts.length < 2) { const firstThree = words.slice(0, Math.min(3, words.length)); if (firstThree.length >= 2) { nameParts = firstThree; positionParts = words.slice(firstThree.length); } }
    if (nameParts.length < 2) return null;
    return { last_name: nameParts[0] || '', first_name: nameParts[1] || '', middle_name: nameParts[2] || '', position: positionParts.join(' ') || '', snils: snils || '', is_passed: true };
}
function formatSnils(snils) { if (!snils) return ''; const clean = snils.replace(/\D/g, ''); if (clean.length < 11) return snils; return clean.slice(0,3) + '-' + clean.slice(3,6) + '-' + clean.slice(6,9) + ' ' + clean.slice(9,11); }
function escXml(str) { if (!str) return ''; return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ============================================================
// ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ ОБУЧЕНИЯ
// ============================================================
let trainingInited = false;
function initTrainingPage() {
    if (trainingInited) return;
    trainingInited = true;
    renderOrgs(); renderStaff(); renderProtocol(); fillFamEmployeeSelect();

    document.getElementById('showOrgFormBtn').addEventListener('click', function() { document.getElementById('orgForm').classList.toggle('hidden'); });
    document.getElementById('cancelOrgBtn').addEventListener('click', function() { document.getElementById('orgForm').classList.add('hidden'); });
    document.getElementById('saveOrgBtn').addEventListener('click', function() {
        const name = document.getElementById('orgNameInput').value.trim(); const inn = document.getElementById('orgInnInput').value.trim();
        if (!name || !inn) { alert('Заполните название и ИНН'); return; }
        const orgs = getOrgs(); const newOrg = { id: Date.now(), name: name, inn: inn }; orgs.push(newOrg); saveOrgs(orgs);
        document.getElementById('orgNameInput').value = ''; document.getElementById('orgInnInput').value = ''; document.getElementById('orgForm').classList.add('hidden');
        renderOrgs(); document.getElementById('orgSelect').value = newOrg.id; selectOrg(newOrg.id); alert('✅ Организация добавлена!');
    });
    document.getElementById('deleteOrgBtn').addEventListener('click', function() {
        const select = document.getElementById('orgSelect'); const orgId = select.value;
        if (!orgId) { alert('Сначала выберите организацию для удаления'); return; }
        if (!confirm('Удалить выбранную организацию?')) return;
        let orgs = getOrgs(); orgs = orgs.filter(o => o.id != parseInt(orgId)); saveOrgs(orgs);
        if (currentOrgId == orgId) { currentOrgId = null; localStorage.removeItem('currentOrgId'); }
        renderOrgs(); document.getElementById('orgSelect').value = ''; alert('✅ Организация удалена');
    });
    document.getElementById('orgSelect').addEventListener('change', function() { if (this.value) { selectOrg(parseInt(this.value)); } else { currentOrgId = null; localStorage.removeItem('currentOrgId'); } });

    document.getElementById('staffImportBtn').addEventListener('click', function() {
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.txt,.csv'; input.style.display = 'none'; document.body.appendChild(input);
        input.onchange = function(e) {
            if (!e.target.files.length) { document.body.removeChild(input); return; }
            const file = e.target.files[0]; const reader = new FileReader();
            reader.onload = function(event) {
                let content = event.target.result;
                if (/[����]/.test(content) || !/[а-яА-Я]/.test(content)) {
                    try { const bytes = new Uint8Array(content.length); for (let i = 0; i < content.length; i++) bytes[i] = content.charCodeAt(i) & 0xFF; const decoder = new TextDecoder('windows-1251'); content = decoder.decode(bytes); } catch(e) {}
                }
                if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
                const employees = smartParse(content);
                if (employees.length === 0) { alert('❌ Не удалось распознать данные.'); document.body.removeChild(input); return; }
                const currentStaff = getStaff();
                employees.forEach(emp => { if (!currentStaff.some(e => e.last_name === emp.last_name && e.first_name === emp.first_name && e.snils === emp.snils)) currentStaff.push(emp); });
                saveStaff(currentStaff); renderStaff(); fillFamEmployeeSelect();
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
        selected.forEach(emp => { if (!currentProtocol.some(e => e.last_name === emp.last_name && e.first_name === emp.first_name && e.snils === emp.snils)) currentProtocol.push(emp); });
        saveProtocol(currentProtocol); alert(`✅ Добавлено ${selected.length} сотрудников в протокол!`); deselectAllStaff(); showTab('protocol');
    });

    document.getElementById('generateBtn').addEventListener('click', function() {
        const protocolNumber = document.getElementById('protocolNumber').value.trim();
        const date = document.getElementById('protocolDate').value;
        const orgSelect = document.getElementById('orgSelect'); const orgId = orgSelect.value; const orgs = getOrgs(); const org = orgs.find(o => o.id == parseInt(orgId));
        const employees = getProtocol(); const selectedPrograms = getSelectedPrograms();
        if (!orgId || !org) { alert('Выберите организацию'); return; }
        if (!protocolNumber) { alert('Введите номер протокола'); return; }
        if (!date) { alert('Выберите дату протокола'); return; }
        if (employees.length === 0) { alert('В протоколе нет сотрудников'); return; }
        if (selectedPrograms.length === 0) { alert('Выберите хотя бы одну программу'); return; }
        const programs = { 1: "Оказание первой помощи пострадавшим", 2: "Использование (применение) средств индивидуальной защиты", 3: "Общие вопросы охраны труда и функционирования системы управления охраной труда", 4: "Безопасные методы и приемы выполнения работ при воздействии вредных и (или) опасных производственных факторов, источников опасности, идентифицированных в рамках специальной оценки условий труда и оценки профессиональных рисков" };
        let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'; xml += '<RegistrySet xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
        employees.forEach(emp => { selectedPrograms.forEach(progId => {
            xml += '\t<RegistryRecord>\n'; xml += '\t\t<Worker>\n';
            xml += `\t\t\t<LastName>${escXml(emp.last_name)}</LastName>\n`;
            xml += `\t\t\t<FirstName>${escXml(emp.first_name)}</FirstName>\n`;
            xml += `\t\t\t<MiddleName>${escXml(emp.middle_name || '')}</MiddleName>\n`;
            xml += `\t\t\t<Snils>${escXml(formatSnils(emp.snils))}</Snils>\n`;
            xml += `\t\t\t<Position>${escXml(emp.position)}</Position>\n`;
            xml += `\t\t\t<EmployerInn>${escXml(org.inn)}</EmployerInn>\n`;
            xml += `\t\t\t<EmployerTitle>${escXml(org.name)}</EmployerTitle>\n`;
            xml += '\t\t</Worker>\n'; xml += '\t\t<Organization>\n';
            xml += `\t\t\t<Inn>${escXml(org.inn)}</Inn>\n`;
            xml += `\t\t\t<Title>${escXml(org.name)}</Title>\n`;
            xml += '\t\t</Organization>\n';
            xml += `\t\t<Test isPassed="true" learnProgramId="${progId}">\n`;
            xml += `\t\t\t<Date>${escXml(date)}</Date>\n`;
            xml += `\t\t\t<ProtocolNumber>${escXml(protocolNumber)}</ProtocolNumber>\n`;
            xml += `\t\t\t<LearnProgramTitle>${escXml(programs[progId] || 'Неизвестная программа')}</LearnProgramTitle>\n`;
            xml += '\t\t</Test>\n'; xml += '\t</RegistryRecord>\n';
        }); });
        xml += '</RegistrySet>';
        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        document.getElementById('downloadLink').href = url;
        document.getElementById('downloadLink').download = `${protocolNumber.replace('/', '_')}_${date}.xml`;
        document.getElementById('resultBlock').classList.remove('hidden');
        alert('✅ XML создан! Нажмите "Скачать XML"');
    });

    document.getElementById('generateFamBtn').addEventListener('click', function() {
        const select = document.getElementById('famEmployeeSelect'); const index = select.value;
        if (index === '') { alert('Выберите сотрудника'); return; }
        const staff = getStaff(); const emp = staff[parseInt(index)];
        if (!emp) { alert('Сотрудник не найден'); return; }
        const checkboxes = document.querySelectorAll('.doc-check input[type="checkbox"]:checked'); const documents = []; checkboxes.forEach(cb => documents.push(cb.value));
        if (documents.length === 0) { alert('Выберите хотя бы один документ'); return; }
        const orgSelect = document.getElementById('orgSelect'); const orgId = orgSelect.value; const orgs = getOrgs(); const org = orgs.find(o => o.id == parseInt(orgId));
        const orgName = org ? org.name : '___________'; const orgInn = org ? org.inn : '___________';
        const date = new Date().toLocaleDateString('ru-RU'); const contentDiv = document.getElementById('famContent');
        let html = `<div style="text-align:center;margin-bottom:16px;"><h3 style="font-size:16px;font-weight:700;color:#fff;">ЛИСТ ОЗНАКОМЛЕНИЯ</h3><p style="color:#8888aa;font-size:13px;">с локальными нормативными актами и документами по охране труда</p></div>
            <table style="width:100%;border-collapse:collapse;margin-top:8px;"><tr><td style="padding:4px 8px;font-weight:600;width:200px;color:#ccc;">Организация:</td><td style="padding:4px 8px;color:#ccc;">${orgName}</td></tr>
            <tr><td style="padding:4px 8px;font-weight:600;color:#ccc;">ИНН:</td><td style="padding:4px 8px;color:#ccc;">${orgInn}</td></tr>
            <tr><td style="padding:4px 8px;font-weight:600;color:#ccc;">Дата:</td><td style="padding:4px
