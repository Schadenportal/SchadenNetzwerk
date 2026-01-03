import "yup-phone-lite";
import { useState, useEffect, useCallback } from "react";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from "@mui/material/Stack";
import Grid from '@mui/material/Unstable_Grid2';
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";

import { useTranslate } from 'src/locales';
import AgentModel from "src/models/AgentModel";
import { useAuthContext } from "src/auth/hooks";
import WorkshopModel from "src/models/WorkshopModel";
import { insurances } from "src/constants/insurances";
import ServiceAdviserModel from "src/models/ServiceAdviserModel";
import ServiceProviderModel from "src/models/ServiceProviderModel";
import { WORKSHOP_ROLES, YES_OR_NO_TYPES, SUPER_ADMIN_ROLES, MAIN_MANAGER_ROLES } from "src/constants/viewConstants";
import { getAgentList, searchWorkshop, searchServiceProviders, getServiceAdviserSnapInfo } from "src/services/firebase/firebaseFirestore";

import {
  RHFTextField,
  RHFRadioGroup,
  RHFMultiSelect,
  RHFAutocomplete,
} from "src/components/hook-form";

import { UserRole, ServiceProviderType } from "src/types/enums";

// ----------------------------------------------------------------------
type Props = {
  setValue: any,
  watch: any,
  isCreation: boolean,
  onChangeAgent: (agent: AgentModel | null) => void
}

