import React, { useState } from 'react';
import './Checkout.css';

const Checkout = ({
    cartItems = [],
    directProduct = null,
    onBack,
    purchaseType = 'cart' // 'cart' o 'direct'
}) => {
    // Estados principales
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCurrency, setSelectedCurrency] = useState('ARS');
    const [selectedShipping, setSelectedShipping] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('');
    const [orderComplete, setOrderComplete] = useState(false);
    const [loading, setLoading] = useState(false);

    // Datos del formulario
    const [formData, setFormData] = useState({
        // Datos personales
        firstName: '',
        lastName: '',
        email: '',
        phone: '',

        // Dirección de envío
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Argentina',

        // Datos de pago
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',

        // Transferencia
        bankAccount: '',
        accountHolder: ''
    });

    // Configuración de monedas
    const currencies = {
        ARS: { name: 'Peso Argentino', symbol: '$', rate: 1 },
        USD: { name: 'Dólar Estadounidense', symbol: 'US$', rate: 0.0028 },
        EUR: { name: 'Euro', symbol: '€', rate: 0.0026 },
        BRL: { name: 'Real Brasileño', symbol: 'R$', rate: 0.014 }
    };

    // Determinar qué productos usar según el tipo de compra
    const getProductsToProcess = () => {
        if (purchaseType === 'direct' && directProduct) {
            return [directProduct];
        }
        return cartItems || [];
    };

    const productsToProcess = getProductsToProcess();

    // Si no hay productos, mostrar mensaje
    if (!productsToProcess || productsToProcess.length === 0) {
        return (
            <div className="checkout-container">
                <div className="checkout-card">
                    <h2>{purchaseType === 'direct' ? 'Producto No Disponible' : 'Carrito Vacío'}</h2>
                    <p>
                        {purchaseType === 'direct'
                            ? 'No se pudo cargar la información del producto.'
                            : 'No hay productos en tu carrito para procesar.'
                        }
                    </p>
                    <button
                        className="checkout-btn primary"
                        onClick={() => onBack ? onBack() : window.history.back()}
                    >
                        Volver a Comprar
                    </button>
                </div>
            </div>
        );
    }

    // Opciones de envío
    const shippingOptions = [
        {
            id: 'pickup',
            name: 'Retiro en Sucursal',
            description: 'Retirá tu pedido en nuestras sucursales',
            cost: 0,
            time: '1-2 días hábiles'
        },
        {
            id: 'standard',
            name: 'Envío Estándar',
            description: 'Envío a domicilio',
            cost: 2500,
            time: '3-5 días hábiles'
        },
        {
            id: 'express',
            name: 'Envío Express',
            description: 'Envío rápido a domicilio',
            cost: 4500,
            time: '1-2 días hábiles'
        }
    ];

    // Opciones de pago
    const paymentOptions = [
        {
            id: 'mercadopago',
            name: 'Mercado Pago',
            description: 'Tarjetas de crédito y débito',
            currencies: ['ARS'],
            recommended: true
        },
        {
            id: 'credit_card',
            name: 'Tarjeta de Crédito',
            description: 'Visa, Mastercard, American Express',
            currencies: ['ARS']
        },
        {
            id: 'bank_transfer',
            name: 'Transferencia Bancaria',
            description: 'Transferencia o depósito bancario',
            currencies: ['ARS']
        },
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'Solo para moneda extranjera',
            currencies: ['USD', 'EUR', 'BRL']
        }
    ];

    // Calcular totales
    const calculateTotals = () => {
        const subtotal = productsToProcess.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = selectedShipping ? shippingOptions.find(opt => opt.id === selectedShipping)?.cost || 0 : 0;
        const total = subtotal + shippingCost;

        const currency = currencies[selectedCurrency];

        return {
            subtotal: subtotal * currency.rate,
            shipping: shippingCost * currency.rate,
            total: total * currency.rate,
            symbol: currency.symbol
        };
    };

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validar paso actual
    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1: // Información personal
                return formData.firstName && formData.lastName && formData.email && formData.phone;
            case 2: // Envío
                if (selectedShipping === 'pickup') return true;
                return selectedShipping && formData.address && formData.city && formData.state && formData.zipCode;
            case 3: // Pago
                if (selectedPayment === 'paypal') return true;
                if (selectedPayment === 'mercadopago') return true;
                if (selectedPayment === 'credit_card') {
                    return formData.cardNumber && formData.cardName && formData.expiryDate && formData.cvv;
                }
                if (selectedPayment === 'bank_transfer') {
                    return formData.bankAccount && formData.accountHolder;
                }
                return false;
            default:
                return false;
        }
    };

    // Avanzar al siguiente paso
    const nextStep = () => {
        if (validateCurrentStep() && currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    // Retroceder al paso anterior
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Procesar compra
    const processOrder = async () => {
        if (!validateCurrentStep()) return;

        setLoading(true);

        // Simular procesamiento
        setTimeout(() => {
            setLoading(false);
            setOrderComplete(true);
        }, 2000);
    };

    // Filtrar opciones de pago según moneda
    const getAvailablePaymentOptions = () => {
        return paymentOptions.filter(option =>
            option.currencies.includes(selectedCurrency)
        );
    };

    // Formatear precio
    const formatPrice = (price, symbol) => {
        return `${symbol} ${price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const totals = calculateTotals();

    if (orderComplete) {
        return (
            <div className="checkout-container">
                <div className="success-message">
                    <div className="success-icon">✅</div>
                    <h2>¡Compra Realizada con Éxito!</h2>
                    <p>Tu pedido ha sido procesado correctamente</p>
                    <div className="order-details">
                        <p><strong>Número de Orden:</strong> #ORD-{Date.now()}</p>
                        <p><strong>Total:</strong> {formatPrice(totals.total, totals.symbol)}</p>
                        <p><strong>Método de Pago:</strong> {paymentOptions.find(p => p.id === selectedPayment)?.name}</p>
                        <p><strong>Envío:</strong> {shippingOptions.find(s => s.id === selectedShipping)?.name}</p>
                    </div>
                    <button
                        className="checkout-btn primary"
                        onClick={() => window.location.href = '/'}
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            {/* Header */}
            <div className="checkout-header">
                <button className="back-btn" onClick={() => onBack ? onBack() : window.history.back()}>
                    ← Volver
                </button>
                <h1>
                    {purchaseType === 'direct' ? 'Comprar Producto' : 'Finalizar Compra'}
                    ({productsToProcess.length} producto{productsToProcess.length !== 1 ? 's' : ''})
                </h1>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar">
                <div className="progress-steps">
                    <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                        <div className="step-circle">1</div>
                        <div className="step-label">Información</div>
                    </div>
                    <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                        <div className="step-circle">2</div>
                        <div className="step-label">Envío</div>
                    </div>
                    <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                        <div className="step-circle">3</div>
                        <div className="step-label">Pago</div>
                    </div>
                </div>
            </div>

            <div className="checkout-main">
                {/* Formulario */}
                <div className="checkout-form">
                    {/* Selector de Moneda - Solo mostrar en el primer paso */}
                    {currentStep === 1 && (
                        <div className="currency-selector">
                            <label>Moneda:</label>
                            <select
                                value={selectedCurrency}
                                onChange={(e) => {
                                    setSelectedCurrency(e.target.value);
                                    setSelectedPayment(''); // Reset payment when currency changes
                                }}
                            >
                                {Object.entries(currencies).map(([code, currency]) => (
                                    <option key={code} value={code}>
                                        {currency.symbol} {currency.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Paso 1: Información Personal */}
                    {currentStep === 1 && (
                        <div className="form-section">
                            <h2>Información Personal</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Envío */}
                    {currentStep === 2 && (
                        <div className="form-section">
                            <h2>Método de Envío</h2>
                            <div className="shipping-options">
                                {shippingOptions.map(option => (
                                    <div
                                        key={option.id}
                                        className={`shipping-option ${selectedShipping === option.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedShipping(option.id)}
                                    >
                                        <div className="option-header">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value={option.id}
                                                checked={selectedShipping === option.id}
                                                onChange={() => setSelectedShipping(option.id)}
                                            />
                                            <div className="option-info">
                                                <h3>{option.name}</h3>
                                                <p>{option.description}</p>
                                                <p>{option.time}</p>
                                            </div>
                                            <div className="shipping-cost">
                                                {option.cost === 0 ? 'Gratis' : formatPrice(option.cost * currencies[selectedCurrency].rate, currencies[selectedCurrency].symbol)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Dirección de envío (solo si no es retiro en sucursal) */}
                            {selectedShipping && selectedShipping !== 'pickup' && (
                                <div className="address-form">
                                    <h3>Dirección de Envío</h3>
                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label>Dirección *</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="Calle y número"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Ciudad *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Provincia *</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Código Postal *</label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>País</label>
                                            <select
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Argentina">Argentina</option>
                                                <option value="Chile">Chile</option>
                                                <option value="Uruguay">Uruguay</option>
                                                <option value="Brasil">Brasil</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Paso 3: Pago */}
                    {currentStep === 3 && (
                        <div className="form-section">
                            <h2>Método de Pago</h2>

                            {selectedCurrency !== 'ARS' && (
                                <div className="paypal-info">
                                    <strong>Nota:</strong> Para moneda extranjera, solo está disponible el pago con PayPal.
                                </div>
                            )}

                            <div className="payment-options">
                                {getAvailablePaymentOptions().map(option => (
                                    <div
                                        key={option.id}
                                        className={`payment-option ${selectedPayment === option.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedPayment(option.id)}
                                    >
                                        <div className="option-header">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value={option.id}
                                                checked={selectedPayment === option.id}
                                                onChange={() => setSelectedPayment(option.id)}
                                            />
                                            <div className="option-info">
                                                <h3>
                                                    {option.name}
                                                    {option.recommended && <span className="recommended">Recomendado</span>}
                                                </h3>
                                                <p>{option.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Formularios de pago específicos */}
                            {selectedPayment && (
                                <div className="payment-form">
                                    {selectedPayment === 'credit_card' && (
                                        <>
                                            <h3>Datos de la Tarjeta</h3>
                                            <div className="form-grid">
                                                <div className="form-group full-width">
                                                    <label>Número de Tarjeta *</label>
                                                    <input
                                                        type="text"
                                                        name="cardNumber"
                                                        value={formData.cardNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength="19"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group full-width">
                                                    <label>Nombre en la Tarjeta *</label>
                                                    <input
                                                        type="text"
                                                        name="cardName"
                                                        value={formData.cardName}
                                                        onChange={handleInputChange}
                                                        placeholder="Como aparece en la tarjeta"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Fecha de Vencimiento *</label>
                                                    <input
                                                        type="text"
                                                        name="expiryDate"
                                                        value={formData.expiryDate}
                                                        onChange={handleInputChange}
                                                        placeholder="MM/AA"
                                                        maxLength="5"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>CVV *</label>
                                                    <input
                                                        type="text"
                                                        name="cvv"
                                                        value={formData.cvv}
                                                        onChange={handleInputChange}
                                                        placeholder="123"
                                                        maxLength="4"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {selectedPayment === 'bank_transfer' && (
                                        <>
                                            <h3>Datos para Transferencia</h3>
                                            <div className="form-grid">
                                                <div className="form-group full-width">
                                                    <label>CBU/Alias *</label>
                                                    <input
                                                        type="text"
                                                        name="bankAccount"
                                                        value={formData.bankAccount}
                                                        onChange={handleInputChange}
                                                        placeholder="CBU o Alias de la cuenta"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group full-width">
                                                    <label>Titular de la Cuenta *</label>
                                                    <input
                                                        type="text"
                                                        name="accountHolder"
                                                        value={formData.accountHolder}
                                                        onChange={handleInputChange}
                                                        placeholder="Nombre del titular"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {selectedPayment === 'mercadopago' && (
                                        <div className="paypal-info">
                                            <p>Serás redirigido a Mercado Pago para completar el pago de forma segura.</p>
                                        </div>
                                    )}

                                    {selectedPayment === 'paypal' && (
                                        <div className="paypal-info">
                                            <p>Serás redirigido a PayPal para completar el pago en {currencies[selectedCurrency].name}.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botones de navegación */}
                    <div className="form-actions">
                        {currentStep > 1 && (
                            <button
                                className="checkout-btn secondary"
                                onClick={prevStep}
                            >
                                ← Anterior
                            </button>
                        )}

                        {currentStep < 3 ? (
                            <button
                                className="checkout-btn primary"
                                onClick={nextStep}
                                disabled={!validateCurrentStep()}
                            >
                                Siguiente →
                            </button>
                        ) : (
                            <button
                                className="checkout-btn primary"
                                onClick={processOrder}
                                disabled={!validateCurrentStep() || loading}
                            >
                                {loading ? 'Procesando...' : 'Finalizar Compra'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Resumen del pedido */}
                <div className="order-summary">
                    <h3>Resumen del Pedido</h3>

                    <div className="currency-display">
                        <span>Moneda: {currencies[selectedCurrency].name}</span>
                    </div>

                    <div className="summary-items">
                        {productsToProcess.map(item => (
                            <div key={item.id} className="summary-item">
                                <span className="item-name">{item.name}</span>
                                <span className="item-qty">x{item.quantity}</span>
                                <span className="item-price">
                                    {formatPrice(item.price * item.quantity * currencies[selectedCurrency].rate, currencies[selectedCurrency].symbol)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="summary-totals">
                        <div className="summary-line">
                            <span>Subtotal:</span>
                            <span>{formatPrice(totals.subtotal, totals.symbol)}</span>
                        </div>

                        {selectedShipping && (
                            <div className="summary-line">
                                <span>Envío:</span>
                                <span>
                                    {totals.shipping === 0 ? 'Gratis' : formatPrice(totals.shipping, totals.symbol)}
                                </span>
                            </div>
                        )}

                        <div className="summary-line total">
                            <span>Total:</span>
                            <span>{formatPrice(totals.total, totals.symbol)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

/* 
Ejemplos de uso:

1. Compra desde carrito (múltiples productos):
<Checkout 
  cartItems={[
    { id: 1, name: 'Producto A', price: 15000, quantity: 2 },
    { id: 2, name: 'Producto B', price: 8500, quantity: 1 }
  ]} 
  purchaseType="cart"
  onBack={() => navigate('/cart')}
/>

2. Compra directa (un solo producto):
<Checkout 
  directProduct={{ id: 1, name: 'iPhone 14', price: 150000, quantity: 1 }}
  purchaseType="direct"
  onBack={() => navigate('/product/1')}
/>

Props esperadas:
- cartItems: Array de objetos con { id, name, price, quantity } (para compra desde carrito)
- directProduct: Objeto con { id, name, price, quantity } (para compra directa)
- purchaseType: 'cart' | 'direct' (tipo de compra)
- onBack: Función opcional para manejar el botón volver
*/