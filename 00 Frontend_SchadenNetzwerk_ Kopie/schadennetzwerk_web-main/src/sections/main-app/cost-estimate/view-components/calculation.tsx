import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from "@mui/material/MenuItem";
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { setCalculationDefaultData } from 'src/services/firebase/functions';
import { getDefaultCalculationData } from 'src/services/firebase/firebaseFirestore';
import { COST_ESTIMATE_TYPES, CUSTOMER_PREFERENCE_TYPES } from 'src/constants/viewConstants';

import Iconify from 'src/components/iconify/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { RHFSelect, RHFTextField, RHFRadioGroup } from 'src/components/hook-form';

import { SurchargeTypes, QueryResultType, CustomerPreferenceTypes } from 'src/types/enums';

type Props = {
  getValues: any,
  setValue: any,
  watch: any,
}

export default function CostCalculation({ getValues, setValue, watch }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const [defaultStandardCalInfo, setDefaultStandardCalInfo] = useState<null | Record<string, any>>(null);
  const [defaultLiabilityCalInfo, setDefaultLiabilityCalInfo] = useState<null | Record<string, any>>(null);
  const [isSetDefaultInfo, setIsSetDefaultInfo] = useState(false);
  const [isShowCalcSection, setIsShowCalcSection] = useState(true);

  // const calcType = watch('calculationType');
  const preferenceType = watch('preferenceType');

  const setDefaultValuesToFields = () => {
    const calType = getValues("calculationType");
    let data: any;
    if (calType === "standard") {
      data = defaultStandardCalInfo;
    } else {
      data = defaultLiabilityCalInfo;
    }
    setValue("transferCost", data.transferCost, { shouldValidate: true });
    setValue("mechanicsHourlyRate", data.mechanicsHourlyRate, { shouldValidate: true });
    setValue("electricsHourlyRate", data.electricsHourlyRate, { shouldValidate: true });
    setValue("bodyworkHourlyRate", data.bodyworkHourlyRate, { shouldValidate: true });
    setValue("paintHourlyRate", data.paintHourlyRate, { shouldValidate: true });
    setValue("paintingMaterialCost", data.paintingMaterialCost, { shouldValidate: true });
    setValue("sparePartSurcharge", data.sparePartSurcharge, { shouldValidate: true });
    setValue("smallPartSurchargeIndication", data.smallPartSurchargeIndication, { shouldValidate: true });
    setValue("smallPartSurcharge", data.smallPartSurcharge, { shouldValidate: true });
  }

  const saveDefaultCalculationValues = async () => {
    setIsSetDefaultInfo(true);
    const calculationData: Record<string, any> = {
      calculationType: getValues('calculationType'),
      transferCost: getValues('transferCost'),
      mechanicsHourlyRate: getValues('mechanicsHourlyRate'),
      electricsHourlyRate: getValues('electricsHourlyRate'),
      bodyworkHourlyRate: getValues('bodyworkHourlyRate'),
      paintHourlyRate: getValues('paintHourlyRate'),
      paintingMaterialCost: getValues('paintingMaterialCost'),
      sparePartSurcharge: getValues('sparePartSurcharge'),
      smallPartSurchargeIndication: getValues('smallPartSurchargeIndication'),
      smallPartSurcharge: getValues('smallPartSurcharge')
    }
    const calType = getValues("calculationType");
    if (calType === "standard" && defaultStandardCalInfo) {
      calculationData.calculationId = defaultStandardCalInfo.calculationId;
    } else if (calType === "liabilityDamage" && defaultLiabilityCalInfo) {
      calculationData.calculationId = defaultLiabilityCalInfo.calculationId;
    }
    try {
      const res: any = await setCalculationDefaultData(calculationData);
      setIsSetDefaultInfo(false);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      enqueueSnackbar(t('new_default_values_have_been_saved'));
    } catch (error) {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
      setIsSetDefaultInfo(false);
    }
  }

  const getDefaultData = useCallback(async () => {
    if (!user) {
      return;
    }
    const defaultData = await getDefaultCalculationData(user.userId, getValues('calculationType'));
    if (defaultData) {
      defaultData.forEach((data) => {
        if (data.calculationType === "standard") {
          setDefaultStandardCalInfo(data);
        } else {
          setDefaultLiabilityCalInfo(data);
        }
      });
    }
  }, [getValues, user])

  // const resetCalcInfo = useCallback(() => {
  //   setValue("transferCost", 0, { shouldValidate: true });
  //   setValue("mechanicsHourlyRate", 0, { shouldValidate: true });
  //   setValue("electricsHourlyRate", 0, { shouldValidate: true });
  //   setValue("bodyworkHourlyRate", 0, { shouldValidate: true });
  //   setValue("paintHourlyRate", 0, { shouldValidate: true });
  //   setValue("paintingMaterialCost", 0, { shouldValidate: true });
  //   setValue("sparePartSurcharge", 0, { shouldValidate: true });
  //   setValue("smallPartSurchargeIndication", SurchargeTypes.PERCENT, { shouldValidate: true });
  //   setValue("smallPartSurcharge", 0, { shouldValidate: true });
  // }, [setValue]);

  useEffect(() => {
    getDefaultData();
    // resetCalcInfo();
  }, [getDefaultData]);

  useEffect(() => {
    setIsShowCalcSection(preferenceType !== CustomerPreferenceTypes.FICTITIOUS_BILLING);
  }, [preferenceType])


  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        {t('calculation_data')}
      </Typography>
      <Box
        marginTop={2}
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)',
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2">{t('select_calculation_type')}</Typography>
          <RHFRadioGroup row spacing={4} name="calculationType" options={COST_ESTIMATE_TYPES} />
        </Stack>
      </Box>
      <Divider sx={{ my: 3 }} />
      <Box
        marginTop={2}
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)',
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2">{t('customer_preference')}</Typography>
          <RHFRadioGroup row spacing={4} name="preferenceType" options={CUSTOMER_PREFERENCE_TYPES} />
        </Stack>
      </Box>
      {isShowCalcSection && (<>
        <Box
          marginTop={2}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <LoadingButton
            fullWidth
            color="info"
            size="large"
            type="button"
            variant="contained"
            loading={false}
            onClick={setDefaultValuesToFields}
            disabled={
              (getValues('calculationType') === "standard" && !defaultStandardCalInfo) ||
              (getValues('calculationType') === "liabilityDamage" && !defaultLiabilityCalInfo)
            }
          >
            <Iconify icon="game-icons:load" />
            &nbsp;
            {t('insert_standard_values')}
          </LoadingButton>
          <LoadingButton
            fullWidth
            color="success"
            size="large"
            type="button"
            variant="contained"
            loading={isSetDefaultInfo}
            onClick={saveDefaultCalculationValues}
          >
            <Iconify icon="fluent:note-add-16-regular" />
            &nbsp;
            {t('save_standard_values')}
          </LoadingButton>
        </Box>
        <Box
          marginTop={2}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
        >
          <RHFTextField
            type='number'
            name="transferCost"
            label={t('transfer_cost')}
            InputProps={{
              endAdornment: <InputAdornment position="start">EUR</InputAdornment>,
            }}
          />
          <RHFTextField type='number' name="mechanicsHourlyRate" label={t('mechanics_hourly_rate')}
            InputProps={{
              endAdornment: <InputAdornment position="start">EUR</InputAdornment>,
            }}
          />
          <RHFTextField type='number' name="electricsHourlyRate" label={t('electrics_hourly_rate')}
            InputProps={{
              endAdornment: <InputAdornment position="start">EUR</InputAdornment>,
            }} />
          <RHFTextField type='number' name="bodyworkHourlyRate" label={t('bodywork_hourly_rate')}
            InputProps={{
              endAdornment: <InputAdornment position="start">EUR</InputAdornment>,
            }} />
          <RHFTextField type='number' name="paintHourlyRate" label={t('paint_hourly_rate')}
            InputProps={{
              endAdornment: <InputAdornment position="start">EUR</InputAdornment>,
            }} />
          <RHFTextField type='number' name="paintingMaterialCost" label={t('painting_material_cost')} />
          <RHFTextField type='number' name="sparePartSurcharge" label={t('spare_part_surcharge')} />

          <RHFSelect name="smallPartSurchargeIndication" label={t('small_part_surcharge_indication')}>
            <MenuItem value={SurchargeTypes.PERCENT}>{t(SurchargeTypes.PERCENT)}</MenuItem>
            <MenuItem value={SurchargeTypes.EURO}>{t(SurchargeTypes.EURO)}</MenuItem>
          </RHFSelect>
          <RHFTextField type='number' name="smallPartSurcharge" label={t('small_part_surcharge')} />
        </Box>
      </>)}
    </Card>
  )
}
