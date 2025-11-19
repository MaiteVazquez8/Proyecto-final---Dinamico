import { useState, useEffect } from "react"
import axios from "axios"
import { AUTH_ENDPOINTS, SHOPPING_ENDPOINTS, getMockClientData } from "../../../config/api"
import Swal from 'sweetalert2'
import "./Checkout.css";

const Checkout = ({ onNavigate, currentUser, isAuthenticated, purchaseType = 'cart', onBack }) => {
    // Estados principales
    const [cartItems, setCartItems] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('');
    const [orderComplete, setOrderComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Argentina',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        bankAccount: '',
        accountHolder: ''
    });

    // Definir productos a procesar basado en el tipo de compra
    const productsToProcess = purchaseType === 'direct' ? [] : (cartItems || []).map(item => ({
        id: item.ID_Producto || item.id,
        name: item.Nombre || item.name || 'Producto',
        price: item.Precio || item.price || item.Total || 0,
        quantity: item.Cantidad || item.quantity || 1
    }));

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
        if (currentStep === 1) {
            // Only require firstName and email in the form; apellido and telefono will be fetched from DB on submit
            return formData.firstName && formData.email;
        }
        if (currentStep === 2) {
            if (!selectedShipping) return false;
            // Si es retiro en sucursal, no se requieren los campos de dirección
            // Pero los campos siempre estarán disponibles para guardar en la DB
            if (selectedShipping !== 'Retiro en Sucursal') {
                return formData.address && formData.city && formData.state && formData.zipCode;
            }
            // Para retiro en sucursal, los campos son opcionales pero pueden llenarse
            return true;
        }
        if (currentStep === 3) {
            if (!selectedPayment) return false;
            if (selectedPayment === 'Tarjeta de Crédito') {
                return formData.cardNumber && formData.cardName && formData.expiryDate && formData.cvv;
            }
            if (selectedPayment === 'Transferencia Bancaria') {
                return formData.bankAccount && formData.accountHolder;
            }
            return true;
        }
        return false;
    };

    // Navegar al siguiente paso
    const nextStep = () => {
        if (validateCurrentStep() && currentStep < 3) {
            setCurrentStep(prev => prev + 1);
            setMensaje('');
        } else {
            setMensaje('Por favor completa todos los campos requeridos');
        }
    };

    // Navegar al paso anterior
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            setMensaje('');
        }
    };

    // Función para formatear precio
    const formatPrice = (price, symbol = '$') => {
        if (!price) return `${symbol}0`;
        return `${symbol}${price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    // Monedas y cambio (simplificado)
    const [selectedCurrency, setSelectedCurrency] = useState('ARS');
    const currencies = {
        ARS: { name: 'Peso Argentino', symbol: '$', rate: 1 },
        USD: { name: 'Dólar Estadounidense', symbol: 'USD $', rate: 0.001 }
    };

    // Helper: try many possible paths to extract a field from currentUser
    const pick = (obj, ...paths) => {
        for (const p of paths) {
            if (!p) continue;
            // if path is array of keys, try nested
            if (Array.isArray(p)) {
                let v = obj;
                let ok = true;
                for (const k of p) {
                    if (v == null) { ok = false; break; }
                    v = v[k];
                }
                if (ok && v != null) return v;
            } else {
                if (obj == null) continue;
                if (obj[p] != null) return obj[p];
            }
        }
        return undefined;
    }

    const normalizeFromCurrentUser = (cu) => {
        if (!cu) return {};
        // If currentUser is an array or wraps user inside .user or .data, normalize to a single object
        let u = cu;
        if (Array.isArray(u) && u.length > 0) u = u[0];
        if (u.user) u = u.user;
        if (u.data) u = u.data;
        // if string that looks like JSON
        if (typeof u === 'string') {
            try { u = JSON.parse(u); } catch (e) { /* ignore */ }
        }

        return {
            firstName: pick(u, 'Nombre', 'nombre', 'firstName', 'FirstName', ['user','Nombre'], ['data','Nombre']) || '',
            lastName: pick(u, 'Apellido', 'apellido', 'lastName', ['user','Apellido'], ['data','Apellido']) || '',
            email: pick(u, 'Mail', 'mail', 'Email', 'email', ['user','Mail']) || '',
            phone: pick(u, 'Telefono', 'telefono', 'phone', ['user','Telefono']) || '',
            address: pick(u, 'Direccion', 'direccion', 'Address', ['user','Direccion']) || '',
            city: pick(u, 'Ciudad', 'ciudad', ['user','Ciudad']) || '',
            state: pick(u, 'Provincia', 'provincia', 'State', ['user','Provincia']) || '',
            zipCode: pick(u, 'Cod_Postal', 'CodPostal', 'cod_postal', 'zipCode', ['user','Cod_Postal']) || ''
        }
    }

    // Cargar carrito del servidor y prellenar datos del usuario
    useEffect(() => {
        if (isAuthenticated && currentUser) {
            loadCartFromServer();
            const normalized = normalizeFromCurrentUser(currentUser);
            // ensure phone is string
            if (normalized.phone != null) normalized.phone = String(normalized.phone);
            setFormData(prev => ({ ...prev, ...normalized }));
        }
    }, [isAuthenticated, currentUser])

    // Cargar datos completos del usuario para autocompletar
    const loadUserData = async () => {
        try {
            // Endpoint no disponible - usar datos simulados combinados con currentUser
            console.log('Endpoint GET_CLIENT no disponible - usando datos simulados')
            const mockData = getMockClientData(currentUser.DNI)
            const userData = { ...mockData, ...currentUser }
            
            // Parsear dirección si está disponible (puede incluir ciudad, provincia, etc.)
            const direccionCompleta = userData.Direccion || ''
            const partesDireccion = direccionCompleta.split(',').map(s => s.trim())
            
            setFormData(prev => ({
                ...prev,
                firstName: userData.Nombre || prev.firstName,
                lastName: userData.Apellido || prev.lastName,
                email: userData.Mail || prev.email,
                phone: userData.Telefono ? String(userData.Telefono) : prev.phone,
                address: partesDireccion[0] || prev.address,
                city: partesDireccion[1] || prev.city,
                state: partesDireccion[2] || prev.state,
                zipCode: userData.Cod_Postal ? String(userData.Cod_Postal) : prev.zipCode
            }))
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error)
            // Si falla, usar los datos básicos del currentUser
            if (currentUser) {
                setFormData(prev => ({
                    ...prev,
                    firstName: currentUser.Nombre || prev.firstName,
                    lastName: currentUser.Apellido || prev.lastName,
                    email: currentUser.Email || prev.email,
                    phone: currentUser.Telefono ? String(currentUser.Telefono) : prev.phone
                }))
            }
        }
    }

    const loadCartFromServer = async () => {
        try {
            setLoading(true)
            // GET /api/compras/carrito/:DNI
            const response = await axios.get(SHOPPING_ENDPOINTS.GET_CART(currentUser.DNI))
            setCartItems(response.data)
        } catch (error) {
            console.error('Error al cargar carrito:', error)
            setMensaje('Error al cargar el carrito')
        } finally {
            setLoading(false)
        }
    }

    // Si no está autenticado
    if (!isAuthenticated) {
        return (
            <div className="checkout-container">
                <div className="checkout-card">
                    <h2>Inicia sesión para continuar</h2>
                    <p>Necesitas estar autenticado para realizar una compra.</p>
                    <button
                        className="checkout-btn primary"
                        onClick={() => onNavigate('login')}
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    // Si no hay productos, mostrar mensaje
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="checkout-container">
                <div className="checkout-card">
                    <h2>Carrito Vacío</h2>
                    <p>No hay productos en tu carrito para procesar.</p>
                    <button
                        className="checkout-btn primary"
                        onClick={() => onNavigate('products')}
                    >
                        Volver a Comprar
                    </button>
                </div>
            </div>
        );
    }

    // Opciones de envío
    const shippingOptions = [
        { id: 'Retiro en Sucursal', name: 'Retiro en Sucursal', description: 'Retirá tu pedido en nuestras sucursales', cost: 0, time: 'Inmediato' },
        { id: 'Envío Estándar', name: 'Envío Estándar', description: 'Envío a domicilio', cost: 3000, time: '3-5 días hábiles' },
        { id: 'Envío Express', name: 'Envío Express', description: 'Envío rápido a domicilio', cost: 5000, time: '1-2 días hábiles' }
    ];

    // Opciones de pago
    const paymentOptions = [
        { id: 'Tarjeta de Crédito', name: 'Tarjeta de Crédito', description: 'Visa, Mastercard, American Express', recommended: true },
        { id: 'Transferencia Bancaria', name: 'Transferencia Bancaria', description: 'Transferencia o depósito bancario' },
        { id: 'Efectivo', name: 'Efectivo', description: 'Pago en efectivo al recibir' }
    ];

    // Obtener opciones de pago disponibles según la moneda
    const getAvailablePaymentOptions = () => {
        if (selectedCurrency === 'ARS') {
            return paymentOptions;
        }
        // Para otras monedas, solo PayPal (aunque no está implementado completamente)
        return paymentOptions.filter(opt => opt.id === 'Tarjeta de Crédito' || opt.id === 'Transferencia Bancaria');
    };

    // Calcular totales
    const calculateTotals = () => {
        // Compute in base currency (ARS) first, then apply selected currency rate for display
        const rate = (currencies[selectedCurrency] && currencies[selectedCurrency].rate) || 1;
        // If cart rows may represent single units, try to respect quantity fields when present
        const subtotalARS = cartItems.reduce((sum, item) => {
            const price = (item.Total ?? item.Precio ?? item.price ?? 0);
            const qty = (item.Cantidad ?? item.quantity ?? 1);
            return sum + (price * qty);
        }, 0);
    const shippingCostARS = !selectedShipping ? 0 : (selectedShipping === 'Retiro en Sucursal' ? 0 : (selectedShipping === 'Envío Express' ? 5000 : 3000));
        const subtotal = Math.round(subtotalARS * rate);
        const shipping = shippingCostARS === 0 ? 0 : Math.round(shippingCostARS * rate);
        const total = subtotal + shipping;
        return {
            subtotal,
            shipping,
            total,
            symbol: currencies[selectedCurrency].symbol,
            // expose raw ARS for debugging if needed
            _debug_rawSubtotalARS: subtotalARS,
            _debug_shippingARS: shippingCostARS
        };
    };

    // Validar formulario
    const validateForm = () => {
        return selectedShipping && selectedPayment;
    };

    // Procesar compra
    const processOrder = async () => {
        if (!validateForm()) {
            setMensaje('Por favor completa todos los campos requeridos');
            return;
        }

        setLoading(true);
        setMensaje('');

        try {
                // Use data from currentUser (normalized) to populate Apellido and Telefono
                const normalizedClient = normalizeFromCurrentUser(currentUser);
                const apellidoToSend = normalizedClient.lastName || formData.lastName || '';
                const telefonoToSend = normalizedClient.phone ? String(normalizedClient.phone) : (formData.phone || '');
            // Preparar datos de pago según el método seleccionado
            let datosPago = {};
            if (selectedPayment === 'Tarjeta de Crédito') {
                datosPago = {
                    tipo: 'tarjeta',
                    ultimosDigitos: formData.cardNumber.slice(-4),
                    nombre: formData.cardName
                };
            } else if (selectedPayment === 'Transferencia Bancaria') {
                datosPago = {
                    tipo: 'transferencia',
                    cbu: formData.bankAccount,
                    titular: formData.accountHolder
                };
            } else {
                datosPago = {
                    tipo: 'efectivo'
                };
            }

            // POST /api/compras/compra (Apellido y Telefono se toman desde DB si fue posible)
            const response = await axios.post(SHOPPING_ENDPOINTS.MAKE_PURCHASE, {
                DNI: currentUser.DNI,
                Tipo_Envio: selectedShipping,
                Metodo_Pago: selectedPayment,
                // Datos del formulario
                Nombre: formData.firstName,
                Apellido: apellidoToSend,
                Email: formData.email,
                Telefono: telefonoToSend,
                Direccion: formData.address,
                Ciudad: formData.city,
                Provincia: formData.state,
                CodigoPostal: formData.zipCode,
                Pais: formData.country,
                DatosPago: datosPago
            });

            setMensaje(response.data.Mensaje);
            setOrderComplete(true);

            // Notify other components/tabs that a purchase completed so they can refresh stock
            try {
                const ts = Date.now();
                // global var for same-tab consumers
                window.__lastPurchaseTime = ts;
                // storage for other tabs
                localStorage.setItem('lastPurchase', String(ts));
                // dispatch event with list of product ids processed
                const productIds = productsToProcess.map(p => p.id);
                window.dispatchEvent(new CustomEvent('purchaseCompleted', { detail: { time: ts, productIds } }));
            } catch (e) {
                // ignore
            }
        } catch (error) {
            console.error('Error al procesar compra:', error);
            if (error.response?.data?.Error) {
                setMensaje(error.response.data.Error);
            } else {
                setMensaje('Error al procesar la compra');
            }
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();

    if (orderComplete) {
        return (
            <div className="checkout-container">
                <div className="success-message">
                    <div className="success-icon">✓</div>
                    <h2>¡Compra Realizada con Éxito!</h2>
                    <p>Tu pedido ha sido procesado correctamente</p>
                    <div className="order-details">
                        <p><strong>Número de Orden:</strong><span>#ORD-{Date.now()}</span></p>
                        <p><strong>Total:</strong><span>{formatPrice(totals.total, totals.symbol)}</span></p>
                        <p><strong>Método de Pago:</strong><span>{paymentOptions.find(p => p.id === selectedPayment)?.name}</span></p>
                        <p><strong>Envío:</strong><span>{shippingOptions.find(s => s.id === selectedShipping)?.name}</span></p>
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
                <button className="back-btn" onClick={() => onNavigate('cart')}>
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
                            <h3 className="currency-label">Moneda</h3>
                            <div className="currency-options">
                                {Object.entries(currencies).map(([code, currency]) => (
                                    <button
                                        key={code}
                                        type="button"
                                        className={`currency-option ${selectedCurrency === code ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedCurrency(code);
                                            setSelectedPayment(''); // Reset payment when currency changes
                                        }}
                                    >
                                        <div className="currency-symbol">{currency.symbol}</div>
                                        <div className="currency-info">
                                            <div className="currency-name">{currency.name}</div>
                                            <div className="currency-code">{code}</div>
                                        </div>
                                        {selectedCurrency === code && (
                                            <div className="currency-check">✓</div>
                                        )}
                                    </button>
                                ))}
                            </div>
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
                                <div className="form-group full-width">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
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

                            {/* Dirección de envío - Siempre visible para guardar en DB del cliente */}
                            {selectedShipping && (
                                <div className="address-form">
                                    <h3>Dirección {selectedShipping === 'Retiro en Sucursal' ? '(Opcional - Se guardará en tu perfil)' : 'de Envío *'}</h3>
                                    {selectedShipping === 'Retiro en Sucursal' && (
                                        <p className="address-info">
                                            Puedes completar tu dirección para guardarla en tu perfil. No es obligatorio para retiro en sucursal.
                                        </p>
                                    )}
                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label>Dirección {selectedShipping !== 'Retiro en Sucursal' ? '*' : ''}</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="Calle y número"
                                                required={selectedShipping !== 'Retiro en Sucursal'}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Ciudad {selectedShipping !== 'Retiro en Sucursal' ? '*' : ''}</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required={selectedShipping !== 'Retiro en Sucursal'}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Provincia {selectedShipping !== 'Retiro en Sucursal' ? '*' : ''}</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                required={selectedShipping !== 'Retiro en Sucursal'}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Código Postal {selectedShipping !== 'Retiro en Sucursal' ? '*' : ''}</label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleInputChange}
                                                required={selectedShipping !== 'Retiro en Sucursal'}
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
                                    {selectedPayment === 'Tarjeta de Crédito' && (
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

                                    {selectedPayment === 'Transferencia Bancaria' && (
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

                                    {selectedPayment === 'Efectivo' && (
                                        <div className="paypal-info">
                                            <p>El pago se realizará en efectivo al recibir el producto. Asegúrate de tener el monto exacto.</p>
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