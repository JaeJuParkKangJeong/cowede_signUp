import * as React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // npm install react-router-dom로 설치한 것을 사용하겠다고 선언 
import App from './App';

ReactDom.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.querySelector('#root')
);