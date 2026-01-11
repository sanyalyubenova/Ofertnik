// Hyundai models list
const hyundaiModels = [
    'i10', 'i20', 'i30', 'i40', 'Kona', 'Tucson', 'Santa Fe', 
    'Elantra', 'IONIQ', 'IONIQ 5', 'IONIQ 6', 'Bayon', 'IX20', 'IX35', 'Staria'
];

// Popular European car brands
const carBrands = [
    'Hyundai', 'Volkswagen', 'Toyota', 'Ford', 'Opel', 'Renault', 
    'Peugeot', 'Citroen', 'BMW', 'Mercedes-Benz', 'Audi', 'Skoda', 
    'Seat', 'Fiat', 'Nissan', 'Kia', 'Mazda', 'Suzuki', 'Dacia'
];

// Bulgarian regions and municipalities
const bulgarianRegions = {
    'Благоевград': ['Банско', 'Белица', 'Благоевград', 'Гоце Делчев', 'Гърмен', 'Кресна', 'Петрич', 'Разлог', 'Сандански', 'Сатовча', 'Симитли', 'Струмяни', 'Хаджидимово', 'Якоруда'],
    'Бургас': ['Айтос', 'Бургас', 'Камено', 'Карнобат', 'Малко Търново', 'Несебър', 'Поморие', 'Приморско', 'Руен', 'Созопол', 'Средец', 'Сунгурларе', 'Царево'],
    'Варна': ['Аврен', 'Аксаково', 'Белослав', 'Варна', 'Ветрино', 'Вълчи дол', 'Девня', 'Долни чифлик', 'Дългопол', 'Провадия', 'Суворово'],
    'Велико Търново': ['Велико Търново', 'Горна Оряховица', 'Елена', 'Златарица', 'Лясковец', 'Павликени', 'Полски Тръмбеш', 'Свищов', 'Стражица', 'Сухиндол'],
    'Видин': ['Белоградчик', 'Бойница', 'Брегово', 'Видин', 'Грамада', 'Димово', 'Кула', 'Макреш', 'Ново село', 'Ружинци', 'Чупрене'],
    'Враца': ['Борован', 'Бяла Слатина', 'Враца', 'Козлодуй', 'Криводол', 'Мездра', 'Мизия', 'Оряхово', 'Роман', 'Хайредин'],
    'Габрово': ['Габрово', 'Дряново', 'Севлиево', 'Трявна'],
    'Добрич': ['Балчик', 'Генерал Тошево', 'Добрич', 'Каварна', 'Крушари', 'Тервел', 'Шабла'],
    'Кърджали': ['Ардино', 'Джебел', 'Кирково', 'Крумовград', 'Кърджали', 'Момчилград', 'Черноочене'],
    'Кюстендил': ['Бобов дол', 'Бобошево', 'Дупница', 'Ковачевци', 'Кюстендил', 'Невестино', 'Рила', 'Сапарева баня', 'Трекляно'],
    'Ловеч': ['Априлци', 'Летница', 'Ловеч', 'Луковит', 'Троян', 'Угърчин', 'Ябланица'],
    'Монтана': ['Берковица', 'Бойчиновци', 'Брусарци', 'Вълчедръм', 'Вършец', 'Георги Дамяново', 'Лом', 'Медковец', 'Монтана', 'Чипровци', 'Якимово'],
    'Пазарджик': ['Батак', 'Белово', 'Брацигово', 'Велинград', 'Лесичово', 'Пазарджик', 'Панагюрище', 'Пещера', 'Ракитово', 'Септември', 'Стрелча'],
    'Перник': ['Брезник', 'Ковачевци', 'Перник', 'Радомир', 'Трън', 'Земен'],
    'Плевен': ['Белене', 'Гулянци', 'Долна Митрополия', 'Долни Дъбник', 'Искър', 'Кнежа', 'Левски', 'Никопол', 'Плевен', 'Пордим', 'Червен бряг'],
    'Пловдив': ['Асеновград', 'Брезово', 'Калояново', 'Карлово', 'Кричим', 'Куклен', 'Лъки', 'Марица', 'Перущица', 'Пловдив', 'Раковски', 'Родопи', 'Садово', 'Сопот', 'Стамболийски', 'Съединение'],
    'Разград': ['Исперих', 'Кубрат', 'Лозница', 'Разград', 'Самуил', 'Цар Калоян'],
    'Русе': ['Борово', 'Бяла', 'Ветово', 'Две могили', 'Иваново', 'Русе', 'Сливо поле', 'Ценово'],
    'Силистра': ['Алфатар', 'Главиница', 'Дулово', 'Кайнарджа', 'Силистра', 'Ситово', 'Тутракан'],
    'Сливен': ['Котел', 'Нова Загора', 'Сливен', 'Твърдица'],
    'Смолян': ['Баня', 'Борино', 'Девин', 'Доспат', 'Златоград', 'Мадан', 'Неделино', 'Рудозем', 'Смолян', 'Чепеларе'],
    'София (град)': ['София'],
    'София (област)': ['Антон', 'Божурище', 'Ботевград', 'Годеч', 'Горна Малина', 'Долна баня', 'Драгоман', 'Елин Пелин', 'Етрополе', 'Златица', 'Ихтиман', 'Копривщица', 'Костенец', 'Костинброд', 'Мирково', 'Пирдоп', 'Правец', 'Самоков', 'Своге', 'Сливница', 'Стара Загора', 'Чавдар', 'Челопеч'],
    'Стара Загора': ['Братя Даскалови', 'Гурково', 'Гълъбово', 'Казанлък', 'Мъглиж', 'Николаево', 'Опан', 'Павел баня', 'Раднево', 'Стара Загора', 'Чирпан'],
    'Търговище': ['Антоново', 'Омуртаг', 'Опака', 'Попово', 'Търговище'],
    'Хасково': ['Димитровград', 'Ивайловград', 'Любимец', 'Маджарово', 'Минерални бани', 'Симеоновград', 'Стамболово', 'Тополовград', 'Харманли', 'Хасково'],
    'Шумен': ['Велики Преслав', 'Венец', 'Върбица', 'Каолиново', 'Каспичан', 'Никола Козлево', 'Нови пазар', 'Плиска', 'Смядово', 'Хитрино', 'Шумен'],
    'Ямбол': ['Болярово', 'Елхово', 'Стралджа', 'Тунджа', 'Ямбол']
};

// Insurance type switching and form initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeBrandModelLogic();
    initializeInsuranceTypeSwitching();
    initializeCalculators();
    initializeDateInputs();
    initializeClearButtons();
    initializeAddressRegistration();
    loadCalculatorFormData();
    initializeClearFormButton();
});

