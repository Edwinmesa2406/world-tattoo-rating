// Funciones globales disponibles antes del DOMContentLoaded
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-3"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-300">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    const errorMessage = document.getElementById('errorMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const recoveryModal = document.getElementById('recoveryModal');
    const recoveryForm = document.getElementById('recoveryForm');
    const cancelRecovery = document.getElementById('cancelRecovery');
    
    // Admin management elements
    const adminModal = document.getElementById('adminModal');
    const adminForm = document.getElementById('adminForm');
    const addAdminBtn = document.getElementById('addAdminBtn');
    const cancelAdminBtn = document.getElementById('cancelAdmin');
    let currentAdminId = null;
    
    // Admin credentials
    const correctPassword = 'admin123';
    const adminPhone = '+57 300 123 4567';

    // Security variables
    let sessionTimeout;
    let heartbeatInterval;
    let isOnline = navigator.onLine;
    
    // Initialize security monitoring
    initSecurityMonitoring();

    // Check if user is already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
    }

    // Login form handler
    const submitBtn = document.getElementById('submitBtn');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;

        if (password === correctPassword) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('lastAccess', new Date().toLocaleString());
            sessionStorage.setItem('loginTime', Date.now());
            showAdminPanel();
            errorMessage.classList.add('hidden');
            showToast('¡Bienvenido al panel de administrador!', 'success');
            startSecurityMonitoring();
        } else {
            errorMessage.classList.remove('hidden');
            document.getElementById('password').value = '';
            showToast('Contraseña incorrecta', 'error');
        }
    });

    // Logout handler
    logoutBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            performLogout('manual');
        }
    });

    // Forgot password handler
    forgotPasswordBtn.addEventListener('click', function() {
        recoveryModal.classList.remove('hidden');
        recoveryModal.classList.add('flex');
    });

    // Cancel recovery handler
    cancelRecovery.addEventListener('click', function() {
        recoveryModal.classList.add('hidden');
        recoveryModal.classList.remove('flex');
        recoveryForm.reset();
    });

    // Recovery form handler
    recoveryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const phoneNumber = document.getElementById('phoneNumber').value;

        if (phoneNumber === adminPhone) {
            showToast('Código de verificación enviado a tu celular', 'success');
            
            setTimeout(() => {
                const code = prompt('Ingresa el código de verificación enviado a tu celular:');
                if (code === '123456') {
                    showToast('Código verificado. Tu contraseña es: admin123', 'success');
                    recoveryModal.classList.add('hidden');
                    recoveryModal.classList.remove('flex');
                    recoveryForm.reset();
                } else if (code !== null) {
                    showToast('Código incorrecto', 'error');
                }
            }, 2000);
        } else {
            showToast('Número de teléfono no registrado', 'error');
        }
    });

    // Export handlers
    document.getElementById('exportTatuadores').addEventListener('click', function() {
        exportToExcel('tatuadores', 'Tatuadores_Registrados');
    });

    document.getElementById('exportJurados').addEventListener('click', function() {
        exportToExcel('jurados', 'Jurados_Registrados');
    });

    // Security monitoring functions
    function initSecurityMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', handleOnlineStatus);
        window.addEventListener('offline', handleOfflineStatus);
        
        // Monitor page visibility (tab switching, minimizing)
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Monitor beforeunload (closing tab/browser)
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Monitor navigation away from admin panel
        window.addEventListener('popstate', handleNavigation);
        
        // Monitor focus/blur events
        window.addEventListener('focus', handleWindowFocus);
        window.addEventListener('blur', handleWindowBlur);
        
        // Prevent back button when logged in
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            history.pushState(null, null, location.href);
        }
    }

    function startSecurityMonitoring() {
        // Start session timeout (30 minutes of inactivity)
        resetSessionTimeout();
        
        // Start heartbeat to check connection every 30 seconds
        startHeartbeat();
        
        // Monitor user activity
        monitorUserActivity();
        
        // Prevent navigation
        history.pushState(null, null, location.href);
    }

    function handleOnlineStatus() {
        isOnline = true;
        console.log('Connection restored');
        showToast('Conexión restaurada', 'success');
    }

    function handleOfflineStatus() {
        isOnline = false;
        console.log('Connection lost - logging out for security');
        showToast('Conexión perdida. Cerrando sesión por seguridad...', 'error');
        setTimeout(() => {
            performLogout('connection_lost');
        }, 3000);
    }

    function handleVisibilityChange() {
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            if (document.hidden) {
                console.log('Tab hidden - starting security timeout');
                clearTimeout(sessionTimeout);
                sessionTimeout = setTimeout(() => {
                    performLogout('tab_hidden');
                }, 300000); // 5 minutes when tab is hidden
            } else {
                console.log('Tab visible - resetting security timeout');
                resetSessionTimeout();
            }
        }
    }

    function handleBeforeUnload(e) {
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            performLogout('browser_close');
        }
    }

    function handleNavigation(e) {
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            history.pushState(null, null, location.href);
            
            if (location.pathname !== '/admin.html' && !location.pathname.endsWith('admin.html')) {
                performLogout('navigation_away');
            }
        }
    }

    function handleWindowFocus() {
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            resetSessionTimeout();
        }
    }

    function handleWindowBlur() {
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            clearTimeout(sessionTimeout);
            sessionTimeout = setTimeout(() => {
                performLogout('window_blur');
            }, 600000); // 10 minutes when window loses focus
        }
    }

    function startHeartbeat() {
        heartbeatInterval = setInterval(() => {
            if (sessionStorage.getItem('adminLoggedIn') === 'true') {
                if (!navigator.onLine) {
                    handleOfflineStatus();
                    return;
                }
                
                const loginTime = parseInt(sessionStorage.getItem('loginTime'));
                const maxSessionTime = 2 * 60 * 60 * 1000; // 2 hours max session
                
                if (Date.now() - loginTime > maxSessionTime) {
                    performLogout('session_expired');
                }
            } else {
                clearInterval(heartbeatInterval);
            }
        }, 30000);
    }

    function monitorUserActivity() {
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, resetSessionTimeout, true);
        });
    }

    function resetSessionTimeout() {
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            clearTimeout(sessionTimeout);
            sessionTimeout = setTimeout(() => {
                performLogout('inactivity');
            }, 20000); // 20 segundos de inactividad
        }
    }

    function performLogout(reason) {
        console.log(`Performing logout due to: ${reason}`);
        
        // Clear all session data
        sessionStorage.clear();
        localStorage.removeItem('adminSession');
        
        // Clear any cookies
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Clear timeouts and intervals
        clearTimeout(sessionTimeout);
        clearInterval(heartbeatInterval);
        
        // Show appropriate message based on reason
        const messages = {
            'manual': 'Sesión cerrada exitosamente',
            'connection_lost': 'Sesión cerrada por pérdida de conexión',
            'tab_hidden': 'Sesión cerrada por inactividad (pestaña oculta)',
            'browser_close': 'Sesión cerrada por cierre de navegador',
            'navigation_away': 'Sesión cerrada por navegación fuera del panel',
            'window_blur': 'Sesión cerrada por inactividad (ventana sin foco)',
            'inactivity': 'Sesión cerrada por inactividad prolongada',
            'session_expired': 'Sesión expirada por tiempo máximo alcanzado'
        };
        
        showLoginForm();
        showToast(messages[reason] || 'Sesión cerrada por seguridad', 'success');
        
        // Redirect to login after a short delay
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 2000);
    }

    function showAdminPanel() {
        loginSection.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        
        const lastAccess = sessionStorage.getItem('lastAccess') || 'Primera vez';
        document.getElementById('lastAccess').textContent = lastAccess;
        
        startSecurityMonitoring();
        loadData();
    }

    function showLoginForm() {
        loginSection.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        document.getElementById('password').value = '';
        errorMessage.classList.add('hidden');
        
        clearTimeout(sessionTimeout);
        clearInterval(heartbeatInterval);
    }

    async function loadData() {
        const tatuadores = JSON.parse(localStorage.getItem('tatuadores')) || [];
        const jurados = JSON.parse(localStorage.getItem('jurados')) || [];
        
        try {
            const response = await fetch('/api/messages');
            if (!response.ok) {
                throw new Error('Error al cargar los mensajes');
            }
            const mensajes = await response.json();

            document.getElementById('totalTatuadores').textContent = tatuadores.length;
            document.getElementById('totalJurados').textContent = jurados.length;
            document.getElementById('totalRegistros').textContent = tatuadores.length + jurados.length;

            populateTable('tatuadoresTableBody', tatuadores);
            populateTable('juradosTableBody', jurados);
            populateContactTable(mensajes);
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al cargar los mensajes', 'error');
        }
    }

    function populateContactTable(messages) {
        const tableBody = document.getElementById('contactTableBody');
        tableBody.innerHTML = '';

        if (messages.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                            <p class="text-lg font-medium">No hay mensajes disponibles</p>
                            <p class="text-sm">Los mensajes aparecerán aquí cuando los usuarios envíen consultas</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        messages.forEach((message, index) => {
            const row = document.createElement('tr');
            row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${message.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <a href="mailto:${message.email}" class="text-blue-600 hover:text-blue-800">
                        ${message.email}
                    </a>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="max-w-xs overflow-hidden text-ellipsis">
                        ${message.mensaje}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${formatDate(message.fecha)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex space-x-2">
                        <button onclick="markMessageAsRead(${message.id})" 
                                class="text-green-600 hover:text-green-900"
                                title="Marcar como leído"
                                ${message.leido ? 'disabled' : ''}>
                            <i class="fas ${message.leido ? 'fa-check-circle' : 'fa-check'}"></i>
                        </button>
                        <button onclick="deleteMessage(${message.id})"
                                class="text-red-600 hover:text-red-900"
                                title="Eliminar mensaje">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Initialize data in localStorage if not exists
    if (!localStorage.getItem('admins')) {
        localStorage.setItem('admins', JSON.stringify([{
            id: 1,
            nombre: 'Admin Principal',
            email: 'admin@worldtattoorating.com',
            nivel: 'admin',
            password: 'admin123'
        }]));
    }

    if (!localStorage.getItem('mensajesContacto')) {
        localStorage.setItem('mensajesContacto', JSON.stringify([]));
    }

    // Admin Modal Event Listeners
    addAdminBtn.addEventListener('click', () => {
        currentAdminId = null;
        adminForm.reset();
        adminModal.classList.remove('hidden');
        adminModal.classList.add('flex');
    });

    cancelAdminBtn.addEventListener('click', () => {
        adminModal.classList.add('hidden');
        adminModal.classList.remove('flex');
        adminForm.reset();
    });

    adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const adminData = {
            id: currentAdminId || Date.now(),
            nombre: document.getElementById('adminName').value,
            email: document.getElementById('adminEmail').value,
            password: document.getElementById('adminPassword').value,
            nivel: document.getElementById('adminAccess').value
        };

        const admins = JSON.parse(localStorage.getItem('admins')) || [];
        
        if (currentAdminId) {
            const index = admins.findIndex(admin => admin.id === currentAdminId);
            if (index !== -1) {
                admins[index] = adminData;
            }
        } else {
            admins.push(adminData);
        }

        localStorage.setItem('admins', JSON.stringify(admins));
        adminModal.classList.add('hidden');
        adminModal.classList.remove('flex');
        adminForm.reset();
        loadData();
        showToast('Administrador guardado exitosamente', 'success');
    });

    function populateTable(tableBodyId, data) {
        const tableBody = document.getElementById(tableBodyId);
        tableBody.innerHTML = '';

        if (data.length === 0) {
            const colSpan = tableBodyId === 'adminsTableBody' ? 4 : 8;
            tableBody.innerHTML = `
                <tr>
                    <td colspan="${colSpan}" class="px-6 py-8 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                            <p class="text-lg font-medium">No hay registros disponibles</p>
                            <p class="text-sm">Los registros aparecerán aquí cuando se completen los formularios</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach((item, index) => {
            const row = document.createElement('tr');
            row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

            if (tableBodyId === 'adminsTableBody') {
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-user-shield text-gray-600"></i>
                            </div>
                            <div class="text-sm font-medium text-gray-900">${item.nombre}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a href="mailto:${item.email}" class="text-blue-600 hover:text-blue-800">
                            ${item.email}
                        </a>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-medium ${
                            item.nivel === 'admin' ? 'bg-purple-100 text-purple-800' :
                            item.nivel === 'moderator' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        } rounded-full">
                            ${item.nivel}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div class="flex space-x-2">
                            <button onclick="editAdmin(${item.id})" 
                                    class="text-blue-600 hover:text-blue-900">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteAdmin(${item.id})"
                                    class="text-red-600 hover:text-red-900">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-user text-gray-600"></i>
                            </div>
                            <div class="text-sm font-medium text-gray-900">${item.nombre}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.nombreArtistico || '<span class="text-gray-400 italic">No especificado</span>'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a href="mailto:${item.email}" class="text-blue-600 hover:text-blue-800">
                            ${item.email}
                        </a>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.pais}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.ciudad}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            ${item.categoria}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${formatDate(item.fechaRegistro)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div class="flex space-x-2">
                            <button onclick="acceptRegistration('${tableBodyId}', ${item.id})" 
                                    class="text-green-600 hover:text-green-900"
                                    title="Aceptar registro">
                                <i class="fas fa-check"></i>
                            </button>
                            <button onclick="rejectRegistration('${tableBodyId}', ${item.id})"
                                    class="text-red-600 hover:text-red-900"
                                    title="Rechazar registro">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </td>
                `;
            }
            tableBody.appendChild(row);
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function exportToExcel(dataType, filename) {
        const data = JSON.parse(localStorage.getItem(dataType)) || [];
        
        if (data.length === 0) {
            showToast('No hay datos para exportar', 'error');
            return;
        }

        const excelData = data.map(item => ({
            'Nombre': item.nombre,
            'Nombre Artístico': item.nombreArtistico || 'No especificado',
            'Email': item.email,
            'País': item.pais,
            'Ciudad': item.ciudad,
            'Categoría': item.categoria,
            'Fecha de Registro': formatDate(item.fechaRegistro)
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        const colWidths = [
            { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, 
            { wch: 15 }, { wch: 15 }, { wch: 20 }
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, dataType === 'tatuadores' ? 'Tatuadores' : 'Jurados');

        const timestamp = new Date().toISOString().slice(0, 10);
        const fullFilename = `${filename}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, fullFilename);
        
        showToast(`Archivo ${fullFilename} descargado exitosamente`, 'success');
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-3"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-300">
                <i class="fas fa-times"></i>
            </button>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Escuchar eventos de nuevos mensajes
    window.addEventListener('nuevoMensajeContacto', () => {
        if (!adminPanel.classList.contains('hidden') && sessionStorage.getItem('adminLoggedIn') === 'true') {
            loadData();
        }
    });

    // Auto-refresh data every 30 seconds if panel is visible (backup)
    setInterval(() => {
        if (!adminPanel.classList.contains('hidden') && sessionStorage.getItem('adminLoggedIn') === 'true') {
            loadData();
        }
    }, 30000);

    // Load data on initial page load if already logged in
    if (!adminPanel.classList.contains('hidden')) {
        loadData();
    }

    // Security check on page load
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        const loginTime = parseInt(sessionStorage.getItem('loginTime'));
        const maxSessionTime = 2 * 60 * 60 * 1000; // 2 hours max session
        
        if (!loginTime || Date.now() - loginTime > maxSessionTime) {
            performLogout('session_expired');
        }
    }
});

// Global functions for admin management
window.editAdmin = function(adminId) {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const admin = admins.find(a => a.id === adminId);
    
    if (admin) {
        currentAdminId = adminId;
        document.getElementById('adminName').value = admin.nombre;
        document.getElementById('adminEmail').value = admin.email;
        document.getElementById('adminPassword').value = admin.password;
        document.getElementById('adminAccess').value = admin.nivel;
        
        document.getElementById('adminModal').classList.remove('hidden');
        document.getElementById('adminModal').classList.add('flex');
    }
};

window.deleteAdmin = function(adminId) {
    if (confirm('¿Estás seguro de que deseas eliminar este administrador?')) {
        const admins = JSON.parse(localStorage.getItem('admins')) || [];
        const filteredAdmins = admins.filter(admin => admin.id !== adminId);
        
        localStorage.setItem('admins', JSON.stringify(filteredAdmins));
        loadData();
        showToast('Administrador eliminado exitosamente', 'success');
    }
};

// Global functions for registration management
window.acceptRegistration = function(tableType, id) {
    const type = tableType === 'tatuadoresTableBody' ? 'tatuadores' : 'jurados';
    const items = JSON.parse(localStorage.getItem(type)) || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
        items[index].estado = 'aceptado';
        localStorage.setItem(type, JSON.stringify(items));
        loadData();
        showToast(`${type === 'tatuadores' ? 'Tatuador' : 'Jurado'} aceptado exitosamente`, 'success');
    }
};

window.rejectRegistration = function(tableType, id) {
    if (confirm('¿Estás seguro de que deseas rechazar este registro?')) {
        const type = tableType === 'tatuadoresTableBody' ? 'tatuadores' : 'jurados';
        const items = JSON.parse(localStorage.getItem(type)) || [];
        const index = items.findIndex(item => item.id === id);
        
        if (index !== -1) {
            items[index].estado = 'rechazado';
            localStorage.setItem(type, JSON.stringify(items));
            loadData();
            showToast(`${type === 'tatuadores' ? 'Tatuador' : 'Jurado'} rechazado`, 'success');
        }
    }
};

// Make helper functions globally available
window.formatDate = formatDate;
window.showToast = showToast;
window.loadData = function() {
    const tatuadores = JSON.parse(localStorage.getItem('tatuadores')) || [];
    const jurados = JSON.parse(localStorage.getItem('jurados')) || [];
    const mensajes = JSON.parse(localStorage.getItem('mensajesContacto')) || [];

    if (document.getElementById('totalTatuadores')) {
        document.getElementById('totalTatuadores').textContent = tatuadores.length;
        document.getElementById('totalJurados').textContent = jurados.length;
        document.getElementById('totalRegistros').textContent = tatuadores.length + jurados.length;

        populateTable('tatuadoresTableBody', tatuadores);
        populateTable('juradosTableBody', jurados);
        populateContactTable(mensajes);
    }
};

// Contact message management functions
window.markMessageAsRead = async function(messageId) {
    try {
        const response = await fetch(`/api/messages/${messageId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ leido: true })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el mensaje');
        }

        loadData();
        showToast('Mensaje marcado como leído', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al marcar el mensaje como leído', 'error');
    }
};

window.deleteMessage = async function(messageId) {
    if (confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
        try {
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el mensaje');
            }

            loadData();
            showToast('Mensaje eliminado exitosamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al eliminar el mensaje', 'error');
        }
    }
};
