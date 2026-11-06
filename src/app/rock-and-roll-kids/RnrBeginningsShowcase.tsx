"use client";

interface StudioLink {
  name: string;
  url: string;
}

interface RnrBeginningsShowcaseProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  artBook: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comics?: any[];
  studios: StudioLink[];
}

const STORY_BEATS = [
  {
    num: "01",
    badge: "THE ORIGIN",
    title: "7th Heaven As Kids",
    body: "7th Heaven & the Rock 'n' Roll Kids is based on the band, as young kids who bring positivity to other kids.",
  },
  {
    num: "02",
    badge: "THE EPISODE FORMULA",
    title: "Problem. Adventure. Resolution.",
    body: "Each episode is a problem, an adventure and a resolution, told through music and imagination.",
  },
  {
    num: "03",
    badge: "THE MISSION",
    title: "A Breath Of Fresh Air",
    body: "In a world filled with so much negativity, we want to bring a breath of fresh air and help influence kids in a positive light through rock and roll.",
  },
  {
    num: "04",
    badge: "THE EXPANDING UNIVERSE",
    title: "TV, Comics, Games & Original Music",
    body: "It's growing into an animated TV series, comic books, games, apps, videos and original music.",
  },
];

export default function RnrBeginningsShowcase({ artBook, studios }: RnrBeginningsShowcaseProps) {
  const coverImg = artBook?.coverImg || "/images/7hrrk/artbook.jpg";

  return (
    <div className="rnrm-beg-root">
      <div className="rnrm-beg-stage rnrm-beg--l7">
        <div className="rnrm-beg-cover-frame rnrm-beg-l7-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImg} alt={`${artBook?.title || "Rock 'n' Roll Kids"} cover`} loading="lazy" />
        </div>
        <div className="rnrm-beg-l7-right">
          <div className="rnrm-beg-l7-grid">
            {STORY_BEATS.map((beat) => (
              <article key={beat.num} className="rnrm-beg-bento-card">
                <span className="rnrm-beg-bento-num">{beat.num}</span>
                <span className="rnrm-beg-caption-pill">{beat.badge}</span>
                <h3 className="rnrm-beg-panel-title">{beat.title}</h3>
                <p className="rnrm-beg-panel-body">{beat.body}</p>
              </article>
            ))}
          </div>
          <div className="rnrm-beg-studios-box">
            <span className="rnrm-beg-studios-label">BUILT WITH OUR PARTNER STUDIOS:</span>
            <div className="rnrm-links">
              {studios.map((st) => (
                <a
                  key={st.name}
                  className="rnrm-btn rnrm-btn--ghost rnrm-btn--small"
                  href={st.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {st.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
