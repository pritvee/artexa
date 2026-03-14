import React, { useState } from 'react';
import {
    Container, Typography, Button, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    Box, Dialog, DialogTitle, DialogContent, TextField, MenuItem,
    DialogActions, Avatar, Chip, Tooltip, Alert, Checkbox, FormControlLabel,
    Tabs, Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useProducts } from '../../store/ProductContext';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../api/axios';

// Categories will be fetched from the context

const PRESET_SIZES = [
    { label: "4x4 – Mini", value: "4x4 – Mini", width: 4, height: 4, price: 99, enabled: true, isPreset: true },
    { label: "5x5 – Mini", value: "5x5 – Mini", width: 5, height: 5, price: 129, enabled: true, isPreset: true },
    { label: "8x6 – A5", value: "8x6 – A5", width: 8, height: 6, price: 250, enabled: true, isPreset: true },
    { label: "12x8 – A4", value: "12x8 – A4", width: 12, height: 8, price: 380, enabled: true, isPreset: true },
    { label: "12x18 – A3", value: "12x18 – A3", width: 12, height: 18, price: 680, enabled: true, isPreset: true },
    { label: "16.5x23.4 – A2", value: "16.5x23.4 – A2", width: 16.5, height: 23.4, price: 1499, enabled: true, isPreset: true }
];

const PRESET_STYLES = [
    { label: "Canvas Frame", type: "canvas", enabled: true, isPreset: true },
    { label: "Wooden Frame", type: "wooden", enabled: true, isPreset: true },
    { label: "Normal Frame", type: "normal", enabled: true, isPreset: true }
];

const PRESET_MUG_TYPES = [
    { label: 'Classic Mug (11oz)', value: 'Classic Mug (11oz)', price: 0, enabled: true, isPreset: true },
    { label: 'Large Mug (15oz)', value: 'Large Mug (15oz)', price: 3, enabled: true, isPreset: true },
    { label: 'Travel Mug', value: 'Travel Mug', price: 8, enabled: true, isPreset: true }
];

const PRESET_MUG_COLORS = [
    { label: 'White', value: 'White', hex: '#f5f5f0', textColor: '#333', enabled: true, isPreset: true },
    { label: 'Black', value: 'Black', hex: '#222222', textColor: '#fff', enabled: true, isPreset: true },
    { label: 'Red Inside', value: 'Red Inside', hex: '#cc3333', textColor: '#fff', enabled: true, isPreset: true },
    { label: 'Blue Inside', value: 'Blue Inside', hex: '#3366cc', textColor: '#fff', enabled: true, isPreset: true }
];

const PRESET_GIFTBOX_TYPES = [
    { label: 'Small Box', value: 'small', price: 199, icon: '📦', enabled: true, isPreset: true },
    { label: 'Medium Box', value: 'medium', price: 349, icon: '📦', enabled: true, isPreset: true },
    { label: 'Large Box', value: 'large', price: 549, icon: '📦', enabled: true, isPreset: true },
    { label: 'Premium Magnetic Lid', value: 'magnetic', price: 899, icon: '🧲', enabled: true, isPreset: true },
    { label: 'Drawer Style Box', value: 'drawer', price: 799, icon: '🗄️', enabled: true, isPreset: true },
    { label: 'Foldable Gift Box', value: 'foldable', price: 699, icon: '💌', enabled: true, isPreset: true },
];

const PRESET_GIFTBOX_MATERIALS = [
    { label: 'Kraft Paper', value: 'kraft', price: 0, enabled: true, isPreset: true },
    { label: 'Premium Matte', value: 'matte', price: 50, enabled: true, isPreset: true },
    { label: 'Glossy Finish', value: 'glossy', price: 50, enabled: true, isPreset: true },
    { label: 'Velvet Texture', value: 'velvet', price: 150, enabled: true, isPreset: true },
    { label: 'Luxury Gold Foil', value: 'gold_foil', price: 200, enabled: true, isPreset: true }
];

