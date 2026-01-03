import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

import SvgColor from '../../svg-color';

// ----------------------------------------------------------------------

/**
 * Gets the icon path based on the index from the icons array
 * @param icons - Array of icon names (e.g., ['sun', 'moon', 'red'])
 * @param index - Index of the current option
 * @returns Icon path in format '/assets/icons/setting/ic_[iconName].svg'
 */
const getIconFromIndex = (icons: string[], index: number): string => {
  const iconName = icons[index] || icons[0]; // Fallback to first icon if index is out of bounds
  return `/assets/icons/setting/ic_${iconName}.svg`;
};

// ----------------------------------------------------------------------

type Props = {
  icons: string[];
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
};

export default function BaseOptions({ icons, options, value, onChange }: Props) {
  return (
    <Stack direction="row" spacing={2}>
      {options.map((option, index) => {
        const selected = value === option;

        return (
          <ButtonBase
            key={option}
            onClick={() => onChange(option)}
            sx={{
              width: 1,
              height: 80,
              borderRadius: 1,
              border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
              ...(selected && {
                bgcolor: 'background.paper',
                boxShadow: (theme) =>
                  `-24px 8px 24px -4px ${alpha(
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[500]
                      : theme.palette.common.black,
                    0.08
                  )}`,
              }),
              '& .svg-color': {
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.grey[500]} 0%, ${theme.palette.grey[600]} 100%)`,
                ...(selected && {
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                }),
              },
            }}
          >
            <SvgColor src={getIconFromIndex(icons, index)} />
          </ButtonBase>
        );
      })}
    </Stack>
  );
}
