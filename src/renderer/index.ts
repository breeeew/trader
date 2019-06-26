import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {Root} from './Root';

const el = document.createElement('div');
document.body.append(el);
ReactDOM.render(React.createElement('div', null, React.createElement(Root)), el);
