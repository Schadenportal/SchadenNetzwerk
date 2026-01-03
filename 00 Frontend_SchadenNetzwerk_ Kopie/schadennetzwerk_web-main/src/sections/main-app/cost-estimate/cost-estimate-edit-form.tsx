import * as Yup from 'yup';
import format from "date-fns/format";
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from "react";
import { yupResolver } from '@hookform/resolvers/yup';

import Stack from '@mui/system/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { modifyFileName } from "src/utils/common";

import { useTranslate } from 'src/locales';
import CostEstimateModel from 'src/models/CostEstimateModel';
import { costEstimationMock } from 'src/_mock/_cost-estimate';
import { uploadFile } from "src/services/firebase/firebaseStorage";
import { setCostEstimationData } from 'src/services/firebase/functions';

import Image from 'src/components/image';
import FormProvider from "src/components/hook-form";
import { useSnackbar } from 'src/components/snackbar';

import { SurchargeTypes, QueryResultType, COST_ESTIMATE_TYPES, CustomerPreferenceTypes } from 'src/types/enums';

import Remarks from './view-components/remarks';
import UploadReport from './view-components/upload-report';
import CostCalculation from './view-components/calculation';
import VehicleDocScan from './view-components/vehicle-doc-scan';
import VehicleCondition from './view-components/vehicle-condition';
import RepairInstructions from './view-components/repair-instructions';
import UploadVehicleImages from './view-components/upload-vehicle-images';

export const fileKeys = [
  "frontImages",
  "frontAngledLeftImages",
  "frontDriverImages",
  "rearAngledDriverImages",
  "rearFrontImages",
  "rearAngledPassengerImages",
  "frontPassengerImages",
  "frontRightAngledImages",
  "roofImages",
  "carBelowImages",
  "damageFarImages",
  "damageNearImages",
  "damageAdditionalImages",
  "speedometerImages",
  "interiorImages",
  "miscellaneousImages",
  "reportFiles",
  "otherFiles",
];

type Props = {
  currentCostEstimate?: CostEstimateModel
}

