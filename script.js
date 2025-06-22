'use strict';

// Estado global de la aplicación
const state = {
    tatuadores: [],
    jurados: [],
    evaluaciones: [],
    maxJurados: 5
};

// Utilidades
const utils = {
    showToast: (message, type = 'success') => {
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
    },

    validateEmail: (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validatePhone: (phone) => {
        return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone);
    },

    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Gestión de Tatuadores
const tatuadorManager = {
    init: () => {
        const form = document.getElementById('tatuadorForm');
        if (form) {
            form.addEventListener('submit', tatuadorManager.handleSubmit);
            
            // Add field focus management
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                // Clear placeholder on focus
                input.addEventListener('focus', () => {
                    input.setAttribute('data-placeholder', input.getAttribute('placeholder'));
                    input.setAttribute('placeholder', '');
                });
                
                // Restore placeholder on blur if empty
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        input.setAttribute('placeholder', input.getAttribute('data-placeholder'));
                    }
                });

                // Handle Enter key to move to next field
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const tabIndex = parseInt(input.getAttribute('tabindex'));
                        const nextInput = form.querySelector(`[tabindex="${tabIndex + 1}"]`);
                        if (nextInput) {
                            nextInput.focus();
                        } else {
                            // If no next input, submit the form
                            form.querySelector('button[type="submit"]').click();
                        }
                    }
                });
            });
        }
        tatuadorManager.renderLista();
    },

    setLoading: (form, isLoading) => {
        const submitBtn = form.querySelector('button[type="submit"]');
        const submitText = submitBtn.querySelector('.submit-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');
        const inputs = form.querySelectorAll('input, select');
        
        if (isLoading) {
            submitBtn.disabled = true;
            submitText.textContent = 'Registrando...';
            loadingSpinner.classList.remove('hidden');
            inputs.forEach(input => input.disabled = true);
        } else {
            submitBtn.disabled = false;
            submitText.textContent = 'Registrarse';
            loadingSpinner.classList.add('hidden');
            inputs.forEach(input => input.disabled = false);
        }
    },

    clearForm: (form) => {
        form.reset();
        form.querySelectorAll('input, select').forEach(input => {
            input.setAttribute('placeholder', input.getAttribute('data-placeholder'));
        });
        form.querySelector('[tabindex="1"]').focus();
    },

    handleSubmit: async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        try {
            tatuadorManager.setLoading(form, true);

            // Validar campos requeridos
            const requiredFields = ['nombre', 'email', 'pais', 'ciudad', 'categoria'];
            for (const field of requiredFields) {
                if (!formData.get(field)) {
                    utils.showToast(`El campo ${field} es requerido`, 'error');
                    tatuadorManager.setLoading(form, false);
                    return;
                }
            }

            const tatuador = {
                id: utils.generateId(),
                nombre: formData.get('nombre'),
                nombreArtistico: formData.get('nombreArtistico') || '',
                email: formData.get('email'),
                pais: formData.get('pais'),
                ciudad: formData.get('ciudad'),
                categoria: formData.get('categoria')
            };

            if (!utils.validateEmail(tatuador.email)) {
                utils.showToast('Email inválido', 'error');
                tatuadorManager.setLoading(form, false);
                return;
            }

            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));

            state.tatuadores.push(tatuador);
            tatuadorManager.clearForm(form);
            tatuadorManager.renderLista();
            utils.showToast('¡Registro exitoso! El tatuador ha sido registrado correctamente.', 'success');

            // Scroll to lista de tatuadores
            document.getElementById('lista-tatuadores').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error al registrar tatuador:', error);
            utils.showToast('Error al registrar tatuador. Por favor intente nuevamente.', 'error');
        } finally {
            tatuadorManager.setLoading(form, false);
        }
    },

    renderLista: () => {
        const container = document.getElementById('tatuadoresLista');
        if (!container) return;

        container.innerHTML = state.tatuadores.map(tatuador => `
            <div class="bg-white p-6 rounded-lg shadow-md card-hover">
                <h3 class="text-xl font-bold mb-2">${tatuador.nombre}</h3>
                ${tatuador.nombreArtistico ? `<p class="text-gray-600 mb-2">Alias: ${tatuador.nombreArtistico}</p>` : ''}
                <p class="text-gray-600">Categoría: ${tatuador.categoria}</p>
                <p class="text-gray-600">${tatuador.ciudad}, ${tatuador.pais}</p>
                <button 
                    onclick="tatuadorManager.eliminar('${tatuador.id}')"
                    class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300">
                    Eliminar
                </button>
            </div>
        `).join('');
    },

    eliminar: (id) => {
        if (confirm('¿Estás seguro de eliminar este tatuador?')) {
            state.tatuadores = state.tatuadores.filter(t => t.id !== id);
            tatuadorManager.renderLista();
            utils.showToast('Tatuador eliminado exitosamente');
        }
    }
};

