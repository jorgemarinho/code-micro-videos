import { MUIDataTableColumn } from 'mui-datatables';
import { Dispatch, Reducer, useReducer, useState, useEffect, useMemo, useCallback } from 'react';
import reducer, { Creators } from '../store/filter';
import { Actions as FilterActions, State as FilterState } from '../store/filter/types';
import { useDebounce } from 'use-debounce';
import { useHistory, useLocation } from 'react-router-dom';
import { History } from 'history';
import { isEqual } from 'lodash';
import * as yup from '../util/vendor/yup';
import { MuiDataTableRefComponent } from '../components/Table';

interface FilterManagerOptions {
    schema:  any; //ObjectSchema;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    history: History;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>
    extraFilter?: ExtractFilter
}

interface ExtractFilter {
    getStateFromURL: (queryParams: URLSearchParams) => any,
    formatSearchParams: (debouncedState: FilterState) => any,
    createValidationSchema: () => any
}

interface UseFilterOptions {
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>
    extraFilter?: ExtractFilter
 }

export default function useFilter(options: UseFilterOptions) {

    const history = useHistory();
    const location = useLocation();
    const {search: locationSearch, pathname: locationPathname, state: locationState} = location;
    const {rowsPerPage, rowsPerPageOptions, extraFilter, columns} = options;

    const schema = useMemo(() => {

        return yup.object().shape({
            search: yup.string()
                .transform(value => !value ? undefined : value)
                .default(''),
            pagination: yup.object().shape({
                page: yup.number()
                    .transform(value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                    .default(1),
                per_page: yup.number()
                    .transform( value => 
                        isNaN(value) || !rowsPerPageOptions.includes( parseInt(value) ) ? undefined : value
                    )
                    .default(rowsPerPage),
            }),
            order: yup.object().shape({
                sort: yup.string()
                    .nullable()
                    .transform(value => {
                        const columnsName = columns
                            .filter(column => !column.options || column.options.sort !== false)
                            .map(column => column.name);
                        return columnsName.includes(value) ? value : undefined;
                    })
                    .default(null),
                dir: yup.string()
                    .nullable()
                    .transform(value => !value || !['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value)
                    .default(null),
            }),
            ...(
                extraFilter && {
                    extraFilter: extraFilter.createValidationSchema()
                }
            )
        });
    }, [rowsPerPageOptions, rowsPerPage, columns, extraFilter]);
    
    // react-route history mutable | location immutable
    const stateFromURL = useMemo(() => {
        const queryParams = new URLSearchParams(locationSearch.substr(1));
        return schema.cast({
            search: queryParams.get('search'),
            pagination: {
                page: queryParams.get('page'),
                per_page: queryParams.get('per_page'),
            },
            order: {
                sort: queryParams.get('sort'),
                dir: queryParams.get('dir'),
            },
            ...(
                extraFilter && {
                    extraFilter: extraFilter.getStateFromURL(queryParams)
                }
            )
        });
    },[schema, locationSearch, extraFilter]);

    const cleanSearchText = useCallback( (text) => {

        let newText = text;
        if (text && text.value !== undefined) {
            newText = text.value;
        }

        return newText;
    },[]);

    const formatSearchParams = useCallback( (state, extraFilter) => {
        const search = cleanSearchText(state.search);
        return {
            ...(search && search !== '' && { search: search }),
            ...(state.pagination.page !== 1 && { page: state.pagination.page }),
            ...(state.pagination.per_page !== 15 && { per_page: state.pagination.per_page }),
            ...(
                state.order.sort && {
                    sort: state.order.sort,
                    dir: state.order.dir
                }
            ),
            ...(
                extraFilter && extraFilter.formatSearchParams(state)
            )
        }
    }, [cleanSearchText]);

    const filterManager = new FilterManager({ ...options, history, schema });
    const INITIAL_STATE = stateFromURL;
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE);
    const [debounceFilterState] = useDebounce(filterState, options.debounceTime);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    useEffect(() => {
        history.replace({
            pathname: locationPathname,
            search: "?" + new URLSearchParams(formatSearchParams(stateFromURL, extraFilter)),
            state: stateFromURL
        });
    }, [history,locationPathname, stateFromURL, extraFilter, formatSearchParams]);

    useEffect(() => {
        const newLocation = {
            pathname: locationPathname,
            search: "?" + new URLSearchParams(formatSearchParams(debounceFilterState, extraFilter)),
            state: {
                ...debounceFilterState,
                search: cleanSearchText(debounceFilterState.search)
            }
        }

        const oldState = locationState;
        const nextState = debounceFilterState
        if (isEqual(oldState, nextState)) {
            return;
        }

        history.push(newLocation);

    },[ history,
        locationPathname, 
        locationState, 
        formatSearchParams, 
        debounceFilterState,
        extraFilter, 
        cleanSearchText  
    ]);

    filterManager.state = filterState;
    filterManager.debouncedState = debounceFilterState;
    filterManager.dispatch = dispatch;

    filterManager.applyOrderInColumns();

    return {
        columns: filterManager.columns,
        cleanSearchText,
        filterManager,
        filterState,
        debounceFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {

    schema;
    state: FilterState = null as any;
    debouncedState: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    columns: MUIDataTableColumn[];
    rowsPerPag: number;
    rowsPerPageOptions: number[];
    history: History;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
    extraFilter?: ExtractFilter;

    constructor(options: FilterManagerOptions) {
        const { 
            schema, columns, rowsPerPage, rowsPerPageOptions, history, tableRef, extraFilter 
        } = options;
        this.schema = schema;
        this.columns = columns;
        this.rowsPerPag = rowsPerPage;
        this.rowsPerPageOptions = rowsPerPageOptions;
        this.history = history;
        this.tableRef = tableRef;
        this.extraFilter = extraFilter;
    }

    private resetTablePagination() {
        this.tableRef.current.changeRowsPerPage(this.rowsPerPag);
        this.tableRef.current.changePage(0);
    }

    changeSearch(value) {
        this.dispatch(Creators.setSearch({ search: value as any }));
    }

    changePage(page) {
        this.dispatch(Creators.setPage({ page: page + 1 }));
    }

    changeRowsPerPage(perPage) {
        this.dispatch(Creators.setPerPage({ per_page: perPage }));
    }

    changeColumnSort(changedColumn: string, direction: string) {
        this.dispatch(Creators.setOrder({
            sort: changedColumn,
            dir: direction.includes('desc') ? 'desc' : 'asc'
        }));
        this.resetTablePagination();
    }

    changeExtraFilter(data) {
        this.dispatch(Creators.updateExtraFilter(data));
    }

    resetFilter() {

        const INITIAL_STATE = {
            ...this.schema.cast({}),
            search: {value: null, update: true}
        };
        this.dispatch(Creators.setReset({
            state: INITIAL_STATE
        }));
        this.resetTablePagination();
    }

    applyOrderInColumns() {
        this.columns = this.columns.map(column => {
            return column.name === this.state.order.sort
                ? {
                    ...column,
                    options: {
                        ...column.options,
                        sortDirection: this.state.order.dir as any
                    }
                }
                : column;
        });
    }

}