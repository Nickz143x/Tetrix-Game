// User management for guest accounts and player count tracking

(function() {
    const MAX_GUESTS = 100;
    const PLAYER_COUNT_KEY = 'tetrixPlayerCount';
    const CURRENT_USER_KEY = 'tetrixCurrentUser';

    function getRandomGuestNumber(existingNumbers) {
        let attempts = 0;
        while (attempts < 200) { // avoid infinite loop
            const num = Math.floor(Math.random() * MAX_GUESTS) + 1;
            if (!existingNumbers.has(num)) {
                return num;
            }
            attempts++;
        }
        // fallback if all numbers taken
        return Math.floor(Math.random() * MAX_GUESTS) + 1;
    }

    function loadCurrentUser() {
        const userStr = localStorage.getItem(CURRENT_USER_KEY);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }

    function saveCurrentUser(user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }

    function incrementPlayerCount() {
        let count = parseInt(localStorage.getItem(PLAYER_COUNT_KEY) || '0', 10);
        count++;
        localStorage.setItem(PLAYER_COUNT_KEY, count.toString());
        return count;
    }

    function addLoggedInUser(username) {
        const key = 'tetrixLoggedInUsers';
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            users = [];
        }
        if (!users.includes(username)) {
            users.push(username);
            localStorage.setItem(key, JSON.stringify(users));
        }
    }

    function assignGuestUser() {
        // Get all current guest numbers from localStorage users if any
        // For simplicity, we only track current user here
        const currentUser = loadCurrentUser();
        if (currentUser && currentUser.username && !currentUser.guest) {
            // Logged in user, add to logged in users list
            addLoggedInUser(currentUser.username);
            return currentUser;
        }
        if (currentUser && currentUser.guest && currentUser.username) {
            // Guest user already assigned
            addLoggedInUser(currentUser.username);
            return currentUser;
        }

        // Assign new guest username with random number 1-100
        // We do not track all guest numbers globally, so just assign random number
        const guestNumber = getRandomGuestNumber(new Set());
        const guestUsername = `Guest${guestNumber}`;

        // Change guest username format to guest_XX
        const guestUsernameFormatted = `guest_${guestNumber}`;

        const newUser = {
            guest: true,
            username: guestUsernameFormatted,
            assignedAt: Date.now()
        };
        saveCurrentUser(newUser);

        // Increment player count on new guest assignment
        incrementPlayerCount();

        // Add new guest user to logged in users list
        addLoggedInUser(guestUsernameFormatted);

        return newUser;
    }

    // On load, assign guest user if needed
    const currentUser = assignGuestUser();

    // Expose current user info globally
    window.tetrixCurrentUser = currentUser;

})();
