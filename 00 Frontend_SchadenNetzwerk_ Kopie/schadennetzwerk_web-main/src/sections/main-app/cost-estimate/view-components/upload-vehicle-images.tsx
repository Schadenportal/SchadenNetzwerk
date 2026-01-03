import { useCallback } from "react";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';

import { downloadFileFromStorage } from "src/utils/common";

import { useTranslate } from 'src/locales';

import { CustomFile } from "src/components/upload";
import { CarImageUpload } from "src/components/hook-form";

const allImageTypes = [
  { number: 1, name: 'front_front', imgPath: '1.png', keyName: 'frontImages' },
  { number: 2, name: 'front_left_angled', imgPath: '2.png', keyName: 'frontAngledLeftImages' },
  { number: 3, name: 'front_driver_side', imgPath: '3.png', keyName: 'frontDriverImages' },
  { number: 4, name: 'rear_angled_driver_side', imgPath: '4.png', keyName: 'rearAngledDriverImages' },
  { number: 5, name: 'rear_front', imgPath: '5.png', keyName: 'rearFrontImages' },
  { number: 6, name: 'rear_angled_passenger_side', imgPath: '6.png', keyName: 'rearAngledPassengerImages' },
  { number: 7, name: 'front_passenger_side', imgPath: '7.png', keyName: 'frontPassengerImages' },
  { number: 8, name: 'front_right_angled', imgPath: '8.png', keyName: 'frontRightAngledImages' },
  { number: 9, name: 'roof', imgPath: '9.png', keyName: 'roofImages' },
  { number: 10, name: 'car_below', imgPath: 'car_below.jpeg', keyName: 'carBelowImages' },
  { number: 11, name: 'damage_far', imgPath: '10.png', keyName: 'damageFarImages' },
  { number: 12, name: 'damage_near', imgPath: '11.png', keyName: 'damageNearImages' },
  { number: 13, name: 'damage_additional', imgPath: '12.png', keyName: 'damageAdditionalImages' },
  { number: 14, name: 'speedometer', imgPath: '13.png', keyName: 'speedometerImages' },
  { number: 15, name: 'interior', imgPath: '14.png', keyName: 'interiorImages' },
  { number: 16, name: 'miscellaneous', imgPath: null, keyName: 'miscellaneousImages' },
]

type Props = {
  getValues: any,
  setValue: any,
}

