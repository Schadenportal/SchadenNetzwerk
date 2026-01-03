import { format } from 'date-fns';

import { Tooltip } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import WorkshopModel from 'src/models/WorkshopModel';
import { ADMIN_ROLES } from 'src/constants/viewConstants';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { UserRole } from 'src/types/enums';

// ----------------------------------------------------------------------

type Props = {
  row: WorkshopModel;
  isDeleting: boolean;
  isSendingContract: boolean;
  onSendContract: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onAssignRow: VoidFunction;
  role: string;
};

export default function WorkshopTableRow({
  row,
  isDeleting,
  isSendingContract,
  onSendContract,
  onEditRow,
  onDeleteRow,
  onAssignRow,
  role,
}: Props) {
  const {
    name,
    email,
    phone,
    city,
    createdAt,
  } = row;

  const confirm = useBoolean();
  const sendContract = useBoolean();

  const popover = usePopover();
  const { t } = useTranslate();

  return (
    <>
      <TableRow hover sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>

        <TableCell>
          {name}
        </TableCell>

        <TableCell>
          {email}
        </TableCell>

        <TableCell>
          {phone}
        </TableCell>

        <TableCell>
          {city}
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

        <TableCell align="right">
          {ADMIN_ROLES.includes(role as UserRole) && (
            <IconButton color="primary" onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 180 }}
      >
        <Tooltip title={t('assign_service_provider')}>
          <MenuItem
            onClick={() => {
              onAssignRow();
              popover.onClose();
            }}
          >
            <Iconify icon="material-symbols:assignment-add-rounded" />
            {t('assign')}
          </MenuItem>
        </Tooltip>
        <Tooltip title={t('send_contract')}>
          <MenuItem
            onClick={() => {
              sendContract.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="mingcute:mail-send-fill" />
            {t('send_contract')}
          </MenuItem>
        </Tooltip>
        <Tooltip title={t('edit_workshop')}>
          <MenuItem
            onClick={() => {
              onEditRow();
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
