import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Slick from 'react-slick';
import { Overlay, Header, CloseBtn, SlickWrapper, ImageWrapper, Indicator } from './style';

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