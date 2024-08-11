// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";

import MainLayout from "./MainLayout";

export const metadata = {
  title: "Face-It",
  description:
    "App for Facial Recognition built using Next.js, Mantine UI, FASTAPI, SQLite. FR models used are insightface by deepinsight for feature extraction and Spotify's voyager for K-Nearest Neighbour search.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <ColorSchemeScript />
    </head>
    <body>
      <MantineProvider defaultColorScheme="dark">
        <MainLayout>{children}</MainLayout>
      </MantineProvider>
    </body>
  </html>
);

export default RootLayout;
