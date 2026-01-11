let currentInsurer = '';
let currentInsuranceType = '';

document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeInsurerSelect();
    initializeInsuranceTypeSelect();
    initializeTables();
});

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Update active button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show target tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

function initializeInsurerSelect() {
    const insurerButtons = document.querySelectorAll('#insurer-buttons .option-btn');
    const insuranceTypeButtons = document.querySelectorAll('#insurance-type-buttons .option-btn');
    const tabsContainer = document.querySelector('.tabs-container');
    const gapOptionBtn = document.getElementById('gap-option-btn');
    
    insurerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            insurerButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            currentInsurer = btn.dataset.value;
            
            // Show/hide GAP option based on insurer
            if (gapOptionBtn) {
                gapOptionBtn.style.display = currentInsurer === 'bulstrad' ? 'inline-block' : 'none';
                // If GAP was selected but insurer is not Bulstrad, reset selection
                if (currentInsuranceType === 'gap' && currentInsurer !== 'bulstrad') {
                    insuranceTypeButtons.forEach(b => b.classList.remove('active'));
                    currentInsuranceType = '';
                    if (tabsContainer) {
                        tabsContainer.style.display = 'none';
                        tabsContainer.classList.remove('show');
                    }
                }
            }
            
            // If both are selected, show tabs
            if (currentInsurer && currentInsuranceType) {
                if (tabsContainer) {
                    tabsContainer.style.display = 'flex';
                    tabsContainer.classList.add('show');
                }
                updateTariffEditTitle();
                loadTariffData();
            } else {
                if (tabsContainer) {
                    tabsContainer.style.display = 'none';
                    tabsContainer.classList.remove('show');
                }
            }
        });
    });
}

function initializeInsuranceTypeSelect() {
    const insuranceTypeButtons = document.querySelectorAll('#insurance-type-buttons .option-btn');
    const tabsContainer = document.querySelector('.tabs-container');
    
    insuranceTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            insuranceTypeButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            currentInsuranceType = btn.dataset.value;
            
            if (currentInsurer && currentInsuranceType) {
                if (tabsContainer) {
                    tabsContainer.style.display = 'flex';
                    tabsContainer.classList.add('show');
                }
                updateTariffEditTitle();
                loadTariffData();
            } else {
                if (tabsContainer) {
                    tabsContainer.style.display = 'none';
                    tabsContainer.classList.remove('show');
                }
            }
        });
    });
}

function updateTariffEditTitle() {
    const insurerNameSpan = document.getElementById('insurer-name');
    const insuranceTypeNameSpan = document.getElementById('insurance-type-name');
    
    if (!insurerNameSpan || !insuranceTypeNameSpan) return;
    
    const insurerNames = {
        'generali': 'Дженерали',
        'armeec': 'Армеец',
        'bulstrad': 'Булстрад',
        'dzi': 'ДЗИ',
        'unika': 'Уника',
        'grupama': 'Групама',
        'bul-ins': 'Бул Инс',
        'allianz': 'Алианц'
    };
    
    const insuranceTypeNames = {
        'casco': 'Каско',
        'mtpl': 'Гражданска отговорност',
        'gap': 'GAP'
    };
    
    insurerNameSpan.textContent = insurerNames[currentInsurer] || currentInsurer;
    insuranceTypeNameSpan.textContent = insuranceTypeNames[currentInsuranceType] || currentInsuranceType;
}

function initializeTables() {
    document.getElementById('add-tariff-row').addEventListener('click', () => {
        addTariffRow(null, null, true);
    });

    document.getElementById('add-discount-row').addEventListener('click', () => {
        addDiscountRow(null, null, true);
    });

    document.getElementById('add-surcharge-row').addEventListener('click', () => {
        addSurchargeRow(null, null, true);
    });
}

