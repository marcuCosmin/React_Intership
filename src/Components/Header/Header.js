import React, {useContext, useEffect, useState, useRef} from 'react';

import Card from '../Card/Card';
import Checkbox from '../Checkbox/Checkbox';
import Loader from '../Loader/Loader';

import styles from './Header.module.css';
import cstyles from '../../Common.module.css';

import { Link, NavLink } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, getIdToken, signOut, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import {user} from '../../Contexts/Authentication';
import { deviceWidth } from '../../Contexts/DeviceWidth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faEyeSlash, faTimes, faSignOutAlt, faCog, faDollarSign, faHistory } from '@fortawesome/free-solid-svg-icons';

export default function Header() {

    // Pre-sign

    const u = useContext(user);
    const dw = useContext(deviceWidth);

    const modalInitialFocus = useRef(null);
    const modalRef = useRef(null);
    const altFocusRef = useRef(null);

    // Modal types:
    // Sign in
    // Reset password
    // Sign up

    const modalInitial = {
        type: 'Sign in',
        visible: false,
        remember: false,
        passwordVisible: false,
        error: '',
        loading: false,
        passwordSeen: false
    };

    const inputsInitial = {
        email: '',
        password: '',
        username: ''
    };

    const inputsErrorsInitial = {
        email: {
            text: '',
            visible: false
        },
        password: {
            text: '',
            visible: false
        },
        username: {
            text: '',
            visible: false
        }
    };

    const [modal, setModal] = useState({...modalInitial});
    const [inputs, setInputs] = useState({...inputsInitial});
    const [inputsErrors, setInputsErrors] = useState(inputsErrorsInitial);

    function resetState(type) {
        if (!type) {
            window.removeEventListener('keyup', escapeModal);
        }
        setModal({...modalInitial, visible: Boolean(type), type: Boolean(type) ? (type.includes('Reset') ? 'Reset password' : `Sign ${type}`) : 'Sing in'});
        setInputs(inputsInitial);
        setInputsErrors(inputsErrorsInitial);
    }

    function controlInputs(e) {
        if (e.target.name === 'username') {
            if (!/^[0-9a-zA-Z]+$/.test(e.nativeEvent.data)) {
                e.preventDefault();
            } else {
                setInputs({...inputs, [e.target.name]: e.target.value});
            }
        
        } else {
            setInputs({...inputs, [e.target.name]: e.target.value});
        }

        setInputsErrors({...inputsErrors, [e.target.name]: {visible: false, text: ''}});
        setModal({...modal, error: ''});
    }

    useEffect(function() {

        if (modal.visible) {
            
            if (document.cookie.includes('email=') && !modal.type.includes('up') && !modal.remember) {
    
                let cookiesEmail = document.cookie.split(';');
                const cookiesEmailIndex = cookiesEmail.findIndex(el => el.includes('email='));
    
                cookiesEmail = cookiesEmail[cookiesEmailIndex].split('=')[1];
    
                setInputs({...inputsInitial, email: cookiesEmail});
    
                setModal({...modal, remember: true});
                setTimeout(function() {
    
                    if (altFocusRef.current) {
    
                        altFocusRef.current.focus();
                    }
            
                }, 150)
            } else {
                setTimeout(function() {
                    if (modalInitialFocus.current) {
    
                        modalInitialFocus.current.focus();
                    }
    
                }, 150)
            }
        }
        
    }, [modal.visible, modal.type]);

    function escapeModal(e) {
        if (e.key === 'Escape') {
            resetState();
        }
    }

    useEffect(function() {
        if (modal.visible) {
            window.addEventListener('keyup', escapeModal);
        }
    }, [modal.visible]);

    // Post-sign

    const [signDropdown, setSignDropdown] = useState(false);
    const signDropdownRef = useRef(null);

    function escapeDropdown(e) {
        if (signDropdownRef.current) {
            if (e.target !== signDropdownRef.current && !signDropdownRef.current.contains(e.target)) {
                setSignDropdown(false);
                window.removeEventListener('click', escapeDropdown);
            }
        }
    }

    useEffect(function() {

        if (signDropdown) {
            window.addEventListener('click', escapeDropdown);
        }

    }, [signDropdown]);
    
    return (
        <nav className='navbar py-2 ps-2 pe-4'>

            <Link className={`position-relative ${styles.logo}`} exact='true' to='/'>
                <div className={`fw-bold d-flex fst-italic ${cstyles.absolute_center} ${styles.logo_text}`}>
                    <span className='text-dark'>W</span>
                    <span>O</span>
                    <span className='text-danger'>P</span>
                </div>
                <div className='d-flex align-items-center'>
                    <Card name="A" suit="hearts" size="small" styles={{transform: 'rotate(-10deg)'}}/>
                    <Card name="A" suit="spades" size="small" styles={{transform: 'rotate(10deg)'}}/>
                </div>
            </Link>

            {u.isSignedIn && (
                <NavLink className={styles.nav_item} exact='true' to='/lobby'>Play now</NavLink>
            )}

            <div>
                {!u.completed ?

                    <div className={`me-2 ${cstyles.loader}`}>
                        <div/>
                        <div/>
                        <div/>
                    </div>

                : u.isSignedIn ? (
                        
                    <div className={`position-relative ${styles.dropdown}`}>
                        <div tabIndex='0' className={`fw-bold ${styles.dropdown_title} ${signDropdown && styles.dropdown_title_active}`} onClick={function() {!signDropdown && setSignDropdown(true);}}>{u.displayName}</div>
                        <ul ref={signDropdownRef} className={`rounded ${[cstyles.list, styles.dropdown_list].join(' ')} ${signDropdown ? 'visible py-2 px-3' : 'invisible p-0'}`} style={{maxHeight: `${signDropdown ? 500 : 0}px`}}>
                            <li tabIndex='0' className={`text-nowrap mb-${dw <= 450 ? '3' : '2'}`}><FontAwesomeIcon className='me-2' icon={faDollarSign}/>Balance</li>
                            <li tabIndex='0' className={`text-nowrap mb-${dw <= 450 ? '3' : '2'}`}><FontAwesomeIcon className='me-2' icon={faHistory}/>Hands History</li>
                            <li tabIndex='0' className={`text-nowrap mb-${dw <= 450 ? '3' : '2'}`}><FontAwesomeIcon className='me-2' icon={faCog}/>Settings</li>
                            <li tabIndex='0' className='text-nowrap' onKeyUp={function(e) {
                                if (e.key === 'Enter') {
                                    signOut(getAuth()).then(function() {
                                        window.location.href = '/';
                                    });
                                }
                            }} onClick={function() {
                                signOut(getAuth()).then(function() {
                                    window.location.href = '/';
                                });
                            }}><FontAwesomeIcon className='me-2' icon={faSignOutAlt}/>Sign out</li>
                        </ul>
                    </div>
      
                ) : (
                    <div>
                        <div tabIndex="0" className={`fw-bold me-2 ${styles.nav_item}`} onKeyUp={function(e) {e.key === 'Enter' && setModal({...modalInitial, visible: true});}} onClick={function() {setModal({...modalInitial, visible: true});}}>Sign in</div>

                        <div ref={modalRef} tabIndex='0' className={`modal rounded d-flex justify-content-center align-items-center ${modal.visible ? 'visible' : 'invisible'} ${cstyles.modal}`}>
                            <form className={`shadow bg-white rounded ${cstyles.modal_form}`} style={{transform: `translateY(-${modal.visible ? 0 : 200}%)`}} onSubmit={function(e) {
                                e.preventDefault();
                                const errors = {
                                    email: {
                                        text: '',
                                        visible: false
                                    },
                                    password: {
                                        text: '',
                                        visible: false
                                    },
                                    username: {
                                        text: '',
                                        visible: false
                                    }
                                };

                                if (!modal.type.includes('up')) {
                                    delete errors.username;
                                    if (modal.type.includes('Reset')) {
                                        delete errors.password; 
                                    }
                                }

                                for (const key in errors) {
                                    errors[key].visible = inputs[key].length === 0;
                                }

                                if (modal.type.includes('up')) {

                                    if (!errors.password.visible) {

                                        if (inputs.password.length < 8) {
                                            errors.password.visible = true;
                                            errors.password.text = 'The password must contain at least 8 characters.';
                                        } else {

                                            const allKeys = {
                                                digits: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
                                                symbols: ["`", "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+", "[", "{", "]", "}", "\n", "|", ";", ":", '"', "'", ",", "<", ".", ">", "/", "?", " "],
                                                lowLetters: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"],
                                                upLetters: [],
                                            };
    
                                            allKeys.upLetters = Array.from(allKeys.lowLetters, letter => letter.toUpperCase());

                                            const password = {
                                                digits: {
                                                    chars: [],
                                                    valid: false
                                                },
                                                symbols: {
                                                    chars: [],
                                                    valid: false
                                                },
                                                lowLetters: {
                                                    chars: [],
                                                    valid: false
                                                },
                                                upLetters: {
                                                    chars: [],
                                                    valid: false
                                                }
                                            };

                                            for (const letter of inputs.password) {
                                                for (const key in allKeys) {
                                                    if (allKeys[key].includes(letter) && !password[key].chars.includes(letter)) {
                                                        password[key].chars.push(letter);
                                                        password[key].valid = password[key].chars.length >= 2;
                                                    }
                                                }
                                            }

                                            for (const key in password) {
                                                if (!password[key].valid) {
                                                    errors.password.visible = true;
                                                }
                                            }

                                            if (errors.password.visible) {

                                                errors.password.text = `The password must contain at least${!password.digits.valid ? ' 2 different digits,' : ''}${!password.symbols.valid ? ' 2 different symbols,' : ''}${!password.lowLetters.valid ? ' 2 different lowercased letters,' : ''}${!password.upLetters.valid ? ' 2 different uppercased letters,' : ''}`;

                                                errors.password.text = errors.password.text.substring(0, errors.password.text.length - 1) + '.';

                                                if (errors.password.text.lastIndexOf(',') !== -1) {
                                                    errors.password.text = `${errors.password.text.substring(0, errors.password.text.lastIndexOf(','))} and${errors.password.text.substring(errors.password.text.lastIndexOf(',') + 1, errors.password.text.length)}`;
                                                }
                                            }
                                        }
                                    }
                                }

                                if (modal.type.includes('up')) {
                                    if (!errors.username.visible) {
                                       if (inputs.username.length > 6) {
                                            errors.username.visible = true;
                                            errors.username.text = 'The username can not be longer than 6 characters.'
                                        }
                                    }
                                    if (!errors.password.visible) {
                                        if (!modal.passwordSeen) {
                                            errors.password.visible = true;
                                            errors.password.text = 'Please view your password using the button that is positioned to the right of the password textbox in order to make sure that there are no typos in the password you entered.'
                                        }
                                    }
                                }

                                let failed = false;

                                for (const key in errors) {
                                    if (errors[key].visible) {
                                        failed = true;
                                    }
                                }
                                

                                if (failed) {
                                    setInputsErrors({...inputsErrors, ...errors});
                                } else {
                                    switch (modal.type) {
                                        case 'Sign in':
                                            signInWithEmailAndPassword(getAuth(), inputs.email, inputs.password).then(function() {
                                                if (modal.remember) {
                                                    document.cookie = `email=${inputs.email}; expires=27 June ${new Date().getFullYear() + 10} 00:00:00; secure`;
                                                } else {
                                                    document.cookie = `email=${inputs.email}; expires=27 June 2000 00:00:00`;
                                                }
                                                resetState();
                                            }).catch(function(error) {
                                                switch (error.code) {
                                                    case 'auth/too-many-requests':
                                                        setModal({...modal, error: 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.'});
                                                        break;
                                                    case 'auth/invalid-email':
                                                        setInputsErrors({...inputsErrors, email: {visible: true, text: 'The email is invalid.'}});
                                                        break;
                                                    case 'auth/user-disabled':
                                                        setInputsErrors({...inputsErrors, email: {visible: true, text: `This account is disabled. If you feel that the account was disabled without a solid pourpose, please contact us ${<a href='mailto: marcucosmin3@yahoo.com'>here</a>}`}});
                                                        break;
                                                    case 'auth/user-not-found':
                                                    case 'auth/wrong-password':
                                                        setModal({...modal, error: `We couldn't find any user that matches the provided combination of email and password.`});
                                                        break;
                                                }
                                            });
                                            break;
                                        case 'Sign up':
                                            createUserWithEmailAndPassword(getAuth(), inputs.email, inputs.password)
                                            .then(function() {
                                                
                                                updateProfile(getAuth().currentUser, {
                                                    displayName: inputs.username
                                                }).then(function() {
                                                    sendEmailVerification(getAuth().currentUser).then(function() {
                                                        getIdToken(getAuth().currentUser, true).then(function() {
                                                            resetState();
                                                        })
                                                    });
                                                })

                                            })
                                            .catch((error) => {
                                                if (error.code.includes('email')) {
                                                    setInputsErrors({...inputsErrors, email: {visible: true, text: error.code === 'auth/email-already-in-use' ? 'The provided email is already being used by another account.' : 'The email is invalid.'}});
                                                } else {
                                                    setModal({...modal, error: error.message});
                                                }
                                            });

                                            break;
                                        case 'Reset password':
                                            setModal({...modal, loading: true});
                                            sendPasswordResetEmail(getAuth(), inputs.email).then(function() {
                                                setModal({...modal, loading: false});
                                            }).catch(function(error) {
                                                setModal({...modal, loading: false});
                                                let errorAssigned = false;
                                                switch (error.code) {
                                                    case 'auth/invalid-email':
                                                        setInputsErrors({...inputsErrors, email: {visible: true, text: 'The email is invalid.'}});
                                                        errorAssigned = true;
                                                        break;
                                                    case 'auth/user-not-found':
                                                        setModal({...modal, error: `We couldn't find any users that match the provided email.`});
                                                        errorAssigned = true;
                                                        break;
                                                }

                                                if (!errorAssigned) {
                                                    setModal({...modal, error: `A connection error occured. Please try again later.`});
                                                }
                                            });
                                            break;
                                    }
                                }
                                
                            }}>
                                {modal.loading && (
                                    <Loader text='Sending email'/>
                                )}

                                <div className={`fw-bold p-2 position-relative rounded-top text-white text-center ${cstyles.modal_header}`}>
                                    {!modal.type.includes('in') && <span tabIndex='0' className={`position-absolute ${styles.modal_header_btn}`} style={{left: '15px'}} onKeyUp={function(e) {e.key === 'Enter' && resetState('in');}} onClick={function() {resetState('in');}}><FontAwesomeIcon icon={faArrowLeft}/></span>}
                                    <span tabIndex='0' onKeyUp={function(e) {e.key === 'Enter' && resetState(e);}} onClick={function() {resetState();}} className={`position-absolute ${styles.modal_header_btn}`} style={{right: '15px'}}><FontAwesomeIcon icon={faTimes}/></span>
                                    <span>{modal.type}</span>
                                </div>

                                <div className='m-3 p-3'>

                                    <div className={`d-flex justify-content-between ${cstyles.transition_15} ${modal.type.includes('up') ? 'mb-3 visible' : 'invisible'}`} style={{overflow: modal.type.includes('up') ? 'visible' : 'hidden', maxHeight: `${modal.type.includes('up') ? inputsErrors.username.text.length ? 150 : 42 : 0}px`}}>
                                        <input className={`w-100 rounded p-2 ${cstyles.inputs} ${inputsErrors.username.visible && cstyles.inputs_errors}`} ref={(modal.visible && modal.type.includes('up')) ? modalInitialFocus : null} maxLength='6' name='username' type='text' placeholder='Username' value={inputs.username} onChange={controlInputs}/>
                                        <div className={`mt-1 ${styles.errors} ${inputsErrors.username.text.length ? 'visible' : 'invisible'}`} style={{fontSize: `${inputsErrors.username.text.length ? 85 : 0}%`}}>{inputsErrors.username.text}</div>
                                    </div>

                                    <div>

                                        <div>
                                            <input ref={(modal.visible && !modal.type.includes('up')) ? modalInitialFocus : null} name='email' className={`w-100 rounded p-2 ${cstyles.inputs} ${inputsErrors.email.visible && cstyles.inputs_errors}`} placeholder='Email' type='text' value={inputs.email} onChange={controlInputs}/>
                                            <div className={`mt-1 ${styles.errors} ${inputsErrors.email.text.length ? 'visible' : 'invisible'}`} style={{fontSize: `${inputsErrors.email.text.length ? 85 : 0}%`}}>{inputsErrors.email.text}</div>
                                        </div>

                                        <div className={`mt-3 ${modal.type.includes('Reset') ? 'invisible' : 'visible'}`} style={{overflow: modal.type.includes('Reset') ? 'hidden' : 'visible', maxHeight: `${modal.type.includes('Reset') ? 0 : inputsErrors.password.text.length ? 150 : 42}px`}}>

                                            <div className={`rounded d-flex p-2 ${[styles.pass_container, cstyles.transition_15].join(' ')} ${inputsErrors.password.visible && [cstyles.inputs_errors, styles.pass_container_error].join(' ')}`}>
                
                                                <input ref={modal.type.includes('in') ? altFocusRef : null} className={`w-100 rounded p-0 border-0 ${styles.pass} `} name='password' placeholder='Password' type={inputs.passwordVisible ? 'text' : 'password'} value={inputs.password} onChange={controlInputs}/>
                                                <FontAwesomeIcon tabIndex='0' className={`rounded-end ${[styles.pass_revealer, cstyles.transition_15].join(' ')} ${inputsErrors.password.visible && styles.pass_revealer_invalid}`} icon={inputs.passwordVisible ? faEyeSlash : faEye} onKeyUp={function(e) {if (e.key === 'Enter') {
                                                    setModal({...modal, passwordSeen: true});
                                                    setInputs({...inputs, passwordVisible: !inputs.passwordVisible});
                                                    if (inputsErrors.password.text.includes('Please view your password')) {
                                                        setInputsErrors({...inputsErrors, password: {visible: false, text: ''}});
                                                    }
                                                }}} onClick={function() {
                                                    !modal.passwordSeen && setModal({...modal, passwordSeen: true});
                                                    setInputs({...inputs, passwordVisible: !inputs.passwordVisible});
                                                    if (inputsErrors.password.text.includes('Please view your password')) {
                                                        setInputsErrors({...inputsErrors, password: {visible: false, text: ''}});
                                                    }
                                                }}/>

                                            </div>

                                            <div className={`mt-1 ${styles.errors} ${inputsErrors.password.text.length ? 'visible' : 'invisible'}`} style={{fontSize: `${inputsErrors.password.text.length ? 85 : 0}%`}}>{inputsErrors.password.text}</div>

                                        </div>

                                    </div>
                                    
                                    <div className={`d-flex justify-content-between ${dw <= 400 && 'flex-column align-items-center'} ${cstyles.transition_15} ${modal.type.includes('in') ? 'visible mt-3' : 'invisible'}`}  style={{overflow: modal.type.includes('in') ? 'visible' : 'hidden', maxHeight: `${modal.type.includes('in') ? (dw <= 400 ? 68 : 28) : 0}px`}}>
                                        <Checkbox state={{value: modal.remember, update: function(e) {(e.type === 'click' || e.key === 'Enter') && setModal({...modal, remember: !modal.remember});}}} label={{value: 'Remember me', fontSize: 115}}/>
                                        <div className={`${cstyles.text_btn} ${dw <= 400 && 'mt-3'}`} tabIndex='0' onKeyUp={function(e) {e.key === 'Enter' && resetState('Reset');}} onClick={function() {resetState('Reset');}}>Reset password</div>
                                    </div>

                                    <div className={`d-flex justify-content-center align-items-center ${cstyles.transition_15} ${modal.type.includes('up') ? 'invisible' : `${modal.type.includes('in') && 'mt-3'} visible`}`} style={{overflow: modal.type.includes('up') ? 'hidden' : 'visible', maxHeight: `${modal.type.includes('up') ? 0 : 28}px`}}>
                                        <span className='me-2'>Don't have an account?</span>
                                        <span tabIndex='0' className={cstyles.text_btn} onKeyUp={function(e) {e.key === 'Enter' && resetState('up');}} onClick={function() {resetState('up');}}>Sign up</span>
                                    </div>

                                    <div className={`fw-bold my-2 ${styles.errors} ${modal.error.length ? 'visible' : 'invisible'}`} style={{fontSize: `${modal.error.length ? 100 : 0}%`}}>{modal.error}</div>

                                    <div className={`mt-3`}>
                                        <button ref={modal.type.includes('Reset') ? altFocusRef : null} className={`w-100 p-2 rounded fw-bold ${cstyles.btn}`}>{modal.type}</button>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

        </nav>
    );
}
