import * as Yup from 'yup';
import format from "date-fns/format";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { modifyFileName } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { useMainData } from 'src/providers/data-provider';
import TransportDamageModel from 'src/models/TransportDamageModel';
import { uploadFile } from 'src/services/firebase/firebaseStorage';
import { setTransportDamageData } from 'src/services/firebase/functions';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFUpload, RHFSelect, RHFCheckbox, RHFTextField } from "src/components/hook-form";

import { QueryResultType } from 'src/types/enums';

type Props = {
  currentTransportDamage?: TransportDamageModel
}

const fileKeys = ["vinImage", "transportDoc", "otherFiles"];

export default function TransportDamageEditForm({ currentTransportDamage }: Props) {
  const { t } = useTranslate();
  const { workshopInfo } = useMainData();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { user } = useAuthContext();

  const NewDataSchema = Yup.object().shape({
    workshopId: Yup.string().required(t('this_field_is_required')),
    employee: Yup.string().required(t('this_field_is_required')),
    isWaybillAvailable: Yup.boolean().required(),
    waybillNumber: Yup.string(),
    manufacturer: Yup.string().required(t('this_field_is_required')),
    vin: Yup.string().when("vinImage", (vinImage, schema) => {
      if (vinImage[0].length === 0) {
        return Yup.string().required(t('this_field_is_required'));
      }
      return schema;
    }),
    vinImage: Yup.array(),
    transportDoc: Yup.array(),
    isVehicleDamaged: Yup.boolean().required(),
    otherFiles: Yup.array(),
    receiverEmail: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = useMemo(() => ({
    workshopId: currentTransportDamage?.workshopId || "",
    employee: currentTransportDamage?.employee || "",
    isWaybillAvailable: currentTransportDamage?.isWaybillAvailable || false,
    waybillNumber: currentTransportDamage?.waybillNumber || "",
    manufacturer: currentTransportDamage?.manufacturer || "",
    vin: currentTransportDamage?.vin || "",
    vinImage: currentTransportDamage?.vinImage || [],
    transportDoc: currentTransportDamage?.transportDoc || [],
    isVehicleDamaged: currentTransportDamage?.isVehicleDamaged || false,
    otherFiles: currentTransportDamage?.otherFiles || [],
    receiverEmail: currentTransportDamage?.receiverEmail || "",
  }), [currentTransportDamage]);

  const methods = useForm({
    resolver: yupResolver(NewDataSchema),
    defaultValues
  });

  const {
    watch,
    reset,
    getValues,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData: Record<string, any> = {
        ...data
      }
      // If current cost estimation
      if (currentTransportDamage) {
        formData.transportDamageId = currentTransportDamage.transportDamageId;
      }
      //
      await Promise.all(fileKeys.map(async (fileKey) => {
        if (formData[fileKey] && formData[fileKey].length) {
          const downloadUrls = await Promise.all(
            formData[fileKey].map((file: any) => {
              if (file && file instanceof File) {
                const filePath = `transportDamage/${fileKey}/${format(new Date(), 'yyyy-MM-dd')}/${modifyFileName(file.name)}`;
                return uploadFile(file as File, filePath);
              }
              return ""
            })
          )
          const fileUrls = downloadUrls.filter(Boolean);
          const currentUrls: string[] = formData[fileKey].filter((item: any) => typeof item === "string");
          currentUrls.push(...fileUrls);
          formData[fileKey] = currentUrls
        }
      }));
      const res: any = await setTransportDamageData(formData);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      reset();
      enqueueSnackbar(currentTransportDamage ? t('updated_successfully') : t('created_successfully'));
      router.push(paths.dashboard.transport_damage.root);
    } catch (err) {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  });

  // Type: 0 => vin image file, 1 => Other files, 2 => transport paper

  const handleDrop = useCallback(
    (acceptedFiles: File[], type: number) => {
      let files: any[] | undefined = [];
      switch (type) {
        case 0:
          files = getValues('vinImage');
          break;
        case 1:
          files = getValues('otherFiles');
          break;
        default:
          files = getValues('transportDoc');
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      if (type === 0) {
        if (files?.length) {
          setValue('vinImage', [...files, ...newFiles], { shouldValidate: true });
        } else {
          setValue('vinImage', [...newFiles], { shouldValidate: true });
        }
      } else if (type === 1) {
        if (files?.length) {
          setValue('otherFiles', [...files, ...newFiles], { shouldValidate: true });
        } else {
          setValue('otherFiles', [...newFiles], { shouldValidate: true });
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (files?.length) {
          setValue('transportDoc', [...files, ...newFiles], { shouldValidate: true });
        } else {
          setValue('transportDoc', [...newFiles], { shouldValidate: true });
        }
      }
    },
    [getValues, setValue]
  );

  const handleRemoveFile = useCallback(
    (inputFile: File | string, type: number) => {
      let originFiles: any[] | undefined = [];
      switch (type) {
        case 0:
          originFiles = getValues('vinImage');
          break;
        case 1:
          originFiles = getValues('otherFiles');
          break;
        default:
          originFiles = getValues('transportDoc');
      }
      const filtered = originFiles?.filter((file: string | File) => file !== inputFile);
      if (type === 0) {
        setValue("vinImage", filtered);
      } else if (type === 1) {
        setValue("otherFiles", filtered);
      } else {
        setValue("transportDoc", filtered);
      }
    },
    [getValues, setValue]
  );

  const handleRemoveAllFiles = useCallback((type: number) => {
    if (type === 0) {
      setValue("vinImage", []);
    } else if (type === 1) {
      setValue("otherFiles", []);
    } else {
      setValue("transportDoc", []);
    }
  }, [setValue]);

  useEffect(() => {
    if (errors && Object.keys(errors).length !== 0) {
      enqueueSnackbar(t('please_fill_all_required_fields'), {
        variant: 'error',
      });
    }
  }, [enqueueSnackbar, errors, t]);

  useEffect(() => {
    if (currentTransportDamage) {
      reset(defaultValues);
    }
  }, [currentTransportDamage, defaultValues, reset]);

  // const handleDownloadFile = useCallback((file: string | CustomFile) => {
  //   const fileUrl = file as string;
  //   downloadFileFromStorage(fileUrl);
  // }, []);

  const waybillWatch = watch('isWaybillAvailable');
  const watchDamageImageCheck = watch('isVehicleDamaged');

  useEffect(() => {
    if (user && user.role === 'owner') {
      setValue('workshopId', user.workshopIds[0]);
    }
  }, [user, setValue]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" color="primary" mb={2}>
          {t('transport_damage')}
        </Typography>
        <RHFSelect name="workshopId" label={t('workshops')}>
          {workshopInfo.map((workshop) => (
            <MenuItem key={workshop.workshopId} value={workshop.workshopId}>
              {workshop.name}
            </MenuItem>
          ))}
        </RHFSelect>
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
          <RHFTextField name="employee" label={t('employee_customer')} />
          <RHFTextField name="receiverEmail" label={t('receiver_email')} />

        </Box>
        <Box
          marginTop={3}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <RHFCheckbox name="isWaybillAvailable" label={t("waybill_not_available")} />
          <RHFTextField name="waybillNumber" label={t('waybill_number')} disabled={!waybillWatch} />
        </Box>
        <Box
          marginTop={3}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <RHFTextField name="manufacturer" label={t('manufacturer')} />
          <RHFTextField name="vin" label="VIN" />
        </Box>
        <Box
          marginTop={3}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <Stack>
            <Typography variant='subtitle1' color="inherit" mb={2}>
              {t('upload_vin_image')}
            </Typography>
            <RHFUpload
              multiple
              thumbnail
              name="vinImage"
              maxSize={10485760}
              onDrop={(file) => handleDrop(file, 0)}
              onRemove={(file) => handleRemoveFile(file, 0)}
              onRemoveAll={() => handleRemoveAllFiles(0)}
            />
          </Stack>
          <Stack>
            <Typography variant='subtitle1' color="inherit" mb={2}>
              {t('upload_transport_document')}
            </Typography>
            <RHFUpload
              multiple
              thumbnail
              name="transportDoc"
              maxSize={10485760}
              onDrop={(file) => handleDrop(file, 2)}
              onRemove={(file) => handleRemoveFile(file, 2)}
              onRemoveAll={() => handleRemoveAllFiles(2)}
            />
          </Stack>
        </Box>
        <Box
          marginTop={3}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)',
          }}
        >
          <RHFCheckbox name="isVehicleDamaged" label={t("vehicle_damaged")} />
          {watchDamageImageCheck && (<>
            <Typography variant='subtitle1' color="inherit">
              {t('upload_car_damage_images')}
            </Typography>
            <RHFUpload
              multiple
              thumbnail
              name="otherFiles"
              maxSize={10485760}
              onDrop={(file) => handleDrop(file, 1)}
              onRemove={(file) => handleRemoveFile(file, 1)}
              // onDownload={(file) => handleDownloadFile(file)}
              onRemoveAll={() => handleRemoveAllFiles(1)}
            />
          </>)}
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
  )
}
