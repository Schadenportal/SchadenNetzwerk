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
import AgentModel from 'src/models/AgentModel';
import { useAuthContext } from 'src/auth/hooks';
import { ADMIN_ROLES } from 'src/constants/viewConstants';
import { removeAgent } from 'src/services/firebase/functions';
import { getAgentSnapInfo } from 'src/services/firebase/firebaseFirestore';

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
import { IAgentTableFilters } from 'src/types/agent';

import AgentTableRow from './view-components/agent-table-row';
import AgentTableToolbar from './view-components/agent-table-toolbar';
import AgentFilterResult from './view-components/agent-filter-result';

const defaultFilters: IAgentTableFilters = {
  name: '',
  email: '',
};

const TABLE_HEAD = [
  { id: 'fullName', label: 'full_name' },
  { id: 'email', label: 'email' },
  { id: 'phone', label: 'phone' },
  { id: 'whatsapp', label: 'whatsapp' },
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

  const [tableData, setTableData] = useState<AgentModel[]>([]);
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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      await removeAgent({ agentId: id }).then((res: any) => {
        setIsDeleting(false);
        if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
          enqueueSnackbar(res.data.msg, {
            variant: 'error',
          });
          return;
        }
        enqueueSnackbar(t('deleted_successfully'), { variant: 'success' });
        const deleteRow = tableData.filter((row) => row.agentId !== id);
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
      router.push(paths.admin.agent.edit(id));
    },
    [router]
  );

  const handleSuccess = useCallback((data: AgentModel[]) => {
    setTableData(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const unSubscribe = getAgentSnapInfo(handleSuccess);
    return () => {
      unSubscribe();
    }
  }, [handleSuccess]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('agent')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('agent'), href: paths.admin.agent.root },
          { name: t('list') },
        ]}
        action={
          user && ADMIN_ROLES.includes(user.role) ?
            (<Button
              component={RouterLink}
              href={paths.admin.agent.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('add_agent')}
            </Button>)
            : ""
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card>
        <AgentTableToolbar
          filters={filters}
          onFilters={handleFilters} />

        {canReset && (
          <AgentFilterResult
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
                        <AgentTableRow
                          key={row.agentId}
                          role={user?.role || ''}
                          row={row}
                          isDeleting={isDeleting}
                          onDeleteRow={() => handleDeleteRow(row.agentId)}
                          onEditRow={() => handleEditRow(row.agentId)}
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
  inputData: AgentModel[];
  comparator: (a: any, b: any) => number;
  filters: IAgentTableFilters;
}) {
  const { name, email } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (item) => (`${item.firstName} ${item.lastName}`).toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (email) {
    inputData = inputData.filter(
      (item) => item.email.toLowerCase().indexOf(email.toLowerCase()) !== -1
    );
  }

  return inputData;
}
