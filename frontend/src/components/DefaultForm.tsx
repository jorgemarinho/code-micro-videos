// @flow 
import { Grid, GridProps, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyle = makeStyles(theme => ({
    gridItem: {
        padding: theme.spacing(1,0)
    },
}));

interface DefaultFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>{
    GrindContainerProps?: GridProps;
    GrindItemProps?: GridProps;
}

export const DefaultForm : React.FC<DefaultFormProps> = (props) => {
    
    const classes = useStyle();
    const {GrindContainerProps, GrindItemProps, ...other} = props;

    return (
        <form {...other}>
            <Grid container {...GrindContainerProps} >
                <Grid className={classes.gridItem}  item {...GrindItemProps}>
                    {props.children}
                </Grid>
            </Grid> 
        </form>       
    );
};