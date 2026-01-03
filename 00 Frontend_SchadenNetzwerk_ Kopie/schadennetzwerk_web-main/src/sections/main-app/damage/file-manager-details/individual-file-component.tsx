import format from "date-fns/format";
import { useParams } from 'react-router';
import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from "src/hooks/use-boolean";

import { modifyFileName, downloadFileFromStorage } from "src/utils/common";

import { useTranslate } from 'src/locales';
import { uploadFile } from 'src/services/firebase/firebaseStorage';
import { removeDamageFile, uploadDamageRelatedFiles } from "src/services/firebase/functions";

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { PdfDialog } from "src/components/custom-dialog";

import { QueryResultType } from "src/types/enums";

import { VisuallyHiddenInput } from '../vehicle-registration-view';
// ----------------------------------------------------------------------

export const StyledIconButton = styled(IconButton)({
  width: 28,
  height: 28,
  padding: 0,
  opacity: 0.9,
  '&:hover': { opacity: 1 },
});

// ----------------------------------------------------------------------

export type Files = {
  name: string;
  uploadedAt: string;
  fileUrl: string;
}

type Props = {
  fileGroupId: string | null;
  category: string;
  subCategory: string;
  files: Record<string, any>[];
  needUpload: boolean;
  isUploaded: boolean;
  shouldShowDelete?: boolean;
}

export default function IndividualFileComponent(
  {
    fileGroupId,
    category,
    subCategory,
    files,
    needUpload,
    isUploaded,
    shouldShowDelete = true
  }: Props) {
  const { t } = useTranslate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useBoolean();

  const [isUploading, setIsUploading] = useState(false);
  const [pdfFileUrl, setPdfUrl] = useState<string>("");

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setIsUploading(true);
      const newFiles = Array.from(e.target.files);
      const fileData = newFiles[0];
      const dbData: Record<string, any> = {
        damageId: id,
        category,
        subCategory,
        fileName: fileData.name,
        fileUrl: ""
      }
      const filePath = `damageRelatedFiles/${format(new Date(), 'yyyy-MM-dd')}/${modifyFileName(fileData.name)}`;
      try {
        const downloadUrl = await uploadFile(fileData, filePath);
        if (downloadUrl) {
          dbData.fileUrl = downloadUrl;
          const res: any = await uploadDamageRelatedFiles(dbData);
          if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
            enqueueSnackbar(res.data.msg, {
              variant: 'error',
            });
            return;
          }
          enqueueSnackbar(t('file_uploaded_successfully'));
        }
        setIsUploading(false);
      } catch (err) {
        enqueueSnackbar(t('something_went_wrong'), {
          variant: 'error',
        });
        setIsUploading(false);
      }
    }
  }, [id, category, subCategory, enqueueSnackbar, t]);

  const handlePdfShow = (fileUrl: string) => {
    setPdfUrl(fileUrl);
    confirm.onTrue();
  }

  const handleDownload = (fileUrl: string) => {
    downloadFileFromStorage(fileUrl);
  }

  const handleDelete = async (fileUrl: string) => {
    try {
      const res: any = await removeDamageFile({ fileGroupId, fileUrl });
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg, {
          variant: 'error',
        });
        return;
      }
      enqueueSnackbar(t('deleted_successfully'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('something_went_wrong'), {
        variant: 'error',
      });
    }
  }

  return (
    <Stack spacing={1} direction="column" width="100%">
      <Stack direction={{ xs: "column", md: "row" }} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ width: '66%', flexShrink: 0, color: 'warning.main' }}>
          {t(subCategory)}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Label variant='outlined' color={files.length ? 'success' : 'error'}>{files.length ? t('uploaded') : t('no_files')}</Label>
          {needUpload && (
            <LoadingButton sx={{ bgcolor: 'success.main' }} size='small' component="label" loading={isUploading}>
              <Iconify icon="ic:baseline-plus" width={24} />
              <VisuallyHiddenInput type='file' onChange={handleFileUpload} />
            </LoadingButton>
          )}
        </Stack>
      </Stack>
      {files.map(file => (
        <Stack key={file.fileGroupId || Math.random()}>
          <Typography variant="subtitle1" sx={{ color: 'primary', wordBreak: 'break-all' }}>{file.name}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ color: 'text.secondary', mr: "1rem" }}>{file.uploadedAt ? format(new Date(file.uploadedAt * 1000), 'dd MMM yyyy HH:mm') : ""}</Typography>
            <Stack direction="row">
              <Tooltip title="show">
                <LoadingButton sx={{ minWidth: 0 }}
                  onClick={() => {
                    if (file.name.includes(".pdf")) {
                      handlePdfShow(file.fileUrl);
                    }
                  }}
                >
                  <Iconify icon="mdi:show" color="info.lighter" />
                </LoadingButton>
              </Tooltip>
              <Tooltip title="download">
                <LoadingButton color="inherit" sx={{ minWidth: 0 }} onClick={() => handleDownload(file.fileUrl)}>
                  <Iconify icon="material-symbols:download" color="success.lighter" />
                </LoadingButton>
              </Tooltip>
              {file.groupId !== file.fileUrl && shouldShowDelete && (
                <Tooltip title="delete">
                  <LoadingButton color="inherit" sx={{ minWidth: 0 }} onClick={() => handleDelete(file.fileUrl)}>
                    <Iconify icon="material-symbols:delete" color="red" />
                  </LoadingButton>
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Stack >
      ))
      }
      <PdfDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('pdf_viewer')}
        fileUrl={pdfFileUrl}
        action=""
      />
    </Stack >
  )
}
