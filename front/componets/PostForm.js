import React, {useCallback, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button } from 'antd';
import { ADD_POST_REQUEST, UPLOAD_IMAGES_REQUEST, REMOVE_IMAGE } from '../reducers/post';

const PostForm = () => {
    const dispatch = useDispatch();
    const [text, setText] = useState('');
    const { imagePaths, isAddingPost, postAdded } = useSelector(state => state.post);
    const imageInput = useRef();
    
    //게시글 작성이 완료 되면 글썼던 input 비워주기
    useEffect(() => {
        if(postAdded) {
            setText('');
        }
    },[postAdded]);

    const onSubmitForm = useCallback((e) => {
        e.preventDefault();
        if(!text || !text.trim()) { // trim() -> 스페이스바만 입력 거 막기
          return alert('게시글을 작성하세요');
        }
        const formData = new FormData();
        imagePaths.forEach((i) => {
          formData.append('image', i);
        });
        formData.append('content', text);
        dispatch({
            type : ADD_POST_REQUEST,
            data : formData,
        });
    }, [text, imagePaths]);

    const onChangeText = useCallback((e) => {
        setText(e.target.value);
    },[]);

    //실제 이미지 업로드 했을 때 작동 -> ajax로 하기 위해 formData 객체 사용
    const onChangeImages = useCallback((e) => {
      console.log(e.target.files);
      const imageFormData = new FormData(); //formData객체 안에 이미지 파일 하나씩 넣기
      [].forEach.call(e.target.files, (f) => {
        imageFormData.append('image', f); //첫번째 인자 -> name:image로 보냄
      });
      dispatch({
        type : UPLOAD_IMAGES_REQUEST,
        data : imageFormData,
      });
    }, []);

    const onClickImageUpload = useCallback(() => {
      imageInput.current.click(); //button 클릭시 input type=file을 누른 효과가 됨
    }, [imageInput.current]);

    const onRemoveImage = useCallback(index => () => { //onRemoveImage뒤에 괄호가 붙어 있으면 괄호를 두번 써줘야 함
      dispatch({
        type : REMOVE_IMAGE,
        index,
      });
    }, []);
    
    return (
      <Form style={{ margin: '10px 0 20px' }} encType="multipart/form-data" onSubmit={onSubmitForm}>
        <Input.TextArea maxLength={140} placeholder="어떤 신기한 일이 있었나요?" value={text} onChange={onChangeText} />
        <div>
          <input type="file" multiple hidden ref={imageInput} onChange={onChangeImages} />
          <Button onClick={onClickImageUpload}>이미지 업로드</Button>
          <Button type="primary" style={{ float: 'right' }} htmlType="submit" loading={isAddingPost}>짹짹</Button>
        </div>
        <div>
          {imagePaths.map((v, i) => (
            <div key={v} style={{ display: 'inline-block' }}>
              <img src={`http://localhost:5000/${v}`} style={{ width: '200px' }} alt={v} />
              <div>
                <Button onClick={onRemoveImage(i)}>제거</Button>
              </div>
            </div>
          ))}
        </div>
    </Form>
  );
};

export default PostForm;
