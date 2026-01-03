import isEqual from 'lodash/isEqual';
import { useParams } from 'react-router';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import { Button } from '@mui/material';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import WorkshopModel from 'src/models/WorkshopModel';
import { COLLECTION_WORKSHOPS } from 'src/constants/firebase';
import ServiceProviderModel from 'src/models/ServiceProviderModel';
import { updateProviderWorkshop } from 'src/services/firebase/functions';
import { getDocument, getServiceProviderSnapInfo } from 'src/services/firebase/firebaseFirestore';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
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
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { QueryResultType } from 'src/types/enums';
import { IServiceProviderTableFilters } from 'src/types/service-providers';

import TableRowForAssignList from './view-components/table-row-for-assign-list';
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
  { id: 'hasConnected', label: 'has_connected' },
  { id: 'createdAt', label: 'created_at' },
];

export default function ServiceProviderAssignListView() {
  const { t } = useTranslate();
  const table = useTable();
  const { user } = useAuthContext();
  const { workshopId } = useParams<{ workshopId: string }>();
  const [workshopData, setWorkshopData] = useState<WorkshopModel>();

  const [tableData, setTableData] = useState<ServiceProviderModel[]>([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdd, setIsAdd] = useState<boolean>(false);

  const canReset = !isEqual(defaultFilters, filters);
  const confirm = useBoolean();

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

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

  const getData = useCallback(async () => {
    if (workshopId) {
      const workshop = await getDocument(COLLECTION_WORKSHOPS, workshopId, WorkshopModel);
      if (workshop) {
        setWorkshopData(workshop);
      }
    }
  }, [workshopId]);

  const handleAssign = useCallback((isAdding: boolean) => {
    setIsAdd(isAdding);
    confirm.onTrue();
  }, [confirm]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    // Update workshopIds in service providers
    const params = {
      serviceProviderIds: table.selected,
      workshopId,
      isAdd,
    }
    const result: any = await updateProviderWorkshop(params);
    if (result.data.result === QueryResultType.RESULT_SUCCESS) {
      enqueueSnackbar(t('success'), {
        variant: 'success',
      });
    } else {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
    setIsLoading(false);
    confirm.onFalse();
  }, [confirm, isAdd, t, table.selected, workshopId]);

  const handleSuccess = useCallback((list: ServiceProviderModel[]) => {
    setTableData(list);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    getData()
  }, [getData]);

  useEffect(() => {
    setIsLoading(true);
    const unSubscribe = getServiceProviderSnapInfo(undefined, handleSuccess);
    return () => {
      unSubscribe();
    }
    return () => { }
  }, [handleSuccess]);

  return (
    <>
      <Container maxWidth={false}>
        <CustomBreadcrumbs
          heading={t('assign_service_provider')}
          links={[
            { name: t('damage_management'), href: paths.dashboard.root },
            { name: t('service_providers'), href: paths.dashboard.service_providers.root },
            { name: t('list') },
          ]}
          action=""
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Typography variant="h6" sx={{ mb: 3 }} color="info.main">
          {t('assign_page_desc')}: {workshopData?.name}
        </Typography>
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
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.serviceProviderId)
                )
              }
              action={
                <>
                  <Tooltip title={t('associate_to_workshop')}>
                    <Button variant='contained' color="success" onClick={() => handleAssign(true)}>
                      <Iconify icon="ic:baseline-group-add" />
                      <Typography variant='subtitle2' sx={{ ml: 1 }}>{t('associate')}</Typography>
                    </Button>
                  </Tooltip>
                  <Tooltip title={t('disassociate_from_workshop')} sx={{ ml: 2 }}>
                    <Button variant='contained' color="error" onClick={() => handleAssign(false)}>
                      <Iconify icon="mdi:account-remove-outline" />
                      <Typography variant='subtitle2' sx={{ ml: 1 }}>{t('disassociate')}</Typography>
                    </Button>
                  </Tooltip>
                </>
              }
            />
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(checked, tableData.map((row) => row.serviceProviderId))
                  }
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
                          <TableRowForAssignList
                            key={row.serviceProviderId}
                            selected={table.selected.includes(row.serviceProviderId)}
                            onSelectRow={() => table.onSelectRow(row.serviceProviderId)}
                            role={user?.role || ''}
                            row={row}
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
          />
        </Card>
      </Container>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={isAdd ? t('associate_to_workshop') : t('disassociate_from_workshop')}
        content={
          <>
            {isAdd ? t('confirm_associate') : t('confirm_disassociate')}
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color={isAdd ? 'primary' : 'error'}
            loading={isLoading}
            onClick={() => {
              handleSubmit();
            }}
          >
            {isAdd ? t('associate') : t('disassociate')}
          </LoadingButton>
        }
      />
    </>
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
