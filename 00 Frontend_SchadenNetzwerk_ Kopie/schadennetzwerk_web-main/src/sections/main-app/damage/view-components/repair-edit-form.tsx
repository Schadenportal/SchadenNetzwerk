
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import DamageModel from 'src/models/DamageModel';
import { WORKSHOP_ROLES } from 'src/constants/viewConstants';
import { createRepairPlan } from 'src/services/firebase/functions';
import { getDamageSnapInfo } from 'src/services/firebase/firebaseFirestore';

import { useSnackbar } from 'src/components/snackbar';
import { CustomDatePicker } from 'src/components/date-picker';
import FormProvider, { RHFSelect, RHFTextField } from "src/components/hook-form";

import { UserRole, QueryResultType } from 'src/types/enums';

export default function RepairEditForm() {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const [damages, setDamages] = useState<DamageModel[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    damageId: Yup.string().required(t('this_field_is_required')),
    expertReport: Yup.mixed<any>().nullable(),
    expertInspection: Yup.mixed<any>().nullable(),
    expertReportReceiptDate: Yup.mixed<any>().nullable(),
    decisionFrom: Yup.mixed<any>().nullable(),
    decisionTo: Yup.mixed<any>().nullable(),
    entryToWorkshop: Yup.mixed<any>().nullable(),
    repairOrder: Yup.mixed<any>().nullable(),
    orderOfParts: Yup.mixed<any>().nullable(),
    arrivalOfParts: Yup.mixed<any>().nullable(),
    repairStartDate: Yup.mixed<any>().nullable(),
    repairInterruptionFrom: Yup.mixed<any>().nullable(),
    repairInterruptionTo: Yup.mixed<any>().nullable(),
    repairResume: Yup.mixed<any>().nullable(),
    entryToPaintShop: Yup.mixed<any>().nullable(),
    paintStartDate: Yup.mixed<any>().nullable(),
    paintEndDate: Yup.mixed<any>().nullable(),
    repairCompletion: Yup.mixed<any>().nullable(),
    pickupReadyDate: Yup.mixed<any>().nullable(),
    pickupDate: Yup.mixed<any>().nullable(),
    totalRepairPeriodFrom: Yup.mixed<any>().nullable(),
    totalRepairPeriodTo: Yup.mixed<any>().nullable(),
    reasonDesc: Yup.string(),
    pointDesc: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      damageId: '',
      expertReport: null,
      expertInspection: null,
      expertReportReceiptDate: null,
      decisionFrom: null,
      decisionTo: null,
      entryToWorkshop: null,
      repairOrder: null,
      orderOfParts: null,
      arrivalOfParts: null,
      repairStartDate: null,
      repairInterruptionFrom: null,
      repairInterruptionTo: null,
      repairResume: null,
      entryToPaintShop: null,
      paintStartDate: null,
      paintEndDate: null,
      repairCompletion: null,
      pickupReadyDate: null,
      pickupDate: null,
      totalRepairPeriodFrom: null,
      totalRepairPeriodTo: null,
      reasonDesc: '',
      pointDesc: '',
    }), []);

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    await createRepairPlan(data)
      .then((res: any) => {
        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          enqueueSnackbar(res.data.msg, {
            variant: 'error',
          });
          return;
        }
        enqueueSnackbar(t('created_successfully'));
        reset();
      }).catch(err => {
        enqueueSnackbar(t('something_went_wrong'), {
          variant: 'error',
        });
      });
  });

  const handleSuccess = useCallback((list: DamageModel[]) => {
    if (user) {
      if ([UserRole.Admin, UserRole.Lawyer, UserRole.Owner, UserRole.ServiceAdviser].includes(user.role)) {
        setDamages(list);
      } else {
        const filteredList = list.filter((item) => item.userId === user.userId);
        setDamages(filteredList);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      let userId: string | undefined;
      let workshopId: string | undefined;
      if ([UserRole.Admin, UserRole.Lawyer].includes(user.role)) {
        userId = undefined;
        workshopId = undefined;
      } else if (WORKSHOP_ROLES.includes(user.role)) {
        userId = undefined;
        workshopId = user.workshopIds?.[0] || undefined;
      } else {
        userId = user?.userId;
        workshopId = undefined;
      }
      const unSubscribe = getDamageSnapInfo(userId, workshopId, handleSuccess);
      return () => {
        unSubscribe();
      }
    }
    return () => { }
  }, [handleSuccess, user]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" color="primary" mb={2}>
          {t('create_repair_plan')}
        </Typography>
        <RHFSelect name="damageId" label={t('select_damage')}>
          {damages.map((damage) => (
            <MenuItem key={damage.damageId} value={damage.damageId}>
              {`${damage.customerFirstName} ${damage.customerLastName} (${damage.customerVehicleLicensePlate})`}
            </MenuItem>
          ))}
        </RHFSelect>
        <Divider sx={{ borderStyle: 'dashed', my: 5 }} />
        <Box
          marginTop={2}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          }}
        >
          <CustomDatePicker fieldName="expertReport" title={t('expert_report')} />
          <CustomDatePicker fieldName="expertInspection" title={t('expert_inspection')} />
          <CustomDatePicker fieldName="expertReportReceiptDate" title={t('expert_report_receipt_date')} />
        </Box>
        <Divider sx={{ borderStyle: 'dashed', my: 5 }} />
        <Box
          marginTop={2}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          }}
        >
          <CustomDatePicker fieldName="decisionFrom" title={t('decision_from')} />
          <CustomDatePicker fieldName="decisionTo" title={t('decision_to')} />
        </Box>
        <Divider sx={{ borderStyle: 'dashed', my: 5 }} />
        <Box
          marginTop={2}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          }}
        >
          <CustomDatePicker fieldName="entryToWorkshop" title={t('entry_to_workshop')} />
          <CustomDatePicker fieldName="repairOrder" title={t('repair_order')} />
          <CustomDatePicker fieldName="orderOfParts" title={t('order_of_parts')} />
          <CustomDatePicker fieldName="arrivalOfParts" title={t('arrival_of_parts')} />
          <CustomDatePicker fieldName="repairStartDate" title={t('repair_start_date')} />
          <CustomDatePicker fieldName="repairInterruptionFrom" title={t('repair_interruption_from')} />
          <CustomDatePicker fieldName="repairInterruptionTo" title={t('repair_interruption_to')} />
          <CustomDatePicker fieldName="repairResume" title={t('repair_resume')} />
          <CustomDatePicker fieldName="entryToPaintShop" title={t('entry_to_paint_shop')} />
          <CustomDatePicker fieldName="paintStartDate" title={t('paint_start_date')} />
          <CustomDatePicker fieldName="paintEndDate" title={t('paint_end_date')} />
          <CustomDatePicker fieldName="repairCompletion" title={t('repair_completion')} />
          <CustomDatePicker fieldName="pickupReadyDate" title={t('pickup_ready_date')} />
          <CustomDatePicker fieldName="pickupDate" title={t('pickup_date')} />
        </Box>
        <Divider sx={{ borderStyle: 'dashed', my: 5 }} />
        <Box
          marginTop={2}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          }}
        >
          <CustomDatePicker fieldName="totalRepairPeriodFrom" title={t('total_repair_period_from')} />
          <CustomDatePicker fieldName="totalRepairPeriodTo" title={t('total_repair_period_to')} />
        </Box>
        <Divider sx={{ borderStyle: 'dashed', my: 5 }} />
        <Box
          marginTop={2}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          }}
        >
          <RHFTextField name="reasonDesc" label={t('reason_desc')} multiline rows={7} />
          <RHFTextField name="pointDesc" label={t('point_desc')} multiline rows={7} />
        </Box>
        <LoadingButton
          color="success"
          size="large"
          type="submit"
          variant="contained"
          sx={{ my: 3, float: 'right' }}
          loading={isSubmitting}
        >
          {t('submit')}
        </LoadingButton>
      </Card>
    </FormProvider>
  );
}
