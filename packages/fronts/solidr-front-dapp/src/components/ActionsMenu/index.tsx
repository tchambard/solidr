import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import * as _ from 'lodash';
import { IconButton, ListItemIcon, Menu, MenuItem, Tooltip, useMediaQuery } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { MoreHoriz } from '@mui/icons-material';

export interface IActionMenuItem {
    title: string;
    url?: string;
    color: string;
    icon: any;
    hidden?: boolean;
    description?: string;
    onClick?: () => void;
}

interface IProps {
    items: IActionMenuItem[];
}

export default ({ items }: IProps) => {
    // const theme = useTheme();
    const upSm = useMediaQuery('sm');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <>
            {upSm ? (
                _.map(items, (item) => {
                    if (!item.hidden) {
                        return (
                            <Tooltip key={item.title} placement={'bottom'} title={item.description || item.title}>
                                <Link to={item.url} onClick={item.onClick}>
                                    <IconButton
                                        // sx={{
                                        // 	'&:hover': {
                                        // 		background: theme.colors[item.color].lighter,
                                        // 	},
                                        // 	color: theme.palette[item.color].main,
                                        // }}
                                        color={'inherit'}
                                        size={'small'}
                                    >
                                        {item.icon}
                                    </IconButton>
                                </Link>
                            </Tooltip>
                        );
                    }
                })
            ) : (
                <Fragment>
                    <IconButton
                        onClick={handleClick}
                        size={'small'}
                        sx={{ ml: 2 }}
                        aria-controls={open ? 'action-menu' : undefined}
                        aria-haspopup={'true'}
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <MoreHoriz />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        id={'action-menu'}
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{
                            horizontal: 'right',
                            vertical: 'top',
                        }}
                        anchorOrigin={{
                            horizontal: 'right',
                            vertical: 'bottom',
                        }}
                    >
                        {_.compact(
                            _.map(items, (item) => {
                                if (!item.hidden) {
                                    return (
                                        <MenuItem key={item.title} onClick={item.onClick}>
                                            <ListItemIcon color={'inherit'}>{item.icon}</ListItemIcon>
                                            <ListItemText>{item.title}</ListItemText>
                                        </MenuItem>
                                    );
                                }
                            }),
                        )}
                    </Menu>
                </Fragment>
            )}
        </>
    );
};
