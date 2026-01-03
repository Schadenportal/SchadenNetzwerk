import { m } from 'framer-motion';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import NotificationModel from 'src/models/NotificationModel';
import { updateNotificationStatus } from 'src/services/firebase/functions';
import { getNotificationSnapInfo } from 'src/services/firebase/firebaseFirestore';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';
import { useSnackbar } from 'src/components/snackbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { QueryResultType, NotificationActionTypes } from 'src/types/enums';

import NotificationItem from './notification-item';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'all',
    label: 'all',
    count: 22,
  },
  {
    value: 'unread',
    label: 'unread',
    count: 12,
  },
  {
    value: 'archived',
    label: 'archived',
    count: 10,
  },
];

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const drawer = useBoolean();
  const isLoading = useBoolean(false);
  const router = useRouter();

  const smUp = useResponsive('up', 'sm');

  const [currentTab, setCurrentTab] = useState('all');
  const [isSelected, setIsSelected] = useState(false);
  const popover = usePopover();

  const { t } = useTranslate();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setIsSelected(false);
    setSelectedNotificationIds([]);
  }, []);

  const [notificationList, setNotificationList] = useState<NotificationModel[]>([]);
  const [unreadNotificationList, setUnReadNotificationList] = useState<NotificationModel[]>([]);
  const [archivedNotificationList, setArchivedNotificationList] = useState<NotificationModel[]>([]);

  const [selectedNotificationIds, setSelectedNotificationIds] = useState<string[]>([]);

  const totalUnRead = notificationList.filter((item) => item.isUnread === true).length;

  const handleSelectAll = () => {
    const newIsSelected = !isSelected;
    if (newIsSelected) {
      if (currentTab === 'all') {
        setSelectedNotificationIds(notificationList.map((item) => item.notificationId));
      } else if (currentTab === 'unread') {
        setSelectedNotificationIds(unreadNotificationList.map((item) => item.notificationId));
      } else if (currentTab === 'archived') {
        setSelectedNotificationIds(archivedNotificationList.map((item) => item.notificationId));
      }
    } else {
      setSelectedNotificationIds([]);
    }
    setIsSelected(newIsSelected);
  };

  const handleSuccess = (list: NotificationModel[]) => {
    setNotificationList(list);
    setUnReadNotificationList(list.filter((item) => item.isUnread === true));
    setArchivedNotificationList(list.filter((item) => item.isArchived === true));
  };

  const handleCheckItem = (isChecked: boolean, notificationId: string) => {
    // Check if the item is already in the selected list
    if (isChecked) {
      setSelectedNotificationIds([...selectedNotificationIds, notificationId]);
    } else {
      setSelectedNotificationIds(selectedNotificationIds.filter((id) => id !== notificationId));
    }
  }

  const handleCloseDrawer = () => {
    drawer.onFalse();
    // isSelectedAll.onTrue();
    setIsSelected(false);
    setSelectedNotificationIds([]);
  }

  const getUnreadCountsInTab = useCallback((tab: string) => {
    if (tab === 'all') {
      return totalUnRead;
    }
    if (tab === 'unread') {
      return unreadNotificationList.length;
    }
    if (tab === 'archived') {
      return archivedNotificationList.length;
    }
    return 0;
  }, [archivedNotificationList.length, totalUnRead, unreadNotificationList.length]);

  const updateNotificationTask = useCallback(async (actionType: NotificationActionTypes, ids: string[], isSilent = false) => {
    try {
      // Updating
      isLoading.onTrue();
      const res: any = await updateNotificationStatus({
        isUpdateStatus: true,
        actionType,
        notificationIds: ids
      });
      isLoading.onFalse();
      if (res.data.result !== QueryResultType.RESULT_SUCCESS) {
        if (!isSilent) {
          enqueueSnackbar(res.data.msg, {
            variant: 'error',
          });
        }
        return;
      }
      if (!isSilent) {
        enqueueSnackbar(t('updated_successfully'), {
          variant: 'success',
        });
      }
    } catch (error) {
      isLoading.onFalse();
      if (!isSilent) {
        enqueueSnackbar(t('something_went_wrong'), { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, isLoading, t])

  const makeAsRead = useCallback(async () => {
    if (selectedNotificationIds.length === 0) {
      return;
    }
    // Check if the selected items are unread
    const unReadIds: string[] = [];
    selectedNotificationIds.forEach((id) => {
      const notification = notificationList.find((item) => item.notificationId === id);
      if (notification && notification.isUnread) {
        unReadIds.push(id);
      }
    });
    if (unReadIds.length === 0) {
      return;
    }
    await updateNotificationTask(NotificationActionTypes.AS_READ, unReadIds);
  }, [notificationList, selectedNotificationIds, updateNotificationTask]);

  const makeAsArchived = useCallback(async () => {
    if (selectedNotificationIds.length === 0) {
      return;
    }
    // Check if the selected items are not archived
    const unArchivedIds: string[] = [];
    selectedNotificationIds.forEach((id) => {
      const notification = notificationList.find((item) => item.notificationId === id);
      if (notification && !notification.isArchived) {
        unArchivedIds.push(id);
      }
    });
    if (unArchivedIds.length === 0) {
      return;
    }
    await updateNotificationTask(NotificationActionTypes.AS_ARCHIVE, unArchivedIds);
  }, [notificationList, selectedNotificationIds, updateNotificationTask]);

  const deleteItems = useCallback(async () => {
    if (selectedNotificationIds.length === 0) {
      return;
    }
    await updateNotificationTask(NotificationActionTypes.AS_DELETE, selectedNotificationIds);
  }, [selectedNotificationIds, updateNotificationTask]);

  const handleOpenLink = async (notification: NotificationModel) => {
    if (notification.isUnread) {
      await updateNotificationTask(NotificationActionTypes.AS_READ, [notification.notificationId], true);
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  }

  useEffect(() => {
    // Get notification snap info
    if (!user) {
      return () => { };
    };
    const unSubscribe = getNotificationSnapInfo(user.id, handleSuccess);
    return () => {
      unSubscribe();
    }
  }, [user]);

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        {t('notifications')}
      </Typography>

      <Tooltip title={t('select_all')}>
        <IconButton color="primary" onClick={() => {
          handleSelectAll();
        }
        }>
          <Iconify icon="fluent-mdl2:multi-select" />
        </IconButton>
      </Tooltip>

      {!smUp && (
        <IconButton onClick={drawer.onFalse}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderTabs = (
    <Tabs value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={t(tab.label)}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={
                (tab.value === 'unread' && 'info') ||
                (tab.value === 'archived' && 'success') ||
                'default'
              }
            >
              {getUnreadCountsInTab(tab.value)}
            </Label>
          }
          sx={{
            '&:not(:last-of-type)': {
              mr: 3,
            },
          }}
        />
      ))}
    </Tabs>
  );

  const renderList = useMemo(() => {
    let allItems: NotificationModel[] = notificationList;
    if (currentTab === 'all') {
      allItems = notificationList;
    } else if (currentTab === 'unread') {
      allItems = unreadNotificationList;
    } else {
      allItems = archivedNotificationList;
    }
    return (
      <Scrollbar>
        <List disablePadding>
          {allItems.map((notification) => (
            <NotificationItem
              key={notification.notificationId}
              isSelected={selectedNotificationIds.indexOf(notification.notificationId) !== -1}
              notification={notification}
              onChecked={(isChecked) => handleCheckItem(isChecked, notification.notificationId)}
              onOpenLink={() => handleOpenLink(notification)}
            />
          ))}
        </List>
      </Scrollbar>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archivedNotificationList, currentTab, notificationList, selectedNotificationIds, unreadNotificationList]);

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? 'primary' : 'default'}
        onClick={drawer.onTrue}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={handleCloseDrawer}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 420 },
        }}
      >
        {renderHead}

        <Divider />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pl: 2.5, pr: 1 }}
        >
          {renderTabs}

          <IconButton onClick={popover.onOpen}>
            {isLoading.value ? (<CircularProgress size={24} />) : (
              <Iconify icon="solar:settings-bold-duotone" />
            )}
          </IconButton>

        </Stack>

        <Divider />

        {renderList}

        {/* Custom Popover */}
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          arrow="right-top"
          sx={{ width: 200 }}
        >
          <MenuItem
            onClick={() => {
              makeAsRead();
              popover.onClose();
            }}
            sx={{ color: 'success.light' }}
          >
            <Iconify icon="material-symbols:mark-email-read" />
            {t('make_as_read')}
          </MenuItem>

          {currentTab !== 'archived' && (
            <MenuItem
              onClick={() => {
                makeAsArchived();
                popover.onClose();
              }}
              sx={{ color: 'info.main' }}
            >
              <Iconify icon="material-symbols:archive" />
              {t('make_as_archived')}
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              deleteItems();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="material-symbols:delete" />
            {t('delete')}
          </MenuItem>
        </CustomPopover>
      </Drawer>
    </>
  );
}
