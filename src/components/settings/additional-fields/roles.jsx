import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addRole,
    getRole,
    deleteRole,
} from 'src/components/redux/reducers/additional-fields/additional';

import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Role = () => {
    const dispatch = useDispatch();
    const [roleInput, setRoleInput] = useState('');
    const role = useSelector((state) => state.additional.role);

    useEffect(() => {
        dispatch(getRole());
    }, [dispatch]);

    const handleAddRole = async (e) => {
        e.preventDefault();
        if (!roleInput.trim()) return;

        await dispatch(addRole(roleInput));
        setRoleInput('');
        dispatch(getRole());
    };

    const handleDeleteRole = async (id) => {
        await dispatch(deleteRole(id));
        dispatch(getRole());
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mt: 5 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Roles
            </Typography>

            <form onSubmit={handleAddRole}>
                <Stack direction="row" spacing={1} mb={3}>
                    <TextField
                        fullWidth
                        label="New Role"
                        variant="standard"
                        value={roleInput}
                        onChange={(e) => setRoleInput(e.target.value)}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Add
                    </Button>
                </Stack>
            </form>

            <Stack spacing={1}>
                {Array.isArray(role) && role.length > 0 ? (
                    role.map((item) => (
                        <Box
                            key={item._id}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: 1,
                                py: 0.5,
                            }}
                        >
                            <Typography variant="body1" noWrap>
                                {item.role}
                            </Typography>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteRole(item._id)}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))
                ) : (
                    <Typography color="text.secondary" align="center">
                        No roles found.
                    </Typography>
                )}
            </Stack>
        </Box>
    );
};

export default Role;