function initializeBrandModelLogic() {
    const brandSelect = document.getElementById('vehicle-brand');
    const modelSelect = document.getElementById('vehicle-model');
    const modelManualInput = document.getElementById('vehicle-model-manual');
    const modelOtherInput = document.getElementById('vehicle-model-other');
    const otherBrandGroup = document.getElementById('other-brand-group');
    const otherBrandInput = document.getElementById('other-brand-name');

    // Load Hyundai models by default
    loadHyundaiModels();
    
    // Initialize Owner Type toggle (Person/Company)
    initializeOwnerTypeToggle();
    
    // Initialize EGN/Birthdate toggle
    initializeEgnBirthdateToggle();
    
    // Initialize Bonus/Malus toggle
    initializeBonusMalusToggle();

    brandSelect.addEventListener('change', () => {
        const selectedBrand = brandSelect.value;
        
        if (selectedBrand === 'other') {
            // Show manual brand input
            otherBrandGroup.style.display = 'block';
            otherBrandInput.required = true;
            // Show manual model input, hide dropdown
            modelSelect.style.display = 'none';
            modelSelect.required = false;
            modelManualInput.style.display = 'block';
            modelManualInput.required = true;
            modelOtherInput.style.display = 'none';
            modelOtherInput.required = false;
        } else {
            // Hide manual brand input
            otherBrandGroup.style.display = 'none';
            otherBrandInput.required = false;
            
            if (selectedBrand === 'Hyundai') {
                // Show Hyundai models dropdown
                modelSelect.style.display = 'block';
                modelSelect.required = true;
                modelManualInput.style.display = 'none';
                modelManualInput.required = false;
                modelOtherInput.style.display = 'none';
                modelOtherInput.required = false;
                loadHyundaiModels();
            } else {
                // Show manual model input for other brands
                modelSelect.style.display = 'none';
                modelSelect.required = false;
                modelManualInput.style.display = 'block';
                modelManualInput.required = true;
                modelOtherInput.style.display = 'none';
                modelOtherInput.required = false;
            }
        }
    });

    // Handle Hyundai model selection (including "Друг модел" option)
    modelSelect.addEventListener('change', () => {
        const selectedModel = modelSelect.value;
        if (selectedModel === 'other') {
            // Show manual model input for "Друг модел"
            modelOtherInput.style.display = 'block';
            modelOtherInput.required = true;
            modelSelect.required = false;
        } else {
            // Hide manual model input
            modelOtherInput.style.display = 'none';
            modelOtherInput.required = false;
            modelSelect.required = true;
        }
    });
}

function loadHyundaiModels() {
    const modelSelect = document.getElementById('vehicle-model');
    modelSelect.innerHTML = '';
    
    // Add empty default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Изберете модел';
    modelSelect.appendChild(defaultOption);
    
    hyundaiModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });
    
    // Add "Друг модел" option
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'Друг модел';
    modelSelect.appendChild(otherOption);
}

function initializeBonusMalusToggle() {
    const bonusBtn = document.querySelector('.input-type-btn[data-type="bonus"]');
    const malusBtn = document.querySelector('.input-type-btn[data-type="malus"]');
    
    if (!bonusBtn || !malusBtn) return;
    
    bonusBtn.addEventListener('click', () => {
        bonusBtn.classList.add('active');
        malusBtn.classList.remove('active');
    });
    
    malusBtn.addEventListener('click', () => {
        malusBtn.classList.add('active');
        bonusBtn.classList.remove('active');
    });
}

function initializeOwnerTypeToggle() {
    const personBtn = document.querySelector('.owner-type-btn[data-type="person"]');
    const companyBtn = document.querySelector('.owner-type-btn[data-type="company"]');
    const ownerNameLabel = document.getElementById('owner-name-label');
    const ownerNameInput = document.getElementById('owner-name');
    const egnBirthdateGroup = document.getElementById('egn-birthdate-group');
    
    if (!personBtn || !companyBtn || !egnBirthdateGroup) return;
    
    // Update UI based on owner type
    function updateOwnerTypeUI(isPerson) {
        if (isPerson) {
            ownerNameLabel.innerHTML = 'Собственик (три имена) <span class="required">*</span>';
            ownerNameInput.placeholder = 'Име Презиме Фамилия';
            egnBirthdateGroup.style.display = 'block';
            // Make EGN/Birthdate required
            const egnInput = document.getElementById('egn-input');
            const birthdateInput = document.getElementById('birthdate-input');
            const egnBtn = document.querySelector('.input-type-btn[data-type="egn"]');
            if (egnBtn && egnBtn.classList.contains('active') && egnInput) {
                egnInput.required = true;
            } else if (birthdateInput) {
                birthdateInput.required = true;
            }
        } else {
            ownerNameLabel.innerHTML = 'Собственик (име на фирма) <span class="required">*</span>';
            ownerNameInput.placeholder = 'Име на фирмата';
            egnBirthdateGroup.style.display = 'none';
            // Make EGN/Birthdate not required and clear values
            const egnInput = document.getElementById('egn-input');
            const birthdateInput = document.getElementById('birthdate-input');
            if (egnInput) {
                egnInput.required = false;
                egnInput.value = '';
            }
            if (birthdateInput) {
                birthdateInput.required = false;
                birthdateInput.value = '';
            }
            // Clear age display
            const ageDisplay = document.getElementById('age-display');
            if (ageDisplay) ageDisplay.textContent = '';
        }
    }
    
    personBtn.addEventListener('click', () => {
        personBtn.classList.add('active');
        companyBtn.classList.remove('active');
        updateOwnerTypeUI(true);
    });
    
    companyBtn.addEventListener('click', () => {
        companyBtn.classList.add('active');
        personBtn.classList.remove('active');
        updateOwnerTypeUI(false);
    });
    
    // Initialize with person (default)
    updateOwnerTypeUI(true);
}

