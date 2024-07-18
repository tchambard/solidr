import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'

export default () => {

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
            Access denied
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: '40px' }}>
            You don't have the authorization to access this session.
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
                Cancel
            </Button>
        </Link>
    </Box>
};