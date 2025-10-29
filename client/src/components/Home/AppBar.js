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
    Container,
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
            <Container maxWidth="xl">
                <Toolbar id="toolbar" disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component={RouterLink}
                        to="/"
                        sx={{
                            mr: 2,
                            fontWeight: 700,
                            color: "inherit",
                            textDecoration: "none",
                            flexGrow: 1,
                        }}
                    >
                        Sheet 2 App
                    </Typography>
                    <Button component={RouterLink} to="/help" color="inherit" sx={{ mr: 2 }}>
                        Help
                    </Button>
                    <Box sx={{ flexGrow: 0 }}>
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
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;