// Gestión de Jurados
const juradoManager = {
    init: () => {
        const form = document.getElementById('juradoForm');
        const addButton = document.getElementById('addJurado');
        
        if (form) {
            form.addEventListener('submit', juradoManager.handleSubmit);
        }
        if (addButton) {
            addButton.addEventListener('click', juradoManager.addJuradoEntry);
        }
        
        juradoManager.renderLista();
    },

    addJuradoEntry: () => {
        const container = document.getElementById('juradosContainer');
        if (!container) return;

        if (container.children.length >= state.maxJurados) {
            if (!confirm('¿Deseas agregar otro jurado?')) {
                return;
            }
        }

        const juradoEntry = document.createElement('div');
        juradoEntry.className = 'jurado-entry mb-8 p-6 border border-gray-200 rounded-lg';
        juradoEntry.innerHTML = `
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Nombre del Jurado *</label>
                <input type="text" name="juradoNombre[]" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500">
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Correo electrónico *</label>
                <input type="email" name="juradoEmail[]" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Categorías a evaluar *</label>
                <div class="grid grid-cols-2 gap-4">
                    ${['Tradicionales', 'Color', 'Lettering', 'Sombras', 'Anime/Comic', 'R color', 'R sombra', 'Neotradi', 'Black', 'Homenaje', 'Libre', 'Nuevo artista'].map(cat => `
                        <div>
                            <label class="inline-flex items-center">
                                <input type="checkbox" name="categorias[]" value="${cat}" class="rounded border-gray-300 text-gray-900 shadow-sm">
                                <span class="ml-2">${cat}</span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.appendChild(juradoEntry);
    },

    handleSubmit: (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const nombres = formData.getAll('juradoNombre[]');
        const emails = formData.getAll('juradoEmail[]');
        const categorias = formData.getAll('categorias[]');

        const jurados = nombres.map((nombre, i) => ({
            id: utils.generateId(),
            nombre: nombre,
            email: emails[i],
            categorias: categorias
        }));

        // Validar emails
        if (!jurados.every(j => utils.validateEmail(j.email))) {
            utils.showToast('Uno o más emails son inválidos', 'error');
            return;
        }

        state.jurados.push(...jurados);
        e.target.reset();
        document.getElementById('juradosContainer').innerHTML = '';
        juradoManager.addJuradoEntry(); // Add one empty entry
        juradoManager.renderLista();
        utils.showToast('Jurados registrados exitosamente');
    },

    renderLista: () => {
        const container = document.getElementById('juradosLista');
        if (!container) return;

        container.innerHTML = state.jurados.map(jurado => `
            <div class="bg-white p-6 rounded-lg shadow-md card-hover">
                <h3 class="text-xl font-bold mb-2">${jurado.nombre}</h3>
                <p class="text-gray-600 mb-2">${jurado.email}</p>
                <div class="mb-4">
                    <h4 class="font-medium mb-2">Categorías:</h4>
                    <div class="flex flex-wrap gap-2">
                        ${jurado.categorias.map(cat => `
                            <span class="px-2 py-1 bg-gray-200 rounded-full text-sm">${cat}</span>
                        `).join('')}
                    </div>
                </div>
                <button 
                    onclick="juradoManager.eliminar('${jurado.id}')"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300">
                    Eliminar
                </button>
            </div>
        `).join('');
    },

    eliminar: (id) => {
        if (confirm('¿Estás seguro de eliminar este jurado?')) {
            state.jurados = state.jurados.filter(j => j.id !== id);
            juradoManager.renderLista();
            utils.showToast('Jurado eliminado exitosamente');
        }
    }
};

