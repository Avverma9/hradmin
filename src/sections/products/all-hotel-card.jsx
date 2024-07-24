import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';

import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function ShopProductCard({ product }) {
  const navigate = useNavigate();

  const viewDetails = (hotelId) => {
    navigate(`/view-hotel-details/${hotelId}`);
  };
  const renderStatus = (
    <Label
      variant="filled"
      // color={(product.status === 'sale' && 'error') || 'info'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product?.price}
    </Label>
  );

  const renderImg = (
    <Box
      component="img"
      alt={product?.hotelName}
      src={product?.images?.[0]}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  return (
    <Card onClick={() => viewDetails(product.hotelId)}>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {product.price && renderStatus}

        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product?.hotelName}
        </Link>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          Owner - {product?.hotelOwnerName}
        </Link>
      </Stack>
    </Card>
  );
}

ShopProductCard.propTypes = {
  product: PropTypes.object,
};
