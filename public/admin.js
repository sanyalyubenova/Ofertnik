let currentInsurer = '';
let currentInsuranceType = '';
let currentPaymentType = 'cash'; // Default to 'cash'

// Helper function to format tariff rate without trailing zeros
function formatTariffRate(rate) {
    if (rate === null || rate === undefined || rate === '') return '';
    const numRate = parseFloat(rate);
    if (isNaN(numRate)) return '';
    // Remove trailing zeros by converting to float and back to string
    return parseFloat(numRate.toFixed(4)).toString();
}

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
                // Update headers first (for CASCO, may need to show/hide model column)
                if (currentInsuranceType === 'casco') {
                    updateCASCOTableHeaders();
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
    const paymentTypeGroup = document.getElementById('payment-type-group');
    
    insuranceTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            insuranceTypeButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            currentInsuranceType = btn.dataset.value;
            
            // Show/hide payment type buttons only for CASCO
            if (paymentTypeGroup) {
                if (currentInsuranceType === 'casco') {
                    paymentTypeGroup.style.display = 'block';
                } else {
                    paymentTypeGroup.style.display = 'none';
                    // Reset payment type when switching away from CASCO
                    currentPaymentType = 'cash';
                }
            }
            
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
    
    // Initialize payment type buttons
    initializePaymentTypeSelect();
}

