// @flow 
import MUIDataTable, { MUIDataTableColumn, MUIDataTableOptions, MUIDataTableProps } from 'mui-datatables';
import * as React from 'react';
import {cloneDeep, merge, omit} from 'lodash';
import { MuiThemeProvider, Theme, useMediaQuery, useTheme } from '@material-ui/core';

export interface TableColumn extends MUIDataTableColumn{
    width?: string;
}

const defaultOptions: MUIDataTableOptions = {
    print: false,
    download: false,
    textLabels: {
        body: {
            noMatch: "Nenhum registro encontrado",
            toolTip: "Classificar"
        },
        pagination: {
            next: "Próxima página",
            previous: "Página anterior",
            rowsPerPage: "Por página",
            displayRows: "de",            
        },
        toolbar: {
            search: "Busca",
            downloadCsv: "Download CSV",
            print: "Imprimir",
            viewColumns: "Ver Colunas",
            filterTable: "Filtrar Tabelas",
        },
        filter: {
            all: "Todos",
            title: "FILTROS",
            reset: "LIMPAR",
        },
        viewColumns: {
            title: "Ver Colunas",
            titleAria: "Ver/Esconder Colunas de Tabela"
        },
        selectedRows: {
            text: "registros(s) selecionados",
            delete: "Excluir",
            deleteAria: "Excluir registros selecionados",
        }
    }
}


export interface MuiDataTableRefComponent{
    changePage: (page: number) => void;
    changeRowsPerPage: (rowsPerPage: number) => void;
}
export interface TableProps extends MUIDataTableProps, React.RefAttributes<MuiDataTableRefComponent> {
    columns: TableColumn[];
    loading?: boolean;
}

const Table = React.forwardRef<MuiDataTableRefComponent, TableProps>( (props, ref) => {
    
    const theme = cloneDeep<Theme>(useTheme());

    function extractMuiDataTableColumns(columns: TableColumn[]): MUIDataTableColumn[] {
        setColumnsWith(columns);
        return columns.map(column => omit(column, 'width') )
    }
    
    function setColumnsWith(columns: TableColumn[]){
        columns.forEach((column , key) => {
            if(column.width){
                const overrides = theme.overrides as any;
                overrides.MUIDataTableHeadCell.fixedHeader[`&:nth-child(${key + 2})`] = {
                    width: column.width
                }
            }
        })
    }

    function applyLoading(){
        const textLabels = (newProps.options as any).textLabels as any;
        textLabels.body.noMatch = newProps.loading === true 
            ? 'Carregando ...' 
            : textLabels.body.noMatch;
    }

    function applyResponsive(){
        newProps.options.responsive = isSmOrDown ? 'standard' : 'vertical';
    }

    function getOriginalMuiDataTableProps(){
       return { 
           ...omit(newProps, 'loading'),
           ref
        }
    }

    const isSmOrDown = useMediaQuery(theme.breakpoints.down('sm'));

    const  newProps = merge(
        {options: cloneDeep(defaultOptions)}, 
        props,
        {columns: extractMuiDataTableColumns(props.columns)}
    );

    applyLoading();
    applyResponsive();

    const originalProps = getOriginalMuiDataTableProps();

    return (
        <MuiThemeProvider theme={theme}>
            <MUIDataTable {...originalProps} />
        </MuiThemeProvider>
    );
});

export function makeActionStyles(column){

    return theme => {
        const copyTheme = cloneDeep(theme);
        const selector = `&[data-testid^="MUIDataTableBodyCell-${column.length-1}"]`;
        (copyTheme.overrides as any).MUIDataTableBodyCell.root[selector] = {
            paddingTop: '0px',
            paddingBottom: '0px'
        };
        return copyTheme;
    }
}

export default Table;