function initializeEgnBirthdateToggle() {
    const egnBtn = document.querySelector('.input-type-btn[data-type="egn"]');
    const birthdateBtn = document.querySelector('.input-type-btn[data-type="birthdate"]');
    const egnInput = document.getElementById('egn-input');
    const birthdateInput = document.getElementById('birthdate-input');
    const ageDisplay = document.getElementById('age-display');
    
    if (!egnBtn || !birthdateBtn || !egnInput || !birthdateInput || !ageDisplay) return;
    
    // Function to calculate and display age
    function calculateAndDisplayAge() {
        const egnBtnActive = egnBtn.classList.contains('active');
        let age = null;
        
        if (egnBtnActive && egnInput.value) {
            // Calculate age from EGN
            age = calculateAgeFromEGN(egnInput.value);
        } else if (!egnBtnActive && birthdateInput.value) {
            // Calculate age from birthdate
            age = calculateAgeFromDate(birthdateInput.value);
        }
        
        if (age !== null) {
            ageDisplay.textContent = `Възраст: ${age} ${age === 1 ? 'година' : 'години'}`;
            ageDisplay.classList.add('show');
        } else {
            ageDisplay.classList.remove('show');
        }
    }
    
    egnBtn.addEventListener('click', () => {
        egnBtn.classList.add('active');
        birthdateBtn.classList.remove('active');
        egnInput.style.display = 'block';
        egnInput.required = true;
        birthdateInput.style.display = 'none';
        birthdateInput.required = false;
        birthdateInput.value = '';
        calculateAndDisplayAge();
    });
    
    birthdateBtn.addEventListener('click', () => {
        birthdateBtn.classList.add('active');
        egnBtn.classList.remove('active');
        birthdateInput.style.display = 'block';
        birthdateInput.required = true;
        egnInput.style.display = 'none';
        egnInput.required = false;
        egnInput.value = '';
        calculateAndDisplayAge();
    });
    
    // Listen for input changes
    egnInput.addEventListener('input', () => {
        calculateAndDisplayAge();
    });
    
    birthdateInput.addEventListener('input', () => {
        calculateAndDisplayAge();
    });
}

function calculateAgeFromEGN(egn) {
    // Bulgarian EGN format: YYMMDD (first 6 digits)
    // Months: 01-12 (1900-1999), 21-32 (1800-1899), 41-52 (2000-2099)
    if (!egn) return null;
    
    const digits = egn.replace(/\D/g, '');
    if (digits.length < 6) return null;
    
    try {
        const yy = parseInt(digits.substring(0, 2));
        let mm = parseInt(digits.substring(2, 4));
        const dd = parseInt(digits.substring(4, 6));
        
        if (dd < 1 || dd > 31) return null;
        
        // Determine century based on month
        let year;
        if (mm >= 1 && mm <= 12) {
            // Normal month: 1900-1999
            year = 1900 + yy;
        } else if (mm >= 21 && mm <= 32) {
            // Month + 20: 1800-1899
            year = 1800 + yy;
            mm = mm - 20;
        } else if (mm >= 41 && mm <= 52) {
            // Month + 40: 2000-2099
            year = 2000 + yy;
            mm = mm - 40;
        } else {
            return null; // Invalid month
        }
        
        // Validate date
        const birthDate = new Date(year, mm - 1, dd);
        if (birthDate.getFullYear() !== year || 
            birthDate.getMonth() !== mm - 1 || 
            birthDate.getDate() !== dd) {
            return null;
        }
        
        return calculateAgeFromDate(birthDate);
    } catch (e) {
        return null;
    }
}

function calculateAgeFromDate(dateInput) {
    let birthDate;
    
    if (dateInput instanceof Date) {
        birthDate = dateInput;
    } else if (typeof dateInput === 'string' && dateInput.includes('/')) {
        // Parse dd/mm/yyyy format
        birthDate = parseDate(dateInput);
        if (!birthDate) return null;
    } else {
        birthDate = new Date(dateInput);
        if (isNaN(birthDate.getTime())) return null;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age >= 0 ? age : null;
}

function initializeDateInputs() {
    // Add date masking to all date inputs
    const dateInputs = [
        document.getElementById('first-registration-date'),
        document.getElementById('birthdate-input'),
        document.getElementById('gap-registration-date')
    ];
    
    dateInputs.forEach(input => {
        if (!input) return;
        
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            
            // Add slashes automatically
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            if (value.length >= 5) {
                value = value.substring(0, 5) + '/' + value.substring(5, 9);
            }
            
            e.target.value = value;
        });
        
        // Validate date format on blur
        input.addEventListener('blur', (e) => {
            const value = e.target.value;
            if (value && !isValidDate(value)) {
                e.target.setCustomValidity('Моля, въведете валидна дата във формат dd/mm/yyyy');
                e.target.reportValidity();
            } else {
                e.target.setCustomValidity('');
            }
        });
    });
}

function isValidDate(dateString) {
    // Format: dd/mm/yyyy
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(datePattern);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    // Validate ranges
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;
    
    // Check if date is valid (handles leap years, etc.)
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
}

function parseDate(dateString) {
    // Parse dd/mm/yyyy to Date object
    if (!dateString) return null;
    
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(datePattern);
    
    if (!match) return null;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    return new Date(year, month - 1, day);
}

