export const metadata = {
  title: "Bit Brains",
  description: "A Proof of Care powered autonomous intelligence protocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#0b0b0b",
          color: "#ffffff",
        }}
      >
        {children}
      </body>
    </html>
  );
}
 
