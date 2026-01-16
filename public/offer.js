let offersData = null;
let commonData = null;

document.addEventListener('DOMContentLoaded', () => {
    loadOffers();
    loadOfferNumber();
    
    // Save offer number when changed
    const offerNumberInput = document.getElementById('offer-number');
    if (offerNumberInput) {
        offerNumberInput.addEventListener('change', saveOfferNumber);
        offerNumberInput.addEventListener('input', saveOfferNumber);
    }
});

function saveOfferNumber() {
    const offerNumberInput = document.getElementById('offer-number');
    if (offerNumberInput) {
        sessionStorage.setItem('offerNumber', offerNumberInput.value);
    }
}

function loadOfferNumber() {
    const savedOfferNumber = sessionStorage.getItem('offerNumber');
    const offerNumberInput = document.getElementById('offer-number');
    if (offerNumberInput && savedOfferNumber) {
        offerNumberInput.value = savedOfferNumber;
    }
}

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
    let html = '<div style="margin-bottom: 5px; display: flex; gap: 10px;">';
    html += '<button id="save-offer-btn" class="btn" style="background: #28a745;">💾 Запази оферта</button>';
    html += '<button id="export-docx-btn" class="btn" style="display: none;">Експортирай избраните в Word</button>';
    html += '</div>';
    html += '<div class="offers-table-wrapper"><table class="offers-table">';
    html += '<thead><tr>';
    html += '<th style="width: 90px;"></th>';
    
    // Add columns for each insurer with checkbox in header
    offers.forEach((offer, index) => {
        html += `<th><input type="checkbox" class="offer-checkbox" data-offer-index="${index}"></th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    // For each insurance type, create rows
    insuranceTypes.forEach(insuranceType => {
        const typeName = getInsuranceTypeName(insuranceType);
        
        html += `<tr><td class="insurance-type-header" colspan="${offers.length + 1}">${typeName}</td></tr>`;
        
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
    
    // Update offersData
    data.offers = offers;
    offersData = data;
    
    container.innerHTML = html;
    attachEventListeners();
    attachDocxExportListeners();
    attachSaveOfferListener();
}

// Helper function to format tariff rate without trailing zeros
function formatTariffRate(rate) {
    if (!rate && rate !== 0) return '';
    const percent = rate * 100;
    // Remove trailing zeros by converting to float and back to string
    return parseFloat(percent.toFixed(4)).toString();
}

// Helper function to get insurer dropdown HTML
function getInsurerDropdownHTML(index, selectedInsurer, insuranceType = 'casco') {
    const insurerNames = {
        'dzi': 'ДЗИ',
        'generali': 'Дженерали',
        'bul-ins': 'Бул Инс',
        'armeec': 'Армеец',
        'bulstrad': 'Булстрад',
        'unika': 'Уника',
        'grupama': 'Групама',
        'allianz': 'Алианц'
    };
    
    let html = '<select class="edit-select insurer-select" data-insurer-index="' + index + '" data-insurance-type="' + insuranceType + '" style="width: 100%;">';
    Object.keys(insurerNames).forEach(key => {
        const selected = selectedInsurer === key ? 'selected' : '';
        html += `<option value="${key}" ${selected}>${insurerNames[key]}</option>`;
    });
    html += '</select>';
    return html;
}

function renderCascoRow(offers, insuranceType) {
    let html = '';
    
    // Insurer Name (dropdown for each column)
    html += '<tr>';
    html += '<td class="label"><input type="checkbox" id="select-all-offers" style="margin-right: 5px;">Застраховател:</td>';
    offers.forEach((offer, index) => {
        const selectedInsurer = offer.insurer || offer.insuranceTypes?.casco?.insuranceData?.selectedInsurer || '';
        html += `<td>${getInsurerDropdownHTML(index, selectedInsurer, 'casco')}</td>`;
    });
    html += '</tr>';
    
    // Insurance Sum - editable
    html += '<tr>';
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
    
    // Tariff Rate - editable
    html += '<tr>';
    html += '<td class="label">Тарифно число (%):</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const tariffRateValue = formatTariffRate(cascoData?.tariffRate);
        html += `<td><input type="number" class="edit-input casco-tariff-rate" data-insurer-index="${index}" value="${tariffRateValue}" min="0" step="0.0001" placeholder="Тарифно число"></td>`;
    });
    html += '</tr>';
    
    // Discounts - editable (checkbox list)
    html += '<tr>';
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
    
    // Manual Discount - editable (checkbox + input)
    html += '<tr>';
    html += '<td class="label">Ръчна отстъпка (%):</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const insuranceData = cascoData?.insuranceData || {};
        const manualDiscountValue = insuranceData.manualDiscount || '';
        const manualDiscountChecked = insuranceData.manualDiscount !== undefined && insuranceData.manualDiscount !== null && insuranceData.manualDiscount !== '' ? 'checked' : '';
        html += '<td class="casco-manual-discount" data-insurer-index="' + index + '">';
        html += '<div style="display: flex; align-items: center; gap: 5px;">';
        html += '<input type="checkbox" class="manual-discount-checkbox" data-insurer-index="' + index + '" ' + manualDiscountChecked + '>';
        html += '<input type="number" class="edit-input manual-discount-value" data-insurer-index="' + index + '" value="' + manualDiscountValue + '" min="0" max="100" step="0.01" placeholder="0" style="width: 80px;" ' + (!manualDiscountChecked ? 'disabled' : '') + '>';
        html += '</div>';
        html += '</td>';
    });
    html += '</tr>';
    
    // Surcharges (%) - editable (checkbox list)
    html += '<tr>';
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
    
    // Manual Surcharge - editable (checkbox + input)
    html += '<tr>';
    html += '<td class="label">Ръчна надбавка (%):</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const insuranceData = cascoData?.insuranceData || {};
        const manualSurchargeValue = insuranceData.manualSurcharge || '';
        const manualSurchargeChecked = insuranceData.manualSurcharge !== undefined && insuranceData.manualSurcharge !== null && insuranceData.manualSurcharge !== '' ? 'checked' : '';
        html += '<td class="casco-manual-surcharge" data-insurer-index="' + index + '">';
        html += '<div style="display: flex; align-items: center; gap: 5px;">';
        html += '<input type="checkbox" class="manual-surcharge-checkbox" data-insurer-index="' + index + '" ' + manualSurchargeChecked + '>';
        html += '<input type="number" class="edit-input manual-surcharge-value" data-insurer-index="' + index + '" value="' + manualSurchargeValue + '" min="0" step="0.01" placeholder="0" style="width: 80px;" ' + (!manualSurchargeChecked ? 'disabled' : '') + '>';
        html += '</div>';
        html += '</td>';
    });
    html += '</tr>';
    
    // Additional Surcharges (BGN) - editable input
    html += '<tr>';
    html += '<td class="label">Допълнителни надбавки (€):</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const insuranceData = cascoData?.insuranceData || {};
        const value = insuranceData.surcharges || '0';
        html += `<td><input type="number" class="edit-input casco-surcharges-bgn" data-insurer-index="${index}" value="${value}" min="0" step="0.01"></td>`;
    });
    html += '</tr>';
    
    // Commission Discount (checkbox + input %)
    html += '<tr>';
    html += '<td class="label">Отстъпка от комисиона (%):</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const insuranceData = cascoData?.insuranceData || {};
        const commissionDiscountValue = insuranceData.commissionDiscount || '';
        const commissionDiscountChecked = insuranceData.commissionDiscount !== undefined && insuranceData.commissionDiscount !== null && insuranceData.commissionDiscount !== '' ? 'checked' : '';
        html += '<td class="casco-commission-discount" data-insurer-index="' + index + '">';
        html += '<div style="display: flex; align-items: center; gap: 5px;">';
        html += '<input type="checkbox" class="commission-discount-checkbox" data-insurer-index="' + index + '" ' + commissionDiscountChecked + '>';
        html += '<input type="number" class="edit-input commission-discount-value" data-insurer-index="' + index + '" value="' + commissionDiscountValue + '" min="0" max="100" step="0.01" placeholder="0" style="width: 80px;" ' + (!commissionDiscountChecked ? 'disabled' : '') + '>';
        html += '</div>';
        html += '</td>';
    });
    html += '</tr>';
    
    // Premium - calculated, will be updated
    html += '<tr>';
    html += '<td class="label premium">Премия:</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        html += `<td class="premium casco-premium" data-insurer-index="${index}">${cascoData?.premium ? cascoData.premium.toFixed(2) + ' €' : '-'}</td>`;
    });
    html += '</tr>';
    
    // Comment - one per insurer
    html += '<tr>';
    html += '<td class="label">Коментар:</td>';
    offers.forEach((offer, index) => {
        const cascoData = offer.insuranceTypes?.casco;
        const insuranceData = cascoData?.insuranceData || {};
        const comment = insuranceData.comment || '';
        html += `<td><textarea class="edit-textarea casco-comment" data-insurer-index="${index}" rows="3" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; resize: vertical;" placeholder="Въведете коментар...">${comment}</textarea></td>`;
    });
    html += '</tr>';
    
    return html;
}

