import React, {useEffect, useState} from 'react';

const deviceWidth = React.createContext(window.innerWidth);

function DeviceWidth({children}) {

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(function() {
        
        window.addEventListener('resize', function() {setWidth(window.innerWidth)});

    }, []);

    return (

        <deviceWidth.Provider value={width}>
            {children}
        </deviceWidth.Provider>
    );
}

export {deviceWidth, DeviceWidth};