import React, {useContext, useState, useEffect} from 'react';
import styles from './Settings.module.css';
import { user } from '../../Contexts/Authentication';
import standardImage from '../../User Standard Img.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPen, faPlus} from '@fortawesome/free-solid-svg-icons';
import sstyles from '../Sign/Sign.module.css';
import { getStorage, ref, getDownloadURL, uploadString } from "firebase/storage";
import { getAuth, updateProfile, getIdToken, sendPasswordResetEmail } from 'firebase/auth';
import Loader from '../Loader/Loader';
import { getFirestore, doc, onSnapshot, collection} from "firebase/firestore";


export default function Settings() {

  const u = useContext(user);

  const [uploadedImage, setUploadedImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sendEmail, setSendEmail] = useState({
    loading: false,
    finished: false
  });

  const [thisUser, setThisUser] = useState({

  });

  useEffect(function() {
    onSnapshot(doc(collection(getFirestore(), 'users'), u.uid), function(doc) {
      setThisUser(doc.data());
    });
  }, []);

  return (
    <div className='d-flex flex-column justify-content-center align-items-center'>

      <div className='d-flex flex-column'>

          <label className={`position-relative d-flex flex-column align-items-center ${styles.image_container}`}>
            <input accept='iamge/*' multiple={false} className={styles.upload} type='file' onChange={function(e) {
              if (e.target.files.length) {

                const reader = new FileReader();

                function readerHandler(e) {
                    setUploadedImage(reader.result);
                    e.target.value = "";
                }

                reader.addEventListener('load', readerHandler);

                reader.readAsDataURL(e.target.files[0]);
              }
            }}/>
            <img className={`rounded-circle ${styles.image}`} src={uploadedImage.length ? uploadedImage : u.photoURL ? u.photoURL : standardImage}/>
            <div className={`position-absolute text-white rounded-circle d-flex align-items-center justify-content-center w-100 h-100 ${styles.svg_container}`} style={uploading ? {opacity: 1} : null}>
                {uploading ? 
                  <Loader absolute={true} text='Loading'/>
                :
                  <FontAwesomeIcon className={styles.svg} icon={uploadedImage.length || u.photoURL ? faPen : faPlus}/>
                }
            </div>
          </label>
          
          {uploadedImage.length && !uploading ?
            <button className={`p-2 rounded mt-2 ${sstyles.inputs}`} onClick={function() {
              setUploading(true);
              uploadString(ref(getStorage(), 'userImg.jpg'), uploadedImage, 'data_url')
              .then(() => getDownloadURL(ref(getStorage(), 'userImg.jpg'))
                .then((url) => updateProfile(getAuth().currentUser, {photoURL: url})
                  .then(() => getIdToken(getAuth().currentUser, true)).then(function() {
                    setUploading(false);
                    setUploadedImage('');
                  })
                )
              );
            }}>Set as profile image</button>
          : null
          }

        <h1 className='text-center mt-2'>{u.displayName}</h1>
      </div>

      <h4>{thisUser.jobTitle}</h4>

      <div>
          <div className='mt-2 d-flex align-items-center'><h6 className='mb-0 pb-0 me-2'>Joined:</h6> {u.joined}</div>
          <div className='mt-2 d-flex align-items-center'><h6 className='mb-0 pb-0 me-2'>Email:</h6> {u.email}</div>
          <div className='mt-2 d-flex align-items-center'><h6 className='mb-0 pb-0 me-2'>Date of birth:</h6> {thisUser.birthDate}</div>
          <div className='mt-2 d-flex align-items-center'><h6 className='mb-0 pb-0 me-2'>Shift:</h6> {thisUser.shift}</div>
          <div className='mt-2 d-flex align-items-center'><h6 className='mb-0 pb-0 me-2'>Vacation days left:</h6> {thisUser.vacationDays}</div>

          <div className='mt-4 d-flex flex-column'>
            <h5 className='text-center' onClick={function() {
              updateProfile(getAuth().currentUser, {
                displayName: 'Daniel Mihai'
              })
            }}>Reset your password</h5>
            <div style={{maxWidth: '500px'}}>Due to security reasons the only way that you can change your passowrd is only via email. Click the button below and you will receive an email that will contain the proper instructions regarding the password change.</div>
            
            <div className='position-relative d-flex justify-content-center'>
              {sendEmail.loading && (
                <Loader absolute={true} text='Sending email' background={true}/>
              )}

              <button className={`p-2 my-4 rounded ${sstyles.inputs}`} onClick={function() {
                setSendEmail({...sendEmail, loading: true});
                sendPasswordResetEmail(getAuth(), u.email).then(function() {
                  setSendEmail({loading: false, finished: true});
                  setTimeout(() => setSendEmail({loading: false, finished: false}), 500)
                });
              }}>{sendEmail.finished ? <span>Email sent <FontAwesomeIcon icon={faCheck}/></span> : 'Send reset password email'}</button>
            </div>
          </div>
      </div>

    </div>
  )
}
