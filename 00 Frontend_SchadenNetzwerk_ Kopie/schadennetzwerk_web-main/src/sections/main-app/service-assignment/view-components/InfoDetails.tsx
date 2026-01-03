import Stack from "@mui/system/Stack";
import Typography from "@mui/material/Typography";

import Iconify from "src/components/iconify";

type Props = {
  icon: string;
  name: string;
}

export default function InfoDetails({ icon, name }: Props) {

  return (
    <Stack
      spacing={0.5}
      flexShrink={0}
      direction="row"
      alignItems="center"
      sx={{ color: 'text.disabled', minWidth: 0 }}
    >
      <Iconify width={16} icon={icon} sx={{ flexShrink: 0 }} />
      <Typography variant="caption" noWrap>
        {name}
      </Typography>
    </Stack>
  )
}
