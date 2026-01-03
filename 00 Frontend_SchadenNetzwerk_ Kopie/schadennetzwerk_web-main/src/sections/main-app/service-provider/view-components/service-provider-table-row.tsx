import { format } from 'date-fns';
import { useCallback } from 'react';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { ADMIN_ROLES } from 'src/constants/viewConstants';
import ServiceProviderModel from 'src/models/ServiceProviderModel';

import Iconify from 'src/components/iconify';
import Label from 'src/components/label/label';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { UserRole, ServiceProviderType } from 'src/types/enums';

import { SERVICE_PROVIDER_OPTIONS } from './service-provider-edit-form';

// ----------------------------------------------------------------------

type Props = {
  row: ServiceProviderModel;
  isDeleting: boolean;
  isSendingContract: boolean;
  disablingId: string;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDisableRow: VoidFunction;
  onEditAppraiserInfo?: VoidFunction;
  onSendContract?: VoidFunction;
  role: string;
};

export default function ServiceProviderTableRow({
  row,
  isDeleting,
  isSendingContract,
  disablingId,
  onDeleteRow,
  onEditRow,
  onDisableRow,
  onEditAppraiserInfo,
  onSendContract,
  role,
}: Props) {
  const {
    serviceProviderId,
    serviceType,
    name,
    email,
    phone,
    isDisabled,
    createdAt,
  } = row;

  const confirm = useBoolean();
  const sendContract = useBoolean();

  const setLabel = useCallback((label: string) => {
    const labelType = SERVICE_PROVIDER_OPTIONS.filter((item) => item.value === label);
    return (
      <Label variant="soft" color={labelType[0].color} sx={{ bgcolor: "white", fontWeight: "bold", fontSize: 18 }} > {labelType[0].abbreviation} </Label>
    )
  }, []);

  const popover = usePopover();
  const { t } = useTranslate();

  return (
    <>
      <TableRow sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, }} hover>
        <TableCell>
          {name}
        </TableCell>

        <TableCell>
          {setLabel(serviceType)}
        </TableCell>

        <TableCell>
          {email}
        </TableCell>

        <TableCell>
          {phone}
        </TableCell>

        <TableCell>
          <ListItemText
            primary={format(createdAt.toDate(), 'dd MMM yyyy')}
            secondary={format(createdAt.toDate(), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell>
          {disablingId === serviceProviderId ? (
            <CircularProgress size={20} />
          ) : (
            <Label
              variant="filled"
              color={isDisabled ? 'error' : 'success'}
            >
              {isDisabled ? t('disabled') : t('active')}
            </Label>
          )}
        </TableCell>

        <TableCell align="right">
          {ADMIN_ROLES.includes(role as UserRole) && (
            <IconButton color="primary" onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow >

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 180 }}
      >
        <MenuItem onClick={() => {
          onDisableRow();
          popover.onClose();
        }}>
          {isDisabled ? (
            <>
              <Iconify icon="fluent:person-arrow-back-24-filled" />
              {t('enable')}
            </>
          ) : (
            <>
              <Iconify icon="material-symbols:person-add-disabled-outline" />
              {t('disable')}
            </>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('edit')}
        </MenuItem>

        {(serviceType === ServiceProviderType.APPRAISER || serviceType === ServiceProviderType.ATTORNEY) && (
          <MenuItem
            onClick={() => {
              sendContract.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="mingcute:mail-send-fill" />
            {t('send_contract')}
          </MenuItem>
        )}

        {serviceType === ServiceProviderType.APPRAISER && onEditAppraiserInfo && (
          <MenuItem
            onClick={() => {
              onEditAppraiserInfo();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:user-id-bold" />
            {t('appraiser_info')}
          </MenuItem>
        )}

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
          <LoadingButton variant="contained" color="error" onClick={onDeleteRow} loading={isDeleting}>
            {t('delete')}
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={sendContract.value}
        onClose={sendContract.onFalse}
        title={t('send_contract')}
        content={t('confirm_send_contract')}
        action={
          <LoadingButton variant="contained" color="primary" onClick={onSendContract} loading={isSendingContract}>
            {t('send_contract')}
          </LoadingButton>
        }
      />
    </>
  );
}
