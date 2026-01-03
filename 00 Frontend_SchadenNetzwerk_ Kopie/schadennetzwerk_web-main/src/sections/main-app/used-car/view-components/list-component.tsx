import { useState } from 'react';
import { format } from 'date-fns';

import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import UsedCarModel from 'src/models/UsedCarModel';
import { removeUsedCar } from 'src/services/firebase/functions';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image/image';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { QueryResultType } from 'src/types/enums';

type Props = {
  item: UsedCarModel,
  onDeleted: (id: string) => void;
  onEditing: (id: string) => void;
}

export default function UsedCarListComp({ item, onDeleted, onEditing }: Props) {
  const popover = usePopover();
  const { t } = useTranslate();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const [isDeleting, setIsDeleting] = useState(false);

  const onEdit = () => {
    onEditing(item.usedCarId);
  }

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res: any = await removeUsedCar({ usedCarId: item.usedCarId });
      setIsDeleting(false);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      enqueueSnackbar(t('deleted_successfully'), { variant: 'success' });
      onDeleted(item.usedCarId);
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

        <Typography variant='subtitle1' color="warning.main">{t('create_used_car')} &nbsp; {format(item.createdAt.toDate(), 'dd MMM yyyy')}</Typography>
        <Image alt='car_image' src={item.frontImages.length ? item.frontImages[0] : "/assets/images/cars/car_sample.png"} borderRadius={1} ratio='16/9' my={2} />
        <Typography variant='caption' mt={2}>
          {item.repairInstructions}
        </Typography>
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
