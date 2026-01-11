let offersData = null;
let commonData = null;

document.addEventListener('DOMContentLoaded', () => {
    loadOffers();
});

function loadOffers() {
    // Get offers data from sessionStorage
    const storedData = sessionStorage.getItem('offersData');
    const container = document.getElementById('offers-container');
    
    if (!storedData) {
        container.innerHTML = '<p>Няма данни за оферти. Моля, върнете се към калкулатора.</p>';
        return;
    }
    
    try {
        const data = JSON.parse(storedData);
        offersData = data;
        commonData = data.commonData;
        renderOffers(data, container);
        attachEventListeners();
    } catch (error) {
        console.error('Error parsing offers data:', error);
        container.innerHTML = '<p>Грешка при зареждане на данните.</p>';
    }
}

function renderOffers(data, container) {
    const { insuranceTypes, offers } = data;
    
    if (!offers || offers.length === 0) {
        container.innerHTML = '<p>Няма налични оферти.</p>';
        return;
    }
    
    // Create table with checkbox column
    let html = '<div style="margin-bottom: 5px;"><button id="export-docx-btn" class="btn" style="display: none;">Експортирай избраните в Word</button></div>';
    html += '<div class="offers-table-wrapper"><table class="offers-table">';
    html += '<thead><tr>';
    html += '<th style="width: 20px;"><input type="checkbox" id="select-all-offers"></th>';
    html += '<th style="width: 90px;">Застраховател</th>';
    
    // Add columns for each insurer with checkbox
    offers.forEach((offer, index) => {
        html += `<th class="insurer-name">${offer.insurerName}<input type="checkbox" class="offer-checkbox" data-offer-index="${index}" style="display: block; margin: 3px auto 0;"></th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    // For each insurance type, create rows
    insuranceTypes.forEach(insuranceType => {
        const typeName = getInsuranceTypeName(insuranceType);
        
        html += `<tr><td class="insurance-type-header" colspan="${offers.length + 2}">${typeName}</td></tr>`;
        
        if (insuranceType === 'casco') {
            // CASCO details with editable fields
            html += renderCascoRow(offers, insuranceType);
        } else if (insuranceType === 'mtpl') {
            // MTPL details
            html += renderMTPLRow(offers, insuranceType);
        } else if (insuranceType === 'gap') {
            // GAP details
            html += renderGAPRow(offers, insuranceType);
        }
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    attachEventListeners();
    attachDocxExportListeners();
}

function renderCascoRow(offers, insuranceType) {
    let html = '';
    
    // Insurance Sum - editable
    html += '<tr>';
    html += '<td></td>'; // Empty cell for checkbox column
    html += '<td class="label">Застрахователна сума:</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const insuranceData = cascoData?.insuranceData || {};
        const value = insuranceData.insuranceSum || '';
        html += `<td><input type="number" class="edit-input casco-insurance-sum" data-insurer-index="${index}" value="${value}" min="0" step="0.01" placeholder="Въведете сума"></td>`;
    });
    html += '</tr>';
    
    // Service - editable
    html += '<tr>';
    html += '<td></td>'; // Empty cell for checkbox column
    html += '<td class="label">Сервиз:</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const insuranceData = cascoData?.insuranceData || {};
        const currentService = insuranceData.service || '';
        html += `<td><select class="edit-select casco-service" data-insurer-index="${index}">`;
        html += '<option value="">Изберете сервиз</option>';
        html += `<option value="official" ${currentService === 'official' ? 'selected' : ''}>Официален</option>`;
        html += `<option value="trusted" ${currentService === 'trusted' ? 'selected' : ''}>Доверен</option>`;
        html += `<option value="trusted-original" ${currentService === 'trusted-original' ? 'selected' : ''}>Доверен с оригинални части</option>`;
        html += `<option value="expert" ${currentService === 'expert' ? 'selected' : ''}>Експертна оценка</option>`;
        html += '</select></td>';
    });
    html += '</tr>';
    
    // Bonus/Malus - editable
    html += '<tr>';
    html += '<td></td>'; // Empty cell for checkbox column
    html += '<td class="label">Бонус/Малус:</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const insuranceData = cascoData?.insuranceData || {};
        const bonusMalusValue = insuranceData.bonusMalus || '0';
        // Display absolute value (bonus/malus is handled by type)
        const displayValue = Math.abs(parseFloat(bonusMalusValue) || 0);
        const isMalus = parseFloat(bonusMalusValue) < 0;
        html += '<td class="casco-bonus-malus" data-insurer-index="' + index + '">';
        html += '<div style="display: flex; align-items: center; gap: 10px;">';
        html += '<button type="button" class="bonus-malus-btn ' + (isMalus ? '' : 'active') + '" data-type="bonus" data-insurer-index="' + index + '">Бонус</button>';
        html += '<input type="number" class="edit-input casco-bonus-malus-value" data-insurer-index="' + index + '" value="' + displayValue + '" min="0" step="0.01" style="width: 80px;">';
        html += '<button type="button" class="bonus-malus-btn ' + (isMalus ? 'active' : '') + '" data-type="malus" data-insurer-index="' + index + '">Малус</button>';
        html += '</div>';
        html += '</td>';
    });
    html += '</tr>';
    
    // Tariff Rate - read-only (calculated)
    html += '<tr>';
    html += '<td></td>'; // Empty cell for checkbox column
    html += '<td class="label">Тарифно число:</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        html += `<td class="casco-tariff-rate" data-insurer-index="${index}">${cascoData?.tariffRate ? (cascoData.tariffRate * 100).toFixed(2) + '%' : '-'}</td>`;
    });
    html += '</tr>';
    
    // Discounts - editable (checkbox list)
    html += '<tr>';
    html += '<td></td>'; // Empty cell for checkbox column
    html += '<td class="label">Отстъпки:</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const tariffDiscounts = cascoData?.tariffDiscounts || [];
        html += '<td class="casco-discounts" data-insurer-index="' + index + '">';
        if (tariffDiscounts.length > 0) {
            html += '<div class="discount-checkboxes">';
            tariffDiscounts.forEach(discount => {
                const discountKey = discount.type + '-' + (discount.value || discount.age || '');
                const isChecked = cascoData?.insuranceData?.discounts?.[discountKey] ? 'checked' : '';
                html += '<label><input type="checkbox" class="discount-checkbox" data-discount-type="' + discount.type + '" data-discount-value="' + (discount.value || discount.age || '') + '" data-insurer-index="' + index + '" ' + isChecked + '> ' + getDiscountText(discount) + '</label><br>';
            });
            html += '</div>';
        } else {
            html += '-';
        }
        html += '</td>';
    });
    html += '</tr>';
    
    // Surcharges (%) - editable (checkbox list)
    html += '<tr>';
    html += '<td></td>'; // Empty cell for checkbox column
    html += '<td class="label">Надбавки (%):</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const tariffSurcharges = cascoData?.tariffSurcharges || [];
        html += '<td class="casco-surcharges-percent" data-insurer-index="' + index + '">';
        if (tariffSurcharges.length > 0) {
            html += '<div class="surcharge-checkboxes">';
            tariffSurcharges.forEach(surcharge => {
                const surchargeKey = surcharge.type + '-' + (surcharge.value || '');
                const isChecked = cascoData?.insuranceData?.surchargesPercent?.[surchargeKey] ? 'checked' : '';
                html += '<label><input type="checkbox" class="surcharge-checkbox" data-surcharge-type="' + surcharge.type + '" data-surcharge-value="' + (surcharge.value || '') + '" data-insurer-index="' + index + '" ' + isChecked + '> ' + getSurchargeText(surcharge) + '</label><br>';
            });
            html += '</div>';
        } else {
            html += '-';
        }
        html += '</td>';
    });
    html += '</tr>';
    
    // Additional Surcharges (BGN) - editable input
    html += '<tr>';
    html += '<td></td>'; // Empty cell for checkbox column
    html += '<td class="label">Допълнителни надбавки (BGN):</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const insuranceData = cascoData?.insuranceData || {};
        const value = insuranceData.surcharges || '0';
        html += `<td><input type="number" class="edit-input casco-surcharges-bgn" data-insurer-index="${index}" value="${value}" min="0" step="0.01"></td>`;
    });
    html += '</tr>';
    
    // Premium - calculated, will be updated
    html += '<tr>';
    html += '<td></td>'; // Empty cell for checkbox column
    html += '<td class="label premium">Премия:</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        html += `<td class="premium casco-premium" data-insurer-index="${index}">${cascoData?.premium ? cascoData.premium.toFixed(2) + ' BGN' : '-'}</td>`;
    });
    html += '</tr>';
    
    return html;
}

function renderMTPLRow(offers, insuranceType) {
    let html = '<tr>';
    html += '<td></td>'; // Empty cell for checkbox column
    html += '<td class="label premium">Премия:</td>';
    offers.forEach(offer => {
        const mtplData = offer.insuranceTypes?.mtpl;
        html += `<td class="premium">${mtplData?.premium ? mtplData.premium.toFixed(2) + ' BGN' : '-'}</td>`;
    });
    html += '</tr>';
    return html;
}

function renderGAPRow(offers, insuranceType) {
    let html = '<tr>';
    html += '<td></td>'; // Empty cell for checkbox column
    html += '<td class="label premium">Премия:</td>';
    offers.forEach(offer => {
        const gapData = offer.insuranceTypes?.gap;
        html += `<td class="premium">${gapData?.premium ? gapData.premium.toFixed(2) + ' BGN' : '-'}</td>`;
    });
    html += '</tr>';
    return html;
}

function attachEventListeners() {
    // Listen for changes in CASCO fields
    const container = document.getElementById('offers-container');
    
    // Insurance sum changes
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('casco-insurance-sum')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateCascoPremium(index);
        }
    });
    
    // Service changes
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('casco-service')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateCascoPremium(index);
        }
    });
    
    // Bonus/Malus button changes
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('bonus-malus-btn')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            const type = e.target.dataset.type;
            
            // Toggle active state
            const buttons = container.querySelectorAll(`.bonus-malus-btn[data-insurer-index="${index}"]`);
            buttons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            recalculateCascoPremium(index);
        }
    });
    
    // Bonus/Malus value changes
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('casco-bonus-malus-value')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateCascoPremium(index);
        }
    });
    
    // Surcharges BGN changes
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('casco-surcharges-bgn')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateCascoPremium(index);
        }
    });
    
    // Discount checkbox changes
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('discount-checkbox')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateCascoPremium(index);
        }
    });
    
    // Surcharge checkbox changes
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('surcharge-checkbox')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateCascoPremium(index);
        }
    });
}

function attachDocxExportListeners() {
    const selectAllCheckbox = document.getElementById('select-all-offers');
    const exportBtn = document.getElementById('export-docx-btn');
    const container = document.getElementById('offers-container');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = container.querySelectorAll('.offer-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateExportButton();
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            await exportSelectedOffersToDocx();
        });
    }
    
    // Listen for individual checkbox changes
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('offer-checkbox')) {
            updateExportButton();
        }
    });
    
    updateExportButton();
}

function updateExportButton() {
    const container = document.getElementById('offers-container');
    const exportBtn = document.getElementById('export-docx-btn');
    const checkboxes = container.querySelectorAll('.offer-checkbox:checked');
    
    if (exportBtn) {
        if (checkboxes.length > 0) {
            exportBtn.style.display = 'inline-block';
        } else {
            exportBtn.style.display = 'none';
        }
    }
}

    async function exportSelectedOffersToDocx() {
    const container = document.getElementById('offers-container');
    const selectedCheckboxes = container.querySelectorAll('.offer-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('Моля, изберете поне една оферта за експорт');
        return;
    }
    
    // Collect selected offer indices
    const selectedIndices = Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.offerIndex));
    
    // Prepare data for DOCX export
    const selectedOffers = selectedIndices.map(index => offersData.offers[index]);
    
    try {
        const response = await fetch('/api/export-docx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                commonData: commonData,
                offers: selectedOffers,
                insuranceTypes: offersData.insuranceTypes
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('DOCX export error:', response.status, errorText);
            alert('Грешка при експортиране: ' + errorText);
            return;
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Generate filename: registrationNumber ownerName.docx
        let filename = 'offers.docx';
        if (commonData.registrationNumber && commonData.ownerName) {
            const regNumber = commonData.registrationNumber.trim();
            const ownerName = commonData.ownerName.trim();
            filename = `${regNumber} ${ownerName}.docx`;
        } else if (commonData.registrationNumber) {
            filename = `${commonData.registrationNumber.trim()}.docx`;
        } else if (commonData.ownerName) {
            filename = `${commonData.ownerName.trim()}.docx`;
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error exporting DOCX:', error);
        alert('Грешка при експортиране на DOCX: ' + error.message);
    }
}

async function recalculateCascoPremium(insurerIndex) {
    if (!offersData || !offersData.offers[insurerIndex]) return;
    
    const offer = offersData.offers[insurerIndex];
    const insurer = offer.insurer;
    
    // Collect current values from inputs
    const insuranceSumInput = document.querySelector(`.casco-insurance-sum[data-insurer-index="${insurerIndex}"]`);
    const serviceSelect = document.querySelector(`.casco-service[data-insurer-index="${insurerIndex}"]`);
    const surchargesInput = document.querySelector(`.casco-surcharges-bgn[data-insurer-index="${insurerIndex}"]`);
    const bonusMalusValueInput = document.querySelector(`.casco-bonus-malus-value[data-insurer-index="${insurerIndex}"]`);
    const malusBtn = document.querySelector(`.bonus-malus-btn[data-type="malus"][data-insurer-index="${insurerIndex}"]`);
    
    const insuranceSum = parseFloat(insuranceSumInput?.value) || 0;
    const service = serviceSelect?.value || '';
    const surcharges = parseFloat(surchargesInput?.value) || 0;
    const bonusMalusValue = parseFloat(bonusMalusValueInput?.value) || 0;
    
    // Determine if it's malus (negative) or bonus (positive)
    let bonusMalus = bonusMalusValue;
    if (malusBtn && malusBtn.classList.contains('active')) {
        bonusMalus = -Math.abs(bonusMalusValue);
    } else {
        bonusMalus = Math.abs(bonusMalusValue);
    }
    
    if (!insuranceSum || !service) {
        // Don't calculate if required fields are missing
        const premiumCell = document.querySelector(`.casco-premium[data-insurer-index="${insurerIndex}"]`);
        if (premiumCell) {
            premiumCell.textContent = '-';
        }
        return;
    }
    
    // Collect discount checkboxes
    const discountCheckboxes = document.querySelectorAll(`.discount-checkbox[data-insurer-index="${insurerIndex}"]:checked`);
    const discounts = {};
    discountCheckboxes.forEach(cb => {
        const key = cb.dataset.discountType + '-' + cb.dataset.discountValue;
        discounts[key] = true;
    });
    
    // Collect surcharge checkboxes
    const surchargeCheckboxes = document.querySelectorAll(`.surcharge-checkbox[data-insurer-index="${insurerIndex}"]:checked`);
    const surchargesPercent = {};
    surchargeCheckboxes.forEach(cb => {
        const key = cb.dataset.surchargeType + '-' + cb.dataset.surchargeValue;
        surchargesPercent[key] = true;
    });
    
    // Prepare data for calculation
    const data = {
        ...commonData,
        insuranceSum: insuranceSum,
        service: service,
        surcharges: surcharges,
        bonusMalus: bonusMalus,
        selectedDiscounts: discounts,
        selectedSurcharges: surchargesPercent
    };
    
    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ insuranceType: 'casco', insurer: insurer, data })
        });
        
        if (response.ok) {
            const result = await response.json();
            const premiumCell = document.querySelector(`.casco-premium[data-insurer-index="${insurerIndex}"]`);
            if (premiumCell) {
                premiumCell.textContent = result.premium.toFixed(2) + ' BGN';
            }
            
            // Update tariff rate display if available
            const tariffRateCell = document.querySelector(`.casco-tariff-rate[data-insurer-index="${insurerIndex}"]`);
            if (tariffRateCell && result.tariffRate) {
                tariffRateCell.textContent = (result.tariffRate * 100).toFixed(2) + '%';
            }
            
            // Update offersData
            if (!offer.insuranceTypes) offer.insuranceTypes = {};
            if (!offer.insuranceTypes.casco) offer.insuranceTypes.casco = {};
            offer.insuranceTypes.casco.premium = result.premium;
            offer.insuranceTypes.casco.tariffRate = result.tariffRate;
            offer.insuranceTypes.casco.insuranceData = {
                insuranceSum: insuranceSum,
                service: service,
                surcharges: surcharges,
                bonusMalus: bonusMalus,
                discounts: discounts,
                surchargesPercent: surchargesPercent
            };
        } else {
            const errorText = await response.text();
            console.error('Error calculating premium:', errorText);
        }
    } catch (error) {
        console.error('Error recalculating premium:', error);
    }
}

function getInsuranceTypeName(type) {
    const names = {
        'casco': 'Каско',
        'mtpl': 'Гражданска отговорност',
        'gap': 'GAP'
    };
    return names[type] || type;
}

function getServiceName(service) {
    const names = {
        'official': 'Официален',
        'trusted': 'Доверен',
        'trusted-original': 'Доверен с оригинални части',
        'expert': 'Експертна оценка'
    };
    return names[service] || service;
}

function getDiscountText(discount) {
    if (typeof discount === 'string') {
        return discount;
    }
    if (discount.type === 'go') return 'За ГО: ' + discount.value + '%';
    if (discount.type === 'age') return 'Възраст над ' + discount.value + ' години: ' + discount.value + '%';
    if (discount.type === 'new') return 'За новозастрахован: ' + discount.value + '%';
    if (discount.type === 'combined') return 'За комбиниран продукт: ' + discount.value + '%';
    return discount.value + '%';
}

function getSurchargeText(surcharge) {
    if (typeof surcharge === 'string') {
        return surcharge;
    }
    const typeText = surcharge.type === 'age_under_25' ? 'Възраст под 25г.' : 
                     surcharge.type === 'risk_model' ? 'Рисков модел' : 
                     surcharge.type || '';
    return typeText + ': ' + surcharge.value + '%';
}
