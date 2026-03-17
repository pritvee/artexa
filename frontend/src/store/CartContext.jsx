import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const fetchCart = async () => {
        if (!token) {
            setCart([]);
            return;
        }
        setLoading(true);
        try {
            const response = await api.get('/cart');
            setCart(response.data?.items || []);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCart([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchCart();
    }, [token]);

    const addToCart = async (productId, quantity, customizationDetails = null, uploadedPhotoId = null, previewImageUrl = null) => {
        try {
            const response = await api.post('/cart/items', {
                product_id: productId,
                quantity: quantity,
                customization_details: customizationDetails,
                uploaded_photo_id: uploadedPhotoId,
                preview_image_url: previewImageUrl
            });
            fetchCart();
            return response.data;
        } catch (error) {
            console.error("Error adding to cart:", error);
            throw error;
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            await api.patch(`/cart/items/${itemId}`, { quantity });
            fetchCart();
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const updateCartItem = async (itemId, updates) => {
        try {
            await api.patch(`/cart/items/${itemId}`, updates);
            fetchCart();
        } catch (error) {
            console.error("Error updating cart item:", error);
            throw error;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            await api.delete(`/cart/items/${itemId}`);
            fetchCart();
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    };

    const clearCart = async () => {
        try {
            await api.delete('/cart');
            setCart([]);
        } catch (error) {
            console.error("Error clearing cart:", error);
            setCart([]); // Still clear local state even if API fails
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, updateCartItem, removeFromCart, fetchCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
