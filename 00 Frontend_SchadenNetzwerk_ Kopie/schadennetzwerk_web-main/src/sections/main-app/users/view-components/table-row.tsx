import { useMemo } from 'react';
import { format } from 'date-fns';

import { Tooltip } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { getUserTypeLabel } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import UserModel from 'src/models/UserModel';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: UserModel;
};

export default function UsersTableRow({
  row,
}: Props) {
  const {
    firstName,
    lastName,
    fullName,
    email,
    phone,
    userStatus,
    role,
  } = row;

  const confirm = useBoolean();

  const popover = usePopover();
  const { t } = useTranslate();

  const renderOnlineStatus = useMemo(() => {
    if (!userStatus || !userStatus.isOnline) {
      return <Label color="error">{t('offline')}</Label>;
    }
    // Check time difference between last login and current time
    const lastLoginAt = userStatus.lastLoginAt.toDate();
    const currentTime = new Date();
    const diff = currentTime.getTime() / 1000 - lastLoginAt.getTime() / 1000;
    if (diff > 60 * 60 * 24) {
      return <Label color="warning">{t('lost_connection')}</Label>;
    }
    return <Label color="success">{t('online')}</Label>;
  }, [t, userStatus]);

  const renderLastOnlineAt = useMemo(() => {
    if (!userStatus) {
      return t('never');
    }
    if (userStatus.lastLoginAt) {
      return format(userStatus.lastLoginAt.toDate(), 'dd MMM yyyy HH:mm');
    }
    return t('never');
  }, [t, userStatus]);

  return (
    <>
      <TableRow hover sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, }}>

        <TableCell>
          {fullName || `${firstName} ${lastName}`}
        </TableCell>

        <TableCell>
          {email}
        </TableCell>

        <TableCell>
          {phone}
        </TableCell>

        <TableCell>
          {t(getUserTypeLabel(role))}
        </TableCell>

        <TableCell>
          {renderOnlineStatus}
        </TableCell>

        <TableCell align="right">
          {renderLastOnlineAt}
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <Tooltip title={t('assign_service_provider')}>
          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="material-symbols:assignment-add-rounded" />
            {t('assign')}
          </MenuItem>
        </Tooltip>
        <Tooltip title={t('edit_workshop')}>
          <MenuItem
            onClick={() => {
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            {t('edit')}
          </MenuItem>
        </Tooltip>
        <Tooltip title={t('delete_workshop')}>
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
        </Tooltip>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('delete')}
        content={t('confirm_delete')}
        action={
          <LoadingButton variant="contained" color="error" onClick={() => console.log("click")}>
            {t('delete')}
          </LoadingButton>
        }
      />
    </>
  );
}
