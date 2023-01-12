import firebase from "firebase/compat";
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import './app.css';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import {useRef, useState} from "react";

const firebaseConfig = {
  apiKey: "AIzaSyBgqtQqKZENBq5lfPgC8pGG4_PuvI-9sX0",
  authDomain: "supa-chatu.firebaseapp.com",
  projectId: "supa-chatu",
  storageBucket: "supa-chatu.appspot.com",
  messagingSenderId: "1026020599982",
  appId: "1:1026020599982:web:e4d188f7e66c11137a653f",
  measurementId: "G-JJQBVDGRPL"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
    const [user] = useAuthState(auth);

  return (
    <div className="App">
        <header>
              <h1>⚛️🔥💬</h1>
        </header>
        <section>
            {user ? <ChatRoom /> : <SignIn />}
        </section>

    </div>
  )
}

function SignIn() {
    const signInWithGoogle = async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
    }
    return (
        <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    );
}

function SignOut() {
    return auth.currentUser && (
        <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
    )
}

function ChatRoom() {
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);
    const dummy = useRef()

    const [messages] = useCollectionData(query, { idField: 'id' });
    const [formValue, setFormValue] = useState('');
    const sendMessage = async () => {
        const { uid, photoURL } = auth.currentUser;
        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        });
        setFormValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <>
            <main>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                <div ref={dummy}></div>
            </main>

            <form>
                <input type="text" placeholder="say wch fi 9albek" value={formValue} onChange={e => setFormValue(e.target.value)}/>
                <button type="button" disabled={!formValue} onClick={sendMessage}>🦦</button>
            </form>
        </>
    )
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="icon"/>
            <p>{text}</p>
        </div>
    )

}

export default App
