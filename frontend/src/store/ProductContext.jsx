import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../api/axios';

const ProductContext = createContext();

const categoryMap = {
    'frames': 1, 'mugs': 2, 'hampers': 3, 'gifts': 4, 'giftbox': 4, 'gift box': 4, 'gift-box': 4, 'gift_box': 4
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10
    });
    const [categories, setCategories] = useState([]);

    // Track latest pagination in a ref to keep context functions stable
    // without using pagination.page in their dependency arrays.
    const paginationRef = useRef(pagination);
    useEffect(() => {
        paginationRef.current = pagination;
    }, [pagination]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/products/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, [api]);

    const fetchProducts = useCallback(async (page = 1, limit = 10, categoryId = null, search = '', onHome = null, onShop = null) => {
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
    }, [api]);

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


    const addProduct = useCallback(async (newProduct) => {
        try {
            const response = await api.post('/admin/products', newProduct);
            // Always refresh the list using the latest stable page from ref
            fetchProducts(paginationRef.current.page);
            return response.data;
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    }, [api, fetchProducts]);

    const updateProduct = useCallback(async (id, updatedProduct) => {
        try {
            await api.patch(`/admin/products/${id}`, updatedProduct);
            fetchProducts(paginationRef.current.page);
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    }, [api, fetchProducts]);

    const deleteProduct = useCallback(async (id) => {
        try {
            await api.delete(`/admin/products/${id}`);
            fetchProducts(paginationRef.current.page);
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    }, [api, fetchProducts]);

    const contextValue = useMemo(() => ({
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
    }), [
        products, 
        loading, 
        pagination, 
        categories, 
        categoryMap,
        fetchProducts, 
        addProduct, 
        updateProduct, 
        deleteProduct, 
        fetchCategories
    ]);

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);

