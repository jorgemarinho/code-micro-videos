// @flow 
import * as React from 'react';
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
import {Creators} from '../../store/filter';
import useFilter from '../../hooks/useFilter';

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
                names: ['Sim', 'Não']
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

    const snackbar = useSnackbar();
    const subscribed = React.useRef(true);
    const [data, setData] = React.useState<Category[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const tableRef = React.useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const {       
        columns,
        filterManager, 
        filterState,
        debounceFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef
    });

    React.useEffect(() => {
        subscribed.current = true;
        filterManager.pushHistory();
        getData();
        return () => {
            subscribed.current = false;
        }

    }, [
        filterManager.cleanSearchText(debounceFilterState.search),
        debounceFilterState.pagination.page,
        debounceFilterState.pagination.per_page,
        debounceFilterState.order,
    ]);


    async function getData() {

        setLoading(true);
        try {
            const { data } = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir,
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch (error) {

            console.error(error);

            if(categoryHttp.isCancelledRequest(error)){
                return;
            }

            snackbar.enqueueSnackbar(
                'Não foi possível carregar as informações',
                { variant: 'error' }
            )

        } finally {
            setLoading(false);
        }
    }

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