const PRESET_GIFTBOX_DECORATIONS = [
    { type: 'ribbon_cross', label: 'Cross Ribbon', category: 'Ribbon', price: 60, emoji: '🎀', enabled: true, isPreset: true },
    { type: 'ribbon_vert', label: 'Vertical Ribbon', category: 'Ribbon', price: 40, emoji: '🎀', enabled: true, isPreset: true },
    { type: 'ribbon_horiz', label: 'Horizontal Ribbon', category: 'Ribbon', price: 40, emoji: '🎀', enabled: true, isPreset: true },
    { type: 'sticker_bday', label: 'Birthday Sticker', category: 'Sticker', price: 20, emoji: '🎂', enabled: true, isPreset: true },
    { type: 'sticker_love', label: 'Love Sticker', category: 'Sticker', price: 20, emoji: '❤️', enabled: true, isPreset: true },
    { type: 'sticker_ty', label: 'Thank You Sticker', category: 'Sticker', price: 20, emoji: '🙏', enabled: true, isPreset: true },
    { type: 'flower_topper', label: 'Flower Topper', category: 'Top Decor', price: 99, emoji: '🌸', enabled: true, isPreset: true },
    { type: 'wax_seal', label: 'Wax Seal', category: 'Top Decor', price: 49, emoji: '🏮', enabled: true, isPreset: true },
    { type: 'tag_hanging', label: 'Hanging Tag', category: 'Tags', price: 35, emoji: '🏷️', enabled: true, isPreset: true }
];

const PRESET_GIFTBOX_ITEMS = [
    { type: 'crystal_cube', name: 'Luxury Magic Gift Box', price: 499, emoji: '🎁', enabled: true, isPreset: true },
];

const PRESET_HAMPER_SIZES = [
    { label: 'Small', value: 'small', maxChoc: 5, price: 249, emoji: '🧺', desc: 'Up to 5 chocolates', enabled: true, isPreset: true },
    { label: 'Medium', value: 'medium', maxChoc: 10, price: 449, emoji: '🎁', desc: 'Up to 10 chocolates', enabled: true, isPreset: true },
    { label: 'Premium', value: 'premium', maxChoc: 20, price: 1099, emoji: '💝', desc: 'Up to 20 chocolates', enabled: true, isPreset: true },
];

const PRESET_HAMPER_CONTAINERS = [
    { label: 'Wooden Box', value: 'wooden_box', emoji: '🪵', color: '#6D4C22', enabled: true, isPreset: true },
    { label: 'Luxury Box', value: 'luxury_box', emoji: '📦', color: '#1a1a2e', enabled: true, isPreset: true },
    { label: 'Gift Basket', value: 'gift_basket', emoji: '🧺', color: '#8B6914', enabled: true, isPreset: true },
];

const PRESET_HAMPER_CHOCOLATES = [
    { type: 'dairymilk', name: 'Dairy Milk', emoji: '🍫', price: 60, color: '#6A1B9A', enabled: true, isPreset: true },
    { type: 'kitkat', name: 'KitKat', emoji: '🍬', price: 45, color: '#C62828', enabled: true, isPreset: true },
    { type: 'ferrero', name: 'Ferrero Rocher', emoji: '🟡', price: 110, color: '#F9A825', enabled: true, isPreset: true },
    { type: 'snickers', name: 'Snickers', emoji: '🍫', price: 55, color: '#4E342E', enabled: true, isPreset: true },
    { type: 'lindt', name: 'Lindt', emoji: '🔴', price: 130, color: '#AD1457', enabled: true, isPreset: true },
    { type: 'toblerone', name: 'Toblerone', emoji: '🔺', price: 180, color: '#E65100', enabled: true, isPreset: true },
];


const emptyForm = {
    name: '', category_id: 1, price: '', stock: '',
    description: '', image_url: '', customization_type: 'Frame',
    is_on_home: false, is_on_shop: true,
    secondary_images: [],
    customization_schema: { 
        sizes: [...PRESET_SIZES], 
        styles: [...PRESET_STYLES], 
        mugTypes: [...PRESET_MUG_TYPES], 
        mugColors: [...PRESET_MUG_COLORS],
        boxTypes: [...PRESET_GIFTBOX_TYPES],
        materials: [...PRESET_GIFTBOX_MATERIALS],
        decorations: [...PRESET_GIFTBOX_DECORATIONS],
        items: [...PRESET_GIFTBOX_ITEMS],
        hamperSizes: [...PRESET_HAMPER_SIZES],
        hamperContainers: [...PRESET_HAMPER_CONTAINERS],
        hamperChocolates: [...PRESET_HAMPER_CHOCOLATES]
    }
};

