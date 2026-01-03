import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from "src/locales";
import { useAuthContext } from 'src/auth/hooks';
import { getDashboardData } from 'src/services/firebase/functions';

import Image from 'src/components/image';
import Iconify from "src/components/iconify/iconify";
import { useSnackbar } from 'src/components/snackbar';

import { UserRole } from 'src/types/enums';

import { DamageListView } from '../damage';
import Welcome from "./view-components/Welcome";
import PieChart from "./view-components/PieChart";
import LineChart from "./view-components/LineChart";
import ServiceTypeWidget from "./view-components/ServiceTypeWidget";

const defaultValues = {
  appraiserServices: 0,
  attorneyServices: 0,
  carRentalServices: 0,
  controlledDamages: 0,
  fullyCom: 0,
  liabilities: 0,
  partiallyCom: 0,
  commercialLiabilityServices: 0,
  personalLiabilityServices: 0,
  quotations: 0,
  totalDamages: 0,
  towingServices: 0,
  paintServices: 0,
  appraiserOpenedAll: 0,
  appraiserFinishedAll: 0,
  pendingDamages: 0,
  finishedDamages: 0,
  rukTotal: 0,
  repairScheduleTotal: 0,
  revenue: 0,
  averageRevenue: 0,
  diminished: 0,
  averageDiminished: 0,
  liabilityRate: 0,
  averageLiabilityRate: 0,
  fullyComprehensiveRate: 0,
  averageFullyComprehensiveRate: 0,
  controlledInsuranceLossRate: 0,
  averageControlledInsuranceLossRate: 0,
  totalLossCount: 0,
  repairedCount: 0,
  gasolineCount: 0,
  electricCount: 0,
  hybridCount: 0,
  firstOnTimeCount: 0,
  secondOnTimeCount: 0,
  notFirstOnTimeCount: 0,
  notSecondOnTimeCount: 0,
  chartDataByDate: {
    total: [{}],
    controlled: [{}],
    quotation: [{}],
    liability: [{}],
  },
  costDataByDate: {
    revenue: [{}],
    diminished: [{}],
    liabilityRate: [{}],
    fullyComprehensiveRate: [{}],
    controlledInsuranceLossRate: [{}],
  },
};

