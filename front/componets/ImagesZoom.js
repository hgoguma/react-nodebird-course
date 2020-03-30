import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import Slick from 'react-slick';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  z-index: 5000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Header = styled.header`
  height: 44px;
  background: white;
  position: relative;
  padding: 0;
  text-align: center;
  
  & h1 {
    margin: 0;
    font-size: 17px;
    color: #333;
    line-height: 44px;
  }
`;

const SlickWrapper = styled.div`
  height: calc(100% - 44px);
  background: #090909;
`;


const CloseBtn = styled(Icon)`
  position: absolute;
  right: 0;
  top: 0;
  padding: 15px;
  lineHeight: 14px;
  cursor: pointer;
`;

const Indicator = styled.div`
  text-align : center;
  & > div {
    width: 75px;
    height: 30px;
    lineHeight: 30px;
    borderRadius: 15px;
    background: #313131;
    display: inline-block;
    textAlign: center;
    color: white;
    fontSize: 15px;
  }
`;

const ImageWrapper = styled.div`
  padding: 32px;
  textAlign: center;
  & img {
    margin: 0 auto;
    maxHeight: 750px;
  }
`;

const ImagesZoom = ({images, onClose}) => {
    const [currentSlide, setCurrentSlide] = useState(0);


    return (
        <Overlay>
          <Header>
            <h1>상세 이미지</h1>
            <CloseBtn type="close" onClick={onClose} />
          </Header>
          <SlickWrapper>
            <div>
              <Slick
                initialSlide={0}  //몇번째 이미지를 처음으로 보여줄지
                afterChange={slide => setCurrentSlide(slide)} //슬라이드 할 때 마다 현재 슬라이드 바꿔주기
                infinite={false}  //무한슬라이드 사용x
                arrows
                slidesToShow={1} //한번에 한 장씩
                slidesToScroll={1} //한번에 하나씩 스크롤
              >
                {images.map((v) => {
                  return (
                    <ImageWrapper>
                      <img src={`http://localhost:5000/${v.src}`} />
                    </ImageWrapper>
                  );
                })}
              </Slick>
              <Indicator>
                <div>
                  {currentSlide + 1} / {images.length}
                </div>
              </Indicator>
            </div>
          </SlickWrapper>
        </Overlay>
      );
    };
    
ImagesZoom.propTypes = {
    images : PropTypes.arrayOf(PropTypes.shape({
        src : PropTypes.string,
    })).isRequired,
    onClose : PropTypes.func.isRequired,
}

export default ImagesZoom;