export default function UploadVehicleImages({ getValues, setValue }: Props) {

  const { t } = useTranslate();

  const setFiles = useCallback((keyName: string, files: (File & { preview: string })[] | null = null, removeFile: File | string | null = null, isRemoveAll = false) => {
    switch (keyName) {
      case "frontImages":
        if (files) {
          const originFiles = getValues('frontImages');
          setValue("frontImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('frontImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("frontImages", filtered);
        }
        if (isRemoveAll) {
          setValue("frontImages", []);
        }
        break;
      case "frontAngledLeftImages":
        if (files) {
          const originFiles = getValues('frontAngledLeftImages');
          setValue("frontAngledLeftImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('frontAngledLeftImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("frontAngledLeftImages", filtered);
        }
        if (isRemoveAll) {
          setValue("frontAngledLeftImages", []);
        }
        break;
      case "frontDriverImages":
        if (files) {
          const originFiles = getValues('frontDriverImages');
          setValue("frontDriverImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('frontDriverImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("frontDriverImages", filtered);
        }
        if (isRemoveAll) {
          setValue("frontDriverImages", []);
        }
        break;
      case "rearAngledDriverImages":
        if (files) {
          const originFiles = getValues('rearAngledDriverImages');
          setValue("rearAngledDriverImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('rearAngledDriverImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("rearAngledDriverImages", filtered);
        }
        if (isRemoveAll) {
          setValue("rearAngledDriverImages", []);
        }
        break;
      case "rearFrontImages":
        if (files) {
          const originFiles = getValues('rearFrontImages');
          setValue("rearFrontImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('rearFrontImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("rearFrontImages", filtered);
        }
        if (isRemoveAll) {
          setValue("rearFrontImages", []);
        }
        break;
      case "rearAngledPassengerImages":
        if (files) {
          const originFiles = getValues('rearAngledPassengerImages');
          setValue("rearAngledPassengerImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('rearAngledPassengerImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("rearAngledPassengerImages", filtered);
        }
        if (isRemoveAll) {
          setValue("rearAngledPassengerImages", []);
        }
        break;
      case "frontPassengerImages":
        if (files) {
          const originFiles = getValues('frontPassengerImages');
          setValue("frontPassengerImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('frontPassengerImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("frontPassengerImages", filtered);
        }
        if (isRemoveAll) {
          setValue("frontPassengerImages", []);
        }
        break;
      case "frontRightAngledImages":
        if (files) {
          const originFiles = getValues('frontRightAngledImages');
          setValue("frontRightAngledImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('frontRightAngledImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("frontRightAngledImages", filtered);
        }
        if (isRemoveAll) {
          setValue("frontRightAngledImages", []);
        }
        break;
      case "roofImages":
        if (files) {
          const originFiles = getValues('roofImages');
          setValue("roofImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('roofImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("roofImages", filtered);
        }
        if (isRemoveAll) {
          setValue("roofImages", []);
        }
        break;
      case "carBelowImages":
        if (files) {
          const originFiles = getValues('carBelowImages');
          setValue("carBelowImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('carBelowImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("carBelowImages", filtered);
        }
        if (isRemoveAll) {
          setValue("carBelowImages", []);
        }
        break;
      case "damageFarImages":
        if (files) {
          const originFiles = getValues('damageFarImages');
          setValue("damageFarImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('damageFarImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("damageFarImages", filtered);
        }
        if (isRemoveAll) {
          setValue("damageFarImages", []);
        }
        break;
      case "damageNearImages":
        if (files) {
          const originFiles = getValues('damageNearImages');
          setValue("damageNearImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('damageNearImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("damageNearImages", filtered);
        }
        if (isRemoveAll) {
          setValue("damageNearImages", []);
        }
        break;
      case "damageAdditionalImages":
        if (files) {
          const originFiles = getValues('damageAdditionalImages');
          setValue("damageAdditionalImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('damageAdditionalImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("damageAdditionalImages", filtered);
        }
        if (isRemoveAll) {
          setValue("damageAdditionalImages", []);
        }
        break;
      case "speedometerImages":
        if (files) {
          const originFiles = getValues('speedometerImages');
          setValue("speedometerImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('speedometerImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("speedometerImages", filtered);
        }
        if (isRemoveAll) {
          setValue("speedometerImages", []);
        }
        break;
      case "interiorImages":
        if (files) {
          const originFiles = getValues('interiorImages');
          setValue("interiorImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('interiorImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("interiorImages", filtered);
        }
        if (isRemoveAll) {
          setValue("interiorImages", []);
        }
        break;
      case "miscellaneousImages":
        if (files) {
          const originFiles = getValues('miscellaneousImages');
          setValue("miscellaneousImages", [...originFiles, ...files], { shouldValidate: true });
        }
        if (removeFile) {
          const originFiles = getValues('miscellaneousImages');
          const filtered = originFiles?.filter((file: string | File) => file !== removeFile);
          setValue("miscellaneousImages", filtered);
        }
        if (isRemoveAll) {
          setValue("miscellaneousImages", []);
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

  const handleDownloadFile = useCallback((file: string | CustomFile) => {
    const fileUrl = file as string;
    // const link = document.createElement('a');
    // link.href = fileUrl;
    // link.download = 'filename.jpg'; // Optional, but you can give the file a name
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    downloadFileFromStorage(fileUrl);
  }, []);

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" color="primary" mb={2}>
        {t('upload_car_images')}
      </Typography>
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
        {allImageTypes.map(item => (
          <Stack direction="column" key={item.keyName}>
            <Typography variant='h5' sx={{ color: "info.main", my: 2 }}>
              {t(item.name)}
            </Typography>
            <CarImageUpload
              multiple
              thumbnail
              name={item.keyName}
              imgPath={item.imgPath}
              onDrop={(file) => handleDrop(file, item.keyName)}
              onRemove={(file) => handleRemoveFile(file, item.keyName)}
              onDownload={(file) => handleDownloadFile(file)}
              onRemoveAll={() => handleRemoveAllFiles(item.keyName)}
            />
          </Stack>
        ))}
      </Box>
    </Card>
  )
}