function renderMTPLRow(offers, insuranceType) {
    let html = '';
    
    // Insurer Name (dropdown for each column)
    html += '<tr>';
    html += '<td class="label">Застраховател:</td>';
    offers.forEach((offer, index) => {
        const selectedInsurer = offer.insurer || offer.insuranceTypes?.mtpl?.insuranceData?.selectedInsurer || '';
        html += `<td>${getInsurerDropdownHTML(index, selectedInsurer, 'mtpl')}</td>`;
    });
    html += '</tr>';
    
    // Основна премия (editable for all offers)
    html += '<tr>';
    html += '<td class="label">Основна премия:</td>';
    offers.forEach((offer, index) => {
        const mtplData = offer.insuranceTypes?.mtpl;
        const basePremium = mtplData?.basePremium || mtplData?.insuranceData?.basePremium || '';
        const displayValue = basePremium ? (typeof basePremium === 'number' ? basePremium.toFixed(2) : basePremium) : '';
        html += `<td><input type="number" class="edit-input mtpl-base-premium" data-insurer-index="${index}" value="${displayValue}" min="0" step="0.01" placeholder="Въведете премия"></td>`;
    });
    html += '</tr>';
    
    // ГФ (read-only)
    html += '<tr>';
    html += '<td class="label">ГФ:</td>';
    offers.forEach((offer, index) => {
        const mtplData = offer.insuranceTypes?.mtpl;
        const gf = mtplData?.gf || 6.50;
        html += `<td class="premium">${gf ? (typeof gf === 'number' ? gf.toFixed(2) : gf) : '6.50'} €</td>`;
    });
    html += '</tr>';
    
    // Manual Discount - editable (checkbox + input %)
    html += '<tr>';
    html += '<td class="label">Ръчна отстъпка (%):</td>';
    offers.forEach((offer, index) => {
        const mtplData = offer.insuranceTypes?.mtpl;
        const insuranceData = mtplData?.insuranceData || {};
        const manualDiscountValue = insuranceData.manualDiscount || '';
        const manualDiscountChecked = insuranceData.manualDiscount !== undefined && insuranceData.manualDiscount !== null && insuranceData.manualDiscount !== '' ? 'checked' : '';
        html += '<td class="mtpl-manual-discount" data-insurer-index="' + index + '">';
        html += '<div style="display: flex; align-items: center; gap: 5px;">';
        html += '<input type="checkbox" class="manual-discount-checkbox" data-insurance-type="mtpl" data-insurer-index="' + index + '" ' + manualDiscountChecked + '>';
        html += '<input type="number" class="edit-input manual-discount-value" data-insurance-type="mtpl" data-insurer-index="' + index + '" value="' + manualDiscountValue + '" min="0" max="100" step="0.01" placeholder="0" style="width: 80px;" ' + (!manualDiscountChecked ? 'disabled' : '') + '>';
        html += '</div>';
        html += '</td>';
    });
    html += '</tr>';
    
    // Manual Surcharge - editable (checkbox + input %)
    html += '<tr>';
    html += '<td class="label">Ръчна надбавка (%):</td>';
    offers.forEach((offer, index) => {
        const mtplData = offer.insuranceTypes?.mtpl;
        const insuranceData = mtplData?.insuranceData || {};
        const manualSurchargeValue = insuranceData.manualSurcharge || '';
        const manualSurchargeChecked = insuranceData.manualSurcharge !== undefined && insuranceData.manualSurcharge !== null && insuranceData.manualSurcharge !== '' ? 'checked' : '';
        html += '<td class="mtpl-manual-surcharge" data-insurer-index="' + index + '">';
        html += '<div style="display: flex; align-items: center; gap: 5px;">';
        html += '<input type="checkbox" class="manual-surcharge-checkbox" data-insurance-type="mtpl" data-insurer-index="' + index + '" ' + manualSurchargeChecked + '>';
        html += '<input type="number" class="edit-input manual-surcharge-value" data-insurance-type="mtpl" data-insurer-index="' + index + '" value="' + manualSurchargeValue + '" min="0" step="0.01" placeholder="0" style="width: 80px;" ' + (!manualSurchargeChecked ? 'disabled' : '') + '>';
        html += '</div>';
        html += '</td>';
    });
    html += '</tr>';
    
    // Commission Discount (checkbox + input %)
    html += '<tr>';
    html += '<td class="label">Отстъпка от комисиона (%):</td>';
    offers.forEach((offer, index) => {
        const mtplData = offer.insuranceTypes?.mtpl;
        const insuranceData = mtplData?.insuranceData || {};
        const commissionDiscountValue = insuranceData.commissionDiscount || '';
        const commissionDiscountChecked = insuranceData.commissionDiscount !== undefined && insuranceData.commissionDiscount !== null && insuranceData.commissionDiscount !== '' ? 'checked' : '';
        html += '<td class="mtpl-commission-discount" data-insurer-index="' + index + '">';
        html += '<div style="display: flex; align-items: center; gap: 5px;">';
        html += '<input type="checkbox" class="commission-discount-checkbox" data-insurance-type="mtpl" data-insurer-index="' + index + '" ' + commissionDiscountChecked + '>';
        html += '<input type="number" class="edit-input commission-discount-value" data-insurance-type="mtpl" data-insurer-index="' + index + '" value="' + commissionDiscountValue + '" min="0" max="100" step="0.01" placeholder="0" style="width: 80px;" ' + (!commissionDiscountChecked ? 'disabled' : '') + '>';
        html += '</div>';
        html += '</td>';
    });
    html += '</tr>';
    
    // ОФ (calculated, display-only)
    html += '<tr>';
    html += '<td class="label">ОФ:</td>';
    offers.forEach((offer, index) => {
        const mtplData = offer.insuranceTypes?.mtpl;
        html += `<td class="premium mtpl-of-display" data-insurer-index="${index}">${mtplData?.of ? mtplData.of.toFixed(2) + ' €' : '-'}</td>`;
    });
    html += '</tr>';
    
    // Данък (2%)
    html += '<tr>';
    html += '<td class="label">Данък (2%):</td>';
    offers.forEach((offer, index) => {
        const mtplData = offer.insuranceTypes?.mtpl;
        const tax = mtplData?.tax || 0;
        html += `<td class="premium mtpl-tax" data-insurer-index="${index}">${tax ? tax.toFixed(2) + ' €' : '-'}</td>`;
    });
    html += '</tr>';
    
    // Крайна премия (editable)
    html += '<tr>';
    html += '<td class="label premium">Крайна премия:</td>';
    offers.forEach((offer, index) => {
        const mtplData = offer.insuranceTypes?.mtpl;
        const premium = mtplData?.premium || mtplData?.insuranceData?.premium || '';
        const displayValue = premium ? (typeof premium === 'number' ? premium.toFixed(2) : premium) : '';
        html += `<td><input type="number" class="edit-input mtpl-premium-input" data-insurer-index="${index}" value="${displayValue}" min="0" step="0.01" placeholder="Въведете премия"></td>`;
    });
    html += '</tr>';
    
    return html;
}

