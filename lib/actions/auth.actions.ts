'use server'

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";
import { DocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

const ONE_WEEK = 60*60*24*7;

export async function signUp({ uid, name, email }: SignUpParams) {
  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc: DocumentSnapshot<DocumentData> = await userRef.get();

    if (userDoc.exists) {
      return {
        success: false,
        message: 'User already exists. Please Sign in instead'
      }
    }

    // Create new user document
    await userRef.set({
      name,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Account created successfully'
    }

  } catch (error: any) {
    console.error('Error creating user:', error);
    return {
      success: false,
      message: error.message || 'Failed to create account'
    }
  }
}

export async function signIn({ email, idToken }: SignInParams) {
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const cookieStore = await cookies();
    
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      success: true,
      message: 'Successfully signed in'
    }
  } catch (error: any) {
    console.error('Error signing in:', error);
    return {
      success: false,
      message: error.message || 'Failed to sign in'
    }
  }
}

export async function setSessionCookie(idToken: string) { 
    const cookieStore = await cookies();
    const SessionCookie = await auth.createSessionCookie(idToken,{
        expiresIn : 60*60*24*7*1000,
    })
    cookieStore.set('session',SessionCookie,{
        maxAge : ONE_WEEK,
        httpOnly : true,
        secure : process.env.NODE_ENV === 'production',
        path : '/',
        sameSite  : 'lax',
    })
}   

export async function getCurrentUser(): Promise<User | null>{
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if(!sessionCookie) return null;
    try{
        const decodedClaims = await auth.verifySessionCookie(sessionCookie,true);
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
        if(!userRecord) return null;
        return{
            ...userRecord.data(),
            id:userRecord.id,
        } as User;
    }catch(e){
        console.log(e);
        return null;
    }
}

export async function isAuthenticated() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    
    if (!session || !session.value) {
      return false;
    }

    const decodedClaims = await auth.verifySessionCookie(session.value);
    return !!decodedClaims;
  } catch (error) {
    console.error('Auth verification error:', error);
    return false;
  }
}

export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
  const interviews = await db.collection('interviews').where('userId','==',userId).orderBy('createdAt', 'desc').get();
  return interviews.docs.map((doc) => ({
    id:doc.id,
    ...doc.data()
  })) as Interview[];
} 


export async function getLatestInterview(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
  const{userId,limit=20} = params;

  const interviews = await db.collection('interviews').orderBy('createdAt', 'desc').where('finalized','==', true).where('userId','!=',userId).limit(limit).get();
  return interviews.docs.map((doc) => ({
    id:doc.id,
    ...doc.data()
  })) as Interview[];
} 