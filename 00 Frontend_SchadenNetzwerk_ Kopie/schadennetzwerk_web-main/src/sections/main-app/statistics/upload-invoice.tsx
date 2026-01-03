import { useMemo, useState, useEffect, useCallback } from 'react';

// @mui
import { alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  Stack,
  Button,
  Avatar,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// utils
import { fData } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import { downloadFileFromStorage } from 'src/utils/common';

// locales
import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import WorkshopModel from 'src/models/WorkshopModel';
import { FileInfo } from 'src/models/WorkshopFileModel';
import { manageFiles } from 'src/services/firebase/functions';
import { uploadFile } from 'src/services/firebase/firebaseStorage';
import { searchWorkshop, getWorkshopFilesSnapInfo } from 'src/services/firebase/firebaseFirestore';

// components
import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useSnackbar } from 'src/components/snackbar';
import Lightbox, { useLightBox } from 'src/components/lightbox';
import { PdfDialog, ExcelDialog } from 'src/components/custom-dialog';
import { slideFileType } from 'src/components/upload/preview-multi-file';

import { UserRole, QueryResultType } from 'src/types/enums';

// ----------------------------------------------------------------------

export default function UploadInvoiceView() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [workshops, setWorkshops] = useState<WorkshopModel[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('');
  const [downloadingFileId, setDownloadingFileId] = useState<string>('');
  const [deletingFileId, setDeletingFileId] = useState<string>('');

  // Viewer states
  const pdfDialog = useBoolean();
  const excelDialog = useBoolean();
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const slides = useMemo(() => {
    let fileUrls: slideFileType[] = [];
    if (selectedFileName && selectedFileUrl) {
      fileUrls = [{ src: selectedFileUrl, fileName: selectedFileName }];
    }
    return fileUrls;
  }, [selectedFileName, selectedFileUrl]);

  // Lightbox for images
  const lightbox = useLightBox(slides);

  // Check if user is workshop (can upload) or lawyer (can only view)
  const isWorkshop = user?.role === UserRole.Owner;
  const isLawyer = user?.role === UserRole.Lawyer;
  // const isAppraiser = user?.role === UserRole.Appraiser;
  const canUpload = isWorkshop || isLawyer;
  const userName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : 'Current User';

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  }, [files]);

  const handleRemoveFile = useCallback((inputFile: File | string) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
  }, [files]);

  const handleRemoveAllFiles = useCallback(() => {
    setFiles([]);
  }, []);

  // Fetch workshops based on user's workshopIds
  const fetchWorkshops = useCallback(async () => {
    if (!user || !user.workshopIds || user.workshopIds.length === 0) {
      return;
    }

    try {
      const workshopList = await searchWorkshop({ name: "", email: "", city: "" }, user.workshopIds);
      setWorkshops(workshopList);

      // Set first workshop as default if not already selected
      if (workshopList.length > 0 && !selectedWorkshopId) {
        setSelectedWorkshopId(workshopList[0].workshopId);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
      enqueueSnackbar(t('error_fetching_workshops'), { variant: 'error' });
    }
  }, [user, selectedWorkshopId, enqueueSnackbar, t]);

  const handleWorkshopChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedWorkshopId(event.target.value);
  }, []);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      enqueueSnackbar(t('please_select_files'), {
        variant: 'warning',
      });
      return;
    }

    if (!user) {
      enqueueSnackbar(t('user_not_authenticated'), {
        variant: 'error',
      });
      return;
    }

    if (!isWorkshop && !isLawyer) {
      enqueueSnackbar(t('you_do_not_have_permission_to_access_this_page'), {
        variant: 'error',
      });
      return;
    }

    if (!selectedWorkshopId) {
      enqueueSnackbar(t('please_select_workshop'), {
        variant: 'warning',
      });
      return;
    }

    try {
      setUploading(true);

      // Upload files to firebase
      let fileUrls: (Record<string, any> | null)[] = await Promise.all(
        files.map(async (file) => {
          if (file && file instanceof File) {
            const url = await uploadFile(file, `workshopFiles/${user?.uid}/${file.name}`);
            if (!url) {
              return null;
            }
            return {
              id: `${Date.now()}_${file.name}`,
              name: file.name,
              size: file.size,
              type: file.type,
              uploadedAt: new Date(),
              uploadedBy: userName || 'Current User',
              url
            };
          }
          return null;
        })
      );
      // Remove null values from fileUrls
      fileUrls = fileUrls.filter((file): file is FileInfo => file !== null);

      // Call backend API to save file urls using selected workshop
      const workshopId = selectedWorkshopId;

      // User only items which are not null
      if (fileUrls.length === 0) {
        enqueueSnackbar(t('no_valid_files_uploaded'), {
          variant: 'warning',
        });
        return;
      }
      const params = {
        workshopId,
        files: fileUrls
      }
      // Here you would typically call your backend API to save the uploaded files
      const res: any = await manageFiles(params);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg || 'Failed to upload file', {
          variant: 'error',
        });
        return;
      }

      enqueueSnackbar(
        t('file_uploaded_successfully'),
        { variant: 'success' }
      );
      setFiles([]);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('upload_error'), { variant: 'error' });
    } finally {
      setUploading(false);
    }
  }, [files, user, isWorkshop, isLawyer, selectedWorkshopId, enqueueSnackbar, t, userName]);

  const handleDownload = useCallback(async (event: React.MouseEvent, file: FileInfo) => {
    event.stopPropagation(); // Prevent card click event
    const fileUrl = file.url;
    if (fileUrl) {
      try {
        setDownloadingFileId(file.id);
        await downloadFileFromStorage(fileUrl);
        enqueueSnackbar(t('download_started'), { variant: 'success' });
      } catch (error) {
        console.error('Download error:', error);
        enqueueSnackbar(t('download_failed'), { variant: 'error' });
      } finally {
        setDownloadingFileId('');
      }
    }
  }, [enqueueSnackbar, t]);

  const handleDeleteUploaded = useCallback(async (event: React.MouseEvent, file: FileInfo) => {
    event.stopPropagation(); // Prevent card click event
    try {
      setDeletingFileId(file.id);
      const params = {
        workshopId: selectedWorkshopId,
        isDelete: true,
        fileUrl: file.url
      };
      const res: any = await manageFiles(params);
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        enqueueSnackbar(res.data.msg || 'Failed to delete file', {
          variant: 'error',
        });
        return;
      }

      enqueueSnackbar(
        t('deleted_successfully'),
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar(t('delete_failed'), { variant: 'error' });
    } finally {
      setDeletingFileId('');
    }
  }, [enqueueSnackbar, selectedWorkshopId, t]);

  const handleFileClick = useCallback((file: FileInfo) => {
    if (!file.url) {
      enqueueSnackbar(t('file_not_available'), { variant: 'warning' });
      return;
    }

    setSelectedFileUrl(file.url);
    setSelectedFileName(file.name);

    if (file.type.includes('pdf')) {
      pdfDialog.onTrue();
    } else if (file.type.includes('image')) {
      lightbox.onOpen(file.url);
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      excelDialog.onTrue();
    }
  }, [pdfDialog, excelDialog, lightbox, enqueueSnackbar, t]);

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return 'eva:file-text-fill';
    if (type.includes('image')) return 'eva:image-fill';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'eva:file-fill';
    return 'eva:file-fill';
  };

  const getFileColor = (type: string) => {
    if (type.includes('pdf')) return 'error';
    if (type.includes('image')) return 'info';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'success';
    return 'default';
  };

  const handleSuccess = (list: FileInfo[]) => {
    // Update uploaded files with the latest from snapshot
    setUploadedFiles(list);
  };

  useEffect(() => {
    // Fetch workshops when component mounts or user changes
    fetchWorkshops();
  }, [fetchWorkshops]);

  useEffect(() => {
    // Get uploaded files for selected workshop
    if (!selectedWorkshopId) {
      return () => { };
    }

    const unSubscribe = getWorkshopFilesSnapInfo(selectedWorkshopId, handleSuccess);
    return () => {
      unSubscribe();
    }
  }, [selectedWorkshopId]);

  return (
    <Stack spacing={3}>
      {/* Workshop Selection - Only for users with multiple workshops */}
      {canUpload && workshops.length > 1 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('select_workshop')}
          </Typography>

          <TextField
            select
            fullWidth
            label={t('workshop')}
            value={selectedWorkshopId}
            onChange={handleWorkshopChange}
            sx={{ maxWidth: 400 }}
          >
            {workshops.map((workshop) => (
              <MenuItem key={workshop.workshopId} value={workshop.workshopId}>
                {workshop.name}
              </MenuItem>
            ))}
          </TextField>
        </Card>
      )}

      {/* Workshop Info - Show workshop name when there's only one */}
      {canUpload && workshops.length === 1 && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              {t('workshop')}:
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {workshops[0].name}
            </Typography>
          </Box>
        </Card>
      )}

      {/* File Upload Section - Only for Workshop Users */}
      {canUpload && selectedWorkshopId && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('total_open_items')}
          </Typography>

          <Upload
            multiple
            files={files}
            onDrop={handleDrop}
            onRemove={handleRemoveFile}
            onRemoveAll={handleRemoveAllFiles}
            accept={{
              'application/pdf': ['.pdf'],
              'image/*': ['.jpg', '.jpeg', '.png'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            }}
          />

          {files.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleUpload}
                disabled={uploading}
                startIcon={uploading ? null : <Iconify icon="eva:cloud-upload-fill" />}
                sx={{ minWidth: 200 }}
              >
                {uploading ? 'Wird hochgeladen...' : `${files.length} Datei(en) hochladen`}
              </Button>
            </Box>
          )}

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                {t('uploading_files')}
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* Uploaded Files List - Visible to both Workshop and Lawyer */}
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('open_invoice_lawyer')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {uploadedFiles.length} {t('files_')}
          </Typography>
        </Box>

        {uploadedFiles.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Iconify icon="eva:file-text-outline" width={64} sx={{ mb: 2, opacity: 0.5 }} />
            <Typography variant="body1">
              {t("no_files")}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 2
            }}
          >
            {uploadedFiles.map((file) => (
              <Card
                key={file.id}
                sx={{
                  p: 2,
                  border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
                  '&:hover': {
                    bgcolor: 'background.neutral',
                  },
                }}
                onClick={() => handleFileClick(file)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1.5,
                      color: `${getFileColor(file.type)}.main`,
                      bgcolor: (theme) => {
                        const color = getFileColor(file.type);
                        if (color === 'error') return alpha(theme.palette.error.main, 0.16);
                        if (color === 'info') return alpha(theme.palette.info.main, 0.16);
                        if (color === 'success') return alpha(theme.palette.success.main, 0.16);
                        return alpha(theme.palette.grey[500], 0.16);
                      },
                    }}
                  >
                    <Iconify icon={getFileIcon(file.type)} width={16} />
                  </Avatar>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fData(file.size)}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {fDateTime(file.uploadedAt.toDate())} • {file.uploadedBy}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton
                    size="small"
                    onClick={(event) => handleDownload(event, file)}
                    sx={{ color: 'primary.main' }}
                    disabled={downloadingFileId === file.id}
                  >
                    {downloadingFileId === file.id ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Iconify icon="eva:download-outline" />
                    )}
                  </IconButton>

                  {canUpload && (
                    <IconButton
                      size="small"
                      onClick={(event) => handleDeleteUploaded(event, file)}
                      sx={{ color: 'error.main' }}
                      disabled={deletingFileId === file.id}
                    >
                      {deletingFileId === file.id ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Iconify icon="eva:trash-2-outline" />
                      )}
                    </IconButton>
                  )}
                </Stack>
              </Card>
            ))}
          </Box>
        )}
      </Card>

      {/* Summary Section */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('summary')}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 2
          }}
        >
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="h4" color="primary.main">
              {uploadedFiles.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('total_files')}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="h4" color="info.main">
              {fData(uploadedFiles.reduce((sum, file) => sum + file.size, 0))}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('total_size')}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="h4" color="success.main">
              {uploadedFiles.filter(f => f.type.includes('pdf')).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('pdf_documents')}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Pdf Viewer Dialog */}
      <PdfDialog
        open={pdfDialog.value}
        onClose={pdfDialog.onFalse}
        title={t('pdf_viewer')}
        fileUrl={selectedFileUrl}
        action=""
      />
      {/* Excel Viewer Dialog */}
      <ExcelDialog
        open={excelDialog.value}
        onClose={excelDialog.onFalse}
        title={t('excel_viewer')}
        fileUrl={selectedFileUrl}
        action=""
      />
      {/* Lightbox for Images */}
      <Lightbox
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        index={lightbox.selected}
        onGetCurrentIndex={(index) => lightbox.setSelected(index)}
      />
    </Stack>
  );
}
