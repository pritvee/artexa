import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Box,
    Drawer, Stack, TextField, Button, Select, MenuItem,
    FormControl, InputLabel, Alert, Avatar, Divider, IconButton,
    Stepper, Step, StepLabel, Tooltip, Pagination, Grid,
    Dialog, DialogTitle, DialogContent, CircularProgress,
    Snackbar
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import PaletteIcon from '@mui/icons-material/Palette';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PrintIcon from '@mui/icons-material/Print';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import ImageDownloadPanel from './components/ImageDownloadPanel';
import { useOrders, ORDER_STATUSES } from '../../store/OrderContext';
import { getPublicUrl } from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const Mug3DPreview = lazy(() => import('../../components/Customization/MugBuilder/Mug3DPreview'));
const Frame3DPreviewAdmin = lazy(() => import('../../components/Customization/FrameBuilder/Frame3DPreviewAdmin'));
const GiftBox3DPreview = lazy(() => import('../../components/Customization/GiftBox/GiftBox3DPreview'));
const ChocolateHamper3DPreview = lazy(() => import('../../components/Customization/ChocolateHamper/ChocolateHamper3DPreview'));

const STATUS_COLOR_MAP = {
    placed: 'default',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error',
};

const InvoiceProductDetails = ({ details }) => {
    if (!details) return null;

    const renderList = (items) => {
        if (!items || !items.length) return null;
        return (
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {items.map((item, i) => (
                    <li key={i} style={{ color: '#4b5563', fontSize: '0.75rem' }}>
                        {item.type ? `${item.type.replace(/_/g, ' ')}${item.qty ? ` (x${item.qty})` : ''}` : item.replace(/_/g, ' ')}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Box sx={{ 
            mt: 1.5, 
            p: 1.5, 
            bgcolor: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: 1,
            width: '100%',
            breakInside: 'avoid'
        }}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: '#64748b', mb: 1, display: 'block', lineHeight: 1 }}>
                PRODUCT DETAILS
            </Typography>
            <Grid container spacing={1}>
                {details.product === 'photo_frame' && (
                    <>
                        {details.size && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Size:</Typography> <Typography variant="caption" sx={{ color: '#475569' }}>{details.size}</Typography></Grid>}
                        {details.frame_style && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Style:</Typography> <Typography variant="caption" sx={{ color: '#475569' }}>{details.frame_style}</Typography></Grid>}
                        {details.orientation && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Orientation:</Typography> <Typography variant="caption" sx={{ color: '#475569' }}>{details.orientation}</Typography></Grid>}
                        {details.images && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Photos:</Typography> <Typography variant="caption" sx={{ color: '#475569' }}>{details.images.length}</Typography></Grid>}
                    </>
                )}
                
                {details.product === 'mug' && (
                    <>
                        {details.mug_type && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Type:</Typography> <Typography variant="caption" sx={{ color: '#475569' }}>{details.mug_type}</Typography></Grid>}
                        {details.mug_color && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Color:</Typography> <Typography variant="caption" sx={{ color: '#475569' }}>{details.mug_color}</Typography></Grid>}
                    </>
                )}

                {details.product === 'chocolate_hamper' && (
                    <>
                        {details.hamper_size && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Size:</Typography> <Typography variant="caption" sx={{ color: '#475569', textTransform: 'capitalize' }}>{details.hamper_size}</Typography></Grid>}
                        {details.hamper_color && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Color:</Typography> <Typography variant="caption" sx={{ color: '#475569' }}>{details.hamper_color}</Typography></Grid>}
                        {details.container_style && <Grid item xs={12}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Container:</Typography> <Typography variant="caption" sx={{ color: '#475569', textTransform: 'capitalize' }}>{details.container_style.replace(/_/g, ' ')}</Typography></Grid>}
                        {details.chocolates && details.chocolates.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Items Included:</Typography>
                                {renderList(details.chocolates)}
                            </Grid>
                        )}
                        {details.decorations && details.decorations.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Decorations:</Typography>
                                {renderList(details.decorations)}
                            </Grid>
                        )}
                    </>
                )}

                {details.product === 'pro_gift_box' && (
                    <>
                        {details.box_type && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Size:</Typography> <Typography variant="caption" sx={{ color: '#475569', textTransform: 'capitalize' }}>{details.box_type}</Typography></Grid>}
                        {details.box_color && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Color:</Typography> <Typography variant="caption" sx={{ color: '#475569' }}>{details.box_color}</Typography></Grid>}
                        {details.material && <Grid item xs={6}><Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Material:</Typography> <Typography variant="caption" sx={{ color: '#475569', textTransform: 'capitalize' }}>{details.material}</Typography></Grid>}
                        {details.face_designs && details.face_designs.insideBox && details.face_designs.insideBox.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Items Inside:</Typography>
                                {renderList(details.face_designs.insideBox)}
                            </Grid>
                        )}
                    </>
                )}

                {/* Fallback for other generic types */}
                {!['photo_frame', 'mug', 'chocolate_hamper', 'pro_gift_box'].includes(details.product) && (
                    Object.entries(details)
                        .filter(([k, v]) => !['product', 'image', 'images', 'design_image', 'flat_design_image', 'model_3d_screenshot', 'text', 'caption', 'box_style', 'model', 'boxType'].includes(k) && (typeof v === 'string' || typeof v === 'number'))
                        .map(([k, v]) => (
                            <Grid item xs={6} key={k}>
                                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}:</Typography> 
                                <Typography variant="caption" sx={{ color: '#475569', ml: 0.5 }}>{v}</Typography>
                            </Grid>
                        ))
                )}
            </Grid>

            {(details.text || details.caption) && (
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #cbd5e1' }}>
                    {details.text && (
                        <Typography variant="caption" sx={{ fontStyle: 'italic', bgcolor: '#fff', p: '2px 6px', borderRadius: 0.5, border: '1px solid #e2e8f0', display: 'inline-block', mr: 1, mt: 0.5, color: '#334155' }}>
                            <strong style={{ opacity: 0.6 }}>Text:</strong> "{details.text}"
                        </Typography>
                    )}
                    {details.caption && (
                        <Typography variant="caption" sx={{ fontStyle: 'italic', bgcolor: '#fff', p: '2px 6px', borderRadius: 0.5, border: '1px solid #e2e8f0', display: 'inline-block', mt: 0.5, color: '#334155' }}>
                            <strong style={{ opacity: 0.6 }}>Caption:</strong> "{details.caption}"
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};

const ManageOrders = () => {
    const { fetchAllOrders, updateOrderTracking, deleteOrder, recoverOrder } = useOrders();
    const [orders, setOrders] = useState([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [trackingForm, setTrackingForm] = useState({
        statusIndex: 0,
        courierPartner: '',
        trackingId: '',
        estimatedDelivery: ''
    });
    const [successMsg, setSuccessMsg] = useState('');
    const [previewOrder, setPreviewOrder] = useState(null);
    const [invoiceOrder, setInvoiceOrder] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const loadOrders = async (page = 1) => {
        setLoading(true);
        const data = await fetchAllOrders(page, pagination.limit, showDeleted);
        if (data) {
            setOrders(data.items);
            setPagination({ total: data.total, page: data.page, limit: data.limit });
            window.scrollTo(0, 0);
        }
        setLoading(false);
    };
    const triggerSafeDownload = async (url, filename) => {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error('Fetch failed');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Safe download failed:", error);
            window.open(url, '_blank');
        }
    };



    const toggleFullscreen3D = (containerId) => {
        const el = document.getElementById(containerId);
        if (!el) return;
        
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || el.classList.contains('mobile-fallback-fullscreen');
        
        if (!isFullscreen) {
            const handleFallback = () => el.classList.add('mobile-fallback-fullscreen');
            if (el.requestFullscreen) {
                const p = el.requestFullscreen();
                if (p && p.catch) p.catch(handleFallback);
                else setTimeout(() => { if (!document.fullscreenElement) handleFallback(); }, 200);
            } else if (el.webkitRequestFullscreen) {
                const p = el.webkitRequestFullscreen();
                if (p && p.catch) p.catch(handleFallback);
                else setTimeout(() => { if (!document.webkitFullscreenElement) handleFallback(); }, 200);
            } else if (el.msRequestFullscreen) {
                el.msRequestFullscreen();
            } else {
                handleFallback();
            }
        } else {
            if (el.classList.contains('mobile-fallback-fullscreen')) {
                el.classList.remove('mobile-fallback-fullscreen');
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    useEffect(() => { loadOrders(1); }, [showDeleted]);

    const handleDeleteOrder = async () => {
        if (!deleteConfirm) return;
        const success = await deleteOrder(deleteConfirm);
        if (success) {
            setSuccessMsg('Order deleted successfully');
            setDeleteConfirm(null);
            loadOrders(pagination.page);
        }
    };

    const handleRecoverOrder = async (orderId) => {
        const success = await recoverOrder(orderId);
        if (success) {
            setSuccessMsg('Order recovered successfully');
            loadOrders(pagination.page);
        }
    };

    const statusIndex = selectedOrder
        ? ORDER_STATUSES.findIndex(s => s.key === selectedOrder.status)
        : -1;

    const handleSaveTracking = async () => {
        if (!selectedOrder) return;
        const status = ORDER_STATUSES[trackingForm.statusIndex]?.key || selectedOrder.status;
        await updateOrderTracking(selectedOrder.id, {
            status,
            courier_partner: trackingForm.courierPartner,
            tracking_id: trackingForm.trackingId,
            estimated_delivery: trackingForm.estimatedDelivery,
        });
        setSuccessMsg('Order updated successfully!');
        setEditMode(false);
        loadOrders(pagination.page);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight={800}>
                    {showDeleted ? 'Deleted Orders (Trash)' : 'Order Management'}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button 
                        variant={showDeleted ? "outlined" : "contained"} 
                        onClick={() => setShowDeleted(false)}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Active Orders
                    </Button>
                    <Button 
                        variant={showDeleted ? "contained" : "outlined"} 
                        color="error"
                        onClick={() => setShowDeleted(true)}
                        startIcon={<DeleteIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Trash
                    </Button>
                </Stack>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'primary.main' }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Order ID</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Customer</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Items</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Total</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Date</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <AnimatePresence>
                                    {orders.map((order) => (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            style={{ display: 'table-row' }}
                                        >
                                            <TableCell>
                                                <Typography fontWeight={700}>#{order.id}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>
                                                        {(order.user?.name || 'G')[0].toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>{order.user?.name || 'Guest'}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{order.user?.email}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{order.items?.length || 0} item(s)</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {order.items?.map(i => i.product?.name).join(', ').substring(0, 40)}...
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={700}>Rs {order.total_price?.toFixed(2)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.status}
                                                    color={STATUS_COLOR_MAP[order.status] || 'default'}
                                                    size="small"
                                                    sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.5}>
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" onClick={() => {
                                                            setSelectedOrder(order);
                                                            setTrackingForm({
                                                                statusIndex: ORDER_STATUSES.findIndex(s => s.key === order.status),
                                                                courierPartner: order.courier_partner || '',
                                                                trackingId: order.tracking_id || '',
                                                                estimatedDelivery: order.estimated_delivery || ''
                                                            });
                                                        }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Production Preview">
                                                        <IconButton size="small" color="secondary" onClick={() => setPreviewOrder(order)}>
                                                            <PaletteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Invoice">
                                                        <IconButton size="small" color="primary" onClick={() => setInvoiceOrder(order)}>
                                                            <AssignmentIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Order">
                                                        <IconButton size="small" color="error" onClick={() => setDeleteConfirm(order.id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {showDeleted && (
                                                        <Tooltip title="Recover Order">
                                                            <IconButton size="small" color="success" onClick={() => handleRecoverOrder(order.id)}>
                                                                <RestoreFromTrashIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                            count={Math.ceil(pagination.total / pagination.limit)}
                            page={pagination.page}
                            onChange={(_, p) => loadOrders(p)}
                            color="primary"
                        />
                    </Box>
                </>
            )}

            {/* ORDER DETAIL DRAWER */}
            <Drawer
                anchor="right"
                open={!!selectedOrder}
                onClose={() => { setSelectedOrder(null); setEditMode(false); }}
                PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}
            >
                {selectedOrder && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', p: 3, color: '#fff' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Order #{selectedOrder.id}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        {selectedOrder.user?.name || 'Guest'} · {new Date(selectedOrder.created_at).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <IconButton onClick={() => setSelectedOrder(null)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>DELIVERY PROGRESS</Typography>
                            {editMode ? (
                                <Stack spacing={2} sx={{ mb: 4, mt: 1 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Update Status</InputLabel>
                                        <Select
                                            value={trackingForm.statusIndex}
                                            label="Update Status"
                                            onChange={(e) => setTrackingForm({ ...trackingForm, statusIndex: e.target.value })}
                                        >
                                            {ORDER_STATUSES.map((s, idx) => (
                                                <MenuItem key={s.key} value={idx}>{s.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        size="small"
                                        label="Courier Partner"
                                        fullWidth
                                        value={trackingForm.courierPartner}
                                        onChange={(e) => setTrackingForm({ ...trackingForm, courierPartner: e.target.value })}
                                    />
                                    <TextField
                                        size="small"
                                        label="Tracking ID"
                                        fullWidth
                                        value={trackingForm.trackingId}
                                        onChange={(e) => setTrackingForm({ ...trackingForm, trackingId: e.target.value })}
                                    />
                                    <TextField
                                        size="small"
                                        label="Estimated Delivery"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        value={trackingForm.estimatedDelivery ? String(trackingForm.estimatedDelivery).split('T')[0] : ''}
                                        onChange={(e) => setTrackingForm({ ...trackingForm, estimatedDelivery: e.target.value })}
                                    />
                                </Stack>
                            ) : (
                                <>
                                    <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5, letterSpacing: 1, display: 'block', mb: 1 }}>SHIPPING ADDRESS</Typography>
                                        <Typography variant="body2">{selectedOrder.shipping_address}</Typography>
                                        
                                        {selectedOrder.gift_note && (
                                            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(236, 72, 153, 0.08)', borderRadius: 1.5, border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#EC4899', display: 'block', mb: 0.5, letterSpacing: 0.5 }}>PERSONAL GIFT NOTE</Typography>
                                                <Typography variant="body1" sx={{ fontStyle: 'italic', fontWeight: 600, color: '#111' }}>"{selectedOrder.gift_note}"</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Divider sx={{ mb: 3 }} />
                                    <Stepper activeStep={statusIndex >= 0 ? statusIndex : 0} orientation="vertical">
                                        {ORDER_STATUSES.map((s, idx) => (
                                            <Step key={s.key}>
                                                <StepLabel
                                                    StepIconProps={{
                                                        sx: { color: idx <= statusIndex ? 'success.main' : 'grey.400' }
                                                    }}
                                                >
                                                    <Typography variant="body2" fontWeight={idx === statusIndex ? 700 : 400}>{s.label}</Typography>
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                    {(selectedOrder.courier_partner || selectedOrder.tracking_id || selectedOrder.estimated_delivery) && (
                                        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
                                            {selectedOrder.courier_partner && <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Courier:</strong> {selectedOrder.courier_partner}</Typography>}
                                            {selectedOrder.tracking_id && <Typography variant="body2" sx={{ mb: 0.5 }}><strong>Tracking ID:</strong> {selectedOrder.tracking_id}</Typography>}
                                            {selectedOrder.estimated_delivery && <Typography variant="body2"><strong>Est. Delivery:</strong> {new Date(selectedOrder.estimated_delivery).toLocaleDateString()}</Typography>}
                                        </Box>
                                    )}
                                </>
                            )}

                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>ORDER ITEMS</Typography>
                            <Stack spacing={2}>
                                {selectedOrder.items?.map((item, idx) => (
                                    <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight={700}>{item.product?.name}</Typography>
                                            <Typography variant="body2" color="primary" fontWeight={700}>
                                                Rs {(item.price * item.quantity).toFixed(2)}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Qty: {item.quantity} × Rs {item.price?.toFixed(2)}
                                        </Typography>
                                        {item.customization_details && (
                                            <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                                                {item.customization_details.product === 'photo_frame' ? (
                                                    <Grid container spacing={1}>
                                                        {item.customization_details.size && (
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" color="text.secondary" display="block">FRAME SIZE</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.customization_details.size}</Typography>
                                                            </Grid>
                                                        )}
                                                        {item.customization_details.frame_style && (
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" color="text.secondary" display="block">FRAME STYLE</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.customization_details.frame_style}</Typography>
                                                            </Grid>
                                                        )}
                                                        {item.customization_details.frame_color && (
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" color="text.secondary" display="block">FRAME COLOR</Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: item.customization_details.frame_color, border: '1px solid rgba(0,0,0,0.15)' }} />
                                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.customization_details.frame_color}</Typography>
                                                                </Box>
                                                            </Grid>
                                                        )}
                                                        {item.customization_details.orientation && (
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" color="text.secondary" display="block">ORIENTATION</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{item.customization_details.orientation}</Typography>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                ) : (
                                                    <Grid container spacing={1}>
                                                        {item.customization_details.mug_type && (
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" color="text.secondary" display="block">MUG TYPE</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.customization_details.mug_type}</Typography>
                                                            </Grid>
                                                        )}
                                                        {item.customization_details.mug_color && (
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" color="text.secondary" display="block">MUG COLOR</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.customization_details.mug_color}</Typography>
                                                            </Grid>
                                                        )}
                                                        {item.customization_details.model && (
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" color="text.secondary" display="block">MODEL ID</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.customization_details.model}</Typography>
                                                            </Grid>
                                                        )}
                                                        {item.customization_details.text && (
                                                            <Grid item xs={12}>
                                                                <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
                                                                    <Typography variant="caption" color="text.secondary" display="block">USER MESSAGE / TEXT</Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: item.customization_details.font || 'inherit', color: item.customization_details.text_color || 'inherit' }}>
                                                                        "{item.customization_details.text}"
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                                                        Config: {item.customization_details.font}, Size: {item.customization_details.text_size}px
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                )}

                                                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                                                <Stack spacing={2}>
                                                    {/* Download Raw Assets */}
                                                    {(item.customization_details.image || item.customization_details.images?.length > 0) && (
                                                        <Box>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
                                                                <PhotoLibraryIcon sx={{ fontSize: 14 }} /> 1. RAW ASSETS
                                                            </Typography>
                                                            {item.customization_details.image && (
                                                                <Button
                                                                    variant="outlined" size="small" fullWidth
                                                                    startIcon={<DownloadIcon />}
                                                                    onClick={() => triggerSafeDownload(getPublicUrl(item.customization_details.image), `order_${selectedOrder.id}_original_asset.png`)}
                                                                    sx={{ borderRadius: 2, textTransform: 'none', justifyContent: 'flex-start' }}
                                                                >
                                                                    Download Original User Upload
                                                                </Button>
                                                            )}
                                                            {item.customization_details.images?.map((imgUrl, imgIdx) => (
                                                                <Button
                                                                    key={imgIdx} variant="outlined" size="small" fullWidth
                                                                    startIcon={<DownloadIcon />}
                                                                    onClick={() => triggerSafeDownload(getPublicUrl(imgUrl), `order_${selectedOrder.id}_upload_${imgIdx + 1}.png`)}
                                                                    sx={{ borderRadius: 2, textTransform: 'none', justifyContent: 'flex-start', mt: 0.5 }}
                                                                >
                                                                    Download Upload {imgIdx + 1}
                                                                </Button>
                                                            ))}
                                                        </Box>
                                                    )}

                                                    {/* Production Files */}
                                                    {(item.customization_details.flat_design_image || item.customization_details.model_3d_screenshot) && (
                                                        <Box>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, color: 'secondary.main' }}>
                                                                <PrintIcon sx={{ fontSize: 14 }} /> 2. PRODUCTION FILES
                                                            </Typography>
                                                            <Stack direction="row" spacing={1}>
                                                                {item.customization_details.flat_design_image && (
                                                                    <Button
                                                                        variant="contained" size="small" color="secondary" fullWidth
                                                                        startIcon={<DownloadIcon />}
                                                                        onClick={() => triggerSafeDownload(getPublicUrl(item.customization_details.flat_design_image), `order_${selectedOrder.id}_hq_print.png`)}
                                                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                                                    >
                                                                        Print Texture
                                                                    </Button>
                                                                )}
                                                                {item.customization_details.model_3d_screenshot && (
                                                                    <Button
                                                                        variant="contained" size="small" color="primary" fullWidth
                                                                        startIcon={<VisibilityIcon />}
                                                                        onClick={() => triggerSafeDownload(getPublicUrl(item.customization_details.model_3d_screenshot), `order_${selectedOrder.id}_mockup_snapshot.png`)}
                                                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                                                    >
                                                                        3D Mockup
                                                                    </Button>
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Box>
                                        )}
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 700 }}>Rs {(item.price * item.quantity).toFixed(2)}</Typography>
                                        </Box>
                                    </Paper>
                                ))}
                                <Box sx={{ pt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontWeight: 700 }}>Total Paid</Typography>
                                    <Typography color="primary" sx={{ fontWeight: 800 }}>Rs {selectedOrder.total_price?.toFixed(2)}</Typography>
                                </Box>
                            </Stack>
                        </Box>

                        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                            <Button
                                fullWidth variant="outlined"
                                startIcon={<AssignmentIcon />}
                                onClick={() => setInvoiceOrder(selectedOrder)}
                            >
                                View Invoice
                            </Button>
                            {editMode ? (
                                <Box sx={{ display: 'flex', gap: 2, flex: 2 }}>
                                    <Button fullWidth onClick={() => setEditMode(false)}>Cancel</Button>
                                    <Button fullWidth variant="contained" onClick={handleSaveTracking}>Save Changes</Button>
                                </Box>
                            ) : (
                                <Button fullWidth variant="contained" sx={{ flex: 2 }} onClick={() => setEditMode(true)}>Edit Tracking Info</Button>
                            )}
                        </Box>
                    </Box>
                )}
            </Drawer>

            {/* QUICK PREVIEW MODAL */}
            <Dialog
                open={!!previewOrder}
                onClose={() => setPreviewOrder(null)}
                maxWidth="lg"
                fullWidth
                className="production-preview-dialog"
                PaperProps={{ sx: { borderRadius: 4, bgcolor: '#0f172a', color: '#fff', maxHeight: '90vh' } }}
            >
                <DialogTitle component="div" sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div" fontWeight={800}>Visual Production Preview #{previewOrder?.id}</Typography>
                    <IconButton autoFocus onClick={() => setPreviewOrder(null)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)', p: 0 }}>
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={4}>
                            {previewOrder?.items.map((item, idx) => (
                                <Box key={idx} sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 2, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#ec4899' }}>
                                        Item: {item.product?.name}
                                    </Typography>

                                    <Grid container spacing={3}>
                                        {(() => {
                                            const productType = item.customization_details?.product || item.product?.customization_type;
                                            const isFrame = ['photo_frame', 'frame', 'Photo Frame'].includes(productType);
                                            const isMug = ['mug', 'custom_mug', 'Mug', 'Custom Mug'].includes(productType);
                                            const isHamper = productType === 'chocolate_hamper';
                                            const isGiftBox = productType === 'pro_gift_box';

                                            if (isFrame) {
                                                return (
                                                    <>
                                                        {/* LEFT: Live 3D Frame Model */}
                                                        <Grid item xs={12} md={5}>
                                                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 1 }}>INTERACTIVE 3D FRAME MODEL (360°)</Typography>
                                                            <Box
                                                                id={`frame-3d-container-${idx}`}
                                                                sx={{ height: 320, width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', bgcolor: '#080818', position: 'relative' }}
                                                            >
                                                                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                                                                    <Tooltip title="Toggle Fullscreen">
                                                                        <IconButton onClick={() => toggleFullscreen3D(`frame-3d-container-${idx}`)} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', '&:hover': { bgcolor: 'primary.main' } }}>
                                                                            <FullscreenIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                                <Suspense fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', flexDirection: 'column', gap: 1 }}><CameraAltIcon /><Typography variant="caption">Loading 3D model...</Typography></Box>}>
                                                                    <Frame3DPreviewAdmin
                                                                        textureUrl={getPublicUrl(item.customization_details.flat_design_image || item.customization_details.images?.[0])}
                                                                        frameColor={item.customization_details.frame_color || '#111111'}
                                                                        frameStyle={item.customization_details.frame_style || 'wooden'}
                                                                        frameSize={{
                                                                            width: parseFloat(item.customization_details.size?.split('x')?.[0]) || 12,
                                                                            height: parseFloat(item.customization_details.size?.split('x')?.[1]?.split('\u2013')?.[0]?.trim()) || 8
                                                                        }}
                                                                        orientation={item.customization_details.orientation || 'portrait'}
                                                                        glassReflection={true}
                                                                        wallPreview="none"
                                                                    />
                                                                </Suspense>
                                                            </Box>
                                                            <Typography variant="caption" sx={{ opacity: 0.4, mt: 0.5, display: 'block', textAlign: 'center' }}>Drag to rotate · Scroll to zoom</Typography>
                                                        </Grid>

                                                        {/* MIDDLE: Edited Design */}
                                                        <Grid item xs={12} md={4}>
                                                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 1, letterSpacing: 1 }}>EDITED DESIGN (PRINT READY)</Typography>
                                                            
                                                                    <Box id={`frame-flat-${idx}`} className="fullscreen-support" sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', bgcolor: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', '&:hover .img-actions': { opacity: 1 } }}>
                                                                {item.customization_details.flat_design_image ? (
                                                                    <img src={getPublicUrl(item.customization_details.flat_design_image)} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', maxHeight: 350 }} className="preview-image" alt="Print" />
                                                                ) : item.customization_details.images?.[0] ? (
                                                                    <Box sx={{ position: 'relative' }}>
                                                                        <img src={getPublicUrl(item.customization_details.images[0])} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', maxHeight: 350 }} className="preview-image" alt="Fallback" />
                                                                        <Box sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'error.main', color: '#fff', px: 1.5, py: 0.5, borderRadius: 1, boxShadow: 2 }}>
                                                                            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '10px' }}>FALLBACK: RAW PHOTO</Typography>
                                                                        </Box>
                                                                    </Box>
                                                                ) : (
                                                                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <PhotoLibraryIcon sx={{ opacity: 0.3, fontSize: 40 }} />
                                                                    </Box>
                                                                )}
                                                                <Box className="img-actions" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, bgcolor: 'rgba(0,0,0,0.7)', opacity: 0, transition: '0.2s', zIndex: 2 }}>
                                                                    <Tooltip title="View Fullscreen"><IconButton color="inherit" onClick={() => toggleFullscreen3D(`frame-flat-${idx}`)} sx={{ border: '2px solid' }}><FullscreenIcon sx={{ fontSize: 32 }} /></IconButton></Tooltip>
                                                                </Box>
                                                            </Box>

                                                            {/* UNIVERSAL DOWNLOAD PANEL */}
                                                            {(item.customization_details.flat_design_image || item.customization_details.images?.[0]) && (
                                                                <ImageDownloadPanel 
                                                                    imageUrl={getPublicUrl(item.customization_details.flat_design_image || item.customization_details.images?.[0])}
                                                                    productName={item.product?.name}
                                                                    type="design"
                                                                />
                                                            )}

                                                            {item.customization_details?.model_3d_screenshot && (
                                                                <Box sx={{ mt: 2 }}>
                                                                    <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mb: 1 }}>3D MOCKUP SNAPSHOT</Typography>
                                                                    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', '&:hover .img-actions': { opacity: 1 } }}>
                                                                        <img src={getPublicUrl(item.customization_details.model_3d_screenshot)} style={{ width: '100%', display: 'block', borderRadius: 8 }} alt="3D Snapshot" />
                                                                        <Box className="img-actions" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.6)', opacity: 0, transition: '0.2s' }}>
                                                                            <Tooltip title="Download Snapshot">
                                                                                <IconButton 
                                                                                    color="inherit" 
                                                                                    onClick={() => triggerSafeDownload(getPublicUrl(item.customization_details.model_3d_screenshot), `style-snapshot-${previewOrder.id}.png`)}
                                                                                >
                                                                                    <DownloadIcon />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Grid>

                                                        {/* RIGHT: Customer Uploads */}
                                                        <Grid item xs={12} md={3}>
                                                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 1 }}>CUSTOMER UPLOADED IMAGE(S)</Typography>
                                                            {item.customization_details?.images?.length > 0 ? (
                                                                <Stack spacing={2}>
                                                                    {item.customization_details.images.map((imgUrl, imgIdx) => (
                                                                        <Box key={imgIdx}>
                                                                            <Box id={`frame-upload-${idx}-${imgIdx}`} className="fullscreen-support" sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', '&:hover .img-actions': { opacity: 1 } }}>
                                                                                <img src={getPublicUrl(imgUrl)} style={{ width: '100%', display: 'block' }} alt="Upload" />
                                                                                <Box className="img-actions" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.65)', opacity: 0, transition: '0.25s' }}>
                                                                                    <Tooltip title="Fullscreen"><IconButton color="secondary" onClick={() => toggleFullscreen3D(`frame-upload-${idx}-${imgIdx}`)} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)' }}><FullscreenIcon /></IconButton></Tooltip>
                                                                                </Box>
                                                                            </Box>
                                                                            <ImageDownloadPanel 
                                                                                imageUrl={getPublicUrl(imgUrl)}
                                                                                productName={item.product?.name}
                                                                                type="upload"
                                                                            />
                                                                        </Box>
                                                                    ))}
                                                                </Stack>
                                                            ) : (
                                                                <Typography variant="caption" sx={{ opacity: 0.4 }}>No uploads saved</Typography>
                                                            )}
                                                        </Grid>

                                                        <Grid item xs={12}>
                                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                                {item.customization_details.size && <Chip label={`Size: ${item.customization_details.size}`} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }} />}
                                                                {item.customization_details.frame_style && <Chip label={`Style: ${item.customization_details.frame_style}`} size="small" sx={{ bgcolor: 'rgba(236,72,153,0.2)', color: '#f9a8d4' }} />}
                                                                {item.customization_details.orientation && <Chip label={item.customization_details.orientation} size="small" sx={{ bgcolor: 'rgba(245,158,11,0.2)', color: '#fcd34d' }} />}
                                                            </Stack>
                                                        </Grid>
                                                    </>
                                                );
                                            } else {
                                                return (
                                                    <>
                                                        {/* UNIVERSAL PREVIEW FOR ALL OTHER PRODUCTS */}
                                                        <Grid item xs={12} md={6}>
                                                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 1 }}>INTERACTIVE 3D VIEW</Typography>
                                                            <Box id={`3d-container-${idx}`} sx={{ height: 350, width: '100%', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', bgcolor: '#0a0a1a', position: 'relative' }}>
                                                                <Box sx={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10 }}>
                                                                    <Tooltip title="Toggle Fullscreen">
                                                                        <IconButton onClick={() => toggleFullscreen3D(`3d-container-${idx}`)} sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'primary.main' }, color: '#fff' }}>
                                                                            <FullscreenIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                                <Suspense fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress size={24} /></Box>}>
                                                                    {(() => {
                                                                        if (isMug) {
                                                                            return (
                                                                                <Mug3DPreview
                                                                                    textureUrl={getPublicUrl(item.customization_details.flat_design_image || item.customization_details.image || item.customization_details.images?.[0])}
                                                                                    mugColor={item.customization_details.mug_color || 'White'}
                                                                                    mugType={item.customization_details.mug_type || 'Classic'}
                                                                                />
                                                                            );
                                                                        } else if (isHamper) {
                                                                            return (
                                                                                <ChocolateHamper3DPreview
                                                                                    containerStyle={item.customization_details.container_style || 'gift_basket'}
                                                                                    hamperColor={item.customization_details.hamper_color || '#8B6914'}
                                                                                    size={{ value: item.customization_details.hamper_size || 'medium' }}
                                                                                    chocolates={item.customization_details.chocolates?.reduce((acc, c) => {
                                                                                        if (c.x !== undefined && c.y !== undefined) {
                                                                                            acc.push(c);
                                                                                            return acc;
                                                                                        }
                                                                                        const qty = c.qty || 1;
                                                                                        const totalItems = item.customization_details.chocolates.reduce((s, curr) => s + (curr.qty || 1), 0);
                                                                                        for (let i = 0; i < qty; i++) {
                                                                                            const angle = (acc.length / totalItems) * Math.PI * 2;
                                                                                            acc.push({
                                                                                                id: `${c.type}-${i}-${Date.now()}`,
                                                                                                type: c.type,
                                                                                                x: 310 + Math.cos(angle) * 105,
                                                                                                y: 260 + Math.sin(angle) * 105,
                                                                                                rotation: angle * (180 / Math.PI)
                                                                                            });
                                                                                        }
                                                                                        return acc;
                                                                                    }, []) || []}
                                                                                    decorations={item.customization_details.decorations?.map((d, i) => (
                                                                                        typeof d === 'object' ? d : {
                                                                                            id: `dec-${d}-${i}`,
                                                                                            type: d,
                                                                                            x: 310 + Math.cos(i) * 135,
                                                                                            y: 260 + Math.sin(i) * 135
                                                                                        }
                                                                                    )) || []}
                                                                                />
                                                                            );
                                                                        } else if (isGiftBox) {
                                                                            return (
                                                                                <GiftBox3DPreview
                                                                                    boxDimensions={{
                                                                                        w: item.customization_details.box_type === 'small' ? 90 : item.customization_details.box_type === 'large' ? 140 : 110,
                                                                                        d: item.customization_details.box_type === 'small' ? 80 : item.customization_details.box_type === 'large' ? 125 : 100,
                                                                                        h: item.customization_details.box_type === 'small' ? 60 : item.customization_details.box_type === 'large' ? 95 : 75
                                                                                    }}
                                                                                    boxColor={item.customization_details.box_color || '#1a1a2e'}
                                                                                    material={item.customization_details.material || 'matte'}
                                                                                    faceDesigns={item.customization_details.face_designs || {}}
                                                                                    foamColor={item.customization_details.foam_color || '#f0dde8'}
                                                                                    ribbonSettings={item.customization_details.ribbon || { enabled: false }}
                                                                                />
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                    <CameraAltIcon sx={{ opacity: 0.2, fontSize: 60 }} />
                                                                                </Box>
                                                                            );
                                                                        }
                                                                    })()}
                                                                </Suspense>
                                                            </Box>
                                                        </Grid>

                                                        <Grid item xs={12} md={6}>
                                                            <Stack spacing={3}>
                                                                {(() => {
                                                                    const unifiedDesignImage = item.customization_details.flat_design_image || item.customization_details.preview_image_url || item.customization_details.design_image || item.customization_details.image || item.customization_details.images?.[0];
                                                                    
                                                                    return (
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 1 }}>EDITED DESIGN</Typography>
                                                                            <Box id={`design-flat-${idx}`} className="fullscreen-support" sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', '&:hover .img-actions': { opacity: 1 }, minHeight: 200, bgcolor: '#fff' }}>

                                                                                {unifiedDesignImage ? (
                                                                                    <img
                                                                                        src={getPublicUrl(unifiedDesignImage)}
                                                                                        style={{ width: '100%', display: 'block', background: '#fff' }}
                                                                                        alt="Design"
                                                                                    />
                                                                                ) : (
                                                                                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                        <PhotoLibraryIcon sx={{ opacity: 0.3, fontSize: 40, color: '#000' }} />
                                                                                    </Box>
                                                                                )}
                                                                                <Box className="img-actions" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, bgcolor: 'rgba(0,0,0,0.6)', opacity: 0, transition: '0.3s' }}>
                                                                                    <Tooltip title="View Fullscreen"><IconButton color="secondary" onClick={() => toggleFullscreen3D(`design-flat-${idx}`)}><FullscreenIcon sx={{ fontSize: 32 }} /></IconButton></Tooltip>
                                                                                </Box>
                                                                            </Box>
                                                                            {unifiedDesignImage && (
                                                                                <ImageDownloadPanel 
                                                                                    imageUrl={getPublicUrl(unifiedDesignImage)}
                                                                                    productName={item.product?.name}
                                                                                    type="design"
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    );
                                                                })()}

                                                                {/* ORIGINAL UPLOADS */}
                                                                {(() => {
                                                                    const uploads = [];
                                                                    if (item.customization_details?.images?.length) uploads.push(...item.customization_details.images);
                                                                    else if (item.customization_details?.image) uploads.push(item.customization_details.image);
                                                                    
                                                                    if (item.customization_details?.face_designs?.insideBox) {
                                                                        item.customization_details.face_designs.insideBox.forEach(d => {
                                                                            if (d.photoUrl) uploads.push(d.photoUrl);
                                                                        });
                                                                    }
                                                                    
                                                                    return uploads.length > 0 ? (
                                                                        <Box>
                                                                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 1 }}>CUSTOMER UPLOAD(S)</Typography>
                                                                            <Stack spacing={2}>
                                                                                {uploads.map((imgUrl, imgIdx) => (
                                                                                    <Box key={imgIdx}>
                                                                                        <Box id={`upload-preview-${idx}-${imgIdx}`} className="fullscreen-support" sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', '&:hover .img-actions': { opacity: 1 } }}>
                                                                                            <img src={getPublicUrl(imgUrl)} style={{ width: '100%', display: 'block' }} alt="Upload" />
                                                                                            <Box className="img-actions" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, bgcolor: 'rgba(0,0,0,0.6)', opacity: 0, transition: '0.3s' }}>
                                                                                                <Tooltip title="Fullscreen"><IconButton color="inherit" onClick={() => toggleFullscreen3D(`upload-preview-${idx}-${imgIdx}`)}><FullscreenIcon /></IconButton></Tooltip>
                                                                                            </Box>
                                                                                        </Box>

                                                                                        <ImageDownloadPanel 
                                                                                            imageUrl={getPublicUrl(imgUrl)}
                                                                                            productName={item.product?.name}
                                                                                            type="upload"
                                                                                        />
                                                                                    </Box>
                                                                                ))}
                                                                            </Stack>
                                                                        </Box>
                                                                    ) : null;
                                                                })()}
                                                            </Stack>
                                                        </Grid>
                                                    </>
                                                );
                                            }
                                        })()}
                                    </Grid>

                                    {!item.customization_details?.flat_design_image &&
                                        !item.customization_details?.images?.length &&
                                        !item.customization_details?.model_3d_screenshot && (
                                            <Typography variant="body2" sx={{ textAlign: 'center', py: 2, opacity: 0.5 }}>
                                                No customization captures available for this item.
                                            </Typography>
                                        )}
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* OFFICIAL INVOICE / JOB TICKET MODAL */}
            <Dialog
                open={!!invoiceOrder}
                onClose={() => setInvoiceOrder(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 0, p: 0, overflow: 'hidden' } }}
            >
                <Box sx={{ p: 4, bgcolor: '#fff', color: '#000', minHeight: '800px', position: 'relative' }} id="printable-invoice">
                    {/* Invoice Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6, borderBottom: '3px solid #000', pb: 2 }}>
                        <Box>
                            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -1 }}>ARTEZA.IN</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>PREMIUM PHOTO FRAMES & GIFTS</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h5" fontWeight={800}>OFFICIAL INVOICE</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Order ID: #{invoiceOrder?.id}</Typography>
                            <Typography variant="body2">Date: {new Date(invoiceOrder?.created_at).toLocaleDateString()}</Typography>
                        </Box>
                    </Box>

                    {/* Billing Section */}
                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        <Grid item xs={6}>
                            <Typography variant="overline" sx={{ fontWeight: 900, color: '#666', mb: 1, display: 'block' }}>BILL TO / SHIP TO</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 800 }}>{invoiceOrder?.user?.name || 'Guest Customer'}</Typography>
                            <Typography variant="body2" sx={{ maxWidth: 280, mt: 0.5 }}>{invoiceOrder?.shipping_address}</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>{invoiceOrder?.user?.email}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <Typography variant="overline" sx={{ fontWeight: 900, color: '#666', mb: 1, display: 'block' }}>PAYMENT STATUS</Typography>
                            <Chip 
                                label={invoiceOrder?.payment_status === 'paid' ? 'PAID' : (['cod_pending', 'pending', 'cod'].includes(invoiceOrder?.payment_status)) ? 'PENDING' : 'FAILED'} 
                                color={invoiceOrder?.payment_status === 'paid' ? 'success' : invoiceOrder?.payment_status === 'failed' ? 'error' : 'warning'} 
                                size="small" 
                                sx={{ fontWeight: 900, borderRadius: 1 }} 
                            />
                            <Typography variant="body2" sx={{ mt: 2 }}>Method: {invoiceOrder?.payment_method === 'cod' ? 'CASH ON DELIVERY (COD)' : 'PREPAID (Razorpay/Online)'}</Typography>
                        </Grid>
                    </Grid>

                    {/* Table Header */}
                    <Box sx={{ bgcolor: '#f8fafc', p: 1.5, display: 'flex', borderBottom: '2px solid #e2e8f0', mb: 1 }}>
                        <Typography sx={{ flex: 2, fontWeight: 800, fontSize: '0.75rem' }}>PRODUCT DESCRIPTION</Typography>
                        <Typography sx={{ flex: 1, fontWeight: 800, fontSize: '0.75rem', textAlign: 'center' }}>QTY</Typography>
                        <Typography sx={{ flex: 1, fontWeight: 800, fontSize: '0.75rem', textAlign: 'right' }}>UNIT PRICE</Typography>
                        <Typography sx={{ flex: 1, fontWeight: 800, fontSize: '0.75rem', textAlign: 'right' }}>TOTAL</Typography>
                    </Box>

                    {/* Items */}
                    <Stack spacing={0}>
                        {invoiceOrder?.items.map((item, idx) => (
                            <Box key={idx} sx={{ py: 2.5, px: 1.5, display: 'flex', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 2 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 800 }}>{item.product?.name}</Typography>
                                    <InvoiceProductDetails details={item.customization_details} />
                                </Box>
                                <Typography sx={{ flex: 1, fontWeight: 600, textAlign: 'center' }}>{item.quantity}</Typography>
                                <Typography sx={{ flex: 1, fontWeight: 600, textAlign: 'right' }}>Rs {item.price?.toFixed(2)}</Typography>
                                <Typography sx={{ flex: 1, fontWeight: 800, textAlign: 'right' }}>Rs {(item.price * item.quantity).toFixed(2)}</Typography>
                            </Box>
                        ))}
                    </Stack>

                    {/* Totals */}
                    <Box sx={{ mt: 4, ml: 'auto', maxWidth: 280 }}>
                        <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                <Typography variant="body2" fontWeight={600}>Rs {invoiceOrder?.total_price?.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Shipping</Typography>
                                <Typography variant="body2" fontWeight={600} color="success.main">FREE</Typography>
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" component="div" fontWeight={900}>TOTAL PAID</Typography>
                                <Typography variant="subtitle1" component="div" fontWeight={900} color="primary">Rs {invoiceOrder?.total_price?.toFixed(2)}</Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Thank you for your order!</Typography>
                            <Typography variant="caption" color="text.secondary">For queries: support@arteza.in | arteza.in</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" fontWeight={700} display="block">Authorized Signature</Typography>
                            <Box sx={{ width: 100, borderTop: '1px solid #000', mt: 4 }} />
                        </Box>
                    </Box>
                </Box>

                {/* Invoice Actions */}
                <Box sx={{ p: 2, bgcolor: '#f8fafc', display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
                    <Button autoFocus variant="outlined" onClick={() => setInvoiceOrder(null)} startIcon={<CloseIcon />}>Close</Button>
                    <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Print / Save PDF</Button>
                </Box>

                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #printable-invoice, #printable-invoice * { visibility: visible; }
                        #printable-invoice { position: fixed; top: 0; left: 0; width: 100%; }
                    }
                    
                    /* Fullscreen Support for 3D and Images */
                    .fullscreen-support:fullscreen, 
                    .fullscreen-support:-webkit-full-screen,
                    [id^="frame-3d-container"]:fullscreen,
                    [id^="frame-3d-container"]:-webkit-full-screen,
                    [id^="3d-container"]:fullscreen,
                    [id^="3d-container"]:-webkit-full-screen,
                    .mobile-fallback-fullscreen { 
                        background: #000 !important; 
                        display: flex !important; 
                        align-items: center !important; 
                        justify-content: center !important; 
                        width: 100vw !important;
                        height: 100vh !important;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        z-index: 99999 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-sizing: border-box !important;
                        border: none !important;
                        border-radius: 0 !important;
                    }
                    
                    .fullscreen-support:fullscreen .preview-image,
                    .fullscreen-support:-webkit-full-screen .preview-image,
                    .mobile-fallback-fullscreen .preview-image { 
                        max-height: 100vh !important;
                        max-width: 100vw !important;
                        width: auto !important; 
                        height: auto !important;
                        object-fit: contain;
                    }
                    
                    /* Ensure Canvas fills the fullscreen 3D container */
                    [id^="frame-3d-container"]:fullscreen canvas,
                    [id^="frame-3d-container"]:-webkit-full-screen canvas,
                    [id^="3d-container"]:fullscreen canvas,
                    [id^="3d-container"]:-webkit-full-screen canvas,
                    .mobile-fallback-fullscreen canvas {
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100vw !important;
                        max-height: 100vh !important;
                    }

                    .img-actions { transition: opacity 0.25s ease; }
                    
                    /* Ensure close button is visible in full screen mode */
                    .mobile-fallback-fullscreen .img-actions,
                    .fullscreen-support:fullscreen .img-actions,
                    .fullscreen-support:-webkit-full-screen .img-actions {
                        opacity: 1 !important;
                        background: rgba(0,0,0,0.3) !important;
                    }
                    
                    /* Responsive Dialog Fixes */
                    @media (max-width: 600px) {
                        .production-preview-dialog .MuiDialog-paper {
                            margin: 12px;
                            width: calc(100% - 24px);
                        }
                        .img-actions {
                            opacity: 1 !important; /* Always show icons on mobile since there is no hover */
                            background: rgba(0,0,0,0.3) !important;
                        }
                    }
                `}</style>
            </Dialog>

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                PaperProps={{
                    sx: {
                        bgcolor: '#0f172a',
                        color: '#fff',
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.1)',
                        p: 1
                    }
                }}
            >
                <DialogTitle component="div" sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography sx={{ opacity: 0.8 }}>
                        Are you sure you want to delete order #{deleteConfirm}? This action cannot be undone.
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                        <Button 
                            autoFocus
                            onClick={() => setDeleteConfirm(null)}
                            sx={{ color: '#fff', textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            color="error"
                            onClick={handleDeleteOrder}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                        >
                            Delete Permanently
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* SUCCESS FEEDBACK */}
            <Snackbar
                open={!!successMsg}
                autoHideDuration={6000}
                onClose={() => setSuccessMsg('')}
                message={successMsg}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
};

export default ManageOrders;
