import { DialogProps } from '@mui/material/Dialog';

// ----------------------------------------------------------------------

export type ConfirmDialogProps = Omit<DialogProps, 'title' | 'content'> & {
  title: React.ReactNode;
  content?: React.ReactNode;
  fileUrl?: string;
  action: React.ReactNode;
  onClose: VoidFunction;
  // Return blob url
  onSaveFile?: (url: string) => void;
};
