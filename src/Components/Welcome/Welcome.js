import React, { useState, useRef, useEffect, useContext } from 'react';

import styles from './Welcome.module.css';
import cstyles from '../../Common.module.css';

import { deviceWidth } from '../../Contexts/DeviceWidth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import img1 from '../../Images/15419567_1197938320289641_2525929513548802555_o.jpg';
import img2 from '../../Images/stock-photo-142984111.jpg';
import img3 from '../../Images/pandasecurity-facebook-photo-privacy.jpg';

export default function Welcome() {

    const dw = useContext(deviceWidth);

    const [images, setImages] = useState({srcs: [img1, img2, img3], jsx: null});

    const [sliderCurrent, setSliderCurrent] = useState(0);

    const sliderRef = useRef(null);
    
    useEffect(function() {
        setImages({...images, jsx: images.srcs.map((src, index) => <img className={`rounded`} src={src} key={index} style={{width: `${sliderRef.current.offsetWidth}px`}}/>)});
    }, [sliderCurrent, dw]);
    

    return (
        <div>
            <div ref={sliderRef} className={`m-auto w-${dw <= 600 ? '100' : '50'} ${styles.slider_main}`}>

                <div className='d-flex position-relative align-items-center'>

                    {sliderCurrent !== 0 && (
                        <FontAwesomeIcon tabIndex="0" onClick={function() {sliderCurrent !== 0 && setSliderCurrent(sliderCurrent - 1);}} className={`position-absolute ${[styles.arrows, styles.arrow_right].join(" ")}`} icon={faChevronLeft}/>
                    )}

                    <div className={`d-flex ${styles.slider_frame}`} style={{transform: `translateX(${sliderCurrent * (100 / images.srcs.length) * (-1)}%)`}}>
                        {images.jsx}
                    </div>

                    {sliderCurrent !== images.srcs.length - 1 && (
                        <FontAwesomeIcon tabIndex="0" onClick={function() {sliderCurrent !== images.srcs.length - 1 && setSliderCurrent(sliderCurrent + 1);}} className={`position-absolute ${[styles.arrows, styles.arrow_left].join(" ")}`} icon={faChevronRight}/>
                    )}
                </div>
            </div>
        </div>
    );
}