const ManageProducts = () => {
    const { products, addProduct, updateProduct, deleteProduct, fetchProducts, categories } = useProducts();
    const [open, setOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imagePreview, setImagePreview] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [uploading, setUploading] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const filteredProducts = (products || []).filter(p => {
        if (!p) return false;
        if (tabValue === 1) return !!p.is_on_home;
        if (tabValue === 2) return !!p.is_on_shop;
        return true;
    });

    const openAdd = () => {
        setEditTarget(null);
        setForm(emptyForm);
        setImagePreview('');
        setOpen(true);
    };

    const openEdit = (product) => {
        setEditTarget(product);
        const savedSchema = product.customization_schema || {};

        let sizes = savedSchema.sizes || [...PRESET_SIZES];
        if (sizes.length === 0) sizes = [...PRESET_SIZES];
        let styles = savedSchema.styles || [...PRESET_STYLES];
        if (styles.length === 0) styles = [...PRESET_STYLES];

        let mugTypes = savedSchema.mugTypes || [...PRESET_MUG_TYPES];
        if (mugTypes.length === 0) mugTypes = [...PRESET_MUG_TYPES];
        let mugColors = savedSchema.mugColors || [...PRESET_MUG_COLORS];
        if (mugColors.length === 0) mugColors = [...PRESET_MUG_COLORS];

        let boxTypes = savedSchema.boxTypes || [...PRESET_GIFTBOX_TYPES];
        if (boxTypes.length === 0) boxTypes = [...PRESET_GIFTBOX_TYPES];
        let materials = savedSchema.materials || [...PRESET_GIFTBOX_MATERIALS];
        if (materials.length === 0) materials = [...PRESET_GIFTBOX_MATERIALS];
        let decorations = savedSchema.decorations || [...PRESET_GIFTBOX_DECORATIONS];
        if (decorations.length === 0) decorations = [...PRESET_GIFTBOX_DECORATIONS];
        let items = savedSchema.items || [...PRESET_GIFTBOX_ITEMS];
        if (items.length === 0) items = [...PRESET_GIFTBOX_ITEMS];
        
        let hamperSizes = savedSchema.hamperSizes || [...PRESET_HAMPER_SIZES];
        if (hamperSizes.length === 0) hamperSizes = [...PRESET_HAMPER_SIZES];
        let hamperContainers = savedSchema.hamperContainers || [...PRESET_HAMPER_CONTAINERS];
        if (hamperContainers.length === 0) hamperContainers = [...PRESET_HAMPER_CONTAINERS];
        let hamperChocolates = savedSchema.hamperChocolates || [...PRESET_HAMPER_CHOCOLATES];
        if (hamperChocolates.length === 0) hamperChocolates = [...PRESET_HAMPER_CHOCOLATES];

        // Ensure missing presets are appended 
        const sizeLabels = sizes.map(s => s.label);
        PRESET_SIZES.forEach(pz => {
            if (!sizeLabels.includes(pz.label)) sizes.push({ ...pz, enabled: false });
        });

        const styleLabels = styles.map(s => s.label);
        PRESET_STYLES.forEach(ps => {
            if (!styleLabels.includes(ps.label)) styles.push({ ...ps, enabled: false });
        });

        const mugTypeLabels = mugTypes.map(s => s.label);
        PRESET_MUG_TYPES.forEach(mt => {
            if (!mugTypeLabels.includes(mt.label)) mugTypes.push({ ...mt, enabled: false });
        });

        const mugColorLabels = mugColors.map(s => s.label);
        PRESET_MUG_COLORS.forEach(mc => {
            if (!mugColorLabels.includes(mc.label)) mugColors.push({ ...mc, enabled: false });
        });

        const boxTypeLabels = boxTypes.map(s => s.label);
        PRESET_GIFTBOX_TYPES.forEach(bt => {
            if (!boxTypeLabels.includes(bt.label)) boxTypes.push({ ...bt, enabled: false });
        });

        const materialLabels = materials.map(s => s.label);
        PRESET_GIFTBOX_MATERIALS.forEach(m => {
            if (!materialLabels.includes(m.label)) materials.push({ ...m, enabled: false });
        });

        const decorationLabels = decorations.map(s => s.label);
        PRESET_GIFTBOX_DECORATIONS.forEach(d => {
            if (!decorationLabels.includes(d.label)) decorations.push({ ...d, enabled: false });
        });

        const itemLabels = items.map(s => s.name);
        PRESET_GIFTBOX_ITEMS.forEach(i => {
            if (!itemLabels.includes(i.name)) items.push({ ...i, enabled: false });
        });

        const hamperSizeLabels = hamperSizes.map(s => s.label);
        PRESET_HAMPER_SIZES.forEach(s => {
            if (!hamperSizeLabels.includes(s.label)) hamperSizes.push({ ...s, enabled: false });
        });

        const hamperContainerLabels = hamperContainers.map(s => s.label);
        PRESET_HAMPER_CONTAINERS.forEach(s => {
            if (!hamperContainerLabels.includes(s.label)) hamperContainers.push({ ...s, enabled: false });
        });

        const hamperChocLabels = hamperChocolates.map(s => s.name);
        PRESET_HAMPER_CHOCOLATES.forEach(s => {
            if (!hamperChocLabels.includes(s.name)) hamperChocolates.push({ ...s, enabled: false });
        });

        setForm({
            name: product.name,
            category_id: product.category_id,
            price: product.price,
            stock: product.stock,
            description: product.description || '',
            image_url: product.image_url,
            customization_type: product.customization_type || 'Custom',
            is_on_home: product.is_on_home || false,
            is_on_shop: product.is_on_shop !== undefined ? product.is_on_shop : true,
            secondary_images: product.secondary_images || [],
            customization_schema: { 
                sizes, styles, mugTypes, mugColors, 
                boxTypes, materials, decorations, items,
                hamperSizes, hamperContainers, hamperChocolates 
            }
        });
        setImagePreview(product.image_url);
        setOpen(true);
    };

    const handleSchemaChange = (category, index, field, value) => {
        setForm(prev => {
            const newSchema = { ...prev.customization_schema };
            const items = [...(newSchema[category] || [])];
            items[index] = { ...items[index] };

            if (field === 'price' || field === 'width' || field === 'height') {
                items[index][field] = parseFloat(value) || 0;
            } else if (field === 'enabled') {
                items[index][field] = value;
            } else {
                items[index][field] = value;
            }

            if (field === 'label') items[index].value = value;

            newSchema[category] = items;
            return { ...prev, customization_schema: newSchema };
        });
    };

    const addSchemaItem = (category, defaultItem) => {
        setForm(prev => {
            const newSchema = { ...prev.customization_schema };
            newSchema[category] = [...(newSchema[category] || []), defaultItem];
            return { ...prev, customization_schema: newSchema };
        });
    };

    const removeSchemaItem = (category, index) => {
        setForm(prev => {
            const newSchema = { ...prev.customization_schema };
            newSchema[category] = (newSchema[category] || []).filter((_, i) => i !== index);
            return { ...prev, customization_schema: newSchema };
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/products/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imgUrl = res.data.image_url || res.data.url;
            setImagePreview(imgUrl);
            setForm(prev => ({ ...prev, image_url: imgUrl }));
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    const handleSecondaryFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const newImages = [...form.secondary_images];
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                const res = await api.post('/products/upload-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                newImages.push(res.data.image_url || res.data.url);
            }
            setForm(prev => ({ ...prev, secondary_images: newImages }));
        } catch (err) {
            console.error("Secondary upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    const removeSecondaryImage = (idx) => {
        setForm(prev => ({
            ...prev,
            secondary_images: prev.secondary_images.filter((_, i) => i !== idx)
        }));
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in. Please login again.");
            return;
        }

        if (!form.name || form.price === '' || form.price === undefined || !form.category_id) {
            alert("Please fill required fields (Name, Price, Category).");
            return;
        }

        const payload = {
            ...form,
            price: parseFloat(form.price),
            stock: parseInt(form.stock) || 0,
            customization_schema: form.customization_schema
        };

        try {
            if (editTarget) {
                await updateProduct(editTarget.id, payload);
                setSuccessMsg(`"${form.name}" updated!`);
            } else {
                await addProduct(payload);
                setSuccessMsg(`"${form.name}" added!`);
            }
            setOpen(false);
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            console.error("Save failed", err);
            const errMsg = err.response?.data?.detail || err.message || "Unknown error occurred";
            alert("Save failed: " + (typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg));
        }
    };


    const handleDelete = (id, name) => {
        if (window.confirm(`Delete "${name}"?`)) {
            deleteProduct(id);
            setSuccessMsg(`"${name}" removed from dashboard.`);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>Manage Products</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
                    Add Product
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="All Products" />
                    <Tab label="Home Screen" />
                    <Tab label="Shopping Page" />
                </Tabs>
            </Box>

            <AnimatePresence>
                {successMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                            {successMsg}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(filteredProducts || []).map((p) => (
                            <TableRow key={p?.id || Math.random()} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                <TableCell>
                                    <Avatar
                                        src={p?.image_url}
                                        variant="rounded"
                                        sx={{ width: 56, height: 56, border: '1px solid', borderColor: 'divider' }}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{p?.name || 'Unnamed'}</TableCell>
                                <TableCell>
                                    <Chip label={categories.find(c => c.id === p?.category_id)?.name || 'Misc'} size="small" color="primary" variant="outlined" />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    ₹{parseFloat(p?.price || 0).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={`${p?.stock || 0} in stock`}
                                        size="small"
                                        color={(p?.stock || 0) > 10 ? 'success' : 'warning'}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Edit"><IconButton color="primary" onClick={() => openEdit(p)}><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(p?.id, p?.name)}><DeleteIcon /></IconButton></Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add / Edit Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle component="div" sx={{ fontWeight: 700, pb: 1 }}>
                    {editTarget ? `Edit: ${editTarget.name}` : 'Add New Product'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        {imagePreview && (
                            <Box sx={{ borderRadius: 2, overflow: 'hidden', height: 180 }}>
                                <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                        )}
                        <Button variant="outlined" component="label" fullWidth disabled={uploading}>
                            {uploading ? 'Uploading...' : (imagePreview ? 'Change Product Image' : 'Upload Product Image')}
                            <input type="file" accept="image/png, image/jpeg, image/webp" hidden onChange={handleFileUpload} />
                        </Button>

                        {/* Secondary Images Section */}
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Additional Product Images</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                {form.secondary_images.map((img, idx) => (
                                    <Box key={idx} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                                        <img src={img} alt={`secondary-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <IconButton 
                                            size="small" 
                                            sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'white' } }}
                                            onClick={() => removeSecondaryImage(idx)}
                                        >
                                            <DeleteIcon fontSize="small" color="error" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                            <Button variant="outlined" component="label" fullWidth size="small" disabled={uploading} startIcon={<AddIcon />}>
                                {uploading ? 'Adding...' : 'Add Additional Images'}
                                <input type="file" multiple accept="image/png, image/jpeg, image/webp" hidden onChange={handleSecondaryFileUpload} />
                            </Button>
                        </Box>

                        <TextField
                            fullWidth label="Product Name" required
                            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        />
                        <TextField
                            select fullWidth label="Category" required
                            value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                        >
                            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </TextField>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth label="Price (₹)" type="number" required
                                value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                            <TextField
                                fullWidth label="Stock Qty" type="number"
                                value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                                inputProps={{ min: 0 }}
                            />
                        </Box>
                        <TextField
                            fullWidth multiline rows={3} label="Description"
                            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        />
                        <TextField
                            select fullWidth label="Customization Type"
                            value={form.customization_type} onChange={e => setForm(p => ({ ...p, customization_type: e.target.value }))}
                            helperText="Determines which editor the customer sees (e.g., 3D Mug vs 3D Frame)"
                        >
                            <MenuItem value="None">None (Standard Product)</MenuItem>
                            <MenuItem value="Frame">Photo Frame (3D)</MenuItem>
                            <MenuItem value="Mug">Ceramic Mug (3D)</MenuItem>
                            <MenuItem value="GiftBox">Gift Box (3D)</MenuItem>
                            <MenuItem value="Hamper">Chocolate Hamper (3D)</MenuItem>
                            <MenuItem value="Custom">Custom (Basic Upload)</MenuItem>
                        </TextField>

                        <Box sx={{ display: 'flex', gap: 4 }}>
                            <FormControlLabel
                                control={<Checkbox checked={form.is_on_home} onChange={e => setForm(p => ({ ...p, is_on_home: e.target.checked }))} />}
                                label="Display on Home Screen"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={form.is_on_shop} onChange={e => setForm(p => ({ ...p, is_on_shop: e.target.checked }))} />}
                                label="Display on Shopping Page"
                            />
                        </Box>

                        {/* Dynamic Schema Settings */}
                        {form.customization_type === 'Frame' && (
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Frame Customize Options</Typography>

                                {/* Sizes */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Sizes</Typography>
                                    {(form.customization_schema?.sizes || []).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('sizes', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Label (e.g. 4x4)" value={item.label} onChange={e => handleSchemaChange('sizes', idx, 'label', e.target.value)} disabled={item.isPreset} />
                                            <TextField size="small" type="number" label="Width (in)" value={item.width} onChange={e => handleSchemaChange('sizes', idx, 'width', e.target.value)} disabled={item.isPreset} sx={{ width: 80 }} />
                                            <TextField size="small" type="number" label="Height (in)" value={item.height} onChange={e => handleSchemaChange('sizes', idx, 'height', e.target.value)} disabled={item.isPreset} sx={{ width: 80 }} />
                                            <TextField size="small" type="number" label="Base Price" value={item.price} onChange={e => handleSchemaChange('sizes', idx, 'price', e.target.value)} />
                                            {!item.isPreset && <IconButton color="error" onClick={() => removeSchemaItem('sizes', idx)}><DeleteIcon /></IconButton>}
                                        </Box>
                                    ))}
                                    <Button size="small" startIcon={<AddIcon />} onClick={() => addSchemaItem('sizes', { label: '', value: '', width: 0, height: 0, price: 0, enabled: true, isPreset: false })}>Add Custom Size</Button>
                                </Box>

                                {/* Styles */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Styles (Predefined limits)</Typography>
                                    {(form.customization_schema?.styles || []).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('styles', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Style" value={item.label} disabled={true} sx={{ flexGrow: 1 }} />
                                            {!item.isPreset && <IconButton color="error" onClick={() => removeSchemaItem('styles', idx)}><DeleteIcon /></IconButton>}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {form.customization_type === 'Mug' && (
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Mug Customize Options</Typography>

                                {/* Mug Types */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Mug Types & Add-on Prices</Typography>
                                    {(form.customization_schema?.mugTypes || []).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('mugTypes', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Type" value={item.label} disabled={true} sx={{ flexGrow: 1 }} />
                                            <TextField size="small" type="number" label="Add-on Price" value={item.price} onChange={e => handleSchemaChange('mugTypes', idx, 'price', e.target.value)} sx={{ width: 120 }} />
                                            {!item.isPreset && <IconButton color="error" onClick={() => removeSchemaItem('mugTypes', idx)}><DeleteIcon /></IconButton>}
                                        </Box>
                                    ))}
                                </Box>

                                {/* Mug Colors */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Available Colors</Typography>
                                    {(form.customization_schema?.mugColors || []).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('mugColors', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Color" value={item.label} disabled={true} sx={{ flexGrow: 1 }} />
                                            {!item.isPreset && <IconButton color="error" onClick={() => removeSchemaItem('mugColors', idx)}><DeleteIcon /></IconButton>}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {form.customization_type === 'GiftBox' && (
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Gift Box Customize Options</Typography>

                                {/* Box Types */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Box Types & Base Prices</Typography>
                                    {(form.customization_schema?.boxTypes || []).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('boxTypes', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Box Type" value={item.label} disabled={true} sx={{ flexGrow: 1 }} />
                                            <TextField size="small" type="number" label="Price" value={item.price} onChange={e => handleSchemaChange('boxTypes', idx, 'price', e.target.value)} sx={{ width: 100 }} />
                                            {!item.isPreset && <IconButton color="error" onClick={() => removeSchemaItem('boxTypes', idx)}><DeleteIcon /></IconButton>}
                                        </Box>
                                    ))}
                                </Box>

                                {/* Materials */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Materials & Add-on Prices</Typography>
                                    {(form.customization_schema?.materials || []).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('materials', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Material" value={item.label} disabled={true} sx={{ flexGrow: 1 }} />
                                            <TextField size="small" type="number" label="Add-on Price" value={item.price} onChange={e => handleSchemaChange('materials', idx, 'price', e.target.value)} sx={{ width: 100 }} />
                                            {!item.isPreset && <IconButton color="error" onClick={() => removeSchemaItem('materials', idx)}><DeleteIcon /></IconButton>}
                                        </Box>
                                    ))}
                                </Box>

                                {/* Decorations */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Decorations (Ribbons, Stickers, etc.)</Typography>
                                    {(form.customization_schema?.decorations || []).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('decorations', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Decoration" value={item.label} disabled={true} sx={{ flexGrow: 1 }} />
                                            <TextField size="small" type="number" label="Price" value={item.price} onChange={e => handleSchemaChange('decorations', idx, 'price', e.target.value)} sx={{ width: 100 }} />
                                            {!item.isPreset && <IconButton color="error" onClick={() => removeSchemaItem('decorations', idx)}><DeleteIcon /></IconButton>}
                                        </Box>
                                    ))}
                                </Box>

                                {/* Inside Items */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Items Inside (Candles, Jewelry, etc.)</Typography>
                                    {(form.customization_schema?.items || []).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('items', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Item" value={item.name} disabled={true} sx={{ flexGrow: 1 }} />
                                            <TextField size="small" type="number" label="Price" value={item.price} onChange={e => handleSchemaChange('items', idx, 'price', e.target.value)} sx={{ width: 100 }} />
                                            {!item.isPreset && <IconButton color="error" onClick={() => removeSchemaItem('items', idx)}><DeleteIcon /></IconButton>}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                        {form.customization_type === 'Hamper' && (
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Hamper Customize Options</Typography>

                                {/* Hamper Sizes */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Hamper Sizes & Prices</Typography>
                                    {(form.customization_schema?.hamperSizes || []).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('hamperSizes', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Size" value={item.label} disabled={true} sx={{ flexGrow: 1 }} />
                                            <TextField size="small" type="number" label="Price" value={item.price} onChange={e => handleSchemaChange('hamperSizes', idx, 'price', e.target.value)} sx={{ width: 100 }} />
                                        </Box>
                                    ))}
                                </Box>

                                {/* Containers */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Container Styles</Typography>
                                    {(form.customization_schema?.hamperContainers || []).filter(item => item.label).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('hamperContainers', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Style" value={item.label} disabled={true} sx={{ flexGrow: 1 }} />
                                        </Box>
                                    ))}
                                </Box>

                                {/* Chocolates */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Chocolates & Prices</Typography>
                                    {(form.customization_schema?.hamperChocolates || []).filter(item => item.name).map((item, idx) => (
                                        <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                                            <FormControlLabel control={<Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('hamperChocolates', idx, 'enabled', e.target.checked)} />} label="" sx={{ m: 0 }} />
                                            <TextField size="small" label="Name" value={item.name} disabled={true} sx={{ flexGrow: 1 }} />
                                            <TextField size="small" type="number" label="Price" value={item.price} onChange={e => handleSchemaChange('hamperChocolates', idx, 'price', e.target.value)} sx={{ width: 100 }} />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!form.name || form.price === '' || form.price === undefined || !form.category_id || uploading}
                    >
                        {editTarget ? 'Save Changes' : 'Add Product'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default ManageProducts;
