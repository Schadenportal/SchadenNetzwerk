// Don't use lint
/* eslint-disable */
import "yup-phone-lite";
import { useRef, useState, useEffect, useCallback } from "react";

import Box from '@mui/material/Box';
import { Stack } from "@mui/system";
import Card from '@mui/material/Card';
// import Button from '@mui/material/Button';
import MenuItem from "@mui/material/MenuItem";
import Grid from '@mui/material/Unstable_Grid2';
import Typography from "@mui/material/Typography";

import { useBoolean } from "src/hooks/use-boolean";

import { haveCommonElement } from "src/utils/common";

import { useTranslate } from 'src/locales';
import AgentModel from "src/models/AgentModel";
import { useAuthContext } from "src/auth/hooks";
import { useMainData } from "src/providers/data-provider";
import { OTHER_SERVICES } from "src/constants/viewConstants";
import ServiceProviderModel from "src/models/ServiceProviderModel";
import { searchServiceProviders } from "src/services/firebase/firebaseFirestore";

// import EditPaintShopPdfDialog from "src/components/custom-dialog/edit-paint-shop-pdf-dialog";
import {
  RHFSwitch,
  RHFSelect,
  RHFTextField,
  RHFAutocomplete,
} from "src/components/hook-form";

import { UserRole, ServiceProviderType } from "src/types/enums";

import { SERVICE_PROVIDER_OPTIONS } from "../../service-provider/view-components/service-provider-edit-form";

// const MAIN_LAWYER_EMAIL = "anwalt@justizcar.de";

// ----------------------------------------------------------------------
type Props = {
  watch: any,
  setValue: any,
  agentValue: AgentModel | null,
}

