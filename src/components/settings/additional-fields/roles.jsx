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
    Skeleton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Role = () => {
    const dispatch = useDispatch();
    const role = useSelector((state) => state.additional.role);

    const [roleInput, setRoleInput] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        dispatch(getRole()).finally(() => setLoading(false));
    }, [dispatch]);

    const handleAddRole = async (e) => {
        e.preventDefault();
        if (!roleInput.trim()) return;

        setLoading(true);
        await dispatch(addRole(roleInput));
        setRoleInput('');
        await dispatch(getRole());
        setLoading(false);
    };

    const handleDeleteRole = async (id) => {
        setLoading(true);
        await dispatch(deleteRole(id));
        await dispatch(getRole());
        setLoading(false);
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
                        disabled={loading}
                    />
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        Add
                    </Button>
                </Stack>
            </form>

            <Stack spacing={1}>
                {loading ? (
                    // Show 5 skeleton lines while loading
                    Array.from(new Array(5)).map((_, index) => (
                        <Skeleton
                            key={index}
                            variant="rectangular"
                            height={40}
                            sx={{ borderRadius: 1, mb: 1 }}
                        />
                    ))
                ) : Array.isArray(role) && role.length > 0 ? (
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
                                disabled={loading}
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
