import { Box, Typography } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { styled } from '@mui/material/styles';

const StyledCartBtn = styled('button')(({ theme, fullWidth }) => ({
  width: fullWidth ? '100%' : '180px',
  height: '52px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transitionDuration: '.5s',
  overflow: 'hidden',
  boxShadow: '0px 15px 30px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  color: '#fff',
  fontFamily: 'inherit',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.5)',
  },
  '&:active': {
    transform: 'scale(0.96)',
    transitionDuration: '.2s',
  },
}));

const IconContainer = styled(Box)({
  position: 'absolute',
  left: '-50px',
  width: '36px',
  height: '36px',
  backgroundColor: 'transparent',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  zIndex: 2,
  transitionDuration: '.5s',
  'button:hover &': {
    transform: 'translateX(70px)',
    borderRadius: '40px',
  },
});

const Text = styled(Typography)({
  height: '100%',
  width: 'fit-content',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  zIndex: 1,
  transitionDuration: '.5s',
  fontSize: '15px',
  fontWeight: 900,
  letterSpacing: '0.02em',
  'button:hover &': {
    transform: 'translate(15px, 0px)',
  },
});

const UiverseCartButton = ({ onClick, text = "Add to Cart", fullWidth = false }) => {
  return (
    <StyledCartBtn onClick={onClick} fullWidth={fullWidth}>
      <IconContainer className="IconContainer">
        <ShoppingCartIcon sx={{ fontSize: 22, color: '#6C63FF' }} />
      </IconContainer>
      <Text className="text">{text}</Text>
    </StyledCartBtn>
  );
};

export default UiverseCartButton;
