import * as React from 'react';
import {ipcRenderer} from 'electron';
import {initialValue, mainReducer} from './State';
import {useCallback, useReducer} from 'react';

export function Root() {
    const [state] = useReducer(mainReducer, initialValue);

    const onConnectClick = useCallback(() => {
        if (state.connected) {
            return;
        }

        ipcRenderer.send('connectToWs');
        ipcRenderer.on('wsData', (_: Event, __: string) => {
            // dispatch({type: 'data', value: JSON.parse(data)});
        });

        ipcRenderer.on('wsDataCandlesHistory', (_: Event, __: string) => {
            // dispatch({type: 'candles', value: JSON.parse(data).payload.candles});
        });
    }, []);

    return (
        <div style={{width: 300, height: 300, backgroundColor: '#FFF'}}>
            <button onClick={onConnectClick}>
                connect
            </button>
            {
                state.data
                    ? JSON.stringify(state.data)
                    : null

            }
        </div>
    );
}
