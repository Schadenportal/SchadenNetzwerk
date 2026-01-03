import * as Yup from 'yup';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Stack,
  Container,
  Typography,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import { modifyFileName } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import DamageInvoiceModel from 'src/models/DamageInvoiceModel';
import { uploadFile } from 'src/services/firebase/firebaseStorage';
import { getDocument } from 'src/services/firebase/firebaseFirestore';
import { COLLECTION_DAMAGE_INVOICE_INFO } from 'src/constants/firebase';
import { setInvoiceInfoForDamage } from 'src/services/firebase/functions';

// components
import { useSnackbar } from 'src/components/snackbar';
import CustomDatePicker from 'src/components/date-picker/custom-date-picker';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import FormProvider, {
  RHFUpload,
  RHFTextField,
  RHFRadioGroup,
} from 'src/components/hook-form';

import { UserRole, QueryResultType } from 'src/types/enums';

// ----------------------------------------------------------------------

const InvoiceClaimSchema = Yup.object().shape({
  invoiceTotal: Yup.number()
    .min(0, 'Muss größer als 0 sein / Must be greater than 0'),
  deductionAmount: Yup.number()
    .min(0, 'Muss größer als 0 sein / Must be greater than 0'),
  invoiceNumber: Yup.string(),
  claimNumber: Yup.string(),
  insuranceCompany: Yup.string(),
  workshopName: Yup.string(),
  vehicleOwner: Yup.string(),
  invoiceDate: Yup.mixed<any>().nullable(),
  deductionDate: Yup.mixed<any>().nullable(),
  deductionReason: Yup.string(),
  insuranceContact: Yup.string(),
  legalAction: Yup.string(),
  files: Yup.array(),
  decisionComment: Yup.string().optional(),
});

// ----------------------------------------------------------------------

