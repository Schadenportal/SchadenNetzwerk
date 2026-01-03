import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import Label from "src/components/label";
import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import FileItem from './view-components/file-item';

const files = [
  {
    id: 1,
    fileName: 'Vollmacht Anwalt',
    fileSize: 280240,
    createdAt: '2025-06-09',
    fileUrl: 'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FVollmacht_Anwalt_09062025.pdf?alt=media&token=7cb89132-2246-4661-9bd4-99ebd45ccbca',
  },
  {
    id: 2,
    fileName: 'Auftrag_Gutachter_Honorar',
    fileSize: 334132,
    createdAt: '2025-06-10',
    fileUrl: 'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2Fappraiser_06102025.pdf?alt=media&token=410743ce-7495-4e0e-b669-edc1838bc796'
  },
  {
    id: 3,
    fileName: 'Reparaturablaufplan',
    fileSize: 88000,
    createdAt: '2024-06-01',
    fileUrl: 'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2Freparaturablaufplan.pdf?alt=media&token=7aa9f74d-804f-48d7-97c8-0bc2f3898de5&_gl=1*mt3b18*_ga*MTc1MzM5MDg3My4xNjk1NzEwNDY3*_ga_CW55HF8NVT*MTY5OTM0Mjc3MS4xOTEuMS4xNjk5MzQzNjc0LjYwLjAuMA..',
  },
  {
    id: 4,
    fileName: 'RKÜ Reparaturkostenübernahme',
    fileSize: 911310,
    createdAt: '2024-08-28',
    fileUrl: 'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2Fnew_rku.pdf?alt=media&token=a5eec37e-56ad-4953-910a-083f028551c4',
  },
  {
    id: 5,
    fileName: 'Honorar Gutachter neutral',
    fileSize: 141000,
    createdAt: '2024-06-01',
    fileUrl: 'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FHonorar_Gutachter_neutral.pdf?alt=media&token=3c5b6e42-fd1b-424b-9811-b4b872b08fed',
  },
  {
    id: 6,
    fileName: 'Widerruf',
    fileSize: 54100,
    createdAt: '2025-02-05',
    fileUrl: 'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FWiderruf_2025.pdf?alt=media&token=a4c46aed-e617-41d2-8274-ea3457c64ee7'
  },
  {
    id: 7,
    fileName: 'Schadenmanagement_im_Autohaus_2024',
    fileSize: 2200000,
    createdAt: '2025-06-06',
    fileUrl: 'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FSchadenmanagement_im_Autohaus_2024.pdf?alt=media&token=328cbbc2-2692-40c9-b2ba-5847784169b3'
  },
  {
    id: 8,
    fileName: 'Abschleppauftrag_DE',
    fileSize: 91000,
    createdAt: '2025-10-07',
    fileUrl: 'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FAbschleppauftrag_DE.pdf?alt=media&token=6d0ea4f3-5cd2-450a-b004-9a07176aff92'
  },
  {
    id: 9,
    fileName: 'Towing_Order_EN',
    fileSize: 90000,
    createdAt: '2025-10-07',
    fileUrl: 'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FAnlage_Datenschutz.pdf?alt=media&token=864a4508-09e0-466b-b079-32befda51af7'
  },
  {
    id: 9,
    fileName: 'Flyer',
    fileSize: 452592,
    createdAt: '2026-1-03',
    fileUrl: 'https://firebasestorage.googleapis.com/v0/b/schadennetzwerk-7dc39.appspot.com/o/pdf_sample%2FFlyer.pdf?alt=media&token=9a94e36b-4bfd-4738-98e3-e39c4f3fb51e'
  }
];

export default function FilesSection() {
  const { t } = useTranslate();

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('download_form')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('download_form'), href: paths.dashboard.downloadForm },
          { name: t('files') },
        ]}
        action={undefined}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Label startIcon={<Iconify icon="ic:baseline-notifications-active" />} variant='soft' color='info' sx={{ whiteSpace: 'normal', textTransform: 'initial', lineHeight: 'inherit', py: 1 }}>
        {t('you_can_download_form')}
      </Label>
      <Box
        marginTop={2}
        rowGap={3}
        columnGap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
      >
        {files.map((file) => (
          <FileItem key={file.id} fileSize={file.fileSize} createdAt={file.createdAt} fileUrl={file.fileUrl} fileName={file.fileName} />
        ))}
      </Box>
    </Container>
  )
};
