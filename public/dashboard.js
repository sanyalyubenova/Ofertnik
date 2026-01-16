// Dashboard JavaScript for index.html
let currentUser = null;

async function loadDashboard(user) {
    currentUser = user;
    const dashboardSection = document.getElementById('dashboard-section');
    const dashboardOffers = document.getElementById('dashboard-offers');
    
    if (!dashboardSection || !dashboardOffers) {
        return;
    }
    
    try {
        const response = await fetch('/api/offers?limit=10');
        if (!response.ok) {
            throw new Error('Failed to load offers');
        }
        
        const offers = await response.json();
        
        if (offers.length === 0) {
            dashboardSection.style.display = 'none';
            return;
        }
        
        dashboardSection.style.display = 'block';
        
        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        offers.forEach(offer => {
            const title = offer.title || `Оферта ${offer.id}`;
            const offerNumber = offer.offer_number || 'Няма номер';
            const createdDate = new Date(offer.created_at).toLocaleDateString('bg-BG');
            const commonData = typeof offer.common_data === 'string' ? JSON.parse(offer.common_data) : offer.common_data;
            const registrationNumber = commonData.registrationNumber || '';
            const ownerName = commonData.ownerName || '';
            const isOwner = offer.user_id === currentUser.id;
            
            html += `
                <div style="background: #f9f9f9; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; margin-bottom: 5px;">
                                ${title}
                                ${isOwner ? '<span style="color: #28a745; font-size: 12px; margin-left: 10px;">(Моя)</span>' : ''}
                            </div>
                            <div style="font-size: 12px; color: #666;">
                                Номер: ${offerNumber} | Създадена: ${createdDate} | От: ${offer.username}
                                ${registrationNumber ? ` | Рег. номер: ${registrationNumber}` : ''}
                                ${ownerName ? ` | ${ownerName}` : ''}
                            </div>
                        </div>
                        <div style="margin-left: 15px;">
                            ${isOwner 
                                ? `<button class="btn" style="padding: 5px 15px; font-size: 12px;" onclick="viewOfferFromDashboard(${offer.id}, true)">Редактирай</button>`
                                : `<button class="btn" style="padding: 5px 15px; font-size: 12px;" onclick="viewOfferFromDashboard(${offer.id}, false)">Преглед</button>`
                            }
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        dashboardOffers.innerHTML = html;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        dashboardSection.style.display = 'none';
    }
}

async function viewOfferFromDashboard(offerId, isOwner) {
    try {
        const response = await fetch(`/api/offers/${offerId}`);
        if (!response.ok) {
            throw new Error('Failed to load offer');
        }
        
        const offer = await response.json();
        
        // Prepare data for offer page
        const offersData = {
            commonData: typeof offer.common_data === 'string' ? JSON.parse(offer.common_data) : offer.common_data,
            insuranceTypes: typeof offer.insurance_types === 'string' ? JSON.parse(offer.insurance_types) : offer.insurance_types,
            offers: typeof offer.offers_data === 'string' ? JSON.parse(offer.offers_data) : offer.offers_data
        };
        
        // Add offer number to commonData
        if (offer.offer_number) {
            offersData.commonData.offerNumber = offer.offer_number;
        }
        
        // Store in sessionStorage
        sessionStorage.setItem('offersData', JSON.stringify(offersData));
        if (offer.offer_number) {
            sessionStorage.setItem('offerNumber', offer.offer_number);
        }
        
        // Store offer ID for potential update (only if owner)
        if (isOwner) {
            sessionStorage.setItem('editingOfferId', offerId);
        } else {
            sessionStorage.removeItem('editingOfferId');
        }
        
        // Redirect to offer page
        window.location.href = '/offer';
    } catch (error) {
        console.error('Error loading offer:', error);
        alert('Грешка при зареждане на офертата.');
    }
}

