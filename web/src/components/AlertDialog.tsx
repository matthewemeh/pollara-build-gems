import { forwardRef, useCallback } from 'react';
import type { TransitionProps } from '@mui/material/transitions';
import {
  Slide,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

const Transition = forwardRef(
  (
    props: TransitionProps & { children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
  ) => {
    return <Slide direction='up' ref={ref} {...props} />;
  }
);

interface Props {
  open: boolean;
  dialogTitle: string;
  onClose?: () => void;
  keepMounted?: boolean;
  hideActions?: boolean;
  negationText?: string;
  onNegated?: () => void;
  onAffirmed?: () => void;
  affirmativeText?: string;
  affirmationOnly?: boolean;
  dialogContent: React.ReactNode;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AlertDialog: React.FC<Props> = ({
  open,
  setOpen,
  onClose,
  onNegated,
  onAffirmed,
  hideActions,
  keepMounted,
  dialogTitle,
  dialogContent,
  affirmationOnly,
  negationText = 'No',
  affirmativeText = 'Yes',
}) => {
  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [setOpen, onClose]);

  const handleAffirmation = useCallback(() => {
    setOpen(false);
    onAffirmed?.();
  }, [setOpen, onAffirmed]);

  const handleNegation = useCallback(() => {
    setOpen(false);
    onNegated?.();
  }, [setOpen, onNegated]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted={keepMounted}
      slots={{ transition: Transition }}
      aria-describedby='alert-dialog-slide-description'
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText component='div' id='alert-dialog-slide-description'>
          {dialogContent}
        </DialogContentText>
      </DialogContent>
      {hideActions || (
        <DialogActions>
          {affirmationOnly || <Button onClick={handleNegation}>{negationText}</Button>}
          <Button variant='contained' onClick={handleAffirmation}>
            {affirmativeText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AlertDialog;
