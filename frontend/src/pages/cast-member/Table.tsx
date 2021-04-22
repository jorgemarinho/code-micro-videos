// @flow 

import * as React from 'react';
import {useMemo,useRef, useState, useCallback, useEffect } from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { CastMember, CastMemberTypeMap, ListResponse } from '../../util/models';
import castMemberHttp from '../../util/http/cast-member-http';
import DefaultTable, { TableColumn, makeActionStyles, MuiDataTableRefComponent } from '../../components/Table';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import { Link } from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import { useSnackbar } from 'notistack';
import useFilter from '../../hooks/useFilter';
import * as yup from '../../util/vendor/yup';
import { invert } from 'lodash';
import { FilterResetButton } from '../../components/Table/FilterResetButton';

const castMemberNames = Object.values(CastMemberTypeMap);

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
        name: 'name',
        label: 'Nome',
        width: '46%',
        options: {
            filter: false
        }
    },
    {
        name: 'type',
        label: 'Tipo',
        options: {
            filterOptions: {
                names: castMemberNames
            },
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypeMap[value];
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
                        to={'/cast-members/' + tableMeta.rowData[0] + '/edit'}
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
    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const extraFilter = useMemo( () => ({

        createValidationSchema: () => {
            return yup.object().shape({
                type: yup.string()
                    .nullable()
                    .transform(value => {
                        return !value || !castMemberNames.includes(value) ? undefined : value;
                    })
                    .default(null)
            })
        },
        formatSearchParams: (debouncedState) => {
            return debouncedState.extraFilter
                ? {
                    ...(
                        debouncedState.extraFilter.type &&
                        { type: debouncedState.extraFilter.type }
                    )
                }
                : undefined
        },
        getStateFromURL: (queryParams) => {
            return {
                type: queryParams.get('type')
            }
        }
    }), []);

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
    const indexColumnType = columns.findIndex(c => c.name === 'type');
    const columnType = columns[indexColumnType];
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type as never;
    (columnType.options as any).filterList = typeFilterValue ? [typeFilterValue] : [];

    const serverSideFilterList = columns.map(column => []);

    if (typeFilterValue) {
        serverSideFilterList[indexColumnType] = [typeFilterValue];
    }

    const getData =  useCallback( async ({search,page, per_page, sort, dir, type }) => {

        setLoading(true);
        try {
            const { data } = await castMemberHttp.list<ListResponse<CastMember>>({
                queryParams: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    ...(type && { 
                        type: invert(CastMemberTypeMap)[
                            type
                        ], 
                    }),
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch (error) {

            if (castMemberHttp.isCancelledRequest(error)) {
                return;
            }

            enqueueSnackbar(
                'Não foi possível carregar as informações',
                { variant: 'error' }
            )

        } finally {
            setLoading(false);
        }
    },[enqueueSnackbar, setTotalRecords]);

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
                debounceFilterState.extraFilter.type &&
                { type: debounceFilterState.extraFilter.type }
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