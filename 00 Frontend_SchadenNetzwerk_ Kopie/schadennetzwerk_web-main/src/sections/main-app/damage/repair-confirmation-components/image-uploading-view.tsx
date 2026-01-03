import { useCallback } from 'react';

import Box from '@mui/system/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { CarImageUpload } from 'src/components/hook-form';

const allImageTypes = [
  { number: 1, imgPath: '2.png', keyName: 'images.frontImages', title: 'diagonal_front_left' },
  { number: 2, imgPath: '6.png', keyName: 'images.rearImages', title: 'diagonal_rear_right' },
  { number: 3, imgPath: '3.png', keyName: 'images.distanceImages', title: 'distance_view_of_repair' },
  { number: 4, imgPath: '7.png', keyName: 'images.closeImages', title: 'close_up_view_of_repair' },
  { number: 5, imgPath: 'vDoc.jpg', keyName: 'images.vehicleDocumentImages', title: 'vehicle_document' },
  { number: 6, imgPath: 'others.jpg', keyName: 'images.otherImages', title: 'miscellaneous' },
];

type Props = {
  getValues: any,
  setValue: any,
}

export default function RepairConfirmationFilesSection({ getValues, setValue }: Props) {
  const { t } = useTranslate();

  const setFiles = useCallback((keyName: string, files: (File & { preview: string })[] | null = null, removeFile: File | string | null = null, isRemoveAll = false) => {
    switch (keyName) {
      case "images.frontImages":
        if (files) {
          const originFiles = getValues("images.frontImages");
          if (originFiles) {
            setValue("images.frontImages", [...originFiles, ...files], { shouldValidate: true });
          }
        }
        if (removeFile) {
          const originFiles = getValues('images.frontImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          if (filtered) {
            setValue("images.frontImages", filtered);
          }
        }
        if (isRemoveAll) {
          setValue("images.frontImages", []);
        }
        break;
      case "images.rearImages":
        if (files) {
          const originFiles = getValues('images.rearImages');
          if (originFiles) {
            setValue("images.rearImages", [...originFiles, ...files], { shouldValidate: true });
          }
        }
        if (removeFile) {
          const originFiles = getValues('images.rearImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          if (filtered) {
            setValue("images.rearImages", filtered);
          }
        }
        if (isRemoveAll) {
          setValue("images.rearImages", []);
        }
        break;
      case "images.distanceImages":
        if (files) {
          const originFiles = getValues('images.distanceImages');
          if (originFiles) {
            setValue("images.distanceImages", [...originFiles, ...files], { shouldValidate: true });
          }
        }
        if (removeFile) {
          const originFiles = getValues('images.distanceImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          if (filtered) {
            setValue("images.distanceImages", filtered);
          }
        }
        if (isRemoveAll) {
          setValue("images.distanceImages", []);
        }
        break;
      case "images.closeImages":
        if (files) {
          const originFiles = getValues('images.closeImages');
          if (originFiles) {
            setValue("images.closeImages", [...originFiles, ...files], { shouldValidate: true });
          }
        }
        if (removeFile) {
          const originFiles = getValues('images.closeImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          if (filtered) {
            setValue("images.closeImages", filtered);
          }
        }
        if (isRemoveAll) {
          setValue("images.closeImages", []);
        }
        break;
      case "images.vehicleDocumentImages":
        if (files) {
          const originFiles = getValues('images.vehicleDocumentImages');
          if (originFiles) {
            setValue("images.vehicleDocumentImages", [...originFiles, ...files], { shouldValidate: true });
          }
        }
        if (removeFile) {
          const originFiles = getValues('images.vehicleDocumentImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          if (filtered) {
            setValue("images.vehicleDocumentImages", filtered);
          }
        }
        if (isRemoveAll) {
          setValue("images.vehicleDocumentImages", []);
        }
        break;
      case "images.otherImages":
        if (files) {
          const originFiles = getValues('images.otherImages');
          if (originFiles) {
            setValue("images.otherImages", [...originFiles, ...files], { shouldValidate: true });
          }
        }
        if (removeFile) {
          const originFiles = getValues('images.otherImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          if (filtered) {
            setValue("images.otherImages", filtered);
          }
        }
        if (isRemoveAll) {
          setValue("images.otherImages", []);
        }
        break;
      default:
        break;
    }
  }, [getValues, setValue]);

  const handleDrop = useCallback(
    (acceptedFiles: File[], keyName: string) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setFiles(keyName, newFiles);
      // setValue(eval(keyName), [...newFiles], { shouldValidate: true });
    },
    [setFiles]
  );

  const handleRemoveFile = useCallback(
    (inputFile: File | string, keyName: string) => {
      setFiles(keyName, null, inputFile)
    },
    [setFiles]
  );

  const handleRemoveAllFiles = useCallback((keyName: string) => {
    setFiles(keyName, null, null, true);
  }, [setFiles]);

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        {t('overview_of_the_repair')}
      </Typography>
      <Box
        marginTop={2}
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(2, 1fr)',
        }}
      >
        {allImageTypes.map(item => (
          <Stack direction="column" key={item.keyName}>
            <Typography variant='h5' sx={{ color: "info.main", my: 2 }}>
              {t(item.title)}
            </Typography>
            <CarImageUpload
              multiple
              thumbnail
              name={item.keyName}
              imgPath={item.imgPath}
              onDrop={(file) => handleDrop(file, item.keyName)}
              onRemove={(file) => handleRemoveFile(file, item.keyName)}
              onRemoveAll={() => handleRemoveAllFiles(item.keyName)}
              onDownload={(file) => console.log(file)}
            />
          </Stack>
        ))}
      </Box>
    </Card>
  )
}
