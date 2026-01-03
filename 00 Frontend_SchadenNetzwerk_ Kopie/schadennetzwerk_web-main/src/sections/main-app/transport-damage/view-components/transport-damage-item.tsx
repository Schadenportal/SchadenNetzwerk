import { useState } from 'react';
import { format } from 'date-fns';

import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import TransportDamageModel from 'src/models/TransportDamageModel';
import { removeTransportDamage } from 'src/services/firebase/functions';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image/image';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { QueryResultType } from 'src/types/enums';

type Props = {
  item: TransportDamageModel,
  onDeleted: (id: string) => void;
  onEditing: (id: string) => void;
}

export default function TransportDamageItem({ item, onDeleted, onEditing }: Props) {
  const popover = usePopover();
  const { t } = useTranslate();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const [isDeleting, setIsDeleting] = useState(false);

  const onEdit = () => {
    onEditing(item.transportDamageId);
  }

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res: any = await removeTransportDamage({ transportDamageId: item.transportDamageId });
      setIsDeleting(false);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      enqueueSnackbar(t('deleted_successfully'), { variant: 'success' });
      onDeleted(item.transportDamageId);
    } catch (error) {
      setIsDeleting(false);
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  }

  return (
    <>
      <Card sx={{ p: 3, mt: 3 }}>
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 18, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        <Typography variant='subtitle1' color="warning.main">{t('created_by')} {item.employee}</Typography>
        <ListItemText
          sx={{ mb: 1, mt: 2 }}
          primary={item.manufacturer}
          secondary={`${t('created_at')}: ${format(item.createdAt.toDate(), 'dd MMM yyyy')}`}
          primaryTypographyProps={{
            typography: 'subtitle2',
          }}
          secondaryTypographyProps={{
            mt: 1,
            component: 'span',
            typography: 'caption',
            color: 'text.disabled',
          }}
        />

        <Typography variant='body2'>
          VIN: {item.vin}
        </Typography>
        {item.vinImage.length > 0 ? (
          <Image alt='car_image' src={item.vinImage[0]} ratio='21/9' my={2} borderRadius={1} />
        ) : (
          <Image alt='car_image' src='' ratio='21/9' my={2} borderRadius={1} />
        )}
      </Card>


      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            onEdit();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('edit')}
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          {t('delete')}
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('delete')}
        content={t('confirm_delete')}
        action={
          <LoadingButton variant="contained" color="error" onClick={onDelete} loading={isDeleting}>
            {t('delete')}
          </LoadingButton>
        }
      />
    </>
  )
}
