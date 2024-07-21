import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const languages = {
    en: { nativeName: 'English', flag: '🇬🇧' },
    fr: { nativeName: 'Français', flag: '🇫🇷' },
};

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        handleMenuClose();
    };

    return (
        <div>
            <IconButton
                edge="end"
                color="inherit"
                aria-label="language"
                aria-controls="language-menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
            >
                <LanguageIcon />
            </IconButton>
            <Menu
                id="language-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {Object.keys(languages).map((lng) => (
                    <MenuItem key={lng} onClick={() => changeLanguage(lng)}>
                        <ListItemIcon>
                            <span role="img" aria-label={languages[lng].nativeName}>
                                {languages[lng].flag}
                            </span>
                        </ListItemIcon>
                        <ListItemText primary={languages[lng].nativeName} />
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default LanguageSwitcher;
