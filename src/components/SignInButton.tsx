'use client';

import React from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

type Props = {
    text: String
};

const SignInButton = ({ text }: Props) => {
    return (
        <Button onClick={() => {
            signIn('google').catch(console.log)
        }}
        >
            {text}
        </Button>
    );

};

export default SignInButton;
