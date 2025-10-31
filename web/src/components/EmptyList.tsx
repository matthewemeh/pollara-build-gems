import { Tooltip } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';

import { LinkButton } from './index';

export interface EmptyListProps {
  url?: string;
  addText?: string;
  emptyText: string;
  startIcon?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  addButtonDisabled?: boolean;
  addButtonTooltipText?: string;
  addComponent?: React.ReactNode;
}

const EmptyList: React.FC<EmptyListProps> = ({
  addText,
  emptyIcon,
  emptyText,
  url = '/',
  addComponent,
  addButtonDisabled,
  addButtonTooltipText,
  startIcon = <AddCircleOutline />,
}) => {
  return (
    <div className='empty-list'>
      {emptyIcon}
      <p className='text-xl font-medium'>{emptyText}</p>
      {addComponent ||
        (addText && (
          <Tooltip title={addButtonTooltipText}>
            <span>
              <LinkButton
                to={url}
                variant='contained'
                startIcon={startIcon}
                disabled={addButtonDisabled}
              >
                {addText}
              </LinkButton>
            </span>
          </Tooltip>
        ))}
    </div>
  );
};

export default EmptyList;