function addTariffRow(rowData = null, insertAfterRow = null, isNew = false) {
    const tbody = document.getElementById('tariffs-tbody');
    const row = document.createElement('tr');
    
    const isEditing = isNew || !rowData;
    
    if (isEditing) {
        // Editing mode - show inputs with "Добави" button
        row.innerHTML = `
            <td></td>
            <td><input type="number" class="tariff-from-age" value="${rowData?.fromAge || ''}" min="0" step="1"></td>
            <td><input type="number" class="tariff-to-age" value="${rowData?.toAge || ''}" min="0" step="1"></td>
            <td><input type="number" class="tariff-from-value" value="${rowData?.fromValue || ''}" min="0" step="0.01"></td>
            <td><input type="number" class="tariff-to-value" value="${rowData?.toValue || ''}" min="0" step="0.01"></td>
            <td><input type="number" class="tariff-rate" value="${rowData?.rate || ''}" min="0" step="0.001"></td>
            <td>
                <button class="btn-action btn-save" onclick="saveTariffRow(this)" title="ОК">ОК</button>
            </td>
        `;
        row.classList.add('editing-row');
    } else {
        // View mode - show text with "Изтрий" and "Редактирай" buttons
        row.innerHTML = `
            <td>
                <button class="btn-action btn-move-up" onclick="moveTariffRowUp(this)" title="Нагоре">↑</button>
                <button class="btn-action btn-move-down" onclick="moveTariffRowDown(this)" title="Надолу">↓</button>
            </td>
            <td class="tariff-from-age-display">${rowData.fromAge !== null && rowData.fromAge !== undefined ? rowData.fromAge : ''}</td>
            <td class="tariff-to-age-display">${rowData.toAge !== null && rowData.toAge !== undefined ? rowData.toAge : ''}</td>
            <td class="tariff-from-value-display">${rowData.fromValue !== null && rowData.fromValue !== undefined ? rowData.fromValue : ''}</td>
            <td class="tariff-to-value-display">${rowData.toValue !== null && rowData.toValue !== undefined ? rowData.toValue : ''}</td>
            <td class="tariff-rate-display">${rowData.rate !== null && rowData.rate !== undefined ? rowData.rate : ''}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editTariffRow(this)" title="Редактирай">Редактирай</button>
                <button class="btn-action btn-delete" onclick="deleteRow(this)">Изтрий</button>
            </td>
        `;
        row.classList.add('view-row');
        row.setAttribute('data-row-data', JSON.stringify(rowData));
    }
    
    if (insertAfterRow) {
        insertAfterRow.insertAdjacentElement('afterend', row);
    } else {
        tbody.appendChild(row);
    }
}

function saveTariffRow(btn) {
    const row = btn.closest('tr');
    const fromAge = row.querySelector('.tariff-from-age').value;
    const toAge = row.querySelector('.tariff-to-age').value;
    const fromValue = row.querySelector('.tariff-from-value').value;
    const toValue = row.querySelector('.tariff-to-value').value;
    const rate = row.querySelector('.tariff-rate').value;
    
    const rowData = {
        fromAge: fromAge ? parseInt(fromAge) : null,
        toAge: toAge ? parseInt(toAge) : null,
        fromValue: fromValue ? parseFloat(fromValue) : null,
        toValue: toValue ? parseFloat(toValue) : null,
        rate: rate ? parseFloat(rate) : null
    };
    
    // Switch to view mode
    addTariffRow(rowData, row, false);
    row.remove();
    saveTariffData();
}

function editTariffRow(btn) {
    const row = btn.closest('tr');
    const rowDataJson = row.getAttribute('data-row-data');
    const rowData = rowDataJson ? JSON.parse(rowDataJson) : null;
    
    // Switch to editing mode
    addTariffRow(rowData, row, true);
    row.remove();
}

