import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    /*TODO pegar no projeto do firebase */    
};

export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);