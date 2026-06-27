// ============================================================
// КАРТА (РАБОЧАЯ ЗОНА УВЕЛИЧЕНА)
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

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// ===== ДИНАМИЧЕСКИЙ РАЗМЕР КАНВАСА =====
function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const width = rect.width - 4;
    const height = Math.max(550, Math.min(900, window.innerHeight * 0.75));
    
    // Устанавливаем логический размер (для точности)
    canvas.width = 2400;
    canvas.height = 1200;
    
    // Устанавливаем CSS размер (для отображения)
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Масштабируем цех при первом запуске
    if (mapData.workshops.length > 0) {
        const ws = getCurrentWorkshop();
        if (ws && ws.w < 2000) {
            ws.x = 50;
            ws.y = 50;
            ws.w = 2300;
            ws.h = 1100;
        }
        drawMap();
    }
}

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
                updateWorkshopSelect();
                updateInfo();
                resizeCanvas();
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
            x: 50, y: 50, w: 2300, h: 1100,
            workplaces: []
        });
        mapData.currentWorkshop = 0;
        mapData.evacuationPoints = [];
        updateWorkshopSelect();
        updateInfo();
        resizeCanvas();
        drawMap();
    }
    
    // События
    window.addEventListener('resize', resizeCanvas);
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
    resizeCanvas();
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
    const scaleX = 2400 / rect.width;
    const scaleY = 1200 / rect.height;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function drawMap() {
    ctx.clearRect(0, 0, 2400, 1200);
    
    const ws = getCurrentWorkshop();
    if (!ws) return;
    
    // Фон
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 2400, 1200);
    
    // Сетка
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 2400; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1200); ctx.stroke();
    }
    for (let i = 0; i < 1200; i += 50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(2400, i); ctx.stroke();
    }
    
    // Участок (на всю ширину)
    const grad = ctx.createLinearGradient(ws.x, ws.y, ws.x + ws.w, ws.y + ws.h);
    grad.addColorStop(0, 'rgba(74, 158, 255, 0.06)');
    grad.addColorStop(1, 'rgba(74, 158, 255, 0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(ws.x, ws.y, ws.w, ws.h);
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(ws.x, ws.y, ws.w, ws.h);
    ctx.setLineDash([]);
    
    ctx.fillStyle = 'rgba(74, 158, 255, 0.6)';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🏭 ${ws.name} (${ws.length}×${ws.width} м)`, ws.x + ws.w/2, ws.y + 35);
    
    // Углы для растягивания (увеличены для удобства)
    const corners = [
        { cx: ws.x, cy: ws.y },
        { cx: ws.x + ws.w, cy: ws.y },
        { cx: ws.x, cy: ws.y + ws.h },
        { cx: ws.x + ws.w, cy: ws.y + ws.h }
    ];
    corners.forEach(c => {
        ctx.fillStyle = 'rgba(74, 158, 255, 0.9)';
        ctx.fillRect(c.cx - 10, c.cy - 10, 20, 20);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(c.cx - 10, c.cy - 10, 20, 20);
    });
    
    // Рабочие места
    if (ws.workplaces) {
        ws.workplaces.forEach((wp) => {
            const zoneSize = wp.zone || 50;
            const x = wp.x - zoneSize/2;
            const y = wp.y - zoneSize/2;
            const w = zoneSize;
            const h = zoneSize;
            
            // Чёрно-жёлтая зона
            ctx.fillStyle = 'rgba(255, 193, 7, 0.3)';
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
            
            // Человечек ПОЛНОСТЬЮ внутри зоны (увеличен)
            const centerX = wp.x;
            const centerY = wp.y;
            const scale = 1.3;
            
            ctx.fillStyle = '#ff6b6b';
            ctx.shadowColor = 'rgba(255, 107, 107, 0.3)';
            ctx.shadowBlur = 20;
            // Голова
            ctx.beginPath();
            ctx.arc(centerX, centerY - 18 * scale, 12 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Тело
            ctx.fillRect(centerX - 9 * scale, centerY - 6 * scale, 18 * scale, 22 * scale);
            // Ноги
            ctx.fillRect(centerX - 15 * scale, centerY + 14 * scale, 8 * scale, 12 * scale);
            ctx.fillRect(centerX + 7 * scale, centerY + 14 * scale, 8 * scale, 12 * scale);
            // Руки
            ctx.fillRect(centerX - 18 * scale, centerY + 2 * scale, 6 * scale, 10 * scale);
            ctx.fillRect(centerX + 12 * scale, centerY + 2 * scale, 6 * scale, 10 * scale);
            
            // Название рабочего места
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(wp.name.substring(0, 16), centerX, centerY + 48 * scale);
            if (wp.position) {
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.font = '10px sans-serif';
                ctx.fillText(wp.position.substring(0, 20), centerX, centerY + 62 * scale);
            }
        });
    }
    
    // Точки эвакуации (увеличены)
    if (mapData.evacuationPoints) {
        mapData.evacuationPoints.forEach((ep) => {
            const ew = 80, eh = 40;
            const ex = ep.x - ew/2;
            const ey = ep.y - eh/2;
            
            ctx.fillStyle = '#2e7d32';
            ctx.shadowColor = 'rgba(46, 125, 50, 0.4)';
            ctx.shadowBlur = 20;
            ctx.fillRect(ex, ey, ew, eh);
            ctx.shadowBlur = 0;
            
            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = 2;
            ctx.strokeRect(ex, ey, ew, eh);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('ВЫХОД', ep.x, ep.y);
            ctx.textBaseline = 'alphabetic';
        });
    }
}

function setupCanvasEvents() {
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
                mapData.evacuationPoints.push({ x: coords.x, y: coords.y, name: name.trim() || 'Выход', id: Date.now() });
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
                if (dist < 25) found = index;
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
                if (dist < 25) evacFound = index;
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
                if (dist < 25) {
                    isDragging = true;
                    dragTarget = i;
                    dragOffsetX = coords.x - wp.x;
                    dragOffsetY = coords.y - wp.y;
                    canvas.style.cursor = 'grabbing';
                    return;
                }
            }
        }
        
        const corners = [
            { cx: ws.x, cy: ws.y, corner: 'tl' },
            { cx: ws.x + ws.w, cy: ws.y, corner: 'tr' },
            { cx: ws.x, cy: ws.y + ws.h, corner: 'bl' },
            { cx: ws.x + ws.w, cy: ws.y + ws.h, corner: 'br' }
        ];
        for (let c of corners) {
            if (Math.abs(coords.x - c.cx) < 15 && Math.abs(coords.y - c.cy) < 15) {
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
                newX = Math.max(ws.x + 10, Math.min(ws.x + ws.w - 10, newX));
                newY = Math.max(ws.y + 10, Math.min(ws.y + ws.h - 10, newY));
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
                    ws.x = resizeStartXpos + dx;
                    ws.y = resizeStartYpos + dy;
                    ws.w = resizeStartW - dx;
                    ws.h = resizeStartH - dy;
                    break;
                case 'tr':
                    ws.y = resizeStartYpos + dy;
                    ws.w = resizeStartW + dx;
                    ws.h = resizeStartH - dy;
                    break;
                case 'bl':
                    ws.x = resizeStartXpos + dx;
                    ws.w = resizeStartW - dx;
                    ws.h = resizeStartH + dy;
                    break;
                case 'br':
                    ws.w = resizeStartW + dx;
                    ws.h = resizeStartH + dy;
                    break;
            }
            drawMap();
            return;
        }
        
        let cursor = 'default';
        if (ws.workplaces) {
            for (let wp of ws.workplaces) {
                const dist = Math.sqrt((coords.x - wp.x) ** 2 + (coords.y - wp.y) ** 2);
                if (dist < 25) {
                    cursor = 'grab';
                    break;
                }
            }
        }
        if (cursor === 'default') {
            const corners = [
                { cx: ws.x, cy: ws.y, c: 'nw-resize' },
                { cx: ws.x + ws.w, cy: ws.y, c: 'ne-resize' },
                { cx: ws.x, cy: ws.y + ws.h, c: 'sw-resize' },
                { cx: ws.x + ws.w, cy: ws.y + ws.h, c: 'se-resize' }
            ];
            for (let c of corners) {
                if (Math.abs(coords.x - c.cx) < 15 && Math.abs(coords.y - c.cy) < 15) {
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

function closeWorkplaceModal() {
    document.getElementById('workplaceModal').classList.add('hidden');
    tempWorkplacePos = null;
    mapMode = 'view';
    document.getElementById('mapMode').textContent = 'Просмотр';
    document.getElementById('mapMode').style.color = '#00d4ff';
}

function saveWorkplace() {
    if (!tempWorkplacePos) return;
    const ws = getCurrentWorkshop();
    if (!ws) return;
    const name = document.getElementById('workplaceNameInput').value.trim() || 'Рабочее место ' + (ws.workplaces.length + 1);
    const position = document.getElementById('workplacePositionInput').value.trim() || '';
    const zone = parseInt(document.getElementById('workplaceZoneInput').value) || 50;
    ws.workplaces.push({ x: tempWorkplacePos.x, y: tempWorkplacePos.y, name: name, position: position, zone: zone, id: Date.now() });
    closeWorkplaceModal();
    updateInfo();
    drawMap();
    saveMap();
}

function addNewWorkshop() {
    const name = prompt('Введите название нового участка:', 'Участок ' + (mapData.workshops.length + 1));
    if (!name) return;
    mapData.workshops.push({
        id: Date.now(),
        name: name,
        length: 30,
        width: 20,
        x: 50, y: 50, w: 2300, h: 1100,
        workplaces: []
    });
    mapData.currentWorkshop = mapData.workshops.length - 1;
    if (!mapData.evacuationPoints) mapData.evacuationPoints = [];
    updateWorkshopSelect();
    updateInfo();
    resizeCanvas();
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
