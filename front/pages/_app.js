import React from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import withRedux from 'next-redux-wrapper';
import AppLayout from '../components/AppLayout';
import withReduxSaga from 'next-redux-saga';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import reducer from '../reducers';
import rootSaga from '../saga';
import { LOAD_USER_REQUEST } from '../reducers/user';
import axios from 'axios';
import App, { Container } from 'next/app';

// class NodeBird extends App {
//     static getInitialProps(context) {

//     }
//     render() {

//     }
// }


//{Component} 는 next에서 넣어주는 인자! index.js나 profile.js 등이 옴
const NodeBird = ({ Component, store, pageProps }) => {
    return (
        <Container>
            <Provider store={store}>
                <Helmet
                    title="NodeBird"
                    htmlAttributes={{ lang: 'ko' }}
                    meta={[{
                        charset: 'UTF-8',
                    }, {
                        name: 'viewport',
                        content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=yes,viewport-fit=cover',
                    }, {
                        'http-equiv': 'X-UA-Compatible', content: 'IE=edge',
                    }, {
                        name: 'description', content: '알파카의 NodeBird SNS',
                    }, {
                        name: 'og:title', content: 'NodeBird',
                    }, {
                        name: 'og:description', content: '알파카의 NodeBird SNS',
                    }, {
                        property: 'og:type', content: 'website',
                    }, {
                        property: 'og:image', content: 'http://localhost:3000/favicon.ico',
                    }]}
                    link={[{
                        rel: 'shortcut icon', href: '/favicon.ico',
                    }, {
                        rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/antd/3.16.2/antd.css',
                    }, {
                        rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css',
                    }, {
                        rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css',
                    }]}
                />
                <AppLayout>
                    <Component {...pageProps}/>
                </AppLayout>
            </Provider>
        </Container>
    );
};

NodeBird.propTypes = {
    Component : PropTypes.elementType.isRequired,
    store : PropTypes.object.isRequired,
    pageProps : PropTypes.object.isRequired,
};

//getInitialProps 사용하기
NodeBird.getInitialProps = async (context) => { 
    const { ctx, Component } = context;
    let pageProps = {};

    //유저 정보 SSR
    //내 정보 먼저 가져오기 
    const state = ctx.store.getState(); //context에서 state 가져오기
    //쿠키 가져오기(서버사이드 렌더링에서는 직접 쿠키를 넣어줘야함!)
    
    //getInitialProps가 서버에서 실행되는지 클라이언트에서 실행되는지를 분기 처리하기!
    const cookie = ctx.isServer ? ctx.req.headers.cookie : ''; //ctx.req, res는 서버쪽에서만 있음!
    //console.log('cookie', cookie);
    if(ctx.isServer && cookie) { //서버쪽에서 실행되고 cookie가 존재할 때만 적용하기
        axios.defaults.headers.Cookie = cookie; //모든 axios에 적용
    }

    if(!state.user.me) { //state에 내 정보가 없으면 불러오기
        ctx.store.dispatch({
            type: LOAD_USER_REQUEST, //쿠키로 정보 불러오기
        });
    }

    //컴포넌트에 getInitialProps 가져오기
    if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx) || {}; //pageProps에 기본값 넣어주기
        // next에서 전달해주는 ctx가 렌더링 되는 페이지(Component)의 getInitialProps로 전달됨 
    }    
    return { pageProps }; //return 해주면 component의 props가 됨
};


//아래 부분은 바뀔 일이 거의 없음
//redux_dev_tools는 보통 배포할 때 뺌

const configureStore = (initialState, options) => {
    const sagaMiddleware = createSagaMiddleware();
    const middlewares = [sagaMiddleware, (store) => (next) => (action) => { 
        //로깅해주는 커스텀 미들웨어
        //console.log(action); 
        next(action);
    }];
    const enhancer = process.env.NODE_ENV === 'production'
      ? compose(applyMiddleware(...middlewares))
      : compose(
        applyMiddleware(...middlewares),
        !options.isServer && typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
      );
    const store = createStore(reducer, initialState, enhancer);
    store.sagaTask = sagaMiddleware.run(rootSaga);
    return store;
};
  

export default withRedux(configureStore)(withReduxSaga(NodeBird)); //컴포넌트를 감싸주면 고차 컴포넌트