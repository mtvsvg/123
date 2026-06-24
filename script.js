new Vue({
    el: '#app',
    data: {
        organizations: [
            { id: 1, inn: '7723456789', name: 'ООО "БЭБИ БУМ"' },
            { id: 2, inn: '7701123456', name: 'АО "ТрансСервис"' },
            { id: 3, inn: '7812345678', name: 'ООО "Депо-Сервис"' }
        ],
        selectedOrgId: null
    },
    mounted() {
        const saved = localStorage.getItem('selectedOrgId');
        if (saved && this.organizations.some(o => o.id === Number(saved))) {
            this.selectedOrgId = Number(saved);
        } else if (this.organizations.length) {
            this.selectedOrgId = this.organizations[0].id;
        }

        this.populateSelect();
        this.updateOrgFields();
        this.initTabs();
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
                opt.textContent = org.name;
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
                localStorage.setItem('selectedOrgId', String(val));
                this.updateOrgFields();
            }
        },

        addOrg() {
            const newId = Date.now();
            const newOrg = {
                id: newId,
                inn: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                name: `ООО "Фирма ${newId.toString().slice(-4)}"`
            };
            this.organizations.push(newOrg);
            this.selectedOrgId = newId;
            localStorage.setItem('selectedOrgId', String(newId));
            this.populateSelect();
            this.updateOrgFields();
        },

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