export default function StatisticsView() {
  const router = useRouter();
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [dashboardData, setDashboardData] = useState(defaultValues);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([
    'damage-overview',
    'service-types',
    'repair-services',
    'document-processing',
    'specialized-services',
    'vehicle-transport'
  ]);

  const { total, controlled, quotation, liability } = dashboardData.chartDataByDate;
  const { revenue, diminished, liabilityRate, fullyComprehensiveRate, controlledInsuranceLossRate } = dashboardData.costDataByDate;

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordions(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(accordion => accordion !== panel)
    );
  };

  const getData = useCallback(async () => {
    await getDashboardData()
      .then((res: any) => {
        if (!res.data.data || !res.data.data.chartDataByDate) return;
        setDashboardData(res.data.data);
      })
      .catch(err => {
        console.log("==Data Error==", err);
      });
  }, []);

  const handleRedirect = (path: string, allowedRoles: string[]) => {
    if (user && allowedRoles.includes(user.role)) {
      router.push(path);
    } else {
      // Show warning message
      enqueueSnackbar(t('you_do_not_have_permission_to_access_this_page'), {
        variant: 'warning',
      });
    }
  }

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Container
      maxWidth={false}
      sx={{
        px: { xs: 2, sm: 3, md: 4, lg: 6 }, // Responsive padding
        mx: 'auto',
        width: '100%'
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Welcome
            title=""
            description=""
            descriptionBold=""
            greeting=""
            img={<Image src="/logo/schadennetzwerk_logo.png" alt="schaden-logo" />}
            action={
              <Grid container spacing={3} sx={{ mt: 0 }}>
                {/* Go to Damage Card */}
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      boxShadow: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        borderColor: 'primary.main',
                        '& .card-image': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}
                    onClick={() => router.push(paths.dashboard.damages.vehicle_registration)}
                  >
                    <Box
                      className="card-image"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'primary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <Iconify icon="eva:car-fill" width={32} color="primary.main" />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        whiteSpace: 'pre-line',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 40
                      }}
                    >
                      {t('go_to_damage')}
                    </Typography>
                  </Card>
                </Grid>

                {/* Comprehensive Insurance Damage Card */}
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      boxShadow: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        borderColor: '#3898FA',
                        '& .card-image': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}
                    onClick={() => router.push(paths.dashboard.damages.new)}
                  >
                    <Box
                      className="card-image"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: '#e3f2fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <Iconify icon="eva:shield-fill" width={32} color="#3898FA" />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        whiteSpace: 'pre-line',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 40
                      }}
                    >
                      {t('comprehensive_insurance_damage')}
                    </Typography>
                  </Card>
                </Grid>

                {/* Transport Damage Card */}
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      boxShadow: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        borderColor: 'info.main',
                        '& .card-image': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}
                    onClick={() => handleRedirect(paths.dashboard.transport_damage.new, [UserRole.Appraiser, UserRole.Lawyer, UserRole.Owner, UserRole.SalesAppraiser, UserRole.Salesman])}
                  >
                    <Box
                      className="card-image"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'info.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <Iconify icon="eva:cube-fill" width={32} color="info.main" />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        whiteSpace: 'pre-line',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 40
                      }}
                    >
                      {t('go_to_transport_damage')}
                    </Typography>
                  </Card>
                </Grid>

                {/* Cost Estimate Card */}
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      boxShadow: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        borderColor: 'secondary.main',
                        '& .card-image': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}
                    onClick={() => handleRedirect(paths.dashboard.cost_estimate.new, [UserRole.Appraiser, UserRole.Lawyer, UserRole.Owner, UserRole.SalesAppraiser, UserRole.Salesman])}
                  >
                    <Box
                      className="card-image"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'secondary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <Iconify icon="eva:clipboard-fill" width={32} color="secondary.main" />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        whiteSpace: 'pre-line',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 40
                      }}
                    >
                      {t('go_to_cost_estimate')}
                    </Typography>
                  </Card>
                </Grid>

                {/* Used Car Card */}
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      boxShadow: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        borderColor: 'error.main',
                        '& .card-image': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}
                    onClick={() => handleRedirect(paths.dashboard.used_car.new, [UserRole.Appraiser, UserRole.Lawyer, UserRole.Owner, UserRole.SalesAppraiser, UserRole.Salesman])}
                  >
                    <Box
                      className="card-image"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'error.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <Iconify icon="eva:shopping-cart-fill" width={32} color="error.main" />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        whiteSpace: 'pre-line',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 40
                      }}
                    >
                      {t('go_to_used_car')}
                    </Typography>
                  </Card>
                </Grid>

                {/* Open Claim Card */}
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      boxShadow: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        borderColor: '#f77f0d',
                        '& .card-image': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}
                    onClick={() => handleRedirect(paths.dashboard.uploadList, [UserRole.Lawyer, UserRole.Owner, UserRole.Admin, UserRole.Appraiser])}
                  >
                    <Box
                      className="card-image"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: '#fff3e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <Iconify icon="eva:upload-fill" width={32} color="#f77f0d" />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        whiteSpace: 'pre-line',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 40
                      }}
                    >
                      {t('go_to_open_claim')}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            }
          />
        </Grid>
      </Grid>

      <DamageListView />

      {/* Main Dashboard Cards - 2 Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column - Charts & Analytics */}
        <Grid item xs={12} lg={8}>
          {/* Compact Dashboard Card with Tabs */}
          <Card sx={{ p: 3, my: 3, boxShadow: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                📈 {t('analytics_dashboard')}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LineChart
                  title={t('revenue_statistics')}
                  subheader=""
                  chart={{
                    categories: revenue.length ? revenue.map((val: any) => val.date) : undefined,
                    series: [
                      {
                        year: '2024',
                        data: [
                          {
                            name: t('revenue'),
                            data: revenue.length ? revenue.map((val: any) => val.revenue) : [],
                          },
                          {
                            name: t('diminished_value'),
                            data: diminished.length ? diminished.map((val: any) => val.diminished) : [],
                          },
                          {
                            name: t('liability_claims'),
                            data: liabilityRate.length ? liabilityRate.map((val: any) => val.liabilityRate) : [0]
                          },
                          {
                            name: t('fully_comprehensive'),
                            data: fullyComprehensiveRate.length ? fullyComprehensiveRate.map((val: any) => val.fullyComprehensiveRate) : [0]
                          },
                          {
                            name: t('controlled_insurance_loss'),
                            data: controlledInsuranceLossRate.length ? controlledInsuranceLossRate.map((val: any) => val.controlledInsuranceLossRate) : [0]
                          },
                        ],
                      },
                    ],
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <PieChart
                  title={t('damages_by_category')}
                  chart={{
                    series: [
                      { label: t('attorney'), value: dashboardData.attorneyServices },
                      { label: t('appraiser'), value: dashboardData.appraiserServices },
                      { label: t('car_rental'), value: dashboardData.carRentalServices },
                    ],
                  }}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Full Width Chart */}
          <Card sx={{ p: 3, boxShadow: 3 }}>
            <LineChart
              title={t('all_damage_statistics')}
              subheader=""
              chart={{
                categories: total.length ? total.map((val: any) => val.date) : undefined,
                series: [
                  {
                    year: '2023',
                    data: [
                      {
                        name: t('total_damage'),
                        data: total.length ? total.map((val: any) => val.total) : [],
                      },
                      {
                        name: t('controlled_damage'),
                        data: controlled.length ? controlled.map((val: any) => val.controlled) : [],
                      },
                      {
                        name: t('cost_estimated'),
                        data: quotation.length ? quotation.map((val: any) => val.quotation) : [],
                      },
                      {
                        name: t('liability_total'),
                        data: liability.length ? liability.map((val: any) => val.liability) : [],
                      },
                    ],
                  },
                ],
              }}
            />
          </Card>
        </Grid>

        {/* Right Column - KPIs & Status */}
        <Grid item xs={12} lg={4}>
          {/* Revenue KPIs Card */}
          <Card sx={{ p: 3, my: 3, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💰 {t('revenue_overview')}
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('total_repair_revenue')}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    €{(dashboardData.revenue || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('average_repair_revenue')}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    €{(dashboardData.averageRevenue || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('hourly_vr_rate')}: {t('liability_claims')}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    €{(dashboardData.averageLiabilityRate || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('hourly_vr_rate')}: {t('fully_comprehensive')}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    €{(dashboardData.averageFullyComprehensiveRate || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('hourly_vr_rate')}: {t('controlled_insurance_loss')}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    €{(dashboardData.averageControlledInsuranceLossRate || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('total_diminished_value')}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    €{(dashboardData.diminished || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {dashboardData.revenue > 0 ? (dashboardData.diminished / dashboardData.revenue * 100).toFixed(2) : 0}% {t('of_total_revenue')}
                </Typography>
              </Box>
            </Stack>
          </Card>

          {/* Status Overview Card */}
          <Card sx={{ p: 3, mb: 3, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🎯 Status Overview
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Iconify icon="eva:checkmark-fill" width={16} color="white" />
                  </Box>
                  <Typography variant="body2">{t('completed')}</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">{dashboardData.finishedDamages}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'warning.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Iconify icon="eva:clock-fill" width={16} color="white" />
                  </Box>
                  <Typography variant="body2">{t('pending')}</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">{dashboardData.pendingDamages}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Iconify icon="eva:alert-triangle-fill" width={16} color="white" />
                  </Box>
                  <Typography variant="body2">{t('total_loss')}</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">{dashboardData.totalLossCount}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'info.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Iconify icon="eva:settings-fill" width={16} color="white" />
                  </Box>
                  <Typography variant="body2">{t('repaired')}</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">{dashboardData.repairedCount}</Typography>
              </Box>
            </Stack>
          </Card>

          {/* Circular Progress KPIs */}
          <Card sx={{ p: 3, mb: 3, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 {t('performance_metrics')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={dashboardData.liabilities === 0 ? 0 : (dashboardData.liabilities / dashboardData.totalDamages * 100)}
                      size={60}
                      thickness={4}
                      color="info"
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary" fontWeight="bold">
                        {dashboardData.liabilities === 0 ? 0 : Math.round(dashboardData.liabilities / dashboardData.totalDamages * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" display="block">{t('liability')}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={dashboardData.fullyCom === 0 ? 0 : (dashboardData.fullyCom / dashboardData.totalDamages * 100)}
                      size={60}
                      thickness={4}
                      color="info"
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary" fontWeight="bold">
                        {dashboardData.fullyCom === 0 ? 0 : Math.round(dashboardData.fullyCom / dashboardData.totalDamages * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" display="block">{t('full_coverage')}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={dashboardData.partiallyCom === 0 ? 0 : (dashboardData.partiallyCom / dashboardData.totalDamages * 100)}
                      size={60}
                      thickness={4}
                      color="secondary"
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary" fontWeight="bold">
                        {dashboardData.partiallyCom === 0 ? 0 : Math.round(dashboardData.partiallyCom / dashboardData.totalDamages * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" display="block">{t('partial_coverage')}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={dashboardData.personalLiabilityServices === 0 ? 0 : (dashboardData.personalLiabilityServices / dashboardData.totalDamages * 100)}
                      size={60}
                      thickness={4}
                      color="info"
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary" fontWeight="bold">
                        {dashboardData.personalLiabilityServices === 0 ? 0 : Math.round(dashboardData.personalLiabilityServices / dashboardData.totalDamages * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" display="block">{t('personal_liability')}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={dashboardData.commercialLiabilityServices === 0 ? 0 : (dashboardData.commercialLiabilityServices / dashboardData.totalDamages * 100)}
                      size={60}
                      thickness={4}
                      color="secondary"
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary" fontWeight="bold">
                        {dashboardData.commercialLiabilityServices === 0 ? 0 : Math.round(dashboardData.commercialLiabilityServices / dashboardData.totalDamages * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" display="block">{t('commercial_liability')}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Service Efficiency & Quality KPIs */}
          <Card sx={{ p: 3, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ⚡ {t('service_efficiency')}
            </Typography>
            <Stack spacing={3}>
              {/* On-Time Performance */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('on_time_acceptance_rate')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {dashboardData.firstOnTimeCount + dashboardData.notFirstOnTimeCount === 0
                        ? 0
                        : Math.round((dashboardData.firstOnTimeCount / (dashboardData.firstOnTimeCount + dashboardData.notFirstOnTimeCount)) * 100)
                      }%
                    </Typography>
                    <Chip
                      label={`${dashboardData.firstOnTimeCount}/${dashboardData.firstOnTimeCount + dashboardData.notFirstOnTimeCount}`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.firstOnTimeCount + dashboardData.notFirstOnTimeCount === 0
                    ? 0
                    : (dashboardData.firstOnTimeCount / (dashboardData.firstOnTimeCount + dashboardData.notFirstOnTimeCount)) * 100
                  }
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Upload Performance */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('timely_upload_rate')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="info.main">
                      {dashboardData.secondOnTimeCount + dashboardData.notSecondOnTimeCount === 0
                        ? 0
                        : Math.round((dashboardData.secondOnTimeCount / (dashboardData.secondOnTimeCount + dashboardData.notSecondOnTimeCount)) * 100)
                      }%
                    </Typography>
                    <Chip
                      label={`${dashboardData.secondOnTimeCount}/${dashboardData.secondOnTimeCount + dashboardData.notSecondOnTimeCount}`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.secondOnTimeCount + dashboardData.notSecondOnTimeCount === 0
                    ? 0
                    : (dashboardData.secondOnTimeCount / (dashboardData.secondOnTimeCount + dashboardData.notSecondOnTimeCount)) * 100
                  }
                  color="info"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Service Distribution */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('service_distribution')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        {dashboardData.appraiserServices}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('appraiser')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        {dashboardData.attorneyServices}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('attorney')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {dashboardData.carRentalServices}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('rental')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Vehicle Type Breakdown */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('vehicle_types')}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'error.main'
                      }}
                    />
                    <Typography variant="caption">{t('gasoline')}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="medium">{dashboardData.gasolineCount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'success.main'
                      }}
                    />
                    <Typography variant="caption">{t('electric')}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="medium">{dashboardData.electricCount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'warning.main'
                      }}
                    />
                    <Typography variant="caption">{t('hybrid')}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="medium">{dashboardData.hybridCount}</Typography>
                </Box>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ borderStyle: 'dashed', my: 5 }} />

      {/* Search and Filter Section */}
      <Card sx={{ p: 3, mb: 3, boxShadow: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          🔍 {t('detailed_service_statistics')}
        </Typography>
        <TextField
          fullWidth
          placeholder="Search statistics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <IconButton size="small">
                <Iconify icon="eva:search-fill" />
              </IconButton>
            ),
          }}
        />

        {/* Alert for key metrics */}
        <Alert severity="info" sx={{ mb: 3 }}>
          📊 {t('quick_overview')}: {dashboardData.totalDamages} {t('total_damage')} | {dashboardData.pendingDamages} {t('pending')} | {dashboardData.finishedDamages} {t('completed')}
        </Alert>

        {/* Organized Accordion Sections */}
        <Stack spacing={2}>
          {/* Damage Overview Section */}
          <Accordion
            expanded={expandedAccordions.includes('damage-overview')}
            onChange={handleAccordionChange('damage-overview')}
            sx={{ boxShadow: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="eva:file-text-fill" color="primary.main" />
                <Typography variant="h6" fontWeight="bold">{t('damage_overview_processing')}</Typography>
                <Chip label={`${dashboardData.totalDamages} ${t('total')}`} size="small" color="primary" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <ServiceTypeWidget
                    title={t('manually_recorded_damage')}
                    total={dashboardData.totalDamages}
                    height={80}
                    width={80}
                    icon={<Image alt='car_image' src="/assets/images/statistic/pngs/7.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <ServiceTypeWidget
                    title={t('digital_damage')}
                    total={dashboardData.totalDamages}
                    height={80}
                    width={80}
                    icon={<Image alt='car_image' src="/assets/images/statistic/pngs/8.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <ServiceTypeWidget
                    title={t('open_damages')}
                    total={dashboardData.pendingDamages}
                    height={80}
                    width={80}
                    icon={<Image alt='car_image' src="/assets/images/statistic/pngs/9.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <ServiceTypeWidget
                    title={t('closed_damages')}
                    total={dashboardData.finishedDamages}
                    height={80}
                    width={80}
                    icon={<Image alt='car_image' src="/assets/images/statistic/pngs/10.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Service Types Section */}
          <Accordion
            expanded={expandedAccordions.includes('service-types')}
            onChange={handleAccordionChange('service-types')}
            sx={{ boxShadow: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="eva:settings-2-fill" color="info.main" />
                <Typography variant="h6" fontWeight="bold">{t('professional_services')}</Typography>
                <Chip label={`${dashboardData.liabilities} ${t('liability_claims')}`} size="small" color="info" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ServiceTypeWidget
                    title={t('liability_total')}
                    total={dashboardData.liabilities}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/7.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ServiceTypeWidget
                    title={t('liability_with_a_lawyer')}
                    total={dashboardData.attorneyServices}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/7.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ServiceTypeWidget
                    title={t('liability_with_appraiser')}
                    total={dashboardData.appraiserServices}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/7.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ServiceTypeWidget
                    title={t('liability_with_accident_compensation')}
                    total={dashboardData.carRentalServices}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/7.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Repair Services Section */}
          <Accordion
            expanded={expandedAccordions.includes('repair-services')}
            onChange={handleAccordionChange('repair-services')}
            sx={{ boxShadow: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="eva:car-fill" color="secondary.main" />
                <Typography variant="h6" fontWeight="bold">{t('repair_and_maintenance_services')}</Typography>
                <Chip label={t('active_services')} size="small" color="secondary" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <ServiceTypeWidget
                    title={t('total_loss')}
                    total={dashboardData.totalLossCount}
                    height={80}
                    width={80}
                    icon={< Image alt='img' src="/assets/images/statistic/pngs/3.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ServiceTypeWidget
                    title={t('bought_new_car')}
                    total={0}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/4.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ServiceTypeWidget
                    title={t('is_repaired')}
                    total={dashboardData.repairedCount}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/5.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ServiceTypeWidget
                    title={t('paint_and_bodywork_commissioned')}
                    total={dashboardData.paintServices}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/11.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ServiceTypeWidget
                    title={t('towing_service')}
                    total={dashboardData.towingServices}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/1.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Document Processing Section */}
          <Accordion
            expanded={expandedAccordions.includes('document-processing')}
            onChange={handleAccordionChange('document-processing')}
            sx={{ boxShadow: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="eva:file-text-fill" color="warning.main" />
                <Typography variant="h6" fontWeight="bold">{t('document_processing_and_timeline')}</Typography>
                <Chip
                  label={`${dashboardData.firstOnTimeCount + dashboardData.secondOnTimeCount} ${t('on_time')}`}
                  size="small"
                  color="success"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <ServiceTypeWidget
                    title={t('accepted_in_18')}
                    total={dashboardData.firstOnTimeCount}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/18.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <ServiceTypeWidget
                    title={t('uploaded_in_24')}
                    total={dashboardData.secondOnTimeCount}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/19.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <ServiceTypeWidget
                    title={t('not_accepted_in_18')}
                    total={dashboardData.notFirstOnTimeCount}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/20.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <ServiceTypeWidget
                    title={t('not_uploaded_in_24')}
                    total={dashboardData.notSecondOnTimeCount}
                    height={80}
                    width={80}
                    icon={<Image alt='img' src="/assets/images/statistic/pngs/21.png" sx={{ borderRadius: '50%' }} />}
                  />
                </Grid>
              </Grid> */}

              {/* Appraiser Tasks */}
              <Box sx={{ mt: 0 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <ServiceTypeWidget
                      title={t('appointed_for_assessment')}
                      total={dashboardData.appraiserServices}
                      height={80}
                      width={80}
                      icon={<Image alt='img' src="/assets/images/statistic/pngs/15.png" sx={{ borderRadius: '50%' }} />}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ServiceTypeWidget
                      title={t('assessments_pending')}
                      total={dashboardData.appraiserOpenedAll}
                      height={80}
                      width={80}
                      icon={<Image alt='img' src="/assets/images/statistic/pngs/16.png" sx={{ borderRadius: '50%' }} />}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ServiceTypeWidget
                      title={t('assessments_completed')}
                      total={dashboardData.appraiserFinishedAll}
                      height={80}
                      width={80}
                      icon={<Image alt='img' src="/assets/images/statistic/pngs/17.png" sx={{ borderRadius: '50%' }} />}
                    />
                  </Grid>
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Specialized Services Section */}
          <Accordion
            expanded={expandedAccordions.includes('specialized-services')}
            onChange={handleAccordionChange('specialized-services')}
            sx={{ boxShadow: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="eva:briefcase-fill" color="error.main" />
                <Typography variant="h6" fontWeight="bold">{t('specialized_services_and_estimates')}</Typography>
                <Chip label={t('extended_services')} size="small" color="error" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {/* Car Rental Services */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('car_rental_services')}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <ServiceTypeWidget
                        title={t('car_rental_created')}
                        total={0}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/12.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ServiceTypeWidget
                        title={t('car_rental_opened')}
                        total={0}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/13.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ServiceTypeWidget
                        title={t('accident_replacement_completed')}
                        total={dashboardData.carRentalServices}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/14.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Cost Estimates */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('cost_estimation_services')}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <ServiceTypeWidget
                        title={t('estimate_commissioned')}
                        total={0}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/22.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ServiceTypeWidget
                        title={t('estimate_pending')}
                        total={0}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/23.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ServiceTypeWidget
                        title={t('estimate_completed')}
                        total={0}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/24.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Vehicle Types & Transport Section */}
          <Accordion
            expanded={expandedAccordions.includes('vehicle-transport')}
            onChange={handleAccordionChange('vehicle-transport')}
            sx={{ boxShadow: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="eva:car-fill" color="success.main" />
                <Typography variant="h6" fontWeight="bold">{t('vehicle_types_and_transport_damage')}</Typography>
                <Chip
                  label={`${dashboardData.gasolineCount + dashboardData.electricCount + dashboardData.hybridCount} ${t('vehicles')}`}
                  size="small"
                  color="success"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {/* Engine Types */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('vehicle_engine_types')}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <ServiceTypeWidget
                        title={t('gasoline')}
                        total={dashboardData.gasolineCount}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/28.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ServiceTypeWidget
                        title={t('electric')}
                        total={dashboardData.electricCount}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/29.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ServiceTypeWidget
                        title={t('hybrid')}
                        total={dashboardData.hybridCount}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/30.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Transport Damage Services */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('transport_damage_and_workflow')}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <ServiceTypeWidget
                        title={t('transport_damage_initiated')}
                        total={0}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/7.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <ServiceTypeWidget
                        title={t('transport_damage_completed')}
                        total={0}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/24.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <ServiceTypeWidget
                        title={t('reparation_cost_acceptance')}
                        total={dashboardData.rukTotal}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/23.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <ServiceTypeWidget
                        title={t('repair_workflow_plan_created')}
                        total={dashboardData.repairScheduleTotal}
                        height={80}
                        width={80}
                        icon={<Image alt='img' src="/assets/images/statistic/pngs/9.png" sx={{ borderRadius: '50%' }} />}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Card>
    </Container >
  )
}