export default function CostEstimateEditForm({ currentCostEstimate }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const NewCostEstimationSchema = Yup.object().shape({
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
    // Calculation Part
    calculationType: Yup.string(),
    preferenceType: Yup.string(),
    transferCost: Yup.number()
      .test(
        'Is positive?',
        `${t('not_a_valid_number')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    mechanicsHourlyRate: Yup.number()
      .test(
        'Is positive?',
        `${t('not_a_valid_number')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    electricsHourlyRate: Yup.number()
      .test(
        'Is positive?',
        `${t('not_a_valid_number')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    bodyworkHourlyRate: Yup.number()
      .test(
        'Is positive?',
        `${t('not_a_valid_number')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    paintHourlyRate: Yup.number()
      .test(
        'Is positive?',
        `${t('not_a_valid_number')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    paintingMaterialCost: Yup.number()
      .test(
        'Is positive?',
        `${t('not_a_valid_number')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    sparePartSurcharge: Yup.number()
      .test(
        'Is positive?',
        `${t('not_a_valid_number')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    smallPartSurchargeIndication: Yup.string().required(),
    smallPartSurcharge: Yup.number()
      .test(
        'Is positive?',
        `${t('not_a_valid_number')}`,
        (value) => {
          if (value) {
            return value > 0
          }
          return true
        }
      ),
    // Vehicle condition
    general: Yup.string().required(t('this_field_is_required')),
    bodywork: Yup.string().required(t('this_field_is_required')),
    paint: Yup.string().required(t('this_field_is_required')),
    interior: Yup.string().required(t('this_field_is_required')),
    repairedPreviousDamage: Yup.number().required(t('this_field_is_required')),
    existingOldDamage: Yup.number().required(t('this_field_is_required')),
    disassembled: Yup.boolean(),
    roadworthy: Yup.boolean(),
    roadSafe: Yup.boolean(),
    // Remarks
    remarks: Yup.string(),
    // Repair Instructions
    repairInstructions: Yup.string().required(t('this_field_is_required')),
    // File upload
    reportFiles: Yup.array(),
    otherFiles: Yup.array(),
  });

  const defaultValues = useMemo(() => ({
    workshopId: currentCostEstimate?.workshopId || "",
    vehicleData: {
      customerVehicleLicensePlate: currentCostEstimate?.vehicleData.customerVehicleLicensePlate || "",
      customerVehicleVINNumber: currentCostEstimate?.vehicleData.customerVehicleVINNumber || "",
      customerVehicleBrand: currentCostEstimate?.vehicleData.customerVehicleBrand || "",
      customerVehicleModel: currentCostEstimate?.vehicleData.customerVehicleModel || "",
      customerVehicleFirstRegistration: currentCostEstimate?.vehicleData.customerVehicleFirstRegistration?.toDate() || null,
      customerType: currentCostEstimate?.vehicleData.customerType || "PRIVATE_CLIENT",
      customerFirstName: currentCostEstimate?.vehicleData.customerFirstName || "",
      customerLastName: currentCostEstimate?.vehicleData.customerLastName || "",
      customerStreet: currentCostEstimate?.vehicleData.customerStreet || "",
      customerCity: currentCostEstimate?.vehicleData.customerCity || "",
      customerPostalCode: currentCostEstimate?.vehicleData.customerPostalCode || "",
    },
    frontImages: currentCostEstimate?.frontImages || [],
    frontAngledLeftImages: currentCostEstimate?.frontAngledLeftImages || [],
    frontDriverImages: currentCostEstimate?.frontDriverImages || [],
    rearAngledDriverImages: currentCostEstimate?.rearAngledDriverImages || [],
    rearFrontImages: currentCostEstimate?.rearFrontImages || [],
    rearAngledPassengerImages: currentCostEstimate?.rearAngledPassengerImages || [],
    frontPassengerImages: currentCostEstimate?.frontPassengerImages || [],
    frontRightAngledImages: currentCostEstimate?.frontRightAngledImages || [],
    roofImages: currentCostEstimate?.roofImages || [],
    carBelowImages: currentCostEstimate?.carBelowImages || [],
    damageFarImages: currentCostEstimate?.damageFarImages || [],
    damageNearImages: currentCostEstimate?.damageNearImages || [],
    damageAdditionalImages: currentCostEstimate?.damageAdditionalImages || [],
    speedometerImages: currentCostEstimate?.speedometerImages || [],
    interiorImages: currentCostEstimate?.interiorImages || [],
    miscellaneousImages: currentCostEstimate?.miscellaneousImages || [],
    calculationType: currentCostEstimate?.calculationType || COST_ESTIMATE_TYPES.STANDARD,
    preferenceType: currentCostEstimate?.preferenceType || CustomerPreferenceTypes.REPAIR_DESIRED,
    transferCost: currentCostEstimate?.transferCost || 0,
    mechanicsHourlyRate: currentCostEstimate?.mechanicsHourlyRate || 0,
    electricsHourlyRate: currentCostEstimate?.electricsHourlyRate || 0,
    bodyworkHourlyRate: currentCostEstimate?.bodyworkHourlyRate || 0,
    paintHourlyRate: currentCostEstimate?.paintHourlyRate || 0,
    paintingMaterialCost: currentCostEstimate?.paintingMaterialCost || 0,
    sparePartSurcharge: currentCostEstimate?.sparePartSurcharge || 0,
    smallPartSurchargeIndication: currentCostEstimate?.smallPartSurchargeIndication || SurchargeTypes.PERCENT,
    smallPartSurcharge: currentCostEstimate?.smallPartSurcharge || 0,
    general: currentCostEstimate?.general || costEstimationMock.general,
    bodywork: currentCostEstimate?.bodywork || costEstimationMock.bodywork,
    paint: currentCostEstimate?.paint || costEstimationMock.paint,
    interior: currentCostEstimate?.interior || costEstimationMock.interior,
    repairedPreviousDamage: currentCostEstimate?.repairedPreviousDamage || costEstimationMock.repairedPreviousDamage,
    existingOldDamage: currentCostEstimate?.existingOldDamage || costEstimationMock.existingOldDamage,
    disassembled: currentCostEstimate?.disassembled || costEstimationMock.disassembled,
    roadworthy: currentCostEstimate?.roadworthy || costEstimationMock.roadworthy,
    roadSafe: currentCostEstimate?.roadSafe || costEstimationMock.roadSafe,
    remarks: currentCostEstimate?.remarks || costEstimationMock.remarks,
    repairInstructions: currentCostEstimate?.repairInstructions || costEstimationMock.repairInstructions,
    reportFiles: currentCostEstimate?.reportFiles || [],
    otherFiles: currentCostEstimate?.otherFiles || [],
  }), [currentCostEstimate]);

  const methods = useForm({
    resolver: yupResolver(NewCostEstimationSchema),
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
      if (currentCostEstimate) {
        formData.costEstimationId = currentCostEstimate.costEstimationId;
      }
      //
      await Promise.all(fileKeys.map(async (fileKey) => {
        if (formData[fileKey] && formData[fileKey].length) {
          const downloadUrls = await Promise.all(
            formData[fileKey].map((file: any) => {
              if (file && file instanceof File) {
                const filePath = `costEstimation/${fileKey}/${format(new Date(), 'yyyy-MM-dd')}/${modifyFileName(file.name)}`;
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
      const res: any = await setCostEstimationData(formData);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      reset();
      enqueueSnackbar(currentCostEstimate ? t('updated_successfully') : t('created_successfully'));
      router.push(paths.dashboard.cost_estimate.root);
    } catch (err) {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentCostEstimate) {
      reset(defaultValues);
    }
  }, [currentCostEstimate, defaultValues, reset]);

  useEffect(() => {
    if (errors && Object.keys(errors).length !== 0) {
      enqueueSnackbar(t('please_fill_all_required_fields'), {
        variant: 'error',
      });
    }
  }, [enqueueSnackbar, errors, t]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <VehicleDocScan getValues={getValues} setValue={setValue} />
      <UploadVehicleImages getValues={getValues} setValue={setValue} />
      <CostCalculation getValues={getValues} setValue={setValue} watch={watch} />
      <VehicleCondition />
      <Remarks />
      <RepairInstructions />
      <UploadReport getValues={getValues} setValue={setValue} />
      <Stack direction="row" spacing={3} alignContent="center" sx={{ my: 4, float: "right" }}>
        <LoadingButton sx={{ height: "50px", width: "105px" }} onClick={() => window.open('https://www.dat.de/login/', '_blank')}>
          <Image src="/assets/images/dat_horizontal.png" alt="arrow-left" height="50px" />
        </LoadingButton>
        <LoadingButton
          color="success"
          size="large"
          type="submit"
          variant="contained"
          sx={{ height: "50px" }}
          loading={isSubmitting}
        >
          {t('submit')}
        </LoadingButton>
      </Stack>
    </FormProvider>
  )
}
