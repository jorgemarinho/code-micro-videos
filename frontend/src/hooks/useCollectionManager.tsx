import { useSnackbar } from "notistack";

const useCollectionManager = (collection: any[], setCollection: (value) => void) => {
    const snackbar = useSnackbar();
    return {
        addItem(itemParam) {
            if (!itemParam || itemParam === "") {
                return;
            }
            const exists = collection.find(item => item.id === itemParam.id);

            if (exists) {
                snackbar.enqueueSnackbar(
                    'Item já adicionado', { variant: 'info' }
                )
                return;
            }
            collection.unshift(itemParam);
            setCollection(collection);
        },
        removeItem(itemParam) {

            const index = collection.findIndex(item => item.id === itemParam.id);

            if (index === -1) {
                return;
            }

            collection.splice(index, 1);
            setCollection(collection);
        }
    }
};

export default useCollectionManager;