import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';

import { useTranslate } from 'src/locales';
import UserModel from 'src/models/UserModel';

import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';


// ----------------------------------------------------------------------

type Props = {
  contacts: UserModel[];
  damageId?: string;
  onAddRecipient: (selected: UserModel[]) => void;
};

export default function ChatHeaderCompose({ contacts, damageId, onAddRecipient }: Props) {
  const [searchRecipients, setSearchRecipients] = useState('');
  const { t } = useTranslate();

  const handleAddRecipients = useCallback(
    (selected: UserModel[] | null) => {
      if (!selected) return;
      setSearchRecipients('');
      onAddRecipient(selected);
    },
    [onAddRecipient]
  );

  return (
    <>
      <Typography variant="subtitle2" sx={{ color: 'text.primary', mr: 2 }}>
        To:
      </Typography>
      <Autocomplete
        sx={{ minWidth: 320 }}
        multiple
        limitTags={3}
        popupIcon={null}
        defaultValue={[]}
        disableCloseOnSelect
        noOptionsText={<SearchNotFound query={searchRecipients} />}
        onChange={(event, newValue) => handleAddRecipients(newValue)}
        onInputChange={(event, newValue) => setSearchRecipients(newValue)}
        options={contacts}
        getOptionLabel={(recipient) => `${recipient.firstName} ${recipient.lastName}`}
        isOptionEqualToValue={(option, value) => option.userId === value.userId}
        renderInput={(params) => <TextField {...params} placeholder={t('recipient')} />}
        renderOption={(props, recipient, { selected }) => (
          <li {...props} key={recipient.userId}>
            <Box
              key={recipient.userId}
              sx={{
                mr: 1,
                width: 32,
                height: 32,
                overflow: 'hidden',
                borderRadius: '50%',
                position: 'relative',
              }}
            >
              <Avatar alt={recipient.firstName} src={recipient.photoURL} sx={{ width: 1, height: 1 }} />
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  top: 0,
                  left: 0,
                  width: 1,
                  height: 1,
                  opacity: 0,
                  position: 'absolute',
                  bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
                  transition: (theme) =>
                    theme.transitions.create(['opacity'], {
                      easing: theme.transitions.easing.easeInOut,
                      duration: theme.transitions.duration.shorter,
                    }),
                  ...(selected && {
                    opacity: 1,
                    color: 'primary.main',
                  }),
                }}
              >
                <Iconify icon="eva:checkmark-fill" />
              </Stack>
            </Box>

            {`${recipient.firstName} ${recipient.lastName}`}
          </li>
        )}
        renderTags={(selected, getTagProps) =>
          selected.map((recipient, index) => (
            <Chip
              {...getTagProps({ index })}
              key={recipient.userId}
              label={`${recipient.firstName} ${recipient.lastName}`}
              avatar={<Avatar alt={recipient.firstName} src={recipient.photoURL} />}
              size="small"
              variant="soft"
            />
          ))
        }
      />
    </>
  );
}
