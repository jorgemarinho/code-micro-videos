import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Breadcrumbs from './components/Breadcrumbs';
import { LoadingProvider } from './components/loading/LoadingProvider';
import { Navbar } from './components/Navbar';
import { SnackbarProvider } from './components/SnackbarProvider';
import Spinner from './components/Spinner';
import AppRouter from './routes/AppRouter';
import theme from './theme';
import { keycloak, keycloakConfig } from './util/auth';

function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={keycloakConfig}>
      <LoadingProvider>
        <MuiThemeProvider theme={theme}>
          <SnackbarProvider>
            <CssBaseline />
            <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
              <Spinner />
              <Navbar />
              <Box paddingTop={'70px'}>
                <Breadcrumbs />
                <AppRouter />
              </Box>
            </BrowserRouter>
          </SnackbarProvider>
        </MuiThemeProvider>
      </LoadingProvider>
    </ReactKeycloakProvider>
  );
}

export default App;
