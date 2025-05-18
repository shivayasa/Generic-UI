import React, { useState } from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CustomModal = ({ 
  children, 
  title = 'Modal Title',
  maxWidth = 800,
  modalProps = {},
  isModelOpen= false,
  onClose
}) => {
  const [open, setOpen] = useState(isModelOpen);

  const handleClose = () => setOpen(false);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth,
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 0,
    borderRadius: 1,
    ...modalProps?.style
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby={`modal-${title}`}
        aria-describedby={`modal-description-${title}`}
        {...modalProps}
      >
        <Box sx={modalStyle}>
          <Box sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8, 
            zIndex: 1,
          }}>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
                '&:hover': {
                  color: (theme) => theme.palette.grey[700],
                  backgroundColor: (theme) => theme.palette.grey[100],
                },
                transition: 'all 0.2s',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {children}
        </Box>
      </Modal>
    </div>
  );
};

export default CustomModal;