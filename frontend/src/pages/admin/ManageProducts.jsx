import { useState } from 'react';
import {
    Container, Typography, Button, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    Box, TextField, MenuItem, Avatar, Chip, Tooltip, Alert, Checkbox, 
    FormControlLabel, Tabs, Tab, Drawer, Snackbar, Stack, Grid, 
    InputLabel, FormControl, Select
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useProducts } from '../../store/ProductContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicUrl } from '../../api/axios';

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
    const { products, addProduct, updateProduct, deleteProduct, categories } = useProducts();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imagePreview, setImagePreview] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [uploading, setUploading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

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
        setErrorMsg('');
        setDrawerOpen(true);
    };

    const openEdit = (product) => {
        setEditTarget(product);
        setErrorMsg('');
        
        const saved = product.customization_schema || {};
        const merge = (savedItems, presets, keyField = 'label') => {
            const list = [...(savedItems || [])];
            const existingLabels = list.map(i => i[keyField]);
            presets.forEach(p => {
                if (!existingLabels.includes(p[keyField])) list.push({ ...p, enabled: false });
            });
            return list;
        };

        setForm({
            name: product.name,
            category_id: product.category_id,
            price: product.price,
            stock: product.stock || 100,
            description: product.description || '',
            image_url: product.image_url,
            customization_type: product.customization_type || 'Frame',
            is_on_home: product.is_on_home || false,
            is_on_shop: product.is_on_shop !== undefined ? product.is_on_shop : true,
            secondary_images: product.secondary_images || [],
            customization_schema: {
                sizes: merge(saved.sizes, PRESET_SIZES),
                styles: merge(saved.styles, PRESET_STYLES),
                mugTypes: merge(saved.mugTypes, PRESET_MUG_TYPES),
                mugColors: merge(saved.mugColors, PRESET_MUG_COLORS),
                boxTypes: merge(saved.boxTypes, PRESET_GIFTBOX_TYPES),
                materials: merge(saved.materials, PRESET_GIFTBOX_MATERIALS),
                decorations: merge(saved.decorations, PRESET_GIFTBOX_DECORATIONS),
                items: merge(saved.items, PRESET_GIFTBOX_ITEMS, 'name'),
                hamperSizes: merge(saved.hamperSizes, PRESET_HAMPER_SIZES),
                hamperContainers: merge(saved.hamperContainers, PRESET_HAMPER_CONTAINERS),
                hamperChocolates: merge(saved.hamperChocolates, PRESET_HAMPER_CHOCOLATES, 'name')
            }
        });
        setImagePreview(product.image_url);
        setDrawerOpen(true);
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
        if (!form.name || form.price === '' || !form.category_id) {
            setErrorMsg('Mission critical fields missing: Name, Price, and Category are required.');
            return;
        }
        const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 };
        try {
            if (editTarget) {
                await updateProduct(editTarget.id, payload);
                setSuccessMsg(`"${form.name}" synchronized successfully.`);
            } else {
                await addProduct(payload);
                setSuccessMsg(`"${form.name}" initialized into catalog.`);
            }
            setDrawerOpen(false);
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setErrorMsg(err.response?.data?.detail || "System rejected update.");
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
        <Container maxWidth="xl" sx={{ py: 6 }}>
            {/* Success Notification */}
            <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="success" variant="filled" sx={{ borderRadius: '12px', bgcolor: '#10b981' }}>{successMsg}</Alert>
            </Snackbar>

            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-2px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Inventory Management
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.7 }}>
                        Monitor stock levels, refine pricing, and configure bespoke customization modules.
                    </Typography>
                </Box>
                <Button 
                    variant="contained" startIcon={<AddIcon />} onClick={openAdd}
                    sx={{ 
                        borderRadius: '20px', px: 4, py: 2, textTransform: 'none', fontWeight: 800, fontSize: '1rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
                        transition: '0.4s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 15px 40px rgba(99, 102, 241, 0.6)' }
                    }}
                >
                    Add Product
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.05)', mb: 4 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ 
                    '& .MuiTabs-indicator': { height: 3, borderRadius: '3px', background: '#6366f1' },
                    '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '1rem', minWidth: 120, color: 'rgba(255,255,255,0.4)' },
                    '& .Mui-selected': { color: '#fff !important' }
                }}>
                    <Tab label="All Units" />
                    <Tab label="Home Highlights" />
                    <Tab label="Shop Exclusive" />
                </Tabs>
            </Box>

            <Paper sx={{ 
                borderRadius: '32px', overflow: 'hidden', bgcolor: 'rgba(15, 23, 42, 0.4)', 
                backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
            }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', border: 0 }}>PRODUCT IDENTIFIER</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', border: 0 }}>CATEGORY</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', border: 0 }}>UNIT PRICE</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', border: 0 }}>MODALITY</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', border: 0 }} align="right">OPERATIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <AnimatePresence>
                                {filteredProducts.map((p, i) => (
                                    <motion.tr
                                        key={p.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.04 }}
                                        style={{ display: 'table-row' }}
                                    >
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                                <Avatar 
                                                    src={getPublicUrl(p.image_url || p.image)} 
                                                    variant="rounded" 
                                                    sx={{ width: 56, height: 56, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', bgcolor: '#1e293b' }} 
                                                />
                                                <Box>
                                                    <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '1.05rem' }}>{p.name}</Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.4, letterSpacing: 1 }}>UID: #00{p.id}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <Chip 
                                                label={categories.find(c => c.id === p.category_id)?.name || 'General'} 
                                                sx={{ borderRadius: '8px', fontWeight: 800, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }} 
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 900, fontSize: '1.1rem', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>₹{p.price.toLocaleString()}</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <Stack direction="row" spacing={1}>
                                                {p.customization_type !== 'none' && <Chip label={p.customization_type} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.2)' }} />}
                                                {p.is_on_home && <Tooltip title="Visible on Landing"><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', m: 'auto' }} /></Tooltip>}
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <IconButton 
                                                    onClick={() => openEdit(p)} 
                                                    sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                    onClick={() => handleDelete(p.id, p.name)} 
                                                    sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{ 
                    sx: { width: { xs: '100vw', sm: 550 }, bgcolor: '#0f172a', color: 'white', borderLeft: '1px solid rgba(255,255,255,0.08)' } 
                }}
            >
                <Box sx={{ p: 5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900 }}>
                                {editTarget ? 'Edit Catalog Entry' : 'New Catalog Entry'}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.5 }}>Synchronizing with master inventory database</Typography>
                        </Box>
                        <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }}><CloseIcon /></IconButton>
                    </Box>

                    {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{errorMsg}</Alert>}

                    <Stack spacing={4} sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', letterSpacing: 1, color: '#6366f1' }}>PRIMARY ASSET</Typography>
                            <Box sx={{ 
                                position: 'relative', height: 180, borderRadius: '24px', overflow: 'hidden', 
                                border: '2px dashed rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.02)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {imagePreview ? (
                                    <>
                                        <img src={getPublicUrl(imagePreview)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                                        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', opacity: 0, transition: '0.3s', '&:hover': { opacity: 1 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Button variant="contained" component="label" size="small" disabled={uploading} sx={{ borderRadius: '10px' }}>
                                                Replace Image
                                                <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                            </Button>
                                        </Box>
                                    </>
                                ) : (
                                    <Button variant="outlined" component="label" disabled={uploading} sx={{ borderRadius: '12px', px: 4 }}>
                                        {uploading ? 'Uploading...' : 'Upload Product Photo'}
                                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        <TextField 
                            label="Product Title" fullWidth variant="filled" 
                            value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                            InputProps={{ disableUnderline: true, sx: { borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)' } }}
                        />
                        
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <TextField 
                                    label="Unit Price (₹)" fullWidth variant="filled" type="number"
                                    value={form.price} onChange={(e) => setForm({...form, price: e.target.value})}
                                    InputProps={{ disableUnderline: true, sx: { borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)' } }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth variant="filled">
                                    <InputLabel>Category</InputLabel>
                                    <Select 
                                        value={form.category_id} disableUnderline
                                        onChange={(e) => setForm({...form, category_id: e.target.value})}
                                        sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)' }}
                                    >
                                        {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <TextField 
                            label="Marketing Description" fullWidth multiline rows={4} variant="filled"
                            value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                            InputProps={{ disableUnderline: true, sx: { borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.04)' } }}
                        />

                        <Box sx={{ p: 3, borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, mb: 2, display: 'block', color: 'text.secondary' }}>System Modality</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth variant="filled">
                                        <InputLabel>Customizer Type</InputLabel>
                                        <Select 
                                            value={form.customization_type} disableUnderline size="small"
                                            onChange={(e) => setForm({...form, customization_type: e.target.value})}
                                            sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.04)' }}
                                        >
                                            <MenuItem value="None">None (Standard)</MenuItem>
                                            <MenuItem value="Frame">Photo Frame (3D)</MenuItem>
                                            <MenuItem value="Mug">Ceramic Mug (3D)</MenuItem>
                                            <MenuItem value="GiftBox">Gift Box (3D)</MenuItem>
                                            <MenuItem value="Hamper">Hamper (3D)</MenuItem>
                                            <MenuItem value="Custom">Custom (Basic)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField 
                                        label="Initial Stock" fullWidth variant="filled" type="number" size="small"
                                        value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})}
                                        InputProps={{ disableUnderline: true, sx: { borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.04)' } }}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                                <FormControlLabel 
                                    control={<Checkbox size="small" checked={form.is_on_home} onChange={(e) => setForm({...form, is_on_home: e.target.checked})} sx={{ color: '#6366f1', '&.Mui-checked': { color: '#6366f1' } }} />} 
                                    label={<Typography variant="body2" fontWeight={600}>Landing Page</Typography>} 
                                />
                                <FormControlLabel 
                                    control={<Checkbox size="small" checked={form.is_on_shop} onChange={(e) => setForm({...form, is_on_shop: e.target.checked})} sx={{ color: '#10b981', '&.Mui-checked': { color: '#10b981' } }} />} 
                                    label={<Typography variant="body2" fontWeight={600}>Shop Visible</Typography>} 
                                />
                            </Box>
                        </Box>

                        {/* Customization Details Sections */}
                        {form.customization_type === 'Frame' && (
                            <Box sx={{ p: 3, borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#f472b6' }}>FRAME OPTIONS (SCHEMA)</Typography>
                                <Stack spacing={2}>
                                    <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 700 }}>AVAILABLE SIZES</Typography>
                                    {(form.customization_schema?.sizes || []).map((item, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('sizes', idx, 'enabled', e.target.checked)} />
                                            <TextField size="small" label="Label" value={item.label} variant="filled" sx={{ flex: 2 }} InputProps={{ disableUnderline: true }} />
                                            <TextField size="small" label="Price" type="number" value={item.price} variant="filled" sx={{ flex: 1 }} InputProps={{ disableUnderline: true }} onChange={e => handleSchemaChange('sizes', idx, 'price', e.target.value)} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {form.customization_type === 'Mug' && (
                            <Box sx={{ p: 3, borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#f472b6' }}>MUG CONFIGURATION</Typography>
                                <Stack spacing={2}>
                                    <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 700 }}>ADD-ON PRICES (MUG TYPES)</Typography>
                                    {(form.customization_schema?.mugTypes || []).map((item, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Checkbox size="small" checked={item.enabled !== false} onChange={e => handleSchemaChange('mugTypes', idx, 'enabled', e.target.checked)} />
                                            <Typography sx={{ flex: 1, fontSize: '0.9rem' }}>{item.label}</Typography>
                                            <TextField size="small" label="Add-on" type="number" value={item.price} variant="filled" sx={{ width: 100 }} InputProps={{ disableUnderline: true }} onChange={e => handleSchemaChange('mugTypes', idx, 'price', e.target.value)} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                        {/* Add more schema sections as needed for GiftBox/Hamper if they match the style */}
                    </Stack>

                    <Button 
                        variant="contained" fullWidth size="large" onClick={handleSave}
                        sx={{ 
                            mt: 5, py: 2.5, borderRadius: '20px', fontWeight: 900, textTransform: 'none', fontSize: '1.2rem',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            boxShadow: '0 15px 35px rgba(99, 102, 241, 0.4)',
                            '&:hover': { boxShadow: '0 20px 45px rgba(99, 102, 241, 0.6)' }
                        }}
                    >
                        {editTarget ? 'Commit Changes' : 'Publish Product'}
                    </Button>
                </Box>
            </Drawer>
        </Container>
    );
};

export default ManageProducts;
