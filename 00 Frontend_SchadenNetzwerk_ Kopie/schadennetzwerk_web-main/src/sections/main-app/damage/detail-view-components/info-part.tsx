import format from 'date-fns/format';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';

import { _mock } from 'src/_mock';
import { useTranslate } from 'src/locales';
import UserModel from 'src/models/UserModel';
import DamageModel from 'src/models/DamageModel';
import { COLLECTION_USERS } from 'src/constants/firebase';
import { INSURANCE_TYPES } from 'src/constants/viewConstants';
import { getDocument } from 'src/services/firebase/firebaseFirestore';

import Label from 'src/components/label';

import { DamageStatusType } from 'src/types/enums';

type Props = {
  damage?: DamageModel;
};

export default function DetailInfo({ damage }: Props) {
  const { t } = useTranslate();
  const [userInfo, setUserInfo] = useState<UserModel>();

  const getInsuranceType = useCallback((value: string) => {
    const obj = INSURANCE_TYPES.find((item) => item.value === value)
    if (obj) {
      return obj.label;
    }
    return "";
  }, []);

  const getUserInfo = useCallback(async (userId: string) => {
    const user = await getDocument(COLLECTION_USERS, userId, UserModel);
    if (user) {
      setUserInfo(user);
    }
  }, []);

  useEffect(() => {
    if (damage) {
      getUserInfo(damage.userId);
    }
  }, [damage, getUserInfo]);

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
        <Card sx={{
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <CardHeader
            title={t('general')}
            action={
              <Label
                variant="soft"
                color={
                  (damage && damage.status === DamageStatusType.CREATED && 'error') ||
                  (damage && damage.status === DamageStatusType.SIGNED && 'warning') ||
                  (damage && damage.status === DamageStatusType.FINISHED && 'success') ||
                  'default'
                }
                sx={{
                  // set background color based on mode
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#424242' : '#E0E0E0',
                }}
              >
                {t(damage?.status || "")}
              </Label>
            }
          />
          <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
          <Stack direction="row" sx={{ p: 3 }}>
            <Avatar
              alt="avatar"
              src={userInfo && userInfo.photoURL ? userInfo.photoURL : _mock.image.avatar(1)}
              sx={{ width: 48, height: 48, mr: 2 }}
            />

            <Stack spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2' }}>
              <Box>
                {t('creator')}:
                <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  {userInfo && userInfo.firstName && userInfo.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : userInfo?.email}
                </Box>
              </Box>
              <Box>
                {t('order_no')}:
                <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  {damage && damage.orderNumber}
                </Box>
              </Box>
              <Box>
                {t('damage_no')}:
                <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }} />
              </Box>
              <Box>
                {t('date_of_accident')}:
                <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  {damage && damage.damageDate && format(damage.damageDate.toDate(), 'dd.MM.yyyy')}
                </Box>
              </Box>
              <Box>
                {t('created_at')}:
                <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  {damage && format(damage.createdAt.toDate(), 'dd.MM.yyyy')}
                </Box>
              </Box>
            </Stack>
          </Stack>
          <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
          <Stack spacing={0.5} alignItems="flex-start" sx={{ px: 3, py: 2 }}>
            <Label
              variant="soft"
              color={
                (damage && damage.insuranceType === "fullyComprehensive" && 'success') ||
                (damage && damage.insuranceType === "liability" && 'warning') ||
                (damage && damage.insuranceType === "partiallyComprehensive" && 'error') ||
                'default'
              }
              sx={{
                // set background color based on mode
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#424242' : '#E0E0E0',
              }}
            >
              {damage && getInsuranceType(damage.insuranceType)}
            </Label>
            {damage && damage.controlled && (
              <Label variant='soft' color='info' sx={{
                // set background color based on mode
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#424242' : '#E0E0E0',
              }}>
                Gesteuerter Versicherungsschaden
              </Label>
            )}
          </Stack>
        </Card>
      </Grid>

      <Grid xs={12} md={4}>
        <Card sx={{
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <CardHeader
            title={t('injured_party')}
            action=""
          />
          <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
          <Stack direction="row" sx={{ px: 3, py: 2 }}>
            <Stack spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2' }}>
              <Box>
                {damage && `${damage.customerFirstName} ${damage.customerLastName}`}
              </Box>
              <Box>
                {damage && damage.customerVehicleLicensePlate}
              </Box>
              <Box>
                Email:
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  &nbsp;{damage && damage.customerEmail}
                </Box>
              </Box>
              <Box>
                Mobile:
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  &nbsp;{damage && damage.customerPhone}
                </Box>
              </Box>
            </Stack>
          </Stack>
          <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
          <Stack direction="row" sx={{ px: 3 }}>
            <Stack spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2', alignItems: "end", width: "100%" }}>
              <Box>
                {damage && `${damage.tortfeasorFirstName} ${damage.tortfeasorLastName}`}
              </Box>
              <Box>
                {damage && damage.tortfeasorVehicleLicensePlate}
              </Box>
            </Stack>
          </Stack>
          <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
          <Stack spacing={0.5} alignItems="flex-end" sx={{ px: 3, py: 2 }}>
            <Box>
              Schädiger
            </Box>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  )
}