function initializePaymentTypeSelect() {
    const paymentTypeButtons = document.querySelectorAll('#payment-type-buttons .option-btn');
    const tabsContainer = document.querySelector('.tabs-container');
    
    // Set first button (Кеш) as active by default
    if (paymentTypeButtons.length > 0) {
        paymentTypeButtons[0].classList.add('active');
        currentPaymentType = paymentTypeButtons[0].dataset.value || 'cash';
    }
    
    paymentTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            paymentTypeButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            currentPaymentType = btn.dataset.value || 'cash';
            
            // Reload tariff data if both insurer and insurance type are selected
            if (currentInsurer && currentInsuranceType) {
                // Update headers first (for CASCO, may need to show/hide model column)
                if (currentInsuranceType === 'casco') {
                    updateCASCOTableHeaders();
                }
                updateTariffEditTitle();
                loadTariffData();
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
    
    // Show/hide sections based on insurance type
    updateTariffSections();
}

function updateTariffSections() {
    // Hide all sections first
    document.getElementById('casco-tariffs-section').style.display = 'none';
    document.getElementById('mtpl-tariffs-section').style.display = 'none';
    
    if (currentInsuranceType === 'casco') {
        // CASCO: Show CASCO tariffs table
        document.getElementById('casco-tariffs-section').style.display = 'block';
        // Update CASCO table headers (may include model column for Generali leasing)
        updateCASCOTableHeaders();
        // Hide MTPL section headers
        const mtplThead = document.getElementById('mtpl-tariffs-thead');
        if (mtplThead) mtplThead.innerHTML = '';
    } else if (currentInsuranceType === 'mtpl') {
        // MTPL: Show MTPL tariffs table with dynamic headers based on insurer
        document.getElementById('mtpl-tariffs-section').style.display = 'block';
        updateMTPLTableHeaders();
    }
}

function updateCASCOTableHeaders() {
    const thead = document.querySelector('#tariffs-table thead tr');
    if (!thead) return;
    
    // Check if we need model column (Generali + leasing)
    const needsModelColumn = currentInsurer === 'generali' && currentPaymentType === 'leasing';
    
    // Find existing model header
    const existingModelHeader = Array.from(thead.querySelectorAll('th')).find(th => th.textContent.trim() === 'Модел');
    
    if (needsModelColumn) {
        // Add model column if it doesn't exist
        if (!existingModelHeader) {
            // Insert model column before "Тарифен процент"
            const rateHeader = Array.from(thead.querySelectorAll('th')).find(th => th.textContent.includes('Тарифен процент'));
            if (rateHeader) {
                const modelHeader = document.createElement('th');
                modelHeader.textContent = 'Модел';
                modelHeader.style.minWidth = '200px';
                rateHeader.insertAdjacentElement('beforebegin', modelHeader);
            }
        }
    } else {
        // Remove model column if it exists
        if (existingModelHeader) {
            existingModelHeader.remove();
        }
    }
}

function updateMTPLTableHeaders() {
    const thead = document.getElementById('mtpl-tariffs-thead');
    if (!thead) return;
    
    let headers = '<tr><th style="width: 60px;"></th>';
    
    // Common headers for all insurers
    headers += '<th>Обем двигател (от)</th>';
    headers += '<th>Обем двигател (до)</th>';
    
    // Insurer-specific headers
    if (currentInsurer === 'dzi') {
        // ДЗИ: обем двигател, възраст на собственика, адресна регистрация, тип собственик, базова премия
        headers += '<th>Възраст на собственика (от)</th>';
        headers += '<th>Възраст на собственика (до)</th>';
        headers += '<th>Тип собственик</th>';
        headers += '<th>Регион</th>';
        headers += '<th>Базова премия (€)</th>';
    } else if (currentInsurer === 'armeec') {
        // Армеец: обем двигател, адресна регистрация, базова премия
        headers += '<th>Регион</th>';
        headers += '<th>Базова премия (€)</th>';
    } else if (currentInsurer === 'generali') {
        // Дженерали: обем двигател, kW, адресна регистрация, тип собственик, възраст (ако ФЛ), възраст на колата, базова премия
        headers += '<th>kW (от)</th>';
        headers += '<th>kW (до)</th>';
        headers += '<th>Регион</th>';
        headers += '<th>Тип собственик</th>';
        headers += '<th>Възраст на собственика (от)</th>';
        headers += '<th>Възраст на собственика (до)</th>';
        headers += '<th>Възраст на колата (от)</th>';
        headers += '<th>Възраст на колата (до)</th>';
        headers += '<th>Базова премия (€)</th>';
    } else if (currentInsurer === 'bulstrad') {
        // Булстрад: обем двигател, kW, адресна регистрация, възраст на собственика, възраст на колата, базова премия
        headers += '<th>kW (от)</th>';
        headers += '<th>kW (до)</th>';
        headers += '<th>Регион</th>';
        headers += '<th>Възраст на собственика (от)</th>';
        headers += '<th>Възраст на собственика (до)</th>';
        headers += '<th>Възраст на колата (от)</th>';
        headers += '<th>Възраст на колата (до)</th>';
        headers += '<th>Базова премия (€)</th>';
    } else {
        // Default for other insurers: обем двигател, базова премия
        headers += '<th>Базова премия (€)</th>';
    }
    
    headers += '<th>Действия</th></tr>';
    thead.innerHTML = headers;
}

function initializeTables() {
    document.getElementById('add-tariff-row').addEventListener('click', () => {
        addTariffRow(null, null, true);
    });
    
    // Copy last CASCO tariff row button
    document.getElementById('copy-last-tariff-row')?.addEventListener('click', () => {
        copyLastTariffRow();
    });

    document.getElementById('add-discount-row').addEventListener('click', () => {
        addDiscountRow(null, null, true);
    });

    document.getElementById('add-surcharge-row').addEventListener('click', () => {
        addSurchargeRow(null, null, true);
    });
    
    // MTPL tariff row button
    document.getElementById('add-mtpl-tariff-row')?.addEventListener('click', () => {
        // Ensure headers are generated first
        if (currentInsuranceType === 'mtpl' && currentInsurer) {
            updateMTPLTableHeaders();
        }
        addMTPLTariffRow(null, null, true);
    });
    
    // Copy last MTPL row button
    document.getElementById('copy-last-mtpl-row')?.addEventListener('click', () => {
        copyLastMTPLTariffRow();
    });
}

function copyLastTariffRow() {
    const tbody = document.getElementById('tariffs-tbody');
    if (!tbody) return;
    
    const viewRows = Array.from(tbody.querySelectorAll('tr.view-row'));
    if (viewRows.length === 0) {
        alert('Няма редове за копиране. Моля, добавете първо ред.');
        return;
    }
    
    // Get the last row's data
    const lastRow = viewRows[viewRows.length - 1];
    const lastRowDataJson = lastRow.getAttribute('data-row-data');
    if (!lastRowDataJson) {
        alert('Не може да се копира последният ред.');
        return;
    }
    
    const lastRowData = JSON.parse(lastRowDataJson);
    
    // Create a copy - deep copy
    const copiedData = JSON.parse(JSON.stringify(lastRowData));
    
    // Add new row with copied data in edit mode
    addTariffRow(copiedData, null, true);
    
    // Scroll to the new row
    setTimeout(() => {
        const newRow = tbody.querySelector('tr.editing-row:last-child');
        if (newRow) {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}

function copyLastMTPLTariffRow() {
    const tbody = document.getElementById('mtpl-tariffs-tbody');
    if (!tbody) return;
    
    const viewRows = Array.from(tbody.querySelectorAll('tr.view-row'));
    if (viewRows.length === 0) {
        alert('Няма редове за копиране. Моля, добавете първо ред.');
        return;
    }
    
    // Get the last row's data
    const lastRow = viewRows[viewRows.length - 1];
    const lastRowDataJson = lastRow.getAttribute('data-row-data');
    if (!lastRowDataJson) {
        alert('Не може да се копира последният ред.');
        return;
    }
    
    const lastRowData = JSON.parse(lastRowDataJson);
    
    // Create a copy with cleared base premium (optional - user might want to keep it)
    // For now, we'll copy everything as-is
    const copiedData = JSON.parse(JSON.stringify(lastRowData)); // Deep copy
    
    // Add new row with copied data in edit mode
    addMTPLTariffRow(copiedData, null, true);
    
    // Scroll to the new row
    setTimeout(() => {
        const newRow = tbody.querySelector('tr.editing-row:last-child');
        if (newRow) {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}

function addTariffRow(rowData = null, insertAfterRow = null, isNew = false) {
    const tbody = document.getElementById('tariffs-tbody');
    const row = document.createElement('tr');
    
    const isEditing = isNew || !rowData;
    
    // Check if we need model column (Generali + leasing)
    const needsModelColumn = currentInsurer === 'generali' && currentPaymentType === 'leasing';
    
    // Hyundai models list
        const hyundaiModels = ['i10', 'i20', 'i30', 'i30 N', 'i40', 'Kona', 'Tucson', 'Santa Fe', 'Elantra', 'IONIQ', 'IONIQ 5', 'IONIQ 6', 'IONIQ 9', 'Bayon', 'ix35', 'Staria'];
        
    if (isEditing) {
        // Editing mode - show inputs with "Добави" button
        let modelCell = '';
        if (needsModelColumn) {
            // Get selected models (can be array or single value for backward compatibility)
            const selectedModels = Array.isArray(rowData?.models) ? rowData.models : 
                                  (rowData?.model ? [rowData.model] : []);
            
            // Create checkbox container
            let modelCheckboxes = '<div class="model-checkboxes" style="display: flex; flex-wrap: wrap; gap: 5px; max-width: 200px;">';
            hyundaiModels.forEach(model => {
                const isChecked = selectedModels.includes(model) ? 'checked' : '';
                modelCheckboxes += `<label style="display: flex; align-items: center; font-size: 0.85rem; white-space: nowrap;">
                    <input type="checkbox" class="tariff-model-checkbox" value="${model}" ${isChecked} style="margin-right: 3px;">
                    ${model}
                </label>`;
            });
            modelCheckboxes += '</div>';
            modelCell = `<td style="min-width: 200px;">${modelCheckboxes}</td>`;
        }
        
        row.innerHTML = `
            <td></td>
            <td><input type="number" class="tariff-from-age" value="${rowData?.fromAge || ''}" min="0" step="1"></td>
            <td><input type="number" class="tariff-to-age" value="${rowData?.toAge || ''}" min="0" step="1"></td>
            <td><input type="number" class="tariff-from-value" value="${rowData?.fromValue || ''}" min="0" step="0.01"></td>
            <td><input type="number" class="tariff-to-value" value="${rowData?.toValue || ''}" min="0" step="0.01"></td>
            ${modelCell}
            <td><input type="number" class="tariff-rate" value="${rowData?.rate ? formatTariffRate(rowData.rate) : ''}" min="0" step="0.001"></td>
            <td>
                <button class="btn-action btn-save" onclick="saveTariffRow(this)" title="ОК">ОК</button>
            </td>
        `;
        row.classList.add('editing-row');
    } else {
        // View mode - show text with "Изтрий" and "Редактирай" buttons
        let modelCell = '';
        if (needsModelColumn) {
            // Get selected models (can be array or single value for backward compatibility)
            const selectedModels = Array.isArray(rowData?.models) ? rowData.models : 
                                  (rowData?.model ? [rowData.model] : []);
            const modelDisplay = selectedModels.length > 0 ? selectedModels.join(', ') : 'Всички';
            modelCell = `<td class="tariff-model-display" style="max-width: 200px;">${modelDisplay}</td>`;
        }
        
        row.innerHTML = `
            <td>
                <button class="btn-action btn-move-up" onclick="moveTariffRowUp(this)" title="Нагоре">↑</button>
                <button class="btn-action btn-move-down" onclick="moveTariffRowDown(this)" title="Надолу">↓</button>
            </td>
            <td class="tariff-from-age-display">${rowData.fromAge !== null && rowData.fromAge !== undefined ? rowData.fromAge : ''}</td>
            <td class="tariff-to-age-display">${rowData.toAge !== null && rowData.toAge !== undefined ? rowData.toAge : ''}</td>
            <td class="tariff-from-value-display">${rowData.fromValue !== null && rowData.fromValue !== undefined ? rowData.fromValue : ''}</td>
            <td class="tariff-to-value-display">${rowData.toValue !== null && rowData.toValue !== undefined ? rowData.toValue : ''}</td>
            ${modelCell}
            <td class="tariff-rate-display">${formatTariffRate(rowData.rate)}</td>
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
    
    // Check if we need model column (Generali + leasing)
    const needsModelColumn = currentInsurer === 'generali' && currentPaymentType === 'leasing';
    const modelCheckboxes = row.querySelectorAll('.tariff-model-checkbox:checked');
    const selectedModels = Array.from(modelCheckboxes).map(cb => cb.value);
    
    const rowData = {
        fromAge: fromAge ? parseInt(fromAge) : null,
        toAge: toAge ? parseInt(toAge) : null,
        fromValue: fromValue ? parseFloat(fromValue) : null,
        toValue: toValue ? parseFloat(toValue) : null,
        rate: rate ? parseFloat(rate) : null
    };
    
    // Add models only if needed and if any are selected
    if (needsModelColumn) {
        rowData.models = selectedModels.length > 0 ? selectedModels : null;
    }
    
    console.log('Saving tariff row with data:', rowData);
    
    // Switch to view mode - insert new row before removing old one
    const newRow = addTariffRow(rowData, row, false);
    row.remove();
    
    // Verify the new row has data-row-data attribute
    const newRowElement = document.querySelector('#tariffs-tbody tr.view-row[data-row-data]');
    if (newRowElement) {
        console.log('New row data:', newRowElement.getAttribute('data-row-data'));
    } else {
        console.error('ERROR: New row does not have data-row-data attribute!');
    }
    
    // Small delay to ensure DOM is updated before saving
    setTimeout(() => {
        const data = collectTableData();
        console.log('Collected data before save:', data);
        saveTariffData();
    }, 100);
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
        console.log('Moved tariff row up, saving...');
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            saveTariffData();
        }, 50);
    }
}

function moveTariffRowDown(btn) {
    const row = btn.closest('tr');
    const nextRow = row.nextElementSibling;
    if (nextRow && nextRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(nextRow, row);
        console.log('Moved tariff row down, saving...');
        // Small delay to ensure DOM is updated
        setTimeout(() => {
            saveTariffData();
        }, 50);
    }
}

function moveDiscountRowUp(btn) {
    const row = btn.closest('tr');
    const prevRow = row.previousElementSibling;
    if (prevRow && prevRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(row, prevRow);
        console.log('Moved discount row up, saving...');
        setTimeout(() => {
            saveTariffData();
        }, 50);
    }
}

function moveDiscountRowDown(btn) {
    const row = btn.closest('tr');
    const nextRow = row.nextElementSibling;
    if (nextRow && nextRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(nextRow, row);
        console.log('Moved discount row down, saving...');
        setTimeout(() => {
            saveTariffData();
        }, 50);
    }
}

function moveSurchargeRowUp(btn) {
    const row = btn.closest('tr');
    const prevRow = row.previousElementSibling;
    if (prevRow && prevRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(row, prevRow);
        console.log('Moved surcharge row up, saving...');
        setTimeout(() => {
            saveTariffData();
        }, 50);
    }
}

function moveSurchargeRowDown(btn) {
    const row = btn.closest('tr');
    const nextRow = row.nextElementSibling;
    if (nextRow && nextRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(nextRow, row);
        console.log('Moved surcharge row down, saving...');
        setTimeout(() => {
            saveTariffData();
        }, 50);
    }
}

function collectTableData() {
    const data = {
        tariffs: [],
        discounts: [],
        surcharges: []
    };

    if (currentInsuranceType === 'casco') {
        // CASCO: Collect tariff data (only view rows) - querySelectorAll returns elements in DOM order
        const tariffRows = Array.from(document.querySelectorAll('#tariffs-tbody tr.view-row'));
        console.log(`Collecting ${tariffRows.length} tariff rows in DOM order`);
        tariffRows.forEach((row, index) => {
            const rowDataJson = row.getAttribute('data-row-data');
            if (rowDataJson) {
                const rowData = JSON.parse(rowDataJson);
                data.tariffs.push(rowData);
                console.log(`  Tariff ${index + 1}:`, rowData);
            }
        });
    } else if (currentInsuranceType === 'mtpl') {
        // MTPL: Collect MTPL tariff data (base premiums table)
        const mtplTariffRows = Array.from(document.querySelectorAll('#mtpl-tariffs-tbody tr.view-row'));
        console.log(`Collecting ${mtplTariffRows.length} MTPL tariff rows in DOM order`);
        mtplTariffRows.forEach((row, index) => {
            const rowDataJson = row.getAttribute('data-row-data');
            if (rowDataJson) {
                const rowData = JSON.parse(rowDataJson);
                data.tariffs.push(rowData);
                console.log(`  MTPL Tariff ${index + 1}:`, rowData);
            }
        });
        
        // Also preserve old structure if it exists (for backward compatibility)
        if (data.basePremium !== undefined) {
            data.basePremium = data.basePremium;
        }
        if (data.engineSizeMultiplier !== undefined) {
            data.engineSizeMultiplier = data.engineSizeMultiplier;
        }
        if (data.powerMultiplier !== undefined) {
            data.powerMultiplier = data.powerMultiplier;
        }
    }

    // Collect discount data (only view rows)
    const discountRows = Array.from(document.querySelectorAll('#discounts-tbody tr.view-row'));
    console.log(`Collecting ${discountRows.length} discount rows in DOM order`);
    discountRows.forEach((row, index) => {
        const rowDataJson = row.getAttribute('data-row-data');
        if (rowDataJson) {
            const rowData = JSON.parse(rowDataJson);
            data.discounts.push(rowData);
            console.log(`  Discount ${index + 1}:`, rowData);
        }
    });

    // Collect surcharge data (only view rows)
    const surchargeRows = Array.from(document.querySelectorAll('#surcharges-tbody tr.view-row'));
    console.log(`Collecting ${surchargeRows.length} surcharge rows in DOM order`);
    surchargeRows.forEach((row, index) => {
        const rowDataJson = row.getAttribute('data-row-data');
        if (rowDataJson) {
            const rowData = JSON.parse(rowDataJson);
            data.surcharges.push(rowData);
            console.log(`  Surcharge ${index + 1}:`, rowData);
        }
    });

    console.log('Collected data:', data);
    return data;
}

function loadTableData(data) {
    if (currentInsuranceType === 'casco') {
        // CASCO: Load tariffs
        // Update headers first to ensure model column is shown/hidden correctly
        updateCASCOTableHeaders();
        const tariffsTbody = document.getElementById('tariffs-tbody');
        tariffsTbody.innerHTML = '';
        if (data.tariffs && data.tariffs.length > 0) {
            data.tariffs.forEach(row => addTariffRow(row, null, false));
        }
    } else if (currentInsuranceType === 'mtpl') {
        // MTPL: Load MTPL tariffs (base premiums table)
        const mtplTariffsTbody = document.getElementById('mtpl-tariffs-tbody');
        if (mtplTariffsTbody) {
            mtplTariffsTbody.innerHTML = '';
            if (data.tariffs && data.tariffs.length > 0) {
                // Load new table structure
                data.tariffs.forEach(row => addMTPLTariffRow(row, null, false));
            } else if (data.basePremium !== undefined) {
                // Convert old structure to new structure for backward compatibility
                // This handles existing files with basePremium + multipliers
                // We can create a default row or leave it empty
                console.log('Found old MTPL structure, converting...');
                // For now, leave empty - user can add rows manually
            }
        }
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
    
    // Update sections visibility first
    updateTariffSections();
    
    try {
        // For CASCO, include payment type in the tariff key
        let tariffKey;
        if (currentInsuranceType === 'casco') {
            tariffKey = `${currentInsurer}-${currentInsuranceType}-${currentPaymentType}`;
        } else {
            tariffKey = `${currentInsurer}-${currentInsuranceType}`;
        }
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
        console.warn('Cannot save: missing insurer or insurance type');
        return;
    }
    
    const data = collectTableData();
    console.log('Saving tariff data:', data);
    
    try {
        // For CASCO, include payment type in the tariff key
        let tariffKey;
        if (currentInsuranceType === 'casco') {
            tariffKey = `${currentInsurer}-${currentInsuranceType}-${currentPaymentType}`;
        } else {
            tariffKey = `${currentInsurer}-${currentInsuranceType}`;
        }
        const response = await fetch(`/api/admin/tariffs/${tariffKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Тарифите бяха успешно запазени!', result);
            // Show success message to user
        } else {
            const errorText = await response.text();
            console.error('Грешка при запазване на тарифите:', response.status, errorText);
            alert('Грешка при запазване на тарифите. Проверете конзолата за подробности.');
        }
    } catch (error) {
        console.error('Грешка при запазване:', error);
        alert('Грешка при запазване на тарифите: ' + error.message);
    }
}

// MTPL Tariff Row Management
function addMTPLTariffRow(rowData = null, insertAfterRow = null, isNew = false) {
    const tbody = document.getElementById('mtpl-tariffs-tbody');
    if (!tbody) {
        console.error('mtpl-tariffs-tbody not found!');
        return null;
    }
    
    const row = document.createElement('tr');
    const isEditing = isNew || !rowData;
    
    if (isEditing) {
        // Editing mode - generate inputs based on insurer
        let html = '<td></td>';
        html += `<td><input type="number" class="mtpl-engine-from" value="${rowData?.engineFrom || ''}" min="0" step="0.01"></td>`;
        html += `<td><input type="number" class="mtpl-engine-to" value="${rowData?.engineTo !== null && rowData?.engineTo !== undefined ? rowData.engineTo : ''}" min="0" step="0.01" placeholder="+ за над"></td>`;
        
        // Insurer-specific inputs
        if (currentInsurer === 'dzi') {
            html += `<td><input type="number" class="mtpl-owner-age-from" value="${rowData?.ownerAgeFrom || ''}" min="0" step="1"></td>`;
            html += `<td><input type="number" class="mtpl-owner-age-to" value="${rowData?.ownerAgeTo !== null && rowData?.ownerAgeTo !== undefined ? rowData.ownerAgeTo : ''}" min="0" step="1" placeholder="+ за над"></td>`;
            html += `<td>
                <select class="mtpl-owner-type">
                    <option value="person" ${rowData?.ownerType === 'person' ? 'selected' : ''}>Физическо лице</option>
                    <option value="company" ${rowData?.ownerType === 'company' ? 'selected' : ''}>Юридическо лице</option>
                </select>
            </td>`;
            html += `<td><input type="text" class="mtpl-region" value="${rowData?.region || ''}" placeholder="Регион"></td>`;
            html += `<td><input type="number" class="mtpl-base-premium" value="${rowData?.basePremium || ''}" min="0" step="0.01"></td>`;
        } else if (currentInsurer === 'armeec') {
            html += `<td><input type="text" class="mtpl-region" value="${rowData?.region || ''}" placeholder="Регион"></td>`;
            html += `<td><input type="number" class="mtpl-base-premium" value="${rowData?.basePremium || ''}" min="0" step="0.01"></td>`;
        } else if (currentInsurer === 'generali') {
            html += `<td><input type="number" class="mtpl-power-from" value="${rowData?.powerFrom || ''}" min="0" step="0.01"></td>`;
            html += `<td><input type="number" class="mtpl-power-to" value="${rowData?.powerTo !== null && rowData?.powerTo !== undefined ? rowData.powerTo : ''}" min="0" step="0.01" placeholder="+ за над"></td>`;
            html += `<td><input type="text" class="mtpl-region" value="${rowData?.region || ''}" placeholder="Регион"></td>`;
            html += `<td>
                <select class="mtpl-owner-type">
                    <option value="person" ${rowData?.ownerType === 'person' ? 'selected' : ''}>Физическо лице</option>
                    <option value="company" ${rowData?.ownerType === 'company' ? 'selected' : ''}>Юридическо лице</option>
                </select>
            </td>`;
            html += `<td><input type="number" class="mtpl-owner-age-from" value="${rowData?.ownerAgeFrom || ''}" min="0" step="1"></td>`;
            html += `<td><input type="number" class="mtpl-owner-age-to" value="${rowData?.ownerAgeTo !== null && rowData?.ownerAgeTo !== undefined ? rowData.ownerAgeTo : ''}" min="0" step="1" placeholder="+ за над"></td>`;
            html += `<td><input type="number" class="mtpl-vehicle-age-from" value="${rowData?.vehicleAgeFrom || ''}" min="0" step="1"></td>`;
            html += `<td><input type="number" class="mtpl-vehicle-age-to" value="${rowData?.vehicleAgeTo !== null && rowData?.vehicleAgeTo !== undefined ? rowData.vehicleAgeTo : ''}" min="0" step="1" placeholder="+ за над"></td>`;
            html += `<td><input type="number" class="mtpl-base-premium" value="${rowData?.basePremium || ''}" min="0" step="0.01"></td>`;
        } else if (currentInsurer === 'bulstrad') {
            html += `<td><input type="number" class="mtpl-power-from" value="${rowData?.powerFrom || ''}" min="0" step="0.01"></td>`;
            html += `<td><input type="number" class="mtpl-power-to" value="${rowData?.powerTo !== null && rowData?.powerTo !== undefined ? rowData.powerTo : ''}" min="0" step="0.01" placeholder="+ за над"></td>`;
            html += `<td><input type="text" class="mtpl-region" value="${rowData?.region || ''}" placeholder="Регион"></td>`;
            html += `<td><input type="number" class="mtpl-owner-age-from" value="${rowData?.ownerAgeFrom || ''}" min="0" step="1"></td>`;
            html += `<td><input type="number" class="mtpl-owner-age-to" value="${rowData?.ownerAgeTo !== null && rowData?.ownerAgeTo !== undefined ? rowData.ownerAgeTo : ''}" min="0" step="1" placeholder="+ за над"></td>`;
            html += `<td><input type="number" class="mtpl-vehicle-age-from" value="${rowData?.vehicleAgeFrom || ''}" min="0" step="1"></td>`;
            html += `<td><input type="number" class="mtpl-vehicle-age-to" value="${rowData?.vehicleAgeTo !== null && rowData?.vehicleAgeTo !== undefined ? rowData.vehicleAgeTo : ''}" min="0" step="1" placeholder="+ за над"></td>`;
            html += `<td><input type="number" class="mtpl-base-premium" value="${rowData?.basePremium || ''}" min="0" step="0.01"></td>`;
        } else {
            // Default for other insurers
            html += `<td><input type="number" class="mtpl-base-premium" value="${rowData?.basePremium || ''}" min="0" step="0.01"></td>`;
        }
        
        html += `<td><button class="btn-action btn-save" onclick="saveMTPLTariffRow(this)" title="ОК">ОК</button></td>`;
        row.innerHTML = html;
        row.classList.add('editing-row');
    } else {
        // View mode - display values
        let html = '<td><button class="btn-action btn-move-up" onclick="moveMTPLTariffRowUp(this)" title="Нагоре">↑</button><button class="btn-action btn-move-down" onclick="moveMTPLTariffRowDown(this)" title="Надолу">↓</button></td>';
        html += `<td class="mtpl-engine-from-display">${rowData.engineFrom !== null && rowData.engineFrom !== undefined ? rowData.engineFrom : ''}</td>`;
        html += `<td class="mtpl-engine-to-display">${rowData.engineTo !== null && rowData.engineTo !== undefined ? rowData.engineTo : '+'}</td>`;
        
        // Insurer-specific displays
        if (currentInsurer === 'dzi') {
            html += `<td class="mtpl-owner-age-from-display">${rowData.ownerAgeFrom !== null && rowData.ownerAgeFrom !== undefined ? rowData.ownerAgeFrom : ''}</td>`;
            html += `<td class="mtpl-owner-age-to-display">${rowData.ownerAgeTo !== null && rowData.ownerAgeTo !== undefined ? rowData.ownerAgeTo : '+'}</td>`;
            const ownerTypeText = rowData.ownerType === 'person' ? 'ФЛ' : (rowData.ownerType === 'company' ? 'ЮЛ' : '');
            html += `<td class="mtpl-owner-type-display">${ownerTypeText}</td>`;
            html += `<td class="mtpl-region-display">${rowData.region || ''}</td>`;
            html += `<td class="mtpl-base-premium-display">${rowData.basePremium || ''}</td>`;
        } else if (currentInsurer === 'armeec') {
            html += `<td class="mtpl-region-display">${rowData.region || ''}</td>`;
            html += `<td class="mtpl-base-premium-display">${rowData.basePremium || ''}</td>`;
        } else if (currentInsurer === 'generali') {
            html += `<td class="mtpl-power-from-display">${rowData.powerFrom !== null && rowData.powerFrom !== undefined ? rowData.powerFrom : ''}</td>`;
            html += `<td class="mtpl-power-to-display">${rowData.powerTo !== null && rowData.powerTo !== undefined ? rowData.powerTo : '+'}</td>`;
            html += `<td class="mtpl-region-display">${rowData.region || ''}</td>`;
            const ownerTypeText = rowData.ownerType === 'person' ? 'ФЛ' : (rowData.ownerType === 'company' ? 'ЮЛ' : '');
            html += `<td class="mtpl-owner-type-display">${ownerTypeText}</td>`;
            html += `<td class="mtpl-owner-age-from-display">${rowData.ownerAgeFrom !== null && rowData.ownerAgeFrom !== undefined ? rowData.ownerAgeFrom : ''}</td>`;
            html += `<td class="mtpl-owner-age-to-display">${rowData.ownerAgeTo !== null && rowData.ownerAgeTo !== undefined ? rowData.ownerAgeTo : '+'}</td>`;
            html += `<td class="mtpl-vehicle-age-from-display">${rowData.vehicleAgeFrom !== null && rowData.vehicleAgeFrom !== undefined ? rowData.vehicleAgeFrom : ''}</td>`;
            html += `<td class="mtpl-vehicle-age-to-display">${rowData.vehicleAgeTo !== null && rowData.vehicleAgeTo !== undefined ? rowData.vehicleAgeTo : '+'}</td>`;
            html += `<td class="mtpl-base-premium-display">${rowData.basePremium || ''}</td>`;
        } else if (currentInsurer === 'bulstrad') {
            html += `<td class="mtpl-power-from-display">${rowData.powerFrom !== null && rowData.powerFrom !== undefined ? rowData.powerFrom : ''}</td>`;
            html += `<td class="mtpl-power-to-display">${rowData.powerTo !== null && rowData.powerTo !== undefined ? rowData.powerTo : '+'}</td>`;
            html += `<td class="mtpl-region-display">${rowData.region || ''}</td>`;
            html += `<td class="mtpl-owner-age-from-display">${rowData.ownerAgeFrom !== null && rowData.ownerAgeFrom !== undefined ? rowData.ownerAgeFrom : ''}</td>`;
            html += `<td class="mtpl-owner-age-to-display">${rowData.ownerAgeTo !== null && rowData.ownerAgeTo !== undefined ? rowData.ownerAgeTo : '+'}</td>`;
            html += `<td class="mtpl-vehicle-age-from-display">${rowData.vehicleAgeFrom !== null && rowData.vehicleAgeFrom !== undefined ? rowData.vehicleAgeFrom : ''}</td>`;
            html += `<td class="mtpl-vehicle-age-to-display">${rowData.vehicleAgeTo !== null && rowData.vehicleAgeTo !== undefined ? rowData.vehicleAgeTo : '+'}</td>`;
            html += `<td class="mtpl-base-premium-display">${rowData.basePremium || ''}</td>`;
        } else {
            html += `<td class="mtpl-base-premium-display">${rowData.basePremium || ''}</td>`;
        }
        
        html += `<td>
            <button class="btn-action btn-edit" onclick="editMTPLTariffRow(this)" title="Редактирай">Редактирай</button>
            <button class="btn-action btn-delete" onclick="deleteMTPLTariffRow(this)">Изтрий</button>
        </td>`;
        row.innerHTML = html;
        row.classList.add('view-row');
        row.setAttribute('data-row-data', JSON.stringify(rowData));
    }
    
    if (insertAfterRow) {
        insertAfterRow.insertAdjacentElement('afterend', row);
    } else {
        tbody.appendChild(row);
    }
    
    return row;
}

function saveMTPLTariffRow(btn) {
    const row = btn.closest('tr');
    const rowData = {};
    
    // Common fields
    const engineFrom = row.querySelector('.mtpl-engine-from');
    const engineTo = row.querySelector('.mtpl-engine-to');
    if (engineFrom) rowData.engineFrom = engineFrom.value ? parseFloat(engineFrom.value) : null;
    if (engineTo) rowData.engineTo = engineTo.value ? parseFloat(engineTo.value) : null;
    
    // Insurer-specific fields
    if (currentInsurer === 'dzi') {
        const ownerAgeFrom = row.querySelector('.mtpl-owner-age-from');
        const ownerAgeTo = row.querySelector('.mtpl-owner-age-to');
        const ownerType = row.querySelector('.mtpl-owner-type');
        const region = row.querySelector('.mtpl-region');
        const basePremium = row.querySelector('.mtpl-base-premium');
        if (ownerAgeFrom) rowData.ownerAgeFrom = ownerAgeFrom.value ? parseInt(ownerAgeFrom.value) : null;
        if (ownerAgeTo) rowData.ownerAgeTo = ownerAgeTo.value ? parseInt(ownerAgeTo.value) : null;
        if (ownerType) rowData.ownerType = ownerType.value || null;
        if (region) rowData.region = region.value.trim() || null;
        if (basePremium) rowData.basePremium = basePremium.value ? parseFloat(basePremium.value) : null;
    } else if (currentInsurer === 'armeec') {
        const region = row.querySelector('.mtpl-region');
        const basePremium = row.querySelector('.mtpl-base-premium');
        if (region) rowData.region = region.value.trim() || null;
        if (basePremium) rowData.basePremium = basePremium.value ? parseFloat(basePremium.value) : null;
    } else if (currentInsurer === 'generali') {
        const powerFrom = row.querySelector('.mtpl-power-from');
        const powerTo = row.querySelector('.mtpl-power-to');
        const region = row.querySelector('.mtpl-region');
        const ownerType = row.querySelector('.mtpl-owner-type');
        const ownerAgeFrom = row.querySelector('.mtpl-owner-age-from');
        const ownerAgeTo = row.querySelector('.mtpl-owner-age-to');
        const vehicleAgeFrom = row.querySelector('.mtpl-vehicle-age-from');
        const vehicleAgeTo = row.querySelector('.mtpl-vehicle-age-to');
        const basePremium = row.querySelector('.mtpl-base-premium');
        if (powerFrom) rowData.powerFrom = powerFrom.value ? parseFloat(powerFrom.value) : null;
        if (powerTo) rowData.powerTo = powerTo.value ? parseFloat(powerTo.value) : null;
        if (region) rowData.region = region.value.trim() || null;
        if (ownerType) rowData.ownerType = ownerType.value || null;
        if (ownerAgeFrom) rowData.ownerAgeFrom = ownerAgeFrom.value ? parseInt(ownerAgeFrom.value) : null;
        if (ownerAgeTo) rowData.ownerAgeTo = ownerAgeTo.value ? parseInt(ownerAgeTo.value) : null;
        if (vehicleAgeFrom) rowData.vehicleAgeFrom = vehicleAgeFrom.value ? parseInt(vehicleAgeFrom.value) : null;
        if (vehicleAgeTo) rowData.vehicleAgeTo = vehicleAgeTo.value ? parseInt(vehicleAgeTo.value) : null;
        if (basePremium) rowData.basePremium = basePremium.value ? parseFloat(basePremium.value) : null;
    } else if (currentInsurer === 'bulstrad') {
        const powerFrom = row.querySelector('.mtpl-power-from');
        const powerTo = row.querySelector('.mtpl-power-to');
        const region = row.querySelector('.mtpl-region');
        const ownerAgeFrom = row.querySelector('.mtpl-owner-age-from');
        const ownerAgeTo = row.querySelector('.mtpl-owner-age-to');
        const vehicleAgeFrom = row.querySelector('.mtpl-vehicle-age-from');
        const vehicleAgeTo = row.querySelector('.mtpl-vehicle-age-to');
        const basePremium = row.querySelector('.mtpl-base-premium');
        if (powerFrom) rowData.powerFrom = powerFrom.value ? parseFloat(powerFrom.value) : null;
        if (powerTo) rowData.powerTo = powerTo.value ? parseFloat(powerTo.value) : null;
        if (region) rowData.region = region.value.trim() || null;
        if (ownerAgeFrom) rowData.ownerAgeFrom = ownerAgeFrom.value ? parseInt(ownerAgeFrom.value) : null;
        if (ownerAgeTo) rowData.ownerAgeTo = ownerAgeTo.value ? parseInt(ownerAgeTo.value) : null;
        if (vehicleAgeFrom) rowData.vehicleAgeFrom = vehicleAgeFrom.value ? parseInt(vehicleAgeFrom.value) : null;
        if (vehicleAgeTo) rowData.vehicleAgeTo = vehicleAgeTo.value ? parseInt(vehicleAgeTo.value) : null;
        if (basePremium) rowData.basePremium = basePremium.value ? parseFloat(basePremium.value) : null;
    } else {
        const basePremium = row.querySelector('.mtpl-base-premium');
        if (basePremium) rowData.basePremium = basePremium.value ? parseFloat(basePremium.value) : null;
    }
    
    // Switch to view mode
    addMTPLTariffRow(rowData, row, false);
    row.remove();
    saveTariffData();
}

function editMTPLTariffRow(btn) {
    const row = btn.closest('tr');
    const rowDataJson = row.getAttribute('data-row-data');
    const rowData = rowDataJson ? JSON.parse(rowDataJson) : null;
    
    // Switch to editing mode
    addMTPLTariffRow(rowData, row, true);
    row.remove();
}

function deleteMTPLTariffRow(btn) {
    if (confirm('Сигурни ли сте, че искате да изтриете този ред?')) {
        btn.closest('tr').remove();
        saveTariffData();
    }
}

function moveMTPLTariffRowUp(btn) {
    const row = btn.closest('tr');
    const prevRow = row.previousElementSibling;
    if (prevRow && prevRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(row, prevRow);
        setTimeout(() => saveTariffData(), 50);
    }
}

function moveMTPLTariffRowDown(btn) {
    const row = btn.closest('tr');
    const nextRow = row.nextElementSibling;
    if (nextRow && nextRow.classList.contains('view-row')) {
        row.parentNode.insertBefore(nextRow, row);
        setTimeout(() => saveTariffData(), 50);
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
window.saveMTPLTariffRow = saveMTPLTariffRow;
window.editMTPLTariffRow = editMTPLTariffRow;
window.deleteMTPLTariffRow = deleteMTPLTariffRow;
window.moveMTPLTariffRowUp = moveMTPLTariffRowUp;
window.moveMTPLTariffRowDown = moveMTPLTariffRowDown;
