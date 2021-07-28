// @flow 
import { IconButton, makeStyles, Tooltip } from '@material-ui/core';
import * as React from 'react';
import ClearAllIcon from '@material-ui/icons/ClearAll';

const useStyles = makeStyles( theme => ({
    IconButton: (theme as any).overrides.MUIDataTableToolbar.icon
}));

interface FilterResetButtonProps {
    handleClick: () => void
}

export const FilterResetButton: React.FC<FilterResetButtonProps> = (props) => {

    const classes = useStyles();
    return (
       <Tooltip title={'Limpar busca'}>
           <IconButton className={classes.IconButton} onClick={props.handleClick}>
                <ClearAllIcon/>
           </IconButton>
       </Tooltip>
    );
};