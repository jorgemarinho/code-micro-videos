// @flow 
import { Grid, IconButton, GridProps } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import * as React from 'react';

interface GridSelectedItemProps extends GridProps {
    onDelete: () => void
}

export const GridSelectedItem: React.FC<GridSelectedItemProps> = (props) => {
    const { onDelete, children, ...other } = props;
    return <Grid item {...other} >
        <Grid container alignItems={"center"} spacing={3}>
            <Grid item xs={1}>
                <IconButton size={"small"} color={"inherit"} onClick={onDelete}>
                    <DeleteIcon />
                </IconButton>
             </Grid>   
        </Grid>
        <Grid item xs={10} md={11}>
            {children}
        </Grid>
    </Grid>
};

export default GridSelectedItem;