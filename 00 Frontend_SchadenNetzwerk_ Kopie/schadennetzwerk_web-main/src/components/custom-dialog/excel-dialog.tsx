import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslate } from 'src/locales';

import { ConfirmDialogProps } from './types';

// ----------------------------------------------------------------------

export default function ExcelDialog({
  title,
  fileUrl,
  open,
  content,
  onClose,
  ...other
}: ConfirmDialogProps) {
  const { t } = useTranslate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(() => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileUrl.split('/').pop() || 'excel-file.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [fileUrl]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent sx={{ textAlign: 'center', py: 6 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {t('loading')}...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                bgcolor: 'success.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Box
                component="img"
                src="/assets/icons/files/ic_file_excel.svg"
                sx={{ width: 40, height: 40 }}
              />
            </Box>

            <Typography variant="h6" gutterBottom>
              Excel File Preview
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Excel files cannot be previewed directly in the browser.
              Please download the file to view its contents.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleDownload}
              sx={{ minWidth: 200 }}
            >
              Download File
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
