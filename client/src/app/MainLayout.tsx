"use client";
import { AppShell, Burger, Group, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHome,
  IconDatabase,
  IconHistory,
  IconFaceId,
} from "@tabler/icons-react";

import classes from "@/css/Responsive.module.css";
import ResponsiveTitle from "@/components/misc/ResponsiveTitle";

const subpages = [
  {
    title: "Main",
    url: "/",
    icon: <IconHome size="1.5rem" stroke={1.5} />,
  },
  {
    title: "Database",
    url: "/database",
    icon: <IconDatabase size="1.5rem" stroke={1.5} />,
  },
  {
    title: "History",
    url: "/history",
    icon: <IconHistory size="1.5rem" stroke={1.5} />,
  },
];

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
          <Group gap="xs">
            <IconFaceId
              size={40}
              color="rgba(200, 50, 50, 1)"
              className={classes["input-desktop"]}
            />
            <ResponsiveTitle order={3} mobilesize="h5">
              FACE-IT
            </ResponsiveTitle>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {subpages.map((subpage, idx) => (
          <NavLink
            key={idx}
            href={subpage.url}
            label={subpage.title}
            leftSection={subpage.icon}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
export default MainLayout;
