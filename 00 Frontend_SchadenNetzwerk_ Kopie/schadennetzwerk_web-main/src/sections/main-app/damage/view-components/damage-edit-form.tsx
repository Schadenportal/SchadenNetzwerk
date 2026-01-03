import "yup-phone-lite";
import * as Yup from 'yup';
import format from "date-fns/format";
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { trimPhoneNumber, checkAndTrimWhatsAppNumber } from "src/utils/common";

import { useTranslate } from 'src/locales';
import { damageMock } from "src/_mock/_damage";
import AgentModel from "src/models/AgentModel";
import DamageModel from "src/models/DamageModel";
import { useMainData } from "src/providers/data-provider";
import { setDamage } from "src/services/firebase/functions";
import { uploadFile } from "src/services/firebase/firebaseStorage";
import { useDocScanData } from "src/providers/damage-scan-provider";

import Image from 'src/components/image';
import FormProvider from "src/components/hook-form";
import { useSnackbar } from 'src/components/snackbar';

import { QueryResultType, ServiceProviderType } from "src/types/enums";

import DamageManualSet from "./damage-manual-set";
import DamageEditDamageForm from "./damage-edit-damage";
import DamageEditGeneralForm from "./damage-edit-general";
import DamageEditTortfeasorForm from "./damage-edit-tortfeasor";
import DamageEditInjuredPartyForm from "./damage-edit-injured-party";
import DamageEditServiceProviderForm from "./damage-edit-service-provider";
// ----------------------------------------------------------------------

type Props = {
  currentDamage?: DamageModel;
};

