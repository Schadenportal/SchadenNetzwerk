// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
import '@react-pdf-viewer/core/lib/styles/index.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useTranslate } from 'src/locales';

import { ConfirmDialogProps } from './types';

// ----------------------------------------------------------------------

export default function PdfDialog({
  title,
  content,
  fileUrl,
  open,
  onClose,
  ...other
}: ConfirmDialogProps) {
  const { t } = useTranslate();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <Dialog fullWidth maxWidth="xl" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent>
        <div
          style={{
            border: '1px solid rgba(0, 0, 0, 0.3)',
            height: '750px',
          }}
        >
          <Viewer
            theme={{
              theme: 'dark',
            }}
            plugins={[
              defaultLayoutPluginInstance,
            ]}
            defaultScale={SpecialZoomLevel.PageWidth}
            fileUrl={fileUrl || ''} />
        </div>
      </DialogContent>

      <DialogActions>

        <Button variant="outlined" color="inherit" onClick={onClose}>
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
