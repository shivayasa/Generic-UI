import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import CustomModal from './Modal';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item?',
  itemName = '',
  confirmButtonText = 'Delete',
  cancelButtonText = 'Cancel',
  data
}) => {
  return (
    <CustomModal
      isModelOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={400}
      modalProps={{
        style: {
          p: 0
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2, pr: 4 }}>
          {title}
        </Typography>
        
        <Typography sx={{ mb: 3 }}>
          {message}
          {itemName && (
            <Typography 
              component="span" 
              sx={{ 
                fontWeight: 'bold', 
                display: 'block', 
                mt: 1 
              }}
            >
              "{itemName}"
            </Typography>
          )}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2, 
          mt: 3 
        }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="primary"
          >
            {cancelButtonText}
          </Button>
          <Button
            onClick={() => {
              onConfirm(data);
              onClose();
            }}
            variant="contained"
            color="error"
            autoFocus
          >
            {confirmButtonText}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default DeleteConfirmationModal;