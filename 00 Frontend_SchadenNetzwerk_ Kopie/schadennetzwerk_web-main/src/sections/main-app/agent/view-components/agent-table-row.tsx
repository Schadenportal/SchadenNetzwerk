import { format } from 'date-fns';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import AgentModel from 'src/models/AgentModel';
import { ADMIN_ROLES } from 'src/constants/viewConstants';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { UserRole } from 'src/types/enums';

// ----------------------------------------------------------------------

type Props = {
  row: AgentModel;
  isDeleting: boolean;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  role: string;
};

export default function AgentTableRow({
  row,
  isDeleting,
  onDeleteRow,
  onEditRow,
  role,
}: Props) {
  const {
    firstName,
    lastName,
    email,
    phone,
    whatsapp,
    createdAt,
  } = row;

  const confirm = useBoolean();
  const popover = usePopover();
  const { t } = useTranslate();

  return (
    <>
      <TableRow sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, }} hover>
        <TableCell>
          {`${firstName} ${lastName}`}
        </TableCell>

        <TableCell>
          {email}
        </TableCell>

        <TableCell>
          {phone}
        </TableCell>

        <TableCell>
          {whatsapp}
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
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
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
          <LoadingButton variant="contained" color="error" onClick={onDeleteRow} loading={isDeleting}>
            {t('delete')}
          </LoadingButton>
        }
      />
    </>
  );
}
