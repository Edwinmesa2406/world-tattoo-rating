document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const tabTatuador = document.getElementById('tab-tatuador');
    const tabJurado = document.getElementById('tab-jurado');
    const formTatuador = document.getElementById('form-tatuador');
    const formJurado = document.getElementById('form-jurado');

    // Check if we should show a specific form based on URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const showForm = urlParams.get('form');
    
    if (showForm === 'jurado') {
        showJuradoForm();
    } else {
        showTatuadorForm();
    }

    // Tab click handlers
    tabTatuador.addEventListener('click', showTatuadorForm);
    tabJurado.addEventListener('click', showJuradoForm);

    // Form submit handlers
    document.getElementById('tatuadorForm').addEventListener('submit', handleTatuadorSubmit);
    document.getElementById('juradoForm').addEventListener('submit', handleJuradoSubmit);

    function showTatuadorForm() {
        tabTatuador.classList.remove('bg-gray-200', 'text-gray-700');
        tabTatuador.classList.add('bg-gray-900', 'text-white');
        tabJurado.classList.remove('bg-gray-900', 'text-white');
        tabJurado.classList.add('bg-gray-200', 'text-gray-700');
        formTatuador.classList.remove('hidden');
        formJurado.classList.add('hidden');
    }

    function showJuradoForm() {
        tabJurado.classList.remove('bg-gray-200', 'text-gray-700');
        tabJurado.classList.add('bg-gray-900', 'text-white');
        tabTatuador.classList.remove('bg-gray-900', 'text-white');
        tabTatuador.classList.add('bg-gray-200', 'text-gray-700');
        formTatuador.classList.add('hidden');
        formJurado.classList.remove('hidden');
    }

    function handleTatuadorSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const spinner = submitBtn.querySelector('.loading-spinner');
        const submitText = submitBtn.querySelector('.submit-text');

        // Show loading state
        submitBtn.disabled = true;
        spinner.classList.remove('hidden');
        submitText.textContent = 'Registrando...';

        // Validate required fields
        const requiredFields = ['nombre', 'email', 'telefono', 'pais', 'ciudad', 'categoria'];
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                showToast(`El campo ${field} es requerido`, 'error');
                resetButton();
                return;
            }
        }

        // Validate email
        if (!validateEmail(formData.get('email'))) {
            showToast('Email inválido', 'error');
            resetButton();
            return;
        }

        // Validate phone number
        if (!validatePhone(formData.get('telefono'))) {
            showToast('Número de teléfono inválido', 'error');
            resetButton();
            return;
        }

        // Create tatuador object
        const tatuador = {
            id: generateId(),
            nombre: formData.get('nombre'),
            nombreArtistico: formData.get('nombreArtistico') || '',
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            pais: formData.get('pais'),
            ciudad: formData.get('ciudad'),
            categoria: formData.get('categoria'),
            fechaRegistro: new Date().toISOString()
        };

        // Save to localStorage
        saveTatuador(tatuador);

        // Simulate form submission delay
        setTimeout(() => {
            showToast('¡Registro exitoso! El tatuador ha sido registrado correctamente.', 'success');
            form.reset();
            resetButton();
            
            // Show success message below the form
            showSuccessMessage(form, 'Tatuador registrado exitosamente.');
        }, 1500);

        function resetButton() {
            submitBtn.disabled = false;
            spinner.classList.add('hidden');
            submitText.textContent = 'Registrarse';
        }
    }

    function handleJuradoSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando...';

        // Validate required fields
        const requiredFields = ['nombre', 'email', 'telefono', 'pais', 'ciudad', 'categoria'];
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                showToast(`El campo ${field} es requerido`, 'error');
                resetButton();
                return;
            }
        }

        // Validate email
        if (!validateEmail(formData.get('email'))) {
            showToast('Email inválido', 'error');
            resetButton();
            return;
        }

        // Validate phone number
        if (!validatePhone(formData.get('telefono'))) {
            showToast('Número de teléfono inválido', 'error');
            resetButton();
            return;
        }

        // Create jurado object
        const jurado = {
            id: generateId(),
            nombre: formData.get('nombre'),
            nombreArtistico: formData.get('nombreArtistico') || '',
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            pais: formData.get('pais'),
            ciudad: formData.get('ciudad'),
            categoria: formData.get('categoria'),
            fechaRegistro: new Date().toISOString()
        };

        // Save to localStorage
        saveJurado(jurado);

        // Simulate form submission delay
        setTimeout(() => {
            showToast('¡Jurado registrado exitosamente! El jurado ha sido registrado correctamente.', 'success');
            form.reset();
            resetButton();
            
            // Show success message below the form
            showSuccessMessage(form, 'Jurado registrado exitosamente.');
        }, 1500);

        function resetButton() {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrarse';
        }
    }

    // Utility functions
    function saveTatuador(tatuador) {
        let tatuadores = JSON.parse(localStorage.getItem('tatuadores')) || [];
        tatuadores.push(tatuador);
        localStorage.setItem('tatuadores', JSON.stringify(tatuadores));
    }

    function saveJurado(jurado) {
        let jurados = JSON.parse(localStorage.getItem('jurados')) || [];
        jurados.push(jurado);
        localStorage.setItem('jurados', JSON.stringify(jurados));
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone);
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-300">
                <i class="fas fa-times"></i>
            </button>
        `;
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    function showSuccessMessage(form, message) {
        // Remove any existing success message
        const existingMessage = form.parentElement.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create success message element
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message mt-6 p-4 bg-green-50 border border-green-200 rounded-xl';
        successMessage.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i class="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-green-800 font-medium">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 ml-4 text-green-600 hover:text-green-800">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Insert after the form
        form.parentElement.appendChild(successMessage);

        // Scroll to the success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
