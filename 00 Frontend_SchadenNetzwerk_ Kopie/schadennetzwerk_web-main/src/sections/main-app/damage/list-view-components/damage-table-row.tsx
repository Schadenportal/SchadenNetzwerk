import { format } from 'date-fns';
import { enqueueSnackbar } from 'notistack';
import { useMemo, useState, useCallback } from 'react';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';
import { Box, Switch, Button, Tooltip, Typography, ButtonGroup, CircularProgress } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import DamageModel from 'src/models/DamageModel';
import ServiceAdviserModel from 'src/models/ServiceAdviserModel';
import { updateDamageInfo, updateRepairApproval } from 'src/services/firebase/functions';
import { WORKSHOP_ROLES, SUPER_ADMIN_ROLES, MAIN_MANAGER_ROLES } from 'src/constants/viewConstants';

import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { UserRole, QueryResultType, DamageStatusType, PaintShopOrderStatus, DamageStatusUpdatingTypes } from 'src/types/enums';

import RevenueDialog from '../view-components/revenue-dialog';

// ----------------------------------------------------------------------

type Props = {
  row: DamageModel;
  currentUserId: string;
  isDeleting: boolean;
  advisers: ServiceAdviserModel[];
  onEditRow: VoidFunction;
  onShowDetail: VoidFunction;
  onDeleteRow: VoidFunction;
  onEditInvoice: VoidFunction;
  onEditPaintShopOrder: VoidFunction;
  role: string;
};

