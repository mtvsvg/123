new Vue({
    el: '#app',
    data: {
        // Стартовый список организаций
        organizations: [
            { id: 1, inn: '7723456789', name: 'ООО "БЭБИ БУМ"' },
            { id: 2, inn: '7701123456', name: 'АО "ТрансСервис"' },
            { id: 3, inn: '7812345678', name: 'ООО "Депо-Сервис"' }
        ],
        selectedOrgId: null // будет загружен из localStorage
    },
    mounted() {
        // 1. Загружаем сохранённую организацию из localStorage
        const saved = localStorage.getItem('selectedOrgId');
        if (saved && this.organizations.some(o => o.id === Number(saved))) {
            this.selectedOrgId = Number(saved);
        } else if (this.organizations.length) {
            this.selectedOrgId = this.organizations[0].id;
        }

        // 2. Заполняем выпадающий список
        this.populateSelect();

        // 3. Обновляем поля ИНН / Название
        this.updateOrgFields();

        // 4. Вкладки
        this.initTabs();

        // 5. Выбор программы обучения (без прозрачности)
        this.initProgramSelector();
    },
    methods: {
        populateSelect() {
            const select = document.getElementById('orgSelect');
            if (!select) return;
            select.innerHTML = '';
            this.organizations.forEach(org => {
                const opt = document.createElement('option');
                opt.value = org.id;
                opt.textContent = `${org.name} (ИНН ${org.inn})`;
                if (org.id === this.selectedOrgId) {
                    opt.selected = true;
                }
                select.appendChild(opt);
            });
        },

        updateOrgFields() {
            const innInput = document.getElementById('orgInn');
            const nameInput = document.getElementById('orgName');
            if (!innInput || !nameInput) return;

            const org = this.organizations.find(o => o.id === this.selectedOrgId);
            if (org) {
                innInput.value = org.inn;
                nameInput.value = org.name;
            } else {
                innInput.value = '';
                nameInput.value = '';
            }
        },

        onOrgChange(e) {
            const val = Number(e.target.value);
            if (val) {
                this.selectedOrgId = val;
                // СОХРАНЯЕМ В localStorage
                localStorage.setItem('selectedOrgId', String(val));
                this.updateOrgFields();
            }
        },

        addOrg() {
            // Просто добавляем тестовую организацию для демонстрации
            const newId = Date.now();
            const newOrg = {
                id: newId,
                inn: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                name: `ООО "Фирма ${newId.toString().slice(-4)}"`
            };
            this.organizations.push(newOrg);
            // Выбираем новую
            this.selectedOrgId = newId;
            localStorage.setItem('selectedOrgId', String(newId));
            this.populateSelect();
            this.updateOrgFields();
        },

        // ----- ВКЛАДКИ -----
        initTabs() {
            const btns = document.querySelectorAll('.tab-btn');
            const contents = document.querySelectorAll('.tab-content');

            btns.forEach(btn => {
                btn.addEventListener('click', function() {
                    btns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    const target = this.dataset.tab;
                    contents.forEach(c => c.classList.remove('active'));
                    document.getElementById(target).classList.add('active');
                });
            });
        },

        // ----- ПРОГРАММЫ (без прозрачности) -----
        initProgramSelector() {
            const items = document.querySelectorAll('.program-item');
            items.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    items.forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }
    },

    // Дополнительный вотчер для реактивности при изменении списка
    watch: {
        organizations: {
            deep: true,
            handler() {
                this.populateSelect();
                this.updateOrgFields();
            }
        }
    }
});
