import { all, fork, call, put, takeEvery, delay } from 'redux-saga/effects';
import { LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE, SIGN_UP_REQUEST, SIGN_UP_SUCCESS, SIGN_UP_FAILURE, LOG_OUT_REQUEST,
LOG_OUT_SUCCESS, LOG_OUT_FAILURE, LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_FAILURE, 
FOLLOW_USER_REQUEST, FOLLOW_USER_SUCCESS, FOLLOW_USER_FAILURE, UNFOLLOW_USER_REQUEST, UNFOLLOW_USER_SUCCESS, UNFOLLOW_USER_FAILURE, 
LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWERS_SUCCESS, LOAD_FOLLOWERS_FAILURE, LOAD_FOLLOWINGS_REQUEST, LOAD_FOLLOWINGS_SUCCESS, LOAD_FOLLOWINGS_FAILURE, REMOVE_FOLLOWER_REQUEST, REMOVE_FOLLOWER_SUCCESS, EDIT_NICKNAME_REQUEST, EDIT_NICKNAME_FAILURE, EDIT_NICKNAME_SUCCESS

} from '../reducers/user';
import axios from 'axios';


//call은 함수 동기적 호출 
//fork는 함수 비동기적 호출 
//put은 액션 dispatch

function logInAPI (loginData) {
    //서버에 요청을 보내는 부분
    return axios.post('/user/login', loginData, {
        withCredentials : true, //쿠키 주고 받게 설정
    });
}

function* logIn(action) {
    try {
        const result = yield call(logInAPI, action.data);
        yield put({ // put은 dispatch 동일
          type: LOG_IN_SUCCESS,
          data: result.data,
        });
    } catch (e) { // loginAPI 실패
        console.error(e);
        yield put({
            type: LOG_IN_FAILURE,
        });
    }
}
//takeLatest : 액션을 여러번 동시에 처리하는 경우 마지막거 하나 액션만 유효하게 인정함
//takeEvery : while(true) 와 99% 유사

function* watchLogin () {
    yield takeEvery(LOG_IN_REQUEST, logIn);
}


function signUpAPI(signUpData) {
    //서버에 요청보내기
    return axios.post('/user/', signUpData);
}

function* signUp(action) {
    try {
        yield call(signUpAPI, action.data); // 동기 -> 응답이 다 받아질 때까지 기다림
        yield delay(2000);
        yield put({
            type : SIGN_UP_SUCCESS
        });
    } catch (e) { //loginAPI 실패
        console.error(e); 
        yield put({ //put은 saga의 dispatch
            type : SIGN_UP_FAILURE,
            error : e
        })
    }
}

function* watchSignUp() {
    yield takeEvery(SIGN_UP_REQUEST, signUp);
}

//로그아웃
function logOutAPI() {
    //서버에 요청보내기
    return axios.post('/user/logout', {} , { //2번째 인자는 데이터인데 데이터가 없어도 빈 객체 넣기
        withCredentials : true //쿠키 보내기
    });
}

function* logOut(action) {
    try {
        yield call(logOutAPI, action.data); // 동기 -> 응답이 다 받아질 때까지 기다림
        yield delay(2000);
        yield put({
            type : LOG_OUT_SUCCESS
        });
    } catch (e) { //loginAPI 실패
        console.error(e); 
        yield put({ //put은 saga의 dispatch
            type : LOG_OUT_FAILURE,
            error : e
        })
    }
}

function* watchLogOut() {
    yield takeEvery(LOG_OUT_REQUEST, logOut);
}


//유저 정보 불러오기(내 정보 + 남의 정보)
function loadUserAPI(userId) {
    return axios.get(userId ? `/user/${userId}` : '/user/', {
        withCredentials: true,
        //클라이언트에서 요청 보낼 때는 브라우저가 쿠키를 같이 동봉! 
        //서버사이드렌더링일 때는 브라우저가 없음! 쿠키를 직접 넣어줘야 함
    });
}

function* loadUser(action) { 
    try {
        const result = yield call(loadUserAPI, action.data); // 동기 -> 응답이 다 받아질 때까지 기다림
        yield put({
            type : LOAD_USER_SUCCESS,
            data : result.data,
            me : !action.data, //action.data는 userId를 의미함. userId가 없을 때 내 정보를 불러옴
        });
    } catch (e) {
        //console.error(e);
        yield put({ 
            type : LOAD_USER_FAILURE,
            error : e
        });
    }
}

function* watchLoadUser() {
    yield takeEvery(LOAD_USER_REQUEST, loadUser);
}


//팔로우
function followAPI(userId) {
    return axios.post(`/user/${userId}/follow`, {}, {
        withCredentials: true,
    });
}