export default function DamageEditForm({ currentDamage }: Props) {
  const router = useRouter();
  const { t } = useTranslate();
  const { docInfo, setDocInfo } = useDocScanData();
  const { serviceProvider } = useMainData();
  const [selectedAgent, setSelectedAgent] = useState<AgentModel | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    onBehalfType: Yup.string().optional().nullable(), // Remove in the API
    insuranceAgent: Yup.string().optional().nullable(),
    appraiserRef: Yup.string().optional().nullable(),
    workshopId: Yup.string().when(['insuranceAgent'], {
      is: (insuranceAgent: string) => (serviceProvider && (serviceProvider.serviceType === ServiceProviderType.APPRAISER || serviceProvider.serviceType === ServiceProviderType.ATTORNEY)) || !insuranceAgent,
      then: (schema) => schema.optional().nullable(),
      otherwise: (schema) => schema.required(t('please_select_workshop')),
    }),
    serviceAdvisers: Yup.array().optional(),
    serviceManager: Yup.string(),
    serviceClerk: Yup.string(),
    insuranceName: Yup.string().nullable(),
    insuranceNumber: Yup.string(),
    insuranceDamageNumber: Yup.string(),
    hasPreviousDamage: Yup.number().oneOf([0, 1]),
    wasAmountKnown: Yup.number().oneOf([0, 1]),
    knownAmount: Yup.number().min(0),
    // General =====

    insuranceType: Yup.string(), // Default first one
    controlled: Yup.boolean(), // Default false
    quotation: Yup.boolean(), // Default false
    damageDate: Yup.mixed<any>().required(t('please_select_damage_date')),
    damageCity: Yup.string(),
    damageCountry: Yup.string(),
    damagedVehicleLocation: Yup.string(),
    damageNumber: Yup.string(),
    accidentWithInjuries: Yup.boolean(),
    accidentWithWitnesses: Yup.boolean(),
    accidentPoliceRecorded: Yup.boolean(),
    driverAtAccident: Yup.string(),
    accidentDescription: Yup.string(), // Accident ====

    customerType: Yup.string(),
    customerFirstName: Yup.string().required(t('firstName_is_required')),
    customerLastName: Yup.string().when('customerType', {
      is: "PRIVATE_CLIENT",
      then: (schema) => schema.required(t('lastName_is_required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    customerEmail: Yup.string().required(t('email_is_required')),
    customerPhone: Yup.string().phone("DE", `${t('phone_number_is_not_valid')}`).required(t('phone_number_is_required')),
    customerWhatsapp: Yup.string(),
    customerTelephone: Yup.string(),
    customerStreet: Yup.string().required(t('street_is_required')),
    customerCountry: Yup.string().required(t('country_is_required')),
    customerCity: Yup.string().required(t('city_is_required')),
    customerPostalCode: Yup.string().required(t('postal_code_is_required')),
    customerNumber: Yup.string(),
    customerLandline: Yup.string(),
    customerContactPerson: Yup.string(),
    customerDriverLicenseNumber: Yup.string(),
    injuredPartyInformation: Yup.string(),
    damagingNote: Yup.string(),
    customerBankHolder: Yup.string(),
    customerBankIBAN: Yup.string(),
    customerBank: Yup.string(),
    customerBankBIC: Yup.string(),
    customerVehicleLicensePlate: Yup.string().required(t('license_plate_number_is_required')),
    customerVehicleVINNumber: Yup.string(),
    customerVehicleBrand: Yup.string().required(t('please_select_car_brand')),
    customerVehicleModel: Yup.string().required(t('please_select_car_model')),
    customerVehicleCategory: Yup.string(),
    customerVehicleFirstRegistration: Yup.mixed<any>().nullable(),
    customerVehicleOwnerType: Yup.string(),
    customerVehicleLeasingCompany: Yup.string().nullable(),
    customerVehicleOwnerBank: Yup.string().nullable(),
    customerVehicleExcess: Yup.string(),
    customerVehicleMileage: Yup.string(), // Customer part
    customerTaxDeduction: Yup.number(),

    tortfeasorSalutation: Yup.string(),
    tortfeasorFirstName: Yup.string().required(t('firstName_is_required')),
    tortfeasorLastName: Yup.string().when('tortfeasorSalutation', {
      is: 'COMPANY',
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required(t('lastName_is_required')),
    }),
    tortfeasorEmail: Yup.string(),
    tortfeasorPhone: Yup.string().phone("DE", `${t('phone_number_is_not_valid')}`),
    tortfeasorStreet: Yup.string(),
    tortfeasorCountry: Yup.string(),
    tortfeasorCity: Yup.string(),
    tortfeasorPostalCode: Yup.string(),
    tortfeasorLandline: Yup.string(),
    tortfeasorVehicleLicensePlate: Yup.string().required(t('license_plate_number_is_required')),
    tortfeasorVehicleCategory: Yup.string(),
    tortfeasorVehicleBrand: Yup.string().nullable(),
    tortfeasorInformation: Yup.string(),
    tortfeasorInsuranceName: Yup.string().nullable(),
    tortfeasorInsuranceNumber: Yup.string(), // Tortfeasor part

    attorneyId: Yup.string().nullable(),
    descriptionForAttorney: Yup.string(),
    appraiserId: Yup.string().nullable(),
    descriptionForAppraiser: Yup.string(),
    carRentalId: Yup.string(),
    descriptionForCarRental: Yup.string(),
    paintShopId: Yup.string(),
    paintShopPdf: Yup.string().nullable(),
    descriptionForPaintShop: Yup.string(),
    towingServiceId: Yup.string(),
    descriptionForTowingService: Yup.string(), // Service provider
    isRkuOn: Yup.bool(),
    isRepairScheduleOn: Yup.bool(),
    willSendPriceList: Yup.bool(),

    isManualCreating: Yup.bool(),
    willSendDelayedReminder: Yup.bool(),
  });

  const defaultValues = useMemo(
    () => ({
      onBehalfType: 'agent', // Remove in the API
      insuranceAgent: currentDamage?.insuranceAgent || '',
      appraiserRef: currentDamage?.appraiserRef || '',
      workshopId: currentDamage?.workshopId || '',
      serviceAdvisers: currentDamage?.serviceAdvisers || [],
      serviceManager: currentDamage?.serviceManager || '',
      serviceClerk: currentDamage?.serviceClerk || '',
      insuranceName: currentDamage?.insuranceName || '',
      insuranceNumber: currentDamage?.insuranceNumber || '',
      insuranceDamageNumber: currentDamage?.insuranceDamageNumber || '',
      hasPreviousDamage: currentDamage?.hasPreviousDamage || 0,
      wasAmountKnown: currentDamage?.wasAmountKnown || 0,
      knownAmount: currentDamage?.knownAmount || 0,
      // General =====

      insuranceType: currentDamage?.insuranceType || 'liability', // Default first one
      controlled: currentDamage?.controlled || false, // Default false
      quotation: currentDamage?.quotation || false, // Default false
      damageDate: currentDamage?.damageDate?.toDate() || new Date(),
      damageCity: currentDamage?.damageCity || '',
      damageCountry: currentDamage?.damageCountry || '',
      damagedVehicleLocation: currentDamage?.damagedVehicleLocation || '',
      damageNumber: currentDamage?.damageNumber || '',
      accidentWithInjuries: currentDamage?.accidentWithInjuries || false,
      accidentWithWitnesses: currentDamage?.accidentWithWitnesses || false,
      accidentPoliceRecorded: currentDamage?.accidentPoliceRecorded || false,
      driverAtAccident: currentDamage?.driverAtAccident || 'customerDriver',
      accidentDescription: currentDamage?.accidentDescription || '', // Accident ====

      customerType: currentDamage?.customerType || "PRIVATE_CLIENT",
      customerFirstName: currentDamage?.customerFirstName || damageMock.customerFirstName,
      customerLastName: currentDamage?.customerLastName || damageMock.customerLastName,
      customerEmail: currentDamage?.customerEmail || damageMock.customerEmail,
      customerPhone: currentDamage?.customerPhone || damageMock.customerPhone,
      customerTelephone: currentDamage?.customerTelephone || '',
      customerWhatsapp: currentDamage?.customerWhatsapp || '',
      customerStreet: currentDamage?.customerStreet || damageMock.customerStreet,
      customerCountry: currentDamage?.customerCountry || damageMock.customerCountry,
      customerCity: currentDamage?.customerCity || damageMock.customerCity,
      customerPostalCode: currentDamage?.customerPostalCode || '',
      customerNumber: currentDamage?.customerNumber || '',
      customerLandline: currentDamage?.customerLandline || '',
      customerContactPerson: currentDamage?.customerContactPerson || '',
      customerDriverLicenseNumber: currentDamage?.customerDriverLicenseNumber || '',
      injuredPartyInformation: currentDamage?.injuredPartyInformation || '',
      damagingNote: currentDamage?.damagingNote || '',
      customerBankHolder: currentDamage?.customerBankHolder || '',
      customerBankIBAN: currentDamage?.customerBankIBAN || '',
      customerBank: currentDamage?.customerBank || '',
      customerBankBIC: currentDamage?.customerBankBIC || '',
      customerVehicleLicensePlate: currentDamage?.customerVehicleLicensePlate || damageMock.customerVehicleLicensePlate,
      customerVehicleVINNumber: currentDamage?.customerVehicleVINNumber || damageMock.customerVehicleVINNumber,
      customerVehicleBrand: currentDamage?.customerVehicleBrand || '',
      customerVehicleModel: currentDamage?.customerVehicleModel || '',
      customerVehicleCategory: currentDamage?.customerVehicleCategory || 'PKW',
      customerVehicleFirstRegistration: currentDamage && currentDamage.customerVehicleFirstRegistration ? currentDamage.customerVehicleFirstRegistration.toDate() : null,
      customerVehicleOwnerType: currentDamage?.customerVehicleOwnerType || '',
      customerVehicleLeasingCompany: currentDamage?.customerVehicleLeasingCompany || null,
      customerVehicleOwnerBank: currentDamage?.customerVehicleOwnerBank || null,
      customerVehicleExcess: currentDamage?.customerVehicleExcess || '',
      customerVehicleMileage: currentDamage?.customerVehicleMileage || '', // Customer part
      customerTaxDeduction: currentDamage?.customerTaxDeduction || -1,

      tortfeasorSalutation: currentDamage?.tortfeasorSalutation || '',
      tortfeasorFirstName: currentDamage?.tortfeasorFirstName || damageMock.tortfeasorFirstName,
      tortfeasorLastName: currentDamage?.tortfeasorLastName || damageMock.tortfeasorLastName,
      tortfeasorEmail: currentDamage?.tortfeasorEmail || damageMock.tortfeasorEmail,
      tortfeasorPhone: currentDamage?.tortfeasorPhone || damageMock.tortfeasorPhone,
      tortfeasorStreet: currentDamage?.tortfeasorStreet || damageMock.tortfeasorStreet,
      tortfeasorCountry: currentDamage?.tortfeasorCountry || 'Deutschland',
      tortfeasorCity: currentDamage?.tortfeasorCity || damageMock.tortfeasorCity,
      tortfeasorPostalCode: currentDamage?.tortfeasorPostalCode || '',
      tortfeasorLandline: currentDamage?.tortfeasorLandline || '',
      tortfeasorVehicleLicensePlate: currentDamage?.tortfeasorVehicleLicensePlate || damageMock.tortfeasorVehicleLicensePlate,
      tortfeasorVehicleCategory: currentDamage?.tortfeasorVehicleCategory || '',
      tortfeasorVehicleBrand: currentDamage?.tortfeasorVehicleBrand || '',
      tortfeasorInformation: currentDamage?.tortfeasorInformation || '',
      tortfeasorInsuranceName: currentDamage?.tortfeasorInsuranceName || '',
      tortfeasorInsuranceNumber: currentDamage?.tortfeasorInsuranceNumber || '', // Tortfeasor part

      attorneyId: currentDamage?.attorneyId || '',
      descriptionForAttorney: currentDamage?.descriptionForAttorney || '',
      appraiserId: currentDamage?.appraiserId || '',
      descriptionForAppraiser: currentDamage?.descriptionForAppraiser || '',
      carRentalId: currentDamage?.carRentalId || '',
      descriptionForCarRental: currentDamage?.descriptionForCarRental || '',
      paintShopId: currentDamage?.paintShopId || '',
      paintShopPdf: '',
      descriptionForPaintShop: currentDamage?.descriptionForPaintShop || '',
      towingServiceId: currentDamage?.towingServiceId || '',
      descriptionForTowingService: currentDamage?.descriptionForTowingService || '', // Service provider
      isRkuOn: currentDamage?.isRkuOn === true,
      isRepairScheduleOn: currentDamage?.isRkuOn === false,
      willSendPriceList: false,

      isManualCreating: false,
      willSendDelayedReminder: false
    }),
    [currentDamage]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    // if (currentDamage) {
    reset(defaultValues);
    // }
  }, [currentDamage, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData: Record<string, any> = {
        ...data
      }
      if (currentDamage) {
        formData.damageId = currentDamage.damageId;
      }
      if (formData.paintShopPdf) {
        // This is blob url, upload this to the storage and get the URL
        const filePath = `paint_shops/${format(new Date(), 'yyyyMMddHHmmss')}.pdf`;
        // Fetch the blob from the URL
        console.log("uploading paint shop pdf...", formData.paintShopPdf);
        // Check if blob file exists

        const response = await fetch(formData.paintShopPdf);
        if (response.ok) {
          const fileData = await response.blob();
          // blob to File
          const file = new File([fileData], "paintshop.pdf", { type: "application/pdf" });
          const downloadUrl = await uploadFile(file, filePath);
          // revoke the blob url
          URL.revokeObjectURL(formData.paintShopPdf);
          formData.paintShopPdf = downloadUrl;
          console.log("uploaded paint shop pdf url", downloadUrl);
        }
      }
      formData.customerPhone = trimPhoneNumber(formData.customerPhone);
      formData.customerWhatsapp = checkAndTrimWhatsAppNumber(formData.customerWhatsapp);
      formData.customerTelephone = trimPhoneNumber(formData.customerTelephone);
      formData.tortfeasorPhone = trimPhoneNumber(formData.tortfeasorPhone);
      formData.hasPreviousDamage = Number(formData.hasPreviousDamage);
      formData.wasAmountKnown = Number(formData.wasAmountKnown);
      formData.knownAmount = Number(formData.knownAmount);
      delete formData.onBehalfType;
      if (formData.workshopId === null) {
        formData.workshopId = '';
      }
      if (formData.insuranceAgent === null) {
        formData.insuranceAgent = '';
      }
      if (formData.appraiserRef === null) {
        formData.appraiserRef = '';
      }
      if (formData.attorneyId === null) {
        formData.attorneyId = '';
      }
      if (formData.appraiserId === null) {
        formData.appraiserId = '';
      }
      await setDamage(formData)
        .then((res: any) => {
          if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
            enqueueSnackbar(res.data.msg, {
              variant: 'error',
            });
            return;
          }
          reset();
          enqueueSnackbar(currentDamage ? t('updated_successfully') : t('created_successfully'));
          router.push(paths.dashboard.damages.root);
        })
        .catch((err) => {
          console.error(err);
          enqueueSnackbar(err.message, {
            variant: 'error',
          });
        })
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (docInfo && docInfo.customerVehicleLicensePlate) {
      setValue("customerVehicleLicensePlate", docInfo.customerVehicleLicensePlate);
      setValue("customerVehicleVINNumber", docInfo.customerVehicleVINNumber);
      setValue("customerVehicleBrand", docInfo.customerVehicleBrand);
      setValue("customerVehicleModel", docInfo.customerVehicleModel);
      setValue("customerFirstName", docInfo.customerFirstName);
      setValue("customerLastName", docInfo.customerLastName);
      setValue("customerCity", docInfo.customerCity);
      setValue("customerPostalCode", docInfo.customerPostalCode);
      setValue("customerStreet", docInfo.customerStreet);
      setValue("customerType", docInfo.customerType);
      setValue("customerVehicleFirstRegistration", docInfo.customerVehicleFirstRegistration);
    }
    return () => {
      setDocInfo({
        customerVehicleLicensePlate: "",
        customerVehicleVINNumber: "",
        customerVehicleBrand: "",
        customerVehicleModel: "",
        customerVehicleFirstRegistration: "",
        customerType: "PRIVATE_CLIENT",
        customerFirstName: "",
        customerLastName: "",
        customerStreet: "",
        customerCity: "",
        customerPostalCode: "",
      });
    }
  }, [docInfo, setDocInfo, setValue]);

  useEffect(() => {
    if (serviceProvider && [ServiceProviderType.APPRAISER, ServiceProviderType.ATTORNEY].includes(serviceProvider.serviceType as ServiceProviderType)) {
      if (serviceProvider.serviceType === ServiceProviderType.APPRAISER) {
        setValue("appraiserId", serviceProvider.serviceProviderId);
      } else if (serviceProvider.serviceType === ServiceProviderType.ATTORNEY) {
        setValue("attorneyId", serviceProvider.serviceProviderId);
      }
    }
  }, [serviceProvider, setValue]);

  useEffect(() => {
    if (errors && Object.keys(errors).length !== 0) {
      enqueueSnackbar(t('please_fill_all_required_fields'), {
        variant: 'error',
      });
    }
  }, [enqueueSnackbar, errors, t]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <DamageEditGeneralForm setValue={setValue} watch={watch} isCreation={!currentDamage} onChangeAgent={(agent) => setSelectedAgent(agent)} />
      <Box my={3} />
      <DamageEditDamageForm />
      <Box my={3} />
      <DamageEditInjuredPartyForm watch={watch} setValue={setValue} />
      <Box my={3} />
      <DamageEditTortfeasorForm watch={watch} />
      <Box my={3} />
      {!currentDamage && (
        <>
          <DamageEditServiceProviderForm watch={watch} setValue={setValue} agentValue={selectedAgent} />
          <Box my={3} />
          <DamageManualSet />
        </>
      )}
      <Stack direction="row" spacing={3} alignContent="center" sx={{ my: 4, float: "right" }}>
        {/* <LoadingButton sx={{ height: "50px" }}>
          <Image src="/assets/images/audatex.png" alt="arrow-left" height="50px" />
        </LoadingButton> */}
        <LoadingButton sx={{ height: "50px", width: "105px" }}>
          <Image src="/assets/images/dat_horizontal.png" alt="arrow-left" height="50px" />
        </LoadingButton>
        <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ bgcolor: "success.main" }}>
          {!currentDamage ? t('create_damage') : t('save_changes')}
        </LoadingButton>
      </Stack>
    </FormProvider >
  );
}
