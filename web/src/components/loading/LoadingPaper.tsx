import { Paper } from '@mui/material';

import Loading from './Loading';

const LoadingPaper = () => {
  return (
    <Paper className='loading-paper'>
      <Loading />
    </Paper>
  );
};

export default LoadingPaper;
