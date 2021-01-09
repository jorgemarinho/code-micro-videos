import { createMuiTheme } from "@material-ui/core";
import { green, red } from "@material-ui/core/colors";
import { PaletteOptions, SimplePaletteColorOptions } from "@material-ui/core/styles/createPalette";

const palette: PaletteOptions = {
    primary: {
        main: '#79aec8',
        contrastText: '#fff'
    },
    secondary: {
        main: '#4db5ab',
        contrastText: '#fff',
        dark: "#055a52"
    },
    background: {
        default: '#fafafa'
    },
    success: {
        main: green['500'],
        contrastText: '#fff'
    },
    error: {
        main: red['500'],
        contrastText: '#fff'
    }
};

const theme = createMuiTheme({
    palette,
    overrides: {
        MUIDataTable: {
            paper: {
                boxShadow: "none",
            }
        },
        MUIDataTableToolbar: {
            root: {
                minHeight: '58px',
                background: palette!.background!.default
            }, 
            icon : {
                color: (palette!.primary as SimplePaletteColorOptions).main,
                '&:hover, &:active, &.focus': {
                    color: (palette!.secondary as SimplePaletteColorOptions).dark
                }   
            },
            iconActive: {
                color: (palette!.secondary as SimplePaletteColorOptions).dark,
                '&:hover, &:active, &.focus': {
                    color: (palette!.secondary as SimplePaletteColorOptions).dark
                }
            }
        },
        MUIDataTableHeadCell: {
            fixedHeader: {
                paddingTop: 8,
                paddingBottom: 8,
                backgroundColor: (palette!.primary as SimplePaletteColorOptions).main,
                color: '#ffffff',
                '&[aria-sort]' : {
                    backgroundColor: '#459ac4'
                }
            },
            sortActive: {
                color: '#fff'
            },
            sortAction: {
                alignItens: 'center'
            },
            sortLabelRoot: {
                '& svg': {
                    color: '#ffffff !important'
                }
            }
        },
       MUIDataTableSelectCell: {
            headerCell: {
                backgroundColor: (palette!.primary as SimplePaletteColorOptions).main,
                '& span' : {
                    color: '#ffffff !important'
                }
            }
        },
        MUIDataTableBodyCell: {
            root: {
                color: (palette!.secondary as SimplePaletteColorOptions).main,
                '&:houver, &:active, &.focus' : {
                    color: (palette!.secondary as SimplePaletteColorOptions).main
                }
            }
        },
        MUIDataTableToolbarSelect: {
            title: {
                color: (palette!.primary as SimplePaletteColorOptions).main,
            },
            iconButton: {
                color: (palette!.primary as SimplePaletteColorOptions).main,
            }
        },
        MUIDataTableBodyRow: {
            root: {
                '&:nth-child(odd)': {
                    background: palette!.background!.default
                }

            }
        },
        MuiTablePagination: {
            root: {
                color: (palette!.primary as SimplePaletteColorOptions).main,
            }
        }
    }
});

export default theme;