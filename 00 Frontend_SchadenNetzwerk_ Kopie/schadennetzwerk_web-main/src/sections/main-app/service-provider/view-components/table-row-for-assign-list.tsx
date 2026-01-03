import { format } from 'date-fns';
import { useCallback } from 'react';
import { useParams } from 'react-router';

import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';

import { useTranslate } from 'src/locales';
import ServiceProviderModel from 'src/models/ServiceProviderModel';

import Label from 'src/components/label/label';

import { SERVICE_PROVIDER_OPTIONS } from './service-provider-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  row: ServiceProviderModel;
  onSelectRow: VoidFunction;
  role: string;
};

export default function TableRowForAssignList({
  selected,
  row,
  onSelectRow,
  role,
}: Props) {
  const {
    serviceType,
    name,
    email,
    phone,
    workshopIds,
    createdAt,
  } = row;

  const { t } = useTranslate();
  const { workshopId } = useParams();

  const setLabel = useCallback((label: string) => {
    const labelType = SERVICE_PROVIDER_OPTIONS.filter((item) => item.value === label);
    return (
      <Label variant="soft" color={labelType[0].color} > {labelType[0].abbreviation} </Label>
    )
  }, []);

  const setConnectedStatusLabel = useCallback(() => {
    if (workshopIds && workshopId && workshopIds.length > 0 && workshopIds.includes(workshopId)) {
      return (
        <Label variant="filled" color="success" > {t('connected')} </Label>
      )
    }
    return (
      <Label variant="filled" color="error" > {t('not_connected')} </Label>
    )
  }, [t, workshopId, workshopIds]);

  return (
    <TableRow hover selected={selected} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, }}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell>
        {name}
      </TableCell>

      <TableCell>
        {setLabel(serviceType)}
      </TableCell>

      <TableCell>
        {email}
      </TableCell>

      <TableCell>
        {phone}
      </TableCell>
      <TableCell>
        {setConnectedStatusLabel()}
      </TableCell>

      <TableCell>
        <ListItemText
          primary={format(createdAt.toDate(), 'dd MMM yyyy')}
          secondary={format(createdAt.toDate(), 'p')}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>
    </TableRow>
  );
}
