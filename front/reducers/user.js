import produce from 'immer';

export const initialState = {
    isLoggingOut: false, // 로그아웃 시도중
    isLoggingIn: false, // 로그인 시도중
    logInErrorReason: '', // 로그인 실패 사유
    isSignedUp: false, // 회원가입 성공
    isSigningUp: false, // 회원가입 시도중
    signUpErrorReason: '', // 회원가입 실패 사유
    me: null, // 내 정보
    followingList: [], // 팔로잉 리스트
    followerList: [], // 팔로워 리스트
    userInfo: null, // 남의 정보
    isEditingNickname: false, // 이름 변경 중
    editNicknameErrorReason: '', // 이름 변경 실패 사유
    hasMoreFollowers : false,
    hasMoreFollowings : false,
};

//비동기 요청 액션의 이름 -> redux saga
export const SIGN_UP_REQUEST = 'SIGN_UP_REQUEST';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE'; 

export const LOG_IN_REQUEST = 'LOG_IN_REQUEST'; 
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'; 
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE'; 

export const LOAD_USER_REQUEST = 'LOAD_USER_REQUEST';
export const LOAD_USER_SUCCESS = 'LOAD_USER_SUCCESS';
export const LOAD_USER_FAILURE = 'LOAD_USER_FAILURE';

export const LOAD_FOLLOWERS_REQUEST = 'LOAD_FOLLOWERS_REQUEST';
export const LOAD_FOLLOWERS_SUCCESS = 'LOAD_FOLLOWERS_SUCCESS';
export const LOAD_FOLLOWERS_FAILURE = 'LOAD_FOLLOWERS_FAILURE';

export const LOAD_FOLLOWINGS_REQUEST = 'LOAD_FOLLOWINGS_REQUEST';
export const LOAD_FOLLOWINGS_SUCCESS = 'LOAD_FOLLOWINGS_SUCCESS';
export const LOAD_FOLLOWINGS_FAILURE = 'LOAD_FOLLOWINGS_FAILURE';

export const FOLLOW_USER_REQUEST = 'FOLLOW_USER_REQUEST';
export const FOLLOW_USER_SUCCESS = 'FOLLOW_USER_SUCCESS';
export const FOLLOW_USER_FAILURE = 'FOLLOW_USER_FAILURE';

export const UNFOLLOW_USER_REQUEST = 'UNFOLLOW_USER_REQUEST';
export const UNFOLLOW_USER_SUCCESS = 'UNFOLLOW_USER_SUCCESS';
export const UNFOLLOW_USER_FAILURE = 'UNFOLLOW_USER_FAILURE';

export const REMOVE_FOLLOWER_REQUEST = 'REMOVE_FOLLOWER_REQUEST';
export const REMOVE_FOLLOWER_SUCCESS = 'REMOVE_FOLLOWER_SUCCESS';
export const REMOVE_FOLLOWER_FAILURE = 'REMOVE_FOLLOWER_FAILURE';

export const ADD_POST_TO_ME = 'ADD_POST_TO_ME';

export const LOG_OUT_REQUEST = 'LOG_OUT_REQUEST'; 
export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS'; 
export const LOG_OUT_FAILURE = 'LOG_OUT_FAILURE'; 

export const EDIT_NICKNAME_REQUEST = 'EDIT_NICKNAME_REQUEST';
export const EDIT_NICKNAME_SUCCESS = 'EDIT_NICKNAME_SUCCESS';
export const EDIT_NICKNAME_FAILURE = 'EDIT_NICKNAME_FAILURE';

export const REMOVE_POST_OF_ME = 'REMOVE_POST_OF_ME';



export const INCREMENT_NUMBER = 'INCREMENT_NUMBER'; //동기 요청 -> redux

