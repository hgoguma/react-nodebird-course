// next -> html 역할을 함
// helmet을 SSR할 때 수정할 때 필요

import React from 'react';
import Document, { Main, NextScript } from 'next/document';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { ServerStyleSheet } from 'styled-components';


class MyDocument extends Document { //next에서 제공하는 document extends

    static getInitialProps(context) { //static 자원으로 들어감
        //_document.js가 상위 -> _app.js를 렌더링 하게 해야 함!
        const sheet = new ServerStyleSheet(); //style SSR!
        const page = context.renderPage((App) => (props) => sheet.collectStyles(<App {...props} />));
        const styleTags = sheet.getStyleElement();
        return { ...page, helmet : Helmet.renderStatic(), styleTags };//SSR!

    }

    render() {
        // this.props : getInitialProps에서 리턴해주는 것
        const { htmlAttributes, bodyAttributes, ...helmet } = this.props.helmet; 
        //...helmet : meta태그, link 태그, style태그 등
        const htmlAttrs = htmlAttributes.toComponent(); //리액트에서 쓸 수 있는 컴포넌트로 바꾸기
        const bodyAttrs = bodyAttributes.toComponent();

        return(
            <html {...htmlAttrs}>
                <head>
                    {this.props.styleTags} 
                    {/* Styled Component SSR! */}
                    {Object.values(helmet).map(el => el.toComponent())} 
                    {/* 반복문 돌려서 리액트 컴포넌트로 만들어줌 */}
                </head>
                <body {...bodyAttrs}>
                    <Main /> 
                    {/* Main : _app.js 역할! */}
                    <NextScript />
                    {/* NextScript : next서버 구동에 필요한 것 */}
                </body>
            </html>
        )
    }
}

MyDocument.propTypes = {
    helmet : PropTypes.object.isRequired,
    styleTags : PropTypes.object.isRequired,
}

export default MyDocument;