import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function IndexPage() {
    const { t } = useTranslation();
    return (
        <>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Link to={`/sessions`}>
                    <Button
                        variant='contained'
                        sx={{
                            background: 'linear-gradient(45deg, #9945FF 30%, #14F195 90%)',
                            color: 'white',
                            padding: '20px 40px',
                            fontSize: '32px',
                        }}
                    >
                        {t('start')}
                    </Button>
                </Link>
            </Box>
        </>
    );
}
