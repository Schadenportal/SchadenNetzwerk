import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { downloadFileFromStorage } from 'src/utils/common';

import { useTranslate } from 'src/locales';

import { CustomFile } from 'src/components/upload';
import { RHFUpload } from "src/components/hook-form";

type Props = {
  isUsedCar?: boolean,
  getValues: any,
  setValue: any,
}

export default function UploadReport({ isUsedCar, getValues, setValue }: Props) {

  const { t } = useTranslate();

  // Type: 0 => Report files. 1 => Other files

  const handleDrop = useCallback(
    (acceptedFiles: File[], type: number) => {
      const files = type === 0 ? getValues('reportFiles') : getValues('otherFiles');

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      if (type === 0) {
        setValue('reportFiles', [...files, ...newFiles], { shouldValidate: true });
      } else {
        setValue('otherFiles', [...files, ...newFiles], { shouldValidate: true });
      }
    },
    [getValues, setValue]
  );

  const handleRemoveFile = useCallback(
    (inputFile: File | string, type: number) => {
      const originFiles = type === 0 ? getValues('reportFiles') : getValues('otherFiles');
      const filtered = originFiles?.filter((file: string | File) => file !== inputFile);
      if (type === 0) {
        setValue("reportFiles", filtered);
      } else {
        setValue("otherFiles", filtered);
      }
    },
    [getValues, setValue]
  );

  const handleRemoveAllFiles = useCallback((type: number) => {
    if (type === 0) {
      setValue("reportFiles", []);
    } else {
      setValue("otherFiles", []);
    }
  }, [setValue]);

  const handleDownloadFile = useCallback((file: string | CustomFile) => {
    const fileUrl = file as string;
    downloadFileFromStorage(fileUrl);
  }, []);

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        {isUsedCar ? t('upload_used_car_report') : t('upload_cost_estimate_report')}
      </Typography>
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
          <Typography variant='subtitle1' mb={2} color="inherit">
            {isUsedCar ? t('upload_used_car_report') : t('upload_cost_estimate_report')}
          </Typography>
          <RHFUpload
            multiple
            thumbnail
            name="reportFiles"
            maxSize={10485760}
            onDrop={(file) => handleDrop(file, 0)}
            onRemove={(file) => handleRemoveFile(file, 0)}
            onDownload={(file) => handleDownloadFile(file)}
            onRemoveAll={() => handleRemoveAllFiles(0)}
          />
        </Stack>
        <Stack>
          <Typography variant='subtitle1' mb={2} color="inherit">
            {t('upload_other_files')}
          </Typography>
          <RHFUpload
            multiple
            thumbnail
            name="otherFiles"
            maxSize={10485760}
            onDrop={(file) => handleDrop(file, 1)}
            onRemove={(file) => handleRemoveFile(file, 1)}
            onDownload={(file) => handleDownloadFile(file)}
            onRemoveAll={() => handleRemoveAllFiles(1)}
          />
        </Stack>
      </Box>
    </Card>
  )
}
