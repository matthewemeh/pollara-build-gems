import { Card, FormGroup, Typography, CardContent } from '@mui/material';

interface Props {
  pollResult: PollResult;
}

const PollResult: React.FC<Props> = ({ pollResult: { options, poll, totalVotes } }) => {
  return (
    <Card component='section' className='!shadow-md rounded-2xl mb-5 duration-400'>
      <CardContent className='flex flex-col gap-4'>
        <Typography variant='h6'>Poll {poll.index + 1}</Typography>
        <strong>{poll.question}</strong>

        <FormGroup className='flex flex-col gap-3'>
          {poll.options.map(({ id, name, imageUrl }, index) => {
            const optionVotes = options.find(({ optionID }) => optionID === id)?.votes ?? 0;
            const optionVotePercentage = (optionVotes / totalVotes) * 100;

            return (
              <div key={id} className='relative border'>
                <div
                  style={{ width: `${optionVotePercentage}%` }}
                  className='absolute inset-y-0 w-1/2 bg-primary-300 flex items-center justify-end duration-500'
                />
                <p className='absolute top-1/2 -translate-y-1/2 right-2'>
                  <span className='font-semibold'>{optionVotePercentage.toFixed(2)}%</span> (
                  {optionVotes} vote
                  {optionVotes !== 1 && 's'})
                </p>
                <div className='relative flex items-center gap-3 p-2 rounded-md'>
                  {imageUrl && (
                    <div className='size-12'>
                      <img
                        src={imageUrl}
                        alt={`Option ${index + 1}`}
                        className='size-full object-cover rounded-md duration-400 z-2'
                      />
                    </div>
                  )}
                  <p className='font-semibold'>{name}</p>
                </div>
              </div>
            );
          })}
        </FormGroup>
      </CardContent>
    </Card>
  );
};

export default PollResult;
