import produce from 'immer';

export const initialState = {
    mainPosts: [], // 화면에 보일 포스트들
    imagePaths: [], // 미리보기 이미지 경로
    addPostErrorReason: '', // 포스트 업로드 실패 사유
    isAddingPost: false, // 포스트 업로드 중
    postAdded: false, // 포스트 업로드 성공
    isAddingComment: false,
    addCommentErrorReason: '',
    commentAdded: false,
    singlePost: null,
};
  
export const LOAD_MAIN_POSTS_REQUEST = 'LOAD_MAIN_POSTS_REQUEST';
export const LOAD_MAIN_POSTS_SUCCESS = 'LOAD_MAIN_POSTS_SUCCESS';
export const LOAD_MAIN_POSTS_FAILURE = 'LOAD_MAIN_POSTS_FAILURE';
  
export const LOAD_HASHTAG_POSTS_REQUEST = 'LOAD_HASHTAG_POSTS_REQUEST';
export const LOAD_HASHTAG_POSTS_SUCCESS = 'LOAD_HASHTAG_POSTS_SUCCESS';
export const LOAD_HASHTAG_POSTS_FAILURE = 'LOAD_HASHTAG_POSTS_FAILURE';

export const LOAD_USER_POSTS_REQUEST = 'LOAD_USER_POSTS_REQUEST';
export const LOAD_USER_POSTS_SUCCESS = 'LOAD_USER_POSTS_SUCCESS';
export const LOAD_USER_POSTS_FAILURE = 'LOAD_USER_POSTS_FAILURE';

export const UPLOAD_IMAGES_REQUEST = 'UPLOAD_IMAGES_REQUEST';
export const UPLOAD_IMAGES_SUCCESS = 'UPLOAD_IMAGES_SUCCESS';
export const UPLOAD_IMAGES_FAILURE = 'UPLOAD_IMAGES_FAILURE';

export const REMOVE_IMAGE = 'REMOVE_IMAGE';

export const ADD_POST_REQUEST = 'ADD_POST_REQUEST';
export const ADD_POST_SUCCESS = 'ADD_POST_SUCCESS';
export const ADD_POST_FAILURE = 'ADD_POST_FAILURE';

export const LIKE_POST_REQUEST = 'LIKE_POST_REQUEST';
export const LIKE_POST_SUCCESS = 'LIKE_POST_SUCCESS';
export const LIKE_POST_FAILURE = 'LIKE_POST_FAILURE';

export const UNLIKE_POST_REQUEST = 'UNLIKE_POST_REQUEST';
export const UNLIKE_POST_SUCCESS = 'UNLIKE_POST_SUCCESS';
export const UNLIKE_POST_FAILURE = 'UNLIKE_POST_FAILURE';

export const ADD_COMMENT_REQUEST = 'ADD_COMMENT_REQUEST';
export const ADD_COMMENT_SUCCESS = 'ADD_COMMENT_SUCCESS';
export const ADD_COMMENT_FAILURE = 'ADD_COMMENT_FAILURE';

export const LOAD_COMMENTS_REQUEST = 'LOAD_COMMENTS_REQUEST';
export const LOAD_COMMENTS_SUCCESS = 'LOAD_COMMENTS_SUCCESS';
export const LOAD_COMMENTS_FAILURE = 'LOAD_COMMENTS_FAILURE';

export const RETWEET_REQUEST = 'RETWEET_REQUEST';
export const RETWEET_SUCCESS = 'RETWEET_SUCCESS';
export const RETWEET_FAILURE = 'RETWEET_FAILURE';

export const REMOVE_POST_REQUEST = 'REMOVE_POST_REQUEST';
export const REMOVE_POST_SUCCESS = 'REMOVE_POST_SUCCESS';
export const REMOVE_POST_FAILURE = 'REMOVE_POST_FAILURE';

export const LOAD_POST_REQUEST = 'LOAD_POST_REQUEST';
export const LOAD_POST_SUCCESS = 'LOAD_POST_SUCCESS';
export const LOAD_POST_FAILURE = 'LOAD_POST_FAILURE';