// Sistema de Evaluación
const evaluacionManager = {
    criteriosPorCategoria: {
        'anime': ['Luces', 'Posición', 'Valor de línea', 'Saturación', 'Técnica', 'Maltrato', 'Proceso creativo', 'Limpieza', 'Contraste'],
        'tradicionales': ['Proceso creativo', 'Contraste', 'Limpieza', 'Luces', 'Posición', 'Saturación', 'Técnica', 'Valor de línea', 'Maltrato'],
        'sombras': ['Similitud', 'Contraste', 'Limpieza', 'Posición', 'Luces', 'Saturación', 'Técnica', 'Riqueza tonal']
    },

    init: () => {
        evaluacionManager.renderForm();
        evaluacionManager.renderResultados();
    },

    renderForm: () => {
        const container = document.getElementById('evaluacionContainer');
        if (!container) return;

        // Agrupar tatuadores por categoría
        const tatuadoresPorCategoria = state.tatuadores.reduce((acc, t) => {
            if (!acc[t.categoria]) acc[t.categoria] = [];
            acc[t.categoria].push(t);
            return acc;
        }, {});

        container.innerHTML = Object.entries(tatuadoresPorCategoria).map(([categoria, tatuadores]) => `
            <div class="mb-12">
                <h3 class="text-2xl font-bold mb-6">${categoria}</h3>
                ${tatuadores.map(tatuador => `
                    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h4 class="text-xl font-bold mb-4">${tatuador.nombre}</h4>
                        <form onsubmit="evaluacionManager.handleSubmit(event, '${tatuador.id}')" class="space-y-4">
                            ${evaluacionManager.getCriterios(categoria).map(criterio => `
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">${criterio}</label>
                                    <input 
                                        type="number" 
                                        name="${criterio}" 
                                        min="1" 
                                        max="10" 
                                        required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500">
                                </div>
                            `).join('')}
                            <button type="submit" class="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-300">
                                Evaluar
                            </button>
                        </form>
                    </div>
                `).join('')}
            </div>
        `).join('');
    },

    getCriterios: (categoria) => {
        if (categoria.toLowerCase().includes('anime') || categoria.toLowerCase().includes('comic')) {
            return evaluacionManager.criteriosPorCategoria.anime;
        } else if (categoria.toLowerCase().includes('sombras')) {
            return evaluacionManager.criteriosPorCategoria.sombras;
        }
        return evaluacionManager.criteriosPorCategoria.tradicionales;
    },

    handleSubmit: (e, tatuadorId) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const evaluacion = {
            id: utils.generateId(),
            tatuadorId: tatuadorId,
            juradoId: state.jurados[0]?.id, // Simplificado para el ejemplo
            criterios: {}
        };

        for (let [criterio, valor] of formData.entries()) {
            evaluacion.criterios[criterio] = parseInt(valor);
        }

        state.evaluaciones.push(evaluacion);
        e.target.reset();
        evaluacionManager.renderResultados();
        utils.showToast('Evaluación registrada exitosamente');
    },

    renderResultados: () => {
        const container = document.getElementById('resultadosContainer');
        if (!container) return;

        // Calcular resultados
        const resultados = state.tatuadores.map(tatuador => {
            const evaluacionesTatuador = state.evaluaciones.filter(evaluacion => evaluacion.tatuadorId === tatuador.id);
            const totalPuntos = evaluacionesTatuador.reduce((sum, evaluacion) => {
                return sum + Object.values(evaluacion.criterios).reduce((a, b) => a + b, 0);
            }, 0);
            const promedio = evaluacionesTatuador.length ? 
                totalPuntos / (evaluacionesTatuador.length * Object.keys(evaluacionesTatuador[0]?.criterios || {}).length) : 0;

            return {
                ...tatuador,
                promedio: promedio * 10 // Convertir a porcentaje
            };
        });

        // Ordenar por promedio
        resultados.sort((a, b) => b.promedio - a.promedio);

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${resultados.map((r, i) => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap">${i + 1}</td>
                                <td class="px-6 py-4 whitespace-nowrap">${r.nombre}</td>
                                <td class="px-6 py-4 whitespace-nowrap">${r.categoria}</td>
                                <td class="px-6 py-4 whitespace-nowrap">${r.promedio.toFixed(2)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
};

// Exportación a Excel
const exportManager = {
    init: () => {
        const exportBtn = document.getElementById('exportarExcel');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportManager.exportToExcel);
        }
    },

    exportToExcel: () => {
        // Crear datos para exportar
        const data = [
            ['Nombre', 'Categoría', 'Promedio', 'Evaluaciones'],
            ...state.tatuadores.map(tatuador => {
                const evaluacionesTatuador = state.evaluaciones.filter(evaluacion => evaluacion.tatuadorId === tatuador.id);
                const promedios = evaluacionesTatuador.map(evaluacion => 
                    Object.values(evaluacion.criterios).reduce((a, b) => a + b, 0) / Object.keys(evaluacion.criterios).length
                );
                const promedioFinal = promedios.length ? 
                    promedios.reduce((a, b) => a + b, 0) / promedios.length : 0;

                return [
                    tatuador.nombre,
                    tatuador.categoria,
                    (promedioFinal * 10).toFixed(2) + '%',
                    evaluacionesTatuador.length
                ];
            })
        ];

        // Convertir a CSV
        const csv = data.map(row => row.join(',')).join('\n');

        // Crear y descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'resultados_expotatto.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Mobile Menu
const mobileMenuManager = {
    init: () => {
        const menuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                const hamburger = menuButton.querySelector('.hamburger');
                hamburger.classList.toggle('active');
            });

            // Close menu when clicking a link
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    const hamburger = menuButton.querySelector('.hamburger');
                    hamburger.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                    const hamburger = menuButton.querySelector('.hamburger');
                    hamburger.classList.remove('active');
                }
            });
        }
    }
};

