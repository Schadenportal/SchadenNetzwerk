import isEqual from 'lodash/isEqual';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import LoadingButton from '@mui/lab/LoadingButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import DamageModel from 'src/models/DamageModel';
import { useMainData } from 'src/providers/data-provider';
import { removeDamage } from 'src/services/firebase/functions';
import ServiceAdviserModel from 'src/models/ServiceAdviserModel';
import { PROVIDER_ROLES, WORKSHOP_ROLES } from 'src/constants/viewConstants';
import { getDamageSnapInfo, getServiceAdviserSnapInfo } from 'src/services/firebase/firebaseFirestore';

import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify/iconify';
// import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { IDamageTableFilters } from 'src/types/damage';
import { UserRole, QueryResultType, DamageStatusType } from 'src/types/enums';

import DamageTableRow from './list-view-components/damage-table-row';
import DamageTableToolbar from './list-view-components/damage-toolbar';
import DamageFilterResult from './list-view-components/damage-filter-result';

const TABLE_HEAD = [
  { id: 'orderNumber', label: '#' },
  { id: 'insurance', label: 'type_of_damage' },
  { id: 'customer', label: 'customer' },
  { id: 'customerIdentifier', label: 'license_plate' },
  { id: 'serviceAdviser', label: 'service_adviser' },
  { id: 'damage_number', label: 'damage_number' },
  { id: 'last_action_at', label: 'last_action_at' },
  { id: 'insurance_valuation', label: 'insurance_valuation' },
  { id: 'repairConfirmed', label: 'repair_approval' },
  { id: 'openClaim', label: 'open_claim' },
  { id: 'paint_job', label: 'paint_job' },
  { id: 'complaint', label: 'complaint' },
  { id: 'detail', label: 'detail' },
  { id: 'date_of_accident', label: 'date_of_accident' },
  { id: 'actions', label: 'actions' },
];

const defaultFilters: IDamageTableFilters = {
  damageNumber: '',
  customerName: '',
  licensePlate: '',
  orderStatus: '',
  serviceAdviser: '',
  repairApprovalStatus: '',
};

type Props = {
  isMainPage?: boolean;
}

