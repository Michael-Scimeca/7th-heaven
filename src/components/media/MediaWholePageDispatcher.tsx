"use client";

import React from "react";
import { MediaLayoutProps } from "./MediaLayoutTypes";
import {
  Layout01Undisputed,
  Layout02SplitScreen,
  Layout03CinemaTheater,
  Layout04FullscreenDock,
  Layout05ProductionSuite,
} from "./page-layouts/PageLayoutGroupA";
import {
  Layout06FilmstripCarousel,
  Layout07SwissTypographic,
  Layout08DarkroomWall,
  Layout09ModernistMagazine,
  Layout10BroadcastControlRoom,
} from "./page-layouts/PageLayoutGroupB";
import {
  Layout11MinimalistHUD,
  Layout12DualComparison,
  Layout13VinylGatefold,
  Layout14VerticalReelTriptych,
  Layout15ChronologicalTimeline,
} from "./page-layouts/PageLayoutGroupC";
import {
  Layout16ManilaDossier,
  Layout17CyberpunkTerminal,
  Layout18ScrollableStory,
  Layout19PerspectiveCoverflow,
  Layout20AsymmetricBento,
} from "./page-layouts/PageLayoutGroupD";
import {
  Layout21CinemaWallGrid,
  Layout22NetflixShelves,
  Layout23SpotlightMarquee,
  Layout24SplitBrowserGiantCatalog,
  Layout25BillboardStack,
} from "./page-layouts/PageLayoutGroupE";
import {
  Layout26YouTubeMegaGrid,
  Layout27CategoryDrawerDeck,
  Layout28InfiniteCineStream,
  Layout29FestivalStageStrip,
  Layout30AccordionExpander,
} from "./page-layouts/PageLayoutGroupF";
import {
  Layout31GiantRollerDeck,
  Layout32SetlistJukebox,
  Layout33TwoTierMegaCarousel,
  Layout34GiantCoverflowReel,
  Layout35BigCardMasonry,
} from "./page-layouts/PageLayoutGroupG";
import {
  Layout36FilterDeckCinema,
  Layout37MultiviewMosaic,
  Layout38MagazineLookbook,
  Layout39VideoWallMatrix,
  Layout40UltimateShowcase,
} from "./page-layouts/PageLayoutGroupH";
import {
  Layout41MasterVerticalStack,
  Layout42SplitSingleColumnRail,
  Layout43LeftPlaylistRightCinema,
  Layout44MasterStageSingleSnapRow,
  Layout45CenteredCinemaFloatingRow,
} from "./page-layouts/PageLayoutGroupI";
import {
  Layout46YouTubeTheaterSingleColumn,
  Layout47EditorialSingleColumnDossier,
  Layout48StickyPipSingleColumn,
  Layout49SingleHorizontalFilmstrip,
  Layout50DockedDrawerSingleRow,
} from "./page-layouts/PageLayoutGroupJ";
import {
  Layout51UpNextQueueSingleColumn,
  Layout52PanoramicStageSingleRoller,
  Layout53JukeboxSingleColumn,
  Layout54ConcertSetlistSingleColumn,
  Layout55BroadcastStudioSingleRow,
} from "./page-layouts/PageLayoutGroupK";
import {
  Layout56FullWidthStackedMasterfeed,
  Layout57SingleRowAmbientCarousel,
  Layout58SidebarAccordionSingleColumn,
  Layout59HorizontalTimelineSingleRow,
  Layout60UltimateSingleColumnSuite,
  Layout61JJettasSignatureMoments,
} from "./page-layouts/PageLayoutGroupL";
import Layout61JJettasOffField from "./page-layouts/Layout61JJettasOffField";
import Layout62JJettasExhibitCanvas from "./page-layouts/Layout62JJettasExhibitCanvas";

interface MediaWholePageDispatcherProps extends MediaLayoutProps {
  layoutId: number;
}