//reducer : action의 결과로 state를 어떻게 바꿀지 정의
const reducer = (state = initialState, action) => {

  return produce(state, (draft) => {
    switch(action.type) {
      case LOG_IN_REQUEST: {
        draft.isLoggingIn = true;
        draft.logInErrorReason = '';
        break;
      }
      case LOG_IN_SUCCESS: {
        draft.isLoggingIn = false;
        draft.me = action.data;
        draft.isLoading = false;
        break;
      }
      case LOG_IN_FAILURE: {
        draft.isLoggingIn = false;
        draft.logInErrorReason = action.reason;
        draft.me = null;
        break;
      }
      case LOG_OUT_REQUEST : {
        return {
            ...state,
            isLoggingOut : true,
            }
      }
      case LOG_OUT_SUCCESS : {
          return {
              ...state,
              isLoggingOut : false,
              me : null,
          }
      }
      case SIGN_UP_REQUEST : {
        return {
            ...state,
            isSigningUp : true,
            isSignedUp : false,
            signUpErrorReason : ''
        }
      }
      case SIGN_UP_SUCCESS : {
          return {
              ...state,
              isSigningUp : false,
              isSignedUp : true,
          }
      }
      case SIGN_UP_FAILURE : {
          return {
              ...state,
              isSigningUp : false,
              signUpErrorReason : action.error,
          }
      }
      case LOAD_USER_REQUEST: {
          return {
            ...state,
          };
      }
      case LOAD_USER_SUCCESS: {
          if (action.me) { //내 정보 불러오기
            return {
              ...state,
              me: action.data,
            };
          }
          return { //다른 유저 정보 불러오기
            ...state,
            userInfo: action.data,
          };
      }
      case LOAD_USER_FAILURE: {
        return {
          ...state,
        };
      }
      case FOLLOW_USER_REQUEST : {
        return {
          ...state,
        }
      }
      case FOLLOW_USER_SUCCESS : {
        draft.me.Followings.unshift({id : action.data});
        break;
      }
      case FOLLOW_USER_FAILURE : {
        return {
          ...state,
        }
      }
      case UNFOLLOW_USER_REQUEST : {
        return {
          ...state,
        }
      }
      case UNFOLLOW_USER_SUCCESS : {
          return {
          ...state,
          me : {
            ...state.me,
            Followings : [...state.me.Followings].filter(v => v.id !== action.data), //아이디 빼기
          },
          followingList : state.followingList.filter(v => v.id !== action.data),
        };
      }
      case UNFOLLOW_USER_FAILURE : {
        return {
          ...state,
        }
      }
      case ADD_POST_TO_ME : {
        return {
          ...state,
          me : {
            ...state.me,
            Posts : [{id : action.data}, ...state.me.Posts],
          }
        }
      }
      case REMOVE_POST_OF_ME : { //짹짹에서 제거
        return {
          ...state,
          me : {
            ...state.me,
            Posts : state.me.Posts.filter( v => v.id !== action.data),
          }
        }
      }
      case LOAD_FOLLOWERS_REQUEST: {
        draft.followerList = action.offset ? [] : draft.followerList;
        draft.hasMoreFollowers = action.offset ? draft.hasMoreFollowers : true;
        break;
        //처음 데이터를 가져올 때는 더보기 버튼을 true로! (더보기 버튼 보여주기)
        //처음 데이터를 가져오는 게 아닐 때에는 더보기 버튼에 영향을 미치지 않음
        //action.offset은 데이터를 더 불러올 때 넣어줌 -> 그럴 때는 hasmoreFollower 를 true
      }
      case LOAD_FOLLOWERS_SUCCESS: {
        action.data.forEach((d) => {
          draft.followerList.push(d);
        });
        draft.hasMoreFollowers = action.data.length === 3;
        //불러오는 데이터의 개수가 3개 미만이면 false(더보기 버튼 없애기), 3개면 true
        break;
      }
      case LOAD_FOLLOWERS_FAILURE: {
        return {
          ...state,
        };
      }
      case LOAD_FOLLOWINGS_REQUEST: {
        draft.followingList = action.offset ? [] : draft.followingList;
        draft.hasMoreFollowings = action.offset ? draft.hasMoreFollowings : true;
        break;
        //처음 데이터를 가져올 때에는 더보기 버튼을 보여주기
      }
      case LOAD_FOLLOWINGS_SUCCESS: {
        action.data.forEach((d) => {
          draft.followingList.push(d);
        });
        draft.hasMoreFollowings = action.data.length === 3;
        //불러오는 데이터의 개수가 3개 미만이면 false(더보기 버튼 없애기), 3개면 true
        break;
      }
      case LOAD_FOLLOWINGS_FAILURE: {
        return {
          ...state,
        };
      }
      case REMOVE_FOLLOWER_REQUEST: {
        return {
          ...state,
        };
      }
      case REMOVE_FOLLOWER_SUCCESS: {
        return {
          ...state,
          me: {
            ...state.me,
            Followers: state.me.Followers.filter(v => v.id !== action.data),
          },
          followerList: state.followerList.filter(v => v.id !== action.data),
        };
      }
      case REMOVE_FOLLOWER_FAILURE: {
        return {
          ...state,
        };
      }
      case EDIT_NICKNAME_REQUEST: {
        return {
          ...state,
          isEditingNickname: true,
          editNicknameErrorReason: '',
        };
      }
      case EDIT_NICKNAME_SUCCESS: {
        return {
          ...state,
          isEditingNickname: false,
          me: {
            ...state.me,
            nickname: action.data,
          },
        };
      }
      case EDIT_NICKNAME_FAILURE: {
        return {
          ...state,
          isEditingNickname: false,
          editNicknameErrorReason: action.error,
        };
      }

      default : {
          return {
              ...state
          }
      }
    }
  });
};

export default reducer;