function formatDate(date) {
    // Format Date object to dd/mm/yyyy
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function initializeClearButtons() {
    // Get all text and number input fields
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    
    inputs.forEach(input => {
        // Skip if already wrapped or if it's a file input
        if (input.closest('.input-wrapper') || input.type === 'file') return;
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';
        
        // Create clear button
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'clear-btn';
        clearBtn.innerHTML = '×';
        clearBtn.setAttribute('aria-label', 'Изчисти поле');
        
        // Wrap input
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(clearBtn);
        
        // Function to toggle clear button visibility
        const toggleClearButton = () => {
            if (input.value && input.value.trim() !== '' && input.value !== '0') {
                clearBtn.classList.add('show');
            } else {
                clearBtn.classList.remove('show');
            }
        };
        
        // Initial state
        toggleClearButton();
        
        // Show/hide clear button on input
        input.addEventListener('input', toggleClearButton);
        input.addEventListener('change', toggleClearButton);
        
        // Clear input on button click
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            input.value = '';
            input.focus();
            toggleClearButton();
            
            // Trigger input event for any listeners (like date formatting, age calculation, etc.)
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
    });
}

function initializeCityAutocomplete() {
    const cityInput = document.getElementById('address-city');
    const suggestionsDiv = document.getElementById('city-suggestions');
    const regionSelect = document.getElementById('address-region');
    const municipalitySelect = document.getElementById('address-municipality');
    
    if (!cityInput || !suggestionsDiv || !regionSelect || !municipalitySelect) return;
    
    let selectedIndex = -1;
    let filteredCities = [];
    
    function filterCities(query) {
        if (!query || query.length < 1) {
            return [];
        }
        const lowerQuery = query.toLowerCase();
        return bulgarianCities.filter(city => 
            city.name.toLowerCase().includes(lowerQuery)
        ).slice(0, 10); // Limit to 10 suggestions
    }
    
    function displaySuggestions(cities) {
        suggestionsDiv.innerHTML = '';
        
        if (cities.length === 0) {
            suggestionsDiv.classList.remove('show');
            return;
        }
        
        cities.forEach((city, index) => {
            const div = document.createElement('div');
            div.className = 'autocomplete-suggestion';
            div.textContent = `${city.name}, ${city.region}`;
            div.setAttribute('data-city', city.name);
            div.setAttribute('data-region', city.region);
            div.setAttribute('data-municipality', city.municipality);
            
            div.addEventListener('click', () => {
                selectCity(city);
            });
            
            div.addEventListener('mouseenter', () => {
                selectedIndex = index;
                updateSelectedSuggestion();
            });
            
            suggestionsDiv.appendChild(div);
        });
        
        suggestionsDiv.classList.add('show');
        selectedIndex = -1;
    }
    
    function updateSelectedSuggestion() {
        const suggestions = suggestionsDiv.querySelectorAll('.autocomplete-suggestion');
        suggestions.forEach((suggestion, index) => {
            if (index === selectedIndex) {
                suggestion.classList.add('selected');
            } else {
                suggestion.classList.remove('selected');
            }
        });
    }
    
    function selectCity(city) {
        cityInput.value = city.name;
        suggestionsDiv.classList.remove('show');
        
        // Normalize region name - handle cases like "София" vs "София (град)" or "София (област)"
        let targetRegion = city.region;
        if (city.region === 'София') {
            // Check if municipality exists in "София (град)" or "София (област)"
            if (city.municipality === 'София') {
                targetRegion = 'София (град)';
            } else {
                // Check if municipality exists in София (област)
                if (bulgarianRegions['София (област)'] && bulgarianRegions['София (област)'].includes(city.municipality)) {
                    targetRegion = 'София (област)';
                } else if (bulgarianRegions['София (град)'] && bulgarianRegions['София (град)'].includes(city.municipality)) {
                    targetRegion = 'София (град)';
                } else {
                    // Default to София (област) if municipality not found in either
                    targetRegion = 'София (област)';
                }
            }
        }
        
        // Set region first
        if (regionSelect.value !== targetRegion) {
            // Find the region option (handle exact match first, then case-insensitive)
            let regionFound = false;
            for (let i = 0; i < regionSelect.options.length; i++) {
                const option = regionSelect.options[i];
                if (option.value === targetRegion || option.textContent === targetRegion) {
                    regionSelect.value = option.value;
                    regionFound = true;
                    break;
                }
            }
            
            if (!regionFound) {
                // Try case-insensitive match
                for (let i = 0; i < regionSelect.options.length; i++) {
                    const option = regionSelect.options[i];
                    if (option.value.toLowerCase() === targetRegion.toLowerCase() || 
                        option.textContent.toLowerCase() === targetRegion.toLowerCase()) {
                        regionSelect.value = option.value;
                        regionFound = true;
                        break;
                    }
                }
            }
            
            if (regionFound) {
                // Trigger change event to populate municipalities
                const changeEvent = new Event('change', { bubbles: true, cancelable: true });
                regionSelect.dispatchEvent(changeEvent);
            } else {
                // Region not found - log for debugging
                console.warn(`Region not found: "${targetRegion}". Available regions:`, 
                    Array.from(regionSelect.options).map(opt => opt.value || opt.textContent));
            }
        }
        
        // Wait for municipality options to load, then set municipality
        // Use a more robust approach: wait until municipality select is populated
        const setMunicipality = () => {
            // Make sure region is set correctly (for София regions)
            const currentRegion = regionSelect.value;
            const expectedRegion = targetRegion || city.region;
            
            // If region hasn't been set correctly yet, wait a bit more
            if (city.region === 'София' && currentRegion !== expectedRegion && 
                currentRegion !== 'София (град)' && currentRegion !== 'София (област)') {
                setTimeout(setMunicipality, 50);
                return;
            }
            // Check if municipality select is populated and not disabled
            if (!municipalitySelect) return;
            
            // If disabled, municipalities haven't loaded yet - try again
            if (municipalitySelect.disabled) {
                setTimeout(setMunicipality, 50);
                return;
            }
            
            // If no options (except placeholder), wait a bit more
            if (municipalitySelect.options.length <= 1) {
                setTimeout(setMunicipality, 50);
                return;
            }
            
            // Try to find and set the municipality
            let found = false;
            const cityMunicipality = city.municipality.trim();
            
            // Try exact match first
            for (let i = 0; i < municipalitySelect.options.length; i++) {
                const option = municipalitySelect.options[i];
                if (option.value && option.value.trim() === cityMunicipality) {
                    municipalitySelect.value = option.value;
                    municipalitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                    found = true;
                    return;
                }
            }
            
            // Try case-insensitive match
            if (!found) {
                for (let i = 0; i < municipalitySelect.options.length; i++) {
                    const option = municipalitySelect.options[i];
                    if (option.value && option.value.trim().toLowerCase() === cityMunicipality.toLowerCase()) {
                        municipalitySelect.value = option.value;
                        municipalitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                        found = true;
                        return;
                    }
                }
            }
            
            // Try matching with textContent as well
            if (!found) {
                for (let i = 0; i < municipalitySelect.options.length; i++) {
                    const option = municipalitySelect.options[i];
                    if (option.textContent && option.textContent.trim() === cityMunicipality) {
                        municipalitySelect.value = option.value || option.textContent.trim();
                        municipalitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                        found = true;
                        return;
                    }
                }
            }
            
            // Try case-insensitive match with textContent
            if (!found) {
                for (let i = 0; i < municipalitySelect.options.length; i++) {
                    const option = municipalitySelect.options[i];
                    if (option.textContent && option.textContent.trim().toLowerCase() === cityMunicipality.toLowerCase()) {
                        municipalitySelect.value = option.value || option.textContent.trim();
                        municipalitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                        found = true;
                        return;
                    }
                }
            }
            
            // If still not found, log for debugging (remove in production if needed)
            if (!found && cityMunicipality) {
                console.warn(`Municipality not found: "${cityMunicipality}" in region "${city.region}". Available options:`, 
                    Array.from(municipalitySelect.options).map(opt => opt.value || opt.textContent));
            }
        };
        
        // Initial attempt after 100ms
        setTimeout(setMunicipality, 100);
        
        // Fallback attempts in case the first one is too early
        setTimeout(setMunicipality, 200);
        setTimeout(setMunicipality, 300);
        setTimeout(setMunicipality, 500);
    }
    
    cityInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        filteredCities = filterCities(query);
        displaySuggestions(filteredCities);
        selectedIndex = -1;
    });
    
    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (filteredCities.length > 0) {
                selectedIndex = Math.min(selectedIndex + 1, filteredCities.length - 1);
                updateSelectedSuggestion();
                const suggestions = suggestionsDiv.querySelectorAll('.autocomplete-suggestion');
                if (suggestions[selectedIndex]) {
                    suggestions[selectedIndex].scrollIntoView({ block: 'nearest' });
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelectedSuggestion();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && filteredCities[selectedIndex]) {
                selectCity(filteredCities[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            suggestionsDiv.classList.remove('show');
        }
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!cityInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.classList.remove('show');
        }
    });
}

