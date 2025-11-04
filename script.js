// Simulador de Crédito de Consumo
class CreditSimulator {
    constructor() {
        this.form = document.getElementById('creditForm');
        this.resultsDiv = document.getElementById('results');
        this.amortizationBody = document.getElementById('amortizationBody');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateCredit();
        });
        
        // Calcular automáticamente cuando cambian los valores
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.form.checkValidity()) {
                    this.calculateCredit();
                }
            });
        });
    }
    
    calculateCredit() {
        // Obtener valores del formulario
        const amount = parseFloat(document.getElementById('amount').value);
        const monthlyRate = parseFloat(document.getElementById('rate').value) / 100; // Convertir porcentaje a decimal
        const term = parseInt(document.getElementById('term').value);
        
        // Validar datos
        if (!amount || !monthlyRate || !term) {
            this.showError('Por favor, complete todos los campos correctamente.');
            return;
        }
        
        // Calcular valor cuota usando la fórmula: V_cuota = (M * i) / (1 - (1 + i)^-n)
        const monthlyPayment = this.calculateMonthlyPayment(amount, monthlyRate, term);
        
        // Mostrar resultados
        this.displayResults(amount, monthlyRate, term, monthlyPayment);
        
        // Generar tabla de amortización
        this.generateAmortizationTable(amount, monthlyRate, term, monthlyPayment);
    }
    
    calculateMonthlyPayment(principal, rate, term) {
        // Fórmula: V_cuota = (M * i) / (1 - (1 + i)^-n)
        const numerator = principal * rate;
        const denominator = 1 - Math.pow(1 + rate, -term);
        return numerator / denominator;
    }
    
    displayResults(amount, rate, term, monthlyPayment) {
        const totalPayment = monthlyPayment * term;
        const totalInterest = totalPayment - amount;
        const annualRate = rate * 12 * 100; // Tasa anual en porcentaje
        
        this.resultsDiv.innerHTML = `
            <h4>Resumen del Crédito</h4>
            <div class="result-item">
                <span class="result-label">Monto del Crédito:</span>
                <span class="result-value">$${this.formatNumber(amount)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Tasa de Interés Mensual:</span>
                <span class="result-value">${(rate * 100).toFixed(2)}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">Tasa de Interés Anual:</span>
                <span class="result-value">${annualRate.toFixed(2)}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">Plazo:</span>
                <span class="result-value">${term} meses (${(term/12).toFixed(1)} años)</span>
            </div>
            <div class="result-item" style="border-top: 2px solid #4facfe; margin-top: 10px; padding-top: 15px;">
                <span class="result-label">Valor Cuota Mensual:</span>
                <span class="result-value" style="color: #e74c3c; font-size: 1.3rem;">$${this.formatNumber(monthlyPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total a Pagar:</span>
                <span class="result-value">$${this.formatNumber(totalPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Total Intereses:</span>
                <span class="result-value">$${this.formatNumber(totalInterest)}</span>
            </div>
        `;
        
        this.resultsDiv.classList.add('fade-in');
    }
    
    generateAmortizationTable(principal, rate, term, monthlyPayment) {
        let balance = principal;
        let tableHTML = '';
        
        // Fila inicial (cuota 0)
        tableHTML += `
            <tr>
                <td>0</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>$${this.formatNumber(principal)} (MONTO SOLICITADO)</td>
            </tr>
        `;
        
        // Generar filas para cada cuota
        for (let i = 1; i <= term; i++) {
            // Calcular intereses sobre el saldo adeudado
            const interestPayment = balance * rate;
            
            // Calcular amortización (capital)
            const principalPayment = monthlyPayment - interestPayment;
            
            // Actualizar saldo adeudado
            balance -= principalPayment;
            
            // Asegurar que el saldo no sea negativo en la última cuota
            if (i === term) {
                balance = 0;
            }
            
            tableHTML += `
                <tr>
                    <td>${i}</td>
                    <td>$${this.formatNumber(monthlyPayment)}</td>
                    <td>$${this.formatNumber(interestPayment)}</td>
                    <td>$${this.formatNumber(principalPayment)}</td>
                    <td>$${this.formatNumber(Math.max(0, balance))}</td>
                </tr>
            `;
        }
        
        this.amortizationBody.innerHTML = tableHTML;
        
        // Agregar animación a la tabla
        const table = document.getElementById('amortizationTable');
        table.classList.add('fade-in');
    }
    
    formatNumber(number) {
        return new Intl.NumberFormat('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(number));
    }
    
    showError(message) {
        this.resultsDiv.innerHTML = `
            <div style="color: #e74c3c; text-align: center; padding: 20px;">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar simulador de crédito
    const simulator = new CreditSimulator();
    
    // Inicializar sidebar
    const sidebarManager = new SidebarManager();
    
    // Agregar tooltips y formatear inputs
    addTooltips();
    formatInputs();
    
    // Establecer el primer botón como activo por defecto
    const firstNavButton = document.querySelector('.nav-btn');
    if (firstNavButton) {
        firstNavButton.classList.add('active');
    }
    
    // Calcular ejemplo inicial
    setTimeout(() => {
        simulator.calculateCredit();
    }, 500);
});

function addTooltips() {
    const tooltips = {
        'amount': 'Ingrese el monto que desea solicitar en pesos chilenos',
        'rate': 'Tasa de interés mensual que cobra la institución financiera',
        'term': 'Número de meses en los que pagará el crédito'
    };
    
    Object.keys(tooltips).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltips[id];
        }
    });
}

function formatInputs() {
    const amountInput = document.getElementById('amount');
    
    amountInput.addEventListener('input', function() {
        // Remover caracteres no numéricos excepto puntos y comas
        let value = this.value.replace(/[^\d]/g, '');
        
        // Formatear con separadores de miles
        if (value) {
            const formatted = new Intl.NumberFormat('es-CL').format(parseInt(value));
            // Actualizar el valor mostrado pero mantener el valor numérico para cálculos
            this.setAttribute('data-value', value);
        }
    });
}

// Función para exportar tabla a CSV (funcionalidad adicional)
function exportToCSV() {
    const table = document.getElementById('amortizationTable');
    const rows = table.querySelectorAll('tr');
    let csv = [];
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = Array.from(cols).map(col => 
            col.textContent.replace(/,/g, '').replace(/\$/g, '')
        );
        csv.push(rowData.join(','));
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tabla_amortizacion.csv';
    a.click();
    
    window.URL.revokeObjectURL(url);
}

// Función para imprimir tabla
function printTable() {
    const printWindow = window.open('', '_blank');
    const table = document.getElementById('amortizationTable').outerHTML;
    const results = document.getElementById('results').outerHTML;
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Tabla de Amortización</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #f2f2f2; }
                    .results-display { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
                </style>
            </head>
            <body>
                <h1>Simulador de Crédito de Consumo</h1>
                <div class="results-display">${results}</div>
                ${table}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Funcionalidad de la navbar lateral
class SidebarManager {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.navButtons = document.querySelectorAll('.nav-btn');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Toggle sidebar en móviles
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Navegación suave y activación de botones
        this.navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = button.getAttribute('data-section');
                this.navigateToSection(targetSection);
                this.setActiveButton(button);
                
                // Cerrar sidebar en móviles después de navegar
                if (window.innerWidth <= 768) {
                    this.closeSidebar();
                }
            });
        });
        
        // Cerrar sidebar al hacer clic fuera de él en móviles
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !this.sidebar.contains(e.target) && 
                !this.sidebarToggle.contains(e.target)) {
                this.closeSidebar();
            }
        });
        
        // Manejar cambios de tamaño de ventana
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.sidebar.classList.remove('active');
            }
        });
    }
    
    toggleSidebar() {
        this.sidebar.classList.toggle('active');
    }
    
    closeSidebar() {
        this.sidebar.classList.remove('active');
    }
    
    navigateToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    setActiveButton(activeButton) {
        // Remover clase active de todos los botones
        this.navButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Agregar clase active al botón clickeado
        activeButton.classList.add('active');
    }
}