(function() {
    'use strict';

    // DOM Elements
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthYear = document.getElementById('current-month-year');
    const currentLunarMonth = document.getElementById('current-lunar-month');
    const solarDateDisplay = document.getElementById('solar-date-display');
    const lunarDateDisplay = document.getElementById('lunar-date-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const todayBtn = document.getElementById('today-btn');
    const holidayList = document.getElementById('holiday-list');
    const countdownTitle = document.getElementById('countdown-title');
    const countdownDate = document.getElementById('countdown-date');
    const daysCount = document.getElementById('days-count');
    const hoursCount = document.getElementById('hours-count');
    const minutesCount = document.getElementById('minutes-count');
    const secondsCount = document.getElementById('seconds-count');

    // State
    let currentDate = new Date();
    let displayMonth = currentDate.getMonth();
    let displayYear = currentDate.getFullYear();
    let countdownInterval;

    // Vietnamese Holidays (Solar Calendar)
    const solarHolidays = {
        '01-01': { name: 'Tết Dương Lịch', icon: '🎊' },
        '02-14': { name: 'Valentine', icon: '💝' },
        '03-08': { name: 'Quốc tế Phụ nữ', icon: '👩' },
        '04-30': { name: 'Giải phóng miền Nam', icon: '🇻🇳' },
        '05-01': { name: 'Quốc tế Lao động', icon: '⚒️' },
        '06-01': { name: 'Quốc tế Thiếu nhi', icon: '👶' },
        '09-02': { name: 'Quốc khánh', icon: '🇻🇳' },
        '10-20': { name: 'Ngày Phụ nữ VN', icon: '👩' },
        '11-20': { name: 'Ngày Nhà giáo VN', icon: '👨‍🏫' },
        '12-24': { name: 'Giáng sinh', icon: '🎄' },
        '12-25': { name: 'Giáng sinh', icon: '🎅' }
    };

    // Lunar Holidays
    const lunarHolidays = {
        '01-01': { name: 'Tết Nguyên Đán', icon: '🎊' },
        '01-15': { name: 'Tết Nguyên Tiêu', icon: '🏮' },
        '03-10': { name: 'Giỗ Tổ Hùng Vương', icon: '🙏' },
        '04-15': { name: 'Phật Đản', icon: '🙏' },
        '05-05': { name: 'Tết Đoan Ngọ', icon: '🎋' },
        '07-15': { name: 'Vu Lan', icon: '🙏' },
        '08-15': { name: 'Tết Trung Thu', icon: '🥮' },
        '12-23': { name: 'Ông Táo chầu trời', icon: '🏠' }
    };

    // Month names
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    /**
     * Initialize
     */
    function init() {
        setupEventListeners();
        renderCalendar();
        updateCurrentDateInfo();
        renderUpcomingHolidays();
        startCountdown();
        
        // Setup hamburger menu
        const hamburgerMenu = document.getElementById('hamburger-menu');
        const closeNavBtn = document.getElementById('close-menu');
        const navOverlay = document.getElementById('nav-overlay');
        
        hamburgerMenu.addEventListener('click', toggleNavMenu);
        closeNavBtn.addEventListener('click', toggleNavMenu);
        navOverlay.addEventListener('click', toggleNavMenu);
    }

    /**
     * Toggle navigation menu
     */
    function toggleNavMenu() {
        const navMenu = document.getElementById('nav-menu');
        const navOverlay = document.getElementById('nav-overlay');
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        prevMonthBtn.addEventListener('click', () => {
            displayMonth--;
            if (displayMonth < 0) {
                displayMonth = 11;
                displayYear--;
            }
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            displayMonth++;
            if (displayMonth > 11) {
                displayMonth = 0;
                displayYear++;
            }
            renderCalendar();
        });

        todayBtn.addEventListener('click', () => {
            currentDate = new Date();
            displayMonth = currentDate.getMonth();
            displayYear = currentDate.getFullYear();
            renderCalendar();
            updateCurrentDateInfo();
        });
    }

    /**
     * Render calendar
     */
    function renderCalendar() {
        // Update header
        currentMonthYear.textContent = `${monthNames[displayMonth]} ${displayYear}`;
        
        // Get lunar month info for the 15th of current month
        const lunar = LunarCalendar.convertSolar2Lunar(15, displayMonth + 1, displayYear);
        const canChi = LunarCalendar.getYearCanChi(lunar.year);
        const zodiac = LunarCalendar.getYearZodiac(lunar.year);
        currentLunarMonth.textContent = `Tháng ${lunar.month} năm ${canChi} (${zodiac})`;

        // Clear calendar
        calendarDays.innerHTML = '';

        // Get first day of month
        const firstDay = new Date(displayYear, displayMonth, 1);
        const lastDay = new Date(displayYear, displayMonth + 1, 0);
        const prevLastDay = new Date(displayYear, displayMonth, 0);
        
        // Adjust for Monday start (0=Sunday, 1=Monday, etc.)
        // Convert Sunday (0) to 7, then subtract 1 to get Monday-based index
        let firstDayIndex = firstDay.getDay();
        firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        
        const lastDayDate = lastDay.getDate();
        const prevLastDayDate = prevLastDay.getDate();
        
        let lastDayIndex = lastDay.getDay();
        lastDayIndex = lastDayIndex === 0 ? 6 : lastDayIndex - 1;
        const nextDays = 6 - lastDayIndex;

        // Previous month days
        for (let x = firstDayIndex; x > 0; x--) {
            const day = prevLastDayDate - x + 1;
            const month = displayMonth === 0 ? 12 : displayMonth;
            const year = displayMonth === 0 ? displayYear - 1 : displayYear;
            calendarDays.appendChild(createDayElement(day, month, year, true));
        }

        // Current month days
        for (let i = 1; i <= lastDayDate; i++) {
            calendarDays.appendChild(createDayElement(i, displayMonth + 1, displayYear, false));
        }

        // Next month days
        for (let j = 1; j <= nextDays; j++) {
            const month = displayMonth === 11 ? 1 : displayMonth + 2;
            const year = displayMonth === 11 ? displayYear + 1 : displayYear;
            calendarDays.appendChild(createDayElement(j, month, year, true));
        }
    }

    /**
     * Create day element
     */
    function createDayElement(day, month, year, isOtherMonth) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayEl.classList.add('other-month');
        }

        // Check if today
        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()) {
            dayEl.classList.add('today');
        }

        // Check if weekend
        const date = new Date(year, month - 1, day);
        if (date.getDay() === 0 || date.getDay() === 6) {
            dayEl.classList.add('weekend');
        }

        // Get lunar date
        const lunar = LunarCalendar.convertSolar2Lunar(day, month, year);
        let lunarDayStr;
        if (lunar.day === 1) {
            lunarDayStr = `${lunar.day}/${lunar.month}`;
        } else if (lunar.day === 15) {
            lunarDayStr = `${lunar.day}/${lunar.month}`;
        } else {
            lunarDayStr = `${lunar.day}`;
        }

        // Check for holidays
        const solarKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const lunarKey = `${String(lunar.month).padStart(2, '0')}-${String(lunar.day).padStart(2, '0')}`;
        
        let holidayInfo = null;
        let holidayType = '';
        
        if (solarHolidays[solarKey]) {
            holidayInfo = solarHolidays[solarKey];
            holidayType = 'solar';
            if (!isOtherMonth) {
                dayEl.classList.add('holiday');
            }
        } else if (lunarHolidays[lunarKey]) {
            holidayInfo = lunarHolidays[lunarKey];
            holidayType = 'lunar';
            if (!isOtherMonth) {
                dayEl.classList.add('lunar-special');
            }
        }

        // Check for special lunar days
        if (lunar.day === 1 || lunar.day === 15) {
            if (!isOtherMonth && !holidayInfo) {
                dayEl.classList.add('lunar-special');
            }
        }

        // Build content
        let content = `
            <div class="solar-day">${day}</div>
            <div class="lunar-day">${lunarDayStr}</div>
        `;

        if (holidayInfo) {
            content += `<div class="holiday-indicator">${holidayInfo.icon}</div>`;
            content += `<div class="holiday-name">${holidayInfo.name}</div>`;
        }

        dayEl.innerHTML = content;

        // Click handler
        dayEl.addEventListener('click', () => {
            showDayDetails(day, month, year, lunar, holidayInfo);
        });

        return dayEl;
    }

    /**
     * Show day details
     */
    function showDayDetails(day, month, year, lunar, holidayInfo) {
        const canChi = LunarCalendar.getYearCanChi(lunar.year);
        const zodiac = LunarCalendar.getYearZodiac(lunar.year);
        
        let message = `📅 Solar: ${day}/${month}/${year}\n`;
        message += `🌙 Lunar: ${lunar.day}/${lunar.month}/${lunar.year}${lunar.leap ? ' (nhuận)' : ''}\n`;
        message += `🐉 Year: ${canChi} (${zodiac})\n`;
        
        if (holidayInfo) {
            message += `\n🎉 ${holidayInfo.name}`;
        }
        
        alert(message);
    }

    /**
     * Update current date info
     */
    function updateCurrentDateInfo() {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        
        // Solar date
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
        solarDateDisplay.textContent = `${dayOfWeek}, ${monthNames[month - 1]} ${day}, ${year}`;
        
        // Lunar date
        const lunar = LunarCalendar.convertSolar2Lunar(day, month, year);
        const canChi = LunarCalendar.getYearCanChi(lunar.year);
        const zodiac = LunarCalendar.getYearZodiac(lunar.year);
        lunarDateDisplay.textContent = `${lunar.day}/${lunar.month}/${lunar.year} - ${canChi} (${zodiac})`;
    }

    /**
     * Render upcoming holidays
     */
    function renderUpcomingHolidays() {
        const today = new Date();
        const holidays = [];

        // Get solar holidays
        for (const [key, value] of Object.entries(solarHolidays)) {
            const [month, day] = key.split('-').map(Number);
            const date = new Date(today.getFullYear(), month - 1, day);
            if (date < today) {
                date.setFullYear(today.getFullYear() + 1);
            }
            holidays.push({
                date: date,
                name: value.name,
                icon: value.icon,
                type: 'solar',
                dateStr: `${day}/${month}/${date.getFullYear()}`
            });
        }

        // Sort by date
        holidays.sort((a, b) => a.date - b.date);

        // Display first 6 holidays
        holidayList.innerHTML = '';
        holidays.slice(0, 6).forEach(holiday => {
            const item = document.createElement('div');
            item.className = `holiday-item ${holiday.type}`;
            item.innerHTML = `
                <div class="holiday-date">${holiday.icon} ${holiday.dateStr}</div>
                <div class="holiday-title">${holiday.name}</div>
                <div class="holiday-type">${holiday.type} calendar</div>
            `;
            holidayList.appendChild(item);
        });
    }

    /**
     * Start countdown to Tet
     */
    function startCountdown() {
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    /**
     * Update countdown
     */
    function updateCountdown() {
        const today = new Date();
        const currentYear = today.getFullYear();
        
        // Get Tet date for current year
        let tetDate = getTetDate(currentYear);
        
        // If Tet has passed, get next year's Tet
        if (tetDate < today) {
            tetDate = getTetDate(currentYear + 1);
        }

        const diff = tetDate - today;
        
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            daysCount.textContent = days;
            hoursCount.textContent = String(hours).padStart(2, '0');
            minutesCount.textContent = String(minutes).padStart(2, '0');
            secondsCount.textContent = String(seconds).padStart(2, '0');

            const lunar = LunarCalendar.convertSolar2Lunar(tetDate.getDate(), tetDate.getMonth() + 1, tetDate.getFullYear());
            const zodiac = LunarCalendar.getYearZodiac(lunar.year);
            countdownTitle.textContent = `Countdown to Tết ${lunar.year} (${zodiac})`;
            countdownDate.textContent = `${tetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        }
    }

    /**
     * Get Tet date for a given year
     */
    function getTetDate(year) {
        // Lunar New Year is 1/1 lunar calendar
        // We need to find the solar date for lunar 1/1
        for (let month = 1; month <= 3; month++) {
            for (let day = 1; day <= 31; day++) {
                try {
                    const lunar = LunarCalendar.convertSolar2Lunar(day, month, year);
                    if (lunar.month === 1 && lunar.day === 1) {
                        return new Date(year, month - 1, day);
                    }
                } catch (e) {
                    continue;
                }
            }
        }
        return new Date(year, 1, 1); // Fallback
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