function initializeAddressRegistration() {
    // Initialize city autocomplete first
    initializeCityAutocomplete();
    
    // Initialize region and municipality dropdowns in common data section
    const addressRegion = document.getElementById('address-region');
    const addressMunicipality = document.getElementById('address-municipality');
    
    if (!addressRegion || !addressMunicipality) return;
    
    // Populate region dropdown
    const regions = Object.keys(bulgarianRegions).sort();
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        addressRegion.appendChild(option);
    });
    
    // Handle region change and populate municipalities
    addressRegion.addEventListener('change', () => {
        const selectedRegion = addressRegion.value;
        addressMunicipality.innerHTML = '';
        
        if (selectedRegion && bulgarianRegions[selectedRegion]) {
            addressMunicipality.disabled = false;
            addressMunicipality.innerHTML = '<option value="">Изберете община</option>';
            
            const municipalities = bulgarianRegions[selectedRegion].sort();
            municipalities.forEach(municipality => {
                const option = document.createElement('option');
                option.value = municipality;
                option.textContent = municipality;
                addressMunicipality.appendChild(option);
            });
        } else {
            addressMunicipality.disabled = true;
            addressMunicipality.innerHTML = '<option value="">Първо изберете област</option>';
        }
    });
}

function initializeInsuranceTypeSwitching() {
    const insuranceBtns = document.querySelectorAll('.insurance-btn');
    const fields = {
        mtpl: document.getElementById('mtpl-fields'),
        gap: document.getElementById('gap-fields')
    };
    const calculateBtn = document.getElementById('calculate-premium-btn');
    const resultDiv = document.getElementById('premium-result');

    // Initialize - no fields shown by default
    Object.values(fields).forEach(field => {
        if (field) field.style.display = 'none';
    });
    if (calculateBtn) calculateBtn.style.display = 'none';
    if (resultDiv) resultDiv.innerHTML = '';

    insuranceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            
            // Toggle active button (allow multiple selections)
            btn.classList.toggle('active');
            const isActive = btn.classList.contains('active');
            
            // Show/hide fields based on button state (skip CASCO)
            if (type !== 'casco' && fields[type]) {
                if (isActive) {
                    fields[type].style.display = 'block';
                } else {
                    fields[type].style.display = 'none';
                }
            }
            
            // Show calculate button if at least one insurance type is selected
            const hasActiveType = Array.from(insuranceBtns).some(b => b.classList.contains('active'));
            if (calculateBtn) {
                calculateBtn.style.display = hasActiveType ? 'block' : 'none';
            }
        });
    });
}

function initializeCalculators() {
    const calculateBtn = document.getElementById('calculate-premium-btn');
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await calculateAllOffers();
        });
    }

    // Power conversion (kW <-> HP)
    const powerKWInput = document.getElementById('mtpl-power-kw');
    const powerHPInput = document.getElementById('mtpl-power-hp');

    if (powerKWInput && powerHPInput) {
        powerKWInput.addEventListener('input', () => {
            if (powerKWInput.value) {
                const hp = parseFloat(powerKWInput.value) / 1.36;
                powerHPInput.value = hp.toFixed(2);
            }
        });

        powerHPInput.addEventListener('input', () => {
            if (powerHPInput.value) {
                const kw = parseFloat(powerHPInput.value) * 1.36;
                powerKWInput.value = kw.toFixed(2);
            }
        });
    }
}

