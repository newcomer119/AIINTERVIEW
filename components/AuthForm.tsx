"use client";

// External libraries
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Firebase imports
import { auth } from "@/firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// UI Components
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Formfield from "@/components/ui/Formfield";

// Actions
import { signUp, signIn } from "@/lib/actions/auth.actions";

// Types
interface SignInParams {
  email: string;
  idToken: string;
}

type FormType = "sign-in" | "sign-up";

// Form Schema
const authformSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3, "Name is required") : z.string().optional(),
    email: z.string().min(3, "Email is required").email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authformSchema(type);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        
        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
        });

        if (!result?.success) {
          return toast.error(result?.message);
        }

        toast.success("Account Created Successfully. Please Sign in");
        router.push('/sign-in');
      } else {
        const { email, password } = values;
        
        // Sign in with Firebase
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredentials.user.getIdToken();
        
        if (!idToken) {
          toast.error('Failed to get authentication token');
          return;
        }

        // Create server-side session
        const result = await signIn({
          email,
          idToken
        });

        if (!result.success) {
          toast.error(result.message || 'Sign in failed');
          return;
        }

        toast.success('Signed in successfully');
        
        // Force a hard navigation instead of client-side navigation
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during authentication");
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text=primary-100">Interview Prep</h2>
        </div>
        <h3>Practice Job Interview at Once</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <Formfield
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter Your Name"
              />
            )}
            <Formfield
              control={form.control}
              name="email"
              label="email"
              placeholder="Your Email Address"
              type="email"
            />
            <Formfield
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter Your Password"
              type="password"
            />
            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account "}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignIn ? "No Account Yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
