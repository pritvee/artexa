import React from 'react';
import ReactDom from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './store/AuthContext';
import { AppThemeProvider } from './store/ThemeContext';
import { ProductProvider } from './store/ProductContext';
import { OrderProvider } from './store/OrderContext';
import { CartProvider } from './store/CartContext';

ReactDom.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter
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
        </BrowserRouter>
    </React.StrictMode>
);

