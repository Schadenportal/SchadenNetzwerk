import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fData } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import { downloadFileFromStorage } from 'src/utils/common';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import { PdfDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

type Props = {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  sx?: any;
  other?: any;
};

export default function FileItem({ fileUrl, fileName, fileSize, createdAt, sx, ...other }: Props) {

  const popover = usePopover();
  const { t } = useTranslate();
  const confirm = useBoolean();

  const renderText = (
    <ListItemText
      primary={fileName}
      secondary={
        <>
          {fData(fileSize)}
          <Box
            sx={{
              mx: 0.75,
              width: 2,
              height: 2,
              borderRadius: '50%',
              bgcolor: 'currentColor',
            }}
          />
          {fDateTime(createdAt)}
        </>
      }
      primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
      secondaryTypographyProps={{
        mt: 0.5,
        component: 'span',
        alignItems: 'center',
        typography: 'caption',
        color: 'text.disabled',
        display: 'inline-flex',
      }}
    />
  );

  const renderAction = (
    <Box
      sx={{
        top: 8,
        right: 8,
        flexShrink: { sm: 0 },
        position: { xs: 'absolute', sm: 'unset' },
      }}
    >
      <IconButton color="primary" onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </Box>
  );

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          gap: 2,
          borderRadius: 2,
          display: 'flex',
          cursor: 'pointer',
          position: 'relative',
          p: { xs: 2.5, sm: 2 },
          alignItems: { xs: 'unset', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          '&:hover': {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          },
          ...sx,
        }}
        {...other}
      >
        <Box
          component="img"
          src="/assets/icons/files/ic_pdf.svg"
          sx={{ width: "2rem", height: 1 }}
        />
        {renderText}
        {renderAction}
      </Paper>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              confirm.onTrue();
            }}
            sx={{ color: 'info.main' }}
          >
            <Iconify icon="carbon:view" />
            {t('view')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
              downloadFileFromStorage(fileUrl);
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="mage:download" />
            {t('download')}
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <PdfDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('pdf_viewer')}
        fileUrl={fileUrl}
        action=""
      />
    </>
  )
}