function addDiscountRow(rowData = null, insertAfterRow = null, isNew = false) {
    const tbody = document.getElementById('discounts-tbody');
    const row = document.createElement('tr');
    
    const discountType = rowData?.type || '';
    const ageValue = rowData?.age || '';
    const discountValue = rowData?.value || '';
    const isEditing = isNew || !rowData;
    const isAgeType = discountType === 'age' && ageValue;
    
    if (isEditing) {
        // Editing mode
        row.innerHTML = `
            <td></td>
            <td>
                <div class="discount-type-container">
                    <select class="discount-type">
                        <option value="">Изберете тип</option>
                        <option value="go" ${discountType === 'go' ? 'selected' : ''}>за ГО</option>
                        <option value="age" ${discountType === 'age' && !ageValue ? 'selected' : ''}>за възраст над (години)</option>
                        <option value="new" ${discountType === 'new' ? 'selected' : ''}>за новозастрахован</option>
                        <option value="combined" ${discountType === 'combined' ? 'selected' : ''}>за комбиниран продукт</option>
                        <option value="other" ${discountType === 'other' ? 'selected' : ''}>други</option>
                    </select>
                    <div class="age-input-container" style="display: none;">
                        <input type="number" class="discount-age-input" min="0" step="1" placeholder="Възраст" value="${ageValue}">
                        <button type="button" class="btn-confirm-age">✓</button>
                        <button type="button" class="btn-cancel-age">✕</button>
                    </div>
                </div>
            </td>
            <td><input type="number" class="discount-value" value="${discountValue}" min="0" max="100" step="0.01"></td>
            <td>
                <button class="btn-action btn-save" onclick="saveDiscountRow(this)" title="ОК">ОК</button>
            </td>
        `;
        row.classList.add('editing-row');
        
        // Setup age input handlers
        const discountTypeSelect = row.querySelector('.discount-type');
        const ageInputContainer = row.querySelector('.age-input-container');
        const ageInput = row.querySelector('.discount-age-input');
        const confirmAgeBtn = row.querySelector('.btn-confirm-age');
        const cancelAgeBtn = row.querySelector('.btn-cancel-age');
        
        discountTypeSelect.addEventListener('change', () => {
            if (discountTypeSelect.value === 'age') {
                ageInputContainer.style.display = 'block';
                ageInput.focus();
            } else {
                ageInputContainer.style.display = 'none';
            }
        });
        
        if (confirmAgeBtn) {
            confirmAgeBtn.addEventListener('click', () => {
                ageInputContainer.style.display = 'none';
            });
        }
        
        if (cancelAgeBtn) {
            cancelAgeBtn.addEventListener('click', () => {
                ageInputContainer.style.display = 'none';
                ageInput.value = '';
            });
        }
    } else {
        // View mode
        let typeDisplay = '';
        if (discountType === 'go') typeDisplay = 'за ГО';
        else if (discountType === 'age' && ageValue) typeDisplay = `Възраст над ${ageValue} години`;
        else if (discountType === 'new') typeDisplay = 'за новозастрахован';
        else if (discountType === 'combined') typeDisplay = 'за комбиниран продукт';
        else if (discountType === 'other') typeDisplay = 'други';
        else typeDisplay = discountType;
        
        row.innerHTML = `
            <td>
                <button class="btn-action btn-move-up" onclick="moveDiscountRowUp(this)" title="Нагоре">↑</button>
                <button class="btn-action btn-move-down" onclick="moveDiscountRowDown(this)" title="Надолу">↓</button>
            </td>
            <td class="discount-type-display">${typeDisplay}</td>
            <td class="discount-value-display">${discountValue !== null && discountValue !== undefined ? discountValue : ''}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editDiscountRow(this)" title="Редактирай">Редактирай</button>
                <button class="btn-action btn-delete" onclick="deleteRow(this)">Изтрий</button>
            </td>
        `;
        row.classList.add('view-row');
        row.setAttribute('data-row-data', JSON.stringify(rowData));
    }
    
    if (insertAfterRow) {
        insertAfterRow.insertAdjacentElement('afterend', row);
    } else {
        tbody.appendChild(row);
    }
}

function saveDiscountRow(btn) {
    const row = btn.closest('tr');
    const discountTypeSelect = row.querySelector('.discount-type');
    const ageInput = row.querySelector('.discount-age-input');
    const valueInput = row.querySelector('.discount-value');
    
    const type = discountTypeSelect.value;
    const age = type === 'age' && ageInput ? ageInput.value : '';
    const value = valueInput.value;
    
    const rowData = {
        type: type || '',
        value: value ? parseFloat(value) : null
    };
    
    if (type === 'age' && age) {
        rowData.age = parseInt(age);
    }
    
    // Switch to view mode
    addDiscountRow(rowData, row, false);
    row.remove();
    saveTariffData();
}

