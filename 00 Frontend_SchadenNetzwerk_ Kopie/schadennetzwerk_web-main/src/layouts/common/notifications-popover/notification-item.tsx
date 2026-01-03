import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Checkbox } from '@mui/material';
// import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
// import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';
import NotificationModel from 'src/models/NotificationModel';

// import Label from 'src/components/label';
// import FileThumbnail from 'src/components/file-thumbnail';

import { NotificationTypes } from 'src/types/enums';

// ----------------------------------------------------------------------

type Props = {
  notification: NotificationModel;
  isSelected: boolean;
  onChecked: (isChecked: boolean) => void;
  onOpenLink: VoidFunction;
};

export default function NotificationItem({ notification, isSelected, onChecked, onOpenLink }: Props) {

  const { t } = useTranslate();

  const [isChecked, setIsChecked] = useState(isSelected);

  const getTitle = useMemo(() => {
    const { type } = notification;
    const title: any = JSON.parse(notification.title);
    switch (type) {
      case NotificationTypes.CHAT:
        return t(title.title, { name: title.name });
      case NotificationTypes.FILE_UPLOAD:
        return t(title.title, { name: title.name });
      case NotificationTypes.APPRAISER_INFO_COMPLETE:
        return t(title.title);
      case NotificationTypes.COMPLAINT:
        return t(title.title);
      case NotificationTypes.INSURANCE_VALUATION:
        return t(title.title);
      case NotificationTypes.REPAIR_APPROVED:
        return t(title.title);
      case NotificationTypes.DAMAGE_CLOSED:
        return t(title.title);
      case NotificationTypes.INVOICE_INFO_CREATED:
        return t(title.title, { name: title.name });
      case NotificationTypes.INVOICE_INFO_UPDATED:
        return t(title.title, { name: title.name });
      default:
        return "unknown"
    }
  }, [notification, t]);

  const onCheckItem = () => {
    setIsChecked(!isChecked);
    onChecked(!isChecked);
  }

  useEffect(() => {
    setIsChecked(isSelected);
  }, [isSelected]);

  const renderAvatar = (
    <ListItemAvatar>
      <Stack direction="row">
        <Checkbox checked={isChecked} onChange={onCheckItem} onClick={(e) => e.stopPropagation()} />
        {notification.senderPhotoURL ? (
          <Avatar src={notification.senderPhotoURL} sx={{ bgcolor: 'background.neutral' }} />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'background.neutral',
            }}
          >
            <Box
              component="img"
              src={`/assets/icons/notification/${(notification.type === NotificationTypes.CHAT && 'ic_chat') ||
                (notification.type === NotificationTypes.FILE_UPLOAD && 'ic_delivery') ||
                (notification.type === NotificationTypes.APPRAISER_INFO_COMPLETE && 'ic_mail') ||
                (notification.type === NotificationTypes.COMPLAINT && 'ic_mail') ||
                (notification.type === NotificationTypes.INSURANCE_VALUATION && 'ic_mail') ||
                (notification.type === NotificationTypes.UNKNOWN && 'ic_delivery') ||
                (notification.type === NotificationTypes.REPAIR_APPROVED && 'ic_check') ||
                (notification.type === NotificationTypes.DAMAGE_CLOSED && 'ic_close') ||
                (notification.type === NotificationTypes.INVOICE_INFO_CREATED && 'ic_invoice') ||
                (notification.type === NotificationTypes.INVOICE_INFO_UPDATED && 'ic_invoice')
                }.svg`}
              sx={{ width: 24, height: 24 }}
            />
          </Stack>
        )}
      </Stack>
    </ListItemAvatar>
  );

  const renderText = (
    <ListItemText
      disableTypography
      primary={getTitle}
      secondary={
        <Stack
          direction="row"
          alignItems="center"
          sx={{ typography: 'caption', color: 'text.disabled' }}
          divider={
            <Box
              sx={{
                width: 2,
                height: 2,
                bgcolor: 'currentColor',
                mx: 0.5,
                borderRadius: '50%',
              }}
            />
          }
        >
          {fToNow(notification.createdAt.toDate())}
        </Stack>
      }
    />
  );

  const renderUnReadBadge = notification.isUnread && (
    <Box
      sx={{
        top: 26,
        width: 8,
        height: 8,
        right: 20,
        borderRadius: '50%',
        bgcolor: 'error.main',
        position: 'absolute',
      }}
    />
  );

  // const friendAction = (
  //   <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
  //     <Button size="small" variant="contained">
  //       Accept
  //     </Button>
  //     <Button size="small" variant="outlined">
  //       Decline
  //     </Button>
  //   </Stack>
  // );

  // const projectAction = (
  //   <Stack alignItems="flex-start">
  //     <Box
  //       sx={{
  //         p: 1.5,
  //         my: 1.5,
  //         borderRadius: 1.5,
  //         color: 'text.secondary',
  //         bgcolor: 'background.neutral',
  //       }}
  //     >
  //       {reader(
  //         `<p><strong>@Jaydon Frankie</strong> feedback by asking questions or just leave a note of appreciation.</p>`
  //       )}
  //     </Box>

  //     <Button size="small" variant="contained">
  //       Reply
  //     </Button>
  //   </Stack>
  // );

  // const fileAction = (
  //   <Stack
  //     spacing={1}
  //     direction="row"
  //     sx={{
  //       pl: 1,
  //       p: 1.5,
  //       mt: 1.5,
  //       borderRadius: 1.5,
  //       bgcolor: 'background.neutral',
  //     }}
  //   >
  //     <FileThumbnail
  //       file="http://localhost:8080/httpsdesign-suriname-2015.mp3"
  //       sx={{ width: 40, height: 40 }}
  //     />

  //     <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} flexGrow={1} sx={{ minWidth: 0 }}>
  //       <ListItemText
  //         disableTypography
  //         primary={
  //           <Typography variant="subtitle2" component="div" sx={{ color: 'text.secondary' }} noWrap>
  //             design-suriname-2015.mp3
  //           </Typography>
  //         }
  //         secondary={
  //           <Stack
  //             direction="row"
  //             alignItems="center"
  //             sx={{ typography: 'caption', color: 'text.disabled' }}
  //             divider={
  //               <Box
  //                 sx={{
  //                   mx: 0.5,
  //                   width: 2,
  //                   height: 2,
  //                   borderRadius: '50%',
  //                   bgcolor: 'currentColor',
  //                 }}
  //               />
  //             }
  //           >
  //             <span>2.3 GB</span>
  //             <span>30 min ago</span>
  //           </Stack>
  //         }
  //       />

  //       <Button size="small" variant="outlined">
  //         Download
  //       </Button>
  //     </Stack>
  //   </Stack>
  // );

  // const tagsAction = (
  //   <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
  //     <Label variant="outlined" color="info">
  //       Design
  //     </Label>
  //     <Label variant="outlined" color="warning">
  //       Dashboard
  //     </Label>
  //     <Label variant="outlined">Design system</Label>
  //   </Stack>
  // );

  // const paymentAction = (
  //   <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
  //     <Button size="small" variant="contained">
  //       Pay
  //     </Button>
  //     <Button size="small" variant="outlined">
  //       Decline
  //     </Button>
  //   </Stack>
  // );

  return (
    <ListItemButton
      onClick={onOpenLink}
      disableRipple
      sx={{
        py: 2.5,
        px: 1,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      {renderUnReadBadge}

      {renderAvatar}

      <Stack sx={{ flexGrow: 1, maxWidth: { xs: "230px", sm: "280px" } }}>
        {renderText}
        {/* {notification.type === 'friend' && friendAction}
        {notification.type === 'project' && projectAction}
        {notification.type === 'file' && fileAction}
        {notification.type === 'tags' && tagsAction}
        {notification.type === 'payment' && paymentAction} */}
      </Stack>
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

// function reader(data: string) {
//   return (
//     <Box
//       dangerouslySetInnerHTML={{ __html: data }}
//       sx={{
//         mb: 0.5,
//         '& p': { typography: 'body2', m: 0 },
//         '& a': { color: 'inherit', textDecoration: 'none' },
//         '& strong': { typography: 'subtitle2' },
//       }}
//     />
//   );
// }