export default function DamageInvoiceView() {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { id: damageId, invoiceId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [invoiceData, setUsedCarData] = useState<DamageInvoiceModel | null>(null);

  const defaultValues = useMemo(() => (
    {
      invoiceTotal: invoiceData?.invoiceTotal || 0,
      deductionAmount: invoiceData?.deductionAmount || 0,
      invoiceNumber: invoiceData?.invoiceNumber || '',
      claimNumber: invoiceData?.claimNumber || '',
      insuranceCompany: invoiceData?.insuranceCompany || '',
      workshopName: invoiceData?.workshopName || '',
      vehicleOwner: invoiceData?.vehicleOwner || '',
      invoiceDate: invoiceData?.invoiceDate ? invoiceData.invoiceDate.toDate() : null,
      deductionDate: invoiceData?.deductionDate ? invoiceData.deductionDate.toDate() : null,
      deductionReason: invoiceData?.deductionReason || '',
      insuranceContact: invoiceData?.insuranceContact || '',
      legalAction: invoiceData?.legalAction || 'no',
      files: invoiceData?.files || [],
      decisionComment: invoiceData?.decisionComment || '',
    }), [
    invoiceData
  ]);

  const methods = useForm({
    resolver: yupResolver(InvoiceClaimSchema),
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    setValue,
    reset,
  } = methods;

  const invoiceTotal = watch('invoiceTotal');
  const deductionAmount = watch('deductionAmount');
  const openClaim = (invoiceTotal || 0) - (deductionAmount || 0);

  const attachedFiles = watch('files');

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const files = attachedFiles || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('files', [...files, ...newFiles], { shouldValidate: true });
    },
    [attachedFiles, setValue]
  );

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = attachedFiles && attachedFiles?.filter((file) => file !== inputFile);
      setValue('files', filtered);
    },
    [setValue, attachedFiles]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('files', []);
  }, [setValue]);

  const onSubmit = useCallback(
    async (data: any) => {
      try {
        setIsSubmitting(true);

        if (!damageId) {
          enqueueSnackbar('Damage ID not found', { variant: 'error' });
          return;
        }

        // Prepare form data with damageId
        const formData: Record<string, any> = {
          ...data,
          damageId,
        };

        // Remove openClaim from formData as it is not needed to be sent
        delete formData.openClaim;

        // Handle file uploads first
        let fileUrls: string[] = [];
        if (formData.files && formData.files.length > 0) {
          fileUrls = await Promise.all(
            formData.files.map((file: any) => {
              if (file && file instanceof File) {
                const filePath = `damageInvoiceFiles/${format(new Date(), 'yyyy-MM-dd')}/${modifyFileName(file.name)}`;
                return uploadFile(file as File, filePath);
              }
              return ""
            })
          );
          fileUrls = fileUrls.filter(Boolean);

          // Include existing file URLs (strings) if any
          const currentUrls: string[] = formData.files.filter((item: any) => typeof item === "string");
          currentUrls.push(...fileUrls);
          formData.files = currentUrls;
        } else {
          formData.files = [];
        }

        //
        if (invoiceId && invoiceId !== "create") {
          formData.damageInvoiceInfoId = invoiceId; // Use existing invoiceId
        }

        // Call the backend function
        const res: any = await setInvoiceInfoForDamage(formData);
        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          enqueueSnackbar(res.data.msg || 'Failed to submit invoice information', {
            variant: 'error',
          });
          return;
        }

        enqueueSnackbar(
          formData.damageInvoiceInfoId
            ? t('updated_successfully')
            : t('created_successfully'),
          { variant: 'success' }
        );

        // Redirect to damage list page after successful save/update
        setTimeout(() => {
          router.push(paths.dashboard.damages.root);
        }, 1000);
      } catch (error) {
        enqueueSnackbar('Error submitting invoice information / Fehler beim Senden der Rechnungsangaben', {
          variant: 'error'
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [damageId, enqueueSnackbar, invoiceId, router, t]
  );

  const getData = useCallback(async () => {
    if (invoiceId && invoiceId !== 'create') {
      const res = await getDocument(COLLECTION_DAMAGE_INVOICE_INFO, invoiceId, DamageInvoiceModel);
      if (res) {
        setUsedCarData(res);
      }
    }
  }, [invoiceId]);

  const handleNotify = useCallback(async () => {
    if (!invoiceData) {
      enqueueSnackbar('No invoice data available to notify', { variant: 'error' });
      return;
    }

    try {
      setIsNotifying(true);

      // Prepare form data with damageId and convert Timestamp fields to Date objects
      const formData: Record<string, any> = {
        ...invoiceData,
        isForNotification: true,
        // Convert Firestore Timestamps to Date objects or null
        invoiceDate: invoiceData.invoiceDate ? invoiceData.invoiceDate.toDate() : null,
        deductionDate: invoiceData.deductionDate ? invoiceData.deductionDate.toDate() : null,
      };

      // Call the backend function
      const res: any = await setInvoiceInfoForDamage(formData);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg || 'Failed to submit invoice information', {
          variant: 'error',
        });
        return;
      }

      enqueueSnackbar(
        t('sent_notification_successfully'),
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Notification error:', error);
      enqueueSnackbar('Failed to send notification', {
        variant: 'error',
      });
    } finally {
      setIsNotifying(false);
    }
  }, [invoiceData, enqueueSnackbar, t]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reset form values when invoiceData changes
    if (invoiceData) {
      reset(defaultValues);
    }
  }, [invoiceData, reset, defaultValues]);

  return (
    <Container maxWidth={false} sx={{ mt: 0 }}>
      <CustomBreadcrumbs
        heading={t('open_claim_due_to_invoice_deduction')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('damage'), href: paths.dashboard.damages.root },
          { name: t('invoice') },
        ]}
        action=""
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 5 }}>
          <Stack spacing={3}>
            {/* Calculation Section */}
            <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }} color="primary">
                {t('calculation')}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <RHFTextField
                    name="invoiceTotal"
                    label={t('invoice_total')}
                    type="number"
                    InputProps={{
                      endAdornment: '€',
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <RHFTextField
                    name="deductionAmount"
                    label={t('deduction_by_insurance')}
                    type="number"
                    InputProps={{
                      endAdornment: '€',
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <RHFTextField
                    name="openClaim"
                    label={t('open_claim_amount')}
                    value={`${openClaim.toFixed(2)} €`}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontWeight: 'bold',
                        color: 'primary.main',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Card>

            {/* Additional Details Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }} color="primary">
                {t('additional_details')}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="invoiceNumber"
                    label={t('invoice_number')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="claimNumber"
                    label={t('claim_number')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="insuranceCompany"
                    label={t('insurance_company')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="workshopName"
                    label={t('workshop_name')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="vehicleOwner"
                    label={t('vehicle_owner')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="insuranceContact"
                    label={t('insurance_contact_person')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <CustomDatePicker fieldName="invoiceDate" title={t('invoice_date')} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <CustomDatePicker fieldName="deductionDate" title={t('deduction_date')} />
                </Grid>

                <Grid item xs={12}>
                  <RHFTextField
                    name="deductionReason"
                    label={t('reason_for_deduction')}
                    multiline
                    rows={3}
                    placeholder={t('reason_for_deduction_placeholder')}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* File Upload Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }} color="primary">
                {t('file_upload')}
              </Typography>

              <RHFUpload
                multiple
                thumbnail
                name="files"
                maxSize={10485760}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
                helperText="Bitte relevante Unterlagen hochladen (mehrere möglich) / Upload relevant documents (multiple allowed)"
              />
            </Box>

            {/* Decision Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }} color="primary">
                {t('decision')}
              </Typography>

              <Stack spacing={2}>
                <RHFRadioGroup
                  name="legalAction"
                  options={[
                    { label: t('legal_action_yes'), value: 'yes' },
                    { label: t('legal_action_no'), value: 'no' },
                  ]}
                />

                <RHFTextField
                  name="decisionComment"
                  label={t('comment_on_decision')}
                  multiline
                  rows={3}
                />
              </Stack>
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'right', mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={isSubmitting}
                sx={{
                  minWidth: 300,
                  py: 1.5,
                  bgcolor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.dark',
                  },
                }}
              >
                {t((invoiceId && invoiceId === "create") ? 'save' : 'update')}
              </LoadingButton>
              {invoiceId && invoiceId !== "create" && (
                <LoadingButton
                  type="button"
                  variant="contained"
                  size="large"
                  loading={isNotifying}
                  disabled={isNotifying}
                  onClick={handleNotify}
                  sx={{
                    minWidth: 300,
                    py: 1.5,
                    ml: 2,
                    bgcolor: 'info.main',
                    '&:hover': {
                      bgcolor: 'info.dark',
                    },
                  }}
                >
                  {t((user && user.role === UserRole.Owner) ? 'notify_lawyer' : 'notify_workshop')}
                </LoadingButton>
              )}
            </Box>

          </Stack>
        </Card>
      </FormProvider>
    </Container>
  );
}
