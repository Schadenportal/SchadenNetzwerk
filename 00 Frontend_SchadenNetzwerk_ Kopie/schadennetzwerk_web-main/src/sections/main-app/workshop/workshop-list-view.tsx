import isEqual from 'lodash/isEqual';
import { useSnackbar } from 'notistack';
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
import WorkshopModel from 'src/models/WorkshopModel';
import { useMainData } from 'src/providers/data-provider';
import { ADMIN_ROLES, SUPER_ADMIN_ROLES } from 'src/constants/viewConstants';
import { getWorkshopSnapInfo } from 'src/services/firebase/firebaseFirestore';
import { removeWorkshopFunc, handleWorkshopInfoFunc } from 'src/services/firebase/functions';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
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

import { IWorkshopTableFilters } from 'src/types/workshop';
import { UserRole, QueryResultType, ServiceProviderType } from 'src/types/enums';

import WorkshopTableRow from './view-components/workshop-table-row';
import WorkshopTableToolbar from './view-components/workshop-table-toolbar';
import WorkshopFilterResult from './view-components/workshop-filter-result';

const defaultFilters: IWorkshopTableFilters = {
  name: '',
  city: '',
  email: '',
};

const TABLE_HEAD = [
  { id: 'name', label: 'Bezeichnung' },
  { id: 'email', label: 'E-Mail' },
  { id: 'phone', label: 'Telefon' },
  { id: 'city', label: 'Stadt' },
  { id: 'createdAt', label: 'Hergestellt in' },
  { id: 'action', label: '' },
];

export default function WorkshopListView() {
  const router = useRouter();
  const table = useTable();
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const { serviceProvider } = useMainData();
  const { enqueueSnackbar } = useSnackbar();
  const [filters, setFilters] = useState(defaultFilters);
  const [tableData, setTableData] = useState<WorkshopModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSendingContract, setIsSendingContract] = useState<boolean>(false);

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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

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

  const handleDeleteRow = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      await removeWorkshopFunc({ workshopId: id }).then((res: any) => {
        setIsDeleting(false);
        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          enqueueSnackbar(res.data.msg, {
            variant: 'error',
          });
          return;
        }
        enqueueSnackbar(t('deleted_successfully'), { variant: 'success' });
        const deleteRow = tableData.filter((row) => row.workshopId !== id);
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
    [dataInPage.length, enqueueSnackbar, t, table, tableData]
  );

  const handleSendContract = useCallback(
    async (id: string) => {
      setIsSendingContract(true);
      await handleWorkshopInfoFunc({ workshopId: id, sendContract: true }).then((res: any) => {
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
    [enqueueSnackbar, t]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      if (user && user.role === UserRole.Admin) {
        router.push(paths.admin.workshops.edit(id));
        return;
      }
      router.push(paths.dashboard.workshops.edit(id));
    },
    [router, user]
  );

  const handleAssignRow = useCallback(
    (id: string) => {
      if (user && ADMIN_ROLES.includes(user.role)) {
        router.push(paths.dashboard.service_providers.assign(id));
      }
    },
    [router, user]
  );

  const handleSuccess = useCallback((list: WorkshopModel[]) => {
    setTableData(list);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let userId: string | undefined;
    if ((serviceProvider && serviceProvider.serviceType === ServiceProviderType.ATTORNEY) || SUPER_ADMIN_ROLES.includes(user?.role)) {
      userId = undefined
    } else {
      userId = user?.userId;
    }
    setIsLoading(true);
    const unSubscribe = getWorkshopSnapInfo(userId, handleSuccess);
    return () => {
      unSubscribe();
    }
  }, [handleSuccess, serviceProvider, user]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('workshops')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('workshops'), href: paths.admin.workshops.root },
          { name: t('list') },
        ]}
        action={
          user && ADMIN_ROLES.includes(user.role) ?
            (<Button
              component={RouterLink}
              href={paths.admin.workshops.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('add_workshop')}
            </Button>)
            : ""
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card>
        <WorkshopTableToolbar
          filters={filters}
          onFilters={handleFilters}
        />

        {canReset && (
          <WorkshopFilterResult
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
                        <WorkshopTableRow
                          key={row.workshopId}
                          row={row}
                          role={user?.role || ''}
                          isDeleting={isDeleting}
                          isSendingContract={isSendingContract}
                          onDeleteRow={() => handleDeleteRow(row.workshopId)}
                          onEditRow={() => handleEditRow(row.workshopId)}
                          onAssignRow={() => handleAssignRow(row.workshopId)}
                          onSendContract={() => handleSendContract(row.workshopId)}
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
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: WorkshopModel[];
  comparator: (a: any, b: any) => number;
  filters: IWorkshopTableFilters;
}) {
  const { name, city, email } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (item) => item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (city) {
    inputData = inputData.filter(
      (item) => item.city.toLowerCase().indexOf(city.toLowerCase()) !== -1
    );
  }

  if (email) {
    inputData = inputData.filter(
      (item) => item.email.toLowerCase().indexOf(email.toLowerCase()) !== -1
    );
  }

  return inputData;
}
