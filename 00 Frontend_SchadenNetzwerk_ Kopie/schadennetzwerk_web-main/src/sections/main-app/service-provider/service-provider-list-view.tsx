import isEqual from 'lodash/isEqual';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { ADMIN_ROLES } from 'src/constants/viewConstants';
import ServiceProviderModel from 'src/models/ServiceProviderModel';
import { getServiceProviderSnapInfo } from 'src/services/firebase/firebaseFirestore';
import { removeServiceProviderFunc, disableServiceProviderFunc, handleServiceProviderInfoFunc } from 'src/services/firebase/functions';

import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify/iconify';
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

import { QueryResultType } from 'src/types/enums';
import { IServiceProviderTableFilters } from 'src/types/service-providers';

import ServiceProviderTableRow from './view-components/service-provider-table-row';
import ServiceProviderTableToolbar from './view-components/servie-provider-toolbar';
import ServiceProviderFilterResult from './view-components/service-provider-filter-result';

const defaultFilters: IServiceProviderTableFilters = {
  serviceType: '',
  name: '',
  email: '',
};

const TABLE_HEAD = [
  { id: 'name', label: 'name' },
  { id: 'serviceType', label: 'service_type' },
  { id: 'email', label: 'email' },
  { id: 'phone', label: 'phone' },
  { id: 'createdAt', label: 'created_at' },
  { id: 'isDisabled', label: 'status' },
  { id: '' },
];

export default function ServiceProviderListView() {
  const { t } = useTranslate();
  const router = useRouter();
  const table = useTable();
  const { user } = useAuthContext();

  const [tableData, setTableData] = useState<ServiceProviderModel[]>([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSendingContract, setIsSendingContract] = useState<boolean>(false);
  const [disablingId, setDisablingId] = useState<string>('');

  const canReset = !isEqual(defaultFilters, filters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = (!dataFiltered.length && canReset) || !tableData;

  const denseHeight = table.dense ? 60 : 80;

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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleSendContract = useCallback(
    async (id: string) => {
      setIsSendingContract(true);
      await handleServiceProviderInfoFunc({ serviceProviderId: id, sendContract: true }).then((res: any) => {
        setIsSendingContract(false);
        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          enqueueSnackbar(res.data.msg, {
            variant: 'error',
          });
          return;
        }
        enqueueSnackbar(t('contract_sent_successfully'), { variant: 'success' });
      })
        .catch((err) => {
          setIsSendingContract(false);
          enqueueSnackbar(t('something_went_wrong'), {
            variant: 'error',
          });
        });
    },
    [t]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      await removeServiceProviderFunc({ serviceProviderId: id }).then((res: any) => {
        setIsDeleting(false);
        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          enqueueSnackbar(res.data.msg, {
            variant: 'error',
          });
          return;
        }
        enqueueSnackbar(t('deleted_successfully'), { variant: 'success' });
        const deleteRow = tableData.filter((row) => row.serviceProviderId !== id);
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
      router.push(paths.dashboard.service_providers.edit(id));
    },
    [router]
  );

  const handleDisableRow = useCallback(
    async (serviceProvider: ServiceProviderModel) => {
      setDisablingId(serviceProvider.serviceProviderId);
      const formData: Record<string, any> = {
        isDisabled: !serviceProvider.isDisabled,
        serviceProviderId: serviceProvider.serviceProviderId,
      };
      await disableServiceProviderFunc(formData)
        .then((res: any) => {
          if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
            enqueueSnackbar(res.data.msg, {
              variant: 'error',
            });
            return;
          }
          setDisablingId('');
          enqueueSnackbar(serviceProvider.isDisabled ? t('activated_successfully') : t('disabled_successfully'));
        })
        .catch((err) => {
          setDisablingId('');
          enqueueSnackbar(err.message, {
            variant: 'error',
          });
        });
    },
    [t]
  );

  const handleEditAppraiserInfo = useCallback(
    (serviceProvider: ServiceProviderModel) => {
      router.push(paths.admin.appraiserInfo.edit(serviceProvider.serviceProviderId));
    },
    [router]
  );

  const handleSuccess = useCallback((list: ServiceProviderModel[]) => {
    setTableData(list);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const unSubscribe = getServiceProviderSnapInfo(undefined, handleSuccess);
    return () => {
      unSubscribe();
    }
  }, [handleSuccess]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('service_providers')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('service_providers'), href: paths.dashboard.service_providers.root },
          { name: t('list') },
        ]}
        action={
          user && ADMIN_ROLES.includes(user.role) ?
            (<Button
              component={RouterLink}
              href={paths.dashboard.service_providers.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('add_service_provider')}
            </Button>)
            : ""
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card>
        <ServiceProviderTableToolbar
          filters={filters}
          onFilters={handleFilters}
        />

        {canReset && (
          <ServiceProviderFilterResult
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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                        <ServiceProviderTableRow
                          key={row.serviceProviderId}
                          role={user?.role || ''}
                          row={row}
                          isDeleting={isDeleting}
                          isSendingContract={isSendingContract}
                          disablingId={disablingId}
                          onDeleteRow={() => handleDeleteRow(row.serviceProviderId)}
                          onEditRow={() => handleEditRow(row.serviceProviderId)}
                          onDisableRow={() => handleDisableRow(row)}
                          onEditAppraiserInfo={() => handleEditAppraiserInfo(row)}
                          onSendContract={() => handleSendContract(row.serviceProviderId)}
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
    </Container>
  )
};

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: ServiceProviderModel[];
  comparator: (a: any, b: any) => number;
  filters: IServiceProviderTableFilters;
}) {
  const { name, serviceType, email } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (serviceType) {
    inputData = inputData.filter(
      (item) => item.serviceType.toLowerCase().indexOf(serviceType.toLowerCase()) !== -1
    );
  }

  if (name) {
    inputData = inputData.filter(
      (item) => item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (email) {
    inputData = inputData.filter(
      (item) => item.email.toLowerCase().indexOf(email.toLowerCase()) !== -1
    );
  }

  return inputData;
}
