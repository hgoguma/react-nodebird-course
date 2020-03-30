import React, { useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PostForm from '../containers/PostForm';
import PostCard from '../containers/PostCard';
import { LOAD_MAIN_POSTS_REQUEST } from '../reducers/post';


const Home = () => {
    const { me } = useSelector(state => state.user);
    const { mainPosts, hasMorePost } = useSelector(state => state.post);

    const dispatch = useDispatch();
    const countRef = useRef([]); //빈 배열에 서버에 요청 보냈던 lastId를 기록하기!

    const onScroll = useCallback(() => {
        //window.scrollY : 스크롤 내린 거리
        //document.documentElement.clientHeight : 화면 높이
        //document.documentElement.scrollHeight : 전체 화면 길이
        //마지막 게시글의 id보다 id가 작은 애들 불러오기
        if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
          if (hasMorePost) {
            const lastId = mainPosts[mainPosts.length - 1].id;
            //다음에 요청을 보낼 때는 lastId가 서버로 요청되지 않도록 하기
            if (!countRef.current.includes(lastId)) {
              dispatch({
                type: LOAD_MAIN_POSTS_REQUEST,
                lastId,
              });
              countRef.current.push(lastId); 
            }
          }
        }
      }, [hasMorePost, mainPosts.length]);
    
      useEffect(() => {
        window.addEventListener('scroll', onScroll);
        return () => {
          window.removeEventListener('scroll', onScroll);
        };
      }, [mainPosts.length]);

    return (
        <div>
            { me && <PostForm />}
            { mainPosts.map((c) => {
            return (
                <PostCard key={c.id} post={c} />
            );
            })}
        </div>
    );
};

Home.getInitialProps = async (context) => {
    //console.log(Object.keys(context));
    context.store.dispatch({
      type: LOAD_MAIN_POSTS_REQUEST,
    });
};


export default Home;