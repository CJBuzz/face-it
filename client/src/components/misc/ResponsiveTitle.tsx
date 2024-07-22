import { Title, TitleOrder } from "@mantine/core";
import React from "react";

import classes from "@/css/Responsive.module.css";

interface ResponsiveTitleProps {
  order: TitleOrder;
  mobilesize: string;
  children: React.ReactNode;
}

const ResponsiveTitle = ({
  order,
  mobilesize,
  children,
}: ResponsiveTitleProps) => {
  return (
    <>
      <Title order={order} className={classes["responsive-title-desktop"]}>
        {children}
      </Title>
      <Title
        order={order}
        size={mobilesize}
        className={classes["responsive-title-mobile"]}
      >
        {children}
      </Title>
    </>
  );
};

export default ResponsiveTitle;