async function calculatePremium(insuranceType, form, resultId) {
    const resultDiv = document.getElementById(resultId);
    
    // Get common data
    const commonDataForm = document.getElementById('common-data-form');
    const commonFormData = new FormData(commonDataForm);
    const commonData = {};
    commonFormData.forEach((value, key) => {
        if (value) commonData[key] = value;
    });
    
    // Handle EGN/Birthdate - get the active field value
    const egnInput = document.getElementById('egn-input');
    const birthdateInput = document.getElementById('birthdate-input');
    const egnBtn = document.querySelector('.input-type-btn[data-type="egn"]');
    
    if (egnBtn && egnBtn.classList.contains('active')) {
        // EGN is active
        if (egnInput && egnInput.value) {
            commonData.egnBirthdate = egnInput.value;
            commonData.egn = egnInput.value;
        }
    } else {
        // Birthdate is active
        if (birthdateInput && birthdateInput.value) {
            commonData.egnBirthdate = birthdateInput.value;
            commonData.birthdate = birthdateInput.value;
        }
    }

    // Handle brand and model
    if (commonData.vehicleBrand === 'other') {
        commonData.vehicleBrand = commonData.otherBrandName || 'Друга марка';
    }
    
    // Handle model selection
    const modelManualInput = document.getElementById('vehicle-model-manual');
    const modelOtherInput = document.getElementById('vehicle-model-other');
    const modelSelect = document.getElementById('vehicle-model');
    
    if (modelManualInput.style.display !== 'none') {
        // Manual input for non-Hyundai brands
        commonData.vehicleModel = modelManualInput.value;
    } else if (modelOtherInput.style.display !== 'none') {
        // Manual input for "Друг модел" option in Hyundai
        commonData.vehicleModel = modelOtherInput.value;
    } else {
        // Selected from dropdown
        commonData.vehicleModel = modelSelect.value;
    }

    // Get insurance-specific data from the active insurance fields
    const insuranceData = {};
    const activeFields = document.querySelectorAll('.insurance-fields[style*="block"]');
    
    activeFields.forEach(field => {
        const inputs = field.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.value && input.name) {
                insuranceData[input.name] = input.value;
            }
        });
    });
    
    // Handle bonus/malus: convert to negative for malus (overcharge), keep positive for bonus (discount)
    if (insuranceType === 'casco' && insuranceData.bonusMalus) {
        const bonusBtn = document.querySelector('#casco-fields .input-type-btn[data-type="bonus"]');
        const malusBtn = document.querySelector('#casco-fields .input-type-btn[data-type="malus"]');
        const bonusMalusValue = parseFloat(insuranceData.bonusMalus) || 0;
        
        if (malusBtn && malusBtn.classList.contains('active')) {
            // Малус = надбавка, изпращаме отрицателно число
            insuranceData.bonusMalus = -Math.abs(bonusMalusValue);
        } else {
            // Бонус = отстъпка, изпращаме положително число
            insuranceData.bonusMalus = Math.abs(bonusMalusValue);
        }
    }

    // For MTPL, handle power conversion
    if (insuranceType === 'mtpl') {
        const powerKW = parseFloat(insuranceData.powerKW) || 0;
        const powerHP = parseFloat(insuranceData.powerHP) || 0;
        // Use whichever is provided, convert if needed
        if (powerKW > 0) {
            insuranceData.powerKW = powerKW;
        } else if (powerHP > 0) {
            insuranceData.powerKW = powerHP * 1.36;
        }
    }

    // For GAP, use registration date from form or fallback to common data
    if (insuranceType === 'gap') {
        if (!insuranceData.registrationDate && commonData.firstRegistrationDate) {
            insuranceData.registrationDate = commonData.firstRegistrationDate;
        }
    }
    
    // Convert dates from dd/mm/yyyy to ISO format for server
    if (commonData.firstRegistrationDate) {
        const parsedDate = parseDate(commonData.firstRegistrationDate);
        if (parsedDate) {
            commonData.firstRegistrationDate = parsedDate.toISOString().split('T')[0];
        }
    }
    if (commonData.birthdate) {
        const parsedDate = parseDate(commonData.birthdate);
        if (parsedDate) {
            commonData.birthdate = parsedDate.toISOString().split('T')[0];
        }
    }
    if (insuranceData.registrationDate) {
        const parsedDate = parseDate(insuranceData.registrationDate);
        if (parsedDate) {
            insuranceData.registrationDate = parsedDate.toISOString().split('T')[0];
        }
    }

    // Merge all data
    const data = { ...commonData, ...insuranceData };

    try {
        resultDiv.classList.remove('show');
        resultDiv.innerHTML = '';
        
        // For CASCO and MTPL, also get comparison
        if (insuranceType === 'casco' || insuranceType === 'mtpl') {
            const [calculateResponse, compareResponse] = await Promise.all([
                fetch('/api/calculate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ insuranceType, data })
                }),
                fetch('/api/compare', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ insuranceType, data })
                })
            ]);

            // Check if responses are OK before parsing JSON
            if (!calculateResponse.ok) {
                const errorText = await calculateResponse.text();
                let errorMessage = 'Грешка при изчисление';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                resultDiv.textContent = errorMessage;
                resultDiv.className = 'result show error';
                return;
            }

            if (!compareResponse.ok) {
                const errorText = await compareResponse.text();
                let errorMessage = 'Грешка при сравнение';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                resultDiv.textContent = errorMessage;
                resultDiv.className = 'result show error';
                return;
            }

            const calculateResult = await calculateResponse.json();
            const compareResult = await compareResponse.json();

            // Show comparison table
            if (compareResult.results && compareResult.results.length > 0) {
                resultDiv.innerHTML = `
                    <div class="comparison-container">
                        <h3>Сравнение между компаниите</h3>
                        <table class="comparison-table">
                            <thead>
                                <tr>
                                    <th>Застраховател</th>
                                    <th>Премия (${compareResult.currency})</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${compareResult.results.map((item, index) => `
                                    <tr class="${index === 0 ? 'best-price' : ''}">
                                        <td>${item.insurerName}</td>
                                        <td class="premium-cell">${item.premium.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                resultDiv.className = 'result show success';
            } else {
                resultDiv.textContent = `Очаквана премия: ${calculateResult.premium.toFixed(2)} ${calculateResult.currency}`;
                resultDiv.className = 'result show success';
            }
        } else {
            // For GAP, use original calculation only
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ insuranceType, data })
            });

            const result = await response.json();

            if (response.ok) {
                resultDiv.textContent = `Очаквана премия: ${result.premium.toFixed(2)} ${result.currency}`;
                resultDiv.className = 'result show success';
            } else {
                resultDiv.textContent = `Грешка: ${result.error}`;
                resultDiv.className = 'result show error';
            }
        }
    } catch (error) {
        resultDiv.textContent = `Грешка при свързване: ${error.message}`;
        resultDiv.className = 'result show error';
    }
}