function editDiscountRow(btn) {
    const row = btn.closest('tr');
    const rowDataJson = row.getAttribute('data-row-data');
    const rowData = rowDataJson ? JSON.parse(rowDataJson) : null;
    
    // Switch to editing mode
    addDiscountRow(rowData, row, true);
    row.remove();
}

function addSurchargeRow(rowData = null, insertAfterRow = null, isNew = false) {
    const tbody = document.getElementById('surcharges-tbody');
    const row = document.createElement('tr');
    
    const isEditing = isNew || !rowData;
    
    if (isEditing) {
        // Editing mode
        row.innerHTML = `
            <td></td>
            <td><input type="text" class="surcharge-type" value="${rowData?.type || ''}" placeholder="Например: За висок риск"></td>
            <td><input type="text" class="surcharge-condition" value="${rowData?.condition || ''}" placeholder="Например: Възраст на водача: 18-25"></td>
            <td><input type="number" class="surcharge-value" value="${rowData?.value || ''}" min="0" step="0.01"></td>
            <td>
                <button class="btn-action btn-save" onclick="saveSurchargeRow(this)" title="ОК">ОК</button>
            </td>
        `;
        row.classList.add('editing-row');
    } else {
        // View mode
        row.innerHTML = `
            <td>
                <button class="btn-action btn-move-up" onclick="moveSurchargeRowUp(this)" title="Нагоре">↑</button>
                <button class="btn-action btn-move-down" onclick="moveSurchargeRowDown(this)" title="Надолу">↓</button>
            </td>
            <td class="surcharge-type-display">${rowData.type || ''}</td>
            <td class="surcharge-condition-display">${rowData.condition || ''}</td>
            <td class="surcharge-value-display">${rowData.value !== null && rowData.value !== undefined ? rowData.value : ''}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editSurchargeRow(this)" title="Редактирай">Редактирай</button>
                <button class="btn-action btn-delete" onclick="deleteRow(this)">Изтрий</button>
            </td>
        `;
        row.classList.add('view-row');
        row.setAttribute('data-row-data', JSON.stringify(rowData));
    }
    
    if (insertAfterRow) {
        insertAfterRow.insertAdjacentElement('afterend', row);
    } else {
        tbody.appendChild(row);
    }
}

function saveSurchargeRow(btn) {
    const row = btn.closest('tr');
    const type = row.querySelector('.surcharge-type').value;
    const condition = row.querySelector('.surcharge-condition').value;
    const value = row.querySelector('.surcharge-value').value;
    
    const rowData = {
        type: type || '',
        condition: condition || '',
        value: value ? parseFloat(value) : null
    };
    
    // Switch to view mode
    addSurchargeRow(rowData, row, false);
    row.remove();
    saveTariffData();
}

function editSurchargeRow(btn) {
    const row = btn.closest('tr');
    const rowDataJson = row.getAttribute('data-row-data');
    const rowData = rowDataJson ? JSON.parse(rowDataJson) : null;
    
    // Switch to editing mode
    addSurchargeRow(rowData, row, true);
    row.remove();
}

function deleteRow(btn) {
    if (confirm('Сигурни ли сте, че искате да изтриете този ред?')) {
        btn.closest('tr').remove();
        saveTariffData();
    }
}

function moveTariffRowUp(btn) {
    const row = btn.closest('tr');
    const prevRow = row.previousElementSibling;
    if (prevRow && prevRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(row, prevRow);
        saveTariffData();
    }
}

function moveTariffRowDown(btn) {
    const row = btn.closest('tr');
    const nextRow = row.nextElementSibling;
    if (nextRow && nextRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(nextRow, row);
        saveTariffData();
    }
}

function moveDiscountRowUp(btn) {
    const row = btn.closest('tr');
    const prevRow = row.previousElementSibling;
    if (prevRow && prevRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(row, prevRow);
        saveTariffData();
    }
}

function moveDiscountRowDown(btn) {
    const row = btn.closest('tr');
    const nextRow = row.nextElementSibling;
    if (nextRow && nextRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(nextRow, row);
        saveTariffData();
    }
}

