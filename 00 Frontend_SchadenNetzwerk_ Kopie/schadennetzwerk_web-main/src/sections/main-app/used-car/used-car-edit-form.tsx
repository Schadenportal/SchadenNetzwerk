import * as Yup from 'yup';
import format from "date-fns/format";
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from "react";
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { modifyFileName } from "src/utils/common";

import { useTranslate } from 'src/locales';
import UsedCarModel from 'src/models/UsedCarModel';
import { costEstimationMock } from 'src/_mock/_cost-estimate';
import { setUsedCarData } from 'src/services/firebase/functions';
import { uploadFile } from "src/services/firebase/firebaseStorage";

import Image from 'src/components/image';
import FormProvider from "src/components/hook-form";
import { useSnackbar } from 'src/components/snackbar';

import { QueryResultType } from 'src/types/enums';

import AboutVehicle from './view-components/about-vehicle';
import Remarks from '../cost-estimate/view-components/remarks';
import VehicleCondition from './view-components/vehicle-condition';
import { fileKeys } from '../cost-estimate/cost-estimate-edit-form';
import UploadReport from '../cost-estimate/view-components/upload-report';
import VehicleDocScan from '../cost-estimate/view-components/vehicle-doc-scan';
import RepairInstructions from '../cost-estimate/view-components/repair-instructions';
import UploadVehicleImages from '../cost-estimate/view-components/upload-vehicle-images';

type Props = {
  currentUsedCarData?: UsedCarModel
}

