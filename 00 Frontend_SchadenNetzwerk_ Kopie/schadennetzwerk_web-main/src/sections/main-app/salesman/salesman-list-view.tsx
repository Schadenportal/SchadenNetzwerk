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
import SalesmanModel from 'src/models/SalesmanModel';
import { removeSalesman } from 'src/services/firebase/functions';
import { searchSalesman } from 'src/services/firebase/firebaseFirestore';

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

import { ISalesmanTableFilters } from 'src/types/salesman';
import { UserRole, QueryResultType } from 'src/types/enums';

import SalesmanTableRow from './view-components/salesman-table-row';
import SalesmanTableToolbar from './view-components/salesman-toolbar';
import SalesmanFilterResult from './view-components/salesman-filter-result';

const defaultFilters: ISalesmanTableFilters = {
  name: '',
  salesmanNumber: '',
};

const TABLE_HEAD = [
  { id: 'name', label: 'name' },
  { id: 'email', label: 'email' },
  { id: 'phone', label: 'phone' },
  { id: 'salesmanNumber', label: 'salesman_number' },
  { id: 'createdAt', label: 'created_at' },
  { id: '' },
];

export default function ServiceProviderListView() {
  const router = useRouter();
  const table = useTable();
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [tableData, setTableData] = useState<SalesmanModel[]>([]);
  const [filters, setFilters] = useState(defaultFilters);

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
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = (!dataFiltered.length && canReset) || !tableData;

  const denseHeight = table.dense ? 60 : 80;

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    if (!user) {
      return
    }
    const workshopIds: string[] | undefined = user.role === UserRole.Admin ? undefined : user.workshopIds
    await searchSalesman(filters, workshopIds)
      .then((data) => {
        setTableData(data);
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
      });
  }, [filters, user]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      await removeSalesman({ salesmanId: id }).then((res: any) => {
        setIsDeleting(false);
        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          enqueueSnackbar(res.data.msg, {
            variant: 'error',
          });
          return;
        }
        enqueueSnackbar(t('deleted_successfully'), { variant: 'success' });
        const deleteRow = tableData.filter((row) => row.salesmanId !== id);
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
      router.push(paths.admin.salesman.edit(id));
    },
    [router]
  );

  useEffect(() => {
    refreshData()
  }, [refreshData]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('salesman')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('salesman'), href: paths.admin.salesman.root },
          { name: t('list') },
        ]}
        action={
          user && user.role === UserRole.Admin ?
            (<Button
              component={RouterLink}
              href={paths.admin.salesman.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('add_salesman')}
            </Button>)
            : ""
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card>
        <SalesmanTableToolbar
          filters={filters}
          onFilters={handleFilters} />

        {canReset && (
          <SalesmanFilterResult
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
                        <SalesmanTableRow
                          key={row.salesmanId}
                          role={user?.role || ''}
                          row={row}
                          isDeleting={isDeleting}
                          onDeleteRow={() => handleDeleteRow(row.salesmanId)}
                          onEditRow={() => handleEditRow(row.salesmanId)}
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
  inputData: SalesmanModel[];
  comparator: (a: any, b: any) => number;
  filters: ISalesmanTableFilters;
}) {
  const { name, salesmanNumber } = filters;

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

  if (salesmanNumber) {
    inputData = inputData.filter(
      (item) => item.salesmanNumber.toLowerCase().indexOf(salesmanNumber.toLowerCase()) !== -1
    );
  }

  return inputData;
}
