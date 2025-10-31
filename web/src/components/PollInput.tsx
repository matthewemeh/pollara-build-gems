import { useMemo } from 'react';
import {
  Card,
  Checkbox,
  FormGroup,
  Typography,
  CardContent,
  FormControlLabel,
} from '@mui/material';

interface Props {
  poll: Poll;
  pollVotes: PollVote[];
  setPollVotes: React.Dispatch<React.SetStateAction<PollVote[]>>;
}

const PollInput: React.FC<Props> = ({ poll, pollVotes, setPollVotes }) => {
  const pollVote = useMemo(
    () => pollVotes.find(({ pollID }) => pollID === poll._id),
    [poll, pollVotes]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const optionID = event.target.name;

    setPollVotes(prev => {
      const newPollVotes = [...prev];
      const pollVote = newPollVotes.find(({ pollID }) => pollID === poll._id);

      if (checked) {
        if (pollVote) {
          if (!pollVote.optionIDs.includes(optionID)) {
            if (pollVote.optionIDs.length >= poll.maxSelectableOptions) {
              pollVote.optionIDs.pop();
            }
            pollVote.optionIDs.push(optionID);
          }
        } else newPollVotes.push({ pollID: poll._id, optionIDs: [optionID] });
      } else if (pollVote) {
        pollVote.optionIDs = pollVote.optionIDs.filter(optID => optID !== optionID);
      }

      return newPollVotes;
    });
  };

  return (
    <Card component='section' className='!shadow-md rounded-2xl mb-5 duration-400'>
      <CardContent className='flex flex-col gap-4'>
        <Typography variant='h6'>Poll {poll.index + 1}</Typography>
        <p className='flex flex-col gap-0.5'>
          <strong>{poll.question}</strong>
          <small>(You can select up to {poll.maxSelectableOptions} options)</small>
        </p>

        <FormGroup className='flex flex-col gap-3'>
          {poll.options.map(({ id, name, imageUrl }, index) => (
            <FormControlLabel
              key={id}
              name={id}
              className='w-fit'
              control={
                <Checkbox
                  onChange={handleChange}
                  checked={pollVote ? pollVote.optionIDs.includes(id) : false}
                />
              }
              label={
                <div className='flex items-center gap-3 p-2'>
                  {imageUrl && (
                    <div className='size-12'>
                      <img
                        src={imageUrl}
                        alt={`Option ${index + 1}`}
                        className='size-full object-cover rounded-md duration-400 z-2 hover:scale-150'
                      />
                    </div>
                  )}
                  <p>{name}</p>
                </div>
              }
            />
          ))}
        </FormGroup>
      </CardContent>
    </Card>
  );
};

export default PollInput;
