import { m, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fData } from 'src/utils/format-number';

import { useTranslate } from 'src/locales';

import Lightbox, { useLightBox } from 'src/components/lightbox';

import Iconify from '../iconify';
import { varFade } from '../animate';
import { UploadProps } from './types';
import { PdfDialog } from '../custom-dialog';
import FileThumbnail, { fileData } from '../file-thumbnail';

// ----------------------------------------------------------------------

export type slideFileType = { src: string, fileName: string };

export default function MultiFilePreview({ thumbnail, files, onRemove, onDownload, sx }: UploadProps) {

  const [selectedFiles, setSelectedFiles] = useState<slideFileType[]>([]);
  const [pdfFileUrl, setPdfFileUrl] = useState<string>('');
  const showPdf = useBoolean();
  const { t } = useTranslate();

  const slides = useMemo(() => {
    let fileUrls: slideFileType[] = [];
    if (files) {
      const urls = files.map((item) => {
        if (typeof item !== 'string') {
          return { src: URL.createObjectURL(item), fileName: item.name };
        }
        return { src: item, fileName: "" };
      });
      fileUrls = urls;
    }
    setSelectedFiles(fileUrls);
    return fileUrls;
  }, [files]);

  const lightbox = useLightBox(slides);

  const handlePreview = useCallback((url: string | File) => {
    let fileUrl: string = "";
    if (url instanceof File) {
      const selFiles = selectedFiles.filter((item) => item.fileName === url.name);
      if (selFiles.length) {
        fileUrl = selFiles[0].src;
      }
    } else {
      fileUrl = url;
    }
    if (fileUrl.includes('.pdf')) {
      setPdfFileUrl(fileUrl);
      showPdf.onTrue();
    } else {
      lightbox.onOpen(fileUrl);
    }
  }, [lightbox, selectedFiles, showPdf]);

  return (
    <>
      <AnimatePresence initial={false}>
        {files?.map((file, index) => {
          const { key, name = '', size = 0 } = fileData(file);

          const isNotFormatFile = typeof file === 'string';

          if (thumbnail) {
            return (
              <Stack
                key={index}
                component={m.div}
                {...varFade().inUp}
                alignItems="center"
                display="inline-flex"
                justifyContent="center"
                sx={{
                  m: 0.5,
                  width: 80,
                  height: 80,
                  borderRadius: 1.25,
                  overflow: 'hidden',
                  position: 'relative',
                  border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
                  ...sx,
                }}
              >
                <FileThumbnail
                  tooltip={false}
                  imageView
                  file={file}
                  sx={{ position: 'absolute' }}
                  imgSx={{ position: 'absolute' }}
                  onPreview={handlePreview}
                />

                {onDownload && typeof file === 'string' && (
                  <IconButton
                    size="small"
                    onClick={() => onDownload(file)}
                    sx={{
                      p: 0.5,
                      top: 4,
                      left: 4,
                      position: 'absolute',
                      color: 'success.main',
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                      },
                    }}
                  >
                    <Iconify icon="material-symbols:download" width={14} />
                  </IconButton>
                )}

                {onRemove && (
                  <IconButton
                    size="small"
                    onClick={() => onRemove(file)}
                    sx={{
                      p: 0.5,
                      top: 4,
                      right: 4,
                      position: 'absolute',
                      color: 'error.main',
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                      },
                    }}
                  >
                    <Iconify icon="mingcute:close-line" width={14} />
                  </IconButton>
                )}
              </Stack>
            );
          }

          return (
            <Stack
              key={key}
              component={m.div}
              {...varFade().inUp}
              spacing={2}
              direction="row"
              alignItems="center"
              sx={{
                my: 1,
                py: 1,
                px: 1.5,
                borderRadius: 1,
                border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
                ...sx,
              }}
            >
              <FileThumbnail file={file} />

              <ListItemText
                primary={isNotFormatFile ? file : name}
                secondary={isNotFormatFile ? '' : fData(size)}
                secondaryTypographyProps={{
                  component: 'span',
                  typography: 'caption',
                }}
              />

              {onRemove && (
                <IconButton size="small" onClick={() => onRemove(file)}>
                  <Iconify icon="mingcute:close-line" width={16} />
                </IconButton>
              )}
            </Stack>
          );
        })}
      </AnimatePresence>
      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        onGetCurrentIndex={(index) => lightbox.setSelected(index)}
      />
      <PdfDialog
        open={showPdf.value}
        onClose={showPdf.onFalse}
        title={t('pdf_viewer')}
        fileUrl={pdfFileUrl}
        action=""
      />
    </>
  );
}
