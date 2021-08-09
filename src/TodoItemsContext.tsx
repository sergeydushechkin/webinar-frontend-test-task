import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useReducer,
} from 'react';

import produce from "immer";

export interface TodoItem {
    id: string;
    title: string;
    details?: string;
    done: boolean;
    dateTime: string;
}

interface TodoItemsState {
    todoItems: TodoItem[];
}

interface TodoItemsAction {
    type: 'loadState' | 'add' | 'delete' | 'toggleDone';
    data: any;
}

const TodoItemsContext = createContext<
    (TodoItemsState & { dispatch: (action: TodoItemsAction) => void }) | null
>(null);

const defaultState = { todoItems: [] };
const localStorageKey = 'todoListState';

export const TodoItemsContextProvider = ({
    children,
}: {
    children?: ReactNode;
}) => {
    const [state, dispatch] = useReducer(todoItemsReducer, defaultState);

    useEffect(() => {
        const savedState = localStorage.getItem(localStorageKey);

        if (savedState) {
            try {
                dispatch({ type: 'loadState', data: JSON.parse(savedState) });
            } catch {}
        }
    }, []);


    useEffect(() => {
        const getStorageUpdate = () => {
            const storageState = window.localStorage.getItem(localStorageKey);
            if (storageState) {
                dispatch({ type: 'loadState', data: JSON.parse(storageState) });
            }
        }

        window.addEventListener('storage', getStorageUpdate);

        return () => {
            window.removeEventListener('storage', getStorageUpdate);
        }
    }, [])

    useEffect(() => {
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(state))
        } catch (e) {
            alert(e.message);
        };
    }, [state]);

    return (
        <TodoItemsContext.Provider value={{ ...state, dispatch }}>
            {children}
        </TodoItemsContext.Provider>
    );
};

export const useTodoItems = () => {
    const todoItemsContext = useContext(TodoItemsContext);

    if (!todoItemsContext) {
        throw new Error(
            'useTodoItems hook should only be used inside TodoItemsContextProvider',
        );
    }

    return todoItemsContext;
};

function todoItemsReducer(state: TodoItemsState, action: TodoItemsAction) {
    switch (action.type) {
        case 'loadState': {
            return action.data;
        }
        case 'add':
            return produce(state, (draft) => {
                draft.todoItems.push({id: generateId(), done: false, ...action.data.todoItem})
            });
        case 'delete':
            return produce(state, (draft) => {
                draft.todoItems = draft.todoItems.filter(
                    ({ id }) => id !== action.data.id,
                )
            });
        case 'toggleDone':
            const itemIndex = state.todoItems.findIndex(
                ({ id }) => id === action.data.id,
            );
            const item = state.todoItems[itemIndex];

            return produce(state, (draft) => {
                draft.todoItems[itemIndex].done = !item.done;
            });
        default:
            throw new Error();
    }
}

function generateId() {
    return `${Date.now().toString(36)}-${Math.floor(
        Math.random() * 1e16,
    ).toString(36)}`;
}
