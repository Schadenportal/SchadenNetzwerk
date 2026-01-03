import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Theme, SxProps } from '@mui/material/styles';

import EmptyContent from '../empty-content';

// ----------------------------------------------------------------------

type Props = {
  notFound: boolean;
  sx?: SxProps<Theme>;
};

export default function TableNoData({ notFound, sx }: Props) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell
          colSpan={18}
          sx={{
            p: 2,
            height: 320, // Set minimum height for proper display
            verticalAlign: 'middle', // Center content vertically
          }}
        >
          <EmptyContent
            filled
            title="No Data"
            sx={{
              py: 10,
              height: '100%', // Take full height of the cell
              minHeight: 280, // Ensure minimum height for visibility
              ...sx,
            }}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
