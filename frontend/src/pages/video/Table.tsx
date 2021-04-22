// @flow 
import * as React from 'react';
import {useRef, useState, useContext, useCallback } from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import {  ListResponse, Video } from '../../util/models';
import DefaultTable, { TableColumn, makeActionStyles, MuiDataTableRefComponent } from '../../components/Table';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import { useSnackbar } from 'notistack';
import useFilter from '../../hooks/useFilter';
import DeleteDialog from '../../components/DeleteDialog';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import videoHttp from '../../util/http/video-http';
import useDeleteCollection from '../../hooks/useDeleteCollection';
import LoadingContext from '../../components/loading/LoadingContext';

const columnsDefinition: TableColumn[] = [

    {
        name: 'id',
        label: 'ID',
        width: '27%',
        options: {
            filter: false,
            sort: false
        }
    },
    {
        name: 'title',
        label: 'Título',
        width: '20%',
        options: {
            filter: false
        }
    },   
    {
        name: 'genres',
        label: 'Gêneros',
        width: '13%',
        options: {
            sort: false,
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return value.map((value: any) => value.name).join(', ');
            }
        }
    },
    {
        name: 'categories',
        label: 'Categorias',
        width: '12%',
        options: {
            sort: false,
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return value.map((value: any) => value.name).join(', ');
            }
        }
    },
    {
        name: 'created_at',
        label: 'Criado em',
        width: '10%',
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
            }
        }
    },
    {
        name: 'actions',
        label: 'Ações',
        width: '13%',
        options: {
            filter: false,
            sort: false,
            customBodyRender: (value, tableMeta) => {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={'/videos/' + tableMeta.rowData[0] + '/edit'}
                    >
                        <EditIcon fontSize={'inherit'} />
                    </IconButton>
                )
            }
        }
    }
];

const debounceTime = 300;
//const debouncedSeachTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

const Table = () => {

    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Video[]>([]);
    const loading = useContext(LoadingContext);
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const {
        columns,
        filterManager,
        cleanSearchText,
        filterState,
        debounceFilterState,
        totalRecords,
        setTotalRecords
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef
    });

    const searchText = cleanSearchText(debounceFilterState.search);

    const getData = useCallback( async ({search,page, per_page, sort, dir }) => {

        try {
            
            const { data } = await videoHttp.list<ListResponse<Video>>({
                queryParams: {
                    search: searchText,
                    page,
                    per_page,
                    sort,
                    dir
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);

                if(openDeleteDialog){ 
                    setOpenDeleteDialog(false);
                }

            }
        } catch (error) {

            if(videoHttp.isCancelledRequest(error)){
                return;
            }

            enqueueSnackbar(
                'Não foi possível carregar as informações',
                { variant: 'error' }
            )
        }
    },[
        enqueueSnackbar, 
        openDeleteDialog, 
        setTotalRecords, 
        searchText, 
        setOpenDeleteDialog
    ]);

    React.useEffect(() => {
     
        subscribed.current = true;
        getData({
            search: searchText,
            page: debounceFilterState.pagination.page,
            per_page: debounceFilterState.pagination.per_page,
            sort: debounceFilterState.order.sort,
            dir: debounceFilterState.order.dir
        });
        return () => {
            subscribed.current = false;
        }

    }, [
        getData,
        searchText,
        debounceFilterState.pagination.page,
        debounceFilterState.pagination.per_page,
        debounceFilterState.order
    ]);

    function deleteRows(confirmed: boolean) {

        if(!confirmed){
            setOpenDeleteDialog(false);
            return;
        }

        const ids = rowsToDelete
            .data
            .map((value) => data[value.index].id)
            .join(',');
        videoHttp
            .deleteCollection({ids})
            .then(response => {

                enqueueSnackbar(
                    'Registros excluídos com sucesso!', {
                    variant: 'success'
                });

                if(
                    rowsToDelete.data.length === filterState.pagination.per_page
                    && filterState.pagination.page > 1
                ) {
                    const page = filterState.pagination.page -2; 
                    filterManager.changePage(page);
                } else {
                    getData({
                        search: searchText,
                        page: debounceFilterState.pagination.page,
                        per_page: debounceFilterState.pagination.per_page,
                        sort: debounceFilterState.order.sort,
                        dir: debounceFilterState.order.dir
                    });
                }

            })
            .catch((error) => {
                enqueueSnackbar(
                    'Não foi possível excluir os registros',
                    {variant: 'error'}
                )
            })    
    }

    return (

        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)} >
            <DeleteDialog open={openDeleteDialog} handleClose={deleteRows}/>
            <DefaultTable
                title=""
                columns={columns}
                data={data}
                loading={loading}
                ref={tableRef}
                options={{
                    //serverSideFilterList,
                    serverSide: true,
                    responsive: 'standard',
                    searchText: filterState.search as string,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => filterManager.resetFilter()}
                        />
                    ),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: string) =>
                        filterManager.changeColumnSort(changedColumn, direction),
                    onRowsDelete: (rowsDeleted) => {
                        setRowsToDelete(rowsDeleted as any);
                        return false;
                    },    
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;