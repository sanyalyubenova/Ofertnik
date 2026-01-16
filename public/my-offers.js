// My Offers page JavaScript
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get current user
        const userResponse = await fetch('/api/me');
        if (!userResponse.ok) {
            window.location.href = '/login';
            return;
        }
        currentUser = await userResponse.json();
        
        // Load offers
        await loadMyOffers();
    } catch (error) {
        console.error('Error initializing:', error);
        document.getElementById('offers-list').innerHTML = '<p class="empty-state">Грешка при зареждане на офертите.</p>';
    }
});

async function loadMyOffers() {
    const offersList = document.getElementById('offers-list');
    offersList.innerHTML = '<p>Зареждане...</p>';
    
    try {
        const response = await fetch('/api/offers/my');
        if (!response.ok) {
            throw new Error('Failed to load offers');
        }
        
        const offers = await response.json();
        
        if (offers.length === 0) {
            offersList.innerHTML = '<div class="empty-state"><p>Няма запазени оферти.</p><p><a href="/" class="admin-link">Създай нова оферта</a></p></div>';
            return;
        }
        
        let html = '';
        offers.forEach(offer => {
            const title = offer.title || `Оферта ${offer.id}`;
            const offerNumber = offer.offer_number || 'Няма номер';
            const createdDate = new Date(offer.created_at).toLocaleDateString('bg-BG');
            const commonData = typeof offer.common_data === 'string' ? JSON.parse(offer.common_data) : offer.common_data;
            const registrationNumber = commonData.registrationNumber || '';
            const ownerName = commonData.ownerName || '';
            
            html += `
                <div class="offer-item" data-offer-id="${offer.id}">
                    <div class="offer-header">
                        <div>
                            <div class="offer-title">${title}</div>
                            <div class="offer-meta">
                                Номер: ${offerNumber} | Създадена: ${createdDate}
                                ${registrationNumber ? ` | Рег. номер: ${registrationNumber}` : ''}
                                ${ownerName ? ` | ${ownerName}` : ''}
                            </div>
                        </div>
                        <div class="offer-actions">
                            <button class="btn-small" onclick="editOffer(${offer.id})">Редактирай</button>
                            <button class="btn-small danger" onclick="deleteOffer(${offer.id})">Изтрий</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        offersList.innerHTML = html;
    } catch (error) {
        console.error('Error loading offers:', error);
        offersList.innerHTML = '<p class="empty-state">Грешка при зареждане на офертите.</p>';
    }
}

function editOffer(offerId) {
    // Load offer data and redirect to offer page with edit mode
    loadOfferToSession(offerId, true);
}

async function loadOfferToSession(offerId, editMode) {
    try {
        const response = await fetch(`/api/offers/${offerId}`);
        if (!response.ok) {
            throw new Error('Failed to load offer');
        }
        
        const offer = await response.json();
        
        // Check if user owns this offer (for edit mode)
        if (editMode && offer.user_id !== currentUser.id) {
            alert('Нямате права за редактиране на тази оферта.');
            return;
        }
        
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
        
        // Store offer ID for potential update
        if (editMode) {
            sessionStorage.setItem('editingOfferId', offerId);
        }
        
        // Redirect to offer page
        window.location.href = '/offer';
    } catch (error) {
        console.error('Error loading offer:', error);
        alert('Грешка при зареждане на офертата.');
    }
}

async function deleteOffer(offerId) {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази оферта?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/offers/${offerId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete offer');
        }
        
        // Reload offers list
        await loadMyOffers();
    } catch (error) {
        console.error('Error deleting offer:', error);
        alert('Грешка при изтриване на офертата: ' + error.message);
    }
}