export default function DamageTableRow({
  row,
  currentUserId,
  isDeleting,
  advisers,
  onDeleteRow,
  onEditRow,
  onShowDetail,
  onEditInvoice,
  onEditPaintShopOrder,
  role,
}: Props) {
  const {
    orderNumber,
    customerFirstName,
    customerLastName,
    insuranceType,
    customerVehicleLicensePlate,
    serviceAdvisers,
    damageDate,
    userId,
    repairConfirmId,
    repairApproved,
    isComplaint,
    isInsuranceValuation,
    damageId,
    updatedAt,
    insuranceDamageNumber,
    paintShopOrderStatus,
  } = row;

  const confirm = useBoolean();
  const confirmApprove = useBoolean();
  const popover = usePopover();
  const { t } = useTranslate();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setInsuranceType = useCallback((insurance: string) => {
    switch (insurance) {
      case "fullyComprehensive":
        return (
          <Typography color="primary.main">Vollkasko</Typography>
        )
      case "liability":
        return (
          <Typography color="warning.main">Haftpflicht</Typography>
        )
      case "partiallyComprehensive":
        return (
          <Typography color="info.main">Teilkasko</Typography>
        )
      case "personalLiability":
        return (
          <Typography color="success.main">Haftpflicht Privat</Typography>
        )
      case "commercialLiability":
        return (
          <Typography color="error.main">Haftpflicht Gewerblich</Typography>
        )
      default:
        return ""
    }
  }, [])

  const [checked, setChecked] = useState(repairApproved);
  const [complaint, setIsComplaint] = useState(isComplaint);
  const [insuranceValuation, setIsInsuranceValuation] = useState(isInsuranceValuation);
  const [isUpdatingPaintShopStatus, setIsUpdatingPaintShopStatus] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    confirmApprove.onTrue();
  };

  const handleCompliantChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsComplaint(event.target.checked);
    handleApprove(DamageStatusUpdatingTypes.COMPLAINT, event.target.checked);
  };

  const handleInsuranceValuationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsInsuranceValuation(event.target.checked);
    handleApprove(DamageStatusUpdatingTypes.INSURANCE_VALUATION, event.target.checked);
  };

  const handleApproveConfirmClose = () => {
    confirmApprove.onFalse();
    setChecked(!checked);
  }

  const handleApprove = async (statusType: DamageStatusUpdatingTypes, isChecked: boolean) => {
    setIsSubmitting(true);
    await updateRepairApproval({
      damageId,
      statusType,
      isChecked,
    })
      .then(async (res: any) => {
        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          enqueueSnackbar(res.data.msg, {
            variant: 'error',
          });
          setChecked(!checked);
          return;
        }
        enqueueSnackbar(t('updated_successfully'));
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(err.message, {
          variant: 'error',
        });
        setChecked(!checked);
      }).finally(() => {
        setIsSubmitting(false);
        confirmApprove.onFalse();
      });
  }

  // Get service adviser names
  const serviceAdviserNames = useMemo(() => {
    // Check if serviceAdvisers exists and is an array
    if (!serviceAdvisers || !Array.isArray(serviceAdvisers) || serviceAdvisers.length === 0) {
      return '';
    }

    return serviceAdvisers
      .map((adviserId) => {
        const adviser = advisers.find((adv) => adv.adviserId === adviserId);
        return adviser ? `${adviser.firstName} ${adviser.lastName}` : '';
      })
      .filter(name => name !== '')
      .join(', ');
  }, [serviceAdvisers, advisers]);

  // Handle paint shop status
  const handlePaintShopStatus = async (status: PaintShopOrderStatus) => {
    // create data and updateDamageInfo function
    const data = {
      damageId,
      updatePaintShopStatus: true,
      paintShopOrderStatus: status,
    };
    try {
      // Call the updateDamageInfo function
      setIsUpdatingPaintShopStatus(true);
      const res: any = await updateDamageInfo(data);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      enqueueSnackbar(t('updated_successfully'));
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, {
        variant: 'error',
      });
    } finally {
      setIsUpdatingPaintShopStatus(false);
    }
  };

  return (
    <>
      <TableRow hover
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <TableCell>
          {orderNumber}
        </TableCell>

        <TableCell>
          {setInsuranceType(insuranceType)}
        </TableCell>

        <TableCell>
          {`${customerFirstName} ${customerLastName}`}
        </TableCell>

        <TableCell>
          {customerVehicleLicensePlate}
        </TableCell>

        <TableCell>
          {serviceAdviserNames}
        </TableCell>

        <TableCell>
          {insuranceDamageNumber}
        </TableCell>

        <TableCell>
          {format(updatedAt.toDate(), 'dd MMM yyyy HH:mm')}
        </TableCell>

        <TableCell>
          <Switch
            checked={insuranceValuation}
            onChange={handleInsuranceValuationChange}
            inputProps={{ 'aria-label': 'controlled' }}
            disabled={insuranceValuation}
          />
        </TableCell>

        <TableCell>
          <Switch
            checked={checked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </TableCell>

        <TableCell>
          <Tooltip title={t('Click to Create/Edit Invoice')} arrow placement="top">
            <IconButton
              color="warning"
              onClick={() => {
                onEditInvoice();
                popover.onClose();
              }}
            >
              <Iconify icon="mdi:invoice-text-edit-outline" />
            </IconButton>
          </Tooltip>
        </TableCell>

        <TableCell>
          {[...WORKSHOP_ROLES, UserRole.PaintShop].includes(role as UserRole) && row.paintShopId && (
            isUpdatingPaintShopStatus ? (
              <CircularProgress size={24} />
            ) : (
              <ButtonGroup
                orientation="vertical"
                size="small"
                aria-label="paintshop status button group"
                sx={{
                  minWidth: '24px',
                  '& .MuiButton-root': {
                    border: '1px solid rgba(0,0,0,0.12)',
                    bgcolor: 'background.paper',
                    '&:not(:last-child)': {
                      borderBottom: 'none',
                    },
                  },
                }}
              >
                <Button
                  onClick={() => handlePaintShopStatus(PaintShopOrderStatus.STARTED)}
                  sx={{
                    minWidth: '24px',
                    height: '24px',
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&::before': {
                      content: '""',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      bgcolor: paintShopOrderStatus === PaintShopOrderStatus.STARTED ? '#ff0000' : 'rgba(128, 128, 128, 0.2)',
                      transition: 'all 0.2s',
                      boxShadow: paintShopOrderStatus === PaintShopOrderStatus.STARTED
                        ? '0 0 8px #ff0000, inset 0 0 8px #ff0000'
                        : 'none',
                      border: paintShopOrderStatus === PaintShopOrderStatus.STARTED
                        ? '2px solid #ff0000'
                        : '2px solid rgba(128, 128, 128, 0.3)',
                    },
                    '&:hover::before': {
                      bgcolor: paintShopOrderStatus === PaintShopOrderStatus.STARTED ? '#ff3333' : 'rgba(128, 128, 128, 0.4)',
                    },
                  }}
                />
                <Button
                  onClick={() => handlePaintShopStatus(PaintShopOrderStatus.IN_PROGRESS)}
                  sx={{
                    minWidth: '24px',
                    height: '24px',
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&::before': {
                      content: '""',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      bgcolor: paintShopOrderStatus === PaintShopOrderStatus.IN_PROGRESS ? '#ffff00' : 'rgba(128, 128, 128, 0.2)',
                      transition: 'all 0.2s',
                      boxShadow: paintShopOrderStatus === PaintShopOrderStatus.IN_PROGRESS
                        ? '0 0 8px #ffff00, inset 0 0 8px #ffff00'
                        : 'none',
                      border: paintShopOrderStatus === PaintShopOrderStatus.IN_PROGRESS
                        ? '2px solid #ffff00'
                        : '2px solid rgba(128, 128, 128, 0.3)',
                    },
                    '&:hover::before': {
                      bgcolor: paintShopOrderStatus === PaintShopOrderStatus.IN_PROGRESS ? '#ffff33' : 'rgba(128, 128, 128, 0.4)',
                    },
                  }}
                />
                <Button
                  onClick={() => handlePaintShopStatus(PaintShopOrderStatus.COMPLETED)}
                  sx={{
                    minWidth: '24px',
                    height: '24px',
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&::before': {
                      content: '""',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      bgcolor: paintShopOrderStatus === PaintShopOrderStatus.COMPLETED ? '#00ff00' : 'rgba(128, 128, 128, 0.2)',
                      transition: 'all 0.2s',
                      boxShadow: paintShopOrderStatus === PaintShopOrderStatus.COMPLETED
                        ? '0 0 8px #00ff00, inset 0 0 8px #00ff00'
                        : 'none',
                      border: paintShopOrderStatus === PaintShopOrderStatus.COMPLETED
                        ? '2px solid #00ff00'
                        : '2px solid rgba(128, 128, 128, 0.3)',
                    },
                    '&:hover::before': {
                      bgcolor: paintShopOrderStatus === PaintShopOrderStatus.COMPLETED ? '#33ff33' : 'rgba(128, 128, 128, 0.4)',
                    },
                  }}
                />
              </ButtonGroup>
            )
          )}
        </TableCell>

        <TableCell>
          <Switch
            checked={complaint}
            onChange={handleCompliantChange}
            inputProps={{ 'aria-label': 'controlled' }}
            disabled={complaint}
          />
        </TableCell>

        <TableCell>
          <Tooltip title={t('detail')} arrow placement="top">
            <IconButton color="info" onClick={onShowDetail}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={damageDate ? format(damageDate.toDate(), 'dd MMM yyyy') : ""}
            secondary={damageDate ? format(damageDate.toDate(), 'p') : ""}
            primaryTypographyProps={{
              typography: 'body2',
              noWrap: true,
            }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell align="right">
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0.5,
            maxWidth: '120px'
          }}>
            {([...MAIN_MANAGER_ROLES, UserRole.Appraiser, UserRole.Owner, UserRole.PaintShop, UserRole.ServiceAdviser].includes(role as UserRole) || userId === currentUserId) && (
              <Tooltip title={t('edit')} arrow placement="top">
                <IconButton color="primary" onClick={onEditRow}>
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t('detail')} arrow placement="top">
              <IconButton color="info" onClick={onShowDetail}>
                <Iconify icon="solar:eye-bold" />
              </IconButton>
            </Tooltip>
            {[...WORKSHOP_ROLES].includes(role as UserRole) && row.paintShopId && !row.paintShopPdfUrl && (
              <Tooltip title={t('edit_paint_shop_order')} arrow placement="top">
                <IconButton color="error" onClick={onEditPaintShopOrder}>
                  <Iconify icon="teenyicons:pdf-outline" />
                </IconButton>
              </Tooltip>
            )}
            {row.chatGroupId && (
              <Tooltip title={t('messenger')} arrow placement="top">
                <IconButton
                  color="success"
                  onClick={() => router.push(paths.dashboard.chat.damageChat(row.damageId))}
                >
                  <Iconify icon="heroicons-solid:chat" />
                </IconButton>
              </Tooltip>
            )}
            {[...MAIN_MANAGER_ROLES, UserRole.Appraiser, UserRole.Owner, UserRole.ServiceAdviser].includes(role as UserRole) && !repairConfirmId && (
              <Tooltip title={t('confirm_repair')} arrow placement="top">
                <IconButton
                  color="warning"
                  onClick={() => router.push(paths.dashboard.damages.repair_confirmation(row.damageId))}
                >
                  <Iconify icon="ph:seal-check-light" />
                </IconButton>
              </Tooltip>
            )}
            {[UserRole.Lawyer, UserRole.Owner, UserRole.ServiceAdviser].includes(role as UserRole) && row.status !== DamageStatusType.FINISHED && (
              <Tooltip title={t('close')} arrow placement="top">
                <IconButton color="success" onClick={() => setIsOpen(true)}>
                  <Iconify icon="lets-icons:done-ring-round-light" />
                </IconButton>
              </Tooltip>
            )}
            {(SUPER_ADMIN_ROLES.includes(role as UserRole) || userId === currentUserId) && (
              <Tooltip title={t('delete')} arrow placement="top">
                <IconButton color="error" onClick={confirm.onTrue}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>

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
        open={confirmApprove.value}
        onClose={handleApproveConfirmClose}
        title={t('are_you_sure')}
        content={repairApproved ? t('confirm_unapprove') : t('confirm_approve')}
        action={
          <LoadingButton variant="contained" color="success" onClick={() => handleApprove(DamageStatusUpdatingTypes.APPROVED, checked)} loading={isSubmitting}>
            {t('submit')}
          </LoadingButton>
        }
      />
      <RevenueDialog isOpen={isOpen} damageId={row.damageId} onClose={() => { setIsOpen(false) }} />
    </>
  );
}
