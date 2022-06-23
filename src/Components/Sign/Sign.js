import React, {useState, useEffect, useRef} from 'react';
import styles from './Sign.module.css';
import cloneDeep from 'lodash.clonedeep';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import cstyles from '../../Common.module.css';
import Checkbox from '../Checkbox/Checkbox';
import Logo from '../Logo/Logo';


export default function Sign() {

    const formInitial = {
        email: {
            value: '',
            error: {
                value: '',
                visible: false
            }
        },
        password: {
            value: '',
            error: {
                value: '',
                visible: false
            },
            visible: false
        },
        error: '',
        type: 0,
        loading: false,
        remember: false
    };

    const [form, setForm] = useState(formInitial);

    const initialFocus = useRef(null);

    console.log(form);

    useEffect(function() {
        if (document.cookie.includes('email=')) {
    
            let cookiesEmail = document.cookie.split(';');
            const cookiesEmailIndex = cookiesEmail.findIndex(el => el.includes('email='));

            cookiesEmail = cookiesEmail[cookiesEmailIndex].split('=')[1];

            setForm({...form, remember: true, email: {...form.email, value: cookiesEmail}});
        }
    }, [form.type]);

  return (
    <form className={`position-fixed m-auto w-100 shadow rounded bg-white ${styles.form}`} onSubmit={function(e) {
        e.preventDefault();

        const shallowForm = cloneDeep(form);

        shallowForm.email.error.visible = shallowForm.email.value.length === 0;

        if (form.type === 0) {

            shallowForm.password.error.visible = shallowForm.password.value.length < 8;
    
            if (!shallowForm.password.error.visible) {
    
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
    
                for (const letter of shallowForm.password.value) {
                    for (const key in allKeys) {
                        if (allKeys[key].includes(letter) && !password[key].chars.includes(letter)) {
                            password[key].chars.push(letter);
                            password[key].valid = password[key].chars.length >= 2;
                        }
                    }
                }
    
                for (const key in password) {
                    if (!password[key].valid) {
                        shallowForm.password.error.visible = true;
                    }
                }
    
                if (shallowForm.password.error.visible) {
    
                    shallowForm.password.error.value = `The password must contain at least${!password.digits.valid ? ' 2 different digits,' : ''}${!password.symbols.valid ? ' 2 different symbols,' : ''}${!password.lowLetters.valid ? ' 2 different lowercased letters,' : ''}${!password.upLetters.valid ? ' 2 different uppercased letters,' : ''}`;
    
                    shallowForm.password.error.value = shallowForm.password.error.value.substring(0, shallowForm.password.error.value.length - 1) + '.';
    
                    if (shallowForm.password.error.value.lastIndexOf(',') !== -1) {
                        shallowForm.password.error.value = `${shallowForm.password.error.value.substring(0, shallowForm.password.error.value.lastIndexOf(','))} and${shallowForm.password.error.value.substring(shallowForm.password.error.value.lastIndexOf(',') + 1, shallowForm.password.error.value.length)}`;
                    }
                }
            }
        }


        if (!shallowForm.password.error.visible && !shallowForm.email.error.visible) {
            setForm({...form, loading: true});
            if (form.type === 0) {

                signInWithEmailAndPassword(getAuth(), shallowForm.email.value, shallowForm.password.value).then(function() {
                    if (form.remember) {
                        document.cookie = `email=${shallowForm.email.value}; expires=27 June ${new Date().getFullYear() + 10} 00:00:00; secure`;
                    } else {
                        document.cookie = `email=${shallowForm.email.value}; expires=27 June 2000 00:00:00`;
                    }
                    setForm({...shallowForm, loading: false});
                }).catch(function(error) {
                    switch (error.code) {
                        case 'auth/too-many-requests':
                            shallowForm.error = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
                            break;
                        case 'auth/invalid-email':
                            shallowForm.email.error.visible = true;
                            shallowForm.email.error.value = 'The email is invalid.';
                            break;
                        case 'auth/user-disabled':
                            shallowForm.error = `This account is disabled.`;
                            break;
                        case 'auth/user-not-found':
                        case 'auth/wrong-password':
                            shallowForm.error = `We couldn't find any user that matches the provided combination of email and password.`;
                            break;
                     }
                     setForm({...shallowForm, loading: false});
                });
            } else {
                sendPasswordResetEmail(getAuth(), form.email.value).then(function() {
                    setForm({...shallowForm, loading: false});
                }).catch(function() {
                    setForm({...shallowForm, loading: false});
                });
            }
        }

        setForm(shallowForm);
    }}>

        <div className={`fw-bold p-2 position-relative d-flex justify-content-center rounded-top text-white text-center ${cstyles.modal_header}`}>
            {form.type === 1 && <span tabIndex='0' className={`position-absolute ${styles.modal_header_btn}`} onKeyUp={function(e) {e.key === 'Enter' && setForm(formInitial)}} onClick={function() {setForm(formInitial)}}><FontAwesomeIcon icon={faArrowLeft}/></span>}
            <Logo/>
        </div>

        <div className='p-3'>

            <div>
                <input ref={form.email.value.length > 0 ? initialFocus : null} name='email' className={`w-100 rounded p-2 ${styles.inputs} ${form.email.error.visible && styles.inputs_errors}`} placeholder='Email' type='text' value={form.email.value} onChange={function(e) {
                    setForm({...form, email: {error: {visible: false, value: ''}, value: e.target.value}})
                }}/>
                <div className={`mt-1 ${styles.errors} ${form.email.error.value.length ? 'visible' : 'invisible'}`} style={{fontSize: `${form.email.error.value.length ? 85 : 0}%`}}>{form.email.error.value}</div>
            </div>

            <div className={`${form.type === 0 ? 'mt-3 mb-3' : 'm-0'}`} style={{transition: '0.15s', overflow: form.type === 0 ? 'visible' : 'hidden', maxHeight: `${form.type !== 0 ? 0 : form.password.error.value.length ? 150 : 85}px`}}>

                <div className={`rounded d-flex p-2 ${[styles.pass_container, cstyles.transition_15].join(' ')} ${form.password.error.visible && [styles.inputs_errors, styles.pass_container_error].join(' ')}`}>

                    <input tabIndex={form.type === 0 ? '0' : '-1'} ref={form.email.value.length > 0 && form.type === 0 ? initialFocus : null} className={`w-100 rounded p-0 border-0 ${styles.pass}`} name='password' placeholder='Password' type={form.password.visible ? 'text' : 'password'} value={form.password.value} onChange={function(e) {
                        setForm({...form, password: {...form.password, error: {visible: false, value: ''}, value: e.target.value}});
                    }}/>
                    <FontAwesomeIcon tabIndex={form.type === 0 ? '0' : '-1'} className={`rounded-end ${[styles.pass_revealer, cstyles.transition_15].join(' ')} ${form.password.error.visible && styles.pass_revealer_invalid}`} icon={form.password.visible ? faEyeSlash : faEye}
                    onKeyUp={function(e) {
                        if (e.key === 'Enter') {
                            setForm({...form, password: {...form.password, visible: !form.password.visible}});
                        }
                    }}
                    onClick={function() {
                        setForm({...form, password: {...form.password, visible: !form.password.visible}});
                    }}/>

                </div>

                <div className={`${styles.errors} ${form.password.error.value.length ? 'visible mt-2' : 'invisible mt-0'}`} style={{fontSize: `${form.password.error.value.length ? 85 : 0}%`}}>{form.password.error.value}</div>

                <div className='mt-3 d-flex justify-content-between'>
                    <Checkbox label="Remember my email" state={{value: form.remember, update: function() {setForm({...form, remember: !form.remember})}}}/>
                    <button type='button' onClick={function() {setForm({...formInitial, type: 1})}} className={cstyles.text_btn}>Reset password</button>
                </div>

            </div>
            
            <button className={`w-100 p-2 mt-2 rounded ${styles.inputs}`}>{form.type === 0 ? 'Sign in' : 'Reset password'}</button>
        </div>

    </form>
  )
}