function renderGAPRow(offers, insuranceType) {
    let html = '<tr>';
    html += '<td class="label premium">Премия:</td>';
    offers.forEach(offer => {
        const gapData = offer.insuranceTypes?.gap;
        html += `<td class="premium">${gapData?.premium ? gapData.premium.toFixed(2) + ' €' : '-'}</td>`;
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
    
    // Tariff rate changes (manual edit)
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('casco-tariff-rate')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateCascoPremiumWithManualTariff(index);
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
    
    // Manual discount checkbox changes
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('manual-discount-checkbox')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            const checkbox = e.target;
            const valueInput = document.querySelector(`.manual-discount-value[data-insurer-index="${index}"]`);
            if (valueInput) {
                valueInput.disabled = !checkbox.checked;
                if (!checkbox.checked) {
                    valueInput.value = '';
                }
            }
            recalculateCascoPremium(index);
        }
    });
    
    // Manual discount value changes
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('manual-discount-value')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateCascoPremium(index);
        }
    });
    
    // Manual surcharge checkbox changes
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('manual-surcharge-checkbox')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            const checkbox = e.target;
            const valueInput = document.querySelector(`.manual-surcharge-value[data-insurer-index="${index}"]`);
            if (valueInput) {
                valueInput.disabled = !checkbox.checked;
                if (!checkbox.checked) {
                    valueInput.value = '';
                }
            }
            recalculateCascoPremium(index);
        }
    });
    
    // Manual surcharge value changes
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('manual-surcharge-value')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateCascoPremium(index);
        }
    });
    
    // Insurer dropdown changes (CASCO and MTPL)
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('insurer-select')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            const insuranceType = e.target.dataset.insuranceType;
            const offer = offersData?.offers[index];
            if (offer) {
                const selectedInsurer = e.target.value;
                
                // Store selected insurer
                if (!offer.insuranceTypes) offer.insuranceTypes = {};
                if (!offer.insuranceTypes[insuranceType]) offer.insuranceTypes[insuranceType] = {};
                if (!offer.insuranceTypes[insuranceType].insuranceData) offer.insuranceTypes[insuranceType].insuranceData = {};
                offer.insuranceTypes[insuranceType].insuranceData.selectedInsurer = selectedInsurer;
                
                // Load tariff data and update discounts/surcharges for CASCO
                if (insuranceType === 'casco') {
                    loadInsurerTariffAndUpdate(index, selectedInsurer);
                }
            }
        }
    });
    
    // MTPL base premium changes (for all offers)
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('mtpl-base-premium')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            // Clear final premium input when base premium changes
            const premiumInput = document.querySelector(`.mtpl-premium-input[data-insurer-index="${index}"]`);
            if (premiumInput) {
                premiumInput.value = '';
            }
            recalculateMTPLPremiumForOffer(index);
        }
    });
    
    // MTPL final premium changes (calculate other fields from final premium)
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('mtpl-premium-input')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateMTPLFromFinalPremium(index);
        }
    });
    
    // Manual discount checkbox changes (for MTPL)
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('manual-discount-checkbox') && e.target.dataset.insuranceType === 'mtpl') {
            const index = parseInt(e.target.dataset.insurerIndex);
            const checkbox = e.target;
            const valueInput = container.querySelector(`.manual-discount-value[data-insurance-type="mtpl"][data-insurer-index="${index}"]`);
            if (valueInput) {
                valueInput.disabled = !checkbox.checked;
                if (!checkbox.checked) {
                    valueInput.value = '';
                }
            }
            recalculateMTPLPremiumForOffer(index);
        }
    });
    
    // Manual discount value changes (for MTPL)
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('manual-discount-value') && e.target.dataset.insuranceType === 'mtpl') {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateMTPLPremiumForOffer(index);
        }
    });
    
    // Manual surcharge checkbox changes (for MTPL)
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('manual-surcharge-checkbox') && e.target.dataset.insuranceType === 'mtpl') {
            const index = parseInt(e.target.dataset.insurerIndex);
            const checkbox = e.target;
            const valueInput = container.querySelector(`.manual-surcharge-value[data-insurance-type="mtpl"][data-insurer-index="${index}"]`);
            if (valueInput) {
                valueInput.disabled = !checkbox.checked;
                if (!checkbox.checked) {
                    valueInput.value = '';
                }
            }
            recalculateMTPLPremiumForOffer(index);
        }
    });
    
    // Manual surcharge value changes (for MTPL)
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('manual-surcharge-value') && e.target.dataset.insuranceType === 'mtpl') {
            const index = parseInt(e.target.dataset.insurerIndex);
            recalculateMTPLPremiumForOffer(index);
        }
    });
    
    // Commission discount checkbox changes
    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('commission-discount-checkbox')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            const insuranceType = e.target.dataset.insuranceType || 'casco';
            const checkbox = e.target;
            const valueInput = container.querySelector(`.commission-discount-value[data-insurance-type="${insuranceType}"][data-insurer-index="${index}"]`) || 
                               container.querySelector(`.commission-discount-value[data-insurer-index="${index}"]`);
            if (valueInput) {
                valueInput.disabled = !checkbox.checked;
                if (!checkbox.checked) {
                    valueInput.value = '';
                }
            }
            
            // Recalculate premium based on insurance type
            if (insuranceType === 'casco') {
                recalculateCascoPremium(index);
            } else if (insuranceType === 'mtpl') {
                recalculateMTPLPremiumForOffer(index);
            } else if (insuranceType === 'gap') {
                // TODO: Recalculate GAP premium when commission discount changes
                // For now, GAP premium calculation is done server-side
            }
        }
    });
    
    // Commission discount value changes
    container.addEventListener('input', (e) => {
        if (e.target.classList.contains('commission-discount-value')) {
            const index = parseInt(e.target.dataset.insurerIndex);
            const insuranceType = e.target.dataset.insuranceType || 'casco';
            
            // Recalculate premium based on insurance type
            if (insuranceType === 'casco') {
                recalculateCascoPremium(index);
            } else if (insuranceType === 'mtpl') {
                recalculateMTPLPremiumForOffer(index);
            } else if (insuranceType === 'gap') {
                // TODO: Recalculate GAP premium when commission discount changes
                // For now, GAP premium calculation is done server-side
            }
        }
    });
    
    // Tab key handling - move to next row in same column instead of next column
    // Use document level listener to catch Tab before other handlers
    function handleTabKey(e) {
        // Only handle Tab key (without Shift)
        if (e.key !== 'Tab' || e.shiftKey) {
            return;
        }
        
        const activeElement = document.activeElement;
        
        // Check if active element is within the offers table
        if (!activeElement || !container || !container.contains(activeElement)) {
            return;
        }
        
        // Check if it's an editable field
        const isEditableField = (
            (activeElement.tagName === 'INPUT' && 
             activeElement.type !== 'checkbox' && 
             activeElement.type !== 'radio') ||
            activeElement.tagName === 'SELECT' ||
            activeElement.tagName === 'TEXTAREA'
        );
        
        if (!isEditableField || activeElement.disabled) {
            return;
        }
        
        // Get the column index (data-insurer-index)
        const columnIndex = activeElement.getAttribute('data-insurer-index');
        if (!columnIndex) {
            return;
        }
        
        // Get the class of the current field to find the same type
        let fieldClass = null;
        for (const cls of activeElement.classList) {
            if (cls.startsWith('casco-') || 
                cls.startsWith('mtpl-') || 
                cls.startsWith('gap-') ||
                cls === 'insurer-select' ||
                cls === 'commission-discount-checkbox' ||
                cls === 'commission-discount-value' ||
                cls === 'manual-discount-checkbox' ||
                cls === 'manual-discount-value' ||
                cls === 'manual-surcharge-checkbox' ||
                cls === 'manual-surcharge-value') {
                fieldClass = cls;
                break;
            }
        }
        
        if (!fieldClass) {
            return;
        }
        
        // Find all fields with the same class and column index
        const selector = `.${fieldClass}[data-insurer-index="${columnIndex}"]`;
        const allFields = Array.from(container.querySelectorAll(selector))
            .filter(el => {
                return (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') && 
                       !el.disabled;
            });
        
        if (allFields.length <= 1) {
            return; // No other fields in this column
        }
        
        // Sort by DOM position (top to bottom)
        allFields.sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            // First compare by top position (with some tolerance for same row)
            const topDiff = rectA.top - rectB.top;
            if (Math.abs(topDiff) > 5) {
                return topDiff;
            }
            // If same row (or very close), compare by left position
            return rectA.left - rectB.left;
        });
        
        // Find current field index
        const currentIndex = allFields.indexOf(activeElement);
        
        if (currentIndex === -1 || currentIndex >= allFields.length - 1) {
            return; // Not found or last field in column - let default Tab behavior continue
        }
        
        // Move to next field in same column
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        
        const nextField = allFields[currentIndex + 1];
        if (nextField) {
            // Focus immediately
            nextField.focus();
            
            // Select text for input/textarea
            if ((nextField.tagName === 'INPUT' || nextField.tagName === 'TEXTAREA') && 
                nextField.setSelectionRange && nextField.type !== 'number') {
                try {
                    nextField.setSelectionRange(0, nextField.value.length);
                } catch (err) {
                    // Ignore selection errors (some inputs don't support setSelectionRange)
                }
            }
        }
        
        return false;
    }
    
    // Attach to document with capture phase to catch Tab before default behavior
    document.addEventListener('keydown', handleTabKey, true);
}

