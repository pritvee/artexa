import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

export const ORDER_STATUSES = [
    { key: 'placed', label: 'Order Placed', color: 'default' },
    { key: 'processing', label: 'Processing', color: 'warning' },
    { key: 'printed', label: 'Printed', color: 'info' },
    { key: 'shipped', label: 'Shipped', color: 'primary' },
    { key: 'out_for_delivery', label: 'Out for Delivery', color: 'secondary' },
    { key: 'delivered', label: 'Delivered', color: 'success' },
];

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dashboardStats, setDashboardStats] = useState(null);
    const { token, user } = useAuth();

    const fetchMyOrders = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await api.get('/orders/my-orders');
            if (Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (id) => {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching order details:", error);
            throw error;
        }
    };

    const createOrder = async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            fetchMyOrders();
            return response.data;
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    };

    const verifyPayment = async (paymentData) => {
        try {
            const response = await api.post('/orders/verify-payment', paymentData);
            fetchMyOrders();
            return response.data;
        } catch (error) {
            console.error("Error verifying payment:", error);
            throw error;
        }
    };

    // Admin Methods
    const fetchAllOrders = async (page = 1, limit = 10, showDeleted = false) => {
        if (user?.role !== 'admin') return;
        setLoading(true);
        try {
            const response = await api.get('/admin/orders', { params: { page, limit, show_deleted: showDeleted } });
            return response.data;
        } catch (error) {
            console.error("Error fetching all orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        // Optimistic update for UI smoothness
        const originalOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

        try {
            await api.patch(`/admin/orders/${orderId}/status`, { status });
            // No need for a full refresh if optimistic update succeeded
        } catch (error) {
            setOrders(originalOrders);
            console.error("Error updating order status:", error);
            throw error;
        }
    };

    const updateOrderTracking = async (orderId, trackingData) => {
        // Optimistic update
        const originalOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...trackingData } : o));

        try {
            await api.patch(`/delivery/${orderId}/update-tracking`, null, { params: trackingData });
        } catch (error) {
            setOrders(originalOrders);
            console.error("Error updating tracking:", error);
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            await api.delete(`/admin/orders/${orderId}`);
            return true;
        } catch (error) {
            console.error("Error deleting order:", error);
            return false;
        }
    };

    const recoverOrder = async (orderId) => {
        try {
            await api.post(`/admin/orders/${orderId}/recover`);
            return true;
        } catch (error) {
            console.error("Error recovering order:", error);
            return false;
        }
    };

    const fetchDashboardStats = async () => {
        if (user?.role !== 'admin') return;
        try {
            const response = await api.get('/admin/dashboard-stats');
            setDashboardStats(response.data);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    };

    useEffect(() => {
        fetchMyOrders();
        if (user?.role === 'admin') {
            fetchDashboardStats();
        }
    }, [token, user]);

    return (
        <OrderContext.Provider value={{
            orders,
            loading,
            dashboardStats,
            fetchMyOrders,
            fetchOrderDetails,
            createOrder,
            verifyPayment,
            fetchAllOrders,
            updateOrderStatus,
            updateOrderTracking,
            deleteOrder,
            recoverOrder,
            fetchDashboardStats
        }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => useContext(OrderContext);
