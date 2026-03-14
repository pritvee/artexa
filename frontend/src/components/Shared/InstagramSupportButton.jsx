import React from 'react';
import { Button } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';

const InstagramSupportButton = () => {
    const openInstagramChat = () => {
        const instagramUrl = "https://ig.me/m/arteza.in";
        window.open(instagramUrl, "_blank");
    };

    return (
        <Button
            variant="contained"
            onClick={openInstagramChat}
            startIcon={<InstagramIcon />}
            sx={{
                mb: 2,
                mt: 2,
                backgroundColor: '#E1306C',
                color: 'white',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                width: '100%',
                padding: '12px',
                '&:hover': {
                    backgroundColor: '#C13584',
                }
            }}
        >
            📷 Need help editing your photo? Chat with us on Instagram
        </Button>
    );
};

export default InstagramSupportButton;