function* follow(action) { 
    try {
        const result = yield call(followAPI, action.data); // 동기 -> 응답이 다 받아질 때까지 기다림
        yield put({
            type : FOLLOW_USER_SUCCESS,
            data : result.data,
        });
    } catch (e) {
        console.error(e);
        yield put({ 
            type : FOLLOW_USER_FAILURE,
            error : e
        });
    }
}

function* watchFollow() {
    yield takeEvery(FOLLOW_USER_REQUEST, follow);
}

//언팔로우
function unfollowAPI(userId) {
    return axios.delete(`/user/${userId}/follow`, {
        withCredentials: true,
    });
}

function* unfollow(action) { 
    try {
        const result = yield call(unfollowAPI, action.data); 
        yield put({
            type : UNFOLLOW_USER_SUCCESS,
            data : result.data,
        });
    } catch (e) {
        console.error(e);
        yield put({ 
            type : UNFOLLOW_USER_FAILURE,
            error : e
        });
    }
}

function* watchUnfollow() {
    yield takeEvery(UNFOLLOW_USER_REQUEST, unfollow);
}


//팔로워 목록 불러오기
function loadFollowersAPI(userId, offset = 0 , limit = 3 ) {
    return axios.get(`/user/${userId || 0 }/followers?offset=${offset}&limit=${limit}`, {
        withCredentials: true,
    });
}

function* loadFollowers(action) { 
    try {
        const result = yield call(loadFollowersAPI, action.data, action.offset); 
        yield put({
            type : LOAD_FOLLOWERS_SUCCESS,
            data : result.data,
        });
    } catch (e) {
        console.error(e);
        yield put({ 
            type : LOAD_FOLLOWERS_FAILURE,
            error : e
        });
    }
}

function* watchLoadFollowers() {
    yield takeEvery(LOAD_FOLLOWERS_REQUEST, loadFollowers);
}


//팔로잉 목록 불러오기
function loadFollowingsAPI(userId, offset = 0, limit = 3 ) {
    return axios.get(`/user/${userId  || 0 }/followings?offset=${offset}&limit=${limit}`, {
        withCredentials: true,
    });
}

function* loadFollowings(action) { 
    try {
        const result = yield call(loadFollowingsAPI, action.data, action.offset); 
        yield put({
            type : LOAD_FOLLOWINGS_SUCCESS,
            data : result.data,
        });
    } catch (e) {
        console.error(e);
        yield put({ 
            type : LOAD_FOLLOWINGS_FAILURE,
            error : e
        });
    }
}

function* watchLoadFollowings() {
    yield takeEvery(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}



//팔로워 지우기
function removeFollowersAPI(userId) {
    return axios.delete(`/user/${userId}/followers`, {
        withCredentials: true,
    });
}

function* removeFollowers(action) { 
    try {
        const result = yield call(removeFollowersAPI, action.data); 
        yield put({
            type : REMOVE_FOLLOWER_SUCCESS,
            data : result.data,
        });
    } catch (e) {
        console.error(e);
        yield put({ 
            type : REMOVE_FOLLOWER_FAILURE,
            error : e
        });
    }
}

function* watchRemoveFollower() {
    yield takeEvery(REMOVE_FOLLOWER_REQUEST, removeFollowers);
}

//닉네임 수정
function editNicknameAPI(nickname) {
    return axios.patch(`/user/nickname`, {nickname}, { //부분수정
        withCredentials: true,
    });
}

function* editNickname(action) { 
    try {
        const result = yield call(editNicknameAPI, action.data); 
        yield put({
            type : EDIT_NICKNAME_SUCCESS,
            data : result.data,
        });
    } catch (e) {
        console.error(e);
        yield put({ 
            type : EDIT_NICKNAME_FAILURE,
            error : e
        });
    }
}

function* watchEditNickname() {
    yield takeEvery(EDIT_NICKNAME_REQUEST, editNickname);
}





//call과 fork의 차이
//call과 fork 둘 다 함수를 실행해줌.
//call : 동기호출
//fork : 비동기 호출

export default function* userSaga() {
    yield all([
        fork(watchLogin),
        fork(watchLogOut),
        fork(watchLoadUser), 
        fork(watchSignUp),
        fork(watchFollow),
        fork(watchUnfollow),
        fork(watchLoadFollowers),
        fork(watchLoadFollowings),
        fork(watchRemoveFollower),
        fork(watchEditNickname),
        //그냥 watchLogin()해도 상관 없음. 별 차이 없음. 
        //순서가 없어서 그냥 fork로 넣음
    ]);
}