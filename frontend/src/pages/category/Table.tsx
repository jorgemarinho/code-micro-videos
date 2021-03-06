// @flow 
import * as React from 'react';
import {useMemo,useRef, useState, useContext, useEffect, useCallback } from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from '../../util/http/category-http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from '../../util/models';
import DefaultTable, { TableColumn, makeActionStyles, MuiDataTableRefComponent } from '../../components/Table';
import { useSnackbar } from 'notistack';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import useFilter from '../../hooks/useFilter';
import * as yup from '../../util/vendor/yup';
import LoadingContext from '../../components/loading/LoadingContext';

const categoryActive = Object.values( { 1:'Sim', 0: 'Não' });

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '27%',
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: 'name',
        label: 'Nome',
        width: '46%',
        options: {
            filter: false
        }
    },
    {
        name: 'is_active',
        label: 'Ativo?',
        width: '4%',
        options: {
            filterList: [],
            filterOptions: {
                names: categoryActive
            },
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />;
            }
        },
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
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta) => {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={'/categories/' + tableMeta.rowData[0] + '/edit'}
                    >
                        <EditIcon fontSize={'inherit'} />
                    </IconButton>
                )
            }
        }
    }
];

const debounceTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50]; 

const Table = () => {

    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const extraFilter = useMemo( () => ({
        createValidationSchema: () => {
            return yup.object().shape({
                is_active: yup.mixed()
                    .nullable()
                    .transform(value => {
                       
                       //return !value || value === 'Sim' ? 1 : 0;
                       return !value || !categoryActive.includes(value) ? undefined : value;

                    })
                    .default(null)
            })
        },
        formatSearchParams: (debouncedState) => {
            return debouncedState.extraFilter
                ? {
                    ...(
                        debouncedState.extraFilter.is_active &&
                        { is_active: debouncedState.extraFilter.is_active }
                    )
                }
                : undefined
        },
        getStateFromURL: (queryParams) => {
            return {
                is_active: queryParams.get('is_active')
            }
        }
    }),[]);

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
        tableRef,
        extraFilter: extraFilter
    });

    const searchText = cleanSearchText(debounceFilterState.search);
    const indexColumnType = columns.findIndex(c => c.name === 'is_active');
    const columnType = columns[indexColumnType];
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type as never;
    (columnType.options as any).filterList = typeFilterValue ? [typeFilterValue] : [];

    const serverSideFilterList = columns.map(column => []);

    if (typeFilterValue) {
        serverSideFilterList[indexColumnType] = [typeFilterValue];
    }

    const getData = useCallback( async ({search,page, per_page, sort, dir, is_active }) => {

        try {
            const { data } = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: search,
                    page: page,
                    per_page: per_page,
                    sort: sort,
                    dir: dir,
                    ...(
                        is_active &&
                        { is_active: is_active === 'Sim' ? 1 : 0}
                    )
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch (error) {

            if(categoryHttp.isCancelledRequest(error)){
                return;
            }
            enqueueSnackbar(
                'Não foi possível carregar as informações',
                { variant: 'error' }
            )
        }
    },[enqueueSnackbar,setTotalRecords]);

    useEffect(() => {
        subscribed.current = true;
        getData({
            search: searchText,
            page: debounceFilterState.pagination.page,
            per_page: debounceFilterState.pagination.per_page,
            sort: debounceFilterState.order.sort,
            dir: debounceFilterState.order.dir,
            ...(
                debounceFilterState.extraFilter &&
                debounceFilterState.extraFilter.is_active &&
                { is_active: debounceFilterState.extraFilter.is_active }
            )
        });
        return () => {
            subscribed.current = false;
        }

    }, [
        getData,
        searchText,
        debounceFilterState.pagination.page,
        debounceFilterState.pagination.per_page,
        debounceFilterState.order,
        debounceFilterState.extraFilter
    ]);

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)} >
            <DefaultTable
                title="Listagem de Categorias"
                columns={columns}
                data={data}
                loading={loading}
                ref={tableRef}
                options={{
                    serverSide: true,
                    responsive: "standard",
                    searchText: filterState.search as string,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: (column, filterList) => {
                        const columnIndex = columns.findIndex( c => c.name === column)

                        filterManager.changeExtraFilter({
                            [column as any]: filterList[columnIndex].length ? filterList[columnIndex][0] : null
                        })
                    },
                    customToolbar: () => (
                        <FilterResetButton 
                            handleClick={ () => filterManager.resetFilter()} 
                        />
                    ),
                    onSearchChange: (value) =>  filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: string) =>
                        filterManager.changeColumnSort(changedColumn,direction)
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;