// Smooth Scroll
const smoothScrollManager = {
    init: () => {
        // Get header height for offset
        const header = document.querySelector('nav');
        const headerHeight = header ? header.offsetHeight : 0;

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20; // 20px extra padding

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Focus on first input if it's a form section
                    if (targetId === '#registro-tatuadores') {
                        setTimeout(() => {
                            const firstInput = targetElement.querySelector('input[tabindex="1"]');
                            if (firstInput) firstInput.focus();
                        }, 800); // Wait for scroll to complete
                    }

                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mobile-menu');
                    const menuButton = document.getElementById('mobile-menu-button');
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                        const hamburger = menuButton.querySelector('.hamburger');
                        if (hamburger) hamburger.classList.remove('active');
                    }
                }
            });
        });

        // Update header offset on window resize
        window.addEventListener('resize', () => {
            const header = document.querySelector('nav');
            if (header) {
                document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
            }
        });
    }
};

// FAQ Manager
const faqManager = {
    init: () => {
        const faqButtons = document.querySelectorAll('#faq button');
        
        faqButtons.forEach(button => {
            button.addEventListener('click', () => {
                const answer = button.nextElementSibling;
                const icon = button.querySelector('i');
                
                // Toggle answer visibility
                answer.classList.toggle('active');
                
                // Rotate icon
                icon.style.transform = answer.classList.contains('active') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0)';
            });
        });
    }
};

// Contact Form Manager
const contactManager = {
    init: () => {
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(form);
                const mensaje = {
                    nombre: formData.get('nombre'),
                    email: formData.get('email'),
                    telefono: formData.get('telefono'),
                    mensaje: formData.get('mensaje'),
                    fecha: new Date().toISOString()
                };
                
                // Validar email
                if (!utils.validateEmail(mensaje.email)) {
                    utils.showToast('Email inválido', 'error');
                    return;
                }

                // Validar teléfono
                if (!utils.validatePhone(mensaje.telefono)) {
                    utils.showToast('Número de teléfono inválido', 'error');
                    return;
                }
                
                try {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Enviando...';
                    
                    // Enviar mensaje al servidor
                    const response = await fetch('/api/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(mensaje)
                    });
                    
                    if (!response.ok) {
                        throw new Error('Error al enviar el mensaje');
                    }
                    
                    const savedMessage = await response.json();
                    
                    // Disparar evento personalizado para notificar al panel de administración
                    const event = new CustomEvent('nuevoMensajeContacto', { detail: savedMessage });
                    window.dispatchEvent(event);
                    
                    // Show success message
                    utils.showToast('¡Mensaje enviado con éxito!', 'success');
                    
                    // Reset form
                    form.reset();
                } catch (error) {
                    console.error('Error:', error);
                    utils.showToast('Error al enviar el mensaje. Por favor, intente nuevamente.', 'error');
                } finally {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Enviar mensaje';
                }
            });
        }
    }
};


// Animation Manager
const animationManager = {
    init: () => {
        const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-fade-in-delay, .animate-fade-in-delay-2');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            observer.observe(element);
        });
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    tatuadorManager.init();
    juradoManager.init();
    evaluacionManager.init();
    exportManager.init();
    mobileMenuManager.init();
    smoothScrollManager.init();
    faqManager.init();
    contactManager.init();
    animationManager.init();
});
