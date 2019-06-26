import * as React from 'react';

export const initialValue: IMainState = {
    connected: false,
};

export const mainReducer: React.Reducer<IMainState, IMainAction> = (state, action) => {
    switch (action.type) {
        case 'data':
            return {
                ...state,
                data: action.value,
            };
        case 'candles':
            return {
                ...state,
                candles: action.value,
            };
        default:
            return state;
    }
};

interface IMainState {
    connected: boolean;
    data?: any;
}

interface IMainAction {
    type: string;
    value: any;
}