// Load insurer tariff and update discounts/surcharges
async function loadInsurerTariffAndUpdate(insurerIndex, insurer) {
    if (!offersData || !offersData.offers[insurerIndex]) return;
    
    try {
        // Fetch all CASCO insurers to get discounts/surcharges
        const response = await fetch('/api/casco-insurers');
        if (!response.ok) {
            console.error('Failed to fetch CASCO insurers');
            return;
        }
        
        const result = await response.json();
        const insurers = result.insurers || [];
        
        // Find the selected insurer
        const insurerData = insurers.find(i => i.insurer === insurer);
        const offer = offersData.offers[insurerIndex];
        if (!offer.insuranceTypes) offer.insuranceTypes = {};
        if (!offer.insuranceTypes.casco) offer.insuranceTypes.casco = {};
        
        if (!insurerData) {
            // Insurer not found (e.g., Уника, Алианц, Групама) - clear discounts/surcharges
            offer.insuranceTypes.casco.tariffDiscounts = [];
            offer.insuranceTypes.casco.tariffSurcharges = [];
            
            // Update DOM - discounts row (clear)
            const discountsCell = document.querySelector(`.casco-discounts[data-insurer-index="${insurerIndex}"]`);
            if (discountsCell) {
                discountsCell.innerHTML = '-';
            }
            
            // Update DOM - surcharges row (clear)
            const surchargesCell = document.querySelector(`.casco-surcharges-percent[data-insurer-index="${insurerIndex}"]`);
            if (surchargesCell) {
                surchargesCell.innerHTML = '-';
            }
            
            // Clear premium
            const premiumCell = document.querySelector(`.casco-premium[data-insurer-index="${insurerIndex}"]`);
            if (premiumCell) {
                premiumCell.textContent = '-';
            }
            
            return;
        }
        
        // Update offer data with new discounts/surcharges
        offer.insuranceTypes.casco.tariffDiscounts = insurerData.discounts || [];
        offer.insuranceTypes.casco.tariffSurcharges = insurerData.surcharges || [];
        
        // Update DOM - discounts row
        const discountsCell = document.querySelector(`.casco-discounts[data-insurer-index="${insurerIndex}"]`);
        if (discountsCell) {
            const tariffDiscounts = offer.insuranceTypes.casco.tariffDiscounts || [];
            let html = '';
            if (tariffDiscounts.length > 0) {
                html += '<div class="discount-checkboxes">';
                tariffDiscounts.forEach(discount => {
                    const discountKey = discount.type + '-' + (discount.value || discount.age || '');
                    const cascoData = offer.insuranceTypes?.casco;
                    const isChecked = cascoData?.insuranceData?.discounts?.[discountKey] ? 'checked' : '';
                    html += '<label><input type="checkbox" class="discount-checkbox" data-discount-type="' + discount.type + '" data-discount-value="' + (discount.value || discount.age || '') + '" data-insurer-index="' + insurerIndex + '" ' + isChecked + '> ' + getDiscountText(discount) + '</label><br>';
                });
                html += '</div>';
            } else {
                html = '-';
            }
            discountsCell.innerHTML = html;
        }
        
        // Update DOM - surcharges row
        const surchargesCell = document.querySelector(`.casco-surcharges-percent[data-insurer-index="${insurerIndex}"]`);
        if (surchargesCell) {
            const tariffSurcharges = offer.insuranceTypes.casco.tariffSurcharges || [];
            let html = '';
            if (tariffSurcharges.length > 0) {
                html += '<div class="surcharge-checkboxes">';
                tariffSurcharges.forEach(surcharge => {
                    const surchargeKey = surcharge.type + '-' + (surcharge.value || '');
                    const cascoData = offer.insuranceTypes?.casco;
                    const isChecked = cascoData?.insuranceData?.surchargesPercent?.[surchargeKey] ? 'checked' : '';
                    html += '<label><input type="checkbox" class="surcharge-checkbox" data-surcharge-type="' + surcharge.type + '" data-surcharge-value="' + (surcharge.value || '') + '" data-insurer-index="' + insurerIndex + '" ' + isChecked + '> ' + getSurchargeText(surcharge) + '</label><br>';
                });
                html += '</div>';
            } else {
                html = '-';
            }
            surchargesCell.innerHTML = html;
        }
        
        // Recalculate premium with new tariff
        recalculateCascoPremium(insurerIndex);
        
    } catch (error) {
        console.error('Error loading insurer tariff:', error);
    }
}

