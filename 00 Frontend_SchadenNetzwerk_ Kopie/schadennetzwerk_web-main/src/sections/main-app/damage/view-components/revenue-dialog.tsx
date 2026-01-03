import "yup-phone-lite";
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from "react";
import { yupResolver } from '@hookform/resolvers/yup';

import Box from "@mui/material/Box";
import Stack from "@mui/system/Stack";
import Dialog from '@mui/material/Dialog';
import Typography from "@mui/material/Typography";
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useTranslate } from "src/locales";
import { ENGINE_TYPES } from "src/constants/viewConstants";
import { completeDamage } from "src/services/firebase/functions";

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFCheckbox, RHFRadioGroup, RHFFormattedNumberField } from "src/components/hook-form";

import { QueryResultType } from "src/types/enums";

type Props = {
  isOpen: boolean;
  damageId: string;
  onClose: () => void;
};

export default function RevenueDialog({ isOpen, damageId, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const handleClose = () => {
    onClose();
    setOpen(false);
  };
  const NewDataSchema = Yup.object().shape({
    revenue: Yup.string().required(t('this_field_is_required')),
    diminished: Yup.string().required(t('this_field_is_required')),
    liabilityRate: Yup.string().optional(),
    fullyComprehensiveRate: Yup.string().optional(),
    controlledInsuranceLossRate: Yup.string().optional(),
    totalLoss: Yup.boolean().required(t('this_field_is_required')),
    isRepaired: Yup.boolean().required(t('this_field_is_required')),
    isCutsApproved: Yup.boolean().required(t('this_field_is_required')),
    engineType: Yup.string().required(t('this_field_is_required')),
  });

  const defaultValues = useMemo(() => ({
    revenue: "",
    diminished: "",
    liabilityRate: "",
    fullyComprehensiveRate: "",
    controlledInsuranceLossRate: "",
    totalLoss: false,
    isRepaired: false,
    isCutsApproved: false,
    engineType: "",
  }), []);

  const methods = useForm({
    resolver: yupResolver(NewDataSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    // Update data values to number format;
    const revenue = Number(data.revenue);
    const diminished = Number(data.diminished);
    const liabilityRate = Number(data.liabilityRate);
    const fullyComprehensiveRate = Number(data.fullyComprehensiveRate);
    const controlledInsuranceLossRate = Number(data.controlledInsuranceLossRate);
    const params = {
      damageId,
      revenue,
      diminished,
      liabilityRate,
      fullyComprehensiveRate,
      controlledInsuranceLossRate,
      totalLoss: data.totalLoss,
      isRepaired: data.isRepaired,
      isCutsApproved: data.isCutsApproved,
      engineType: data.engineType,
    }
    await completeDamage(params)
      .then((res: any) => {
        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          enqueueSnackbar(res.data.msg, {
            variant: 'error',
          });
          return;
        }
        enqueueSnackbar(t('damage_closed_successfully'));
        reset();
        onClose();
        setOpen(false);
      }).catch(err => {
        enqueueSnackbar(t('something_went_wrong'), {
          variant: 'error',
        });
      });
  });

  useEffect(() => {
    setOpen(isOpen);
    reset();
  }, [isOpen, reset]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          {t('input_values_to_close_damage')}
        </DialogTitle>
        <DialogContent>

          <Box sx={{ pt: 1 }} rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
            }}>
            <RHFFormattedNumberField name="revenue" label={t('revenue')} />
            <RHFFormattedNumberField name="diminished" label={t('diminished_value')} />
            <RHFFormattedNumberField name="liabilityRate" label={t('liability_rate')} />
            <RHFFormattedNumberField name="fullyComprehensiveRate" label={t('fully_comprehensive_rate')} />
            <RHFFormattedNumberField name="controlledInsuranceLossRate" label={t('controlled_insurance_loss_rate')} />
          </Box>
          <Box
            sx={{ pt: 2 }}
            rowGap={0}
            columnGap={1}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}>
            <RHFCheckbox name="totalLoss" label={t("total_loss")} />
            <RHFCheckbox name="isRepaired" label={t("is_repaired")} />
            <RHFCheckbox name="isCutsApproved" label={t("cuts_approved")} />
          </Box>
          <Box sx={{ pt: 2 }} rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
            }}>
            <Stack spacing={0}>
              <Typography variant="subtitle2">{t('type_of_engine')}</Typography>
              <RHFRadioGroup row spacing={4} name="engineType" options={ENGINE_TYPES} />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={handleClose} color="error" variant="contained">{t('cancel')}</LoadingButton>
          <LoadingButton loading={isSubmitting} type="submit" variant="contained" color="primary">
            {t('submit')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
