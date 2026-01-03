import { format } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import LoadingButton from '@mui/lab/LoadingButton';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { useBoolean } from 'src/hooks/use-boolean';

import { downloadFileFromStorage } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import RepairPlanDocModel from 'src/models/RepairPlanDocModel';
import { getRepairPlanDocTaskSnapInfo } from 'src/services/firebase/firebaseFirestore';

import Iconify from 'src/components/iconify';
import { PdfDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';

import { UserRole } from 'src/types/enums';

const rowsPerPage = 12;

export default function RepairPlanSection() {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const confirm = useBoolean();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<RepairPlanDocModel[]>([]);
  const [page, setPage] = useState(1);
  const [pdfFileUrl, setPdfFileUrl] = useState<string>("");

  const handleSuccess = useCallback((list: RepairPlanDocModel[]) => {
    setIsLoading(false);
    try {
      setTableData(list);
    } catch (err) {
      console.log("=== Error ===", err);
    }
  }, []);

  const handlePdfView = useCallback((fileUrl: string) => {
    setPdfFileUrl(fileUrl);
    confirm.onTrue();
  }, [confirm]);

  const handleDownload = (fileUrl: string) => {
    downloadFileFromStorage(fileUrl);
  }

  useEffect(() => {
    setIsLoading(true);
    let userId = "";
    if (user?.role === UserRole.Admin) {
      userId = "";
    } else {
      userId = user?.uid || "";
    }
    const unSubscribe = getRepairPlanDocTaskSnapInfo(handleSuccess, userId);
    return () => {
      unSubscribe();
    }
  }, [handleSuccess, user]);

  return (
    <>
      {isLoading && <LoadingScreen sx={{ mt: "25%" }} />}
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
      >
        {tableData.slice(rowsPerPage * (page - 1), rowsPerPage * page).map((item, key) => (
          <Card key={key}>
            <CardHeader
              title="Damage Info"
              action={
                <>
                  <LoadingButton variant='contained' color='primary' onClick={() => handlePdfView(item.fileUrl)}>
                    <Iconify icon="mdi:printer-preview" />
                  </LoadingButton>
                  <LoadingButton variant='contained' sx={{ ml: 2 }} color='info' onClick={() => handleDownload(item.fileUrl)}>
                    <Iconify icon="line-md:download-loop" />
                  </LoadingButton>
                </>
              }
            />
            <Stack direction="column" sx={{ p: 3 }}>
              <Box>
                {t('order_number')}
              </Box>
              <Box sx={{ color: 'text.secondary' }}>
                {item.damageInfo.orderNumber}
              </Box>
              <Box sx={{ mt: 1 }}>
                {t('customer')}
              </Box>
              <Box sx={{ color: 'text.secondary' }}>
                {item.damageInfo.customer}
              </Box>
              <Box sx={{ mt: 1 }}>
                {t('license_plate')}
              </Box>
              <Box sx={{ color: 'text.secondary' }}>
                {item.damageInfo.licensePlate}
              </Box>
              <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">{t('created_at')}:  {format(item.createdAt.toDate(), 'dd.MM.yyyy')}</Typography>
              </Box>
            </Stack>
          </Card>
        ))}
      </Box >
      {
        tableData.length > rowsPerPage && (
          <Pagination
            count={Math.ceil(tableData.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            sx={{
              mt: 8,
              [`& .${paginationClasses.ul}`]: {
                justifyContent: 'center',
              },
            }} />
        )
      }
      <PdfDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('pdf_viewer')}
        fileUrl={pdfFileUrl}
        action=""
      />
    </>
  )
}
