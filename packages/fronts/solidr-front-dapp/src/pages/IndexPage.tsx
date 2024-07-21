import { Box, Button, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Link } from 'react-router-dom';

export default function IndexPage() {
    const { t } = useTranslation();
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: '60%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                px: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: { xs: 2, md: 0 },
                    mr: -2,
                    zIndex: 1,
                }}
            >
                <LazyLoadImage
                    width="240"
                    height="240"
                    src={'/logo.png'}
                    alt="Logo"
                    effect="opacity"
                />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    ml: { xs: 0, md: 2 },
                    zIndex: 1,
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
        </Box>
    );
}
