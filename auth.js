// Authentication System
class AuthSystem {
    constructor() {
        this.storageKey = 'go2u_users';
        this.sessionKey = 'go2u_session';
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            const defaultUsers = [
                {
                    id: 1,
                    username: 'demo',
                    email: 'demo@go2u.com',
                    password: 'demo123',
                    fullName: 'Demo User',
                    phone: '555-0000',
                    accountType: 'client',
                    joinDate: new Date().toISOString()
                },
                {
                    id: 2,
                    username: 'seller',
                    email: 'seller@go2u.com',
                    password: 'seller123',
                    fullName: 'Demo Seller',
                    phone: '555-0001',
                    accountType: 'seller',
                    joinDate: new Date().toISOString()
                }
            ];
            localStorage.setItem(this.storageKey, JSON.stringify(defaultUsers));
        }
    }

    register(username, email, password, fullName, phone, accountType = 'client') {
        const users = this.getAllUsers();
        
        if (users.some(u => u.username === username || u.email === email)) {
            return { success: false, message: 'Потребител или имейл вече съществуват' };
        }

        const newUser = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            username,
            email,
            password,
            fullName,
            phone,
            accountType,
            joinDate: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.storageKey, JSON.stringify(users));
        
        return { success: true, message: 'Регистрация успешна' };
    }

    login(username, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            const session = {
                userId: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                accountType: user.accountType,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            return { success: true, message: 'Вход успешен', user };
        }

        return { success: false, message: 'Неправилно потребителско име или парола' };
    }

    logout() {
        localStorage.removeItem(this.sessionKey);
        return { success: true, message: 'Излизане успешно' };
    }

    getCurrentUser() {
        const session = localStorage.getItem(this.sessionKey);
        return session ? JSON.parse(session) : null;
    }

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    getAllUsers() {
        const users = localStorage.getItem(this.storageKey);
        return users ? JSON.parse(users) : [];
    }

    updateProfile(userId, updatedData) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updatedData };
            localStorage.setItem(this.storageKey, JSON.stringify(users));
            
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.userId === userId) {
                const updatedSession = { ...currentUser, ...updatedData };
                localStorage.setItem(this.sessionKey, JSON.stringify(updatedSession));
            }
            
            return { success: true, message: 'Профил актуализиран' };
        }

        return { success: false, message: 'Потребител не намерен' };
    }

    getUserProfile(userId) {
        const users = this.getAllUsers();
        return users.find(u => u.id === userId) || null;
    }
}

const auth = new AuthSystem();

function updateNavigation() {
    const user = auth.getCurrentUser();
    const nav = document.querySelector('nav');
    
    if (!nav) return;

    // Remove existing user menu
    const existingMenu = document.querySelector('.user-menu');
    if (existingMenu) existingMenu.remove();

    if (user) {
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <span class="user-name">👤 ${user.fullName}</span>
            <button class="logout-btn">Изход</button>
        `;
        
        nav.appendChild(userMenu);
        
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                auth.logout();
                alert('Успешно излязохте');
                window.location.href = 'index.html';
            });
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavigation);
} else {
    updateNavigation();
}
