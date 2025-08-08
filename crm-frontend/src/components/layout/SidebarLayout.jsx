// src/components/layout/SidebarLayout.jsx
import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
    Box, CssBaseline, Toolbar, Typography, Divider, IconButton,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    useMediaQuery
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import GroupsIcon from "@mui/icons-material/Groups";
import { Link, useLocation, NavLink  } from "react-router-dom";
// import { AuthContext } from "../../contexts/AuthContext"; // si tu veux un bouton Déconnexion
import MapIcon from "@mui/icons-material/Map";

const drawerWidth = 220;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open" && prop !== "isMobile",
})(({ theme, open, isMobile }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(!isMobile && open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...(open && {
            ...openedMixin(theme),
            "& .MuiDrawer-paper": openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            "& .MuiDrawer-paper": closedMixin(theme),
        }),
    })
);

export default function SidebarLayout({ children }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const location = useLocation();
    // const { logout, user } = React.useContext(AuthContext); // si besoin

    // état pour desktop (mini-variant) et mobile (temporary)
    const [openDesktop, setOpenDesktop] = React.useState(true);
    const [openMobile, setOpenMobile] = React.useState(false);

    const toggleDrawer = () => {
        if (isMobile) setOpenMobile((s) => !s);
        else setOpenDesktop((s) => !s);
    };

    const navItems = [
        { to: "/projects", label: "Dashboard", icon: <DashboardIcon /> },
        { to: "/projects-list", label: "Projets", icon: <ListAltIcon /> },
        { to: "/investors-list", label: "Investisseurs", icon: <GroupsIcon /> },
        { to: "/carte", label: "Carte des Projets", icon: <MapIcon /> },
    ];

    // marge gauche du contenu pour ne pas passer sous le drawer (desktop uniquement)
    const contentMarginLeft = (theme) =>
        isMobile
            ? 0
            : openDesktop
                ? `${drawerWidth}px`
                : `calc(${theme.spacing(8)} + 1px)`; // largeur mini fermée (sm et +)

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f8fb" }}>
            <CssBaseline />

            <AppBar position="fixed" open={openDesktop} isMobile={isMobile} color="primary">
                <Toolbar sx={{ minHeight: 64 }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        edge="start"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap sx={{ fontWeight: 800, flex: 1 }}>
                        🌞 Gestion des Projets Solaires
                    </Typography>

                    {/* Exemple: bouton logout à droite (décommente si nécessaire)
          <Button color="inherit" onClick={logout}>Déconnexion</Button>
          */}
                </Toolbar>
            </AppBar>

            {/* Drawer permanent en desktop (mini variant), temporaire en mobile */}
            {isMobile ? (
                <MuiDrawer
                    variant="temporary"
                    open={openMobile}
                    onClose={() => setOpenMobile(false)}
                    ModalProps={{ keepMounted: true }}
                    PaperProps={{ sx: { width: drawerWidth } }}
                >
                    <DrawerHeader>
                        <IconButton onClick={() => setOpenMobile(false)}>
                            {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <List>
                        {navItems.map((item) => (
                            <ListItem key={item.to} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.to}
                                    selected={location.pathname === item.to}
                                    onClick={() => setOpenMobile(false)}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </MuiDrawer>
            ) : (
                <Drawer variant="permanent" open={openDesktop}>
                    <DrawerHeader>
                        <IconButton onClick={toggleDrawer}>
                            {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <List
                        sx={{
                            // style pour l’état actif
                            "& .MuiButtonBase-root.active": {
                                bgcolor: "action.selected",
                                "&:hover": { bgcolor: "action.selected" },
                            },
                        }}
                    >
                        {navItems.map(({ to, label, icon }) => (
                            <ListItem key={to} disablePadding sx={{ display: "block" }}>
                                <ListItemButton
                                    component={NavLink}
                                    to={to}
                                    // NavLink -> ajoute la classe "active" automatiquement
                                    sx={[
                                        { minHeight: 48, px: 2.5 },
                                        open ? { justifyContent: "initial" } : { justifyContent: "center" },
                                    ]}
                                >
                                    <ListItemIcon
                                        sx={[
                                            { minWidth: 0, justifyContent: "center" },
                                            open ? { mr: 3 } : { mr: "auto" },
                                        ]}
                                    >
                                        {icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={label}
                                        sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
            )}

            {/* Contenu */}
            <Box
                component="main"
                sx={(theme) => ({
                    flexGrow: 1,
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    p: { xs: 2, md: 3 },
                    ml: isMobile
                        ? 0
                        : openDesktop
                            ? `0px`
                            : `(0px + 1px)`, // largeur rail mini
                    transition: theme.transitions.create("margin-left", {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.shorter,
                    }),
                })}
            >
                <Toolbar />
                {children}
            </Box>

        </Box>
    );
}
