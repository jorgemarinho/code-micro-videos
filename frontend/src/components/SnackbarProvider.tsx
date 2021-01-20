// @flow 
import { IconButton, makeStyles, Theme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close'
import { SnackbarProvider as NotSnackbarProvider, SnackbarProviderProps } from 'notistack';

const useStyles = makeStyles( (theme: Theme) => {

    return {
        variantSuccess: {
            backgroundColor: theme.palette.success.main
        },
        variantError: {
            backgroundColor: theme.palette.error.main
        },
        variantInfo: {
            backgroundColor: theme.palette.primary.main
        }
    }
});

export const SnackbarProvider: React.FC<SnackbarProviderProps> = (props) => {

    let snackbarProviderRef;
    const classes = useStyles();
    const defaultProps: SnackbarProviderProps = {
        classes,
        autoHideDuration: 3000,
        maxSnack: 3,
        anchorOrigin: {
            horizontal: 'right',
            vertical: 'top'
        },
        children: snackbarProviderRef,
        ref: (el) => snackbarProviderRef = el,
        action: (key) => {
            <IconButton
                color={"inherit"}
                style={{ fontSize: 20 }}
                onClick={() => snackbarProviderRef.closeSnackbar(key)}
            >
                <CloseIcon />
            </IconButton>
        }
    }

    const newProps = { ...defaultProps, ...props };

    return (
        <NotSnackbarProvider {...newProps}>
            {props.children}
        </NotSnackbarProvider>
    );
};