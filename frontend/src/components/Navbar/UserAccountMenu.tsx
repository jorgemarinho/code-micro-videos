import * as React from 'react';
import { Divider, IconButton, Menu as MuiMenu, MenuItem } from '@material-ui/core';
import AccountBox from '@material-ui/icons/AccountBox';
import { useKeycloak } from '@react-keycloak/web';

const UserAccountMenu = () => {

    const {keycloak, initialized} = useKeycloak();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: any) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    if(!initialized || !keycloak.authenticated){
        return null;
    }

    return (
        <React.Fragment>
            <IconButton
                edge="end"
                color="inherit"
                aria-label="open drawer"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpen}
            >
                <AccountBox />
            </IconButton>
            <MuiMenu
                id="menu-user-account"
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                getContentAnchorEl={null}
            >
                <MenuItem disabled={true}>
                    Full Cycle
                </MenuItem>
                <Divider/>
                <MenuItem>
                    Minha Conta
                </MenuItem>
                <Divider/>
                <MenuItem>
                    Logout
                </MenuItem>
            </MuiMenu>
        </React.Fragment>
    );
};

export default UserAccountMenu;