export default function UsedCarEditForm({ currentUsedCarData }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const NewUsedCarSchema = Yup.object().shape({
    workshopId: Yup.string().required(),
    vehicleData: Yup.object().shape({
      customerVehicleLicensePlate: Yup.string().required(),
      customerVehicleVINNumber: Yup.string().required(),
      customerVehicleBrand: Yup.string().required(),
      customerVehicleModel: Yup.string().required(),
      customerVehicleFirstRegistration: Yup.mixed<any>().nullable(),
      customerType: Yup.string(),
      customerFirstName: Yup.string().required(),
      customerLastName: Yup.string().required(),
      customerStreet: Yup.string(),
      customerCity: Yup.string(),
      customerPostalCode: Yup.string(),
    }).required(),
    frontImages: Yup.array(),
    frontAngledLeftImages: Yup.array(),
    frontDriverImages: Yup.array(),
    rearAngledDriverImages: Yup.array(),
    rearFrontImages: Yup.array(),
    rearAngledPassengerImages: Yup.array(),
    frontPassengerImages: Yup.array(),
    frontRightAngledImages: Yup.array(),
    roofImages: Yup.array(),
    carBelowImages: Yup.array(),
    damageFarImages: Yup.array(),
    damageNearImages: Yup.array(),
    damageAdditionalImages: Yup.array(),
    speedometerImages: Yup.array(),
    interiorImages: Yup.array(),
    miscellaneousImages: Yup.array(),
    vehicleCondition: Yup.object().shape({
      general: Yup.string().required(t('this_field_is_required')),
      bodywork: Yup.string().required(t('this_field_is_required')),
      paint: Yup.string().required(t('this_field_is_required')),
      interior: Yup.string().required(t('this_field_is_required')),
      repairedPreviousDamage: Yup.number().required(t('this_field_is_required')),
      existingOldDamage: Yup.number().required(t('this_field_is_required')),
      disassembled: Yup.boolean(),
      roadworthy: Yup.boolean(),
      roadSafe: Yup.boolean(),
    }).required(),
    aboutVehicle: Yup.object().shape({
      numberOfOwners: Yup.number().required(t('this_field_is_required')),
      isHistoryMaintained: Yup.boolean(),
      lastServiceDate: Yup.mixed<any>().nullable().when('isHistoryMaintained', (val, schema) => {
        if (val[0]) {
          return schema.required(t('this_field_is_required'));
        }
        return schema.nullable();
      }),
      vehicleKeyCount: Yup.number().required(t('this_field_is_required')),
      vehicleFactor: Yup.number().required(t('this_field_is_required')),
      mileage: Yup.string().required(t('this_field_is_required')),
      isImported: Yup.boolean(),
      importCountry: Yup.string().when('isImported', (val, schema) => {
        if (val[0]) {
          return schema.required(t('this_field_is_required'));
        }
        return schema;
      }),
      isAccidentFree: Yup.number(),
      isDocAvailable: Yup.boolean(),
      damageCost: Yup.number().when('isDocAvailable', (val, schema) => {
        if (!val[0]) {
          return schema.required(t('this_field_is_required'));
        }
        return schema;
      }),
      isTUVDue: Yup.boolean(),
      tuvDueDate: Yup.mixed<any>().nullable().when('isTUVDue', (val, schema) => {
        if (!val[0]) {
          return schema.required(t('this_field_is_required'));
        }
        return schema.nullable();
      }),
    }),
    // Remarks
    remarks: Yup.string(),
    // Repair Instructions
    repairInstructions: Yup.string().required(t('this_field_is_required')),
    // File upload
    reportFiles: Yup.array(),
    otherFiles: Yup.array(),
  });

  const defaultValues = useMemo(() => ({
    workshopId: currentUsedCarData?.workshopId || "",
    vehicleData: {
      customerVehicleLicensePlate: currentUsedCarData?.vehicleData.customerVehicleLicensePlate || "",
      customerVehicleVINNumber: currentUsedCarData?.vehicleData.customerVehicleVINNumber || "",
      customerVehicleBrand: currentUsedCarData?.vehicleData.customerVehicleBrand || "",
      customerVehicleModel: currentUsedCarData?.vehicleData.customerVehicleModel || "",
      customerVehicleFirstRegistration: currentUsedCarData?.vehicleData.customerVehicleFirstRegistration?.toDate() || null,
      customerType: currentUsedCarData?.vehicleData.customerType || "PRIVATE_CLIENT",
      customerFirstName: currentUsedCarData?.vehicleData.customerFirstName || "",
      customerLastName: currentUsedCarData?.vehicleData.customerLastName || "",
      customerStreet: currentUsedCarData?.vehicleData.customerStreet || "",
      customerCity: currentUsedCarData?.vehicleData.customerCity || "",
      customerPostalCode: currentUsedCarData?.vehicleData.customerPostalCode || "",
    },
    frontImages: currentUsedCarData?.frontImages || [],
    frontAngledLeftImages: currentUsedCarData?.frontAngledLeftImages || [],
    frontDriverImages: currentUsedCarData?.frontDriverImages || [],
    rearAngledDriverImages: currentUsedCarData?.rearAngledDriverImages || [],
    rearFrontImages: currentUsedCarData?.rearFrontImages || [],
    rearAngledPassengerImages: currentUsedCarData?.rearAngledPassengerImages || [],
    frontPassengerImages: currentUsedCarData?.frontPassengerImages || [],
    frontRightAngledImages: currentUsedCarData?.frontRightAngledImages || [],
    roofImages: currentUsedCarData?.roofImages || [],
    carBelowImages: currentUsedCarData?.carBelowImages || [],
    damageFarImages: currentUsedCarData?.damageFarImages || [],
    damageNearImages: currentUsedCarData?.damageNearImages || [],
    damageAdditionalImages: currentUsedCarData?.damageAdditionalImages || [],
    speedometerImages: currentUsedCarData?.speedometerImages || [],
    interiorImages: currentUsedCarData?.interiorImages || [],
    miscellaneousImages: currentUsedCarData?.miscellaneousImages || [],
    vehicleCondition: {
      general: currentUsedCarData?.vehicleCondition.general || costEstimationMock.general,
      bodywork: currentUsedCarData?.vehicleCondition.bodywork || costEstimationMock.bodywork,
      paint: currentUsedCarData?.vehicleCondition.paint || costEstimationMock.paint,
      interior: currentUsedCarData?.vehicleCondition.interior || costEstimationMock.interior,
      repairedPreviousDamage: currentUsedCarData?.vehicleCondition.repairedPreviousDamage || costEstimationMock.repairedPreviousDamage,
      existingOldDamage: currentUsedCarData?.vehicleCondition.existingOldDamage || costEstimationMock.existingOldDamage,
      disassembled: currentUsedCarData?.vehicleCondition.disassembled || costEstimationMock.disassembled,
      roadworthy: currentUsedCarData?.vehicleCondition.roadworthy || costEstimationMock.roadworthy,
      roadSafe: currentUsedCarData?.vehicleCondition.roadSafe || costEstimationMock.roadSafe,
    },
    aboutVehicle: {
      numberOfOwners: currentUsedCarData?.aboutVehicle.numberOfOwners || costEstimationMock.numberOfOwners,
      isHistoryMaintained: currentUsedCarData?.aboutVehicle.isHistoryMaintained || costEstimationMock.isHistoryMaintained,
      lastServiceDate: currentUsedCarData?.aboutVehicle.lastServiceDate?.toDate() || null,
      vehicleKeyCount: currentUsedCarData?.aboutVehicle.vehicleKeyCount || costEstimationMock.vehicleKeyCount,
      vehicleFactor: currentUsedCarData?.aboutVehicle.vehicleFactor || costEstimationMock.vehicleFactor,
      mileage: currentUsedCarData?.aboutVehicle.mileage || costEstimationMock.mileage,
      isImported: currentUsedCarData?.aboutVehicle.isImported || costEstimationMock.isImported,
      importCountry: currentUsedCarData?.aboutVehicle.importCountry || costEstimationMock.importCountry,
      isAccidentFree: currentUsedCarData?.aboutVehicle.isAccidentFree || costEstimationMock.isAccidentFree,
      isDocAvailable: currentUsedCarData?.aboutVehicle.isDocAvailable || costEstimationMock.isDocAvailable,
      damageCost: currentUsedCarData?.aboutVehicle.damageCost || costEstimationMock.damageCost,
      isTUVDue: currentUsedCarData?.aboutVehicle.isTUVDue || costEstimationMock.isTUVDue,
      tuvDueDate: currentUsedCarData?.aboutVehicle.tuvDueDate?.toDate() || null,
    },
    remarks: currentUsedCarData?.remarks || costEstimationMock.remarks,
    repairInstructions: currentUsedCarData?.repairInstructions || costEstimationMock.repairInstructions,
    reportFiles: currentUsedCarData?.reportFiles || [],
    otherFiles: currentUsedCarData?.otherFiles || [],
  }), [currentUsedCarData]);

  const methods = useForm({
    resolver: yupResolver(NewUsedCarSchema),
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
      if (currentUsedCarData) {
        formData.usedCarId = currentUsedCarData.usedCarId;
      }
      //
      await Promise.all(fileKeys.map(async (fileKey) => {
        if (formData[fileKey] && formData[fileKey].length) {
          const downloadUrls = await Promise.all(
            formData[fileKey].map((file: any) => {
              if (file && file instanceof File) {
                const filePath = `usedCar/${fileKey}/${format(new Date(), 'yyyy-MM-dd')}/${modifyFileName(file.name)}`;
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
      const res: any = await setUsedCarData(formData);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      reset();
      enqueueSnackbar(currentUsedCarData ? t('updated_successfully') : t('created_successfully'));
      router.push(paths.dashboard.used_car.root);
    } catch (err) {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentUsedCarData) {
      reset(defaultValues);
    }
  }, [currentUsedCarData, defaultValues, reset]);

  useEffect(() => {
    if (errors && Object.keys(errors).length !== 0) {
      enqueueSnackbar(t('please_fill_all_required_fields'), {
        variant: 'error',
      });
    }
  }, [enqueueSnackbar, errors, t]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <AboutVehicle watch={watch} setValue={setValue} />
      <VehicleDocScan getValues={getValues} setValue={setValue} />
      <UploadVehicleImages getValues={getValues} setValue={setValue} />
      <VehicleCondition />
      <Remarks title='used_car_remarks_desc' />
      <RepairInstructions title='used_car_repair_notes_desc' />
      <UploadReport isUsedCar getValues={getValues} setValue={setValue} />
      <Stack direction="row" spacing={3} alignContent="center" sx={{ my: 4, float: "right" }}>
        <LoadingButton sx={{ height: "50px", width: "105px" }} onClick={() => window.open('https://www.dat.de/login/', '_blank')}>
          <Image src="/assets/images/dat_horizontal.png" alt="arrow-left" height="50px" />
        </LoadingButton>
        <LoadingButton
          color="success"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          {t('submit')}
        </LoadingButton>
      </Stack>
    </FormProvider>
  )
}
