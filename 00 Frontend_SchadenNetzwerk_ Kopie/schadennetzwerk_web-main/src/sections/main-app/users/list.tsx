import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import UserModel from 'src/models/UserModel';
import { getUserSnapInfo } from 'src/services/firebase/firebaseFirestore';

import Scrollbar from 'src/components/scrollbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableSkeleton,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom
} from 'src/components/table';

import { IUserTableFilters } from 'src/types/users';

import UsersTableRow from './view-components/table-row';
import UsersTableToolbar from './view-components/table-toolbar';
import UsersFilterResult from './view-components/filter-result';

const defaultFilters: IUserTableFilters = {
  userType: '',
  name: '',
  email: '',
};

const TABLE_HEAD = [
  { id: 'name', label: 'name' },
  { id: 'email', label: 'email' },
  { id: 'phone', label: 'phone' },
  { id: 'userType', label: 'user_type' },
  { id: 'isOnline', label: 'online_status' },
  { id: 'LastOnlineAt', label: 'last_online_at' },
  { id: '' },
];

export default function UsersListView() {

  const { t } = useTranslate();
  const table = useTable();

  const [filters, setFilters] = useState(defaultFilters);
  const [tableData, setTableData] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const denseHeight = table.dense ? 60 : 80;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const canReset = !isEqual(defaultFilters, filters);

  // const dataInPage = dataFiltered.slice(
  //   table.page * table.rowsPerPage,
  //   table.page * table.rowsPerPage + table.rowsPerPage
  // );

  const notFound = (!dataFiltered.length && canReset) || !tableData;

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

  const handleSuccess = useCallback((data: UserModel[]) => {
    setTableData(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = getUserSnapInfo(undefined, handleSuccess);
    return () => {
      unsubscribe();
    };
  }, [handleSuccess]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('users')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('users'), href: paths.admin.users.root },
        ]}
        action=""
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card>
        <UsersTableToolbar filters={filters} onFilters={handleFilters} />

        {canReset && (
          <UsersFilterResult
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
                        <UsersTableRow
                          key={row.userId}
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
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: UserModel[];
  comparator: (a: any, b: any) => number;
  filters: IUserTableFilters;
}) {
  const { name, email, userType } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (userType) {
    inputData = inputData.filter((item) => item.role === userType);
  }

  if (name) {
    inputData = inputData.filter(
      (item) => (`${item?.firstName || ""} ${item?.lastName || ""}`).toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (email) {
    inputData = inputData.filter(
      (item) => item.email.toLowerCase().indexOf(email.toLowerCase()) !== -1
    );
  }

  return inputData;
}
