export const metadata = {
 title: "7th Heaven — Studio",
 description: "Content management studio for 7th Heaven",
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
 return (
  <div style={{ height: "100vh", width: "100vw", position: "fixed", top: 0, left: 0, zIndex: 9999 }}>
   {children}
  </div>
 );
}
