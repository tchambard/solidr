import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'

export default () => {

    const { t } = useTranslation();

    return <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            textAlign: 'center',
            padding: '20px',
        }}
    >
        <Typography variant="h4" sx={{ marginBottom: '20px' }}>
            {t('access.denied.title')}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: '40px' }}>
            {t('access.denied.message')}
        </Typography>
        <Link to={`/sessions`}>
            <Button
                variant="contained"
                color="primary"
                sx={{
                    padding: '10px 20px',
                    fontSize: '16px',
                }}
            >
                {t('home')}
            </Button>
        </Link>
    </Box>
};