export default function MediaWholePageDispatcher(props: MediaWholePageDispatcherProps) {
  const { layoutId } = props;

  switch (layoutId) {
    case 1:
      return <Layout01Undisputed {...props} />;
    case 2:
      return <Layout02SplitScreen {...props} />;
    case 3:
      return <Layout03CinemaTheater {...props} />;
    case 4:
      return <Layout04FullscreenDock {...props} />;
    case 5:
      return <Layout05ProductionSuite {...props} />;
    case 6:
      return <Layout06FilmstripCarousel {...props} />;
    case 7:
      return <Layout07SwissTypographic {...props} />;
    case 8:
      return <Layout08DarkroomWall {...props} />;
    case 9:
      return <Layout09ModernistMagazine {...props} />;
    case 10:
      return <Layout10BroadcastControlRoom {...props} />;
    case 11:
      return <Layout11MinimalistHUD {...props} />;
    case 12:
      return <Layout12DualComparison {...props} />;
    case 13:
      return <Layout13VinylGatefold {...props} />;
    case 14:
      return <Layout14VerticalReelTriptych {...props} />;
    case 15:
      return <Layout15ChronologicalTimeline {...props} />;
    case 16:
      return <Layout16ManilaDossier {...props} />;
    case 17:
      return <Layout17CyberpunkTerminal {...props} />;
    case 18:
      return <Layout18ScrollableStory {...props} />;
    case 19:
      return <Layout19PerspectiveCoverflow {...props} />;
    case 20:
      return <Layout20AsymmetricBento {...props} />;
    case 21:
      return <Layout21CinemaWallGrid {...props} />;
    case 22:
      return <Layout22NetflixShelves {...props} />;
    case 23:
      return <Layout23SpotlightMarquee {...props} />;
    case 24:
      return <Layout24SplitBrowserGiantCatalog {...props} />;
    case 25:
      return <Layout25BillboardStack {...props} />;
    case 26:
      return <Layout26YouTubeMegaGrid {...props} />;
    case 27:
      return <Layout27CategoryDrawerDeck {...props} />;
    case 28:
      return <Layout28InfiniteCineStream {...props} />;
    case 29:
      return <Layout29FestivalStageStrip {...props} />;
    case 30:
      return <Layout30AccordionExpander {...props} />;
    case 31:
      return <Layout31GiantRollerDeck {...props} />;
    case 32:
      return <Layout32SetlistJukebox {...props} />;
    case 33:
      return <Layout33TwoTierMegaCarousel {...props} />;
    case 34:
      return <Layout34GiantCoverflowReel {...props} />;
    case 35:
      return <Layout35BigCardMasonry {...props} />;
    case 36:
      return <Layout36FilterDeckCinema {...props} />;
    case 37:
      return <Layout37MultiviewMosaic {...props} />;
    case 38:
      return <Layout38MagazineLookbook {...props} />;
    case 39:
      return <Layout39VideoWallMatrix {...props} />;
    case 40:
      return <Layout40UltimateShowcase {...props} />;
    case 41:
      return <Layout41MasterVerticalStack {...props} />;
    case 42:
      return <Layout42SplitSingleColumnRail {...props} />;
    case 43:
      return <Layout43LeftPlaylistRightCinema {...props} />;
    case 44:
      return <Layout44MasterStageSingleSnapRow {...props} />;
    case 45:
      return <Layout45CenteredCinemaFloatingRow {...props} />;
    case 46:
      return <Layout46YouTubeTheaterSingleColumn {...props} />;
    case 47:
      return <Layout47EditorialSingleColumnDossier {...props} />;
    case 48:
      return <Layout48StickyPipSingleColumn {...props} />;
    case 49:
      return <Layout49SingleHorizontalFilmstrip {...props} />;
    case 50:
      return <Layout50DockedDrawerSingleRow {...props} />;
    case 51:
      return <Layout51UpNextQueueSingleColumn {...props} />;
    case 52:
      return <Layout52PanoramicStageSingleRoller {...props} />;
    case 53:
      return <Layout53JukeboxSingleColumn {...props} />;
    case 54:
      return <Layout54ConcertSetlistSingleColumn {...props} />;
    case 55:
      return <Layout55BroadcastStudioSingleRow {...props} />;
    case 56:
      return <Layout56FullWidthStackedMasterfeed {...props} />;
    case 57:
      return <Layout57SingleRowAmbientCarousel {...props} />;
    case 58:
      return <Layout58SidebarAccordionSingleColumn {...props} />;
    case 59:
      return <Layout59HorizontalTimelineSingleRow {...props} />;
    case 60:
      return <Layout60UltimateSingleColumnSuite {...props} />;
    case 61:
      return <Layout61JJettasOffField {...props} />;
    case 62:
      return <Layout62JJettasExhibitCanvas {...props} />;
    default:
      return <Layout01Undisputed {...props} />;
  }
}
