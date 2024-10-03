import { useState } from 'react';
import { PropTypes } from 'prop-types';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

const FeedbackDialog = ({ open, onClose, onSubmit }) => {
  const [localFeedback, setLocalFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit(localFeedback);
    setLocalFeedback('');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Provide Feedback</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Feedback (optional)"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={localFeedback}
          onChange={(e) => setLocalFeedback(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};
FeedbackDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
export default FeedbackDialog;
