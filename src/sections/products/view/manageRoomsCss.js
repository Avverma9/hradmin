// Styled components
import { Box, styled,Button } from '@mui/material';

export const ModalContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
  paddingBottom: theme.spacing(10),
}));

export const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

export const ImagePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

export const UploadButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

export const RoomItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing(1),
  },
}));

export const RoomActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  position: 'absolute',
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  '& > button': {
    margin: theme.spacing(0.5),
  },
}));

export const RoomImage = styled('img')(({ theme }) => ({
  width: '100px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    width: '80px',
    height: '80px',
  },
}));

export const RoomDetails = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    marginTop: theme.spacing(1),
    textAlign: 'center',
  },
}));
