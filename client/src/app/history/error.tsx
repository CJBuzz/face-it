"use client";
import { Center, Title } from "@mantine/core";
import React from "react";

interface ErrorProps {
  error: Error & { digest?: string}
  reset: () => void
}

const Error = ({error, reset}: ErrorProps) => {
  return (
    <Center w={"100%"} mih={300}>
      <Title>404 Not Found</Title>
    </Center>
  );
};

export default Error;
