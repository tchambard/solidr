import React from 'react';
import { Breadcrumbs, Typography } from '@mui/material';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router';

export default () => {
    const navigate = useNavigate();
    const sessionCurrent = useRecoilValue(sessionCurrentState);
    const resetSessionCurrent = useResetRecoilState(sessionCurrentState);

    const handleDisplayAllSessions = () => {
        resetSessionCurrent();
        navigate('/sessions');
    };

    return (
        <>
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    underline="hover"
                    color="inherit"
                    onClick={() => handleDisplayAllSessions()}
                    sx={{
                        cursor: 'pointer',
                    }}
                >
                    My Solidr sessions
                </Link>

                {sessionCurrent.session && (
                    <Typography color="text.primary">
                        {sessionCurrent.session.name} - {sessionCurrent.session.description}
                    </Typography>
                )}
            </Breadcrumbs>
        </>
    );
};
