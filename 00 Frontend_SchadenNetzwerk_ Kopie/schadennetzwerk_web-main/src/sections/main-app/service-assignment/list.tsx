import { format } from 'date-fns';
import isEqual from 'lodash/isEqual';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { useMainData } from 'src/providers/data-provider';
import ServiceTaskModel from 'src/models/ServiceTaskModel';
import { updateServiceTaskStatus } from 'src/services/firebase/functions';
import { getServiceTaskSnapInfo } from 'src/services/firebase/firebaseFirestore';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import EmptyContent from 'src/components/empty-content/empty-content';

import { ServiceTaskStatusTypes } from 'src/types/enums';
import { IServiceAssignmentFilters } from 'src/types/service-providers';

import InfoDetails from './view-components/InfoDetails';
import ServiceAssignmentSearchBar from './view-components/search';
import ServiceAssignmentFilterResult from './view-components/filter-result';

const defaultFilters: IServiceAssignmentFilters = {
  serviceStatus: '',
  orderNumber: '',
};

const rowsPerPage = 12;

export default function ServiceAssignmentListView() {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const { serviceProvider } = useMainData();
  const router = useRouter();
  const [filters, setFilters] = useState(defaultFilters);
  const [tableData, setTableData] = useState<ServiceTaskModel[]>([]);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [page, setPage] = useState(1);

  const canReset = !isEqual(defaultFilters, filters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters,
  });

  const notFound = (!dataFiltered.length && canReset) || !tableData;

  const handleFilters = useCallback(
    (name: string, value: string) => {
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
      setPage(1);
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleSuccess = useCallback((list: ServiceTaskModel[]) => {
    setIsLoading(false);
    try {
      setTableData(list);
    } catch (err) {
      console.log("=== Error ===", err);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const serviceProviderId = serviceProvider?.serviceProviderId || "";
    const unSubscribe = getServiceTaskSnapInfo(handleSuccess, serviceProviderId);
    return () => {
      unSubscribe();
    }
  }, [handleSuccess, serviceProvider, user]);

  const handleConfirm = async (serviceTaskId: string) => {
    try {
      setIsApiLoading(true);
      const data = {
        serviceTaskId,
        status: ServiceTaskStatusTypes.ACCEPTED
      }
      await updateServiceTaskStatus(data);
      setIsApiLoading(false);
      enqueueSnackbar(t('task_confirmed_successfully'), {
        variant: 'success',
      });
    } catch (error) {
      setIsApiLoading(false);
      enqueueSnackbar(t('error_occurred_while_processing_task'), {
        variant: 'error',
      });
    }
  }

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('assignment_management')}
        links={[
          { name: t('assignment'), href: paths.serviceAssignment.root },
          { name: t('list') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {!isLoading ? (
        <>
          <ServiceAssignmentSearchBar
            filters={filters}
            onFilters={handleFilters}
          />
          {canReset && (
            <ServiceAssignmentFilterResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }} />
          )}
          <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            {dataFiltered.slice(rowsPerPage * (page - 1), rowsPerPage * page).map((item, key) => (
              <Card key={key}>
                <CardHeader
                  title={`${item.orderNumber} ${item.customerName}`}
                  action={
                    <Label
                      variant="soft"
                      color={
                        (item.status === ServiceTaskStatusTypes.CREATED && 'error') ||
                        (item.status === ServiceTaskStatusTypes.SIGNED && 'info') ||
                        (item.status === ServiceTaskStatusTypes.ACCEPTED && 'success') ||
                        (item.status === ServiceTaskStatusTypes.FINISHED && 'warning') ||
                        'default'
                      }
                      sx={{
                        // set background color based on mode
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#424242' : '#E0E0E0',
                      }}
                    >
                      {t(`${item.status}`)}
                    </Label>
                  }
                />
                <Stack direction="column" sx={{ p: 3 }}>
                  <Box>
                    {t('notes')}
                  </Box>
                  <Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    {item.notes}
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    {t('injured_party')}
                  </Box>
                  <Box sx={{ color: 'text.secondary' }}>
                    {item.customerName}
                  </Box>
                  <Box sx={{ color: 'text.secondary' }}>
                    {item.cLicensePlate}
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    {t('date_of_accident')}
                  </Box>
                  <Box sx={{ color: 'text.secondary' }}>
                    {format(item.damageDate.toDate(), 'dd.MM.yyyy')}
                  </Box>
                  <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

                  {item.workshopInfo && (
                    <>
                      <Typography sx={{ mb: 2 }}>{t('workshop_details')}</Typography>
                      <Box rowGap={1.5} display="grid" gridTemplateColumns="repeat(2, 1fr)">
                        <InfoDetails icon='mdi:car-repair' name={item.workshopInfo.workshopName || ""} />
                        <InfoDetails icon='mdi:email' name={item.workshopInfo.workshopEmail || ""} />
                        <InfoDetails icon='mdi:phone' name={item.workshopInfo.workshopPhone || ""} />
                        <InfoDetails icon='mdi:whatsapp' name={item.workshopInfo.workshopWhatsapp || ""} />
                        <InfoDetails icon='mdi:location' name={`${item.workshopInfo.workshopStreet}, ${item.workshopInfo.workshopPostalCode} ${item.workshopInfo.workshopCity}`} />
                      </Box>
                    </>
                  )}

                  <Stack direction="row" spacing={2} mt={2} >
                    {item.status === ServiceTaskStatusTypes.SIGNED && serviceProvider && serviceProvider.serviceProviderId === item.serviceProviderId && (
                      <LoadingButton sx={{ bgcolor: "success.main" }} loading={isApiLoading} onClick={() => handleConfirm(item.serviceTaskId)}>
                        <Iconify width={16} icon="flat-color-icons:accept-database" /> &nbsp;
                        {t('confirm')}
                      </LoadingButton>
                    )}
                    <LoadingButton
                      sx={{ bgcolor: "warning.main" }}
                      onClick={() => router.push(paths.serviceAssignment.detail(item.damageId))}>
                      <Iconify width={16} icon="mdi:show" /> &nbsp;
                      {t('detail')}
                    </LoadingButton>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => router.push(paths.dashboard.chat.damageChat(item.damageId))}
                    >
                      <Iconify width={16} icon="mdi:chat" /> &nbsp;
                      {t('messenger')}
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Box>
          {dataFiltered.length > rowsPerPage && (
            <Pagination
              count={Math.ceil(dataFiltered.length / rowsPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              sx={{
                mt: 8,
                [`& .${paginationClasses.ul}`]: {
                  justifyContent: 'center',
                },
              }} />
          )}
        </>
      ) : (
        <LoadingScreen sx={{ mt: "25%" }} />
      )}
      {notFound && (<EmptyContent title={t('no_match')} />)}
    </Container >
  )
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  filters,
}: {
  inputData: ServiceTaskModel[];
  filters: IServiceAssignmentFilters;
}) {
  const { serviceStatus, orderNumber } = filters;

  if (serviceStatus) {
    inputData = inputData.filter(
      (item) => item.status.toLowerCase().indexOf(serviceStatus.toLowerCase()) !== -1
    );
  }

  if (orderNumber) {
    inputData = inputData.filter(
      (item) => item.orderNumber.toLowerCase().indexOf(orderNumber.toLowerCase()) !== -1
    );
  }
  return inputData;
}
