import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import { useHistory } from "react-router-dom";

import { PosterPageVenue } from "types/venues";

import { WithId } from "utils/id";
import { enterVenue } from "utils/url";

import { PosterCategory } from "components/atoms/PosterCategory";

import { PosterBookmark } from "../PosterBookmark";

import "./PosterPreview.scss";

export interface PosterPreviewProps {
  posterVenue: WithId<PosterPageVenue>;
  showBookmarks?: boolean;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({
  posterVenue,
  showBookmarks = false,
}) => {
  const { title, authorName, categories } = posterVenue.poster ?? {};

  const venueId = posterVenue.id;
  const posterId = venueId.replace("poster", "");
  // TODO: the posterId doesn't correspond to abs ID. We will need proper URL in DB.
  // This version is just to demonstrate possibility
  const posterAbsUrl =
    "https://ww4.aievolution.com/hbm2101/index.cfm?do=abs.viewAbs&src=ext&abs=" +
    posterId;

  const posterClassnames = classNames("PosterPreview", {
    "PosterPreview--live": posterVenue.isLive,
  });

  const { push: openUrlUsingRouter } = useHistory();
  const handleEnterVenue = useCallback(
    () => enterVenue(venueId, { customOpenRelativeUrl: openUrlUsingRouter }),
    [venueId, openUrlUsingRouter]
  );

  const renderedCategories = useMemo(
    () =>
      Array.from(new Set(categories)).map((category) => (
        <PosterCategory key={category} category={category} active />
      )),
    [categories]
  );

  return (
    <div className={posterClassnames}>
      {showBookmarks && <PosterBookmark posterVenue={posterVenue} />}
      <a href={posterAbsUrl} target="poster-preview" rel="noopener noreferrer">
        📄
      </a>
      <div onClick={handleEnterVenue}>
        <p className="PosterPreview__title">{title}</p>

        <div className="PosterPreview__categories">{renderedCategories}</div>

        <div className="PosterPreview__author">{authorName}</div>
      </div>
    </div>
  );
};
