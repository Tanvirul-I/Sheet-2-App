import { useContext } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import ResponsiveAppBar from "../Home/AppBar";
import { AuthContext } from "../../context/auth";

export default function Help() {
    const { user } = useContext(AuthContext);

    return (
        <div>
            {user ? (
                <ResponsiveAppBar />
            ) : (
                <Box
                    component="header"
                    sx={{
                        width: "100%",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        py: 2,
                    }}
                >
                    <Container maxWidth="md">
                        <Typography variant="h6" component="div">
                            Sheet 2 App Help
                        </Typography>
                    </Container>
                </Box>
            )}
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Getting Started with Sheet 2 App
                </Typography>
                <Typography variant="body1" paragraph>
                    Sheet 2 App turns a Google Sheet into a simple permissions app. Use this guide
                    to learn how to set up your sheet, connect it, and verify that everyone has the
                    right level of access.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                    Role Sheet Structure
                </Typography>
                <Typography variant="body1" paragraph>
                    Each column in your Google Sheet represents a role. The first cell of a column
                    becomes the role name, and every cell beneath it is treated as an email address
                    for a member of that role. Make sure there are no blank header cells and that
                    each member email is on its own row.
                </Typography>
                <Typography variant="body1" paragraph>
                    For example, if column A is titled "Managers" and contains three email addresses
                    beneath the header, those addresses will be grouped under the Managers role
                    inside the app. Column B might be "Contributors" with its own list of emails,
                    and so on for the rest of your sheet.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                    Workflow Overview
                </Typography>
                <List>
                    <ListItem alignItems="flex-start">
                        <ListItemText
                            primary="1. Sign in with Google"
                            secondary="Authenticate with your Google account so the app can securely access the sheets you have permission to view."
                        />
                    </ListItem>
                    <ListItem alignItems="flex-start">
                        <ListItemText
                            primary="2. Provide the role sheet URL"
                            secondary="Paste the shareable link for the Google Sheet that lists your roles. The app reads the sheet and maps every column to a role using the structure described above."
                        />
                    </ListItem>
                    <ListItem alignItems="flex-start">
                        <ListItemText
                            primary="3. Review the generated roles"
                            secondary="After the sheet is processed you can review the detected roles and members, then save the app configuration for your team."
                        />
                    </ListItem>
                </List>
                <Typography variant="body1" paragraph>
                    If you update the sheet later, rerun the process to pull in the newest roles and
                    members. Keep the sheet headers descriptive so that everyone understands which
                    group they belong to.
                </Typography>
                <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 4 }}>
                    {user ? "Back to dashboard" : "Return to sign in"}
                </Button>
            </Container>
        </div>
    );
}
