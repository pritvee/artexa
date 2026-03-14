import React from 'react';
import ReactDom from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './store/AuthContext';
import { AppThemeProvider } from './store/ThemeContext';
import { ProductProvider } from './store/ProductContext';
import { OrderProvider } from './store/OrderContext';
import { CartProvider } from './store/CartContext';

ReactDom.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HashRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
            }}
        >
            <AppThemeProvider>
                <AuthProvider>
                    <ProductProvider>
                        <CartProvider>
                            <OrderProvider>
                                <App />
                            </OrderProvider>
                        </CartProvider>
                    </ProductProvider>
                </AuthProvider>
            </AppThemeProvider>
        </HashRouter>
    </React.StrictMode>
);

