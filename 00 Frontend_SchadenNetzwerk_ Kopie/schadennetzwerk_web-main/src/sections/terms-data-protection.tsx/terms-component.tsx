import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TermsContext } from 'src/types/terms';

type Props = {
  contents: TermsContext[]
}

export default function TermsComponent({ contents }: Props) {
  return (
    <Box my={3} sx={{ color: (theme) => theme.palette.text.tableText }}>
      <ol className='terms-ol'>
        {contents.map((content, index) => (
          <li className='terms-li' key={index}>
            <Typography variant='h6'>{content.title}</Typography>
            {content.subTitles.length > 0 && (
              <ol className='terms-ol'>
                {content.subTitles.map((subContext, subIndex) => (
                  <li className='terms-li' key={subIndex * 50}>
                    <Typography variant='subtitle2'>
                      {subContext.subMainText}
                    </Typography>
                    {subContext.subSubTitles.length > 0 && (
                      <ol className='terms-ol'>
                        {subContext.subSubTitles.map((subSubContext, subSubIndex) => (
                          <li className='terms-li' key={subSubIndex * 1000}>
                            <Typography variant='subtitle2'>
                              {subSubContext}
                            </Typography>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </Box>
  )
}
