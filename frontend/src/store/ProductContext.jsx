import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10
    });
    const [categories, setCategories] = useState([]);

    const categoryMap = {
        'frames': 1, 'mugs': 2, 'hampers': 3, 'gifts': 4, 'giftbox': 4, 'gift box': 4
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProducts = async (page = 1, limit = 10, categoryId = null, search = '', onHome = null, onShop = null) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (categoryId) params.category_id = categoryId;
            if (search) params.search = search;
            if (onHome !== null) params.on_home = onHome;
            if (onShop !== null) params.on_shop = onShop;

            const response = await api.get('/products', { params });
            const items = response.data?.items || [];
            setProducts(items);
            
            // Only cache all products for persistence fallback
            if (!categoryId && !search && onHome === null && onShop === null) {
                localStorage.setItem('products', JSON.stringify(items));
            }

            setPagination({
                total: response.data?.total || 0,
                page: response.data?.page || 1,
                limit: response.data?.limit || 10
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            // Fallback to local storage if available
            const saved = localStorage.getItem('products');
            if (saved) {
                setProducts(JSON.parse(saved));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial load from local storage for instant UI
        const saved = localStorage.getItem('products');
        if (saved) {
            try {
                setProducts(JSON.parse(saved));
                setLoading(false);
            } catch (e) {
                console.error("Failed to parse saved products", e);
                localStorage.removeItem('products');
            }
        }
        
        fetchProducts();
        fetchCategories();
    }, []);


    const addProduct = async (newProduct) => {
        try {
            // Usually we'd upload images first or use form-data
            const response = await api.post('/admin/products', newProduct);
            fetchProducts(pagination.page);
            return response.data;
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    };

    const updateProduct = async (id, updatedProduct) => {
        try {
            await api.patch(`/admin/products/${id}`, updatedProduct);
            fetchProducts(pagination.page);
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    };

    const deleteProduct = async (id) => {
        try {
            await api.delete(`/admin/products/${id}`);
            fetchProducts(pagination.page);
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    };

    return (
        <ProductContext.Provider value={{
            products,
            loading,
            pagination,
            fetchProducts,
            addProduct,
            updateProduct,
            deleteProduct,
            categories,
            categoryMap,
            fetchCategories
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);