async function calculateAllOffers() {
    // Get common data
    const commonDataForm = document.getElementById('common-data-form');
    const commonFormData = new FormData(commonDataForm);
    const commonData = {};
    commonFormData.forEach((value, key) => {
        if (value) commonData[key] = value;
    });
    
    // Check owner type
    const personBtn = document.querySelector('.owner-type-btn[data-type="person"]');
    const isPerson = personBtn && personBtn.classList.contains('active');
    commonData.ownerType = isPerson ? 'person' : 'company';
    
    // Handle EGN/Birthdate - only if person
    if (isPerson) {
        const egnInput = document.getElementById('egn-input');
        const birthdateInput = document.getElementById('birthdate-input');
        const egnBtn = document.querySelector('.input-type-btn[data-type="egn"]');
        
        if (egnBtn && egnBtn.classList.contains('active')) {
            if (egnInput && egnInput.value) {
                commonData.egnBirthdate = egnInput.value;
                commonData.egn = egnInput.value;
            }
        } else {
            if (birthdateInput && birthdateInput.value) {
                commonData.egnBirthdate = birthdateInput.value;
                commonData.birthdate = birthdateInput.value;
            }
        }
    } else {
        // Company - clear EGN/Birthdate data
        delete commonData.egnBirthdate;
        delete commonData.egn;
        delete commonData.birthdate;
    }
    
    // Handle brand and model
    if (commonData.vehicleBrand === 'other') {
        commonData.vehicleBrand = commonData.otherBrandName || 'Друга марка';
    }
    
    const modelManualInput = document.getElementById('vehicle-model-manual');
    const modelOtherInput = document.getElementById('vehicle-model-other');
    const modelSelect = document.getElementById('vehicle-model');
    
    if (modelManualInput && modelManualInput.style.display !== 'none') {
        commonData.vehicleModel = modelManualInput.value;
    } else if (modelOtherInput && modelOtherInput.style.display !== 'none') {
        commonData.vehicleModel = modelOtherInput.value;
    } else if (modelSelect) {
        commonData.vehicleModel = modelSelect.value;
    }
    
    // Convert dates
    if (commonData.firstRegistrationDate) {
        const parsedDate = parseDate(commonData.firstRegistrationDate);
        if (parsedDate) {
            commonData.firstRegistrationDate = parsedDate.toISOString().split('T')[0];
        }
    }
    if (commonData.birthdate) {
        const parsedDate = parseDate(commonData.birthdate);
        if (parsedDate) {
            commonData.birthdate = parsedDate.toISOString().split('T')[0];
        }
    }
    
    // Get active insurance types
    const activeBtns = document.querySelectorAll('.insurance-btn.active');
    if (activeBtns.length === 0) {
        alert('Моля, изберете поне един тип застраховка');
        return;
    }
    
    const insuranceTypes = Array.from(activeBtns).map(btn => btn.dataset.type);
    
    // Get insurance-specific data (skip CASCO - will be set on offers page)
    const insuranceDataByType = {};
    insuranceTypes.forEach(type => {
        if (type === 'casco') {
            // CASCO data will be empty initially - set on offers page
            insuranceDataByType[type] = {};
        } else {
            const fields = document.getElementById(type + '-fields');
            if (fields && fields.style.display !== 'none') {
                const inputs = fields.querySelectorAll('input, select');
                const data = {};
                inputs.forEach(input => {
                    if (input.value && input.name) {
                        data[input.name] = input.value;
                    }
                });
                insuranceDataByType[type] = data;
            }
        }
    });
    
    // Calculate offers for all insurers and types
    try {
        // For each insurance type, get comparison (skip CASCO)
        const comparisonPromises = insuranceTypes
            .filter(type => type !== 'casco')
            .map(async (type) => {
                const insuranceData = insuranceDataByType[type] || {};
                const data = { ...commonData, ...insuranceData };
                
                // Handle type-specific conversions
                if (type === 'mtpl') {
                    const powerKW = parseFloat(insuranceData.powerKW) || 0;
                    const powerHP = parseFloat(insuranceData.powerHP) || 0;
                    if (powerKW > 0) {
                        data.powerKW = powerKW;
                    } else if (powerHP > 0) {
                        data.powerKW = powerHP * 1.36;
                    }
                }
                
                if (type === 'gap' && !insuranceData.registrationDate && commonData.firstRegistrationDate) {
                    data.registrationDate = commonData.firstRegistrationDate;
                }
                
                const response = await fetch('/api/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ insuranceType: type, data })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    return { type, results: result.results || [] };
                }
                return { type, results: [] };
            });
        
        const comparisons = await Promise.all(comparisonPromises);
        
        // For CASCO, get list of insurers with tariffs (no premium calculation yet)
        let cascoInsurers = [];
        if (insuranceTypes.includes('casco')) {
            try {
                const cascoResponse = await fetch('/api/casco-insurers', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (cascoResponse.ok) {
                    const cascoResult = await cascoResponse.json();
                    cascoInsurers = cascoResult.insurers || [];
                }
            } catch (error) {
                console.error('Error fetching CASCO insurers:', error);
            }
        }
        
        // Group by insurer
        const insurerMap = {};
        
        // Add CASCO insurers (without premiums)
        cascoInsurers.forEach(insurerInfo => {
            insurerMap[insurerInfo.insurer] = {
                insurer: insurerInfo.insurer,
                insurerName: insurerInfo.insurerName,
                insuranceTypes: {
                    casco: {
                        premium: null,
                        insuranceData: {},
                        tariffDiscounts: insurerInfo.discounts || [],
                        tariffSurcharges: insurerInfo.surcharges || []
                    }
                }
            };
        });
        
        // Add other insurance types
        comparisons.forEach(comparison => {
            comparison.results.forEach(result => {
                if (!insurerMap[result.insurer]) {
                    insurerMap[result.insurer] = {
                        insurer: result.insurer,
                        insurerName: result.insurerName,
                        insuranceTypes: {}
                    };
                }
                const insuranceTypeData = {
                    premium: result.premium,
                    insuranceData: insuranceDataByType[comparison.type] || {}
                };
                
                // For MTPL, also store basePremium, tax, gf, of if available
                if (comparison.type === 'mtpl' && result.basePremium !== undefined) {
                    insuranceTypeData.basePremium = result.basePremium;
                    insuranceTypeData.tax = result.tax;
                    insuranceTypeData.gf = result.gf;
                    insuranceTypeData.of = result.of;
                }
                
                insurerMap[result.insurer].insuranceTypes[comparison.type] = insuranceTypeData;
            });
        });
        
        const offers = Object.values(insurerMap);
        
        // Store data and navigate
        const offersData = {
            commonData,
            insuranceTypes,
            offers
        };
        
        sessionStorage.setItem('offersData', JSON.stringify(offersData));
        // Save form data before navigating
        saveCalculatorFormData();
        window.location.href = '/offer';
    } catch (error) {
        console.error('Error calculating offers:', error);
        alert('Грешка при изчисляване на оферти: ' + error.message);
    }
}

// Save calculator form data to sessionStorage
function saveCalculatorFormData() {
    const formData = {
        commonData: {},
        insuranceData: {},
        activeInsuranceTypes: [],
        egnActive: false
    };
    
    // Save common data form
    const commonDataForm = document.getElementById('common-data-form');
    if (commonDataForm) {
        const formDataObj = new FormData(commonDataForm);
        formDataObj.forEach((value, key) => {
            if (value) formData.commonData[key] = value;
        });
    }
    
    // Save active insurance type buttons
    const insuranceBtns = document.querySelectorAll('.insurance-btn');
    insuranceBtns.forEach(btn => {
        if (btn.classList.contains('active')) {
            formData.activeInsuranceTypes.push(btn.dataset.type);
        }
    });
    
    // Save insurance-specific data
    const insuranceFields = document.querySelectorAll('.insurance-fields');
    insuranceFields.forEach(field => {
        const type = field.id.replace('-fields', '');
        if (field.style.display !== 'none') {
            const inputs = field.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.value && input.name) {
                    if (!formData.insuranceData[type]) {
                        formData.insuranceData[type] = {};
                    }
                    formData.insuranceData[type][input.name] = input.value;
                }
            });
        }
    });
    
    // Save owner type
    const personBtn = document.querySelector('.owner-type-btn[data-type="person"]');
    formData.ownerTypeActive = personBtn && personBtn.classList.contains('active');
    
    // Save EGN/Birthdate active state
    const egnBtn = document.querySelector('.input-type-btn[data-type="egn"]');
    formData.egnActive = egnBtn && egnBtn.classList.contains('active');
    
    // Save vehicle brand/model state
    const brandSelect = document.getElementById('vehicle-brand');
    if (brandSelect) {
        formData.vehicleBrandValue = brandSelect.value;
    }
    
    // Save vehicle model (can be from different inputs)
    const modelSelect = document.getElementById('vehicle-model');
    const modelManualInput = document.getElementById('vehicle-model-manual');
    const modelOtherInput = document.getElementById('vehicle-model-other');
    
    if (modelManualInput && modelManualInput.style.display !== 'none' && modelManualInput.value) {
        formData.vehicleModelValue = modelManualInput.value;
        formData.vehicleModelType = 'manual';
    } else if (modelOtherInput && modelOtherInput.style.display !== 'none' && modelOtherInput.value) {
        formData.vehicleModelValue = modelOtherInput.value;
        formData.vehicleModelType = 'other';
    } else if (modelSelect && modelSelect.style.display !== 'none' && modelSelect.value) {
        formData.vehicleModelValue = modelSelect.value;
        formData.vehicleModelType = 'select';
    }
    
    // Save address municipality
    const municipalitySelect = document.getElementById('address-municipality');
    if (municipalitySelect && municipalitySelect.value) {
        formData.addressMunicipalityValue = municipalitySelect.value;
    }
    
    // Save address region (needed to restore municipality)
    const regionSelect = document.getElementById('address-region');
    if (regionSelect && regionSelect.value) {
        formData.addressRegionValue = regionSelect.value;
    }
    
    sessionStorage.setItem('calculatorFormData', JSON.stringify(formData));
}