export default function DamageListView({ isMainPage }: Props) {
  // const settings = useSettingsContext();
  const router = useRouter();
  const { t } = useTranslate();
  const table = useTable();
  const { user } = useAuthContext();
  const confirm = useBoolean();
  const { serviceProvider } = useMainData();
  table.rowsPerPage = isMainPage ? 25 : 5;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [tableData, setTableData] = useState<DamageModel[]>([]);
  const [serviceAdvisers, setServiceAdvisers] = useState<ServiceAdviserModel[]>([]);

  const handleFilters = useCallback(
    (name: string, value: string) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const canReset = !isEqual(defaultFilters, filters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    serviceAdvisers,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = (!dataFiltered.length && canReset) || !tableData;

  const denseHeight = table.dense ? 60 : 80;

  const handleDeleteRow = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      await removeDamage({ damageId: id }).then((res: any) => {
        setIsDeleting(false);
        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          enqueueSnackbar(res.data.msg, {
            variant: 'error',
          });
          return;
        }
        enqueueSnackbar(t('deleted_successfully'), { variant: 'success' });
        const deleteRow = tableData.filter((row) => row.damageId !== id);
        setTableData(deleteRow);

        table.onUpdatePageDeleteRow(dataInPage.length);
      })
        .catch((err) => {
          setIsDeleting(false);
          enqueueSnackbar(t('something_went_wrong'), {
            variant: 'error',
          });
        })
    },
    [dataInPage.length, t, table, tableData]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.damages.edit(id));
    },
    [router]
  );

  const damageCreatingOptions = useCallback(() => (
    <Box
      marginTop={2}
      rowGap={2}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)',
      }}
    >
      <LoadingButton color='primary' variant='outlined' onClick={() => router.push(paths.dashboard.damages.new)}>
        <Iconify icon="mdi:pencil" width={24} />
        &nbsp;
        {t('enter_manually')}
      </LoadingButton>
      <LoadingButton color='primary' variant='outlined' onClick={() => router.push(paths.dashboard.damages.vehicle_registration)}>
        <Iconify icon="ion:camera-sharp" width={24} />
        &nbsp;
        {t('scan_vehicle_registration_document')}
      </LoadingButton>
    </Box>
  ), [router, t]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleSuccess = useCallback((list: DamageModel[]) => {
    if (user) {
      if ([UserRole.Admin, UserRole.Lawyer, UserRole.Owner, UserRole.ServiceAdviser, UserRole.Appraiser].includes(user.role)) {
        setTableData(list);
      } else {
        const filteredList = list.filter((item) => item.userId === user.userId);
        setTableData(filteredList);
      }
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      let userId: string | undefined;
      let workshopId: string | undefined;
      let providerId: string | undefined;
      let providerType: string | undefined;
      if (PROVIDER_ROLES.includes(user.role)) {
        userId = undefined;
        providerId = serviceProvider?.serviceProviderId;
        providerType = serviceProvider?.serviceType;
      } else if (user.role === UserRole.Owner) {
        userId = undefined;
        workshopId = user.workshopIds?.[0] || undefined;
      } else if (user.role === UserRole.ServiceAdviser) {
        userId = undefined;
        workshopId = user.workshopIds?.[0] || undefined;
      } else if ([UserRole.Admin].includes(user.role)) {
        userId = undefined;
        workshopId = undefined;
      } else {
        userId = user?.userId;
        workshopId = undefined;
      }
      const unSubscribe = getDamageSnapInfo(userId, workshopId, handleSuccess, providerId, providerType);
      return () => {
        unSubscribe();
      }
    }
    return () => { }
  }, [handleSuccess, serviceProvider, user]);

  // Get service adviser snap info
  useEffect(() => {
    if (user && (user.workshopIds && user.workshopIds.length > 0 && WORKSHOP_ROLES.includes(user.role))) {
      const unSubscribe = getServiceAdviserSnapInfo(user.workshopIds[0], (list) => {
        setServiceAdvisers(list);
      });
      return () => {
        unSubscribe();
      };
    }
    return () => { };
  }, [user]);

  return (
    <Container maxWidth={false} sx={{ mt: !isMainPage ? 5 : 0 }} disableGutters={!isMainPage}>
      {isMainPage && (
        <CustomBreadcrumbs
          heading={t('damage')}
          links={[
            { name: t('damage_management'), href: paths.dashboard.root },
            { name: t('damage'), href: paths.dashboard.damages.root },
            { name: t('list') },
          ]}
          action={
            <Button
              component={RouterLink}
              onClick={() => {
                confirm.onTrue();
              }}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('add_damage')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
      )}
      <Card>
        <DamageTableToolbar
          filters={filters}
          onFilters={handleFilters} />
        {canReset && (
          <DamageFilterResult
            filters={filters}
            onFilters={handleFilters}
            //
            onResetFilters={handleResetFilters}
            //
            results={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }} />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table
              size={table.dense ? 'small' : 'medium'}
              sx={{
                minWidth: 960,
                '& tbody tr:nth-of-type(odd)': {
                  backgroundColor: 'background.paper',
                },
                '& tbody tr:nth-of-type(even)': {
                  backgroundColor: 'action.hover',
                },
                '& tbody tr:hover': {
                  backgroundColor: 'action.selected',
                }
              }}
            >
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
              />

              <TableBody>
                {isLoading ? (
                  [...Array(table.rowsPerPage)].map((i, index) => (
                    <TableSkeleton key={index} sx={{ height: denseHeight }} />
                  ))
                ) : (
                  <>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <DamageTableRow
                          key={row.damageId}
                          role={user?.role || ''}
                          currentUserId={user?.userId || ''}
                          row={row}
                          isDeleting={isDeleting}
                          advisers={serviceAdvisers}
                          onDeleteRow={() => handleDeleteRow(row.damageId)}
                          onShowDetail={() => router.push(paths.dashboard.damages.detail(row.damageId))}
                          onEditRow={() => handleEditRow(row.damageId)}
                          onEditInvoice={() => router.push(paths.dashboard.damages.invoice(row.damageId, row.invoiceId || 'create'))}
                          onEditPaintShopOrder={() => router.push(paths.dashboard.damages.edit_paint_shop_order(row.damageId))}
                        />
                      ))}
                  </>
                )}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                />
                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('how_would_you_like_to_create_damage')}
        content={damageCreatingOptions()}
        action=""
      />
    </Container>
  )
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  serviceAdvisers,
  comparator,
  filters,
}: {
  inputData: DamageModel[];
  serviceAdvisers: ServiceAdviserModel[];
  comparator: (a: any, b: any) => number;
  filters: IDamageTableFilters;
}) {
  const { damageNumber, customerName, orderStatus, licensePlate, repairApprovalStatus, serviceAdviser } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (damageNumber) {
    inputData = inputData.filter(
      (item) => item.insuranceDamageNumber.toLowerCase().indexOf(damageNumber.toLowerCase()) !== -1
    );
  }

  if (customerName) {
    inputData = inputData.filter(
      (item) => (`${item.customerFirstName} ${item.customerLastName}`).toLowerCase().indexOf(customerName.toLowerCase()) !== -1
    );
  }

  if (licensePlate) {
    inputData = inputData.filter(
      (item) => item.customerVehicleLicensePlate.toLowerCase().indexOf(licensePlate.toLowerCase()) !== -1
    );
  }

  if (serviceAdviser) {
    inputData = inputData.filter((item) => {
      if (!item.serviceAdvisers || !Array.isArray(item.serviceAdvisers)) {
        return false;
      }

      return item.serviceAdvisers.some((adviserId) => {
        const adviser = serviceAdvisers.find((adv) => adv.adviserId === adviserId);
        if (!adviser) return false;

        const adviserFullName = `${adviser.firstName} ${adviser.lastName}`.toLowerCase();
        return adviserFullName.includes(serviceAdviser.toLowerCase());
      });
    });
  }

  if (orderStatus) {
    inputData = inputData.filter(
      (item) => {
        if (orderStatus === "open") {
          return item.status.toLowerCase() !== DamageStatusType.FINISHED
        }
        return item.status.toLowerCase() === DamageStatusType.FINISHED
      }
    );
  }

  if (repairApprovalStatus) {
    inputData = inputData.filter(
      (item) => {
        if (repairApprovalStatus === "approved") {
          console.log(item.repairApproved)
          return item.repairApproved
        }
        return !item.repairApproved
      }
    );
  }

  return inputData;
}
