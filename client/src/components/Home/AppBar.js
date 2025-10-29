/**
 *
 * Responsive appbar, taken from MUI's website, https://mui.com/material-ui/react-app-bar/
 *
 */

import { useState, useContext } from "react";
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Avatar,
    Tooltip,
    MenuItem,
    Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { AuthContext } from "../../context/auth";

const settings = ["Logout"];

function ResponsiveAppBar() {
    const [anchorElUser, setAnchorElUser] = useState(null);
    const { dispatch } = useContext(AuthContext);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = (event) => {
        if (event.target.innerHTML === "Logout") {
            dispatch({ type: "LOGOUT" });
        }
        setAnchorElUser(null);
    };

    return (
        <AppBar position="static">
            <Toolbar
                id="toolbar"
                disableGutters
                sx={{
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        ml: "auto",
                    }}
                >
                    <Button component={RouterLink} to="/help" color="inherit" sx={{ mr: 2 }}>
                        Help
                    </Button>
                    <Tooltip title="Open settings">
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            <Avatar alt="Test" />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{ mt: "45px" }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        {settings.map((setting) => (
                            <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                <Typography textAlign="center">{setting}</Typography>
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
export default ResponsiveAppBar;
