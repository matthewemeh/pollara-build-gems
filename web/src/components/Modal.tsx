import { useCallback } from 'react';
import { Box, useMediaQuery, Modal as MuiModal, type Theme, type SxProps } from '@mui/material';

interface Props {
  open: boolean;
  onClose?: () => void;
  keepMounted?: boolean;
  children: React.ReactNode;
  extraModalBoxStyle?: SxProps<Theme>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: React.FC<Props> = ({
  open,
  onClose,
  setOpen,
  children,
  keepMounted,
  extraModalBoxStyle,
}) => {
  const matchesMobile = useMediaQuery('(max-width:640px)');
  const modalBoxStyle: SxProps<Theme> = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: matchesMobile ? '85%' : 400,
    overflowY: 'auto',
    maxHeight: '90dvh',
    borderRadius: '1rem',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    ...extraModalBoxStyle,
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [setOpen, onClose]);

  return (
    <MuiModal keepMounted={keepMounted} open={open} onClose={handleClose}>
      <Box sx={modalBoxStyle}>{children}</Box>
    </MuiModal>
  );
};

export default Modal;
