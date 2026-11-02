import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración pública de la app web (la seguridad la controlan las reglas de Firestore).
const firebaseConfig = {
  apiKey: 'AIzaSyAlcpsd3Ud4yHreeFEqoVLyeUzrNujQp0Y',
  authDomain: 'bygreciacepeda.firebaseapp.com',
  projectId: 'bygreciacepeda',
  storageBucket: 'bygreciacepeda.firebasestorage.app',
  messagingSenderId: '285669188744',
  appId: '1:285669188744:web:480c38c2c879abb1472b3d',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