// Calculate MTPL premium for all offers (when base premium or GF is changed)
function recalculateMTPLPremiumForOffer(insurerIndex) {
    if (!offersData || !offersData.offers[insurerIndex]) return;
    
    const offer = offersData.offers[insurerIndex];
    
    // Collect current values from inputs
    const basePremiumInput = document.querySelector(`.mtpl-base-premium[data-insurer-index="${insurerIndex}"]`);
    
    let basePremium = parseFloat(basePremiumInput?.value) || 0;
    const gf = 6.50; // ГФ is always 6.50 (read-only)
    
    if (!basePremium) {
        // Don't calculate if base premium is missing
        const premiumCell = document.querySelector(`.mtpl-premium[data-insurer-index="${insurerIndex}"]`);
        const taxCell = document.querySelector(`.mtpl-tax[data-insurer-index="${insurerIndex}"]`);
        const ofCell = document.querySelector(`.mtpl-of-display[data-insurer-index="${insurerIndex}"]`);
        if (premiumCell) premiumCell.textContent = '-';
        if (taxCell) taxCell.textContent = '-';
        if (ofCell) ofCell.textContent = '-';
        return;
    }
    
    // Collect manual discount
    const manualDiscountCheckbox = document.querySelector(`.manual-discount-checkbox[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    const manualDiscountInput = document.querySelector(`.manual-discount-value[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    let manualDiscountPercent = 0;
    if (manualDiscountCheckbox && manualDiscountCheckbox.checked && manualDiscountInput) {
        manualDiscountPercent = parseFloat(manualDiscountInput.value) || 0;
    }
    
    // Collect manual surcharge
    const manualSurchargeCheckbox = document.querySelector(`.manual-surcharge-checkbox[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    const manualSurchargeInput = document.querySelector(`.manual-surcharge-value[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    let manualSurchargePercent = 0;
    if (manualSurchargeCheckbox && manualSurchargeCheckbox.checked && manualSurchargeInput) {
        manualSurchargePercent = parseFloat(manualSurchargeInput.value) || 0;
    }
    
    // Apply manual discount/surcharge to base premium
    // x = basePremium * (1 - manualDiscountPercent/100 + manualSurchargePercent/100)
    basePremium = basePremium * (1 - manualDiscountPercent / 100 + manualSurchargePercent / 100);
    
    // Collect commission discount
    const commissionDiscountCheckbox = document.querySelector(`.commission-discount-checkbox[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    const commissionDiscountInput = document.querySelector(`.commission-discount-value[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    let commissionDiscountPercent = 0;
    if (commissionDiscountCheckbox && commissionDiscountCheckbox.checked && commissionDiscountInput) {
        commissionDiscountPercent = parseFloat(commissionDiscountInput.value) || 0;
    }
    
    // Calculate tax (2% of base premium)
    const tax = Math.round(basePremium * 0.02 * 100) / 100;
    
    // Calculate OF: Math.max(1% of base premium, 2.00)
    const of = Math.max(Math.round(basePremium * 0.01 * 100) / 100, 2.00);
    
    // Apply commission discount formula: x - z + y + ГФ + ОФ
    // x = basePremium (before tax, GF, OF)
    // y = x * 0.02 (tax)
    // ГФ = 6.5
    // ОФ = MAX(2; x*0.01)
    // z = x * (commissionDiscountPercent / 100) (commission discount amount)
    // premium = x - z + y + ГФ + ОФ = basePremium * (1 - commissionDiscountPercent/100 + 0.02) + gf + of
    const premium = Math.round((basePremium * (1 - commissionDiscountPercent / 100 + 0.02) + gf + of) * 100) / 100;
    
    // Update display
    const premiumInput = document.querySelector(`.mtpl-premium-input[data-insurer-index="${insurerIndex}"]`);
    const taxCell = document.querySelector(`.mtpl-tax[data-insurer-index="${insurerIndex}"]`);
    const ofCell = document.querySelector(`.mtpl-of-display[data-insurer-index="${insurerIndex}"]`);
    if (premiumInput) {
        premiumInput.value = premium.toFixed(2);
    }
    if (taxCell) {
        taxCell.textContent = tax.toFixed(2) + ' €';
    }
    if (ofCell) {
        ofCell.textContent = of.toFixed(2) + ' €';
    }
    
    // Update offersData
    if (!offer.insuranceTypes) offer.insuranceTypes = {};
    if (!offer.insuranceTypes.mtpl) offer.insuranceTypes.mtpl = {};
    offer.insuranceTypes.mtpl.premium = premium;
    offer.insuranceTypes.mtpl.basePremium = basePremium;
    offer.insuranceTypes.mtpl.tax = tax;
    offer.insuranceTypes.mtpl.gf = gf;
    offer.insuranceTypes.mtpl.of = of;
    if (!offer.insuranceTypes.mtpl.insuranceData) offer.insuranceTypes.mtpl.insuranceData = {};
    offer.insuranceTypes.mtpl.insuranceData.basePremium = basePremiumInput ? parseFloat(basePremiumInput.value) || 0 : 0; // Store original base premium before manual adjustments
    offer.insuranceTypes.mtpl.insuranceData.manualDiscount = manualDiscountCheckbox && manualDiscountCheckbox.checked ? manualDiscountPercent : undefined;
    offer.insuranceTypes.mtpl.insuranceData.manualSurcharge = manualSurchargeCheckbox && manualSurchargeCheckbox.checked ? manualSurchargePercent : undefined;
    offer.insuranceTypes.mtpl.insuranceData.commissionDiscount = commissionDiscountCheckbox && commissionDiscountCheckbox.checked ? commissionDiscountPercent : undefined;
    offer.insuranceTypes.mtpl.insuranceData.gf = gf;
}

// Calculate MTPL fields from final premium (reverse calculation)
function recalculateMTPLFromFinalPremium(insurerIndex) {
    if (!offersData || !offersData.offers[insurerIndex]) return;
    
    const offer = offersData.offers[insurerIndex];
    
    // Get final premium input
    const premiumInput = document.querySelector(`.mtpl-premium-input[data-insurer-index="${insurerIndex}"]`);
    const finalPremium = parseFloat(premiumInput?.value) || 0;
    
    if (!finalPremium) {
        // Clear all fields if no premium entered
        const basePremiumInput = document.querySelector(`.mtpl-base-premium[data-insurer-index="${insurerIndex}"]`);
        const taxCell = document.querySelector(`.mtpl-tax[data-insurer-index="${insurerIndex}"]`);
        const ofCell = document.querySelector(`.mtpl-of-display[data-insurer-index="${insurerIndex}"]`);
        if (basePremiumInput) basePremiumInput.value = '';
        if (taxCell) taxCell.textContent = '-';
        if (ofCell) ofCell.textContent = '-';
        return;
    }
    
    const gf = 6.50; // ГФ is always 6.50
    
    // Collect manual discount
    const manualDiscountCheckbox = document.querySelector(`.manual-discount-checkbox[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    const manualDiscountInput = document.querySelector(`.manual-discount-value[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    let manualDiscountPercent = 0;
    if (manualDiscountCheckbox && manualDiscountCheckbox.checked && manualDiscountInput) {
        manualDiscountPercent = parseFloat(manualDiscountInput.value) || 0;
    }
    
    // Collect manual surcharge
    const manualSurchargeCheckbox = document.querySelector(`.manual-surcharge-checkbox[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    const manualSurchargeInput = document.querySelector(`.manual-surcharge-value[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    let manualSurchargePercent = 0;
    if (manualSurchargeCheckbox && manualSurchargeCheckbox.checked && manualSurchargeInput) {
        manualSurchargePercent = parseFloat(manualSurchargeInput.value) || 0;
    }
    
    // Collect commission discount
    const commissionDiscountCheckbox = document.querySelector(`.commission-discount-checkbox[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    const commissionDiscountInput = document.querySelector(`.commission-discount-value[data-insurance-type="mtpl"][data-insurer-index="${insurerIndex}"]`);
    let commissionDiscountPercent = 0;
    if (commissionDiscountCheckbox && commissionDiscountCheckbox.checked && commissionDiscountInput) {
        commissionDiscountPercent = parseFloat(commissionDiscountInput.value) || 0;
    }
    
    // Formula: 
    // basePremium_adjusted = basePremium * (1 - manualDiscount%/100 + manualSurcharge%/100)
    // premium = basePremium_adjusted * (1 - commissionDiscount%/100 + 0.02) + gf + of
    // Where: of = MAX(2; basePremium_adjusted * 0.01)
    // We need to solve for basePremium (original, before manual adjustments)
    
    // Subtract GF first
    const premiumBeforeGF = finalPremium - gf;
    
    // Use iterative approach to find basePremium
    // Start with an initial guess
    const manualAdjustment = 1 - manualDiscountPercent / 100 + manualSurchargePercent / 100;
    const commissionAdjustment = 1 - commissionDiscountPercent / 100 + 0.02;
    let basePremium = premiumBeforeGF / (commissionAdjustment * manualAdjustment + 0.01);
    let tolerance = 0.01;
    let maxIterations = 100;
    let iteration = 0;
    
    while (iteration < maxIterations) {
        // Apply manual adjustments
        const basePremiumAdjusted = basePremium * manualAdjustment;
        const of = Math.max(Math.round(basePremiumAdjusted * 0.01 * 100) / 100, 2.00);
        const calculatedPremium = basePremiumAdjusted * commissionAdjustment + gf + of;
        const difference = calculatedPremium - finalPremium;
        
        if (Math.abs(difference) < tolerance) {
            break;
        }
        
        // Adjust basePremium based on difference
        const adjustmentFactor = commissionAdjustment * manualAdjustment + 0.01;
        basePremium = basePremium - (difference / adjustmentFactor);
        
        // Ensure basePremium is positive
        if (basePremium <= 0) {
            basePremium = 0;
            break;
        }
        
        iteration++;
    }
    
    // Calculate final adjusted base premium for tax and OF
    const basePremiumAdjusted = basePremium * manualAdjustment;
    
    // Calculate tax and OF (based on adjusted base premium)
    const tax = Math.round(basePremiumAdjusted * 0.02 * 100) / 100;
    const of = Math.max(Math.round(basePremiumAdjusted * 0.01 * 100) / 100, 2.00);
    
    // Update base premium input
    const basePremiumInput = document.querySelector(`.mtpl-base-premium[data-insurer-index="${insurerIndex}"]`);
    if (basePremiumInput) {
        basePremiumInput.value = basePremium.toFixed(2);
    }
    
    // Update display fields
    const taxCell = document.querySelector(`.mtpl-tax[data-insurer-index="${insurerIndex}"]`);
    const ofCell = document.querySelector(`.mtpl-of-display[data-insurer-index="${insurerIndex}"]`);
    if (taxCell) {
        taxCell.textContent = tax.toFixed(2) + ' €';
    }
    if (ofCell) {
        ofCell.textContent = of.toFixed(2) + ' €';
    }
    
    // Update offersData
    if (!offer.insuranceTypes) offer.insuranceTypes = {};
    if (!offer.insuranceTypes.mtpl) offer.insuranceTypes.mtpl = {};
    offer.insuranceTypes.mtpl.premium = finalPremium;
    offer.insuranceTypes.mtpl.basePremium = basePremium; // Store original base premium (before manual adjustments)
    offer.insuranceTypes.mtpl.tax = tax;
    offer.insuranceTypes.mtpl.gf = gf;
    offer.insuranceTypes.mtpl.of = of;
    if (!offer.insuranceTypes.mtpl.insuranceData) offer.insuranceTypes.mtpl.insuranceData = {};
    offer.insuranceTypes.mtpl.insuranceData.premium = finalPremium;
    offer.insuranceTypes.mtpl.insuranceData.basePremium = basePremium; // Store original base premium
    offer.insuranceTypes.mtpl.insuranceData.manualDiscount = manualDiscountCheckbox && manualDiscountCheckbox.checked ? manualDiscountPercent : undefined;
    offer.insuranceTypes.mtpl.insuranceData.manualSurcharge = manualSurchargeCheckbox && manualSurchargeCheckbox.checked ? manualSurchargePercent : undefined;
    offer.insuranceTypes.mtpl.insuranceData.commissionDiscount = commissionDiscountCheckbox && commissionDiscountCheckbox.checked ? commissionDiscountPercent : undefined;
    offer.insuranceTypes.mtpl.insuranceData.gf = gf;
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
    
    // Get offer number from input
    const offerNumberInput = document.getElementById('offer-number');
    const offerNumber = offerNumberInput ? offerNumberInput.value.trim() : '';
    
    // Add offer number to commonData for export (even if empty, so backend can use fallback)
    const exportCommonData = { ...commonData };
    exportCommonData.offerNumber = offerNumber;
    
    try {
        const response = await fetch('/api/export-docx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                commonData: exportCommonData,
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
    
    // Get selected insurer from dropdown (or use default from offer.insurer)
    const insurerSelect = document.querySelector(`.insurer-select[data-insurance-type="casco"][data-insurer-index="${insurerIndex}"]`);
    const insurer = insurerSelect ? insurerSelect.value : offer.insurer;
    
    if (!insurer) return;
    
    // Collect current values from inputs
    const insuranceSumInput = document.querySelector(`.casco-insurance-sum[data-insurer-index="${insurerIndex}"]`);
    const serviceSelect = document.querySelector(`.casco-service[data-insurer-index="${insurerIndex}"]`);
    const surchargesInput = document.querySelector(`.casco-surcharges-bgn[data-insurer-index="${insurerIndex}"]`);
    const bonusMalusValueInput = document.querySelector(`.casco-bonus-malus-value[data-insurer-index="${insurerIndex}"]`);
    const malusBtn = document.querySelector(`.bonus-malus-btn[data-type="malus"][data-insurer-index="${insurerIndex}"]`);
    const tariffRateInput = document.querySelector(`.casco-tariff-rate[data-insurer-index="${insurerIndex}"]`);
    
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
    
    // If tariff rate is manually entered, use manual calculation
    const manualTariffRate = parseFloat(tariffRateInput?.value) || 0;
    if (manualTariffRate > 0) {
        recalculateCascoPremiumWithManualTariff(insurerIndex);
        return;
    }
    
    // Collect discount checkboxes
    const discountCheckboxes = document.querySelectorAll(`.discount-checkbox[data-insurer-index="${insurerIndex}"]:checked`);
    const discounts = {};
    discountCheckboxes.forEach(cb => {
        const key = cb.dataset.discountType + '-' + cb.dataset.discountValue;
        discounts[key] = true;
    });
    
    // Collect manual discount
    const manualDiscountCheckbox = document.querySelector(`.manual-discount-checkbox[data-insurer-index="${insurerIndex}"]`);
    const manualDiscountInput = document.querySelector(`.manual-discount-value[data-insurer-index="${insurerIndex}"]`);
    let manualDiscount = 0;
    if (manualDiscountCheckbox && manualDiscountCheckbox.checked && manualDiscountInput) {
        manualDiscount = parseFloat(manualDiscountInput.value) || 0;
    }
    
    // Collect surcharge checkboxes
    const surchargeCheckboxes = document.querySelectorAll(`.surcharge-checkbox[data-insurer-index="${insurerIndex}"]:checked`);
    const surchargesPercent = {};
    surchargeCheckboxes.forEach(cb => {
        const key = cb.dataset.surchargeType + '-' + cb.dataset.surchargeValue;
        surchargesPercent[key] = true;
    });
    
    // Collect manual surcharge
    const manualSurchargeCheckbox = document.querySelector(`.manual-surcharge-checkbox[data-insurer-index="${insurerIndex}"]`);
    const manualSurchargeInput = document.querySelector(`.manual-surcharge-value[data-insurer-index="${insurerIndex}"]`);
    let manualSurcharge = 0;
    if (manualSurchargeCheckbox && manualSurchargeCheckbox.checked && manualSurchargeInput) {
        manualSurcharge = parseFloat(manualSurchargeInput.value) || 0;
    }
    
    // Prepare data for calculation
    const data = {
        ...commonData,
        insuranceSum: insuranceSum,
        service: service,
        surcharges: surcharges,
        bonusMalus: bonusMalus,
        selectedDiscounts: discounts,
        selectedSurcharges: surchargesPercent,
        manualDiscount: manualDiscountCheckbox && manualDiscountCheckbox.checked ? manualDiscount : undefined,
        manualSurcharge: manualSurchargeCheckbox && manualSurchargeCheckbox.checked ? manualSurcharge : undefined
    };
    
    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ insuranceType: 'casco', insurer: insurer, data })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Apply commission discount if checked
            let finalPremium = result.premium;
            const commissionDiscountCheckbox = document.querySelector(`.commission-discount-checkbox[data-insurer-index="${insurerIndex}"]`);
            const commissionDiscountInput = document.querySelector(`.commission-discount-value[data-insurer-index="${insurerIndex}"]`);
            if (commissionDiscountCheckbox && commissionDiscountCheckbox.checked && commissionDiscountInput) {
                const commissionDiscountPercent = parseFloat(commissionDiscountInput.value) || 0;
                // Calculate premiumBeforeTax from result.premium (which includes tax)
                // result.premium = premiumBeforeTax * 1.02, so premiumBeforeTax = result.premium / 1.02
                const premiumBeforeTax = result.premium / 1.02;
                // Apply commission discount: x - z + y where x=premiumBeforeTax, y=x*0.02, z=x*(commissionDiscountPercent/100)
                finalPremium = premiumBeforeTax * (1 - commissionDiscountPercent / 100 + 0.02);
            }
            
            const premiumCell = document.querySelector(`.casco-premium[data-insurer-index="${insurerIndex}"]`);
            if (premiumCell) {
                premiumCell.textContent = finalPremium.toFixed(2) + ' €';
            }
            
            // Update tariff rate input if available (only if not manually edited)
            const tariffRateInput = document.querySelector(`.casco-tariff-rate[data-insurer-index="${insurerIndex}"]`);
            if (tariffRateInput && result.tariffRate && tariffRateInput.tagName === 'INPUT') {
                // Only update if input is empty or hasn't been manually changed
                if (!tariffRateInput.dataset.manualEdit) {
                    tariffRateInput.value = formatTariffRate(result.tariffRate);
                }
            }
            
            // Update offersData
            if (!offer.insuranceTypes) offer.insuranceTypes = {};
            if (!offer.insuranceTypes.casco) offer.insuranceTypes.casco = {};
            offer.insuranceTypes.casco.premium = finalPremium;
            offer.insuranceTypes.casco.tariffRate = result.tariffRate;
            offer.insuranceTypes.casco.insuranceData = {
                insuranceSum: insuranceSum,
                service: service,
                surcharges: surcharges,
                bonusMalus: bonusMalus,
                discounts: discounts,
                surchargesPercent: surchargesPercent,
                manualDiscount: manualDiscountCheckbox && manualDiscountCheckbox.checked ? manualDiscount : undefined,
                manualSurcharge: manualSurchargeCheckbox && manualSurchargeCheckbox.checked ? manualSurcharge : undefined,
                commissionDiscount: commissionDiscountCheckbox && commissionDiscountCheckbox.checked ? (parseFloat(commissionDiscountInput?.value) || 0) : undefined,
                comment: offer.insuranceTypes.casco.insuranceData?.comment // Preserve existing comment
            };
        } else {
            const errorText = await response.text();
            console.error('Error calculating premium:', errorText);
        }
    } catch (error) {
        console.error('Error recalculating premium:', error);
    }
}

async function recalculateCascoPremiumWithManualTariff(insurerIndex) {
    if (!offersData || !offersData.offers[insurerIndex]) return;
    
    const offer = offersData.offers[insurerIndex];
    
    // Collect current values from inputs
    const insuranceSumInput = document.querySelector(`.casco-insurance-sum[data-insurer-index="${insurerIndex}"]`);
    const serviceSelect = document.querySelector(`.casco-service[data-insurer-index="${insurerIndex}"]`);
    const surchargesInput = document.querySelector(`.casco-surcharges-bgn[data-insurer-index="${insurerIndex}"]`);
    const bonusMalusValueInput = document.querySelector(`.casco-bonus-malus-value[data-insurer-index="${insurerIndex}"]`);
    const malusBtn = document.querySelector(`.bonus-malus-btn[data-type="malus"][data-insurer-index="${insurerIndex}"]`);
    const tariffRateInput = document.querySelector(`.casco-tariff-rate[data-insurer-index="${insurerIndex}"]`);
    
    const insuranceSum = parseFloat(insuranceSumInput?.value) || 0;
    const service = serviceSelect?.value || '';
    const surcharges = parseFloat(surchargesInput?.value) || 0;
    const bonusMalusValue = parseFloat(bonusMalusValueInput?.value) || 0;
    const manualTariffRate = parseFloat(tariffRateInput?.value) || 0; // Percentage (e.g., 2.5 for 2.5%)
    
    // Determine if it's malus (negative) or bonus (positive)
    let bonusMalus = bonusMalusValue;
    if (malusBtn && malusBtn.classList.contains('active')) {
        bonusMalus = -Math.abs(bonusMalusValue);
    } else {
        bonusMalus = Math.abs(bonusMalusValue);
    }
    
    if (!insuranceSum || !service || !manualTariffRate) {
        // Don't calculate if required fields are missing
        const premiumCell = document.querySelector(`.casco-premium[data-insurer-index="${insurerIndex}"]`);
        if (premiumCell) {
            premiumCell.textContent = '-';
        }
        return;
    }
    
    // Convert percentage to decimal (2.5% -> 0.025)
    const tariffRateDecimal = manualTariffRate / 100;
    
    // Collect discount checkboxes
    const discountCheckboxes = document.querySelectorAll(`.discount-checkbox[data-insurer-index="${insurerIndex}"]:checked`);
    let totalDiscount = 0;
    discountCheckboxes.forEach(cb => {
        const discountValue = parseFloat(cb.dataset.discountValue) || 0;
        totalDiscount += discountValue;
    });
    
    // Collect manual discount
    const manualDiscountCheckbox = document.querySelector(`.manual-discount-checkbox[data-insurer-index="${insurerIndex}"]`);
    const manualDiscountInput = document.querySelector(`.manual-discount-value[data-insurer-index="${insurerIndex}"]`);
    let manualDiscount = 0;
    if (manualDiscountCheckbox && manualDiscountCheckbox.checked && manualDiscountInput) {
        manualDiscount = parseFloat(manualDiscountInput.value) || 0;
    }
    
    // Collect surcharge checkboxes
    const surchargeCheckboxes = document.querySelectorAll(`.surcharge-checkbox[data-insurer-index="${insurerIndex}"]:checked`);
    let totalSurcharge = 0;
    surchargeCheckboxes.forEach(cb => {
        const surchargeValue = parseFloat(cb.dataset.surchargeValue) || 0;
        totalSurcharge += surchargeValue;
    });
    
    // Collect manual surcharge
    const manualSurchargeCheckbox = document.querySelector(`.manual-surcharge-checkbox[data-insurer-index="${insurerIndex}"]`);
    const manualSurchargeInput = document.querySelector(`.manual-surcharge-value[data-insurer-index="${insurerIndex}"]`);
    let manualSurcharge = 0;
    if (manualSurchargeCheckbox && manualSurchargeCheckbox.checked && manualSurchargeInput) {
        manualSurcharge = parseFloat(manualSurchargeInput.value) || 0;
    }
    
    // Calculate totalPercent (same logic as server: discounts subtract, surcharges add)
    let totalPercent = 0;
    totalPercent -= bonusMalus; // Bonus (positive) becomes negative
    totalPercent -= totalDiscount; // Discounts subtract
    totalPercent -= manualDiscount; // Manual discount subtracts
    totalPercent += totalSurcharge; // Surcharges add
    totalPercent += manualSurcharge; // Manual surcharge adds
    
    // Calculate premium manually using the formula: (insuranceSum * tariffRate * (1 + totalPercent/100) + surcharges) * 1.02
    let premiumBeforeSurcharges = insuranceSum * tariffRateDecimal * (1 + totalPercent / 100);
    let premiumBeforeTax = premiumBeforeSurcharges + surcharges;
    
    // Collect commission discount
    const commissionDiscountCheckbox = document.querySelector(`.commission-discount-checkbox[data-insurer-index="${insurerIndex}"]`);
    const commissionDiscountInput = document.querySelector(`.commission-discount-value[data-insurer-index="${insurerIndex}"]`);
    let commissionDiscountPercent = 0;
    if (commissionDiscountCheckbox && commissionDiscountCheckbox.checked && commissionDiscountInput) {
        commissionDiscountPercent = parseFloat(commissionDiscountInput.value) || 0;
    }
    
    // Apply commission discount formula: x - z + y
    // x = premiumBeforeTax (before tax)
    // y = x * 0.02 (tax)
    // z = x * (commissionDiscountPercent / 100) (commission discount amount)
    // premium = x - z + y = x * (1 - commissionDiscountPercent/100 + 0.02)
    let premium = premiumBeforeTax * (1 - commissionDiscountPercent / 100 + 0.02);
    
    // Update premium display
    const premiumCell = document.querySelector(`.casco-premium[data-insurer-index="${insurerIndex}"]`);
    if (premiumCell) {
        premiumCell.textContent = premium.toFixed(2) + ' €';
    }
    
    // Update offersData with manual tariff rate and calculated premium
    if (!offer.insuranceTypes) offer.insuranceTypes = {};
    if (!offer.insuranceTypes.casco) offer.insuranceTypes.casco = {};
    offer.insuranceTypes.casco.premium = premium;
    offer.insuranceTypes.casco.tariffRate = tariffRateDecimal; // Store as decimal (0.025)
    offer.insuranceTypes.casco.insuranceData = {
        insuranceSum: insuranceSum,
        service: service,
        surcharges: surcharges,
        bonusMalus: bonusMalus,
        discounts: {},
        surchargesPercent: {},
        manualTariffRate: tariffRateDecimal, // Store that this is manually edited
        manualDiscount: manualDiscountCheckbox && manualDiscountCheckbox.checked ? manualDiscount : undefined,
        manualSurcharge: manualSurchargeCheckbox && manualSurchargeCheckbox.checked ? manualSurcharge : undefined
    };
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

function attachSaveOfferListener() {
    const saveBtn = document.getElementById('save-offer-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            await saveOffer();
        });
    }
}

async function saveOffer() {
    if (!offersData || !commonData) {
        alert('Няма данни за запазване');
        return;
    }
    
    const saveBtn = document.getElementById('save-offer-btn');
    const originalText = saveBtn ? saveBtn.textContent : '';
    
    try {
        // Disable button
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Запазване...';
        }
        
        // Get offer number
        const offerNumberInput = document.getElementById('offer-number');
        const offerNumber = offerNumberInput ? offerNumberInput.value.trim() : '';
        
        // Generate title from common data
        let title = '';
        if (commonData.registrationNumber && commonData.ownerName) {
            title = `${commonData.registrationNumber} - ${commonData.ownerName}`;
        } else if (commonData.registrationNumber) {
            title = commonData.registrationNumber;
        } else if (commonData.ownerName) {
            title = commonData.ownerName;
        } else {
            title = `Оферта ${new Date().toLocaleDateString('bg-BG')}`;
        }
        
        // Prepare data for saving
               const dataToSave = {
                   offerNumber: offerNumber || null,
                   commonData: commonData,
                   offersData: offersData.offers,
                   insuranceTypes: offersData.insuranceTypes,
                   title: title
               };
        
        // Check if we're editing an existing offer
        const editingOfferId = sessionStorage.getItem('editingOfferId');
        let response;
        
        if (editingOfferId) {
            // Update existing offer
            response = await fetch(`/api/offers/${editingOfferId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
        } else {
            // Create new offer
            response = await fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Грешка при запазване');
        }
        
        const savedOffer = await response.json();
        
        // Update editingOfferId if it's a new offer
        if (!editingOfferId && savedOffer.id) {
            sessionStorage.setItem('editingOfferId', savedOffer.id);
            if (saveBtn) {
                saveBtn.textContent = '💾 Обнови оферта';
            }
        }
        
        alert(editingOfferId ? 'Офертата е обновена успешно!' : 'Офертата е запазена успешно!');
        
    } catch (error) {
        console.error('Error saving offer:', error);
        alert('Грешка при запазване: ' + error.message);
    } finally {
        // Re-enable button
        if (saveBtn) {
            saveBtn.disabled = false;
            if (saveBtn.textContent === 'Запазване...') {
                saveBtn.textContent = originalText;
            }
        }
    }
}