export default (state = initialState, action) => {

    return produce(state, (draft) => { //draft : 자유롭게 바꿀 수 있음. 
        switch (action.type) {
            case UPLOAD_IMAGES_REQUEST: {
                break;
            }
            case UPLOAD_IMAGES_SUCCESS: {
                action.data.forEach((p) => {
                    draft.imagePaths.push(p);
                })
                break;

                // return {
                //     ...state,
                //     imagePaths: [...state.imagePaths, ...action.data], //여러개 이미지를 올릴 수 있음
                // };
            }
            case UPLOAD_IMAGES_FAILURE: {
                break;
            }
            case REMOVE_IMAGE: {
                const index = draft.imagePaths.findIndex((v, i) => i === action.index);
                draft.imagePaths.splice(index, 1);
                break;
                // return {
                //     ...state,
                //     imagePaths: state.imagePaths.filter((v, i) => i !== action.index), 
                // };
            }
            case ADD_POST_REQUEST: {
                draft.isAddingPost = true;
                draft.addPostErrorReason = '';
                draft.postAdded = false;
                break;
            }
            case ADD_POST_SUCCESS: {
                draft.isAddingPost = false;
                draft.mainPosts.unshift(action.data); //앞에 추가
                draft.postAdded = true;
                draft.imagePaths = [];
                break;
            }
            case ADD_POST_FAILURE: {
                draft.isAddingPost = false;
                draft.addPostErrorReason = action.error;
                break;
            }
            case ADD_COMMENT_REQUEST: {
                return {
                ...state,
                isAddingComment: true,
                addCommentErrorReason: '',
                commentAdded: false,
                };
            }
            case ADD_COMMENT_SUCCESS: {
                const postIndex = draft.mainPosts.findIndex(v => v.id === action.data.postId);
                draft.mainPosts[postIndex].Comments.push(action.data.comment);
                draft.isAddingComment = false;
                draft.commentAdded = true;
                break;
            }
            case ADD_COMMENT_FAILURE: {
                return {
                ...state,
                isAddingComment: false,
                addCommentErrorReason: action.error,
                };
            }
            case LOAD_COMMENTS_SUCCESS: {
                const postIndex = draft.mainPosts.findIndex(v => v.id === action.data.postId);
                draft.mainPosts[postIndex].Comments = action.data.comments;
                break;
            }
            case LOAD_MAIN_POSTS_REQUEST:
            case LOAD_HASHTAG_POSTS_REQUEST:
            case LOAD_USER_POSTS_REQUEST: {
                draft.mainPosts = !action.lastId ? [] : draft.mainPosts;
                draft.hasMorePost = action.lastId ? draft.hasMorePost : true;
                break;
                // return {
                // ...state,
                // //처음 게시글을 불러올 때는 초기화!
                // //더 불러올 때에는 기존 게시글 유지
                // mainPosts: action.lastId === 0 ? [] : state.mainPosts,
                // hasMorePost: action.lastId ? state.hasMorePost : true, 
                // //처음 불러올 때엔 스크롤 활성화(true) 
                // //더보기일 때에는 기존 상태 유지
                // };
            }
            case LOAD_MAIN_POSTS_SUCCESS:
            case LOAD_HASHTAG_POSTS_SUCCESS:
            case LOAD_USER_POSTS_SUCCESS: {
                return {
                ...state,
                mainPosts: state.mainPosts.concat(action.data),
                hasMorePost : action.data.length === 10,
                };
            }
            case LOAD_MAIN_POSTS_FAILURE:
            case LOAD_HASHTAG_POSTS_FAILURE:
            case LOAD_USER_POSTS_FAILURE: {
                return {
                ...state,
                };
            }
            case LIKE_POST_REQUEST: {
                return {
                ...state,
                };
            }
            case LIKE_POST_SUCCESS: {
                const postIndex = draft.mainPosts.findIndex(v => v.id === action.data.postId);
                draft.mainPosts[postIndex].Likers.unshift({ id: action.data.userId });
                break;
                // //좋아요 누른 게시글 알아내기
                // const postIndex = state.mainPosts.findIndex(v => v.id === action.data.postId);
                // const post = state.mainPosts[postIndex];
                // //좋아요 누른 사람들 목록에 이름 추가
                // const Likers = [{ id: action.data.userId }, ...post.Likers];
                // const mainPosts = [...state.mainPosts];
                // mainPosts[postIndex] = { ...post, Likers };
                // return {
                // ...state,
                // mainPosts,
                // };
            }
            case LIKE_POST_FAILURE: {
                return {
                ...state,
                };
            }
            case UNLIKE_POST_REQUEST: {
                return {
                ...state,
                };
            }
            case UNLIKE_POST_SUCCESS: {
                const postIndex = draft.mainPosts.findIndex(v => v.id === action.data.postId);
                const likeIndex = draft.mainPosts[postIndex].Likers.findIndex(v => v.id === action.data.userId);
                draft.mainPosts[postIndex].Likers.splice(likeIndex, 1);
                break;

                // const postIndex = state.mainPosts.findIndex(v => v.id === action.data.postId);
                // const post = state.mainPosts[postIndex];
                // //좋아요 누른 목록에서 아이디 빼기
                // const Likers = post.Likers.filter(v => v.id !== action.data.userId);
                // const mainPosts = [...state.mainPosts];
                // mainPosts[postIndex] = { ...post, Likers };
                // return {
                // ...state,
                // mainPosts,
                // };
            }
            case UNLIKE_POST_FAILURE: {
                return {
                ...state,
                };
            }
            case RETWEET_REQUEST: {
                return {
                ...state,
                };
            }
            case RETWEET_SUCCESS: {
                return {
                ...state,
                mainPosts: [action.data, ...state.mainPosts],
                };
            }
            case RETWEET_FAILURE: {
                return {
                ...state,
                };
            }
            case REMOVE_POST_REQUEST : {
                return {
                ...state,
                };
            }
            case REMOVE_POST_SUCCESS : {
                return {
                ...state,
                mainPosts: state.mainPosts.filter(v => v.id !== action.data),
                };
            }
            case REMOVE_POST_FAILURE : {
                return {
                ...state,
                };
            }
            case LOAD_POST_SUCCESS : {
                draft.singlePost = action.data;
                break;
            }
            default: {
                return {
                ...state,
                };
            }
        }
    });
};