// Load calculator form data from sessionStorage
function loadCalculatorFormData() {
    const savedData = sessionStorage.getItem('calculatorFormData');
    if (!savedData) return;
    
    try {
        const formData = JSON.parse(savedData);
        
        // Restore common data
        if (formData.commonData) {
            Object.entries(formData.commonData).forEach(([key, value]) => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                    // Trigger change event for dependent fields (like brand/model)
                    if (input.id === 'vehicle-brand' || input.name === 'vehicleBrand') {
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        }
        
        // Restore vehicle brand first (before model)
        if (formData.vehicleBrandValue) {
            const brandSelect = document.getElementById('vehicle-brand');
            if (brandSelect) {
                brandSelect.value = formData.vehicleBrandValue;
                brandSelect.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Restore model after brand change event has processed
                if (formData.vehicleModelValue && formData.vehicleModelType) {
                    setTimeout(() => {
                        const modelSelect = document.getElementById('vehicle-model');
                        const modelManualInput = document.getElementById('vehicle-model-manual');
                        const modelOtherInput = document.getElementById('vehicle-model-other');
                        
                        if (formData.vehicleModelType === 'manual' && modelManualInput) {
                            modelManualInput.value = formData.vehicleModelValue;
                        } else if (formData.vehicleModelType === 'other' && modelOtherInput) {
                            modelOtherInput.value = formData.vehicleModelValue;
                        } else if (formData.vehicleModelType === 'select' && modelSelect) {
                            modelSelect.value = formData.vehicleModelValue;
                            if (formData.vehicleModelValue === 'other') {
                                modelSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }
                    }, 150);
                }
            }
        }
        
        // Restore address region first (before municipality)
        if (formData.addressRegionValue) {
            const regionSelect = document.getElementById('address-region');
            if (regionSelect) {
                regionSelect.value = formData.addressRegionValue;
                regionSelect.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Restore municipality after region change event has processed
                if (formData.addressMunicipalityValue) {
                    setTimeout(() => {
                        const municipalitySelect = document.getElementById('address-municipality');
                        if (municipalitySelect && !municipalitySelect.disabled) {
                            municipalitySelect.value = formData.addressMunicipalityValue;
                        }
                    }, 200);
                }
            }
        }
        
        // Restore active insurance types
        if (formData.activeInsuranceTypes && formData.activeInsuranceTypes.length > 0) {
            // Wait a bit for DOM to be ready
            setTimeout(() => {
                formData.activeInsuranceTypes.forEach(type => {
                    const btn = document.querySelector(`.insurance-btn[data-type="${type}"]`);
                    if (btn && !btn.classList.contains('active')) {
                        btn.click();
                    }
                });
                
                // Restore insurance-specific data after types are activated
                if (formData.insuranceData) {
                    setTimeout(() => {
                        Object.entries(formData.insuranceData).forEach(([type, data]) => {
                            Object.entries(data).forEach(([name, value]) => {
                                const input = document.querySelector(`#${type}-fields [name="${name}"]`);
                                if (input) {
                                    input.value = value;
                                }
                            });
                        });
                    }, 100);
                }
            }, 50);
        }
        
        // Restore owner type
        if (formData.ownerTypeActive !== undefined) {
            setTimeout(() => {
                const personBtn = document.querySelector('.owner-type-btn[data-type="person"]');
                const companyBtn = document.querySelector('.owner-type-btn[data-type="company"]');
                if (formData.ownerTypeActive && personBtn && !personBtn.classList.contains('active')) {
                    personBtn.click();
                } else if (!formData.ownerTypeActive && companyBtn && !companyBtn.classList.contains('active')) {
                    companyBtn.click();
                }
            }, 50);
        }
        
        // Restore EGN/Birthdate active state
        if (formData.egnActive !== undefined) {
            setTimeout(() => {
                const egnBtn = document.querySelector('.input-type-btn[data-type="egn"]');
                const birthdateBtn = document.querySelector('.input-type-btn[data-type="birthdate"]');
                if (egnBtn && formData.egnActive && !egnBtn.classList.contains('active')) {
                    egnBtn.click();
                } else if (birthdateBtn && !formData.egnActive && !birthdateBtn.classList.contains('active')) {
                    birthdateBtn.click();
                }
            }, 100);
        }
    } catch (error) {
        console.error('Error loading form data:', error);
    }
}

// Clear calculator form data
function clearCalculatorFormData() {
    sessionStorage.removeItem('calculatorFormData');
    
    // Clear all form fields
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    // Reset insurance type buttons
    const insuranceBtns = document.querySelectorAll('.insurance-btn');
    insuranceBtns.forEach(btn => btn.classList.remove('active'));
    
    // Hide insurance fields
    const insuranceFields = document.querySelectorAll('.insurance-fields');
    insuranceFields.forEach(field => field.style.display = 'none');
    
    // Reset owner type buttons
    const personBtn = document.querySelector('.owner-type-btn[data-type="person"]');
    const companyBtn = document.querySelector('.owner-type-btn[data-type="company"]');
    if (personBtn) personBtn.classList.add('active');
    if (companyBtn) companyBtn.classList.remove('active');
    // Trigger update to show/hide EGN fields
    if (personBtn) personBtn.click();
    
    // Reset EGN/Birthdate buttons
    const egnBtn = document.querySelector('.input-type-btn[data-type="egn"]');
    if (egnBtn) egnBtn.classList.add('active');
    const birthdateBtn = document.querySelector('.input-type-btn[data-type="birthdate"]');
    if (birthdateBtn) birthdateBtn.classList.remove('active');
    
    // Hide calculate button
    const calculateBtn = document.getElementById('calculate-premium-btn');
    if (calculateBtn) calculateBtn.style.display = 'none';
}

// Initialize clear form button
function initializeClearFormButton() {
    const clearBtn = document.getElementById('clear-form-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Сигурни ли сте, че искате да изчистите всички данни?')) {
                clearCalculatorFormData();
            }
        });
    }
}