function moveSurchargeRowUp(btn) {
    const row = btn.closest('tr');
    const prevRow = row.previousElementSibling;
    if (prevRow && prevRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(row, prevRow);
        saveTariffData();
    }
}

function moveSurchargeRowDown(btn) {
    const row = btn.closest('tr');
    const nextRow = row.nextElementSibling;
    if (nextRow && nextRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(nextRow, row);
        saveTariffData();
    }
}

function collectTableData() {
    const data = {
        tariffs: [],
        discounts: [],
        surcharges: []
    };

    // Collect tariff data (only view rows)
    const tariffRows = document.querySelectorAll('#tariffs-tbody tr.view-row');
    tariffRows.forEach(row => {
        const rowDataJson = row.getAttribute('data-row-data');
        if (rowDataJson) {
            data.tariffs.push(JSON.parse(rowDataJson));
        }
    });

    // Collect discount data (only view rows)
    const discountRows = document.querySelectorAll('#discounts-tbody tr.view-row');
    discountRows.forEach(row => {
        const rowDataJson = row.getAttribute('data-row-data');
        if (rowDataJson) {
            data.discounts.push(JSON.parse(rowDataJson));
        }
    });

    // Collect surcharge data (only view rows)
    const surchargeRows = document.querySelectorAll('#surcharges-tbody tr.view-row');
    surchargeRows.forEach(row => {
        const rowDataJson = row.getAttribute('data-row-data');
        if (rowDataJson) {
            data.surcharges.push(JSON.parse(rowDataJson));
        }
    });

    return data;
}

function loadTableData(data) {
    // Load tariffs
    const tariffsTbody = document.getElementById('tariffs-tbody');
    tariffsTbody.innerHTML = '';
    if (data.tariffs && data.tariffs.length > 0) {
        data.tariffs.forEach(row => addTariffRow(row, null, false));
    }

    // Load discounts
    const discountsTbody = document.getElementById('discounts-tbody');
    discountsTbody.innerHTML = '';
    if (data.discounts && data.discounts.length > 0) {
        data.discounts.forEach(row => addDiscountRow(row, null, false));
    }

    // Load surcharges
    const surchargesTbody = document.getElementById('surcharges-tbody');
    surchargesTbody.innerHTML = '';
    if (data.surcharges && data.surcharges.length > 0) {
        data.surcharges.forEach(row => addSurchargeRow(row, null, false));
    }
}

async function loadTariffData() {
    if (!currentInsurer || !currentInsuranceType) {
        return;
    }
    
    try {
        const tariffKey = `${currentInsurer}-${currentInsuranceType}`;
        const response = await fetch(`/api/admin/tariffs/${tariffKey}`);
        if (response.ok) {
            const data = await response.json();
            loadTableData(data);
        } else {
            loadTableData({ tariffs: [], discounts: [], surcharges: [] });
        }
    } catch (error) {
        console.error('Error loading tariff data:', error);
        loadTableData({ tariffs: [], discounts: [], surcharges: [] });
    }
}

async function saveTariffData() {
    if (!currentInsurer || !currentInsuranceType) {
        return;
    }
    
    const data = collectTableData();
    
    try {
        const tariffKey = `${currentInsurer}-${currentInsuranceType}`;
        const response = await fetch(`/api/admin/tariffs/${tariffKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log('Тарифите бяха успешно запазени!');
        } else {
            console.error('Грешка при запазване на тарифите');
        }
    } catch (error) {
        console.error('Грешка при запазване:', error);
    }
}

// Make functions available globally
window.deleteRow = deleteRow;
window.saveTariffRow = saveTariffRow;
window.editTariffRow = editTariffRow;
window.moveTariffRowUp = moveTariffRowUp;
window.moveTariffRowDown = moveTariffRowDown;
window.saveDiscountRow = saveDiscountRow;
window.editDiscountRow = editDiscountRow;
window.moveDiscountRowUp = moveDiscountRowUp;
window.moveDiscountRowDown = moveDiscountRowDown;
window.saveSurchargeRow = saveSurchargeRow;
window.editSurchargeRow = editSurchargeRow;
window.moveSurchargeRowUp = moveSurchargeRowUp;
window.moveSurchargeRowDown = moveSurchargeRowDown;
