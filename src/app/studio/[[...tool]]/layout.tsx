export const metadata = {
  title: "7th Heaven — Studio",
  description: "Content management studio for 7th Heaven",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] h-screen w-screen">
      {children}
    </div>
  );
}
