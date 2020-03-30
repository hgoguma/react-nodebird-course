import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';


const PostCardContent = ({postData}) => {

    return (
        <div> {postData.split(/(#[^\s]+)/g).map((v) => { //a태그 대신에 next의 link 태그로 사용! 이걸 써야 spa 유지 가능
            if(v.match(/#[^\s]+/)){ //정규표현식에 맞으면 link로!
                return (
                <Link href={{pathname : '/hashtag', query : { tag : v.slice(1)}}} as={`/hashtag/${v.slice(1)}`} key={v}><a>{v}</a></Link>
                );
            }
            return v;
            })} 
        </div>
    )
}

PostCardContent.propTypes = {
    postData : PropTypes.string.isRequired,
};

export default PostCardContent;