import { format } from 'date-fns';
import { useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { downloadFileFromStorage } from 'src/utils/common';

import { useTranslate } from 'src/locales';
import RepairConfirmationModel from "src/models/RepairConfirmModel";

import Iconify from 'src/components/iconify';
import { CustomFile, MultiFilePreview } from 'src/components/upload';

type Props = {
  data: RepairConfirmationModel;
}

export default function RepairConfirmation({ data }: Props) {
  const { t } = useTranslate();

  const getAllFileUrls = useMemo(() => {
    const { frontImages, closeImages, rearImages, distanceImages, vehicleDocumentImages, otherImages } = data.images;
    const allImages = [...frontImages, ...closeImages, ...rearImages, ...distanceImages, ...vehicleDocumentImages, ...otherImages];
    return allImages;
  }, [data]);

  const handleDownloadFile = useCallback((file: string | CustomFile) => {
    const fileUrl = file as string;
    downloadFileFromStorage(fileUrl);
  }, []);

  return (
    <Box>
      <Box
        marginTop={2}
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
      >
        <Stack direction="column" spacing={1}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <Iconify icon="icon-park-outline:edit-name" width={20} sx={{ verticalAlign: "middle" }} />
            <Box fontWeight="bold"> {t('full_name')} </Box>
          </Stack>
          <Box component="span" sx={{ color: 'text.secondary', fontSize: 14 }}>{`${data.firstName} ${data.lastName}`}</Box>
        </Stack>
        <Stack direction="column" spacing={1}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <Iconify icon="mdi:address-marker-outline" width={20} sx={{ verticalAlign: "middle" }} />
            <Box fontWeight="bold"> {t('address')} </Box>
          </Stack>
          <Box component="span" sx={{ color: 'text.secondary', fontSize: 14 }}>{`${data.address?.street} ${data.address?.city} ${data.address?.postalCode}`}</Box>
        </Stack>
        <Stack direction="column" spacing={1}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <Iconify icon="clarity:date-line" width={20} sx={{ verticalAlign: "middle" }} />
            <Box fontWeight="bold"> {t('capture_date')} </Box>
          </Stack>
          <Box component="span" sx={{ color: 'text.secondary', fontSize: 14 }}>
            {data.captureDate ? format(new Date(data.captureDate), 'dd.MM.yyyy HH:mm') : ''}
          </Box>
        </Stack>

        <Stack direction="column" spacing={1}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <Iconify icon="material-symbols:license-outline" width={20} sx={{ verticalAlign: "middle" }} />
            <Box fontWeight="bold"> {t('license_plate')} </Box>
          </Stack>
          <Box component="span" sx={{ color: 'text.secondary', fontSize: 14 }}>{data.licensePlate}</Box>
        </Stack>
        <Stack direction="column" spacing={1}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <Iconify icon="fluent-mdl2:car" width={20} sx={{ verticalAlign: "middle" }} />
            <Box fontWeight="bold"> VIN </Box>
          </Stack>
          <Box component="span" sx={{ color: 'text.secondary', fontSize: 14 }}>{data.vin}</Box>
        </Stack>
        <Stack direction="column" spacing={1}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <Iconify icon="solar:calendar-broken" width={20} sx={{ verticalAlign: "middle" }} />
            <Box fontWeight="bold"> {t('created_at')} </Box>
          </Stack>
          <Box component="span" sx={{ color: 'text.secondary', fontSize: 14 }}>
            {data.captureDate ? format(data.createdAt.toDate(), 'dd.MM.yyyy HH:mm') : ''}
          </Box>
        </Stack>
      </Box>
      <Box fontWeight="bold" mt={5} sx={{ color: 'warning.main' }}> {t('uploaded_files')} </Box>
      <Box sx={{ my: 1 }}>
        <MultiFilePreview files={getAllFileUrls} thumbnail onDownload={(file) => handleDownloadFile(file)} />
      </Box>
    </Box>
  )
}
