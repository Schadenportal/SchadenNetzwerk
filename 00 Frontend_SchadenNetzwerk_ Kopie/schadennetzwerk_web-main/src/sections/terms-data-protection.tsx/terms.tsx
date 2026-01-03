/* eslint-disable react/no-unescaped-entities */
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import { TermsStringContents } from 'src/constants/staticStrings';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import TermsComponent from './terms-component';


export default function TermsSection() {
  const { t } = useTranslate();


  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading={t('terms_of_use')}
        links={[
          { name: t('damage_management'), href: paths.dashboard.root },
          { name: t('terms_of_use'), href: paths.dashboard.termsOfUse },
        ]}
      />
      <Box my={3} sx={{ color: (theme) => theme.palette.text.tableText }}>
        <Typography variant='subtitle2'>
          Vielen Dank für Ihr Interesse an diesen Nutzungsbedingungen (die "Bedingungen"). Diese Bedingungen stellen eine rechtliche Vereinbarung zwischen Ihnen und uns dar, die die Nutzung von&nbsp;

          <Link href="https://www.schadennetzwerk.com" underline="none">
            www.schadennetzwerk.com
          </Link>
          ("unsere Website") und Schadennetzwerk, unserer Software-as-a-Service-Lösung ("SaaS"), regelt.
        </Typography>
      </Box>
      <TermsComponent contents={TermsStringContents} />
    </Container>
  )
}
