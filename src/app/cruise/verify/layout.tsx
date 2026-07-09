export default function CruiseVerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        /* Hide global header & footer on cruise verify page */
        header,
        nav[role="navigation"],
        [data-header],
        .site-header,
        .page-nav,
        footer,
        [data-footer],
        .site-footer,
        #feedback-control,
        .direct-message-chat {
          display: none !important;
        }
        body {
          padding: 0 !important;
          margin: 0 !important;
          overflow-x: hidden;
        }
      `}</style>
      {children}
    </>
  );
}