export default function DamageEditServiceProviderForm({ watch, setValue, agentValue }: Props) {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const showPdfEditor = useBoolean();

  const [originServiceProviders, setOriginServiceProviders] = useState<ServiceProviderModel[]>([]);
  // const [serviceProviders, setServiceProviders] = useState<ServiceProviderModel[]>([]);
  // const [lawyer, setLawyer] = useState<ServiceProviderModel | undefined>(undefined);
  const { serviceProvider } = useMainData();

  //
  const [lawyers, setLawyers] = useState<ServiceProviderModel[]>([]);
  const [appraisers, setAppraisers] = useState<ServiceProviderModel[]>([]);
  const [carRentals, setCarRentals] = useState<ServiceProviderModel[]>([]);
  const [paintShops, setPaintShops] = useState<ServiceProviderModel[]>([]);
  const [towingServices, setTowingServices] = useState<ServiceProviderModel[]>([]);
  //

  const watchedWorkshopId = watch('workshopId');
  const attorneyId = watch('attorneyId');
  const appraiserId = watch('appraiserId');
  const carRentalId = watch('carRentalId');
  const paintShopId = watch('paintShopId');
  const towingServiceId = watch('towingServiceId');
  const watchAppraiserRef = watch('appraiserRef');

  const updateServiceUsers = useCallback((serviceUsers: ServiceProviderModel[], needToUpdateLawyer = false, hasWorkshopId = false) => {
    if (!user) return;

    if (needToUpdateLawyer) {
      // setLawyers(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.ATTORNEY));
      // const mainLawyer = serviceUsers.find((provider) => provider.email === MAIN_LAWYER_EMAIL);
      // setLawyer(mainLawyer);
      // if (mainLawyer) {
      //   setValue('attorneyId', mainLawyer.serviceProviderId);
      // }
    }
    if (hasWorkshopId) {
      setLawyers(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.ATTORNEY));
      setAppraisers(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.APPRAISER));
      setCarRentals(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.CAR_RENTAL));
      setPaintShops(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.PAINT_SHOP));
      setTowingServices(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.TOWING_SERVICE));
    } else if ([...OTHER_SERVICES, UserRole.Appraiser, UserRole.Lawyer].includes(user.role)) {
      // Format service providers
      const userWorkshopIds = user.workshopIds || null;
      if (userWorkshopIds && userWorkshopIds.length > 0) {
        setLawyers(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.ATTORNEY && haveCommonElement(service.workshopIds || [], userWorkshopIds)));
        setAppraisers(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.APPRAISER && haveCommonElement(service.workshopIds || [], userWorkshopIds)));
        setCarRentals(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.CAR_RENTAL && haveCommonElement(service.workshopIds || [], userWorkshopIds)));
        setPaintShops(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.PAINT_SHOP && haveCommonElement(service.workshopIds || [], userWorkshopIds)));
        setTowingServices(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.TOWING_SERVICE && haveCommonElement(service.workshopIds || [], userWorkshopIds)));
      } else {
        setAppraisers([]);
        setCarRentals([]);
        setPaintShops([]);
        setTowingServices([]);
      }
      // Set default service provider
      if (serviceProvider) {
        switch (user.role) {
          case UserRole.Lawyer:
            setLawyers([serviceProvider]);
            setValue('attorneyId', serviceProvider.serviceProviderId);
            break;
          case UserRole.Appraiser:
            setAppraisers([serviceProvider]);
            setValue('appraiserId', serviceProvider.serviceProviderId);
            break;
          case UserRole.CarRenter:
            setCarRentals([serviceProvider]);
            setValue('carRentalId', serviceProvider.serviceProviderId);
            break;
          case UserRole.PaintShop:
            setPaintShops([serviceProvider]);
            setValue('paintShopId', serviceProvider.serviceProviderId);
            break;
          case UserRole.TowingService:
            setTowingServices([serviceProvider]);
            setValue('towingServiceId', serviceProvider.serviceProviderId);
            break;
          default:
            break;
        }
      }
    } else {
      setLawyers(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.ATTORNEY));
      setAppraisers(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.APPRAISER));
      setCarRentals(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.CAR_RENTAL));
      setPaintShops(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.PAINT_SHOP));
      setTowingServices(serviceUsers.filter((service) => service.serviceType === ServiceProviderType.TOWING_SERVICE));
    }
  }, [serviceProvider, setValue, user]);

  const getOriginServiceProviders = useCallback(async () => {
    await searchServiceProviders({
      serviceType: "",
      name: "",
      email: "",
    }).then((result) => {
      if (result) {
        setOriginServiceProviders(result);
        updateServiceUsers(result, true); // Update At first load
      }
    }).catch((error) => {
      console.error("Error getting service providers: ", error);
    });
  }, [updateServiceUsers]);

  const getServiceProvidersByWorkshopId = useCallback(async (workshopId: string) => {
    const providers = originServiceProviders.filter((provider) => provider.workshopIds?.includes(workshopId));
    updateServiceUsers(providers, false, true);
  }, [originServiceProviders, updateServiceUsers]);

  // Set service Provider when change workshop
  useEffect(() => {
    if (watchedWorkshopId) {
      getServiceProvidersByWorkshopId(watchedWorkshopId);
      setValue('isRkuOn', true);
      setValue('isRepairScheduleOn', true);
    } else {
      updateServiceUsers(originServiceProviders);
      setValue('isRkuOn', false);
      setValue('isRepairScheduleOn', false);
    }
  }, [watchedWorkshopId, setValue, getServiceProvidersByWorkshopId, updateServiceUsers, originServiceProviders]);

  // Watch AgentId and set service provider
  useEffect(() => {
    if (agentValue) {
      if (!agentValue.workshopIds || agentValue.workshopIds.length === 0) {
        setValue('isRkuOn', false);
      }
    }
  }, [agentValue, setValue]);

  useEffect(() => {
    if (watchAppraiserRef && appraisers.length > 0) {
      setValue('isRkuOn', false);
      // Find selected service provider
      const selectedAppraiser = appraisers.filter((it) => it.serviceProviderId === watchAppraiserRef);
      if (selectedAppraiser.length) {
        setAppraisers(selectedAppraiser);
        setValue('appraiserId', selectedAppraiser[0].serviceProviderId);
      }
    } else {
      updateServiceUsers(originServiceProviders, false, false);
      setValue('appraiserId', "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceProvider, setValue, watchAppraiserRef]);

  useEffect(() => {
    getOriginServiceProviders();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Saved PDF info from the PDF editor
  const [savedPdfName, setSavedPdfName] = useState<string | null>(null);
  const savedPdfUrlRef = useRef<string | null>(null);

  const handleSaveFile = useCallback((blobUrl: string) => {
    try {
      // revoke previous URL
      // if (savedPdfUrlRef.current) {
      //   URL.revokeObjectURL(savedPdfUrlRef.current);
      // }
      savedPdfUrlRef.current = blobUrl;
      setValue('paintShopPdf', blobUrl);

      // generate a friendly filename (you can change the pattern)
      const name = `paintshop_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
      setSavedPdfName(name);

    } catch (err) {
      console.error('Error handling saved PDF blob', err);
    } finally {
      showPdfEditor.onFalse();
    }
  }, [setValue, showPdfEditor]);

  // Cleanup object URL on unmount
  useEffect(() => () => {
    if (savedPdfUrlRef.current) {
      URL.revokeObjectURL(savedPdfUrlRef.current);
      savedPdfUrlRef.current = null;
    }
  }, []);

  // const getLawyerOptions = useMemo(() => {
  //   let providers: ServiceProviderModel[] = [];
  //   return
  //   if (lawyer) {
  //     console.log("lawyer:  setting lawyer options");
  //     const lawyersList = lawyers.filter((service) => service.serviceType === ServiceProviderType.ATTORNEY && service.serviceProviderId !== lawyer.serviceProviderId);
  //     providers = [lawyer, ...lawyersList];
  //   }
  //   return providers;
  // }, [lawyer, lawyers]);

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" color="primary" mb={2}>
        {t('which_service_provider_do_you_select')}
      </Typography>
      <Grid container spacing={3}>
        <Grid xs={12} sm={6}>
          <Stack mt={3}>
            <Typography variant="subtitle1" mb={2}>
              {SERVICE_PROVIDER_OPTIONS[0].label}
            </Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="attorneyId"
                placeholder={t('Rechtsanwalt')}
                isOptionEqualToValue={(option, value) =>
                  value === undefined || value === "" || option === value
                }
                options={lawyers.map((option) => option.serviceProviderId)}
                getOptionLabel={(option) => lawyers.filter((provider) => provider.serviceProviderId === option)[0]?.name || ""}
                renderOption={(props, option) => {
                  const selectedLawyer = lawyers.filter(
                    (provider) => provider.serviceProviderId === option
                  )[0];

                  if (!selectedLawyer) {
                    return null;
                  }

                  return (
                    <li {...props} key={selectedLawyer.serviceProviderId}>
                      {selectedLawyer.name}
                    </li>
                  );
                }}
              />
              {attorneyId && (
                <RHFTextField multiline disabled={attorneyId === ""} rows={3} name="descriptionForAttorney" label={t('notes')} />
              )}
            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} sm={6}>
          <Stack mt={3}>
            <Typography variant="subtitle1">
              {SERVICE_PROVIDER_OPTIONS[1].label}
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
              <RHFAutocomplete
                name="appraiserId"
                placeholder={t('Gutachter')}
                isOptionEqualToValue={(option, value) =>
                  value === undefined || value === "" || option === value
                }
                options={appraisers.map((option) => option.serviceProviderId)}
                getOptionLabel={(option) => appraisers.filter((it) => it.serviceProviderId === option)[0]?.name || ""}
                renderOption={(props, option) => {
                  const appraiser = appraisers.filter(
                    (it) => it.serviceProviderId === option
                  )[0];

                  if (!appraiser) {
                    return null;
                  }

                  return (
                    <li {...props} key={appraiser.serviceProviderId}>
                      {appraiser.name}
                    </li>
                  );
                }}
              />
              {appraiserId && (
                <RHFTextField disabled={appraiserId === ""} multiline rows={3} name="descriptionForAppraiser" label={t('notes')} />
              )}
            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} sm={6}>
          <Stack mt={3}>
            <Typography variant="subtitle1">
              {SERVICE_PROVIDER_OPTIONS[2].label}
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
              <RHFSelect name="carRentalId" label={t('Unfallersatz')}>
                {carRentals.filter((service) => service.serviceType === ServiceProviderType.CAR_RENTAL).map((item) => (
                  <MenuItem key={item.serviceProviderId} value={item.serviceProviderId}>
                    {item.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              {carRentalId !== "" && (
                <RHFTextField disabled={carRentalId === ""} multiline rows={3} name="descriptionForCarRental" label={t('notes')} />
              )}
            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} sm={6}>
          <Stack mt={3}>
            <Typography variant="subtitle1">
              {SERVICE_PROVIDER_OPTIONS[3].label}
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
              <RHFSelect name="paintShopId" label={t('Lack & Karosserie')}>
                {paintShops.filter((service) => service.serviceType === ServiceProviderType.PAINT_SHOP).map((item) => (
                  <MenuItem key={item.serviceProviderId} value={item.serviceProviderId}>
                    {item.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              {paintShopId !== "" && (
                <>
                  <RHFTextField disabled={paintShopId === ""} multiline rows={3} name="descriptionForPaintShop" label={t('notes')} />
                  {/* <Stack direction="row" spacing={1} alignItems="center">
                    <Button variant="contained" size="small" sx={{ width: 100 }} onClick={showPdfEditor.onTrue}>{t('edit_pdf')}</Button>
                    {savedPdfName && (
                      <Typography variant="body2" sx={{ ml: 1 }} title={savedPdfName}>
                        {savedPdfName}
                      </Typography>
                    )}
                  </Stack> */}
                </>
              )}

            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} sm={12}>
          <Stack mt={3}>
            <Typography variant="subtitle1">
              {SERVICE_PROVIDER_OPTIONS[4].label}
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
              <RHFSelect name="towingServiceId" label={t('Abschleppdienst')}>
                {towingServices.filter((service) => service.serviceType === ServiceProviderType.TOWING_SERVICE).map((item) => (
                  <MenuItem key={item.serviceProviderId} value={item.serviceProviderId}>
                    {item.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              {towingServiceId !== "" && (
                <RHFTextField disabled={towingServiceId === ""} multiline rows={3} name="descriptionForTowingService" label={t('notes')} />
              )}
            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} sm={4}>
          <Stack mt={3}>
            <Typography variant="subtitle1">
              Reparaturkostenübernahme Werkstatt
            </Typography>
            <Stack spacing={1}>
              <RHFSwitch name="isRkuOn" label={t('create_rku_form')} sx={{ mt: 3 }} />
            </Stack>
          </Stack>
        </Grid>
        <Grid xs={12} sm={4}>
          <Stack mt={3}>
            <Typography variant="subtitle1">
              Reparaturablaufplan
            </Typography>
            <Stack spacing={1}>
              <RHFSwitch name="isRepairScheduleOn" label={t('create_repair_schedule_form')} sx={{ mt: 3 }} />
            </Stack>
          </Stack>
        </Grid>
        <Grid xs={12} sm={4}>
          <Stack mt={3}>
            <Typography variant="subtitle1">
              {t('send_price_list')}
            </Typography>
            <Stack spacing={1}>
              <RHFSwitch name="willSendPriceList" label={t('i_will_send_price_list')} sx={{ mt: 3 }} />
            </Stack>
          </Stack>
        </Grid>

      </Grid>

      {/* <EditPaintShopPdfDialog
        open={showPdfEditor.value}
        onClose={showPdfEditor.onFalse}
        title={t('pdf_viewer')}
        onSaveFile={handleSaveFile}
        action=""
      /> */}
    </Card>
  );
}
