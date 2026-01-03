import * as Yup from 'yup';
import format from "date-fns/format";
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';

import { modifyFileName } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import { uploadFile } from 'src/services/firebase/firebaseStorage';
import { createSupportTicket } from 'src/services/firebase/functions';

import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFUpload, RHFTextField } from 'src/components/hook-form';

import { QueryResultType, SupportResultTypes } from 'src/types/enums';

export default function SupportSectionView() {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const DataSchema = Yup.object().shape({
    name: Yup.string().required(t('this_field_is_required')),
    email: Yup.string().required(t('this_field_is_required')).email(t('email_must_be_valid')),
    subject: Yup.string().required(t('this_field_is_required')),
    content: Yup.string().required(t('this_field_is_required')),
    attachedFiles: Yup.array(),
  });

  const defaultValues = useMemo(() => ({
    name: "",
    email: "",
    subject: "",
    content: "",
    attachedFiles: [],
  }), []);

  const methods = useForm({
    resolver: yupResolver(DataSchema),
    defaultValues
  });

  const {
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const attachedFiles = watch('attachedFiles');

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const files = attachedFiles || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setValue('attachedFiles', [...files, ...newFiles], { shouldValidate: true });
    },
    [attachedFiles, setValue]
  );

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = attachedFiles && attachedFiles?.filter((file) => file !== inputFile);
      setValue('attachedFiles', filtered);
    },
    [setValue, attachedFiles]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('attachedFiles', []);
  }, [setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData: Record<string, any> = {
        ...data,
        status: SupportResultTypes.PENDING,
      }
      let fileUrls: string[] = [];
      if (formData.attachedFiles) {
        fileUrls = await Promise.all(
          formData.attachedFiles.map((file: any) => {
            if (file && file instanceof File) {
              const filePath = `support/${format(new Date(), 'yyyy-MM-dd')}/${modifyFileName(file.name)}`;
              return uploadFile(file as File, filePath);
            }
            return ""
          })
        )
        fileUrls = fileUrls.filter(Boolean);
      }
      if (fileUrls.length) {
        const currentUrls: string[] = formData.attachedFiles.filter((item: any) => typeof item === "string");
        currentUrls.push(...fileUrls);
        formData.attachedFiles = fileUrls;
      }

      const res: any = await createSupportTicket(formData);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      reset();
      enqueueSnackbar(t('created_successfully'));
    } catch (error) {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('support')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('support'), href: paths.dashboard.support },
        ]}
        action=""
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" mb={2} textAlign="center" my={5} sx={{
            width: { xs: "100%", md: "50%" }, marginLeft: "auto", marginRight: "auto",
            color: "info.lighter"
          }}>
            {t('support_desc')}
          </Typography>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
            }}
            sx={{ mx: "auto", mt: "5rem", width: { xs: "100%", md: "50%" } }}
          >
            <RHFTextField name="name" label={t('name')} />
            <RHFTextField name="email" label={t('email')} />
            <RHFTextField name="subject" label={t('subject')} />
            <RHFTextField name="content" label={t('description')} multiline rows={7} />
            <Divider />
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" color="primary">{t('upload_your_files')}</Typography>
              <RHFUpload
                multiple
                thumbnail
                name="attachedFiles"
                maxSize={10485760}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
                onUpload={() => console.info('ON UPLOAD')}
              />
            </Stack>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ bgcolor: "success.main" }}>
                {t('submit')}
              </LoadingButton>
            </Stack>
          </Box>
        </Card>
      </FormProvider>
    </Container>
  )
}
