import React, {useEffect, useState} from 'react';
import { getAuth, onIdTokenChanged } from "firebase/auth";

const user = React.createContext({

    isSignedIn: false,
    displayName: '',
    emailVerified: false,
    uid: '',
    photoURL: null,
    completed: false,
    joined: '',
    email: ''
});

function Authentication({children}) {

    const [userProps, setUserProps] = useState({

        isSignedIn: false,
        displayName: '',
        emailVerified: false,
        uid: '',
        photoURL: null,
        completed: false,
        joined: '',
        email: ''
    });

    useEffect(function() {
        
        onIdTokenChanged(getAuth(), function (user) {

            if (user) {
            
                setUserProps({

                    isSignedIn: true,
                    displayName: user.displayName,
                    emailVerified: user.emailVerified,
                    uid: user.uid,
                    photoURL: user.photoURL,        
                    completed: user.uid ? true : false,
                    joined: user.metadata.creationTime,
                    email: user.email
                });

            } else {

                setUserProps({

                    isSignedIn: false,
                    displayName: '',
                    emailVerified: false,
                    uid: '',
                    photoURL: null,
                    completed: true,
                    joined: '',
                    email: ''
                });
            }
        });

    }, []);

    return (

        <user.Provider value={userProps}>
            {children}
        </user.Provider>
    );
}

export {user, Authentication};