export default function DamageEditGeneralForm({ setValue, watch, isCreation, onChangeAgent }: Props) {
  const { t } = useTranslate();

  const { user } = useAuthContext();
  const [originalWorkshops, setOriginalWorkshops] = useState<WorkshopModel[]>([]); // Original workshops
  const [workshops, setWorkshops] = useState<WorkshopModel[]>([]);
  const [serviceAdvisers, setServiceAdvisers] = useState<ServiceAdviserModel[]>([]);
  const [agents, setAgents] = useState<AgentModel[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProviderModel[]>([]);

  const watchAgentId = watch('insuranceAgent');
  const watchAppraiserId = watch('appraiserRef');
  const watchOnBehalfType = watch('onBehalfType');
  const watchHasKnownAmount = watch('wasAmountKnown');

  const getWorkshops = useCallback(async () => {
    if (user) {
      const workshopIds: string[] | undefined = [...SUPER_ADMIN_ROLES].includes(user.role) ? undefined : user.workshopIds
      await searchWorkshop({
        name: "",
        email: "",
        city: "",
      }, workshopIds).then((res) => {
        setWorkshops(res);
        setOriginalWorkshops(res);
      })
        .catch(err => {
          console.log(err);
        })
    }
  }, [user]);

  const getUserWorkshop = useCallback(async () => {
    if (user && originalWorkshops.length > 0) {
      if (user.role === UserRole.Admin) {
        setValue("workshopId", "");
      } else {
        const { workshopIds } = user;
        // setWorkshops with the user's workshops which has same workshopId
        if (workshopIds && workshopIds.length > 0) {
          setWorkshops(originalWorkshops.filter((workshop) => workshopIds.includes(workshop.workshopId)));
        }
        if (user.role === UserRole.Owner || user.role === UserRole.ServiceAdviser) {
          setValue("workshopId", workshopIds[0])
        }
      }
    }

  }, [originalWorkshops, setValue, user]);

  const getAgents = useCallback(async () => {
    if (MAIN_MANAGER_ROLES.includes(user?.role)) {
      const agentList = await getAgentList();
      const providers = await searchServiceProviders({
        serviceType: "",
        name: "",
        email: "",
      });
      setAgents(agentList);
      setServiceProviders(providers.filter((provider) => provider.serviceType === ServiceProviderType.APPRAISER));
    }
  }, [user?.role]);

  useEffect(() => {
    if (watchAgentId) {
      const selectedAgent = agents.find((agent) => agent.agentId === watchAgentId);
      if (selectedAgent) {
        onChangeAgent(selectedAgent);
        // Check if agent has workshopIds
        if (selectedAgent.workshopIds && selectedAgent.workshopIds.length > 0) {
          setWorkshops(originalWorkshops.filter((workshop) => selectedAgent.workshopIds.includes(workshop.workshopId)));
          setValue("workshopId", selectedAgent.workshopIds[0]);
        } else {
          setWorkshops(originalWorkshops);
          setValue("workshopId", "");
        }
      }
    } else {
      onChangeAgent(null);
      setWorkshops(originalWorkshops);
      setValue("workshopId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, originalWorkshops, setValue, watchAgentId]);

  useEffect(() => {
    if (watchAppraiserId) {
      const selectedAppraiser = serviceProviders.find((provider) => provider.serviceProviderId === watchAppraiserId);
      if (selectedAppraiser) {
        // Check if appraiser has workshopIds
        if (selectedAppraiser.workshopIds && selectedAppraiser.workshopIds.length > 0) {
          setWorkshops(originalWorkshops.filter((workshop) => selectedAppraiser.workshopIds.includes(workshop.workshopId)));
          setValue("workshopId", selectedAppraiser.workshopIds[0]);
        } else {
          setWorkshops(originalWorkshops);
          setValue("workshopId", "");
        }
      }
    } else {
      setWorkshops(originalWorkshops);
      setValue("workshopId", "");
    }
  }, [originalWorkshops, serviceProviders, setValue, watchAppraiserId]);

  useEffect(() => {
    getWorkshops();
    getAgents();
  }, [getAgents, getWorkshops]);

  useEffect(() => {
    getUserWorkshop();
  }, [getUserWorkshop, originalWorkshops]);

  useEffect(() => {
    if (watchOnBehalfType === "agent") {
      setValue("appraiserRef", "");
    } else if (watchOnBehalfType === "appraiser") {
      setValue("insuranceAgent", "");
    }
    if (watchHasKnownAmount !== 1) {
      setValue("knownAmount", 0);
    }
  }, [setValue, watchOnBehalfType, watchHasKnownAmount]);

  // Get service adviser snap info
  useEffect(() => {
    if (user && (user.workshopIds && user.workshopIds.length > 0 && WORKSHOP_ROLES.includes(user.role))) {
      const unSubscribe = getServiceAdviserSnapInfo(user.workshopIds[0], (list) => {
        setServiceAdvisers(list);
        // If user is service adviser, set default value
        if (user.role === UserRole.ServiceAdviser) {
          const myInfo = list.find((adviser) => adviser.email === user.email);
          if (myInfo) {
            setValue("serviceAdvisers", [myInfo.adviserId]);
          }
        }
      });
      return () => {
        unSubscribe();
      };
    }
    return () => { };
  }, [user, setValue]);



  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" color="primary" mb={2}>
        {t('general')}
      </Typography>
      <Grid container spacing={3}>
        <Grid xs={12} md={6} lg={6}>
          <Card sx={{ p: 3 }} variant="outlined">
            <Typography variant="subtitle1" mb={2}>
              {t('workshop')}
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
                name="workshopId"
                placeholder={t('workshops')}
                isOptionEqualToValue={(option, value) =>
                  value === undefined || value === "" || option === value
                }
                options={workshops.map((option) => option.workshopId)}
                getOptionLabel={(option) => workshops.filter((it) => it.workshopId === option)[0]?.name || ""}
                renderOption={(props, option) => {
                  const workshop = workshops.filter(
                    (it) => it.workshopId === option
                  )[0];

                  if (!workshop) {
                    return null;
                  }

                  return (
                    <li {...props} key={workshop.workshopId}>
                      {workshop.name}
                    </li>
                  );
                }}
              />
            </Box>
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
              <RHFTextField name="serviceManager" label={t('service_manager')} />
              <RHFTextField name="serviceClerk" label={t('service_clerk')} />
              <RHFMultiSelect
                checkbox
                name="serviceAdvisers"
                label={t('service_adviser')}
                options={serviceAdvisers.map((adviser) => ({ label: `${adviser.firstName} ${adviser.lastName}`, value: adviser.adviserId }))}
              />
              <RHFTextField name="insuranceDamageNumber" label={t('damage_number')} />
            </Box>
          </Card>
        </Grid>
        <Grid xs={12} md={6} lg={6}>
          <Card sx={{ p: 3 }} variant="outlined">
            <Typography variant="subtitle1" mb={2}>
              {t('comprehensive_insurance_for_injured_party')} ({t('optional')})
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
                name="insuranceName"
                placeholder={t('insurance')}
                isOptionEqualToValue={(option, value) =>
                  value === undefined || value === "" || option === value
                }
                options={insurances.map((option) => option.name)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => {
                  const { name } = insurances.filter(
                    (insurance) => insurance.name === option
                  )[0];

                  if (!name) {
                    return null;
                  }

                  return (
                    <li {...props} key={name}>
                      {name}
                    </li>
                  );
                }}
              />
              <RHFTextField name="insuranceNumber" label={t('insurance_certificate_number')} />
            </Box>
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
              <Stack spacing={1}>
                <Typography variant="subtitle2">{t('has_previous_damage')}</Typography>
                <RHFRadioGroup row spacing={4} name="hasPreviousDamage" options={YES_OR_NO_TYPES} />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">{t('was_amount_known')}</Typography>
                <RHFRadioGroup row spacing={4} name="wasAmountKnown" options={YES_OR_NO_TYPES} />
              </Stack>
              {watchHasKnownAmount === "1" && (
                <RHFTextField
                  name="knownAmount"
                  label={t('known_amount')}
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">€</InputAdornment>
                  }}
                />
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Card>
  );
}
